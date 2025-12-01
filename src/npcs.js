// npcs.js
// Defines Elderbrook Village NPCs and dialogue logic

import { GameState } from './gameState.js';
import { showScreen, showModalMessage } from './renderer.js';

export const NPCS = [
  {
    id: 'guard_lyra', name: 'Lyra', role: 'Town Guard', location: 'gate', portraitKey: 'guard_lyra',
    personality: 'anxious', motivation: 'duty',
    dialogue: {
      intro: 'Forest is restless. Report strange tracks if you find any.',
      idle: [
        'Stay sharp. Slimes creep after dusk.',
        'Cave mouth drafts feel… wrong tonight.',
        'If you see glowing shards, bring them in.'
      ],
      afterForestUnlock: 'First rumors came true—things stir beyond the trees.',
      afterWyrmDefeat: 'It’s quiet. Maybe too quiet. I’ll keep watch.'
    },
    questHooks: { hints: ['cull_slimes', 'cave_menace'] }
  },
  {
    id: 'blacksmith_garr', name: 'Garr', role: 'Blacksmith', location: 'forge', portraitKey: 'blacksmith_garr',
    personality: 'gruff', motivation: 'pride',
    dialogue: {
      intro: 'Steel speaks plainly—swing true and it will answer.',
      idle: [
        'Blades dull; resolve shouldn’t.',
        'Echo carries in the caves. Hit harder.',
        'Bring runed fragments—my best work requires them.'
      ],
      afterRuinsUnlock: 'These old sigils… I can fold them into the metal.',
      afterWyrmDefeat: 'Wyrm’s scales make a fine carapace. You earned it.'
    },
    questHooks: { crafting: true }
  },
  {
    id: 'alchemist_miri', name: 'Miri', role: 'Alchemist', location: 'shop', portraitKey: 'alchemist_miri',
    personality: 'eccentric', motivation: 'curiosity',
    dialogue: {
      intro: 'Toxins? Tonics! Just mind which is which.',
      idle: [
        'Sprites hate bitter draughts—remember that.',
        'Poison lingers; antidotes linger smarter.',
        'Molten vents? I have a potion for that.'
      ],
      afterGroveUnlock: 'Sap runs strange in the Grove. I’m listening.',
      afterDepthsUnlock: 'Heat hums beneath us. Drink before you descend.'
    },
    questHooks: { shop: 'armor' }
  },
  {
    id: 'innkeeper_bren', name: 'Bren', role: 'Innkeeper', location: 'inn', portraitKey: 'innkeeper_bren',
    personality: 'warm', motivation: 'community',
    dialogue: {
      intro: 'Rooms upstairs. Stories downstairs. Rest while you can.',
      idle: [
        'Hunters swear the forest hums at midnight.',
        'Cave miners heard a heartbeat. I serve them tea.',
        'Strangers pass through with eyes like old stone.'
      ],
      afterForestUnlock: 'Rumors started. I keep the hearth bright for nerves.',
      afterWyrmDefeat: 'Sleep easy—tonight the walls don’t creak.'
    }
  },
  {
    id: 'questmaster_rho', name: 'Rho', role: 'Questmaster', location: 'board', portraitKey: 'questmaster_rho',
    personality: 'organized', motivation: 'order',
    dialogue: {
      intro: 'Quests posted daily. Keep ink off the parchment.',
      idle: [
        'Sign your name—earn your keep.',
        'Targets change with the wind; check back often.',
        'Rewards listed clear as bells.'
      ],
      afterGroveUnlock: 'Elven postings added. Be respectful when you accept them.',
      afterWyrmDefeat: 'Postscript: the Deep quiets. New notices forthcoming.'
    },
    questHooks: { board: true }
  },
  {
    id: 'historian_ane', name: 'Ane', role: 'Lorekeeper', location: 'library', portraitKey: 'historian_ane',
    personality: 'calm', motivation: 'truth',
    dialogue: {
      intro: 'Elderbrook sits atop memory. Few read it correctly.',
      idle: [
        'Runestones record promises, not victories.',
        'The Grove’s songs changed; the archives warned they would.',
        'When tunnels breathe, history tries to speak.'
      ],
      afterDepthsUnlock: 'You feel the hum now? The Wyrm stirs—old deals awaken.',
      afterWyrmDefeat: 'Truth: a promise kept delays a debt. Listen for echoes.'
    },
    questHooks: { lore: true }
  },
  // Optional child/farmer/outsider
  {
    id: 'child_fen', name: 'Fen', role: 'Child', location: 'square', portraitKey: 'child_fen',
    personality: 'playful', motivation: 'wonder',
    dialogue: {
      intro: 'Do you fight monsters? I draw them.',
      idle: [
        'My wolf has three tails! It’s faster.',
        'Sprites steal buttons, not bread. That’s fair.',
        'Caves rumble like my stomach.'
      ],
      afterWyrmDefeat: 'Did you make the big snake nap? Yay!'
    }
  }
];

