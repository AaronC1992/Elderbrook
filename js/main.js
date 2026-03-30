/* main.js - Game bootstrap and event wiring */
(function () {
  // --- Character Creation ---
  var createForm = document.getElementById("create-form");
  if (createForm) {
    createForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = document.getElementById("player-name");
      var name = nameInput ? nameInput.value.trim() : "";
      if (!name) return;
      var genderInput = document.querySelector('input[name="gender"]:checked');
      var gender = genderInput ? genderInput.value : "male";
      Player.create(name, gender);
      UI.updateHeader();
      MessageLog.add("Welcome to Elderbrook, " + name + "!", "info");
      Audio.buttonClick();
      UI.showScreen("town");
    });
  }

  // --- Gender Picker ---
  var genderOptions = document.querySelectorAll(".gender-option");
  for (var i = 0; i < genderOptions.length; i++) {
    genderOptions[i].addEventListener("click", function () {
      for (var j = 0; j < genderOptions.length; j++) {
        genderOptions[j].classList.remove("selected");
      }
      this.classList.add("selected");
      this.querySelector("input").checked = true;
    });
  }

  // --- Sound Toggle ---
  var soundBtn = document.getElementById("btn-sound");
  if (soundBtn) {
    soundBtn.addEventListener("click", function () {
      var on = Audio.toggle();
      soundBtn.textContent = on ? "Sound: ON" : "Sound: OFF";
    });
  }

  // --- Main delegated click handler ---
  document.addEventListener("click", function (e) {
    var target = e.target;

    // data-screen navigation
    var screen = target.getAttribute("data-screen");
    if (screen) {
      // Block locked area buttons
      if (target.classList.contains("area-locked")) return;
      World.navigate(screen);
      return;
    }

    // --- Inn ---
    if (target.id === "btn-rest") { World.restAtInn(); return; }

    // --- Wilderness explore ---
    if (target.id === "btn-explore") { World.startEncounter("goblin-cave"); return; }
    if (target.id === "btn-explore-bandit") { World.startEncounter("bandit-camp"); return; }
    if (target.id === "btn-explore-forest") { World.startEncounter("dark-forest"); return; }
    if (target.id === "btn-explore-ruins") { World.startEncounter("haunted-ruins"); return; }
    if (target.id === "btn-explore-dragon") { World.startEncounter("dragons-lair"); return; }

    // --- Dungeon enter ---
    if (target.id === "btn-enter-dungeon-goblin") { World.enterDungeon("goblin-cave"); return; }
    if (target.id === "btn-enter-dungeon-bandit") { World.enterDungeon("bandit-camp"); return; }
    if (target.id === "btn-enter-dungeon-forest") { World.enterDungeon("dark-forest"); return; }
    if (target.id === "btn-enter-dungeon-ruins") { World.enterDungeon("haunted-ruins"); return; }
    if (target.id === "btn-enter-dungeon-dragon") { World.enterDungeon("dragons-lair"); return; }

    // --- Stat allocation ---
    var allocStat = target.getAttribute("data-allocate");
    if (allocStat) {
      if (Player.allocateStat(allocStat)) {
        Audio.buttonClick();
        UI.renderCharacter();
        UI.updateHeader();
        MessageLog.add(allocStat.charAt(0).toUpperCase() + allocStat.slice(1) + " increased!", "level");
      }
      return;
    }

    // --- Battle ---
    if (target.id === "btn-attack") { Battle.playerAttack(); return; }
    if (target.id === "btn-potion") { Battle.playerUsePotion(); return; }
    if (target.id === "btn-mana-potion") { Battle.playerUseManaPotion(); return; }
    if (target.id === "btn-run") { Battle.playerRun(); return; }

    // --- Skills in battle ---
    var skillId = target.getAttribute("data-skill");
    if (skillId) { Battle.playerUseSkill(skillId); return; }

    // --- Game Over ---
    if (target.id === "btn-revive") { World.reviveAtTown(); return; }
    if (target.id === "btn-load-save") {
      if (SaveSystem.load()) {
        UI.updateHeader();
        MessageLog.add("Save loaded.", "info");
        UI.showScreen("town");
      } else {
        MessageLog.add("No save found!", "damage");
      }
      return;
    }

    // --- Victory continue ---
    if (target.id === "btn-continue-playing") {
      UI.showScreen("town");
      MessageLog.add("The adventure continues...", "info");
      return;
    }

    // --- Save ---
    if (target.id === "btn-save") { SaveSystem.save(); return; }

    // --- Back to town buttons ---
    if (target.classList.contains("btn-back")) {
      // Let dungeon handle its own back button
      return;
    }

    // --- Shop buy ---
    var buyId = target.getAttribute("data-buy");
    if (buyId) { Shops.handleClick(e); return; }

    // --- Inventory ---
    if (target.getAttribute("data-equip") || target.getAttribute("data-unequip") ||
        target.getAttribute("data-use") || target.getAttribute("data-sell") ||
        target.getAttribute("data-filter")) {
      Inventory.handleClick(e);
      return;
    }

    // --- Quests ---
    if (target.getAttribute("data-accept-quest") || target.getAttribute("data-turnin")) {
      Quests.handleClick(e);
      return;
    }
  });

  // --- Init: check for save ---
  function init() {
    if (SaveSystem.hasSave()) {
      if (SaveSystem.load()) {
        UI.updateHeader();
        MessageLog.add("Save loaded. Welcome back, " + Player.getData().name + "!", "info");
        UI.showScreen("town");
        return;
      }
    }
    UI.showScreen("create");
  }

  init();
})();
