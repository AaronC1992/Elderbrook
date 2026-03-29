const state = {
  isSetupComplete: false,
  mode: "dialogue",
  sceneId: "prologue",
  stepIndex: 0,
  chapterLabel: "Prologue",
  locationLabel: "Main Town",
  gold: 30,
  hp: 20,
  maxHp: 20,
  equippedWeapon: null,
  equippedArmor: null,
  potionCount: 0,
  manaPotionCount: 0,
  inventory: [],
  flags: [],
  player: {
    name: "Traveler",
    gender: "male",
    origin: "brookfield",
    archetype: "sellsword"
  },
  ui: {
    speaker: "Narrator",
    text: "",
    background: "",
    portraits: {
      left: null,
      right: null
    },
    npcs: [],
    choices: []
  },
  shop: {
    id: null
  },
  combat: {
    isActive: false,
    enemyId: null,
    enemyHp: 0,
    enemyMaxHp: 0
  }
};

const subscribers = new Set();

export function getState() {
  return structuredClone(state);
}

export function setState(update) {
  update(state);
  publish();
}

export function subscribe(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function publish() {
  const snapshot = getState();
  subscribers.forEach((listener) => listener(snapshot));
}