export function listNPCs(){ return NPCS; }

export function getNPCById(id){ return NPCS.find(n => n.id === id) || null; }

export function getNPCDialogue(npc){
  const p = GameState.player;
  const lines = [];
  if (!p) return [npc.dialogue?.intro || `${npc.name} nods.`];
  const flags = p.flags || {};
  const unlocked = p.unlockedZones || [];
  // Context-specific milestones
  const forestUnlocked = unlocked.includes('forest');
  const groveUnlocked = unlocked.includes('grove');
  const depthsUnlocked = unlocked.includes('depths');
  if (flags.boss_elder_wyrm_defeated && npc.dialogue?.afterWyrmDefeat){
    lines.push(npc.dialogue.afterWyrmDefeat);
  } else if (depthsUnlocked && npc.dialogue?.afterDepthsUnlock){
    lines.push(npc.dialogue.afterDepthsUnlock);
  } else if (groveUnlocked && npc.dialogue?.afterGroveUnlock){
    lines.push(npc.dialogue.afterGroveUnlock);
  } else if (forestUnlocked && npc.dialogue?.afterForestUnlock){
    lines.push(npc.dialogue.afterForestUnlock);
  } else if (npc.dialogue?.intro){
    lines.push(npc.dialogue.intro);
  }
  // Idle variation
  const idx = ((p.npcStates?.[npc.id]?.idleIndex ?? -1) + 1) % (npc.dialogue?.idle?.length || 1);
  const idle = npc.dialogue?.idle?.[idx];
  if (idle) lines.push(idle);
  // Persist idleIndex
  p.npcStates = p.npcStates || {};
  p.npcStates[npc.id] = { ...(p.npcStates[npc.id]||{}), idleIndex: idx };
  return lines;
}

export function openNPCInteraction(npc){
  const container = document.querySelector('#npc-content');
  const exitBtn = document.querySelector('#npc-exit');
  if (!container || !exitBtn){
    showModalMessage(`${npc.name} greets you. (NPC UI missing)`);
    return;
  }
  const lines = getNPCDialogue(npc);
  container.innerHTML = `
    <div class="row">
      <div class="portrait portrait-${npc.portraitKey}"></div>
      <div>
        <h3>${npc.name} — ${npc.role}</h3>
        ${lines.map(l => `<div class="npc-line">${l}</div>`).join('')}
        <div class="npc-actions"></div>
      </div>
    </div>
  `;
  const actions = container.querySelector('.npc-actions');
  // Action hooks to existing UIs
  if (npc.role === 'Blacksmith'){
    const btn = document.createElement('button'); btn.textContent = 'Open Forge';
    btn.addEventListener('click', () => { document.querySelector('#btn-crafting')?.click(); });
    actions.appendChild(btn);
  }
  if (npc.role === 'Alchemist'){
    const btn = document.createElement('button'); btn.textContent = 'Browse Reagents';
    btn.addEventListener('click', () => { document.querySelector('#btn-armor-shop')?.click(); });
    actions.appendChild(btn);
  }
  if (npc.role === 'Innkeeper'){
    const btn = document.createElement('button'); btn.textContent = 'Rest at Inn';
    btn.addEventListener('click', () => { document.querySelector('#btn-rest')?.click(); });
    actions.appendChild(btn);
  }
  if (npc.role === 'Questmaster'){
    const btn = document.createElement('button'); btn.textContent = 'View Quest Board';
    btn.addEventListener('click', () => { document.querySelector('#btn-quests')?.click(); });
    actions.appendChild(btn);
  }
  showScreen('screen-npc');
}
