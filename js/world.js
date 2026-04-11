/* world.js - Navigation, area encounters, town interactions */
var World = (function () {

  var currentNPCContext = null; // { npcId, shopId, questBoard, background, returnToScene }

  function showNPCMenu(npcId, options) {
    options = options || {};
    currentNPCContext = {
      npcId: npcId,
      shopId: options.shopId || null,
      questBoard: options.questBoard || false,
      background: options.background || '',
      returnToScene: options.returnToScene || ''
    };
    UI.renderNPCMenu(npcId, currentNPCContext);
    UI.showScreen("social");
  }

  function getNPCContext() { return currentNPCContext; }

  function updateTownBackground() {
    var screen = document.getElementById("screen-town");
    if (!screen) return;
    var bg = Player.isFestivalActive()
      ? "assets/backgrounds/main-town-festival.png"
      : "assets/backgrounds/main-town.png";
    screen.style.backgroundImage = "url('" + bg + "')";
  }

  function returnToNPCMenu() {
    if (currentNPCContext) {
      showNPCMenu(currentNPCContext.npcId, currentNPCContext);
    } else {
      navigate("elderbrook");
    }
  }

  function leaveNPCMenu() {
    if (currentNPCContext && currentNPCContext.returnToScene === "shop" && currentNPCContext.shopId) {
      showShopScene(currentNPCContext.shopId);
      return;
    }
    if (currentNPCContext && currentNPCContext.returnToScene === "petshop") {
      showPetShopScene();
      return;
    }
    navigate("elderbrook");
  }

  function showShopScene(shopId) {
    var shop = Shops.getShop(shopId);
    if (!shop) return;
    Shops.renderShopScene(shopId);
    UI.showScreen("shop");
  }

  function openShopNPCMenu(shopId) {
    var shop = Shops.getShop(shopId);
    if (!shop) return;
    showNPCMenu(shop.npc, {
      shopId: shopId,
      background: shop.background || '',
      returnToScene: "shop",
      bustCrop: shop.bustCrop || false
    });
  }

  function showPetShopScene() {
    var screen = document.getElementById("screen-petshop");
    if (screen) {
      screen.style.backgroundImage = "url('assets/backgrounds/main-town-pet-shop.png')";
      screen.style.backgroundSize = "cover";
      screen.style.backgroundPosition = "center";
      screen.classList.add("petshop-scene-mode");
    }
    // Show full-body NPC
    var npcArea = document.getElementById("petshop-npc-area");
    var fauna = Chapter1.getNPC("fauna");
    if (npcArea && fauna && fauna.portrait) {
      npcArea.innerHTML = '<img class="shop-npc-fullbody is-interactive" src="' + fauna.portrait + '" alt="' + fauna.name + '" data-action="petshop-scene-interact" title="Talk to ' + fauna.name + '" onerror="this.style.display=\'none\'">';
    }
    // Clear shop content in scene mode
    var content = document.getElementById("petshop-content");
    if (content) content.innerHTML = '';
    UI.showScreen("petshop");
  }

  function openPetShopNPCMenu() {
    showNPCMenu("fauna", {
      background: "assets/backgrounds/main-town-pet-shop.png",
      returnToScene: "petshop",
      petShop: true
    });
  }

  function openPetShopInventory() {
    var screen = document.getElementById("screen-petshop");
    if (screen) screen.classList.remove("petshop-scene-mode");
    UI.renderPetShop();
    UI.showScreen("petshop");
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
        UI.setDialogueBackground("assets/backgrounds/main-town-adventurers-guild.png");
        Dialogue.start("rowan-arrival", function () {
          // Roll event spawns for first visit
          p.eventSpawns = Chapter1.rollEventSpawns(p);
          updateTownBackground();
          UI.showScreen("town");
          UI.renderTown();
        });
        return;
      }
      // Roll event NPC spawns each time we enter town
      p.eventSpawns = Chapter1.rollEventSpawns(p);
      // Hint about class mentors at level 3 (once)
      if (p.level >= 3 && !p.buildClass && !Player.hasFlag('seenMentorHint')) {
        Player.setFlag('seenMentorHint');
        updateTownBackground();
        UI.showScreen("town");
        UI.renderTown();
        UI.showMessage("You've grown stronger. Class mentors have appeared around town. Seek them out to choose your path.");
        return;
      }
      updateTownBackground();
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
      // Use exploration system for riverbank too
      Exploration.enter(locationId);
      return;
    }

    // Combat area — use DragonFable-style exploration
    if (loc.enemies && loc.enemies.length > 0) {
      Exploration.enter(locationId);
      return;
    }
  }

  function gather(areaId) {
    var loc = Chapter1.getLocation(areaId);
    if (!loc || !loc.gatherItem) return;

    if (!Player.spendEnergy(1)) {
      UI.showMessage("You're too tired to gather. Sleep to restore energy.");
      return;
    }

    // Base rates: 55% herb, 10% rare, 25% enemy, 10% nothing
    // Spring bonus: +10% to herb chance
    var herbChance = 0.55;
    if (Player.getSeason() === "spring") herbChance = 0.65;
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
    // Gathering progression: every 10 herbs gathered increases rare chance by 2%
    var herbsGathered = Player.get().herbsGathered || 0;
    var rareBonus = Math.floor(herbsGathered / 10) * 0.02;
    var rareThreshold = herbChance + Math.min(0.20, 0.10 + rareBonus);

    if (roll < herbChance) {
      if (Player.addItem(loc.gatherItem)) {
        var p2 = Player.get();
        p2.herbsGathered = (p2.herbsGathered || 0) + 1;
        if (p2.herbsGathered >= 20 && Player.unlockAchievement("herbalist")) {
          Audio.play("achievement");
        }
        Audio.play("gather");
        var item = Items.get(loc.gatherItem);
        UI.showMessage(gatherTexts[Math.floor(Math.random() * gatherTexts.length)] + " Found: " + (item ? item.name : loc.gatherItem));
      } else {
        UI.showMessage("Inventory full!");
      }
    } else if (roll < rareThreshold) {
      // Rare find — bonus gold or double gather
      var rareRoll = Math.random();
      if (rareRoll < 0.5) {
        var bonus = Math.floor(Math.random() * 5) + 3;
        Player.get().gold += bonus;
        UI.updateHeader();
        Audio.play("gatherRare");
        UI.showMessage("You notice something glinting in the mud — " + bonus + " gold!");
      } else {
        var item1 = Player.addItem(loc.gatherItem);
        var item2 = item1 ? Player.addItem(loc.gatherItem) : false;
        var p3 = Player.get();
        if (item1) p3.herbsGathered = (p3.herbsGathered || 0) + 1;
        if (item2) p3.herbsGathered = (p3.herbsGathered || 0) + 1;
        if (p3.herbsGathered >= 20 && Player.unlockAchievement("herbalist")) {
          Audio.play("achievement");
        }
        if (item1 && item2) {
          Audio.play("gatherRare");
          UI.showMessage("Lucky find! You discover a dense cluster of herbs and gather two at once.");
        } else if (item1) {
          UI.showMessage("You find a nice cluster, but only have room for one more.");
        } else {
          UI.showMessage("You spot a great patch, but your inventory is full!");
        }
      }
    } else if (roll < 0.90) {
      // Start combat directly — energy was already spent on the gather action
      Battle.start(areaId, function () {
        // Return to exploration node if active, otherwise world map
        if (typeof Exploration !== 'undefined' && Exploration.getCurrentArea()) {
          Exploration.renderNode();
          UI.showScreen("explore");
        } else {
          World.navigate(areaId);
        }
      });
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
    var oldSeason = Player.getSeason();
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
    var msg = innTexts[Math.floor(Math.random() * innTexts.length)] + " (-" + cost + " gold. Day " + p.day + " begins.)";
    var newSeason = Player.getSeason();
    if (newSeason !== oldSeason) {
      var seasonCap = newSeason.charAt(0).toUpperCase() + newSeason.slice(1);
      msg += " The season has changed to " + seasonCap + ".";
      UI.showSeasonBanner(newSeason);
    }
    UI.showMessage(msg);  }

  /* NPC interaction routing for town POIs */
  function visitShop(shopId) {
    var shop = Shops.getShop(shopId);
    if (!shop) return;

    var npcId = shop.npc; // "bram", "harlan", "mira"
    var background = shop.background || '';
    var menuOptions = { shopId: shopId, background: background, returnToScene: "shop" };

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
                showShopScene(shopId);
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
                showShopScene(shopId);
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
            showShopScene(shopId);
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
            showShopScene(shopId);
            UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
          });
          return;
        }
      }
      // Harlan (armor-shop) - SQ13 (Arms for the Guard)
      if (shop.npc === "harlan" && Quests.isActive("sq13") && Quests.checkObjectives("sq13")) {
        var result = Quests.turnIn("sq13");
        if (result) {
          Audio.play("questComplete");
          Dialogue.start("sq13-complete", function () {
            showShopScene(shopId);
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
              showShopScene(shopId);
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
              showShopScene(shopId);
              UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
            });
            return;
          }
        }
        // SQ11 (Mira's Moonpetal)
        if (Quests.isActive("sq11") && Quests.checkObjectives("sq11")) {
          var result = Quests.turnIn("sq11");
          if (result) {
            Audio.play("questComplete");
            Dialogue.start("sq11-complete", function () {
              showShopScene(shopId);
              UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
            });
            return;
          }
        }
        // SQ14 (The Herbalist's Request)
        if (Quests.isActive("sq14") && Quests.checkObjectives("sq14")) {
          var result = Quests.turnIn("sq14");
          if (result) {
            Audio.play("questComplete");
            Dialogue.start("sq14-complete", function () {
              showShopScene(shopId);
              UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
            });
            return;
          }
        }
      }

      // First visit dialogues → then NPC menu
      if (shop.npc === "bram" && !Player.hasFlag("visitedBram")) {
        Dialogue.start("bram-first", function () {
          showShopScene(shopId);
        });
        return;
      }
      if (shop.npc === "harlan" && !Player.hasFlag("visitedHarlan")) {
        Dialogue.start("harlan-first", function () {
          showShopScene(shopId);
        });
        return;
      }
      if (shop.npc === "mira" && !Player.hasFlag("visitedMira")) {
        Dialogue.start("mira-first", function () {
          showShopScene(shopId);
        });
        return;
      }
    }

    // Default: show the room and wait for explicit NPC interaction.
    showShopScene(shopId);
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
    if (Quests.isActive("mq8") && Quests.checkObjectives("mq8")) {
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

    // Check SQ9 turn-in (Hungry Wolves - Rowan)
    if (Quests.isActive("sq9") && Quests.checkObjectives("sq9")) {
      var result = Quests.turnIn("sq9");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq9-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }

    // Post-chapter celebration
    if (Player.hasFlag("chapter1Complete") && !Player.hasFlag("celebrationDone")) {
      Player.get().gold += 100;
      Dialogue.start("celebration", function () {
        UI.showScreen("town");
        UI.renderTown();
        UI.showMessage("Celebration! +100 gold and supplies received!");
        UI.updateHeader();
      });
      return;
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

    var menuOptions = { questBoard: true, background: "assets/backgrounds/main-town-questboard.png", bustCrop: true };

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
    // Check SQ8 turn-in (Toma's Lost Ledger)
    if (Quests.isActive("sq8") && Quests.checkObjectives("sq8")) {
      var result = Quests.turnIn("sq8");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq8-complete", function () {
          showNPCMenu("toma", menuOptions);
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    // Check SQ12 turn-in (Toma's Special Bounty)
    if (Quests.isActive("sq12") && Quests.checkObjectives("sq12")) {
      var result = Quests.turnIn("sq12");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq12-complete", function () {
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
    // Elric is away on escort missions
    var elricAway = (Player.hasFlag("elricJoinedMQ4") && !Player.hasFlag("completedMQ4")) ||
                    (Player.hasFlag("acceptedMQ7") && !Player.hasFlag("completedMQ7"));
    if (elricAway) {
      var awayMsg = Player.hasFlag("acceptedMQ7") ? "Captain Elric has gone ahead to the Goblin Cave. He's waiting for you at the boss chamber." : "Captain Elric is patrolling the Goblin Trail. Meet him there.";
      UI.showMessage(awayMsg);
      return;
    }

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
    // Check SQ7 turn-in (Patrol Escort quest)
    if (Quests.isActive("sq7") && Quests.checkObjectives("sq7")) {
      var result = Quests.turnIn("sq7");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq7-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    // Check SQ10 turn-in (The Old Patrol Logs - Elric)
    if (Quests.isActive("sq10") && Quests.checkObjectives("sq10")) {
      var result = Quests.turnIn("sq10");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq10-complete", function () {
          UI.showScreen("town");
          UI.renderTown();
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    // Check SQ16 turn-in (Guard Duty - early Elric)
    var elricMenuOptions = { background: "assets/backgrounds/watch-post.png" };
    if (Quests.isActive("sq16") && Quests.checkObjectives("sq16")) {
      var result = Quests.turnIn("sq16");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq16-complete", function () {
          showNPCMenu("elric", elricMenuOptions);
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    // Check SQ17 turn-in (Road Patrol - early Elric)
    if (Quests.isActive("sq17") && Quests.checkObjectives("sq17")) {
      var result = Quests.turnIn("sq17");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq17-complete", function () {
          showNPCMenu("elric", elricMenuOptions);
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    // Default: show NPC menu for relationship interactions
    if (!Player.hasFlag("visitedElric")) {
      Dialogue.start("elric-first", function () {
        showNPCMenu("elric", elricMenuOptions);
      });
      return;
    }
    showNPCMenu("elric", elricMenuOptions);
  }

  function visitElira() {
    // Check chain quests cq7, cq8
    var ecqs = ["cq7", "cq8"];
    for (var ei = 0; ei < ecqs.length; ei++) {
      if (Quests.isActive(ecqs[ei]) && Quests.checkObjectives(ecqs[ei])) {
        var eqr = Quests.turnIn(ecqs[ei]);
        if (eqr) {
          Audio.play("questComplete");
          Save.autoSave();
          Dialogue.start(ecqs[ei] + "-complete", function () {
            showNPCMenu("elira", { background: '' });
          });
          return;
        }
      }
    }
    // Check SQ15 turn-in (Whispers in the Dark - Elira)
    if (Quests.isActive("sq15") && Quests.checkObjectives("sq15")) {
      var result = Quests.turnIn("sq15");
      if (result) {
        Audio.play("questComplete");
        Dialogue.start("sq15-complete", function () {
          showNPCMenu("elira", { background: '' });
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
        });
        return;
      }
    }
    // Northern Ruins post-game tease
    if (Player.hasFlag("chapter1Complete") && Player.hasFlag("celebrationDone") && !Player.hasFlag("northernRuinsTease")) {
      Dialogue.start("northern-ruins-tease", function () {
        showNPCMenu("elira", { background: '' });
      });
      return;
    }
    showNPCMenu("elira", { background: '' });
  }

  function visitLiora() {
    var lioraMenuOptions = { background: "assets/backgrounds/main-town.png" };
    UI.setDialogueBackground("assets/backgrounds/main-town.png");

    if (!Player.hasFlag("visitedLiora")) {
      Dialogue.start("liora-first", function () {
        showNPCMenu("liora", lioraMenuOptions);
      });
      return;
    }

    if (Chapter1.getDialogue("liora-idle")) {
      Dialogue.start("liora-idle", function () {
        showNPCMenu("liora", lioraMenuOptions);
      });
      return;
    }

    showNPCMenu("liora", lioraMenuOptions);
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

    // Track unique town events for Town Regular achievement
    var p = Player.get();
    if (!p.townEventsSeen) p.townEventsSeen = [];
    if (p.townEventsSeen.indexOf(eventId) === -1) {
      p.townEventsSeen.push(eventId);
      if (p.townEventsSeen.length >= 4 && Player.unlockAchievement("town-regular")) {
        Audio.play("achievement");
      }
    }

    Dialogue.startDirect(evt.dialogue, function () {
      // Special: merchant opens shop after browsing
      if (eventId === "traveling-merchant" && Player.hasFlag("merchantBrowsed")) {
        openShop("merchant-shop");
        return;
      }
      // Special: festival-prep triggers the harvest festival
      if (eventId === "festival-prep" && !Player.isFestivalActive()) {
        Player.startFestival();
        updateTownBackground();
      }
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  /* ── Biscuit the Cat Quest ── */
  function checkOnChild() {
    var lines = [
      "Have you found Biscuit yet? She's orange with a white spot on her nose... please find her!",
      "I keep looking but I can't see her anywhere... did you check near the gate?",
      "You're still looking, right? Please don't give up on her!",
      "Biscuit likes warm places and hiding in small spaces. Maybe she's near the gate?"
    ];
    var line = lines[Math.floor(Math.random() * lines.length)];
    var dialogue = {
      id: "check-on-child",
      nodes: [
        { speaker: "Lost Child", portrait: "assets/portraits/lost-child.png", text: line, end: true }
      ]
    };
    Dialogue.startDirect(dialogue, function () {
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  function findBiscuit() {
    var dialogue = {
      id: "find-biscuit",
      nodes: [
        { speaker: "", portrait: "assets/portraits/biscuit-cat.png", text: "A flash of orange fur catches your eye near the gate. A small cat with a white spot on her nose blinks up at you and meows." },
        { speaker: "", portrait: "assets/portraits/biscuit-cat.png", text: "This must be Biscuit! She purrs and rubs against your ankles as if she's been waiting for someone to notice her.", end: true }
      ],
      onEnd: { flags: ["foundBiscuit"] }
    };
    Dialogue.startDirect(dialogue, function () {
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  function returnBiscuit() {
    var dialogue = {
      id: "return-biscuit",
      nodes: [
        { speaker: "Lost Child", portrait: "assets/portraits/lost-child.png", text: "BISCUIT! You found her!" },
        { speaker: "", portrait: "assets/portraits/biscuit-cat.png", text: "The cat leaps from your arms and nuzzles into the child's embrace, purring loud enough to rival a blacksmith's bellows." },
        { speaker: "Lost Child", portrait: "assets/portraits/lost-child.png", text: "Thank you so so SO much! Mama gave me some coins to give to whoever found her. Here, take them!" },
        { speaker: "", portrait: "", text: "The child hands you a small pouch of coins and runs off, clutching Biscuit tightly. You earned 20 gold!", end: true }
      ],
      onEnd: { flags: ["returnedBiscuit"] }
    };
    Dialogue.startDirect(dialogue, function () {
      var p = Player.get();
      p.gold += 20;
      UI.showScreen("town");
      UI.renderTown();
    });
  }

  function visitPetShop() {
    showPetShopScene();
  }

  /* ── Class Mentor Visit ── */
  function visitClassMentor(mentorId) {
    var npc = Chapter1.getNPC(mentorId);
    if (!npc) return;

    // Map mentor NPC ID → class quest ID
    var mentorQuestMap = {
      varn: "cq-warrior", shade: "cq-rogue", theron: "cq-mage",
      lysara: "cq-knight", grul: "cq-berserker", whisper: "cq-assassin",
      fenn: "cq-ranger", cindra: "cq-pyromancer", maren: "cq-cleric",
      cedric: "cq-paladin"
    };
    var questId = mentorQuestMap[mentorId];
    if (!questId) return;

    var metFlag = "met" + mentorId.charAt(0).toUpperCase() + mentorId.slice(1);

    // Check for quest turn-in first
    if (questId && Quests.isActive(questId) && Quests.checkObjectives(questId)) {
      var result = Quests.turnIn(questId);
      if (result) {
        Audio.play("questComplete");
        Save.autoSave();
        Dialogue.start(questId + "-complete", function () {
          UI.showMessage("Quest complete! +" + result.rewards.xp + " XP, +" + (result.rewards.gold || 0) + " gold");
          UI.updateHeader();
          UI.updateSidebars();
          World.navigate("elderbrook");
        });
        return;
      }
    }

    // First meeting: dialogue offers quest
    if (!Player.hasFlag(metFlag)) {
      Dialogue.start(mentorId + "-first", function () {
        UI.updateHeader();
        UI.updateSidebars();
        if (Quests.isActive(questId)) {
          UI.showMessage("New quest accepted!");
        }
        UI.showScreen("town");
        UI.renderTown();
      });
      return;
    }

    // Already met, quest in progress: idle dialogue
    var idleKey = mentorId + "-idle";
    if (Chapter1.getDialogue(idleKey)) {
      Dialogue.start(idleKey, function () {
        UI.showScreen("town");
        UI.renderTown();
      });
      return;
    }

    // Fallback
    UI.showScreen("town");
    UI.renderTown();
  }

  return {
    navigate: navigate,
    gather: gather,
    restAtInn: restAtInn,
    visitShop: visitShop,
    visitGuild: visitGuild,
    visitQuestBoard: visitQuestBoard,
    visitElric: visitElric,
    visitLiora: visitLiora,
    visitElira: visitElira,
    interactEvent: interactEvent,
    checkOnChild: checkOnChild,
    findBiscuit: findBiscuit,
    returnBiscuit: returnBiscuit,
    visitPetShop: visitPetShop,
    visitClassMentor: visitClassMentor,
    getNPCContext: getNPCContext,
    returnToNPCMenu: returnToNPCMenu,
    leaveNPCMenu: leaveNPCMenu,
    npcOpenShop: npcOpenShop,
    openShopNPCMenu: openShopNPCMenu,
    openPetShopNPCMenu: openPetShopNPCMenu,
    openPetShopInventory: openPetShopInventory,
    npcOpenQuestBoard: npcOpenQuestBoard,
    npcChat: npcChat,
    npcGift: npcGift,
    npcGiveGift: npcGiveGift,
    npcDate: npcDate
  };
})();
