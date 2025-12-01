// zones.js
// Defines world zones with progression gating and biome mechanics.
// Each zone object structure:
// {
//   key: 'forest',
//   zoneName: 'Elderbrook Forest',
//   description: 'Early game outskirts filled with swift woodland threats.',
//   recommendedLevel: 1,
//   enemyPool: 'forest', // maps to enemy selection helper
//   lootTable: { weapons:[id], armor:[id], consumables:[id], components:[id] },
//   backgroundKey: 'forest',
//   zoneEffects: {
//     // Called once when battle starts in this zone
//     onBattleStart(battleState, player) {},
//     // Called each battle tick
//     onTick(battleState, dt, player) {},
//     // Called once after battle ends
//     onBattleEnd(battleState, player) {}
//   },
//   entryRequirements: {
//     minLevel: 1,
//     milestoneQuestId: null, // quest id required (completed)
//     requiredItemId: null // crafted / loot item required
//   }
// }
// Progression order: forest -> cave -> grove -> ruins -> depths
// Utility functions exported:
// - getZone(key)
// - listZones()
// - canEnterZone(key, player)
// - getNextZoneKey(currentKey)
// - updateZoneUnlocks(player): ensures unlockedZones sequentially open when requirements met.

import { GameState } from './gameState.js';
import { addBattleLogEntry } from './renderer.js';
import { updateQuestProgress } from './quests.js'; // (may use later)
import { applyStatus } from './statuses.js';
import { randInt } from './utils.js';

const ZONES = [
  {
    key: 'forest',
    zoneName: 'Elderbrook Forest',
    description: 'Early game training grounds; agile creatures reward building momentum.',
    recommendedLevel: 1,
    enemyPool: 'forest',
    lootTable: {
      weapons: ['forest_thorn_blade'],
      armor: ['bark_tunic'],
      consumables: ['forest_elixir'],
      components: ['forest_resin']
    },
    backgroundKey: 'forest',
    zoneEffects: {
      onBattleStart(battleState, player){
        // Momentum-friendly: slight bonus to momentum gain scaling for this battle.
        player._modifiers = player._modifiers || {}; 
        player._modifiers.momentumGainMultiplier = (player._modifiers.momentumGainMultiplier || 1) * 1.15;
      },
      onTick(){},
      onBattleEnd(battleState, player){
        // Revert momentum gain boost (simplistic - divide out)
        if (player?._modifiers?.momentumGainMultiplier){
          player._modifiers.momentumGainMultiplier = player._modifiers.momentumGainMultiplier / 1.15;
        }
      }
    },
    entryRequirements: { minLevel: 1, milestoneQuestId: null, requiredItemId: null }
  },
  {
    key: 'cave',
    zoneName: 'The Hollow Cave',
    description: 'Dim tunnels with slow, armored foes. Darkness dampens crit chance unless countered.',
    recommendedLevel: 4,
    enemyPool: 'cave',
    lootTable: {
      weapons: ['echo_hammer'],
      armor: ['stone_shell'],
      consumables: ['torch_oil'],
      components: ['luminescent_shard']
    },
    backgroundKey: 'cave',
    zoneEffects: {
      onBattleStart(battleState, player){
        // Darkness penalty: reduce effective crit scaling unless Torch Oil buff present.
        if (!player.flags?.buff_torch_oil){
          player._modifiers = player._modifiers || {}; 
          player._modifiers.critChanceBonus = (player._modifiers.critChanceBonus || 0) - 0.05; // -5%
        }
      },
      onTick(){},
      onBattleEnd(battleState, player){
        if (player._modifiers?.critChanceBonus){
          // Remove only the applied penalty if present
          player._modifiers.critChanceBonus = player._modifiers.critChanceBonus + 0.05; // restore
        }
        // Torch Oil expires after one battle
        if (player.flags?.buff_torch_oil){ delete player.flags.buff_torch_oil; }
      }
    },
    entryRequirements: { minLevel: 4, milestoneQuestId: 'cull_slimes', requiredItemId: null }
  },
  {
    key: 'grove',
    zoneName: 'The Elven Grove',
    description: 'Mystical glade of elemental spirits and thorn guardians; mixed magical resistances.',
    recommendedLevel: 5,
    enemyPool: 'grove',
    lootTable: {
      weapons: ['grove_wand'],
      armor: ['living_vine_wrap'],
      consumables: ['sprite_draught'],
      components: ['arcane_pollen']
    },
    backgroundKey: 'grove',
    zoneEffects: {
      onBattleStart(battleState, player){
        // Elemental balance: grant minor burn/poison resistance flag for this battle
        player.flags = player.flags || {}; player.flags.grove_resist = true;
      },
      onTick(){},
      onBattleEnd(battleState, player){ if (player.flags?.grove_resist) delete player.flags.grove_resist; }
    },
    entryRequirements: { minLevel: 5, milestoneQuestId: 'aid_the_elves', requiredItemId: null }
  },
  {
    key: 'ruins',
    zoneName: 'The Ruined Battlements',
    description: 'Weathered stone constructs with high stagger resistance and spectral defenders.',
    recommendedLevel: 7,
    enemyPool: 'ruins',
    lootTable: {
      weapons: ['ruin_pike'],
      armor: ['ancient_plate'],
      consumables: ['ether_coating'],
      components: ['runed_fragment']
    },
    backgroundKey: 'ruins',
    zoneEffects: {
      onBattleStart(battleState, player){
        // Enemy stagger resistance simulated by reducing effectiveness of player stagger application (flag checked in battle system if implemented)
        battleState._zoneStaggerResistance = 0.5; // halves stagger duration effects
      },
      onTick(){},
      onBattleEnd(battleState){ delete battleState._zoneStaggerResistance; }
    },
    entryRequirements: { minLevel: 7, milestoneQuestId: 'cave_menace', requiredItemId: 'luminescent_shard' }
  },
  {
    key: 'depths',
    zoneName: "The Wyrm's Depths",
    description: 'Fiery chasms home to wyrmspawn and searing vents. Environmental burn hazards occur intermittently.',
    recommendedLevel: 9,
    enemyPool: 'depths',
    lootTable: {
      weapons: ['wyrmfire_lance'],
      armor: ['ember_scale_mail'],
      consumables: ['flameguard_potion'],
      components: ['molten_core']
    },
    backgroundKey: 'depths',
    zoneEffects: {
      onBattleStart(battleState, player){ battleState._burnHazardTimer = 0; },
      onTick(battleState, dt, player){
        if (battleState._burnHazardTimer == null) return;
        // Treat specific armors/charms as protection
        const protectedFromHeat = !!(player.flags?.buff_flameguard || player.equipment?.armor?.id === 'ember_scale_mail' || player.equipment?.armor?.id === 'molten_scale_carapace');
        battleState._burnHazardTimer += dt;
        const period = battleState._bossDepthsHazardFast ? 2.5 : 4; // faster ticks during Elder Wyrm P2
        if (battleState._burnHazardTimer >= period){
          battleState._burnHazardTimer = 0;
          // 40% chance to apply burn unless protected
          if (!protectedFromHeat && Math.random() < 0.4){
            applyStatus(player, 'burn', addBattleLogEntry);
          }
        }
      },
      onBattleEnd(battleState, player){ delete battleState._burnHazardTimer; delete battleState._bossDepthsHazardFast; if (player.flags?.buff_flameguard) delete player.flags.buff_flameguard; }
    },
    entryRequirements: { minLevel: 9, milestoneQuestId: 'ruins_cleanse', requiredItemId: 'runed_fragment' }
  }
];

