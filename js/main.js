/* main.js - Entry point and event wiring */
(function () {

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
      // Update portrait preview
      var preview = document.getElementById("create-portrait");
      if (preview) {
        preview.src = selectedGender === "female"
          ? "assets/portraits/female-player.png"
          : "assets/portraits/male-player.png";
      }
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
      var gc = document.getElementById("game-container");
      if (gc) gc.classList.remove("mode-menu");
      World.navigate("elderbrook");
    });
  }

  /* ── Delegated Click Handler ── */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");

    switch (action) {
      /* ── Title Screen ── */
      case "new-game":
        UI.showScreen("create");
        break;
      case "continue-game":
        UI.renderSaveSlots('load');
        UI.showScreen('save-select');
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
      case "go-worldmap":
        UI.renderWorldMap();
        UI.showScreen("worldmap");
        break;
      case "go-social":
        UI.renderSocial();
        UI.showScreen("social");
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

      /* ── Character ── */
      case "open-character":
        UI.renderCharacter();
        UI.showScreen("character");
        break;
      case "open-inventory":
        Inventory.render();
        UI.showScreen("inventory");
        break;
      case "open-quests":
        UI.renderQuestLog();
        UI.showScreen("quests");
        break;
      case "allocate-stat":
        Player.allocateStat(btn.getAttribute("data-stat"));
        Audio.play("buttonClick");
        UI.renderCharacter();
        UI.updateHeader();
        break;
      case "close-overlay":
        World.navigate(Player.get().currentArea || "elderbrook");
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
          UI.renderQuestLog();
          UI.updateHeader();
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

      /* ── Relationships / Social ── */
      case "open-relationships":
        UI.renderRelationships();
        UI.showScreen("relationships");
        break;
      case "social-chat":
        Relationships.chat(btn.getAttribute("data-npc"), function () {
          UI.renderSocial();
          UI.showScreen("social");
        });
        break;
      case "social-gift":
        UI.renderGiftSelect(btn.getAttribute("data-npc"));
        break;
      case "give-gift-confirm":
        Relationships.giveGift(btn.getAttribute("data-npc"), btn.getAttribute("data-item"), function () {
          UI.renderSocial();
          UI.showScreen("social");
        });
        break;
      case "social-date":
        Relationships.goOnDate(btn.getAttribute("data-npc"), function () {
          UI.renderSocial();
          UI.showScreen("social");
        });
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
      case "toggle-sound-setting":
      case "set-sound":
        var wantSound = btn.getAttribute('data-sound');
        if (wantSound === 'on' && !Audio.isEnabled()) Audio.toggle();
        else if (wantSound === 'off' && Audio.isEnabled()) Audio.toggle();
        else if (!wantSound) Audio.toggle();
        UI.renderSettings();
        UI.updateHeader();
        break;

      /* ── Settings ── */
      case "open-settings":
        UI.renderSettings();
        UI.showScreen('settings');
        break;
      case "set-text-speed":
        var sp = btn.getAttribute('data-speed');
        var ps = Player.get();
        if (ps && ps.settings) ps.settings.textSpeed = sp;
        UI.renderSettings();
        break;
      case "set-difficulty":
        var diff = btn.getAttribute('data-difficulty');
        var pd = Player.get();
        if (pd) pd.difficulty = diff;
        UI.renderSettings();
        break;
      case "select-difficulty":
        var selDiff = btn.getAttribute('data-difficulty');
        var psd = Player.get();
        if (psd) psd.difficulty = selDiff;
        World.navigate('elderbrook');
        break;

      /* ── Achievements / Bestiary ── */
      case "open-achievements":
        UI.renderAchievements();
        UI.showScreen('achievements');
        break;
      case "open-bestiary":
        UI.renderBestiary();
        UI.showScreen('bestiary');
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
