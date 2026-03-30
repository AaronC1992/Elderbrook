/* dialogue.js - NPC dialogue system */
var Dialogue = (function () {
  var dialogues = {
    "weapon-shopkeep": {
      greeting: [
        "Ah, a customer! Looking for something sharp?",
        "Welcome back. The blades are freshly honed.",
        "Need a new weapon? You've come to the right place.",
        "I've got steel that'll cut through goblin hide like butter."
      ],
      browse: [
        "Take your time. Every weapon has its own personality.",
        "That iron sword is a bestseller among adventurers.",
        "The steel blade costs more, but it's worth every coin."
      ],
      broke: [
        "Come back when you've got the coin, friend.",
        "I don't do charity. Gold first, steel second."
      ]
    },
    "armor-shopkeep": {
      greeting: [
        "You look like you could use better protection.",
        "Welcome to the finest armor shop in Elderbrook!",
        "Step right in. I've got something for every budget.",
        "Back from the caves? Let me guess... need repairs?"
      ],
      browse: [
        "Iron plate will keep you alive longer out there.",
        "Good armor is an investment in your future.",
        "That leather set is light but surprisingly tough."
      ],
      broke: [
        "Quality armor isn't cheap, friend. Come back with more gold.",
        "Can't protect you for free. The materials alone cost a fortune."
      ]
    },
    "potion-shopkeep": {
      greeting: [
        "Potions! Elixirs! Everything a wise adventurer needs!",
        "Don't go into those caves without a potion or three.",
        "Welcome! My brews will keep you on your feet.",
        "Ah, you look like someone who values staying alive!"
      ],
      browse: [
        "Health potions are essential. Never leave town without them.",
        "Mana potions will keep your skills flowing in battle.",
        "Buy in bulk! The caves don't care if you're prepared or not."
      ],
      broke: [
        "No gold, no potions. That's the deal.",
        "I've got a business to run! Come back with coin."
      ]
    },
    "guildmaster": {
      greeting: [
        "Welcome to the Adventurers Guild, traveler.",
        "Rest here, take a quest, or just warm yourself by the fire.",
        "The guild always needs capable adventurers.",
        "Another brave soul seeking glory? Good. We need you."
      ],
      quest: [
        "Check the quest board. There's always work to be done.",
        "Goblins have been getting bolder. We need them dealt with.",
        "Complete your quests and the guild will reward you well."
      ],
      rest: [
        "Rest well. The road ahead won't be easy.",
        "A good night's sleep can save your life out there.",
        "You've earned some rest. The fire's warm tonight."
      ]
    }
  };

  var lastShown = {};

  function getLine(npcId, category) {
    var npc = dialogues[npcId];
    if (!npc) return "";
    var lines = npc[category];
    if (!lines || lines.length === 0) return "";

    // Avoid repeating the same line twice in a row
    var key = npcId + "-" + category;
    var idx;
    do {
      idx = Math.floor(Math.random() * lines.length);
    } while (lines.length > 1 && idx === lastShown[key]);

    lastShown[key] = idx;
    return lines[idx];
  }

  function renderDialogue(containerId, npcId, category) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var line = getLine(npcId, category);
    el.textContent = '"' + line + '"';
    el.className = "npc-dialogue";
  }

  return {
    getLine: getLine,
    renderDialogue: renderDialogue
  };
})();
