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
      portrait: "assets/portraits/Guard_captain.png",
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
    },
    merchant: {
      id: "merchant", name: "Traveling Merchant",
      portrait: "assets/portraits/traveler.png",
      role: "Merchant", personality: "Shrewd, friendly, secretive."
    },
    fauna: {
      id: "fauna", name: "Fauna",
      portrait: "assets/portraits/pet-shop-keeper.png",
      role: "Pet Shop Owner", personality: "Gentle, animal-loving, earthy."
    },
    liora: {
      id: "liora", name: "Liora Bloom",
      portrait: "assets/portraits/liora.png",
      role: "Florist", personality: "Warm, graceful, playful, and quietly perceptive."
    },
    /* ── Class Mentor NPCs ── */
    varn: {
      id: "varn", name: "Varn the Ironclad",
      portrait: "assets/portraits/varn.png",
      role: "Warrior Mentor", personality: "Gruff, disciplined, commands respect."
    },
    shade: {
      id: "shade", name: "Shade",
      portrait: "assets/portraits/shade.png",
      role: "Rogue Mentor", personality: "Quiet, calculating, speaks in riddles."
    },
    theron: {
      id: "theron", name: "Sage Theron",
      portrait: "assets/portraits/theron.png",
      role: "Mage Mentor", personality: "Patient, eccentric, deeply knowledgeable."
    },
    lysara: {
      id: "lysara", name: "Dame Lysara",
      portrait: "assets/portraits/lysara.png",
      role: "Knight Mentor", personality: "Noble, stern, unwavering sense of duty."
    },
    grul: {
      id: "grul", name: "Grul",
      portrait: "assets/portraits/grul.png",
      role: "Berserker Mentor", personality: "Wild, unpredictable, fiercely loyal."
    },
    whisper: {
      id: "whisper", name: "Whisper",
      portrait: "assets/portraits/whisper.png",
      role: "Assassin Mentor", personality: "Cold, precise, speaks only when necessary."
    },
    fenn: {
      id: "fenn", name: "Warden Fenn",
      portrait: "assets/portraits/fenn.png",
      role: "Ranger Mentor", personality: "Stoic, observant, one with nature."
    },
    cindra: {
      id: "cindra", name: "Cindra",
      portrait: "assets/portraits/cindra.png",
      role: "Pyromancer Mentor", personality: "Intense, passionate, dangerously curious."
    },
    maren: {
      id: "maren", name: "Sister Maren",
      portrait: "assets/portraits/maren.png",
      role: "Cleric Mentor", personality: "Compassionate, serene, quietly powerful."
    },
    cedric: {
      id: "cedric", name: "Sir Cedric",
      portrait: "assets/portraits/cedric.png",
      role: "Paladin Mentor", personality: "Righteous, solemn, radiates conviction."
    }
  };

  /* ── Companion Definitions (for escort / story battles) ── */
  var companions = {
    elric: {
      name: "Captain Elric",
      hp: 50, maxHp: 50,
      attack: 8, defense: 5,
      portrait: "assets/portraits/Guard_captain.png",
      abilities: [
        { name: "Shield Bash", chance: 0.25, multiplier: 1.4, effect: { type: "stun", turns: 1 } },
        { name: "Guard Strike", chance: 0.15, multiplier: 1.2 }
      ]
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
      enemies: ["wolf", "goblin-scout", "goblin-sneak", "bandit", "dire-rat"],
      recommendedLevel: "Lv. 1-3",
      requireFlag: "unlockedForestRoad"
    },
    "goblin-trail": {
      id: "goblin-trail", name: "Goblin Trail",
      description: "A rougher path leading toward the goblin caves. Stronger enemies patrol here.",
      background: "assets/backgrounds/GoblinTrail.png",
      enemies: ["goblin-raider", "goblin-archer", "wolf-pack", "bandit"],
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
      description: "Once the forward outpost of Elderbrook's guard, this watchtower was Captain Elric's first command post. The goblins overran it six months ago. Guard badges and old patrol logs still litter the ruins, a reminder of the soldiers who held the line.",
      background: "assets/backgrounds/watch-post.png",
      enemies: ["goblin-raider", "goblin-guard", "goblin-sneak", "bandit"],
      recommendedLevel: "Lv. 3-5",
      requireFlag: "unlockedWatchPost"
    },
    "riverbank": {
      id: "riverbank", name: "Riverbank Crossing",
      description: "A calm stretch of riverbank. Herbs grow along the water's edge.",
      background: "assets/backgrounds/riverbank.png",
      enemies: ["wolf", "goblin-scout", "dire-rat"],
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
    visitedElric: false,
    visitedQuestBoard: false,
    visitedLiora: false,

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

    /* Companion flags */
    elricJoinedMQ4: false,
    elricJoinedMQ7: false,

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
    faunaRomantic: false,
    lioraRomantic: false,

    /* NPC quest chains */
    completedCQ1: false, completedCQ2: false, completedCQ3: false,
    completedCQ4: false, completedCQ5: false, completedCQ6: false,
    bramForgeUnlocked: false, miraLabUnlocked: false, elricPatrolRoute: false,

    /* Combat tracking */
    hasBeenDefeated: false,

    /* Dungeon tracking */
    enteredCave: false,

    /* Merchant */
    merchantBrowsed: false,

    /* Build / Difficulty */
    choseBuild: false,
    seenBuildSelect: false,

    /* Town events */
    townEventMerchant: false, townEventBard: false, townEventRumor: false,
    eliraForeshadow: false,
    townEventGuard: false, townEventChild: false, townEventFestival: false, townEventStranger: false,

    /* Biscuit the cat quest */
    lookingForBiscuit: false, foundBiscuit: false, returnedBiscuit: false,

    /* Elira chain quests */
    completedCQ7: false, completedCQ8: false,

    /* Epilogue / Post-chapter */
    celebrationDone: false,
    northernRuinsTease: false,

    /* Early Elric quests */
    completedSQ16: false, completedSQ17: false,

    /* Skill unlock quests */
    unlockedMeditate: false, unlockedDoubleStrike: false,

    /* Class unlock flags */
    unlockedWarrior: false, unlockedRogue: false, unlockedMage: false,
    unlockedKnight: false, unlockedBerserker: false,
    unlockedAssassin: false, unlockedRanger: false,
    unlockedPyromancer: false, unlockedCleric: false,
    unlockedPaladin: false,
    seenMentorHint: false,

    /* Class mentor met flags */
    metVarn: false, metShade: false, metTheron: false,
    metLysara: false, metGrul: false, metWhisper: false,
    metFenn: false, metCindra: false, metMaren: false,
    metCedric: false,

    /* Dialogue branching */
    choiceBrave: false, choicePractical: false,
    choiceIndependent: false, choiceTeamwork: false,
    chapterEndBrave: false, chapterEndPrepared: false
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
        { id: "return-relic", text: "Speak to Rowan in the Adventurers Guild", type: "flag", flag: "recoveredRelic" }
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
    sq7: {
      id: "sq7", name: "Patrol Escort", type: "side",
      description: "With the patrol route re-established, Captain Elric needs an escort for the first supply run. Clear hostiles along the Forest Road and Goblin Trail.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "road-clear", text: "Defeat enemies on the Forest Road", type: "kill", target: "goblin-scout", required: 4 },
        { id: "trail-clear", text: "Defeat enemies on the Goblin Trail", type: "kill", target: "goblin-raider", required: 4 },
        { id: "wolves-clear", text: "Defeat wolves along the route", type: "kill", target: "wolf", required: 3 }
      ],
      rewards: { xp: 100, gold: 80, items: ["greater-health-potion", "iron-helm"] },
      requireFlags: ["elricPatrolRoute"]
    },
    sq8: {
      id: "sq8", name: "Toma's Lost Ledger", type: "side",
      description: "Toma lost his quest ledger while filing reports near the Forest Road. The goblins probably grabbed it. Find and return it.",
      giver: "toma", turnIn: "toma",
      objectives: [
        { id: "ledger", text: "Recover Toma's Ledger (drops from goblins on Forest Road)", type: "collect", item: "tomas-ledger", required: 1 }
      ],
      rewards: { xp: 30, gold: 20, items: ["health-potion"] },
      requireFlags: ["completedMQ1"]
    },
    sq9: {
      id: "sq9", name: "Hungry Wolves", type: "side",
      description: "Wolves have been scaring merchants away from the Forest Road. Thin the pack and bring wolf pelts as proof.",
      giver: "rowan", turnIn: "rowan",
      objectives: [
        { id: "wolves", text: "Defeat Wolves on the Forest Road", type: "kill", target: "wolf", required: 4 },
        { id: "pelts", text: "Collect Wolf Pelts as proof", type: "collect", item: "wolf-pelt", required: 2 }
      ],
      rewards: { xp: 45, gold: 35 },
      requireFlags: ["completedMQ2"]
    },
    sq10: {
      id: "sq10", name: "The Old Patrol Logs", type: "side",
      description: "Captain Elric wants old patrol journals recovered from the Watch Post. They contain guard routes and intel the goblins shouldn't have.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "logs", text: "Recover Patrol Logs from the Watch Post", type: "collect", item: "patrol-logs", required: 1 },
        { id: "clear", text: "Defeat goblin sneaks at the Watch Post", type: "kill", target: "goblin-sneak", required: 3 }
      ],
      rewards: { xp: 55, gold: 40, items: ["iron-bracers"] },
      requireFlags: ["completedMQ3"]
    },
    sq11: {
      id: "sq11", name: "Mira's Moonpetal", type: "side",
      description: "Mira has heard of rare moonpetals that grow deep in goblin territory. She needs them for a potent new formula.",
      giver: "mira", turnIn: "mira",
      objectives: [
        { id: "petals", text: "Collect Moonpetals (drop from goblins)", type: "collect", item: "moonpetal", required: 2 }
      ],
      rewards: { xp: 60, gold: 45, items: ["greater-health-potion", "mana-potion"] },
      requireFlags: ["completedMQ4"]
    },
    sq12: {
      id: "sq12", name: "Toma's Special Bounty", type: "side",
      description: "A high-value bounty has been posted: take down the most dangerous goblins lurking in the caves.",
      giver: "toma", turnIn: "toma",
      objectives: [
        { id: "brutes", text: "Defeat Goblin Brutes", type: "kill", target: "goblin-brute", required: 3 },
        { id: "shamans", text: "Defeat Goblin Shamans", type: "kill", target: "goblin-shaman", required: 2 }
      ],
      rewards: { xp: 90, gold: 70, items: ["greater-health-potion"] },
      requireFlags: ["completedMQ5"]
    },
    sq13: {
      id: "sq13", name: "Arms for the Guard", type: "side",
      description: "Harlan is forging new equipment for Elric's guards. He needs iron ore and beast sinew to finish the order.",
      giver: "harlan", turnIn: "harlan",
      objectives: [
        { id: "ore", text: "Collect Iron Ore", type: "collect", item: "iron-ore", required: 3 },
        { id: "sinew", text: "Collect Beast Sinew", type: "collect", item: "beast-sinew", required: 2 }
      ],
      rewards: { xp: 70, gold: 55, items: ["iron-chestplate"] },
      requireFlags: ["completedMQ5"]
    },
    sq14: {
      id: "sq14", name: "The Herbalist's Request", type: "side",
      description: "A traveling herbalist left a request with Mira for cave herbs and wolf pelts to brew a special restorative formula.",
      giver: "mira", turnIn: "mira",
      objectives: [
        { id: "herbs", text: "Gather Cave Herbs", type: "collect", item: "cave-herb", required: 4 },
        { id: "pelts", text: "Collect Wolf Pelts", type: "collect", item: "wolf-pelt", required: 3 }
      ],
      rewards: { xp: 50, gold: 40, items: ["greater-health-potion", "antidote", "smelling-salts"] },
      requireFlags: ["completedMQ2"]
    },
    sq15: {
      id: "sq15", name: "Whispers in the Dark", type: "side",
      description: "Elira senses dark energy seeping from the goblin caves. She needs shadow essences and an enchanted shard to seal the breach.",
      giver: "elira", turnIn: "elira",
      objectives: [
        { id: "essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 3 },
        { id: "shard", text: "Find an Enchanted Shard", type: "collect", item: "enchanted-shard", required: 1 }
      ],
      rewards: { xp: 100, gold: 65, items: ["greater-health-potion", "mana-potion", "smelling-salts"] },
      requireFlags: ["completedMQ6"]
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
      requireFlags: ["completedMQ2"]
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
    },
    cq7: {
      id: "cq7", name: "Elira's Research", type: "chain",
      description: "Elira is investigating the strange sigil found in the goblin cave. She needs shadow essence and goblin orders as research material.",
      giver: "elira", turnIn: "elira",
      objectives: [
        { id: "sigil-essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 2 },
        { id: "sigil-scrap", text: "Collect Goblin Scrap (for inscriptions)", type: "collect", item: "goblin-scrap", required: 3 }
      ],
      rewards: { xp: 75, gold: 55, items: ["mana-potion", "mana-potion", "greater-health-potion"] },
      onComplete: ["completedCQ7"],
      startsQuest: "cq8",
      requireFlags: ["completedMQ6"]
    },
    cq8: {
      id: "cq8", name: "The Old Texts", type: "chain",
      description: "Elira's research has revealed a connection to ancient ruins. She needs beast sinew for binding and cave herbs to preserve fragile manuscripts she's found.",
      giver: "elira", turnIn: "elira",
      objectives: [
        { id: "binding", text: "Collect Beast Sinew", type: "collect", item: "beast-sinew", required: 3 },
        { id: "preserve", text: "Gather Cave Herbs", type: "collect", item: "cave-herb", required: 4 }
      ],
      rewards: { xp: 110, gold: 75, items: ["enchanted-shard", "greater-health-potion"] },
      onComplete: ["completedCQ8"],
      requireFlags: ["completedCQ7"]
    },

    /* --- Early Elric Quests --- */
    sq16: {
      id: "sq16", name: "Guard Duty", type: "side",
      description: "Captain Elric needs help clearing wolves that have been ambushing guard patrols near the Forest Road.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "wolves", text: "Defeat Wolves on the Forest Road", type: "kill", target: "wolf", required: 3 }
      ],
      rewards: { xp: 35, gold: 25, items: ["health-potion"] },
      onComplete: ["completedSQ16"],
      requireFlags: ["completedMQ1"]
    },
    sq17: {
      id: "sq17", name: "Road Patrol", type: "side",
      description: "Captain Elric wants the roads secured. Patrol the Forest Road and clear out goblin scouts harassing travelers.",
      giver: "elric", turnIn: "elric",
      objectives: [
        { id: "scouts", text: "Defeat Goblin Scouts", type: "kill", target: "goblin-scout", required: 4 },
        { id: "wolves2", text: "Defeat Wolves near the road", type: "kill", target: "wolf", required: 2 }
      ],
      rewards: { xp: 45, gold: 35 },
      onComplete: ["completedSQ17"],
      requireFlags: ["completedMQ2"]
    },

    /* --- Skill Unlock Quests (tough, one-time) --- */
    "sq-meditate": {
      id: "sq-meditate", name: "The Monk's Trial", type: "side",
      description: "A wandering monk has left a challenge at the Academy: defeat powerful foes to prove your discipline and learn the art of Meditation.",
      giver: "elira", turnIn: "elira",
      objectives: [
        { id: "brutes", text: "Defeat Goblin Brutes", type: "kill", target: "goblin-brute", required: 5 },
        { id: "shamans", text: "Defeat Goblin Shamans", type: "kill", target: "goblin-shaman", required: 4 },
        { id: "essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 3 }
      ],
      rewards: { xp: 150, gold: 100 },
      onComplete: ["unlockedMeditate"],
      requireFlags: ["completedMQ6"]
    },
    "sq-double-strike": {
      id: "sq-double-strike", name: "The Blademaster's Challenge", type: "side",
      description: "Bram has heard of an ancient dual-strike technique. To learn it, you must prove your combat mastery by clearing the most dangerous creatures in the region.",
      giver: "bram", turnIn: "bram",
      objectives: [
        { id: "brutes", text: "Defeat Goblin Brutes", type: "kill", target: "goblin-brute", required: 6 },
        { id: "wolves", text: "Defeat Wolves", type: "kill", target: "wolf", required: 8 },
        { id: "ore", text: "Collect Iron Ore", type: "collect", item: "iron-ore", required: 5 },
        { id: "sinew", text: "Collect Beast Sinew", type: "collect", item: "beast-sinew", required: 4 }
      ],
      rewards: { xp: 200, gold: 150 },
      onComplete: ["unlockedDoubleStrike"],
      requireFlags: ["completedMQ7"]
    },

    /* --- Class Unlock Quests (type: "class" — not shown on quest board) --- */
    "cq-warrior": {
      id: "cq-warrior", name: "Trial of Steel", type: "class",
      description: "Varn the Ironclad challenges you to prove your strength. Defeat beasts and gather iron to forge your warrior's resolve.",
      giver: "varn", turnIn: "varn",
      objectives: [
        { id: "wolves", text: "Defeat Wolves", type: "kill", target: "wolf", required: 5 },
        { id: "scouts", text: "Defeat Goblin Scouts", type: "kill", target: "goblin-scout", required: 4 },
        { id: "ore", text: "Collect Iron Ore", type: "collect", item: "iron-ore", required: 2 }
      ],
      rewards: { xp: 100, gold: 50 },
      onComplete: ["unlockedWarrior"],
      requireFlags: []
    },
    "cq-rogue": {
      id: "cq-rogue", name: "Shadow's Test", type: "class",
      description: "Shade wants proof of your cunning. Hunt silently, strike swiftly, and bring trophies of your prey.",
      giver: "shade", turnIn: "shade",
      objectives: [
        { id: "sneaks", text: "Defeat Goblin Sneaks", type: "kill", target: "goblin-sneak", required: 4 },
        { id: "wolves", text: "Defeat Wolves", type: "kill", target: "wolf", required: 3 },
        { id: "sinew", text: "Collect Beast Sinew", type: "collect", item: "beast-sinew", required: 2 }
      ],
      rewards: { xp: 100, gold: 50 },
      onComplete: ["unlockedRogue"],
      requireFlags: []
    },
    "cq-mage": {
      id: "cq-mage", name: "Arcane Awakening", type: "class",
      description: "Sage Theron senses latent power within you. Gather reagents and prove your will against the wilds to awaken your arcane potential.",
      giver: "theron", turnIn: "theron",
      objectives: [
        { id: "herbs", text: "Collect Moonpetal Herb", type: "collect", item: "moonpetal", required: 3 },
        { id: "scouts", text: "Defeat Goblin Scouts", type: "kill", target: "goblin-scout", required: 3 },
        { id: "essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 1 }
      ],
      rewards: { xp: 100, gold: 50 },
      onComplete: ["unlockedMage"],
      requireFlags: []
    },
    "cq-knight": {
      id: "cq-knight", name: "The Knight's Oath", type: "class",
      description: "Dame Lysara demands you prove your valor. Defend the weak, stand firm against overwhelming odds, and bring proof of your resolve.",
      giver: "lysara", turnIn: "lysara",
      objectives: [
        { id: "brutes", text: "Defeat Goblin Brutes", type: "kill", target: "goblin-brute", required: 6 },
        { id: "guards", text: "Defeat Goblin Guards", type: "kill", target: "goblin-guard", required: 4 },
        { id: "ore", text: "Collect Iron Ore", type: "collect", item: "iron-ore", required: 4 }
      ],
      rewards: { xp: 180, gold: 120 },
      onComplete: ["unlockedKnight"],
      requireFlags: ["choseBuild", "completedMQ3"]
    },
    "cq-berserker": {
      id: "cq-berserker", name: "Path of Fury", type: "class",
      description: "Grul demands you prove your ferocity. Crush the strongest foes without hesitation and return drenched in victory.",
      giver: "grul", turnIn: "grul",
      objectives: [
        { id: "raiders", text: "Defeat Goblin Raiders", type: "kill", target: "goblin-raider", required: 8 },
        { id: "packs", text: "Defeat Wolf Packs", type: "kill", target: "wolf-pack", required: 4 }
      ],
      rewards: { xp: 180, gold: 120 },
      onComplete: ["unlockedBerserker"],
      requireFlags: ["choseBuild", "completedMQ4"]
    },
    "cq-assassin": {
      id: "cq-assassin", name: "The Silent Art", type: "class",
      description: "Whisper has a contract. Eliminate targets with precision, collect proof of the kill, and return without a sound.",
      giver: "whisper", turnIn: "whisper",
      objectives: [
        { id: "sneaks", text: "Defeat Goblin Sneaks", type: "kill", target: "goblin-sneak", required: 6 },
        { id: "shamans", text: "Defeat Goblin Shamans", type: "kill", target: "goblin-shaman", required: 4 },
        { id: "sinew", text: "Collect Beast Sinew", type: "collect", item: "beast-sinew", required: 4 }
      ],
      rewards: { xp: 180, gold: 120 },
      onComplete: ["unlockedAssassin"],
      requireFlags: ["choseBuild", "completedMQ4"]
    },
    "cq-ranger": {
      id: "cq-ranger", name: "Warden's Trail", type: "class",
      description: "Warden Fenn challenges you to master the wilds. Track dangerous quarry, gather from the land, and prove you belong in the forest.",
      giver: "fenn", turnIn: "fenn",
      objectives: [
        { id: "archers", text: "Defeat Goblin Archers", type: "kill", target: "goblin-archer", required: 5 },
        { id: "wolves", text: "Defeat Wolves", type: "kill", target: "wolf", required: 5 },
        { id: "herbs", text: "Collect Moonpetal Herb", type: "collect", item: "moonpetal", required: 3 }
      ],
      rewards: { xp: 180, gold: 120 },
      onComplete: ["unlockedRanger"],
      requireFlags: ["choseBuild", "completedMQ3"]
    },
    "cq-pyromancer": {
      id: "cq-pyromancer", name: "Trial by Fire", type: "class",
      description: "Cindra demands mastery over volatile reagents and raw power. Gather arcane components and incinerate those who wield dark magic.",
      giver: "cindra", turnIn: "cindra",
      objectives: [
        { id: "shamans", text: "Defeat Goblin Shamans", type: "kill", target: "goblin-shaman", required: 6 },
        { id: "essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 4 },
        { id: "herbs", text: "Collect Moonpetal Herb", type: "collect", item: "moonpetal", required: 3 }
      ],
      rewards: { xp: 180, gold: 120 },
      onComplete: ["unlockedPyromancer"],
      requireFlags: ["choseBuild", "completedMQ4"]
    },
    "cq-cleric": {
      id: "cq-cleric", name: "The Healer's Calling", type: "class",
      description: "Sister Maren believes in your divine potential. Gather sacred herbs, cleanse corrupted ground, and prove your compassion through strength.",
      giver: "maren", turnIn: "maren",
      objectives: [
        { id: "herbs", text: "Collect Moonpetal Herb", type: "collect", item: "moonpetal", required: 5 },
        { id: "brutes", text: "Defeat Goblin Brutes", type: "kill", target: "goblin-brute", required: 4 },
        { id: "essence", text: "Collect Shadow Essence", type: "collect", item: "shadow-essence", required: 3 }
      ],
      rewards: { xp: 180, gold: 120 },
      onComplete: ["unlockedCleric"],
      requireFlags: ["choseBuild", "completedMQ3"]
    },
    "cq-paladin": {
      id: "cq-paladin", name: "The Paladin's Crucible", type: "class",
      description: "Sir Cedric speaks of an ancient order of holy warriors. To walk the Paladin's path, you must prove mastery of both blade and spirit.",
      giver: "cedric", turnIn: "cedric",
      objectives: [
        { id: "brutes", text: "Defeat Goblin Brutes", type: "kill", target: "goblin-brute", required: 8 },
        { id: "shamans", text: "Defeat Goblin Shamans", type: "kill", target: "goblin-shaman", required: 6 },
        { id: "ore", text: "Collect Iron Ore", type: "collect", item: "iron-ore", required: 5 },
        { id: "herbs", text: "Collect Moonpetal Herb", type: "collect", item: "moonpetal", required: 4 }
      ],
      rewards: { xp: 250, gold: 200 },
      onComplete: ["unlockedPaladin"],
      requireFlags: ["completedMQ7", "choseBuild"]
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
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "I've noticed something strange about the goblins lately. They seem... organized. Almost like someone is directing them. But who would do such a thing?" },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Oh, one more thing. I saw a hooded traveler by the edge of town the other day, studying the old ward markers. She had the look of a scholar. If you run into her, it might be worth a conversation." }
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
          { text: "I'll handle it. Point me to the road.", next: 3, flags: ["choiceBrave"] },
          { text: "Sounds dangerous. What's the pay?", next: 4, flags: ["choicePractical"] }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Good. Defeat at least three goblin scouts and report back. The road has to be secured. Be careful out there.", end: true },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Fair enough. The guild pays for results, 40 gold and experience. Defeat at least three goblin scouts on the Forest Road. Be careful, they're nasty in packs.", end: true }
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
          { text: "I'll track them down. Where are the tracks?", next: 3, flags: ["choiceIndependent"] },
          { text: "Should we get Elric's guards involved?", next: 4, flags: ["choiceTeamwork"] }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Scouts reported goblin tracks leading east. Follow the Goblin Trail, recover our supply crate, and see where it leads.", end: true },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Elric's guards are stretched thin already. You're the best we've got. Follow the Goblin Trail east and recover that supply crate. Be ready for a fight.", end: true }
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
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "That's the spirit. Clear the outer defenses and report back anything unusual. And take supplies, the cave won't be kind.", end: true },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Tougher goblins, guards, maybe a shaman. Tight quarters, no running. Clear the outer defenses first and report back. Stock up on potions before you go.", end: true }
      ],
      onEnd: { flags: ["completedMQ4", "unlockedGoblinCave", "acceptedMQ5"] }
    },
    "elric-mq4-join": {
      id: "elric-mq4-join",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Hold it. Rowan told me you'd be heading this way. The Goblin Trail is no place to go alone." },
        { speaker: "", portrait: "", text: "You stare at the armed captain blocking the path.", choices: [
          { text: "I can handle myself, Captain.", next: 2 },
          { text: "Glad for the company. Let's move.", next: 3 }
        ]},
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "I'm sure you can. But these goblins are organized, and I've lost good scouts on this trail. You watch my back, I'll watch yours. That's an order.", next: 3 },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Good. Stay sharp, keep your weapon ready, and don't wander off the path. I'll take point.", end: true }
      ],
      onEnd: { flags: ["elricJoinedMQ4"] }
    },
    "elric-mq4-return": {
      id: "elric-mq4-return",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Still in one piece? Good. Let's keep moving. These goblins won't clear themselves.", end: true }
      ]
    },
    "elric-mq7-join": {
      id: "elric-mq7-join",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "This is it. The chief's chamber. I can hear him in there." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "I've lost men to these goblins. I'm not sitting this one out." },
        { speaker: "", portrait: "", text: "Elric draws his sword and sets his stance.", choices: [
          { text: "Together, then. Let's finish this.", next: 3 },
          { text: "Stay behind me. I'll draw his attention.", next: 4 }
        ]},
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Together. On your signal.", end: true },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Brave. But I'm not the type to hide. I'll flank him while you hold the front. Let's go.", end: true }
      ],
      onEnd: { flags: ["elricJoinedMQ7"] }
    },
    "elric-companion-died": {
      id: "elric-companion-died",
      nodes: [
        { speaker: "", portrait: "", text: "Captain Elric collapses, his armor clattering against the stone. The goblins close in around you." },
        { speaker: "", portrait: "", text: "Without Elric, the mission cannot continue. You must retreat and try again.", end: true }
      ]
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
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Good instincts. Push into the depths and find evidence. Symbols, orders, artifacts, anything that tells us who is really behind this.", end: true },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I've been wondering that myself. Goblins don't stockpile or coordinate like this on their own. Find proof. Look for symbols, orders, anything unusual in the depths.", end: true }
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
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Agreed. Return to the cave depths. Find this goblin chief and end this. Elderbrook is counting on you.", end: true },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I'll look into it. But right now, the goblins won't stop until their chief falls. Get back in that cave and finish what you started. We'll study the sigil after.", end: true }
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
          { text: "Whatever it is, I'll face it. Elderbrook is my home now.", next: 8, flags: ["chapterEndBrave"] },
          { text: "Then we need to be ready. All of us.", next: 8, flags: ["chapterEndPrepared"] }
        ]},
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Well said. You've proven yourself beyond measure. Elderbrook owes you a great debt." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Rest for now. When you're ready, we'll need to follow this map and uncover the truth. Whatever it takes." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "I'll be in touch. This road is far from over." }
      ],
      onEnd: { flags: ["metElira"] }
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
    "sq7-complete": {
      id: "sq7-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "The supply wagon made it through without a scratch. First clean run in months." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "My guards can handle regular patrols now, but that first escort needed someone like you clearing the way." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Elderbrook's trade lines are open again. Take this, you've earned every coin." }
      ]
    },
    "sq8-complete": {
      id: "sq8-complete",
      nodes: [
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "My ledger! Oh thank goodness! All the pending contracts are in there." },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "I was filing reports near the forest edge and those goblins snatched it right out of my hands. I was too scared to chase them." },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "Please don't tell Rowan. He already thinks I'm disorganized. Here, take this as thanks!" }
      ]
    },
    "sq9-complete": {
      id: "sq9-complete",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Four wolves down and pelts to prove it. The merchants coming through will rest easier tonight." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "I've already had two caravan masters ask when the road would be safe again. I'll let them know you've handled it." }
      ]
    },
    "sq10-complete": {
      id: "sq10-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "These patrol logs... three months of route data, guard schedules, blind spots in our coverage." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "If the goblins decoded any of this, they'd know exactly where our defenses are weakest. You may have prevented something far worse." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Take these bracers. They belonged to Sergeant Vos. She'd want them used well." }
      ]
    },
    "sq11-complete": {
      id: "sq11-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Moonpetals! Oh, look at the luminescence! These are even more potent than I hoped." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "With these I can brew a potion that no one in Elderbrook has seen for generations. You're helping me make history!" },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Take these. You'll need them more than my shelf does right now." }
      ]
    },
    "sq12-complete": {
      id: "sq12-complete",
      nodes: [
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "Brutes AND shamans? You actually did it! I honestly posted that bounty thinking no one would take it." },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "The merchant caravans chipped in extra gold for this one. You've earned every coin. Elderbrook's hero!" }
      ]
    },
    "sq13-complete": {
      id: "sq13-complete",
      nodes: [
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "Iron ore and sinew. Good quality too. This'll make a full set of guard equipment." },
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "Elric's been on my case about outfitting his new recruits. Thanks to you, I can deliver on time." },
        { speaker: "Harlan Stonevein", portrait: npcs.harlan.portrait, text: "Here. Made you something extra while I was at it. Think of it as a professional courtesy." }
      ]
    },
    "sq14-complete": {
      id: "sq14-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Cave herbs and wolf pelts! The traveling herbalist will be thrilled when she returns." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "She's developing a restorative brew that could help guard patrols last longer in the field. Important work." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "She left these supplies as payment. I threw in a little extra from my own stock. You've earned it." }
      ]
    },
    "sq15-complete": {
      id: "sq15-complete",
      nodes: [
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "The essences are pulsing with residual energy. And this shard... yes, it still holds enough power." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "I can weave a temporary ward near the cave mouth. It won't stop whatever is down there, but it will slow the spread of that dark influence." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "You've done well. The people of Elderbrook don't know what you've saved them from. Not yet." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "But they will. When the truth comes to light, they'll need someone they can trust. I hope that someone is you." }
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
        "If the goblins keep raiding, I might have to start charging double.",
        "Had a customer ask for a 'flaming sword' yesterday. I said sure, toss it in the fireplace. He didn't laugh.",
        "You're back again? At this rate I should charge you rent for standing in my shop.",
        "Someone asked me to forge a 'legendary weapon.' I asked for legendary payment. They left.",
        "Every adventurer wants the biggest sword. Nobody asks about balance. Nobody asks about weight. Just 'make it bigger.'",
        "Toma asked me to sharpen a letter opener. A letter opener. I'm a master smith.",
        "I named this hammer. Her name is Diplomacy. Because she solves every problem eventually.",
        "Had a dream about the perfect alloy last night. Woke up and forgot the ratios. Being a smith is suffering.",
        "Mira keeps trying to enchant my anvil. I keep telling her it's already perfect. We've had this argument six times."
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
        "Check the joints and buckles. That's where cheap armor fails first.",
        "Trained a new recruit today. Asked which end of the spear to hold. I'm not making that up.",
        "Twenty years in the army and my back still hasn't forgiven me. Neither has my knee. Or my shoulder. List goes on.",
        "A recruit once asked if he really needed a helmet. He doesn't ask questions anymore. Unrelated, of course.",
        "You'd be amazed how many adventurers buy armor and then ask if it comes in a lighter color.",
        "My retirement was supposed to be peaceful. Quiet village, no combat, maybe a garden. And yet here I am.",
        "Elric asked me to train his guards. I told them to run laps. Three quit. The rest will survive.",
        "People keep calling me 'grumpy.' I'm not grumpy. I'm experienced. There's a difference. A subtle one.",
        "I once saw a man go into battle wearing a pot on his head. He's fine now. Mostly."
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
        "There's a rare moonpetal that grows near the cave entrance. If you see one, I'd pay well for it.",
        "I made a potion that technically works as intended. The side effect is your hair turns blue for a week. Still working on that.",
        "Good news: the new healing salve is twice as effective. Bad news: it smells like a wet goblin. Trade-offs.",
        "Bram asked me to stop experimenting near his forge. Apparently 'minor explosions' are bad for metalwork. Apparently.",
        "I accidentally made a potion of perfect hindsight once. Very useful. Completely useless. It's complicated.",
        "My workshop wall has been replaced four times this year. That's actually an improvement over last year.",
        "Every alchemist has an 'oops' shelf. Mine takes up a whole room. I'm very thorough in my mistakes.",
        "Someone asked if my potions are 'all-natural.' Everything is natural if you think about it hard enough. Even explosions.",
        "Note to self: do NOT mix fire salts with moonpetal extract. Again. The ceiling just dried out from last time."
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
        "You remind me of an adventurer I knew years ago. She had that same determination.",
        "Being Guildmaster is mostly paperwork. Heroic, important, legendary paperwork. But still paperwork.",
        "Every adventurer who walks through that door thinks they're the chosen one. To be fair, some of them are right.",
        "Toma reorganized the quest board alphabetically again. Now nobody can find anything. But it looks very tidy.",
        "I used to go on quests myself, you know. Now my greatest adventure is balancing the guild treasury.",
        "I've written seven letters to the capital requesting backup. I've received seven politely worded rejections.",
        "My back hurts, the budget's thin, and there are goblins everywhere. But at least the tea is good today.",
        "An adventurer once asked me for a quest with 'no danger, great pay, and preferably indoors.' I gave them directions to the bakery.",
        "Twelve years. Twelve years of adventurers tracking mud through my guild hall. I should've become a librarian."
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
        "Rowan says you're making real progress. Keep it up!",
        "I've noticed a pattern: every quest starts with 'go here' and ends with 'kill that.' The in-between is where it gets interesting.",
        "Filed a quest under 'miscellaneous' today. It was too weird for any other category. Involved a chicken.",
        "Do you ever read the fine print on quest postings? 'Not responsible for injury, death, or encounters with the supernatural.' Standard stuff.",
        "I keep a 'rejected quests' pile. Someone once posted a quest to find a more interesting quest. Philosophical, but not actionable.",
        "I alphabetized the board again. Rowan said it was 'impressively unhelpful.' I'm choosing to focus on the 'impressive' part.",
        "If I had a gold coin for every time someone ripped a posting off the board without reading it... well, I'd have enough to go on an adventure myself.",
        "I started writing my own quest once. 'Fetch Toma a sweet roll from the bakery.' Nobody took it. I was offering twelve copper!",
        "An adventurer once asked me if the quest board was 'interactive.' I said yes and handed him a quill. He seemed disappointed."
      ]
    },
    "elric-first": {
      id: "elric-first",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Halt. You're the new adventurer Rowan's been talking about? I'm Captain Elric Vale, head of Elderbrook's guard." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "My guards are spread thin dealing with these goblin incursions. If you're half as capable as Rowan claims, we could use your help." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Six months ago, the goblins overran our forward Watch Post east of town. It was my first command, built it with my own hands when I was just a lieutenant." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Good soldiers held that post. Now their badges lie in the dirt and goblins sleep where my guards once stood watch. Some day, I'll take it back." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Come see me when you've proven yourself on the roads. I've got work that needs a steady hand." }
      ],
      onEnd: { flags: ["visitedElric"] }
    },
    "liora-first": {
      id: "liora-first",
      nodes: [
        { speaker: "Liora Bloom", portrait: npcs.liora.portrait, text: "Oh, a new face. Give me one second before you speak or I'll end up tying a bouquet with my order ledger again." },
        { speaker: "Liora Bloom", portrait: npcs.liora.portrait, text: "I'm Liora. I run the flower stall by the square. Bouquets, ribbons, little tokens of luck... all the things that make a hard place feel gentler." },
        { speaker: "Liora Bloom", portrait: npcs.liora.portrait, text: "You look like someone carrying quite a lot. Heroes usually do." },
        { speaker: "Liora Bloom", portrait: npcs.liora.portrait, text: "Come by whenever you need a quiet word or something beautiful to remind you what you're fighting for." }
      ],
      onEnd: { flags: ["visitedLiora"] }
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
        "Stay sharp. The roads get more dangerous by the day.",
        "Filed a request for twelve new guards. The council approved three. And a motivational pamphlet. Very helpful.",
        "My guards are brave, loyal, and hopelessly outnumbered. I'd settle for just the outnumbered part changing.",
        "The council suggested we 'resolve the goblin situation diplomatically.' I invited them to try. Oddly, no volunteers.",
        "I've been captain for five years. My hair was brown when I started. Take from that what you will.",
        "Someone left an anonymous complaint that I work too late. It was in my lieutenant's handwriting. He's not subtle.",
        "I wrote a forty-page security proposal. The council read the summary. The summary of the summary.",
        "Budget meeting tomorrow. I'd rather fight the goblins. At least they're honest about wanting to ruin my day.",
        "Harlan offered to train my guards. Half of them came back stronger. The other half came back crying. Both outcomes are acceptable."
      ]
    },
    "liora-idle": {
      lines: [
        "Fresh flowers won't stop a goblin spear, but they do make the town worth defending.",
        "The square feels lighter when you stop here. I hope that's true for you too, not just for me.",
        "Children always pick the brightest ribbons. Adults go for the quiet colors. I wish more adults were brave.",
        "I grew up on caravan roads. Learning how to make strangers feel welcome becomes second nature after a while.",
        "If the world insists on being harsh, I intend to answer with beauty out of sheer stubbornness.",
        "Fauna says the fox kits steal my ribbon scraps for bedding. I pretend to be annoyed. I'm not.",
        "You're becoming my favorite part of the market day. That's either charming or dangerous. Possibly both.",
        "A town can tell you what it needs by what it buys. Lately Elderbrook has been buying hope in every shape it can find."
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
        "I'll share more when the time is right. For now, trust your instincts.",
        "Yes, I know I'm being cryptic. It's not a personality flaw, it's a professional requirement.",
        "I could explain everything right now, but where's the dramatic tension in that?",
        "Toma asked if I could be 'less ominous' around the quest board. I told him I'd consider it. Ominously.",
        "People keep asking why I wear a hood indoors. Atmosphere. The answer is atmosphere.",
        "I tried being straightforward once. Nobody believed me. So here we are, back to riddles.",
        "Bram asked what I actually do all day. I said 'I peer beyond the veil of reality.' He said 'so, nothing then.'",
        "The ancient texts warn of a coming darkness. They also have excellent pie recipes. Scholars were versatile.",
        "I've been the mysterious stranger in four different towns now. It's less glamorous than it sounds. The travel is exhausting."
      ]
    },

    /* --- Chain Quest Dialogues --- */
    "celebration": {
      id: "celebration",
      nodes: [
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "There you are! The whole town has been waiting for you. I was starting to worry you'd gotten lost. It's a small town. I don't know how, but adventurers find a way." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "People of Elderbrook! Today we celebrate the hero who brought down the goblin threat and saved our roads, our livelihoods, and my sanity!" },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Good steel and a steady hand. That's what I saw out there. Also, you owe me for repairs. But we'll discuss that later. This is your moment." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "I brewed a special batch of festive cider for the occasion! Only mild side effects! I'm kidding. Mostly. Drink up!" },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "My guards can patrol the roads safely again because of what you've done. Elderbrook salutes you. That's an official salute, by the way. I filed the paperwork." },
        { speaker: "Toma Reed", portrait: npcs.toma.portrait, text: "I've added a whole new page to the quest board just for your accomplishments! It's color-coded! With annotations! Nobody asked me to do that but I think you'll appreciate the effort!" },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "Take this gold and supplies. You've earned everything this town can offer. Which, admittedly, isn't a lot. We're working on it." },
        { speaker: "Guildmaster Rowan", portrait: npcs.rowan.portrait, text: "But don't rest too long. The sigil, the orders, Elira's warnings... something bigger is at work. When you're ready, we'll need to look beyond Elderbrook's borders." }
      ],
      onEnd: { flags: ["celebrationDone"], giveItems: ["greater-health-potion", "greater-health-potion", "mana-potion"] }
    },
    "northern-ruins-tease": {
      id: "northern-ruins-tease",
      nodes: [
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Now that the immediate goblin threat is handled, I can tell you what I've been piecing together." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "The sigil from the cave, the markings on the orders, they all point to the same place: the Northern Ruins." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "An ancient complex, buried beneath the mountains north of here. The old texts call it the Hollow of Echoes." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Whatever controlled those goblins came from there. And whatever it is, it's still active." },
        { speaker: "", portrait: "", text: "Elira's eyes are intense, burning with purpose.", choices: [
          { text: "Then that's where we go next.", next: 5, flags: ["northernRuinsTease"] },
          { text: "How dangerous are we talking?", next: 6, flags: ["northernRuinsTease"] }
        ]},
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "When the time comes, yes. But not yet. The path to the Northern Ruins must be found first, and I need to finish translating the manuscripts.", next: 7 },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "More dangerous than anything in that goblin cave. The Hollow of Echoes was sealed for a reason. But we don't have a choice. If we don't go to it, whatever's there will come to us." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "For now, strengthen yourself. Build alliances. Prepare. The road north will test everything you've become." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "When I've found the path, I'll come to you. Until then, be ready." }
      ],
      onEnd: { flags: ["northernRuinsTease"] }
    },
    "sq16-complete": {
      id: "sq16-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Three wolves down. My patrol reported a much quieter road today. That's your doing." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Here's your payment. And... thank you. The guards were losing morale before you stepped in." }
      ]
    },
    "sq17-complete": {
      id: "sq17-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "Scouts and wolves cleared from the road. My patrols can actually complete their routes now." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "You've done more for road safety in a week than my undermanned guard has managed in months. Take this, you've earned it." }
      ]
    },
    "cq1-complete": {
      id: "cq1-complete",
      nodes: [
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Let me see that ore. Hmm... good weight, clean grain. You didn't just grab the first shiny rock you saw. I'm impressed." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "My grandfather's anvil has sat cold for too long. Time to light the forge again. She's been judging me." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Come back when you've found beast sinew and an enchanted shard. I've got a masterwork in mind. And by 'in mind' I mean I've been sketching it obsessively for three days." }
      ]
    },
    "cq2-complete": {
      id: "cq2-complete",
      nodes: [
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Beast sinew for flexibility, enchanted shard for the edge... perfect. Now stand back. And I mean it, last time someone watched me work they singed their eyebrows off." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "Give me a moment. ...Right. Done. Don't look at me like that, some of us are just that good." },
        { speaker: "Bram Ironhand", portrait: npcs.bram.portrait, text: "There. A tempered blade worthy of the Ironhand name. And the forge stays lit. I'll be crafting enhanced gear from now on. Try not to break this one immediately." }
      ]
    },
    "cq3-complete": {
      id: "cq3-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Shadow essence combined with cave herb extract... the reaction is — oh! Oh that's beautiful. And only slightly on fire. That's normal!" },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "This could change everything! With more materials, I could produce antidotes, enhanced formulae, maybe even — no. One breakthrough at a time. Bram's still upset about the last 'breakthrough.'" },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Here, take these antidotes. You'll need them against those goblin shamans. And if your tongue goes numb, that's just the antidote working. Probably." }
      ]
    },
    "cq4-complete": {
      id: "cq4-complete",
      nodes: [
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "This is enough to set up a proper production line! My lab is officially upgraded! I even wrote 'UPGRADED' on the door. Very official." },
        { speaker: "Mira Voss", portrait: npcs.mira.portrait, text: "Take these supplies. And from now on, I'll have cleansing potions and enhanced brews in stock. The workshop may not survive, but you certainly will!" }
      ]
    },
    "cq5-complete": {
      id: "cq5-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "The wolf population along the roads is finally under control. My patrols are reporting significantly fewer 'screaming while running' incidents." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "But the Watch Post is still occupied. My guards won't patrol past it. Can't blame them, honestly. Can you handle that too?" }
      ]
    },
    "cq6-complete": {
      id: "cq6-complete",
      nodes: [
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "The Watch Post is ours again. Another badge recovered too. Two families will find peace tonight." },
        { speaker: "Captain Elric Vale", portrait: npcs.elric.portrait, text: "My guards can resume patrols. The roads will be safer because of what you've done." }
      ]
    },
    "cq7-complete": {
      id: "cq7-complete",
      nodes: [
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Shadow essence and goblin inscriptions. Let me see..." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Yes, just as I suspected. The sigil is a binding mark, old magic used to compel obedience. Someone branded it onto the goblins to control them." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "But this script is incomplete. There are texts in the northern ruins that could tell us more. I need materials to preserve them before they crumble to dust." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Bring me beast sinew for binding and cave herbs for preservation. Then we'll learn who is truly behind all of this." }
      ]
    },
    "cq8-complete": {
      id: "cq8-complete",
      nodes: [
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Perfect. With these I can preserve the manuscripts and bind them properly." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "The texts speak of a power that slumbered beneath these lands for centuries. The goblins were just the first to be touched by it." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Whatever comes next will be far more dangerous than goblin raids. But at least now we know what we're dealing with." },
        { speaker: "Elira Ashfen", portrait: npcs.elira.portrait, text: "Keep this enchanted shard. You'll need it. And keep your eyes open, the signs are everywhere if you know where to look." }
      ]
    },

    /* ── Class Mentor First Meeting Dialogues ── */
    "varn-first": {
      id: "varn-first",
      nodes: [
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "You. Stop shuffling and stand up straight. I've seen scarecrows with better posture." },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "I'm Varn. I've trained soldiers, mercenaries, and one particularly stubborn mule. The mule was the fastest learner." },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "If you want to walk the Warrior's path, you'll need grit, steel, and iron in your blood. Not metaphorical iron. Actual iron ore. I'll explain." },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "Bring me proof you can handle yourself out there. Kill wolves, clear goblin scouts, and bring back iron ore. Then we'll talk about making you a warrior." },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "Understand this before you answer: you can only choose one class path, and once that choice is made it is permanent. Do you want to start the Warrior quest line?", choices: [
          { text: "Start the Warrior quest line.", flags: ["metVarn"], quest: "cq-warrior", next: 5 },
          { text: "Not yet.", next: 6 }
        ] },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "Good. Then stop gawking and get moving.", end: true },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "Then come back when you're ready to commit.", end: true }
      ]
    },
    "shade-first": {
      id: "shade-first",
      nodes: [
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "...You noticed me. That's either impressive or I'm getting sloppy. Let's say impressive." },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "Most people walk right past this alley. But you looked. That tells me something about you." },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "The shadows aren't just for hiding. They're a way of life. Speed, precision, knowing when to strike and when to vanish." },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "If you want to learn, prove yourself. Hunt goblin sneaks, take down wolves, and bring me beast sinew. Then you'll earn the right to call yourself a Rogue." },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "One warning. You only get one class path, and when you choose it, that's permanent. Do you want to start the Rogue quest line?", choices: [
          { text: "Start the Rogue quest line.", flags: ["metShade"], quest: "cq-rogue", next: 5 },
          { text: "Not yet.", next: 6 }
        ] },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "Good choice. Finish the contract and we'll see what you're made of.", end: true },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "Take your time. The shadows will still be here when you're ready.", end: true }
      ]
    },
    "theron-first": {
      id: "theron-first",
      nodes: [
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Mmm? Oh! A visitor. Apologies, I was deep in thought. Or possibly asleep. The lines blur at my age." },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "I am Theron, a student of the arcane. I came to Elderbrook following ley lines and ended up staying because Mira makes excellent tea." },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "I sense a flicker of arcane potential in you. Raw, untrained, like a candle trying to be a bonfire. Adorable." },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Gather moonpetal herbs, defeat a few goblin scouts to test your nerve, and find me a shadow essence. Do this, and I'll teach you to channel that spark into true magic." },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Now, an important warning before we begin: you may only choose one class path, and that choice is permanent. Would you like to start the Mage quest line?", choices: [
          { text: "Start the Mage quest line.", flags: ["metTheron"], quest: "cq-mage", next: 5 },
          { text: "Not yet.", next: 6 }
        ] },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Splendid. Bring me what I asked for, and we'll turn that spark into something far more dangerous.", end: true },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Quite all right. Life-changing decisions are best made with a reasonably awake mind.", end: true }
      ]
    },
    "lysara-first": {
      id: "lysara-first",
      nodes: [
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "Hail, warrior. I am Dame Lysara of the Order of the Silver Shield. I've heard tales of your exploits." },
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "A warrior fights with strength. A knight fights with purpose. The difference is what separates a soldier from a guardian." },
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "If you wish to take the Knight's Oath, you must first prove your valor. Face the strongest foes, hold your ground, and bring iron to forge your shield." },
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "Return to me when you've completed these trials. Only then will you be worthy of the oath." }
      ],
      onEnd: { flags: ["metLysara"], quest: "cq-knight" }
    },
    "grul-first": {
      id: "grul-first",
      nodes: [
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "You. Warrior. I smell battle on you. Good." },
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "Grul was outcast. Too wild, they said. Too dangerous. Grul says not wild enough." },
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "The berserker does not think. The berserker does not fear. The berserker becomes the storm." },
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "You want this power? Then prove you can unleash it. Crush goblin raiders. Tear through wolf packs. Bring Grul victory. Then Grul teaches." }
      ],
      onEnd: { flags: ["metGrul"], quest: "cq-berserker" }
    },
    "whisper-first": {
      id: "whisper-first",
      nodes: [
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "You move well for a rogue. But moving well and killing silently are very different arts." },
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "I have a contract. Targets that need to disappear. Quietly. Efficiently. Without drama." },
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "Complete this contract and I will teach you the assassin's way. Eliminate goblin sneaks, deal with their shamans, and bring proof of your kills." },
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "Fail, and we never had this conversation. Understood?" }
      ],
      onEnd: { flags: ["metWhisper"], quest: "cq-assassin" }
    },
    "fenn-first": {
      id: "fenn-first",
      nodes: [
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "The forest speaks, if you know how to listen. The wind carries warnings. The tracks tell stories." },
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "I am Fenn, Warden of these woods. Or what's left of them, after the goblins moved in." },
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "A rogue fights in shadows. A ranger commands the wilds. If you want to walk my path, prove you belong out there." },
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "Hunt goblin archers who threaten my forest, track wolves to their dens, and gather moonpetal before the goblins trample it all. Then return to me." }
      ],
      onEnd: { flags: ["metFenn"], quest: "cq-ranger" }
    },
    "cindra-first": {
      id: "cindra-first",
      nodes: [
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "Careful! Don't step on the — oh, it's fine. The scorch marks were already there. Mostly." },
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "I'm Cindra. Fire mage. Or 'dangerously irresponsible arsonist,' depending on who you ask. I prefer the first one." },
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "You've got the mind for magic, I can tell. But arcane shields and careful study? Boring. Fire is passion. Fire is power. Fire is FUN." },
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "Prove you can handle the heat. Destroy goblin shamans, gather shadow essence and moonpetal for reagents. Then I'll show you what real power looks like." }
      ],
      onEnd: { flags: ["metCindra"], quest: "cq-pyromancer" }
    },
    "maren-first": {
      id: "maren-first",
      nodes: [
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "Welcome, child. I am Sister Maren, a servant of the Light. I have been traveling, healing where I can." },
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "The arcane arts are powerful, but they are cold. The Light offers warmth, healing, and protection for those who serve with compassion." },
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "I sense the gift within you. If you wish to answer the divine calling, you must first prove your heart." },
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "Gather sacred moonpetal, stand against the goblin brutes who prey on the helpless, and bring shadow essence to be purified. Then your training begins." }
      ],
      onEnd: { flags: ["metMaren"], quest: "cq-cleric" }
    },
    "cedric-first": {
      id: "cedric-first",
      nodes: [
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "I have watched your journey with great interest, adventurer. You have proven yourself in battle and in spirit." },
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "I am Sir Cedric, last of the Order of the Radiant Dawn. Once, paladins defended these lands from the darkness. Now I am all that remains." },
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "The paladin's path demands mastery of both blade and faith. It is the hardest road, but also the most rewarding." },
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "Complete my crucible. Face the strongest foes, gather iron and moonpetal, and return to me. Then, and only then, will I pass on the sacred rites." }
      ],
      onEnd: { flags: ["metCedric"], quest: "cq-paladin" }
    },

    /* ── Class Quest Completion Dialogues ── */
    "cq-warrior-complete": {
      id: "cq-warrior-complete",
      nodes: [
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "You're still standing. Good. Most don't make it this far without crying at least once." },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "You've got the makings of a warrior. Not a great one. Not yet. But the iron is there. I can work with iron." },
        { speaker: "Varn the Ironclad", portrait: npcs.varn.portrait, text: "From this day forward, you walk the Warrior's path. Stand tall, hit hard, and never back down." }
      ],
      onEnd: { buildClass: "warrior" }
    },
    "cq-rogue-complete": {
      id: "cq-rogue-complete",
      nodes: [
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "Clean work. No witnesses, no loose ends. You learn fast." },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "The shadow embraces those who respect it. Strike first, strike silent, and never be where they expect you." },
        { speaker: "Shade", portrait: npcs.shade.portrait, text: "Welcome to the shadows, Rogue. Try not to trip over anything on the way in." }
      ],
      onEnd: { buildClass: "rogue" }
    },
    "cq-mage-complete": {
      id: "cq-mage-complete",
      nodes: [
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Excellent! The reagents are pure, and your nerve held. That's more than I can say for my last three students. One of them set his own beard on fire." },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "I can feel your potential crystallizing. The arcane flows through you now, not just around you." },
        { speaker: "Sage Theron", portrait: npcs.theron.portrait, text: "Welcome to the path of the Mage. The universe is your library. Try not to knock over any shelves." }
      ],
      onEnd: { buildClass: "mage" }
    },
    "cq-knight-complete": {
      id: "cq-knight-complete",
      nodes: [
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "You stood your ground against overwhelming odds. You did not falter. You did not flee." },
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "Kneel. By the authority vested in me by the Order of the Silver Shield, I name you Knight." },
        { speaker: "Dame Lysara", portrait: npcs.lysara.portrait, text: "Rise, Knight. Carry this honor with you always. Defend the weak, uphold justice, and never surrender." }
      ],
      onEnd: { buildClass: "knight" }
    },
    "cq-berserker-complete": {
      id: "cq-berserker-complete",
      nodes: [
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "HAHA! You fight like storm! Grul is pleased!" },
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "Grul sees the rage in you now. Not anger. Rage. Is different. Anger is weakness. Rage is power." },
        { speaker: "Grul", portrait: npcs.grul.portrait, text: "You are Berserker now. Let nothing stand. Let nothing stop. BE THE STORM." }
      ],
      onEnd: { buildClass: "berserker" }
    },
    "cq-assassin-complete": {
      id: "cq-assassin-complete",
      nodes: [
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "The contract is fulfilled. Every target eliminated. No traces. Professional work." },
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "You have earned the title of Assassin. From this moment, you are a blade in the dark." },
        { speaker: "Whisper", portrait: npcs.whisper.portrait, text: "Remember: the best kills are the ones nobody knows happened. Now go. We were never here." }
      ],
      onEnd: { buildClass: "assassin" }
    },
    "cq-ranger-complete": {
      id: "cq-ranger-complete",
      nodes: [
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "The forest accepted you. That is not something that can be taught or bought." },
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "You tracked, you hunted, you provided. The wilds are now your home and your weapon." },
        { speaker: "Warden Fenn", portrait: npcs.fenn.portrait, text: "Walk the Ranger's path with pride. The forest will always guide you, if you listen." }
      ],
      onEnd: { buildClass: "ranger" }
    },
    "cq-pyromancer-complete": {
      id: "cq-pyromancer-complete",
      nodes: [
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "PERFECT! Look at these reagents! The shadow essence is practically vibrating with potential!" },
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "Now hold still while I — there! Feel that? That warmth in your chest? That's not indigestion. That's POWER." },
        { speaker: "Cindra", portrait: npcs.cindra.portrait, text: "Welcome to the Pyromancer's path! Set things on fire responsibly! Or irresponsibly! I'm not your mother!" }
      ],
      onEnd: { buildClass: "pyromancer" }
    },
    "cq-cleric-complete": {
      id: "cq-cleric-complete",
      nodes: [
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "You gathered the sacred herbs, you stood against cruelty, and you brought the shadow essence for purification." },
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "The Light has answered. I can feel its warmth flowing through you now, child." },
        { speaker: "Sister Maren", portrait: npcs.maren.portrait, text: "Go forth as a Cleric. Heal the wounded, protect the innocent, and carry the Light wherever darkness gathers." }
      ],
      onEnd: { buildClass: "cleric" }
    },
    "cq-paladin-complete": {
      id: "cq-paladin-complete",
      nodes: [
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "You have endured the crucible. Few have ever completed it. Fewer still survived with their spirit intact." },
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "By the sacred rites of the Order of the Radiant Dawn, I bestow upon you the title of Paladin." },
        { speaker: "Sir Cedric", portrait: npcs.cedric.portrait, text: "You are the dawn in the darkness. Wield faith and steel as one. The Order lives again through you." }
      ],
      onEnd: { buildClass: "paladin" }
    },

    /* ── Class Mentor Idle Dialogues ── */
    "varn-idle": {
      lines: [
        "Stand straighter. You're not a question mark, you're a warrior.",
        "The training grounds are open if you need to work off some of that poor posture.",
        "Every scar tells a story. Most of mine say 'I should have dodged.'",
        "Discipline wins battles. Luck just keeps you alive long enough to learn discipline."
      ]
    },
    "shade-idle": {
      lines: [
        "Stop looking for me. If I wanted to be found, you'd know.",
        "The best blade is the one nobody sees coming.",
        "Shadows don't judge. That's what I like about them.",
        "Every lock has a key. Every guard has a blind spot. Every plan has a flaw."
      ]
    },
    "theron-idle": {
      lines: [
        "I was just reading about dimensional rifts. Fascinating stuff. Terrifying, but fascinating.",
        "Tea? No? Your loss. Mira's blend is extraordinary. Possibly magical. Definitely caffeinated.",
        "The ley lines here are unusually active. Either something powerful is nearby, or I'm holding the map upside down again.",
        "Knowledge is the greatest weapon. Second greatest is a very large fireball."
      ]
    },
    "lysara-idle": {
      lines: [
        "A knight's armor is polished not for vanity, but for respect. Respect for the oath.",
        "The Order of the Silver Shield once protected every town from here to the northern mountains.",
        "Duty does not rest. Neither shall we.",
        "Your form is improving. Keep training."
      ]
    },
    "grul-idle": {
      lines: [
        "Grul is bored. Grul wants to fight something.",
        "Town is too quiet. Makes Grul itchy.",
        "You train today? Grul can spar. Grul promises to only break a few things.",
        "The rage is always there. Control is what separates berserker from beast. Usually."
      ]
    },
    "whisper-idle": {
      lines: [
        "You're being watched. Not by me. Well, also by me. But someone else too.",
        "Information is currency. I'm quite wealthy.",
        "Silence is an underrated skill. Most people talk too much. Present company included.",
        "Every shadow has a story. Most of them end badly for someone."
      ]
    },
    "fenn-idle": {
      lines: [
        "The forest is recovering, slowly. The goblins left deep scars.",
        "Listen to the birds. When they go quiet, something dangerous is near.",
        "I planted three saplings this morning. Small acts of restoration.",
        "The wilds don't care about titles or gold. Only survival matters out there."
      ]
    },
    "cindra-idle": {
      lines: [
        "I may have accidentally set fire to something again. Don't worry, it was just a bush. An already-dead bush.",
        "Did you know shadow essence is mildly flammable? I found out the exciting way.",
        "Sage Theron says I need to 'exercise restraint.' I exercised it right into a fireball. Same thing, really.",
        "Some people meditate for inner peace. I just set things on fire. Much faster."
      ]
    },
    "maren-idle": {
      lines: [
        "The Light shines on all who seek it. Even those who don't realize they're looking.",
        "I healed a guardsman's broken arm today. He tried to pay me. I told him to pay it forward.",
        "Prayer and medicine work hand in hand. One feeds the soul, the other keeps it housed.",
        "There is strength in gentleness. Never forget that."
      ]
    },
    "cedric-idle": {
      lines: [
        "The Order of the Radiant Dawn was once fifty strong. Now there are two of us.",
        "Faith is not the absence of doubt. It is the choice to act despite it.",
        "I keep my vigil because someone must. The darkness does not rest, and neither shall the dawn.",
        "Your progress honors the Order. Continue to walk in the Light."
      ]
    }
  };

  /* ── Town Events (spawnable NPC encounters) ── */
  var townEvents = [
    {
      id: "traveling-merchant",
      weight: 20,
      flag: "townEventMerchant",
      repeatable: true,
      location: "town",
      npcName: "Traveling Merchant",
      npcPortrait: "assets/portraits/traveler.png",
      poiPosition: "top:65%;right:8%",
      poiSub: "Rare wares",
      dialogue: {
        id: "town-event-merchant",
        nodes: [
          { speaker: "Traveling Merchant", portrait: "assets/portraits/traveler.png", text: "Psst! You there! Yes, you, the one who looks like they have disposable income! I've got rare wares from beyond the frontier. Very rare. Extremely legitimate." },
          { speaker: "", portrait: "", text: "A travelling merchant has set up near the gate. His smile is a little too wide.", choices: [
            { text: "Browse the wares.", next: 2, flags: ["merchantBrowsed"] },
            { text: "Not interested.", next: 3 }
          ]},
          { speaker: "Traveling Merchant", portrait: "assets/portraits/traveler.png", text: "A discerning customer! I've got goods you won't find in any local shop. Mostly because local shops have 'standards' and 'regulations.' Come find me at the market!", end: true },
          { speaker: "Traveling Merchant", portrait: "assets/portraits/traveler.png", text: "Your loss, friend! These deals won't last! Mainly because I need to leave before the next town's guard captain recognizes me!", end: true }
        ],
        onEnd: { flags: ["townEventMerchant"] }
      }
    },
    {
      id: "wandering-bard",
      weight: 15,
      flag: "townEventBard",
      repeatable: true,
      location: "town",
      npcName: "Wandering Bard",
      npcPortrait: "assets/portraits/Bard.png",
      poiPosition: "top:60%;left:35%",
      poiSub: "A song for the hero",
      dialogue: {
        id: "town-event-bard",
        nodes: [
          { speaker: "Wandering Bard", portrait: "assets/portraits/Bard.png", text: "A hero walks among us! Stand back, everyone! Let me sing the tale of your deeds! I've been workshopping this one all week!" },
          { speaker: "", portrait: "", text: "A bard has heard of your adventures and composed a song. He looks extremely proud of himself.", choices: [
            { text: "Listen to the song.", next: 2 },
            { text: "Maybe later.", next: 4 }
          ]},
          { speaker: "Wandering Bard", portrait: "assets/portraits/Bard.png", text: "Ahem! 'Steel met fang in the hollow dark, the hero stood where none would dare! With blade held high and purpose stark... and, um, really impressive hair!'" },
          { speaker: "Wandering Bard", portrait: "assets/portraits/Bard.png", text: "The last verse still needs work. Rhyming is harder than it looks. But the important thing is the emotion! You felt the emotion, right? ...Right?", end: true },
          { speaker: "Wandering Bard", portrait: "assets/portraits/Bard.png", text: "Everybody's a critic. That's fine. The ballad will be here when you're ready. I might even fix the third verse by then.", end: true }
        ],
        onEnd: { flags: ["townEventBard"] }
      }
    },
    {
      id: "rumor-mill",
      weight: 25,
      flag: "townEventRumor",
      repeatable: true,
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
    },
    {
      id: "elira-sighting",
      weight: 40,
      flag: "eliraForeshadow",
      repeatable: false,
      requireFlag: "completedMQ3",
      location: "town",
      npcName: "Hooded Stranger",
      npcPortrait: "assets/portraits/elira.png",
      poiPosition: "top:42%;right:20%",
      poiSub: "Watching you",
      dialogue: {
        id: "town-event-elira",
        nodes: [
          { speaker: "", portrait: "", text: "A hooded figure stands near the edge of the square, watching you with quiet intensity. Something about her feels familiar." },
          { speaker: "Hooded Stranger", portrait: "assets/portraits/elira.png", text: "You've been busy. The cave, the sigil, the goblins... you've stumbled into something far older than you realize." },
          { speaker: "", portrait: "", text: "She seems to know more than she should.", choices: [
            { text: "Who are you? How do you know about the cave?", next: 3 },
            { text: "Are you following me?", next: 4 }
          ]},
          { speaker: "Hooded Stranger", portrait: "assets/portraits/elira.png", text: "Someone who's been watching these events unfold longer than you'd believe. That sigil you found, it's not goblin work. It's much older.", next: 5 },
          { speaker: "Hooded Stranger", portrait: "assets/portraits/elira.png", text: "Let's just say our paths are intertwined, whether you know it yet or not. That sigil the goblins carry, it's a mark I've seen before." },
          { speaker: "Hooded Stranger", portrait: "assets/portraits/elira.png", text: "Be careful in those depths. The goblin chief answers to something he doesn't understand. And when you've dealt with him, find me. We have much to discuss." },
          { speaker: "", portrait: "", text: "Before you can respond, she slips into the crowd and vanishes.", end: true }
        ],
        onEnd: { flags: ["eliraForeshadow", "metElira"] }
      }
    },
    {
      id: "injured-guard",
      weight: 18,
      flag: "townEventGuard",
      repeatable: true,
      location: "town",
      npcName: "Injured Guard",
      npcPortrait: "assets/portraits/Guard-1.png",
      poiPosition: "top:55%;right:15%",
      poiSub: "Looks wounded",
      dialogue: {
        id: "town-event-guard",
        nodes: [
          { speaker: "Injured Guard", portrait: "assets/portraits/Guard-1.png", text: "Ambushed... on the east road. Three of them came out of nowhere." },
          { speaker: "Injured Guard", portrait: "assets/portraits/Guard-1.png", text: "The goblins are getting bolder. They hit our patrol just a mile from the gates. We barely got away." },
          { speaker: "", portrait: "", text: "The guard is bleeding from a gash on his arm.", choices: [
            { text: "Rest easy. I'll deal with the goblins.", next: 3 },
            { text: "Get to Mira's shop. She can patch you up.", next: 4 }
          ]},
          { speaker: "Injured Guard", portrait: "assets/portraits/Guard-1.png", text: "Thank you, adventurer. Captain Elric will want to hear about this. Be careful out there.", end: true },
          { speaker: "Injured Guard", portrait: "assets/portraits/Guard-1.png", text: "Good thinking. I'll head there now. Watch yourself, they're not just scouts anymore, these ones fought like soldiers.", end: true }
        ],
        onEnd: { flags: ["townEventGuard"] }
      }
    },
    {
      id: "lost-child",
      weight: 12,
      flag: "townEventChild",
      repeatable: true,
      hideIfFlag: "lookingForBiscuit",
      location: "town",
      npcName: "Lost Child",
      npcPortrait: "assets/portraits/lost-child.png",
      poiPosition: "top:68%;left:25%",
      poiSub: "Looking around",
      dialogue: {
        id: "town-event-child",
        nodes: [
          { speaker: "Lost Child", portrait: "assets/portraits/lost-child.png", text: "Excuse me... have you seen my cat? She ran toward the front gate and I can't find her anywhere." },
          { speaker: "", portrait: "", text: "A small child looks up at you with tearful eyes.", choices: [
            { text: "I'll keep an eye out for her. What does she look like?", next: 2, flags: ["lookingForBiscuit"] },
            { text: "I'm sure she'll come back on her own. Cats always do.", next: 3 }
          ]},
          { speaker: "Lost Child", portrait: "assets/portraits/lost-child.png", text: "She's orange with a white spot on her nose! Her name is Biscuit. Thank you, you're really nice!", end: true },
          { speaker: "Lost Child", portrait: "assets/portraits/lost-child.png", text: "I hope so. Mama says cats have nine lives, but I still worry about her.", end: true }
        ],
        onEnd: { flags: ["townEventChild"] }
      }
    },
    {
      id: "festival-prep",
      weight: 10,
      flag: "townEventFestival",
      repeatable: true,
      requireFlag: "completedMQ4",
      location: "town",
      npcName: "Cheerful Villager",
      npcPortrait: "assets/portraits/villager_female.png",
      poiPosition: "top:50%;left:45%",
      poiSub: "Decorating",
      dialogue: {
        id: "town-event-festival",
        nodes: [
          { speaker: "Cheerful Villager", portrait: "assets/portraits/villager_female.png", text: "You haven't heard? We're preparing a harvest festival! The first one in two years, thanks to adventurers like you keeping the roads safe." },
          { speaker: "Cheerful Villager", portrait: "assets/portraits/villager_female.png", text: "Mira's brewing festive cider, Bram's making commemorative daggers, even grumpy Harlan is smiling. Well, his frown is slightly less intense. For him, that's basically beaming." },
          { speaker: "", portrait: "", text: "The town feels alive with activity.", choices: [
            { text: "Sounds wonderful. I'll try not to miss it.", next: 3 },
            { text: "A festival? In these times?", next: 4 }
          ]},
          { speaker: "Cheerful Villager", portrait: "assets/portraits/villager_female.png", text: "You should stick around! Everyone's talking about you. The hero of Elderbrook deserves a celebration too!", end: true },
          { speaker: "Cheerful Villager", portrait: "assets/portraits/villager_female.png", text: "That's exactly why we need it! People have been living in fear for months. A little joy reminds us what we're fighting for.", end: true }
        ],
        onEnd: { flags: ["townEventFestival"] }
      }
    },
    {
      id: "suspicious-stranger",
      weight: 15,
      flag: "townEventStranger",
      repeatable: false,
      requireFlag: "completedMQ6",
      location: "town",
      npcName: "Cloaked Figure",
      npcPortrait: "assets/portraits/traveler.png",
      poiPosition: "top:40%;left:10%",
      poiSub: "Watching the guild",
      dialogue: {
        id: "town-event-stranger",
        nodes: [
          { speaker: "", portrait: "", text: "A cloaked figure lingers near the guild hall, studying the building with an unsettling focus. They notice you watching them." },
          { speaker: "Cloaked Figure", portrait: "assets/portraits/traveler.png", text: "You're the one who's been causing trouble for the goblins. News travels faster than you'd think." },
          { speaker: "", portrait: "", text: "Something about them feels wrong.", choices: [
            { text: "Who are you? What do you want?", next: 3 },
            { text: "You seem to know a lot about me.", next: 4 }
          ]},
          { speaker: "Cloaked Figure", portrait: "assets/portraits/traveler.png", text: "Nobody important. Just a traveler with an interest in... ancient things. That sigil the goblins carried? It's older than this village. Much older.", next: 5 },
          { speaker: "Cloaked Figure", portrait: "assets/portraits/traveler.png", text: "I make it my business to know things. Especially about people who poke around in dark caves and find things they shouldn't." },
          { speaker: "Cloaked Figure", portrait: "assets/portraits/traveler.png", text: "A word of advice, adventurer. Not everything buried beneath the earth wants to stay buried. And not everyone searching for it has good intentions." },
          { speaker: "", portrait: "", text: "The figure turns and walks calmly into the crowd. By the time you follow, they're gone.", end: true }
        ],
        onEnd: { flags: ["townEventStranger"] }
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
    { id: "treasure-seeker", name: "Treasure Seeker", description: "Find a secret room in the dungeon." },
    { id: "errand-runner", name: "Errand Runner", description: "Complete 5 side quests." },
    { id: "town-hero", name: "Town Hero", description: "Complete all Chapter 1 side quests." },
    { id: "town-regular", name: "Town Regular", description: "Experience 4 different town events." },
    { id: "class-rapport", name: "Class Rapport", description: "Reach Friend status with an NPC who prefers your build class." },
    { id: "road-guardian", name: "Road Guardian", description: "Complete both of Elric's early patrol quests." },
    { id: "prepared-hero", name: "Prepared Hero", description: "Complete the celebration and learn about the Northern Ruins." }
  ];

  /* ── Post-Game Bounty Board ── */
  var bountyTemplates = [
    { target: "goblin-scout", targetName: "Goblin Scouts", count: 5, xp: 40, gold: 30
    },
    { target: "goblin-brute", targetName: "Goblin Brutes", count: 3, xp: 50, gold: 40 },
    { target: "wolf", targetName: "Wolves", count: 4, xp: 35, gold: 25 },
    { target: "goblin-raider", targetName: "Goblin Raiders", count: 4, xp: 45, gold: 35 },
    { target: "bandit", targetName: "Bandits", count: 3, xp: 45, gold: 35 },
    { target: "goblin-shaman", targetName: "Goblin Shamans", count: 2, xp: 60, gold: 50 }
  ];

  function rollDailyBounty(p) {
    if (!p.storyFlags || !p.storyFlags.chapter1Complete) return null;
    // One bounty per day, seeded by day number
    var dayIndex = (p.day || 1) % bountyTemplates.length;
    var tmpl = bountyTemplates[dayIndex];
    return {
      id: "bounty-" + tmpl.target,
      name: "Bounty: " + tmpl.targetName,
      type: "bounty",
      description: "Hunt " + tmpl.count + " " + tmpl.targetName + " for the guild.",
      target: tmpl.target,
      count: tmpl.count,
      rewards: { xp: tmpl.xp, gold: tmpl.gold }
    };
  }

  /* ── Public API ── */
  function getNPC(id) { return npcs[id] || null; }
  function getAllNPCs() { return npcs; }
  function getLocation(id) { return locations[id] || null; }
  function getAllLocations() { return locations; }
  function getQuest(id) { return quests[id] || getBoardQuestTemplate(id) || null; }
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
      if (ev.requireFlag && !p.storyFlags[ev.requireFlag]) continue;
      if (ev.hideIfFlag && p.storyFlags[ev.hideIfFlag]) continue;
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
      if (ev.requireFlag && !p.storyFlags[ev.requireFlag]) continue;
      if (ev.hideIfFlag && p.storyFlags[ev.hideIfFlag]) continue;
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
        if (ev.hideIfFlag && Player.hasFlag(ev.hideIfFlag)) continue;
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

  /* ── Daily Board Quest Templates (30 variations) ── */
  var boardQuestTemplates = [
    // --- Hunt quests (Tier 1 — early game) ---
    { id: "bq-wolf-cull", name: "Wolf Cull", description: "Thin the wolf packs near the Forest Road.",
      objectives: [{ type: "kill", id: "k-wolf", target: "wolf", required: 4, text: "Defeat wolves" }],
      rewards: { xp: 30, gold: 20 }, tier: 1 },
    { id: "bq-goblin-sweep", name: "Goblin Sweep", description: "Clear goblin scouts from the Forest Road.",
      objectives: [{ type: "kill", id: "k-gs", target: "goblin-scout", required: 5, text: "Defeat goblin scouts" }],
      rewards: { xp: 35, gold: 25 }, tier: 1 },
    { id: "bq-sneak-hunt", name: "Sneak Hunt", description: "Hunt down the sneaky goblins lurking in the undergrowth.",
      objectives: [{ type: "kill", id: "k-gsn", target: "goblin-sneak", required: 4, text: "Defeat goblin sneaks" }],
      rewards: { xp: 35, gold: 25 }, tier: 1 },
    { id: "bq-road-patrol", name: "Road Safety", description: "Patrol the Forest Road and remove threats.",
      objectives: [{ type: "kill", id: "k-wolf2", target: "wolf", required: 3, text: "Defeat wolves" }, { type: "kill", id: "k-gs2", target: "goblin-scout", required: 3, text: "Defeat goblin scouts" }],
      rewards: { xp: 40, gold: 30 }, tier: 1 },
    { id: "bq-bandit-warning", name: "Bandit Warning", description: "Bandits have been spotted on the roads. Teach them a lesson.",
      objectives: [{ type: "kill", id: "k-ban", target: "bandit", required: 3, text: "Defeat bandits" }],
      rewards: { xp: 40, gold: 30 }, tier: 1 },
    // --- Hunt quests (Tier 2 — mid game) ---
    { id: "bq-raider-purge", name: "Raider Purge", description: "Goblin raiders are ambushing traders on the Goblin Trail.",
      objectives: [{ type: "kill", id: "k-gr", target: "goblin-raider", required: 5, text: "Defeat goblin raiders" }],
      rewards: { xp: 50, gold: 40 }, tier: 2 },
    { id: "bq-archer-nest", name: "Archer Nest", description: "Goblin archers have set up positions along the trail. Clear them.",
      objectives: [{ type: "kill", id: "k-ga", target: "goblin-archer", required: 4, text: "Defeat goblin archers" }],
      rewards: { xp: 50, gold: 35 }, tier: 2 },
    { id: "bq-pack-leader", name: "Pack Leader", description: "Wolf pack leaders are emboldening the beasts. Take them down.",
      objectives: [{ type: "kill", id: "k-wp", target: "wolf-pack", required: 3, text: "Defeat wolf pack leaders" }],
      rewards: { xp: 55, gold: 40 }, tier: 2 },
    { id: "bq-trail-sweep", name: "Trail Sweep", description: "The Goblin Trail is crawling with foes. Clean it up.",
      objectives: [{ type: "kill", id: "k-gr2", target: "goblin-raider", required: 3, text: "Defeat goblin raiders" }, { type: "kill", id: "k-ga2", target: "goblin-archer", required: 3, text: "Defeat goblin archers" }],
      rewards: { xp: 60, gold: 45 }, tier: 2 },
    { id: "bq-highwaymen", name: "Highwaymen", description: "Bandits and wolves are terrorising the roads together.",
      objectives: [{ type: "kill", id: "k-ban2", target: "bandit", required: 3, text: "Defeat bandits" }, { type: "kill", id: "k-wolf3", target: "wolf", required: 3, text: "Defeat wolves" }],
      rewards: { xp: 55, gold: 40 }, tier: 2 },
    // --- Hunt quests (Tier 3 — late game) ---
    { id: "bq-brute-force", name: "Brute Force", description: "Goblin brutes are massing near the cave entrance.",
      objectives: [{ type: "kill", id: "k-gb", target: "goblin-brute", required: 3, text: "Defeat goblin brutes" }],
      rewards: { xp: 70, gold: 55 }, tier: 3 },
    { id: "bq-shaman-silence", name: "Silence the Shamans", description: "Goblin shamans are casting dark rituals. Stop them.",
      objectives: [{ type: "kill", id: "k-gsh", target: "goblin-shaman", required: 3, text: "Defeat goblin shamans" }],
      rewards: { xp: 70, gold: 50 }, tier: 3 },
    { id: "bq-cave-guard", name: "Cave Guard Duty", description: "Goblin guards are reinforcing their tunnels. Push them back.",
      objectives: [{ type: "kill", id: "k-gg", target: "goblin-guard", required: 4, text: "Defeat goblin guards" }],
      rewards: { xp: 65, gold: 50 }, tier: 3 },
    { id: "bq-den-cleanout", name: "Den Cleanout", description: "Clear the strongest goblins from the cave approaches.",
      objectives: [{ type: "kill", id: "k-gb2", target: "goblin-brute", required: 2, text: "Defeat goblin brutes" }, { type: "kill", id: "k-gsh2", target: "goblin-shaman", required: 2, text: "Defeat goblin shamans" }],
      rewards: { xp: 80, gold: 60 }, tier: 3 },
    { id: "bq-elite-patrol", name: "Elite Patrol", description: "The guild needs an experienced hand clearing the dangerous areas.",
      objectives: [{ type: "kill", id: "k-gg2", target: "goblin-guard", required: 3, text: "Defeat goblin guards" }, { type: "kill", id: "k-gb3", target: "goblin-brute", required: 2, text: "Defeat goblin brutes" }],
      rewards: { xp: 85, gold: 65 }, tier: 3 },
    // --- Gather quests (Tier 1) ---
    { id: "bq-herb-run", name: "Herb Run", description: "Mira needs cave herbs for her potion stocks.",
      objectives: [{ type: "collect", id: "c-ch", item: "cave-herb", required: 4, text: "Collect cave herbs" }],
      rewards: { xp: 25, gold: 20 }, tier: 1 },
    { id: "bq-pelt-delivery", name: "Pelt Delivery", description: "The tanner needs wolf pelts for new leather goods.",
      objectives: [{ type: "collect", id: "c-wp", item: "wolf-pelt", required: 3, text: "Collect wolf pelts" }],
      rewards: { xp: 30, gold: 25 }, tier: 1 },
    { id: "bq-fang-bounty", name: "Fang Bounty", description: "Goblin fangs are used in alchemical ingredients. Collect some.",
      objectives: [{ type: "collect", id: "c-gf", item: "goblin-fang", required: 5, text: "Collect goblin fangs" }],
      rewards: { xp: 25, gold: 20 }, tier: 1 },
    { id: "bq-scrap-haul", name: "Scrap Haul", description: "Bram can reforge goblin scrap into usable iron.",
      objectives: [{ type: "collect", id: "c-gs", item: "goblin-scrap", required: 4, text: "Collect goblin scrap" }],
      rewards: { xp: 30, gold: 20 }, tier: 1 },
    { id: "bq-torn-cloth", name: "Cloth Scraps", description: "The tailor needs torn cloth for bandage materials.",
      objectives: [{ type: "collect", id: "c-tc", item: "torn-cloth", required: 5, text: "Collect torn cloth" }],
      rewards: { xp: 20, gold: 15 }, tier: 1 },
    // --- Gather quests (Tier 2) ---
    { id: "bq-ore-supply", name: "Ore Supply", description: "Harlan's forge needs more iron ore. Bring some from the field.",
      objectives: [{ type: "collect", id: "c-io", item: "iron-ore", required: 3, text: "Collect iron ore" }],
      rewards: { xp: 40, gold: 35 }, tier: 2 },
    { id: "bq-sinew-stock", name: "Sinew Stock", description: "Bowstrings and bindings need tough beast sinew.",
      objectives: [{ type: "collect", id: "c-bs", item: "beast-sinew", required: 3, text: "Collect beast sinew" }],
      rewards: { xp: 40, gold: 30 }, tier: 2 },
    { id: "bq-mixed-supplies", name: "Mixed Supplies", description: "The guild stockroom is running low. A little of everything helps.",
      objectives: [{ type: "collect", id: "c-ch2", item: "cave-herb", required: 3, text: "Collect cave herbs" }, { type: "collect", id: "c-wp2", item: "wolf-pelt", required: 2, text: "Collect wolf pelts" }],
      rewards: { xp: 45, gold: 35 }, tier: 2 },
    { id: "bq-petal-search", name: "Moonpetal Search", description: "Rare moonpetals bloom on dangerous ground. Find some for the academy.",
      objectives: [{ type: "collect", id: "c-mp", item: "moonpetal", required: 2, text: "Collect moonpetals" }],
      rewards: { xp: 50, gold: 40 }, tier: 2 },
    { id: "bq-scrap-forge", name: "Forge Fuel", description: "Bram needs scrap metal and sinew for a special project.",
      objectives: [{ type: "collect", id: "c-gs2", item: "goblin-scrap", required: 3, text: "Collect goblin scrap" }, { type: "collect", id: "c-bs2", item: "beast-sinew", required: 2, text: "Collect beast sinew" }],
      rewards: { xp: 45, gold: 35 }, tier: 2 },
    // --- Gather quests (Tier 3) ---
    { id: "bq-shadow-harvest", name: "Shadow Harvest", description: "Shadow essence seeps from dark places. Collect it carefully.",
      objectives: [{ type: "collect", id: "c-se", item: "shadow-essence", required: 3, text: "Collect shadow essence" }],
      rewards: { xp: 60, gold: 50 }, tier: 3 },
    { id: "bq-shard-hunt", name: "Shard Hunt", description: "Enchanted shards are rare and powerful. The academy pays well for them.",
      objectives: [{ type: "collect", id: "c-es", item: "enchanted-shard", required: 2, text: "Collect enchanted shards" }],
      rewards: { xp: 65, gold: 55 }, tier: 3 },
    { id: "bq-alchemist-order", name: "Alchemist's Order", description: "A large order for potions means Mira needs rare ingredients.",
      objectives: [{ type: "collect", id: "c-se2", item: "shadow-essence", required: 2, text: "Collect shadow essence" }, { type: "collect", id: "c-mp2", item: "moonpetal", required: 2, text: "Collect moonpetals" }],
      rewards: { xp: 70, gold: 55 }, tier: 3 },
    // --- Mixed hunt + gather (all tiers) ---
    { id: "bq-hunter-gather", name: "Hunter-Gatherer", description: "Kill wolves and skin them for pelts.",
      objectives: [{ type: "kill", id: "k-wolf4", target: "wolf", required: 3, text: "Defeat wolves" }, { type: "collect", id: "c-wp3", item: "wolf-pelt", required: 3, text: "Collect wolf pelts" }],
      rewards: { xp: 40, gold: 30 }, tier: 1 },
    { id: "bq-armed-forager", name: "Armed Foraging", description: "The riverbank is dangerous. Fight through goblins and gather herbs.",
      objectives: [{ type: "kill", id: "k-gs3", target: "goblin-scout", required: 3, text: "Defeat goblin scouts" }, { type: "collect", id: "c-ch3", item: "cave-herb", required: 3, text: "Collect cave herbs" }],
      rewards: { xp: 40, gold: 30 }, tier: 1 },
    { id: "bq-war-materials", name: "War Materials", description: "The garrison needs iron and the goblins cleared to get it.",
      objectives: [{ type: "kill", id: "k-gr3", target: "goblin-raider", required: 4, text: "Defeat goblin raiders" }, { type: "collect", id: "c-io2", item: "iron-ore", required: 2, text: "Collect iron ore" }],
      rewards: { xp: 55, gold: 45 }, tier: 2 },
    { id: "bq-dark-expedition", name: "Dark Expedition", description: "Delve into dangerous territory for shadowy reagents.",
      objectives: [{ type: "kill", id: "k-gsh3", target: "goblin-shaman", required: 2, text: "Defeat goblin shamans" }, { type: "collect", id: "c-se3", item: "shadow-essence", required: 2, text: "Collect shadow essence" }],
      rewards: { xp: 75, gold: 55 }, tier: 3 }
  ];

  function getBoardQuestTemplate(id) {
    for (var i = 0; i < boardQuestTemplates.length; i++) {
      if (boardQuestTemplates[i].id === id) {
        var t = boardQuestTemplates[i];
        // Return with quest system fields so it works like a regular quest
        return {
          id: t.id, name: t.name, description: t.description,
          objectives: t.objectives, rewards: t.rewards,
          type: "board", turnIn: "toma", tier: t.tier
        };
      }
    }
    return null;
  }

  /* Deterministic daily board quest selection using day as seed */
  function rollDailyBoardQuests(p) {
    if (!p) return [];
    var day = p.day || 1;
    var level = p.level || 1;
    var completedBoard = p.completedBoardQuests || [];

    // Determine which tiers are available based on player level
    var maxTier = 1;
    if (level >= 3) maxTier = 2;
    if (level >= 5) maxTier = 3;

    // Filter templates by available tiers
    var pool = [];
    for (var i = 0; i < boardQuestTemplates.length; i++) {
      if (boardQuestTemplates[i].tier <= maxTier) pool.push(boardQuestTemplates[i]);
    }

    // Simple seeded pseudo-random: day-based deterministic selection
    // Each day adds 1 quest to the board (carried from previous days)
    // Board holds max 5 quests; oldest rotate off when full
    var board = p.boardQuests || [];

    // Clean up any quests the player already completed or accepted
    var active = p.activeQuests || [];
    var cleaned = [];
    for (var c = 0; c < board.length; c++) {
      if (completedBoard.indexOf(board[c].id + "-" + board[c].day) === -1 &&
          active.indexOf(board[c].id) === -1) {
        cleaned.push(board[c]);
      }
    }

    // Only add a new quest if it's a new day since the last board refresh
    var lastBoardDay = p.lastBoardDay || 0;
    if (day > lastBoardDay && pool.length > 0) {
      // Deterministic pick based on day number
      var seed = day * 7 + 13;
      var pickIdx = seed % pool.length;
      var template = pool[pickIdx];

      // Avoid duplicates on the current board
      var onBoard = false;
      for (var d = 0; d < cleaned.length; d++) {
        if (cleaned[d].id === template.id) { onBoard = true; break; }
      }
      if (onBoard) {
        // Try next templates until we find one not on the board
        for (var t = 1; t < pool.length; t++) {
          var altIdx = (pickIdx + t) % pool.length;
          var found = false;
          for (var dd = 0; dd < cleaned.length; dd++) {
            if (cleaned[dd].id === pool[altIdx].id) { found = true; break; }
          }
          if (!found) { template = pool[altIdx]; break; }
        }
      }

      cleaned.push({ id: template.id, day: day });
      p.lastBoardDay = day;
    }

    // Cap at 5 — remove oldest (first in array)
    while (cleaned.length > 5) {
      cleaned.shift();
    }

    p.boardQuests = cleaned;
    return cleaned;
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
    getTownEventById: getTownEventById,
    rollDailyBounty: rollDailyBounty,
    boardQuestTemplates: boardQuestTemplates,
    getBoardQuestTemplate: getBoardQuestTemplate,
    rollDailyBoardQuests: rollDailyBoardQuests,
    getCompanion: function(id) { return companions[id] ? JSON.parse(JSON.stringify(companions[id])) : null; }
  };
})();
