/* quests.js - Quest definitions and tracking */
var Quests = (function () {
  var definitions = {
    // --- GOBLIN CAVE ---
    "goblin-menace": {
      id: "goblin-menace", name: "The Goblin Menace",
      description: "The village elder asks you to slay goblins threatening the outskirts.",
      type: "kill", target: "goblin", required: 10,
      rewards: { xp: 80, gold: 50, item: "iron-sword" }
    },
    "goblin-brute-bounty": {
      id: "goblin-brute-bounty", name: "Brute Force",
      description: "A bounty has been placed on the stronger goblins lurking deeper in the wilds.",
      type: "kill", target: "goblin-brute", required: 5,
      rewards: { xp: 120, gold: 80, item: null }
    },
    "goblin-assassin-hunt": {
      id: "goblin-assassin-hunt", name: "Shadow Stalkers",
      description: "Goblin assassins have been ambushing travelers on the roads. Eliminate them.",
      type: "kill", target: "goblin-assassin", required: 3,
      rewards: { xp: 100, gold: 60, item: "leather-armor" }
    },
    "goblin-king-slayer": {
      id: "goblin-king-slayer", name: "Dethrone the King",
      description: "The Goblin King must be stopped. Enter the depths of the cave and defeat him.",
      type: "kill", target: "goblin-king", required: 1,
      rewards: { xp: 250, gold: 150, item: "steel-sword" }
    },
    // --- BANDIT CAMP ---
    "bandit-problem": {
      id: "bandit-problem", name: "Highway Robbery",
      description: "Bandits are raiding merchant caravans. Clear them out.",
      type: "kill", target: "bandit", required: 8,
      rewards: { xp: 150, gold: 100, item: "iron-helm" }
    },
    "bandit-leader-bounty": {
      id: "bandit-leader-bounty", name: "Head of the Snake",
      description: "Take down the Bandit Leader to scatter their forces for good.",
      type: "kill", target: "bandit-leader", required: 1,
      rewards: { xp: 350, gold: 200, item: "iron-chestplate" }
    },
    // --- DARK FOREST ---
    "wolf-pack": {
      id: "wolf-pack", name: "The Wolf Pack",
      description: "Wolves are terrorizing travelers in the Dark Forest. Thin their numbers.",
      type: "kill", target: "wolf", required: 8,
      rewards: { xp: 200, gold: 120, item: "hunter-bow" }
    },
    "witch-hunt": {
      id: "witch-hunt", name: "Witch Hunt",
      description: "Forest witches have been cursing villagers. Track them down.",
      type: "kill", target: "forest-witch", required: 5,
      rewards: { xp: 250, gold: 150, item: "enchanted-staff" }
    },
    "forest-guardian-quest": {
      id: "forest-guardian-quest", name: "Heart of the Forest",
      description: "A corrupted Forest Guardian rages deep within. End its suffering.",
      type: "kill", target: "forest-guardian", required: 1,
      rewards: { xp: 500, gold: 300, item: "druid-robes" }
    },
    // --- HAUNTED RUINS ---
    "skeleton-scourge": {
      id: "skeleton-scourge", name: "Bones to Dust",
      description: "Undead skeletons pour from the ruins every night. Destroy them.",
      type: "kill", target: "skeleton", required: 10,
      rewards: { xp: 350, gold: 200, item: "wraith-helm" }
    },
    "wraith-hunt": {
      id: "wraith-hunt", name: "Wraith Hunt",
      description: "Wraiths haunt the upper chambers. They must be banished.",
      type: "kill", target: "wraith", required: 5,
      rewards: { xp: 400, gold: 250, item: "shadow-blade" }
    },
    "lich-lord-quest": {
      id: "lich-lord-quest", name: "Lord of the Dead",
      description: "The Lich Lord commands the undead from his throne of bones. Destroy him.",
      type: "kill", target: "lich-lord", required: 1,
      rewards: { xp: 800, gold: 500, item: "runed-armor" }
    },
    // --- DRAGON'S LAIR ---
    "dragon-slayer-quest": {
      id: "dragon-slayer-quest", name: "Dragon Slayer",
      description: "The Elder Wyrm threatens all of Elderbrook. End this once and for all.",
      type: "kill", target: "elder-wyrm", required: 1,
      rewards: { xp: 1200, gold: 800, item: "dragon-slayer" }
    },
    // --- SPECIAL ---
    "veteran-adventurer": {
      id: "veteran-adventurer", name: "Veteran Adventurer",
      description: "Prove your worth by reaching Level 10.",
      type: "level", target: null, required: 10,
      rewards: { xp: 500, gold: 300, item: "spirit-amulet" }
    }
  };

  function getDefinition(questId) {
    return definitions[questId] || null;
  }

  function getAllDefinitions() {
    return definitions;
  }

  function accept(questId) {
    var data = Player.getData();
    // Check not already active or completed
    for (var i = 0; i < data.questsActive.length; i++) {
      if (data.questsActive[i].id === questId) return false;
    }
    for (var i = 0; i < data.questsCompleted.length; i++) {
      if (data.questsCompleted[i] === questId) return false;
    }
    var def = definitions[questId];
    if (!def) return false;

    data.questsActive.push({
      id: questId,
      progress: 0
    });
    MessageLog.add("Quest accepted: " + def.name, "xp");
    return true;
  }

  function progress(enemyId) {
    var data = Player.getData();
    for (var i = 0; i < data.questsActive.length; i++) {
      var q = data.questsActive[i];
      var def = definitions[q.id];
      if (!def) continue;
      if (def.type === "kill" && enemyId.indexOf(def.target) === 0) {
        if (q.progress < def.required) {
          q.progress++;
          if (q.progress >= def.required) {
            MessageLog.add("Quest ready to turn in: " + def.name, "xp");
          }
        }
      }
    }
  }

  function checkLevelQuests() {
    var data = Player.getData();
    for (var i = 0; i < data.questsActive.length; i++) {
      var q = data.questsActive[i];
      var def = definitions[q.id];
      if (!def) continue;
      if (def.type === "level") {
        q.progress = data.level;
        if (q.progress >= def.required) {
          MessageLog.add("Quest ready to turn in: " + def.name, "xp");
        }
      }
    }
  }

  function canTurnIn(questId) {
    var data = Player.getData();
    for (var i = 0; i < data.questsActive.length; i++) {
      if (data.questsActive[i].id === questId) {
        var def = definitions[questId];
        if (!def) return false;
        return data.questsActive[i].progress >= def.required;
      }
    }
    return false;
  }

  function turnIn(questId) {
    if (!canTurnIn(questId)) return false;
    var data = Player.getData();
    var def = definitions[questId];

    // Remove from active
    for (var i = 0; i < data.questsActive.length; i++) {
      if (data.questsActive[i].id === questId) {
        data.questsActive.splice(i, 1);
        break;
      }
    }
    data.questsCompleted.push(questId);

    // Give rewards
    var leveled = Player.addXp(def.rewards.xp);
    Player.addGold(def.rewards.gold);
    MessageLog.add("Quest complete: " + def.name + "! +" + def.rewards.xp + " XP, +" + def.rewards.gold + " gold.", "gold");
    Audio.questComplete();

    if (def.rewards.item) {
      if (!Player.inventoryFull()) {
        Player.addItem(def.rewards.item);
        var ri = Items.get(def.rewards.item);
        MessageLog.add("Received " + (ri ? ri.name : def.rewards.item) + "!", "gold");
      } else {
        MessageLog.add("Inventory full! Reward item lost.", "damage");
      }
    }

    if (leveled) {
      MessageLog.add("LEVEL UP! You are now level " + Player.getData().level + "!", "xp");
    }

    return true;
  }

  function isActive(questId) {
    var data = Player.getData();
    for (var i = 0; i < data.questsActive.length; i++) {
      if (data.questsActive[i].id === questId) return true;
    }
    return false;
  }

  function isCompleted(questId) {
    var data = Player.getData();
    return data.questsCompleted.indexOf(questId) !== -1;
  }

  function getActiveProgress(questId) {
    var data = Player.getData();
    for (var i = 0; i < data.questsActive.length; i++) {
      if (data.questsActive[i].id === questId) return data.questsActive[i].progress;
    }
    return 0;
  }

  function renderQuestBoard() {
    var list = document.getElementById("quest-list");
    if (!list) return;
    list.innerHTML = "";

    var keys = Object.keys(definitions);
    for (var i = 0; i < keys.length; i++) {
      var def = definitions[keys[i]];
      var active = isActive(def.id);
      var completed = isCompleted(def.id);

      var card = document.createElement("div");
      card.className = "quest-card";

      var title = document.createElement("h3");
      title.textContent = def.name;
      card.appendChild(title);

      var desc = document.createElement("p");
      desc.textContent = def.description;
      card.appendChild(desc);

      var obj = document.createElement("p");
      obj.style.fontSize = "0.85em";
      var prog = active ? getActiveProgress(def.id) : 0;
      if (def.type === "level") {
        obj.textContent = "Objective: Reach Level " + def.required;
        if (active) obj.textContent += " (Current: " + Player.getData().level + ")";
      } else {
        var enemyTemplate = Enemies.get(def.target);
        obj.textContent = "Objective: Defeat " + def.required + " " + (enemyTemplate ? enemyTemplate.name : def.target) + "s";
        if (active) obj.textContent += " (" + prog + "/" + def.required + ")";
      }
      card.appendChild(obj);

      var rewards = document.createElement("p");
      rewards.style.fontSize = "0.85em";
      rewards.style.color = "#d4a438";
      rewards.textContent = "Rewards: " + def.rewards.xp + " XP, " + def.rewards.gold + " gold";
      if (def.rewards.item) {
        var ri = Items.get(def.rewards.item);
        rewards.textContent += ", " + (ri ? ri.name : def.rewards.item);
      }
      card.appendChild(rewards);

      if (completed) {
        var badge = document.createElement("p");
        badge.textContent = "COMPLETED";
        badge.style.color = "#4ade80";
        badge.style.fontWeight = "bold";
        card.appendChild(badge);
      } else if (active && canTurnIn(def.id)) {
        var turnInBtn = document.createElement("button");
        turnInBtn.className = "btn-primary";
        turnInBtn.textContent = "Turn In";
        turnInBtn.setAttribute("data-turnin", def.id);
        card.appendChild(turnInBtn);
      } else if (active) {
        var badge2 = document.createElement("p");
        badge2.textContent = "In Progress (" + prog + "/" + def.required + ")";
        badge2.style.color = "#60a5fa";
        card.appendChild(badge2);
      } else {
        var acceptBtn = document.createElement("button");
        acceptBtn.className = "btn-primary";
        acceptBtn.textContent = "Accept Quest";
        acceptBtn.setAttribute("data-accept-quest", def.id);
        card.appendChild(acceptBtn);
      }

      list.appendChild(card);
    }

    renderActiveQuests();
  }

  function renderActiveQuests() {
    var container = document.getElementById("active-quests");
    if (!container) return;
    container.innerHTML = "";

    var data = Player.getData();
    if (data.questsActive.length === 0) {
      container.innerHTML = "<p style='color:#888;'>No active quests.</p>";
      return;
    }

    for (var i = 0; i < data.questsActive.length; i++) {
      var q = data.questsActive[i];
      var def = definitions[q.id];
      if (!def) continue;

      var p = document.createElement("p");
      p.textContent = def.name + " - " + q.progress + "/" + def.required;
      p.style.color = q.progress >= def.required ? "#4ade80" : "#60a5fa";
      container.appendChild(p);
    }
  }

  function handleClick(e) {
    var target = e.target;
    var acceptId = target.getAttribute("data-accept-quest");
    if (acceptId) {
      accept(acceptId);
      renderQuestBoard();
      return;
    }
    var turnInId = target.getAttribute("data-turnin");
    if (turnInId) {
      turnIn(turnInId);
      renderQuestBoard();
      UI.updateHeader();
      return;
    }
  }

  return {
    progress: progress,
    checkLevelQuests: checkLevelQuests,
    renderQuestBoard: renderQuestBoard,
    handleClick: handleClick,
    isActive: isActive,
    isCompleted: isCompleted
  };
})();
