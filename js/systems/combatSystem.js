import { ENEMIES } from "../data/enemies.js";
import { ITEMS, POTIONS } from "../data/items.js";
import { setState, getState } from "../core/state.js";
import { loadScene } from "./sceneSystem.js";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playerDamage(state) {
  const weapon = state.equippedWeapon ? ITEMS[state.equippedWeapon] : null;
  const archetypeBonus = state.player.archetype === "sellsword" ? 2 : state.player.archetype === "ranger" ? 1 : 0;
  const weaponPower = weapon?.power ?? 2;
  return randomBetween(2, 5) + weaponPower + archetypeBonus;
}

function enemyDamage(state, enemy) {
  const armor = state.equippedArmor ? ITEMS[state.equippedArmor] : null;
  const defense = armor?.defense ?? 0;
  const hit = randomBetween(enemy.minDamage, enemy.maxDamage) - defense;
  return Math.max(1, hit);
}

function refreshCombatUi(enemy, message) {
  const state = getState();
  setState((draftState) => {
    draftState.mode = "combat";
    draftState.locationLabel = "Goblin Cave";
    draftState.ui.speaker = enemy.name;
    draftState.ui.text = `${message}\n\nEnemy HP: ${state.combat.enemyHp}/${state.combat.enemyMaxHp} | Your HP: ${state.hp}/${state.maxHp} | HP Potions: ${state.potionCount} | Mana Potions: ${state.manaPotionCount}`;
    draftState.ui.background = enemy.background;
    draftState.ui.portraits = {
      left: enemy.portrait,
      right: draftState.player.gender === "female" ? "assets/portraits/female-player.png" : "assets/portraits/male-player.png"
    };
    draftState.ui.npcs = [];
    draftState.ui.choices = [
      { text: "Attack", type: "combatAttack" },
      { text: `Use Health Potion (${state.potionCount})`, type: "combatPotion" },
      { text: `Use Mana Potion (${state.manaPotionCount})`, type: "combatManaPotion" },
      { text: "Flee", type: "combatFlee" }
    ];
  });
}

export function startCombat(enemyId = "goblinScout") {
  const enemy = ENEMIES[enemyId];
  if (!enemy) {
    return;
  }

  setState((draftState) => {
    draftState.mode = "combat";
    draftState.combat.isActive = true;
    draftState.combat.enemyId = enemy.id;
    draftState.combat.enemyHp = enemy.maxHp;
    draftState.combat.enemyMaxHp = enemy.maxHp;
  });

  refreshCombatUi(enemy, "A goblin scout lunges from the shadows.");
}

export function combatAttack() {
  const state = getState();
  if (!state.combat.isActive) {
    return;
  }

  const enemy = ENEMIES[state.combat.enemyId];
  const dealt = playerDamage(state);
  const enemyHpAfterHit = Math.max(0, state.combat.enemyHp - dealt);

  setState((draftState) => {
    draftState.combat.enemyHp = enemyHpAfterHit;
  });

  if (enemyHpAfterHit <= 0) {
    const reward = randomBetween(enemy.rewardGoldMin, enemy.rewardGoldMax);
    setState((draftState) => {
      draftState.gold += reward;
      draftState.combat.isActive = false;
      draftState.combat.enemyId = null;
      draftState.combat.enemyHp = 0;
      draftState.combat.enemyMaxHp = 0;
      draftState.mode = "dialogue";
    });

    loadScene("worldMap", 0, `You defeated the ${enemy.name} and earned ${reward} gold.`);
    return;
  }

  const taken = enemyDamage(getState(), enemy);
  const hpAfterHit = Math.max(0, getState().hp - taken);

  setState((draftState) => {
    draftState.hp = hpAfterHit;
  });

  if (hpAfterHit <= 0) {
    setState((draftState) => {
      draftState.hp = Math.ceil(draftState.maxHp * 0.6);
      draftState.gold = Math.max(0, draftState.gold - 8);
      draftState.combat.isActive = false;
      draftState.combat.enemyId = null;
      draftState.combat.enemyHp = 0;
      draftState.combat.enemyMaxHp = 0;
      draftState.mode = "dialogue";
    });

    loadScene("townHub", 0, "You are knocked down and dragged back to town. You lose 8 gold.");
    return;
  }

  refreshCombatUi(enemy, `You strike for ${dealt} damage. The goblin hits back for ${taken}.`);
}

