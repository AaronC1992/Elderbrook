/* player.js - Player state and management (Chapter 1, 6 equipment slots) */
var Player = (function () {

  var MAX_INVENTORY = 20;
  var EQUIP_SLOTS = ["weapon", "helmet", "chest", "legs", "gloves", "bracers"];
  var BASE_STATS = { hp: 50, maxHp: 50, mp: 20, maxMp: 20, attack: 2, defense: 1, dexterity: 1, intelligence: 1 };

  var state = null;

  function defaultState() {
    return {
      name: "Hero",
      gender: "male",
      level: 1,
      xp: 0,
      xpToNext: 60,
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
      currentArea: "elderbrook",
      hasEnteredTown: false
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
      state.xpToNext = Math.floor(state.xpToNext * 1.4);
      state.maxHp += 8;
      state.hp = state.maxHp;
      state.maxMp += 4;
      state.mp = state.maxMp;
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
    else if (stat === "attack") { state.attack += 1; }
    else if (stat === "defense") { state.defense += 1; }
    else if (stat === "dexterity") { state.dexterity += 1; }
    else if (stat === "intelligence") { state.intelligence += 1; }
    else return false;
    state.unspentPoints--;
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
    return state.gender === "female"
      ? "assets/portraits/female-player.png"
      : "assets/portraits/male-player.png";
  }

  return {
    MAX_INVENTORY: MAX_INVENTORY,
    EQUIP_SLOTS: EQUIP_SLOTS,
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
    getPortrait: getPortrait
  };
})();
