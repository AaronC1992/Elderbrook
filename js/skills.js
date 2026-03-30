/* skills.js - Player abilities that unlock with level */
var Skills = (function () {
  var catalog = {
    "power-strike": {
      id: "power-strike",
      name: "Power Strike",
      description: "A mighty blow dealing 150% damage.",
      manaCost: 5,
      unlockLevel: 2,
      type: "attack",
      damageMultiplier: 1.5,
      cooldown: 0
    },
    "defend": {
      id: "defend",
      name: "Defend",
      description: "Brace yourself, reducing incoming damage by 50% for one turn.",
      manaCost: 3,
      unlockLevel: 3,
      type: "buff",
      effect: "defending",
      duration: 1,
      cooldown: 0
    },
    "first-aid": {
      id: "first-aid",
      name: "First Aid",
      description: "Bandage your wounds to restore 20 HP.",
      manaCost: 8,
      unlockLevel: 4,
      type: "heal",
      healAmount: 20,
      cooldown: 0
    },
    "venom-slash": {
      id: "venom-slash",
      name: "Venom Slash",
      description: "A poisoned strike that deals damage and poisons the enemy for 3 turns.",
      manaCost: 7,
      unlockLevel: 5,
      type: "attack",
      damageMultiplier: 1.0,
      appliesEffect: { type: "poison", damage: 3, duration: 3 },
      cooldown: 0
    },
    "shield-bash": {
      id: "shield-bash",
      name: "Shield Bash",
      description: "Bash the enemy, dealing damage and stunning them for 1 turn.",
      manaCost: 10,
      unlockLevel: 7,
      type: "attack",
      damageMultiplier: 0.8,
      appliesEffect: { type: "stun", duration: 1 },
      cooldown: 0
    }
  };

  function getAvailable(playerLevel) {
    var available = [];
    var keys = Object.keys(catalog);
    for (var i = 0; i < keys.length; i++) {
      if (catalog[keys[i]].unlockLevel <= playerLevel) {
        available.push(catalog[keys[i]]);
      }
    }
    return available;
  }

  function get(id) {
    return catalog[id] || null;
  }

  function getAll() {
    return catalog;
  }

  return {
    get: get,
    getAll: getAll,
    getAvailable: getAvailable
  };
})();
