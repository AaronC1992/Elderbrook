/* world.js - Navigation, area encounters, town interactions */
var World = (function () {

  var currentNPCContext = null; // { npcId, shopId, questBoard, background }

  function showNPCMenu(npcId, options) {
    currentNPCContext = { npcId: npcId, shopId: options.shopId || null, questBoard: options.questBoard || false, background: options.background || '' };
    UI.renderNPCMenu(npcId, options);
    UI.showScreen("social");
  }

  function getNPCContext() { return currentNPCContext; }

  function returnToNPCMenu() {
    if (currentNPCContext) {
      showNPCMenu(currentNPCContext.npcId, currentNPCContext);
    } else {
      navigate("elderbrook");
    }
  }

  function navigate(locationId) {
    var p = Player.get();
    if (!p) return;
    p.currentArea = locationId;

    // Clear NPC context when navigating away
    currentNPCContext = null;

    if (locationId === "elderbrook") {
      // Show first-time arrival dialogue
      if (!p.hasEnteredTown) {
        p.hasEnteredTown = true;
        Dialogue.start("rowan-arrival", function () {
          // Roll event spawns for first visit
          p.eventSpawns = Chapter1.rollEventSpawns(p);
          UI.showScreen("town");
          UI.renderTown();
        });
        return;
      }
      // Roll event NPC spawns each time we enter town
      p.eventSpawns = Chapter1.rollEventSpawns(p);
      // Prompt build class at level 3
      if (p.level >= 3 && !p.buildClass && !Player.hasFlag('choseBuild')) {
        UI.renderBuildSelect();
        UI.showScreen('build-select');
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

    var areaScreen = document.getElementById("screen-area");
    if (areaScreen && loc.background) {
      areaScreen.style.backgroundImage = "url('" + loc.background + "')";
    }

    var html = '<div class="area-screen">';
    html += '<h2>' + loc.name + '</h2>';
    if (loc.recommendedLevel) html += '<p class="area-level">' + loc.recommendedLevel + '</p>';
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

    var areaScreen = document.getElementById("screen-area");
    if (areaScreen && loc.background) {
      areaScreen.style.backgroundImage = "url('" + loc.background + "')";
    }

    var html = '<div class="area-screen">';
    html += '<h2>' + loc.name + '</h2>';
    if (loc.recommendedLevel) html += '<p class="area-level">' + loc.recommendedLevel + '</p>';
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
    if (!Player.spendEnergy(2)) {
      UI.showMessage("You're too tired to explore. Sleep to restore energy.");
      return;
    }
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

    if (!Player.spendEnergy(1)) {
      UI.showMessage("You're too tired to gather. Sleep to restore energy.");
      return;
    }

    // 55% herb, 10% rare find (gold/double herb), 25% enemy, 10% nothing
    var roll = Math.random();
    var gatherTexts = [
      "You kneel by the water's edge and spot some useful herbs growing between the rocks.",
      "Pushing through the reeds, you find a patch of medicinal plants.",
      "You carefully harvest some herbs from the riverbank.",
      "The damp soil here is perfect — you pull up a handful of fresh herbs."
    ];
    var nothingTexts = [
      "You search the area but find nothing useful this time.",
      "The riverbank is quiet. Nothing catches your eye.",
      "You wade through the shallows but come up empty.",
      "A fish splashes nearby, but there's nothing else of interest."
    ];
    if (roll < 0.55) {
      if (Player.addItem(loc.gatherItem)) {
        var item = Items.get(loc.gatherItem);
        UI.showMessage(gatherTexts[Math.floor(Math.random() * gatherTexts.length)] + " Found: " + (item ? item.name : loc.gatherItem));
      } else {
        UI.showMessage("Inventory full!");
      }
    } else if (roll < 0.65) {
      // Rare find — bonus gold or double gather
      var rareRoll = Math.random();
      if (rareRoll < 0.5) {
        var bonus = Math.floor(Math.random() * 5) + 3;
        Player.get().gold += bonus;
        UI.updateHeader();
        UI.showMessage("You notice something glinting in the mud — " + bonus + " gold!");
      } else {
        var item1 = Player.addItem(loc.gatherItem);
        var item2 = item1 ? Player.addItem(loc.gatherItem) : false;
        if (item1 && item2) {
          UI.showMessage("Lucky find! You discover a dense cluster of herbs and gather two at once.");
        } else if (item1) {
          UI.showMessage("You find a nice cluster, but only have room for one more.");
        } else {
          UI.showMessage("You spot a great patch, but your inventory is full!");
        }
      }
    } else if (roll < 0.90) {
      explore(areaId);
      return;
    } else {
      UI.showMessage(nothingTexts[Math.floor(Math.random() * nothingTexts.length)]);
    }
  }

  function restAtInn() {
    var p = Player.get();
    var cost = 5;
    if (p.gold < cost) {
      UI.showMessage("The innkeeper shakes his head. 'That'll be " + cost + " gold, friend.' You don't have enough.");
      return;
    }
    p.gold -= cost;
    Player.sleep(); // advances day, restores HP/MP/energy, resets daily limits
    Audio.play("heal");
    Save.autoSave();
    UI.updateHeader();
    var innTexts = [
      "The innkeeper pours you a warm meal. You sleep soundly and wake refreshed.",
      "You settle into a creaky but comfortable bed. A full night's rest does wonders.",
      "The fire crackles in the hearth as you drift off. Morning comes quickly.",
      "A bowl of stew and a warm bed — simple comforts after a long day."
    ];
    UI.showMessage(innTexts[Math.floor(Math.random() * innTexts.length)] + " (-" + cost + " gold. Day " + p.day + " begins.)");
  }

  /* NPC interaction routing for town POIs */
  function visitShop(shopId) {
    var shop = Shops.getShop(shopId);
    if (!shop) return;

    var npcId = shop.npc; // "bram", "harlan", "mira"
    var background = shop.background || '';
    var menuOptions = { shopId: shopId, background: background };

    // Set shop background for any dialogue that fires
    if (shop.background) {
      UI.setDialogueBackground(shop.background);
    }

    // Check for chain quest turn-ins (fire automatically on arrival)
    if (shop) {
      if (shop.npc === "bram") {
        var cqs = ["cq1", "cq2"];
        for (var ci = 0; ci < cqs.length; ci++) {
          if (Quests.isActive(cqs[ci]) && Quests.checkObjectives(cqs[ci])) {
            var cqr = Quests.turnIn(cqs[ci]);
            if (cqr) {
              Audio.play("questComplete");
              Save.autoSave();
              Dialogue.start(cqs[ci] + "-complete", function () {
                showNPCMenu(npcId, menuOptions);
              });
              return;
            }
          }
        }
      }
      if (shop.npc === "mira") {
        var mcqs = ["cq3", "cq4"];
        for (var mi = 0; mi < mcqs.length; mi++) {
          if (Quests.isActive(mcqs[mi]) && Quests.checkObjectives(mcqs[mi])) {
            var mqr = Quests.turnIn(mcqs[mi]);
            if (mqr) {
              Audio.play("questComplete");
              Save.autoSave();
              Dialogue.start(mcqs[mi] + "-complete", function () {
                showNPCMenu(npcId, menuOptions);
              });
              return;
            }
          }
        }
      }
    }

    // Check for side quest turn-ins
    if (shop) {
      // Bram (weapon-shop) - SQ6
      if (shop.npc === "bram" && Quests.isActive("sq6") && Quests.checkObjectives("sq6")) {
        var result = Quests.turnIn("sq6");
        if (result) {
          Audio.play("questComplete");
          Dialogue.start("sq6-complete", function () {
            showNPCMenu(npcId, menuOptions);
            UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
          });
          return;
        }
      }
      // Harlan (armor-shop) - SQ3
      if (shop.npc === "harlan" && Quests.isActive("sq3") && Quests.checkObjectives("sq3")) {
        var result = Quests.turnIn("sq3");
        if (result) {
          Audio.play("questComplete");
          Dialogue.start("sq3-complete", function () {
            showNPCMenu(npcId, menuOptions);
            UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
          });
          return;
        }
      }
      // Mira (potion-shop) - SQ1, SQ2
      if (shop.npc === "mira") {
        if (Quests.isActive("sq1") && Quests.checkObjectives("sq1")) {
          var result = Quests.turnIn("sq1");
          if (result) {
            Audio.play("questComplete");
            Dialogue.start("sq1-complete", function () {
              showNPCMenu(npcId, menuOptions);
              UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
            });
            return;
          }
        }
        if (Quests.isActive("sq2") && Quests.checkObjectives("sq2")) {
          var result = Quests.turnIn("sq2");
          if (result) {
            Audio.play("questComplete");
            Dialogue.start("sq2-complete", function () {
              showNPCMenu(npcId, menuOptions);
              UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
            });
            return;
          }
        }
      }

      // First visit dialogues → then NPC menu
      if (shop.npc === "bram" && !Player.hasFlag("visitedBram")) {
        Dialogue.start("bram-first", function () {
          showNPCMenu(npcId, menuOptions);
        });
        return;
      }
      if (shop.npc === "harlan" && !Player.hasFlag("visitedHarlan")) {
        Dialogue.start("harlan-first", function () {
          showNPCMenu(npcId, menuOptions);
        });
        return;
      }
      if (shop.npc === "mira" && !Player.hasFlag("visitedMira")) {
        Dialogue.start("mira-first", function () {
          showNPCMenu(npcId, menuOptions);
        });
        return;
      }
    }

    // Default: show NPC menu
    showNPCMenu(npcId, menuOptions);
  }

  /* Opens shop with optional idle dialogue (called from NPC menu "Shop" button) */
  function npcOpenShop(shopId) {
    var shop = Shops.getShop(shopId);
    if (!shop) return;

    if (shop.background) {
      UI.setDialogueBackground(shop.background);
    }

    var idleKey = shop.npc + "-idle";
    if (Chapter1.getDialogue(idleKey)) {
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

    // Set guild background for dialogue
    UI.setDialogueBackground("assets/backgrounds/main-town-adventurers-guild.png");

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
    // Set questboard background for dialogue
    UI.setDialogueBackground("assets/backgrounds/main-town-questboard.png");

    var menuOptions = { questBoard: true, background: "assets/backgrounds/main-town-questboard.png" };

    // Check SQ4 turn-in (Toma's bounty quest)
    if (Quests.isActive("sq4") && Quests.checkObjectives("sq4")) {
      var result = Quests.turnIn("sq4");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq4-complete", function () {
          showNPCMenu("toma", menuOptions);
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    if (!Player.hasFlag("visitedQuestBoard")) {
      Dialogue.start("toma-first", function () {
        showNPCMenu("toma", menuOptions);
      });
      return;
    }
    // Default: show NPC menu
    showNPCMenu("toma", menuOptions);
  }

  /* Opens quest board with Toma's idle dialogue (called from NPC menu "Quest Board" button) */
  function npcOpenQuestBoard() {
    UI.setDialogueBackground("assets/backgrounds/main-town-questboard.png");
    Dialogue.start("toma-idle", function () {
      UI.renderQuestBoard();
      UI.showScreen("questboard");
    });
  }

  function visitElric() {
    // Set guard post background for dialogue
    UI.setDialogueBackground("assets/backgrounds/watch-post.png");

    // Check chain quests cq5, cq6
    var ecqs = ["cq5", "cq6"];
    for (var ei = 0; ei < ecqs.length; ei++) {
      if (Quests.isActive(ecqs[ei]) && Quests.checkObjectives(ecqs[ei])) {
        var eqr = Quests.turnIn(ecqs[ei]);
        if (eqr) {
          Audio.play("questComplete");
          Save.autoSave();
          Dialogue.start(ecqs[ei] + "-complete", function () {
            UI.showScreen("town");
            UI.renderTown();
          });
          return;
        }
      }
    }
    // Check SQ5 turn-in (Elric's guard badge quest)
    if (Quests.isActive("sq5") && Quests.checkObjectives("sq5")) {
      var result = Quests.turnIn("sq5");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq5-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    Dialogue.start("elric-idle", function () {
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  function visitElira() {
    showNPCMenu("elira", { background: '' });
  }

  /* ── NPC Menu Actions ── */

  function npcChat(npcId) {
    if (currentNPCContext && currentNPCContext.background) {
      UI.setDialogueBackground(currentNPCContext.background);
    }
    Relationships.chat(npcId, function () {
      returnToNPCMenu();
    });
  }

  function npcGift(npcId) {
    UI.renderGiftSelect(npcId);
  }

  function npcGiveGift(npcId, itemId) {
    if (currentNPCContext && currentNPCContext.background) {
      UI.setDialogueBackground(currentNPCContext.background);
    }
    Relationships.giveGift(npcId, itemId, function () {
      returnToNPCMenu();
    });
  }

  function npcDate(npcId) {
    if (currentNPCContext && currentNPCContext.background) {
      UI.setDialogueBackground(currentNPCContext.background);
    }
    Relationships.goOnDate(npcId, function () {
      returnToNPCMenu();
    });
  }

  function interactEvent(eventId) {
    var evt = Chapter1.getTownEventById(eventId);
    if (!evt) return;
    Dialogue.startDirect(evt.dialogue, function () {
      // Special: merchant opens shop after browsing
      if (eventId === "traveling-merchant" && Player.hasFlag("merchantBrowsed")) {
        openShop("merchant-shop");
        return;
      }
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  return {
    navigate: navigate,
    explore: explore,
    gather: gather,
    restAtInn: restAtInn,
    visitShop: visitShop,
    visitGuild: visitGuild,
    visitQuestBoard: visitQuestBoard,
    visitElric: visitElric,
    visitElira: visitElira,
    interactEvent: interactEvent,
    getNPCContext: getNPCContext,
    returnToNPCMenu: returnToNPCMenu,
    npcOpenShop: npcOpenShop,
    npcOpenQuestBoard: npcOpenQuestBoard,
    npcChat: npcChat,
    npcGift: npcGift,
    npcGiveGift: npcGiveGift,
    npcDate: npcDate
  };
})();
