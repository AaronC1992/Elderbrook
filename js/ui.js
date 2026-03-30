/* ui.js - Screen management, header, character view, quest log, messages */
var UI = (function () {

  var currentScreen = "title";
  var messageTimeout = null;

  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove("active");
    }
    var target = document.getElementById("screen-" + id);
    if (target) {
      target.classList.add("active");
      currentScreen = id;
    }
    // Update header on non-title, non-create screens
    if (id !== "title" && id !== "create") {
      updateHeader();
    }
  }

  function getScreen() { return currentScreen; }

  function updateHeader() {
    var header = document.getElementById("game-header");
    if (!header) return;
    var p = Player.get();
    if (!p) { header.innerHTML = ""; return; }

    var html = '<div class="header-left">';
    html += '<span class="header-name">' + p.name + '</span>';
    html += '<span class="header-level">Lv.' + p.level + '</span>';
    html += '</div>';
    html += '<div class="header-center">';
    html += '<span class="header-hp">HP: ' + p.hp + '/' + p.maxHp + '</span>';
    html += '<span class="header-mp">MP: ' + p.mp + '/' + p.maxMp + '</span>';
    html += '<span class="header-gold">Gold: ' + p.gold + '</span>';
    html += '<span class="header-xp">XP: ' + p.xp + '/' + p.xpToNext + '</span>';
    html += '</div>';
    html += '<div class="header-right">';
    html += '<button class="btn btn-small header-btn" data-action="open-character">Character</button>';
    html += '<button class="btn btn-small header-btn" data-action="open-inventory">Inventory</button>';
    html += '<button class="btn btn-small header-btn" data-action="open-quests">Quests</button>';
    html += '<button class="btn btn-small header-btn" data-action="save-game">Save</button>';
    html += '<button class="btn btn-small header-btn" data-action="toggle-sound">' + (Audio.isEnabled() ? 'Sound On' : 'Sound Off') + '</button>';
    html += '</div>';
    header.innerHTML = html;
  }

  /* ── Character Screen ── */
  function renderCharacter() {
    var p = Player.get();
    var container = document.getElementById("character-content");
    if (!container || !p) return;

    var html = '<div class="char-portrait">';
    html += '<img src="' + Player.getPortrait() + '" alt="' + p.name + '" onerror="this.style.display=\'none\'">';
    html += '</div>';

    html += '<div class="char-info">';
    html += '<h2>' + p.name + '</h2>';
    html += '<div class="char-stat">Level: ' + p.level + '</div>';
    html += '<div class="char-stat">XP: ' + p.xp + ' / ' + p.xpToNext + '</div>';
    html += '<div class="char-stat">HP: ' + p.hp + ' / ' + p.maxHp + '</div>';
    html += '<div class="char-stat">MP: ' + p.mp + ' / ' + p.maxMp + '</div>';
    html += '<div class="char-stat">Attack: ' + p.attack + '</div>';
    html += '<div class="char-stat">Defense: ' + p.defense + '</div>';
    html += '<div class="char-stat">Dexterity: ' + p.dexterity + '</div>';
    html += '<div class="char-stat">Intelligence: ' + p.intelligence + '</div>';
    html += '<div class="char-stat">Gold: ' + p.gold + '</div>';

    // Stat allocation
    if (p.unspentPoints > 0) {
      html += '<div class="stat-allocation">';
      html += '<h3>Unspent Points: ' + p.unspentPoints + '</h3>';
      var stats = ["maxHp", "maxMp", "attack", "defense", "dexterity", "intelligence"];
      var labels = { maxHp: "+5 Max HP", maxMp: "+3 Max MP", attack: "+1 Attack", defense: "+1 Defense", dexterity: "+1 Dexterity", intelligence: "+1 Intelligence" };
      for (var i = 0; i < stats.length; i++) {
        html += '<button class="btn btn-small" data-action="allocate-stat" data-stat="' + stats[i] + '">' + labels[stats[i]] + '</button>';
      }
      html += '</div>';
    }

    html += '</div>';

    // Skills
    var skills = Skills.getAvailable(p.level);
    if (skills.length > 0) {
      html += '<div class="char-skills"><h3>Skills</h3>';
      for (var s = 0; s < skills.length; s++) {
        html += '<div class="skill-entry">' + skills[s].name + ' - ' + skills[s].description + ' (MP: ' + skills[s].mpCost + ')</div>';
      }
      html += '</div>';
    }

    // Bestiary
    var bKeys = Object.keys(p.bestiary);
    if (bKeys.length > 0) {
      html += '<div class="char-bestiary"><h3>Bestiary</h3>';
      for (var b = 0; b < bKeys.length; b++) {
        var en = Enemies.get(bKeys[b]);
        html += '<div class="bestiary-entry">' + (en ? en.name : bKeys[b]) + ': ' + p.bestiary[bKeys[b]] + ' killed</div>';
      }
      html += '</div>';
    }

    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
  }

  /* ── Quest Log ── */
  function renderQuestLog() {
    var container = document.getElementById("quests-content");
    if (!container) return;

    var active = Quests.getActive();
    var p = Player.get();
    var html = '<h2>Quest Log</h2>';

    if (active.length === 0) {
      html += '<p>No active quests.</p>';
    } else {
      for (var i = 0; i < active.length; i++) {
        var q = active[i];
        var complete = Quests.checkObjectives(q.id);
        html += '<div class="quest-entry' + (complete ? ' quest-ready' : '') + '">';
        html += '<div class="quest-name">' + q.name + ' <span class="quest-type">[' + q.type + ']</span></div>';
        html += '<div class="quest-desc">' + q.description + '</div>';
        html += '<div class="quest-objectives">';
        for (var j = 0; j < q.objectives.length; j++) {
          html += '<div class="quest-obj">' + Quests.getObjectiveStatus(q.id, j) + '</div>';
        }
        html += '</div>';
        if (complete) {
          html += '<button class="btn btn-small" data-action="turn-in-quest" data-quest="' + q.id + '">Turn In</button>';
        }
        html += '</div>';
      }
    }

    // Completed quests
    if (p.completedQuests.length > 0) {
      html += '<h3>Completed</h3>';
      for (var c = 0; c < p.completedQuests.length; c++) {
        var cq = Chapter1.getQuest(p.completedQuests[c]);
        if (cq) html += '<div class="quest-entry quest-completed">' + cq.name + '</div>';
      }
    }

    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
  }

  /* ── Quest Board ── */
  function renderQuestBoard() {
    var container = document.getElementById("questboard-content");
    if (!container) return;

    // Flag visit
    Player.setFlag("visitedQuestBoard");

    var available = Quests.getAvailable();
    var sideQuests = [];
    for (var i = 0; i < available.length; i++) {
      if (available[i].type === "side") sideQuests.push(available[i]);
    }

    var html = '<h2>Quest Board</h2>';
    if (sideQuests.length === 0) {
      html += '<p>No jobs posted at the moment. Check back later.</p>';
    } else {
      for (var q = 0; q < sideQuests.length; q++) {
        var quest = sideQuests[q];
        html += '<div class="quest-entry">';
        html += '<div class="quest-name">' + quest.name + '</div>';
        html += '<div class="quest-desc">' + quest.description + '</div>';
        html += '<div class="quest-rewards">Rewards: ' + quest.rewards.xp + ' XP';
        if (quest.rewards.gold) html += ', ' + quest.rewards.gold + ' gold';
        html += '</div>';
        html += '<button class="btn btn-small" data-action="accept-quest" data-quest="' + quest.id + '">Accept</button>';
        html += '</div>';
      }
    }

    html += '<button class="btn" data-action="go-town">Back to Town</button>';
    container.innerHTML = html;
  }

  /* ── World Map ── */
  function renderWorldMap() {
    var container = document.getElementById("worldmap-content");
    if (!container) return;

    var locations = Chapter1.getAllLocations();
    var html = '<h2>World Map</h2>';
    html += '<div class="worldmap-grid">';

    for (var key in locations) {
      var loc = locations[key];
      var unlocked = loc.alwaysOpen || (loc.requireFlag && Player.hasFlag(loc.requireFlag));
      html += '<div class="worldmap-location' + (unlocked ? '' : ' locked') + '">';
      html += '<div class="worldmap-name">' + loc.name + '</div>';
      if (unlocked) {
        html += '<div class="worldmap-desc">' + loc.description + '</div>';
        html += '<button class="btn btn-small" data-action="travel" data-location="' + loc.id + '">Travel</button>';
      } else {
        html += '<div class="worldmap-desc locked-text">???</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    html += '<button class="btn" data-action="go-town">Back to Town</button>';
    container.innerHTML = html;
  }

  /* ── Town Hub ── */
  function renderTown() {
    var container = document.getElementById("town-content");
    if (!container) return;

    var html = '<h2>Elderbrook</h2>';
    html += '<div class="town-locations">';

    html += '<div class="town-poi"><button class="btn" data-action="go-guild">Adventurers Guild</button><p>Meet Guildmaster Rowan</p></div>';
    html += '<div class="town-poi"><button class="btn" data-action="go-shop" data-shop="weapon-shop">Weapon Shop</button><p>Bram Ironhand</p></div>';
    html += '<div class="town-poi"><button class="btn" data-action="go-shop" data-shop="armor-shop">Armor Shop</button><p>Harlan Stonevein</p></div>';
    html += '<div class="town-poi"><button class="btn" data-action="go-shop" data-shop="potion-shop">Potion Shop</button><p>Mira Voss</p></div>';
    html += '<div class="town-poi"><button class="btn" data-action="go-questboard">Quest Board</button><p>Check for jobs</p></div>';
    html += '<div class="town-poi"><button class="btn" data-action="go-inn">The Hearthstone Inn</button><p>Rest and recover</p></div>';
    html += '<div class="town-poi"><button class="btn" data-action="go-worldmap">World Map</button><p>Travel beyond Elderbrook</p></div>';

    html += '</div>';
    container.innerHTML = html;
  }

  /* ── Chapter End Screen ── */
  function renderChapterEnd() {
    var container = document.getElementById("chapter-end-content");
    if (!container) return;
    var html = '<div class="chapter-end">';
    html += '<h2>Chapter 1 Complete</h2>';
    html += '<p>You have defended Elderbrook from the goblin threat and uncovered a deeper mystery.</p>';
    html += '<p>The strange sigil, the organized raids, and Elira\'s warning all point to something far more dangerous lurking beyond the frontier.</p>';
    html += '<p>Your adventure is only beginning...</p>';
    html += '<h3>To be continued in Chapter 2...</h3>';
    html += '<button class="btn" data-action="go-town">Return to Elderbrook</button>';
    html += '</div>';
    container.innerHTML = html;
  }

  /* ── Messages ── */
  function showMessage(text) {
    var el = document.getElementById("game-message");
    if (!el) return;
    el.textContent = text;
    el.classList.add("visible");
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(function () {
      el.classList.remove("visible");
    }, 3000);
  }

  return {
    showScreen: showScreen,
    getScreen: getScreen,
    updateHeader: updateHeader,
    renderCharacter: renderCharacter,
    renderQuestLog: renderQuestLog,
    renderQuestBoard: renderQuestBoard,
    renderWorldMap: renderWorldMap,
    renderTown: renderTown,
    renderChapterEnd: renderChapterEnd,
    showMessage: showMessage
  };
})();
