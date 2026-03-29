import { dom } from "../core/dom.js";
import { getState } from "../core/state.js";
import { nextStep } from "./sceneSystem.js";
import { handleActionChoice } from "./actionRouter.js";
import { openInventory } from "./inventorySystem.js";

export function initDialogueSystem() {
  dom.continueButton.addEventListener("click", () => {
    if (!getState().isSetupComplete) {
      return;
    }

    nextStep();
  });

  dom.skipButton.addEventListener("click", () => {
    if (!getState().isSetupComplete) {
      return;
    }

    nextStep();
  });

  dom.inventoryButton.addEventListener("click", () => {
    const state = getState();
    if (!state.isSetupComplete) {
      return;
    }
    if (state.mode === "combat") {
      return;
    }
    openInventory();
  });

  document.addEventListener("keydown", (event) => {
    const state = getState();
    if (!state.isSetupComplete) {
      return;
    }

    const isTextInput = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);
    if (isTextInput) {
      return;
    }

    const isSpace = event.code === "Space";
    const isEnter = event.code === "Enter";

    if (isSpace || isEnter) {
      event.preventDefault();
      if (!dom.continueButton.disabled) {
        nextStep();
      }
    }
  });
}

export function onChoiceSelected(choice) {
  if (!getState().isSetupComplete) {
    return;
  }

  handleActionChoice(choice);
}

export function onNpcSelected(npc) {
  if (!getState().isSetupComplete || !npc?.action) {
    return;
  }

  handleActionChoice(npc.action);
}
