// townUI.js
// Town screen interactions and navigation

import { GameState } from './gameState.js';
import { Battle } from './battleSystem.js';
import { renderTownSummary, showModalMessage, showScreen, renderCharacterDetails, showConfirmDialog, renderNPCScreenShell, renderWorldMapScreenShell } from './renderer.js';
import { listNPCs, openNPCInteraction } from './npcs.js';
import { getShopItems, attemptPurchase } from './shops.js';
import { getRandomForestEnemy, getRandomCaveEnemy, getRandomElfGroveEnemy, getRandomRuinsEnemy, getRandomDepthsEnemy, getCaveWyrm, getShadowPortalGroup, getElderDeepWyrm } from './enemies.js';
import { canEnterZone } from './zones.js';
import { renderQuestBoard } from './quests.js';
import { canCraft, attemptCraft, getRecipes } from './crafting.js';
import { getTalentsFor, requirementsMet } from './talents.js';
import { playSoundHeal, playSoundZoneTransition, playAmbience, updateAudioSettings, AudioSettings } from './audio.js';
import { openWorldMap } from './worldMapUI.js';

export const TownUI = {
  init() {
    // Development grid toggle - works globally
    const toggleGridBtn = document.querySelector('#toggle-grid');
    const gridOverlay = document.querySelector('#village-grid');
    
    if (toggleGridBtn && gridOverlay) {
      // Remove old listener to avoid duplicates
      const newBtn = toggleGridBtn.cloneNode(true);
      toggleGridBtn.parentNode.replaceChild(newBtn, toggleGridBtn);
      
      newBtn.addEventListener('click', () => {
        if (gridOverlay.classList.contains('active')) {
          gridOverlay.classList.remove('active');
          gridOverlay.innerHTML = '';
        } else {
          gridOverlay.classList.add('active');
          // Create 20x15 grid (300 cells)
          gridOverlay.innerHTML = '';
          for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 20; col++) {
              const cell = document.createElement('div');
              cell.className = 'grid-cell';
              const cellNum = row * 20 + col + 1;
              cell.textContent = cellNum;
              cell.title = `Cell ${cellNum} (Row ${row + 1}, Col ${col + 1})`;
              gridOverlay.appendChild(cell);
            }
          }
        }
      });
    }

    // Hotspots container: create if missing
    // Ensure global hotspots container exists (aligned to viewport like the grid)
    let hotspots = document.querySelector('.village-hotspots');
    if (!hotspots) {
      hotspots = document.createElement('div');
      hotspots.className = 'village-hotspots';
      document.body.appendChild(hotspots);
    }
    // Clear any previous hotspots when entering town
    hotspots.innerHTML = '';

    // Helper: add hotspot by percentage box
    function addHotspot({ leftPct, topPct, widthPct, heightPct, label, onClick }) {
      const host = document.querySelector('.village-hotspots');
      if (!host) return;
      const el = document.createElement('div');
      el.className = 'hotspot';
      el.style.left = leftPct + '%';
      el.style.top = topPct + '%';
      el.style.width = widthPct + '%';
      el.style.height = heightPct + '%';
      if (label) el.setAttribute('data-label', label);
      el.addEventListener('click', (e) => { e.stopPropagation(); onClick?.(); });
      host.appendChild(el);
    }

    // Helper: convert 20x15 grid ranges to percentage box
    // Assumes grid cells numbered left-to-right, top-to-bottom.
    // Provide min/max col (1-20) and row (1-15).
    function gridBoxToPercents({ colMin, colMax, rowMin, rowMax }) {
      const cols = 20, rows = 15;
      const leftPct = ((colMin - 1) / cols) * 100;
      const topPct = ((rowMin - 1) / rows) * 100;
      const widthPct = ((colMax - colMin + 1) / cols) * 100;
      const heightPct = ((rowMax - rowMin + 1) / rows) * 100;
      return { leftPct, topPct, widthPct, heightPct };
    }

    // Helper: derive box from 4 cell IDs (any order)
    function idsToGridBox(cellIds) {
      const cols = 20;
      const rows = 15;
      const toRC = (id) => ({
        row: Math.floor((id - 1) / cols) + 1,
        col: ((id - 1) % cols) + 1,
      });
      const pts = cellIds.map(toRC);
      const rowMin = Math.max(1, Math.min(...pts.map(p => p.row)));
      const rowMax = Math.min(rows, Math.max(...pts.map(p => p.row)));
      const colMin = Math.max(1, Math.min(...pts.map(p => p.col)));
      const colMax = Math.min(cols, Math.max(...pts.map(p => p.col)));
      return { colMin, colMax, rowMin, rowMax };
    }

    // Example wiring (will replace with your provided coordinates):
    // Potion Shop hotspot from provided cell IDs:
    // Height cells 255 to 95; Width cells 238 to 98
    // Derived rows/cols (20 columns grid):
    // 255 -> row 13, col 15; 95 -> row 5, col 15; 238 -> row 12, col 18; 98 -> row 5, col 18
    // Final box: rows 5-13, cols 15-18
    addHotspot({
      ...gridBoxToPercents({ colMin: 15, colMax: 18, rowMin: 5, rowMax: 13 }),
      label: 'Potion Shop',
      onClick: () => this.openShop('potion')
    });

    // Weapon Shop hotspot (IDs: 233, 83, 86, 226)
    let weaponBox = idsToGridBox([233, 83, 86, 226]);
    // Adjust width to use cells 223–226 (columns 3–6)
    weaponBox.colMin = 3; // 223 → col 3
    weaponBox.colMax = 6; // 226 → col 6
    addHotspot({
      ...gridBoxToPercents(weaponBox),
      label: 'Weapon Shop',
      onClick: () => this.openShop('weapon')
    });

    // Armor Shop hotspot (IDs: 228, 148, 150, 230)
    const armorBox = idsToGridBox([228, 148, 150, 230]);
    addHotspot({
      ...gridBoxToPercents(armorBox),
      label: 'Armor Shop',
      onClick: () => this.openShop('armor')
    });

    // Diagonal arrow at grid cell 294 (pointing down-right) -> enters Forest screen
    const arrowBox = idsToGridBox([294]);
    const arrowCoords = gridBoxToPercents(arrowBox);
    const arrowEl = document.createElement('div');
    arrowEl.className = 'village-arrow';
    arrowEl.style.left = arrowCoords.leftPct + '%';
    arrowEl.style.top = arrowCoords.topPct + '%';
    // Down-right (image faces down) rotate -45deg
    arrowEl.style.transform = 'rotate(-45deg)';
    arrowEl.addEventListener('mouseenter', () => {
      arrowEl.style.transform = 'rotate(-45deg) scale(1.1)';
    });
    arrowEl.addEventListener('mouseleave', () => {
      arrowEl.style.transform = 'rotate(-45deg)';
    });
    arrowEl.addEventListener('click', () => {
      this.openForest();
    });
    document.body.appendChild(arrowEl);

    // Village building interactions
    const weaponShopBuilding = document.querySelector('#village-weapon-shop');
    weaponShopBuilding?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openShop('weapon');
    });

    const armorShopBuilding = document.querySelector('#village-armor-shop');
    armorShopBuilding?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openShop('armor');
    });

    const innBuilding = document.querySelector('#village-inn');
    innBuilding?.addEventListener('click', () => {
      const p = GameState.player;
      if (!p) { showModalMessage('Create a character first.'); return; }
      const cost = 15;
      if (p.gold >= cost) {
        p.gold -= cost;
        p.hp = p.maxHp;
        p.mp = p.maxMp;
        playSoundHeal();
        renderTownSummary(p);
        showModalMessage('You rest at the inn. HP and MP fully restored.');
      } else {
        showModalMessage("You can't afford to stay at the inn (15g needed).");
      }
    });

    const trainingBuilding = document.querySelector('#village-training');
    trainingBuilding?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openTraining();
    });

    const questBuilding = document.querySelector('#village-quests');
    questBuilding?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openQuestBoard();
    });

    const craftingBuilding = document.querySelector('#village-crafting');
    craftingBuilding?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openCrafting();
    });

    const npcsBuilding = document.querySelector('#village-npcs');
    npcsBuilding?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
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

    const relicShopBuilding = document.querySelector('#village-relic-shop');
    relicShopBuilding?.addEventListener('click', () => {
      const p = GameState.player;
      if (!p) { showModalMessage('Create a character first.'); return; }
      if (!p.flags?.boss_cave_wyrm_defeated) {
        showModalMessage('The Relic Merchant only appears after the Cave Wyrm is defeated.');
        return;
      }
      this.openShop('relic');
    });

    // Zone exploration buttons
    const fightBtn = document.querySelector('#btn-fight');
    fightBtn?.addEventListener('click', () => {
      this.openForest();
    });

    const caveBtn = document.querySelector('#btn-cave');
    caveBtn?.addEventListener('click', () => {
      const p = GameState.player;
      if (!p) { showModalMessage('Create a character first.'); return; }
      if (!canEnterZone('cave', p)) { showModalMessage('The cave is too dangerous. Meet requirements first.'); return; }
      const enemy = getRandomCaveEnemy(p.level);
      import('./renderer.js').then(r => r.setBackground('cave'));
      playAmbience('cave');
      playSoundZoneTransition();
      Battle.startBattle(enemy, 'cave');
      this.configureSkillButtons();
      const backBtn = document.querySelector('#btn-back-to-town');
      backBtn?.classList.add('hidden');
    });

    const groveBtn = document.querySelector('#btn-elf-grove');
    groveBtn?.addEventListener('click', () => {
      const p = GameState.player;
      if (!p) { showModalMessage('Create a character first.'); return; }
      if (!canEnterZone('grove', p)) { showModalMessage('The Elf Grove is mystically sealed. Meet requirements first.'); return; }
      const enemy = getRandomElfGroveEnemy(p.level);
      import('./renderer.js').then(r => r.setBackground('grove'));
      playAmbience('grove');
      playSoundZoneTransition();
      Battle.startBattle(enemy, 'grove');
      this.configureSkillButtons();
      const backBtn = document.querySelector('#btn-back-to-town');
      backBtn?.classList.add('hidden');
    });

    // Legacy button handlers (kept for hidden buttons used by existing code)
    const weaponShopBtn = document.querySelector('#btn-weapon-shop');
    weaponShopBtn?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openShop('weapon');
    });

    const armorShopBtn = document.querySelector('#btn-armor-shop');
    armorShopBtn?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openShop('armor');
    });

    const trainBtn = document.querySelector('#btn-train');
    trainBtn?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openTraining();
    });

    const questsBtn = document.querySelector('#btn-quests');
    questsBtn?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openQuestBoard();
    });

    const restBtn = document.querySelector('#btn-rest');
    restBtn?.addEventListener('click', () => {
      const p = GameState.player;
      const cost = 15;
      if (p.gold >= cost) {
        p.gold -= cost;
        p.hp = p.maxHp;
        p.mp = p.maxMp;
        playSoundHeal();
        renderTownSummary(p);
        showModalMessage('You rest at the inn. HP and MP fully restored.');
      } else {
        showModalMessage("You can't afford to stay at the inn.");
      }
    });

    const npcsBtn = document.querySelector('#btn-npcs');
    npcsBtn?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
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

    const craftBtnLegacy = document.querySelector('#btn-crafting');
    craftBtnLegacy?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openCrafting();
    });

    // HUD buttons (always visible)
    const viewCharBtn = document.querySelector('#btn-view-char');
    viewCharBtn?.addEventListener('click', () => {
      const modal = document.querySelector('#screen-message');
      const host = modal?.querySelector('.panel');
      if (host) {
        host.innerHTML = '';
        host.appendChild(renderCharacterDetails());
        modal.classList.remove('hidden');
        const closeBtn = host.querySelector('#char-close');
        closeBtn?.addEventListener('click', () => {
          modal.classList.add('hidden');
          renderTownSummary(GameState.player);
        });
      }
    });

    const saveBtn = document.querySelector('#btn-save');
    saveBtn?.addEventListener('click', () => {
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

    const loadBtn = document.querySelector('#btn-load');
    loadBtn?.addEventListener('click', () => {
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

    const talentsBtn = document.querySelector('#btn-talents');
    talentsBtn?.addEventListener('click', () => {
      if (!GameState.player) { showModalMessage('Create a character first.'); return; }
      this.openTalents();
    });

    const settingsBtn = document.querySelector('#btn-settings');
    settingsBtn?.addEventListener('click', () => {
      this.openSettings();
    });

    // World map button setup
    renderWorldMapScreenShell();
    let btnMap = document.getElementById('btn-world-map');
    if (!btnMap) {
      const villageZones = document.querySelector('.village-zones');
      if (villageZones) {
        btnMap = document.createElement('button');
        btnMap.id = 'btn-world-map';
        btnMap.className = 'zone-btn';
        btnMap.textContent = '🗺️ World Map';
        villageZones.querySelector('.zone-buttons')?.appendChild(btnMap);
      }
    }
    btnMap?.addEventListener('click', () => {
      openWorldMap();
    });

    const relicBtnLegacy = document.querySelector('#btn-relic-shop');
    relicBtnLegacy?.addEventListener('click', () => {
      const p = GameState.player;
      if (!p) { showModalMessage('Create a character first.'); return; }
      if (!p.flags?.boss_cave_wyrm_defeated) {
        showModalMessage('The Relic Merchant only appears after the Cave Wyrm is defeated.');
        return;
      }
      this.openShop('relic');
    });

    // Boss and endgame buttons
    const bossBtn = document.querySelector('#btn-boss');
    if (bossBtn) {
      bossBtn.addEventListener('click', () => {
        const p = GameState.player;
        if (!p) { showModalMessage('Create a character first.'); return; }
        const hasQuest = p.quests?.active?.some(q => q.id === 'cave_menace') || p.quests?.completed?.some(q => q.id === 'cave_menace');
        const meetsLevel = p.level >= 5;
        if (!meetsLevel || !hasQuest) {
          showModalMessage('You are not ready to face the Cave Wyrm. Reach level 5 and accept the Cave Menace quest.');
          return;
        }
        const enemy = getCaveWyrm();
        Battle.startBattle(enemy);
        this.configureSkillButtons();
        const backBtn = document.querySelector('#btn-back-to-town');
        backBtn?.classList.add('hidden');
      });
    }

    const ruinsBtn = document.querySelector('#btn-ruins');
    if (ruinsBtn) {
      ruinsBtn.addEventListener('click', () => {
        const p = GameState.player;
        if (!p) { showModalMessage('Create a character first.'); return; }
        if (!p.flags?.boss_cave_wyrm_defeated) {
          showModalMessage('The Ancient Ruins remain sealed until the Cave Wyrm falls.');
          return;
        }
        if (!canEnterZone('ruins', p)) {
          showModalMessage('The Ruins are sealed. Quest, item, and level needed.');
          return;
        }
        const enemy = getRandomRuinsEnemy(p.level);
        playSoundZoneTransition();
        playAmbience('ruins');
        import('./renderer.js').then(r => r.setBackground('ruins'));
        Battle.startBattle(enemy, 'ruins');
        this.configureSkillButtons();
        const backBtn = document.querySelector('#btn-back-to-town');
        backBtn?.classList.add('hidden');
      });
    }

    const depthsBtn = document.querySelector('#btn-depths');
    if (depthsBtn) {
      depthsBtn.addEventListener('click', () => {
        const p = GameState.player;
        if (!p) { showModalMessage('Create a character first.'); return; }
        if (!canEnterZone('depths', p)) {
          showModalMessage('The Depths sear with deadly heat. Meet all prior milestones first.');
          return;
        }
        const enemy = getRandomDepthsEnemy(p.level);
        playSoundZoneTransition();
        playAmbience('depths');
        import('./renderer.js').then(r => r.setBackground('depths'));
        Battle.startBattle(enemy, 'depths');
        this.configureSkillButtons();
        const backBtn = document.querySelector('#btn-back-to-town');
        backBtn?.classList.add('hidden');
      });
    }

    const elderBtn = document.querySelector('#btn-elder-wyrm');
    if (elderBtn) {
      elderBtn.addEventListener('click', () => {
        const p = GameState.player;
        if (!p) { showModalMessage('Create a character first.'); return; }
        if (p.flags?.boss_elder_wyrm_defeated) {
          showModalMessage('The Elder Deep sleeps. You have already claimed victory.');
          return;
        }
        if (!canEnterZone('depths', p)) {
          showModalMessage('The Depths sear with deadly heat. Meet all prior milestones first.');
          return;
        }
        const hasQuest = p.quests?.active?.some(q => q.id === 'elder_wyrm') || p.quests?.completed?.some(q => q.id === 'elder_wyrm');
        if (!hasQuest) {
          showModalMessage('A rumble below… Perhaps a final quest awaits on the board.');
          return;
        }
        const boss = getElderDeepWyrm();
        playSoundZoneTransition();
        playAmbience('depths');
        import('./renderer.js').then(r => r.setBackground('depths'));
        Battle.startBattle(boss, 'depths');
        this.configureSkillButtons();
        const backBtn = document.querySelector('#btn-back-to-town');
        backBtn?.classList.add('hidden');
      });
    }

    const portalBtn = document.querySelector('#btn-shadow-portal');
    if (portalBtn) {
      portalBtn.addEventListener('click', () => {
        const p = GameState.player;
        if (!p) { showModalMessage('Create a character first.'); return; }
        const ruinsQuestDone = p.quests?.completed?.some(q => q.id === 'ruins_cleanse');
        if (!ruinsQuestDone) {
          showModalMessage('A dark portal flickers... You sense you must cleanse the Ruins first.');
          return;
        }
        const group = getShadowPortalGroup(p.level);
        Battle.startGroupBattle(group);
        this.configureSkillButtons();
        const backBtn = document.querySelector('#btn-back-to-town');
        backBtn?.classList.add('hidden');
      });
    }

    const resetBtn = document.querySelector('#btn-reset');
    resetBtn?.addEventListener('click', () => {
      showConfirmDialog(
        'Reset game? All progress will be permanently lost!',
        () => {
          GameState.resetGame();
          window.location.reload();
        }
      );
    });

    // Battle action buttons
    const attackBtn = document.querySelector('#act-attack');
    attackBtn?.addEventListener('click', () => Battle.handlePlayerAttack());

    const runBtn = document.querySelector('#act-run');
    runBtn?.addEventListener('click', () => Battle.tryRun());

    // Skill buttons
    const skillButtons = document.querySelectorAll('.skill-button');
    skillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skillId;
        if (skillId) {
          Battle.useSkill(skillId);
        }
      });
    });

    const skill1Btn = document.querySelector('#act-skill1');
    skill1Btn?.addEventListener('click', () => this.usePrimarySkill());

    const skill2Btn = document.querySelector('#act-skill2');
    skill2Btn?.addEventListener('click', () => this.useSecondarySkill());

    const backToTownBtn = document.querySelector('#btn-back-to-town');
    backToTownBtn?.addEventListener('click', () => {
      Battle.isBattleActive = false;
      showScreen('screen-town');
      renderTownSummary(GameState.player);
      import('./renderer.js').then(r => r.setBackground('town'));
      playAmbience('town');
    });
  },

  showTown() {
    renderTownSummary(GameState.player);
    showScreen('screen-town');
    import('./renderer.js').then(r => r.setBackground('town'));
    // Ensure hotspots refresh only in town
    const host = document.querySelector('.village-hotspots');
    if (host) host.innerHTML = '';
    
    // Update village building visibility
    const relicShopBuilding = document.querySelector('#village-relic-shop');
    if (relicShopBuilding) {
      if (GameState.player?.flags?.boss_cave_wyrm_defeated) {
        relicShopBuilding.classList.remove('hidden');
      } else {
        relicShopBuilding.classList.add('hidden');
      }
    }
    
    // Update relic merchant button visibility (legacy)
    const relicBtn = document.querySelector('#btn-relic-shop');
    if (relicBtn) {
      if (GameState.player?.flags?.boss_cave_wyrm_defeated) {
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
    if (portalBtn) {
      const ruinsQuestDone = GameState.player?.quests?.completed?.some(q => q.id === 'ruins_cleanse');
      if (ruinsQuestDone) portalBtn.classList.remove('hidden');
      else portalBtn.classList.add('hidden');
    }
    
    // Update zone buttons lock state
    this.updateZoneButtons();
    
    // Ensure NPC screen exists for interactions
    renderNPCScreenShell();
    
    // Elder Wyrm button visibility
    const elderBtn = document.querySelector('#btn-elder-wyrm');
    if (elderBtn) {
      const p = GameState.player;
      const show = !!(p && canEnterZone('depths', p));
      elderBtn.classList.toggle('hidden', !show || p.flags?.boss_elder_wyrm_defeated);
    }
  },

  openShop(shopId) {
    console.log('[openShop] Opening shop:', shopId);
    const contentEl = document.querySelector('#shop-content');
    const items = getShopItems(shopId);
    
    // Set shop-specific backgrounds
    import('./renderer.js').then(r => {
      if (shopId === 'weapon') {
        console.log('[openShop] Setting weapon-shop background');
        r.setBackground('weapon-shop');
      } else if (shopId === 'armor') {
        console.log('[openShop] Setting armor-shop background');
        r.setBackground('armor-shop');
      } else if (shopId === 'potion') {
        console.log('[openShop] Setting potion-shop background');
        r.setBackground('potion-shop');
      } else {
        console.log('[openShop] Setting default town background');
        r.setBackground('town');
      }
      console.log('[openShop] Body classes after setBackground:', document.body.className);
    });
    // Hide town hotspots and village arrows when entering a shop screen
    const host = document.querySelector('.village-hotspots');
    if (host) host.innerHTML = '';
    document.querySelectorAll('.village-arrow').forEach(el => el.remove());
    
    const p = GameState.player;

    // Clear content initially; shop clerk will be a hotspot
    contentEl.innerHTML = '';
    
    // Helper: add shop NPC hotspot
    function addShopHotspot({ leftPct, topPct, widthPct, heightPct, label, onClick }) {
      const container = document.querySelector('.village-hotspots');
      if (!container) return;
      const el = document.createElement('div');
      el.className = 'hotspot';
      el.style.left = leftPct + '%';
      el.style.top = topPct + '%';
      el.style.width = widthPct + '%';
      el.style.height = heightPct + '%';
      if (label) el.setAttribute('data-label', label);
      el.addEventListener('click', (e) => { e.stopPropagation(); onClick?.(); });
      container.appendChild(el);
    }
    
    // Helper: derive box from 4 cell IDs
    function idsToGridBox(cellIds) {
      const cols = 20, rows = 15;
      const toRC = (id) => ({
        row: Math.floor((id - 1) / cols) + 1,
        col: ((id - 1) % cols) + 1,
      });
      const pts = cellIds.map(toRC);
      const rowMin = Math.max(1, Math.min(...pts.map(p => p.row)));
      const rowMax = Math.min(rows, Math.max(...pts.map(p => p.row)));
      const colMin = Math.max(1, Math.min(...pts.map(p => p.col)));
      const colMax = Math.min(cols, Math.max(...pts.map(p => p.col)));
      return { colMin, colMax, rowMin, rowMax };
    }
    
    function gridBoxToPercents({ colMin, colMax, rowMin, rowMax }) {
      const cols = 20, rows = 15;
      const leftPct = ((colMin - 1) / cols) * 100;
      const topPct = ((rowMin - 1) / rows) * 100;
      const widthPct = ((colMax - colMin + 1) / cols) * 100;
      const heightPct = ((rowMax - rowMin + 1) / rows) * 100;
      return { leftPct, topPct, widthPct, heightPct };
    }
    
    // Add shop clerk hotspot based on shopId
    // Create NPC sprites for each shop
    if (shopId === 'weapon') {
      const clerkBox = idsToGridBox([251, 111]);
      const coords = gridBoxToPercents(clerkBox);
      const npcEl = document.createElement('div');
      npcEl.className = 'npc-shopkeeper';
      npcEl.style.left = coords.leftPct + '%';
      npcEl.style.top = coords.topPct + '%';
      npcEl.addEventListener('click', () => renderItems());
      document.body.appendChild(npcEl);
      addShopHotspot({
        ...coords,
        label: 'Shopkeeper',
        onClick: () => renderItems()
      });
    } else if (shopId === 'armor') {
      const clerkBox = idsToGridBox([217, 117]);
      const coords = gridBoxToPercents(clerkBox);
      const npcEl = document.createElement('div');
      npcEl.className = 'npc-shopkeeper';
      npcEl.style.left = coords.leftPct + '%';
      npcEl.style.top = coords.topPct + '%';
      npcEl.addEventListener('click', () => renderItems());
      document.body.appendChild(npcEl);
      addShopHotspot({
        ...coords,
        label: 'Shopkeeper',
        onClick: () => renderItems()
      });
    } else if (shopId === 'potion') {
      const clerkBox = idsToGridBox([255, 175]);
      const coords = gridBoxToPercents(clerkBox);
      const npcEl = document.createElement('div');
      npcEl.className = 'npc-shopkeeper';
      npcEl.style.left = coords.leftPct + '%';
      npcEl.style.top = coords.topPct + '%';
      npcEl.addEventListener('click', () => renderItems());
      document.body.appendChild(npcEl);
      addShopHotspot({
        ...coords,
        label: 'Shopkeeper',
        onClick: () => renderItems()
      });
    }

    const renderItems = () => {
      contentEl.innerHTML = '';
      items.forEach(it => {
        const row = document.createElement('div');
        const canAfford = p.gold >= it.price;
        const canEquip = !it.elfOnly || p.race === 'Elf';
        const alreadyOwned = p.inventory.includes(it.id) || 
          (it.type === 'weapon' && p.equipment.weapon?.id === it.id) ||
          (it.type === 'armor' && p.equipment.armor?.id === it.id);
        
        row.className = 'row shop-item item-tooltip';
        if (!canAfford) row.classList.add('unaffordable');
        if (alreadyOwned) row.classList.add('owned');
        const tooltip = this.generateItemTooltip(it);
        row.setAttribute('data-tooltip', tooltip);
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
            showModalMessage(`Purchased ${it.name}.`, () => renderItems());
            renderTownSummary(GameState.player);
          }
        });
        row.appendChild(buy);
        contentEl.appendChild(row);
      });
    };
    
    // Wire back arrow to return to village
    const backArrow = document.querySelector('#shop-back-arrow');
    if (backArrow) {
      backArrow.onclick = () => {
        // Remove NPC sprite
        document.querySelectorAll('.npc-shopkeeper').forEach(el => el.remove());
        this.showTown();
        this.init();
      };
    }
    
    // Wire grid toggle for shop screen
    const shopGridBtn = document.querySelector('#shop-toggle-grid');
    const gridOverlay = document.querySelector('#village-grid');
    if (shopGridBtn && gridOverlay) {
      shopGridBtn.onclick = () => {
        if (gridOverlay.classList.contains('active')) {
          gridOverlay.classList.remove('active');
          gridOverlay.innerHTML = '';
          shopGridBtn.textContent = 'Grid';
        } else {
          gridOverlay.classList.add('active');
          shopGridBtn.textContent = 'Hide Grid';
          gridOverlay.innerHTML = '';
          for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 20; col++) {
              const cell = document.createElement('div');
              cell.className = 'grid-cell';
              const cellNum = row * 20 + col + 1;
              cell.textContent = cellNum;
              cell.title = `Cell ${cellNum} (Row ${row + 1}, Col ${col + 1})`;
              gridOverlay.appendChild(cell);
            }
          }
        }
      };
    }
    
    showScreen('screen-shop');
  },

  /**
   * Enter the Forest room. 30% chance to immediately start a battle.
   */
  openForest() {
    const p = GameState.player;
    if (!p) { showModalMessage('Create a character first.'); return; }
    // Hide any village hotspots/arrows so they don't appear in the forest screen
    const hotspotContainer = document.querySelector('.village-hotspots');
    if (hotspotContainer) {
      hotspotContainer.innerHTML = '';
      hotspotContainer.style.display = 'none';
    }
    document.querySelectorAll('.village-arrow').forEach(el => el.remove());
    import('./renderer.js').then(r => r.setBackground('forest'));
    showScreen('screen-forest');
    playAmbience('forest');
    const forestStatus = document.querySelector('#forest-status');
    // Roll for encounter
    if (Math.random() < 0.3) {
      forestStatus.textContent = 'A hostile presence emerges!';
      playSoundZoneTransition();
      const enemy = getRandomForestEnemy(p.level);
      Battle.startBattle(enemy, 'forest');
      this.configureSkillButtons();
      const backBtn = document.querySelector('#btn-back-to-town');
      backBtn?.classList.add('hidden');
    } else {
      forestStatus.textContent = 'The forest is calm. (No encounter this time)';
      // Wire back arrow
      const backArrow = document.querySelector('#forest-back-arrow');
      if (backArrow) {
        backArrow.onclick = () => {
          import('./renderer.js').then(r => r.setBackground('town'));
          this.showTown();
          // Restore hotspot container visibility when returning
          const hc = document.querySelector('.village-hotspots');
          if (hc) hc.style.display = '';
          this.init();
        };
      }
    }
  },

  updateZoneButtons() {
    const p = GameState.player;
    if (!p) return;
    const entries = [
      { sel: '#btn-fight', key: 'forest' },
      { sel: '#btn-cave', key: 'cave' },
      { sel: '#btn-elf-grove', key: 'grove' },
      { sel: '#btn-ruins', key: 'ruins' },
      { sel: '#btn-depths', key: 'depths' }
    ];
    entries.forEach(({ sel, key }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const ok = canEnterZone(key, p);
      el.disabled = !ok;
      el.classList.toggle('talent-locked', !ok);
      if (!ok) el.title = 'Locked: meet level/quest/item requirements';
      else el.removeAttribute('title');
    });
  },

  openCrafting() {
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
      row.innerHTML = `<div><strong>${r.name}</strong> — ${r.description}<br/>Requires: ${needs} • Output: ${r.output} ${r.minLevel ? `• Min Lv ${r.minLevel}` : ''}</div>`;
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

  openTraining() {
    const contentEl = document.querySelector('#training-content');
    const exitBtn = document.querySelector('#training-exit');
    const options = [
      { id: 'train_str', label: 'Train Strength (+1 STR, 30g)', stat: 'strength', cost: 30 },
      { id: 'train_dex', label: 'Train Dexterity (+1 DEX, 30g)', stat: 'dexterity', cost: 30 },
      { id: 'train_int', label: 'Train Intelligence (+1 INT, 30g)', stat: 'intelligence', cost: 30 },
      { id: 'train_vit', label: 'Train Vitality (+1 VIT, 30g)', stat: 'vitality', cost: 30 },
    ];
    contentEl.innerHTML = '';
    options.forEach(op => {
      const btn = document.createElement('button');
      btn.textContent = op.label;
      btn.addEventListener('click', () => {
        const p = GameState.player;
        if (p.gold >= op.cost) {
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
  },

  openQuestBoard() {
    const contentEl = document.querySelector('#quests-content');
    const exitBtn = document.querySelector('#quests-exit');
    contentEl.innerHTML = '';
    contentEl.appendChild(renderQuestBoard());
    import('./renderer.js').then(r => r.setBackground('questboard'));
    exitBtn.onclick = () => { this.showTown(); };
    showScreen('screen-quests');
  },

  configureSkillButtons() {
    // Legacy function - now using skill bar with fixed skills
    // Skills are now hardcoded in HTML with MP costs
    // This function kept for compatibility but does nothing
    return;
  },

  usePrimarySkill() {
    const btn = document.querySelector('#act-skill1');
    const skill = btn?.dataset.skill;
    if (skill) Battle.handlePlayerSkill(skill);
  },

  useSecondarySkill() {
    const btn = document.querySelector('#act-skill2');
    const skill = btn?.dataset.skill;
    if (skill) Battle.handlePlayerSkill(skill);
  },

  speedLabel(cd) {
    if (!cd) return '';
    if (cd <= 1.5) return 'Fast';
    if (cd <= 2.1) return 'Normal';
    return 'Slow';
  },

  getItemRarity(item) {
    if (!item || !item.price) return 'common';
    if (item.price >= 600) return 'legendary';
    if (item.price >= 400) return 'epic';
    if (item.price >= 150) return 'rare';
    if (item.price >= 50) return 'uncommon';
    return 'common';
  },

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

  openTalents() {
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
        if (t.requires?.requiredTalentIds) {
          t.requires.requiredTalentIds.forEach(rid => {
            if (!(p.spentTalents || []).includes(rid)) unmetReqs.push(`Talent ${rid}`);
          });
        }
        
        const reqText = unmetReqs.length ? `<div class="talent-requirements">Requires: ${unmetReqs.join(', ')}</div>` : '';
        row.innerHTML = `<div class="talent-info"><div class="talent-name"><strong>${t.name}</strong></div><div>${t.description} (Cost: 1) ${owned ? '• Taken' : ''}</div>${reqText}</div>`;
        
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
    const classTabBtn = document.querySelector('#talents-tab-class');
    const raceTabBtn = document.querySelector('#talents-tab-race');
    classTabBtn?.addEventListener('click', () => renderList(tabs.class));
    raceTabBtn?.addEventListener('click', () => renderList(tabs.race));
    renderList(tabs.class);
    backBtn.onclick = () => { this.showTown(); };
    showScreen('screen-talents');
  },

  openSettings() {
    const soundCheckbox = document.querySelector('#setting-sound');
    const musicCheckbox = document.querySelector('#setting-music');
    const soundVolumeSlider = document.querySelector('#setting-sound-volume');
    const soundVolumeDisplay = document.querySelector('#sound-volume-display');
    const animationsCheckbox = document.querySelector('#setting-animations');
    const backBtn = document.querySelector('#settings-back');
    
    // Load current settings
    soundCheckbox.checked = AudioSettings.soundEnabled;
    musicCheckbox.checked = AudioSettings.musicEnabled;
    soundVolumeSlider.value = AudioSettings.soundVolume * 100;
    soundVolumeDisplay.textContent = Math.round(AudioSettings.soundVolume * 100) + '%';
    
    // Add event listeners
    soundCheckbox.addEventListener('change', () => {
      updateAudioSettings({ soundEnabled: soundCheckbox.checked });
    });
    
    musicCheckbox.addEventListener('change', () => {
      updateAudioSettings({ musicEnabled: musicCheckbox.checked });
    });
    
    soundVolumeSlider.addEventListener('input', () => {
      const volume = soundVolumeSlider.value / 100;
      soundVolumeDisplay.textContent = soundVolumeSlider.value + '%';
      updateAudioSettings({ soundVolume: volume });
    });
    
    animationsCheckbox.addEventListener('change', () => {
      document.body.classList.toggle('disable-animations', !animationsCheckbox.checked);
    });
    
    backBtn.onclick = () => { 
      this.showTown(); 
    };
    
    showScreen('screen-settings');
  }
};
