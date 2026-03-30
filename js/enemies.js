/* enemies.js - Enemy definitions */
var Enemies = (function () {
  var catalog = {
    // --- Goblin Cave ---
    goblin: {
      id: "goblin",
      name: "Goblin",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 20,
      attack: 4,
      defense: 1,
      xpReward: 12,
      goldReward: [3, 8],
      abilities: [],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.6 },
        { itemId: "health-potion", chance: 0.15 },
        { itemId: "rusty-dagger", chance: 0.05 }
      ]
    },
    "goblin-brute": {
      id: "goblin-brute",
      name: "Goblin Brute",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 35,
      attack: 7,
      defense: 3,
      xpReward: 22,
      goldReward: [6, 14],
      abilities: [{ name: "Crushing Blow", chance: 0.25, multiplier: 1.5, message: "The Goblin Brute lands a crushing blow!" }],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.7 },
        { itemId: "health-potion", chance: 0.25 },
        { itemId: "iron-sword", chance: 0.05 }
      ]
    },
    "goblin-shaman": {
      id: "goblin-shaman",
      name: "Goblin Shaman",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 18,
      attack: 8,
      defense: 1,
      xpReward: 18,
      goldReward: [5, 12],
      abilities: [{ name: "Hex", chance: 0.3, appliesEffect: { type: "poison", damage: 2, duration: 3 }, message: "The Goblin Shaman hexes you with poison!" }],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.5 },
        { itemId: "mana-potion", chance: 0.3 },
        { itemId: "wooden-staff", chance: 0.04 }
      ]
    },
    "goblin-assassin": {
      id: "goblin-assassin",
      name: "Goblin Assassin",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 22,
      attack: 10,
      defense: 2,
      xpReward: 25,
      goldReward: [8, 16],
      abilities: [{ name: "Poisoned Blade", chance: 0.35, appliesEffect: { type: "poison", damage: 3, duration: 2 }, message: "The Goblin Assassin cuts you with a poisoned blade!" }],
      statusEffects: [],
      loot: [
        { itemId: "goblin-ear", chance: 0.6 },
        { itemId: "health-potion", chance: 0.2 },
        { itemId: "rusty-dagger", chance: 0.1 }
      ]
    },
    "goblin-king": {
      id: "goblin-king",
      name: "Goblin King",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 80,
      attack: 12,
      defense: 5,
      xpReward: 100,
      goldReward: [40, 80],
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

    // --- Bandit Camp ---
    bandit: {
      id: "bandit",
      name: "Bandit",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 30,
      attack: 8,
      defense: 3,
      xpReward: 20,
      goldReward: [8, 18],
      abilities: [],
      statusEffects: [],
      loot: [
        { itemId: "health-potion", chance: 0.2 },
        { itemId: "iron-sword", chance: 0.08 }
      ]
    },
    "bandit-archer": {
      id: "bandit-archer",
      name: "Bandit Archer",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 25,
      attack: 11,
      defense: 2,
      xpReward: 24,
      goldReward: [10, 20],
      abilities: [{ name: "Aimed Shot", chance: 0.3, multiplier: 1.6, message: "The Bandit Archer fires a precise aimed shot!" }],
      statusEffects: [],
      loot: [
        { itemId: "short-bow", chance: 0.08 },
        { itemId: "health-potion", chance: 0.15 }
      ]
    },
    "bandit-brute": {
      id: "bandit-brute",
      name: "Bandit Enforcer",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 45,
      attack: 10,
      defense: 5,
      xpReward: 30,
      goldReward: [12, 25],
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
      id: "bandit-leader",
      name: "Bandit Leader",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 100,
      attack: 14,
      defense: 7,
      xpReward: 140,
      goldReward: [60, 120],
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
    } else {
      pool = ["goblin"];
    }
    return get(pool[Math.floor(Math.random() * pool.length)]);
  }

  function getBoss(area) {
    if (area === "goblin-cave") return get("goblin-king");
    if (area === "bandit-camp") return get("bandit-leader");
    return null;
  }

  return { get: get, getRandomForArea: getRandomForArea, getBoss: getBoss };
})();
