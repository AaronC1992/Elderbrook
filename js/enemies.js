/* enemies.js - Enemy definitions for all areas */
var Enemies = (function () {
  var catalog = {
    // ===========================
    // --- GOBLIN CAVE (Lv 1-5) ---
    // ===========================
    goblin: {
      id: "goblin", name: "Goblin",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 20, attack: 4, defense: 1,
      xpReward: 12, goldReward: [3, 8],
      abilities: [], statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.6 },
        { itemId: "health-potion", chance: 0.15 },
        { itemId: "rusty-dagger", chance: 0.05 }
      ]
    },
    "goblin-brute": {
      id: "goblin-brute", name: "Goblin Brute",
      portrait: "assets/portraits/goblin-brute-enemy.png",
      hp: 35, attack: 7, defense: 3,
      xpReward: 22, goldReward: [6, 14],
      abilities: [{ name: "Crushing Blow", chance: 0.25, multiplier: 1.5, message: "The Goblin Brute lands a crushing blow!" }],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.7 },
        { itemId: "health-potion", chance: 0.25 },
        { itemId: "iron-sword", chance: 0.05 }
      ]
    },
    "goblin-shaman": {
      id: "goblin-shaman", name: "Goblin Shaman",
      portrait: "assets/portraits/goblin-shaman-enemy.png",
      hp: 18, attack: 8, defense: 1,
      xpReward: 18, goldReward: [5, 12],
      abilities: [{ name: "Hex", chance: 0.3, appliesEffect: { type: "poison", damage: 2, duration: 3 }, message: "The Goblin Shaman hexes you with poison!" }],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.5 },
        { itemId: "mana-potion", chance: 0.3 },
        { itemId: "wooden-staff", chance: 0.04 }
      ]
    },
    "goblin-assassin": {
      id: "goblin-assassin", name: "Goblin Assassin",
      portrait: "assets/portraits/goblin-assassin-enemy.png",
      hp: 22, attack: 10, defense: 2,
      xpReward: 25, goldReward: [8, 16],
      abilities: [{ name: "Poisoned Blade", chance: 0.35, appliesEffect: { type: "poison", damage: 3, duration: 2 }, message: "The Goblin Assassin cuts you with a poisoned blade!" }],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.6 },
        { itemId: "health-potion", chance: 0.2 },
        { itemId: "rusty-dagger", chance: 0.1 }
      ]
    },
    "goblin-king": {
      id: "goblin-king", name: "Goblin King",
      portrait: "assets/portraits/goblin-king-enemy.png",
      hp: 80, attack: 12, defense: 5,
      xpReward: 100, goldReward: [40, 80],
      isBoss: true,
      abilities: [
        { name: "Royal Command", chance: 0.3, multiplier: 1.8, message: "The Goblin King strikes with royal fury!" },
        { name: "War Cry", chance: 0.2, selfBuff: { attack: 2 }, message: "The Goblin King lets out a terrifying war cry! ATK up!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "steel-sword", chance: 0.3 },
        { itemId: "iron-chestplate", chance: 0.2 },
        { itemId: "health-potion", chance: 1.0 }
      ]
    },

    // ===========================
    // --- BANDIT CAMP (Lv 3-8) ---
    // ===========================
    bandit: {
      id: "bandit", name: "Bandit",
      portrait: "assets/portraits/bandit-enemy.png",
      hp: 30, attack: 8, defense: 3,
      xpReward: 20, goldReward: [8, 18],
      abilities: [], statusEffects: [],
      loot: [
        { itemId: "health-potion", chance: 0.2 },
        { itemId: "iron-sword", chance: 0.08 }
      ]
    },
    "bandit-archer": {
      id: "bandit-archer", name: "Bandit Archer",
      portrait: "assets/portraits/bandit-archer-enemy.png",
      hp: 25, attack: 11, defense: 2,
      xpReward: 24, goldReward: [10, 20],
      abilities: [{ name: "Aimed Shot", chance: 0.3, multiplier: 1.6, message: "The Bandit Archer fires a precise aimed shot!" }],
      statusEffects: [],
      loot: [
        { itemId: "short-bow", chance: 0.08 },
        { itemId: "health-potion", chance: 0.15 }
      ]
    },
    "bandit-brute": {
      id: "bandit-brute", name: "Bandit Enforcer",
      portrait: "assets/portraits/bandit-brute-enemy.png",
      hp: 45, attack: 10, defense: 5,
      xpReward: 30, goldReward: [12, 25],
      abilities: [
        { name: "Stun Strike", chance: 0.25, appliesEffect: { type: "stun", duration: 1 }, message: "The Enforcer stuns you with a heavy blow!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "iron-helm", chance: 0.1 },
        { itemId: "health-potion", chance: 0.25 },
        { itemId: "leather-armor", chance: 0.06 }
      ]
    },
    "bandit-leader": {
      id: "bandit-leader", name: "Bandit Leader",
      portrait: "assets/portraits/bandit-leader-enemy.png",
      hp: 100, attack: 14, defense: 7,
      xpReward: 140, goldReward: [60, 120],
      isBoss: true,
      abilities: [
        { name: "Ruthless Strike", chance: 0.3, multiplier: 1.7, message: "The Bandit Leader strikes ruthlessly!" },
        { name: "Rally", chance: 0.2, selfBuff: { attack: 3 }, message: "The Bandit Leader rallies with renewed fury! ATK up!" },
        { name: "Bleed", chance: 0.25, appliesEffect: { type: "bleed", damage: 4, duration: 3 }, message: "The Bandit Leader slashes deep! You're bleeding!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "steel-sword", chance: 0.4 },
        { itemId: "iron-chestplate", chance: 0.3 },
        { itemId: "leather-leggings", chance: 0.3 },
        { itemId: "health-potion", chance: 1.0 }
      ]
    },

    // ===========================
    // --- DARK FOREST (Lv 6-10) ---
    // ===========================
    wolf: {
      id: "wolf", name: "Timber Wolf",
      portrait: "assets/portraits/wolf-enemy.png",
      hp: 35, attack: 9, defense: 3,
      xpReward: 28, goldReward: [8, 18],
      abilities: [{ name: "Lunging Bite", chance: 0.2, multiplier: 1.4, message: "The Wolf lunges with a savage bite!" }],
      statusEffects: [],
      loot: [
        { itemId: "wolf-pelt", chance: 0.5 },
        { itemId: "health-potion", chance: 0.15 }
      ]
    },
    "dire-wolf": {
      id: "dire-wolf", name: "Dire Wolf",
      portrait: "assets/portraits/dire-wolf-enemy.png",
      hp: 55, attack: 13, defense: 5,
      xpReward: 42, goldReward: [15, 30],
      abilities: [
        { name: "Savage Maul", chance: 0.3, multiplier: 1.6, message: "The Dire Wolf mauls you ferociously!" },
        { name: "Rending Bite", chance: 0.2, appliesEffect: { type: "bleed", damage: 3, duration: 3 }, message: "The Dire Wolf's bite tears flesh! You're bleeding!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "wolf-pelt", chance: 0.7 },
        { itemId: "health-potion", chance: 0.2 },
        { itemId: "forest-greaves", chance: 0.04 }
      ]
    },
    "forest-witch": {
      id: "forest-witch", name: "Forest Witch",
      portrait: "assets/portraits/forest-witch-enemy.png",
      hp: 32, attack: 14, defense: 2,
      xpReward: 38, goldReward: [12, 25],
      abilities: [
        { name: "Dark Curse", chance: 0.3, appliesEffect: { type: "poison", damage: 3, duration: 3 }, message: "The Forest Witch curses you with venom!" },
        { name: "Shadow Bolt", chance: 0.25, multiplier: 1.5, message: "The Forest Witch hurls a bolt of shadow!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "witch-eye", chance: 0.4 },
        { itemId: "mana-potion", chance: 0.3 },
        { itemId: "witch-charm", chance: 0.05 },
        { itemId: "enchanted-staff", chance: 0.03 }
      ]
    },
    treant: {
      id: "treant", name: "Treant",
      portrait: "assets/portraits/treant-enemy.png",
      hp: 70, attack: 10, defense: 9,
      xpReward: 48, goldReward: [10, 22],
      abilities: [
        { name: "Root Slam", chance: 0.25, multiplier: 1.5, message: "The Treant slams you with massive roots!" },
        { name: "Entangle", chance: 0.15, appliesEffect: { type: "stun", duration: 1 }, message: "Roots burst from the ground and entangle you!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "health-potion", chance: 0.3 },
        { itemId: "woodland-helm", chance: 0.05 },
        { itemId: "forest-blade", chance: 0.03 }
      ]
    },
    "forest-guardian": {
      id: "forest-guardian", name: "Forest Guardian",
      portrait: "assets/portraits/forest-guardian-enemy.png",
      hp: 160, attack: 16, defense: 9,
      xpReward: 220, goldReward: [80, 160],
      isBoss: true,
      abilities: [
        { name: "Nature's Wrath", chance: 0.3, multiplier: 1.8, message: "The Forest Guardian unleashes nature's wrath!" },
        { name: "Entangling Roots", chance: 0.2, appliesEffect: { type: "stun", duration: 1 }, message: "Massive roots erupt and bind you!" },
        { name: "Bark Shield", chance: 0.15, selfBuff: { attack: 2 }, message: "The Guardian's bark thickens! ATK up!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "forest-blade", chance: 0.4 },
        { itemId: "druid-robes", chance: 0.3 },
        { itemId: "witch-charm", chance: 0.3 },
        { itemId: "greater-health-potion", chance: 1.0 }
      ]
    },

    // ===========================
    // --- HAUNTED RUINS (Lv 10-14) ---
    // ===========================
    skeleton: {
      id: "skeleton", name: "Skeleton Warrior",
      portrait: "assets/portraits/skeleton-enemy.png",
      hp: 45, attack: 12, defense: 7,
      xpReward: 40, goldReward: [12, 24],
      abilities: [{ name: "Bone Slash", chance: 0.2, multiplier: 1.3, message: "The Skeleton strikes with a jagged bone blade!" }],
      statusEffects: [],
      loot: [
        { itemId: "bone-fragment", chance: 0.5 },
        { itemId: "health-potion", chance: 0.15 },
        { itemId: "iron-helm", chance: 0.04 }
      ]
    },
    ghost: {
      id: "ghost", name: "Restless Ghost",
      portrait: "assets/portraits/ghost-enemy.png",
      hp: 35, attack: 16, defense: 2,
      xpReward: 45, goldReward: [14, 28],
      abilities: [
        { name: "Chill Touch", chance: 0.3, appliesEffect: { type: "poison", damage: 3, duration: 2 }, message: "The Ghost's icy touch seeps into your bones!" },
        { name: "Wail", chance: 0.15, appliesEffect: { type: "stun", duration: 1 }, message: "The Ghost's wail freezes you in terror!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "ectoplasm", chance: 0.5 },
        { itemId: "mana-potion", chance: 0.25 }
      ]
    },
    wraith: {
      id: "wraith", name: "Wraith",
      portrait: "assets/portraits/wraith-enemy.png",
      hp: 50, attack: 18, defense: 4,
      xpReward: 55, goldReward: [18, 38],
      abilities: [
        { name: "Life Drain", chance: 0.25, multiplier: 1.5, message: "The Wraith drains your life force!" },
        { name: "Shadow Curse", chance: 0.2, appliesEffect: { type: "bleed", damage: 4, duration: 3 }, message: "The Wraith marks you with a shadow curse! You bleed!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "ectoplasm", chance: 0.6 },
        { itemId: "wraith-helm", chance: 0.05 },
        { itemId: "greater-health-potion", chance: 0.1 }
      ]
    },
    necromancer: {
      id: "necromancer", name: "Necromancer",
      portrait: "assets/portraits/necromancer-enemy.png",
      hp: 40, attack: 20, defense: 3,
      xpReward: 60, goldReward: [22, 42],
      abilities: [
        { name: "Death Bolt", chance: 0.3, multiplier: 1.6, message: "The Necromancer fires a bolt of pure death!" },
        { name: "Corpse Poison", chance: 0.25, appliesEffect: { type: "poison", damage: 4, duration: 3 }, message: "Necrotic energy poisons your blood!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "bone-fragment", chance: 0.6 },
        { itemId: "spectral-staff", chance: 0.04 },
        { itemId: "greater-mana-potion", chance: 0.15 },
        { itemId: "spirit-amulet", chance: 0.03 }
      ]
    },
    "lich-lord": {
      id: "lich-lord", name: "Lich Lord",
      portrait: "assets/portraits/lich-lord-enemy.png",
      hp: 240, attack: 24, defense: 10,
      xpReward: 400, goldReward: [140, 250],
      isBoss: true,
      abilities: [
        { name: "Soul Rend", chance: 0.25, multiplier: 2.0, message: "The Lich Lord rends your very soul!" },
        { name: "Death Curse", chance: 0.25, appliesEffect: { type: "bleed", damage: 5, duration: 3 }, message: "A death curse writhes through your veins!" },
        { name: "Dark Empowerment", chance: 0.15, selfBuff: { attack: 3 }, message: "The Lich Lord channels dark power! ATK up!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "shadow-blade", chance: 0.35 },
        { itemId: "runed-armor", chance: 0.25 },
        { itemId: "spirit-amulet", chance: 0.3 },
        { itemId: "greater-health-potion", chance: 1.0 }
      ]
    },

    // ===========================
    // --- DRAGON'S LAIR (Lv 14+) ---
    // ===========================
    drake: {
      id: "drake", name: "Young Drake",
      portrait: "assets/portraits/drake-enemy.png",
      hp: 70, attack: 18, defense: 9,
      xpReward: 70, goldReward: [30, 55],
      abilities: [
        { name: "Fire Breath", chance: 0.3, multiplier: 1.5, message: "The Drake breathes scorching flame!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "dragon-scale", chance: 0.3 },
        { itemId: "greater-health-potion", chance: 0.2 }
      ]
    },
    "dragon-cultist": {
      id: "dragon-cultist", name: "Dragon Cultist",
      portrait: "assets/portraits/dragon-cultist-enemy.png",
      hp: 55, attack: 20, defense: 6,
      xpReward: 65, goldReward: [25, 45],
      abilities: [
        { name: "Dark Ritual", chance: 0.2, selfBuff: { attack: 3 }, message: "The Cultist performs a dark ritual! ATK up!" },
        { name: "Fire Bolt", chance: 0.3, multiplier: 1.4, message: "The Cultist hurls a bolt of dragonfire!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "greater-mana-potion", chance: 0.2 },
        { itemId: "bone-fragment", chance: 0.3 },
        { itemId: "shadow-blade", chance: 0.03 }
      ]
    },
    "elder-wyrm": {
      id: "elder-wyrm", name: "Elder Wyrm",
      portrait: "assets/portraits/elder-wyrm-enemy.png",
      hp: 400, attack: 30, defense: 14,
      xpReward: 600, goldReward: [250, 500],
      isBoss: true, isFinalBoss: true,
      abilities: [
        { name: "Dragon Fire", chance: 0.25, multiplier: 2.0, message: "The Elder Wyrm engulfs you in dragonfire!" },
        { name: "Tail Sweep", chance: 0.2, multiplier: 1.5, appliesEffect: { type: "stun", duration: 1 }, message: "A massive tail sweep sends you flying!" },
        { name: "Ancient Roar", chance: 0.15, selfBuff: { attack: 4 }, message: "The Elder Wyrm roars with primordial fury! ATK up!" },
        { name: "Immolate", chance: 0.2, appliesEffect: { type: "bleed", damage: 6, duration: 3 }, message: "Dragonfire clings to you! Burning!" }
      ],
      statusEffects: [],
      loot: [
        { itemId: "dragon-slayer", chance: 0.4 },
        { itemId: "dragonscale-armor", chance: 0.3 },
        { itemId: "dragonscale-helm", chance: 0.3 },
        { itemId: "dragon-greaves", chance: 0.3 },
        { itemId: "dragon-fang-necklace", chance: 0.4 },
        { itemId: "greater-health-potion", chance: 1.0 },
        { itemId: "greater-mana-potion", chance: 1.0 }
      ]
    }
  };

  function get(id) {
    var template = catalog[id];
    if (!template) return null;
    return {
      id: template.id,
      name: template.name,
      portrait: template.portrait,
      hp: template.hp,
      maxHp: template.hp,
      attack: template.attack,
      defense: template.defense,
      xpReward: template.xpReward,
      goldReward: template.goldReward,
      loot: template.loot,
      isBoss: template.isBoss || false,
      isFinalBoss: template.isFinalBoss || false,
      abilities: template.abilities || [],
      statusEffects: []
    };
  }

  function getRandomForArea(area) {
    var pool;
    if (area === "goblin-cave") {
      pool = ["goblin", "goblin", "goblin", "goblin-brute", "goblin-shaman", "goblin-assassin"];
    } else if (area === "bandit-camp") {
      pool = ["bandit", "bandit", "bandit-archer", "bandit-brute"];
    } else if (area === "dark-forest") {
      pool = ["wolf", "wolf", "dire-wolf", "forest-witch", "treant"];
    } else if (area === "haunted-ruins") {
      pool = ["skeleton", "skeleton", "ghost", "wraith", "necromancer"];
    } else if (area === "dragons-lair") {
      pool = ["drake", "drake", "dragon-cultist"];
    } else {
      pool = ["goblin"];
    }
    return get(pool[Math.floor(Math.random() * pool.length)]);
  }

  function getBoss(area) {
    if (area === "goblin-cave") return get("goblin-king");
    if (area === "bandit-camp") return get("bandit-leader");
    if (area === "dark-forest") return get("forest-guardian");
    if (area === "haunted-ruins") return get("lich-lord");
    if (area === "dragons-lair") return get("elder-wyrm");
    return null;
  }

  function getAllIds() {
    return Object.keys(catalog);
  }

  return { get: get, getRandomForArea: getRandomForArea, getBoss: getBoss, getAllIds: getAllIds };
})();