export function combatUsePotion() {
  const state = getState();
  if (!state.combat.isActive) {
    return;
  }

  const enemy = ENEMIES[state.combat.enemyId];

  if (state.potionCount <= 0) {
    refreshCombatUi(enemy, "Your satchel is dry. No tonic left.");
    return;
  }

  const healedTo = Math.min(state.maxHp, state.hp + POTIONS.health.healAmount);
  const healedAmount = healedTo - state.hp;

  setState((draftState) => {
    draftState.potionCount -= 1;
    draftState.hp = healedTo;
  });

  const taken = enemyDamage(getState(), enemy);
  const hpAfterHit = Math.max(0, getState().hp - taken);

  setState((draftState) => {
    draftState.hp = hpAfterHit;
  });

  if (hpAfterHit <= 0) {
    setState((draftState) => {
      draftState.hp = Math.ceil(draftState.maxHp * 0.6);
      draftState.gold = Math.max(0, draftState.gold - 8);
      draftState.combat.isActive = false;
      draftState.combat.enemyId = null;
      draftState.combat.enemyHp = 0;
      draftState.combat.enemyMaxHp = 0;
      draftState.mode = "dialogue";
    });
    loadScene("townHub", 0, "You fall in battle and wake in town. You lose 8 gold.");
    return;
  }

  refreshCombatUi(enemy, `You drink a tonic and recover ${healedAmount} HP. The goblin hits back for ${taken}.`);
}

export function combatUseManaPotion() {
  const state = getState();
  if (!state.combat.isActive) {
    return;
  }

  const enemy = ENEMIES[state.combat.enemyId];

  if (state.manaPotionCount <= 0) {
    refreshCombatUi(enemy, "No mana potion left in your satchel.");
    return;
  }

  const burst = randomBetween(POTIONS.mana.burstMin, POTIONS.mana.burstMax) +
    (state.player.archetype === "arcanist" ? 2 : 0);
  const enemyHpAfterBurst = Math.max(0, state.combat.enemyHp - burst);

  setState((draftState) => {
    draftState.manaPotionCount -= 1;
    draftState.combat.enemyHp = enemyHpAfterBurst;
  });

  if (enemyHpAfterBurst <= 0) {
    const reward = randomBetween(enemy.rewardGoldMin, enemy.rewardGoldMax);
    setState((draftState) => {
      draftState.gold += reward;
      draftState.combat.isActive = false;
      draftState.combat.enemyId = null;
      draftState.combat.enemyHp = 0;
      draftState.combat.enemyMaxHp = 0;
      draftState.mode = "dialogue";
    });

    loadScene("worldMap", 0, `Arcane force shatters the ${enemy.name}. You earn ${reward} gold.`);
    return;
  }

  const taken = enemyDamage(getState(), enemy);
  const hpAfterHit = Math.max(0, getState().hp - taken);

  setState((draftState) => {
    draftState.hp = hpAfterHit;
  });

  if (hpAfterHit <= 0) {
    setState((draftState) => {
      draftState.hp = Math.ceil(draftState.maxHp * 0.6);
      draftState.gold = Math.max(0, draftState.gold - 8);
      draftState.combat.isActive = false;
      draftState.combat.enemyId = null;
      draftState.combat.enemyHp = 0;
      draftState.combat.enemyMaxHp = 0;
      draftState.mode = "dialogue";
    });

    loadScene("townHub", 0, "You fall in battle and wake in town. You lose 8 gold.");
    return;
  }

  refreshCombatUi(enemy, `You unleash mana for ${burst} damage. The goblin counters for ${taken}.`);
}

export function combatFlee() {
  const state = getState();
  if (!state.combat.isActive) {
    return;
  }

  setState((draftState) => {
    draftState.combat.isActive = false;
    draftState.combat.enemyId = null;
    draftState.combat.enemyHp = 0;
    draftState.combat.enemyMaxHp = 0;
    draftState.mode = "dialogue";
  });

  loadScene("worldMap", 0, "You retreat from the cave and return to the road.");
}
