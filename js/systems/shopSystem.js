import { setState, getState } from "../core/state.js";
import { SHOPS } from "../data/shops.js";
import { ITEMS, POTIONS } from "../data/items.js";

function getInventoryForShop(shop, state) {
  if (shop.id !== "armor") {
    return shop.inventory;
  }

  if (state.player.gender === "female") {
    return [ITEMS["basic-female-iron-chestplate.png"], ITEMS["basic-female-iron-helm.png"]];
  }

  return [ITEMS["basic-male-iron-chestplate.png"], ITEMS["basic-male-iron-helm.png"]];
}

function buildShopChoices(shop, state) {
  const inventory = getInventoryForShop(shop, state);

  const itemChoices = inventory.map((item) => {
    const owned = state.inventory.includes(item.id);
    return {
      text: owned ? `${item.name} (Owned)` : `Buy ${item.name} (${item.price}g)`,
      type: "buyItem",
      payload: { itemId: item.id }
    };
  });

  if (shop.id === "potions") {
    itemChoices.push({
      text: `Buy ${POTIONS.health.name} (${POTIONS.health.price}g)`,
      type: "buyPotion",
      payload: { potionType: "health" }
    });

    itemChoices.push({
      text: `Buy ${POTIONS.mana.name} (${POTIONS.mana.price}g)`,
      type: "buyPotion",
      payload: { potionType: "mana" }
    });
  }

  itemChoices.push({
    text: "Leave Shop",
    type: "returnTown"
  });

  return itemChoices;
}

function setShopView(shop, message) {
  const currentState = getState();

  setState((draftState) => {
    draftState.mode = "shop";
    draftState.shop.id = shop.id;
    draftState.locationLabel = shop.name;
    draftState.ui.speaker = shop.keeper;
    draftState.ui.text = message;
    draftState.ui.background = shop.background;
    draftState.ui.portraits = {
      left: shop.keeperPortrait,
      right: draftState.ui.portraits.right
    };
    draftState.ui.npcs = [];
    draftState.ui.choices = buildShopChoices(shop, currentState);
  });
}

export function openShop(shopId) {
  const shop = SHOPS[shopId];
  if (!shop) {
    return;
  }

  setShopView(shop, "Take your time. Good gear keeps adventurers breathing.");
}

export function buyItem(itemId) {
  const state = getState();
  const shop = SHOPS[state.shop.id];
  if (!shop) {
    return;
  }

  const inventory = getInventoryForShop(shop, state);
  const item = inventory.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  if (state.inventory.includes(item.id)) {
    setShopView(shop, `You already carry a ${item.name}.`);
    return;
  }

  if (state.gold < item.price) {
    setShopView(shop, `You are short on gold. ${item.name} costs ${item.price}g.`);
    return;
  }

  setState((draftState) => {
    draftState.gold -= item.price;
    draftState.inventory.push(item.id);

    if (item.type === "weapon") {
      draftState.equippedWeapon = item.id;
    }

    if (item.type === "armor") {
      draftState.equippedArmor = item.id;
    }
  });

  setShopView(shop, `${item.name} is yours. Keep it maintained and it will keep you alive.`);
}

export function buyPotion(potionType = "health") {
  const state = getState();
  const shop = SHOPS[state.shop.id];
  if (!shop) {
    return;
  }

  const potion = POTIONS[potionType];
  if (!potion) {
    return;
  }

  if (state.gold < potion.price) {
    setShopView(shop, `You need ${potion.price}g for a ${potion.name}.`);
    return;
  }

  setState((draftState) => {
    draftState.gold -= potion.price;

    if (potionType === "health") {
      draftState.potionCount += 1;
    }

    if (potionType === "mana") {
      draftState.manaPotionCount += 1;
    }
  });

  const updatedState = getState();
  setShopView(
    shop,
    `${potion.name} packed. HP Potions: ${updatedState.potionCount} | Mana Potions: ${updatedState.manaPotionCount}.`
  );
}
