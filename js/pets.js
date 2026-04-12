/* pets.js - Pet definitions, bonuses, and shop logic */
var Pets = (function () {

  var pets = {
    "timber-wolf": {
      id: "timber-wolf",
      name: "Timber Wolf",
      portrait: "assets/portraits/pet-timber-wolf.png",
      price: 250,
      description: "A loyal young wolf. Boosts attack by 1 and has a chance to bite enemies.",
      bonus: { attack: 1 },
      passive: { type: "extra-hit", chance: 0.15, damagePercent: 0.3, message: "Your wolf lunges and bites for" },
      source: "pet-shop",
      combatDef: {
        hp: 30, attack: 7, defense: 3,
        abilities: [
          { name: "Ferocious Bite", chance: 0.25, multiplier: 1.6, effect: { type: "bleed", damage: 2, turns: 2 } }
        ]
      }
    },
    "barn-owl": {
      id: "barn-owl",
      name: "Barn Owl",
      portrait: "assets/portraits/pet-barn-owl.png",
      price: 200,
      description: "A keen-eyed owl. Boosts dexterity by 1 and warns of ambushes.",
      bonus: { dexterity: 1 },
      passive: { type: "ambush-protect", chance: 0.50, message: "Your owl hoots a warning! Ambush prevented." },
      source: "pet-shop",
      combatDef: {
        hp: 20, attack: 4, defense: 2,
        abilities: [
          { name: "Talon Swipe", chance: 0.25, multiplier: 1.4 },
          { name: "Piercing Screech", chance: 0.15, multiplier: 0.5, effect: { type: "fear", turns: 1 } }
        ]
      }
    },
    "tabby-cat": {
      id: "tabby-cat",
      name: "Tabby Cat",
      portrait: "assets/portraits/pet-tabby-cat.png",
      price: 150,
      description: "A street-smart cat. Finds extra gold after battles.",
      bonus: {},
      passive: { type: "gold-find", bonusGold: 3, message: "Your cat paws at something shiny..." },
      source: "pet-shop",
      combatDef: {
        hp: 18, attack: 3, defense: 2,
        abilities: [
          { name: "Lucky Scratch", chance: 0.20, multiplier: 1.3 }
        ]
      }
    },
    "raven": {
      id: "raven",
      name: "Raven",
      portrait: "assets/portraits/pet-raven.png",
      price: 300,
      description: "A mysterious raven. Boosts intelligence by 1 and restores 2 MP per turn.",
      bonus: { intelligence: 1 },
      passive: { type: "mana-regen", amount: 2, message: "Your raven caws softly, channeling arcane energy." },
      source: "pet-shop",
      combatDef: {
        hp: 22, attack: 5, defense: 2,
        abilities: [
          { name: "Arcane Peck", chance: 0.25, multiplier: 1.5 },
          { name: "Mana Channel", type: "mana-restore", chance: 0.20, amount: 4, message: "channels arcane energy to restore your mana!" }
        ]
      }
    },
    "fox-kit": {
      id: "fox-kit",
      name: "Fox Kit",
      portrait: "assets/portraits/pet-fox-kit.png",
      price: 400,
      description: "A quick red fox. Boosts dexterity by 2 and improves escape chance.",
      bonus: { dexterity: 2 },
      passive: { type: "escape-boost", bonusChance: 0.20, message: "Your fox darts ahead, leading the way to safety!" },
      source: "merchant", rarity: 0.60,
      combatDef: {
        hp: 25, attack: 6, defense: 3,
        abilities: [
          { name: "Quick Slash", chance: 0.30, multiplier: 1.5 }
        ]
      }
    },
    "ferret": {
      id: "ferret",
      name: "Ferret",
      portrait: "assets/portraits/pet-ferret.png",
      price: 350,
      description: "A sneaky ferret. Boosts dexterity by 1 and finds extra loot from enemies.",
      bonus: { dexterity: 1 },
      passive: { type: "loot-find", chance: 0.20, message: "Your ferret scurries over and digs up something!" },
      source: "merchant", rarity: 0.60,
      combatDef: {
        hp: 22, attack: 6, defense: 2,
        abilities: [
          { name: "Sneak Bite", chance: 0.25, multiplier: 1.7 },
          { name: "Burrow Strike", chance: 0.15, multiplier: 1.3, effect: { type: "poison", damage: 1, turns: 3 } }
        ]
      }
    },
    "shadow-hound": {
      id: "shadow-hound",
      name: "Shadow Hound",
      portrait: "assets/portraits/pet-shadow-hound.png",
      price: 500,
      description: "A spectral hound from the shadow realm. Boosts attack by 2 and poisons enemies.",
      bonus: { attack: 2 },
      passive: { type: "extra-hit", chance: 0.20, damagePercent: 0.4, message: "Your shadow hound phases through and strikes for" },
      source: "merchant", rarity: 0.35,
      combatDef: {
        hp: 35, attack: 9, defense: 4,
        abilities: [
          { name: "Shadow Fang", chance: 0.30, multiplier: 1.8, effect: { type: "poison", damage: 3, turns: 2 } },
          { name: "Phase Strike", chance: 0.20, multiplier: 2.0 }
        ]
      }
    },
    "frost-serpent": {
      id: "frost-serpent",
      name: "Frost Serpent",
      portrait: "assets/portraits/pet-frost-serpent.png",
      price: 450,
      description: "An icy serpent that chills foes. Boosts intelligence by 2 and slows enemies.",
      bonus: { intelligence: 2 },
      passive: { type: "mana-regen", amount: 3, message: "Your frost serpent hisses, channeling cold energy." },
      source: "merchant", rarity: 0.40,
      combatDef: {
        hp: 28, attack: 7, defense: 3,
        abilities: [
          { name: "Frost Bite", chance: 0.25, multiplier: 1.6, effect: { type: "weakness", damage: 0, turns: 2 } },
          { name: "Ice Coil", chance: 0.15, multiplier: 1.3, effect: { type: "stun", damage: 0, turns: 1 } }
        ]
      }
    },
    "golden-hawk": {
      id: "golden-hawk",
      name: "Golden Hawk",
      portrait: "assets/portraits/pet-golden-hawk.png",
      price: 550,
      description: "A majestic hawk. Boosts dexterity by 3 and grants extra gold after battles.",
      bonus: { dexterity: 3 },
      passive: { type: "gold-find", bonusGold: 5, message: "Your hawk swoops down with something glinting in its talons..." },
      source: "merchant", rarity: 0.25,
      combatDef: {
        hp: 24, attack: 8, defense: 2,
        abilities: [
          { name: "Diving Strike", chance: 0.30, multiplier: 2.0 },
          { name: "Wind Slash", chance: 0.20, multiplier: 1.4, effect: { type: "bleed", damage: 2, turns: 3 } }
        ]
      }
    },
    "ember-sprite": {
      id: "ember-sprite",
      name: "Ember Sprite",
      portrait: "assets/portraits/pet-ember-sprite.png",
      price: 600,
      description: "A tiny fire spirit. Boosts intelligence by 2 and burns enemies in combat.",
      bonus: { intelligence: 2 },
      passive: { type: "extra-hit", chance: 0.18, damagePercent: 0.35, message: "Your ember sprite hurls a fireball for" },
      source: "merchant", rarity: 0.20,
      combatDef: {
        hp: 20, attack: 10, defense: 1,
        abilities: [
          { name: "Flame Lash", chance: 0.30, multiplier: 1.7, effect: { type: "burn", damage: 4, turns: 2 } },
          { name: "Ember Burst", chance: 0.15, multiplier: 1.4 }
        ]
      }
    },
    "baby-dragon": {
      id: "baby-dragon",
      name: "Baby Dragon",
      portrait: "assets/portraits/pet-baby-dragon.png",
      price: 2000,
      description: "An incredibly rare baby dragon. Boosts attack by 3 and intelligence by 3. Breathes fire in combat.",
      bonus: { attack: 3, intelligence: 3 },
      passive: { type: "extra-hit", chance: 0.25, damagePercent: 0.5, message: "Your dragon unleashes a burst of flame for" },
      source: "merchant", rarity: 0.08,
      combatDef: {
        hp: 50, attack: 14, defense: 6,
        abilities: [
          { name: "Fire Breath", chance: 0.30, multiplier: 2.2, effect: { type: "burn", damage: 5, turns: 3 } },
          { name: "Claw Rend", chance: 0.25, multiplier: 1.8, effect: { type: "bleed", damage: 3, turns: 2 } },
          { name: "Wing Buffet", chance: 0.15, multiplier: 1.5, effect: { type: "stun", damage: 0, turns: 1 } }
        ]
      }
    }
  };

  function get(petId) {
    return pets[petId] || null;
  }

  function getAll() {
    var list = [];
    var keys = Object.keys(pets);
    for (var i = 0; i < keys.length; i++) list.push(pets[keys[i]]);
    return list;
  }

  /* Get pets sold at the pet shop */
  function getShopPets() {
    var list = [];
    var keys = Object.keys(pets);
    for (var i = 0; i < keys.length; i++) {
      if (pets[keys[i]].source === "pet-shop") list.push(pets[keys[i]]);
    }
    return list;
  }

  /* Get pets sold by the traveling merchant — random stock based on rarity */
  var _merchantStock = null;
  var _merchantStockDay = -1;

  function getMerchantPets() {
    /* Refresh stock each new in-game day (or first visit) */
    var today = (Player.get() && Player.get().day) || 0;
    if (_merchantStock && _merchantStockDay === today) return _merchantStock;

    var pool = [];
    var keys = Object.keys(pets);
    for (var i = 0; i < keys.length; i++) {
      if (pets[keys[i]].source === "merchant") pool.push(pets[keys[i]]);
    }

    /* Each pet rolls independently against its rarity chance */
    var stock = [];
    for (var j = 0; j < pool.length; j++) {
      var chance = pool[j].rarity || 0.5;
      if (Math.random() < chance) stock.push(pool[j]);
    }

    /* Always have at least 1 pet available so the section isn't empty */
    if (stock.length === 0) {
      /* Pick a random common one (highest rarity value) */
      pool.sort(function(a, b) { return (b.rarity || 0.5) - (a.rarity || 0.5); });
      stock.push(pool[0]);
    }

    _merchantStock = stock;
    _merchantStockDay = today;
    return stock;
  }

  function resetMerchantStock() {
    _merchantStock = null;
    _merchantStockDay = -1;
  }

  /* Get the stat bonuses of the active pet (or empty object) */
  function getActiveBonus() {
    var p = Player.get();
    if (!p || !p.activePet) return {};
    var pet = pets[p.activePet];
    return pet ? (pet.bonus || {}) : {};
  }

  /* Get the active pet's passive data */
  function getActivePassive() {
    var p = Player.get();
    if (!p || !p.activePet) return null;
    var pet = pets[p.activePet];
    return pet ? (pet.passive || null) : null;
  }

  /* Get the active pet's combat definition */
  function getCombatDef() {
    var p = Player.get();
    if (!p || !p.activePet) return null;
    var pet = pets[p.activePet];
    if (!pet || !pet.combatDef) return null;
    var def = pet.combatDef;
    return {
      name: pet.name,
      hp: def.hp,
      attack: def.attack,
      defense: def.defense,
      portrait: pet.portrait,
      abilities: def.abilities || []
    };
  }

  return {
    get: get,
    getAll: getAll,
    getShopPets: getShopPets,
    getMerchantPets: getMerchantPets,
    resetMerchantStock: resetMerchantStock,
    getActiveBonus: getActiveBonus,
    getActivePassive: getActivePassive,
    getCombatDef: getCombatDef
  };
})();
