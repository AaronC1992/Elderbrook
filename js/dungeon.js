/* dungeon.js - Goblin Cave dungeon (8 rooms) for Chapter 1 */
var Dungeon = (function () {

  var dungeons = {
    "goblin-cave": {
      id: "goblin-cave",
      name: "Goblin Cave",
      background: "assets/backgrounds/goblin-cave-1.png",
      rooms: [
        {
          id: 0, name: "Cave Entrance", type: "start",
          description: "The mouth of the goblin cave. A foul stench drifts from the darkness ahead.",
          exits: [1]
        },
        {
          id: 1, name: "Outer Tunnels", type: "enemy",
          description: "Narrow tunnels dimly lit by fungal growth. Goblins patrol here.",
          enemies: ["goblin-guard", "goblin-scout"],
          enemyCount: 2,
          exits: [2],
          secret: { id: 8, dexCheck: 5, hint: "You notice scratch marks along the wall..." }
        },
        {
          id: 2, name: "Supply Cache", type: "treasure",
          description: "A small chamber stacked with stolen goods and supplies.",
          loot: [
            { id: "health-potion", chance: 1.0 },
            { id: "goblin-scrap", chance: 0.6 },
            { id: "goblin-scrap", chance: 0.4 }
          ],
          exits: [3]
        },
        {
          id: 3, name: "Guard Room", type: "enemy",
          description: "A wider cave room. Goblin guards stand watch over the deeper passages.",
          enemies: ["goblin-guard", "goblin-guard", "goblin-brute"],
          enemyCount: 2,
          exits: [4, 9]
        },
        {
          id: 4, name: "Underground Spring", type: "rest",
          description: "A natural spring trickles into a shallow pool. The air is cool and damp.",
          restHealPercent: 0.5,
          exits: [5]
        },
        {
          id: 5, name: "Shaman's Chamber", type: "enemy",
          description: "Strange totems line the walls. A goblin shaman chants in the shadows.",
          enemies: ["goblin-shaman", "goblin-guard"],
          enemyCount: 2,
          specialLoot: [{ id: "strange-sigil", chance: 1.0, requireQuest: "mq6" }],
          exits: [6]
        },
        {
          id: 6, name: "War Room", type: "enemy",
          description: "Maps and crude battle plans cover a stone table. The goblins were planning something big.",
          enemies: ["goblin-brute", "goblin-guard", "goblin-archer"],
          enemyCount: 2,
          exits: [7]
        },
        {
          id: 7, name: "Chief's Throne", type: "boss",
          description: "The deepest chamber. A crude throne sits atop a pile of stolen goods. Goblin Chief Grisk awaits.",
          boss: "goblin-chief-grisk",
          exits: []
        },
        {
          id: 8, name: "Hidden Alcove", type: "treasure", isSecret: true,
          description: "A hidden passage behind crumbling rock reveals a forgotten stash.",
          loot: [
            { id: "enchanted-shard", chance: 1.0 },
            { id: "shadow-essence", chance: 0.8 },
            { id: "greater-health-potion", chance: 1.0 },
            { id: "shadow-fang", chance: 0.15 }
          ],
          exits: [1]
        },
        {
          id: 9, name: "Collapsed Passage", type: "enemy",
          description: "A side tunnel partially blocked by rubble. Goblins tried to seal it off.",
          enemies: ["goblin-brute", "goblin-shaman"],
          enemyCount: 2,
          exits: [5],
          loot: [
            { id: "iron-ore", chance: 0.8 },
            { id: "iron-ore", chance: 0.5 },
            { id: "beast-sinew", chance: 0.6 }
          ]
        }
      ]
    }
  };

  var currentDungeon = null;
  var currentRoomIndex = 0;
  var clearedRooms = {};
  var dungeonLoot = {};

  function enter(dungeonId) {
    var d = dungeons[dungeonId];
    if (!d) return false;
    currentDungeon = d;
    currentRoomIndex = 0;
    clearedRooms = {};
    dungeonLoot = {};
    roomHistory = [];
    renderRoom();
    UI.showScreen("dungeon");
    return true;
  }

  function renderRoom() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room) return;

    var container = document.getElementById("dungeon-content");
    if (!container) return;

    var isCleared = clearedRooms[room.id];
    var html = '';

    // Dungeon name and mini-map
    html += '<div class="dungeon-header">';
    html += '<h2>' + currentDungeon.name + '</h2>';
    html += renderMiniMap();
    html += '</div>';

    // Room info
    html += '<div class="dungeon-room">';
    html += '<h3>' + room.name + '</h3>';
    html += '<p>' + room.description + '</p>';

    // Room-type specific content
    if (room.type === "start") {
      html += '<p>You stand at the entrance. Steel yourself and proceed.</p>';
    } else if (room.type === "enemy" && !isCleared) {
      html += '<p class="room-warning">Enemies lurk ahead!</p>';
      html += '<button class="btn" data-action="dungeon-fight">Fight</button>';
    } else if (room.type === "enemy" && isCleared) {
      html += '<p class="room-cleared">The room is cleared.</p>';
    } else if (room.type === "treasure") {
      if (!dungeonLoot[room.id]) {
        html += '<button class="btn" data-action="dungeon-loot">Search</button>';
      } else {
        html += '<p class="room-cleared">Already searched.</p>';
      }
    } else if (room.type === "rest") {
      if (!isCleared) {
        html += '<p>A place to rest and recover.</p>';
        html += '<button class="btn" data-action="dungeon-rest">Rest</button>';
      } else {
        html += '<p class="room-cleared">You already rested here.</p>';
      }
    } else if (room.type === "boss") {
      if (!isCleared) {
        html += '<p class="room-warning">The boss awaits!</p>';
        html += '<button class="btn btn-danger" data-action="dungeon-boss">Challenge Boss</button>';
      } else {
        html += '<p class="room-cleared">The boss has been defeated.</p>';
      }
    }

    // Search for secrets
    if (room.secret && !clearedRooms['secret_' + room.id] && (isCleared || room.type === 'start')) {
      html += '<button class="btn btn-secondary" data-action="dungeon-search-secret">Search for secrets</button>';
    }

    // Navigation
    html += '<div class="dungeon-nav">';
    if (currentRoomIndex > 0) {
      html += '<button class="btn" data-action="dungeon-back">Back</button>';
    }
    if (room.exits.length > 0 && (isCleared || room.type === "start" || room.type === "treasure" || room.type === "rest")) {
      for (var i = 0; i < room.exits.length; i++) {
        var nextRoom = currentDungeon.rooms[room.exits[i]];
        html += '<button class="btn" data-action="dungeon-move" data-room="' + room.exits[i] + '">Proceed to ' + nextRoom.name + '</button>';
      }
    }
    html += '<button class="btn" data-action="dungeon-exit">Leave Dungeon</button>';
    html += '</div>';

    html += '</div>';

    // Player status
    var p = Player.get();
    html += '<div class="dungeon-player-status">';
    html += 'HP: ' + p.hp + '/' + p.maxHp + ' | MP: ' + p.mp + '/' + p.maxMp;
    html += '</div>';

    container.innerHTML = html;
  }

  function renderMiniMap() {
    var html = '<div class="dungeon-minimap">';
    var mainPath = [0, 1, 2, 3, 4, 5, 6, 7];
    for (var i = 0; i < mainPath.length; i++) {
      var r = currentDungeon.rooms[mainPath[i]];
      var cls = "minimap-room";
      if (r.id === currentRoomIndex) cls += " minimap-current";
      else if (clearedRooms[r.id]) cls += " minimap-cleared";
      var label = r.type === "boss" ? "B" : String(i + 1);
      html += '<div class="' + cls + '" title="' + r.name + '">' + label + '</div>';
      if (r.exits && r.exits.length > 1) {
        html += '<div class="minimap-branch" title="Branching path">*</div>';
      }
      if (i < mainPath.length - 1) {
        html += '<div class="minimap-connector"></div>';
      }
    }
    // Show secret/branch rooms if discovered
    for (var j = 8; j < currentDungeon.rooms.length; j++) {
      var sr = currentDungeon.rooms[j];
      if (clearedRooms[sr.id] || sr.id === currentRoomIndex) {
        html += '<div class="minimap-connector minimap-secret-conn"></div>';
        var scls = "minimap-room minimap-secret";
        if (sr.id === currentRoomIndex) scls += " minimap-current";
        else if (clearedRooms[sr.id]) scls += " minimap-cleared";
        html += '<div class="' + scls + '" title="' + sr.name + '">?</div>';
      }
    }
    html += '</div>';
    return html;
  }

  function moveToRoom(roomIndex) {
    if (!currentDungeon) return;
    if (roomIndex < 0 || roomIndex >= currentDungeon.rooms.length) return;
    roomHistory.push(currentRoomIndex);
    currentRoomIndex = roomIndex;
    renderRoom();
  }

  var roomHistory = [];

  function goBack() {
    if (roomHistory.length > 0) {
      currentRoomIndex = roomHistory.pop();
      renderRoom();
    }
  }

  function fightRoom() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room || room.type !== "enemy" || clearedRooms[room.id]) return;

    // Pick a random enemy from room's pool
    var pool = room.enemies;
    var pick = pool[Math.floor(Math.random() * pool.length)];

    Battle.startDungeonEnemy(pick, function () {
      onRoomCleared();
    });
  }

  function fightBoss() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room || room.type !== "boss" || clearedRooms[room.id]) return;

    Battle.startBoss(room.boss, function () {
      clearedRooms[room.id] = true;
      UI.showScreen("dungeon");
      renderRoom();
    });
  }

  function onRoomCleared() {
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room) return;

    // Track how many fights completed in this room
    if (!clearedRooms[room.id + "_fights"]) clearedRooms[room.id + "_fights"] = 0;
    clearedRooms[room.id + "_fights"]++;

    // Check if room fully cleared
    if (clearedRooms[room.id + "_fights"] >= (room.enemyCount || 1)) {
      clearedRooms[room.id] = true;

      // Drop room loot (for enemy rooms with loot arrays)
      if (room.loot) {
        for (var li = 0; li < room.loot.length; li++) {
          if (Math.random() < room.loot[li].chance) {
            Player.addItem(room.loot[li].id);
          }
        }
      }

      // Drop special loot
      if (room.specialLoot) {
        for (var i = 0; i < room.specialLoot.length; i++) {
          var sl = room.specialLoot[i];
          if (sl.requireQuest && !Quests.isActive(sl.requireQuest)) continue;
          if (Math.random() < sl.chance) {
            Player.addItem(sl.id);
            var it = Items.get(sl.id);
          }
        }
      }
    }

    UI.showScreen("dungeon");
    renderRoom();
  }

  function collectLoot() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room || room.type !== "treasure" || dungeonLoot[room.id]) return;

    dungeonLoot[room.id] = true;
    var found = [];
    if (room.loot) {
      for (var i = 0; i < room.loot.length; i++) {
        if (Math.random() < room.loot[i].chance) {
          Player.addItem(room.loot[i].id);
          var item = Items.get(room.loot[i].id);
          found.push(item ? item.name : room.loot[i].id);
        }
      }
    }
    renderRoom();
    if (found.length > 0) {
      UI.showMessage("Found: " + found.join(", "));
    } else {
      UI.showMessage("Nothing useful here.");
    }
  }

  function restInRoom() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room || room.type !== "rest" || clearedRooms[room.id]) return;

    clearedRooms[room.id] = true;
    var p = Player.get();
    var healAmount = Math.floor(p.maxHp * (room.restHealPercent || 0.5));
    var manaAmount = Math.floor(p.maxMp * 0.3);
    Player.heal(healAmount);
    Player.restoreMana(manaAmount);
    Audio.play("heal");
    renderRoom();
    UI.showMessage("Rested. Restored " + healAmount + " HP and " + manaAmount + " MP.");
  }

  function searchForSecret() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room || !room.secret || clearedRooms['secret_' + room.id]) return;

    clearedRooms['secret_' + room.id] = true;
    var p = Player.get();
    var dex = p.dexterity || 0;
    var roll = Math.floor(Math.random() * 10) + 1 + dex;

    if (roll >= room.secret.dexCheck) {
      Audio.play('secretFound');
      Player.unlockAchievement('treasure-seeker');
      UI.showMessage('You found a hidden passage!');
      moveToRoom(room.secret.id);
    } else {
      UI.showMessage(room.secret.hint || 'You search but find nothing.');
      renderRoom();
    }
  }

  function exitDungeon() {
    currentDungeon = null;
    currentRoomIndex = 0;
    roomHistory = [];
    World.navigate("elderbrook");
  }

  return {
    enter: enter,
    renderRoom: renderRoom,
    moveToRoom: moveToRoom,
    goBack: goBack,
    fightRoom: fightRoom,
    fightBoss: fightBoss,
    collectLoot: collectLoot,
    restInRoom: restInRoom,
    searchForSecret: searchForSecret,
    exitDungeon: exitDungeon
  };
})();