export function listZones(){ return ZONES; }
export function getZone(key){ return ZONES.find(z => z.key === key) || null; }

export function getNextZoneKey(currentKey){
  const idx = ZONES.findIndex(z => z.key === currentKey);
  if (idx < 0) return null;
  return ZONES[idx+1]?.key || null;
}

export function canEnterZone(key, player){
  const zone = getZone(key); if (!zone || !player) return false;
  const req = zone.entryRequirements;
  const meetsLevel = player.level >= (req.minLevel || 1);
  const questDone = !req.milestoneQuestId || player.quests?.completed?.some(q => q.id === req.milestoneQuestId);
  const hasItem = !req.requiredItemId || player.inventory.includes(req.requiredItemId) || player.equipment.weapon?.id === req.requiredItemId || player.equipment.armor?.id === req.requiredItemId;
  return meetsLevel && questDone && hasItem;
}

export function updateZoneUnlocks(player){
  if (!player) return;
  player.unlockedZones = player.unlockedZones || ['forest'];
  // Ensure sequential unlocking when requirements met
  for (const z of ZONES){
    if (!player.unlockedZones.includes(z.key)){
      if (canEnterZone(z.key, player)){
        player.unlockedZones.push(z.key);
      } else {
        // stop at first locked in sequence to preserve order
        break;
      }
    }
  }
}

// Hook utility to apply zone effects at battle start (called by battleSystem)
export function applyZoneStartEffects(zoneKey, battleState){
  const z = getZone(zoneKey); if (!z) return;
  z.zoneEffects?.onBattleStart?.(battleState, GameState.player);
}
export function tickZoneEffects(zoneKey, battleState, dt){
  const z = getZone(zoneKey); if (!z) return;
  z.zoneEffects?.onTick?.(battleState, dt, GameState.player);
}
export function applyZoneEndEffects(zoneKey, battleState){
  const z = getZone(zoneKey); if (!z) return;
  z.zoneEffects?.onBattleEnd?.(battleState, GameState.player);
}
