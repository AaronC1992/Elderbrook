// main.js
// Bootstraps the game, character creation, and screen routing

import { GameState } from './gameState.js';
import { TownUI } from './townUI.js';
import { showScreen, renderTownSummary, showModalMessage } from './renderer.js';

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

  let remaining = 5;
  const stats = { str: 1, dex: 1, int: 1, vit: 1 };

  function updateUI() {
    pointsEl.textContent = String(remaining);
    statEls.str.textContent = String(stats.str);
    statEls.dex.textContent = String(stats.dex);
    statEls.int.textContent = String(stats.int);
    statEls.vit.textContent = String(stats.vit);
  }

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

  confirmBtn.addEventListener('click', () => {
    let name = (nameInput.value || '').trim();
    if (!name) {
      // Auto-assign default if blank so clicking still proceeds
      name = 'Hero';
    }
    const classRadio = document.querySelector('input[name="cc-class"]:checked');
    const className = classRadio ? classRadio.value : 'Warrior';
    const raceRadio = document.querySelector('input[name="cc-race"]:checked');
    const race = raceRadio ? raceRadio.value : 'Human';
    GameState.createNewPlayerFromOptions({ name, className, stats, race });
    renderTownSummary(GameState.player);
    showScreen('screen-town');
    // Set town background
    import('./renderer.js').then(r => r.setBackground('town'));
    console.log('[ArcaneQuest] Character created:', GameState.player);
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
        showModalMessage('Game loaded successfully!');
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

// Global error handler to surface issues instead of blank screen
window.addEventListener('error', (e) => {
  import('./renderer.js').then(mod => {
    mod.showModalMessage('Runtime error: ' + e.message);
  }).catch(()=>{});
});
