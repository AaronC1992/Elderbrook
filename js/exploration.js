/* exploration.js — DragonFable-style node exploration with enemies, chests, and navigation */
var Exploration = (function () {

  // ── Chest loot tables per area ──
  var CHEST_LOOT = {
    "forest-road": [
      { id: "lesser-health-potion", weight: 30 },
      { id: "health-potion", weight: 15 },
      { id: "wolf-pelt", weight: 20 },
      { id: "goblin-fang", weight: 20 },
      { id: "torn-cloth", weight: 15 }
    ],
    "goblin-trail": [
      { id: "health-potion", weight: 25 },
      { id: "mana-potion", weight: 15 },
      { id: "goblin-scrap", weight: 20 },
      { id: "iron-ore", weight: 15 },
      { id: "moonpetal", weight: 10 },
      { id: "beast-sinew", weight: 15 }
    ],
    "watch-post": [
      { id: "health-potion", weight: 20 },
      { id: "iron-ore", weight: 20 },
      { id: "goblin-scrap", weight: 20 },
      { id: "mana-potion", weight: 15 },
      { id: "shadow-essence", weight: 10 },
      { id: "enchanted-shard", weight: 5 },
      { id: "guard-badge", weight: 10 }
    ],
    "riverbank": [
      { id: "cave-herb", weight: 35 },
      { id: "lesser-health-potion", weight: 25 },
      { id: "moonpetal", weight: 15 },
      { id: "torn-cloth", weight: 15 },
      { id: "mana-potion", weight: 10 }
    ]
  };

  // ── Gold ranges in chests ──
  var CHEST_GOLD = {
    "forest-road": [3, 10],
    "goblin-trail": [5, 15],
    "watch-post": [8, 18],
    "riverbank": [2, 8]
  };

  // ── Chest hiding spots (CSS positioning + flavor text) ──
  var CHEST_SPOTS = [
    { x: 15, y: 55, text: "Something glints behind a mossy rock..." },
    { x: 75, y: 50, text: "You notice a shimmer in the bushes..." },
    { x: 55, y: 65, text: "A faint sparkle catches your eye near a hollow log..." },
    { x: 25, y: 45, text: "There's something hidden beneath the roots of an old tree..." },
    { x: 80, y: 60, text: "You spot a glimmer tucked behind some tall grass..." }
  ];

  // ── Exploration maps — each area has a chain of connected nodes ──
  var MAPS = {
    "forest-road": {
      nodes: [
        {
          id: "forest-edge", name: "Forest Edge",
          background: "assets/backgrounds/forest-road.png",
          flavor: "The road leaves the safety of town and enters dense woodland.",
          enemies: [
            { id: "wolf", x: 62, y: 48 },
            { id: "goblin-scout", x: 28, y: 55 }
          ],
          exits: { right: 1 },
          ambushChance: 0.05
        },
        {
          id: "shady-path", name: "Shady Path",
          background: "assets/backgrounds/explore-shady-path.png",
          flavor: "The trees grow thicker here, casting deep shadows across the trail.",
          enemies: [
            { id: "goblin-scout", x: 22, y: 50 },
            { id: "goblin-sneak", x: 68, y: 42 }
          ],
          exits: { left: 0, right: 2 },
          ambushChance: 0.12
        },
        {
          id: "dark-thicket", name: "Dark Thicket",
          background: "assets/backgrounds/explore-dark-thicket.png",
          flavor: "Gnarled branches intertwine overhead. You can barely see the path.",
          enemies: [
            { id: "goblin-sneak", x: 35, y: 48 },
            { id: "wolf", x: 72, y: 55 }
          ],
          exits: { left: 1, right: 3 },
          ambushChance: 0.18
        },
        {
          id: "bandit-clearing", name: "Bandit Clearing",
          background: "assets/backgrounds/explore-bandit-clearing.png",
          flavor: "A small clearing with the remains of a camp. Bandits may still be close.",
          enemies: [
            { id: "bandit", x: 45, y: 45 },
            { id: "goblin-sneak", x: 75, y: 52 }
          ],
          exits: { left: 2 },
          ambushChance: 0.15
        }
      ]
    },
    "goblin-trail": {
      nodes: [
        {
          id: "trail-entrance", name: "Trail Entrance",
          background: "assets/backgrounds/GoblinTrail.png",
          flavor: "Crude goblin totems mark the beginning of a dangerous trail.",
          enemies: [
            { id: "goblin-raider", x: 60, y: 50 },
            { id: "goblin-archer", x: 25, y: 48 }
          ],
          exits: { right: 1 },
          ambushChance: 0.08
        },
        {
          id: "rocky-pass", name: "Rocky Pass",
          background: "assets/backgrounds/explore-rocky-pass.png",
          flavor: "Boulders line the narrow path. Perfect territory for an ambush.",
          enemies: [
            { id: "goblin-archer", x: 30, y: 45 },
            { id: "goblin-raider", x: 70, y: 50 }
          ],
          exits: { left: 0, right: 2 },
          ambushChance: 0.20
        },
        {
          id: "wolf-hollow", name: "Wolf Hollow",
          background: "assets/backgrounds/explore-wolf-hollow.png",
          flavor: "Bones litter the ground near rocky dens. The wolves here are no strays.",
          enemies: [
            { id: "wolf-pack", x: 50, y: 48 },
            { id: "goblin-raider", x: 20, y: 55 }
          ],
          exits: { left: 1, right: 3 },
          ambushChance: 0.10
        },
        {
          id: "trails-end", name: "Trail's End",
          background: "assets/backgrounds/explore-trails-end.png",
          flavor: "Goblin fortifications mark the end of the trail. The cave looms ahead.",
          enemies: [
            { id: "goblin-raider", x: 40, y: 44 },
            { id: "bandit", x: 70, y: 50 }
          ],
          exits: { left: 2 },
          ambushChance: 0.15
        }
      ]
    },
    "watch-post": {
      nodes: [
        {
          id: "overgrown-approach", name: "Overgrown Approach",
          background: "assets/backgrounds/explore-overgrown-path.png",
          flavor: "An old patrol path, now swallowed by ivy and wild growth.",
          enemies: [
            { id: "goblin-sneak", x: 55, y: 52 },
            { id: "bandit", x: 25, y: 48 }
          ],
          exits: { right: 1 },
          ambushChance: 0.12
        },
        {
          id: "ruined-courtyard", name: "Ruined Courtyard",
          background: "assets/backgrounds/watch-post.png",
          flavor: "The courtyard of the old watch post. Goblins have claimed it as a camp.",
          enemies: [
            { id: "goblin-raider", x: 35, y: 45 },
            { id: "goblin-guard", x: 68, y: 50 }
          ],
          exits: { left: 0, right: 2 },
          ambushChance: 0.15
        },
        {
          id: "watchtower", name: "Watchtower",
          background: "assets/backgrounds/explore-watchtower.png",
          flavor: "The crumbling stone tower. Something valuable might still be here.",
          enemies: [
            { id: "goblin-guard", x: 45, y: 42 },
            { id: "bandit", x: 72, y: 55 }
          ],
          exits: { left: 1 },
          ambushChance: 0.18
        }
      ]
    },
    "riverbank": {
      nodes: [
        {
          id: "shallow-crossing", name: "Shallow Crossing",
          background: "assets/backgrounds/riverbank.png",
          flavor: "Calm waters lap at the banks. Herbs grow among the river stones.",
          enemies: [
            { id: "wolf", x: 65, y: 52 }
          ],
          exits: { right: 1 },
          ambushChance: 0.05,
          canGather: true
        },
        {
          id: "reed-banks", name: "Reed Banks",
          background: "assets/backgrounds/explore-reed-banks.png",
          flavor: "Tall reeds sway in the breeze. You can hear creatures moving inside.",
          enemies: [
            { id: "goblin-scout", x: 30, y: 50 },
            { id: "wolf", x: 70, y: 48 }
          ],
          exits: { left: 0, right: 2 },
          ambushChance: 0.10,
          canGather: true
        },
        {
          id: "rocky-pools", name: "Rocky Pools",
          background: "assets/backgrounds/explore-rocky-pools.png",
          flavor: "Crystal clear pools between mossy rocks. A peaceful spot — usually.",
          enemies: [
            { id: "goblin-scout", x: 50, y: 55 }
          ],
          exits: { left: 1 },
          ambushChance: 0.05,
          canGather: true
        }
      ]
    }
  };

  // ── State ──
  var currentArea = null;
  var currentNode = 0;
  var activeChest = null;   // { spot, lootItem, gold } or null
  var defeatedEnemies = {}; // tracks defeated enemy indices per node within this exploration
  var areaCompleted = false;

  // ── Public API ──

  function enter(areaId) {
    var map = MAPS[areaId];
    if (!map) return false;
    currentArea = areaId;
    currentNode = 0;
    activeChest = null;
    defeatedEnemies = {};
    areaCompleted = false;
    renderNode();
    return true;
  }

  function renderNode() {
    var map = MAPS[currentArea];
    if (!map) return;
    var node = map.nodes[currentNode];
    if (!node) return;

    var screen = document.getElementById("screen-explore");
    var container = document.getElementById("explore-content");
    if (!screen || !container) return;

    // Set background
    screen.style.backgroundImage = "url('" + node.background + "')";

    // Build node key for defeated tracking
    var nodeKey = currentArea + "-" + currentNode;
    var defeated = defeatedEnemies[nodeKey] || [];
    var nodeCleared = defeated.length >= node.enemies.length;

    var html = '';

    // ── Header bar with breadcrumb ──
    html += '<div class="explore-header">';
    html += '<span class="explore-area-name">' + node.name + '</span>';
    html += '<div class="explore-breadcrumb">';
    for (var bi = 0; bi < map.nodes.length; bi++) {
      var bKey = currentArea + "-" + bi;
      var bDefeated = defeatedEnemies[bKey] || [];
      var bCleared = bDefeated.length >= map.nodes[bi].enemies.length;
      var dotClass = "explore-dot";
      if (bi === currentNode) dotClass += " explore-dot-current";
      if (bCleared) dotClass += " explore-dot-cleared";
      html += '<span class="' + dotClass + '"></span>';
    }
    html += '</div>';
    html += '<span class="explore-flavor">' + node.flavor + '</span>';
    html += '</div>';

    // ── Node cleared badge ──
    if (nodeCleared) {
      html += '<div class="explore-cleared-badge">Area Cleared</div>';
    }

    // ── Enemy portraits (clickable) ──
    for (var i = 0; i < node.enemies.length; i++) {
      if (defeated.indexOf(i) !== -1) continue; // already beaten
      var en = node.enemies[i];
      var template = Enemies.get(en.id);
      if (!template) continue;
      // Danger indicator based on enemy tier
      var dangerClass = "";
      if (template.hp >= 28) dangerClass = " explore-enemy-hard";
      else if (template.hp >= 20) dangerClass = " explore-enemy-mid";
      html += '<button class="explore-enemy' + dangerClass + '" style="left:' + en.x + '%;top:' + en.y + '%" ';
      html += 'data-action="explore-fight" data-enemy="' + en.id + '" data-idx="' + i + '" title="Fight (' + template.name + ') - Costs 2 Energy">';
      html += '<img class="explore-enemy-portrait" src="' + template.portrait + '" alt="' + template.name + '" onerror="this.style.display=\'none\'" />';
      html += '<span class="explore-enemy-name">' + template.name + ' <span class="energy-cost">-2 EP</span></span>';
      html += '</button>';
    }

    // ── Chest (random spawn) ──
    if (!activeChest) {
      rollChest();
    }
    if (activeChest && activeChest.node === currentNode) {
      var spot = activeChest.spot;
      html += '<button class="explore-chest" style="left:' + spot.x + '%;top:' + spot.y + '%" ';
      html += 'data-action="explore-open-chest">';
      html += '<div class="explore-chest-icon"></div>';
      html += '<div class="explore-chest-twinkle"></div>';
      html += '</button>';
    }

    // ── Navigation arrows ──
    html += '<div class="explore-nav">';
    if (node.exits.left !== undefined) {
      html += '<button class="explore-arrow explore-arrow-left" data-action="explore-move" data-dir="left" title="Go back">&larr;</button>';
    }
    html += '<button class="explore-arrow explore-arrow-map" data-action="explore-return-map" title="Return to World Map">Map</button>';
    if (node.exits.right !== undefined) {
      html += '<button class="explore-arrow explore-arrow-right" data-action="explore-move" data-dir="right" title="Go forward">&rarr;</button>';
    }
    html += '</div>';

    // ── Gather button for riverbank nodes ──
    if (node.canGather) {
      html += '<button class="explore-gather-btn" data-action="explore-gather" title="25% chance of enemy encounter! Costs 1 Energy">Gather Herbs <span class="energy-cost">-1 EP</span></button>';
    }

    container.innerHTML = html;
    UI.showScreen("explore");

    // ── Check for ambush ──
    var ambushChance = node.ambushChance || 0;
    if (defeated.length === 0 && node.enemies.length > 0 && Math.random() < ambushChance) {
      triggerAmbush();
    }
  }

  function rollChest() {
    // 8% chance per node entry, only one chest per exploration run
    if (activeChest) return;
    if (Math.random() > 0.08) return;

    var lootTable = CHEST_LOOT[currentArea];
    var goldRange = CHEST_GOLD[currentArea];
    if (!lootTable) return;

    // Pick weighted random loot item
    var totalWeight = 0;
    for (var i = 0; i < lootTable.length; i++) totalWeight += lootTable[i].weight;
    var roll = Math.random() * totalWeight;
    var cumulative = 0;
    var pickedItem = lootTable[0].id;
    for (var j = 0; j < lootTable.length; j++) {
      cumulative += lootTable[j].weight;
      if (roll < cumulative) { pickedItem = lootTable[j].id; break; }
    }

    // Gold
    var gold = goldRange ? goldRange[0] + Math.floor(Math.random() * (goldRange[1] - goldRange[0] + 1)) : 0;

    // Random spot
    var spot = CHEST_SPOTS[Math.floor(Math.random() * CHEST_SPOTS.length)];

    activeChest = { node: currentNode, spot: spot, lootItem: pickedItem, gold: gold };
  }

  function openChest() {
    if (!activeChest || activeChest.node !== currentNode) return;

    var item = Items.get(activeChest.lootItem);
    var goldAmt = activeChest.gold;
    var messages = [];

    if (item) {
      if (Player.addItem(activeChest.lootItem)) {
        messages.push("Found " + item.name + "!");
      } else {
        messages.push("Found " + item.name + " but your inventory is full!");
      }
    }
    if (goldAmt > 0) {
      Player.get().gold += goldAmt;
      UI.updateHeader();
      messages.push("Found " + goldAmt + " gold!");
    }

    var spot = activeChest.spot;
    UI.showMessage(spot.text + " " + messages.join(" "));
    activeChest = null;
    renderNode(); // re-render to remove chest
  }

  function moveToNode(direction) {
    var map = MAPS[currentArea];
    if (!map) return;
    var node = map.nodes[currentNode];
    if (!node) return;

    var targetIdx = node.exits[direction];
    if (targetIdx === undefined) return;

    currentNode = targetIdx;
    checkAreaCompletion();
    renderNode();
  }

  function fightEnemy(enemyId, enemyIdx) {
    if (!Player.spendEnergy(2)) {
      UI.showMessage("You're too tired to fight. Sleep to restore energy.");
      return;
    }

    var nodeKey = currentArea + "-" + currentNode;

    Battle.startExploration(currentArea, enemyId, function () {
      // Mark this enemy as defeated
      if (!defeatedEnemies[nodeKey]) defeatedEnemies[nodeKey] = [];
      defeatedEnemies[nodeKey].push(enemyIdx);
      checkAreaCompletion();
      renderNode();
      UI.showScreen("explore");
    });
  }

  function triggerAmbush() {
    // Pick a random enemy from this node and auto-start battle
    var map = MAPS[currentArea];
    var node = map.nodes[currentNode];
    var nodeKey = currentArea + "-" + currentNode;
    var defeated = defeatedEnemies[nodeKey] || [];

    // Find first alive enemy
    var enemyId = null;
    var enemyIdx = -1;
    for (var i = 0; i < node.enemies.length; i++) {
      if (defeated.indexOf(i) === -1) {
        enemyId = node.enemies[i].id;
        enemyIdx = i;
        break;
      }
    }
    if (!enemyId) return;

    if (!Player.spendEnergy(2)) return;

    Battle.startExploration(currentArea, enemyId, function () {
      if (!defeatedEnemies[nodeKey]) defeatedEnemies[nodeKey] = [];
      defeatedEnemies[nodeKey].push(enemyIdx);
      renderNode();
      UI.showScreen("explore");
    }, true); // true = ambush flag
  }

  function gatherAtNode() {
    // Delegate to World.gather for the riverbank area
    World.gather(currentArea);
  }

  function checkAreaCompletion() {
    if (areaCompleted) return;
    var map = MAPS[currentArea];
    if (!map) return;
    for (var n = 0; n < map.nodes.length; n++) {
      var key = currentArea + "-" + n;
      var def = defeatedEnemies[key] || [];
      if (def.length < map.nodes[n].enemies.length) return;
    }
    // All nodes cleared
    areaCompleted = true;
  }

  function returnToMap() {
    currentArea = null;
    currentNode = 0;
    activeChest = null;
    defeatedEnemies = {};
    areaCompleted = false;
    UI.renderWorldMap();
    UI.showScreen("worldmap");
  }

  function getCurrentArea() { return currentArea; }

  return {
    enter: enter,
    renderNode: renderNode,
    moveToNode: moveToNode,
    fightEnemy: fightEnemy,
    openChest: openChest,
    gatherAtNode: gatherAtNode,
    returnToMap: returnToMap,
    getCurrentArea: getCurrentArea,
    getMaps: function () { return MAPS; }
  };
})();
