// main.js
// Bootstraps the game, character creation, and screen routing

import { GameState } from './gameState.js';
import { TownUI } from './townUI.js';
import { showScreen, renderTownSummary, showModalMessage } from './renderer.js';

// Race data with lore, bonuses, and playstyle descriptions
// Can be extended in the future for race passives or unique abilities
// RACE_DATA is display + initial stat allocation only. Percentage / advanced bonuses listed in 'extra'
// are not yet mechanically applied. To extend: persist chosen race passives on GameState.player.passives
// and modify gameState.recalculateDerived() to include them.
const RACE_DATA = {
  Human: {
    lore: "Adaptive and determined, humans thrive through versatility.",
    bonuses: [{ stat: 'ANY', amount: 2 }], // +2 to one chosen stat (selected via UI)
    playstyle: "Balanced, customizable"
  },
  Elf: {
    lore: "Attuned to magic and nature, elves move with grace and intuition.",
    bonuses: [{ stat: 'INT', amount: 3 }],
    extra: ["+5% crit chance (future)", "Faster cooldown recovery (future)", "Grove synergy (future)"] ,
    playstyle: "Fast attackers, crit builds, grove synergy"
  },
  Beast: {
    lore: "Strong and unyielding, forged by instinct and battle.",
    bonuses: [{ stat: 'STR', amount: 4 }],
    extra: ["+8% max HP (future)"] ,
    playstyle: "Heavy hits, frontline tank"
  },
  Bug: {
    lore: "Quick and cunning, insects strike precisely and unpredictably.",
    bonuses: [{ stat: 'DEX', amount: 3 }],
    extra: ["Attack speed scaling (future)"] ,
    playstyle: "Momentum builds, crit cycling, status builds"
  },
  Undead: {
    lore: "Ancient remnants cursed to persist, neither truly alive nor dead.",
    bonuses: [{ stat: 'VIT', amount: 3 }],
    extra: ["+10% status resistance (future)"] ,
    playstyle: "Durable, attrition fighter"
  }
};

