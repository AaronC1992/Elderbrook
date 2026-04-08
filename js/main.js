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
        introPageIndex++;
        showIntroPage(introPageIndex);
        break;
      case "intro-skip":
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
        World.restAtInn();
        break;
      case "go-elric":
        World.visitElric();
        break;
      case "go-elira":
        World.visitElira();
        break;
      case "interact-event":
        World.interactEvent(btn.getAttribute("data-event"));
        break;
      case "find-biscuit":
        World.findBiscuit();
        break;
      case "return-biscuit":
        World.returnBiscuit();
        break;
      case "go-worldmap":
        UI.renderWorldMap();
        UI.showScreen("worldmap");
        break;
      case "travel":
        World.navigate(btn.getAttribute("data-location"));
        break;

      /* ── Area ── */
      case "area-explore":
        World.explore(btn.getAttribute("data-area"));
        break;
      case "area-gather":
        World.gather(btn.getAttribute("data-area"));
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
          else UI.renderQuestLog();
          UI.updateHeader();
        }
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
      case "npc-back":
        World.returnToNPCMenu();
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
      case "choose-build":
        var build = btn.getAttribute('data-build');
        var pb = Player.get();
        if (pb) {
          pb.buildClass = build;
          Player.setFlag('choseBuild');
          Player.recalcStats();
          Audio.play('achievement');
          UI.showMessage('You chose the ' + build.charAt(0).toUpperCase() + build.slice(1) + ' path!');
          World.navigate('elderbrook');
        }
        break;
      case "respec-build":
        var respecResult = Player.respecBuild();
        UI.showMessage(respecResult.message);
        if (respecResult.success) {
          UI.renderBuildSelect();
          UI.showScreen('build-select');
        } else {
          UI.renderTraining();
        }
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
        Player.sleep();
        UI.showMessage("You rest for the night... A new day begins.");
        Audio.play("buttonClick");
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
    }
  });

  /* ── Init ── */
  function init() {
    // Migrate legacy single-slot saves to new multi-slot system
    Save.migrateLegacy();

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
