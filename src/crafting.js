// crafting.js
// Basic crafting system: consume required input items from inventory to create output item.

import { GameState } from './gameState.js';
import { getItemById } from './items.js';

// Recipes leverage existing equipment as components.
// Players must possess ALL required item ids simultaneously.
// Items are consumed (removed from inventory / unequipped if currently equipped) then output is granted.
// Keep recipes modest for now; can expand with resource drops later.

const RECIPES = [
  {
    id: 'craft_shadow_dagger',
    name: 'Forge Relic Shadow Dagger',
    inputs: [ { itemId: 'w_dagger' }, { itemId: 'a_leather' } ],
    output: 'relic_shadow_dagger',
    description: 'Combine a Rusty Dagger and Leather Vest into a Relic Shadow Dagger.',
    minLevel: 5
  },
  {
    id: 'craft_arc_staff',
    name: 'Imbue Relic Arc Staff',
    inputs: [ { itemId: 'w_staff' }, { itemId: 'wyrm_scale_armor' } ],
    output: 'relic_arc_staff',
    description: 'Infuse an Apprentice Staff with Wyrm Scale power to form a Relic Arc Staff.',
    minLevel: 7
  },
  {
    id: 'craft_mystic_robes',
    name: 'Weave Relic Mystic Robes',
    inputs: [ { itemId: 'a_cloth' }, { itemId: 'wyrm_scale_armor' } ],
    output: 'relic_mystic_robes',
    description: 'Weave cloth and wyrm scales into Relic Mystic Robes.',
    minLevel: 7
  }
];

export function getRecipes(){
  return RECIPES;
}

export function canCraft(recipe, player){
  if (!player) return false;
  if (recipe.minLevel && player.level < recipe.minLevel) return false;
  // Count inventory occurrences
  const inv = player.inventory.slice();
  // Include equipped items as available components
  const equippedIds = [player.equipment.weapon?.id, player.equipment.armor?.id].filter(Boolean);
  const allIds = inv.concat(equippedIds);
  for (const req of recipe.inputs){
    const idx = allIds.indexOf(req.itemId);
    if (idx === -1) return false;
    allIds.splice(idx,1); // consume for matching
  }
  // Avoid crafting if already owns output (either equipped or inventory) to prevent duplicates flooding
  const alreadyOwns = allIds.includes(recipe.output) || equippedIds.includes(recipe.output) || inv.includes(recipe.output);
  return !alreadyOwns;
}

function removeItemAnySource(player, itemId){
  // Unequip if equipped
  if (player.equipment.weapon?.id === itemId){ player.equipment.weapon = null; }
  if (player.equipment.armor?.id === itemId){ player.equipment.armor = null; }
  // Remove one occurrence from inventory
  const idx = player.inventory.indexOf(itemId);
  if (idx >= 0) player.inventory.splice(idx,1);
}

export function attemptCraft(recipeId){
  const r = RECIPES.find(r => r.id === recipeId);
  const p = GameState.player;
  if (!r || !p) return { ok:false, message:'Invalid recipe or player.' };
  if (!canCraft(r, p)) return { ok:false, message:'Requirements not met.' };
  // Consume inputs
  r.inputs.forEach(inp => removeItemAnySource(p, inp.itemId));
  // Add output
  p.inventory.push(r.output);
  // Recalculate stats (in case we unequipped something)
  GameState.recalculateDerived();
  return { ok:true, message:`Crafted ${getItemById(r.output)?.name || r.output}!` };
}
