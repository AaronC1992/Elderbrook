import { ASSETS } from "./assets.js";

export const ENEMIES = {
  goblinScout: {
    id: "goblinScout",
    name: "Goblin Scout",
    maxHp: 18,
    minDamage: 2,
    maxDamage: 6,
    rewardGoldMin: 10,
    rewardGoldMax: 18,
    portrait: ASSETS.portraits.goblin,
    background: ASSETS.backgrounds.goblinCave
  }
};
