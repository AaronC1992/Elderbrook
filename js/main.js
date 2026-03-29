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
      Player.create(name);
      UI.updateHeader();
      MessageLog.add("Welcome to Elderbrook, " + name + "!", "info");
      UI.showScreen("town");
    });
  }

  // --- Nav buttons (header) ---
  document.addEventListener("click", function (e) {
    var target = e.target;

    // data-screen navigation
    var screen = target.getAttribute("data-screen");
    if (screen) {
      World.navigate(screen);
      return;
    }

    // --- Inn ---
    if (target.id === "btn-rest") { World.restAtInn(); return; }

    // --- Wilderness ---
    if (target.id === "btn-explore") { World.startEncounter(); return; }

    // --- Battle ---
    if (target.id === "btn-attack") { Battle.playerAttack(); return; }
    if (target.id === "btn-potion") { Battle.playerUsePotion(); return; }
    if (target.id === "btn-run") { Battle.playerRun(); return; }

    // --- Save ---
    if (target.id === "btn-save") { SaveSystem.save(); return; }

    // --- Back to town buttons ---
    if (target.classList.contains("btn-back")) {
      World.navigate("town");
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
