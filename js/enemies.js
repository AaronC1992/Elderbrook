/* enemies.js - Chapter 1 enemy definitions */
var Enemies = (function () {

  var enemies = {
    /* ── Tier 1 (Forest Road) ── */
    "wolf": {
      id: "wolf", name: "Wolf", portrait: "assets/portraits/wolf-enemy.png",
      hp: 18, attack: 4, defense: 1, xp: 8, gold: [2, 5],
      loot: [
        { id: "wolf-pelt", chance: 0.40 },
        { id: "torn-cloth", chance: 0.20 },
        { id: "beast-sinew", chance: 0.10 }
      ],
      abilities: []
    },
    "goblin-scout": {
      id: "goblin-scout", name: "Goblin Scout", portrait: "assets/portraits/goblin-scout-enemy.png",
      hp: 15, attack: 3, defense: 1, xp: 10, gold: [3, 6],
      loot: [
        { id: "goblin-fang", chance: 0.40 },
        { id: "lesser-health-potion", chance: 0.10 },
        { id: "supply-note", chance: 0.12 },
        { id: "tomas-ledger", chance: 0.08 }
      ],
      abilities: []
    },
    "goblin-sneak": {
      id: "goblin-sneak", name: "Goblin Sneak", portrait: "assets/portraits/goblin-enemy.png",
      hp: 18, attack: 5, defense: 1, xp: 12, gold: [4, 7],
      loot: [
        { id: "goblin-fang", chance: 0.35 },
        { id: "rusted-scrap", chance: 0.20 },
        { id: "shadow-essence", chance: 0.05 },
        { id: "tomas-ledger", chance: 0.06 }
      ],
      abilities: [
        { name: "Backstab", chance: 0.25, multiplier: 1.4 },
        { name: "Poison Scratch", chance: 0.15, effect: { type: "poison", damage: 2, turns: 2 } }
      ]
    },

    /* ── Tier 2 (Goblin Trail / Watch Post) ── */
    "goblin-raider": {
      id: "goblin-raider", name: "Goblin Raider", portrait: "assets/portraits/goblin_raider_enemy.png",
      hp: 22, attack: 5, defense: 2, xp: 15, gold: [5, 10],
      loot: [
        { id: "goblin-fang", chance: 0.40 },
        { id: "goblin-scrap", chance: 0.30 },
        { id: "health-potion", chance: 0.08 },
        { id: "stolen-supply-crate", chance: 0.15 },
        { id: "iron-ore", chance: 0.08 },
        { id: "moonpetal", chance: 0.05 }
      ],
      abilities: [
        { name: "Reckless Swing", chance: 0.20, multiplier: 1.3, effect: { type: "weakness", damage: 0, turns: 2 } }
      ]
    },
    "goblin-archer": {
      id: "goblin-archer", name: "Goblin Archer", portrait: "assets/portraits/goblin-archer-enemy.png",
      hp: 16, attack: 7, defense: 1, xp: 14, gold: [4, 9],
      loot: [
        { id: "goblin-fang", chance: 0.35 },
        { id: "torn-cloth", chance: 0.25 },
        { id: "beast-sinew", chance: 0.08 },
        { id: "stolen-supply-crate", chance: 0.10 },
        { id: "moonpetal", chance: 0.05 }
      ],
      abilities: [
        { name: "Aimed Shot", chance: 0.20, multiplier: 1.5 },
        { name: "Fire Arrow", chance: 0.12, effect: { type: "burn", damage: 3, turns: 2 } }
      ]
    },
    "wolf-pack": {
      id: "wolf-pack", name: "Wolf Pack Leader", portrait: "assets/portraits/wolf-enemy.png",
      hp: 25, attack: 5, defense: 2, xp: 16, gold: [3, 6],
      loot: [
        { id: "wolf-pelt", chance: 0.60 },
        { id: "beast-sinew", chance: 0.15 }
      ],
      abilities: [
        { name: "Pack Howl", chance: 0.15, buff: { stat: "attack", amount: 2, turns: 3 } },
        { name: "Terrifying Growl", chance: 0.12, effect: { type: "fear", damage: 0, turns: 2 } }
      ]
    },

    /* ── Tier 3 (Goblin Cave) ── */
    "goblin-guard": {
      id: "goblin-guard", name: "Goblin Guard", portrait: "assets/portraits/goblin-brute-enemy.png",
      hp: 28, attack: 6, defense: 4, xp: 20, gold: [6, 12],
      loot: [
        { id: "goblin-scrap", chance: 0.40 },
        { id: "iron-helm", chance: 0.03 },
        { id: "guard-badge", chance: 0.08 },
        { id: "iron-ore", chance: 0.10 },
        { id: "goblin-slayer-gloves", chance: 0.03 },
        { id: "patrol-logs", chance: 0.12 }
      ],
      abilities: [
        { name: "Shield Slam", chance: 0.20, multiplier: 1.2, effect: { type: "stun", damage: 0, turns: 1 } }
      ]
    },
    "goblin-shaman": {
      id: "goblin-shaman", name: "Goblin Shaman", portrait: "assets/portraits/goblin-shaman-enemy.png",
      hp: 20, attack: 8, defense: 2, xp: 22, gold: [5, 11],
      loot: [
        { id: "goblin-fang", chance: 0.30 },
        { id: "mana-potion", chance: 0.15 },
        { id: "cave-herb", chance: 0.25 },
        { id: "enchanted-shard", chance: 0.05 },
        { id: "shadow-essence", chance: 0.08 },
        { id: "moonpetal", chance: 0.12 }
      ],
      abilities: [
        { name: "Hex", chance: 0.30, effect: { type: "poison", damage: 2, turns: 3 } },
        { name: "Dark Bolt", chance: 0.20, multiplier: 1.3, effect: { type: "silence", damage: 0, turns: 2 } },
        { name: "Flame Burst", chance: 0.15, effect: { type: "burn", damage: 3, turns: 2 } }
      ]
    },
    "goblin-brute": {
      id: "goblin-brute", name: "Goblin Brute", portrait: "assets/portraits/goblin-brute-enemy.png",
      hp: 35, attack: 8, defense: 3, xp: 25, gold: [8, 15],
      loot: [
        { id: "goblin-scrap", chance: 0.50 },
        { id: "health-potion", chance: 0.15 },
        { id: "iron-ore", chance: 0.10 },
        { id: "goblin-slayer-bracers", chance: 0.03 },
        { id: "moonpetal", chance: 0.05 }
      ],
      abilities: [
        { name: "Crushing Blow", chance: 0.25, multiplier: 1.5 },
        { name: "Ground Pound", chance: 0.15, effect: { type: "stun", damage: 0, turns: 1 } }
      ]
    },

    /* ── Bandits ── */
    "bandit": {
      id: "bandit", name: "Bandit", portrait: "assets/portraits/bandit_enemy.png",
      hp: 24, attack: 6, defense: 2, xp: 16, gold: [5, 10],
      loot: [
        { id: "torn-cloth", chance: 0.35 },
        { id: "rusted-scrap", chance: 0.25 },
        { id: "health-potion", chance: 0.10 },
        { id: "iron-ore", chance: 0.08 },
        { id: "stolen-supply-crate", chance: 0.12 }
      ],
      abilities: [
        { name: "Ambush Strike", chance: 0.25, multiplier: 1.4 },
        { name: "Dirty Trick", chance: 0.15, effect: { type: "weakness", damage: 0, turns: 2 } }
      ]
    },

    /* ── Winter Enemies ── */
    "snow-wolf": {
      id: "snow-wolf", name: "Snow Wolf", portrait: "assets/portraits/Frostbitten fury of the snow wolf.png",
      hp: 24, attack: 6, defense: 2, xp: 12, gold: [3, 7],
      loot: [
        { id: "wolf-pelt", chance: 0.50 },
        { id: "beast-sinew", chance: 0.15 },
        { id: "torn-cloth", chance: 0.15 }
      ],
      abilities: [
        { name: "Frostbite", chance: 0.20, effect: { type: "weakness", damage: 0, turns: 2 } },
        { name: "Pack Howl", chance: 0.12, buff: { stat: "attack", amount: 2, turns: 3 } }
      ]
    },
    "frost-goblin": {
      id: "frost-goblin", name: "Frost-bound Goblin", portrait: "assets/portraits/Frost-bound snow goblin warrior.png",
      hp: 22, attack: 5, defense: 3, xp: 14, gold: [4, 8],
      loot: [
        { id: "goblin-fang", chance: 0.40 },
        { id: "goblin-scrap", chance: 0.25 },
        { id: "health-potion", chance: 0.10 }
      ],
      abilities: [
        { name: "Frozen Strike", chance: 0.20, multiplier: 1.3, effect: { type: "stun", damage: 0, turns: 1 } },
        { name: "Ice Shard", chance: 0.15, effect: { type: "bleed", damage: 2, turns: 2 } }
      ]
    },
    "snow-bandit": {
      id: "snow-bandit", name: "Frostbitten Bandit", portrait: "assets/portraits/Frostbitten bandit in a frigid stance.png",
      hp: 26, attack: 7, defense: 3, xp: 18, gold: [6, 12],
      loot: [
        { id: "torn-cloth", chance: 0.35 },
        { id: "rusted-scrap", chance: 0.25 },
        { id: "health-potion", chance: 0.12 },
        { id: "iron-ore", chance: 0.10 },
        { id: "stolen-supply-crate", chance: 0.15 }
      ],
      abilities: [
        { name: "Frostbite Slash", chance: 0.25, multiplier: 1.4, effect: { type: "weakness", damage: 0, turns: 2 } },
        { name: "Blinding Snow", chance: 0.15, effect: { type: "stun", damage: 0, turns: 1 } }
      ]
    },

    /* ── Boss ── */
    "goblin-chief-grisk": {
      id: "goblin-chief-grisk", name: "Goblin Chief Grisk", portrait: "assets/portraits/goblin-king-enemy.png",
      hp: 80, attack: 10, defense: 5, xp: 200, gold: [50, 80],
      isBoss: true,
      phases: [
        { threshold: 0.75, name: "Enraged", message: "Grisk snarls with fury! His attacks grow wilder!", buffs: { attack: 2 } },
        { threshold: 0.50, name: "Desperate", message: "Grisk slams the ground! The cave trembles!", buffs: { attack: 2, defense: -1 }, ability: { name: "Cave Collapse", chance: 0.30, effect: { type: "stun", damage: 4, turns: 1 } } },
        { threshold: 0.25, name: "Last Stand", message: "Grisk howls — a dark sigil glows on his blade!", buffs: { attack: 3 }, ability: { name: "Shadow Strike", chance: 0.35, multiplier: 2.0, effect: { type: "fear", damage: 0, turns: 2 } } }
      ],
      loot: [
        { id: "chiefs-relic", chance: 1.0 },
        { id: "goblin-orders", chance: 1.0 },
        { id: "greater-health-potion", chance: 1.0 },
        { id: "goblin-chieftain-crest", chance: 1.0 },
        { id: "grisk-cleaver", chance: 0.30 },
        { id: "goblin-slayer-helm", chance: 0.20 },
        { id: "goblin-slayer-chest", chance: 0.20 },
        { id: "enchanted-shard", chance: 0.25 },
        { id: "shadow-essence", chance: 0.35 }
      ],
      abilities: [
        { name: "Royal Command", chance: 0.30, multiplier: 1.7 },
        { name: "War Cry", chance: 0.20, buff: { stat: "attack", amount: 3, turns: 2 } },
        { name: "Poisoned Blade", chance: 0.25, effect: { type: "poison", damage: 3, turns: 2 } },
        { name: "Bleeding Slash", chance: 0.20, multiplier: 1.2, effect: { type: "bleed", damage: 3, turns: 3 } }
      ]
    }
  };

  function get(id) { return enemies[id] || null; }

  /* Map of base enemies to their winter variants */
  var winterSwaps = {
    "wolf": "snow-wolf",
    "wolf-pack": "snow-wolf",
    "goblin-scout": "frost-goblin",
    "goblin-sneak": "frost-goblin",
    "bandit": "snow-bandit"
  };

  function getRandomForArea(areaId) {
    var loc = Chapter1.getLocation(areaId);
    if (!loc || !loc.enemies || loc.enemies.length === 0) return null;
    var pool = loc.enemies;
    var pick = pool[Math.floor(Math.random() * pool.length)];

    // In winter, swap eligible enemies for their winter variants
    if (Player.getSeason() === "winter" && winterSwaps[pick]) {
      pick = winterSwaps[pick];
    }

    var template = enemies[pick];
    if (!template) return null;
    var e = JSON.parse(JSON.stringify(template));

    // Winter makes all enemies tougher — harsher conditions, desperate creatures
    if (Player.getSeason() === "winter") {
      e.hp = Math.floor(e.hp * 1.2);
      e.attack += 2;
      e.defense += 1;
      e.xp = Math.floor(e.xp * 1.25);
      if (e.gold) {
        e.gold[0] = Math.floor(e.gold[0] * 1.2);
        e.gold[1] = Math.floor(e.gold[1] * 1.2);
      }
    }

    return e;
  }

  function getBoss(id) {
    var e = enemies[id];
    if (!e || !e.isBoss) return null;
    return JSON.parse(JSON.stringify(e));
  }

  function getAllIds() {
    return Object.keys(enemies);
  }

  /* ── Encounter modifiers for varied combat (#15) ── */
  var encounterModifiers = [
    { id: "normal", weight: 50, label: "", modify: function(e) { return e; } },
    { id: "ambush", weight: 15, label: "Ambush!", modify: function(e) { e.ambush = true; return e; } },
    { id: "tough", weight: 12, label: "Tough Enemy", modify: function(e) { e.hp = Math.floor(e.hp * 1.3); e.xp = Math.floor(e.xp * 1.2); return e; } },
    { id: "frenzied", weight: 10, label: "Frenzied", modify: function(e) { e.attack += 2; e.defense = Math.max(0, e.defense - 1); e.xp = Math.floor(e.xp * 1.15); return e; } },
    { id: "weakened", weight: 8, label: "Weakened", modify: function(e) { e.hp = Math.floor(e.hp * 0.7); e.attack = Math.max(1, e.attack - 1); return e; } },
    { id: "cornered", weight: 5, label: "Cornered!", modify: function(e) { e.hp = Math.floor(e.hp * 1.15); e.attack += 1; e.cornered = true; return e; } }
  ];

  function rollEncounterModifier() {
    var total = 0;
    for (var i = 0; i < encounterModifiers.length; i++) total += encounterModifiers[i].weight;
    var roll = Math.random() * total;
    var acc = 0;
    for (var j = 0; j < encounterModifiers.length; j++) {
      acc += encounterModifiers[j].weight;
      if (roll < acc) return encounterModifiers[j];
    }
    return encounterModifiers[0];
  }

  return {
    get: get,
    getRandomForArea: getRandomForArea,
    getBoss: getBoss,
    getAllIds: getAllIds,
    rollEncounterModifier: rollEncounterModifier
  };
})();
