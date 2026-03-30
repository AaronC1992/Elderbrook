/* items.js - All item definitions */
var Items = (function () {
  var catalog = {
    // ==============================
    // --- TIER 1 WEAPONS (Goblin Cave / Starter) ---
    // ==============================
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

    // ==============================
    // --- TIER 2 WEAPONS (Dark Forest) ---
    // ==============================
    "forest-blade": {
      id: "forest-blade", name: "Forest Blade", type: "weapon", slot: "weapon",
      price: 160, sellPrice: 80, power: 13,
      img: "assets/items/forest-blade.png",
      description: "A vine-wrapped sword imbued with nature's edge."
    },
    "hunter-bow": {
      id: "hunter-bow", name: "Hunter's Bow", type: "weapon", slot: "weapon",
      price: 140, sellPrice: 70, power: 11,
      img: "assets/items/hunter-bow.png",
      description: "A finely crafted longbow used by forest rangers."
    },
    "enchanted-staff": {
      id: "enchanted-staff", name: "Enchanted Staff", type: "weapon", slot: "weapon",
      price: 150, sellPrice: 75, power: 12, intelligence: 2,
      img: "assets/items/enchanted-staff.png",
      description: "A staff humming with arcane energy. +2 INT."
    },

    // ==============================
    // --- TIER 3 WEAPONS (Haunted Ruins) ---
    // ==============================
    "shadow-blade": {
      id: "shadow-blade", name: "Shadow Blade", type: "weapon", slot: "weapon",
      price: 280, sellPrice: 140, power: 18,
      img: "assets/items/shadow-blade.png",
      description: "A dark blade that seems to drink in the light."
    },
    "spectral-staff": {
      id: "spectral-staff", name: "Spectral Staff", type: "weapon", slot: "weapon",
      price: 260, sellPrice: 130, power: 16, intelligence: 4,
      img: "assets/items/spectral-staff.png",
      description: "Ghosts whisper secrets through this ethereal focus. +4 INT."
    },
    "bone-bow": {
      id: "bone-bow", name: "Bone Bow", type: "weapon", slot: "weapon",
      price: 250, sellPrice: 125, power: 17,
      img: "assets/items/bone-bow.png",
      description: "Crafted from ancient remains. Unsettlingly accurate."
    },

    // ==============================
    // --- TIER 4 WEAPONS (Dragon's Lair) ---
    // ==============================
    "dragon-slayer": {
      id: "dragon-slayer", name: "Dragon Slayer", type: "weapon", slot: "weapon",
      price: 500, sellPrice: 250, power: 24,
      img: "assets/items/dragon-slayer.png",
      description: "A legendary blade forged to slay dragons."
    },
    "wyrm-staff": {
      id: "wyrm-staff", name: "Wyrm Staff", type: "weapon", slot: "weapon",
      price: 480, sellPrice: 240, power: 22, intelligence: 6,
      img: "assets/items/wyrm-staff.png",
      description: "A staff carved from a wyrm's fang. Crackles with power. +6 INT."
    },

    // ==============================
    // --- TIER 1 HELMETS ---
    // ==============================
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

    // --- TIER 2 HELMETS ---
    "woodland-helm": {
      id: "woodland-helm", name: "Woodland Helm", type: "armor", slot: "helmet",
      price: 90, sellPrice: 45, defense: 5,
      img: "assets/items/woodland-helm.png",
      description: "Woven bark and iron. Light yet resilient."
    },

    // --- TIER 3 HELMETS ---
    "wraith-helm": {
      id: "wraith-helm", name: "Wraith Helm", type: "armor", slot: "helmet",
      price: 170, sellPrice: 85, defense: 8,
      img: "assets/items/wraith-helm.png",
      description: "A spectral helm that chills the air around it."
    },

    // --- TIER 4 HELMETS ---
    "dragonscale-helm": {
      id: "dragonscale-helm", name: "Dragonscale Helm", type: "armor", slot: "helmet",
      price: 380, sellPrice: 190, defense: 11,
      img: "assets/items/dragonscale-helm.png",
      description: "Forged from the scales of a fallen drake."
    },

    // ==============================
    // --- TIER 1 CHEST ---
    // ==============================
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

    // --- TIER 2 CHEST ---
    "druid-robes": {
      id: "druid-robes", name: "Druid Robes", type: "armor", slot: "chest",
      price: 150, sellPrice: 75, defense: 8, intelligence: 2,
      img: "assets/items/druid-robes.png",
      description: "Nature-blessed vestments. +2 INT."
    },

    // --- TIER 3 CHEST ---
    "runed-armor": {
      id: "runed-armor", name: "Runed Armor", type: "armor", slot: "chest",
      price: 280, sellPrice: 140, defense: 12,
      img: "assets/items/runed-armor.png",
      description: "Ancient runes glow along the plates with warding magic."
    },

    // --- TIER 4 CHEST ---
    "dragonscale-armor": {
      id: "dragonscale-armor", name: "Dragonscale Armor", type: "armor", slot: "chest",
      price: 520, sellPrice: 260, defense: 16,
      img: "assets/items/dragonscale-armor.png",
      description: "Legendary armor. Near-impervious to blade and flame."
    },

    // ==============================
    // --- TIER 1 LEGS ---
    // ==============================
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

    // --- TIER 2 LEGS ---
    "forest-greaves": {
      id: "forest-greaves", name: "Forest Greaves", type: "armor", slot: "legs",
      price: 100, sellPrice: 50, defense: 4,
      img: "assets/items/forest-greaves.png",
      description: "Bark-reinforced greaves. Light and sturdy."
    },

    // --- TIER 3 LEGS ---
    "shadow-leggings": {
      id: "shadow-leggings", name: "Shadow Leggings", type: "armor", slot: "legs",
      price: 160, sellPrice: 80, defense: 7,
      img: "assets/items/shadow-leggings.png",
      description: "Woven with shadow threads that absorb impact."
    },

    // --- TIER 4 LEGS ---
    "dragon-greaves": {
      id: "dragon-greaves", name: "Dragon Greaves", type: "armor", slot: "legs",
      price: 340, sellPrice: 170, defense: 10,
      img: "assets/items/dragon-greaves.png",
      description: "Dragonscale-plated leg armor. Heavy but mighty."
    },

    // ==============================
    // --- ACCESSORIES ---
    // ==============================
    "lucky-charm": {
      id: "lucky-charm", name: "Lucky Charm", type: "armor", slot: "accessory",
      price: 60, sellPrice: 30, defense: 0, dexterity: 2,
      description: "A small trinket said to bring good fortune. +2 Dexterity."
    },
    "witch-charm": {
      id: "witch-charm", name: "Witch's Charm", type: "armor", slot: "accessory",
      price: 120, sellPrice: 60, defense: 1, intelligence: 3,
      img: "assets/items/witch-charm.png",
      description: "Pulsing with dark forest magic. +3 INT."
    },
    "spirit-amulet": {
      id: "spirit-amulet", name: "Spirit Amulet", type: "armor", slot: "accessory",
      price: 200, sellPrice: 100, defense: 2, intelligence: 4,
      img: "assets/items/spirit-amulet.png",
      description: "Contains a trapped spirit that strengthens the wearer. +4 INT."
    },
    "dragon-fang-necklace": {
      id: "dragon-fang-necklace", name: "Dragon Fang Necklace", type: "armor", slot: "accessory",
      price: 350, sellPrice: 175, defense: 4, dexterity: 3,
      img: "assets/items/dragon-fang-necklace.png",
      description: "A trophy of dragonslayers. +4 DEF, +3 DEX."
    },

    // ==============================
    // --- POTIONS ---
    // ==============================
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
    "greater-health-potion": {
      id: "greater-health-potion", name: "Greater Health Potion", type: "potion",
      price: 40, sellPrice: 20, healAmount: 75,
      img: "assets/items/greater-health-potion.png",
      description: "Restores 75 HP."
    },
    "greater-mana-potion": {
      id: "greater-mana-potion", name: "Greater Mana Potion", type: "potion",
      price: 45, sellPrice: 22, manaAmount: 40,
      img: "assets/items/greater-mana-potion.png",
      description: "Restores 40 Mana."
    },
    "antidote": {
      id: "antidote", name: "Antidote", type: "potion",
      price: 25, sellPrice: 12, curesStatus: true,
      img: "assets/items/antidote.png",
      description: "Cures poison and bleeding."
    },

    // ==============================
    // --- MISC / LOOT ---
    // ==============================
    "goblin-ear": {
      id: "goblin-ear", name: "Goblin Ear", type: "misc",
      price: 0, sellPrice: 3,
      description: "A severed goblin ear. Some collectors buy these."
    },
    "wolf-pelt": {
      id: "wolf-pelt", name: "Wolf Pelt", type: "misc",
      price: 0, sellPrice: 8,
      description: "A thick wolf hide. Valued by tanners."
    },
    "witch-eye": {
      id: "witch-eye", name: "Witch's Eye", type: "misc",
      price: 0, sellPrice: 12,
      description: "A glass eye pulsing with residual magic."
    },
    "bone-fragment": {
      id: "bone-fragment", name: "Bone Fragment", type: "misc",
      price: 0, sellPrice: 10,
      description: "An ancient bone shard. Necromancers covet these."
    },
    "ectoplasm": {
      id: "ectoplasm", name: "Ectoplasm", type: "misc",
      price: 0, sellPrice: 15,
      description: "Ghostly residue. Cold to the touch."
    },
    "dragon-scale": {
      id: "dragon-scale", name: "Dragon Scale", type: "misc",
      price: 0, sellPrice: 50,
      description: "A shimmering scale from a dragon. Extremely valuable."
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
