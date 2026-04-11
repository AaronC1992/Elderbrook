/* ui.js - Screen management, header, character view, quest log, messages */
var UI = (function () {

  var currentScreen = "title";
  var previousScreen = null;
  var messageTimeout = null;
  var pendingDialogueBg = null;

  function setDialogueBackground(url) {
    pendingDialogueBg = url ? "url('" + url + "')" : null;
  }

  function showScreen(id) {
    // Before switching, set dialogue background from pending or inherit from current screen
    if (id === "dialogue") {
      var dlgScreen = document.getElementById("screen-dialogue");
      if (dlgScreen) {
        if (pendingDialogueBg) {
          dlgScreen.style.backgroundImage = pendingDialogueBg;
          pendingDialogueBg = null;
        } else if (!dlgScreen.style.backgroundImage) {
          var curScreen = document.getElementById("screen-" + currentScreen);
          if (curScreen) {
            var bg = curScreen.style.backgroundImage || window.getComputedStyle(curScreen).backgroundImage;
            if (bg && bg !== "none") {
              dlgScreen.style.backgroundImage = bg;
            }
          }
        }
      }
    }
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove("active");
    }
    // Clear dynamic backgrounds on dialogue screen when leaving it
    if (id !== "dialogue") {
      var dlgScreen = document.getElementById("screen-dialogue");
      if (dlgScreen) dlgScreen.style.backgroundImage = "";
      pendingDialogueBg = null;
    }
    var target = document.getElementById("screen-" + id);
    if (target) {
      target.classList.add("active");
      // Track previous screen for overlay returns
      var overlays = ["ledger","inventory","character","quests","settings","achievements","bestiary","relationships","save-select"];
      if (overlays.indexOf(id) !== -1 && overlays.indexOf(currentScreen) === -1) {
        previousScreen = currentScreen;
      }
      currentScreen = id;
    }
    // Toggle menu mode (hides sidebars/nav on title & create)
    var gc = document.getElementById("game-container");
    if (gc) {
      if (id === "title" || id === "create" || id === "intro") {
        gc.classList.add("mode-menu");
      } else {
        gc.classList.remove("mode-menu");
      }
    }
    // Update header + sidebars on gameplay screens
    if (id !== "title" && id !== "create") {
      updateHeader();
    }
    if (id === "create") {
      renderCreateClassPaths();
    }
    // Hide nav during immersive screens
    var nav = document.getElementById("game-nav");
    if (nav) {
      var hideNav = (id === "battle" || id === "dungeon" || id === "dialogue");
      nav.style.display = hideNav ? "none" : "";
    }
  }

  function renderCreateClassPaths() {
    var container = document.getElementById("create-class-paths");
    if (!container || !Player || !Player.CLASS_DEFS) return;

    var defs = Player.CLASS_DEFS;
    var statLabels = {
      attack: "ATK",
      defense: "DEF",
      dexterity: "DEX",
      intelligence: "INT",
      maxHp: "Max HP",
      maxMp: "Max MP"
    };
    var orderedIds = Object.keys(defs);
    var subIdsByBase = {};
    var groupedBaseIds = [];
    var soloBaseIds = [];

    function getSkillName(skillId) {
      var skillDef = skillId ? Skills.get(skillId) : null;
      return skillDef ? skillDef.name : null;
    }

    function buildClassGroup(classId, subIds) {
      var def = defs[classId];
      var skillName = getSkillName(def.skill);
      var html = '<div class="create-class-group">';
        html += '<div class="create-class-base">' + def.name + '</div>';
      html += '<div class="create-class-desc">' + def.desc + '</div>';
      if (skillName) html += '<div class="create-class-stats">Special Skill: ' + skillName + '</div>';
      if (subIds.length) {
        html += '<div class="create-class-subs">';
        for (var i = 0; i < subIds.length; i++) {
          var subDef = defs[subIds[i]];
          var subSkillName = getSkillName(subDef.skill);
            html += '<div class="create-class-sub">' + subDef.name + ' <span class="create-class-tag">Subclass</span>' + (subSkillName ? ' - ' + subSkillName : '') + '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
      return html;
    }

    for (var i = 0; i < orderedIds.length; i++) {
      var id = orderedIds[i];
      var def = defs[id];
      if (def.base) {
        if (!subIdsByBase[def.base]) subIdsByBase[def.base] = [];
        subIdsByBase[def.base].push(id);
      }
    }

    for (var j = 0; j < orderedIds.length; j++) {
      var baseId = orderedIds[j];
      var baseDef = defs[baseId];
      if (baseDef.base) continue;
      if ((subIdsByBase[baseId] || []).length) groupedBaseIds.push(baseId);
      else soloBaseIds.push(baseId);
    }

    var html = '<h3>Class Paths</h3>';
    html += '<p class="flavor">All classes and subclasses unlock through their own class quest lines.</p>';
    html += '<div class="create-class-tree">';

    for (var k = 0; k < groupedBaseIds.length; k++) {
      var groupedBaseId = groupedBaseIds[k];
      html += buildClassGroup(groupedBaseId, subIdsByBase[groupedBaseId] || []);
    }

    for (var s = 0; s < soloBaseIds.length; s++) {
      html += buildClassGroup(soloBaseIds[s], []);
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function getScreen() { return currentScreen; }
  function getPreviousScreen() { return previousScreen; }

  /* ── Top Status Bar ── */
  function updateHeader() {
    var p = Player.get();
    if (!p) return;

    var dayEl = document.getElementById("header-day");
    var timeEl = document.getElementById("header-time");
    var energyFill = document.getElementById("energy-fill");
    var energyText = document.getElementById("energy-text");
    var goldEl = document.getElementById("header-gold");
    var soundBtn = document.getElementById("btn-sound");

    if (dayEl) dayEl.textContent = "Day " + (p.day || 1);
    if (timeEl) {
      var tod = Player.getTimeOfDay();
      var season = Player.getSeason();
      var seasonCap = season.charAt(0).toUpperCase() + season.slice(1);
      timeEl.textContent = seasonCap + " \u2022 " + tod.charAt(0).toUpperCase() + tod.slice(1);
    }
    if (energyFill) energyFill.style.width = Math.round((p.energy / p.maxEnergy) * 100) + "%";
    if (energyText) energyText.textContent = p.energy + "/" + p.maxEnergy;

    // Energy warning when low
    var energyBar = energyFill ? energyFill.parentElement : null;
    if (energyBar) {
      if (p.energy <= 2 && p.energy > 0) {
        energyBar.classList.add("energy-low");
      } else {
        energyBar.classList.remove("energy-low");
      }
    }
    if (goldEl) goldEl.textContent = "Gold: " + p.gold;
    if (soundBtn) soundBtn.textContent = Audio.isEnabled() ? "Sound On" : "Sound Off";
    updateSidebars();
  }

  /* ── Sidebars ── */
  function updateSidebars() {
    var p = Player.get();
    if (!p) return;

    // Left: stats
    var portrait = document.getElementById("sidebar-portrait");
    var nameEl = document.getElementById("sidebar-name");
    var levelEl = document.getElementById("sidebar-level");
    if (portrait) portrait.src = Player.getPortrait();
    if (nameEl) nameEl.textContent = p.name;
    if (levelEl) {
      var className = "";
      if (p.buildClass && Player.CLASS_DEFS[p.buildClass]) className = " " + Player.CLASS_DEFS[p.buildClass].name;
      levelEl.textContent = "Lv." + p.level + className;
    }

    // Bars
    setBar("bar-hp", p.hp, p.maxHp);   setStat("stat-hp", p.hp + "/" + p.maxHp);
    setBar("bar-mp", p.mp, p.maxMp);   setStat("stat-mp", p.mp + "/" + p.maxMp);
    setBar("bar-xp", p.xp, p.xpToNext); setStat("stat-xp", p.xp + "/" + p.xpToNext);

    setStat("stat-atk", p.attack);
    setStat("stat-def", p.defense);
    setStat("stat-dex", p.dexterity);
    setStat("stat-int", p.intelligence);
    setStat("stat-cha", p.charm || 1);

    // Pet display
    var petBox = document.getElementById("sidebar-pet");
    if (petBox) {
      if (p.activePet) {
        var petData = Pets.get(p.activePet);
        if (petData) {
          petBox.style.display = "";
          var petPortrait = document.getElementById("sidebar-pet-portrait");
          var petName = document.getElementById("sidebar-pet-name");
          if (petPortrait) petPortrait.src = petData.portrait;
          if (petName) petName.textContent = petData.name;
        } else {
          petBox.style.display = "none";
        }
      } else {
        petBox.style.display = "none";
      }
    }

    // Right: quest tracker — show tracked quest with full detail
    var questContainer = document.getElementById("quest-tracker");
    if (questContainer) {
      var tracked = Quests.getTrackedOrNext();
      var qhtml = "";
      if (!tracked) {
        qhtml += '<div class="quest-tracker-empty">No active quests</div>';
      } else {
        var ready = Quests.checkObjectives(tracked.id);
        qhtml += '<div class="quest-tracker-active' + (ready ? ' quest-tracker-ready' : '') + '">';
        qhtml += '<div class="quest-tracker-type">' + (tracked.type === "main" ? "Main Quest" : "Side Quest") + '</div>';
        qhtml += '<div class="quest-tracker-name">' + tracked.name + '</div>';
        qhtml += '<div class="quest-tracker-objectives">';
        for (var oj = 0; oj < tracked.objectives.length; oj++) {
          var objDone = isObjectiveComplete(tracked.id, oj);
          qhtml += '<div class="quest-tracker-obj' + (objDone ? ' quest-obj-done' : '') + '">';
          qhtml += (objDone ? '&#10003; ' : '&#9679; ') + Quests.getObjectiveStatus(tracked.id, oj);
          qhtml += '</div>';
        }
        qhtml += '</div>';
        if (ready) {
          var turnInInfo = Quests.getTurnInInfo(tracked.id);
          if (turnInInfo) {
            qhtml += '<div class="quest-tracker-turnin">Turn in to<br><strong>' + turnInInfo.npcName + '</strong><br><span class="quest-tracker-location">' + turnInInfo.location + '</span></div>';
          } else {
            qhtml += '<div class="quest-tracker-status">Ready to turn in</div>';
          }
        }
        qhtml += '</div>';

        // Show count of other active quests
        var activeQ = Quests.getActive();
        if (activeQ.length > 1) {
          qhtml += '<div class="quest-tracker-more" data-action="open-ledger-quests">' + (activeQ.length - 1) + ' more quest' + (activeQ.length > 2 ? 's' : '') + ' in Ledger</div>';
        }
      }
      questContainer.innerHTML = qhtml;
    }
  }

  function isObjectiveComplete(questId, objIndex) {
    var def = Chapter1.getQuest(questId);
    if (!def || !def.objectives[objIndex]) return false;
    var obj = def.objectives[objIndex];
    if (obj.type === "kill") {
      var prog = (Player.get().questProgress[questId] && Player.get().questProgress[questId][obj.id]) || 0;
      return prog >= obj.required;
    } else if (obj.type === "collect") {
      return Player.countItem(obj.item) >= obj.required;
    } else if (obj.type === "flag") {
      return Player.hasFlag(obj.flag);
    }
    return false;
  }

  function setBar(id, val, max) {
    var el = document.getElementById(id);
    if (el) el.style.width = Math.round((val / Math.max(1, max)) * 100) + "%";
  }
  function setStat(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
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
    var skills = Skills.getAvailable(p.learnedSkills);
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
          var turnInInfo = Quests.getTurnInInfo(q.id);
          if (turnInInfo) {
            html += '<div class="quest-turnin-hint">Turn in to ' + turnInInfo.npcName + ' at the ' + turnInInfo.location + '</div>';
          }
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

    var p = Player.get();
    var available = Quests.getAvailable();
    var sideQuests = [];
    for (var i = 0; i < available.length; i++) {
      if (available[i].type === "side") sideQuests.push(available[i]);
    }

    var html = '<h2>Quest Board</h2>';

    // ── Side Quests (story-based, one-time) ──
    if (sideQuests.length > 0) {
      html += '<h3>Side Quests</h3>';
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

    // ── Daily Board Quests (rotating hunt/gather) ──
    var boardSlots = Chapter1.rollDailyBoardQuests(p);
    if (boardSlots.length > 0) {
      html += '<h3 style="margin-top:1rem;">Daily Jobs <span class="quest-type">(refreshes each day)</span></h3>';
      for (var b = 0; b < boardSlots.length; b++) {
        var slot = boardSlots[b];
        var bDef = Chapter1.getBoardQuestTemplate(slot.id);
        if (!bDef) continue;
        var bActive = p.activeQuests.indexOf(slot.id) !== -1;
        var tierLabel = bDef.tier === 1 ? 'Tier 1' : (bDef.tier === 2 ? 'Tier 2' : 'Tier 3');
        html += '<div class="quest-entry' + (bActive ? ' quest-active-board' : '') + '">';
        html += '<div class="quest-name">' + bDef.name + ' <span class="quest-type">[' + tierLabel + ']</span></div>';
        html += '<div class="quest-desc">' + bDef.description + '</div>';
        html += '<div class="quest-rewards">Rewards: ' + bDef.rewards.xp + ' XP';
        if (bDef.rewards.gold) html += ', ' + bDef.rewards.gold + ' gold';
        html += '</div>';
        if (bActive) {
          // Show progress
          for (var bo = 0; bo < bDef.objectives.length; bo++) {
            html += '<div class="quest-obj">' + Quests.getObjectiveStatus(slot.id, bo) + '</div>';
          }
          if (Quests.checkObjectives(slot.id)) {
            html += '<button class="btn btn-small" data-action="turn-in-quest" data-quest="' + slot.id + '">Turn In</button>';
          } else {
            html += '<span class="quest-type">In Progress</span>';
          }
        } else {
          html += '<button class="btn btn-small" data-action="accept-quest" data-quest="' + slot.id + '">Accept</button>';
        }
        html += '</div>';
      }
    }

    if (sideQuests.length === 0 && boardSlots.length === 0) {
      html += '<p>No jobs posted at the moment. Check back later.</p>';
    }

    // Post-game daily bounty
    var bounty = Chapter1.rollDailyBounty(p);
    if (bounty) {
      var bountyActive = p.activeBounty && p.activeBounty.id === bounty.id;
      var bountyComplete = p.completedBounties && p.completedBounties.indexOf(bounty.id + '-' + p.day) !== -1;
      html += '<h3 style="margin-top:1rem;">Daily Bounty</h3>';
      html += '<div class="quest-entry bounty-entry">';
      html += '<div class="quest-name">' + bounty.name + '</div>';
      html += '<div class="quest-desc">' + bounty.description + '</div>';
      html += '<div class="quest-rewards">Rewards: ' + bounty.rewards.xp + ' XP, ' + bounty.rewards.gold + ' gold</div>';
      if (bountyComplete) {
        html += '<span class="bounty-done">Completed today</span>';
      } else if (bountyActive) {
        var prog = p.bountyKills || 0;
        html += '<div class="quest-progress">' + prog + '/' + bounty.count + ' killed</div>';
        if (prog >= bounty.count) {
          html += '<button class="btn btn-small" data-action="turn-in-bounty">Turn In</button>';
        }
      } else {
        html += '<button class="btn btn-small" data-action="accept-bounty">Accept</button>';
      }
      html += '</div>';
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

    var festival = Player.isFestivalActive();
    var html = '';

    // ── NPC / scene area (overlays the background image) ──
    html += '<div class="town-square">';

    if (festival) {
      html += '<div class="town-title">Elderbrook <span class="festival-badge">Harvest Festival</span></div>';
      html += '<div class="festival-banner">The town is alive with music, lanterns, and the smell of fresh cider!</div>';
    } else {
      html += '<div class="town-title">Elderbrook</div>';
    }

    // Persistent town NPCs — portraits in the cobblestone square
    // Elric is at the Guard Post, not in town square
    var elricAway = (Player.hasFlag("elricJoinedMQ4") && !Player.hasFlag("completedMQ4")) ||
                    (Player.hasFlag("acceptedMQ7") && !Player.hasFlag("completedMQ7"));
    html += '<button class="town-npc town-npc-event" style="top:51%;left:61%" data-action="go-liora"><img class="town-npc-portrait" src="assets/portraits/liora.png" alt="Liora Bloom" onerror="this.style.display=\'none\'"><span class="town-npc-name">Liora Bloom</span></button>';

    // Biscuit the cat — appears near the gate when looking, vanishes once found
    if (Player.hasFlag('lookingForBiscuit') && !Player.hasFlag('foundBiscuit')) {
      html += '<button class="town-npc town-npc-cat" style="top:22%;right:18%" data-action="find-biscuit"><img class="town-npc-portrait" src="assets/portraits/biscuit-cat.png" alt="" onerror="this.style.display=\'none\'"><span class="town-npc-name">???</span></button>';
      // Lost child stays in town while you search (reactive dialogue)
      html += '<button class="town-npc town-npc-event" style="top:68%;left:25%" data-action="check-on-child"><img class="town-npc-portrait" src="assets/portraits/lost-child.png" alt="Lost Child" onerror="this.style.display=\'none\'"><span class="town-npc-name">Lost Child</span></button>';
    }

    // Lost child returns when you've found Biscuit
    if (Player.hasFlag('foundBiscuit') && !Player.hasFlag('returnedBiscuit')) {
      html += '<button class="town-npc town-npc-event" style="top:55%;left:30%" data-action="return-biscuit"><img class="town-npc-portrait" src="assets/portraits/lost-child.png" alt="Lost Child" onerror="this.style.display=\'none\'"><span class="town-npc-name">Lost Child</span></button>';
    }

    // Spawn event NPCs — show full portrait in town
    var pTown = Player.get();
    var spawns = (pTown && pTown.eventSpawns) ? pTown.eventSpawns : [];
    var events = Chapter1.getActiveEvents("town", spawns);
    for (var e = 0; e < events.length; e++) {
      var ev = events[e];
      html += '<button class="town-npc town-npc-event" style="' + ev.poiPosition + '" data-action="interact-event" data-event="' + ev.id + '">';
      if (ev.npcPortrait) html += '<img class="town-npc-portrait" src="' + ev.npcPortrait + '" alt="' + ev.npcName + '" onerror="this.style.display=\'none\'">';
      html += '<span class="town-npc-name">' + ev.npcName + '</span>';
      html += '</button>';
    }

    html += '</div>'; // .town-square

    // ── Building navigation (absolute on desktop, grid panel on mobile) ──
    html += '<div class="town-buildings">';

    // Left side
    html += '<button class="town-poi" style="top:5%;left:1%" data-action="go-inn"><span class="poi-name">The Hearthstone Inn</span><span class="poi-sub">' + (festival ? 'Packed with revelers' : 'Rest &amp; recover') + '</span></button>';
    html += '<button class="town-poi" style="top:28%;left:8%" data-action="go-shop" data-shop="weapon-shop"><span class="poi-name">' + (festival ? 'Bram\'s Festival Forge' : 'Weapon Shop') + '</span><span class="poi-sub">' + (festival ? 'Commemorative blades' : 'Bram Ironhand') + '</span></button>';

    // Center — peaked building behind the lamp post
    var guildSub = 'Guildmaster Rowan';
    if (festival) guildSub = 'Festive drinks inside';
    else if (Player.hasFlag('defeatedGrisk')) guildSub = 'Rowan has news';
    else if (Player.hasFlag('acceptedMQ7')) guildSub = 'Rowan is anxious';
    else if (Player.hasFlag('unlockedGoblinCave')) guildSub = 'Rowan awaits your report';
    html += '<button class="town-poi" style="top:8%;left:42%" data-action="go-guild"><span class="poi-name">Adventurers Guild</span><span class="poi-sub">' + guildSub + '</span></button>';

    // Right side — aligned to right-side buildings in the art
    html += '<button class="town-poi" style="top:3%;right:2%" data-action="go-shop" data-shop="armor-shop"><span class="poi-name">Armor Shop</span><span class="poi-sub">' + (festival ? 'Harlan is almost smiling' : 'Harlan Stonevein') + '</span></button>';
    html += '<button class="town-poi" style="top:18%;right:18%" data-action="go-shop" data-shop="potion-shop"><span class="poi-name">' + (festival ? 'Mira\'s Cider Stand' : 'Potion Shop') + '</span><span class="poi-sub">' + (festival ? 'Festive brews &amp; potions' : 'Mira Voss') + '</span></button>';
    html += '<button class="town-poi" style="top:28%;right:0%" data-action="go-questboard"><span class="poi-name">Quest Board</span><span class="poi-sub">Check for jobs</span></button>';
    html += '<button class="town-poi" style="top:44%;left:39%" data-action="go-elric"><span class="poi-name">Guard Post</span><span class="poi-sub">' + (elricAway ? 'Elric is in the field' : (Player.hasFlag('defeatedGrisk') ? 'Captain Elric — At ease' : 'Captain Elric')) + '</span></button>';
    html += '<button class="town-poi" style="top:52%;right:19%" data-action="go-liora"><span class="poi-name">Flower Stall</span><span class="poi-sub">Liora Bloom</span></button>';

    // Conditional POIs
    if (Player.hasFlag('metElira')) {
      html += '<button class="town-poi" style="top:11%;left:11%" data-action="go-elira"><span class="poi-name">Inn (Upstairs)</span><span class="poi-sub">Visit Elira</span></button>';
    }
    if (Player.hasFlag('bramForgeUnlocked')) {
      html += '<button class="town-poi" style="top:40%;left:3%" data-action="open-crafting"><span class="poi-name">Bram\'s Forge</span><span class="poi-sub">Craft gear</span></button>';
    }

    // Pet Shop
    html += '<button class="town-poi" style="top:40%;right:5%" data-action="go-petshop"><span class="poi-name">Pet Emporium</span><span class="poi-sub">Fauna\'s creatures</span></button>';

    // Class Mentor NPCs (conditional)
    var p = Player.get();
    var pLevel = p ? p.level : 1;
    var pClass = p ? p.buildClass : null;
    var pBase = pClass ? Player.getBaseClass(pClass) : null;

    // Base class mentors: visible at level 3+ before choosing a class
    if (pLevel >= 3 && !Player.hasFlag('choseBuild')) {
      html += '<button class="town-npc town-npc-event" style="top:62%;left:12%" data-action="go-mentor" data-mentor="varn"><img class="town-npc-portrait" src="assets/portraits/varn.png" alt="Varn" onerror="this.style.display=\'none\'"><span class="town-npc-name">Varn the Ironclad</span></button>';
      html += '<button class="town-npc town-npc-event" style="top:38%;left:28%" data-action="go-mentor" data-mentor="shade"><img class="town-npc-portrait" src="assets/portraits/shade.png" alt="Shade" onerror="this.style.display=\'none\'"><span class="town-npc-name">Shade</span></button>';
      html += '<button class="town-npc town-npc-event" style="top:58%;right:22%" data-action="go-mentor" data-mentor="theron"><img class="town-npc-portrait" src="assets/portraits/theron.png" alt="Sage Theron" onerror="this.style.display=\'none\'"><span class="town-npc-name">Sage Theron</span></button>';
    }

    // Subclass mentors: visible after choosing parent base class
    if (pBase === 'warrior') {
      if (!Player.hasFlag('unlockedKnight') && Player.hasFlag('completedMQ3')) {
        html += '<button class="town-npc town-npc-event" style="top:35%;left:35%" data-action="go-mentor" data-mentor="lysara"><img class="town-npc-portrait" src="assets/portraits/lysara.png" alt="Dame Lysara" onerror="this.style.display=\'none\'"><span class="town-npc-name">Dame Lysara</span></button>';
      }
      if (!Player.hasFlag('unlockedBerserker') && Player.hasFlag('completedMQ4')) {
        html += '<button class="town-npc town-npc-event" style="top:65%;right:12%" data-action="go-mentor" data-mentor="grul"><img class="town-npc-portrait" src="assets/portraits/grul.png" alt="Grul" onerror="this.style.display=\'none\'"><span class="town-npc-name">Grul</span></button>';
      }
    }
    if (pBase === 'rogue') {
      if (!Player.hasFlag('unlockedAssassin') && Player.hasFlag('completedMQ4')) {
        html += '<button class="town-npc town-npc-event" style="top:38%;left:20%" data-action="go-mentor" data-mentor="whisper"><img class="town-npc-portrait" src="assets/portraits/whisper.png" alt="Whisper" onerror="this.style.display=\'none\'"><span class="town-npc-name">Whisper</span></button>';
      }
      if (!Player.hasFlag('unlockedRanger') && Player.hasFlag('completedMQ3')) {
        html += '<button class="town-npc town-npc-event" style="top:65%;left:35%" data-action="go-mentor" data-mentor="fenn"><img class="town-npc-portrait" src="assets/portraits/fenn.png" alt="Warden Fenn" onerror="this.style.display=\'none\'"><span class="town-npc-name">Warden Fenn</span></button>';
      }
    }
    if (pBase === 'mage') {
      if (!Player.hasFlag('unlockedPyromancer') && Player.hasFlag('completedMQ4')) {
        html += '<button class="town-npc town-npc-event" style="top:62%;left:15%" data-action="go-mentor" data-mentor="cindra"><img class="town-npc-portrait" src="assets/portraits/cindra.png" alt="Cindra" onerror="this.style.display=\'none\'"><span class="town-npc-name">Cindra</span></button>';
      }
      if (!Player.hasFlag('unlockedCleric') && Player.hasFlag('completedMQ3')) {
        html += '<button class="town-npc town-npc-event" style="top:35%;right:28%" data-action="go-mentor" data-mentor="maren"><img class="town-npc-portrait" src="assets/portraits/maren.png" alt="Sister Maren" onerror="this.style.display=\'none\'"><span class="town-npc-name">Sister Maren</span></button>';
      }
    }

    // Paladin mentor: after MQ7 + any base class
    if (Player.hasFlag('choseBuild') && Player.hasFlag('completedMQ7') && !Player.hasFlag('unlockedPaladin')) {
      html += '<button class="town-npc town-npc-event" style="top:42%;left:48%" data-action="go-mentor" data-mentor="cedric"><img class="town-npc-portrait" src="assets/portraits/cedric.png" alt="Sir Cedric" onerror="this.style.display=\'none\'"><span class="town-npc-name">Sir Cedric</span></button>';
    }

    // Exit
    html += '<button class="town-poi town-poi-exit" style="bottom:3%;left:50%;transform:translateX(-50%)" data-action="go-worldmap"><span class="poi-name">World Map</span><span class="poi-sub">Leave town</span></button>';

    html += '</div>'; // .town-buildings

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

  /* ── NPC Interaction Menu ── */
  function renderNPCMenu(npcId, options) {
    var container = document.getElementById("social-content");
    if (!container) return;

    options = options || {};

    var cfg = Relationships.getConfig(npcId);
    var p = Player.get();
    var rel = p && p.relationships ? p.relationships[npcId] : null;

    // Set background on the social screen to match the location
    var screen = document.getElementById("screen-social");
    if (screen) {
      screen.style.backgroundImage = options.background ? "url('" + options.background + "')" : "";
    }

    // Full-body NPC portrait in the background
    var npcArea = document.getElementById("social-npc-area");
    if (npcArea) {
      if (cfg && cfg.portrait) {
        var cropClass = options.bustCrop ? ' npc-bust-crop' : '';
        npcArea.innerHTML = '<img class="shop-npc-fullbody' + cropClass + '" src="' + cfg.portrait + '" alt="' + cfg.name + '" onerror="this.style.display=\'none\'">';
      } else {
        npcArea.innerHTML = '';
      }
      if (options.bustCrop) {
        npcArea.classList.add('bust-crop-area');
      } else {
        npcArea.classList.remove('bust-crop-area');
      }
    }

    var html = '<div class="npc-menu">';

    // NPC name and relationship info
    if (cfg) {
      var levelName = Relationships.getLevelName(rel ? rel.affinity : 0);
      var pct = rel ? Math.min(100, Math.floor((rel.affinity / Relationships.MAX_AFFINITY) * 100)) : 0;
      var isPartner = rel && rel.affinity >= 75 && Player.hasFlag(npcId + "Romantic");

      html += '<div class="npc-menu-header">';
      html += '<h2 class="npc-menu-name">' + cfg.name + (isPartner ? ' <span class="partner-badge">Partner</span>' : '') + '</h2>';
      html += '<div class="npc-menu-rel">';
      html += '<div class="rel-level">' + levelName + '</div>';
      html += '<div class="rel-bar"><div class="rel-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="rel-affinity">' + (rel ? rel.affinity : 0) + ' / ' + Relationships.MAX_AFFINITY + '</div>';

      // Class preference display
      var prefClass = Relationships.getClassPreference(npcId);
      if (prefClass) {
        var prefLabel = prefClass.charAt(0).toUpperCase() + prefClass.slice(1);
        var bc = p ? p.buildClass : null;
        var cdef = bc && Player.CLASS_DEFS ? Player.CLASS_DEFS[bc] : null;
        var isMatch = bc === prefClass || (cdef && cdef.base === prefClass);
        html += '<div class="npc-class-pref' + (isMatch ? ' pref-match' : '') + '">Prefers: ' + prefLabel + (isMatch ? ' (You!)' : '') + '</div>';
      }

      html += '</div></div>';
    }

    html += '<div class="npc-menu-actions">';

    // Shop button
    if (options.shopId) {
      html += '<button class="btn" data-action="npc-shop" data-shop="' + options.shopId + '">Shop</button>';
    }

    // Pet Shop button
    if (options.petShop) {
      html += '<button class="btn" data-action="npc-petshop">Shop</button>';
    }

    // Quest Board button
    if (options.questBoard) {
      html += '<button class="btn" data-action="npc-questboard">Quest Board</button>';
    }

    // Chat
    if (cfg && rel) {
      if (Relationships.canChat(npcId)) {
        html += '<button class="btn" data-action="npc-chat" data-npc="' + npcId + '">Chat</button>';
      } else {
        html += '<button class="btn" disabled>Chatted Today</button>';
      }
    }

    // Gift
    if (cfg && rel) {
      if (Relationships.canGift(npcId)) {
        html += '<button class="btn" data-action="npc-gift" data-npc="' + npcId + '">Give Gift</button>';
      } else {
        html += '<button class="btn" disabled>Gifted Today</button>';
      }
    }

    // Date
    if (cfg && rel) {
      if (Relationships.canDate(npcId)) {
        html += '<button class="btn btn-date" data-action="npc-date" data-npc="' + npcId + '">Date</button>';
      } else if (rel.affinity >= 55 && rel.dated) {
        html += '<button class="btn" disabled>Dated Today</button>';
      }
    }

    if ((options.returnToScene === 'shop' && options.shopId) || options.returnToScene === 'petshop') {
      html += '<button class="btn" data-action="npc-exit-menu">Back</button>';
    } else {
      html += '<button class="btn" data-action="go-town">Back to Town</button>';
    }
    html += '</div>';

    // Daily reset hint
    html += '<p class="npc-menu-hint">Rest at the inn to reset daily social actions.</p>';
    html += '</div>';
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
        html += '<button class="btn btn-small" data-action="npc-give-gift" data-npc="' + npcId + '" data-item="' + g.item.id + '">Give</button>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<button class="btn btn-back" data-action="npc-back" style="margin-top:1rem;">Back</button>';
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

  var seasonTimeout = null;
  function showSeasonBanner(season) {
    var el = document.getElementById("season-banner");
    if (!el) return;
    var seasonNames = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };
    var seasonFlavors = {
      spring: "The frost melts and new life stirs.",
      summer: "The sun blazes and the land is warm.",
      autumn: "Leaves turn gold and the harvest begins.",
      winter: "A chill descends over Elderbrook."
    };
    el.innerHTML = 'The Season Has Changed<br><strong>' + (seasonNames[season] || season) + '</strong><div class="season-sub">' + (seasonFlavors[season] || '') + '</div>';
    el.classList.add("visible");
    if (seasonTimeout) clearTimeout(seasonTimeout);
    seasonTimeout = setTimeout(function () {
      el.classList.remove("visible");
    }, 4000);
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

  /* ── Bestiary Screen (progressive knowledge) ── */
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
      var kills = p.bestiary[bKeys[b]];
      html += '<div class="bestiary-card">';
      html += '<div class="bestiary-name">' + (en ? en.name : bKeys[b]) + '</div>';
      html += '<div class="bestiary-kills">Defeated: ' + kills + '</div>';
      if (en) {
        if (kills >= 3) {
          html += '<div class="bestiary-stats">HP: ' + en.hp + ' | ATK: ' + en.attack;
          if (kills >= 5) html += ' | DEF: ' + en.defense;
          html += '</div>';
        } else {
          html += '<div class="bestiary-stats locked-text">Defeat more to learn stats...</div>';
        }
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

    var p = Player.get();
    var defs = Player.CLASS_DEFS;
    var currentClass = p ? p.buildClass : null;

    var html = '<h2>Class Paths</h2>';
    if (!currentClass) {
      html += '<p>Find class mentors around Elderbrook to begin your path. Talk to them to accept their trial.</p>';
    } else {
      html += '<p>Current class: <strong>' + defs[currentClass].name + '</strong>. Your class path is permanent.</p>';
    }

    // Group: base classes first, then subclasses
    var baseClasses = ["warrior", "rogue", "mage"];
    var subClasses = {
      warrior: ["knight", "berserker"],
      rogue: ["assassin", "ranger"],
      mage: ["pyromancer", "cleric"]
    };
    var special = ["paladin"];

    for (var b = 0; b < baseClasses.length; b++) {
      var baseId = baseClasses[b];
      var baseDef = defs[baseId];
      html += '<div class="class-group">';
      html += '<h3 class="class-group-title">' + baseDef.name + ' Path</h3>';
      html += '<div class="build-grid">';

      // Base class card
      html += buildClassCard(baseId, baseDef, p, currentClass, isClassLocked(baseId, baseDef, p));

      // Sub classes
      var subs = subClasses[baseId] || [];
      for (var s = 0; s < subs.length; s++) {
        var subId = subs[s];
        var subDef = defs[subId];
        var locked = isClassLocked(subId, subDef, p);
        html += buildClassCard(subId, subDef, p, currentClass, locked);
      }

      html += '</div></div>';
    }

    // Special classes
    html += '<div class="class-group">';
    html += '<h3 class="class-group-title">Special</h3>';
    html += '<div class="build-grid">';
    for (var sp = 0; sp < special.length; sp++) {
      var spId = special[sp];
      var spDef = defs[spId];
      var spLocked = isClassLocked(spId, spDef, p);
      html += buildClassCard(spId, spDef, p, currentClass, spLocked);
    }
    html += '</div></div>';

    html += '<button class="btn" data-action="go-town">Back to Town</button>';
    container.innerHTML = html;
  }

  function isClassLocked(classId, def, p) {
    if (def.unlockFlag && p && p.storyFlags && p.storyFlags[def.unlockFlag]) return false;
    return true;
  }

  function buildClassCard(classId, def, p, currentClass, locked) {
    var isCurrent = currentClass === classId;
    var statsText = formatClassStats(def.stats);
    var skillDef = Skills.get(def.skill);
    var html = '<div class="build-card' + (locked ? ' build-locked' : '') + (isCurrent ? ' build-current' : '') + '">';
    html += '<h3>' + def.name + '</h3>';
    if (def.base) html += '<div class="build-subclass-tag">Subclass of ' + (Player.CLASS_DEFS[def.base] ? Player.CLASS_DEFS[def.base].name : def.base) + '</div>';
    html += '<p class="build-stats">' + statsText + '</p>';
    html += '<p class="build-desc">' + def.desc + '</p>';
    if (skillDef) {
      html += '<div class="build-skill">Skill: <strong>' + skillDef.name + '</strong> &mdash; ' + skillDef.description + '</div>';
    }
    if (isCurrent) {
      html += '<div class="build-current-msg">Current Class</div>';
    } else if (locked) {
      html += '<div class="build-lock-msg">Complete a mentor\'s quest to unlock</div>';
    } else {
      html += '<div class="build-lock-msg">Unlocked</div>';
    }
    html += '</div>';
    return html;
  }

  function formatClassStats(stats) {
    var parts = [];
    if (stats.attack) parts.push((stats.attack > 0 ? '+' : '') + stats.attack + ' ATK');
    if (stats.defense) parts.push((stats.defense > 0 ? '+' : '') + stats.defense + ' DEF');
    if (stats.dexterity) parts.push('+' + stats.dexterity + ' DEX');
    if (stats.intelligence) parts.push('+' + stats.intelligence + ' INT');
    if (stats.maxHp) parts.push('+' + stats.maxHp + ' Max HP');
    if (stats.maxMp) parts.push('+' + stats.maxMp + ' Max MP');
    return parts.join(', ');
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

  /* ── Training Screen ── */
  function renderTraining() {
    var container = document.getElementById("training-content");
    if (!container) return;
    var p = Player.get();
    if (!p) return;

    var stats = [
      { id: "strength", label: "Strength", desc: "Hit harder in combat.", stat: "attack", icon: "Sword" },
      { id: "defense",  label: "Defense",  desc: "Take less damage.",    stat: "defense", icon: "Shield" },
      { id: "dexterity",label: "Dexterity",desc: "Dodge & crit more.",  stat: "dexterity", icon: "Wind" },
      { id: "charm",    label: "Charm",    desc: "Better social outcomes.", stat: "charm", icon: "Heart" }
    ];
    var done = p.trainingDone || {};

    var html = '<h2>Training Grounds</h2>';
    html += '<p class="flavor">Spend energy and gold to train your body and mind. (2 energy per session)</p>';
    html += '<div class="training-grid">';
    for (var i = 0; i < stats.length; i++) {
      var s = stats[i];
      var trained = done[s.id];
      var cost = Player.getTrainingCost(s.id);
      html += '<div class="training-card">';
      html += '<div class="training-icon">' + s.icon + '</div>';
      html += '<h3>' + s.label + '</h3>';
      html += '<p>' + s.desc + '</p>';
      html += '<div class="training-current">Current: ' + (p[s.stat] || 1) + '</div>';
      html += '<div class="training-cost">Cost: ' + cost + ' gold</div>';
      if (trained) {
        html += '<button class="btn btn-small" disabled>Done Today</button>';
      } else if (p.energy < 2) {
        html += '<button class="btn btn-small" disabled>No Energy</button>';
      } else if (p.gold < cost) {
        html += '<button class="btn btn-small" disabled>Can\'t Afford</button>';
      } else {
        html += '<button class="btn btn-small btn-primary" data-action="train-stat" data-stat="' + s.id + '">Train (2 EP, ' + cost + 'g)</button>';
      }
      html += '</div>';
    }
    html += '</div>';

    html += '<button class="btn" data-action="go-town">Back to Town</button>';
    container.innerHTML = html;
  }

  /* ── Academy Screen ── */
  function renderAcademy() {
    var container = document.getElementById("academy-content");
    if (!container) return;
    var p = Player.get();
    if (!p) return;

    var done = p.trainingDone || {};
    var html = '<h2>Elderbrook Academy</h2>';
    html += '<p class="flavor">Study to sharpen your intellect. (2 energy + gold per session)</p>';
    html += '<div class="academy-grid">';

    // Intelligence training
    var intCost = Player.getTrainingCost('intelligence');
    html += '<div class="training-card">';
    html += '<div class="training-icon">Book</div>';
    html += '<h3>Study Magic</h3>';
    html += '<p>Increase magical potency.</p>';
    html += '<div class="training-current">Intelligence: ' + p.intelligence + '</div>';
    html += '<div class="training-cost">Cost: ' + intCost + ' gold</div>';
    if (done["intelligence"]) {
      html += '<button class="btn btn-small" disabled>Studied Today</button>';
    } else if (p.energy < 2) {
      html += '<button class="btn btn-small" disabled>No Energy</button>';
    } else if (p.gold < intCost) {
      html += '<button class="btn btn-small" disabled>Can\'t Afford</button>';
    } else {
      html += '<button class="btn btn-small btn-primary" data-action="train-stat" data-stat="intelligence">Study (2 EP, ' + intCost + 'g)</button>';
    }
    html += '</div>';

    // Skill Purchase
    var shopSkills = Skills.getShopSkills(p.learnedSkills);
    if (shopSkills.length > 0) {
      html += '<h3>Learn New Skills</h3>';
      html += '<p class="flavor">Purchase skills to add them to your combat repertoire.</p>';
      for (var s = 0; s < shopSkills.length; s++) {
        var sk = shopSkills[s];
        var tierLabel = sk.tier === 1 ? 'Basic' : (sk.tier === 2 ? 'Advanced' : 'Master');
        html += '<div class="training-card">';
        html += '<div class="training-icon">Scroll</div>';
        html += '<h3>' + sk.name + ' <span class="skill-tier">[' + tierLabel + ']</span></h3>';
        html += '<p>' + sk.description + '</p>';
        html += '<div class="training-cost">Cost: ' + sk.cost + ' gold</div>';
        if (p.gold >= sk.cost) {
          html += '<button class="btn btn-small btn-primary" data-action="purchase-skill" data-skill="' + sk.id + '">Learn (' + sk.cost + 'g)</button>';
        } else {
          html += '<button class="btn btn-small" disabled>Can\'t Afford</button>';
        }
        html += '</div>';
      }
    }

    // Quest-locked skills
    var questSkills = Skills.getQuestSkills(p.learnedSkills, p.storyFlags);
    if (questSkills.length > 0) {
      html += '<h3>Special Skills</h3>';
      html += '<p class="flavor">These rare techniques can only be learned by completing special quests.</p>';
      for (var qs = 0; qs < questSkills.length; qs++) {
        var qsk = questSkills[qs];
        html += '<div class="training-card' + (qsk.learned ? '' : ' crafting-unavailable') + '">';
        html += '<div class="training-icon">Star</div>';
        html += '<h3>' + qsk.skill.name + '</h3>';
        if (qsk.learned) {
          html += '<p>' + qsk.skill.description + '</p>';
          html += '<div style="color:#6c6;">Learned</div>';
        } else if (qsk.unlocked) {
          html += '<p>' + qsk.skill.description + '</p>';
          html += '<button class="btn btn-small btn-primary" data-action="learn-quest-skill" data-skill="' + qsk.skill.id + '">Learn</button>';
        } else {
          html += '<p class="locked-text">Complete a special quest to unlock this skill.</p>';
        }
        html += '</div>';
      }
    }

    // Skill Training (train learned skills)
    var learnedList = Skills.getAvailable(p.learnedSkills);
    if (learnedList.length > 0) {
      html += '<h3>Train Skills</h3>';
      html += '<p class="flavor">Pay gold and energy to boost skill proficiency.</p>';
      for (var ts = 0; ts < learnedList.length; ts++) {
        var tsk = learnedList[ts];
        var trainCost = Skills.getTrainCost(tsk.id);
        var prof = Player.getSkillProficiencyStars(tsk.id);
        var stars = '';
        for (var st = 0; st < 5; st++) stars += st < prof ? '\u2605' : '\u2606';
        html += '<div class="training-card">';
        html += '<div class="training-icon">Crossed Swords</div>';
        html += '<h3>' + tsk.name + ' <span class="ledger-skill-stars">' + stars + '</span></h3>';
        html += '<p>' + tsk.description + '</p>';
        html += '<div class="training-cost">Cost: ' + trainCost + ' gold + 1 EP</div>';
        if (prof >= 5) {
          html += '<button class="btn btn-small" disabled>Mastered</button>';
        } else if (p.energy < 1) {
          html += '<button class="btn btn-small" disabled>No Energy</button>';
        } else if (p.gold < trainCost) {
          html += '<button class="btn btn-small" disabled>Can\'t Afford</button>';
        } else {
          html += '<button class="btn btn-small btn-primary" data-action="train-skill" data-skill="' + tsk.id + '">Train (' + trainCost + 'g, 1 EP)</button>';
        }
        html += '</div>';
      }
    }

    html += '</div>';
    html += '<button class="btn" data-action="go-town">Back to Town</button>';
    container.innerHTML = html;
  }

  /* ── Pet Shop ── */
  function renderPetShop(petList) {
    var container = document.getElementById("petshop-content");
    if (!container) return;
    var p = Player.get();
    if (!p) return;
    if (!p.ownedPets) p.ownedPets = [];

    var pets = petList || Pets.getShopPets();
    var isShop = !petList;
    var npc = isShop ? Chapter1.getNPC("fauna") : Chapter1.getNPC("merchant");

    var html = '';

    html += '<h2 style="color:var(--accent);margin-bottom:0.6rem;">' + (isShop ? "Fauna\'s Pet Emporium" : "Merchant Pets") + '</h2>';

    // Active pet display
    if (p.activePet) {
      var active = Pets.get(p.activePet);
      if (active) {
        html += '<div class="pet-active-banner">';
        html += '<img class="pet-mini-portrait" src="' + active.portrait + '" alt="' + active.name + '" onerror="this.style.display=\'none\'">';
        html += '<span>Active companion: <strong>' + active.name + '</strong></span>';
        html += '<button class="btn btn-small" data-action="remove-pet">Dismiss</button>';
        html += '</div>';
      }
    }

    // Owned pets roster
    if (p.ownedPets.length > 0) {
      html += '<h3>Your Companions</h3>';
      html += '<div class="pet-grid">';
      for (var o = 0; o < p.ownedPets.length; o++) {
        var owned = Pets.get(p.ownedPets[o]);
        if (!owned) continue;
        var isActive = p.activePet === owned.id;
        html += '<div class="pet-card' + (isActive ? ' pet-card-active' : '') + '">';
        html += '<img class="pet-portrait" src="' + owned.portrait + '" alt="' + owned.name + '" onerror="this.style.display=\'none\'">';
        html += '<div class="pet-card-info">';
        html += '<div class="pet-name">' + owned.name + (isActive ? ' (Active)' : '') + '</div>';
        html += '<div class="pet-desc">' + owned.description + '</div>';
        if (!isActive) {
          html += '<button class="btn btn-small btn-primary" data-action="set-pet" data-pet="' + owned.id + '">Set Active</button>';
        }
        html += '</div></div>';
      }
      html += '</div>';
    }

    // Pets for sale
    html += '<h3>Pets for Sale</h3>';
    html += '<div class="pet-grid">';
    var anyForSale = false;
    for (var i = 0; i < pets.length; i++) {
      var pet = pets[i];
      if (p.ownedPets.indexOf(pet.id) !== -1) continue;
      anyForSale = true;
      var canAfford = p.gold >= pet.price;
      html += '<div class="pet-card">';
      html += '<img class="pet-portrait" src="' + pet.portrait + '" alt="' + pet.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="pet-card-info">';
      html += '<div class="pet-name">' + pet.name + '</div>';
      html += '<div class="pet-desc">' + pet.description + '</div>';
      html += '<div class="pet-price">' + pet.price + ' gold</div>';
      if (canAfford) {
        html += '<button class="btn btn-small btn-primary" data-action="buy-pet" data-pet="' + pet.id + '">Adopt (' + pet.price + 'g)</button>';
      } else {
        html += '<button class="btn btn-small" disabled>Can\'t Afford</button>';
      }
      html += '</div></div>';
    }
    if (!anyForSale) {
      html += '<p class="flavor">You\'ve adopted all available companions!</p>';
    }
    html += '</div>';
    html += '<button class="btn" data-action="go-petshop-scene">Back</button>';
    container.innerHTML = html;
  }

  /* ══════════════════════════════════════════════════════════════
     LEDGER — Book-style tabbed overlay
     ══════════════════════════════════════════════════════════════ */
  var ledgerTabs = [
    { id: "quests",        label: "Quests" },
    { id: "character",     label: "Character" },
    { id: "stats",         label: "Stats" },
    { id: "skills",        label: "Skills" },
    { id: "bestiary",      label: "Bestiary" },
    { id: "achievements",  label: "Achievements" },
    { id: "relationships", label: "Relations" },
    { id: "settings",      label: "Settings" }
  ];
  var currentLedgerTab = "quests";

  function renderLedger(tab) {
    tab = tab || currentLedgerTab || "quests";
    currentLedgerTab = tab;

    var p = Player.get();
    var isAdmin = p && p.isAdmin;

    // Render tabs
    var tabsEl = document.getElementById("ledger-tabs");
    if (tabsEl) {
      var th = '';
      for (var t = 0; t < ledgerTabs.length; t++) {
        var lt = ledgerTabs[t];
        th += '<button class="ledger-tab' + (lt.id === tab ? ' active' : '') + '" data-action="ledger-tab" data-tab="' + lt.id + '">' + lt.label + '</button>';
      }
      if (isAdmin) {
        th += '<button class="ledger-tab ledger-tab-admin' + (tab === 'admin' ? ' active' : '') + '" data-action="ledger-tab" data-tab="admin">Admin</button>';
      }
      tabsEl.innerHTML = th;
    }

    // Render page content
    var pageEl = document.getElementById("ledger-page");
    if (!pageEl) return;

    var html = '';
    switch (tab) {
      case "quests":        html = renderLedgerQuests(); break;
      case "character":     html = renderLedgerCharacter(); break;
      case "stats":         html = renderLedgerStats(); break;
      case "skills":        html = renderLedgerSkills(); break;
      case "bestiary":      html = renderLedgerBestiary(); break;
      case "achievements":  html = renderLedgerAchievements(); break;
      case "relationships": html = renderLedgerRelationships(); break;
      case "settings":      html = renderLedgerSettings(); break;
      case "admin":         html = isAdmin ? renderLedgerAdmin() : ''; break;
    }
    pageEl.innerHTML = html;
  }

  /* ── Quests Page ── */
  function renderLedgerQuests() {
    var active = Quests.getActive();
    var p = Player.get();
    var tracked = Quests.getTrackedOrNext();
    var trackedId = tracked ? tracked.id : null;
    var html = '<h2>Quest Journal</h2>';

    if (active.length === 0 && (!p || p.completedQuests.length === 0)) {
      html += '<p class="flavor">No quests recorded yet. Visit the Quest Board to find work.</p>';
      return html;
    }

    // Active quests - separate main and side
    var mainQuests = [];
    var sideQuests = [];
    for (var a = 0; a < active.length; a++) {
      if (active[a].type === "main") mainQuests.push(active[a]);
      else sideQuests.push(active[a]);
    }

    if (mainQuests.length > 0) {
      html += '<h3>Main Quests</h3>';
      for (var m = 0; m < mainQuests.length; m++) {
        html += renderLedgerQuestEntry(mainQuests[m], trackedId);
      }
    }
    if (sideQuests.length > 0) {
      html += '<h3>Side Quests</h3>';
      for (var s = 0; s < sideQuests.length; s++) {
        html += renderLedgerQuestEntry(sideQuests[s], trackedId);
      }
    }

    // Completed quests
    if (p && p.completedQuests.length > 0) {
      html += '<h3>Completed Quests</h3>';
      for (var c = 0; c < p.completedQuests.length; c++) {
        var cq = Chapter1.getQuest(p.completedQuests[c]);
        if (cq) {
          html += '<div class="ledger-quest quest-complete">';
          html += '<div class="ledger-quest-name">' + cq.name + '</div>';
          html += '</div>';
        }
      }
    }
    return html;
  }

  function renderLedgerQuestEntry(q, trackedId) {
    var complete = Quests.checkObjectives(q.id);
    var isTracked = q.id === trackedId;
    var html = '<div class="ledger-quest' + (complete ? ' quest-ready' : '') + (isTracked ? ' quest-tracked' : '') + '">';
    html += '<div class="ledger-quest-header">';
    html += '<div class="ledger-quest-name">' + q.name + '<span class="ledger-quest-type"> [' + q.type + ']</span></div>';
    if (isTracked) {
      html += '<span class="ledger-quest-tracking">Tracking</span>';
    } else {
      html += '<button class="ledger-btn-small" data-action="track-quest" data-quest="' + q.id + '">Track</button>';
    }
    html += '</div>';
    html += '<div class="ledger-quest-desc">' + q.description + '</div>';
    for (var j = 0; j < q.objectives.length; j++) {
      var objStatus = Quests.getObjectiveStatus(q.id, j);
      var objDone = isObjectiveDone(q.id, j);
      html += '<div class="ledger-quest-obj' + (objDone ? ' obj-done' : '') + '">' + objStatus + '</div>';
    }
    if (complete) {
      var turnInInfo = Quests.getTurnInInfo(q.id);
      if (turnInInfo) {
        html += '<div class="ledger-quest-turnin">Turn in to ' + turnInInfo.npcName + ' at the ' + turnInInfo.location + '</div>';
      }
      html += '<button class="ledger-btn" data-action="turn-in-quest" data-quest="' + q.id + '">Turn In</button>';
    }
    html += '</div>';
    return html;
  }

  function isObjectiveDone(questId, objIndex) {
    var def = Chapter1.getQuest(questId);
    if (!def || !def.objectives[objIndex]) return false;
    var obj = def.objectives[objIndex];
    if (obj.type === "kill") {
      var p = Player.get();
      var progress = (p.questProgress[questId] && p.questProgress[questId][obj.id]) || 0;
      return progress >= obj.required;
    } else if (obj.type === "collect") {
      return Player.countItem(obj.item) >= obj.required;
    } else if (obj.type === "flag") {
      return Player.hasFlag(obj.flag);
    }
    return false;
  }

  /* ── Character Page ── */
  function renderLedgerCharacter() {
    var p = Player.get();
    if (!p) return '<p>No character data.</p>';

    var html = '<h2>Character Sheet</h2>';
    var className = p.buildClass && Player.CLASS_DEFS[p.buildClass] ? Player.CLASS_DEFS[p.buildClass].name : '';
    html += '<h3>' + p.name + (className ? ' &mdash; ' + className : '') + '</h3>';

    // Core stats
    html += '<div class="ledger-stats-grid">';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Level</span><span class="ledger-stat-value">' + p.level + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">XP</span><span class="ledger-stat-value">' + p.xp + ' / ' + p.xpToNext + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">HP</span><span class="ledger-stat-value">' + p.hp + ' / ' + p.maxHp + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">MP</span><span class="ledger-stat-value">' + p.mp + ' / ' + p.maxMp + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Attack</span><span class="ledger-stat-value">' + p.attack + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Defense</span><span class="ledger-stat-value">' + p.defense + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Dexterity</span><span class="ledger-stat-value">' + p.dexterity + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Intelligence</span><span class="ledger-stat-value">' + p.intelligence + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Charm</span><span class="ledger-stat-value">' + (p.charm || 1) + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Gold</span><span class="ledger-stat-value">' + p.gold + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Difficulty</span><span class="ledger-stat-value">' + (p.difficulty || 'normal') + '</span></div>';
    html += '<div class="ledger-stat"><span class="ledger-stat-label">Day</span><span class="ledger-stat-value">' + (p.day || 1) + '</span></div>';
    html += '</div>';

    // Stat allocation
    if (p.unspentPoints > 0) {
      html += '<div class="ledger-alloc">';
      html += '<h3>Unspent Points: ' + p.unspentPoints + '</h3>';
      html += '<div class="ledger-alloc-btns">';
      var stats = ["maxHp", "maxMp", "attack", "defense", "dexterity", "intelligence"];
      var labels = { maxHp: "+5 Max HP", maxMp: "+3 Max MP", attack: "+1 ATK", defense: "+1 DEF", dexterity: "+1 DEX", intelligence: "+1 INT" };
      for (var i = 0; i < stats.length; i++) {
        html += '<button class="ledger-btn" data-action="allocate-stat" data-stat="' + stats[i] + '">' + labels[stats[i]] + '</button>';
      }
      html += '</div></div>';
    }

    // Skills
    var skills = Skills.getAvailable(p.learnedSkills);
    if (skills.length > 0) {
      html += '<h3>Known Skills</h3>';
      for (var s = 0; s < skills.length; s++) {
        var prof = Player.getSkillProficiencyStars(skills[s].id);
        var stars = '';
        for (var st = 0; st < 5; st++) {
          stars += st < prof ? '\u2605' : '\u2606';
        }
        html += '<div class="ledger-skill">' + skills[s].name + ' <span class="ledger-skill-stars">' + stars + '</span> &mdash; ' + skills[s].description + ' (MP: ' + skills[s].mpCost + ')</div>';
      }
    }

    // Set bonuses
    var setBonuses = Player.getEquippedSetBonuses();
    if (setBonuses.length > 0) {
      html += '<h3>Set Bonuses</h3>';
      for (var sb = 0; sb < setBonuses.length; sb++) {
        html += '<p>' + setBonuses[sb].setId + ' (' + setBonuses[sb].count + ' pieces)</p>';
      }
    }

    return html;
  }

  /* ── Stats Guide Page ── */
  function renderLedgerStats() {
    var p = Player.get();
    if (!p) return '<p>No data.</p>';

    var statGuide = [
      { label: "Attack", value: p.attack, desc: "Determines physical damage dealt. Higher attack means stronger normal attacks and attack-type skills." },
      { label: "Defense", value: p.defense, desc: "Reduces incoming physical damage. Each point of defense subtracts from enemy attack rolls." },
      { label: "Dexterity", value: p.dexterity, desc: "Improves accuracy, critical hit chance, dodge chance, and escape success. Each point increases hit chance by 2%, crit chance by 2%, and passive dodge by 1.5%." },
      { label: "Intelligence", value: p.intelligence, desc: "Powers magic-type skills like Arcane Bolt. Higher intelligence deals more spell damage." },
      { label: "Charm", value: p.charm || 1, desc: "Influences social outcomes and NPC interactions. Improved through training." },
      { label: "Max HP", value: p.maxHp, desc: "Your total health pool. Reaching 0 HP means defeat. Increased by leveling, equipment, and stat allocation." },
      { label: "Max MP", value: p.maxMp, desc: "Your mana pool for using skills. Skills consume MP on use. Restored by mana potions, the Meditate skill, or resting." },
      { label: "Energy", value: p.energy + "/" + p.maxEnergy, desc: "Spent when exploring, gathering, or training (2 per action). Restored fully by sleeping at the inn." }
    ];

    var html = '<h2>Stats Guide</h2>';
    html += '<p class="flavor">Understanding your attributes and how they affect combat and exploration.</p>';

    for (var i = 0; i < statGuide.length; i++) {
      var s = statGuide[i];
      html += '<div class="ledger-stat-guide">';
      html += '<div class="ledger-stat-guide-header"><span class="ledger-stat-guide-name">' + s.label + '</span><span class="ledger-stat-guide-val">' + s.value + '</span></div>';
      html += '<div class="ledger-stat-guide-desc">' + s.desc + '</div>';
      html += '</div>';
    }

    html += '<h3>Combat Mechanics</h3>';
    html += '<div class="ledger-stat-guide"><div class="ledger-stat-guide-header"><span class="ledger-stat-guide-name">Accuracy</span></div>';
    html += '<div class="ledger-stat-guide-desc">Base hit chance is 75%. Each point of Dexterity adds 2% accuracy (capped at 98%). Missing an attack wastes your turn.</div></div>';
    html += '<div class="ledger-stat-guide"><div class="ledger-stat-guide-header"><span class="ledger-stat-guide-name">Critical Hits</span></div>';
    html += '<div class="ledger-stat-guide-desc">Base crit chance is 5%. Each point of Dexterity adds 2%. Critical hits deal 1.5x damage.</div></div>';
    html += '<div class="ledger-stat-guide"><div class="ledger-stat-guide-header"><span class="ledger-stat-guide-name">Dodge</span></div>';
    html += '<div class="ledger-stat-guide-desc">Passive dodge chance is Dexterity x 1.5%. The Quick Dodge skill adds a large temporary evasion boost on top of this.</div></div>';
    html += '<div class="ledger-stat-guide"><div class="ledger-stat-guide-header"><span class="ledger-stat-guide-name">Enemy Accuracy</span></div>';
    html += '<div class="ledger-stat-guide-desc">Enemies also have a chance to miss based on their stats. Weaker enemies miss more often. Stronger enemies are more precise.</div></div>';

    return html;
  }

  /* ── Skills Guide Page ── */
  function renderLedgerSkills() {
    var p = Player.get();
    if (!p) return '<p>No data.</p>';

    var allSkills = Skills.getAll();
    var html = '<h2>Skills Compendium</h2>';
    html += '<p class="flavor">Skills are learned at the Academy for gold, or unlocked through special quests. Train them to increase proficiency.</p>';

    var typeLabels = { attack: "Attack", buff: "Buff", heal: "Heal", magic: "Magic" };
    var tierLabels = { 1: "Basic", 2: "Advanced", 3: "Master" };

    for (var i = 0; i < allSkills.length; i++) {
      var sk = allSkills[i];
      var known = Player.hasSkill(sk.id);
      var prof = known ? Player.getSkillProficiencyStars(sk.id) : 0;
      var stars = '';
      for (var st = 0; st < 5; st++) stars += st < prof ? '\u2605' : '\u2606';

      html += '<div class="ledger-skill-card' + (known ? '' : ' ledger-skill-locked') + '">';
      html += '<div class="ledger-skill-header">';
      html += '<span class="ledger-skill-name">' + sk.name + '</span>';
      html += '<span class="ledger-skill-type">[' + (typeLabels[sk.type] || sk.type) + '] [' + (tierLabels[sk.tier] || 'Tier ' + sk.tier) + ']</span>';
      html += '</div>';

      if (known) {
        html += '<div class="ledger-skill-stars">' + stars + '</div>';
        html += '<div class="ledger-skill-desc">' + sk.description + '</div>';
        html += '<div class="ledger-skill-details">';
        html += '<span>MP Cost: ' + sk.mpCost + '</span>';
        if (sk.damageMultiplier) html += '<span>Damage: ' + sk.damageMultiplier + 'x</span>';
        if (sk.healAmount) html += '<span>Heal: ' + sk.healAmount + ' HP</span>';
        if (sk.manaRestore) html += '<span>Restore: ' + sk.manaRestore + ' MP</span>';
        if (sk.buffType) html += '<span>Buff: ' + sk.buffType + ' +' + sk.buffAmount + ' (' + sk.buffDuration + ' turns)</span>';
        if (sk.hits) html += '<span>Hits: ' + sk.hits + 'x</span>';
        if (sk.intScaling) html += '<span>Scales with Intelligence</span>';
        if (sk.appliesEffect) html += '<span>Effect: ' + sk.appliesEffect.type + (sk.appliesEffect.chance ? ' (' + Math.round(sk.appliesEffect.chance * 100) + '% chance)' : '') + '</span>';
        html += '</div>';
        html += '<div class="ledger-skill-tip">';
        if (sk.type === 'attack') html += 'Proficiency increases damage. Use often or train at the Academy.';
        else if (sk.type === 'magic') html += 'Scales with Intelligence instead of Attack. Train at the Academy for faster mastery.';
        else if (sk.type === 'heal') html += 'Healing scales with proficiency. Train to improve recovery.';
        else if (sk.type === 'buff') html += 'Activate before attacking for maximum effect.';
        html += '</div>';
      } else {
        if (sk.questLocked) {
          html += '<div class="ledger-skill-desc locked-text">Unlocked by completing a special quest.</div>';
        } else {
          html += '<div class="ledger-skill-desc locked-text">Available at the Academy for ' + sk.cost + ' gold.</div>';
        }
      }

      html += '</div>';
    }

    return html;
  }

  /* ── Bestiary Page (progressive knowledge) ── */
  function renderLedgerBestiary() {
    var p = Player.get();
    if (!p) return '<p>No data.</p>';

    var bKeys = Object.keys(p.bestiary || {});
    var html = '<h2>Bestiary</h2>';
    html += '<p class="flavor">Creatures discovered: ' + bKeys.length + '. Defeat enemies repeatedly to learn more about them.</p>';

    if (bKeys.length === 0) {
      html += '<p>No creatures encountered yet. Venture out and fight to fill your bestiary.</p>';
      return html;
    }

    // Knowledge tiers: 1+=name, 3+=hp/atk, 5+=def/abilities, 10+=loot
    for (var b = 0; b < bKeys.length; b++) {
      var en = Enemies.get(bKeys[b]);
      var kills = p.bestiary[bKeys[b]];
      if (!en) continue;

      var tier = kills >= 10 ? 4 : kills >= 5 ? 3 : kills >= 3 ? 2 : 1;
      var tierLabels = ["Sighted", "Studied", "Known", "Mastered"];
      var tierLabel = tierLabels[tier - 1];

      html += '<div class="ledger-creature-card">';
      html += '<div class="ledger-creature-header">';
      if (en.portrait) html += '<img class="ledger-creature-portrait" src="' + en.portrait + '" alt="' + en.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="ledger-creature-title">';
      html += '<span class="ledger-creature-name">' + en.name + (en.isBoss ? ' (BOSS)' : '') + '</span>';
      html += '<span class="ledger-creature-tier bestiary-tier-' + tier + '">' + tierLabel + '</span>';
      html += '</div>';
      html += '<span class="ledger-creature-kills">Defeated: ' + kills + '</span>';
      html += '</div>';

      // Tier 1: just name and kill count (already shown above)

      // Tier 2 (3+ kills): HP and Attack
      if (tier >= 2) {
        html += '<div class="ledger-creature-stats">';
        html += '<span>HP: ' + en.hp + '</span>';
        html += '<span>ATK: ' + en.attack + '</span>';
        if (tier < 3) html += '<span>DEF: ???</span>';
        html += '</div>';
      } else {
        html += '<div class="ledger-creature-stats locked-text">Defeat ' + (3 - kills) + ' more to learn basic stats...</div>';
      }

      // Tier 3 (5+ kills): Defense and abilities
      if (tier >= 3) {
        html += '<div class="ledger-creature-stats">';
        if (tier < 4) html += '<span>HP: ' + en.hp + '</span><span>ATK: ' + en.attack + '</span>';
        html += '<span>DEF: ' + en.defense + '</span>';
        html += '<span>XP: ' + en.xp + '</span>';
        html += '</div>';
        if (en.abilities && en.abilities.length > 0) {
          html += '<div class="ledger-creature-abilities"><strong>Abilities:</strong> ';
          var abNames = [];
          for (var a = 0; a < en.abilities.length; a++) {
            var abText = en.abilities[a].name;
            if (tier >= 4 && en.abilities[a].effect) abText += ' (' + en.abilities[a].effect.type + ')';
            abNames.push(abText);
          }
          html += abNames.join(', ');
          html += '</div>';
        } else {
          html += '<div class="ledger-creature-abilities"><em>No special abilities</em></div>';
        }
      } else if (tier >= 2) {
        html += '<div class="ledger-creature-stats locked-text">Defeat ' + (5 - kills) + ' more to learn abilities...</div>';
      }

      // Tier 4 (10+ kills): Loot table and boss phases
      if (tier >= 4) {
        if (en.loot && en.loot.length > 0) {
          html += '<div class="ledger-creature-loot"><strong>Known Drops:</strong> ';
          var lootNames = [];
          for (var l = 0; l < en.loot.length; l++) {
            var lootItem = Items.get(en.loot[l].id);
            if (lootItem) lootNames.push(lootItem.name);
          }
          html += lootNames.join(', ');
          html += '</div>';
        }
        if (en.phases && en.phases.length > 0) {
          html += '<div class="ledger-creature-phases"><strong>Battle Phases:</strong>';
          for (var ph = 0; ph < en.phases.length; ph++) {
            html += '<div class="ledger-phase">' + en.phases[ph].name + ' (at ' + Math.round(en.phases[ph].threshold * 100) + '% HP)</div>';
          }
          html += '</div>';
        }
      } else if (tier >= 3) {
        html += '<div class="ledger-creature-stats locked-text">Defeat ' + (10 - kills) + ' more to learn drop table...</div>';
      }

      // Progress bar to next tier
      var nextTierKills = tier === 1 ? 3 : tier === 2 ? 5 : tier === 3 ? 10 : 0;
      if (nextTierKills > 0) {
        var prevTier = tier === 1 ? 1 : tier === 2 ? 3 : 5;
        var pct = Math.max(0, Math.min(100, Math.round(((kills - prevTier) / (nextTierKills - prevTier)) * 100)));
        html += '<div class="ledger-creature-progress"><div class="ledger-creature-progress-fill" style="width:' + pct + '%"></div></div>';
      }

      html += '</div>';
    }
    return html;
  }

  /* ── Achievements Page ── */
  function renderLedgerAchievements() {
    var p = Player.get();
    var allAch = Chapter1.getAchievements();

    var html = '<h2>Achievements</h2>';

    var unlocked = 0;
    for (var i = 0; i < allAch.length; i++) {
      if (p && p.achievements && p.achievements.indexOf(allAch[i].id) !== -1) unlocked++;
    }
    html += '<p class="flavor">' + unlocked + ' of ' + allAch.length + ' unlocked</p>';

    for (var i = 0; i < allAch.length; i++) {
      var a = allAch[i];
      var isUnlocked = p && p.achievements && p.achievements.indexOf(a.id) !== -1;
      html += '<div class="ledger-ach ' + (isUnlocked ? 'unlocked' : 'locked') + '">';
      html += '<div class="ledger-ach-name">' + a.name + '</div>';
      html += '<div class="ledger-ach-desc">' + a.description + '</div>';
      html += '</div>';
    }
    return html;
  }

  /* ── Relationships Page ── */
  function renderLedgerRelationships() {
    var p = Player.get();
    if (!p || !p.relationships) return '<h2>Relationships</h2><p class="flavor">No relationships yet.</p>';

    var npcs = Relationships.getDateableNPCs();
    var html = '<h2>Relationships</h2>';

    for (var i = 0; i < npcs.length; i++) {
      var npcId = npcs[i];
      var cfg = Relationships.getConfig(npcId);
      var rel = p.relationships[npcId];
      if (!cfg || !rel) continue;

      var levelName = Relationships.getLevelName(rel.affinity);
      var pct = Math.min(100, Math.floor((rel.affinity / Relationships.MAX_AFFINITY) * 100));
      var isPartner = rel.affinity >= 75 && Player.hasFlag(npcId + "Romantic");

      html += '<div class="ledger-rel">';
      html += '<img class="ledger-rel-portrait" src="' + cfg.portrait + '" alt="' + cfg.name + '" onerror="this.style.display=\'none\'">';
      html += '<div class="ledger-rel-info">';
      html += '<div class="ledger-rel-name">' + cfg.name + (isPartner ? ' (Partner)' : '') + '</div>';
      html += '<div class="ledger-rel-level">' + levelName + ' &mdash; ' + rel.affinity + '/' + Relationships.MAX_AFFINITY + '</div>';
      html += '<div class="ledger-rel-bar"><div class="ledger-rel-fill" style="width:' + pct + '%"></div>';
      // Milestone markers at 15, 35, 55, 75
      var milestones = [15, 35, 55, 75];
      var milestoneNames = ['Acquaintance', 'Friend', 'Close Friend', 'Devoted'];
      for (var m = 0; m < milestones.length; m++) {
        var mPct = Math.floor((milestones[m] / Relationships.MAX_AFFINITY) * 100);
        var reached = rel.affinity >= milestones[m] ? ' reached' : '';
        html += '<div class="rel-milestone-marker' + reached + '" style="left:' + mPct + '%" title="' + milestoneNames[m] + ' (' + milestones[m] + ')"></div>';
      }
      html += '</div>';
      // Next milestone hint
      var nextMilestone = null;
      for (var nm = 0; nm < milestones.length; nm++) {
        if (rel.affinity < milestones[nm]) { nextMilestone = nm; break; }
      }
      if (nextMilestone !== null) {
        html += '<div class="ledger-rel-next">Next: ' + milestoneNames[nextMilestone] + ' at ' + milestones[nextMilestone] + '</div>';
      }
      html += '</div></div>';
    }
    return html;
  }

  /* ── Settings Page ── */
  function renderLedgerSettings() {
    var p = Player.get();
    var settings = (p && p.settings) || { textSpeed: 'normal', soundEnabled: true };

    var html = '<h2>Settings</h2>';

    // Text speed
    html += '<div class="ledger-setting">';
    html += '<span class="ledger-setting-label">Text Speed</span>';
    html += '<div class="ledger-setting-options">';
    var speeds = ['slow', 'normal', 'fast', 'instant'];
    for (var i = 0; i < speeds.length; i++) {
      var sel = settings.textSpeed === speeds[i] ? ' active' : '';
      html += '<button class="ledger-btn' + sel + '" data-action="set-text-speed" data-speed="' + speeds[i] + '">' + speeds[i].charAt(0).toUpperCase() + speeds[i].slice(1) + '</button>';
    }
    html += '</div></div>';

    // Sound
    html += '<div class="ledger-setting">';
    html += '<span class="ledger-setting-label">Sound</span>';
    html += '<div class="ledger-setting-options">';
    html += '<button class="ledger-btn' + (Audio.isEnabled() ? ' active' : '') + '" data-action="set-sound" data-sound="on">On</button>';
    html += '<button class="ledger-btn' + (!Audio.isEnabled() ? ' active' : '') + '" data-action="set-sound" data-sound="off">Off</button>';
    html += '</div></div>';

    // Difficulty
    html += '<div class="ledger-setting">';
    html += '<span class="ledger-setting-label">Difficulty</span>';
    html += '<div class="ledger-setting-options">';
    var diffs = ['easy', 'normal', 'hard'];
    var diffLabels = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
    for (var d = 0; d < diffs.length; d++) {
      var dsel = (p && p.difficulty) === diffs[d] ? ' active' : '';
      html += '<button class="ledger-btn' + dsel + '" data-action="set-difficulty" data-difficulty="' + diffs[d] + '">' + diffLabels[diffs[d]] + '</button>';
    }
    html += '</div></div>';

    // Save/Load
    html += '<h3>Game Data</h3>';
    html += '<div style="display:flex;gap:0.5rem;margin-top:0.4rem;">';
    html += '<button class="ledger-btn" data-action="save-game">Save Game</button>';
    html += '<button class="ledger-btn" data-action="load-game-menu">Load Game</button>';
    html += '</div>';

    return html;
  }

  /* ── Admin Panel ── */
  function renderLedgerAdmin() {
    var p = Player.get();
    if (!p || !p.isAdmin) return '<p>Access denied.</p>';

    var html = '<h2 class="ledger-section-title">Admin Controls</h2>';

    // Player Stats
    html += '<div class="admin-section">';
    html += '<h3>Player Stats</h3>';
    html += '<div class="admin-row">';
    html += '<label>Level: <strong>' + p.level + '</strong></label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-levels" data-val="1">+1 Lv</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-levels" data-val="5">+5 Lv</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-levels" data-val="10">+10 Lv</button>';
    html += '</div>';
    html += '<div class="admin-row">';
    html += '<label>Gold: <strong>' + p.gold + '</strong></label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-gold" data-val="100">+100g</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-gold" data-val="1000">+1000g</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-gold" data-val="10000">+10000g</button>';
    html += '</div>';
    html += '<div class="admin-row">';
    html += '<label>HP: ' + p.hp + '/' + p.maxHp + ' | MP: ' + p.mp + '/' + p.maxMp + '</label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="full-heal">Full Heal</button>';
    html += '</div>';
    html += '<div class="admin-row">';
    html += '<label>XP: ' + p.xp + '/' + p.xpToNext + '</label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-xp" data-val="100">+100 XP</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-xp" data-val="1000">+1000 XP</button>';
    html += '</div>';
    html += '<div class="admin-row">';
    html += '<label>Stat Points: <strong>' + p.unspentPoints + '</strong></label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-points" data-val="5">+5 pts</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="add-points" data-val="20">+20 pts</button>';
    html += '</div>';
    html += '<div class="admin-row">';
    html += '<label>Energy: ' + p.energy + '/' + p.maxEnergy + '</label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="full-energy">Max Energy</button>';
    html += '</div>';
    html += '</div>';

    // Classes
    html += '<div class="admin-section">';
    html += '<h3>Unlock All Classes</h3>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="unlock-all-classes">Unlock All</button>';
    html += '</div>';

    // Skills
    html += '<div class="admin-section">';
    html += '<h3>Learn All Skills</h3>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="learn-all-skills">Learn All</button>';
    html += '</div>';

    // Items
    html += '<div class="admin-section">';
    html += '<h3>Add Items</h3>';
    html += '<div class="admin-item-grid">';
    var allItems = Items.getAll();
    for (var iid in allItems) {
      if (allItems.hasOwnProperty(iid)) {
        var itm = allItems[iid];
        html += '<button class="btn btn-small admin-item-btn" data-action="admin-cmd" data-cmd="add-item" data-val="' + iid + '" title="' + (itm.description || '') + '">' + itm.name + '</button>';
      }
    }
    html += '</div>';
    html += '</div>';

    // Story Flags
    html += '<div class="admin-section">';
    html += '<h3>Story Flags</h3>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="complete-all-quests">Complete All Quests</button>';
    html += '<div class="admin-flags">';
    if (p.storyFlags) {
      var flagKeys = Object.keys(p.storyFlags);
      for (var f = 0; f < flagKeys.length; f++) {
        var fk = flagKeys[f];
        var fv = p.storyFlags[fk];
        html += '<div class="admin-flag">';
        html += '<span class="admin-flag-name">' + fk + '</span>';
        html += '<button class="btn btn-small ' + (fv ? 'btn-active' : '') + '" data-action="admin-cmd" data-cmd="toggle-flag" data-val="' + fk + '">' + (fv ? 'ON' : 'OFF') + '</button>';
        html += '</div>';
      }
    }
    html += '</div>';
    html += '</div>';

    // Teleport
    html += '<div class="admin-section">';
    html += '<h3>Teleport</h3>';
    html += '<div class="admin-row">';
    var areas = ["elderbrook", "forest-edge", "deep-woods", "goblin-territory"];
    for (var a = 0; a < areas.length; a++) {
      html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="teleport" data-val="' + areas[a] + '">' + areas[a] + '</button>';
    }
    html += '</div>';
    html += '</div>';

    // Day/Time
    html += '<div class="admin-section">';
    html += '<h3>Time</h3>';
    html += '<div class="admin-row">';
    html += '<label>Day: ' + p.day + ' | Season: ' + p.season + '</label>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="advance-day">+1 Day</button>';
    html += '<button class="btn btn-small" data-action="admin-cmd" data-cmd="advance-day" data-val="7">+7 Days</button>';
    html += '</div>';
    html += '</div>';

    return html;
  }

  return {
    showScreen: showScreen,
    setDialogueBackground: setDialogueBackground,
    getScreen: getScreen,
    getPreviousScreen: getPreviousScreen,
    updateHeader: updateHeader,
    updateSidebars: updateSidebars,
    renderCharacter: renderCharacter,
    renderQuestLog: renderQuestLog,
    renderQuestBoard: renderQuestBoard,
    renderWorldMap: renderWorldMap,
    renderTown: renderTown,
    renderChapterEnd: renderChapterEnd,
    renderRelationships: renderRelationships,
    renderNPCMenu: renderNPCMenu,
    renderGiftSelect: renderGiftSelect,
    renderSettings: renderSettings,
    renderAchievements: renderAchievements,
    renderBestiary: renderBestiary,
    renderBuildSelect: renderBuildSelect,
    renderSaveSlots: renderSaveSlots,
    renderDifficultySelect: renderDifficultySelect,
    renderTraining: renderTraining,
    renderAcademy: renderAcademy,
    renderPetShop: renderPetShop,
    renderLedger: renderLedger,
    showMessage: showMessage,
    showSeasonBanner: showSeasonBanner
  };
})();
