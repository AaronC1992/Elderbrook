/* world.js - Navigation and world interactions */
var World = (function () {
  function navigate(screenId) {
    UI.showScreen(screenId);
  }

  function restAtInn() {
    var cost = 10;
    if (!Player.spendGold(cost)) {
      MessageLog.add("Not enough gold to rest. You need " + cost + " gold.", "damage");
      return;
    }
    Player.fullRest();
    MessageLog.add("You rest at the inn. HP and Mana fully restored. (-" + cost + " gold)", "heal");
    UI.updateHeader();
  }

  function enterWilderness() {
    UI.showScreen("wilderness");
  }

  function startEncounter() {
    Battle.start("wilderness");
  }

  return {
    navigate: navigate,
    restAtInn: restAtInn,
    enterWilderness: enterWilderness,
    startEncounter: startEncounter
  };
})();
