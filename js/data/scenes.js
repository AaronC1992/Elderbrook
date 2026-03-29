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
    locationLabel: "Main Town",
    steps: [
      {
        id: "hub-return",
        speaker: "Town Square",
        text: "Click a shopkeeper to trade, or click Guildmaster Rowan to hunt goblins in the cave.",
        background: ASSETS.backgrounds.town,
        portraits: { left: null, right: "__PLAYER__" },
        npcs: [
          {
            id: "npc-weapons",
            label: "Blacksmith Ivar",
            x: 22,
            y: 68,
            action: { type: "openShop", payload: { shopId: "weapons" } }
          },
          {
            id: "npc-armor",
            label: "Armorer Sela",
            x: 39,
            y: 52,
            action: { type: "openShop", payload: { shopId: "armor" } }
          },
          {
            id: "npc-potions",
            label: "Apothecary Mira",
            x: 61,
            y: 47,
            action: { type: "openShop", payload: { shopId: "potions" } }
          },
          {
            id: "npc-guildmaster",
            label: "Guildmaster Rowan",
            x: 79,
            y: 64,
            action: { type: "startCombat", payload: { enemyId: "goblinScout" } }
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
  }
};
