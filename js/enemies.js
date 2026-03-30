/* enemies.js - Chapter 1 enemy definitions */
var Enemies = (function () {

  var enemies = {
    /* ── Tier 1 (Forest Road) ── */
    "wolf": {
      id: "wolf", name: "Wolf", portrait: "assets/portraits/wolf-enemy.png",
      hp: 18, attack: 4, defense: 1, xp: 8, gold: [2, 5],
      loot: [
        { id: "wolf-pelt", chance: 0.40 },
        { id: "torn-cloth", chance: 0.20 }
      ],
      abilities: []
    },
    "goblin-scout": {
      id: "goblin-scout", name: "Goblin Scout", portrait: "assets/portraits/goblin-enemy.png",
      hp: 15, attack: 3, defense: 1, xp: 10, gold: [3, 6],
      loot: [
        { id: "goblin-fang", chance: 0.40 },
        { id: "lesser-health-potion", chance: 0.10 },
        { id: "supply-note", chance: 0.12 }
      ],
      abilities: []
    },
    "goblin-sneak": {
      id: "goblin-sneak", name: "Goblin Sneak", portrait: "assets/portraits/goblin-enemy.png",
      hp: 18, attack: 5, defense: 1, xp: 12, gold: [4, 7],
      loot: [
        { id: "goblin-fang", chance: 0.35 },
        { id: "rusted-scrap", chance: 0.20 }
      ],
      abilities: [
        { name: "Backstab", chance: 0.25, multiplier: 1.4 }
      ]
    },

    /* ── Tier 2 (Goblin Trail / Watch Post) ── */
    "goblin-raider": {
      id: "goblin-raider", name: "Goblin Raider", portrait: "assets/portraits/goblin-enemy.png",
      hp: 22, attack: 5, defense: 2, xp: 15, gold: [5, 10],
      loot: [
        { id: "goblin-fang", chance: 0.40 },
        { id: "goblin-scrap", chance: 0.30 },
        { id: "health-potion", chance: 0.08 },
        { id: "stolen-supply-crate", chance: 0.10 }
      ],
      abilities: []
    },
    "goblin-archer": {
      id: "goblin-archer", name: "Goblin Archer", portrait: "assets/portraits/goblin-enemy.png",
      hp: 16, attack: 7, defense: 1, xp: 14, gold: [4, 9],
      loot: [
        { id: "goblin-fang", chance: 0.35 },
        { id: "torn-cloth", chance: 0.25 }
      ],
      abilities: [
        { name: "Aimed Shot", chance: 0.20, multiplier: 1.5 }
      ]
    },
    "wolf-pack": {
      id: "wolf-pack", name: "Wolf Pack Leader", portrait: "assets/portraits/wolf-enemy.png",
      hp: 25, attack: 5, defense: 2, xp: 16, gold: [3, 6],
      loot: [
        { id: "wolf-pelt", chance: 0.60 }
      ],
      abilities: [
        { name: "Pack Howl", chance: 0.15, buff: { stat: "attack", amount: 2, turns: 3 } }
      ]
    },

    /* ── Tier 3 (Goblin Cave) ── */
    "goblin-guard": {
      id: "goblin-guard", name: "Goblin Guard", portrait: "assets/portraits/goblin-brute-enemy.png",
      hp: 28, attack: 6, defense: 4, xp: 20, gold: [6, 12],
      loot: [
        { id: "goblin-scrap", chance: 0.40 },
        { id: "iron-helm", chance: 0.03 },
        { id: "guard-badge", chance: 0.08 }
      ],
      abilities: []
    },
    "goblin-shaman": {
      id: "goblin-shaman", name: "Goblin Shaman", portrait: "assets/portraits/goblin-shaman-enemy.png",
      hp: 20, attack: 8, defense: 2, xp: 22, gold: [5, 11],
      loot: [
        { id: "goblin-fang", chance: 0.30 },
        { id: "mana-potion", chance: 0.15 },
        { id: "cave-herb", chance: 0.25 }
      ],
      abilities: [
        { name: "Hex", chance: 0.30, effect: { type: "poison", damage: 2, turns: 3 } }
      ]
    },
    "goblin-brute": {
      id: "goblin-brute", name: "Goblin Brute", portrait: "assets/portraits/goblin-brute-enemy.png",
      hp: 35, attack: 8, defense: 3, xp: 25, gold: [8, 15],
      loot: [
        { id: "goblin-scrap", chance: 0.50 },
        { id: "health-potion", chance: 0.15 }
      ],
      abilities: [
        { name: "Crushing Blow", chance: 0.25, multiplier: 1.5 }
      ]
    },

    /* ── Boss ── */
    "goblin-chief-grisk": {
      id: "goblin-chief-grisk", name: "Goblin Chief Grisk", portrait: "assets/portraits/goblin-king-enemy.png",
      hp: 80, attack: 10, defense: 5, xp: 200, gold: [50, 80],
      isBoss: true,
      loot: [
        { id: "chiefs-relic", chance: 1.0 },
        { id: "goblin-orders", chance: 1.0 },
        { id: "greater-health-potion", chance: 1.0 },
        { id: "reinforced-sword", chance: 0.25 },
        { id: "iron-chestplate", chance: 0.20 }
      ],
      abilities: [
        { name: "Royal Command", chance: 0.30, multiplier: 1.7 },
        { name: "War Cry", chance: 0.20, buff: { stat: "attack", amount: 3, turns: 2 } },
        { name: "Poisoned Blade", chance: 0.25, effect: { type: "poison", damage: 3, turns: 2 } }
      ]
    }
  };

  function get(id) { return enemies[id] || null; }

  function getRandomForArea(areaId) {
    var loc = Chapter1.getLocation(areaId);
    if (!loc || !loc.enemies || loc.enemies.length === 0) return null;
    var pool = loc.enemies;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    var template = enemies[pick];
    if (!template) return null;
    return JSON.parse(JSON.stringify(template));
  }

  function getBoss(id) {
    var e = enemies[id];
    if (!e || !e.isBoss) return null;
    return JSON.parse(JSON.stringify(e));
  }

  function getAllIds() {
    return Object.keys(enemies);
  }

  return {
    get: get,
    getRandomForArea: getRandomForArea,
    getBoss: getBoss,
    getAllIds: getAllIds
  };
})();
