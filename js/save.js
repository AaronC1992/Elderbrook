/* save.js - Save/Load system using localStorage */
var Save = (function () {

  var SAVE_KEY = "elderbrook_save";

  function save() {
    var p = Player.get();
    if (!p) return false;
    try {
      var data = JSON.stringify(p);
      localStorage.setItem(SAVE_KEY, data);
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.name) return false;

      // Ensure all expected fields exist (migration safety)
      if (!data.storyFlags) data.storyFlags = Chapter1.getDefaultFlags();
      if (!data.questProgress) data.questProgress = {};
      if (!data.activeQuests) data.activeQuests = [];
      if (!data.completedQuests) data.completedQuests = [];
      if (!data.bestiary) data.bestiary = {};
      if (data.unspentPoints === undefined) data.unspentPoints = 0;
      if (!data.equipped.gloves) data.equipped.gloves = null;
      if (!data.equipped.bracers) data.equipped.bracers = null;
      if (data.hasEnteredTown === undefined) data.hasEnteredTown = false;
      if (!data.currentArea) data.currentArea = "elderbrook";

      // Merge any new default flags that don't exist yet
      var defaults = Chapter1.getDefaultFlags();
      for (var key in defaults) {
        if (data.storyFlags[key] === undefined) {
          data.storyFlags[key] = defaults[key];
        }
      }

      Player.set(data);
      Player.recalcStats();
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasSave() {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch (e) {
      return false;
    }
  }

  function deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    save: save,
    load: load,
    hasSave: hasSave,
    deleteSave: deleteSave
  };
})();
