/* skills.js - Player skills for Chapter 1 (purchase & train system) */
var Skills = (function () {

  /* Tier costs: tier 1 = affordable early, tier 2 = mid-game, tier 3 = expensive */
  var TIER_COSTS = { 1: 75, 2: 200, 3: 400 };
  var TRAIN_BASE_COST = 30; // gold per training session, scales with tier

  var skills = [
    {
      id: "power-strike", name: "Power Strike", type: "attack", tier: 1,
      cost: TIER_COSTS[1],
      description: "A heavy blow dealing 1.5x damage.",
      mpCost: 4, damageMultiplier: 1.5, cooldown: 0
    },
    {
      id: "quick-dodge", name: "Quick Dodge", type: "buff", tier: 1,
      cost: TIER_COSTS[1],
      description: "Increases evasion for 2 turns.",
      mpCost: 3, buffType: "evasion", buffAmount: 20, buffDuration: 2
    },
    {
      id: "first-aid", name: "First Aid", type: "heal", tier: 1,
      cost: TIER_COSTS[1],
      description: "Restore 12 HP. (2-turn cooldown)",
      mpCost: 5, healAmount: 12, cooldown: 2
    },
    {
      id: "venom-slash", name: "Venom Slash", type: "attack", tier: 2,
      cost: TIER_COSTS[2],
      description: "Deals 1.2x damage and poisons the target for 2 turns.",
      mpCost: 6, damageMultiplier: 1.2, appliesEffect: { type: "poison", damage: 3, turns: 2 }
    },
    {
      id: "war-shout", name: "War Shout", type: "buff", tier: 2,
      cost: TIER_COSTS[2],
      description: "Boosts attack by 2 for 3 turns.",
      mpCost: 5, buffType: "attack", buffAmount: 2, buffDuration: 3
    },
    {
      id: "arcane-bolt", name: "Arcane Bolt", type: "magic", tier: 2,
      cost: TIER_COSTS[2],
      description: "Deals magic damage scaling with Intelligence. 1.4x multiplier.",
      mpCost: 7, damageMultiplier: 1.4, intScaling: true
    },
    {
      id: "shield-bash", name: "Shield Bash", type: "attack", tier: 3,
      cost: TIER_COSTS[3],
      description: "Deals 1.3x damage and has 30% chance to stun. (2-turn cooldown)",
      mpCost: 6, damageMultiplier: 1.3, cooldown: 2, appliesEffect: { type: "stun", chance: 0.30, turns: 1 }
    },
    {
      id: "meditate", name: "Meditate", type: "heal", tier: 3,
      cost: 0, questLocked: true, unlockFlag: "unlockedMeditate",
      unlockQuest: "sq-meditate",
      description: "Restore 15 MP. (3-turn cooldown)",
      mpCost: 0, manaRestore: 15, cooldown: 3
    },
    {
      id: "double-strike", name: "Double Strike", type: "attack", tier: 3,
      cost: 0, questLocked: true, unlockFlag: "unlockedDoubleStrike",
      unlockQuest: "sq-double-strike",
      description: "Hits twice at 0.8x damage each.",
      mpCost: 8, hits: 2, damageMultiplier: 0.8
    }
  ];

  /* Return only skills the player has learned */
  function getAvailable(learnedSkills) {
    if (!learnedSkills) return [];
    var available = [];
    for (var i = 0; i < skills.length; i++) {
      if (learnedSkills.indexOf(skills[i].id) !== -1) {
        available.push(skills[i]);
      }
    }
    return available;
  }

  /* Return skills available for purchase at the academy (not quest-locked, not already learned) */
  function getShopSkills(learnedSkills) {
    learnedSkills = learnedSkills || [];
    var available = [];
    for (var i = 0; i < skills.length; i++) {
      if (skills[i].questLocked) continue;
      if (learnedSkills.indexOf(skills[i].id) !== -1) continue;
      available.push(skills[i]);
    }
    return available;
  }

  /* Return quest-locked skills with their unlock status */
  function getQuestSkills(learnedSkills, playerFlags) {
    learnedSkills = learnedSkills || [];
    var result = [];
    for (var i = 0; i < skills.length; i++) {
      if (!skills[i].questLocked) continue;
      var unlocked = playerFlags && skills[i].unlockFlag && playerFlags[skills[i].unlockFlag];
      var learned = learnedSkills.indexOf(skills[i].id) !== -1;
      result.push({ skill: skills[i], unlocked: !!unlocked, learned: learned });
    }
    return result;
  }

  /* Get the gold cost to train a learned skill (boost proficiency) */
  function getTrainCost(skillId) {
    var sk = get(skillId);
    if (!sk) return 0;
    return TRAIN_BASE_COST * (sk.tier || 1);
  }

  function get(skillId) {
    for (var i = 0; i < skills.length; i++) {
      if (skills[i].id === skillId) return skills[i];
    }
    return null;
  }

  function getAll() { return skills; }

  return {
    getAvailable: getAvailable,
    getShopSkills: getShopSkills,
    getQuestSkills: getQuestSkills,
    getTrainCost: getTrainCost,
    get: get,
    getAll: getAll,
    TIER_COSTS: TIER_COSTS
  };
})();
