// townUI.js
// Town screen interactions and navigation

import { GameState } from './gameState.js';
import { Battle } from './battleSystem.js';
import { renderTownSummary, showModalMessage, showScreen, renderCharacterDetails, showConfirmDialog, renderNPCScreenShell, renderWorldMapScreenShell } from './renderer.js';
import { listNPCs, openNPCInteraction } from './npcs.js';
import { getShopItems, attemptPurchase } from './shops.js';
import { getRandomForestEnemy, getRandomCaveEnemy, getRandomElfGroveEnemy, getRandomRuinsEnemy, getRandomDepthsEnemy, getCaveWyrm, getShadowPortalGroup } from './enemies.js';
import { getElderDeepWyrm } from './enemies.js';
import { canEnterZone } from './zones.js';
import { playSoundZoneTransition, playAmbience } from './audio.js';
import { getRecipes, attemptCraft, canCraft } from './crafting.js';
import { getTalentsFor, requirementsMet } from './talents.js';
import { renderQuestBoard } from './quests.js';
import { playSoundHeal, playSoundPurchase } from './audio.js';
import { openWorldMap } from './worldMapUI.js';

export const TownUI = {
  init() {
    // Town buttons
    document.querySelector('#btn-fight').addEventListener('click', () => {
      const p = GameState.player; if (!p) { showModalMessage('Create a character first.'); return; }
      if (!canEnterZone('forest', p)) { showModalMessage('The forest awaits, but you are not yet ready.'); return; }
      const enemy = getRandomForestEnemy(p.level);
      playSoundZoneTransition(); playAmbience('forest');
      Battle.startBattle(enemy, 'forest');
      this.configureSkillButtons();
      document.querySelector('#btn-back-to-town').classList.add('hidden');
    });
    document.querySelector('#btn-cave').addEventListener('click', () => {
      const p = GameState.player; if (!p) { showModalMessage('Create a character first.'); return; }
      if (!canEnterZone('cave', p)) { showModalMessage('The Hollow Cave remains perilous. Meet its entry requirements first.'); return; }
      const enemy = getRandomCaveEnemy(p.level);
      playSoundZoneTransition(); playAmbience('cave');
      Battle.startBattle(enemy, 'cave');
      this.configureSkillButtons();
      document.querySelector('#btn-back-to-town').classList.add('hidden');
    });
    const groveBtn = document.querySelector('#btn-elf-grove');
    if (groveBtn){
      groveBtn.addEventListener('click', () => {
        if (!GameState.player) { showModalMessage('Create a character first.'); return; }
        const p = GameState.player; if (!canEnterZone('grove', p)) { showModalMessage('Attune to the Grove first (quest & level).'); return; }
        const enemy = getRandomElfGroveEnemy(p.level);
        playSoundZoneTransition(); playAmbience('grove');
        Battle.startBattle(enemy, 'grove');
        this.configureSkillButtons();
        document.querySelector('#btn-back-to-town').classList.add('hidden');
      });
    }
    document.querySelector('#btn-weapon-shop').addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openShop('weapon');
    });
    document.querySelector('#btn-armor-shop').addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openShop('armor');
    });
    document.querySelector('#btn-train').addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openTraining();
    });
        document.querySelector('#btn-quests').addEventListener('click', () => {
          if (!GameState.player) { showModalMessage('Create a character first.'); return; }
          this.openQuestBoard();
        });
    document.querySelector('#btn-rest').addEventListener('click', () => {
      const p = GameState.player;
      const cost = 15;
      if (p.gold >= cost){
        p.gold -= cost;
        p.hp = p.maxHp; p.mp = p.maxMp; 
        playSoundHeal();
        renderTownSummary(p);
        showModalMessage('You rest at the inn. HP and MP fully restored.');
      } else {
        showModalMessage("You can't afford to stay at the inn.");
      }
    });
    document.querySelector('#btn-view-char').addEventListener('click', () => {
      const modal = document.querySelector('#screen-message');
      const host = modal.querySelector('.panel');
      host.innerHTML = '';
      host.appendChild(renderCharacterDetails());
      modal.classList.remove('hidden');
      host.querySelector('#char-close').addEventListener('click', () => {
        modal.classList.add('hidden');
        renderTownSummary(GameState.player);
      });
    });
    document.querySelector('#btn-save').addEventListener('click', () => {
      // Show confirmation if save exists
      if (GameState.hasSaveData()) {
        showConfirmDialog(
          'A save file already exists. Overwrite it?',
          () => {
            const ok = GameState.saveToLocalStorage();
            showModalMessage(ok ? 'Game saved.' : 'Save failed.');
          }
        );
      } else {
        const ok = GameState.saveToLocalStorage();
        showModalMessage(ok ? 'Game saved.' : 'Save failed.');
      }
    });
    document.querySelector('#btn-load').addEventListener('click', () => {
      showConfirmDialog(
        'Load saved game? Unsaved progress will be lost.',
        () => {
          const loaded = GameState.loadFromLocalStorage();
          if (loaded && GameState.player) {
            renderTownSummary(GameState.player);
            showScreen('screen-town');
            showModalMessage('Game loaded.');
          } else {
            showModalMessage('No save data found.');
          }
        }
      );
    });
    document.querySelector('#btn-talents').addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openTalents();
    });
    document.querySelector('#btn-settings')?.addEventListener('click', () => {
      this.openSettings();
    });
    // Optional NPCs button
    const npcsBtn = document.querySelector('#btn-npcs');
    if (npcsBtn){
      npcsBtn.addEventListener('click', () => {
        const screen = renderNPCScreenShell();
        const host = screen.querySelector('#npc-content');
        const roster = listNPCs();
        host.innerHTML = '<h3>Village Folk</h3>' + roster.map(n => `<button class="npc-select" data-id="${n.id}">${n.name} — ${n.role}</button>`).join('');
        host.querySelectorAll('.npc-select').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const npc = roster.find(r => r.id === id);
            openNPCInteraction(npc);
          });
        });
        showScreen('screen-npc');
      });
    }
    const craftBtn = document.querySelector('#btn-crafting');
    if (craftBtn){
      craftBtn.addEventListener('click', () => {
        if (!GameState.player) { showModalMessage('Create a character first.'); return; }
        this.openCrafting();
      });
    }
    // Ensure world map screen shell exists and wire optional button
    renderWorldMapScreenShell();
    let btnMap = document.getElementById('btn-world-map');
    if(!btnMap){
      const actions = document.getElementById('town-actions') || document.getElementById('screen-town');
      if (actions){
        btnMap = document.createElement('button');
        btnMap.id = 'btn-world-map';
        btnMap.textContent = 'World Map';
        actions.appendChild(btnMap);
      }
    }
    btnMap?.addEventListener('click', () => {
      openWorldMap();
    });
        // Boss access button (gated)
        const bossBtn = document.querySelector('#btn-boss');
        if (bossBtn){
          bossBtn.addEventListener('click', () => {
            const p = GameState.player;
            if (!p) { showModalMessage('Create a character first.'); return; }
            const hasQuest = p.quests?.active?.some(q => q.id === 'cave_menace') || p.quests?.completed?.some(q => q.id === 'cave_menace');
            const meetsLevel = p.level >= 5;
            if (!meetsLevel || !hasQuest){
              showModalMessage('You are not ready to face the Cave Wyrm. Reach level 5 and accept the Cave Menace quest.');
              return;
            }
            const enemy = getCaveWyrm();
            Battle.startBattle(enemy);
            this.configureSkillButtons();
            document.querySelector('#btn-back-to-town').classList.add('hidden');
          });
        }
        const relicBtn = document.querySelector('#btn-relic-shop');
        if (relicBtn){
          relicBtn.addEventListener('click', () => {
            const p = GameState.player;
            if (!p) { showModalMessage('Create a character first.'); return; }
            if (!p.flags?.boss_cave_wyrm_defeated){
              showModalMessage('The Relic Merchant only appears after the Cave Wyrm is defeated.');
              return;
            }
            this.openShop('relic');
          });
        }
        const ruinsBtn = document.querySelector('#btn-ruins');
        if (ruinsBtn){
          ruinsBtn.addEventListener('click', () => {
            const p = GameState.player;
            if (!p) { showModalMessage('Create a character first.'); return; }
            if (!p.flags?.boss_cave_wyrm_defeated){
              showModalMessage('The Ancient Ruins remain sealed until the Cave Wyrm falls.');
              return;
            }
            const p2 = GameState.player; if (!canEnterZone('ruins', p2)) { showModalMessage('The Ruins are sealed. Quest, item, and level needed.'); return; }
            const enemy = getRandomRuinsEnemy(p2.level);
            playSoundZoneTransition(); playAmbience('ruins');
            Battle.startBattle(enemy, 'ruins');
            this.configureSkillButtons();
            document.querySelector('#btn-back-to-town').classList.add('hidden');
          });
        }
        const depthsBtn = document.querySelector('#btn-depths');
        if (depthsBtn){
          depthsBtn.addEventListener('click', () => {
            const p = GameState.player; if (!p) { showModalMessage('Create a character first.'); return; }
            if (!canEnterZone('depths', p)) { showModalMessage('The Depths sear with deadly heat. Meet all prior milestones first.'); return; }
            const enemy = getRandomDepthsEnemy(p.level);
            playSoundZoneTransition(); playAmbience('depths');
            Battle.startBattle(enemy, 'depths');
            this.configureSkillButtons();
            document.querySelector('#btn-back-to-town').classList.add('hidden');
          });
        }
        const elderBtn = document.querySelector('#btn-elder-wyrm');
        if (elderBtn){
          elderBtn.addEventListener('click', () => {
            const p = GameState.player; if (!p) { showModalMessage('Create a character first.'); return; }
            if (p.flags?.boss_elder_wyrm_defeated){ showModalMessage('The Elder Deep sleeps. You have already claimed victory.'); return; }
            if (!canEnterZone('depths', p)) { showModalMessage('The Depths sear with deadly heat. Meet all prior milestones first.'); return; }
            const hasQuest = p.quests?.active?.some(q => q.id === 'elder_wyrm') || p.quests?.completed?.some(q => q.id === 'elder_wyrm');
            if (!hasQuest){ showModalMessage('A rumble below… Perhaps a final quest awaits on the board.'); return; }
            const boss = getElderDeepWyrm();
            playSoundZoneTransition(); playAmbience('depths');
            Battle.startBattle(boss, 'depths');
            this.configureSkillButtons();
            document.querySelector('#btn-back-to-town').classList.add('hidden');
          });
        }
        const portalBtn = document.querySelector('#btn-shadow-portal');
        if (portalBtn){
          portalBtn.addEventListener('click', () => {
            const p = GameState.player;
            if (!p) { showModalMessage('Create a character first.'); return; }
            // Gate: require ruins_cleanse quest completed
            const ruinsQuestDone = p.quests?.completed?.some(q => q.id === 'ruins_cleanse');
            if (!ruinsQuestDone){
              showModalMessage('A dark portal flickers... You sense you must cleanse the Ruins first.');
              return;
            }
            const group = getShadowPortalGroup(p.level);
            Battle.startGroupBattle(group);
            this.configureSkillButtons();
            document.querySelector('#btn-back-to-town').classList.add('hidden');
          });
        }
    document.querySelector('#btn-load').addEventListener('click', () => {
      const ok = GameState.loadFromLocalStorage();
      if (ok) { renderTownSummary(GameState.player); showScreen('screen-town'); }
      else showModalMessage('No valid save found.');
    });
    document.querySelector('#btn-reset').addEventListener('click', () => {
      showConfirmDialog(
        'Reset game? All progress will be permanently lost!',
        () => {
          GameState.resetGame();
          window.location.reload(); // Reload to restart from character creation
        }
      );
    });

    // Battle actions
    document.querySelector('#act-attack').addEventListener('click', () => Battle.handlePlayerAttack());
    document.querySelector('#act-run').addEventListener('click', () => Battle.tryRun());
    document.querySelector('#act-skill1').addEventListener('click', () => this.usePrimarySkill());
    document.querySelector('#act-skill2').addEventListener('click', () => this.useSecondarySkill());
    document.querySelector('#btn-back-to-town').addEventListener('click', () => {
      // Back to town disables battle
      Battle.isBattleActive = false;
      showScreen('screen-town');
      renderTownSummary(GameState.player);
      // Set town background
      import('./renderer.js').then(r => r.setBackground('town'));
      // Town ambience (placeholder)
      playAmbience('town');
    });
  },

  showTown() {
    renderTownSummary(GameState.player);
    showScreen('screen-town');
    // Update relic merchant visibility (hide if not unlocked)
    const relicBtn = document.querySelector('#btn-relic-shop');
    if (relicBtn){
      if (GameState.player?.flags?.boss_cave_wyrm_defeated){
        relicBtn.classList.remove('hidden');
          const ruinsBtn = document.querySelector('#btn-ruins');
          ruinsBtn?.classList.remove('hidden');
      } else {
        relicBtn.classList.add('hidden');
          const ruinsBtn = document.querySelector('#btn-ruins');
          ruinsBtn?.classList.add('hidden');
      }
    }
    // Shadow Portal button visibility
    const portalBtn = document.querySelector('#btn-shadow-portal');
    if (portalBtn){
      const ruinsQuestDone = GameState.player?.quests?.completed?.some(q => q.id === 'ruins_cleanse');
      if (ruinsQuestDone) portalBtn.classList.remove('hidden'); else portalBtn.classList.add('hidden');
    }
    // Update zone buttons lock state
    this.updateZoneButtons();
    // Ensure NPC screen exists for interactions
    renderNPCScreenShell();
    // Elder Wyrm button visibility
    const elderBtn = document.querySelector('#btn-elder-wyrm');
    if (elderBtn){
      const p = GameState.player;
      const show = !!(p && canEnterZone('depths', p));
      elderBtn.classList.toggle('hidden', !show || p.flags?.boss_elder_wyrm_defeated);
    }
  },

  openShop(shopId){
    const titleEl = document.querySelector('#shop-title');
    const contentEl = document.querySelector('#shop-content');
    const exitBtn = document.querySelector('#shop-exit');
    titleEl.textContent = shopId === 'weapon' ? 'Weapon Shop' : (shopId === 'relic' ? 'Relic Merchant' : 'Armor Shop');
    const items = getShopItems(shopId);
    const p = GameState.player;
    
    contentEl.innerHTML = '';
    items.forEach(it => {
      const row = document.createElement('div');
      const canAfford = p.gold >= it.price;
      const canEquip = !it.elfOnly || p.race === 'Elf';
      const alreadyOwned = p.inventory.includes(it.id) || 
        (it.type === 'weapon' && p.equipment.weapon?.id === it.id) ||
        (it.type === 'armor' && p.equipment.armor?.id === it.id);
      
      // Apply CSS classes based on state
      row.className = 'row shop-item item-tooltip';
      if (!canAfford) row.classList.add('unaffordable');
      if (alreadyOwned) row.classList.add('owned');
      
      // Generate tooltip
      const tooltip = this.generateItemTooltip(it);
      row.setAttribute('data-tooltip', tooltip);
      
      // Determine rarity color
      const rarity = this.getItemRarity(it);
      
      const stats = it.type === 'weapon'
        ? `ATK +${it.attackBonus ?? 0}${it.magicBonus ? ` • MAG +${it.magicBonus}` : ''}`
        : `DEF +${it.defenseBonus ?? 0}`;
      
      const restriction = it.elfOnly ? ' [Elf Only]' : '';
      row.innerHTML = `<div class="item-${rarity}">${it.name} — ${stats}${restriction} • <span class="price">${it.price}g</span></div>`;
      
      const buy = document.createElement('button');
      buy.textContent = alreadyOwned ? 'Owned' : 'Buy';
      buy.disabled = !canAfford || !canEquip || alreadyOwned;
      
      buy.addEventListener('click', () => {
        if (attemptPurchase(it)) {
          showModalMessage(`Purchased ${it.name}.`, () => this.openShop(shopId));
          renderTownSummary(GameState.player);
        }
      });
      row.appendChild(buy);
      contentEl.appendChild(row);
    });
    exitBtn.onclick = () => { this.showTown(); };
    showScreen('screen-shop');
  },
  updateZoneButtons(){
    const p = GameState.player; if (!p) return;
    const entries = [
      { sel: '#btn-fight', key: 'forest' },
      { sel: '#btn-cave', key: 'cave' },
      { sel: '#btn-elf-grove', key: 'grove' },
      { sel: '#btn-ruins', key: 'ruins' },
      { sel: '#btn-depths', key: 'depths' }
    ];
    entries.forEach(({sel,key}) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const ok = canEnterZone(key, p);
      el.disabled = !ok;
      el.classList.toggle('talent-locked', !ok);
      if (!ok) el.title = 'Locked: meet level/quest/item requirements'; else el.removeAttribute('title');
    });
  },

  openCrafting(){
    const p = GameState.player;
    const contentEl = document.querySelector('#crafting-content');
    const exitBtn = document.querySelector('#crafting-exit');
    contentEl.innerHTML = '';
    const recipes = getRecipes();
    recipes.forEach(r => {
      const row = document.createElement('div');
      row.className = 'row';
      const needs = r.inputs.map(inp => inp.itemId).join(' + ');
      const can = canCraft(r, p);
      row.innerHTML = `<div><strong>${r.name}</strong> — ${r.description}<br/>Requires: ${needs} • Output: ${r.output} ${r.minLevel?`• Min Lv ${r.minLevel}`:''}</div>`;
      const btn = document.createElement('button');
      btn.textContent = can ? 'Craft' : 'Unavailable';
      btn.disabled = !can;
      btn.addEventListener('click', () => {
        const res = attemptCraft(r.id);
        showModalMessage(res.message, () => this.openCrafting());
        renderTownSummary(GameState.player);
      });
      row.appendChild(btn);
      if (!can) row.classList.add('talent-locked');
      contentEl.appendChild(row);
    });
    exitBtn.onclick = () => { this.showTown(); };
    showScreen('screen-crafting');
  },

  openTraining(){
    const contentEl = document.querySelector('#training-content');
    const exitBtn = document.querySelector('#training-exit');
    const options = [
      { id:'train_str', label:'Train Strength (+1 STR, 30g)', stat:'strength', cost:30 },
      { id:'train_dex', label:'Train Dexterity (+1 DEX, 30g)', stat:'dexterity', cost:30 },
      { id:'train_int', label:'Train Intelligence (+1 INT, 30g)', stat:'intelligence', cost:30 },
      { id:'train_vit', label:'Train Vitality (+1 VIT, 30g)', stat:'vitality', cost:30 },
    ];
    contentEl.innerHTML = '';
    options.forEach(op => {
      const btn = document.createElement('button');
      btn.textContent = op.label;
      btn.addEventListener('click', () => {
        const p = GameState.player;
        if (p.gold >= op.cost){
          p.gold -= op.cost;
          p.stats[op.stat] += 1;
          GameState.recalculateDerived();
          renderTownSummary(p);
          showModalMessage('Training successful!');
        } else {
          showModalMessage('Not enough gold to train.');
        }
      });
      contentEl.appendChild(btn);
    });
    exitBtn.onclick = () => { this.showTown(); };
    showScreen('screen-training');
  }
  ,
  openQuestBoard(){
    const contentEl = document.querySelector('#quests-content');
    const exitBtn = document.querySelector('#quests-exit');
    contentEl.innerHTML = '';
    contentEl.appendChild(renderQuestBoard());
    exitBtn.onclick = () => { this.showTown(); };
    showScreen('screen-quests');
  },

  configureSkillButtons(){
    const p = GameState.player;
    const s1 = document.querySelector('#act-skill1');
    const s2 = document.querySelector('#act-skill2');
    s1.classList.add('hidden'); s2.classList.add('hidden');
    if (p.class === 'Warrior'){
      s1.textContent = 'Power Strike'; s1.dataset.skill = 'power_strike'; s1.classList.remove('hidden');
    } else if (p.class === 'Mage'){
      s1.textContent = 'Firebolt'; s1.dataset.skill = 'firebolt'; s1.classList.remove('hidden');
    } else if (p.class === 'Rogue'){
      s1.textContent = 'Quick Jab'; s1.dataset.skill = 'quick_jab'; s1.classList.remove('hidden');
    }
    // Race-specific secondary skill (Elf only)
    if (p.race === 'Elf') {
      s2.textContent = 'Elf Precision'; s2.dataset.skill = 'elf_precision'; s2.classList.remove('hidden');
    }
    // Rogue poison secondary
    if (p.class === 'Rogue') {
      s2.textContent = 'Poison Dart'; s2.dataset.skill = 'poison_dart'; s2.classList.remove('hidden');
    }
  },

  usePrimarySkill(){
    const btn = document.querySelector('#act-skill1');
    const skill = btn?.dataset.skill;
    if (skill) Battle.handlePlayerSkill(skill);
  },
  useSecondarySkill(){
    const btn = document.querySelector('#act-skill2');
    const skill = btn?.dataset.skill;
    if (skill) Battle.handlePlayerSkill(skill);
  },

  speedLabel(cd){
    if (!cd) return '';
    if (cd <= 1.5) return 'Fast';
    if (cd <= 2.1) return 'Normal';
    return 'Slow';
  },

  /**
   * Get item rarity class based on price
   */
  getItemRarity(item) {
    if (!item || !item.price) return 'common';
    if (item.price >= 600) return 'legendary';
    if (item.price >= 400) return 'epic';
    if (item.price >= 150) return 'rare';
    if (item.price >= 50) return 'uncommon';
    return 'common';
  },

  /**
   * Generate item tooltip text
   */
  generateItemTooltip(item) {
    if (!item) return '';
    
    const lines = [];
    lines.push(item.name);
    
    if (item.type === 'weapon') {
      if (item.attackBonus) lines.push(`ATK +${item.attackBonus}`);
      if (item.magicBonus) lines.push(`MAG +${item.magicBonus}`);
      if (item.attackCooldownModifier) {
        const sign = item.attackCooldownModifier > 0 ? '+' : '';
        lines.push(`Speed ${sign}${item.attackCooldownModifier.toFixed(2)}s`);
      }
    } else if (item.type === 'armor') {
      if (item.defenseBonus) lines.push(`DEF +${item.defenseBonus}`);
    }
    
    if (item.price > 0) lines.push(`Value: ${item.price} gold`);
    if (item.elfOnly) lines.push('Elf Only');
    
    return lines.join('\n');
  },

  openTalents(){
    const p = GameState.player;
    const contentEl = document.querySelector('#talents-content');
    const backBtn = document.querySelector('#talents-back');
    const tabs = getTalentsFor(p);
    const renderList = (list) => {
      contentEl.innerHTML = '';
      list.forEach(t => {
        const row = document.createElement('div');
        row.className = 'row';
        const owned = (p.spentTalents || []).includes(t.id);
        const can = (p.talentPoints ?? 0) > 0 && !owned && requirementsMet(p, t);
        const unmetReqs = [];
        if (t.requires?.minLevel && p.level < t.requires.minLevel) unmetReqs.push(`Lvl ${t.requires.minLevel}`);
        if (t.requires?.requiredTalentIds){
          t.requires.requiredTalentIds.forEach(rid => { if (!(p.spentTalents||[]).includes(rid)) unmetReqs.push(`Talent ${rid}`); });
        }
        const reqText = unmetReqs.length ? `<div class="talent-requirements">Requires: ${unmetReqs.join(', ')}</div>` : '';
        row.innerHTML = `<div class="talent-info"><div class="talent-name"><strong>${t.name}</strong></div><div>${t.description} (Cost: 1) ${owned? '• Taken' : ''}</div>${reqText}</div>`;
        const btn = document.createElement('button');
        btn.textContent = owned ? 'Taken' : 'Spend';
        btn.disabled = !can;
        btn.addEventListener('click', () => {
          if ((p.talentPoints ?? 0) <= 0) return;
          if (owned) return;
          if (!requirementsMet(p, t)) return;
          p.talentPoints -= 1;
          p.spentTalents.push(t.id);
          GameState.recalculateDerived();
          renderTownSummary(p);
          this.openTalents();
        });
        row.appendChild(btn);
        if (!can && !owned) row.classList.add('talent-locked');
        if (owned) row.classList.add('talent-taken');
        btn.classList.add('talent-spend-btn');
        contentEl.appendChild(row);
      });
    };
    // Default to class talents; wire tabs
    document.querySelector('#talents-tab-class').onclick = () => renderList(tabs.class);
    document.querySelector('#talents-tab-race').onclick = () => renderList(tabs.race);
    renderList(tabs.class);
    backBtn.onclick = () => { this.showTown(); };
    showScreen('screen-talents');
  },

  /**
   * Open settings screen
   */
  openSettings() {
    const { updateAudioSettings, AudioSettings } = require('./audio.js');
    
    const soundCheckbox = document.querySelector('#setting-sound');
    const musicCheckbox = document.querySelector('#setting-music');
    const soundVolumeSlider = document.querySelector('#setting-sound-volume');
    const soundVolumeDisplay = document.querySelector('#sound-volume-display');
    const animationsCheckbox = document.querySelector('#setting-animations');
    const backBtn = document.querySelector('#settings-back');
    
    // Load current settings
    import('./audio.js').then(audio => {
      soundCheckbox.checked = audio.AudioSettings.soundEnabled;
      musicCheckbox.checked = audio.AudioSettings.musicEnabled;
      soundVolumeSlider.value = audio.AudioSettings.soundVolume * 100;
      soundVolumeDisplay.textContent = Math.round(audio.AudioSettings.soundVolume * 100) + '%';
      
      // Add event listeners
      soundCheckbox.addEventListener('change', () => {
        audio.updateAudioSettings({ soundEnabled: soundCheckbox.checked });
      });
      
      musicCheckbox.addEventListener('change', () => {
        audio.updateAudioSettings({ musicEnabled: musicCheckbox.checked });
      });
      
      soundVolumeSlider.addEventListener('input', () => {
        const volume = soundVolumeSlider.value / 100;
        soundVolumeDisplay.textContent = soundVolumeSlider.value + '%';
        audio.updateAudioSettings({ soundVolume: volume });
      });
      
      animationsCheckbox.addEventListener('change', () => {
        document.body.classList.toggle('disable-animations', !animationsCheckbox.checked);
      });
      
      backBtn.onclick = () => { 
        this.showTown(); 
      };
    });
    
    showScreen('screen-settings');
  }
};
