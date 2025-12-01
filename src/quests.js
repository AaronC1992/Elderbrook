// quests.js
// Simple quest system definitions and helpers.
// Add new quests by appending to QUESTS array with structure:
// { id, name, description, type:'kill', targetId, targetCount, current:0, rewardGold, rewardXp, rewardItemId(optional), requiredZone(optional), requiredItem(optional), unlockCondition(optional note) }

import { GameState } from './gameState.js';
import { getItemById } from './items.js';
import { addBattleLogEntry, showModalMessage, renderTownSummary } from './renderer.js';
import { playSoundQuestComplete } from './audio.js';

export const QUESTS = [
  {
    id: 'cull_slimes',
    name: 'Cull the Slimes',
    description: 'Defeat 5 Forest Slimes threatening the outskirts.',
    type: 'kill',
    targetId: 'forest_slime',
    targetCount: 5,
    current: 0,
    rewardGold: 60,
    rewardXp: 80,
    rewardItemId: 'w_dagger', // example reward
    requiredZone: 'forest',
    questGiver: 'questmaster_rho', questReceiver: 'questmaster_rho', zoneReference: 'forest'
  },
  {
    id: 'grove_attunement',
    name: 'Grove Attunement',
    description: 'Defeat 4 Thorn Guardians to attune to the Elven Grove.',
    type: 'kill',
    targetId: 'thorn_guardian',
    targetCount: 4,
    current: 0,
    rewardGold: 180,
    rewardXp: 200,
    rewardItemId: 'grove_wand',
    requiredZone: 'grove',
    questGiver: 'questmaster_rho', questReceiver: 'questmaster_rho', zoneReference: 'grove'
  },
  {
    id: 'aid_the_elves',
    name: 'Aid the Elves',
    description: 'Defeat 6 Corrupted Sprites in the Elf Grove to help cleanse the forest.',
    type: 'kill',
    targetId: 'corrupted_sprite',
    targetCount: 6,
    current: 0,
    rewardGold: 120,
    rewardXp: 150,
    rewardItemId: 'a_leather',
    questGiver: 'questmaster_rho', questReceiver: 'questmaster_rho', zoneReference: 'grove'
  }
  ,
  {
    id: 'cave_menace',
    name: 'Cave Menace',
    description: 'Defeat the Cave Wyrm lurking in the depths.',
    type: 'kill',
    targetId: 'boss_cave_wyrm',
    targetCount: 1,
    current: 0,
    rewardGold: 250,
    rewardXp: 300,
    rewardItemId: 'wyrm_scale_armor',
    requiredZone: 'cave',
    questGiver: 'guard_lyra', questReceiver: 'blacksmith_garr', zoneReference: 'cave'
  }
  ,{
    id: 'ruins_cleanse',
    name: 'Ruins Cleanse',
    description: 'Defeat 5 Ruins Specters to begin cleansing the Ancient Ruins.',
    type: 'kill',
    targetId: 'ruins_specter',
    targetCount: 5,
    current: 0,
    rewardGold: 300,
    rewardXp: 380,
    rewardItemId: 'relic_mystic_robes',
    questGiver: 'historian_ane', questReceiver: 'questmaster_rho', zoneReference: 'ruins'
  }
  ,{
    id: 'depths_challenge',
    name: "Depths Challenge",
    description: 'Defeat 3 Wyrmspawn to prove readiness for the Wyrm\'s Depths.',
    type: 'kill',
    targetId: 'depths_wyrmspawn',
    targetCount: 3,
    current: 0,
    rewardGold: 420,
    rewardXp: 520,
    rewardItemId: 'wyrmfire_lance',
    requiredZone: 'depths',
    questGiver: 'guard_lyra', questReceiver: 'alchemist_miri', zoneReference: 'depths'
  }
  ,{
    id: 'elder_wyrm',
    name: 'The Elder Deep',
    description: 'Confront and defeat the Wyrm of Elder Deep beneath the Depths.',
    type: 'kill',
    targetId: 'boss_elder_wyrm',
    targetCount: 1,
    current: 0,
    rewardGold: 1000,
    rewardXp: 1500,
    rewardItemId: 'ember_charm',
    requiredZone: 'depths'
  }
];

// Initialize quests container on player if missing.
export function ensureQuestState(){
  if (!GameState.player) return;
  if (!GameState.player.quests){
    GameState.player.quests = { active: [], completed: [] };
  }
}

export function listAvailableQuests(){
  ensureQuestState();
  const p = GameState.player;
  const activeIds = new Set(p.quests.active.map(q => q.id));
  const completedIds = new Set(p.quests.completed.map(q => q.id));
  return QUESTS.map(q => ({
    ...q,
    status: completedIds.has(q.id) ? 'completed' : (activeIds.has(q.id) ? 'active' : 'available')
  }));
}

export function acceptQuest(id){
  ensureQuestState();
  const p = GameState.player;
  if (p.quests.active.find(q => q.id === id) || p.quests.completed.find(q => q.id === id)) return false;
  const template = QUESTS.find(q => q.id === id);
  if (!template) return false;
  p.quests.active.push({ ...template, current: 0 });
  return true;
}

export function updateQuestProgress(enemyId){
  ensureQuestState();
  const p = GameState.player;
  let anyCompleted = false;
  for (const q of p.quests.active){
    if (q.type === 'kill' && q.targetId === enemyId){
      q.current += 1;
      addBattleLogEntry(`Quest progress: ${q.current}/${q.targetCount} ${q.name}`, 'info');
      if (q.current >= q.targetCount){
        // Complete quest
        p.gold += q.rewardGold;
        GameState.gainXp(q.rewardXp);
        if (q.rewardItemId){
          GameState.addItemToInventory(q.rewardItemId);
        }
        p.quests.completed.push(q);
        p.quests.active = p.quests.active.filter(a => a.id !== q.id);
        anyCompleted = true;
        
        // Play quest complete sound
        playSoundQuestComplete();
        
        addBattleLogEntry(`Quest complete: ${q.name}! +${q.rewardGold}g +${q.rewardXp}XP`, 'victory');
        // NPC reaction lines (concise)
        const giver = q.questGiver; const recv = q.questReceiver;
        if (giver) addBattleLogEntry(`(${giver}) "Good work."`, 'info');
        if (recv && giver !== recv) addBattleLogEntry(`(${recv}) "Your reward."`, 'info');
      }
    }
  }
  if (anyCompleted){
    renderTownSummary(p);
  }
}

export function renderQuestBoard(){
  ensureQuestState();
  const p = GameState.player;
  const container = document.createElement('div');
  const quests = listAvailableQuests();
  quests.forEach(q => {
    const row = document.createElement('div');
    row.className = 'row';
    let text = `${q.name} — ${q.description}`;
    if (q.status === 'active') text += ` (Progress: ${q.current}/${q.targetCount})`;
    if (q.status === 'completed') text += ' (Completed)';
    row.innerHTML = `<div>${text}</div>`;
    if (q.status === 'available'){
      const btn = document.createElement('button');
      btn.textContent = 'Accept';
      btn.addEventListener('click', () => {
        if (acceptQuest(q.id)) showModalMessage('Quest accepted!', () => {
          const host = document.querySelector('#quests-content');
          if (host){ host.innerHTML = ''; host.appendChild(renderQuestBoard()); }
        });
      });
      row.appendChild(btn);
    }
    container.appendChild(row);
  });
  return container;
}
