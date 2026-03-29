import { subscribe, getState } from "./core/state.js";
import { renderUI } from "./systems/uiRenderer.js";
import { initDialogueSystem, onChoiceSelected, onNpcSelected } from "./systems/dialogueSystem.js";
import { loadScene } from "./systems/sceneSystem.js";
import { initPlayerSetup } from "./systems/playerSetupSystem.js";

function bootstrapGame() {
  subscribe((state) => {
    renderUI(state, onChoiceSelected, onNpcSelected);
  });

  initDialogueSystem();
  initPlayerSetup(() => {
    loadScene("prologue", 0);
  });
}

bootstrapGame();

window.elderbrookDebug = {
  getState,
  loadScene
};
