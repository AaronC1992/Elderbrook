/* enemies.js - Enemy definitions */
var Enemies = (function () {
  var catalog = {
    goblin: {
      id: "goblin",
      name: "Goblin",
      portrait: "assets/portraits/goblin-enemy.png",
      hp: 20,
      attack: 4,
      defense: 1,
      xpReward: 12,
      goldReward: [3, 8],      // [min, max]
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
      loot: [
        { itemId: "goblin-ear", chance: 0.5 },
        { itemId: "mana-potion", chance: 0.3 },
        { itemId: "wooden-staff", chance: 0.04 }
      ]
    }
  };

  function get(id) {
    var template = catalog[id];
    if (!template) return null;
    // Return a copy so each fight gets its own HP
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
      loot: template.loot
    };
  }

  function getRandomForArea(area) {
    var pool;
    if (area === "wilderness") {
      pool = ["goblin", "goblin", "goblin", "goblin-brute", "goblin-shaman"];
    } else {
      pool = ["goblin"];
    }
    return get(pool[Math.floor(Math.random() * pool.length)]);
  }

  return { get: get, getRandomForArea: getRandomForArea };
})();
