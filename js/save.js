/* save.js - Save/Load system using localStorage */
var Save = (function () {

  var SAVE_PREFIX = "elderbrook_save_";
  var MAX_SLOTS = 3;
  var LEGACY_KEY = "elderbrook_save";
  var currentSlot = 1;

  function getKey(slot) {
    return SAVE_PREFIX + (slot || currentSlot);
  }

  function setSlot(slot) {
    if (slot >= 1 && slot <= MAX_SLOTS) currentSlot = slot;
  }

  function getSlot() {
    return currentSlot;
  }

  function save(slot) {
    var p = Player.get();
    if (!p) return false;
    var key = getKey(slot);
    try {
      var wrapper = {
        version: 2,
        savedAt: new Date().toISOString(),
        name: p.name,
        level: p.level,
        data: p
      };
      localStorage.setItem(key, JSON.stringify(wrapper));
      return true;
    } catch (e) {
      return false;
    }
  }

  function autoSave() {
    return save(currentSlot);
  }

  function load(slot) {
    var key = getKey(slot);
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      var data;

      // Support legacy saves (no wrapper) and v2 wrapper
      if (parsed && parsed.version === 2) {
        data = parsed.data;
      } else {
        data = parsed;
      }

      if (!data || !data.name) return false;

      migrateData(data);

      if (slot) currentSlot = slot;
      Player.set(data);
      Player.recalcStats();
      return true;
    } catch (e) {
      return false;
    }
  }

  function migrateData(data) {
    // Core fields
    if (!data.storyFlags) data.storyFlags = Chapter1.getDefaultFlags();
    if (!data.questProgress) data.questProgress = {};
    if (!data.activeQuests) data.activeQuests = [];
    if (!data.completedQuests) data.completedQuests = [];
    if (!data.bestiary) data.bestiary = {};
    if (data.unspentPoints === undefined) data.unspentPoints = 0;
    if (!data.equipped) data.equipped = {};
    if (!data.equipped.gloves) data.equipped.gloves = null;
    if (!data.equipped.bracers) data.equipped.bracers = null;
    if (data.hasEnteredTown === undefined) data.hasEnteredTown = false;
    if (!data.currentArea) data.currentArea = "elderbrook";
    if (!data.eventSpawns) data.eventSpawns = [];
    if (!data.bonusStats) data.bonusStats = { attack: 0, defense: 0, dexterity: 0, intelligence: 0 };
    if (!data.trainingDone) data.trainingDone = {};

    // V2 new fields
    if (!data.difficulty) data.difficulty = "normal";
    if (!data.buildClass) data.buildClass = null;
    if (!data.skillProficiency) data.skillProficiency = {};
    if (!data.achievements) data.achievements = [];
    if (!data.choiceHistory) data.choiceHistory = {};
    if (!data.settings) data.settings = { textSpeed: "normal", soundEnabled: true };
    if (data.totalPlayTime === undefined) data.totalPlayTime = 0;
    if (!data.townEventsSeen) data.townEventsSeen = [];
    if (data.herbsGathered === undefined) data.herbsGathered = 0;
    if (data.activeBounty === undefined) data.activeBounty = null;
    if (data.bountyKills === undefined) data.bountyKills = 0;
    if (!data.completedBounties) data.completedBounties = [];
    if (data.festivalStartDay === undefined) data.festivalStartDay = null;

    // Migrate relationships
    if (!data.relationships) {
      data.relationships = {
        mira:   { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        toma:   { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        elira:  { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        bram:   { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        harlan: { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] },
        elric:  { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] }
      };
    } else {
      var relNPCs = ["mira", "toma", "elira", "bram", "harlan", "elric"];
      for (var r = 0; r < relNPCs.length; r++) {
        if (!data.relationships[relNPCs[r]]) {
          data.relationships[relNPCs[r]] = { affinity: 0, chatted: false, gifted: false, dated: false, milestones: [] };
        }
        if (data.relationships[relNPCs[r]].dated === undefined) data.relationships[relNPCs[r]].dated = false;
        if (!data.relationships[relNPCs[r]].milestones) data.relationships[relNPCs[r]].milestones = [];
        if (!data.relationships[relNPCs[r]].seenContextual) data.relationships[relNPCs[r]].seenContextual = {};
      }
    }

    // Merge new default flags
    var defaults = Chapter1.getDefaultFlags();
    for (var key in defaults) {
      if (data.storyFlags[key] === undefined) {
        data.storyFlags[key] = defaults[key];
      }
    }
  }

  function migrateLegacy() {
    try {
      var raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return false;
      // Copy legacy save to slot 1
      var data = JSON.parse(raw);
      if (!data || !data.name) return false;
      migrateData(data);
      var wrapper = {
        version: 2,
        savedAt: new Date().toISOString(),
        name: data.name,
        level: data.level,
        data: data
      };
      localStorage.setItem(getKey(1), JSON.stringify(wrapper));
      localStorage.removeItem(LEGACY_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getSlotInfo(slot) {
    var key = getKey(slot);
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version === 2) {
        return { name: parsed.name, level: parsed.level, savedAt: parsed.savedAt };
      }
      // Legacy format
      if (parsed && parsed.name) {
        return { name: parsed.name, level: parsed.level || 1, savedAt: null };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function getAllSlotInfo() {
    var slots = [];
    for (var i = 1; i <= MAX_SLOTS; i++) {
      slots.push({ slot: i, info: getSlotInfo(i) });
    }
    return slots;
  }

  function hasSave(slot) {
    try {
      if (slot) return !!localStorage.getItem(getKey(slot));
      // Check any slot or legacy
      if (localStorage.getItem(LEGACY_KEY)) return true;
      for (var i = 1; i <= MAX_SLOTS; i++) {
        if (localStorage.getItem(getKey(i))) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function deleteSave(slot) {
    try {
      localStorage.removeItem(getKey(slot || currentSlot));
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    save: save,
    load: load,
    autoSave: autoSave,
    hasSave: hasSave,
    deleteSave: deleteSave,
    setSlot: setSlot,
    getSlot: getSlot,
    getSlotInfo: getSlotInfo,
    getAllSlotInfo: getAllSlotInfo,
    migrateLegacy: migrateLegacy,
    MAX_SLOTS: MAX_SLOTS
  };
})();
