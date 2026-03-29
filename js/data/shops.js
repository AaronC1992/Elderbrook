import { ASSETS } from "./assets.js";
import { ITEMS } from "./items.js";

export const SHOPS = {
  weapons: {
    id: "weapons",
    name: "Weapons Shop",
    keeper: "Blacksmith Ivar",
    keeperPortrait: ASSETS.portraits.weaponShopkeep,
    background: ASSETS.backgrounds.weaponShop,
    inventory: [ITEMS["basic-iron-sword.png"], ITEMS["basic-short-bow.png"], ITEMS["basic-staff.png"]]
  },
  armor: {
    id: "armor",
    name: "Armor Shop",
    keeper: "Armorer Sela",
    keeperPortrait: ASSETS.portraits.armorShopkeep,
    background: ASSETS.backgrounds.armorShop,
    inventory: [ITEMS["basic-male-iron-chestplate.png"], ITEMS["basic-male-iron-helm.png"]]
  },
  potions: {
    id: "potions",
    name: "Potion Shop",
    keeper: "Apothecary Mira",
    keeperPortrait: ASSETS.portraits.potionShopkeep,
    background: ASSETS.backgrounds.potionShop,
    inventory: []
  }
};