function handleCharacterCreation() {
  const nameInput = document.querySelector('#cc-name');
  const confirmBtn = document.querySelector('#cc-confirm');
  const pointsEl = document.querySelector('#cc-points');
  const statEls = {
    str: document.querySelector('#cc-str'),
    dex: document.querySelector('#cc-dex'),
    int: document.querySelector('#cc-int'),
    vit: document.querySelector('#cc-vit'),
  };
  const previewEls = {
    str: document.querySelector('#preview-str'),
    dex: document.querySelector('#preview-dex'),
    int: document.querySelector('#preview-int'),
    vit: document.querySelector('#preview-vit'),
  };
  const raceLoreEl = document.querySelector('#race-lore');
  const raceBonusesEl = document.querySelector('#race-bonuses');
  const racePlaystyleEl = document.querySelector('#race-playstyle');
  const raceCards = document.querySelectorAll('.race-card');

  let remaining = 5;
  const stats = { str: 1, dex: 1, int: 1, vit: 1 };
  let selectedRace = null; // Track selected race
  let humanBonusTarget = 'str'; // Which stat Human will allocate +2 to

  function updateUI() {
    pointsEl.textContent = String(remaining);
    statEls.str.textContent = String(stats.str);
    statEls.dex.textContent = String(stats.dex);
    statEls.int.textContent = String(stats.int);
    statEls.vit.textContent = String(stats.vit);
    
    // Update live preview with race bonuses
    updatePreview();
    
    // Enable confirm button only if race is selected
    confirmBtn.disabled = !selectedRace;
    if (!confirmBtn.disabled) confirmBtn.classList.add('enabled'); else confirmBtn.classList.remove('enabled');
  }

  function updatePreview() {
    const raceBonus = { str: 0, dex: 0, int: 0, vit: 0 };
    
    if (selectedRace && RACE_DATA[selectedRace]) {
      RACE_DATA[selectedRace].bonuses.forEach(bonus => {
        const statKey = bonus.stat.toLowerCase();
        if (statKey in raceBonus) {
          raceBonus[statKey] = bonus.amount;
        }
      });
    }
    
    previewEls.str.textContent = String(stats.str + raceBonus.str);
    previewEls.dex.textContent = String(stats.dex + raceBonus.dex);
    previewEls.int.textContent = String(stats.int + raceBonus.int);
    previewEls.vit.textContent = String(stats.vit + raceBonus.vit);
      if (selectedRace && RACE_DATA[selectedRace]) {
        RACE_DATA[selectedRace].bonuses.forEach(bonus => {
          if (bonus.stat === 'ANY') {
            raceBonus[humanBonusTarget] += bonus.amount; // Human flexible bonus
          } else {
            const key = bonus.stat.toLowerCase();
            if (key in raceBonus) raceBonus[key] += bonus.amount;
          }
        });
      }
  }

  function updateRaceDetails(race) {
    const data = RACE_DATA[race];
    if (!data) {
      raceLoreEl.textContent = 'Select a race to see details';
      raceBonusesEl.innerHTML = '';
      racePlaystyleEl.innerHTML = '';
      return;
    }
    
    raceLoreEl.textContent = data.lore;
    
    // Show stat bonuses
    if (data.bonuses.length > 0) {
      raceBonusesEl.innerHTML = '<strong>Stat Bonuses:</strong><br>' + 
        data.bonuses.map(b => `<div class="race-bonus-item">+${b.amount} ${b.stat}</div>`).join('');
    } else {
      raceBonusesEl.innerHTML = '<strong>Stat Bonuses:</strong><br><div class="race-bonus-item">Balanced (no bonuses)</div>';
    }
    
    // Show playstyle
    racePlaystyleEl.innerHTML = `<strong>Playstyle:</strong> ${data.playstyle}`;
      // Build bonuses list
      let bonusesMarkup = '<strong>Stat Bonuses:</strong><br>';
      if (data.bonuses.length === 0) {
        bonusesMarkup += '<div class="race-bonus-item">None</div>';
      } else {
        bonusesMarkup += data.bonuses.map(b => {
          if (b.stat === 'ANY') return `<div class="race-bonus-item">+${b.amount} to a chosen stat</div>`;
          return `<div class="race-bonus-item">+${b.amount} ${b.stat}</div>`;
        }).join('');
      }
      if (data.extra && data.extra.length) {
        bonusesMarkup += '<div style="margin-top:8px"><strong>Other Bonuses (future):</strong></div>' +
          data.extra.map(e => `<div class="race-bonus-item" style="color:#9aa3af">${e}</div>`).join('');
      }
      raceBonusesEl.innerHTML = bonusesMarkup;

      // Inject Human bonus selector if needed
      if (selectedRace === 'Human') {
        const selector = document.createElement('div');
        selector.className = 'human-bonus-selector';
        selector.innerHTML = '<div class="selector-label">Allocate +2 bonus to:</div>' +
          ['str','dex','int','vit'].map(stat => {
            const label = stat.toUpperCase();
            const active = humanBonusTarget === stat ? 'active' : '';
            return `<button type="button" data-human-bonus="${stat}" class="bonus-choice ${active}">${label}</button>`;
          }).join('');
        raceBonusesEl.appendChild(selector);
        selector.querySelectorAll('[data-human-bonus]').forEach(btn => {
          btn.addEventListener('click', () => {
            humanBonusTarget = btn.getAttribute('data-human-bonus');
            selector.querySelectorAll('.bonus-choice').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePreview();
          });
        });
      }
  }

  // Race card click handlers
  raceCards.forEach(card => {
    card.addEventListener('click', () => {
      const race = card.getAttribute('data-race');
      if (!race) return;
      
      // Update selected race
      selectedRace = race;
      
      // Update visual selection
      raceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      // Update race details panel
      updateRaceDetails(race);
      
      // Update preview and confirm button
      updateUI();
    });
  });

  // Auto-select default race (Human) so the Create button is visible immediately
  const defaultCard = Array.from(raceCards).find(c => c.getAttribute('data-race') === 'Human');
  if (defaultCard) {
    selectedRace = 'Human';
    defaultCard.classList.add('selected');
    updateRaceDetails('Human');
    updateUI();
  }

  // Enter key convenience to continue
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const screen = document.getElementById('screen-character-creation');
      if (screen && !screen.classList.contains('hidden') && !confirmBtn.disabled) {
        confirmBtn.click();
      }
    }
  });

  // Stat allocation buttons
  document.querySelectorAll('[data-stat]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-stat');
      const delta = parseInt(btn.getAttribute('data-delta') || '0', 10);
      if (!key || !(key in stats) || delta === 0) return;
      if (delta > 0) {
        if (remaining <= 0) return;
        stats[key] += 1;
        remaining -= 1;
      } else {
        if (stats[key] <= 1) return;
        stats[key] -= 1;
        remaining += 1;
      }
      updateUI();
    });
  });

  // Confirm character creation
  confirmBtn.addEventListener('click', () => {
    if (!selectedRace) {
      showModalMessage('Please select a race before creating your hero.');
      return;
    }
    
    let name = (nameInput.value || '').trim();
    if (!name) {
      name = 'Hero';
    }
    const classRadio = document.querySelector('input[name="cc-class"]:checked');
    const className = classRadio ? classRadio.value : 'Warrior';
    
    GameState.createNewPlayerFromOptions({ name, className, stats, race: selectedRace });
      GameState.createNewPlayerFromOptions({ name, className, stats, race: selectedRace, humanBonusTarget });
    renderTownSummary(GameState.player);
    showScreen('screen-town');
    import('./renderer.js').then(r => r.setBackground('town'));
    console.log('[Elderbrook] Character created:', GameState.player);
  });

  updateUI();
}

