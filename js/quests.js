/* quests.js - Quest tracking and progression system */
var Quests = (function () {

  function accept(questId) {
    var p = Player.get();
    var def = Chapter1.getQuest(questId);
    if (!def) return false;
    if (p.activeQuests.indexOf(questId) !== -1) return false;

    // Board quests can repeat; regular quests cannot
    if (def.type !== "board" && p.completedQuests.indexOf(questId) !== -1) return false;

    // Check prerequisite flags
    if (def.requireFlags) {
      for (var i = 0; i < def.requireFlags.length; i++) {
        if (!Player.hasFlag(def.requireFlags[i])) return false;
      }
    }

    p.activeQuests.push(questId);
    // Init progress tracking for kill/collect objectives
    p.questProgress[questId] = {};
    for (var j = 0; j < def.objectives.length; j++) {
      var obj = def.objectives[j];
      if (obj.type === "kill") {
        p.questProgress[questId][obj.id] = 0;
      }
    }
    return true;
  }

  function isActive(questId) {
    return Player.get().activeQuests.indexOf(questId) !== -1;
  }

  function isComplete(questId) {
    return Player.get().completedQuests.indexOf(questId) !== -1;
  }

  /* Called after killing an enemy to update kill objectives */
  function progressKill(enemyId) {
    var p = Player.get();
    for (var i = 0; i < p.activeQuests.length; i++) {
      var qid = p.activeQuests[i];
      var def = Chapter1.getQuest(qid);
      if (!def) continue;
      for (var j = 0; j < def.objectives.length; j++) {
        var obj = def.objectives[j];
        if (obj.type === "kill" && obj.target === enemyId) {
          if (!p.questProgress[qid]) p.questProgress[qid] = {};
          if (!p.questProgress[qid][obj.id]) p.questProgress[qid][obj.id] = 0;
          p.questProgress[qid][obj.id]++;
        }
      }
    }
  }

  /* Check if all objectives of a quest are satisfied */
  function checkObjectives(questId) {
    var p = Player.get();
    var def = Chapter1.getQuest(questId);
    if (!def) return false;
    for (var i = 0; i < def.objectives.length; i++) {
      var obj = def.objectives[i];
      if (obj.type === "kill") {
        var progress = (p.questProgress[questId] && p.questProgress[questId][obj.id]) || 0;
        if (progress < obj.required) return false;
      } else if (obj.type === "collect") {
        if (Player.countItem(obj.item) < obj.required) return false;
      } else if (obj.type === "flag") {
        if (!Player.hasFlag(obj.flag)) return false;
      }
    }
    return true;
  }

  /* Turn in a completed quest for rewards */
  function turnIn(questId) {
    var p = Player.get();
    var def = Chapter1.getQuest(questId);
    if (!def) return null;
    if (!checkObjectives(questId)) return null;

    var idx = p.activeQuests.indexOf(questId);
    if (idx === -1) return null;

    // Remove collect items
    for (var i = 0; i < def.objectives.length; i++) {
      var obj = def.objectives[i];
      if (obj.type === "collect") {
        for (var c = 0; c < obj.required; c++) {
          Player.removeItem(obj.item);
        }
      }
    }

    // Grant rewards
    var rewards = def.rewards || {};
    if (rewards.gold) p.gold += rewards.gold;
    var leveled = false;
    if (rewards.xp) leveled = Player.addXp(rewards.xp);
    if (rewards.items) {
      for (var r = 0; r < rewards.items.length; r++) {
        if (!Player.addItem(rewards.items[r])) {
          UI.showMessage("Your inventory is full! Some quest rewards couldn't be picked up.");
          break;
        }
      }
    }

    // Complete quest
    p.activeQuests.splice(idx, 1);
    delete p.questProgress[questId];
    if (p.trackedQuest === questId) p.trackedQuest = null;

    // Board quests track completion separately (they're repeatable)
    if (def.type === "board") {
      if (!p.completedBoardQuests) p.completedBoardQuests = [];
      p.completedBoardQuests.push(questId + "-" + p.day);
      // Remove from board list
      if (p.boardQuests) {
        for (var bq = 0; bq < p.boardQuests.length; bq++) {
          if (p.boardQuests[bq].id === questId) {
            p.boardQuests.splice(bq, 1);
            break;
          }
        }
      }
    } else {
      p.completedQuests.push(questId);
    }

    // Set completion flags
    if (def.onComplete) {
      Player.setFlags(def.onComplete);
    }

    // Auto-accept next main quest in chain
    if (def.startsQuest) {
      accept(def.startsQuest);
    }

    return { rewards: rewards, leveled: leveled };
  }

  /* Get objective progress text */
  function getObjectiveStatus(questId, objIndex) {
    var p = Player.get();
    var def = Chapter1.getQuest(questId);
    if (!def || !def.objectives[objIndex]) return "";
    var obj = def.objectives[objIndex];
    if (obj.type === "kill") {
      var progress = (p.questProgress[questId] && p.questProgress[questId][obj.id]) || 0;
      return obj.text + " (" + Math.min(progress, obj.required) + "/" + obj.required + ")";
    } else if (obj.type === "collect") {
      var count = Player.countItem(obj.item);
      return obj.text + " (" + Math.min(count, obj.required) + "/" + obj.required + ")";
    } else if (obj.type === "flag") {
      var done = Player.hasFlag(obj.flag);
      return obj.text + (done ? " (Done)" : "");
    }
    return obj.text;
  }

  /* Get all quests available to accept on the quest board / from NPCs */
  function getAvailable() {
    var all = Chapter1.getAllQuests();
    var result = [];
    var p = Player.get();
    for (var key in all) {
      var q = all[key];
      if (p.activeQuests.indexOf(q.id) !== -1) continue;
      if (p.completedQuests.indexOf(q.id) !== -1) continue;
      // Check prerequisite flags
      var eligible = true;
      if (q.requireFlags) {
        for (var i = 0; i < q.requireFlags.length; i++) {
          if (!Player.hasFlag(q.requireFlags[i])) { eligible = false; break; }
        }
      }
      if (eligible) result.push(q);
    }
    return result;
  }

  /* Get active quests */
  function getActive() {
    var p = Player.get();
    var result = [];
    for (var i = 0; i < p.activeQuests.length; i++) {
      var def = Chapter1.getQuest(p.activeQuests[i]);
      if (def) result.push(def);
    }
    return result;
  }

  /* Set the tracked quest shown in the sidebar */
  function setTracked(questId) {
    var p = Player.get();
    p.trackedQuest = questId;
  }

  /* Get the tracked quest, or auto-pick the next logical one */
  function getTrackedOrNext() {
    var p = Player.get();
    // If tracked quest is still active, use it
    if (p.trackedQuest && p.activeQuests.indexOf(p.trackedQuest) !== -1) {
      return Chapter1.getQuest(p.trackedQuest);
    }
    // Otherwise pick first active main quest, then first side quest
    var firstMain = null;
    var firstSide = null;
    for (var i = 0; i < p.activeQuests.length; i++) {
      var def = Chapter1.getQuest(p.activeQuests[i]);
      if (!def) continue;
      if (def.type === "main" && !firstMain) firstMain = def;
      if (def.type === "side" && !firstSide) firstSide = def;
    }
    return firstMain || firstSide || null;
  }

  /* Get NPC turn-in info for a quest */
  function getTurnInInfo(questId) {
    var def = Chapter1.getQuest(questId);
    if (!def || !def.turnIn) return null;
    var npc = Chapter1.getNPC(def.turnIn);
    if (!npc) return null;
    // Map NPC ids to locations
    var npcLocations = {
      rowan: "Adventurers Guild",
      bram: "Weapon Shop",
      harlan: "Armor Shop",
      mira: "Potion Shop",
      toma: "Quest Board",
      elric: "Town (Guard Post)",
      elira: "Edge of Town"
    };
    return {
      npcName: npc.name,
      location: npcLocations[def.turnIn] || "Town"
    };
  }

  return {
    accept: accept,
    isActive: isActive,
    isComplete: isComplete,
    progressKill: progressKill,
    checkObjectives: checkObjectives,
    turnIn: turnIn,
    getObjectiveStatus: getObjectiveStatus,
    getAvailable: getAvailable,
    getActive: getActive,
    setTracked: setTracked,
    getTrackedOrNext: getTrackedOrNext,
    getTurnInInfo: getTurnInInfo
  };
})();
