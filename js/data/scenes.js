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
        text: "{playerName} arrives in Elderbrook from {playerOrigin} with a worn satchel, a blunt blade, and a letter bearing the guild's seal.",
        background: ASSETS.backgrounds.town,
        portraits: { left: null, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "guild-intro",
        speaker: "Guildmaster Rowan",
        text: "Another wanderer with more grit than coin. Good. Elderbrook needs both. Welcome, {playerName}. Earn gold, gear up, and prove you can clear the goblin cave.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: []
      },
      {
        id: "first-choice",
        speaker: "Guildmaster Rowan",
        text: "The square is open to you now. Talk to a shopkeeper to buy gear, then meet me in town when you are ready to fight goblins.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: ASSETS.portraits.guildMaster, right: "__PLAYER__" },
        npcs: [],
        choices: [
          {
            text: "Go to the town square",
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
            action: { type: "startCombat", payload: { enemyId: "goblinScout" } },
            requireFlag: "quest:goblinCave"
          }
        ],
        choices: []
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
        text: "Welcome back, {playerName}. Check the quest board if you are looking for work, or speak up if you need guidance.",
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
        text: "Pinned notices flutter in the draught. One job catches your eye.",
        background: ASSETS.backgrounds.guildHall,
        portraits: { left: null, right: null },
        npcs: [],
        choices: [
          {
            text: "Clear the Goblin Cave (Combat)",
            type: "acceptQuest",
            payload: { flag: "quest:goblinCave", nextScene: "worldMap" }
          },
          {
            text: "Back to Guild Hall",
            type: "goGuildHall"
          }
        ]
      }
    ]
  }
};
