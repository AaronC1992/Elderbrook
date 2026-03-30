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
    } else if (id === "world-map") {
      updateWorldMap();
    } else if (id === "victory") {
      renderVictory();
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
    setText("char-intelligence", data.intelligence + " (+" + (Player.getTotalIntelligence() - data.intelligence) + " from gear)");
    setText("char-gold", data.gold);

    // Stat allocation panel
    var allocPanel = document.getElementById("stat-alloc-panel");
    if (allocPanel) {
      if (data.unspentPoints > 0) {
        allocPanel.classList.remove("hidden");
        setText("unspent-points", data.unspentPoints);
      } else {
        allocPanel.classList.add("hidden");
      }
    }

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

    // Bestiary
    renderBestiary();
  }

  function renderBestiary() {
    var list = document.getElementById("bestiary-list");
    if (!list) return;
    list.innerHTML = "";
    var data = Player.getData();
    var bestiary = data.bestiary || {};
    var allIds = Enemies.getAllIds();
    if (!allIds || allIds.length === 0) {
      list.innerHTML = '<p class="flavor">No enemies encountered yet.</p>';
      return;
    }
    for (var i = 0; i < allIds.length; i++) {
      var id = allIds[i];
      var kills = bestiary[id] || 0;
      var enemy = Enemies.get(id);
      var div = document.createElement("div");
      div.className = "bestiary-entry";
      if (kills > 0) {
        div.innerHTML = '<span class="bestiary-name">' + (enemy ? enemy.name : id) + '</span>' +
          '<span class="bestiary-kills">' + kills + ' killed</span>';
      } else {
        div.innerHTML = '<span class="bestiary-name bestiary-unknown">???</span>' +
          '<span class="bestiary-kills">-</span>';
      }
      list.appendChild(div);
    }
  }

  function updateWorldMap() {
    var areaButtons = {
      "bandit-camp": document.getElementById("area-btn-bandit-camp"),
      "dark-forest": document.getElementById("area-btn-dark-forest"),
      "haunted-ruins": document.getElementById("area-btn-haunted-ruins"),
      "dragons-lair": document.getElementById("area-btn-dragons-lair")
    };
    for (var area in areaButtons) {
      var btn = areaButtons[area];
      if (!btn) continue;
      if (Player.isAreaUnlocked(area)) {
        btn.classList.remove("area-locked");
        btn.disabled = false;
      } else {
        btn.classList.add("area-locked");
        btn.disabled = true;
      }
    }
  }

  function renderVictory() {
    var data = Player.getData();
    var statsDiv = document.getElementById("victory-stats");
    if (!statsDiv) return;
    var totalKills = 0;
    var bestiary = data.bestiary || {};
    for (var id in bestiary) {
      totalKills += bestiary[id];
    }
    statsDiv.innerHTML =
      '<div class="victory-stat"><span>Final Level</span><span>' + data.level + '</span></div>' +
      '<div class="victory-stat"><span>Total Kills</span><span>' + totalKills + '</span></div>' +
      '<div class="victory-stat"><span>Gold Earned</span><span>' + data.gold + '</span></div>' +
      '<div class="victory-stat"><span>Strength</span><span>' + Player.getTotalAttack() + '</span></div>' +
      '<div class="victory-stat"><span>Defense</span><span>' + Player.getTotalDefense() + '</span></div>' +
      '<div class="victory-stat"><span>Intelligence</span><span>' + Player.getTotalIntelligence() + '</span></div>';
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
