/* battle.js - Turn-based combat system */
var Battle = (function () {
  var currentEnemy = null;
  var inBattle = false;
  var playerTurn = true;

  function start(area) {
    currentEnemy = Enemies.getRandomForArea(area || "wilderness");
    if (!currentEnemy) return;
    inBattle = true;
    playerTurn = true;

    MessageLog.add("A " + currentEnemy.name + " appears!", "damage");

    // Clear previous battle log
    var log = document.getElementById("battle-log");
    if (log) log.innerHTML = "";

    // Reset battle actions
    var actions = document.getElementById("battle-actions");
    if (actions) {
      actions.innerHTML = "";
      var atkBtn = document.createElement("button");
      atkBtn.className = "btn-primary";
      atkBtn.id = "btn-attack";
      atkBtn.textContent = "Attack";
      actions.appendChild(atkBtn);

      var potBtn = document.createElement("button");
      potBtn.className = "btn-primary";
      potBtn.id = "btn-potion";
      potBtn.textContent = "Use Health Potion";
      actions.appendChild(potBtn);

      var runBtn = document.createElement("button");
      runBtn.className = "btn-secondary";
      runBtn.id = "btn-run";
      runBtn.textContent = "Run";
      actions.appendChild(runBtn);
    }

    // Update player name
    var pName = document.getElementById("battle-player-name");
    if (pName) pName.textContent = Player.getData().name;

    // Update portraits
    var pPortrait = document.getElementById("player-portrait");
    if (pPortrait) {
      var g = Player.getData().gender || "male";
      pPortrait.src = "assets/portraits/" + g + "-player.png";
    }
    var ePortrait = document.getElementById("enemy-portrait");
    if (ePortrait && currentEnemy.portrait) ePortrait.src = currentEnemy.portrait;

    renderBattle();
    UI.showScreen("battle");
  }

  function renderBattle() {
    if (!currentEnemy) return;

    // Enemy info
    var eName = document.getElementById("enemy-name");
    var eBar = document.getElementById("enemy-hp-bar");
    var eHpText = document.getElementById("enemy-hp-text");

    if (eName) eName.textContent = currentEnemy.name;
    if (eBar) eBar.style.width = Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100) + "%";
    if (eHpText) eHpText.textContent = currentEnemy.hp + " / " + currentEnemy.maxHp;

    // Player info
    var pBar = document.getElementById("player-hp-bar");
    var pHpText = document.getElementById("player-hp-text");
    var data = Player.getData();

    if (pBar) pBar.style.width = Math.max(0, (data.hp / data.maxHp) * 100) + "%";
    if (pHpText) pHpText.textContent = data.hp + " / " + data.maxHp;

    // Battle log area
    var log = document.getElementById("battle-log");
    if (log) {
      // Keep existing log content
    }

    // Enable/disable buttons based on turn
    var btns = document.querySelectorAll("#battle-actions button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = !playerTurn;
      if (playerTurn) {
        btns[i].classList.remove("on-cooldown");
      }
    }
  }

  function setCooldown() {
    var btns = document.querySelectorAll("#battle-actions button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.add("on-cooldown");
    }
  }

  function playerAttack() {
    if (!inBattle || !playerTurn) return;
    playerTurn = false;
    setCooldown();

    var atk = Player.getTotalAttack();
    var variance = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    var damage = Math.max(1, atk - currentEnemy.defense + variance);

    currentEnemy.hp -= damage;
    logBattle("You strike the " + currentEnemy.name + " for " + damage + " damage!", "damage");

    if (currentEnemy.hp <= 0) {
      currentEnemy.hp = 0;
      renderBattle();
      victory();
      return;
    }

    renderBattle();
    setTimeout(function () { enemyTurn(); }, 600);
  }

  function playerUsePotion() {
    if (!inBattle || !playerTurn) return;

    if (!Player.hasItem("health-potion")) {
      logBattle("No health potions left!", "damage");
      return;
    }

    playerTurn = false;
    setCooldown();
    Player.removeItem("health-potion");
    Player.heal(30);
    logBattle("You drink a Health Potion. +30 HP!", "heal");

    renderBattle();
    UI.updateHeader();
    setTimeout(function () { enemyTurn(); }, 600);
  }

  function playerRun() {
    if (!inBattle || !playerTurn) return;

    var dex = Player.getTotalDexterity();
    var chance = 0.4 + (dex * 0.03);
    if (Math.random() < chance) {
      logBattle("You fled from the " + currentEnemy.name + "!", "info");
      endBattle();
      UI.showScreen("wilderness");
    } else {
      playerTurn = false;
      setCooldown();
      logBattle("Failed to escape!", "damage");
      setTimeout(function () { enemyTurn(); }, 600);
    }
  }

  function enemyTurn() {
    if (!inBattle || !currentEnemy || currentEnemy.hp <= 0) return;

    var enemyAtk = currentEnemy.attack;
    var playerDef = Player.getTotalDefense();
    var variance = Math.floor(Math.random() * 3) - 1;
    var damage = Math.max(1, enemyAtk - playerDef + variance);

    Player.takeDamage(damage);
    logBattle("The " + currentEnemy.name + " hits you for " + damage + " damage!", "damage");

    renderBattle();
    UI.updateHeader();

    if (!Player.isAlive()) {
      defeat();
      return;
    }

    playerTurn = true;
    renderBattle();
  }

  function victory() {
    inBattle = false;

    // Gold reward
    var goldMin = currentEnemy.goldReward[0];
    var goldMax = currentEnemy.goldReward[1];
    var gold = goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1));
    Player.addGold(gold);
    logBattle("Victory! +" + gold + " gold.", "gold");

    // XP reward
    var leveled = Player.addXp(currentEnemy.xpReward);
    logBattle("+" + currentEnemy.xpReward + " XP.", "xp");
    if (leveled) {
      logBattle("LEVEL UP! You are now level " + Player.getData().level + "!", "xp");
    }

    // Quest progress
    Quests.progress(currentEnemy.id);

    // Loot drops
    if (currentEnemy.loot) {
      for (var i = 0; i < currentEnemy.loot.length; i++) {
        var drop = currentEnemy.loot[i];
        if (Math.random() < drop.chance) {
          if (!Player.inventoryFull()) {
            Player.addItem(drop.itemId);
            var item = Items.get(drop.itemId);
            logBattle("Looted: " + (item ? item.name : drop.itemId), "gold");
          } else {
            logBattle("Inventory full! Loot lost.", "damage");
          }
          break; // Only one loot drop per fight
        }
      }
    }

    UI.updateHeader();

    // Show return button
    var actions = document.getElementById("battle-actions");
    if (actions) {
      actions.innerHTML = "";
      var btn = document.createElement("button");
      btn.className = "btn-primary";
      btn.textContent = "Continue";
      btn.addEventListener("click", function () {
        UI.showScreen("wilderness");
      });
      actions.appendChild(btn);
    }
  }

  function defeat() {
    inBattle = false;

    var goldLost = Math.floor(Player.getData().gold * 0.1);
    Player.getData().gold -= goldLost;
    if (Player.getData().gold < 0) Player.getData().gold = 0;
    Player.getData().hp = Math.floor(Player.getData().maxHp * 0.5);

    logBattle("You were defeated... Lost " + goldLost + " gold.", "damage");
    MessageLog.add("Defeated by " + currentEnemy.name + ". Lost " + goldLost + " gold.", "damage");

    UI.updateHeader();

    var actions = document.getElementById("battle-actions");
    if (actions) {
      actions.innerHTML = "";
      var btn = document.createElement("button");
      btn.className = "btn-primary";
      btn.textContent = "Return to Town";
      btn.addEventListener("click", function () {
        UI.showScreen("town");
      });
      actions.appendChild(btn);
    }
  }

  function endBattle() {
    inBattle = false;
    currentEnemy = null;
  }

  function logBattle(text, type) {
    var log = document.getElementById("battle-log");
    if (!log) return;
    var p = document.createElement("p");
    p.className = "log-" + (type || "info");
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;

    MessageLog.add(text, type);
  }

  function isInBattle() {
    return inBattle;
  }

  return {
    start: start,
    playerAttack: playerAttack,
    playerUsePotion: playerUsePotion,
    playerRun: playerRun,
    isInBattle: isInBattle,
    renderBattle: renderBattle
  };
})();
