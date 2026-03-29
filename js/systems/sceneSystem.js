import { SCENES } from "../data/scenes.js";
import { ASSETS } from "../data/assets.js";
import { setState, getState } from "../core/state.js";

function applyEffects(effects, draftState) {
  if (!effects) {
    return;
  }

  if (effects.addItem && !draftState.inventory.includes(effects.addItem)) {
    draftState.inventory.push(effects.addItem);
  }

  if (effects.addFlag && !draftState.flags.includes(effects.addFlag)) {
    draftState.flags.push(effects.addFlag);
  }
}

function resolvePlayerPortrait(player) {
  return player.gender === "female" ? ASSETS.portraits.playerFemale : ASSETS.portraits.playerMale;
}

function resolvePortrait(portraitRef, player) {
  if (portraitRef === "__PLAYER__") {
    return resolvePlayerPortrait(player);
  }

  return portraitRef ?? null;
}

const ORIGIN_NAMES = {
  brookfield: "Brookfield Hamlet",
  ironvale: "Ironvale Outpost",
  northwatch: "Northwatch Border"
};

function fillTemplate(template, player) {
  const originLabel = ORIGIN_NAMES[player.origin] ?? player.origin;
  return template
    .replaceAll("{playerName}", player.name)
    .replaceAll("{playerOrigin}", originLabel)
    .replaceAll("{playerArchetype}", player.archetype);
}

function buildUiFromStep(step, scene, overrideText) {
  const currentState = getState();
  const { player } = currentState;

  const visibleNpcs = (step.npcs ?? []).filter((npc) => {
    if (!npc.requireFlag) return true;
    return currentState.flags.includes(npc.requireFlag);
  });

  return {
    speaker: step.speaker,
    text: overrideText || fillTemplate(step.text, player),
    background: step.background,
    portraits: {
      left: resolvePortrait(step.portraits?.left, player),
      right: resolvePortrait(step.portraits?.right, player)
    },
    npcs: visibleNpcs,
    choices: step.choices ?? []
  };
}

function validateScene(sceneId) {
  const scene = SCENES[sceneId];
  if (!scene) {
    throw new Error(`Unknown scene: ${sceneId}`);
  }
  return scene;
}

export function loadScene(sceneId, stepIndex = 0, overrideText = "") {
  const scene = validateScene(sceneId);
  const clampedStepIndex = Math.max(0, Math.min(stepIndex, scene.steps.length - 1));
  const step = scene.steps[clampedStepIndex];

  setState((draftState) => {
    draftState.mode = "dialogue";
    draftState.sceneId = scene.id;
    draftState.stepIndex = clampedStepIndex;
    draftState.chapterLabel = scene.chapterLabel;
    draftState.locationLabel = scene.locationLabel;
    draftState.ui = buildUiFromStep(step, scene, overrideText);
  });
}

export function nextStep() {
  const currentState = getState();
  const scene = validateScene(currentState.sceneId);
  const currentStep = scene.steps[currentState.stepIndex];

  if (currentStep.choices && currentStep.choices.length > 0) {
    return;
  }

  const nextIndex = currentState.stepIndex + 1;

  if (nextIndex >= scene.steps.length) {
    loadScene("townHub", 0);
    return;
  }

  loadScene(scene.id, nextIndex);
}

export function choose(choice) {
  const currentState = getState();

  setState((draftState) => {
    applyEffects(choice.effects, draftState);
  });

  loadScene(choice.nextScene, 0);
}
