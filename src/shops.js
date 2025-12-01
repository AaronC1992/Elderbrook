// shops.js
// Shop inventories and helpers (stub logic for now)

import { items } from './items.js';
import { GameState } from './gameState.js';
import { showModalMessage } from './renderer.js';
import { playSoundPurchase } from './audio.js';

export const Shops = {
  weaponShopInventory: items.weapon.map(i => i.id),
  armorShopInventory: items.armor.map(i => i.id),
  potionShopInventory: (items.consumable||[]).map(i => i.id),
};

export function getShopInventory(shopId) {
  if (shopId === 'weapon') return Shops.weaponShopInventory;
  if (shopId === 'armor') return Shops.armorShopInventory;
  if (shopId === 'potion') return Shops.potionShopInventory;
  return [];
}

export function getShopItems(shopId){
  if (shopId === 'relic') {
    return [
      ...items.weapon.filter(w => w.id.startsWith('relic_')),
      ...items.armor.filter(a => a.id.startsWith('relic_'))
    ];
  }
  if (shopId === 'potion') {
    const ids = getShopInventory(shopId);
    const all = [...(items.consumable||[])];
    return ids.map(id => all.find(i => i.id === id)).filter(Boolean);
  }
  const ids = getShopInventory(shopId);
  const all = [...items.weapon, ...items.armor];
  return ids.map(id => all.find(i => i.id === id)).filter(Boolean);
}

/**
 * Helper to buy item (centralized)
 * Returns true if purchase successful
 */
export function attemptPurchase(item){
  const p = GameState.player;
  if (!p || !item) {
    console.warn('Invalid purchase attempt: missing player or item');
    return false;
  }
  
  if (p.gold < item.price){
    showModalMessage('Not enough gold.');
    return false;
  }
  
  // Check race restrictions
  if (item.elfOnly && p.race !== 'Elf') {
    showModalMessage('This item is only usable by Elves.');
    return false;
  }
  
  p.gold -= item.price;
  GameState.addItemToInventory(item.id);
  playSoundPurchase();
  return true;
}
