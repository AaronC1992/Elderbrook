// renderer.js
// DOM helpers to keep UI manipulation tidy

import { GameState } from './gameState.js';
import { getItemById } from './items.js';
import { getTalentsFor, summarizeTakenTalents } from './talents.js';
import { setGroupTarget } from './battleSystem.js';
import { StatusDefinitions } from './statuses.js';

export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

const screens = [
  '#screen-character-creation', '#screen-town', '#screen-battle', '#screen-shop', 
  '#screen-training', '#screen-message', '#screen-settings'
];

/**
 * Set background based on location
 * @param {string} location - 'town', 'forest', 'cave', or null to clear
 */
export function setBackground(location) {
  const body = document.body;
  // Remove any existing bg-* classes dynamically
  body.classList.forEach(cls => {
    if (cls.startsWith('bg-')) body.classList.remove(cls);
  });
  if (location && typeof location === 'string') {
    body.classList.add(`bg-${location}`);
  }
}

/**
 * Show specified screen with fade-in animation
 */
export function showScreen(id){
  for (const s of screens){
    const el = qs(s);
    if (!el) continue;
    if (s === `#${id}`) el.classList.remove('hidden'); else el.classList.add('hidden');
  }
}

/**
 * Display modal message to user
 */
export function showModalMessage(text, onClose){
  const modal = qs('#screen-message');
  qs('#message-text').textContent = text;
  modal.classList.remove('hidden');
  const btn = qs('#message-ok');
  const handler = () => { modal.classList.add('hidden'); btn.removeEventListener('click', handler); onClose?.(); };
  btn.addEventListener('click', handler);
}

// NPC interaction screen rendering helpers
export function renderNPCScreenShell(){
  const existing = qs('#screen-npc');
  if (existing) return existing;
  const screen = document.createElement('div');
  screen.id = 'screen-npc';
  screen.className = 'screen hidden';
  screen.innerHTML = `
    <div class="panel">
      <div id="npc-content"></div>
      <div class="row right"><button id="npc-exit">Close</button></div>
    </div>`;
  document.body.appendChild(screen);
  qs('#npc-exit', screen).addEventListener('click', () => {
    showScreen('screen-town');
  });
  return screen;
}

export function renderWorldMapScreenShell(){
  let scr = document.getElementById('screen-world-map');
  if(!scr){
    scr = document.createElement('div');
    scr.id = 'screen-world-map';
    scr.innerHTML = `
      <div class="world-map-panel">
        <h2>World Map</h2>
        <div class="world-map-bg">
          <div id="world-map-nodes"></div>
          <div id="world-map-markers"></div>
        </div>
        <div class="world-map-actions" style="margin-top:10px;">
          <button id="world-map-close">Back to Town</button>
        </div>
      </div>`;
    document.getElementById('screens').appendChild(scr);
  }
}

/**
 * Display confirmation dialog with Yes/No buttons
 */
export function showConfirmDialog(text, onConfirm, onCancel) {
  const existing = qs('.confirm-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.innerHTML = `
    <div class="confirm-content">
      <p>${text}</p>
      <div class="confirm-buttons">
        <button id="confirm-no">Cancel</button>
        <button id="confirm-yes" class="primary">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  qs('#confirm-yes', modal).addEventListener('click', () => {
    modal.remove();
    onConfirm?.();
  });
  qs('#confirm-no', modal).addEventListener('click', () => {
    modal.remove();
    onCancel?.();
  });
}

// Listen for talent point gain to notify user in town
window.addEventListener('talentPointGained', (ev) => {
  showModalMessage(`You gained ${ev.detail?.amount ?? 1} Talent Point! Visit the Skill Tree in town to spend it.`);
});

/**
 * Trigger hit flash animation on element
 */
export function flashHit(element) {
  if (!element) return;
  element.classList.remove('hit-flash');
  void element.offsetWidth; // Force reflow
  element.classList.add('hit-flash');
  setTimeout(() => element.classList.remove('hit-flash'), 400);
}

/**
 * Trigger shake animation on element
 */
export function shakeElement(element) {
  if (!element) return;
  element.classList.remove('shake');
  void element.offsetWidth; // Force reflow
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 300);
}

