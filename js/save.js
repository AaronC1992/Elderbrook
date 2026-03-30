/* save.js - localStorage save/load system */
var SaveSystem = (function () {
  var SAVE_KEY = "elderbrook_save";

  function save() {
    var data = Player.getData();
    var json = JSON.stringify(data);
    try {
      localStorage.setItem(SAVE_KEY, json);
      MessageLog.add("Game saved.", "info");
    } catch (e) {
      MessageLog.add("Save failed!", "damage");
    }
  }

  function load() {
    var json = localStorage.getItem(SAVE_KEY);
    if (!json) return false;
    try {
      var data = JSON.parse(json);
      if (!data.unspentPoints) data.unspentPoints = 0;
      if (!data.areasUnlocked) data.areasUnlocked = ["goblin-cave"];
      if (!data.bestiary) data.bestiary = {};
      Player.setData(data);
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    MessageLog.add("Save deleted.", "info");
  }

  return {
    save: save,
    load: load,
    hasSave: hasSave,
    deleteSave: deleteSave
  };
})();
