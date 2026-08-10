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
          description: "The mouth of the goblin cave yawns before you, reeking of smoke and rotting meat. Scratched into the rock beside the entrance is a crude warning sigil, not goblin-made, but far older. The goblins merely borrowed this place from whatever carved these tunnels long ago.",
          exits: [1]
        },
        {
          id: 1, name: "Outer Tunnels", type: "enemy",
          description: "Narrow tunnels dimly lit by phosphorescent fungal growth. The walls bear two kinds of markings: crude goblin scratches and beneath them, smooth geometric lines carved with precision no goblin could manage. Someone built these tunnels. The goblins just moved in.",
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
          description: "A wider cave room where goblin guards stand watch. Stolen weapons and shields line the walls in organized racks, an unusual level of discipline for goblins. A faded mural on the ceiling depicts a spiraling pattern that seems to pull at your eyes.",
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
          description: "Strange totems carved from bone and shadow stone line the walls. A goblin shaman chants in the shadows, surrounded by glowing sigils drawn in ash. The same spiraling mark from the guard room appears here, larger and more deliberate. This is where the goblins learned their dark loyalty.",
          enemies: ["goblin-shaman", "goblin-guard"],
          enemyCount: 2,
          specialLoot: [{ id: "strange-sigil", chance: 1.0, requireQuest: "mq6" }],
          exits: [6]
        },
        {
          id: 6, name: "War Room", type: "enemy",
          description: "Maps and crude battle plans cover a stone table that predates the goblins by centuries. The goblins have overlaid their raid routes on top of older, more detailed cartography. Someone was planning something far larger than goblin raids.",
          enemies: ["goblin-brute", "goblin-guard", "goblin-archer"],
          enemyCount: 2,
          exits: [7]
        },
        {
          id: 7, name: "Chief's Throne", type: "boss",
          description: "The deepest chamber. A crude throne sits atop a pile of stolen goods, but behind it, the cave wall has been carved into an archway of ancient design. Symbols pulse faintly in the stone. Goblin Chief Grisk awaits, but even he seems small compared to whatever once ruled this place.",
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

  var ROOM_FLAVORS = {
    0: "The stench of goblins is overpowering. No turning back.",
    1: "Narrow tunnels lit by phosphorescent fungal growth.",
    2: "Stolen goods are piled high in this small chamber.",
    3: "Goblin guards stand watch among stolen weapons.",
    4: "A natural spring offers a moment of respite.",
    5: "Strange totems and glowing sigils... dark magic lingers.",
    6: "Maps and battle plans cover an ancient stone table.",
    7: "The deepest chamber. The goblin chief awaits.",
    8: "A hidden passage reveals a forgotten stash.",
    9: "A side tunnel partially blocked by rubble."
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

    // First-time cave entry prompt
    if (dungeonId === "goblin-cave" && !Player.hasFlag("enteredCave")) {
      Player.setFlag("enteredCave");
      Dialogue.startDirect({
        nodes: [
          { speaker: "", portrait: "", text: "The air turns cold and damp. The stench of goblins is overpowering. There's no turning back from here." },
          { speaker: "", portrait: "", text: "You grip your weapon tighter and step into the darkness." }
        ],
        onEnd: null
      }, function () {
        renderRoom();
        UI.showScreen("dungeon");
      });
      return true;
    }

    // Re-entry after defeating Grisk
    if (dungeonId === "goblin-cave" && Player.hasFlag("defeatedGrisk")) {
      // Pre-clear the boss room so the boss doesn't respawn
      for (var ri = 0; ri < d.rooms.length; ri++) {
        if (d.rooms[ri].type === "boss") clearedRooms[d.rooms[ri].id] = true;
      }
      Dialogue.startDirect({
        nodes: [
          { speaker: "", portrait: "", text: "The cave is quieter now, but goblins have already begun creeping back in. Remnants of the chief's forces still lurk in the tunnels." }
        ],
        onEnd: null
      }, function () {
        renderRoom();
        UI.showScreen("dungeon");
      });
      return true;
    }

    renderRoom();
    UI.showScreen("dungeon");
    return true;
  }

  function renderRoom() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room) return;

    var screen = document.getElementById("screen-dungeon");
    var container = document.getElementById("dungeon-content");
    if (!screen || !container) return;

    // Set background
    screen.style.backgroundImage = "url('" + currentDungeon.background + "')";

    var isCleared = clearedRooms[room.id];
    var html = '';

    // Header with name, breadcrumb and flavor
    var flavor = ROOM_FLAVORS[room.id] || '';
    html += '<div class="explore-header">';
    html += '<span class="explore-area-name">' + room.name + '</span>';
    html += renderBreadcrumb();
    html += '<span class="explore-flavor">' + flavor + '</span>';
    html += '</div>';

    // Cleared/status badges
    if (room.type === "enemy" && isCleared) {
      html += '<div class="explore-cleared-badge">Room Cleared</div>';
    }
    if (room.type === "boss" && isCleared) {
      html += '<div class="explore-cleared-badge">Boss Defeated</div>';
    }
    if (room.type === "treasure" && dungeonLoot[room.id]) {
      html += '<div class="explore-cleared-badge">Searched</div>';
    }
    if (room.type === "rest" && isCleared) {
      html += '<div class="explore-cleared-badge">Rested</div>';
    }

    // Enemy portraits (enemy rooms that aren't cleared)
    if (room.type === "enemy" && !isCleared) {
      var fights = clearedRooms[room.id + "_fights"] || 0;
      var total = room.enemyCount || 1;
      var remaining = total - fights;
      for (var i = fights; i < total; i++) {
        var enemyId = room.enemies[i % room.enemies.length];
        var template = Enemies.get(enemyId);
        if (!template) continue;
        var pos = getEnemyPosition(i - fights, remaining);
        html += '<button class="explore-enemy" style="left:' + pos.x + '%;top:' + pos.y + '%" ';
        html += 'data-action="dungeon-fight" title="Fight ' + template.name + '">';
        html += '<img class="explore-enemy-portrait" src="' + template.portrait + '" alt="' + template.name + '" onerror="this.style.display=\'none\'" />';
        html += '<span class="explore-enemy-name">' + template.name + '</span>';
        html += '</button>';
      }
    }

    // Boss portrait
    if (room.type === "boss" && !isCleared) {
      var boss = Enemies.getBoss(room.boss);
      if (boss) {
        html += '<button class="explore-enemy dungeon-boss-marker" style="left:50%;top:42%" ';
        html += 'data-action="dungeon-boss" title="Challenge ' + boss.name + '">';
        html += '<img class="explore-enemy-portrait dungeon-boss-portrait" src="' + boss.portrait + '" alt="' + boss.name + '" onerror="this.style.display=\'none\'" />';
        html += '<span class="explore-enemy-name dungeon-boss-name">' + boss.name + '</span>';
        html += '</button>';
      }
    }

    // Treasure chest
    if (room.type === "treasure" && !dungeonLoot[room.id]) {
      html += '<button class="explore-chest" style="left:50%;top:55%" data-action="dungeon-loot">';
      html += '<div class="explore-chest-icon"></div>';
      html += '<div class="explore-chest-twinkle"></div>';
      html += '</button>';
    }

    // Rest point
    if (room.type === "rest" && !isCleared) {
      html += '<button class="dungeon-rest-point" style="left:50%;top:52%" data-action="dungeon-rest" title="Rest and recover">';
      html += '<div class="dungeon-rest-glow"></div>';
      html += '<span class="dungeon-rest-label">Rest</span>';
      html += '</button>';
    }

    // Search for secrets
    if (room.secret && !clearedRooms['secret_' + room.id] && (isCleared || room.type === 'start')) {
      html += '<button class="dungeon-search-btn" data-action="dungeon-search-secret">Search for Secrets</button>';
    }

    // Branch paths (side routes beyond the main forward exit)
    var canProceed = isCleared || room.type === "start" || room.type === "treasure" || room.type === "rest";
    if (canProceed && room.exits.length > 1) {
      for (var b = 1; b < room.exits.length; b++) {
        var branchRoom = currentDungeon.rooms[room.exits[b]];
        if (branchRoom) {
          html += '<button class="dungeon-branch-btn" data-action="dungeon-move" data-room="' + room.exits[b] + '">' + branchRoom.name + '</button>';
        }
      }
    }

    // Navigation arrows
    var forward = null;
    if (room.exits.length > 0 && !room.isSecret) {
      forward = room.exits[0];
    }
    html += '<div class="explore-nav">';
    if (roomHistory.length > 0) {
      html += '<button class="explore-arrow explore-arrow-left" data-action="dungeon-back" title="Go back">&larr;</button>';
    }
    html += '<button class="explore-arrow explore-arrow-map" data-action="dungeon-exit" title="Leave Dungeon">Exit</button>';
    if (canProceed && forward !== null) {
      var fwdRoom = currentDungeon.rooms[forward];
      html += '<button class="explore-arrow explore-arrow-right" data-action="dungeon-move" data-room="' + forward + '" title="' + (fwdRoom ? fwdRoom.name : 'Forward') + '">&rarr;</button>';
    }
    html += '</div>';

    // Player status overlay
    var p = Player.get();
    html += '<div class="dungeon-status">';
    html += '<span>HP: ' + p.hp + '/' + p.maxHp + '</span>';
    html += '<span>MP: ' + p.mp + '/' + p.maxMp + '</span>';
    html += '</div>';

    container.innerHTML = html;
  }

  function getEnemyPosition(index, total) {
    if (total === 1) return { x: 50, y: 48 };
    if (total === 2) return index === 0 ? { x: 35, y: 48 } : { x: 65, y: 44 };
    return [{ x: 28, y: 48 }, { x: 50, y: 42 }, { x: 72, y: 50 }][index] || { x: 50, y: 48 };
  }

  function renderBreadcrumb() {
    var html = '<div class="explore-breadcrumb">';
    var mainPath = [0, 1, 2, 3, 4, 5, 6, 7];
    for (var i = 0; i < mainPath.length; i++) {
      var r = currentDungeon.rooms[mainPath[i]];
      var dotClass = "explore-dot";
      if (r.id === currentRoomIndex) dotClass += " explore-dot-current";
      if (clearedRooms[r.id]) dotClass += " explore-dot-cleared";
      html += '<span class="' + dotClass + '"></span>';
    }
    for (var j = 8; j < currentDungeon.rooms.length; j++) {
      var sr = currentDungeon.rooms[j];
      if (clearedRooms[sr.id] || sr.id === currentRoomIndex) {
        var sCls = "explore-dot";
        if (sr.id === currentRoomIndex) sCls += " explore-dot-current";
        if (clearedRooms[sr.id]) sCls += " explore-dot-cleared";
        html += '<span class="' + sCls + '"></span>';
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

    // Pick enemies: 60% one, 30% two, 10% three (capped by pool size)
    var pool = room.enemies;
    var countRoll = Math.random();
    var count = countRoll < 0.60 ? 1 : (countRoll < 0.90 ? 2 : 3);
    count = Math.min(count, pool.length);
    var picks = [];
    for (var ei = 0; ei < count; ei++) {
      picks.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    Battle.startDungeonEnemy(picks, function () {
      onRoomCleared();
    });
  }

  function fightBoss() {
    if (!currentDungeon) return;
    var room = currentDungeon.rooms[currentRoomIndex];
    if (!room || room.type !== "boss" || clearedRooms[room.id]) return;

    var bossCallback = function () {
      clearedRooms[room.id] = true;
      UI.showScreen("dungeon");
      renderRoom();
    };

    // Elric joins for the Grisk boss fight during MQ7
    if (room.boss === "goblin-chief-grisk" && Player.hasFlag("acceptedMQ7") && !Player.hasFlag("completedMQ7")) {
      if (!Player.hasFlag("elricJoinedMQ7")) {
        // Show join dialogue first, then start boss fight with companion
        Dialogue.start("elric-mq7-join", function() {
          var elricDef = Chapter1.getCompanion("elric");
          if (elricDef) {
            // Buff Elric slightly for boss fight
            elricDef.hp = 60;
            elricDef.maxHp = 60;
            elricDef.attack = 10;
            elricDef.defense = 6;
            Battle.startBossWithCompanion(room.boss, elricDef, bossCallback, function() {
              Dialogue.start("elric-companion-died", function() {
                UI.showScreen("dungeon");
                renderRoom();
              });
            });
          } else {
            Battle.startBoss(room.boss, bossCallback);
          }
        });
        return;
      }
      // Already joined flag set (re-attempt after failure)
      var elricDef = Chapter1.getCompanion("elric");
      if (elricDef) {
        elricDef.hp = 60;
        elricDef.maxHp = 60;
        elricDef.attack = 10;
        elricDef.defense = 6;
        Battle.startBossWithCompanion(room.boss, elricDef, bossCallback, function() {
          Dialogue.start("elric-companion-died", function() {
            UI.showScreen("dungeon");
            renderRoom();
          });
        });
        return;
      }
    }

    Battle.startBoss(room.boss, bossCallback);
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
        var lootOverflow = false;
        for (var li = 0; li < room.loot.length; li++) {
          if (Math.random() < room.loot[li].chance) {
            if (!Player.addItem(room.loot[li].id)) lootOverflow = true;
          }
        }
        if (lootOverflow) UI.showMessage("Inventory full! Some loot was left behind.");
      }

      // Drop special loot
      if (room.specialLoot) {
        for (var i = 0; i < room.specialLoot.length; i++) {
          var sl = room.specialLoot[i];
          if (sl.requireQuest && !Quests.isActive(sl.requireQuest)) continue;
          if (Math.random() < sl.chance) {
            if (!Player.addItem(sl.id)) UI.showMessage("Inventory full! A special item was left behind.");
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
          if (Player.addItem(room.loot[i].id)) {
            var item = Items.get(room.loot[i].id);
            found.push(item ? item.name : room.loot[i].id);
          }
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
