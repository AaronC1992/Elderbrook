/* chapter1.js - All Chapter 1 story data: NPCs, locations, dialogues, flags */
var Chapter1 = (function () {

  /* ── NPC Definitions ── */
  var npcs = {
    rowan: {
      id: "rowan", name: "Guildmaster Rowan",
      portrait: "assets/portraits/main-town-guildmaster-npc.png",
      role: "Adventurers Guild leader", personality: "Steady, practical, slightly guarded."
    },
    bram: {
      id: "bram", name: "Bram Ironhand",
      portrait: "assets/portraits/main-town-weapon-shopkeep.png",
      role: "Weaponsmith", personality: "Blunt, dependable, dry humor."
    },
    harlan: {
      id: "harlan", name: "Harlan Stonevein",
      portrait: "assets/portraits/main-town-armor-shopkeep.png",
      role: "Armorer", personality: "Serious, battle-tested, no patience for fools."
    },
    mira: {
      id: "mira", name: "Mira Voss",
      portrait: "assets/portraits/main-town-potions-shopkeep.png",
      role: "Alchemist", personality: "Warm, curious, smart, observant."
    },
    toma: {
      id: "toma", name: "Toma Reed",
      portrait: "assets/portraits/toma.png",
      role: "Quest Board Clerk", personality: "Chatty, organized, a little nervous."
    },
    elric: {
      id: "elric", name: "Captain Elric Vale",
      portrait: "assets/portraits/elric.png",
      role: "Town Guard Captain", personality: "Overworked, honorable, suspicious of outsiders."
    },
    elira: {
      id: "elira", name: "Elira Ashfen",
      portrait: "assets/portraits/elira.png",
      role: "Mysterious Traveler", personality: "Calm, guarded, intelligent."
    },
    grisk: {
      id: "grisk", name: "Goblin Chief Grisk",
      portrait: "assets/portraits/goblin-king-enemy.png",
      role: "Chapter 1 Boss", personality: "Brutal, cunning, organized."
    }
  };

  /* ── Location Definitions ── */
  var locations = {
    elderbrook: {
      id: "elderbrook", name: "Elderbrook",
      description: "A quiet frontier town, your base of operations.",
      background: "assets/backgrounds/main-town.png",
      screen: "town", alwaysOpen: true
    },
    "forest-road": {
      id: "forest-road", name: "Forest Road",
      description: "A winding path through the woods. Goblins and wolves lurk here.",
      background: "assets/backgrounds/forest-road.png",
      enemies: ["wolf", "goblin-scout", "goblin-sneak"],
      requireFlag: "unlockedForestRoad"
    },
    "goblin-trail": {
      id: "goblin-trail", name: "Goblin Trail",
      description: "A rougher path leading toward the goblin caves. Stronger enemies patrol here.",
      background: "assets/backgrounds/goblin-trail.png",
      enemies: ["goblin-raider", "goblin-archer", "wolf-pack"],
      requireFlag: "unlockedGoblinTrail"
    },
    "goblin-cave": {
      id: "goblin-cave", name: "Goblin Cave",
      description: "A dark cave system teeming with goblins. The source of the raids.",
      background: "assets/backgrounds/goblin-cave-1.png",
      isDungeon: true,
      requireFlag: "unlockedGoblinCave"
    },
    "watch-post": {
      id: "watch-post", name: "Abandoned Watch Post",
      description: "An old guard outpost, overrun and left to ruin.",
      background: "assets/backgrounds/watch-post.png",
      enemies: ["goblin-raider", "goblin-guard", "goblin-sneak"],
      requireFlag: "unlockedWatchPost"
    },
    "riverbank": {
      id: "riverbank", name: "Riverbank Crossing",
      description: "A calm stretch of riverbank. Herbs grow along the water's edge.",
      background: "assets/backgrounds/riverbank.png",
      enemies: ["wolf", "goblin-scout"],
      isGathering: true,
      gatherItem: "cave-herb",
      requireFlag: "unlockedRiverbank"
    }
  };

  /* ── Default Story Flags ── */
  var defaultFlags = {
    metRowan: false,
    visitedBram: false,
    visitedHarlan: false,
    visitedMira: false,
    visitedQuestBoard: false,

    completedMQ1: false,
    acceptedMQ2: false, completedMQ2: false,
    acceptedMQ3: false, completedMQ3: false,
    acceptedMQ4: false, completedMQ4: false,
    acceptedMQ5: false, completedMQ5: false,
    acceptedMQ6: false, completedMQ6: false,
    acceptedMQ7: false, completedMQ7: false,
    acceptedMQ8: false, completedMQ8: false,

    unlockedForestRoad: false,
    unlockedGoblinTrail: false,
    unlockedGoblinCave: false,
    unlockedWatchPost: false,
    unlockedRiverbank: false,

    defeatedGrisk: false,
    recoveredRelic: false,
    metElira: false,
    chapter1Complete: false,

    foundSupplyNote: false,
    recoveredCrate: false,
    foundGoblinNest: false,
    foundStrangeSigil: false
  };

  /* ── Quest Definitions ── */
  var quests = {
    /* --- Main Quests --- */
    mq1: {
      id: "mq1", name: "A New Face in Town", type: "main",
      description: "Get to know Elderbrook. Visit the weapon shop, armor shop, potion shop, and the quest board, then report back to Rowan.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "v-bram", text: "Visit the Weapon Shop", type: "flag", flag: "visitedBram" },
        { id: "v-harlan", text: "Visit the Armor Shop", type: "flag", flag: "visitedHarlan" },
        { id: "v-mira", text: "Visit the Potion Shop", type: "flag", flag: "visitedMira" },
        { id: "v-board", text: "Check the Quest Board", type: "flag", flag: "visitedQuestBoard" }
      ],
      rewards: { xp: 30, gold: 25, items: ["health-potion"] },
      onComplete: ["completedMQ1", "unlockedForestRoad", "acceptedMQ2"],
      requireFlags: ["metRowan"]
    },
    mq2: {
      id: "mq2", name: "Goblin Nuisance", type: "main",
      description: "Goblin scouts have been harassing travelers on the Forest Road. Defeat 3 of them and report back to Rowan.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "kill-scouts", text: "Defeat Goblin Scouts on the Forest Road", type: "kill", target: "goblin-scout", required: 3 }
      ],
      rewards: { xp: 50, gold: 40 },
      onComplete: ["completedMQ2", "unlockedRiverbank", "acceptedMQ3"],
      requireFlags: ["completedMQ1"]
    },
    mq3: {
      id: "mq3", name: "Teeth and Tracks", type: "main",
      description: "Captain Elric reports missing supplies along the trade route. Investigate the Forest Road and recover a supply note.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "find-note", text: "Find the Supply Note (drops from goblins on Forest Road)", type: "collect", item: "supply-note", required: 1 }
      ],
      rewards: { xp: 60, gold: 50 },
      onComplete: ["completedMQ3", "unlockedGoblinTrail", "unlockedWatchPost", "acceptedMQ4"],
      requireFlags: ["completedMQ2"]
    },
    mq4: {
      id: "mq4", name: "Missing Crates", type: "main",
      description: "The supply note reveals goblins are stockpiling stolen goods along the Goblin Trail. Recover the stolen supply crate.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "get-crate", text: "Recover the Stolen Supply Crate (drops on Goblin Trail)", type: "collect", item: "stolen-supply-crate", required: 1 },
        { id: "kill-trail", text: "Defeat Goblins on the Goblin Trail", type: "kill", target: "goblin-raider", required: 5 }
      ],
      rewards: { xp: 80, gold: 60, items: ["reinforced-sword"] },
      onComplete: ["completedMQ4", "unlockedGoblinCave", "acceptedMQ5"],
      requireFlags: ["completedMQ3"]
    },
    mq5: {
      id: "mq5", name: "Trail to the Den", type: "main",
      description: "The stolen crates point to a goblin cave nearby. Enter the Goblin Cave and clear the outer guards.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "cave-guards", text: "Defeat Goblin Guards in the cave", type: "kill", target: "goblin-guard", required: 3 }
      ],
      rewards: { xp: 100, gold: 70, items: ["greater-health-potion"] },
      onComplete: ["completedMQ5", "acceptedMQ6"],
      requireFlags: ["completedMQ4"]
    },
    mq6: {
      id: "mq6", name: "Into the Dark", type: "main",
      description: "Push deeper into the Goblin Cave. Find evidence of who is leading the goblins.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "find-sigil", text: "Find the Strange Sigil in the cave depths", type: "collect", item: "strange-sigil", required: 1 }
      ],
      rewards: { xp: 120, gold: 80, items: ["iron-chestplate"] },
      onComplete: ["completedMQ6", "foundStrangeSigil", "acceptedMQ7"],
      requireFlags: ["completedMQ5"]
    },
    mq7: {
      id: "mq7", name: "Chief of the Hollow", type: "main",
      description: "The goblin chief lurks in the deepest chamber. Defeat Goblin Chief Grisk and uncover his orders.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "kill-grisk", text: "Defeat Goblin Chief Grisk", type: "kill", target: "goblin-chief-grisk", required: 1 }
      ],
      rewards: { xp: 200, gold: 150 },
      onComplete: ["completedMQ7", "defeatedGrisk", "recoveredRelic", "acceptedMQ8"],
      requireFlags: ["completedMQ6"]
    },
    mq8: {
      id: "mq8", name: "Echoes Beneath", type: "main",
      description: "Return the chief's relic and goblin orders to Guildmaster Rowan.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "return-relic", text: "Speak to Rowan in the Adventurers Guild", type: "flag", flag: "chapter1Complete" }
      ],
      rewards: { xp: 300, gold: 200 },
      onComplete: ["completedMQ8", "chapter1Complete"],
      requireFlags: ["completedMQ7"]
    },

    /* --- Side Quests --- */
    sq1: {
      id: "sq1", name: "Wolf Pelts for Mira", type: "side",
      description: "Mira needs wolf pelts for her alchemical experiments. Hunt wolves and bring back 4 pelts.",
      giver: "mira", turnIn: "mira",
      objectives: [
        { id: "pelts", text: "Collect Wolf Pelts", type: "collect", item: "wolf-pelt", required: 4 }
      ],
      rewards: { xp: 40, gold: 30, items: ["lesser-health-potion", "lesser-health-potion", "lesser-health-potion"] },
      requireFlags: ["completedMQ2"]
    },
    sq2: {
      id: "sq2", name: "Herbs by the Crossing", type: "side",
      description: "Mira is running low on reagents. Gather 5 cave herbs from the Riverbank Crossing.",
      giver: "mira", turnIn: "mira",
      objectives: [
        { id: "herbs", text: "Gather Cave Herbs", type: "collect", item: "cave-herb", required: 5 }
      ],
      rewards: { xp: 35, gold: 25, items: ["mana-potion", "mana-potion"] },
      requireFlags: ["completedMQ2"]
    },
    sq3: {
      id: "sq3", name: "Steel Lost on the Road", type: "side",
      description: "Harlan's latest armor shipment was stolen by goblins. Recover the stolen armor plates from the Goblin Trail.",
      giver: "harlan", turnIn: "harlan",
      objectives: [
        { id: "plates", text: "Recover Stolen Armor Plates", type: "collect", item: "goblin-scrap", required: 5 }
      ],
      rewards: { xp: 50, gold: 35, items: ["leather-chest"] },
      requireFlags: ["completedMQ3"]
    },
    sq4: {
      id: "sq4", name: "The Board Never Sleeps", type: "side",
      description: "Toma has a standing bounty: clear out goblin raiders from the roads.",
      giver: "toma", turnIn: "toma",
      objectives: [
        { id: "bounty", text: "Defeat Goblin Raiders", type: "kill", target: "goblin-raider", required: 6 }
      ],
      rewards: { xp: 60, gold: 50 },
      requireFlags: ["completedMQ3"]
    },
    sq5: {
      id: "sq5", name: "Shadows at the Watch Post", type: "side",
      description: "Captain Elric asks you to investigate the Abandoned Watch Post and recover a lost patrol badge.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "badge", text: "Find the Guard Badge at the Watch Post", type: "collect", item: "guard-badge", required: 1 }
      ],
      rewards: { xp: 55, gold: 45, items: ["iron-helm"] },
      requireFlags: ["completedMQ3"]
    },
    sq6: {
      id: "sq6", name: "Scrap for the Forge", type: "side",
      description: "Bram needs goblin scrap metal to repair equipment. Collect some from goblins.",
      giver: "bram", turnIn: "bram",
      objectives: [
        { id: "scrap", text: "Collect Goblin Scrap Metal", type: "collect", item: "goblin-scrap", required: 3 }
      ],
      rewards: { xp: 35, gold: 30, items: ["sharpened-dagger"] },
      requireFlags: ["completedMQ2"]
    }
  };

  /* ── Dialogue Trees ── */
  var dialogues = {
    "rowan-arrival": {
      id: "rowan-arrival",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Ah, a new face in Elderbrook. Come in, come in. I'm Rowan, Guildmaster of the Adventurers Guild." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "These are troubled times, friend. Goblin raids have been increasing, and the roads are no longer safe." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "If you're looking for work, we certainly have it. But first, get to know the town. Visit Bram's weapon shop, Harlan's armory, and Mira's potion shop. Check the quest board too." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Come back when you've had a look around. I'll have a proper job for you then." }
      ],
      onEnd: { flags: ["metRowan"], giveQuest: "mq1" }
    },
    "bram-first": {
      id: "bram-first",
      nodes: [
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "You the new adventurer? Name's Bram. I forge the best blades in Elderbrook, not that there's much competition." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Take a look at what I've got. You'll need something sharp if you're heading outside the walls." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "And between you and me, the goblins stole a shipment of my iron last week. If you happen to find any scrap metal out there, I'll make it worth your while." }
      ],
      onEnd: { flags: ["visitedBram"] }
    },
    "harlan-first": {
      id: "harlan-first",
      nodes: [
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "Another adventurer. Good. The last three didn't come back." },
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "I'm Harlan. I sell armor. Less talk, more buying, less dying. That's my motto." },
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "The danger out there is growing. Don't be a fool. Wear protection." }
      ],
      onEnd: { flags: ["visitedHarlan"] }
    },
    "mira-first": {
      id: "mira-first",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Oh! Hello there! I'm Mira, the town alchemist. Welcome to my little shop." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "I brew potions, salves, antidotes, all sorts of things. Health potions are essential if you're heading out to fight." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "I've noticed something strange about the goblins lately. They seem... organized. Almost like someone is directing them. But who would do such a thing?" }
      ],
      onEnd: { flags: ["visitedMira"] }
    },
    "toma-first": {
      id: "toma-first",
      nodes: [
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "Hi! I'm Toma, I run the quest board. Well, I organize it. Rowan does the important stuff." },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "When people need help, they post jobs here. Adventurers like you come and pick them up. Simple!" },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "There's been a lot more postings lately. Goblin trouble, mostly. Check back often, there's always work to do." }
      ],
      onEnd: { flags: ["visitedQuestBoard"] }
    },
    "rowan-mq1-complete": {
      id: "rowan-mq1-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Good, you've met the key people in town. You'll need their services in the days ahead." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Now then, let me tell you what's been happening. Goblin scouts have been spotted along the Forest Road, harassing travelers and merchants." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I need you to head out there and deal with them. Defeat at least three goblin scouts and report back. The road has to be secured." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Be careful out there. They're just scouts, but goblins can be nasty in packs." }
      ],
      onEnd: { flags: ["completedMQ1", "unlockedForestRoad", "acceptedMQ2"] }
    },
    "rowan-mq2-complete": {
      id: "rowan-mq2-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Well done. The Forest Road should be safer for now." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "But I've had concerning news from Captain Elric. Supply wagons have gone missing along that same route." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "This isn't just random raiding. Someone, or something, is organizing these goblins. I need you to investigate." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Head back to the Forest Road and look for clues. A supply manifest, orders, anything that explains why goblins are stealing specific goods." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I've also opened the quest board for additional contracts. Talk to the locals, they have their own problems you might help with." }
      ],
      onEnd: { flags: ["completedMQ2", "unlockedRiverbank", "acceptedMQ3"] }
    },
    "rowan-mq3-complete": {
      id: "rowan-mq3-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Let me see that note... Iron tools, food stores, leather, rope... This is a supply list. The goblins aren't just raiding, they're stockpiling." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "This changes things. There must be a larger camp or nest where they're taking everything." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Scouts reported goblin tracks leading along a trail east of the Forest Road. I'm calling it the Goblin Trail." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Follow that trail. Recover our missing supply crate and see where it leads. The answers are out there." }
      ],
      onEnd: { flags: ["completedMQ3", "unlockedGoblinTrail", "unlockedWatchPost", "acceptedMQ4"] }
    },
    "rowan-mq4-complete": {
      id: "rowan-mq4-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "You found the crate... and the trail leads to a cave. I was afraid of this." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "A goblin cave means a nest, a leader, a base of operations. This is bigger than scattered raids." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I need you to enter that cave and clear out the outer defenses. Be thorough. Report back anything unusual." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "And take supplies. The cave won't be kind to you." }
      ],
      onEnd: { flags: ["completedMQ4", "unlockedGoblinCave", "acceptedMQ5"] }
    },
    "rowan-mq5-complete": {
      id: "rowan-mq5-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "The outer guards have been dealt with. Good work." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "But the cave goes deeper. My gut tells me whoever is leading these goblins is still down there." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Push into the depths. Look for anything strange, symbols, orders, artifacts. Anything that tells us who is behind all this." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Be prepared for a real fight. This won't be like clearing scouts." }
      ],
      onEnd: { flags: ["completedMQ5", "acceptedMQ6"] }
    },
    "rowan-mq6-complete": {
      id: "rowan-mq6-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "A strange sigil? Let me see..." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I don't recognize this mark. It's not goblin craftsmanship, that's certain. Someone gave this to them." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "There's still a leader down there, a chief. The goblins won't stop until their commander falls." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Return to the cave depths. Find this chief and end this. Elderbrook is counting on you." }
      ],
      onEnd: { flags: ["completedMQ6", "foundStrangeSigil", "acceptedMQ7"] }
    },
    "rowan-mq7-complete": {
      id: "rowan-mq7-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "You defeated the goblin chief? Outstanding work, adventurer. I knew you had it in you." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Now, what did you find on him? Show me everything." }
      ],
      onEnd: { flags: ["completedMQ7", "defeatedGrisk", "recoveredRelic", "acceptedMQ8"] }
    },
    "chapter1-ending": {
      id: "chapter1-ending",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "A marked order scroll... and a map fragment. This is worse than I feared." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "These orders aren't written in any goblin tongue. Someone, something intelligent and powerful, was directing the goblins as tools." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "And this map... it marks locations far beyond Elderbrook. This threat extends well past our borders." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "May I see that?" },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Elira? You've been listening?" },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "I have. And I've seen this sigil before. In the ruins to the north, and in texts older than Elderbrook itself." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "If this mark has appeared here, then Elderbrook is only the beginning. Something ancient is stirring, and it's been using the goblins to prepare." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Then we have more work ahead of us. Much more." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Adventurer, you've proven yourself beyond measure. Elderbrook owes you a great debt." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Rest for now. When you're ready, we'll need to follow this map and uncover the truth. Whatever it takes." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "I'll be in touch. This road is far from over." }
      ],
      onEnd: { flags: ["chapter1Complete", "metElira"] }
    },

    /* --- NPC Random Lines (for repeat visits) --- */
    "bram-idle": {
      lines: [
        "Need something sharp? You've come to the right place.",
        "The blades are freshly honed. Take your pick.",
        "Goblins only respect steel. Make sure yours is good steel.",
        "I've got a new batch of reinforced swords. Proper quality."
      ]
    },
    "harlan-idle": {
      lines: [
        "Quality armor isn't cheap. But cheap armor gets you killed.",
        "Back from the field? Let me guess, need repairs.",
        "Good armor is an investment in your future.",
        "The danger outside grows every day. Protect yourself."
      ]
    },
    "mira-idle": {
      lines: [
        "Don't go out there without potions! Trust me on this.",
        "I've been studying the herbs from the riverbank. Fascinating properties.",
        "The goblins have been acting strangely. More organized than usual.",
        "Buy in bulk! The caves don't care if you're prepared or not."
      ]
    },
    "rowan-idle": {
      lines: [
        "The guild is here for you. Rest, plan, and prepare.",
        "Keep pushing forward. Elderbrook needs heroes.",
        "Check the quest board for additional work.",
        "Your reputation grows with each challenge you overcome."
      ]
    },
    "toma-idle": {
      lines: [
        "More postings every day! People really need help out there.",
        "Check back often, there's always new work on the board.",
        "I try to keep the board organized, but it's been busy lately.",
        "Good luck out there! I'm cheering for you."
      ]
    }
  };

  /* ── Public API ── */
  function getNPC(id) { return npcs[id] || null; }
  function getAllNPCs() { return npcs; }
  function getLocation(id) { return locations[id] || null; }
  function getAllLocations() { return locations; }
  function getQuest(id) { return quests[id] || null; }
  function getAllQuests() { return quests; }
  function getDialogue(id) { return dialogues[id] || null; }
  function getDefaultFlags() { return JSON.parse(JSON.stringify(defaultFlags)); }

  return {
    getNPC: getNPC,
    getAllNPCs: getAllNPCs,
    getLocation: getLocation,
    getAllLocations: getAllLocations,
    getQuest: getQuest,
    getAllQuests: getAllQuests,
    getDialogue: getDialogue,
    getDefaultFlags: getDefaultFlags
  };
})();
