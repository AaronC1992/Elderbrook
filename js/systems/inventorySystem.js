import { ITEMS, POTIONS } from "../data/items.js";
import { setState, getState } from "../core/state.js";
import { loadScene } from "./sceneSystem.js";

function buildInventoryChoices(state) {
  const choices = [];

  // Weapons
  const weapons = state.inventory.filter((id) => ITEMS[id]?.type === "weapon");
  weapons.forEach((id) => {
    const item = ITEMS[id];
    const equipped = state.equippedWeapon === id;
    choices.push({
      text: equipped ? `${item.name} (Equipped) [ATK ${item.power}]` : `Equip ${item.name} [ATK ${item.power}]`,
      type: equipped ? "none" : "equipWeapon",
      payload: { itemId: id }
    });
  });

  // Armor
  const armors = state.inventory.filter((id) => ITEMS[id]?.type === "armor");
  armors.forEach((id) => {
    const item = ITEMS[id];
    const equipped = state.equippedArmor === id;
    choices.push({
      text: equipped ? `${item.name} (Equipped) [DEF ${item.defense}]` : `Equip ${item.name} [DEF ${item.defense}]`,
      type: equipped ? "none" : "equipArmor",
      payload: { itemId: id }
    });
  });

  // Potions
  if (state.potionCount > 0) {
    choices.push({
      text: `Health Potions: ${state.potionCount}`,
      type: "none"
    });
  }
  if (state.manaPotionCount > 0) {
    choices.push({
      text: `Mana Potions: ${state.manaPotionCount}`,
      type: "none"
    });
  }

  if (choices.length === 0) {
    choices.push({ text: "Your satchel is empty.", type: "none" });
  }

  choices.push({ text: "Close Inventory", type: "closeInventory" });

  return choices;
}

function buildSummary(state) {
  const weapon = state.equippedWeapon ? ITEMS[state.equippedWeapon] : null;
  const armor = state.equippedArmor ? ITEMS[state.equippedArmor] : null;
  const lines = [
    `Gold: ${state.gold}`,
    `HP: ${state.hp} / ${state.maxHp}`,
    `Weapon: ${weapon ? `${weapon.name} [ATK ${weapon.power}]` : "None"}`,
    `Armor: ${armor ? `${armor.name} [DEF ${armor.defense}]` : "None"}`
  ];
  return lines.join("\n");
}

export function openInventory() {
  const state = getState();

  setState((draftState) => {
    draftState.mode = "inventory";
    draftState.ui.speaker = "Inventory";
    draftState.ui.text = buildSummary(state);
    draftState.ui.npcs = [];
    draftState.ui.choices = buildInventoryChoices(state);
  });
}

export function equipWeapon(itemId) {
  setState((draftState) => {
    draftState.equippedWeapon = itemId;
  });
  openInventory();
}

export function equipArmor(itemId) {
  setState((draftState) => {
    draftState.equippedArmor = itemId;
  });
  openInventory();
}

export function closeInventory() {
  const state = getState();
  const returnTo = state.sceneId ?? "townHub";
  loadScene(returnTo, state.stepIndex);
}
