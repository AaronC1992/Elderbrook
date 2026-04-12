/* main.js - Entry point and event wiring */
(function () {

  /* ── Intro Lore Sequence ── */
  var introPages = [
    {
      html: '<h3>The World of Elderbrook</h3>' +
        '<p>For centuries, the kingdom of Astenmere thrived under the protection of the Wardstones, ancient pillars of magic that kept the wilds at bay and the roads safe for travelers.</p>' +
        '<p>But the Wardstones have been fading. One by one, their light dims, and the creatures of the deep forest grow bolder.</p>' +
        '<p class="intro-dim">No one knows why. No one knows how to stop it.</p>'
    },
    {
      html: '<h3>The Village</h3>' +
        '<p>Elderbrook sits on the eastern frontier, a small village at the edge of civilization. Once a quiet trading post, it now stands as the first line of defense against the growing goblin threat.</p>' +
        '<p>The Adventurers Guild, led by Guildmaster Rowan, has put out a call for anyone brave enough to help.</p>' +
        '<p class="intro-accent">Mercenaries, drifters, dreamers, the desperate... all are welcome.</p>'
    },
    {
      html: '<h3>Your Story</h3>' +
        '<p>You arrived in Elderbrook three days ago with little more than the clothes on your back and a weapon at your side.</p>' +
        '<p>Whether you came seeking coin, glory, or simply a place to belong, you were drawn here by the same rumor everyone else heard:</p>' +
        '<p class="intro-accent">The goblins are organized. Something is commanding them. And Elderbrook needs heroes.</p>' +
        '<p class="intro-dim">Today, your story begins.</p>'
    }
  ];
  var introPageIndex = 0;
  var introTimer = null;

  function showIntroPage(idx) {
    var textEl = document.getElementById("intro-text");
    var continueBtn = document.getElementById("intro-continue-btn");
    if (!textEl) return;

    // Fade out
    textEl.classList.remove("visible");
    if (continueBtn) continueBtn.style.display = "none";

    setTimeout(function () {
      if (idx >= introPages.length) {
        finishIntro();
        return;
      }
      textEl.innerHTML = introPages[idx].html;
      // Fade in
      textEl.classList.add("visible");

      // Narrate intro page
      if (typeof Voice !== 'undefined' && Voice.isEnabled()) {
        var tmp = document.createElement('div');
        tmp.innerHTML = introPages[idx].html;
        var plainText = tmp.textContent || tmp.innerText || '';
        Voice.speak(plainText, 'Narrator');
      }

      // Show continue after a short reading delay
      introTimer = setTimeout(function () {
        if (continueBtn) {
          continueBtn.style.display = "";
          continueBtn.textContent = (idx >= introPages.length - 1) ? "Enter Elderbrook" : "Continue";
        }
      }, 2000);
    }, 500);
  }

  function finishIntro() {
    if (introTimer) { clearTimeout(introTimer); introTimer = null; }
    if (typeof Voice !== 'undefined') Voice.stop();
    var gc = document.getElementById("game-container");
    if (gc) gc.classList.remove("mode-menu");
    World.navigate("elderbrook");
  }

  /* ── Character Creation ── */
  var createForm = document.getElementById("create-form");
  var genderBtns = document.querySelectorAll(".gender-btn");
  var weaponBtns = document.querySelectorAll(".weapon-btn");
  var selectedGender = "male";
  var selectedWeapon = "basic-sword";

  // Gender selection
  for (var g = 0; g < genderBtns.length; g++) {
    genderBtns[g].addEventListener("click", function () {
      selectedGender = this.getAttribute("data-gender");
      for (var i = 0; i < genderBtns.length; i++) genderBtns[i].classList.remove("selected");
      this.classList.add("selected");
    });
  }

  // Weapon selection
  for (var w = 0; w < weaponBtns.length; w++) {
    weaponBtns[w].addEventListener("click", function () {
      selectedWeapon = this.getAttribute("data-weapon");
      for (var i = 0; i < weaponBtns.length; i++) weaponBtns[i].classList.remove("selected");
      this.classList.add("selected");
    });
  }

  // Form submit
  if (createForm) {
    createForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = document.getElementById("char-name");
      var name = nameInput ? nameInput.value.trim() : "";
      if (!name || name.length < 1 || name.length > 20) {
        UI.showMessage("Enter a name (1-20 characters).");
        return;
      }
      Player.create(name, selectedGender, selectedWeapon);
      // Admin mode check
      if (name.toLowerCase() === "admin") {
        var ap = Player.get();
        if (ap) ap.isAdmin = true;
      }
      Audio.play("buttonClick");
      // Show lore intro instead of jumping straight to town
      introPageIndex = 0;
      UI.showScreen("intro");
      showIntroPage(0);
    });
  }

  /* ── Delegated Click Handler ── */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");

    // Global button click feedback
    if (!btn.disabled) {
      Audio.play("buttonClick");
    }
    switch (action) {
      /* ── Title Screen ── */
      case "new-game":
        UI.showScreen("create");
        break;
      case "continue-game":
        UI.renderSaveSlots('load');
        UI.showScreen('save-select');
        break;
      case "intro-continue":
        if (typeof Voice !== 'undefined') Voice.stop();
        introPageIndex++;
        showIntroPage(introPageIndex);
        break;
      case "intro-skip":
        if (typeof Voice !== 'undefined') Voice.stop();
        finishIntro();
        break;

      /* ── Navigation ── */
      case "go-town":
        World.navigate("elderbrook");
        break;
      case "go-guild":
        World.visitGuild();
        break;
      case "go-shop":
        World.visitShop(btn.getAttribute("data-shop"));
        break;
      case "go-questboard":
        World.visitQuestBoard();
        break;
      case "go-inn":
        World.enterInn();
        break;
      case "talk-to-innkeeper":
        World.talkToInnkeeper();
        break;
      case "inn-rest":
        World.restAtInn();
        break;
      case "inn-menu-back":
        UI.renderInn();
        break;
      case "inn-back":
        UI.showScreen("town");
        UI.renderTown();
        break;
      case "go-elric":
        World.enterGuardPost();
        break;
      case "talk-to-elric":
        World.talkToElric();
        break;
      case "guardpost-back":
        UI.showScreen("town");
        UI.renderTown();
        break;
      case "go-elira":
        World.visitElira();
        break;
      case "interact-event":
        World.interactEvent(btn.getAttribute("data-event"));
        break;
      case "check-on-child":
        World.checkOnChild();
        break;
      case "find-biscuit":
        World.findBiscuit();
        break;
      case "return-biscuit":
        World.returnBiscuit();
        break;
      case "go-petshop":
        World.visitPetShop();
        break;
      case "petshop-scene-interact":
        World.openPetShopNPCMenu();
        break;
      case "npc-petshop":
        World.openPetShopInventory();
        break;
      case "go-petshop-scene":
        World.visitPetShop();
        break;
      case "buy-pet":
        var buyPetResult = Player.buyPet(btn.getAttribute("data-pet"));
        UI.showMessage(buyPetResult.message);
        UI.renderPetShop();
        UI.updateHeader();
        break;
      case "set-pet":
        Player.setPet(btn.getAttribute("data-pet"));
        UI.renderPetShop();
        UI.updateSidebars();
        break;
      case "remove-pet":
        Player.removePet();
        UI.renderPetShop();
        UI.updateSidebars();
        break;
      case "merchant-pets":
        UI.renderPetShop(Pets.getMerchantPets());
        UI.showScreen("petshop");
        break;
      case "go-worldmap":
        UI.renderWorldMap();
        UI.showScreen("worldmap");
        break;
      case "travel":
        World.navigate(btn.getAttribute("data-location"));
        break;

      /* ── Node Exploration ── */
      case "explore-fight":
        Exploration.fightEnemy(btn.getAttribute("data-enemy"), parseInt(btn.getAttribute("data-idx"), 10));
        break;
      case "explore-move":
        Exploration.moveToNode(btn.getAttribute("data-dir"));
        break;
      case "explore-open-chest":
        Exploration.openChest();
        break;
      case "explore-gather":
        Exploration.gatherAtNode();
        break;
      case "explore-return-map":
        Exploration.returnToMap();
        break;

      /* ── Shop ── */
      case "buy":
        var buyResult = Shops.buy(btn.getAttribute("data-shop"), btn.getAttribute("data-item"));
        UI.showMessage(buyResult.message);
        Shops.renderShop(btn.getAttribute("data-shop"));
        UI.updateHeader();
        break;
      case "sell-item":
        var sellResult = Shops.sell(btn.getAttribute("data-item"));
        UI.showMessage(sellResult.message);
        Inventory.render();
        UI.updateHeader();
        break;

      /* ── Inventory ── */
      case "equip":
        Player.equip(btn.getAttribute("data-item"));
        Audio.play("buttonClick");
        Inventory.render();
        UI.updateHeader();
        break;
      case "unequip":
        Player.unequip(btn.getAttribute("data-slot"));
        Audio.play("buttonClick");
        Inventory.render();
        UI.updateHeader();
        break;
      case "use-item":
        var useResult = Inventory.useItem(btn.getAttribute("data-item"));
        UI.showMessage(useResult.message);
        Inventory.render();
        UI.updateHeader();
        break;
      case "inv-filter":
        Inventory.setFilter(btn.getAttribute("data-filter"));
        break;

      /* ── Character / Ledger ── */
      case "open-ledger":
        UI.renderLedger();
        UI.showScreen("ledger");
        break;
      case "open-character":
        UI.renderLedger("character");
        UI.showScreen("ledger");
        break;
      case "open-inventory":
        Inventory.render();
        UI.showScreen("inventory");
        break;
      case "open-quests":
        UI.renderLedger("quests");
        UI.showScreen("ledger");
        break;
      case "allocate-stat":
        Player.allocateStat(btn.getAttribute("data-stat"));
        Audio.play("buttonClick");
        if (UI.getScreen() === 'ledger') UI.renderLedger('character');
        else UI.renderCharacter();
        UI.updateHeader();
        break;
      case "close-overlay":
        var prev = UI.getPreviousScreen();
        if (prev) {
          UI.showScreen(prev);
          if (prev === "town") UI.renderTown();
        } else {
          World.navigate(Player.get().currentArea || "elderbrook");
        }
        break;

      /* ── Battle ── */
      case "battle-attack":
        Battle.playerAttack();
        break;
      case "battle-skill":
        Battle.playerUseSkill(btn.getAttribute("data-skill"));
        break;
      case "battle-potion":
        Battle.playerUsePotion(btn.getAttribute("data-item"));
        break;
      case "battle-run":
        Battle.playerRun();
        break;
      case "ambush-avoid":
        Battle.ambushAvoid();
        break;
      case "ambush-rush":
        Battle.ambushRush();
        break;
      case "battle-target":
        Battle.selectTarget(parseInt(btn.getAttribute("data-index"), 10));
        break;
      case "battle-continue":
        Battle.continueAfterVictory();
        break;
      case "battle-revive":
        Battle.reviveAtTown();
        break;

      /* ── Dungeon ── */
      case "dungeon-fight":
        Dungeon.fightRoom();
        break;
      case "dungeon-boss":
        Dungeon.fightBoss();
        break;
      case "dungeon-loot":
        Dungeon.collectLoot();
        break;
      case "dungeon-rest":
        Dungeon.restInRoom();
        break;
      case "dungeon-move":
        Dungeon.moveToRoom(parseInt(btn.getAttribute("data-room"), 10));
        break;
      case "dungeon-back":
        Dungeon.goBack();
        break;
      case "dungeon-exit":
        Dungeon.exitDungeon();
        break;
      case "dungeon-search-secret":
        Dungeon.searchForSecret();
        break;

      /* ── Quests ── */
      case "accept-quest":
        if (Quests.accept(btn.getAttribute("data-quest"))) {
          Audio.play("buttonClick");
          UI.showMessage("Quest accepted!");
          UI.renderQuestBoard();
        }
        break;
      case "turn-in-quest":
        var turnInResult = Quests.turnIn(btn.getAttribute("data-quest"));
        if (turnInResult) {
          Audio.play("questComplete");
          UI.showMessage("Quest complete! +" + turnInResult.rewards.xp + " XP, +" + (turnInResult.rewards.gold || 0) + " gold");
          if (turnInResult.leveled) UI.showMessage("LEVEL UP!");
          if (UI.getScreen() === 'ledger') UI.renderLedger('quests');
          else if (document.getElementById("questboard-content")) UI.renderQuestBoard();
          else UI.renderQuestLog();
          UI.updateHeader();
        }
        break;
      case "track-quest":
        Quests.setTracked(btn.getAttribute("data-quest"));
        if (UI.getScreen() === 'ledger') UI.renderLedger('quests');
        UI.updateHeader();
        break;
      case "open-ledger-quests":
        UI.renderLedger("quests");
        UI.showScreen("ledger");
        break;

      /* ── Bounties ── */
      case "accept-bounty":
        var bounty = Chapter1.rollDailyBounty(Player.get());
        if (bounty) {
          var pb = Player.get();
          pb.activeBounty = bounty;
          pb.bountyKills = 0;
          Audio.play("buttonClick");
          UI.showMessage("Bounty accepted: " + bounty.name);
          UI.renderQuestBoard();
        }
        break;
      case "turn-in-bounty":
        var pb2 = Player.get();
        if (pb2.activeBounty && pb2.bountyKills >= pb2.activeBounty.count) {
          pb2.gold += pb2.activeBounty.rewards.gold;
          Player.addXp(pb2.activeBounty.rewards.xp);
          if (!pb2.completedBounties) pb2.completedBounties = [];
          pb2.completedBounties.push(pb2.activeBounty.id + '-' + pb2.day);
          Audio.play("questComplete");
          UI.showMessage("Bounty complete! +" + pb2.activeBounty.rewards.xp + " XP, +" + pb2.activeBounty.rewards.gold + " gold");
          pb2.activeBounty = null;
          pb2.bountyKills = 0;
          UI.updateHeader();
          UI.renderQuestBoard();
        }
        break;

      /* ── Dialogue ── */
      case "dialogue-continue":
        Dialogue.advance();
        break;
      case "dialogue-choice":
        Dialogue.choose(parseInt(btn.getAttribute("data-choice"), 10));
        break;
      case "dialogue-skip":
        Dialogue.skipText();
        break;

      /* ── NPC Menu Actions ── */
      case "npc-shop":
        World.npcOpenShop(btn.getAttribute("data-shop"));
        break;
        case "shop-scene-interact":
          World.openShopNPCMenu(btn.getAttribute("data-shop"));
          break;
      case "npc-questboard":
        World.npcOpenQuestBoard();
        break;
      case "npc-chat":
        World.npcChat(btn.getAttribute("data-npc"));
        break;
      case "npc-gift":
        World.npcGift(btn.getAttribute("data-npc"));
        break;
      case "npc-give-gift":
        World.npcGiveGift(btn.getAttribute("data-npc"), btn.getAttribute("data-item"));
        break;
      case "npc-date":
        World.npcDate(btn.getAttribute("data-npc"));
        break;
      case "npc-follow":
        var followNpc = btn.getAttribute("data-npc");
        var pFollow = Player.get();
        pFollow.followingNpc = followNpc;
        var followCfg = Relationships.getConfig(followNpc);
        Dialogue.startDirect({ nodes: [
          { speaker: followCfg ? followCfg.name : followNpc, portrait: followCfg ? followCfg.portrait : "", text: "I'd love to! Let's go together.", end: true }
        ] }, function () { World.returnToNPCMenu(); });
        break;
      case "npc-dismiss":
        var dismissNpc = btn.getAttribute("data-npc");
        var pDismiss = Player.get();
        pDismiss.followingNpc = null;
        var dismissCfg = Relationships.getConfig(dismissNpc);
        Dialogue.startDirect({ nodes: [
          { speaker: dismissCfg ? dismissCfg.name : dismissNpc, portrait: dismissCfg ? dismissCfg.portrait : "", text: "I'll head back for now. Stay safe out there!", end: true }
        ] }, function () { World.returnToNPCMenu(); });
        break;
      case "npc-back":
        World.returnToNPCMenu();
        break;
        case "npc-exit-menu":
          World.leaveNPCMenu();
          break;
      case "open-relationships":
        UI.renderLedger("relationships");
        UI.showScreen("ledger");
        break;
      case "toggle-quest-detail":
        var detail = document.getElementById("quest-detail-" + btn.getAttribute("data-quest"));
        if (detail) detail.style.display = detail.style.display === "none" ? "block" : "none";
        break;

      /* ── Save / Sound / Settings ── */
      case "save-game":
        UI.renderSaveSlots('save');
        UI.showScreen('save-select');
        break;
      case "save-slot":
        var slotNum = parseInt(btn.getAttribute('data-slot'), 10);
        Save.setSlot(slotNum);
        Save.save(slotNum);
        UI.showMessage('Saved to slot ' + slotNum + '!');
        Audio.play('buttonClick');
        UI.renderSaveSlots('save');
        break;
      case "load-slot":
        var lSlot = parseInt(btn.getAttribute('data-slot'), 10);
        if (Save.load(lSlot)) {
          var gcLoad = document.getElementById("game-container");
          if (gcLoad) gcLoad.classList.remove("mode-menu");
          World.navigate(Player.get().currentArea || 'elderbrook');
        } else {
          UI.showMessage('Failed to load.');
        }
        break;
      case "delete-slot":
        Save.deleteSave(parseInt(btn.getAttribute('data-slot'), 10));
        UI.showMessage('Save deleted.');
        if (UI.getScreen() === 'save-select') {
          var slotContainer = document.getElementById('save-select-content');
          var slotMode = slotContainer ? (slotContainer.getAttribute('data-mode') || 'save') : 'save';
          UI.renderSaveSlots(slotMode);
        }
        break;
      case "toggle-sound":
        var on = Audio.toggle();
        UI.showMessage("Sound " + (on ? "on" : "off"));
        UI.updateHeader();
        break;
      case "set-sound":
        var wantSound = btn.getAttribute('data-sound');
        if (wantSound === 'on' && !Audio.isEnabled()) Audio.toggle();
        else if (wantSound === 'off' && Audio.isEnabled()) Audio.toggle();
        else if (!wantSound) Audio.toggle();
        if (UI.getScreen() === 'ledger') UI.renderLedger('settings');
        else UI.renderSettings();
        UI.updateHeader();
        break;
      case "set-voice":
        if (typeof Voice !== 'undefined') {
          Voice.setEnabled(btn.getAttribute('data-voice') === 'on');
          if (UI.getScreen() === 'ledger') UI.renderLedger('settings');
          else UI.renderSettings();
        }
        break;
      case "save-voice-key":
        if (typeof Voice !== 'undefined') {
          var keyInput = document.getElementById('voice-api-key');
          if (keyInput && keyInput.value && keyInput.value !== '********') {
            Voice.setApiKey(keyInput.value.trim());
            UI.showMessage('API key saved.');
            if (UI.getScreen() === 'ledger') UI.renderLedger('settings');
            else UI.renderSettings();
          }
        }
        break;

      /* ── Settings ── */
      case "open-settings":
        UI.renderLedger("settings");
        UI.showScreen("ledger");
        break;
      case "set-text-speed":
        var sp = btn.getAttribute('data-speed');
        var ps = Player.get();
        if (ps && ps.settings) ps.settings.textSpeed = sp;
        if (UI.getScreen() === 'ledger') UI.renderLedger('settings');
        else UI.renderSettings();
        break;
      case "set-difficulty":
        var diff = btn.getAttribute('data-difficulty');
        var pd = Player.get();
        if (pd) pd.difficulty = diff;
        if (UI.getScreen() === 'ledger') UI.renderLedger('settings');
        else UI.renderSettings();
        break;
      case "select-difficulty":
        var selDiff = btn.getAttribute('data-difficulty');
        var psd = Player.get();
        if (psd) psd.difficulty = selDiff;
        World.navigate('elderbrook');
        break;

      /* ── Achievements / Bestiary ── */
      case "open-achievements":
        UI.renderLedger("achievements");
        UI.showScreen("ledger");
        break;
      case "open-bestiary":
        UI.renderLedger("bestiary");
        UI.showScreen("ledger");
        break;

      /* ── Ledger tab switching ── */
      case "ledger-tab":
        UI.renderLedger(btn.getAttribute("data-tab"));
        break;
      case "load-game-menu":
        UI.renderSaveSlots('load');
        UI.showScreen('save-select');
        break;

      /* ── Build Class ── */
      case "go-mentor":
        World.visitClassMentor(btn.getAttribute("data-mentor"));
        break;
      case "choose-build":
        // Classes are now earned through mentor quests only
        UI.showMessage("Visit a class mentor in town to choose your path.");
        break;
      case "skip-build":
        World.navigate('elderbrook');
        break;
      case "train-unlock-class":
        UI.showMessage("Classes are now earned through mentor quests.");
        break;
      case "respec-build":
        UI.showMessage("Your class path is permanent and cannot be changed.");
        break;
      case "open-build-select":
        UI.renderBuildSelect();
        UI.showScreen('build-select');
        break;

      /* ── Crafting ── */
      case "open-crafting":
        Shops.renderCrafting();
        UI.showScreen('crafting');
        break;
      case "craft-item":
        var craftResult = Shops.craft(btn.getAttribute('data-recipe'));
        UI.showMessage(craftResult.message);
        Shops.renderCrafting();
        UI.updateHeader();
        break;
      case "close-crafting":
        World.navigate('elderbrook');
        break;

      /* ── SimGirl: Training / Academy / Sleep ── */
      case "go-training":
        UI.renderTraining();
        UI.showScreen('training');
        break;
      case "go-academy":
        UI.renderAcademy();
        UI.showScreen('academy');
        break;
      case "go-sleep":
        var oldSleepSeason = Player.getSeason();
        Player.sleep();
        UI.showMessage("You rest for the night... A new day begins.");
        Audio.play("buttonClick");
        var newSleepSeason = Player.getSeason();
        if (newSleepSeason !== oldSleepSeason) {
          UI.showSeasonBanner(newSleepSeason);
        }
        UI.updateHeader();
        UI.updateSidebars();
        World.navigate("elderbrook");
        break;
      case "train-stat":
        var trainResult = Player.trainStat(btn.getAttribute("data-stat"));
        if (trainResult.success) {
          UI.showMessage(trainResult.message);
          Audio.play("buttonClick");
        } else {
          UI.showMessage(trainResult.message);
        }
        UI.updateHeader();
        UI.updateSidebars();
        // Re-render whichever training screen we're on
        if (UI.getScreen() === 'training') UI.renderTraining();
        else if (UI.getScreen() === 'academy') UI.renderAcademy();
        break;
      case "purchase-skill":
        var purchaseResult = Player.purchaseSkill(btn.getAttribute("data-skill"));
        UI.showMessage(purchaseResult.message);
        if (purchaseResult.success) Audio.play("shopBuy");
        UI.updateHeader();
        UI.updateSidebars();
        if (UI.getScreen() === 'academy') UI.renderAcademy();
        break;
      case "train-skill":
        var trainSkResult = Player.trainSkill(btn.getAttribute("data-skill"));
        UI.showMessage(trainSkResult.message);
        if (trainSkResult.success) Audio.play("buttonClick");
        UI.updateHeader();
        UI.updateSidebars();
        if (UI.getScreen() === 'academy') UI.renderAcademy();
        break;
      case "learn-quest-skill":
        var qSkillId = btn.getAttribute("data-skill");
        if (Player.unlockQuestSkill(qSkillId)) {
          var qSk = Skills.get(qSkillId);
          UI.showMessage("You learned " + (qSk ? qSk.name : qSkillId) + "!");
          Audio.play("shopBuy");
        }
        UI.updateHeader();
        UI.updateSidebars();
        if (UI.getScreen() === 'academy') UI.renderAcademy();
        break;

      /* ── Admin Commands ── */
      case "admin-cmd":
        var ap = Player.get();
        if (!ap || !ap.isAdmin) break;
        var cmd = btn.getAttribute("data-cmd");
        var val = btn.getAttribute("data-val");
        switch (cmd) {
          case "add-levels":
            var lvls = parseInt(val, 10) || 1;
            for (var li = 0; li < lvls; li++) {
              ap.level++;
              ap.unspentPoints += 3;
            }
            ap.xpToNext = Math.floor(80 * Math.pow(1.2, ap.level - 1));
            Player.recalcStats();
            UI.showMessage("Level set to " + ap.level);
            break;
          case "add-gold":
            ap.gold += parseInt(val, 10) || 100;
            UI.showMessage("Gold: " + ap.gold);
            break;
          case "full-heal":
            ap.hp = ap.maxHp;
            ap.mp = ap.maxMp;
            UI.showMessage("Fully healed!");
            break;
          case "add-xp":
            Player.addXp(parseInt(val, 10) || 100);
            UI.showMessage("XP added!");
            break;
          case "add-points":
            ap.unspentPoints += parseInt(val, 10) || 5;
            UI.showMessage("Stat points: " + ap.unspentPoints);
            break;
          case "full-energy":
            ap.energy = ap.maxEnergy;
            UI.showMessage("Energy restored!");
            break;
          case "unlock-all-classes":
            var cdefs = Player.CLASS_DEFS;
            for (var ck in cdefs) {
              if (cdefs.hasOwnProperty(ck) && cdefs[ck].unlockFlag) {
                Player.setFlag(cdefs[ck].unlockFlag);
              }
            }
            UI.showMessage("All classes unlocked!");
            break;
          case "learn-all-skills":
            var allSk = Skills.getAll();
            if (!ap.learnedSkills) ap.learnedSkills = [];
            for (var si = 0; si < allSk.length; si++) {
              if (ap.learnedSkills.indexOf(allSk[si].id) === -1) {
                ap.learnedSkills.push(allSk[si].id);
              }
            }
            UI.showMessage("All skills learned!");
            break;
          case "add-item":
            ap.inventory.push(val);
            UI.showMessage("Added " + val);
            break;
          case "complete-all-quests":
            var allQDefs = Chapter1.getAllQuests();
            for (var qk in allQDefs) {
              if (allQDefs.hasOwnProperty(qk)) {
                var qDef = allQDefs[qk];
                var qid = qDef.id || qk;
                var qIdx = ap.activeQuests.indexOf(qid);
                if (qIdx > -1) ap.activeQuests.splice(qIdx, 1);
                if (ap.completedQuests.indexOf(qid) === -1) ap.completedQuests.push(qid);
                if (qDef.onComplete) {
                  for (var oci = 0; oci < qDef.onComplete.length; oci++) {
                    Player.setFlag(qDef.onComplete[oci]);
                  }
                }
              }
            }
            UI.showMessage("All quests completed!");
            break;
          case "toggle-flag":
            if (ap.storyFlags) {
              ap.storyFlags[val] = !ap.storyFlags[val];
              UI.showMessage(val + ": " + (ap.storyFlags[val] ? "ON" : "OFF"));
            }
            break;
          case "teleport":
            World.navigate(val);
            return; // don't re-render ledger
          case "advance-day":
            var days = parseInt(val, 10) || 1;
            for (var di = 0; di < days; di++) Player.sleep();
            UI.showMessage("Advanced " + days + " day(s)");
            break;
          case "set-difficulty":
            if (val === "easy" || val === "normal" || val === "hard") {
              ap.difficulty = val;
              UI.showMessage("Difficulty: " + val);
            }
            break;
          case "set-class":
            if (Player.CLASS_DEFS[val]) {
              ap.buildClass = val;
              if (!ap.learnedSkills) ap.learnedSkills = [];
              var cSkill = Player.CLASS_DEFS[val].skill;
              if (cSkill && ap.learnedSkills.indexOf(cSkill) === -1) {
                ap.learnedSkills.push(cSkill);
              }
              Player.recalcStats();
              UI.showMessage("Class set to " + Player.CLASS_DEFS[val].name);
            }
            break;
          case "add-charm":
            ap.charm += parseInt(val, 10) || 1;
            UI.showMessage("Charm: " + ap.charm);
            break;
          case "give-all-pets":
            var petList = Pets.getAll();
            if (!ap.ownedPets) ap.ownedPets = [];
            for (var gpi = 0; gpi < petList.length; gpi++) {
              if (ap.ownedPets.indexOf(petList[gpi].id) === -1) {
                ap.ownedPets.push(petList[gpi].id);
              }
            }
            UI.showMessage("All pets given!");
            break;
          case "set-pet":
            if (!ap.ownedPets) ap.ownedPets = [];
            if (ap.ownedPets.indexOf(val) === -1) ap.ownedPets.push(val);
            ap.activePet = val;
            Player.recalcStats();
            UI.showMessage("Pet set: " + val);
            break;
          case "remove-pet":
            ap.activePet = null;
            Player.recalcStats();
            UI.showMessage("Pet removed");
            break;
          case "add-affinity":
            var affParts = val.split("|");
            Relationships.addAffinity(affParts[0], parseInt(affParts[1], 10) || 10);
            UI.showMessage(affParts[0] + " affinity +" + affParts[1]);
            break;
          case "set-affinity":
            var saParts = val.split("|");
            var saTarget = parseInt(saParts[1], 10);
            if (ap.relationships && ap.relationships[saParts[0]]) {
              ap.relationships[saParts[0]].affinity = saTarget;
            }
            UI.showMessage(saParts[0] + " affinity set to " + saTarget);
            break;
          case "set-season":
            if (["spring", "summer", "autumn", "winter"].indexOf(val) !== -1) {
              ap.season = val;
              ap.seasonDay = 0;
              UI.showMessage("Season: " + val);
            }
            break;
          case "start-festival":
            Player.startFestival();
            UI.showMessage("Harvest Festival started!");
            break;
          case "end-festival":
            ap.festivalStartDay = null;
            UI.showMessage("Festival ended");
            break;
          case "reset-training":
            ap.trainingDone = {};
            UI.showMessage("Daily training reset!");
            break;
          case "add-flag":
            var flagInput = document.getElementById("admin-new-flag");
            var newFlag = flagInput ? flagInput.value.trim() : "";
            if (newFlag) {
              Player.setFlag(newFlag);
              UI.showMessage("Flag set: " + newFlag);
            }
            break;
        }
        UI.updateHeader();
        UI.updateSidebars();
        if (UI.getScreen() === 'ledger') UI.renderLedger('admin');
        break;
    }
  });

  /* ── Init ── */
  function init() {
    // Migrate legacy single-slot saves to new multi-slot system
    Save.migrateLegacy();

    // Init voice system
    if (typeof Voice !== 'undefined') Voice.init();

    // Show title screen
    UI.showScreen("title");

    // Show/hide continue button based on save data
    var continueBtn = document.getElementById("btn-continue");
    if (continueBtn) {
      continueBtn.style.display = Save.hasSave() ? "" : "none";
    }
  }

  init();
})();
