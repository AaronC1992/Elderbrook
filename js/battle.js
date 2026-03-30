/* battle.js - Turn-based combat with skills, status effects, game over */
var Battle = (function () {
  var currentEnemy = null;
  var inBattle = false;
  var playerTurn = true;
  var currentArea = "goblin-cave";
  var playerEffects = [];   // { type, damage, duration, turnsLeft }
  var isDefending = false;

  function start(area) {
    currentArea = area || "goblin-cave";
    currentEnemy = Enemies.getRandomForArea(currentArea);
    if (!currentEnemy) return;
    inBattle = true;
    playerTurn = true;
    playerEffects = [];
    isDefending = false;

    MessageLog.add("A " + currentEnemy.name + " appears!", "damage");

    var log = document.getElementById("battle-log");
    if (log) log.innerHTML = "";

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

    // Show boss label
    var bossLabel = document.getElementById("boss-label");
    if (bossLabel) bossLabel.style.display = currentEnemy.isBoss ? "block" : "none";

    buildActions();
    renderBattle();
    UI.showScreen("battle");
  }

  function startBoss(area) {
    currentArea = area || "goblin-cave";
    currentEnemy = Enemies.getBoss(currentArea);
    if (!currentEnemy) return;
    inBattle = true;
    playerTurn = true;
    playerEffects = [];
    isDefending = false;

    MessageLog.add("BOSS: " + currentEnemy.name + " appears!", "damage");

    var log = document.getElementById("battle-log");
    if (log) log.innerHTML = "";

    var pName = document.getElementById("battle-player-name");
    if (pName) pName.textContent = Player.getData().name;

    var pPortrait = document.getElementById("player-portrait");
    if (pPortrait) {
      var g = Player.getData().gender || "male";
      pPortrait.src = "assets/portraits/" + g + "-player.png";
    }
    var ePortrait = document.getElementById("enemy-portrait");
    if (ePortrait && currentEnemy.portrait) ePortrait.src = currentEnemy.portrait;

    var bossLabel = document.getElementById("boss-label");
    if (bossLabel) bossLabel.style.display = "block";

    buildActions();
    renderBattle();
    UI.showScreen("battle");
  }

  function buildActions() {
    var actions = document.getElementById("battle-actions");
    if (!actions) return;
    actions.innerHTML = "";

    // Basic attack
    var atkBtn = document.createElement("button");
    atkBtn.className = "btn-primary";
    atkBtn.id = "btn-attack";
    atkBtn.textContent = "Attack";
    actions.appendChild(atkBtn);

    // Skills
    var availableSkills = Skills.getAvailable(Player.getData().level);
    for (var i = 0; i < availableSkills.length; i++) {
      var skill = availableSkills[i];
      var sBtn = document.createElement("button");
      sBtn.className = "btn-primary btn-skill";
      sBtn.setAttribute("data-skill", skill.id);
      sBtn.textContent = skill.name + " (" + skill.manaCost + " MP)";
      sBtn.title = skill.description;
      actions.appendChild(sBtn);
    }

    // Potion
    var potBtn = document.createElement("button");
    potBtn.className = "btn-primary";
    potBtn.id = "btn-potion";
    potBtn.textContent = "Use Health Potion";
    actions.appendChild(potBtn);

    // Mana Potion
    var manaBtn = document.createElement("button");
    manaBtn.className = "btn-secondary";
    manaBtn.id = "btn-mana-potion";
    manaBtn.textContent = "Use Mana Potion";
    actions.appendChild(manaBtn);

    // Run
    var runBtn = document.createElement("button");
    runBtn.className = "btn-secondary";
    runBtn.id = "btn-run";
    runBtn.textContent = "Run";
    actions.appendChild(runBtn);
  }

  function renderBattle() {
    if (!currentEnemy) return;

    var eName = document.getElementById("enemy-name");
    var eBar = document.getElementById("enemy-hp-bar");
    var eHpText = document.getElementById("enemy-hp-text");

    if (eName) eName.textContent = currentEnemy.name;
    if (eBar) eBar.style.width = Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100) + "%";
    if (eHpText) eHpText.textContent = currentEnemy.hp + " / " + currentEnemy.maxHp;

    var pBar = document.getElementById("player-hp-bar");
    var pHpText = document.getElementById("player-hp-text");
    var pManaBar = document.getElementById("player-mana-bar");
    var pManaText = document.getElementById("player-mana-text");
    var data = Player.getData();

    if (pBar) pBar.style.width = Math.max(0, (data.hp / data.maxHp) * 100) + "%";
    if (pHpText) pHpText.textContent = data.hp + " / " + data.maxHp;
    if (pManaBar) pManaBar.style.width = Math.max(0, (data.mana / data.maxMana) * 100) + "%";
    if (pManaText) pManaText.textContent = data.mana + " / " + data.maxMana;

    // Render status effects on enemy
    var eStatusEl = document.getElementById("enemy-status");
    if (eStatusEl) {
      eStatusEl.innerHTML = "";
      if (currentEnemy.statusEffects) {
        for (var i = 0; i < currentEnemy.statusEffects.length; i++) {
          var eff = currentEnemy.statusEffects[i];
          var badge = document.createElement("span");
          badge.className = "status-badge status-" + eff.type;
          badge.textContent = eff.type.charAt(0).toUpperCase() + eff.type.slice(1) + " (" + eff.turnsLeft + ")";
          eStatusEl.appendChild(badge);
        }
      }
    }

    // Render status effects on player
    var pStatusEl = document.getElementById("player-status");
    if (pStatusEl) {
      pStatusEl.innerHTML = "";
      for (var j = 0; j < playerEffects.length; j++) {
        var pEff = playerEffects[j];
        var pBadge = document.createElement("span");
        pBadge.className = "status-badge status-" + pEff.type;
        pBadge.textContent = pEff.type.charAt(0).toUpperCase() + pEff.type.slice(1) + " (" + pEff.turnsLeft + ")";
        pStatusEl.appendChild(pBadge);
      }
      if (isDefending) {
        var defBadge = document.createElement("span");
        defBadge.className = "status-badge status-defend";
        defBadge.textContent = "Defending";
        pStatusEl.appendChild(defBadge);
      }
    }

    // Enable/disable buttons
    var btns = document.querySelectorAll("#battle-actions button");
    for (var k = 0; k < btns.length; k++) {
      btns[k].disabled = !playerTurn;
      if (playerTurn) btns[k].classList.remove("on-cooldown");
    }
  }

  function setCooldown() {
    var btns = document.querySelectorAll("#battle-actions button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.add("on-cooldown");
    }
  }

  // --- Status Effects ---
  function applyStatusToPlayer(effect) {
    // Check if already has this type
    for (var i = 0; i < playerEffects.length; i++) {
      if (playerEffects[i].type === effect.type) {
        playerEffects[i].turnsLeft = effect.duration;
        return;
      }
    }
    playerEffects.push({ type: effect.type, damage: effect.damage || 0, turnsLeft: effect.duration });
  }

  function applyStatusToEnemy(effect) {
    if (!currentEnemy.statusEffects) currentEnemy.statusEffects = [];
    for (var i = 0; i < currentEnemy.statusEffects.length; i++) {
      if (currentEnemy.statusEffects[i].type === effect.type) {
        currentEnemy.statusEffects[i].turnsLeft = effect.duration;
        return;
      }
    }
    currentEnemy.statusEffects.push({ type: effect.type, damage: effect.damage || 0, turnsLeft: effect.duration });
  }

  function processPlayerEffects() {
    var totalDamage = 0;
    for (var i = playerEffects.length - 1; i >= 0; i--) {
      var eff = playerEffects[i];
      if (eff.type === "poison" || eff.type === "bleed") {
        Player.takeDamage(eff.damage);
        totalDamage += eff.damage;
        var label = eff.type === "poison" ? "Poison" : "Bleed";
        logBattle(label + " deals " + eff.damage + " damage to you!", "damage");
        if (eff.type === "poison") Audio.statusPoison();
      }
      eff.turnsLeft--;
      if (eff.turnsLeft <= 0) {
        playerEffects.splice(i, 1);
      }
    }
    return totalDamage;
  }

  function processEnemyEffects() {
    if (!currentEnemy.statusEffects) return false;
    var stunned = false;
    for (var i = currentEnemy.statusEffects.length - 1; i >= 0; i--) {
      var eff = currentEnemy.statusEffects[i];
      if (eff.type === "poison" || eff.type === "bleed") {
        currentEnemy.hp -= eff.damage;
        var label = eff.type === "poison" ? "Poison" : "Bleed";
        logBattle(label + " deals " + eff.damage + " to " + currentEnemy.name + "!", "heal");
        Audio.statusPoison();
      }
      if (eff.type === "stun") {
        stunned = true;
        logBattle(currentEnemy.name + " is stunned!", "info");
        Audio.statusStun();
      }
      eff.turnsLeft--;
      if (eff.turnsLeft <= 0) {
        currentEnemy.statusEffects.splice(i, 1);
      }
    }
    return stunned;
  }

  function isPlayerStunned() {
    for (var i = 0; i < playerEffects.length; i++) {
      if (playerEffects[i].type === "stun") return true;
    }
    return false;
  }

  // --- Player Actions ---
  function playerAttack() {
    if (!inBattle || !playerTurn) return;
    if (isPlayerStunned()) {
      logBattle("You are stunned and can't act!", "damage");
      Audio.statusStun();
      playerTurn = false;
      setCooldown();
      processPlayerEffects();
      renderBattle();
      UI.updateHeader();
      if (!Player.isAlive()) { defeat(); return; }
      setTimeout(function () { enemyTurn(); }, 600);
      return;
    }

    playerTurn = false;
    isDefending = false;
    setCooldown();

    var atk = Player.getTotalAttack();
    var variance = Math.floor(Math.random() * 3) - 1;
    var damage = Math.max(1, atk - currentEnemy.defense + variance);

    currentEnemy.hp -= damage;
    logBattle("You strike the " + currentEnemy.name + " for " + damage + " damage!", "damage");
    Audio.swordHit();

    if (currentEnemy.hp <= 0) {
      currentEnemy.hp = 0;
      renderBattle();
      victory();
      return;
    }

    processPlayerEffects();
    renderBattle();
    UI.updateHeader();
    if (!Player.isAlive()) { defeat(); return; }
    setTimeout(function () { enemyTurn(); }, 600);
  }

  function playerUseSkill(skillId) {
    if (!inBattle || !playerTurn) return;
    if (isPlayerStunned()) {
      logBattle("You are stunned and can't act!", "damage");
      Audio.statusStun();
      playerTurn = false;
      setCooldown();
      processPlayerEffects();
      renderBattle();
      UI.updateHeader();
      if (!Player.isAlive()) { defeat(); return; }
      setTimeout(function () { enemyTurn(); }, 600);
      return;
    }

    var skill = Skills.get(skillId);
    if (!skill) return;

    var data = Player.getData();
    if (data.mana < skill.manaCost) {
      logBattle("Not enough mana for " + skill.name + "!", "damage");
      return;
    }

    playerTurn = false;
    isDefending = false;
    setCooldown();
    data.mana -= skill.manaCost;

    if (skill.type === "attack") {
      var atk = Player.getTotalAttack();
      var variance = Math.floor(Math.random() * 3) - 1;
      var damage = Math.max(1, Math.floor((atk - currentEnemy.defense + variance) * skill.damageMultiplier));
      currentEnemy.hp -= damage;
      logBattle(skill.name + "! " + damage + " damage to " + currentEnemy.name + "!", "damage");
      Audio.swordHit();

      if (skill.appliesEffect) {
        applyStatusToEnemy(skill.appliesEffect);
        logBattle(currentEnemy.name + " is afflicted with " + skill.appliesEffect.type + "!", "info");
      }

      if (currentEnemy.hp <= 0) {
        currentEnemy.hp = 0;
        renderBattle();
        victory();
        return;
      }
    } else if (skill.type === "buff" && skill.effect === "defending") {
      isDefending = true;
      logBattle("You brace yourself, reducing incoming damage!", "info");
      Audio.buttonClick();
    } else if (skill.type === "heal") {
      Player.heal(skill.healAmount);
      logBattle(skill.name + "! Restored " + skill.healAmount + " HP!", "heal");
      Audio.heal();
    }

    processPlayerEffects();
    renderBattle();
    UI.updateHeader();
    if (!Player.isAlive()) { defeat(); return; }
    setTimeout(function () { enemyTurn(); }, 600);
  }

  function playerUsePotion() {
    if (!inBattle || !playerTurn) return;

    if (!Player.hasItem("health-potion")) {
      logBattle("No health potions left!", "damage");
      return;
    }

    playerTurn = false;
    isDefending = false;
    setCooldown();
    Player.removeItem("health-potion");
    Player.heal(30);
    logBattle("You drink a Health Potion. +30 HP!", "heal");
    Audio.potionDrink();

    processPlayerEffects();
    renderBattle();
    UI.updateHeader();
    if (!Player.isAlive()) { defeat(); return; }
    setTimeout(function () { enemyTurn(); }, 600);
  }

  function playerUseManaPotion() {
    if (!inBattle || !playerTurn) return;

    if (!Player.hasItem("mana-potion")) {
      logBattle("No mana potions left!", "damage");
      return;
    }

    playerTurn = false;
    setCooldown();
    Player.removeItem("mana-potion");
    Player.restoreMana(15);
    logBattle("You drink a Mana Potion. +15 MP!", "info");
    Audio.potionDrink();

    processPlayerEffects();
    renderBattle();
    UI.updateHeader();
    if (!Player.isAlive()) { defeat(); return; }
    setTimeout(function () { enemyTurn(); }, 600);
  }

  function playerRun() {
    if (!inBattle || !playerTurn) return;

    if (currentEnemy.isBoss) {
      logBattle("You can't run from a boss!", "damage");
      return;
    }

    var dex = Player.getTotalDexterity();
    var chance = 0.4 + (dex * 0.03);
    if (Math.random() < chance) {
      logBattle("You fled from the " + currentEnemy.name + "!", "info");
      Audio.runAway();
      endBattle();
      if (Dungeon.isInDungeon()) {
        UI.showScreen("dungeon");
        Dungeon.render();
      } else if (currentArea === "bandit-camp") {
        UI.showScreen("bandit-camp");
      } else {
        UI.showScreen("wilderness");
      }
    } else {
      playerTurn = false;
      setCooldown();
      logBattle("Failed to escape!", "damage");
      Audio.miss();
      setTimeout(function () { enemyTurn(); }, 600);
    }
  }

  // --- Enemy Turn ---
  function enemyTurn() {
    if (!inBattle || !currentEnemy || currentEnemy.hp <= 0) return;

    // Process enemy effects first
    var stunned = processEnemyEffects();
    if (currentEnemy.hp <= 0) {
      currentEnemy.hp = 0;
      renderBattle();
      victory();
      return;
    }
    if (stunned) {
      playerTurn = true;
      renderBattle();
      return;
    }

    // Check for special abilities
    var usedAbility = false;
    if (currentEnemy.abilities && currentEnemy.abilities.length > 0) {
      for (var i = 0; i < currentEnemy.abilities.length; i++) {
        var ability = currentEnemy.abilities[i];
        if (Math.random() < ability.chance) {
          // Self buff
          if (ability.selfBuff) {
            if (ability.selfBuff.attack) currentEnemy.attack += ability.selfBuff.attack;
            logBattle(ability.message, "damage");
            Audio.enemyHit();
            usedAbility = true;
            break;
          }

          // Attack with multiplier
          if (ability.multiplier) {
            var atkDmg = currentEnemy.attack;
            var playerDef = Player.getTotalDefense();
            if (isDefending) playerDef = Math.floor(playerDef * 1.5);
            var variance2 = Math.floor(Math.random() * 3) - 1;
            var damage2 = Math.max(1, Math.floor((atkDmg - playerDef + variance2) * ability.multiplier));
            if (isDefending) damage2 = Math.max(1, Math.floor(damage2 * 0.5));
            Player.takeDamage(damage2);
            logBattle(ability.message + " " + damage2 + " damage!", "damage");
            Audio.enemyHit();
            usedAbility = true;
            break;
          }

          // Status effect application
          if (ability.appliesEffect) {
            var normalDmg = doEnemyBasicDamage();
            applyStatusToPlayer(ability.appliesEffect);
            logBattle(ability.message, "damage");
            usedAbility = true;
            break;
          }
        }
      }
    }

    if (!usedAbility) {
      doEnemyBasicDamage();
    }

    isDefending = false;
    renderBattle();
    UI.updateHeader();

    if (!Player.isAlive()) {
      defeat();
      return;
    }

    playerTurn = true;
    renderBattle();
  }

  function doEnemyBasicDamage() {
    var enemyAtk = currentEnemy.attack;
    var playerDef = Player.getTotalDefense();
    if (isDefending) playerDef = Math.floor(playerDef * 1.5);
    var variance = Math.floor(Math.random() * 3) - 1;
    var damage = Math.max(1, enemyAtk - playerDef + variance);
    if (isDefending) damage = Math.max(1, Math.floor(damage * 0.5));
    Player.takeDamage(damage);
    logBattle("The " + currentEnemy.name + " hits you for " + damage + " damage!", "damage");
    Audio.enemyHit();
    return damage;
  }

  // --- Victory ---
  function victory() {
    inBattle = false;
    Audio.victory();

    var goldMin = currentEnemy.goldReward[0];
    var goldMax = currentEnemy.goldReward[1];
    var gold = goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1));
    Player.addGold(gold);
    logBattle("Victory! +" + gold + " gold.", "gold");

    var leveled = Player.addXp(currentEnemy.xpReward);
    logBattle("+" + currentEnemy.xpReward + " XP.", "xp");
    if (leveled) {
      logBattle("LEVEL UP! You are now level " + Player.getData().level + "!", "xp");
      Audio.levelUp();
    }

    Quests.progress(currentEnemy.id);

    // Loot drops - allow multiple
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
        }
      }
    }

    UI.updateHeader();

    // If in dungeon, handle multi-fight rooms
    if (Dungeon.isInDungeon()) {
      var moreFights = Dungeon.onBattleVictory();
      if (moreFights) return; // Another fight incoming
    }

    var actions = document.getElementById("battle-actions");
    if (actions) {
      actions.innerHTML = "";
      var btn = document.createElement("button");
      btn.className = "btn-primary";
      btn.textContent = "Continue";
      btn.addEventListener("click", function () {
        if (Dungeon.isInDungeon()) {
          UI.showScreen("dungeon");
          Dungeon.render();
        } else if (currentArea === "bandit-camp") {
          UI.showScreen("bandit-camp");
        } else {
          UI.showScreen("wilderness");
        }
      });
      actions.appendChild(btn);
    }
  }

  // --- Defeat ---
  function defeat() {
    inBattle = false;
    Audio.defeat();

    var data = Player.getData();
    var goldLost = Math.floor(data.gold * 0.1);
    data.gold -= goldLost;
    if (data.gold < 0) data.gold = 0;

    logBattle("You were defeated...", "damage");
    MessageLog.add("Defeated by " + currentEnemy.name + ". Lost " + goldLost + " gold.", "damage");

    UI.updateHeader();

    // Show game over screen
    var goScreen = document.getElementById("screen-gameover");
    if (goScreen) {
      var goldText = document.getElementById("gameover-gold-lost");
      if (goldText) goldText.textContent = goldLost;
      var enemyText = document.getElementById("gameover-enemy");
      if (enemyText) enemyText.textContent = currentEnemy.name;
    }

    var actions = document.getElementById("battle-actions");
    if (actions) {
      actions.innerHTML = "";
      var btn = document.createElement("button");
      btn.className = "btn-danger";
      btn.textContent = "You Died...";
      btn.addEventListener("click", function () {
        UI.showScreen("gameover");
      });
      actions.appendChild(btn);
    }
  }

  function endBattle() {
    inBattle = false;
    currentEnemy = null;
    playerEffects = [];
    isDefending = false;
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

  function getCurrentArea() {
    return currentArea;
  }

  return {
    start: start,
    startBoss: startBoss,
    playerAttack: playerAttack,
    playerUsePotion: playerUsePotion,
    playerUseManaPotion: playerUseManaPotion,
    playerUseSkill: playerUseSkill,
    playerRun: playerRun,
    isInBattle: isInBattle,
    renderBattle: renderBattle,
    getCurrentArea: getCurrentArea
  };
})();
