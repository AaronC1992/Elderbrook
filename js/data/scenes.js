import { ASSETS } from "./assets.js";

export const SCENES = {
  prologue: {
    id: "prologue",
    chapterLabel: "Prologue",
    locationLabel: "Main Town",
    steps: [
      {
        id: "arrival",
        speaker: "Narrator",
        text: "Dust clings to worn boots as {playerName} steps through the eastern gate of Elderbrook. The road from {playerOrigin} was long, but the promise of coin and purpose kept one foot ahead of the other. A crumpled letter bearing the guild's seal rests in a satchel alongside a blunt blade and a few dwindling rations.",
        background: ASSETS.backgrounds.town,
        portraits: { left: null, right: null },
        npcs: []
      },
      {
        id: "town-first-look",
        speaker: "Narrator",
        text: "Elderbrook is small but alive. Market stalls line cobbled paths, the clang of a blacksmith's hammer echoes between timber walls, and the scent of herbs drifts from a crooked shop front. Above a heavy oak door hangs a crest of crossed swords: the Adventurers Guild.",
        background: ASSETS.backgrounds.town,
        portraits: { left: null, right: null },
        npcs: []
      },
      {
        id: "guild-enter",
        speaker: "Narrator",
        text: "{playerName} pushes open the guild door. Inside, firelight flickers across a quest board thick with pinned notices. A broad-shouldered man looks up from behind a scarred desk.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "guild-intro",
        speaker: "Guildmaster Rowan",
        text: "Another wanderer with more grit than coin. Good. Elderbrook needs both.\n\nI am Rowan, master of this guild. We register adventurers, post bounties, and try to keep the wilds from swallowing this town whole.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "guild-task",
        speaker: "Guildmaster Rowan",
        text: "Here is how it works. You take jobs from the quest board, earn gold, and gear up at the shops in the square. Weapon Shop, Armor Shop, Potions. You will want all three before heading into anything dangerous.\n\nYou have a little coin on you already. Spend it wisely. When you are ready, check the board for your first contract.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "first-choice",
        speaker: "Guildmaster Rowan",
        text: "The town square is through that door. Spend your gold wisely, {playerName}. Dead adventurers do not earn a second purse.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: [],
        choices: [
          {
            text: "Head to the town square",
            nextScene: "townHub"
          }
        ]
      }
    ]
  },
  townHub: {
    id: "townHub",
    chapterLabel: "Chapter 1",
    locationLabel: "Elderbrook",
    steps: [
      {
        id: "hub-return",
        speaker: "Elderbrook",
        text: "The town square bustles with merchants and travellers. Visit a shop or head through the gate to explore the world.",
        background: ASSETS.backgrounds.town,
        portraits: { left: null, right: "__PLAYER__" },
        npcs: [
          {
            id: "loc-weapons",
            label: "Weapon Shop",
            x: 20,
            y: 55,
            action: { type: "openShop", payload: { shopId: "weapons" } }
          },
          {
            id: "loc-armor",
            label: "Armor Shop",
            x: 40,
            y: 45,
            action: { type: "openShop", payload: { shopId: "armor" } }
          },
          {
            id: "loc-potions",
            label: "Potion Shop",
            x: 60,
            y: 45,
            action: { type: "openShop", payload: { shopId: "potions" } }
          },
          {
            id: "loc-guild",
            label: "Adventurers Guild",
            x: 50,
            y: 25,
            action: { type: "goGuildHall" }
          },
          {
            id: "loc-gate",
            label: "Town Gate",
            x: 80,
            y: 55,
            action: { type: "goWorldMap" }
          }
        ],
        choices: [
          {
            text: "Rest at the fountain (recover 5 HP)",
            type: "restTown"
          }
        ]
      }
    ]
  },
  worldMap: {
    id: "worldMap",
    chapterLabel: "Chapter 1",
    locationLabel: "World Map",
    steps: [
      {
        id: "map-view",
        speaker: "World Map",
        text: "The roads of Elderbrook stretch into the wilderness. Choose your destination.",
        background: ASSETS.backgrounds.worldMap,
        portraits: { left: null, right: null },
        npcs: [
          {
            id: "loc-elderbrook",
            label: "Elderbrook",
            x: 35,
            y: 52,
            action: { type: "returnTown" }
          },
          {
            id: "loc-goblin-cave",
            label: "Goblin Cave",
            x: 65,
            y: 42,
            action: { type: "goScene", payload: { sceneId: "goblinCaveApproach" } },
            requireFlag: "quest:goblinCave"
          }
        ],
        choices: []
      }
    ]
  },
  goblinCaveApproach: {
    id: "goblinCaveApproach",
    chapterLabel: "Chapter 1",
    locationLabel: "Goblin Cave",
    steps: [
      {
        id: "approach-1",
        speaker: "Narrator",
        text: "The cave mouth gapes like a wound in the hillside. Broken cart wheels and torn sacks litter the ground outside. Something scraped these marks into the stone.",
        background: ASSETS.backgrounds.goblinCave,
        portraits: { left: null, right: null },
        npcs: []
      },
      {
        id: "approach-2",
        speaker: "Narrator",
        text: "{playerName} draws a weapon and steps into the darkness. The stench of damp fur and rotting food hits immediately. Somewhere ahead, something shifts in the shadows.",
        background: ASSETS.backgrounds.goblinCave,
        portraits: { left: null, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "approach-fight",
        speaker: "Narrator",
        text: "A pair of yellow eyes catches the dim light. Then a snarl.",
        background: ASSETS.backgrounds.goblinCave,
        portraits: { left: ASSETS.portraits.goblin, right: "__PLAYER__" },
        npcs: [],
        choices: [
          {
            text: "Ready your weapon",
            type: "startCombat",
            payload: { enemyId: "goblinScout" }
          },
          {
            text: "Fall back to the road",
            type: "goWorldMap"
          }
        ]
      }
    ]
  },
  goblinVictory: {
    id: "goblinVictory",
    chapterLabel: "Chapter 1",
    locationLabel: "Goblin Cave",
    steps: [
      {
        id: "victory-1",
        speaker: "Narrator",
        text: "The goblin crumples. Silence reclaims the cave as {playerName} catches a ragged breath. Among the debris, a small pouch of stolen coin glints in the torchlight.",
        background: ASSETS.backgrounds.goblinCave,
        portraits: { left: null, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "victory-2",
        speaker: "Narrator",
        text: "The cave is clear for now. Best to report back to Guildmaster Rowan. There may be more work, and there will certainly be more goblins.",
        background: ASSETS.backgrounds.goblinCave,
        portraits: { left: null, right: null },
        npcs: [],
        choices: [
          {
            text: "Return to the world map",
            type: "goWorldMap"
          }
        ]
      }
    ]
  },
  guildHall: {
    id: "guildHall",
    chapterLabel: "Chapter 1",
    locationLabel: "Adventurers Guild",
    steps: [
      {
        id: "guild-main",
        speaker: "Guildmaster Rowan",
        text: "Back again, {playerName}. The quest board has work if you are looking. I will be here if you need direction.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: [
          {
            id: "loc-questboard",
            label: "Quest Board",
            x: 50,
            y: 30,
            action: { type: "goQuestBoard" }
          }
        ],
        choices: [
          {
            text: "Return to Town",
            type: "returnTown"
          }
        ]
      }
    ]
  },
  questBoard: {
    id: "questBoard",
    chapterLabel: "Chapter 1",
    locationLabel: "Quest Board",
    steps: [
      {
        id: "board-view",
        speaker: "Quest Board",
        text: "Pinned notices cover the board, most faded or already claimed. One stands out, written in fresh ink with an urgent hand:",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: null, right: null },
        npcs: [],
        choices: [
          {
            text: "\"BOUNTY: Clear the Goblin Cave - Scouts raiding supply carts on the eastern road. Reward upon proof of clearing.\"",
            type: "acceptQuest",
            payload: { flag: "quest:goblinCave", nextScene: "questBoardAccepted" }
          },
          {
            text: "Step away from the board",
            type: "goGuildHall"
          }
        ]
      }
    ]
  },
  questBoardAccepted: {
    id: "questBoardAccepted",
    chapterLabel: "Chapter 1",
    locationLabel: "Adventurers Guild",
    steps: [
      {
        id: "quest-accepted",
        speaker: "Guildmaster Rowan",
        text: "The goblin cave. Good choice. Their scouts have been hitting supply carts on the eastern road for weeks now. Follow the path past the town gate and you will find it marked on the map.\n\nA word of advice: make sure you are armed and stocked before heading out. Goblins fight dirty.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: [],
        choices: [
          {
            text: "Head to the town square",
            nextScene: "townHub"
          }
        ]
      }
    ]
  },
};
