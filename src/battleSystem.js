// battleSystem.js
// Semi real-time cooldown-based battle loop

import { GameState } from './gameState.js';
import { addBattleLogEntry, renderBattleScreen, showScreen, flashHit, shakeElement, spawnFloatingDamage, flashWarning } from './renderer.js';
import { updateQuestProgress } from './quests.js';
import { clamp, randInt, randChoice } from './utils.js';
import { applyStatus, tickStatuses } from './statuses.js';
import { playSoundAttack, playSoundHit, playSoundSkill, playSoundVictory, playSoundDefeat, playSoundCrit, playSoundBlock, playSoundEnemySpecial, playBossMusic, stopBossMusic } from './audio.js';
import { applyZoneStartEffects, tickZoneEffects, applyZoneEndEffects } from './zones.js';
import { SKILLS, getSkillById, canAffordSkill } from './skills.js';

/**
 * Validate that battle can proceed
 */
function validateBattleState(battle) {
  if (!battle.isBattleActive) {
    console.warn('Battle is not active');
    return false;
  }
  if (!GameState.player) {
    console.error('No player found in battle');
    return false;
  }
  return true;
}

export const Battle = {
  // Single-target legacy fields
  currentEnemy: null,
  // Group battle fields
  currentEnemies: null, // array of enemy objects when in group battle
  currentTargetIndex: 0,
  isGroupBattle: false,
  // Common state
  isBattleActive: false,
  playerCooldownCurrent: 0,
  playerCooldownMax: 2.0,
  enemyCooldownCurrent: 0,
  enemyCooldownMax: 2.0,
  // Momentum system: builds when player attacks without taking damage.
  playerMomentum: 0,
  momentumMax: 100,
  _momentumDecayOnHit: true,

  // Skill cooldowns: tracks per-skill cooldown state { skillId: currentTime }
  skillCooldowns: {},

  // Enemy skill system: tracks per-skill cooldowns for enemies
  enemySkillCooldowns: {},
  enemyCastingSkill: null, // { skill, windupRemaining } for telegraph
  enemySkillWindupTime: 1.2, // seconds to telegraph before skill executes

  // Enemy special attack tracking (telegraphing)
  enemySpecialCooldownCurrent: 0,
  enemySpecialCooldownMax: 0,
  enemySpecialWindupRemaining: 0,

  // MP regeneration tracking
  _mpRegenAccumulator: 0,
  _mpRegenRate: 0.8, // MP regenerated per second in battle

  _lastTs: 0,
  _rafId: 0,

  /**
   * Start a single-enemy battle
   * @param {Object} enemy - Enemy configuration object
   * @param {string} location - Background location: 'forest', 'cave', etc.
   */
  startBattle(enemy, location = 'forest') {
    if (!enemy || !GameState.player) {
      console.error('Cannot start battle: missing enemy or player');
      return;
    }
    
    this.isGroupBattle = false;
    this.currentEnemies = null;
    const p = GameState.player;
    this.currentEnemy = { ...enemy, hp: enemy.maxHp };
    
    // Track zone & set background
    this.currentZoneKey = location;
    import('./renderer.js').then(r => r.setBackground(location));
    // Determine player cooldown based on class/equipment (simple for now)
    const weaponCdMod = p.equipment.weapon?.attackCooldownModifier ?? 0;
    let baseCd = p.class === 'Rogue' ? 1.6 : (p.class === 'Mage' ? 1.9 : 2.0);
    // Race passives adjusting base attack speed
    if (p.race === 'Bug') baseCd -= 0.05; // Bug: faster
    if (p.race === 'Elf') baseCd -= 0.03; // Elf: modest speed bonus
    // Apply talent base cooldown multiplier if present
    const tMul = p._modifiers?.baseCooldownMultiplier ?? 1.0;
    this.playerCooldownMax = Math.max(1.0, (baseCd + weaponCdMod) * tMul);
    this.playerCooldownCurrent = this.playerCooldownMax; // start ready

    this.enemyCooldownMax = Math.max(0.8, enemy.attackCooldownMax / (enemy.attackSpeedModifier || 1.0));
    this.enemyCooldownCurrent = this.enemyCooldownMax * 0.5; // enemy halfway

    // Initialize momentum & enemy special
    this.playerMomentum = 0;
    // Initialize skill cooldowns
    this.skillCooldowns = {};
    this._mpRegenAccumulator = 0;
    // Initialize enemy skill system
    this.enemySkillCooldowns = {};
    this.enemyCastingSkill = null;
    if (enemy.skills) {
      // Start enemy skills partially cooled down (random start)
      enemy.skills.forEach(skill => {
        this.enemySkillCooldowns[skill.id] = skill.cooldownMax * (0.3 + Math.random() * 0.4);
      });
    }
    if (enemy.specialAttack) {
      this.enemySpecialCooldownMax = enemy.specialAttack.cooldown;
      this.enemySpecialCooldownCurrent = this.enemySpecialCooldownMax * 0.6; // start partially charged
      this.enemySpecialWindupRemaining = 0; // no windup yet
    } else {
      this.enemySpecialCooldownMax = 0;
      this.enemySpecialCooldownCurrent = 0;
      this.enemySpecialWindupRemaining = 0;
    }

    // Clear previous battle log
    const log = document.querySelector('#battle-log');
    if (log) log.innerHTML = '';
    this.isBattleActive = true;
    this._lastTs = performance.now();
    showScreen('screen-battle');
    // Expose active battle for status hooks (e.g., stagger resistance)
    try { window.__activeBattleState = this; } catch {}
    // Boss cinematic intro hooks
    if (this.currentEnemy.id === 'boss_cave_wyrm'){
      addBattleLogEntry(`A wild ${this.currentEnemy.name} appears in the ${location}!`);
    } else if (this.currentEnemy.id === 'boss_elder_wyrm') {
      addBattleLogEntry('The earth splits. Heat breathes from below…', 'boss');
      addBattleLogEntry(`${this.currentEnemy.name} coils beneath the Wyrm’s Depths.`, 'boss');
      if (this.currentEnemy.loreLine) addBattleLogEntry(this.currentEnemy.loreLine, 'boss');
      playBossMusic(this.currentEnemy.musicKey || 'elder_wyrm_theme');
      // Initialize boss runtime state
      this._wyrm = {
        phase: 0,
        lastPhase: -1,
        timers: { bite: 0, special: 0, burrow: 0, fire: 0, rupture: 8 },
        windup: null,
        windupType: null
      };
      // Depths ambience background ensured
      import('./renderer.js').then(r => r.setBackground('depths'));
    } else {
      addBattleLogEntry(`A wild ${this.currentEnemy.name} appears in the ${location}!`);
    }
    applyZoneStartEffects(location, this);
    this._loop();
  },

  /**
   * Start a group battle with multiple enemies
   * @param {Array} enemiesArray - Array of enemy configuration objects
   */
  startGroupBattle(enemiesArray) {
    if (!enemiesArray?.length || !GameState.player) {
      console.error('Cannot start group battle: missing enemies or player');
      return;
    }
    
    const p = GameState.player;
    this.isGroupBattle = true;
    this.currentEnemies = enemiesArray.map(e => ({ ...e, hp: e.maxHp, cdMax: Math.max(0.8, e.attackCooldownMax / (e.attackSpeedModifier || 1.0)), cdCurrent: e.attackCooldownMax * Math.random() }));
    this.currentTargetIndex = 0;
    this.currentEnemy = this.currentEnemies[0]; // convenience reference for player targeting code
    // Player cooldown init same as single
    const weaponCdMod = p.equipment.weapon?.attackCooldownModifier ?? 0;
    let baseCd = p.class === 'Rogue' ? 1.6 : (p.class === 'Mage' ? 1.9 : 2.0);
    if (p.race === 'Bug') baseCd -= 0.05;
    if (p.race === 'Elf') baseCd -= 0.03;
    const tMul = p._modifiers?.baseCooldownMultiplier ?? 1.0;
    this.playerCooldownMax = Math.max(1.0, (baseCd + weaponCdMod) * tMul);
    this.playerCooldownCurrent = this.playerCooldownMax;
    // Initialize skill cooldowns and MP regen
    this.skillCooldowns = {};
    this._mpRegenAccumulator = 0;
    // Initialize enemy skill system for group battles
    this.enemySkillCooldowns = {};
    this.enemyCastingSkill = null;
    this.isBattleActive = true;
    this._lastTs = performance.now();
    showScreen('screen-battle');
    try { window.__activeBattleState = this; } catch {}
    // Keep previous behavior defaulting to portal-themed group; no explicit zone param yet
    this.currentZoneKey = 'portal';
    import('./renderer.js').then(r => r.setBackground('cave'));
    addBattleLogEntry(`A group emerges from the Shadow Portal! (${this.currentEnemies.map(e=>e.name).join(', ')})`);
    applyZoneStartEffects('cave', this);
    this._loop();
  },

  _loop() {
    if (!this.isBattleActive) return;
    this._rafId = requestAnimationFrame((ts) => {
      const dt = Math.min(0.1, (ts - this._lastTs) / 1000);
      this._lastTs = ts;
      this.update(dt);
      this._loop();
    });
  },

  /**
   * Update battle state (called each frame)
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    const p = GameState.player;
    // Decide mode
    if (!p) {
      console.warn('No player in battle update');
      return;
    }
    if (this.isGroupBattle) {
      this._updateGroupBattle(dt, p);
      renderBattleScreen(this); // renderer will branch if group battle
      return;
    }
    const e = this.currentEnemy;
    if (!e) return;

    // Tick status effects and zone periodic mechanics
    tickStatuses(p, dt, addBattleLogEntry);
    tickStatuses(e, dt, addBattleLogEntry);
    if (this.currentZoneKey) tickZoneEffects(this.currentZoneKey, this, dt);

    // Regenerate MP over time
    this._mpRegenAccumulator += dt * this._mpRegenRate;
    if (this._mpRegenAccumulator >= 1.0) {
      const regenAmount = Math.floor(this._mpRegenAccumulator);
      GameState.regenerateMp(regenAmount);
      this._mpRegenAccumulator -= regenAmount;
    }

    // Tick skill cooldowns
    for (const skillId in this.skillCooldowns) {
      if (this.skillCooldowns[skillId] > 0) {
        this.skillCooldowns[skillId] = Math.max(0, this.skillCooldowns[skillId] - dt);
      }
    }

    // Tick enemy skill cooldowns
    for (const skillId in this.enemySkillCooldowns) {
      if (this.enemySkillCooldowns[skillId] > 0) {
        this.enemySkillCooldowns[skillId] = Math.max(0, this.enemySkillCooldowns[skillId] - dt);
      }
    }

    // Handle enemy skill casting (telegraph and execution)
    if (this.enemyCastingSkill) {
      this.enemyCastingSkill.windupRemaining -= dt;
      if (this.enemyCastingSkill.windupRemaining <= 0) {
        this._executeEnemySkill(this.enemyCastingSkill.skill, e, p);
        this.enemyCastingSkill = null;
      }
    }

    // Advance cooldowns
    const effectiveMax = this._tempSkillCooldownFactor ? this.playerCooldownMax * this._tempSkillCooldownFactor : this.playerCooldownMax;
    this.playerCooldownCurrent = clamp(this.playerCooldownCurrent + dt, 0, effectiveMax);
    if (this.playerCooldownCurrent >= effectiveMax) this._tempSkillCooldownFactor = null; // reset after ready
    this.enemyCooldownCurrent = clamp(this.enemyCooldownCurrent + dt, 0, this.enemyCooldownMax);

    // Elder Wyrm custom behavior branch
    if (e.id === 'boss_elder_wyrm'){
      this._updateElderWyrm(dt, p, e);
      renderBattleScreen(this);
      return;
    }

    // Enemy special attack logic
    if (e.specialAttack) {
      if (this.enemySpecialWindupRemaining > 0) {
        this.enemySpecialWindupRemaining = Math.max(0, this.enemySpecialWindupRemaining - dt);
        if (this.enemySpecialWindupRemaining === 0) {
          // Execute special
          const spec = e.specialAttack;
          let raw = Math.round((e.attackPower * spec.damageMultiplier) - p.defense * 0.5);
          raw = Math.max(1, raw + randInt(-3,3));
          p.hp = clamp(p.hp - raw, 0, p.maxHp);
          const playerEl = document.querySelector('.combatant.player');
          addBattleLogEntry(`${e.name} unleashes ${spec.name} for ${raw} damage!`, 'damage');
          flashHit(playerEl);
          shakeElement(playerEl);
          spawnFloatingDamage(playerEl, raw, 'normal');
          playSoundEnemySpecial();
          this.enemySpecialCooldownCurrent = 0; // reset cooldown
          if (p.hp <= 0) return this.endBattle('defeat');
        }
      } else {
        this.enemySpecialCooldownCurrent = clamp(this.enemySpecialCooldownCurrent + dt, 0, this.enemySpecialCooldownMax);
        if (this.enemySpecialCooldownCurrent >= this.enemySpecialCooldownMax) {
          // Begin windup
          this.enemySpecialWindupRemaining = e.specialAttack.windup;
          addBattleLogEntry(`${e.name} begins to charge ${e.specialAttack.name}!`, 'info');
          this.enemySpecialCooldownCurrent = this.enemySpecialCooldownMax; // hold at max until executed
        }
      }
    }

    // Player basic attack
    if (this.playerCooldownCurrent <= 0 && p.hp > 0 && e.hp > 0){
      const weapon = p.equipment?.weapon;
      let base = (weapon?.baseDamage || p.attack); // Basic attack uses raw weapon/p.attack without flat +2 (reserved for potential skill burst)
      // Momentum damage scaling including talent modifier
      const momentumRatio = this.playerMomentum / this.momentumMax;
      const weaponMomentumScale = weapon?.weaponClass === 'light' ? 0.15 : weapon?.weaponClass === 'heavy' ? 0.10 : weapon?.weaponClass === 'magic' ? 0.12 : weapon?.weaponClass === 'ranged' ? 0.18 : 0.08;
      const talentMomentumDamageMult = (p._modifiers?.momentumDamageMultiplier || 1);
      let momentumFactor = 1 + momentumRatio * weaponMomentumScale * talentMomentumDamageMult;
      base = Math.round(base * momentumFactor);
      let dmg = base + getRandomInt(-2,2);
      // Crit logic (with talent bonus scaling)
      let critChance = (weapon?.critChance || 0.05);
      const talentMomentumCritMult = (p._modifiers?.momentumCritBonusMultiplier || 1);
      critChance += momentumRatio * weaponMomentumScale * talentMomentumCritMult;
      const isCrit = Math.random() < critChance;
      if (isCrit) dmg = Math.round(dmg * 1.5);
      // Bleed bonus
      if (e.statuses?.bleed?.stacks){
        dmg += e.statuses.bleed.stacks;
      }
      e.hp = clamp(e.hp - dmg, 0, e.maxHp);
      // Momentum gain (with talent modifier)
      const gainMult = (p._modifiers?.momentumGainMultiplier || 1);
      if (this.playerMomentum < this.momentumMax){
        this.playerMomentum = Math.min(this.momentumMax, this.playerMomentum + 1 * gainMult);
      }
      playSoundAttack();
      const enemyCombatant = document.querySelector('.combatant.enemy');
      flashHit(enemyCombatant);
      spawnFloatingDamage(enemyCombatant, dmg, isCrit ? 'crit' : 'normal');
      if (isCrit) playSoundCrit();
      addBattleLogEntry(`${p.name} attacks ${e.name} for ${dmg}${isCrit ? ' (CRIT)' : ''}.`, isCrit ? 'crit' : 'damage');
      // Weapon on-hit effect
      if (weapon?.onHitEffect){
        weapon.onHitEffect(p,e);
      }
      this.playerCooldownCurrent = this.playerCooldownMax;
    }

    // Enemy attack/skill logic (single battle)
    if (!this.enemyCastingSkill && e.hp > 0 && p.hp > 0) {
      if (this.enemyCooldownCurrent >= this.enemyCooldownMax) {
        // Enemy AI: decide between skill and basic attack
        const chosenSkill = this._shouldEnemyUseSkill(e);
        
        if (chosenSkill) {
          // Telegraph the skill
          this._telegraphEnemySkill(chosenSkill, e);
          // Keep cooldown at max during telegraph
        } else {
          // Perform basic attack
          let raw = Math.max(1, e.attackPower - p.defense);
          raw += randInt(-2, 2);
          const dmg = Math.max(1, raw);
          p.hp = clamp(p.hp - dmg, 0, p.maxHp);
          
          // Momentum reset on hit
          if (this._momentumDecayOnHit) this.playerMomentum = 0;
          
          // Visual feedback
          playSoundHit();
          const playerEl = document.querySelector('.combatant.player');
          flashHit(playerEl);
          shakeElement(playerEl);
          spawnFloatingDamage(playerEl, dmg, 'normal');
          
          addBattleLogEntry(`${e.name} attacks for ${dmg} damage.`, 'damage');
          
          // Reset cooldown after basic attack
          this.enemyCooldownCurrent = 0;
          
          if (p.hp <= 0) return this.endBattle('defeat');
        }
      }
    }

    renderBattleScreen(this);
  },

  _updateGroupBattle(dt, p){
    // Tick player statuses
    tickStatuses(p, dt, addBattleLogEntry);
    // Tick enemy statuses & advance cooldowns
    for (const e of this.currentEnemies){
      if (e.hp > 0){
        tickStatuses(e, dt, addBattleLogEntry);
        e.cdCurrent = clamp(e.cdCurrent + dt, 0, e.cdMax);
      }
    }

    // Regenerate MP over time
    this._mpRegenAccumulator += dt * this._mpRegenRate;
    if (this._mpRegenAccumulator >= 1.0) {
      const regenAmount = Math.floor(this._mpRegenAccumulator);
      GameState.regenerateMp(regenAmount);
      this._mpRegenAccumulator -= regenAmount;
    }

    // Tick skill cooldowns
    for (const skillId in this.skillCooldowns) {
      if (this.skillCooldowns[skillId] > 0) {
        this.skillCooldowns[skillId] = Math.max(0, this.skillCooldowns[skillId] - dt);
      }
    }

    // Player cooldown
    const effectiveMax = this._tempSkillCooldownFactor ? this.playerCooldownMax * this._tempSkillCooldownFactor : this.playerCooldownMax;
    this.playerCooldownCurrent = clamp(this.playerCooldownCurrent + dt, 0, effectiveMax);
    if (this.playerCooldownCurrent >= effectiveMax) this._tempSkillCooldownFactor = null;
    // Zone periodic mechanics during group battles
    if (this.currentZoneKey) tickZoneEffects(this.currentZoneKey, this, dt);
    // Enemy attacks
    for (const e of this.currentEnemies){
      if (e.hp <= 0) continue;
      if (e.cdCurrent >= e.cdMax){
        e.cdCurrent = 0;
        
        // Enemy AI: decide between skill and basic attack
        const chosenSkill = this._shouldEnemyUseSkill(e);
        
        if (chosenSkill) {
          // For group battles, execute skills immediately (no telegraph for now to keep it simpler)
          this._executeEnemySkill(chosenSkill, e, p);
        } else {
          // Basic attack
          let raw = Math.max(1, e.attackPower - p.defense);
          let variance = randInt(-2,2);
          if (!e._stunned){
            const dmgBase = Math.max(1, raw + variance);
            const isBlock = dmgBase <= 2 && Math.random() < 0.5;
            const dmg = isBlock ? Math.max(1, Math.round(dmgBase * 0.5)) : dmgBase;
            p.hp = clamp(p.hp - dmg, 0, p.maxHp);
            // Momentum reset on hit (group battle shares same rule)
            if (this._momentumDecayOnHit) this.playerMomentum = 0;
            // Visual and audio feedback
            playSoundHit();
            const playerCombatant = document.querySelector('.combatant.player');
            flashHit(playerCombatant);
            shakeElement(playerCombatant);
            spawnFloatingDamage(playerCombatant, dmg, isBlock ? 'block' : 'normal');
            if (isBlock) playSoundBlock();
            addBattleLogEntry(`${e.name} strikes ${p.name} for ${dmg}.` + (isBlock ? ' (BLOCK)' : ''), isBlock ? 'info' : 'damage');
          } else {
            addBattleLogEntry(`${e.name} is stunned and cannot act.`, 'status');
          }
        }
        
        if (p.hp <= 0){
          this.endBattle('defeat');
          return;
        }
      }
    }
    // Victory check
    if (this.currentEnemies.every(e => e.hp <= 0)){
      this.endBattle('victory');
      return;
    }
    // Ensure current target valid
    if (this.currentEnemy.hp <= 0){
      const nextIdx = this.currentEnemies.findIndex(e => e.hp > 0);
      if (nextIdx >= 0){
        this.currentTargetIndex = nextIdx;
        this.currentEnemy = this.currentEnemies[nextIdx];
        addBattleLogEntry(`Target switched to ${this.currentEnemy.name}.`);
      }
    }
  },

  _updateElderWyrm(dt, p, e){
    // Determine current phase based on HP thresholds
    const hpPct = (e.hp / e.maxHp);
    let phase = 0; // P1 default
    if (hpPct <= 0.35) phase = 2; else if (hpPct <= 0.70) phase = 1;
    this._wyrm = this._wyrm || { phase, lastPhase: -1, timers: { bite:0, special:0, burrow:0, fire:0, rupture:8 } };
    const wr = this._wyrm;
    if (wr.phase !== phase){ wr.phase = phase; }
    if (wr.lastPhase !== wr.phase){
      e.currentPhase = wr.phase;
      // Announce transition and adjust cadence
      if (wr.phase === 0){ addBattleLogEntry('The Wyrm prowls beneath the rock…', 'boss'); }
      if (wr.phase === 1){
        addBattleLogEntry('Molten Core Awakens — flames lick the arena.', 'boss');
        this._bossDepthsHazardFast = true; // zone tick reads this to speed hazards
      }
      if (wr.phase === 2){
        addBattleLogEntry('Ancient Fury! The Deep itself trembles.', 'boss');
        flashWarning();
      }
      wr.lastPhase = wr.phase;
      // Apply phase stat adjustments (cooldown speed)
      const phaseDef = e.phases?.[wr.phase];
      if (phaseDef){
        e.attackCooldownMax = phaseDef.stats.attackCooldownMax;
      }
    }
    // Tick statuses & zone effects (already handled in update)
    // Advance player cooldown
    const effectiveMax = this._tempSkillCooldownFactor ? this.playerCooldownMax * this._tempSkillCooldownFactor : this.playerCooldownMax;
    this.playerCooldownCurrent = clamp(this.playerCooldownCurrent + dt, 0, effectiveMax);
    if (this.playerCooldownCurrent >= effectiveMax) this._tempSkillCooldownFactor = null;

    // Advance enemy basic attack cooldown (bite)
    this.enemyCooldownCurrent = clamp(this.enemyCooldownCurrent + dt, 0, this.enemyCooldownMax);
    if (this.enemyCooldownCurrent >= this.enemyCooldownMax && e.hp > 0){
      this.enemyCooldownCurrent = 0;
      let raw = Math.max(1, Math.round(e.attackPower - p.defense));
      raw += randInt(-3,3);
      const dmg = Math.max(1, raw);
      p.hp = clamp(p.hp - dmg, 0, p.maxHp);
      const playerEl = document.querySelector('.combatant.player');
      playSoundHit(); flashHit(playerEl); shakeElement(playerEl); spawnFloatingDamage(playerEl, dmg, 'normal');
      addBattleLogEntry('The Wyrm bites through the smoke.', 'damage');
      if (p.hp <= 0) return this.endBattle('defeat');
    }

    // Specials per phase
    wr.timers.burrow += dt; wr.timers.fire += dt; wr.timers.rupture += dt;
    // Active windup resolution
    if (wr.windup){
      wr.windup -= dt;
      if (wr.windup <= 0){
        const t = wr.windupType; wr.windup = null; wr.windupType = null;
        if (t === 'burrow'){
          // Dodge if the player waited (did not attack recently)
          const waited = this.playerCooldownCurrent < this.playerCooldownMax * 0.25; // higher bar means they attacked recently; being low means waiting
          if (waited){
            addBattleLogEntry('You hold your ground — the burrow strike misses!', 'boss');
            // Chance to stagger the wyrm when it surfaces into readiness
            applyStatus(e, 'stagger', addBattleLogEntry);
          } else {
            let raw = Math.max(1, Math.round(e.attackPower * 1.6 - p.defense * 0.4) + randInt(-4,4));
            p.hp = clamp(p.hp - raw, 0, p.maxHp);
            const playerEl = document.querySelector('.combatant.player'); flashHit(playerEl); shakeElement(playerEl); spawnFloatingDamage(playerEl, raw, 'normal');
            addBattleLogEntry('Burrow Strike lands with a thunderous snap!', 'damage');
            if (p.hp <= 0) return this.endBattle('defeat');
          }
          wr.timers.burrow = 0;
        } else if (t === 'fire_breath' || t === 'firewall' || t === 'heatwave'){
          // Apply burn or chip damage
          if (t === 'heatwave'){
            const chip = Math.max(1, Math.round(e.attackPower * 0.6 - p.defense * 0.3) + randInt(-2,2));
            p.hp = clamp(p.hp - chip, 0, p.maxHp);
            const el = document.querySelector('.combatant.player'); flashHit(el); spawnFloatingDamage(el, chip, 'normal');
            addBattleLogEntry('Heatwave scorches the arena!', 'damage');
          } else {
            applyStatus(p, 'burn', addBattleLogEntry);
            addBattleLogEntry('Flames billow from the Deep.', 'boss');
          }
          if (p.hp <= 0) return this.endBattle('defeat');
        } else if (t === 'elder_rupture'){
          // Cancel if staggered
          const staggered = (e.statusEffects||[]).some(s => s.id === 'stagger');
          if (staggered){
            addBattleLogEntry('You interrupt the Elder Rupture! The ground settles.', 'boss');
          } else {
            const huge = Math.max(1, Math.round(e.attackPower * 2.8 - p.defense * 0.4) + randInt(-6,6));
            const el = document.querySelector('.combatant.player');
            flashWarning(); flashHit(el); shakeElement(el); spawnFloatingDamage(el, huge, 'crit');
            p.hp = clamp(p.hp - huge, 0, p.maxHp);
            addBattleLogEntry('ELDER RUPTURE sunders the cavern!', 'crit');
            if (p.hp <= 0) return this.endBattle('defeat');
          }
          wr.timers.rupture = 0;
        }
      }
      return; // during windup we pause other windups
    }

    // Start windups based on current phase and cooldowns
    if (wr.phase === 0){
      if (wr.timers.burrow >= 11){
        wr.windup = 1.5; wr.windupType = 'burrow';
        addBattleLogEntry('The Wyrm burrows — wait for the strike!', 'boss');
        playSoundEnemySpecial();
      }
    } else if (wr.phase === 1){
      if (wr.timers.fire >= 9){
        // Randomly pick breath or firewall
        const t = Math.random() < 0.5 ? 'fire_breath' : 'firewall';
        wr.windup = t === 'fire_breath' ? 1.2 : 0.8; wr.windupType = t;
        addBattleLogEntry(`The Wyrm inhales — ${t === 'fire_breath' ? 'Fire Breath' : 'Firewall'}!`, 'boss');
        playSoundEnemySpecial();
      } else if (wr.timers.burrow >= 12){
        wr.windup = 0.6; wr.windupType = 'heatwave';
        addBattleLogEntry('Air distorts — Heatwave building…', 'boss');
        playSoundEnemySpecial();
      }
    } else {
      // Phase 3
      if (wr.timers.rupture >= 14){
        wr.windup = 2.2; wr.windupType = 'elder_rupture';
        addBattleLogEntry('The earth screams — Elder Rupture charging!', 'boss');
        flashWarning(); playSoundEnemySpecial();
      }
    }
  },

  /**
   * Use an active skill from skills.js
   * @param {string} skillId - The skill identifier to use
   */
  useSkill(skillId) {
    if (!validateBattleState(this)) return;
    const p = GameState.player;
    const e = this.currentEnemy;
    const skill = getSkillById(skillId);
    
    if (!skill) {
      console.warn(`Skill ${skillId} not found`);
      return;
    }

    // Check if skill is on cooldown
    if (this.skillCooldowns[skillId] && this.skillCooldowns[skillId] > 0) {
      addBattleLogEntry(`${skill.name} is on cooldown!`, 'info');
      return;
    }

    // Check if player can afford the skill
    if (!canAffordSkill(p, skill)) {
      addBattleLogEntry(`Not enough MP to use ${skill.name}!`, 'info');
      return;
    }

    // Spend MP
    if (!GameState.spendMp(skill.resourceCost)) {
      addBattleLogEntry(`Failed to use ${skill.name}!`, 'info');
      return;
    }

    // Calculate damage based on skill scaling stat
    let baseDamage = skill.basePower;
    let scalingStat = 0;

    switch(skill.scalingStat) {
      case 'strength':
        scalingStat = p.stats.strength;
        break;
      case 'dexterity':
        scalingStat = p.stats.dexterity;
        break;
      case 'intelligence':
        scalingStat = p.stats.intelligence;
        break;
      case 'vitality':
        scalingStat = p.stats.vitality;
        break;
    }

    // Calculate final damage
    let dmg = 0;
    if (skill.effectType === 'damage') {
      if (skill.damageType === 'physical') {
        const attackPower = Math.max(1, p.attackPower + scalingStat);
        dmg = Math.max(1, Math.round((attackPower + baseDamage - e.defense) * (p._modifiers?.attackMultiplier ?? 1.0)));
      } else if (skill.damageType === 'magical') {
        const magicPower = Math.max(1, p.magicPower + scalingStat);
        dmg = Math.max(1, Math.round((magicPower + baseDamage - Math.floor(e.defense * 0.3)) * (p._modifiers?.magicMultiplier ?? 1.0)));
      }

      // Add momentum bonus
      const momentumFactor = (this.playerMomentum / this.momentumMax);
      dmg = Math.round(dmg * (1 + momentumFactor * 0.2));

      // Crit chance (skills can have bonus crit)
      const w = p.equipment.weapon;
      const weaponCritBonus = w?.critChance || 0;
      const baseCrit = 0.05;
      const skillCritBonus = skill.critBonus || 0;
      const critChance = baseCrit + weaponCritBonus + skillCritBonus + (p._modifiers?.critChanceBonus ?? 0) + (momentumFactor * 0.1);
      const isCrit = Math.random() < critChance;
      if (isCrit) dmg = Math.round(dmg * 1.5);

      // Variance
      dmg += randInt(-2, 2);
      dmg = Math.max(1, dmg);

      // Apply damage
      e.hp = clamp((e.hp ?? e.maxHp) - dmg, 0, e.maxHp);

      // Visual and audio feedback
      playSoundSkill();
      const enemyCombatant = document.querySelector('.combatant.enemy');
      flashHit(enemyCombatant);
      shakeElement(enemyCombatant);
      spawnFloatingDamage(enemyCombatant, dmg, isCrit ? 'crit' : 'normal');
      if (isCrit) playSoundCrit();

      addBattleLogEntry(`${p.name} uses ${skill.name} for ${dmg} damage!${isCrit ? ' (CRIT!)' : ''}`, isCrit ? 'crit' : 'damage');
    } else if (skill.effectType === 'buff') {
      // Apply buff to player (e.g., damage reduction)
      if (skill.statusEffect) {
        applyStatus(p, skill.statusEffect, addBattleLogEntry);
      }
      addBattleLogEntry(`${p.name} uses ${skill.name}!`, 'info');
      playSoundSkill();
    }

    // Apply status effect chance
    if (skill.statusEffect && skill.statusChance && Math.random() < skill.statusChance) {
      applyStatus(e, skill.statusEffect, addBattleLogEntry);
    }

    // Set skill on cooldown
    this.skillCooldowns[skillId] = skill.cooldownMax;

    // Build momentum (slightly less than basic attacks)
    this.playerMomentum = Math.min(this.momentumMax, this.playerMomentum + 8);

    // Check if enemy defeated
    if (e.hp <= 0) {
      if (this.isGroupBattle) {
        addBattleLogEntry(`${e.name} defeated.`, 'victory');
      } else {
        return this.endBattle('victory');
      }
    }
  },

  handlePlayerAttack() {
    if (!this.isBattleActive) return;
    if (this.playerCooldownCurrent < this.playerCooldownMax) return; // not ready
    const p = GameState.player;
    const e = this.currentEnemy;
    const w = p.equipment.weapon;
    const weaponClass = w?.weaponClass;
    const weaponBase = w?.baseDamage || 0;
    const weaponCritBonus = w?.critChance || 0;
    const weaponOnHit = w?.onHitEffect;
    // Base stat scaling
    let statPortion = Math.max(1, p.attackPower - e.defense);
    // Magic weapons scale extra with intelligence
    if (weaponClass === 'magic') {
      statPortion += Math.round(p.stats.intelligence * 1.2);
    }
    let raw = Math.max(1, Math.round((statPortion + weaponBase) * (p._modifiers?.attackMultiplier ?? 1.0)));
    // Momentum bonus: light builds faster, heavy converts more to damage
    const momentumFactor = (this.playerMomentum / this.momentumMax);
    if (weaponClass === 'heavy') raw = Math.round(raw * (1 + momentumFactor * 0.6));
    else if (weaponClass === 'light') raw = Math.round(raw * (1 + momentumFactor * 0.3));
    else if (weaponClass === 'magic') raw = Math.round(raw * (1 + momentumFactor * 0.4));
    else if (weaponClass === 'ranged') raw = Math.round(raw * (1 + momentumFactor * 0.25));
    // Crit roll
    const baseCrit = 0.05; // baseline crit chance
    const critChance = baseCrit + weaponCritBonus + (p._modifiers?.critChanceBonus ?? 0) + (momentumFactor * 0.1);
    const isCrit = Math.random() < critChance;
    if (isCrit) raw = Math.round(raw * 1.5);
    const variance = randInt(-2, 2);
    const dmg = Math.max(1, raw + variance);
    e.hp = clamp((e.hp ?? e.maxHp) - dmg, 0, e.maxHp);
    this.playerCooldownCurrent = 0;

    // Apply weapon on-hit status effect (light chance), heavy chance to stagger
    if (weaponOnHit && Math.random() < 0.35) {
      applyStatus(e, weaponOnHit, addBattleLogEntry);
    }
    if (weaponClass === 'heavy' && Math.random() < 0.25) {
      applyStatus(e, 'stagger', addBattleLogEntry);
    }

    // Ranged preempt chance: if enemy about to attack, push back progress
    if (weaponClass === 'ranged') {
      const timeToAttack = this.enemyCooldownMax - this.enemyCooldownCurrent;
      if (timeToAttack < 0.5 && Math.random() < 0.5) {
        this.enemyCooldownCurrent = Math.max(0, this.enemyCooldownCurrent - 0.6); // delay enemy
        addBattleLogEntry('Your shot disrupts the enemy attack timing!', 'status');
      }
    }

    // Momentum build
    let momentumGain = 12; // base
    if (weaponClass === 'light') momentumGain = 18;
    if (weaponClass === 'heavy') momentumGain = 10;
    if (weaponClass === 'magic') momentumGain = 14;
    if (weaponClass === 'ranged') momentumGain = 13;
    this.playerMomentum = Math.min(this.momentumMax, this.playerMomentum + momentumGain);
    
    // Visual and audio feedback
    playSoundAttack();
    const enemyCombatant = document.querySelector('.combatant.enemy');
    flashHit(enemyCombatant);
    shakeElement(enemyCombatant);

    // Bleed extra damage trigger when enemy has bleed stacks
    if (e._bleedStacks) {
      const bleedDmg = e._bleedStacks * 3;
      e.hp = clamp(e.hp - bleedDmg, 0, e.maxHp);
      addBattleLogEntry(`Bleed deals ${bleedDmg} bonus damage!`, 'status');
    }
    
    addBattleLogEntry(`${p.name} attacks for ${dmg}.${isCrit ? ' (CRIT!)' : ''}`, isCrit ? 'crit' : 'damage');
    // Boss Phase 3 counter on player crits
    if (isCrit && e?.id === 'boss_elder_wyrm' && (e.currentPhase ?? this._wyrm?.phase) >= 2 && e.hp > 0){
      const counter = Math.max(1, Math.round((e.attackPower * 0.6) - p.defense * 0.3) + randInt(-2,2));
      p.hp = clamp(p.hp - counter, 0, p.maxHp);
      const playerCombatant = document.querySelector('.combatant.player');
      flashHit(playerCombatant); shakeElement(playerCombatant); spawnFloatingDamage(playerCombatant, counter, 'normal');
      addBattleLogEntry('The Wyrm counters your exposed strike!', 'boss');
      if (p.hp <= 0) return this.endBattle('defeat');
    }
    if (e.hp <= 0){
      if (this.isGroupBattle){
        // Group victory handled in group loop; just log kill
        addBattleLogEntry(`${e.name} defeated.`, 'victory');
      } else {
        return this.endBattle('victory');
      }
    }
  },

  /**
   * Handle player skill activation
   * Active skill usage scales damage and alters next cooldown duration.
   * Extend by adding more cases in switch with unique ids.
   * @param {string} skillId - The skill identifier to activate
   */
  handlePlayerSkill(skillId){
    if (!validateBattleState(this)) return;
    if (!this.isBattleActive) return;
    if (this.playerCooldownCurrent < this.playerCooldownMax) return; // must be ready
    const p = GameState.player;
    const e = this.currentEnemy;
    const basePhysical = Math.max(1, Math.round((p.attackPower - e.defense) * (p._modifiers?.attackMultiplier ?? 1.0)));
    const baseMagic = Math.max(1, Math.round((p.magicPower - Math.floor(e.defense * 0.3)) * (p._modifiers?.magicMultiplier ?? 1.0)));
    let dmg = 0;
    let cdFactor = 1; // multiplier applied to cooldown for next cycle
    switch (skillId){
      case 'power_strike': // 160% physical, slower recovery
        dmg = Math.round(basePhysical * 1.6 * (p._modifiers?.powerStrikeDamageMultiplier ?? 1.0) + randInt(-3,3));
        cdFactor = 1.25;
        // Chance to stun if mastery talent taken
        if (p.spentTalents?.includes('war_power_mastery') && Math.random() < 0.25){
          applyStatus(e, 'stun', addBattleLogEntry);
        }
        break;
      case 'firebolt': // 140% magic, normal recovery
        dmg = Math.round(baseMagic * 1.4 * (p._modifiers?.fireboltDamageMultiplier ?? 1.0) + randInt(-2,2));
        cdFactor = 1.0;
        // Burn chance if fire mastery talent taken
        if (p.spentTalents?.includes('mag_fire_mastery') && Math.random() < 0.30){
          applyStatus(e, 'burn', addBattleLogEntry);
        }
        break;
      case 'quick_jab': // 80% physical, faster recovery
        dmg = Math.round(basePhysical * 0.8 + randInt(-1,2));
        cdFactor = 0.55 * (p._modifiers?.quickJabCooldownMultiplier ?? 1.0);
        break;
      case 'elf_precision': // Elf-only: 115% physical, tighter variance, quicker recovery
        dmg = Math.round(basePhysical * 1.15 + randInt(-1,1));
        cdFactor = 0.75;
        break;
      case 'poison_dart': // Rogue-only: light damage + poison
        dmg = Math.round(basePhysical * 0.9 + randInt(-1,1));
        cdFactor = 0.8;
        applyStatus(e, 'poison', addBattleLogEntry);
        break;
      default:
        return;
    }
    // Crit on skills (same logic)
    const w = p.equipment.weapon;
    const weaponCritBonus = w?.critChance || 0;
    const momentumFactor = (this.playerMomentum / this.momentumMax);
    const baseCrit = 0.05;
    const critChance = baseCrit + weaponCritBonus + (p._modifiers?.critChanceBonus ?? 0) + (momentumFactor * 0.1);
    const isCrit = Math.random() < critChance;
    if (isCrit) dmg = Math.round(dmg * 1.5);
    e.hp = clamp((e.hp ?? e.maxHp) - dmg, 0, e.maxHp);
    this.playerCooldownCurrent = 0;
    // Apply talent skill cooldown multiplier
    this._tempSkillCooldownFactor = cdFactor * (p._modifiers?.skillCooldownMultiplier ?? 1.0);
    
    // Visual and audio feedback
    playSoundSkill();
    const enemyCombatant = document.querySelector('.combatant.enemy');
    flashHit(enemyCombatant);
    shakeElement(enemyCombatant);
    
    // Build momentum on skill use (slightly lower than auto attacks)
    this.playerMomentum = Math.min(this.momentumMax, this.playerMomentum + 10);

    addBattleLogEntry(`${p.name} uses ${readableSkillName(skillId)} for ${dmg} damage!${isCrit ? ' (CRIT!)' : ''}`, isCrit ? 'crit' : 'damage');
    if (e.hp <= 0){
      if (this.isGroupBattle){
        addBattleLogEntry(`${e.name} defeated.`, 'victory');
      } else {
        return this.endBattle('victory');
      }
    }
  },

  /**
   * ENEMY SKILL SYSTEM - AI DECISION LOGIC
   * Decides whether enemy should use a skill or basic attack
   * Priority system: high-priority skills > off-cooldown skills > basic attack
   */
  _shouldEnemyUseSkill(enemy) {
    if (!enemy.skills || enemy.skills.length === 0) return null;
    if (this.enemyCastingSkill) return null; // Already casting

    // Find available skills (not on cooldown)
    const availableSkills = enemy.skills.filter(skill => {
      const cooldown = this.enemySkillCooldowns[skill.id] || 0;
      return cooldown <= 0;
    });

    if (availableSkills.length === 0) return null;

    // Prioritize high-priority skills
    const highPriority = availableSkills.filter(s => s.priority === 'high');
    if (highPriority.length > 0) {
      return randChoice(highPriority);
    }

    // 60% chance to use medium priority skill if available
    const mediumPriority = availableSkills.filter(s => s.priority === 'medium');
    if (mediumPriority.length > 0 && Math.random() < 0.6) {
      return randChoice(mediumPriority);
    }

    // 30% chance to use any available skill as fallback
    if (Math.random() < 0.3) {
      return randChoice(availableSkills);
    }

    return null; // Use basic attack
  },

  /**
   * Execute an enemy skill with damage calculation and status effects
   */
  _executeEnemySkill(skill, enemy, player) {
    if (!skill) return;

    const p = player;
    const e = enemy;

    // Calculate skill damage
    let dmg = 0;
    if (skill.effectType === 'damage') {
      // Get scaling stat value (enemies use attackPower as STR equivalent)
      let scalingValue = e.attackPower;
      if (skill.scalingStat === 'intelligence') {
        scalingValue = Math.round(e.attackPower * 0.8); // INT skills slightly weaker for physical enemies
      } else if (skill.scalingStat === 'dexterity') {
        scalingValue = Math.round(e.attackPower * 0.9);
      }

      if (skill.damageType === 'physical') {
        dmg = Math.max(1, Math.round((scalingValue + skill.basePower - p.defense) * 0.9));
      } else if (skill.damageType === 'magical') {
        dmg = Math.max(1, Math.round((scalingValue + skill.basePower - Math.floor(p.defense * 0.3)) * 0.85));
      }

      // Add variance
      dmg += randInt(-2, 2);
      dmg = Math.max(1, dmg);

      // Safety cap: enemy skills can't exceed 40% of player max HP in one hit (early game balance)
      const maxSkillDmg = Math.round(p.maxHp * 0.4);
      dmg = Math.min(dmg, maxSkillDmg);

      // Apply damage
      p.hp = clamp(p.hp - dmg, 0, p.maxHp);

      // Visual feedback
      playSoundEnemySpecial();
      const playerEl = document.querySelector('.combatant.player');
      flashHit(playerEl);
      shakeElement(playerEl);
      spawnFloatingDamage(playerEl, dmg, 'normal');

      addBattleLogEntry(`${e.name} uses ${skill.name} for ${dmg} damage!`, 'damage');

      // Apply status effect if present
      if (skill.appliedStatus && skill.statusChance) {
        if (Math.random() < skill.statusChance) {
          applyStatus(p, skill.appliedStatus, addBattleLogEntry);
        }
      }

      // Check defeat
      if (p.hp <= 0) {
        this.endBattle('defeat');
        return;
      }
    } else if (skill.effectType === 'buff') {
      // Apply buff to enemy
      if (skill.appliedStatus) {
        applyStatus(e, skill.appliedStatus, addBattleLogEntry);
      }
      addBattleLogEntry(`${e.name} uses ${skill.name}!`, 'status');
      playSoundEnemySpecial();
    }

    // Set skill on cooldown
    this.enemySkillCooldowns[skill.id] = skill.cooldownMax;

    // Reset momentum on enemy skill hit
    if (this._momentumDecayOnHit && skill.effectType === 'damage') {
      this.playerMomentum = 0;
    }
  },

  /**
   * Start telegraphing an enemy skill (warns player before execution)
   */
  _telegraphEnemySkill(skill, enemy) {
    if (!skill) return;
    
    this.enemyCastingSkill = {
      skill: skill,
      windupRemaining: this.enemySkillWindupTime
    };

    // Show telegraph message
    const telegraphMsg = skill.telegraphText || `${enemy.name} prepares ${skill.name}!`;
    addBattleLogEntry(telegraphMsg, 'info');
    playSoundEnemySpecial();
  },

  /**
   * Attempt to flee from battle (50% success rate)
   */
  tryRun() {
    if (!validateBattleState(this)) return;
    const success = Math.random() < 0.5;
    addBattleLogEntry(success ? 'You manage to run away!' : 'You failed to run!', success ? 'info' : 'damage');
    if (success) this.endBattle('run');
  },

  /**
   * End the current battle and distribute rewards/penalties
   * @param {string} outcome - 'victory', 'defeat', or 'run'
   */
  endBattle(outcome) {
    this.isBattleActive = false;
    cancelAnimationFrame(this._rafId);
    this.playerMomentum = 0;
    const p = GameState.player;
    
    if (!p) {
      console.error('No player during battle end');
      return;
    }
    if (outcome === 'victory') {
      playSoundVictory();
      // Restore MP on victory (20% of max)
      const mpRestore = Math.floor(p.maxMp * 0.2);
      GameState.regenerateMp(mpRestore);
      if (this.isGroupBattle){
        // Sum rewards
        let totalGold = 0, totalXp = 0;
        for (const e of this.currentEnemies){
          totalGold += e.goldReward || 0;
          totalXp += e.xpReward || 0;
          updateQuestProgress(e.id);
        }
        p.gold += totalGold;
        GameState.gainXp(totalXp);
        addBattleLogEntry(`Group defeated! +${totalGold} gold, +${totalXp} XP.`, 'victory');
      } else {
        p.gold += this.currentEnemy.goldReward;
        GameState.gainXp(this.currentEnemy.xpReward);
        addBattleLogEntry(`Victory! +${this.currentEnemy.goldReward} gold, +${this.currentEnemy.xpReward} XP.`, 'victory');
        updateQuestProgress(this.currentEnemy.id);
        if (this.currentEnemy.id === 'boss_cave_wyrm'){
          addBattleLogEntry('You felled the Cave Wyrm! Its fang and scales seem valuable.', 'info');
          try {
            GameState.addItemToInventory('wyrm_fang_blade');
            GameState.addItemToInventory('wyrm_scale_armor');
            GameState.player.flags.boss_cave_wyrm_defeated = true;
          } catch {}
        } else if (this.currentEnemy.id === 'boss_elder_wyrm'){
          // Prevent repeat farming rewards
          if (!GameState.player.flags?.boss_elder_wyrm_defeated){
            try {
              GameState.addItemToInventory('elder_wyrmfang_blade');
              GameState.addItemToInventory('molten_scale_carapace');
              GameState.addItemToInventory('elder_molten_core');
            } catch {}
          }
          GameState.player.flags = GameState.player.flags || {};
          GameState.player.flags.boss_elder_wyrm_defeated = true;
          GameState.player.flags.title_elder_conqueror = true;
          addBattleLogEntry('Elder Deep falls silent. A new title is yours.', 'boss');
          try { stopBossMusic(); } catch {}
        }
      }
    } else if (outcome === 'defeat') {
      // Player defeated: stop battle and show Death Screen (do not jump to town)
      playSoundDefeat();
      // Small gold penalty; HP remains at current (0) until respawn
      p.gold = Math.max(0, p.gold - 5);
      try { window.__activeBattleState = null; } catch {}
      // Build summary and hand off to renderer
      const enemyName = this.isGroupBattle
        ? (this.currentEnemies.find(e => e.hp > 0)?.name || 'the foes')
        : (this.currentEnemy?.name || 'the foe');
      const enemyLevel = this.isGroupBattle
        ? (this.currentEnemies.find(e => e.hp > 0)?.level ?? '')
        : (this.currentEnemy?.level ?? '');
      const summary = `You were defeated by ${enemyName}${enemyLevel !== '' ? ` (Level ${enemyLevel})` : ''}.`;
      import('./renderer.js').then(m => m.showDeathScreen(summary));
      return;
    }
    // Victory or other outcomes: wrap up zone and enable back button
    if (this.currentZoneKey) try { applyZoneEndEffects(this.currentZoneKey, this); } catch {}
    const backBtn = document.querySelector('#btn-back-to-town');
    if (backBtn) backBtn.classList.remove('hidden');
    try { window.__activeBattleState = null; } catch {}
  }
};

function readableSkillName(id){
  switch(id){
    case 'power_strike': return 'Power Strike';
    case 'firebolt': return 'Firebolt';
    case 'quick_jab': return 'Quick Jab';
    case 'elf_precision': return 'Elf Precision';
    case 'poison_dart': return 'Poison Dart';
    default: return id;
  }
}

// Allow UI to change current target in group battle
export function setGroupTarget(index){
  if (!Battle.isGroupBattle) return;
  if (index < 0 || index >= Battle.currentEnemies.length) return;
  const e = Battle.currentEnemies[index];
  if (e.hp <= 0) return; // cannot target dead
  Battle.currentTargetIndex = index;
  Battle.currentEnemy = e;
  addBattleLogEntry(`Target set to ${e.name}.`);
}
