/* world.js - Navigation, area encounters, town interactions */
var World = (function () {

  function navigate(locationId) {
    var p = Player.get();
    if (!p) return;
    p.currentArea = locationId;

    if (locationId === "elderbrook") {
      // Show first-time arrival dialogue
      if (!p.hasEnteredTown) {
        p.hasEnteredTown = true;
        Dialogue.start("rowan-arrival", function () {
          UI.showScreen("town");
          UI.renderTown();
        });
        return;
      }
      UI.showScreen("town");
      UI.renderTown();
      return;
    }

    var loc = Chapter1.getLocation(locationId);
    if (!loc) return;

    // Check unlock flag
    if (loc.requireFlag && !Player.hasFlag(loc.requireFlag)) {
      UI.showMessage("This area is not yet accessible.");
      return;
    }

    // Dungeon
    if (loc.isDungeon) {
      Dungeon.enter(locationId);
      return;
    }

    // Gathering area
    if (loc.isGathering) {
      enterGatheringArea(locationId, loc);
      return;
    }

    // Combat area
    if (loc.enemies && loc.enemies.length > 0) {
      enterCombatArea(locationId, loc);
      return;
    }
  }

  function enterCombatArea(areaId, loc) {
    var container = document.getElementById("area-content");
    if (!container) return;

    var html = '<div class="area-screen">';
    html += '<h2>' + loc.name + '</h2>';
    html += '<p>' + loc.description + '</p>';
    html += '<div class="area-actions">';
    html += '<button class="btn" data-action="area-explore" data-area="' + areaId + '">Explore (Fight)</button>';
    html += '<button class="btn" data-action="go-worldmap">Return to Map</button>';
    html += '</div></div>';

    container.innerHTML = html;
    UI.showScreen("area");
  }

  function enterGatheringArea(areaId, loc) {
    var container = document.getElementById("area-content");
    if (!container) return;

    var html = '<div class="area-screen">';
    html += '<h2>' + loc.name + '</h2>';
    html += '<p>' + loc.description + '</p>';
    html += '<div class="area-actions">';
    html += '<button class="btn" data-action="area-gather" data-area="' + areaId + '">Gather Herbs</button>';
    html += '<button class="btn" data-action="area-explore" data-area="' + areaId + '">Explore (Fight)</button>';
    html += '<button class="btn" data-action="go-worldmap">Return to Map</button>';
    html += '</div></div>';

    container.innerHTML = html;
    UI.showScreen("area");
  }

  function explore(areaId) {
    Battle.start(areaId, function () {
      // After battle victory, return to area
      var loc = Chapter1.getLocation(areaId);
      if (loc && loc.isGathering) {
        enterGatheringArea(areaId, loc);
      } else if (loc) {
        enterCombatArea(areaId, loc);
      }
      UI.showScreen("area");
    });
  }

  function gather(areaId) {
    var loc = Chapter1.getLocation(areaId);
    if (!loc || !loc.gatherItem) return;

    // 60% chance to find herb, 30% chance to find enemy, 10% nothing
    var roll = Math.random();
    if (roll < 0.60) {
      if (Player.addItem(loc.gatherItem)) {
        var item = Items.get(loc.gatherItem);
        UI.showMessage("You found: " + (item ? item.name : loc.gatherItem));
      } else {
        UI.showMessage("Inventory full!");
      }
    } else if (roll < 0.90) {
      explore(areaId);
      return;
    } else {
      UI.showMessage("You search but find nothing useful.");
    }
  }

  function restAtInn() {
    Player.fullRestore();
    Audio.play("heal");
    Save.save();
    UI.updateHeader();
    UI.showMessage("You rest at the inn. Fully restored! Game saved.");
  }

  /* NPC interaction routing for town POIs */
  function visitShop(shopId) {
    // Set visit flags
    var shop = Shops.getShop(shopId);
    if (shop) {
      if (shop.npc === "bram" && !Player.hasFlag("visitedBram")) {
        Dialogue.start("bram-first", function () {
          openShop(shopId);
        });
        return;
      }
      if (shop.npc === "harlan" && !Player.hasFlag("visitedHarlan")) {
        Dialogue.start("harlan-first", function () {
          openShop(shopId);
        });
        return;
      }
      if (shop.npc === "mira" && !Player.hasFlag("visitedMira")) {
        Dialogue.start("mira-first", function () {
          openShop(shopId);
        });
        return;
      }
    }
    // Idle lines on revisit
    var idleKey = shop ? shop.npc + "-idle" : null;
    if (idleKey && Chapter1.getDialogue(idleKey)) {
      Dialogue.start(idleKey, function () {
        openShop(shopId);
      });
      return;
    }
    openShop(shopId);
  }

  function openShop(shopId) {
    Shops.renderShop(shopId);
    UI.showScreen("shop");
  }

  function visitGuild() {
    var p = Player.get();

    // Check for quest turn-ins in order
    if (Quests.isActive("mq1") && Quests.checkObjectives("mq1")) {
      var result = Quests.turnIn("mq1");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq1-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete! Rewards: " + result.rewards.xp + " XP, " + result.rewards.gold + " gold");
        });
        return;
      }
    }
    if (Quests.isActive("mq2") && Quests.checkObjectives("mq2")) {
      var result = Quests.turnIn("mq2");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq2-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete!");
        });
        return;
      }
    }
    if (Quests.isActive("mq3") && Quests.checkObjectives("mq3")) {
      var result = Quests.turnIn("mq3");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq3-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete!");
        });
        return;
      }
    }
    if (Quests.isActive("mq4") && Quests.checkObjectives("mq4")) {
      var result = Quests.turnIn("mq4");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq4-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete!");
        });
        return;
      }
    }
    if (Quests.isActive("mq5") && Quests.checkObjectives("mq5")) {
      var result = Quests.turnIn("mq5");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq5-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete!");
        });
        return;
      }
    }
    if (Quests.isActive("mq6") && Quests.checkObjectives("mq6")) {
      var result = Quests.turnIn("mq6");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq6-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete!");
        });
        return;
      }
    }
    if (Quests.isActive("mq7") && Quests.checkObjectives("mq7")) {
      var result = Quests.turnIn("mq7");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("rowan-mq7-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
        });
        return;
      }
    }
    if (Quests.isActive("mq8")) {
      Player.setFlag("chapter1Complete");
      var result = Quests.turnIn("mq8");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("chapter1-ending", function () {
          UI.renderChapterEnd();
          UI.showScreen("chapter-end");
        });
        return;
      }
    }

    // Default: idle Rowan dialogue
    Dialogue.start("rowan-idle", function () {
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  function visitQuestBoard() {
    if (!Player.hasFlag("visitedQuestBoard")) {
      Dialogue.start("toma-first", function () {
        UI.renderQuestBoard();
        UI.showScreen("questboard");
      });
      return;
    }
    Dialogue.start("toma-idle", function () {
      UI.renderQuestBoard();
      UI.showScreen("questboard");
    });
  }

  return {
    navigate: navigate,
    explore: explore,
    gather: gather,
    restAtInn: restAtInn,
    visitShop: visitShop,
    visitGuild: visitGuild,
    visitQuestBoard: visitQuestBoard
  };
})();
