import { choose, loadScene } from "./sceneSystem.js";
import { openShop, buyItem, buyPotion } from "./shopSystem.js";
import { startCombat, combatAttack, combatUsePotion, combatUseManaPotion, combatFlee } from "./combatSystem.js";
import { openInventory, equipWeapon, equipArmor, closeInventory } from "./inventorySystem.js";
import { setState, getState } from "../core/state.js";

export function handleActionChoice(choice) {
  if (!choice) {
    return;
  }

  if (!choice.type && choice.nextScene) {
    choose(choice);
    return;
  }

  switch (choice.type) {
    case "openShop":
      openShop(choice.payload.shopId);
      break;
    case "startCombat":
      startCombat(choice.payload?.enemyId ?? "goblinScout");
      break;
    case "buyItem":
      buyItem(choice.payload.itemId);
      break;
    case "buyPotion":
      buyPotion(choice.payload?.potionType ?? "health");
      break;
    case "returnTown":
      loadScene("townHub", 0, "You step back into the town square.");
      break;
    case "goWorldMap":
      loadScene("worldMap", 0);
      break;
    case "restTown": {
      const current = getState();
      if (current.hp >= current.maxHp) {
        loadScene("townHub", 0, "You are already at full health. No rest needed.");
        break;
      }
      const recoveredTo = Math.min(current.maxHp, current.hp + 5);
      const recovered = recoveredTo - current.hp;
      setState((draftState) => {
        draftState.hp = recoveredTo;
      });
      loadScene("townHub", 0, `You rest by the fountain and recover ${recovered} HP.`);
      break;
    }
    case "combatAttack":
      combatAttack();
      break;
    case "combatPotion":
      combatUsePotion();
      break;
    case "combatManaPotion":
      combatUseManaPotion();
      break;
    case "combatFlee":
      combatFlee();
      break;
    case "openInventory":
      openInventory();
      break;
    case "equipWeapon":
      equipWeapon(choice.payload.itemId);
      break;
    case "equipArmor":
      equipArmor(choice.payload.itemId);
      break;
    case "closeInventory":
      closeInventory();
      break;
    case "none":
      break;
    default:
      if (choice.nextScene) {
        choose(choice);
      }
      break;
  }
}
