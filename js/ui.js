/* ui.js - Screen management, header updates, message log */
var UI = (function () {
  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove("active");
    }
    var target = document.getElementById("screen-" + id);
    if (target) {
      target.classList.add("active");
    }

    // Render content when screen opens
    if (id === "town") {
      // Nothing dynamic to render for town
    } else if (id === "weapon-shop") {
      Shops.renderShop("weapon-shop");
    } else if (id === "armor-shop") {
      Shops.renderShop("armor-shop");
    } else if (id === "potion-shop") {
      Shops.renderShop("potion-shop");
    } else if (id === "quest-board") {
      Quests.renderQuestBoard();
    } else if (id === "inventory") {
      Inventory.render();
    } else if (id === "character") {
      renderCharacter();
    } else if (id === "dungeon") {
      Dungeon.render();
    }
  }

  function updateHeader() {
    var data = Player.getData();
    var el;

    el = document.getElementById("header-name");
    if (el) el.textContent = data.name;

    el = document.getElementById("header-level");
    if (el) el.textContent = "Lv " + data.level;

    el = document.getElementById("header-hp");
    if (el) el.textContent = "HP: " + data.hp + "/" + data.maxHp;

    el = document.getElementById("header-mana");
    if (el) el.textContent = "MP: " + data.mana + "/" + data.maxMana;

    el = document.getElementById("header-gold");
    if (el) el.textContent = "Gold: " + data.gold;
  }

  function renderCharacter() {
    var data = Player.getData();

    setText("char-name", data.name);
    setText("char-level", data.level);
    setText("char-xp", data.xp + " / " + data.xpToNext);
    setText("char-hp", data.hp + " / " + data.maxHp);
    setText("char-mana", data.mana + " / " + data.maxMana);
    setText("char-strength", data.strength + " (+" + (Player.getTotalAttack() - data.strength) + " from gear)");
    setText("char-defense", data.defense + " (+" + (Player.getTotalDefense() - data.defense) + " from gear)");
    setText("char-dexterity", data.dexterity + " (+" + (Player.getTotalDexterity() - data.dexterity) + " from gear)");
    setText("char-intelligence", data.intelligence);
    setText("char-gold", data.gold);

    // Equipped items
    var slots = ["weapon", "helmet", "chest", "legs", "accessory"];
    for (var i = 0; i < slots.length; i++) {
      var el = document.getElementById("char-" + slots[i]);
      if (el) {
        var itemId = data.equipped[slots[i]];
        if (itemId) {
          var item = Items.get(itemId);
          el.textContent = item ? item.name : itemId;
        } else {
          el.textContent = "(none)";
        }
      }
    }
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  return {
    showScreen: showScreen,
    updateHeader: updateHeader,
    renderCharacter: renderCharacter
  };
})();

/* MessageLog - color-coded footer log */
var MessageLog = (function () {
  var maxEntries = 50;

  function add(text, type) {
    var log = document.getElementById("message-log");
    if (!log) return;

    var p = document.createElement("p");
    p.className = "log-" + (type || "info");
    p.textContent = text;
    log.appendChild(p);

    // Trim old entries
    while (log.children.length > maxEntries) {
      log.removeChild(log.firstChild);
    }

    log.scrollTop = log.scrollHeight;
  }

  function clear() {
    var log = document.getElementById("message-log");
    if (log) log.innerHTML = "";
  }

  return { add: add, clear: clear };
})();
