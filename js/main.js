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
        if (Save.load()) {
          World.navigate(Player.get().currentArea || "elderbrook");
        } else {
          UI.showMessage("No save found.");
        }
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

      /* ── Save / Sound ── */
      case "save-game":
        Save.save();
        UI.showMessage("Game saved!");
        Audio.play("buttonClick");
        break;
      case "toggle-sound":
        var on = Audio.toggle();
        UI.showMessage("Sound " + (on ? "on" : "off"));
        UI.updateHeader();
        break;
    }
  });

  /* ── Init ── */
  function init() {
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
