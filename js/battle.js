/* battle.js - Turn-based combat system for Chapter 1 (multi-enemy support) */
var Battle = (function () {

  var enemies = [];       // array of enemy objects, each gets .buffs, .effects, .maxHp
  var targetIndex = 0;    // which enemy the player is targeting
  var battleLog = [];
  var playerBuffs = [];   // { stat, amount, turns }
  var playerEffects = []; // { type, damage, turns }
  var isBossFight = false;
  var isDungeonBattle = false;
  var onVictoryCallback = null;
  var turnCount = 0;
  var bossPhaseIndex = 0;
  var encounterMod = null;
  var animating = false;
  var lastVictoryData = null;
  var skillCooldowns = {};

  var battleBackgrounds = {
    "forest-road": "assets/backgrounds/battle-forest-road.png",
    "goblin-trail": "assets/backgrounds/battle-goblin-trail.png",
    "goblin-cave": "assets/backgrounds/battle-cave.png",
    "watch-post": "assets/backgrounds/battle-watch-post.png",
    "riverbank": "assets/backgrounds/battle-riverbank.png"
  };

  function setBattleBackground(areaId) {
    var screen = document.getElementById("screen-battle");
    if (!screen) return;
    var bg = battleBackgrounds[areaId] || "";
    screen.style.backgroundImage = bg ? "url('" + bg + "')" : "";
    screen.style.backgroundSize = "cover";
    screen.style.backgroundPosition = "center";
  }

  var encounterTexts = [
    "A {name} appears!",
    "A {name} leaps out from the shadows!",
    "You stumble upon a {name}!",
    "A {name} blocks your path!",
    "A {name} snarls and charges at you!",
    "A wild {name} emerges from the undergrowth!",
    "You spot a {name} just as it spots you!",
    "A {name} lunges from behind a tree!"
  ];

  var multiEncounterTexts = [
    "A group of enemies ambushes you!",
    "Multiple foes block your path!",
    "You're surrounded by hostile creatures!",
    "Enemies emerge from all sides!"
  ];

  function prepareEnemy(e) {
    e.buffs = [];
    e.effects = [];
    e.maxHp = e.hp;
    return e;
  }

  function start(areaId, callback) {
    // Roll for enemy count: 60% one, 30% two, 10% three
    var countRoll = Math.random();
    var enemyCount = countRoll < 0.60 ? 1 : (countRoll < 0.90 ? 2 : 3);

    enemies = [];
    encounterMod = Enemies.rollEncounterModifier();

    for (var i = 0; i < enemyCount; i++) {
      var e = Enemies.getRandomForArea(areaId);
      if (!e) continue;

      // Apply encounter modifier to first enemy only
      if (i === 0) {
        e = encounterMod.modify(e);
      }

      // Apply difficulty scaling
      var diff = Player.getDifficultyMultiplier();
      e.hp = Math.floor(e.hp * diff);
      e.attack = Math.ceil(e.attack * diff);
      var xpScale = diff <= 0.75 ? 1.25 : diff >= 1.35 ? 0.85 : 1.0;
      e.xp = Math.floor(e.xp * xpScale);

      // Elric patrol route: weaken enemies on patrolled roads
      if (Player.hasFlag("elricPatrolRoute") && (areaId === "forest-road" || areaId === "goblin-trail")) {
        e.hp = Math.floor(e.hp * 0.8);
        e.attack = Math.max(1, e.attack - 1);
      }

      prepareEnemy(e);
      enemies.push(e);
    }

    if (enemies.length === 0) return false;

    targetIndex = 0;
    isBossFight = !!enemies[0].isBoss;
    isDungeonBattle = false;
    onVictoryCallback = callback || null;
    resetState();
    setBattleBackground(areaId);
    renderBattle();
    UI.showScreen("battle");

    // Encounter text
    if (enemies.length === 1) {
      var msg = encounterTexts[Math.floor(Math.random() * encounterTexts.length)].replace("{name}", enemies[0].name);
      if (encounterMod && encounterMod.label) msg = encounterMod.label + " " + msg;
      addLog(msg);
    } else {
      var names = [];
      for (var n = 0; n < enemies.length; n++) names.push(enemies[n].name);
      var multiMsg = multiEncounterTexts[Math.floor(Math.random() * multiEncounterTexts.length)];
      if (encounterMod && encounterMod.label) multiMsg = encounterMod.label + " " + multiMsg;
      addLog(multiMsg);
      addLog("You face: " + names.join(", ") + "!");
    }

    // Ambush: enemies get a free turn
    if (enemies[0].ambush) {
      // Pet ambush protection
      var ambushPassive = (typeof Pets !== 'undefined') ? Pets.getActivePassive() : null;
      if (ambushPassive && ambushPassive.type === "ambush-protect" && Math.random() < ambushPassive.chance) {
        addLog(ambushPassive.message);
      } else {
        addLog("You've been ambushed!");
        Audio.play("ambush");
        enemyTurn();
      }
    }
    return true;
  }

  function startBoss(enemyId, callback) {
    var e = Enemies.getBoss(enemyId);
    if (!e) return false;

    var diff = Player.getDifficultyMultiplier();
    e.hp = Math.floor(e.hp * diff);
    e.attack = Math.ceil(e.attack * diff);

    prepareEnemy(e);
    enemies = [e];
    targetIndex = 0;
    isBossFight = true;
    isDungeonBattle = true;
    encounterMod = null;
    onVictoryCallback = callback || null;
    resetState();
    setBattleBackground("goblin-cave");
    renderBattle();
    UI.showScreen("battle");
    addLog(enemies[0].name + " stands before you!");
    return true;
  }

  function startDungeonEnemy(enemyId, callback) {
    var ids = Array.isArray(enemyId) ? enemyId : [enemyId];
    enemies = [];
    for (var di = 0; di < ids.length; di++) {
      var template = Enemies.get(ids[di]);
      if (!template) continue;
      var e = JSON.parse(JSON.stringify(template));

      var diff = Player.getDifficultyMultiplier();
      e.hp = Math.floor(e.hp * diff);
      e.attack = Math.ceil(e.attack * diff);

      prepareEnemy(e);
      enemies.push(e);
    }

    if (enemies.length === 0) return false;
    targetIndex = 0;
    isBossFight = !!enemies[0].isBoss;
    isDungeonBattle = true;
    encounterMod = null;
    onVictoryCallback = callback || null;
    resetState();
    setBattleBackground("goblin-cave");
    renderBattle();
    UI.showScreen("battle");
    if (enemies.length === 1) {
      addLog("A " + enemies[0].name + " blocks your path!");
    } else {
      var names = [];
      for (var n = 0; n < enemies.length; n++) names.push(enemies[n].name);
      addLog("Enemies block your path: " + names.join(", ") + "!");
    }
    return true;
  }

  function startExploration(areaId, enemyId, callback, isAmbush) {
    var template = Enemies.get(enemyId);
    if (!template) return false;

    enemies = [];
    encounterMod = Enemies.rollEncounterModifier();

    // Primary enemy from the clicked portrait
    var e = JSON.parse(JSON.stringify(template));

    // Apply seasonal modifiers (same as getRandomForArea)
    var season = Player.getSeason();
    if (season === "winter") {
      var winterSwaps = {"wolf":"snow-wolf","wolf-pack":"snow-wolf","goblin-scout":"frost-goblin","goblin-sneak":"frost-goblin","bandit":"snow-bandit"};
      var swapped = winterSwaps[enemyId] ? Enemies.get(winterSwaps[enemyId]) : null;
      if (swapped) { e = JSON.parse(JSON.stringify(swapped)); }
      e.hp = Math.floor(e.hp * 1.2);
      e.attack += 2;
      e.defense += 1;
      e.xp = Math.floor(e.xp * 1.25);
      if (e.gold) { e.gold[0] = Math.floor(e.gold[0] * 1.2); e.gold[1] = Math.floor(e.gold[1] * 1.2); }
    }
    if (season === "spring") { e.defense = Math.max(0, e.defense - 1); e.hp = Math.floor(e.hp * 0.9); }
    if (season === "summer") { e.attack += 1; e.xp = Math.floor(e.xp * 1.1); }
    if (season === "autumn") {
      if (e.gold) { e.gold[0] = Math.floor(e.gold[0] * 1.15); e.gold[1] = Math.floor(e.gold[1] * 1.15); }
      e.xp = Math.floor(e.xp * 1.1);
    }

    // Apply encounter modifier
    e = encounterMod.modify(e);

    // Apply difficulty scaling
    var diff = Player.getDifficultyMultiplier();
    e.hp = Math.floor(e.hp * diff);
    e.attack = Math.ceil(e.attack * diff);
    var xpScale = diff <= 0.75 ? 1.25 : diff >= 1.35 ? 0.85 : 1.0;
    e.xp = Math.floor(e.xp * xpScale);

    // Elric patrol route
    if (Player.hasFlag("elricPatrolRoute") && (areaId === "forest-road" || areaId === "goblin-trail")) {
      e.hp = Math.floor(e.hp * 0.8);
      e.attack = Math.max(1, e.attack - 1);
    }

    if (isAmbush) e.ambush = true;

    prepareEnemy(e);
    enemies.push(e);

    // 30% chance of a second enemy from the area pool
    if (Math.random() < 0.30) {
      var e2 = Enemies.getRandomForArea(areaId);
      if (e2) {
        var diff2 = Player.getDifficultyMultiplier();
        e2.hp = Math.floor(e2.hp * diff2);
        e2.attack = Math.ceil(e2.attack * diff2);
        e2.xp = Math.floor(e2.xp * xpScale);
        if (Player.hasFlag("elricPatrolRoute") && (areaId === "forest-road" || areaId === "goblin-trail")) {
          e2.hp = Math.floor(e2.hp * 0.8);
          e2.attack = Math.max(1, e2.attack - 1);
        }
        prepareEnemy(e2);
        enemies.push(e2);
      }
    }

    targetIndex = 0;
    isBossFight = false;
    isDungeonBattle = false;
    onVictoryCallback = callback || null;
    resetState();
    setBattleBackground(areaId);
    renderBattle();
    UI.showScreen("battle");

    if (enemies.length === 1) {
      var msg = encounterTexts[Math.floor(Math.random() * encounterTexts.length)].replace("{name}", enemies[0].name);
      if (encounterMod && encounterMod.label) msg = encounterMod.label + " " + msg;
      addLog(msg);
    } else {
      var names = [];
      for (var n = 0; n < enemies.length; n++) names.push(enemies[n].name);
      var multiMsg = multiEncounterTexts[Math.floor(Math.random() * multiEncounterTexts.length)];
      addLog(multiMsg);
      addLog("You face: " + names.join(", ") + "!");
    }

    // Ambush
    if (isAmbush) {
      var ambushPassive = (typeof Pets !== 'undefined') ? Pets.getActivePassive() : null;
      if (ambushPassive && ambushPassive.type === "ambush-protect" && Math.random() < ambushPassive.chance) {
        addLog(ambushPassive.message);
      } else {
        addLog("You've been ambushed!");
        Audio.play("ambush");
        enemyTurn();
      }
    }
    return true;
  }

  function resetState() {
    battleLog = [];
    playerBuffs = [];
    playerEffects = [];
    turnCount = 0;
    bossPhaseIndex = 0;
    animating = false;
    skillCooldowns = {};
  }

  /* ── Target Selection Helpers ── */

  function autoSelectTarget() {
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].hp > 0) { targetIndex = i; return; }
    }
  }

  function allEnemiesDead() {
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].hp > 0) return false;
    }
    return true;
  }

  function selectTarget(idx) {
    if (idx >= 0 && idx < enemies.length && enemies[idx].hp > 0) {
      targetIndex = idx;
      renderBattle();
    }
  }

  function handleEnemyDeath(idx) {
    var e = enemies[idx];
    addLog("You defeated " + e.name + "!");
    Player.recordKill(e.id);
    Quests.progressKill(e.id);
    // Track bounty kills
    var pb = Player.get();
    if (pb.activeBounty && pb.activeBounty.target === e.id) {
      pb.bountyKills = (pb.bountyKills || 0) + 1;
    }
    autoSelectTarget();
  }

  /* ── Combat Animation Helper ── */

  // Map ability/effect names to element types for visual effects
  function getElement(opts) {
    if (!opts) return "";
    // Check explicit element
    if (opts.element) return opts.element;
    // Infer from ability name
    var name = (opts.abilityName || "").toLowerCase();
    if (name.indexOf("fire") !== -1 || name.indexOf("flame") !== -1 || name.indexOf("blaze") !== -1) return "fire";
    if (name.indexOf("frost") !== -1 || name.indexOf("ice") !== -1 || name.indexOf("frozen") !== -1 || name.indexOf("blinding snow") !== -1) return "ice";
    if (name.indexOf("lightning") !== -1 || name.indexOf("thunder") !== -1 || name.indexOf("shock") !== -1) return "lightning";
    if (name.indexOf("poison") !== -1 || name.indexOf("venom") !== -1 || name.indexOf("hex") !== -1) return "poison";
    if (name.indexOf("dark") !== -1 || name.indexOf("shadow") !== -1) return "dark";
    // Infer from effect type
    var eff = opts.effectType || "";
    if (eff === "burn") return "fire";
    if (eff === "stun" && (name.indexOf("frost") !== -1 || name.indexOf("frozen") !== -1 || name.indexOf("ice") !== -1)) return "ice";
    if (eff === "poison") return "poison";
    if (eff === "silence") return "dark";
    if (eff === "fear") return "dark";
    return "";
  }

  // Spawn an elemental overlay flash on a target element
  function showElementOverlay(targetEl, element) {
    if (!targetEl || !element) return;
    var overlay = document.createElement("div");
    overlay.className = "element-impact-overlay element-overlay-" + element;
    targetEl.appendChild(overlay);
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 550);
  }

  function animateCombat(who, type, callback, enemyIdx, opts) {
    // who: "player" or "enemy"
    // type: "melee", "magic", "heal", "buff", "miss", "dodge"
    // opts: { element: "fire"|"ice"|"lightning"|"poison"|"dark", abilityName: "...", effectType: "..." }
    var attackerId, targetId;
    if (who === "player") {
      attackerId = "battle-player";
      targetId = "battle-enemy-" + targetIndex;
    } else {
      var ei = (enemyIdx !== undefined) ? enemyIdx : 0;
      attackerId = "battle-enemy-" + ei;
      targetId = "battle-player";
    }
    var attackerEl = document.getElementById(attackerId);
    var targetEl = document.getElementById(targetId);

    if (!attackerEl) { if (callback) callback(); return; }

    animating = true;
    var element = getElement(opts);

    if (type === "melee") {
      // Calculate travel distance from attacker to target
      var travelX = 0;
      if (attackerEl && targetEl) {
        var aRect = attackerEl.getBoundingClientRect();
        var tRect = targetEl.getBoundingClientRect();
        // Player moves right toward enemies, enemies move left toward player
        if (who === "player") {
          travelX = (tRect.left + tRect.width / 2) - (aRect.left + aRect.width / 2) - 20;
        } else {
          travelX = (tRect.left + tRect.width / 2) - (aRect.left + aRect.width / 2) + 20;
        }
      }
      attackerEl.style.setProperty("--travel-x", travelX + "px");
      attackerEl.classList.add("anim-melee-travel");

      // Hit shake on target at peak of travel (~40%)
      setTimeout(function () {
        if (targetEl) {
          targetEl.classList.add("anim-hit-shake");
          // Red flash overlay on hit
          var flash = document.createElement("div");
          flash.className = "damage-flash-overlay";
          targetEl.appendChild(flash);
          setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 400);
        }
      }, 230);

      setTimeout(function () {
        attackerEl.classList.remove("anim-melee-travel");
        attackerEl.style.removeProperty("--travel-x");
        if (targetEl) targetEl.classList.remove("anim-hit-shake");
        animating = false;
        if (callback) callback();
      }, 650);

    } else if (type === "magic") {
      // Elemental cast glow on attacker
      var castClass = element ? "anim-" + element + "-cast" : "anim-magic-cast";
      // Only fire and ice have custom cast; others fall back to generic
      if (element !== "fire" && element !== "ice") castClass = "anim-magic-cast";
      attackerEl.classList.add(castClass);

      // Elemental impact on target
      setTimeout(function () {
        if (targetEl) {
          var impactClass = element ? "anim-" + element + "-impact" : "anim-magic-impact";
          targetEl.classList.add(impactClass);
          targetEl._impactClass = impactClass;
          // Elemental overlay flash
          showElementOverlay(targetEl, element || "dark");
        }
      }, 220);

      setTimeout(function () {
        attackerEl.classList.remove(castClass);
        if (targetEl) {
          targetEl.classList.remove(targetEl._impactClass || "anim-magic-impact");
          delete targetEl._impactClass;
        }
        animating = false;
        if (callback) callback();
      }, 600);

    } else if (type === "heal" || type === "buff") {
      attackerEl.classList.add("anim-heal-glow");
      setTimeout(function () {
        attackerEl.classList.remove("anim-heal-glow");
        animating = false;
        if (callback) callback();
      }, 500);

    } else if (type === "miss" || type === "dodge") {
      if (targetEl) targetEl.classList.add("anim-dodge");
      setTimeout(function () {
        if (targetEl) targetEl.classList.remove("anim-dodge");
        animating = false;
        if (callback) callback();
      }, 400);

    } else {
      animating = false;
      if (callback) callback();
    }
  }

  /* ── Player Actions ── */

  /**
   * Show Floating Combat Text over a battle combatant.
   * @param {string} targetId - DOM id of the combatant element (e.g. "battle-player", "battle-enemy-0")
   * @param {string} text - The text to display (e.g. "-12", "MISS", "+8")
   * @param {string} type - CSS modifier: damage|crit|miss|dodge|heal|mana|effect|buff|status|xp|gold
   */
  function showFCT(targetId, text, type) {
    var layer = document.getElementById("fct-layer");
    var target = document.getElementById(targetId);
    if (!layer || !target) return;

    var screen = document.getElementById("screen-battle");
    var screenRect = screen.getBoundingClientRect();
    var targetRect = target.getBoundingClientRect();

    var el = document.createElement("div");
    el.className = "fct fct-" + (type || "damage");
    el.textContent = text;

    // position centered over the target portrait, with slight random x offset
    var cx = (targetRect.left + targetRect.width / 2) - screenRect.left;
    var cy = (targetRect.top + targetRect.height * 0.3) - screenRect.top;
    var offsetX = (Math.random() - 0.5) * 30;
    el.style.left = (cx + offsetX) + "px";
    el.style.top = cy + "px";
    el.style.transform = "translateX(-50%)";

    layer.appendChild(el);

    // Remove after animation completes
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1050);
  }

  function playerAttack() {
    if (enemies.length === 0 || animating) return;

    // Stun: skip entire turn
    if (findEffect(playerEffects, "stun") !== -1) {
      addLog("You are stunned and can't act!");
      enemyTurn();
      return;
    }

    // Fear: chance to lose turn
    if (findEffect(playerEffects, "fear") !== -1 && Math.random() < 0.3) {
      addLog("You are paralyzed with fear and can't act!");
      enemyTurn();
      return;
    }

    var target = enemies[targetIndex];
    if (!target || target.hp <= 0) { autoSelectTarget(); target = enemies[targetIndex]; }
    if (!target || target.hp <= 0) return;

    var p = Player.get();
    var atk = Player.getTotalAttack() + getBuffTotal(playerBuffs, "attack");

    // Weakness debuff reduces attack
    if (findEffect(playerEffects, "weakness") !== -1) {
      atk = Math.floor(atk * 0.7);
    }

    var def = target.defense + getBuffTotal(target.buffs, "defense");
    var baseDmg = Math.max(1, Math.floor(atk * atk / (atk + def)) + Math.floor(Math.random() * 3));

    // Accuracy check: base 75% + 2% per DEX, capped at 98%
    var hitChance = Math.min(0.98, 0.75 + p.dexterity * 0.02);
    if (Math.random() > hitChance) {
      addLog("Your attack misses!");
      Audio.play("miss");
      animateCombat("player", "miss", function () {
        showFCT("battle-enemy-" + targetIndex, "MISS", "miss");
        enemyTurn();
      });
      return;
    }

    // Dexterity-based dodge chance for enemy (reduced by player DEX)
    var dodgeChance = Math.max(0.02, 0.08 - p.dexterity * 0.005);
    if (Math.random() < dodgeChance) {
      animateCombat("player", "melee", function () {
        addLog("The " + target.name + " dodges your attack!");
        Audio.play("miss");
        renderBattle();
        showFCT("battle-enemy-" + targetIndex, "DODGE", "dodge");
        checkBattleEnd() || enemyTurn();
      });
    } else {
      // Dexterity-based crit chance
      var critChance = 0.05 + p.dexterity * 0.02;
      var dmg = baseDmg;
      var isCrit = Math.random() < critChance;
      if (isCrit) {
        dmg = Math.floor(baseDmg * 1.5);
      }
      animateCombat("player", "melee", function () {
        if (isCrit) {
          addLog("Critical hit! You strike " + target.name + " for " + dmg + " damage!");
        } else {
          addLog("You hit " + target.name + " for " + dmg + " damage.");
        }
        target.hp -= dmg;
        Audio.play("swordHit");
        if (target.hp <= 0) {
          handleEnemyDeath(targetIndex);
        }
        // Pet extra-hit passive
        var petPassive = (typeof Pets !== 'undefined') ? Pets.getActivePassive() : null;
        if (petPassive && petPassive.type === "extra-hit" && target.hp > 0 && Math.random() < petPassive.chance) {
          var petDmg = Math.max(1, Math.floor(dmg * petPassive.damagePercent));
          target.hp -= petDmg;
          addLog(petPassive.message + " " + petDmg + " damage!");
          if (target.hp <= 0) handleEnemyDeath(targetIndex);
        }
        renderBattle();
        showFCT("battle-enemy-" + targetIndex, "-" + dmg, isCrit ? "crit" : "damage");
        checkBattleEnd() || enemyTurn();
      });
    }
  }

  function playerUseSkill(skillId) {
    if (enemies.length === 0 || animating) return;
    var skill = Skills.get(skillId);
    if (!skill) return;
    var p = Player.get();

    // Stun: skip entire turn
    if (findEffect(playerEffects, "stun") !== -1) {
      addLog("You are stunned and can't act!");
      enemyTurn();
      return;
    }

    // Silence prevents skill use
    if (findEffect(playerEffects, "silence") !== -1) {
      addLog("You are silenced and can't use skills!");
      Audio.play("statusSilence");
      return;
    }

    // Fear: chance to lose turn
    if (findEffect(playerEffects, "fear") !== -1 && Math.random() < 0.3) {
      addLog("You are paralyzed with fear and can't act!");
      enemyTurn();
      return;
    }

    if (p.mp < skill.mpCost) {
      addLog("Not enough MP!");
      return;
    }

    // Cooldown check
    if (skill.cooldown && skillCooldowns[skillId] && skillCooldowns[skillId] > turnCount) {
      var turnsLeft = skillCooldowns[skillId] - turnCount;
      addLog(skill.name + " is on cooldown for " + turnsLeft + " more turn" + (turnsLeft > 1 ? "s" : "") + ".");
      return;
    }

    p.mp -= skill.mpCost;

    // Set cooldown if skill has one
    if (skill.cooldown) {
      skillCooldowns[skillId] = turnCount + skill.cooldown;
    }

    // Track proficiency (#3)
    Player.trackSkillUse(skillId);
    var profBonus = Player.getSkillProficiencyBonus(skillId);

    var target = enemies[targetIndex];
    if (!target || target.hp <= 0) { autoSelectTarget(); target = enemies[targetIndex]; }

    if (skill.id === "meditate") {
      var manaAmt = Math.floor(skill.manaRestore * (1 + profBonus));
      animateCombat("player", "heal", function () {
        Player.restoreMana(manaAmt);
        addLog("You meditate and restore " + manaAmt + " MP.");
        Audio.play("heal");
        renderBattle();
        showFCT("battle-player", "+" + manaAmt + " MP", "mana");
        checkBattleEnd() || enemyTurn();
      });
    } else if (skill.type === "heal") {
      var healAmt = skill.healAmount + Math.max(0, p.level - 1) * 3;
      healAmt = Math.floor(healAmt * (1 + profBonus));
      animateCombat("player", "heal", function () {
        Player.heal(healAmt);
        addLog("You use " + skill.name + " and restore " + healAmt + " HP.");
        Audio.play("heal");
        renderBattle();
        showFCT("battle-player", "+" + healAmt, "heal");
        checkBattleEnd() || enemyTurn();
      });
    } else if (skill.type === "buff") {
      animateCombat("player", "buff", function () {
        if (skill.buffType === "evasion") {
          playerBuffs.push({ stat: "evasion", amount: skill.buffAmount, turns: skill.buffDuration });
          addLog("You use " + skill.name + "! Evasion increased.");
        } else {
          playerBuffs.push({ stat: skill.buffType, amount: skill.buffAmount, turns: skill.buffDuration });
          addLog("You use " + skill.name + "! " + skill.buffType + " boosted.");
        }
        Audio.play("heal");
        renderBattle();
        showFCT("battle-player", skill.name, "buff");
        checkBattleEnd() || enemyTurn();
      });
    } else if (skill.type === "attack" || skill.type === "magic") {
      if (!target || target.hp <= 0) return;

      // Accuracy check for offensive skills
      var skillHitChance = Math.min(0.98, 0.75 + p.dexterity * 0.02);
      if (skill.intScaling) skillHitChance = Math.min(0.98, 0.80 + p.intelligence * 0.02);
      if (Math.random() > skillHitChance) {
        addLog("Your " + skill.name + " misses!");
        Audio.play("miss");
        animateCombat("player", "miss", function () {
          renderBattle();
          showFCT("battle-enemy-" + targetIndex, "MISS", "miss");
          checkBattleEnd() || enemyTurn();
        });
        return;
      }

      var atk = Player.getTotalAttack() + getBuffTotal(playerBuffs, "attack");
      if (skill.intScaling) {
        atk = p.intelligence + getBuffTotal(playerBuffs, "attack");
      }
      var def = target.defense + getBuffTotal(target.buffs, "defense");
      var hits = skill.hits || 1;
      var totalDmg = 0;

      for (var h = 0; h < hits; h++) {
        var dmg = Math.max(1, Math.floor(atk * atk / (atk + def) * skill.damageMultiplier * (1 + profBonus)) + Math.floor(Math.random() * 3));
        totalDmg += dmg;
      }

      var animType = skill.type === "magic" ? "magic" : "melee";
      var skillOpts = { abilityName: skill.name, effectType: skill.appliesEffect ? skill.appliesEffect.type : "" };
      animateCombat("player", animType, function () {
        target.hp -= totalDmg;
        addLog("You use " + skill.name + " dealing " + totalDmg + " damage!");
        Audio.play(skill.type === "magic" ? "magicCast" : "swordHit");

        // Apply effect (only if target still alive)
        if (target.hp > 0 && skill.appliesEffect) {
          var eff = skill.appliesEffect;
          if (eff.type === "stun" && Math.random() < (eff.chance || 1)) {
            target.effects.push({ type: "stun", turns: eff.turns });
            addLog(target.name + " is stunned!");
            Audio.play("statusStun");
            showFCT("battle-enemy-" + targetIndex, "STUNNED", "status");
          } else if (eff.type === "poison") {
            target.effects.push({ type: "poison", damage: eff.damage, turns: eff.turns });
            addLog(target.name + " is poisoned!");
            Audio.play("statusPoison");
            showFCT("battle-enemy-" + targetIndex, "POISONED", "status");
          }
        }
        if (target.hp <= 0) {
          handleEnemyDeath(targetIndex);
        }
        renderBattle();
        showFCT("battle-enemy-" + targetIndex, "-" + totalDmg, "damage");
        checkBattleEnd() || enemyTurn();
      }, undefined, skillOpts);
    } else {
      checkBattleEnd() || enemyTurn();
    }
  }

  function playerUsePotion(itemId) {
    if (enemies.length === 0 || animating) return;
    var item = Items.get(itemId);
    if (!item || item.type !== "potion") return;
    if (!Player.hasItem(itemId)) { addLog("You don't have that!"); return; }

    Player.removeItem(itemId);

    if (item.subtype === "health") {
      Player.heal(item.healAmount);
      addLog("You drink " + item.name + " and restore " + item.healAmount + " HP.");
      showFCT("battle-player", "+" + item.healAmount, "heal");
    } else if (item.subtype === "mana") {
      Player.restoreMana(item.manaAmount);
      addLog("You drink " + item.name + " and restore " + item.manaAmount + " MP.");
      showFCT("battle-player", "+" + item.manaAmount + " MP", "mana");
    } else if (item.subtype === "cleanse") {
      // Remove negative effects
      for (var c = playerEffects.length - 1; c >= 0; c--) {
        var etype = playerEffects[c].type;
        if (etype === "poison" || etype === "bleed" || etype === "burn" || etype === "fear" || etype === "stun") {
          playerEffects.splice(c, 1);
        }
      }
      addLog("You use " + item.name + " and cleanse all negative effects!");
      showFCT("battle-player", "CLEANSED", "buff");
    }
    Audio.play("potionDrink");
    renderBattle();
    enemyTurn();
  }

  function playerRun() {
    if (animating) return;
    if (isBossFight) {
      addLog("You can't run from a boss fight!");
      return;
    }
    // Check if any enemy has cornered tag
    for (var ci = 0; ci < enemies.length; ci++) {
      if (enemies[ci].hp > 0 && enemies[ci].cornered) {
        addLog("The enemy has you cornered! You can't escape!");
        return;
      }
    }
    var chance = 0.55 + (Player.get().dexterity * 0.03);
    // Harder to run from multiple enemies
    if (enemies.length > 1) {
      var aliveCount = 0;
      for (var ri = 0; ri < enemies.length; ri++) { if (enemies[ri].hp > 0) aliveCount++; }
      chance -= (aliveCount - 1) * 0.1;
    }
    // Pet escape boost
    var petPassive = (typeof Pets !== 'undefined') ? Pets.getActivePassive() : null;
    if (petPassive && petPassive.type === "escape-boost") {
      chance += petPassive.bonusChance;
    }
    if (Math.random() < chance) {
      addLog("You escaped!");
      Audio.play("runAway");
      endBattle(false);
    } else {
      addLog("Failed to escape!");
      Audio.play("miss");
      renderBattle();
      enemyTurn();
    }
  }

  /* ── Enemy Turn (multi-enemy sequential) ── */

  function enemyTurn() {
    turnCount++;
    var turnQueue = [];
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].hp > 0) turnQueue.push(i);
    }
    processEnemyQueue(turnQueue, 0);
  }

  function processEnemyQueue(queue, idx) {
    if (idx >= queue.length) {
      // All enemies have acted — tick player effects
      tickPlayerEffects();
      tickBuffs(playerBuffs);
      // Pet mana regen passive
      var petPassive = (typeof Pets !== 'undefined') ? Pets.getActivePassive() : null;
      if (petPassive && petPassive.type === "mana-regen") {
        var pp = Player.get();
        if (pp.mp < pp.maxMp) {
          Player.restoreMana(petPassive.amount);
          addLog(petPassive.message + " +" + petPassive.amount + " MP.");
        }
      }
      renderBattle();
      checkBattleEnd();
      return;
    }

    var ei = queue[idx];
    var e = enemies[ei];

    // Tick this enemy's status effects
    tickEffects(e.effects, e, true, ei);

    // Check if enemy died from DOT
    if (e.hp <= 0) {
      handleEnemyDeath(ei);
      renderBattle();
      if (allEnemiesDead()) { victory(); return; }
      processEnemyQueue(queue, idx + 1);
      return;
    }

    // Check stun
    var stunIdx = findEffect(e.effects, "stun");
    if (stunIdx !== -1) {
      addLog(e.name + " is stunned and can't act!");
      tickBuffs(e.buffs);
      renderBattle();
      processEnemyQueue(queue, idx + 1);
      return;
    }

    // Boss phase check (#2)
    if (e.phases && e.phases.length > bossPhaseIndex) {
      var hpRatio = e.hp / e.maxHp;
      var phase = e.phases[bossPhaseIndex];
      if (hpRatio <= phase.threshold) {
        addLog(phase.message);
        Audio.play("phaseTransition");
        if (phase.buffs) {
          if (phase.buffs.attack) e.attack += phase.buffs.attack;
          if (phase.buffs.defense) e.defense += phase.buffs.defense;
        }
        if (phase.ability) {
          e.abilities.push(phase.ability);
        }
        bossPhaseIndex++;
      }
    }

    // Pre-determine enemy action outcome
    var enemyHitChance = Math.min(0.95, 0.70 + e.attack * 0.03);
    var action = determineEnemyAction(e, enemyHitChance);

    // Pick animation type and element based on action
    var animType = "melee";
    var animOpts = null;
    if (action.type === "miss") animType = "melee";
    else if (action.type === "dodge") animType = "melee";
    else if (action.type === "buff-only") animType = "buff";
    else if (action.type === "effect-only") {
      animType = "magic";
      var ab = action.ability;
      animOpts = { abilityName: ab ? ab.name : "", effectType: action.effect ? action.effect.type : "" };
    }
    else if (action.type === "ability" && action.ability) {
      var ab2 = action.ability;
      if (ab2.multiplier) animType = "melee";
      // If ability applies an effect, use magic animation instead
      if (ab2.effect && !ab2.multiplier) animType = "magic";
      if (ab2.effect || ab2.name) {
        animOpts = { abilityName: ab2.name || "", effectType: ab2.effect ? ab2.effect.type : "" };
      }
    }

    // Small delay so player sees the turn transition
    setTimeout(function () {
      animateCombat("enemy", animType, function () {
        applyEnemyAction(action, e);
        tickBuffs(e.buffs);
        renderBattle();
        if (checkBattleEnd()) return;
        processEnemyQueue(queue, idx + 1);
      }, ei, animOpts);
    }, 300);
  }

  function determineEnemyAction(e, enemyHitChance) {
    // Check for special ability first
    if (e.abilities && e.abilities.length > 0) {
      for (var a = 0; a < e.abilities.length; a++) {
        var ab = e.abilities[a];
        if (Math.random() < ab.chance) {
          var result = { type: "ability", ability: ab, damage: 0, missed: false, dodged: false, buff: null, effect: null };

          if (ab.multiplier) {
            if (Math.random() > enemyHitChance) {
              result.missed = true;
            } else {
              var atk = e.attack + getBuffTotal(e.buffs, "attack");
              var def = Player.getTotalDefense() + getBuffTotal(playerBuffs, "defense");
              var dmg = Math.max(1, Math.floor(atk * atk / (atk + def) * ab.multiplier) + Math.floor(Math.random() * 2));
              var evasion = getBuffTotal(playerBuffs, "evasion");
              if (evasion > 0 && Math.random() * 100 < evasion) {
                result.dodged = true;
              } else {
                result.damage = dmg;
              }
            }
          }
          if (ab.buff) result.buff = ab.buff;
          if (ab.effect) result.effect = ab.effect;

          // Determine animation type
          if (!ab.multiplier && ab.buff && !ab.effect) result.type = "buff-only";
          else if (!ab.multiplier && ab.effect) result.type = "effect-only";

          return result;
        }
      }
    }

    // Normal attack
    if (Math.random() > enemyHitChance) {
      return { type: "miss" };
    }

    var atk = e.attack + getBuffTotal(e.buffs, "attack");
    var def = Player.getTotalDefense() + getBuffTotal(playerBuffs, "defense");
    var dmg = Math.max(1, Math.floor(atk * atk / (atk + def)) + Math.floor(Math.random() * 2));

    var evasion = getBuffTotal(playerBuffs, "evasion");
    var dexDodge = Player.get().dexterity * 1.5;
    var totalDodge = evasion + dexDodge;
    if (totalDodge > 0 && Math.random() * 100 < totalDodge) {
      return { type: "dodge" };
    }

    return { type: "hit", damage: dmg };
  }

  function applyEnemyAction(action, e) {
    if (action.type === "miss") {
      addLog(e.name + "'s attack misses!");
      Audio.play("miss");
      showFCT("battle-player", "MISS", "miss");
    } else if (action.type === "dodge") {
      addLog("You dodge " + e.name + "'s attack!");
      Audio.play("miss");
      showFCT("battle-player", "DODGE", "dodge");
    } else if (action.type === "hit") {
      Player.takeDamage(action.damage);
      addLog(e.name + " attacks for " + action.damage + " damage.");
      Audio.play("enemyHit");
      showFCT("battle-player", "-" + action.damage, "damage");
    } else if (action.type === "ability" || action.type === "buff-only" || action.type === "effect-only") {
      var ab = action.ability;
      if (ab.multiplier) {
        if (action.missed) {
          addLog(e.name + "'s " + ab.name + " misses!");
          Audio.play("miss");
          showFCT("battle-player", "MISS", "miss");
        } else if (action.dodged) {
          addLog("You dodge " + e.name + "'s " + ab.name + "!");
          Audio.play("miss");
          showFCT("battle-player", "DODGE", "dodge");
        } else if (action.damage > 0) {
          Player.takeDamage(action.damage);
          addLog(e.name + " uses " + ab.name + " for " + action.damage + " damage!");
          Audio.play("enemyHit");
          showFCT("battle-player", "-" + action.damage, "damage");
        }
      }
      if (action.buff) {
        e.buffs.push({ stat: action.buff.stat, amount: action.buff.amount, turns: action.buff.turns });
        addLog(e.name + " uses " + ab.name + "!");
      }
      if (action.effect) {
        applyEnemyEffect(action.effect, e.name);
      }
    }
  }

  /* ── Status Effect Helpers ── */

  function applyEnemyEffect(eff, sourceName) {
    var type = eff.type;
    playerEffects.push({ type: type, damage: eff.damage || 0, turns: eff.turns });
    var messages = {
      poison: " poisons you!",
      bleed: "'s attack causes bleeding!",
      burn: " sets you ablaze!",
      stun: " stuns you!",
      fear: " fills you with dread!",
      silence: " silences you!",
      weakness: " weakens your resolve!"
    };
    addLog(sourceName + (messages[type] || " afflicts you with " + type + "!"));
    showFCT("battle-player", type.toUpperCase(), "status");
    var sounds = {
      poison: "statusPoison", bleed: "statusBleed", burn: "statusBurn",
      stun: "statusStun", fear: "statusFear", silence: "statusSilence", weakness: "statusWeakness"
    };
    Audio.play(sounds[type] || "statusPoison");
  }

  function tickEffects(effects, target, isEnemy, enemyIdx) {
    for (var i = effects.length - 1; i >= 0; i--) {
      var e = effects[i];
      if ((e.type === "poison" || e.type === "bleed" || e.type === "burn") && e.damage) {
        target.hp -= e.damage;
        if (isEnemy) {
          addLog(target.name + " takes " + e.damage + " " + e.type + " damage.");
          showFCT("battle-enemy-" + (enemyIdx || 0), "-" + e.damage, "effect");
        }
      }
      e.turns--;
      if (e.turns <= 0) effects.splice(i, 1);
    }
  }

  function tickPlayerEffects() {
    for (var i = playerEffects.length - 1; i >= 0; i--) {
      var e = playerEffects[i];
      if ((e.type === "poison" || e.type === "bleed" || e.type === "burn") && e.damage) {
        Player.takeDamage(e.damage);
        addLog("You take " + e.damage + " " + e.type + " damage.");
        showFCT("battle-player", "-" + e.damage, "effect");
      }
      e.turns--;
      if (e.turns <= 0) playerEffects.splice(i, 1);
    }
  }

  function tickBuffs(buffs) {
    for (var i = buffs.length - 1; i >= 0; i--) {
      buffs[i].turns--;
      if (buffs[i].turns <= 0) buffs.splice(i, 1);
    }
  }

  function getBuffTotal(buffs, stat) {
    var total = 0;
    for (var i = 0; i < buffs.length; i++) {
      if (buffs[i].stat === stat) total += buffs[i].amount;
    }
    return total;
  }

  function findEffect(effects, type) {
    for (var i = 0; i < effects.length; i++) {
      if (effects[i].type === type) return i;
    }
    return -1;
  }

  /* ── Battle End ── */

  function checkBattleEnd() {
    if (enemies.length === 0) return true;
    if (allEnemiesDead()) {
      victory();
      return true;
    }
    if (Player.get().hp <= 0) {
      defeat();
      return true;
    }
    return false;
  }

  function victory() {
    var p = Player.get();
    var totalGold = 0;
    var totalXp = 0;
    var drops = [];

    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      var goldDrop = 0;
      if (e.gold) {
        goldDrop = e.gold[0] + Math.floor(Math.random() * (e.gold[1] - e.gold[0] + 1));
      }
      totalGold += goldDrop;
      totalXp += e.xp;

      // Loot drops
      if (e.loot) {
        for (var l = 0; l < e.loot.length; l++) {
          var lt = e.loot[l];
          if (Math.random() < lt.chance) {
            if (Player.addItem(lt.id)) {
              var item = Items.get(lt.id);
              drops.push(item ? item.name : lt.id);
            }
          }
        }
      }
    }

    // Pet gold-find and loot-find passives
    var petPassive = (typeof Pets !== 'undefined') ? Pets.getActivePassive() : null;
    if (petPassive && petPassive.type === "gold-find" && petPassive.bonusGold) {
      totalGold += petPassive.bonusGold;
      addLog(petPassive.message + " +" + petPassive.bonusGold + " bonus gold!");
    }
    if (petPassive && petPassive.type === "loot-find") {
      // Extra loot roll on each enemy
      for (var li = 0; li < enemies.length; li++) {
        var le = enemies[li];
        if (le.loot) {
          for (var ll = 0; ll < le.loot.length; ll++) {
            var llt = le.loot[ll];
            if (Math.random() < petPassive.chance) {
              if (Player.addItem(llt.id)) {
                var lItem = Items.get(llt.id);
                drops.push(lItem ? lItem.name : llt.id);
                addLog(petPassive.message);
              }
              break;
            }
          }
        }
      }
    }

    p.gold += totalGold;
    var leveled = Player.addXp(totalXp);

    // Achievement checks (#19)
    checkBattleAchievements();

    addLog("Victory!");
    addLog("Gained " + totalXp + " XP and " + totalGold + " gold.");
    if (leveled) {
      addLog("LEVEL UP! You are now level " + p.level + "!");
      Audio.play("levelUp");
    } else {
      Audio.play("victory");
    }

    if (drops.length > 0) {
      addLog("Loot: " + drops.join(", "));
    }

    // Store reward data for the victory screen
    lastVictoryData = {
      enemyName: enemies.length === 1 ? enemies[0].name : enemies.length + " enemies",
      xp: totalXp,
      gold: totalGold,
      drops: drops,
      leveled: leveled,
      newLevel: p.level
    };

    renderBattle();
    showVictoryButtons();
  }

  function defeat() {
    addLog("You have been defeated...");
    Audio.play("defeat");
    renderBattle();
    showDefeatButtons();
  }

  function endBattle(won) {
    // Clear floating combat text
    var fctLayer = document.getElementById("fct-layer");
    if (fctLayer) fctLayer.innerHTML = "";
    var cb = onVictoryCallback;
    enemies = [];
    targetIndex = 0;
    onVictoryCallback = null;
    if (cb && won) {
      cb();
    } else if (!won && !isDungeonBattle) {
      World.navigate("elderbrook");
    }
  }

  /* ── Rendering ── */

  function renderBattle() {
    var p = Player.get();
    var container = document.getElementById("battle-content");
    if (!container || enemies.length === 0) return;

    // Keep sidebar HP/MP in sync during battle
    if (typeof UI !== "undefined" && UI.updateSidebars) UI.updateSidebars();

    var html = '';

    // Encounter modifier banner
    if (encounterMod && encounterMod.label) {
      html += '<div class="encounter-mod-banner encounter-mod-' + encounterMod.id + '">' + encounterMod.label + '</div>';
    }

    // Battle scene: player bottom-left, enemies top-right
    html += '<div class="battle-scene">';

    // Player (left side)
    var playerStatusClasses = '';
    for (var psi = 0; psi < playerEffects.length; psi++) {
      playerStatusClasses += ' status-visual-' + playerEffects[psi].type;
    }
    html += '<div class="battle-player' + playerStatusClasses + '" id="battle-player">';
    html += '<img class="battle-portrait" src="' + Player.getPortrait() + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">';
    // Active pet portrait
    if (p.activePet && typeof Pets !== 'undefined') {
      var battlePet = Pets.get(p.activePet);
      if (battlePet) {
        html += '<img class="battle-pet-portrait" src="' + battlePet.portrait + '" alt="' + battlePet.name + '" onerror="this.style.display=\'none\'">';
      }
    }
    html += '<div class="battle-player-info">';
    html += '<div class="battle-name">' + p.name + ' (Lv.' + p.level + ')</div>';
    html += '<div class="battle-hp-bar"><div class="hp-fill player-hp" style="width:' + (p.hp / p.maxHp * 100) + '%"></div></div>';
    html += '<div class="battle-hp-text">HP: ' + p.hp + '/' + p.maxHp + '</div>';
    html += '<div class="battle-mp-bar"><div class="mp-fill" style="width:' + (p.mp / p.maxMp * 100) + '%"></div></div>';
    html += '<div class="battle-mp-text">MP: ' + p.mp + '/' + p.maxMp + '</div>';
    // Player effects
    if (playerEffects.length > 0) {
      html += '<div class="battle-effects">';
      for (var pe = 0; pe < playerEffects.length; pe++) {
        html += '<span class="effect-tag effect-' + playerEffects[pe].type + '">' + playerEffects[pe].type + ' (' + playerEffects[pe].turns + ')</span>';
      }
      html += '</div>';
    }
    html += '</div></div>';

    // Enemies (right side)
    html += '<div class="battle-enemies-group">';
    for (var ei = 0; ei < enemies.length; ei++) {
      var e = enemies[ei];
      var isDead = e.hp <= 0;
      var isTarget = (ei === targetIndex);
      var enemyClass = 'battle-enemy' + (isTarget ? ' battle-target-selected' : '') + (isDead ? ' battle-enemy-dead' : '');
      // Add status visual classes for active effects
      if (e.effects && e.effects.length > 0 && !isDead) {
        for (var esi = 0; esi < e.effects.length; esi++) {
          enemyClass += ' status-visual-' + e.effects[esi].type;
        }
      }
      html += '<div class="' + enemyClass + '" id="battle-enemy-' + ei + '"' + (!isDead ? ' data-action="battle-target" data-index="' + ei + '"' : '') + '>';
      html += '<img class="battle-portrait" src="' + (e.portrait || '') + '" alt="' + e.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="battle-enemy-info">';
      html += '<div class="battle-name">' + e.name + (e.isBoss ? ' (BOSS)' : '') + '</div>';
      html += '<div class="battle-hp-bar"><div class="hp-fill enemy-hp" style="width:' + Math.max(0, (e.hp / e.maxHp) * 100) + '%"></div></div>';
      html += '<div class="battle-hp-text">' + Math.max(0, e.hp) + ' HP</div>';
      // Enemy effects
      if (e.effects && e.effects.length > 0) {
        html += '<div class="battle-effects">';
        for (var ef = 0; ef < e.effects.length; ef++) {
          html += '<span class="effect-tag effect-' + e.effects[ef].type + '">' + e.effects[ef].type + ' (' + e.effects[ef].turns + ')</span>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }
    html += '</div>';

    html += '</div>'; // end battle-scene

    // Battle log (minimal — FCT is primary feedback)
    html += '<div class="battle-log">';
    var logStart = Math.max(0, battleLog.length - 3);
    for (var b = logStart; b < battleLog.length; b++) {
      html += '<div>' + battleLog[b] + '</div>';
    }
    html += '</div>';

    // Action buttons (only if battle still active)
    var anyAlive = !allEnemiesDead();
    if (anyAlive && p.hp > 0) {
      html += '<div class="battle-actions">';
      html += '<button class="btn" data-action="battle-attack">Attack</button>';
      html += '<button class="btn" data-action="battle-run"' + (isBossFight ? ' disabled' : '') + '>Run</button>';

      // Skills
      var availSkills = Skills.getAvailable(p.learnedSkills);
      if (availSkills.length > 0) {
        html += '<div class="battle-skills">';
        for (var s = 0; s < availSkills.length; s++) {
          var sk = availSkills[s];
          var onCooldown = sk.cooldown && skillCooldowns[sk.id] && skillCooldowns[sk.id] > turnCount;
          var cdLeft = onCooldown ? (skillCooldowns[sk.id] - turnCount) : 0;
          var canUse = p.mp >= sk.mpCost && !onCooldown;
          var label = sk.name + (onCooldown ? ' (' + cdLeft + ')' : '');
          var tip = sk.description + ' (MP: ' + sk.mpCost + ')' + (onCooldown ? ' — Cooldown: ' + cdLeft + ' turn' + (cdLeft > 1 ? 's' : '') : '');
          html += '<button class="btn btn-small battle-skill-btn" data-action="battle-skill" data-skill="' + sk.id + '"' + (canUse ? '' : ' disabled') + ' title="' + tip + '">' + label + '</button>';
        }
        html += '</div>';
      }

      // Potions in inventory
      var potions = [];
      for (var pi = 0; pi < p.inventory.length; pi++) {
        var pItem = Items.get(p.inventory[pi]);
        if (pItem && pItem.type === "potion") {
          var exists = false;
          for (var cp = 0; cp < potions.length; cp++) {
            if (potions[cp].id === pItem.id) { potions[cp].count++; exists = true; break; }
          }
          if (!exists) potions.push({ id: pItem.id, name: pItem.name, count: 1 });
        }
      }
      if (potions.length > 0) {
        html += '<div class="battle-potions">';
        for (var pp = 0; pp < potions.length; pp++) {
          html += '<button class="btn btn-small" data-action="battle-potion" data-item="' + potions[pp].id + '">' + potions[pp].name + ' x' + potions[pp].count + '</button>';
        }
        html += '</div>';
      }

      html += '</div>';
    }

    container.innerHTML = html;
  }

  function showVictoryButtons() {
    var container = document.getElementById("battle-content");
    if (!container) return;
    var html = container.innerHTML;
    var d = lastVictoryData || { enemyName: "Enemy", xp: 0, gold: 0, drops: [], leveled: false, newLevel: 1 };

    html += '<div class="battle-result">';
    html += '<div class="victory-overlay">';
    html += '<h3>Victory!</h3>';
    html += '<div class="victory-rewards">';
    html += '<div class="victory-stat"><span class="victory-stat-value xp-value">+' + d.xp + '</span><span class="victory-stat-label">XP</span></div>';
    html += '<div class="victory-stat"><span class="victory-stat-value gold-value">+' + d.gold + '</span><span class="victory-stat-label">Gold</span></div>';
    html += '</div>';
    if (d.leveled) {
      html += '<div class="victory-levelup">Level Up! Now Level ' + d.newLevel + '</div>';
    }
    if (d.drops.length > 0) {
      html += '<div class="victory-loot">';
      for (var i = 0; i < d.drops.length; i++) {
        html += '<div class="victory-loot-item">' + d.drops[i] + '</div>';
      }
      html += '</div>';
    }
    html += '<button class="btn" data-action="battle-continue">Continue</button>';
    html += '</div></div>';
    container.innerHTML = html;
  }

  function showDefeatButtons() {
    var container = document.getElementById("battle-content");
    if (!container) return;
    var html = container.innerHTML;
    html += '<div class="battle-result">';
    html += '<div class="defeat-text">You have fallen in battle.</div>';
    html += '<button class="btn" data-action="battle-revive">Return to Town</button>';
    html += '</div>';
    container.innerHTML = html;
  }

  function addLog(msg) {
    // Color-code log entries (#10)
    var cls = "log-entry";
    if (msg.indexOf("Critical") !== -1) cls += " log-crit";
    else if (msg.indexOf("defeated") !== -1 || msg.indexOf("LEVEL UP") !== -1 || msg.indexOf("Victory") !== -1) cls += " log-victory";
    else if (msg.indexOf("poison") !== -1 || msg.indexOf("bleed") !== -1 || msg.indexOf("burn") !== -1) cls += " log-effect";
    else if (msg.indexOf("fear") !== -1 || msg.indexOf("stun") !== -1 || msg.indexOf("silence") !== -1 || msg.indexOf("weakness") !== -1) cls += " log-debuff";
    else if (msg.indexOf("dodge") !== -1 || msg.indexOf("miss") !== -1) cls += " log-miss";
    else if (msg.indexOf("restore") !== -1 || msg.indexOf("heal") !== -1) cls += " log-heal";
    battleLog.push('<span class="' + cls + '">' + msg + '</span>');

    // Low HP warning (#10)
    var p = Player.get();
    if (p && p.hp > 0 && p.hp <= p.maxHp * 0.25 && !allEnemiesDead()) {
      if (battleLog[battleLog.length - 1].indexOf("LOW HP") === -1) {
        battleLog.push('<span class="log-entry log-danger">LOW HP WARNING!</span>');
        Audio.play("lowHp");
      }
    }
  }

  function continueAfterVictory() {
    endBattle(true);
  }

  function reviveAtTown() {
    var p = Player.get();
    p.hp = Math.floor(p.maxHp * 0.3);
    p.mp = Math.floor(p.maxMp * 0.3);
    var goldLoss = Math.floor(p.gold * 0.1);
    p.gold = Math.max(0, p.gold - goldLoss);
    Player.setFlag("hasBeenDefeated");
    enemies = [];
    targetIndex = 0;
    onVictoryCallback = null;
    World.navigate("elderbrook");
  }

  function checkBattleAchievements() {
    var p = Player.get();
    // First Blood
    var totalKills = 0;
    for (var k in p.bestiary) totalKills += p.bestiary[k];
    if (totalKills >= 1 && Player.unlockAchievement("first-blood")) {
      Audio.play("achievement");
    }
    // Goblin Hunter (20 goblin kills total)
    var goblinKills = 0;
    var goblinIds = ["goblin-scout", "goblin-sneak", "goblin-raider", "goblin-archer", "goblin-guard", "goblin-shaman", "goblin-brute"];
    for (var g = 0; g < goblinIds.length; g++) {
      goblinKills += p.bestiary[goblinIds[g]] || 0;
    }
    if (goblinKills >= 20 && Player.unlockAchievement("goblin-hunter")) {
      Audio.play("achievement");
    }
    // Wolf Slayer
    var wolfKills = (p.bestiary["wolf"] || 0) + (p.bestiary["wolf-pack"] || 0);
    if (wolfKills >= 10 && Player.unlockAchievement("wolf-slayer")) {
      Audio.play("achievement");
    }
    // Chief Slain + Unbroken
    for (var bi = 0; bi < enemies.length; bi++) {
      if (enemies[bi].id === "goblin-chief-grisk") {
        if (Player.unlockAchievement("chief-slain")) {
          Audio.play("achievement");
        }
        if (!Player.hasFlag("hasBeenDefeated") && Player.unlockAchievement("no-defeat")) {
          Audio.play("achievement");
        }
      }
    }
    // Bestiary discovery
    var discovered = Object.keys(p.bestiary).length;
    if (discovered >= 5 && Player.unlockAchievement("bestiary-novice")) {
      Audio.play("achievement");
    }
    var allEnemyIds = Enemies.getAllIds();
    if (discovered >= allEnemyIds.length && Player.unlockAchievement("bestiary-master")) {
      Audio.play("achievement");
    }
  }

  function getEnemy() { return enemies.length > 0 ? enemies[targetIndex] : null; }

  return {
    start: start,
    startBoss: startBoss,
    startDungeonEnemy: startDungeonEnemy,
    startExploration: startExploration,
    playerAttack: playerAttack,
    playerUseSkill: playerUseSkill,
    playerUsePotion: playerUsePotion,
    playerRun: playerRun,
    continueAfterVictory: continueAfterVictory,
    reviveAtTown: reviveAtTown,
    renderBattle: renderBattle,
    getEnemy: getEnemy,
    selectTarget: selectTarget
  };
})();
