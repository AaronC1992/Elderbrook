/* dungeon.js - Multi-room dungeon exploration */
var Dungeon = (function () {
  var currentDungeon = null;
  var currentRoom = 0;
  var inDungeon = false;

  // Dungeon definitions: arrays of room objects
  var dungeons = {
    "goblin-cave": {
      name: "Goblin Cave",
      area: "goblin-cave",
      background: "assets/backgrounds/goblin-cave-1.png",
      rooms: [
        { id: 0, name: "Cave Entrance", description: "The mouth of the cave yawns before you. Damp air carries the stench of goblins.", type: "start", exits: [1, 2] },
        { id: 1, name: "Narrow Tunnel", description: "A tight passage winds deeper. You hear shuffling ahead.", type: "enemy", exits: [3], enemyCount: 1 },
        { id: 2, name: "Side Chamber", description: "A small alcove. Something glints among the bones.", type: "treasure", exits: [3], loot: [{ itemId: "health-potion", chance: 0.8 }, { itemId: "mana-potion", chance: 0.5 }] },
        { id: 3, name: "Goblin Den", description: "A larger cavern littered with crude bedding and stolen goods.", type: "enemy", exits: [4, 5], enemyCount: 2 },
        { id: 4, name: "Mushroom Grotto", description: "Bioluminescent mushrooms cast an eerie glow. The air feels restorative.", type: "rest", exits: [6], healAmount: 15 },
        { id: 5, name: "Armory Alcove", description: "Crude weapons and some stolen equipment are stashed here.", type: "treasure", exits: [6], loot: [{ itemId: "iron-sword", chance: 0.3 }, { itemId: "leather-armor", chance: 0.2 }, { itemId: "health-potion", chance: 0.6 }] },
        { id: 6, name: "The Throne Room", description: "A crude throne of bones sits at the far end. The Goblin King awaits!", type: "boss", exits: [] }
      ]
    },
    "bandit-camp": {
      name: "Bandit Camp",
      area: "bandit-camp",
      background: "assets/backgrounds/bandit-camp-1.png",
      rooms: [
        { id: 0, name: "Camp Outskirts", description: "Firelight flickers through the trees. The bandits' camp lies ahead.", type: "start", exits: [1, 2] },
        { id: 1, name: "Guard Post", description: "A bandit stands watch by a crude barricade.", type: "enemy", exits: [3], enemyCount: 1 },
        { id: 2, name: "Supply Tent", description: "Crates and barrels are stacked haphazardly. Some look valuable.", type: "treasure", exits: [3], loot: [{ itemId: "health-potion", chance: 0.7 }, { itemId: "mana-potion", chance: 0.6 }, { itemId: "iron-helm", chance: 0.15 }] },
        { id: 3, name: "Training Grounds", description: "Straw dummies and weapon racks. Several bandits spar here.", type: "enemy", exits: [4, 5], enemyCount: 2 },
        { id: 4, name: "Campfire", description: "A crackling fire with a pot of stew. You could rest here.", type: "rest", exits: [6], healAmount: 20 },
        { id: 5, name: "Lockbox Stash", description: "A hidden stash behind some crates holds valuable loot.", type: "treasure", exits: [6], loot: [{ itemId: "steel-sword", chance: 0.2 }, { itemId: "iron-chestplate", chance: 0.15 }, { itemId: "health-potion", chance: 0.8 }] },
        { id: 6, name: "Leader's Tent", description: "The largest tent bears a crimson banner. The Bandit Leader awaits inside.", type: "boss", exits: [] }
      ]
    }
  };

  // Track which rooms have been cleared this run
  var clearedRooms = {};

  function enter(dungeonId) {
    currentDungeon = dungeons[dungeonId];
    if (!currentDungeon) return;
    currentRoom = 0;
    inDungeon = true;
    clearedRooms = {};
    render();
    UI.showScreen("dungeon");
  }

  function render() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoom];

    var nameEl = document.getElementById("dungeon-room-name");
    var descEl = document.getElementById("dungeon-room-desc");
    var actionsEl = document.getElementById("dungeon-actions");
    var mapEl = document.getElementById("dungeon-map");

    if (nameEl) nameEl.textContent = room.name;
    if (descEl) descEl.textContent = room.description;

    // Update background
    var screen = document.getElementById("screen-dungeon");
    if (screen && currentDungeon.background) {
      screen.style.backgroundImage = "url('" + currentDungeon.background + "')";
    }

    // Render actions
    if (actionsEl) {
      actionsEl.innerHTML = "";
      var isCleared = clearedRooms[room.id];

      if (room.type === "enemy" && !isCleared) {
        var fightBtn = document.createElement("button");
        fightBtn.className = "btn-primary";
        fightBtn.textContent = "Fight! (" + (room.enemyCount || 1) + " enemies)";
        fightBtn.addEventListener("click", function () {
          startRoomEncounter(room);
        });
        actionsEl.appendChild(fightBtn);
      } else if (room.type === "boss" && !isCleared) {
        var bossBtn = document.createElement("button");
        bossBtn.className = "btn-danger";
        bossBtn.textContent = "Challenge Boss!";
        bossBtn.addEventListener("click", function () {
          Battle.startBoss(currentDungeon.area);
        });
        actionsEl.appendChild(bossBtn);
      } else if (room.type === "treasure" && !isCleared) {
        var lootBtn = document.createElement("button");
        lootBtn.className = "btn-primary";
        lootBtn.textContent = "Search for Loot";
        lootBtn.addEventListener("click", function () {
          collectLoot(room);
        });
        actionsEl.appendChild(lootBtn);
      } else if (room.type === "rest" && !isCleared) {
        var restBtn = document.createElement("button");
        restBtn.className = "btn-primary";
        restBtn.textContent = "Rest Here (+" + room.healAmount + " HP)";
        restBtn.addEventListener("click", function () {
          restInRoom(room);
        });
        actionsEl.appendChild(restBtn);
      }

      if (isCleared && room.type !== "start") {
        var clearedMsg = document.createElement("p");
        clearedMsg.className = "flavor";
        clearedMsg.textContent = room.type === "boss" ? "The boss has been defeated!" : "This area has been cleared.";
        actionsEl.appendChild(clearedMsg);
      }

      // Navigation buttons for exits
      if (room.exits.length > 0 && (room.type === "start" || isCleared)) {
        var navLabel = document.createElement("p");
        navLabel.style.marginTop = "0.8rem";
        navLabel.style.color = "#9e9585";
        navLabel.textContent = "Choose a path:";
        actionsEl.appendChild(navLabel);

        for (var i = 0; i < room.exits.length; i++) {
          var exitRoom = currentDungeon.rooms[room.exits[i]];
          if (!exitRoom) continue;
          (function (targetRoom) {
            var navBtn = document.createElement("button");
            var cleared = clearedRooms[targetRoom.id];
            navBtn.className = cleared ? "btn-secondary" : "btn-primary";
            navBtn.textContent = targetRoom.name + (cleared ? " (cleared)" : "");
            navBtn.style.marginRight = "0.5rem";
            navBtn.style.marginTop = "0.4rem";
            navBtn.addEventListener("click", function () {
              currentRoom = targetRoom.id;
              Audio.buttonClick();
              render();
            });
            actionsEl.appendChild(navBtn);
          })(exitRoom);
        }
      }

      // Leave dungeon
      var leaveBtn = document.createElement("button");
      leaveBtn.className = "btn-back";
      leaveBtn.textContent = "Leave Dungeon";
      leaveBtn.style.marginTop = "1rem";
      leaveBtn.style.display = "block";
      leaveBtn.addEventListener("click", function () {
        leaveDungeon();
      });
      actionsEl.appendChild(leaveBtn);
    }

    // Render mini-map
    if (mapEl) {
      renderMiniMap(mapEl);
    }
  }

  function renderMiniMap(container) {
    container.innerHTML = "";
    if (!currentDungeon) return;

    for (var i = 0; i < currentDungeon.rooms.length; i++) {
      var room = currentDungeon.rooms[i];
      var node = document.createElement("div");
      node.className = "map-node";
      if (i === currentRoom) node.classList.add("map-current");
      if (clearedRooms[room.id]) node.classList.add("map-cleared");

      var typeIcon = "";
      if (room.type === "start") typeIcon = "S";
      else if (room.type === "enemy") typeIcon = "!";
      else if (room.type === "treasure") typeIcon = "?";
      else if (room.type === "rest") typeIcon = "+";
      else if (room.type === "boss") typeIcon = "B";

      node.textContent = typeIcon;
      node.title = room.name;
      container.appendChild(node);
    }
  }

  var roomFightsRemaining = 0;

  function startRoomEncounter(room) {
    roomFightsRemaining = (room.enemyCount || 1) - 1;
    Battle.start(currentDungeon.area);
  }

  // Called from battle victory when in dungeon
  function onBattleVictory() {
    if (roomFightsRemaining > 0) {
      roomFightsRemaining--;
      setTimeout(function () {
        Battle.start(currentDungeon.area);
      }, 500);
      return true;
    }
    var room = currentDungeon.rooms[currentRoom];
    clearedRooms[room.id] = true;
    return false;
  }

  function collectLoot(room) {
    if (!room.loot) return;
    clearedRooms[room.id] = true;
    var found = false;
    for (var i = 0; i < room.loot.length; i++) {
      var drop = room.loot[i];
      if (Math.random() < drop.chance) {
        if (!Player.inventoryFull()) {
          Player.addItem(drop.itemId);
          var item = Items.get(drop.itemId);
          MessageLog.add("Found: " + (item ? item.name : drop.itemId) + "!", "gold");
          Audio.shopBuy();
          found = true;
        } else {
          MessageLog.add("Inventory full! Can't carry any more.", "damage");
        }
      }
    }
    if (!found) {
      MessageLog.add("You search the area but find nothing useful.", "info");
    }
    render();
  }

  function restInRoom(room) {
    clearedRooms[room.id] = true;
    Player.heal(room.healAmount);
    MessageLog.add("You rest and recover " + room.healAmount + " HP.", "heal");
    Audio.heal();
    UI.updateHeader();
    render();
  }

  function leaveDungeon() {
    inDungeon = false;
    currentDungeon = null;
    currentRoom = 0;
    clearedRooms = {};
    UI.showScreen("world-map");
  }

  function resetState() {
    inDungeon = false;
    currentDungeon = null;
    currentRoom = 0;
    clearedRooms = {};
  }

  function isInDungeon() {
    return inDungeon;
  }

  return {
    enter: enter,
    render: render,
    isInDungeon: isInDungeon,
    onBattleVictory: onBattleVictory,
    leaveDungeon: leaveDungeon,
    resetState: resetState
  };
})();
