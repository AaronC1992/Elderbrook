/* player.js - Player state and management (Chapter 1, 6 equipment slots) */
var Player = (function () {

  var MAX_INVENTORY = 20;
  var EQUIP_SLOTS = ["weapon", "helmet", "chest", "legs", "gloves", "bracers"];
  var BASE_STATS = { hp: 40, maxHp: 40, mp: 20, maxMp: 20, attack: 2, defense: 1, dexterity: 1, intelligence: 1 };

  /* ── Class Definitions ── */
  var CLASS_DEFS = {
    warrior:    { name: "Warrior",    base: null,       stats: { attack: 2, defense: 1 }, skill: "rallying-cry",      unlock: "quest", unlockFlag: "unlockedWarrior",    desc: "Masters of brute force and resilience." },
    knight:     { name: "Knight",     base: "warrior",  stats: { attack: 1, defense: 3 }, skill: "guardians-shield",  unlock: "quest", unlockFlag: "unlockedKnight",     desc: "Sworn protectors clad in heavy armor." },
    berserker:  { name: "Berserker",  base: "warrior",  stats: { attack: 4, defense: -1 },skill: "frenzy",            unlock: "quest", unlockFlag: "unlockedBerserker",  desc: "Reckless fighters fueled by rage." },
    rogue:      { name: "Rogue",      base: null,       stats: { dexterity: 2, attack: 1 },skill: "smoke-bomb",       unlock: "quest", unlockFlag: "unlockedRogue",      desc: "Swift and cunning, striking from the shadows." },
    assassin:   { name: "Assassin",   base: "rogue",    stats: { dexterity: 2, attack: 2 },skill: "shadow-strike",    unlock: "quest", unlockFlag: "unlockedAssassin",   desc: "Silent killers who exploit weakness." },
    ranger:     { name: "Ranger",     base: "rogue",    stats: { dexterity: 3, intelligence: 1 },skill: "volley",     unlock: "quest", unlockFlag: "unlockedRanger",     desc: "Expert marksmen at home in the wild." },
    mage:       { name: "Mage",       base: null,       stats: { intelligence: 2, maxMp: 10 },skill: "arcane-shield", unlock: "quest", unlockFlag: "unlockedMage",       desc: "Wielders of arcane power and knowledge." },
    pyromancer: { name: "Pyromancer", base: "mage",     stats: { intelligence: 3, attack: 1 },skill: "inferno",       unlock: "quest", unlockFlag: "unlockedPyromancer", desc: "Masters of destructive flame magic." },
    cleric:     { name: "Cleric",     base: "mage",     stats: { intelligence: 1, defense: 1, maxHp: 15, maxMp: 10 },skill: "holy-light",unlock: "quest", unlockFlag: "unlockedCleric",    desc: "Divine healers who mend body and spirit." },
    paladin:    { name: "Paladin",    base: null,       stats: { attack: 2, defense: 2, intelligence: 1 },skill: "smite",unlock: "quest", unlockFlag: "unlockedPaladin",   desc: "Holy warriors wielding faith and steel." }
  };

  var state = null;

  function defaultState() {
    return {
      name: "Hero",
      gender: "male",
      level: 1,
      xp: 0,
      xpToNext: 100,
      gold: 30,
      hp: BASE_STATS.hp,
      maxHp: BASE_STATS.maxHp,
      mp: BASE_STATS.mp,
      maxMp: BASE_STATS.maxMp,
      attack: BASE_STATS.attack,
      defense: BASE_STATS.defense,
      dexterity: BASE_STATS.dexterity,
      intelligence: BASE_STATS.intelligence,
      unspentPoints: 0,
      equipped: {
        weapon: null,
        helmet: null,
        chest: null,
        legs: null,
        gloves: null,
        bracers: null
      },
      inventory: [],
      bestiary: {},
      storyFlags: Chapter1.getDefaultFlags(),
      questProgress: {},
      activeQuests: [],
      completedQuests: [],
      boardQuests: [],
      completedBoardQuests: [],
      lastBoardDay: 0,
      trackedQuest: null,
      currentArea: "elderbrook",
      hasEnteredTown: false,
      eventSpawns: [],
      bonusStats: { attack: 0, defense: 0, dexterity: 0, intelligence: 0 },
      relationships: {
        mira:   { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        toma:   { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        elira:  { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        bram:   { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        harlan: { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        elric:  { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        fauna:  { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        liora:  { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        selene: { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] }
      },
      /* ── Day / Time / Energy (SimGirl system) ── */
      day: 1,
      season: "spring",
      seasonDay: 0,
      energy: 8,
      maxEnergy: 8,
      charm: 1,                     // social stat — affects relationship gains
      trainingDone: {},             // { train-str: true, study: true } — daily limit per type

      /* ── New Systems ── */
      difficulty: "normal",         // easy, normal, hard
      buildClass: null,             // null until Lv3 choice: warrior, rogue, mage
      skillProficiency: {},         // { skillId: usageCount }
      achievements: [],             // array of unlocked achievement ids
      choiceHistory: {},            // { dialogueId: choiceIndex }
      settings: { textSpeed: "normal", soundEnabled: true },
      totalPlayTime: 0,             // seconds
      townEventsSeen: [],            // array of event ids already triggered
      festivalStartDay: null,        // day number when harvest festival began (lasts 15 days)
      learnedSkills: [],             // array of skill ids the player has purchased/unlocked
      activePet: null,               // pet id string or null
      ownedPets: [],                 // array of pet ids the player owns
      followingNpc: null,            // npc id of romantic partner following player (or null)
      isAdmin: false                 // admin mode flag
    };
  }

  function create(name, gender, startingWeapon) {
    state = defaultState();
    state.name = name;
    state.gender = gender;
    addItem(startingWeapon);
    equip(startingWeapon);
    return state;
  }

  function get() { return state; }
  function set(data) { state = data; }

  /* ── Equipment ── */
  function equip(itemId) {
    var item = Items.get(itemId);
    if (!item || !item.slot) return false;
    var idx = state.inventory.indexOf(itemId);
    if (idx === -1) return false;
    if (state.equipped[item.slot]) {
      state.inventory.push(state.equipped[item.slot]);
    }
    state.equipped[item.slot] = itemId;
    state.inventory.splice(idx, 1);
    recalcStats();
    return true;
  }

  function unequip(slot) {
    if (!state.equipped[slot]) return false;
    if (state.inventory.length >= MAX_INVENTORY) return false;
    state.inventory.push(state.equipped[slot]);
    state.equipped[slot] = null;
    recalcStats();
    return true;
  }

  function recalcStats() {
    // Undo previous transient maxHp/maxMp bonuses before recalculating
    if (state._transientMaxHp) { state.maxHp -= state._transientMaxHp; }
    if (state._transientMaxMp) { state.maxMp -= state._transientMaxMp; }
    state._transientMaxHp = 0;
    state._transientMaxMp = 0;

    state.attack = BASE_STATS.attack;
    state.defense = BASE_STATS.defense;
    state.dexterity = BASE_STATS.dexterity;
    state.intelligence = BASE_STATS.intelligence;
    for (var i = 0; i < EQUIP_SLOTS.length; i++) {
      var itemId = state.equipped[EQUIP_SLOTS[i]];
      if (!itemId) continue;
      var item = Items.get(itemId);
      if (!item) continue;
      if (item.attack) state.attack += item.attack;
      if (item.defense) state.defense += item.defense;
      if (item.dexterity) state.dexterity += item.dexterity;
      if (item.intelligence) state.intelligence += item.intelligence;
    }
    // Add level-based stat bonus
    var lvlBonus = state.level - 1;
    state.attack += Math.floor(lvlBonus * 0.5);
    state.defense += Math.floor(lvlBonus * 0.3);
    state.intelligence += Math.floor(lvlBonus * 0.3);

    // Add allocated bonus stats
    if (state.bonusStats) {
      state.attack += state.bonusStats.attack;
      state.defense += state.bonusStats.defense;
      state.dexterity += state.bonusStats.dexterity;
      state.intelligence += state.bonusStats.intelligence;
    }

    // Build class bonus
    if (state.buildClass && CLASS_DEFS[state.buildClass]) {
      var cs = CLASS_DEFS[state.buildClass].stats;
      if (cs.attack) state.attack += cs.attack;
      if (cs.defense) state.defense += cs.defense;
      if (cs.dexterity) state.dexterity += cs.dexterity;
      if (cs.intelligence) state.intelligence += cs.intelligence;
      if (cs.maxMp) { state.maxMp += cs.maxMp; state._transientMaxMp += cs.maxMp; }
      if (cs.maxHp) { state.maxHp += cs.maxHp; state._transientMaxHp += cs.maxHp; }
    }

    // Set bonus detection
    var setBonuses = getEquippedSetBonuses();
    for (var sb = 0; sb < setBonuses.length; sb++) {
      var bonus = setBonuses[sb];
      if (bonus.attack) state.attack += bonus.attack;
      if (bonus.defense) state.defense += bonus.defense;
      if (bonus.dexterity) state.dexterity += bonus.dexterity;
      if (bonus.intelligence) state.intelligence += bonus.intelligence;
      if (bonus.maxHp) { state.maxHp += bonus.maxHp; state._transientMaxHp += bonus.maxHp; }
    }

    // Pet stat bonus
    if (typeof Pets !== 'undefined') {
      var petBonus = Pets.getActiveBonus();
      if (petBonus.attack) state.attack += petBonus.attack;
      if (petBonus.defense) state.defense += petBonus.defense;
      if (petBonus.dexterity) state.dexterity += petBonus.dexterity;
      if (petBonus.intelligence) state.intelligence += petBonus.intelligence;
    }

    // Partner relationship bonus
    if (typeof Relationships !== 'undefined') {
      var partner = Relationships.getPartnerBonus();
      if (partner && partner.bonus) {
        if (partner.bonus.attack) state.attack += partner.bonus.attack;
        if (partner.bonus.defense) state.defense += partner.bonus.defense;
        if (partner.bonus.dexterity) state.dexterity += partner.bonus.dexterity;
        if (partner.bonus.intelligence) state.intelligence += partner.bonus.intelligence;
      }
    }

    // Clamp current HP/MP to new max
    if (state.hp > state.maxHp) state.hp = state.maxHp;
    if (state.mp > state.maxMp) state.mp = state.maxMp;
  }

  function getEquippedSetBonuses() {
    var setCount = {};
    for (var i = 0; i < EQUIP_SLOTS.length; i++) {
      var itemId = state.equipped[EQUIP_SLOTS[i]];
      if (!itemId) continue;
      var item = Items.get(itemId);
      if (item && item.setId) {
        if (!setCount[item.setId]) setCount[item.setId] = 0;
        setCount[item.setId]++;
      }
    }
    var bonuses = [];
    var allItems = Items.getAll();
    var setDefs = {};
    for (var key in allItems) {
      var itm = allItems[key];
      if (itm.setBonus && itm.setId && !setDefs[itm.setId]) {
        setDefs[itm.setId] = itm.setBonus;
      }
    }
    for (var sid in setCount) {
      if (setDefs[sid]) {
        for (var t = 0; t < setDefs[sid].length; t++) {
          var req = setDefs[sid][t];
          if (setCount[sid] >= req.pieces) {
            var b = JSON.parse(JSON.stringify(req.bonus));
            b.setId = sid;
            b.count = setCount[sid];
            bonuses.push(b);
          }
        }
      }
    }
    return bonuses;
  }

  function getDifficultyMultiplier() {
    if (!state) return 1;
    if (state.difficulty === "easy") return 0.75;
    if (state.difficulty === "hard") return 1.35;
    return 1;
  }

  function trackSkillUse(skillId) {
    if (!state.skillProficiency) state.skillProficiency = {};
    if (!state.skillProficiency[skillId]) state.skillProficiency[skillId] = 0;
    state.skillProficiency[skillId]++;
  }

  function getSkillProficiency(skillId) {
    if (!state || !state.skillProficiency) return 0;
    return state.skillProficiency[skillId] || 0;
  }

  function getSkillProficiencyBonus(skillId) {
    var uses = getSkillProficiency(skillId);
    // Every 10 uses grants +5% effectiveness, max +25%
    return Math.min(0.25, Math.floor(uses / 10) * 0.05);
  }

  function getSkillProficiencyStars(skillId) {
    var uses = getSkillProficiency(skillId);
    if (uses >= 50) return 5;
    if (uses >= 40) return 4;
    if (uses >= 30) return 3;
    if (uses >= 20) return 2;
    if (uses >= 10) return 1;
    return 0;
  }

  function unlockAchievement(id) {
    if (!state.achievements) state.achievements = [];
    if (state.achievements.indexOf(id) === -1) {
      state.achievements.push(id);
      return true;
    }
    return false;
  }

  function hasAchievement(id) {
    return state.achievements && state.achievements.indexOf(id) !== -1;
  }

  function recordChoice(dialogueId, choiceIndex) {
    if (!state.choiceHistory) state.choiceHistory = {};
    state.choiceHistory[dialogueId] = choiceIndex;
  }

  function getChoice(dialogueId) {
    if (!state || !state.choiceHistory) return null;
    return state.choiceHistory.hasOwnProperty(dialogueId) ? state.choiceHistory[dialogueId] : null;
  }

  /* ── Inventory ── */
  function addItem(itemId) {
    if (state.inventory.length >= MAX_INVENTORY) return false;
    state.inventory.push(itemId);
    return true;
  }

  function removeItem(itemId) {
    var idx = state.inventory.indexOf(itemId);
    if (idx === -1) return false;
    state.inventory.splice(idx, 1);
    return true;
  }

  function hasItem(itemId) {
    return state.inventory.indexOf(itemId) !== -1;
  }

  function countItem(itemId) {
    var c = 0;
    for (var i = 0; i < state.inventory.length; i++) {
      if (state.inventory[i] === itemId) c++;
    }
    return c;
  }

  /* ── XP & Leveling ── */
  function addXp(amount) {
    state.xp += amount;
    var leveled = false;
    while (state.xp >= state.xpToNext) {
      state.xp -= state.xpToNext;
      state.level++;
      state.xpToNext = Math.floor(state.xpToNext * 1.45);
      state.maxHp += 6;
      state.hp = Math.min(state.maxHp, state.hp + Math.floor(state.maxHp * 0.7));
      state.maxMp += 4;
      state.mp = Math.min(state.maxMp, state.mp + Math.floor(state.maxMp * 0.7));
      state.unspentPoints += 2;
      leveled = true;
    }
    if (leveled) recalcStats();
    return leveled;
  }

  function allocateStat(stat) {
    if (state.unspentPoints <= 0) return false;
    if (stat === "maxHp") { state.maxHp += 5; state.hp += 5; }
    else if (stat === "maxMp") { state.maxMp += 3; state.mp += 3; }
    else if (stat === "attack") { state.bonusStats.attack += 1; }
    else if (stat === "defense") { state.bonusStats.defense += 1; }
    else if (stat === "dexterity") { state.bonusStats.dexterity += 1; }
    else if (stat === "intelligence") { state.bonusStats.intelligence += 1; }
    else return false;
    state.unspentPoints--;
    recalcStats();
    return true;
  }

  /* ── Story Flags ── */
  function setFlag(flag) {
    if (state.storyFlags.hasOwnProperty(flag)) {
      state.storyFlags[flag] = true;
    }
  }

  function hasFlag(flag) {
    return !!state.storyFlags[flag];
  }

  function setFlags(flags) {
    if (!flags) return;
    for (var i = 0; i < flags.length; i++) {
      setFlag(flags[i]);
    }
  }

  /* ── Bestiary ── */
  function recordKill(enemyId) {
    if (!state.bestiary[enemyId]) state.bestiary[enemyId] = 0;
    state.bestiary[enemyId]++;
  }

  /* ── Healing ── */
  function heal(amount) {
    state.hp = Math.min(state.hp + amount, state.maxHp);
  }

  function restoreMana(amount) {
    state.mp = Math.min(state.mp + amount, state.maxMp);
  }

  function fullRestore() {
    state.hp = state.maxHp;
    state.mp = state.maxMp;
  }

  function takeDamage(amount) {
    state.hp = Math.max(0, state.hp - amount);
    return state.hp <= 0;
  }

  function getTotalAttack() { return state.attack; }
  function getTotalDefense() { return state.defense; }

  function getPortrait() {
    var prefix = state.gender === "female" ? "female" : "male";
    if (state.buildClass && CLASS_DEFS[state.buildClass]) {
      return "assets/portraits/" + prefix + "_player_" + state.buildClass + ".png";
    }
    return "assets/portraits/" + prefix + "-player.png";
  }

  /* ── Day / Time / Energy System ── */
  function getTimeOfDay() {
    if (!state) return 'morning';
    var ratio = state.energy / state.maxEnergy;
    if (ratio > 0.625) return 'morning';
    if (ratio > 0.375) return 'afternoon';
    if (ratio > 0.125) return 'evening';
    return 'night';
  }

  function spendEnergy(cost) {
    if (!state) return false;
    if (state.energy < cost) return false;
    state.energy -= cost;
    return true;
  }

  var SEASONS = ["spring", "summer", "autumn", "winter"];
  var DAYS_PER_SEASON = 14;
  var FESTIVAL_DURATION = 15;

  function isFestivalActive() {
    if (!state || state.festivalStartDay == null) return false;
    return (state.day - state.festivalStartDay) < FESTIVAL_DURATION;
  }

  function startFestival() {
    if (!state) return;
    state.festivalStartDay = state.day;
  }

  function sleep() {
    if (!state) return;
    state.day++;
    state.seasonDay = (state.seasonDay || 0) + 1;
    if (state.seasonDay > DAYS_PER_SEASON) {
      state.seasonDay = 1;
      var idx = SEASONS.indexOf(state.season);
      state.season = SEASONS[(idx + 1) % SEASONS.length];
    }
    state.energy = state.maxEnergy;
    state.hp = state.maxHp;
    state.mp = state.maxMp;
    state.trainingDone = {};
    Relationships.resetDaily();
    // Reset daily bounty if it changed
    if (state.activeBounty) {
      state.activeBounty = null;
      state.bountyKills = 0;
    }
  }

  function getSeason() {
    return state ? (state.season || "spring") : "spring";
  }

  function getSeasonDay() {
    return state ? (state.seasonDay || 1) : 1;
  }

  function getTrainingCost(statId) {
    if (!state || !state.bonusStats) return 25;
    var level = 0;
    if (statId === 'charm') {
      level = (state.charm || 1) - 1;
    } else {
      var key = statId === 'strength' ? 'attack' : statId;
      level = state.bonusStats[key] || 0;
    }
    return 30 * (level + 1);
  }

  function trainStat(statId) {
    if (!state) return null;
    if (state.trainingDone[statId]) return { success: false, message: "You've already trained " + statId + " today." };
    var cost = getTrainingCost(statId);
    if (state.gold < cost) return { success: false, message: "Not enough gold. You need " + cost + " gold." };
    if (!spendEnergy(2)) return { success: false, message: "Not enough energy." };

    state.gold -= cost;
    state.trainingDone[statId] = true;
    var gain = 0;
    var statName = '';

    switch (statId) {
      case 'strength':
        gain = Math.random() < 0.7 ? 1 : 0;
        if (gain) state.bonusStats.attack += 1;
        statName = 'Strength';
        break;
      case 'defense':
        gain = Math.random() < 0.7 ? 1 : 0;
        if (gain) state.bonusStats.defense += 1;
        statName = 'Defense';
        break;
      case 'dexterity':
        gain = Math.random() < 0.6 ? 1 : 0;
        if (gain) state.bonusStats.dexterity += 1;
        statName = 'Dexterity';
        break;
      case 'intelligence':
        gain = Math.random() < 0.6 ? 1 : 0;
        if (gain) state.bonusStats.intelligence += 1;
        statName = 'Intelligence';
        break;
      case 'charm':
        gain = Math.random() < 0.65 ? 1 : 0;
        if (gain) state.charm += 1;
        statName = 'Charm';
        break;
      default:
        return { success: false, message: "Unknown training type." };
    }

    if (gain) recalcStats();

    var msgs = gain
      ? ["You feel yourself improving! " + statName + " +1!", "The training pays off! " + statName + " +1!", "Hard work rewarded! " + statName + " +1!"]
      : ["You trained hard, but didn't make a breakthrough this time.", "No improvement today, but you'll get there.", "A tough session with no gains. Try again tomorrow."];
    return { success: true, gained: gain > 0, message: msgs[Math.floor(Math.random() * msgs.length)] };
  }

  var RESPEC_COST = 100;

  function getBaseClass(classId) {
    if (!classId || !CLASS_DEFS[classId]) return null;
    return CLASS_DEFS[classId].base || classId;
  }

  function respecBuild() {
    return { success: false, message: "Your class path is permanent and cannot be changed." };
  }

  /* ── Skill Purchase & Training ── */
  function purchaseSkill(skillId) {
    if (!state) return { success: false, message: "No player data." };
    if (!state.learnedSkills) state.learnedSkills = [];
    if (state.learnedSkills.indexOf(skillId) !== -1) return { success: false, message: "You already know this skill." };

    var sk = Skills.get(skillId);
    if (!sk) return { success: false, message: "Skill not found." };
    if (sk.questLocked) return { success: false, message: "This skill can only be learned by completing a special quest." };
    if (state.gold < sk.cost) return { success: false, message: "Not enough gold. You need " + sk.cost + " gold." };

    state.gold -= sk.cost;
    state.learnedSkills.push(skillId);
    return { success: true, message: "You learned " + sk.name + "!" };
  }

  function unlockQuestSkill(skillId) {
    if (!state) return false;
    if (!state.learnedSkills) state.learnedSkills = [];
    if (state.learnedSkills.indexOf(skillId) !== -1) return false;
    var sk = Skills.get(skillId);
    if (!sk || !sk.questLocked) return false;
    if (sk.unlockFlag && (!state.storyFlags || !state.storyFlags[sk.unlockFlag])) return false;
    state.learnedSkills.push(skillId);
    return true;
  }

  function hasSkill(skillId) {
    if (!state || !state.learnedSkills) return false;
    return state.learnedSkills.indexOf(skillId) !== -1;
  }

  function trainSkill(skillId) {
    if (!state) return { success: false, message: "No player data." };
    if (!hasSkill(skillId)) return { success: false, message: "You haven't learned this skill yet." };
    var cost = Skills.getTrainCost(skillId);
    if (state.gold < cost) return { success: false, message: "Not enough gold. Training costs " + cost + " gold." };
    if (!spendEnergy(1)) return { success: false, message: "Not enough energy." };

    state.gold -= cost;
    // Grant 5 proficiency uses worth of progress
    if (!state.skillProficiency) state.skillProficiency = {};
    if (!state.skillProficiency[skillId]) state.skillProficiency[skillId] = 0;
    state.skillProficiency[skillId] += 5;

    var sk = Skills.get(skillId);
    var stars = getSkillProficiencyStars(skillId);
    return { success: true, message: "Trained " + (sk ? sk.name : skillId) + "! Proficiency: " + stars + "/5 stars." };
  }

  /* ── Pet Management ── */
  function buyPet(petId) {
    if (!state) return { success: false, message: "No player data." };
    if (!state.ownedPets) state.ownedPets = [];
    if (state.ownedPets.indexOf(petId) !== -1) return { success: false, message: "You already own this pet." };
    var pet = Pets.get(petId);
    if (!pet) return { success: false, message: "Pet not found." };
    if (state.gold < pet.price) return { success: false, message: "Not enough gold. You need " + pet.price + " gold." };
    state.gold -= pet.price;
    state.ownedPets.push(petId);
    if (!state.activePet) {
      state.activePet = petId;
      recalcStats();
    }
    return { success: true, message: "You adopted " + pet.name + "!" };
  }

  function setPet(petId) {
    if (!state) return false;
    if (!state.ownedPets || state.ownedPets.indexOf(petId) === -1) return false;
    state.activePet = petId;
    recalcStats();
    return true;
  }

  function removePet() {
    if (!state) return false;
    state.activePet = null;
    recalcStats();
    return true;
  }

  return {
    MAX_INVENTORY: MAX_INVENTORY,
    EQUIP_SLOTS: EQUIP_SLOTS,
    CLASS_DEFS: CLASS_DEFS,
    create: create,
    get: get,
    set: set,
    equip: equip,
    unequip: unequip,
    recalcStats: recalcStats,
    addItem: addItem,
    removeItem: removeItem,
    hasItem: hasItem,
    countItem: countItem,
    addXp: addXp,
    allocateStat: allocateStat,
    setFlag: setFlag,
    hasFlag: hasFlag,
    setFlags: setFlags,
    recordKill: recordKill,
    heal: heal,
    restoreMana: restoreMana,
    fullRestore: fullRestore,
    takeDamage: takeDamage,
    getTotalAttack: getTotalAttack,
    getTotalDefense: getTotalDefense,
    getPortrait: getPortrait,
    getDifficultyMultiplier: getDifficultyMultiplier,
    trackSkillUse: trackSkillUse,
    getSkillProficiency: getSkillProficiency,
    getSkillProficiencyBonus: getSkillProficiencyBonus,
    getSkillProficiencyStars: getSkillProficiencyStars,
    unlockAchievement: unlockAchievement,
    hasAchievement: hasAchievement,
    recordChoice: recordChoice,
    getChoice: getChoice,
    getEquippedSetBonuses: getEquippedSetBonuses,
    isFestivalActive: isFestivalActive,
    startFestival: startFestival,
    getTimeOfDay: getTimeOfDay,
    getSeason: getSeason,
    getSeasonDay: getSeasonDay,
    DAYS_PER_SEASON: DAYS_PER_SEASON,
    spendEnergy: spendEnergy,
    sleep: sleep,
    trainStat: trainStat,
    getTrainingCost: getTrainingCost,
    respecBuild: respecBuild,
    RESPEC_COST: RESPEC_COST,
    getBaseClass: getBaseClass,
    purchaseSkill: purchaseSkill,
    unlockQuestSkill: unlockQuestSkill,
    hasSkill: hasSkill,
    trainSkill: trainSkill,
    buyPet: buyPet,
    setPet: setPet,
    removePet: removePet
  };
})();
