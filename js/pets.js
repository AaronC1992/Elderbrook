/* pets.js - Pet definitions, bonuses, and shop logic */
var Pets = (function () {

  var pets = {
    "timber-wolf": {
      id: "timber-wolf",
      name: "Timber Wolf",
      portrait: "assets/portraits/pet-timber-wolf.png",
      price: 120,
      description: "A loyal young wolf. Boosts attack by 1 and has a chance to bite enemies.",
      bonus: { attack: 1 },
      passive: { type: "extra-hit", chance: 0.15, damagePercent: 0.3, message: "Your wolf lunges and bites for" },
      source: "pet-shop"
    },
    "barn-owl": {
      id: "barn-owl",
      name: "Barn Owl",
      portrait: "assets/portraits/pet-barn-owl.png",
      price: 100,
      description: "A keen-eyed owl. Boosts dexterity by 1 and warns of ambushes.",
      bonus: { dexterity: 1 },
      passive: { type: "ambush-protect", chance: 0.50, message: "Your owl hoots a warning! Ambush prevented." },
      source: "pet-shop"
    },
    "tabby-cat": {
      id: "tabby-cat",
      name: "Tabby Cat",
      portrait: "assets/portraits/pet-tabby-cat.png",
      price: 60,
      description: "A street-smart cat. Finds extra gold after battles.",
      bonus: {},
      passive: { type: "gold-find", bonusGold: 3, message: "Your cat paws at something shiny..." },
      source: "pet-shop"
    },
    "raven": {
      id: "raven",
      name: "Raven",
      portrait: "assets/portraits/pet-raven.png",
      price: 150,
      description: "A mysterious raven. Boosts intelligence by 1 and restores 2 MP per turn.",
      bonus: { intelligence: 1 },
      passive: { type: "mana-regen", amount: 2, message: "Your raven caws softly, channeling arcane energy." },
      source: "pet-shop"
    },
    "fox-kit": {
      id: "fox-kit",
      name: "Fox Kit",
      portrait: "assets/portraits/pet-fox-kit.png",
      price: 200,
      description: "A quick red fox. Boosts dexterity by 2 and improves escape chance.",
      bonus: { dexterity: 2 },
      passive: { type: "escape-boost", bonusChance: 0.20, message: "Your fox darts ahead, leading the way to safety!" },
      source: "merchant"
    },
    "ferret": {
      id: "ferret",
      name: "Ferret",
      portrait: "assets/portraits/pet-ferret.png",
      price: 180,
      description: "A sneaky ferret. Boosts dexterity by 1 and finds extra loot from enemies.",
      bonus: { dexterity: 1 },
      passive: { type: "loot-find", chance: 0.20, message: "Your ferret scurries over and digs up something!" },
      source: "merchant"
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

  /* Get pets sold by the traveling merchant */
  function getMerchantPets() {
    var list = [];
    var keys = Object.keys(pets);
    for (var i = 0; i < keys.length; i++) {
      if (pets[keys[i]].source === "merchant") list.push(pets[keys[i]]);
    }
    return list;
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

  return {
    get: get,
    getAll: getAll,
    getShopPets: getShopPets,
    getMerchantPets: getMerchantPets,
    getActiveBonus: getActiveBonus,
    getActivePassive: getActivePassive
  };
})();
