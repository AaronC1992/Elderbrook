/* items.js - All item definitions */
var Items = (function () {
  var catalog = {
    // --- Weapons ---
    "rusty-dagger": {
      id: "rusty-dagger", name: "Rusty Dagger", type: "weapon", slot: "weapon",
      price: 15, sellPrice: 7, power: 2,
      img: "assets/items/basic-iron-dagger.png",
      description: "A dull blade. Better than bare fists."
    },
    "iron-sword": {
      id: "iron-sword", name: "Iron Sword", type: "weapon", slot: "weapon",
      price: 40, sellPrice: 20, power: 5,
      img: "assets/items/basic-iron-sword.png",
      description: "A reliable sword forged from solid iron."
    },
    "wooden-staff": {
      id: "wooden-staff", name: "Wooden Staff", type: "weapon", slot: "weapon",
      price: 35, sellPrice: 17, power: 4,
      img: "assets/items/basic-staff.png",
      description: "A sturdy staff favored by traveling mages."
    },
    "short-bow": {
      id: "short-bow", name: "Short Bow", type: "weapon", slot: "weapon",
      price: 38, sellPrice: 19, power: 4,
      img: "assets/items/basic-short-bow.png",
      description: "A compact bow for quick shots."
    },
    "steel-sword": {
      id: "steel-sword", name: "Steel Sword", type: "weapon", slot: "weapon",
      price: 90, sellPrice: 45, power: 9,
      img: "assets/items/basic-iron-sword.png",
      description: "A well-crafted blade of tempered steel."
    },

    // --- Helmets ---
    "leather-cap": {
      id: "leather-cap", name: "Leather Cap", type: "armor", slot: "helmet",
      price: 20, sellPrice: 10, defense: 1,
      description: "A simple cap of hardened leather."
    },
    "iron-helm": {
      id: "iron-helm", name: "Iron Helm", type: "armor", slot: "helmet",
      price: 45, sellPrice: 22, defense: 3,
      img: "assets/items/basic-male-iron-helm.png",
      description: "A sturdy iron helmet."
    },

    // --- Chest ---
    "cloth-tunic": {
      id: "cloth-tunic", name: "Cloth Tunic", type: "armor", slot: "chest",
      price: 15, sellPrice: 7, defense: 1,
      description: "Simple cloth clothing. Barely counts as armor."
    },
    "leather-armor": {
      id: "leather-armor", name: "Leather Armor", type: "armor", slot: "chest",
      price: 50, sellPrice: 25, defense: 3,
      description: "Tough leather that turns minor blows."
    },
    "iron-chestplate": {
      id: "iron-chestplate", name: "Iron Chestplate", type: "armor", slot: "chest",
      price: 100, sellPrice: 50, defense: 6,
      img: "assets/items/basic-male-iron-chestplate.png",
      description: "Heavy iron plate armor. Solid protection."
    },

    // --- Legs ---
    "cloth-pants": {
      id: "cloth-pants", name: "Cloth Pants", type: "armor", slot: "legs",
      price: 12, sellPrice: 6, defense: 1,
      description: "Basic cloth legwear."
    },
    "leather-leggings": {
      id: "leather-leggings", name: "Leather Leggings", type: "armor", slot: "legs",
      price: 40, sellPrice: 20, defense: 2,
      description: "Reinforced leather leg protection."
    },

    // --- Accessory ---
    "lucky-charm": {
      id: "lucky-charm", name: "Lucky Charm", type: "armor", slot: "accessory",
      price: 60, sellPrice: 30, defense: 0, dexterity: 2,
      description: "A small trinket said to bring good fortune. +2 Dexterity."
    },

    // --- Potions ---
    "health-potion": {
      id: "health-potion", name: "Health Potion", type: "potion",
      price: 15, sellPrice: 7, healAmount: 30,
      img: "assets/items/health-potion.png",
      description: "Restores 30 HP."
    },
    "mana-potion": {
      id: "mana-potion", name: "Mana Potion", type: "potion",
      price: 18, sellPrice: 9, manaAmount: 15,
      img: "assets/items/mana-potion.png",
      description: "Restores 15 Mana."
    },

    // --- Misc / Loot ---
    "goblin-ear": {
      id: "goblin-ear", name: "Goblin Ear", type: "misc",
      price: 0, sellPrice: 3,
      description: "A severed goblin ear. Some collectors buy these."
    }
  };

  function get(id) {
    return catalog[id] || null;
  }

  function getAll() {
    return catalog;
  }

  return { get: get, getAll: getAll };
})();
