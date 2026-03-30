/* battle.js - Turn-based combat system for Chapter 1 */
var Battle = (function () {

  var enemy = null;
  var battleLog = [];
  var playerBuffs = [];   // { stat, amount, turns }
  var enemyBuffs = [];
  var playerEffects = []; // { type, damage, turns }
  var enemyEffects = [];
  var isBossFight = false;
  var isDungeonBattle = false;
  var onVictoryCallback = null;
  var turnCount = 0;

  function start(areaId, callback) {
    var e = Enemies.getRandomForArea(areaId);
    if (!e) return false;
    enemy = e;
    isBossFight = !!e.isBoss;
    isDungeonBattle = false;
    onVictoryCallback = callback || null;
    resetState();
    renderBattle();
    UI.showScreen("battle");
    addLog("A " + enemy.name + " appears!");
    return true;
  }

  function startBoss(enemyId, callback) {
    var e = Enemies.getBoss(enemyId);
    if (!e) return false;
    enemy = e;
    isBossFight = true;
    isDungeonBattle = true;
    onVictoryCallback = callback || null;
    resetState();
    renderBattle();
    UI.showScreen("battle");
    addLog(enemy.name + " stands before you!");
    return true;
  }

  function startDungeonEnemy(enemyId, callback) {
    var template = Enemies.get(enemyId);
    if (!template) return false;
    enemy = JSON.parse(JSON.stringify(template));
    isBossFight = !!enemy.isBoss;
    isDungeonBattle = true;
    onVictoryCallback = callback || null;
    resetState();
    renderBattle();
    UI.showScreen("battle");
    addLog("A " + enemy.name + " blocks your path!");
    return true;
  }

  function resetState() {
    battleLog = [];
    playerBuffs = [];
    enemyBuffs = [];
    playerEffects = [];
    enemyEffects = [];
    turnCount = 0;
  }

  /* ── Player Actions ── */

  function playerAttack() {
    if (!enemy) return;
    var p = Player.get();
    var atk = Player.getTotalAttack() + getBuffTotal(playerBuffs, "attack");
    var def = enemy.defense + getBuffTotal(enemyBuffs, "defense");
    var dmg = Math.max(1, atk - def + Math.floor(Math.random() * 3));

    // Dexterity-based dodge chance for enemy
    var dodgeChance = 0.05;
    if (Math.random() < dodgeChance) {
      addLog("The " + enemy.name + " dodges your attack!");
      Audio.play("miss");
    } else {
      enemy.hp -= dmg;
      addLog("You hit " + enemy.name + " for " + dmg + " damage.");
      Audio.play("swordHit");
    }

    checkBattleEnd() || enemyTurn();
  }

  function playerUseSkill(skillId) {
    if (!enemy) return;
    var skill = Skills.get(skillId);
    if (!skill) return;
    var p = Player.get();
    if (p.mp < skill.mpCost) {
      addLog("Not enough MP!");
      return;
    }
    p.mp -= skill.mpCost;

    if (skill.type === "heal") {
      Player.heal(skill.healAmount);
      addLog("You use " + skill.name + " and restore " + skill.healAmount + " HP.");
      Audio.play("heal");
    } else if (skill.id === "meditate") {
      Player.restoreMana(skill.manaRestore);
      addLog("You meditate and restore " + skill.manaRestore + " MP.");
      Audio.play("heal");
    } else if (skill.type === "buff") {
      if (skill.buffType === "evasion") {
        playerBuffs.push({ stat: "evasion", amount: skill.buffAmount, turns: skill.buffDuration });
        addLog("You use " + skill.name + "! Evasion increased.");
      } else {
        playerBuffs.push({ stat: skill.buffType, amount: skill.buffAmount, turns: skill.buffDuration });
        addLog("You use " + skill.name + "! " + skill.buffType + " boosted.");
      }
      Audio.play("heal");
    } else if (skill.type === "attack" || skill.type === "magic") {
      var atk = Player.getTotalAttack() + getBuffTotal(playerBuffs, "attack");
      if (skill.intScaling) {
        atk = p.intelligence + getBuffTotal(playerBuffs, "attack");
      }
      var def = enemy.defense + getBuffTotal(enemyBuffs, "defense");
      var hits = skill.hits || 1;
      var totalDmg = 0;

      for (var h = 0; h < hits; h++) {
        var dmg = Math.max(1, Math.floor((atk - def) * skill.damageMultiplier) + Math.floor(Math.random() * 3));
        totalDmg += dmg;
      }

      enemy.hp -= totalDmg;
      addLog("You use " + skill.name + " dealing " + totalDmg + " damage!");
      Audio.play(skill.type === "magic" ? "magicCast" : "swordHit");

      // Apply effect
      if (skill.appliesEffect) {
        var eff = skill.appliesEffect;
        if (eff.type === "stun" && Math.random() < (eff.chance || 1)) {
          enemyEffects.push({ type: "stun", turns: eff.turns });
          addLog(enemy.name + " is stunned!");
          Audio.play("statusStun");
        } else if (eff.type === "poison") {
          enemyEffects.push({ type: "poison", damage: eff.damage, turns: eff.turns });
          addLog(enemy.name + " is poisoned!");
          Audio.play("statusPoison");
        }
      }
    }

    checkBattleEnd() || enemyTurn();
  }

  function playerUsePotion(itemId) {
    if (!enemy) return;
    var item = Items.get(itemId);
    if (!item || item.type !== "potion") return;
    if (!Player.hasItem(itemId)) { addLog("You don't have that!"); return; }

    Player.removeItem(itemId);

    if (item.subtype === "health") {
      Player.heal(item.healAmount);
      addLog("You drink " + item.name + " and restore " + item.healAmount + " HP.");
    } else if (item.subtype === "mana") {
      Player.restoreMana(item.manaAmount);
      addLog("You drink " + item.name + " and restore " + item.manaAmount + " MP.");
    }
    Audio.play("potionDrink");
    enemyTurn();
  }

  function playerRun() {
    if (isBossFight) {
      addLog("You can't run from a boss fight!");
      return;
    }
    var chance = 0.55 + (Player.get().dexterity * 0.03);
    if (Math.random() < chance) {
      addLog("You escaped!");
      Audio.play("runAway");
      endBattle(false);
    } else {
      addLog("Failed to escape!");
      Audio.play("miss");
      enemyTurn();
    }
  }

  /* ── Enemy Turn ── */

  function enemyTurn() {
    if (!enemy || enemy.hp <= 0) return;
    turnCount++;

    // Tick enemy status effects first
    tickEffects(enemyEffects, enemy, true);

    // Check stun
    var stunIdx = findEffect(enemyEffects, "stun");
    if (stunIdx !== -1) {
      addLog(enemy.name + " is stunned and can't act!");
      tickBuffs(enemyBuffs);
      tickBuffs(playerBuffs);
      tickPlayerEffects();
      renderBattle();
      return;
    }

    // Check for special ability
    var usedAbility = false;
    if (enemy.abilities && enemy.abilities.length > 0) {
      for (var a = 0; a < enemy.abilities.length; a++) {
        var ab = enemy.abilities[a];
        if (Math.random() < ab.chance) {
          if (ab.multiplier) {
            var atk = enemy.attack + getBuffTotal(enemyBuffs, "attack");
            var def = Player.getTotalDefense() + getBuffTotal(playerBuffs, "defense");
            var dmg = Math.max(1, Math.floor((atk - def) * ab.multiplier) + Math.floor(Math.random() * 2));

            // Check evasion
            var evasion = getBuffTotal(playerBuffs, "evasion");
            if (evasion > 0 && Math.random() * 100 < evasion) {
              addLog("You dodge " + enemy.name + "'s " + ab.name + "!");
              Audio.play("miss");
            } else {
              Player.takeDamage(dmg);
              addLog(enemy.name + " uses " + ab.name + " for " + dmg + " damage!");
              Audio.play("enemyHit");
            }
          }
          if (ab.buff) {
            enemyBuffs.push({ stat: ab.buff.stat, amount: ab.buff.amount, turns: ab.buff.turns });
            addLog(enemy.name + " uses " + ab.name + "!");
          }
          if (ab.effect) {
            if (ab.effect.type === "poison") {
              playerEffects.push({ type: "poison", damage: ab.effect.damage, turns: ab.effect.turns });
              addLog(enemy.name + " poisons you!");
              Audio.play("statusPoison");
            }
          }
          usedAbility = true;
          break;
        }
      }
    }

    if (!usedAbility) {
      // Normal attack
      var atk = enemy.attack + getBuffTotal(enemyBuffs, "attack");
      var def = Player.getTotalDefense() + getBuffTotal(playerBuffs, "defense");
      var dmg = Math.max(1, atk - def + Math.floor(Math.random() * 2));

      var evasion = getBuffTotal(playerBuffs, "evasion");
      if (evasion > 0 && Math.random() * 100 < evasion) {
        addLog("You dodge " + enemy.name + "'s attack!");
        Audio.play("miss");
      } else {
        Player.takeDamage(dmg);
        addLog(enemy.name + " attacks for " + dmg + " damage.");
        Audio.play("enemyHit");
      }
    }

    // Tick player effects (poison etc)
    tickPlayerEffects();
    tickBuffs(playerBuffs);
    tickBuffs(enemyBuffs);

    checkBattleEnd();
    renderBattle();
  }

  /* ── Status Effect Helpers ── */

  function tickEffects(effects, target, isEnemy) {
    for (var i = effects.length - 1; i >= 0; i--) {
      var e = effects[i];
      if (e.type === "poison" && e.damage) {
        target.hp -= e.damage;
        if (isEnemy) {
          addLog(target.name + " takes " + e.damage + " poison damage.");
        }
      }
      e.turns--;
      if (e.turns <= 0) effects.splice(i, 1);
    }
  }

  function tickPlayerEffects() {
    for (var i = playerEffects.length - 1; i >= 0; i--) {
      var e = playerEffects[i];
      if (e.type === "poison" && e.damage) {
        Player.takeDamage(e.damage);
        addLog("You take " + e.damage + " poison damage.");
      }
      e.turns--;
      if (e.turns <= 0) playerEffects.splice(i, 1);
    }
  }

  function tickBuffs(buffs) {
    for (var i = buffs.length - 1; i >= 0; i--) {
      buffs[i].turns--;
      if (buffs[i].turns <= 0) buffs.splice(i, 1);
    }
  }

  function getBuffTotal(buffs, stat) {
    var total = 0;
    for (var i = 0; i < buffs.length; i++) {
      if (buffs[i].stat === stat) total += buffs[i].amount;
    }
    return total;
  }

  function findEffect(effects, type) {
    for (var i = 0; i < effects.length; i++) {
      if (effects[i].type === type) return i;
    }
    return -1;
  }

  /* ── Battle End ── */

  function checkBattleEnd() {
    if (!enemy) return true;
    if (enemy.hp <= 0) {
      victory();
      return true;
    }
    if (Player.get().hp <= 0) {
      defeat();
      return true;
    }
    return false;
  }

  function victory() {
    var p = Player.get();
    var goldDrop = 0;
    if (enemy.gold) {
      goldDrop = enemy.gold[0] + Math.floor(Math.random() * (enemy.gold[1] - enemy.gold[0] + 1));
    }
    p.gold += goldDrop;
    var leveled = Player.addXp(enemy.xp);
    Player.recordKill(enemy.id);

    // Quest progress
    Quests.progressKill(enemy.id);

    addLog("You defeated " + enemy.name + "!");
    addLog("Gained " + enemy.xp + " XP and " + goldDrop + " gold.");
    if (leveled) {
      addLog("LEVEL UP! You are now level " + p.level + "!");
      Audio.play("levelUp");
    } else {
      Audio.play("victory");
    }

    // Loot drops
    var drops = [];
    if (enemy.loot) {
      for (var i = 0; i < enemy.loot.length; i++) {
        var l = enemy.loot[i];
        if (Math.random() < l.chance) {
          if (Player.addItem(l.id)) {
            var item = Items.get(l.id);
            drops.push(item ? item.name : l.id);
          }
        }
      }
    }
    if (drops.length > 0) {
      addLog("Loot: " + drops.join(", "));
    }

    renderBattle();
    showVictoryButtons();
  }

  function defeat() {
    addLog("You have been defeated...");
    Audio.play("defeat");
    renderBattle();
    showDefeatButtons();
  }

  function endBattle(won) {
    var cb = onVictoryCallback;
    enemy = null;
    onVictoryCallback = null;
    if (cb && won) {
      cb();
    } else if (!won && !isDungeonBattle) {
      World.navigate("elderbrook");
    }
  }

  /* ── Rendering ── */

  function renderBattle() {
    var p = Player.get();
    var container = document.getElementById("battle-content");
    if (!container || !enemy) return;

    var html = '';

    // Enemy info
    html += '<div class="battle-enemy">';
    html += '<img class="battle-portrait" src="' + (enemy.portrait || '') + '" alt="' + enemy.name + '" onerror="this.style.display=\'none\'">';
    html += '<div class="battle-enemy-info">';
    html += '<div class="battle-name">' + enemy.name + (enemy.isBoss ? ' (BOSS)' : '') + '</div>';
    html += '<div class="battle-hp-bar"><div class="hp-fill enemy-hp" style="width:' + Math.max(0, (enemy.hp / (Enemies.get(enemy.id) ? Enemies.get(enemy.id).hp : enemy.hp)) * 100) + '%"></div></div>';
    html += '<div class="battle-hp-text">' + Math.max(0, enemy.hp) + ' HP</div>';
    // Enemy effects
    if (enemyEffects.length > 0) {
      html += '<div class="battle-effects">';
      for (var e = 0; e < enemyEffects.length; e++) {
        html += '<span class="effect-tag effect-' + enemyEffects[e].type + '">' + enemyEffects[e].type + ' (' + enemyEffects[e].turns + ')</span>';
      }
      html += '</div>';
    }
    html += '</div></div>';

    // Player info in battle
    html += '<div class="battle-player">';
    html += '<div class="battle-player-info">';
    html += '<div class="battle-name">' + p.name + ' (Lv.' + p.level + ')</div>';
    html += '<div class="battle-hp-bar"><div class="hp-fill player-hp" style="width:' + (p.hp / p.maxHp * 100) + '%"></div></div>';
    html += '<div class="battle-hp-text">HP: ' + p.hp + '/' + p.maxHp + '</div>';
    html += '<div class="battle-mp-bar"><div class="mp-fill" style="width:' + (p.mp / p.maxMp * 100) + '%"></div></div>';
    html += '<div class="battle-mp-text">MP: ' + p.mp + '/' + p.maxMp + '</div>';
    // Player effects
    if (playerEffects.length > 0) {
      html += '<div class="battle-effects">';
      for (var pe = 0; pe < playerEffects.length; pe++) {
        html += '<span class="effect-tag effect-' + playerEffects[pe].type + '">' + playerEffects[pe].type + ' (' + playerEffects[pe].turns + ')</span>';
      }
      html += '</div>';
    }
    html += '</div></div>';

    // Battle log
    html += '<div class="battle-log">';
    var logStart = Math.max(0, battleLog.length - 6);
    for (var b = logStart; b < battleLog.length; b++) {
      html += '<div class="log-entry">' + battleLog[b] + '</div>';
    }
    html += '</div>';

    // Action buttons (only if battle still active)
    if (enemy.hp > 0 && p.hp > 0) {
      html += '<div class="battle-actions">';
      html += '<button class="btn" data-action="battle-attack">Attack</button>';
      html += '<button class="btn" data-action="battle-run"' + (isBossFight ? ' disabled' : '') + '>Run</button>';

      // Skills
      var availSkills = Skills.getAvailable(p.level);
      if (availSkills.length > 0) {
        html += '<div class="battle-skills">';
        for (var s = 0; s < availSkills.length; s++) {
          var sk = availSkills[s];
          var canUse = p.mp >= sk.mpCost;
          html += '<button class="btn btn-small battle-skill-btn" data-action="battle-skill" data-skill="' + sk.id + '"' + (canUse ? '' : ' disabled') + ' title="' + sk.description + ' (MP: ' + sk.mpCost + ')">' + sk.name + '</button>';
        }
        html += '</div>';
      }

      // Potions in inventory
      var potions = [];
      for (var pi = 0; pi < p.inventory.length; pi++) {
        var pItem = Items.get(p.inventory[pi]);
        if (pItem && pItem.type === "potion") {
          var exists = false;
          for (var cp = 0; cp < potions.length; cp++) {
            if (potions[cp].id === pItem.id) { potions[cp].count++; exists = true; break; }
          }
          if (!exists) potions.push({ id: pItem.id, name: pItem.name, count: 1 });
        }
      }
      if (potions.length > 0) {
        html += '<div class="battle-potions">';
        for (var pp = 0; pp < potions.length; pp++) {
          html += '<button class="btn btn-small" data-action="battle-potion" data-item="' + potions[pp].id + '">' + potions[pp].name + ' x' + potions[pp].count + '</button>';
        }
        html += '</div>';
      }

      html += '</div>';
    }

    container.innerHTML = html;
  }

  function showVictoryButtons() {
    var container = document.getElementById("battle-content");
    if (!container) return;
    var html = container.innerHTML;
    html += '<div class="battle-result"><button class="btn" data-action="battle-continue">Continue</button></div>';
    container.innerHTML = html;
  }

  function showDefeatButtons() {
    var container = document.getElementById("battle-content");
    if (!container) return;
    var html = container.innerHTML;
    html += '<div class="battle-result">';
    html += '<div class="defeat-text">You have fallen in battle.</div>';
    html += '<button class="btn" data-action="battle-revive">Return to Town</button>';
    html += '</div>';
    container.innerHTML = html;
  }

  function addLog(msg) {
    battleLog.push(msg);
  }

  function continueAfterVictory() {
    endBattle(true);
  }

  function reviveAtTown() {
    var p = Player.get();
    p.hp = Math.floor(p.maxHp * 0.3);
    p.mp = Math.floor(p.maxMp * 0.3);
    var goldLoss = Math.floor(p.gold * 0.1);
    p.gold = Math.max(0, p.gold - goldLoss);
    enemy = null;
    onVictoryCallback = null;
    World.navigate("elderbrook");
  }

  function getEnemy() { return enemy; }

  return {
    start: start,
    startBoss: startBoss,
    startDungeonEnemy: startDungeonEnemy,
    playerAttack: playerAttack,
    playerUseSkill: playerUseSkill,
    playerUsePotion: playerUsePotion,
    playerRun: playerRun,
    continueAfterVictory: continueAfterVictory,
    reviveAtTown: reviveAtTown,
    renderBattle: renderBattle,
    getEnemy: getEnemy
  };
})();
