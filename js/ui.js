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
    html += '<button class="btn btn-small header-btn" data-action="open-relationships">Social</button>';
    html += '<button class="btn btn-small header-btn" data-action="open-bestiary">Bestiary</button>';
    html += '<button class="btn btn-small header-btn" data-action="open-achievements">Achievements</button>';
    html += '<button class="btn btn-small header-btn" data-action="open-settings">Settings</button>';
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
    if (p.buildClass) {
      html += '<div class="char-stat char-build">Build: ' + p.buildClass.charAt(0).toUpperCase() + p.buildClass.slice(1) + '</div>';
    }
    html += '<div class="char-stat">Difficulty: ' + (p.difficulty || 'normal') + '</div>';

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
        var prof = Player.getSkillProficiencyStars(skills[s].id);
        var stars = '';
        for (var st = 0; st < 5; st++) {
          stars += st < prof ? '<span class="star-filled">*</span>' : '<span class="star-empty">*</span>';
        }
        html += '<div class="skill-entry">' + skills[s].name + ' - ' + skills[s].description + ' (MP: ' + skills[s].mpCost + ') <span class="skill-stars">' + stars + '</span></div>';
      }
      html += '</div>';
    }

    // Set bonuses
    var setBonuses = Player.getEquippedSetBonuses();
    if (setBonuses.length > 0) {
      html += '<div class="char-set-bonuses"><h3>Set Bonuses</h3>';
      for (var sb = 0; sb < setBonuses.length; sb++) {
        html += '<div class="set-bonus-entry">' + setBonuses[sb].setId + ' (' + setBonuses[sb].count + ' pieces)</div>';
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
        if (loc.recommendedLevel) html += '<div class="worldmap-level">' + loc.recommendedLevel + '</div>';
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

    var html = '<div class="town-title">Elderbrook</div>';

    // Place POIs near buildings in the background image
    html += '<button class="town-poi" style="top:12%;left:3%" data-action="go-guild"><span class="poi-name">Adventurers Guild</span><span class="poi-sub">Guildmaster Rowan</span></button>';
    html += '<button class="town-poi" style="top:35%;left:18%" data-action="go-shop" data-shop="weapon-shop"><span class="poi-name">Weapon Shop</span><span class="poi-sub">Bram Ironhand</span></button>';
    html += '<button class="town-poi" style="top:18%;left:38%" data-action="go-shop" data-shop="armor-shop"><span class="poi-name">Armor Shop</span><span class="poi-sub">Harlan Stonevein</span></button>';
    html += '<button class="town-poi" style="top:30%;right:5%" data-action="go-shop" data-shop="potion-shop"><span class="poi-name">Potion Shop</span><span class="poi-sub">Mira Voss</span></button>';
    html += '<button class="town-poi" style="top:55%;left:5%" data-action="go-questboard"><span class="poi-name">Quest Board</span><span class="poi-sub">Check for jobs</span></button>';
    html += '<button class="town-poi" style="top:8%;right:28%" data-action="go-elric"><span class="poi-name">Guard Post</span><span class="poi-sub">Captain Elric</span></button>';
    html += '<button class="town-poi" style="top:12%;right:3%" data-action="go-inn"><span class="poi-name">The Hearthstone Inn</span><span class="poi-sub">Rest &amp; recover</span></button>';
    if (Player.hasFlag('metElira')) {
      html += '<button class="town-poi" style="top:30%;right:22%" data-action="go-elira"><span class="poi-name">Inn (Upstairs)</span><span class="poi-sub">Visit Elira</span></button>';
    }
    html += '<button class="town-poi" style="top:52%;left:38%" data-action="go-social"><span class="poi-name">Town Square</span><span class="poi-sub">Socialize</span></button>';
    if (Player.hasFlag('bramForgeUnlocked')) {
      html += '<button class="town-poi" style="top:52%;left:20%" data-action="open-crafting"><span class="poi-name">Bram\'s Forge</span><span class="poi-sub">Craft gear</span></button>';
    }
    html += '<button class="town-poi town-poi-exit" style="bottom:5%;left:50%;transform:translateX(-50%)" data-action="go-worldmap"><span class="poi-name">World Map</span><span class="poi-sub">Leave town</span></button>';

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

  /* ── Relationships Overview (read-only from header) ── */
  function renderRelationships() {
    var container = document.getElementById("relationships-content");
    if (!container) return;
    var p = Player.get();
    if (!p || !p.relationships) return;

    var npcs = Relationships.getDateableNPCs();
    var html = '<h2>Relationships</h2>';
    html += '<div class="rel-grid">';

    for (var i = 0; i < npcs.length; i++) {
      var npcId = npcs[i];
      var cfg = Relationships.getConfig(npcId);
      var rel = p.relationships[npcId];
      if (!cfg || !rel) continue;

      var levelName = Relationships.getLevelName(rel.affinity);
      var pct = Math.min(100, Math.floor((rel.affinity / Relationships.MAX_AFFINITY) * 100));
      var isPartner = rel.affinity >= 75 && Player.hasFlag(npcId + "Romantic");

      html += '<div class="rel-card">';
      html += '<img class="rel-portrait" src="' + cfg.portrait + '" alt="' + cfg.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="rel-info">';
      html += '<div class="rel-name">' + cfg.name + (isPartner ? ' <span class="partner-badge">Partner</span>' : '') + '</div>';
      html += '<div class="rel-level">' + levelName + '</div>';
      html += '<div class="rel-bar"><div class="rel-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="rel-affinity">' + rel.affinity + ' / ' + Relationships.MAX_AFFINITY + '</div>';
      html += '</div></div>';
    }

    html += '</div>';
    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
  }

  /* ── Social Hub (Town Square) ── */
  function renderSocial() {
    var container = document.getElementById("social-content");
    if (!container) return;
    var p = Player.get();
    if (!p || !p.relationships) return;

    var npcs = Relationships.getDateableNPCs();
    var html = '<h2>Town Square</h2>';
    html += '<p class="flavor">The heart of Elderbrook. Townsfolk gather here between their duties.</p>';
    html += '<div class="social-grid">';

    for (var i = 0; i < npcs.length; i++) {
      var npcId = npcs[i];
      var cfg = Relationships.getConfig(npcId);
      var rel = p.relationships[npcId];
      if (!cfg || !rel) continue;

      var levelName = Relationships.getLevelName(rel.affinity);
      var pct = Math.min(100, Math.floor((rel.affinity / Relationships.MAX_AFFINITY) * 100));

      html += '<div class="social-card">';
      html += '<img class="social-portrait" src="' + cfg.portrait + '" alt="' + cfg.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="social-info">';
      html += '<div class="social-name">' + cfg.name + '</div>';
      html += '<div class="rel-level">' + levelName + '</div>';
      html += '<div class="rel-bar"><div class="rel-fill" style="width:' + pct + '%"></div></div>';
      html += '</div>';
      html += '<div class="social-actions">';

      if (Relationships.canChat(npcId)) {
        html += '<button class="btn btn-small" data-action="social-chat" data-npc="' + npcId + '">Chat</button>';
      } else {
        html += '<button class="btn btn-small" disabled>Chatted</button>';
      }

      if (Relationships.canGift(npcId)) {
        html += '<button class="btn btn-small" data-action="social-gift" data-npc="' + npcId + '">Give Gift</button>';
      } else {
        html += '<button class="btn btn-small" disabled>Gifted</button>';
      }

      if (Relationships.canDate(npcId)) {
        html += '<button class="btn btn-small btn-date" data-action="social-date" data-npc="' + npcId + '">Date</button>';
      } else if (rel.affinity >= 55 && rel.dated) {
        html += '<button class="btn btn-small" disabled>Dated</button>';
      }

      html += '</div></div>';
    }

    html += '</div>';
    html += '<p class="flavor" style="margin-top:0.8rem;">Rest at the inn to reset daily social actions.</p>';
    html += '<button class="btn" data-action="go-town">Back to Town</button>';
    container.innerHTML = html;
  }

  /* ── Gift Selection Screen ── */
  function renderGiftSelect(npcId) {
    var container = document.getElementById("social-content");
    if (!container) return;

    var cfg = Relationships.getConfig(npcId);
    if (!cfg) return;

    var gifts = Relationships.getGiftableItems();
    var html = '<h2>Choose a Gift for ' + cfg.name + '</h2>';
    html += '<div class="gift-npc-preview">';
    html += '<img class="social-portrait" src="' + cfg.portrait + '" alt="' + cfg.name + '" onerror="this.style.display=\'none\'">';
    html += '</div>';

    if (gifts.length === 0) {
      html += '<p>You have no gifts to give. Buy gift items from the shops!</p>';
    } else {
      html += '<div class="gift-grid">';
      for (var i = 0; i < gifts.length; i++) {
        var g = gifts[i];
        var reaction = Relationships.getGiftReaction(npcId, g.item.id);
        html += '<div class="gift-item">';
        html += '<div class="gift-item-name">' + g.item.name + ' (x' + g.count + ')</div>';
        html += '<div class="gift-item-desc">' + g.item.description + '</div>';
        html += '<button class="btn btn-small" data-action="give-gift-confirm" data-npc="' + npcId + '" data-item="' + g.item.id + '">Give</button>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<button class="btn btn-back" data-action="go-social" style="margin-top:1rem;">Back</button>';
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

  /* ── Settings Screen ── */
  function renderSettings() {
    var container = document.getElementById("settings-content");
    if (!container) return;
    var p = Player.get();
    var settings = (p && p.settings) || { textSpeed: 'normal', soundEnabled: true };

    var html = '<h2>Settings</h2>';
    html += '<div class="settings-group">';
    html += '<label>Text Speed:</label>';
    var speeds = ['slow', 'normal', 'fast', 'instant'];
    html += '<div class="settings-options">';
    for (var i = 0; i < speeds.length; i++) {
      var sel = settings.textSpeed === speeds[i] ? ' btn-active' : '';
      html += '<button class="btn btn-small' + sel + '" data-action="set-text-speed" data-speed="' + speeds[i] + '">' + speeds[i].charAt(0).toUpperCase() + speeds[i].slice(1) + '</button>';
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="settings-group">';
    html += '<label>Sound:</label>';
    html += '<button class="btn btn-small' + (Audio.isEnabled() ? ' btn-active' : '') + '" data-action="set-sound" data-sound="on">On</button>';
    html += '<button class="btn btn-small' + (!Audio.isEnabled() ? ' btn-active' : '') + '" data-action="set-sound" data-sound="off">Off</button>';
    html += '</div>';

    html += '<div class="settings-group">';
    html += '<label>Difficulty:</label>';
    var diffs = ['easy', 'normal', 'hard'];
    var diffLabels = { easy: 'Easy (0.75x)', normal: 'Normal (1x)', hard: 'Hard (1.35x)' };
    html += '<div class="settings-options">';
    for (var d = 0; d < diffs.length; d++) {
      var dsel = (p && p.difficulty) === diffs[d] ? ' btn-active' : '';
      html += '<button class="btn btn-small' + dsel + '" data-action="set-difficulty" data-difficulty="' + diffs[d] + '">' + diffLabels[diffs[d]] + '</button>';
    }
    html += '</div>';
    html += '</div>';

    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
  }

  /* ── Achievements Screen ── */
  function renderAchievements() {
    var container = document.getElementById("achievements-content");
    if (!container) return;
    var p = Player.get();
    var allAch = Chapter1.getAchievements();

    var html = '<h2>Achievements</h2>';
    html += '<div class="achievements-grid">';
    for (var i = 0; i < allAch.length; i++) {
      var a = allAch[i];
      var unlocked = p && p.achievements && p.achievements.indexOf(a.id) !== -1;
      html += '<div class="achievement-card' + (unlocked ? ' achievement-unlocked' : ' achievement-locked') + '">';
      html += '<div class="achievement-name">' + a.name + '</div>';
      html += '<div class="achievement-desc">' + a.description + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
  }

  /* ── Bestiary Screen ── */
  function renderBestiary() {
    var container = document.getElementById("bestiary-content");
    if (!container) return;
    var p = Player.get();
    if (!p) return;

    var bKeys = Object.keys(p.bestiary || {});
    var html = '<h2>Bestiary</h2>';
    html += '<div class="bestiary-count">Creatures discovered: ' + bKeys.length + '</div>';
    html += '<div class="bestiary-grid">';

    for (var b = 0; b < bKeys.length; b++) {
      var en = Enemies.get(bKeys[b]);
      html += '<div class="bestiary-card">';
      html += '<div class="bestiary-name">' + (en ? en.name : bKeys[b]) + '</div>';
      html += '<div class="bestiary-kills">Defeated: ' + p.bestiary[bKeys[b]] + '</div>';
      if (en) {
        html += '<div class="bestiary-stats">HP: ' + en.hp + ' | ATK: ' + en.attack + ' | DEF: ' + en.defense + '</div>';
      }
      html += '</div>';
    }

    if (bKeys.length === 0) {
      html += '<p>No creatures encountered yet.</p>';
    }

    html += '</div>';
    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
  }

  /* ── Build Class Selection ── */
  function renderBuildSelect() {
    var container = document.getElementById("build-select-content");
    if (!container) return;

    var html = '<h2>Choose Your Specialization</h2>';
    html += '<p>You have reached Level 3! Choose a build to gain permanent stat bonuses.</p>';
    html += '<div class="build-grid">';

    html += '<div class="build-card">';
    html += '<h3>Warrior</h3>';
    html += '<p>+2 Attack, +1 Defense</p>';
    html += '<p>Masters of brute force and resilience.</p>';
    html += '<button class="btn" data-action="choose-build" data-build="warrior">Choose Warrior</button>';
    html += '</div>';

    html += '<div class="build-card">';
    html += '<h3>Rogue</h3>';
    html += '<p>+2 Dexterity, +1 Attack</p>';
    html += '<p>Swift and cunning, striking from the shadows.</p>';
    html += '<button class="btn" data-action="choose-build" data-build="rogue">Choose Rogue</button>';
    html += '</div>';

    html += '<div class="build-card">';
    html += '<h3>Mage</h3>';
    html += '<p>+2 Intelligence, +10 Max MP</p>';
    html += '<p>Wielders of arcane power and knowledge.</p>';
    html += '<button class="btn" data-action="choose-build" data-build="mage">Choose Mage</button>';
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
  }

  /* ── Save Slot Selection ── */
  function renderSaveSlots(mode) {
    var container = document.getElementById("save-select-content");
    if (!container) return;

    var slots = Save.getAllSlotInfo();
    var html = '<h2>' + (mode === 'load' ? 'Load Game' : 'Save Game') + '</h2>';
    html += '<div class="save-slots">';

    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      html += '<div class="save-slot">';
      html += '<div class="save-slot-header">Slot ' + s.slot + '</div>';
      if (s.info) {
        html += '<div class="save-slot-info">' + s.info.name + ' - Lv.' + s.info.level + '</div>';
        if (s.info.savedAt) {
          var d = new Date(s.info.savedAt);
          html += '<div class="save-slot-date">' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + '</div>';
        }
      } else {
        html += '<div class="save-slot-info">-- Empty --</div>';
      }
      if (mode === 'load') {
        html += '<button class="btn btn-small" data-action="load-slot" data-slot="' + s.slot + '"' + (s.info ? '' : ' disabled') + '>Load</button>';
      } else {
        html += '<button class="btn btn-small" data-action="save-slot" data-slot="' + s.slot + '">Save</button>';
      }
      if (s.info) {
        html += '<button class="btn btn-small btn-danger" data-action="delete-slot" data-slot="' + s.slot + '">Delete</button>';
      }
      html += '</div>';
    }

    html += '</div>';
    html += '<button class="btn" data-action="close-overlay">Close</button>';
    container.innerHTML = html;
    container.setAttribute('data-mode', mode);
  }

  /* ── Difficulty Selection (character creation) ── */
  function renderDifficultySelect() {
    var container = document.getElementById("difficulty-content");
    if (!container) return;

    var html = '<h2>Choose Difficulty</h2>';
    html += '<div class="difficulty-grid">';

    html += '<div class="difficulty-card">';
    html += '<h3>Easy</h3>';
    html += '<p>Enemies deal 0.75x damage. For a relaxed adventure.</p>';
    html += '<button class="btn" data-action="select-difficulty" data-difficulty="easy">Easy</button>';
    html += '</div>';

    html += '<div class="difficulty-card">';
    html += '<h3>Normal</h3>';
    html += '<p>The intended experience. Balanced challenge.</p>';
    html += '<button class="btn" data-action="select-difficulty" data-difficulty="normal">Normal</button>';
    html += '</div>';

    html += '<div class="difficulty-card">';
    html += '<h3>Hard</h3>';
    html += '<p>Enemies deal 1.35x damage. For seasoned adventurers.</p>';
    html += '<button class="btn btn-danger" data-action="select-difficulty" data-difficulty="hard">Hard</button>';
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
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
    renderRelationships: renderRelationships,
    renderSocial: renderSocial,
    renderGiftSelect: renderGiftSelect,
    renderSettings: renderSettings,
    renderAchievements: renderAchievements,
    renderBestiary: renderBestiary,
    renderBuildSelect: renderBuildSelect,
    renderSaveSlots: renderSaveSlots,
    renderDifficultySelect: renderDifficultySelect,
    showMessage: showMessage
  };
})();
