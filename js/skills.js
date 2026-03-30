/* skills.js - Player abilities that unlock with level */
var Skills = (function () {
  var catalog = {
    "power-strike": {
      id: "power-strike", name: "Power Strike",
      description: "A mighty blow dealing 150% damage.",
      manaCost: 5, unlockLevel: 2, type: "attack",
      damageMultiplier: 1.5, cooldown: 0
    },
    "defend": {
      id: "defend", name: "Defend",
      description: "Brace yourself, reducing incoming damage by 50% for one turn.",
      manaCost: 3, unlockLevel: 3, type: "buff",
      effect: "defending", duration: 1, cooldown: 0
    },
    "first-aid": {
      id: "first-aid", name: "First Aid",
      description: "Bandage your wounds to restore 20 HP.",
      manaCost: 8, unlockLevel: 4, type: "heal",
      healAmount: 20, cooldown: 0
    },
    "venom-slash": {
      id: "venom-slash", name: "Venom Slash",
      description: "A poisoned strike that deals damage and poisons the enemy for 3 turns.",
      manaCost: 7, unlockLevel: 5, type: "attack",
      damageMultiplier: 1.0,
      appliesEffect: { type: "poison", damage: 3, duration: 3 },
      cooldown: 0
    },
    "whirlwind": {
      id: "whirlwind", name: "Whirlwind",
      description: "Spin and strike with devastating force. 170% damage.",
      manaCost: 10, unlockLevel: 6, type: "attack",
      damageMultiplier: 1.7, cooldown: 0
    },
    "shield-bash": {
      id: "shield-bash", name: "Shield Bash",
      description: "Bash the enemy, dealing damage and stunning them for 1 turn.",
      manaCost: 10, unlockLevel: 7, type: "attack",
      damageMultiplier: 0.8,
      appliesEffect: { type: "stun", duration: 1 },
      cooldown: 0
    },
    "ice-shard": {
      id: "ice-shard", name: "Ice Shard",
      description: "Hurl a shard of ice using INT. Deals magic damage.",
      manaCost: 12, unlockLevel: 8, type: "magic",
      baseDamage: 15, intScaling: 2.5, cooldown: 0
    },
    "greater-heal": {
      id: "greater-heal", name: "Greater Heal",
      description: "A powerful healing spell. Restores 50 HP.",
      manaCost: 16, unlockLevel: 10, type: "heal",
      healAmount: 50, cooldown: 0
    },
    "berserk": {
      id: "berserk", name: "Berserk",
      description: "Reckless fury! 220% damage but take 15% recoil.",
      manaCost: 14, unlockLevel: 12, type: "attack",
      damageMultiplier: 2.2, recoilPercent: 0.15, cooldown: 0
    },
    "holy-smite": {
      id: "holy-smite", name: "Holy Smite",
      description: "Call down holy light. Heavy magic damage with a chance to stun.",
      manaCost: 20, unlockLevel: 14, type: "magic",
      baseDamage: 30, intScaling: 3.0,
      appliesEffect: { type: "stun", duration: 1 },
      stunChance: 0.4, cooldown: 0
    },
    "dragons-fury": {
      id: "dragons-fury", name: "Dragon's Fury",
      description: "Channel draconic power. 250% damage and applies bleed.",
      manaCost: 25, unlockLevel: 16, type: "attack",
      damageMultiplier: 2.5,
      appliesEffect: { type: "bleed", damage: 5, duration: 3 },
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
