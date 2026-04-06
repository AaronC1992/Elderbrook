/* chapter1.js - All Chapter 1 story data: NPCs, locations, dialogues, flags */
var Chapter1 = (function () {

  /* ── NPC Definitions ── */
  var npcs = {
    rowan: {
      id: "rowan", name: "Guildmaster Rowan",
      portrait: "assets/portraits/rowan.png",
      role: "Adventurers Guild leader", personality: "Steady, practical, slightly guarded."
    },
    bram: {
      id: "bram", name: "Bram Ironhand",
      portrait: "assets/portraits/bram.png",
      role: "Weaponsmith", personality: "Blunt, dependable, dry humor."
    },
    harlan: {
      id: "harlan", name: "Harlan Stonevein",
      portrait: "assets/portraits/harlan.png",
      role: "Armorer", personality: "Serious, battle-tested, no patience for fools."
    },
    mira: {
      id: "mira", name: "Mira Voss",
      portrait: "assets/portraits/mira.png",
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
      recommendedLevel: "Lv. 1-3",
      requireFlag: "unlockedForestRoad"
    },
    "goblin-trail": {
      id: "goblin-trail", name: "Goblin Trail",
      description: "A rougher path leading toward the goblin caves. Stronger enemies patrol here.",
      background: "assets/backgrounds/goblin-trail.png",
      enemies: ["goblin-raider", "goblin-archer", "wolf-pack"],
      recommendedLevel: "Lv. 3-5",
      requireFlag: "unlockedGoblinTrail"
    },
    "goblin-cave": {
      id: "goblin-cave", name: "Goblin Cave",
      description: "A dark cave system teeming with goblins. The source of the raids.",
      background: "assets/backgrounds/goblin-cave-1.png",
      isDungeon: true,
      recommendedLevel: "Lv. 5-8",
      requireFlag: "unlockedGoblinCave"
    },
    "watch-post": {
      id: "watch-post", name: "Abandoned Watch Post",
      description: "An old guard outpost, overrun and left to ruin.",
      background: "assets/backgrounds/watch-post.png",
      enemies: ["goblin-raider", "goblin-guard", "goblin-sneak"],
      recommendedLevel: "Lv. 3-5",
      requireFlag: "unlockedWatchPost"
    },
    "riverbank": {
      id: "riverbank", name: "Riverbank Crossing",
      description: "A calm stretch of riverbank. Herbs grow along the water's edge.",
      background: "assets/backgrounds/riverbank.png",
      enemies: ["wolf", "goblin-scout"],
      isGathering: true,
      gatherItem: "cave-herb",
      recommendedLevel: "Lv. 1-3",
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
    foundStrangeSigil: false,

    /* Relationship milestones */
    miraRomantic: false,
    tomaRomantic: false,
    eliraRomantic: false,
    bramRomantic: false,
    harlanRomantic: false,
    elricRomantic: false,

    /* NPC quest chains */
    completedCQ1: false, completedCQ2: false, completedCQ3: false,
    completedCQ4: false, completedCQ5: false, completedCQ6: false,
    bramForgeUnlocked: false, miraLabUnlocked: false, elricPatrolRoute: false,

    /* Build / Difficulty */
    choseBuild: false,

    /* Town events */
    townEventMerchant: false, townEventBard: false, townEventRumor: false
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
      startsQuest: "mq2",
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
      startsQuest: "mq3",
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
      startsQuest: "mq4",
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
      startsQuest: "mq5",
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
      startsQuest: "mq6",
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
      startsQuest: "mq7",
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
      startsQuest: "mq8",
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
    },

    /* --- NPC Chain Quests --- */
    cq1: {
      id: "cq1", name: "Bram's Old Anvil", type: "chain",
      description: "Bram wants to restore his grandfather's anvil. Bring him iron ore from the caves.",
      giver: "bram", turnIn: "bram",
      objectives: [
        { id: "ore", text: "Collect Iron Ore", type: "collect", item: "iron-ore", required: 3 }
      ],
      rewards: { xp: 45, gold: 35 },
      onComplete: ["completedCQ1"],
      startsQuest: "cq2",
      requireFlags: ["completedMQ3"]
    },
    cq2: {
      id: "cq2", name: "Bram's Master Work", type: "chain",
      description: "With the anvil restored, Bram can forge something special. Bring him beast sinew and an enchanted shard.",
      giver: "bram", turnIn: "bram",
      objectives: [
        { id: "sinew", text: "Collect Beast Sinew", type: "collect", item: "beast-sinew", required: 2 },
        { id: "shard", text: "Find an Enchanted Shard", type: "collect", item: "enchanted-shard", required: 1 }
      ],
      rewards: { xp: 80, gold: 50, items: ["tempered-sword"] },
      onComplete: ["completedCQ2", "bramForgeUnlocked"],
      requireFlags: ["completedCQ1"]
    },
    cq3: {
      id: "cq3", name: "Mira's Experiment", type: "chain",
      description: "Mira is testing a new formula. She needs cave herbs and shadow essence from the goblin shaman.",
      giver: "mira", turnIn: "mira",
      objectives: [
        { id: "herbs", text: "Gather Cave Herbs", type: "collect", item: "cave-herb", required: 3 },
        { id: "essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 1 }
      ],
      rewards: { xp: 50, gold: 40, items: ["antidote", "antidote"] },
      onComplete: ["completedCQ3"],
      startsQuest: "cq4",
      requireFlags: ["completedMQ4"]
    },
    cq4: {
      id: "cq4", name: "Mira's Breakthrough", type: "chain",
      description: "Mira's experiment is a success! She can now brew enhanced potions. But she needs more rare materials to set up production.",
      giver: "mira", turnIn: "mira",
      objectives: [
        { id: "more-essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 2 },
        { id: "more-herbs", text: "Gather Cave Herbs", type: "collect", item: "cave-herb", required: 5 }
      ],
      rewards: { xp: 70, gold: 60, items: ["greater-health-potion", "mana-potion", "smelling-salts"] },
      onComplete: ["completedCQ4", "miraLabUnlocked"],
      requireFlags: ["completedCQ3"]
    },
    cq5: {
      id: "cq5", name: "Elric's Patrol Route", type: "chain",
      description: "Captain Elric wants to re-establish a patrol route. Clear wolves from the Forest Road and Goblin Trail.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "wolves-road", text: "Defeat Wolves on Forest Road", type: "kill", target: "wolf", required: 5 },
        { id: "wolves-pack", text: "Defeat Wolf Pack Leaders", type: "kill", target: "wolf-pack", required: 2 }
      ],
      rewards: { xp: 65, gold: 55, items: ["iron-leggings"] },
      onComplete: ["completedCQ5"],
      startsQuest: "cq6",
      requireFlags: ["completedMQ4"]
    },
    cq6: {
      id: "cq6", name: "Securing the Route", type: "chain",
      description: "The wolves are cleared. Elric now needs the Watch Post reclaimed. Defeat the goblin squatters.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "clear-post", text: "Defeat Goblins at the Watch Post", type: "kill", target: "goblin-guard", required: 4 },
        { id: "badge2", text: "Recover another Guard Badge", type: "collect", item: "guard-badge", required: 1 }
      ],
      rewards: { xp: 90, gold: 70, items: ["iron-gloves"] },
      onComplete: ["completedCQ6", "elricPatrolRoute"],
      requireFlags: ["completedCQ5"]
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
        { speaker: "", portrait: "", text: "What do you want to do about it?", choices: [
          { text: "I'll handle it. Point me to the road.", next: 3 },
          { text: "Sounds dangerous. What's the pay?", next: 4 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Good. Defeat at least three goblin scouts and report back. The road has to be secured. Be careful out there." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Fair enough. The guild pays for results, 40 gold and experience. Defeat at least three goblin scouts on the Forest Road. Be careful, they're nasty in packs." }
      ],
      onEnd: { flags: ["completedMQ1", "unlockedForestRoad", "acceptedMQ2"] }
    },
    "rowan-mq2-complete": {
      id: "rowan-mq2-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Well done. The Forest Road should be safer for now." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "But I've had concerning news from Captain Elric. Supply wagons have gone missing along that same route." },
        { speaker: "", portrait: "", text: "Organized goblins? That's unusual.", choices: [
          { text: "Someone must be pulling the strings.", next: 3 },
          { text: "Goblins aren't smart enough for that on their own.", next: 3 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "My thoughts exactly. I need you to investigate. Head back to the Forest Road and look for clues, a supply manifest, orders, anything." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I've also opened the quest board for additional contracts. Talk to the locals, they have their own problems you might help with." }
      ],
      onEnd: { flags: ["completedMQ2", "unlockedRiverbank", "acceptedMQ3"] }
    },
    "rowan-mq3-complete": {
      id: "rowan-mq3-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Let me see that note... Iron tools, food stores, leather, rope... This is a supply list. The goblins aren't just raiding, they're stockpiling." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "This changes things. There must be a larger camp or nest where they're taking everything." },
        { speaker: "", portrait: "", text: "Where do we go from here?", choices: [
          { text: "I'll track them down. Where are the tracks?", next: 3 },
          { text: "Should we get Elric's guards involved?", next: 4 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Scouts reported goblin tracks leading east. Follow the Goblin Trail, recover our supply crate, and see where it leads." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Elric's guards are stretched thin already. You're the best we've got. Follow the Goblin Trail east and recover that supply crate. Be ready for a fight." }
      ],
      onEnd: { flags: ["completedMQ3", "unlockedGoblinTrail", "unlockedWatchPost", "acceptedMQ4"] }
    },
    "rowan-mq4-complete": {
      id: "rowan-mq4-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "You found the crate... and the trail leads to a cave. I was afraid of this." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "A goblin cave means a nest, a leader, a base of operations. This is bigger than scattered raids." },
        { speaker: "", portrait: "", text: "A cave. This just got serious.", choices: [
          { text: "I'll clear it out. Every last one of them.", next: 3 },
          { text: "What should I expect in there?", next: 4 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "That's the spirit. Clear the outer defenses and report back anything unusual. And take supplies, the cave won't be kind." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Tougher goblins, guards, maybe a shaman. Tight quarters, no running. Clear the outer defenses first and report back. Stock up on potions before you go." }
      ],
      onEnd: { flags: ["completedMQ4", "unlockedGoblinCave", "acceptedMQ5"] }
    },
    "rowan-mq5-complete": {
      id: "rowan-mq5-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "The outer guards have been dealt with. Good work." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "But the cave goes deeper. My gut tells me whoever is leading these goblins is still down there." },
        { speaker: "", portrait: "", text: "Something doesn't add up about all this.", choices: [
          { text: "I found signs of something bigger down there. I'm going back in.", next: 3 },
          { text: "Do you think it's just goblins, or is something else involved?", next: 4 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Good instincts. Push into the depths and find evidence. Symbols, orders, artifacts, anything that tells us who is really behind this." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I've been wondering that myself. Goblins don't stockpile or coordinate like this on their own. Find proof. Look for symbols, orders, anything unusual in the depths." }
      ],
      onEnd: { flags: ["completedMQ5", "acceptedMQ6"] }
    },
    "rowan-mq6-complete": {
      id: "rowan-mq6-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "A strange sigil? Let me see..." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I don't recognize this mark. It's not goblin craftsmanship, that's certain. Someone gave this to them." },
        { speaker: "", portrait: "", text: "This sigil feels... wrong. Like it doesn't belong here.", choices: [
          { text: "Whatever it means, the chief needs to go.", next: 3 },
          { text: "We should learn more about this sigil first.", next: 4 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Agreed. Return to the cave depths. Find this goblin chief and end this. Elderbrook is counting on you." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I'll look into it. But right now, the goblins won't stop until their chief falls. Get back in that cave and finish what you started. We'll study the sigil after." }
      ],
      onEnd: { flags: ["completedMQ6", "foundStrangeSigil", "acceptedMQ7"] }
    },
    "rowan-mq7-complete": {
      id: "rowan-mq7-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "You defeated the goblin chief? Outstanding work, adventurer. I knew you had it in you." },
        { speaker: "", portrait: "", text: "It wasn't easy. Grisk was no ordinary goblin.", choices: [
          { text: "He had orders from someone else. Here, look at this.", next: 2 },
          { text: "He fought hard. But I found something important on him.", next: 2 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Show me everything. Every scrap you found." }
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
        { speaker: "", portrait: "", text: "Something ancient...", choices: [
          { text: "Whatever it is, I'll face it. Elderbrook is my home now.", next: 8 },
          { text: "Then we need to be ready. All of us.", next: 8 }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Well said. You've proven yourself beyond measure. Elderbrook owes you a great debt." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Rest for now. When you're ready, we'll need to follow this map and uncover the truth. Whatever it takes." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "I'll be in touch. This road is far from over." }
      ],
      onEnd: { flags: ["chapter1Complete", "metElira"] }
    },

    /* --- Side Quest Turn-In Dialogues --- */
    "sq1-complete": {
      id: "sq1-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "You brought the pelts! Oh, these are perfect specimens. The follicle structure is still intact." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "I can extract compounds from these that most alchemists only read about. You have my thanks, truly." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Here, take these potions. You've more than earned them." }
      ]
    },
    "sq2-complete": {
      id: "sq2-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Cave herbs! And in such good condition. You have a gentle hand for someone who swings a weapon all day." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "These will keep my shop stocked for weeks. Take some mana potions as thanks." }
      ]
    },
    "sq3-complete": {
      id: "sq3-complete",
      nodes: [
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "You found my shipment? Well, what's left of it. Goblins don't know how to handle proper steel." },
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "Still, it's salvageable. I owe you one. Here, take this. You'll need it more than my shelf does." }
      ]
    },
    "sq4-complete": {
      id: "sq4-complete",
      nodes: [
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "Six raiders down! That's incredible. I'll update the board right away." },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "The merchants will be so relieved. Here's your bounty, well deserved!" }
      ]
    },
    "sq5-complete": {
      id: "sq5-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "You found the badge. Sergeant Hale's. He was a good man." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "At least now his family will have closure. I won't forget this, adventurer. Take this helm, it was meant for our next recruit, but you've earned it." }
      ]
    },
    "sq6-complete": {
      id: "sq6-complete",
      nodes: [
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Goblin scrap! Don't let the name fool you, there's usable iron in here." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "I'll melt this down and turn it into something proper. Here, I sharpened this dagger for you. Finest edge you'll find." }
      ]
    },

    /* --- NPC Random Lines (for repeat visits) --- */
    "bram-idle": {
      lines: [
        "Need something sharp? You've come to the right place.",
        "The blades are freshly honed. Take your pick.",
        "Goblins only respect steel. Make sure yours is good steel.",
        "I've got a new batch of reinforced swords. Proper quality.",
        "Every blade I forge tells a story. Yours is just beginning.",
        "A dull edge gets you killed faster than no edge at all.",
        "I once forged sixty swords in a single week. Supply contract for Elric's guards.",
        "If the goblins keep raiding, I might have to start charging double."
      ]
    },
    "harlan-idle": {
      lines: [
        "Quality armor isn't cheap. But cheap armor gets you killed.",
        "Back from the field? Let me guess, need repairs.",
        "Good armor is an investment in your future.",
        "The danger outside grows every day. Protect yourself.",
        "I've seen what happens to adventurers who skip the armory. It's not pretty.",
        "Iron holds better than leather, but leather's lighter. Choose your poison.",
        "My grandfather forged armor for the old king's guard. The Stonevein name means something.",
        "Check the joints and buckles. That's where cheap armor fails first."
      ]
    },
    "mira-idle": {
      lines: [
        "Don't go out there without potions! Trust me on this.",
        "I've been studying the herbs from the riverbank. Fascinating properties.",
        "The goblins have been acting strangely. More organized than usual.",
        "Buy in bulk! The caves don't care if you're prepared or not.",
        "I'm working on a new antivenom formula. The goblin shamans use a nasty toxin.",
        "Did you know cave herbs can be brewed into both healing draughts and poisons? Alchemy is about intent.",
        "My mother was an alchemist too. She always said curiosity is the best ingredient.",
        "There's a rare moonpetal that grows near the cave entrance. If you see one, I'd pay well for it."
      ]
    },
    "rowan-idle": {
      lines: [
        "The guild is here for you. Rest, plan, and prepare.",
        "Keep pushing forward. Elderbrook needs heroes.",
        "Check the quest board for additional work.",
        "Your reputation grows with each challenge you overcome.",
        "I've been Guildmaster for twelve years. These goblin raids are the worst I've seen.",
        "Don't forget to upgrade your gear. A stronger foe waits around every corner.",
        "The other frontier towns have gone quiet. That worries me more than the goblins.",
        "You remind me of an adventurer I knew years ago. She had that same determination."
      ]
    },
    "toma-idle": {
      lines: [
        "More postings every day! People really need help out there.",
        "Check back often, there's always new work on the board.",
        "I try to keep the board organized, but it's been busy lately.",
        "Good luck out there! I'm cheering for you.",
        "I organize the quests by urgency. The red-marked ones are time-sensitive!",
        "Sometimes I wish I could go on an adventure too. But someone has to manage things here.",
        "The merchants are offering better bounties now that the roads are dangerous.",
        "Rowan says you're making real progress. Keep it up!"
      ]
    },
    "elric-idle": {
      lines: [
        "Keep your eyes open out there. My patrols have been stretched thin.",
        "I've lost good guards to these goblins. Don't underestimate them.",
        "The Watch Post was our forward position. Now it's overrun. A disgrace.",
        "I appreciate what you're doing for Elderbrook. The guards can't be everywhere.",
        "There's something coordinating these goblins. I can feel it in my bones.",
        "I served in the border wars twenty years ago. This feels like the calm before a storm.",
        "If you find anything unusual out there, report it to me or Rowan immediately.",
        "Stay sharp. The roads get more dangerous by the day."
      ]
    },
    "elira-idle": {
      lines: [
        "The wind carries whispers from the north. Something stirs in the old places.",
        "I've traveled many roads, but Elderbrook has a way of drawing people in.",
        "Don't let appearances deceive you. There's more to this town than meets the eye.",
        "I study the old texts, the ones most people have forgotten. They hold warnings.",
        "The goblins are pawns. The real question is who holds the board.",
        "Be careful what you disturb in those caves. Some things are buried for a reason.",
        "I sense a strength in you. You'll need it for what's coming.",
        "I'll share more when the time is right. For now, trust your instincts."
      ]
    },

    /* --- Chain Quest Dialogues --- */
    "cq1-complete": {
      id: "cq1-complete",
      nodes: [
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "This ore is good quality. I can work with this." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "My grandfather's anvil has sat cold for too long. Time to light the forge again." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Come back when you've found beast sinew and an enchanted shard. I've got a masterwork in mind." }
      ]
    },
    "cq2-complete": {
      id: "cq2-complete",
      nodes: [
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Beast sinew for flexibility, enchanted shard for the edge... perfect." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Give me a moment." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "There. A tempered blade worthy of the Ironhand name. And the forge stays lit, I'll be crafting enhanced gear from now on." }
      ]
    },
    "cq3-complete": {
      id: "cq3-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Shadow essence combined with cave herb extract... the reaction is beautiful." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "This could change everything. With more materials, I could produce antidotes and enhanced formulae." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Here, take these antidotes. You'll need them against those goblin shamans." }
      ]
    },
    "cq4-complete": {
      id: "cq4-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "This is enough to set up a proper production line! My lab is officially upgraded." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Take these supplies. And from now on, I'll have cleansing potions and enhanced brews in stock." }
      ]
    },
    "cq5-complete": {
      id: "cq5-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "The wolf population along the roads is finally under control. Good work." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "But the Watch Post is still occupied. My guards won't patrol until it's cleared. Can you handle that too?" }
      ]
    },
    "cq6-complete": {
      id: "cq6-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "The Watch Post is ours again. Another badge recovered too. Two families will find peace tonight." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "My guards can resume patrols. The roads will be safer because of what you've done." }
      ]
    }
  };

  /* ── Town Events (spawnable NPC encounters) ── */
  var townEvents = [
    {
      id: "traveling-merchant",
      weight: 20,
      flag: "townEventMerchant",
      repeatable: false,
      location: "town",
      npcName: "Traveling Merchant",
      npcPortrait: "assets/portraits/traveler.png",
      poiPosition: "top:65%;right:8%",
      poiSub: "Rare wares",
      dialogue: {
        id: "town-event-merchant",
        nodes: [
          { speaker: "Traveling Merchant", portrait: "assets/portraits/traveler.png", text: "Psst! You there! I've got rare wares from beyond the frontier. Interested?" },
          { speaker: "", portrait: "", text: "A travelling merchant has set up near the gate.", choices: [
            { text: "Browse the wares.", next: 2, flags: ["merchantBrowsed"], giveItems: ["enchanted-shard"] },
            { text: "Not interested.", next: 3 }
          ]},
          { speaker: "Traveling Merchant", portrait: "assets/portraits/traveler.png", text: "A discerning eye! Here, take this on the house. Consider it a sample. Let me show you what else I've got.", end: true },
          { speaker: "Traveling Merchant", portrait: "assets/portraits/traveler.png", text: "Your loss, friend. I'll be moving on soon.", end: true }
        ],
        onEnd: { flags: ["townEventMerchant"] }
      }
    },
    {
      id: "wandering-bard",
      weight: 15,
      flag: "townEventBard",
      repeatable: false,
      location: "town",
      npcName: "Wandering Bard",
      npcPortrait: "assets/portraits/bard_placeholder.png",
      poiPosition: "top:60%;left:35%",
      poiSub: "A song for the hero",
      dialogue: {
        id: "town-event-bard",
        nodes: [
          { speaker: "Wandering Bard", portrait: "assets/portraits/bard_placeholder.png", text: "A hero walks among us! Let me sing of your deeds! The ballad of the goblin slayer!" },
          { speaker: "", portrait: "", text: "A bard has heard of your adventures and composed a song.", choices: [
            { text: "Listen to the song.", next: 2 },
            { text: "Maybe later.", next: 3 }
          ]},
          { speaker: "Wandering Bard", portrait: "assets/portraits/bard_placeholder.png", text: "...and steel met fang, in the hollow dark! The hero stood where none would dare! A magnificent tale! Your reputation precedes you, friend.", end: true },
          { speaker: "Wandering Bard", portrait: "assets/portraits/bard_placeholder.png", text: "A humble performer respects your time. Perhaps our paths will cross again.", end: true }
        ],
        onEnd: { flags: ["townEventBard"] }
      }
    },
    {
      id: "rumor-mill",
      weight: 25,
      flag: "townEventRumor",
      repeatable: false,
      location: "town",
      npcName: "Worried Villager",
      npcPortrait: "assets/portraits/villager_female.png",
      poiPosition: "top:48%;left:50%",
      poiSub: "Looks troubled",
      dialogue: {
        id: "town-event-rumor",
        nodes: [
          { speaker: "Worried Villager", portrait: "assets/portraits/villager_female.png", text: "Have you heard? Strange lights in the northern ruins! And the goblins have been gathering there too." },
          { speaker: "Worried Villager", portrait: "assets/portraits/villager_female.png", text: "Some say an old power is waking up. Others say it's just swamp gas. But I know what I saw." },
          { speaker: "", portrait: "", text: "The villager looks genuinely frightened.", choices: [
            { text: "I'll look into it. Stay safe.", next: 3 },
            { text: "It's probably nothing. Don't worry.", next: 4 }
          ]},
          { speaker: "Worried Villager", portrait: "assets/portraits/villager_female.png", text: "Bless you, adventurer. Be careful out there.", end: true },
          { speaker: "Worried Villager", portrait: "assets/portraits/villager_female.png", text: "I hope you're right. I really do.", end: true }
        ],
        onEnd: { flags: ["townEventRumor"] }
      }
    }
  ];

  /* ── Achievement Definitions ── */
  var achievements = [
    { id: "first-blood", name: "First Blood", description: "Defeat your first enemy." },
    { id: "goblin-hunter", name: "Goblin Hunter", description: "Defeat 20 goblins." },
    { id: "wolf-slayer", name: "Wolf Slayer", description: "Defeat 10 wolves." },
    { id: "chief-slain", name: "Chief Slain", description: "Defeat Goblin Chief Grisk." },
    { id: "master-crafter", name: "Master Crafter", description: "Craft your first item." },
    { id: "hoarder", name: "Hoarder", description: "Fill your inventory to capacity." },
    { id: "big-spender", name: "Big Spender", description: "Spend 500 gold total." },
    { id: "quest-veteran", name: "Quest Veteran", description: "Complete 10 quests." },
    { id: "social-butterfly", name: "Social Butterfly", description: "Reach Friend status with 3 NPCs." },
    { id: "bestiary-novice", name: "Bestiary Novice", description: "Discover 5 enemy types." },
    { id: "bestiary-master", name: "Bestiary Master", description: "Discover all enemy types." },
    { id: "skilled-fighter", name: "Skilled Fighter", description: "Reach proficiency rank 3 on any skill." },
    { id: "chapter-complete", name: "Chapter Complete", description: "Complete Chapter 1." },
    { id: "no-defeat", name: "Unbroken", description: "Defeat Grisk without ever being knocked out." },
    { id: "herbalist", name: "Herbalist", description: "Gather 20 herbs from the Riverbank." },
    { id: "treasure-seeker", name: "Treasure Seeker", description: "Find a secret room in the dungeon." }
  ];

  /* ── Public API ── */
  function getNPC(id) { return npcs[id] || null; }
  function getAllNPCs() { return npcs; }
  function getLocation(id) { return locations[id] || null; }
  function getAllLocations() { return locations; }
  function getQuest(id) { return quests[id] || null; }
  function getAllQuests() { return quests; }
  function getDialogue(id) { return dialogues[id] || null; }
  function getDefaultFlags() { return JSON.parse(JSON.stringify(defaultFlags)); }
  function getTownEvents() { return townEvents; }
  function getAchievements() { return achievements; }
  function getAchievement(id) {
    for (var i = 0; i < achievements.length; i++) {
      if (achievements[i].id === id) return achievements[i];
    }
    return null;
  }

  function rollTownEvent(p) {
    var available = [];
    for (var i = 0; i < townEvents.length; i++) {
      var ev = townEvents[i];
      if (!ev.repeatable && p.storyFlags[ev.flag]) continue;
      available.push(ev);
    }
    if (available.length === 0) return null;
    var totalWeight = 0;
    for (var j = 0; j < available.length; j++) totalWeight += available[j].weight;
    // 40% chance nothing happens
    if (Math.random() < 0.4) return null;
    var roll = Math.random() * totalWeight;
    var acc = 0;
    for (var k = 0; k < available.length; k++) {
      acc += available[k].weight;
      if (roll < acc) return available[k];
    }
    return null;
  }

  /* Roll which event NPCs spawn this visit (stored on player) */
  function rollEventSpawns(p) {
    var spawned = [];
    for (var i = 0; i < townEvents.length; i++) {
      var ev = townEvents[i];
      if (!ev.repeatable && p.storyFlags[ev.flag]) continue;
      // Weighted chance: weight out of 100
      if (Math.random() * 100 < ev.weight) {
        spawned.push(ev.id);
      }
    }
    return spawned;
  }

  /* Get active event NPCs for a given location screen */
  function getActiveEvents(location, spawnedIds) {
    var results = [];
    for (var i = 0; i < townEvents.length; i++) {
      var ev = townEvents[i];
      if (ev.location === location && spawnedIds.indexOf(ev.id) !== -1) {
        results.push(ev);
      }
    }
    return results;
  }

  function getTownEventById(id) {
    for (var i = 0; i < townEvents.length; i++) {
      if (townEvents[i].id === id) return townEvents[i];
    }
    return null;
  }

  return {
    getNPC: getNPC,
    getAllNPCs: getAllNPCs,
    getLocation: getLocation,
    getAllLocations: getAllLocations,
    getQuest: getQuest,
    getAllQuests: getAllQuests,
    getDialogue: getDialogue,
    getDefaultFlags: getDefaultFlags,
    getTownEvents: getTownEvents,
    getAchievements: getAchievements,
    getAchievement: getAchievement,
    rollTownEvent: rollTownEvent,
    rollEventSpawns: rollEventSpawns,
    getActiveEvents: getActiveEvents,
    getTownEventById: getTownEventById
  };
})();