function boot() {
  TownUI.init();
  
  // Title screen handlers
  const newGameBtn = document.querySelector('#title-new-game');
  const loadGameBtn = document.querySelector('#title-load-game');
  
  newGameBtn?.addEventListener('click', () => {
    handleCharacterCreation();
    showScreen('screen-character-creation');
    import('./renderer.js').then(r => r.setBackground('town'));
  });
  
  loadGameBtn?.addEventListener('click', () => {
    let loaded = false;
    try {
      if (GameState.loadFromLocalStorage() && GameState.player && GameState.player.stats) {
        loaded = true;
        renderTownSummary(GameState.player);
        showScreen('screen-town');
        import('./renderer.js').then(r => r.setBackground('town'));
      }
    } catch (e) {
      console.error('Load error', e);
    }
    if (!loaded) {
      showModalMessage('No save data found. Please start a New Game.');
    }
  });
  
  // Show title screen on boot
  showScreen('screen-title');
  import('./renderer.js').then(r => r.setBackground('town'));
}

window.addEventListener('DOMContentLoaded', boot);

// Debug: verify critical asset paths to help diagnose 404 issues
function verifyCriticalAssets() {
  const assets = [
    // Normalize to lowercase filenames actually present in repo
    'backgrounds/elderbrook-village.jpg',
    'backgrounds/forest-1.png',
    'backgrounds/cave-1.png',
    'backgrounds/forest-boss.png',
    'backgrounds/elderbrook-village-weapon-shop.png',
    'backgrounds/elderbrook-village-armor-shop.png',
    'backgrounds/elderbrook-village-potion-shop.png',
    'backgrounds/elderbrook-village-questboard.png',
    'backgrounds/direction-arrow.png'
  ];
  assets.forEach(path => {
    fetch(path, { method: 'HEAD' }).then(r => {
      if (!r.ok) {
        console.warn('[Asset Missing]', path, 'status:', r.status);
      } else {
        console.log('[Asset OK]', path);
      }
    }).catch(err => {
      console.warn('[Asset Error]', path, err.message);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // defer a tick so boot can run first
  setTimeout(verifyCriticalAssets, 50);
});

// Global error handler to surface issues instead of blank screen
window.addEventListener('error', (e) => {
  import('./renderer.js').then(mod => {
    mod.showModalMessage('Runtime error: ' + e.message);
  }).catch(()=>{});
});
