/* player.js - Player state and leveling */
var Player = (function () {
  var MAX_INVENTORY = 20;

  var defaultState = {
    name: "",
    level: 1,
    xp: 0,
    xpToNext: 50,
    gold: 50,
    hp: 50,
    maxHp: 50,
    mana: 20,
    maxMana: 20,
    strength: 5,
    defense: 3,
    dexterity: 3,
    intelligence: 2,
    equipped: {
      weapon: null,
      helmet: null,
      chest: null,
      legs: null,
      accessory: null
    },
    inventory: [],   // array of item id strings
    questsActive: [],
    questsCompleted: []
  };

  var state = {};

  function create(name) {
    state = JSON.parse(JSON.stringify(defaultState));
    state.name = name;
    // Starting gear
    state.equipped.weapon = "rusty-dagger";
    state.equipped.chest = "cloth-tunic";
    state.equipped.legs = "cloth-pants";
    // Starting inventory
    state.inventory.push("health-potion");
    state.inventory.push("health-potion");
  }

  function getData() {
    return state;
  }

  function setData(data) {
    state = data;
  }

  // --- Stats with equipment ---
  function getTotalAttack() {
    var base = state.strength;
    var wpn = state.equipped.weapon ? Items.get(state.equipped.weapon) : null;
    if (wpn && wpn.power) base += wpn.power;
    return base;
  }

  function getTotalDefense() {
    var base = state.defense;
    var slots = ["helmet", "chest", "legs", "accessory"];
    for (var i = 0; i < slots.length; i++) {
      var itemId = state.equipped[slots[i]];
      if (itemId) {
        var item = Items.get(itemId);
        if (item && item.defense) base += item.defense;
      }
    }
    return base;
  }

  function getTotalDexterity() {
    var base = state.dexterity;
    var slots = ["weapon", "helmet", "chest", "legs", "accessory"];
    for (var i = 0; i < slots.length; i++) {
      var itemId = state.equipped[slots[i]];
      if (itemId) {
        var item = Items.get(itemId);
        if (item && item.dexterity) base += item.dexterity;
      }
    }
    return base;
  }

  // --- Leveling ---
  function addXp(amount) {
    state.xp += amount;
    var leveled = false;
    while (state.xp >= state.xpToNext) {
      state.xp -= state.xpToNext;
      state.level++;
      state.xpToNext = Math.floor(state.xpToNext * 1.4);
      state.maxHp += 5;
      state.hp = state.maxHp;
      state.maxMana += 2;
      state.mana = state.maxMana;
      state.strength += 1;
      state.defense += 1;
      state.dexterity += 1;
      state.intelligence += 1;
      leveled = true;
    }
    return leveled;
  }

  function addGold(amount) {
    state.gold += amount;
  }

  function spendGold(amount) {
    if (state.gold < amount) return false;
    state.gold -= amount;
    return true;
  }

  // --- Inventory helpers ---
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

  function inventoryFull() {
    return state.inventory.length >= MAX_INVENTORY;
  }

  // --- Equipment ---
  function equip(itemId) {
    var item = Items.get(itemId);
    if (!item) return false;
    var slot = item.slot;
    if (!slot) return false;
    // Remove item from inventory
    if (!removeItem(itemId)) return false;
    // Unequip current item in slot -> inventory
    if (state.equipped[slot]) {
      state.inventory.push(state.equipped[slot]);
    }
    state.equipped[slot] = itemId;
    return true;
  }

  function unequip(slot) {
    if (!state.equipped[slot]) return false;
    if (state.inventory.length >= MAX_INVENTORY) return false;
    state.inventory.push(state.equipped[slot]);
    state.equipped[slot] = null;
    return true;
  }

  // --- HP / Mana ---
  function heal(amount) {
    state.hp = Math.min(state.hp + amount, state.maxHp);
  }

  function restoreMana(amount) {
    state.mana = Math.min(state.mana + amount, state.maxMana);
  }

  function takeDamage(amount) {
    state.hp = Math.max(state.hp - amount, 0);
  }

  function isAlive() {
    return state.hp > 0;
  }

  function fullRest() {
    state.hp = state.maxHp;
    state.mana = state.maxMana;
  }

  return {
    create: create,
    getData: getData,
    setData: setData,
    getTotalAttack: getTotalAttack,
    getTotalDefense: getTotalDefense,
    getTotalDexterity: getTotalDexterity,
    addXp: addXp,
    addGold: addGold,
    spendGold: spendGold,
    addItem: addItem,
    removeItem: removeItem,
    hasItem: hasItem,
    countItem: countItem,
    inventoryFull: inventoryFull,
    equip: equip,
    unequip: unequip,
    heal: heal,
    restoreMana: restoreMana,
    takeDamage: takeDamage,
    isAlive: isAlive,
    fullRest: fullRest,
    MAX_INVENTORY: MAX_INVENTORY
  };
})();
