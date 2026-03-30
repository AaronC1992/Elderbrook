/* world.js - Navigation and world interactions */
var World = (function () {
  function navigate(screenId) {
    // Render dialogue when entering shops
    if (screenId === "weapon-shop") {
      Dialogue.renderDialogue("weapon-shop-dialogue", "weapon-shopkeep", "greeting");
    } else if (screenId === "armor-shop") {
      Dialogue.renderDialogue("armor-shop-dialogue", "armor-shopkeep", "greeting");
    } else if (screenId === "potion-shop") {
      Dialogue.renderDialogue("potion-shop-dialogue", "potion-shopkeep", "greeting");
    } else if (screenId === "inn") {
      Dialogue.renderDialogue("guild-dialogue", "guildmaster", "greeting");
    } else if (screenId === "quest-board") {
      Dialogue.renderDialogue("quest-dialogue", "guildmaster", "quest");
    }
    UI.showScreen(screenId);
  }

  function restAtInn() {
    var cost = 10;
    if (!Player.spendGold(cost)) {
      MessageLog.add("Not enough gold to rest. You need " + cost + " gold.", "damage");
      return;
    }
    Player.fullRest();
    MessageLog.add("You rest at the guild. HP and Mana fully restored. (-" + cost + " gold)", "heal");
    Audio.heal();
    Dialogue.renderDialogue("guild-dialogue", "guildmaster", "rest");
    UI.updateHeader();
  }

  function enterWilderness() {
    UI.showScreen("wilderness");
  }

  function startEncounter(area) {
    Battle.start(area || "goblin-cave");
  }

  function enterDungeon(dungeonId) {
    Dungeon.enter(dungeonId);
  }

  function reviveAtTown() {
    var data = Player.getData();
    data.hp = Math.floor(data.maxHp * 0.5);
    data.mana = Math.floor(data.maxMana * 0.5);
    UI.updateHeader();
    UI.showScreen("town");
    MessageLog.add("You wake up back in Elderbrook, battered but alive.", "info");
  }

  return {
    navigate: navigate,
    restAtInn: restAtInn,
    enterWilderness: enterWilderness,
    startEncounter: startEncounter,
    enterDungeon: enterDungeon,
    reviveAtTown: reviveAtTown
  };
})();