/**
 * Screen warning flash (for big telegraphs)
 */
export function flashWarning(){
  const body = document.body;
  body.classList.remove('warning-flash');
  void body.offsetWidth;
  body.classList.add('warning-flash');
  setTimeout(() => body.classList.remove('warning-flash'), 600);
}

export function setBar(el, current, max){
  const pct = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
  el.style.width = `${(pct*100).toFixed(1)}%`;
}

/**
 * Add entry to battle log with optional styling class
 * @param {string} text - Log message
 * @param {string} type - Optional type for styling: damage, heal, crit, status, info, victory, defeat
 */
export function addBattleLogEntry(text, type = null){
  const list = qs('#battle-log');
  const li = document.createElement('li');
  li.textContent = text;
  if (type) li.classList.add(type);
  list.appendChild(li);
  list.scrollTop = list.scrollHeight;
}

/**
 * Spawn floating damage number above a combatant
 * @param {HTMLElement} host - The combatant element
 * @param {number} amount - Damage amount
 * @param {string} kind - 'normal' | 'crit' | 'block'
 */
export function spawnFloatingDamage(host, amount, kind='normal') {
  if (!host) return;
  const el = document.createElement('div');
  el.className = `floating-dmg ${kind}`;
  el.textContent = amount;
  host.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

/**
 * Render status effect icons with tooltips
 */
function renderStatusIcons(entity) {
  if (!entity?.statusEffects?.length) return '';
  
  return entity.statusEffects.map(s => {
    const def = StatusDefinitions[s.id];
    if (!def) return '';
    
    const tooltip = `${def.name}: ${s.remaining.toFixed(1)}s remaining`;
    const icon = def.name.charAt(0).toUpperCase();
    
    return `<span class="status-icon ${s.id}" data-tooltip="${tooltip}">${icon}</span>`;
  }).join('');
}

export function renderTownSummary(player){
  const root = qs('#town-player-summary');
  root.innerHTML = `
    <div><strong>${player.name}</strong> (Lv.${player.level} ${player.class}, ${player.race})</div>
    <div>HP ${player.hp}/${player.maxHp} • MP ${player.mp}/${player.maxMp}</div>
    <div>Gold: ${player.gold} • XP: ${player.xp}/${player.xpToNextLevel}</div>
  `;
  const speedRoot = qs('#town-speed-summary');
  if (speedRoot) {
    const bs = window.__battleStateHint; // optional last known cooldowns
    const pCd = bs?.playerCooldownMax ?? 0;
    const label = speedLabel(pCd);
    speedRoot.textContent = pCd ? `Attack speed: ${label} (${(1/pCd).toFixed(2)} APS)` : '';
  }
}

export function renderBattleScreen(state){
  const player = GameState.player;
  // Player section
  qs('#player-name').textContent = player.name;
  qs('#player-lv').textContent = `Lv.${player.level}`;
  setBar(qs('#player-hp-bar'), player.hp, player.maxHp);
  setBar(qs('#player-mp-bar'), player.mp, player.maxMp);
  
  const playerCdBar = qs('#player-cd-bar');
  setBar(playerCdBar, state.playerCooldownCurrent, state.playerCooldownMax);
  
  // Indicate when player attack is ready
  const actAttackBtn = qs('#act-attack');
  if (state.playerCooldownCurrent >= state.playerCooldownMax) {
    if (actAttackBtn) actAttackBtn.classList.add('cd-ready');
  setBar(qs('#player-cd-bar'), state.playerCooldownCurrent, state.playerCooldownMax);
  // Momentum bar (visualizes buildup)
  const momentumBar = qs('#player-momentum-bar');
  if (momentumBar) {
    const pct = Math.max(0, Math.min(1, state.playerMomentum / state.momentumMax));
    momentumBar.style.width = (pct * 100).toFixed(1) + '%';
  }
    if (actAttackBtn) actAttackBtn.classList.remove('cd-ready');
  }
  
  qs('#player-hp-text').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  qs('#player-mp-text').textContent = `${Math.ceil(player.mp)}/${player.maxMp}`;
  const critChance = ((0.05 + (player._modifiers?.critChanceBonus || 0))*100).toFixed(1);
  
  // Add player status icons
  const playerStatusHtml = renderStatusIcons(player);
  qs('#player-speed-text').innerHTML = `Speed: ${speedLabel(state.playerCooldownMax)} (${(1/state.playerCooldownMax).toFixed(2)} APS) • Crit: ${critChance}%
    <div class="status-effects">${playerStatusHtml}</div>`;

  const multiRoot = qs('#multi-enemies');
  if (state.isGroupBattle){
  qs('#player-speed-text').innerHTML = `Speed: ${speedLabel(state.playerCooldownMax)} (${(1/state.playerCooldownMax).toFixed(2)} APS) • Crit: ${critChance}% • Momentum: ${state.playerMomentum}/${state.momentumMax}
    <div class="status-effects">${playerStatusHtml}</div>`;
    multiRoot.innerHTML = '';
    state.currentEnemies.forEach((e, idx) => {
      const row = document.createElement('div');
      row.className = 'enemy-row';
      if (idx === state.currentTargetIndex) row.classList.add('active-target');
      const hpTxt = `${Math.max(0, Math.ceil(e.hp))}/${e.maxHp}`;
      
      // Show attack indicator if enemy is about to attack
      let attackIndicator = '';
      if (e.hp > 0 && e.cdCurrent !== undefined && e.cdMax !== undefined) {
        const timeToAttack = e.cdMax - e.cdCurrent;
        if (timeToAttack < 0.5) {
          attackIndicator = '<span class="enemy-attack-indicator">⚔️</span>';
        }
      }
      
      row.innerHTML = `<div class="er-name">${e.name} (Lv.${e.level}) ${attackIndicator}</div><div class="er-hp">${hpTxt}</div>`;
      row.addEventListener('click', () => setGroupTarget(idx));
      multiRoot.appendChild(row);
    });
    // Single enemy panel shows current target
    qs('#enemy-name').textContent = state.currentEnemy.name;
    qs('#enemy-lv').textContent = `Lv.${state.currentEnemy.level}`;
    setBar(qs('#enemy-hp-bar'), state.currentEnemy.hp, state.currentEnemy.maxHp);
    // For group battle we don't track unified enemy cooldown; hide bar value text
    setBar(qs('#enemy-cd-bar'), 0, 1); // empty
    qs('#enemy-hp-text').textContent = `${Math.ceil(state.currentEnemy.hp)}/${state.currentEnemy.maxHp}`;
    
    const enemyStatusHtml = renderStatusIcons(state.currentEnemy);
    qs('#enemy-speed-text').innerHTML = `Group Battle<div class="status-effects">${enemyStatusHtml}</div>`;
  } else {
    multiRoot.classList.add('hidden');
    // Legacy single enemy
    const e = state.currentEnemy;
    qs('#enemy-name').textContent = e.name;
    qs('#enemy-lv').textContent = `Lv.${e.level}`;
    setBar(qs('#enemy-hp-bar'), e.hp, e.maxHp);
    setBar(qs('#enemy-cd-bar'), state.enemyCooldownCurrent, state.enemyCooldownMax);
    qs('#enemy-hp-text').textContent = `${Math.ceil(e.hp)}/${e.maxHp}`;
    
    // Show attack countdown
    const timeToAttack = state.enemyCooldownMax - state.enemyCooldownCurrent;
    let attackWarning = '';
    if (timeToAttack < 0.5 && e.hp > 0) {
      attackWarning = '<span class="enemy-attack-indicator">Attacking!</span>';
    } else if (timeToAttack < 1.5 && e.hp > 0) {
      attackWarning = `<span style="color:#fbbf24; font-size:11px;">(${timeToAttack.toFixed(1)}s)</span>`;
    }
    
    const enemyStatusHtml = renderStatusIcons(e);
    qs('#enemy-speed-text').innerHTML = `Speed: ${speedLabel(state.enemyCooldownMax)} (${(1/state.enemyCooldownMax).toFixed(2)} APS) ${attackWarning}
      <div class="status-effects">${enemyStatusHtml}</div>`;
  }
  window.__battleStateHint = { playerCooldownMax: state.playerCooldownMax };
}

function speedLabel(cd){
  if (!cd) return '';
  if (cd <= 1.5) return 'Fast';
  if (cd <= 2.1) return 'Normal';
  return 'Slow';
}

/**
 * Get item rarity class based on price
 */
function getItemRarity(item) {
  if (!item || !item.price) return 'common';
  if (item.price >= 600) return 'legendary';
  if (item.price >= 400) return 'epic';
  if (item.price >= 150) return 'rare';
  if (item.price >= 50) return 'uncommon';
  return 'common';
}

/**
 * Generate item tooltip text
 */
export function generateItemTooltip(item) {
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
}

export function renderCharacterDetails(){
  const p = GameState.player;
  const panel = document.createElement('div');
  const w = p.equipment.weapon ? p.equipment.weapon.name : 'None';
  const a = p.equipment.armor ? p.equipment.armor.name : 'None';
  const aps = (1 / (window.__battleStateHint?.playerCooldownMax || 2.0)).toFixed(2);
  const racePassive = (() => {
    switch (p.race) {
      case 'Beast': return '+1 STR (stronger physical attacks)';
      case 'Elf': return '+1 INT & modest attack speed bonus';
      case 'Bug': return '+1 DEX & increased attack speed';
      default: return 'No innate bonus';
    }
  })();
  panel.innerHTML = `
    <h2>${p.name} — Lv.${p.level} ${p.class} (${p.race})</h2>
    <div>HP ${p.hp}/${p.maxHp} • MP ${p.mp}/${p.maxMp}</div>
    <div>ATK ${p.attackPower} • DEF ${p.defense}</div>
    <div>Equipped: Weapon: <strong>${w}</strong>, Armor: <strong>${a}</strong></div>
    <div style="margin:8px 0">Attack speed: ${speedLabel(window.__battleStateHint?.playerCooldownMax || 2.0)} (${aps} APS)</div>
    <div style="margin:4px 0"><em>Race passive: ${racePassive}</em></div>
    <div style="margin:4px 0">Talent Points: <strong>${p.talentPoints ?? 0}</strong></div>
    <div style="margin:4px 0">Talents: ${(summarizeTakenTalents(p).join(', ') || 'None')}</div>
    <div style="margin:4px 0">Crit Chance: ${((0.05 + (p._modifiers?.critChanceBonus || 0))*100).toFixed(1)}%</div>
    <h3>Inventory</h3>
    <div id="char-inventory"></div>
    <div class="row right"><button id="char-close">Close</button></div>
  `;
  const invRoot = panel.querySelector('#char-inventory');
  invRoot.innerHTML = '';
  p.inventory.forEach(id => {
    const it = getItemById(id);
    if (!it) return;
    const row = document.createElement('div');
    row.className = 'row item-tooltip';
    row.setAttribute('data-tooltip', generateItemTooltip(it));
    
    const rarity = getItemRarity(it);
    const stats = it.type === 'weapon'
      ? `ATK +${it.attackBonus ?? 0} • ${speedLabel((2.0 + (it.attackCooldownModifier ?? 0)))} speed`
      : `DEF +${it.defenseBonus ?? 0}`;
    row.innerHTML = `<div class="item-${rarity}">${it.name} — ${stats}</div>`;
    const equipBtn = document.createElement('button');
    equipBtn.textContent = 'Equip';
    equipBtn.addEventListener('click', () => {
      GameState.equipItem(it);
      // Remove from inventory upon equip
      GameState.removeItemFromInventory(id);
      renderTownSummary(GameState.player);
      // Re-render details
      const host = qs('#screen-message .panel');
      host.innerHTML = '';
      host.appendChild(renderCharacterDetails());
    });
    row.appendChild(equipBtn);
    invRoot.appendChild(row);
  });
  return panel;
}
