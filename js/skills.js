/* skills.js - Player skills for Chapter 1 (levels 1-8) */
var Skills = (function () {

  var skills = [
    {
      id: "power-strike", name: "Power Strike", type: "attack",
      description: "A heavy blow dealing 1.5x damage.", unlockLevel: 2,
      mpCost: 4, damageMultiplier: 1.5, cooldown: 0
    },
    {
      id: "quick-dodge", name: "Quick Dodge", type: "buff",
      description: "Increases evasion for 2 turns.", unlockLevel: 3,
      mpCost: 3, buffType: "evasion", buffAmount: 20, buffDuration: 2
    },
    {
      id: "first-aid", name: "First Aid", type: "heal",
      description: "Restore 12 HP.", unlockLevel: 3,
      mpCost: 5, healAmount: 12
    },
    {
      id: "venom-slash", name: "Venom Slash", type: "attack",
      description: "Deals 1.2x damage and poisons the target for 2 turns.", unlockLevel: 4,
      mpCost: 6, damageMultiplier: 1.2, appliesEffect: { type: "poison", damage: 3, turns: 2 }
    },
    {
      id: "war-shout", name: "War Shout", type: "buff",
      description: "Boosts attack by 2 for 3 turns.", unlockLevel: 5,
      mpCost: 5, buffType: "attack", buffAmount: 2, buffDuration: 3
    },
    {
      id: "arcane-bolt", name: "Arcane Bolt", type: "magic",
      description: "Deals magic damage scaling with Intelligence. 1.4x multiplier.", unlockLevel: 4,
      mpCost: 7, damageMultiplier: 1.4, intScaling: true
    },
    {
      id: "shield-bash", name: "Shield Bash", type: "attack",
      description: "Deals 1.3x damage and has 30% chance to stun.", unlockLevel: 6,
      mpCost: 6, damageMultiplier: 1.3, appliesEffect: { type: "stun", chance: 0.30, turns: 1 }
    },
    {
      id: "meditate", name: "Meditate", type: "heal",
      description: "Restore 15 MP. (3-turn cooldown)", unlockLevel: 7,
      mpCost: 0, manaRestore: 15, cooldown: 3
    },
    {
      id: "double-strike", name: "Double Strike", type: "attack",
      description: "Hits twice at 0.8x damage each.", unlockLevel: 8,
      mpCost: 8, hits: 2, damageMultiplier: 0.8
    }
  ];

  function getAvailable(playerLevel) {
    var available = [];
    for (var i = 0; i < skills.length; i++) {
      if (skills[i].unlockLevel <= playerLevel) {
        available.push(skills[i]);
      }
    }
    return available;
  }

  function get(skillId) {
    for (var i = 0; i < skills.length; i++) {
      if (skills[i].id === skillId) return skills[i];
    }
    return null;
  }

  function getAll() { return skills; }

  return { getAvailable: getAvailable, get: get, getAll: getAll };
})();
