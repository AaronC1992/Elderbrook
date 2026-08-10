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
    /* ──────────────────────────────────────────────
       FOREST ROAD  (9 nodes)
       Main path:  0 → 1 → 2 → 3 → 4
       Branch:     2 ↓ 5 → 6 → 7 → 8  (hidden grove path, harder)
       ────────────────────────────────────────────── */
    "forest-road": {
      nodes: [
        { // 0
          id: "forest-edge", name: "Forest Edge",
          background: "assets/backgrounds/forest-road.png",
          flavor: "The road leaves the safety of town and enters dense woodland.",
          enemies: [
            { id: "dire-rat", x: 62, y: 48 },
            { id: "goblin-scout", x: 28, y: 55 }
          ],
          exits: { right: 1 },
          ambushChance: 0.05
        },
        { // 1
          id: "shady-path", name: "Shady Path",
          background: "assets/backgrounds/explore-shady-path.png",
          flavor: "The trees grow thicker here, casting deep shadows across the trail.",
          enemies: [
            { id: "goblin-scout", x: 22, y: 50 },
            { id: "wolf", x: 68, y: 42 }
          ],
          exits: { left: 0, right: 2 },
          ambushChance: 0.10
        },
        { // 2 — junction: right continues main path, down branches to hidden grove
          id: "dark-thicket", name: "Dark Thicket",
          background: "assets/backgrounds/explore-dark-thicket.png",
          flavor: "Gnarled branches intertwine overhead. A faint trail leads downhill into shadow.",
          enemies: [
            { id: "goblin-sneak", x: 35, y: 48 },
            { id: "wolf", x: 72, y: 55 }
          ],
          exits: { left: 1, right: 3, down: 5 },
          ambushChance: 0.15
        },
        { // 3
          id: "bandit-clearing", name: "Bandit Clearing",
          background: "assets/backgrounds/explore-bandit-clearing.png",
          flavor: "A small clearing with the remains of a camp. Bandits may still be close.",
          enemies: [
            { id: "bandit", x: 45, y: 45 },
            { id: "goblin-sneak", x: 75, y: 52 }
          ],
          exits: { left: 2, right: 4 },
          ambushChance: 0.15
        },
        { // 4
          id: "mossy-ravine", name: "Mossy Ravine",
          background: "assets/backgrounds/explore-mossy-ravine.png",
          flavor: "A deep ravine choked with moss. The air is damp and heavy.",
          enemies: [
            { id: "bandit", x: 30, y: 50 },
            { id: "wolf", x: 65, y: 45 },
            { id: "goblin-sneak", x: 50, y: 58 }
          ],
          exits: { left: 3 },
          ambushChance: 0.18
        },
        { // 5 — branch start (from node 2 down)
          id: "hidden-grove", name: "Hidden Grove",
          background: "assets/backgrounds/explore-hidden-grove.png",
          flavor: "Stone steps descend into a secret grove. The air hums with old magic.",
          enemies: [
            { id: "goblin-sneak", x: 55, y: 48 },
            { id: "wolf", x: 25, y: 52 }
          ],
          exits: { up: 2, right: 6 },
          ambushChance: 0.12
        },
        { // 6
          id: "tangled-roots", name: "Tangled Roots",
          background: "assets/backgrounds/explore-tangled-roots.png",
          flavor: "Massive roots twist across the path. Bioluminescent fungi cast eerie light.",
          enemies: [
            { id: "bandit", x: 40, y: 46 },
            { id: "goblin-sneak", x: 70, y: 52 }
          ],
          exits: { left: 5, right: 7 },
          ambushChance: 0.18
        },
        { // 7
          id: "ancient-hollow", name: "Ancient Hollow",
          background: "assets/backgrounds/explore-ancient-hollow.png",
          flavor: "The hollow of an enormous ancient tree. Faint runes glow on the walls.",
          enemies: [
            { id: "wolf-pack", x: 50, y: 45 },
            { id: "bandit", x: 25, y: 55 }
          ],
          exits: { left: 6, right: 8 },
          ambushChance: 0.15
        },
        { // 8 — branch end (deepest, hardest)
          id: "deepwood-den", name: "Deepwood Den",
          background: "assets/backgrounds/explore-deepwood-den.png",
          flavor: "The deepest part of the forest. No sunlight reaches here. Something watches.",
          enemies: [
            { id: "wolf-pack", x: 35, y: 48 },
            { id: "bandit", x: 65, y: 44 },
            { id: "goblin-raider", x: 50, y: 58 }
          ],
          exits: { left: 7 },
          ambushChance: 0.22
        }
      ]
    },

    /* ──────────────────────────────────────────────
       GOBLIN TRAIL  (7 nodes)
       Main path:  0 → 1 → 2 → 3
       Branch:     2 ↓ 4 → 5 → 6  (goblin camp, harder)
       ────────────────────────────────────────────── */
    "goblin-trail": {
      nodes: [
        { // 0
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
        { // 1
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
        { // 2 — junction: right continues, down branches to goblin camp
          id: "wolf-hollow", name: "Wolf Hollow",
          background: "assets/backgrounds/explore-wolf-hollow.png",
          flavor: "Bones litter the ground near rocky dens. A crude path leads downhill.",
          enemies: [
            { id: "wolf-pack", x: 50, y: 48 },
            { id: "goblin-raider", x: 20, y: 55 }
          ],
          exits: { left: 1, right: 3, down: 4 },
          ambushChance: 0.10
        },
        { // 3
          id: "trails-end", name: "Trail's End",
          background: "assets/backgrounds/explore-trails-end.png",
          flavor: "Goblin fortifications mark the end of the trail. The cave looms ahead.",
          enemies: [
            { id: "goblin-raider", x: 40, y: 44 },
            { id: "bandit", x: 70, y: 50 }
          ],
          exits: { left: 2 },
          ambushChance: 0.15
        },
        { // 4 — branch start (from node 2 down)
          id: "goblin-camp", name: "Goblin Camp",
          background: "assets/backgrounds/explore-goblin-camp.png",
          flavor: "A hidden goblin encampment. Crude tents surround smoldering fire pits.",
          enemies: [
            { id: "goblin-raider", x: 30, y: 48 },
            { id: "goblin-archer", x: 65, y: 44 },
            { id: "goblin-guard", x: 50, y: 56 }
          ],
          exits: { up: 2, right: 5 },
          ambushChance: 0.20
        },
        { // 5
          id: "totemic-shrine", name: "Totemic Shrine",
          background: "assets/backgrounds/explore-totemic-shrine.png",
          flavor: "A towering goblin totem dominates this dark clearing. Offerings surround it.",
          enemies: [
            { id: "goblin-guard", x: 35, y: 46 },
            { id: "goblin-shaman", x: 68, y: 50 }
          ],
          exits: { left: 4, right: 6 },
          ambushChance: 0.18
        },
        { // 6 — branch end (deepest, hardest)
          id: "warchief-ground", name: "Warchief's Ground",
          background: "assets/backgrounds/explore-warchief-ground.png",
          flavor: "A rocky arena. A crude throne of old weapons looms on a stone platform.",
          enemies: [
            { id: "goblin-guard", x: 28, y: 50 },
            { id: "goblin-shaman", x: 55, y: 44 },
            { id: "goblin-brute", x: 75, y: 52 }
          ],
          exits: { left: 5 },
          ambushChance: 0.22
        }
      ]
    },

    /* ──────────────────────────────────────────────
       WATCH POST  (6 nodes)
       Main path:  0 → 1 → 2
       Branch:     1 ↓ 3 → 4 → 5  (underground, harder)
       ────────────────────────────────────────────── */
    "watch-post": {
      nodes: [
        { // 0
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
        { // 1 — junction: right continues, down to collapsed barracks
          id: "ruined-courtyard", name: "Ruined Courtyard",
          background: "assets/backgrounds/watch-post.png",
          flavor: "The courtyard of the old watch post. A hole in the floor leads below.",
          enemies: [
            { id: "goblin-raider", x: 35, y: 45 },
            { id: "goblin-guard", x: 68, y: 50 }
          ],
          exits: { left: 0, right: 2, down: 3 },
          ambushChance: 0.15
        },
        { // 2
          id: "watchtower", name: "Watchtower",
          background: "assets/backgrounds/explore-watchtower.png",
          flavor: "The crumbling stone tower. Something valuable might still be here.",
          enemies: [
            { id: "goblin-guard", x: 45, y: 42 },
            { id: "bandit", x: 72, y: 55 }
          ],
          exits: { left: 1 },
          ambushChance: 0.18
        },
        { // 3 — branch start (from node 1 down)
          id: "collapsed-barracks", name: "Collapsed Barracks",
          background: "assets/backgrounds/explore-collapsed-barracks.png",
          flavor: "Half-collapsed guard barracks. Stairs lead further underground.",
          enemies: [
            { id: "goblin-guard", x: 40, y: 48 },
            { id: "goblin-raider", x: 70, y: 52 }
          ],
          exits: { up: 1, right: 4 },
          ambushChance: 0.18
        },
        { // 4
          id: "old-armory", name: "Old Armory",
          background: "assets/backgrounds/explore-old-armory.png",
          flavor: "A forgotten underground armory. Dusty weapon racks line the walls.",
          enemies: [
            { id: "goblin-guard", x: 30, y: 46 },
            { id: "goblin-brute", x: 65, y: 50 }
          ],
          exits: { left: 3, right: 5 },
          ambushChance: 0.20
        },
        { // 5 — branch end (deepest, hardest)
          id: "underground-passage", name: "Underground Passage",
          background: "assets/backgrounds/explore-underground-passage.png",
          flavor: "A narrow passage deep beneath the ruins. Scratch marks cover the walls.",
          enemies: [
            { id: "goblin-brute", x: 40, y: 48 },
            { id: "goblin-shaman", x: 65, y: 44 },
            { id: "goblin-guard", x: 25, y: 55 }
          ],
          exits: { left: 4 },
          ambushChance: 0.25
        }
      ]
    },

    /* ──────────────────────────────────────────────
       RIVERBANK  (5 nodes)
       Main path:  0 → 1 → 2
       Branch:     1 ↓ 3 → 4  (misty deeper section, harder)
       ────────────────────────────────────────────── */
    "riverbank": {
      nodes: [
        { // 0
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
        { // 1 — junction: right continues, down branches to misty bend
          id: "reed-banks", name: "Reed Banks",
          background: "assets/backgrounds/explore-reed-banks.png",
          flavor: "Tall reeds sway in the breeze. A misty trail leads downstream.",
          enemies: [
            { id: "goblin-scout", x: 30, y: 50 },
            { id: "wolf", x: 70, y: 48 }
          ],
          exits: { left: 0, right: 2, down: 3 },
          ambushChance: 0.10,
          canGather: true
        },
        { // 2
          id: "rocky-pools", name: "Rocky Pools",
          background: "assets/backgrounds/explore-rocky-pools.png",
          flavor: "Crystal clear pools between mossy rocks. A peaceful spot — usually.",
          enemies: [
            { id: "goblin-scout", x: 50, y: 55 },
            { id: "wolf", x: 25, y: 48 }
          ],
          exits: { left: 1 },
          ambushChance: 0.08,
          canGather: true
        },
        { // 3 — branch start (from node 1 down)
          id: "misty-bend", name: "Misty Bend",
          background: "assets/backgrounds/explore-misty-bend.png",
          flavor: "Thick mist rolls off the dark water. Strange ripples break the surface.",
          enemies: [
            { id: "wolf-pack", x: 55, y: 46 },
            { id: "goblin-sneak", x: 25, y: 52 }
          ],
          exits: { up: 1, right: 4 },
          ambushChance: 0.15,
          canGather: true
        },
        { // 4 — branch end (deepest, hardest)
          id: "sunken-ruins", name: "Sunken Ruins",
          background: "assets/backgrounds/explore-sunken-ruins.png",
          flavor: "Ancient stone ruins rise from the water. Old carvings hint at forgotten power.",
          enemies: [
            { id: "wolf-pack", x: 35, y: 50 },
            { id: "bandit", x: 60, y: 44 },
            { id: "goblin-raider", x: 50, y: 58 }
          ],
          exits: { left: 3 },
          ambushChance: 0.20,
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

    // Companion story triggers on area entry
    if (areaId === "goblin-trail" && Player.hasFlag("acceptedMQ4") && !Player.hasFlag("completedMQ4")) {
      if (!Player.hasFlag("elricJoinedMQ4")) {
        Dialogue.start("elric-mq4-join");
      } else {
        Dialogue.start("elric-mq4-return");
      }
    }

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
    html += '<div class="explore-nav-wrap">';
    if (node.exits.up !== undefined) {
      html += '<div class="explore-nav-row">';
      html += '<button class="explore-arrow explore-arrow-up" data-action="explore-move" data-dir="up" title="Go up">&uarr;</button>';
      html += '</div>';
    }
    html += '<div class="explore-nav-row">';
    if (node.exits.left !== undefined) {
      html += '<button class="explore-arrow explore-arrow-left" data-action="explore-move" data-dir="left" title="Go back">&larr;</button>';
    }
    html += '<button class="explore-arrow explore-arrow-map" data-action="explore-return-map" title="Return to World Map">Map</button>';
    if (node.exits.right !== undefined) {
      html += '<button class="explore-arrow explore-arrow-right" data-action="explore-move" data-dir="right" title="Go forward">&rarr;</button>';
    }
    html += '</div>';
    if (node.exits.down !== undefined) {
      html += '<div class="explore-nav-row">';
      html += '<button class="explore-arrow explore-arrow-down" data-action="explore-move" data-dir="down" title="Go deeper">&darr;</button>';
      html += '</div>';
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
    var victoryCallback = function () {
      if (!defeatedEnemies[nodeKey]) defeatedEnemies[nodeKey] = [];
      defeatedEnemies[nodeKey].push(enemyIdx);
      checkAreaCompletion();
      renderNode();
      UI.showScreen("explore");
    };

    // Companion: Elric joins on goblin-trail during MQ4
    if (currentArea === "goblin-trail" && Player.hasFlag("elricJoinedMQ4") && !Player.hasFlag("completedMQ4")) {
      var elricDef = Chapter1.getCompanion("elric");
      if (elricDef) {
        Battle.startExplorationWithCompanion(currentArea, enemyId, elricDef, victoryCallback, function() {
          Dialogue.start("elric-companion-died", function() {
            UI.showScreen("explore");
            renderNode();
          });
        });
        return;
      }
    }

    Battle.startExploration(currentArea, enemyId, victoryCallback);
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

    var ambushCallback = function () {
      if (!defeatedEnemies[nodeKey]) defeatedEnemies[nodeKey] = [];
      defeatedEnemies[nodeKey].push(enemyIdx);
      renderNode();
      UI.showScreen("explore");
    };

    // Companion: Elric joins on goblin-trail during MQ4
    if (currentArea === "goblin-trail" && Player.hasFlag("elricJoinedMQ4") && !Player.hasFlag("completedMQ4")) {
      var elricDef = Chapter1.getCompanion("elric");
      if (elricDef) {
        Battle.startExplorationWithCompanion(currentArea, enemyId, elricDef, ambushCallback, function() {
          Dialogue.start("elric-companion-died", function() {
            UI.showScreen("explore");
            renderNode();
          });
        }, true);
        return;
      }
    }

    Battle.startExploration(currentArea, enemyId, ambushCallback, true); // true = ambush flag
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
