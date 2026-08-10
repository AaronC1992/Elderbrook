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
      description: "Restore 10 HP. (2-turn cooldown)",
      mpCost: 5, healAmount: 10, cooldown: 2
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
      id: "whirlwind", name: "Whirlwind", type: "attack", tier: 2,
      cost: TIER_COSTS[2],
      description: "Sweeps all enemies for 0.8x damage each.",
      mpCost: 7, damageMultiplier: 0.8, aoe: true
    },
    {
      id: "cleave", name: "Cleave", type: "attack", tier: 3,
      cost: TIER_COSTS[3],
      description: "Splits 1.6x damage across all enemies. (2-turn cooldown)",
      mpCost: 8, damageMultiplier: 1.6, aoe: "split", cooldown: 2
    },
    {
      id: "chain-lightning", name: "Chain Lightning", type: "magic", tier: 3,
      cost: TIER_COSTS[3],
      description: "Magic bolt jumps to all enemies for 0.7x INT damage each.",
      mpCost: 10, damageMultiplier: 0.7, intScaling: true, aoe: true
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
    },

    /* ── Class Skills (granted automatically when choosing a class) ── */
    {
      id: "rallying-cry", name: "Rallying Cry", type: "buff", tier: 2,
      cost: 0, classSkill: "warrior",
      description: "Boosts attack by 3 for 3 turns. Warrior class skill.",
      mpCost: 5, buffType: "attack", buffAmount: 3, buffDuration: 3
    },
    {
      id: "guardians-shield", name: "Guardian's Shield", type: "buff", tier: 3,
      cost: 0, classSkill: "knight",
      description: "Boosts defense by 4 for 3 turns. Knight class skill.",
      mpCost: 6, buffType: "defense", buffAmount: 4, buffDuration: 3
    },
    {
      id: "frenzy", name: "Frenzy", type: "attack", tier: 3,
      cost: 0, classSkill: "berserker",
      description: "Hits twice at 1.0x damage. Berserker class skill.",
      mpCost: 7, hits: 2, damageMultiplier: 1.0
    },
    {
      id: "ground-slam", name: "Ground Slam", type: "attack", tier: 3,
      cost: 0, classSkill: "berserker",
      description: "Slams the ground splitting 1.4x damage across all enemies. Berserker class skill.",
      mpCost: 9, damageMultiplier: 1.4, aoe: "split"
    },
    {
      id: "smoke-bomb", name: "Smoke Bomb", type: "buff", tier: 2,
      cost: 0, classSkill: "rogue",
      description: "Increases evasion by 30 for 2 turns. Rogue class skill.",
      mpCost: 4, buffType: "evasion", buffAmount: 30, buffDuration: 2
    },
    {
      id: "shadow-strike", name: "Shadow Strike", type: "attack", tier: 3,
      cost: 0, classSkill: "assassin",
      description: "Deals 1.8x damage and poisons. Assassin class skill.",
      mpCost: 8, damageMultiplier: 1.8, appliesEffect: { type: "poison", damage: 4, turns: 3 }
    },
    {
      id: "volley", name: "Volley", type: "attack", tier: 3,
      cost: 0, classSkill: "ranger",
      description: "Rains arrows on all enemies for 0.6x damage each. Ranger class skill.",
      mpCost: 9, damageMultiplier: 0.6, aoe: true
    },
    {
      id: "arcane-shield", name: "Arcane Shield", type: "buff", tier: 2,
      cost: 0, classSkill: "mage",
      description: "Boosts defense by 3 for 2 turns. Mage class skill.",
      mpCost: 5, buffType: "defense", buffAmount: 3, buffDuration: 2
    },
    {
      id: "inferno", name: "Inferno", type: "magic", tier: 3,
      cost: 0, classSkill: "pyromancer",
      description: "Engulfs all enemies in flame for 1.0x magic damage and burns. Pyromancer class skill.",
      mpCost: 10, damageMultiplier: 1.0, intScaling: true, aoe: true, appliesEffect: { type: "burn", damage: 5, turns: 2 }
    },
    {
      id: "holy-light", name: "Holy Light", type: "heal", tier: 3,
      cost: 0, classSkill: "cleric",
      description: "Restores 25 HP. Cleric class skill.",
      mpCost: 8, healAmount: 25, cooldown: 2
    },
    {
      id: "smite", name: "Smite", type: "magic", tier: 3,
      cost: 0, classSkill: "paladin",
      description: "Deals 1.5x magic damage scaling with INT. Paladin class skill.",
      mpCost: 9, damageMultiplier: 1.5, intScaling: true
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
      if (skills[i].classSkill) continue;
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
