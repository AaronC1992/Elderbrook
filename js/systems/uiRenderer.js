import { dom } from "../core/dom.js";

function setPortrait(element, src, side) {
  if (!src) {
    element.classList.remove("is-visible");
    element.removeAttribute("src");
    return;
  }

  element.src = src;
  element.alt = `${side} portrait`;
  element.classList.add("is-visible");
}

function renderChoices(choices, onSelectChoice) {
  dom.choiceList.innerHTML = "";

  if (!choices || choices.length === 0) {
    return;
  }

  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choice.text;
    button.addEventListener("click", () => onSelectChoice(choice));
    dom.choiceList.append(button);
  });
}

function renderNpcs(npcs, onSelectNpc) {
  dom.npcLayer.innerHTML = "";

  if (!npcs || npcs.length === 0) {
    return;
  }

  npcs.forEach((npc) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "npc-btn";
    button.textContent = npc.label;
    button.style.left = `${npc.x}%`;
    button.style.top = `${npc.y}%`;
    button.addEventListener("click", () => onSelectNpc(npc));
    dom.npcLayer.append(button);
  });
}

export function renderUI(state, onSelectChoice, onSelectNpc) {
  dom.background.style.backgroundImage = `url("${state.ui.background}")`;

  const isConversation = state.mode === "combat" || Boolean(state.ui.portraits.left);

  if (isConversation) {
    dom.dialoguePanel.classList.remove("is-hidden");
    setPortrait(dom.portraitLeft, state.ui.portraits.left, "Left");
    setPortrait(dom.portraitRight, state.ui.portraits.right, "Right");
  } else {
    dom.dialoguePanel.classList.add("is-hidden");
    setPortrait(dom.portraitLeft, null, "Left");
    setPortrait(dom.portraitRight, null, "Right");
  }

  dom.speakerName.textContent = state.ui.speaker;
  dom.dialogueText.textContent = state.ui.text;
  dom.playerLabel.textContent = `Player: ${state.player.name} (${state.player.archetype})`;
  dom.locationLabel.textContent = `Location: ${state.locationLabel}`;
  dom.chapterLabel.textContent = `Chapter: ${state.chapterLabel}`;
  dom.goldLabel.textContent = `Gold: ${state.gold}`;
  dom.hpLabel.textContent = `HP: ${state.hp} / ${state.maxHp} | HP Potions: ${state.potionCount} | Mana Potions: ${state.manaPotionCount}`;

  renderChoices(state.ui.choices, onSelectChoice);
  renderNpcs(state.ui.npcs, onSelectNpc);

  const hasChoices = state.ui.choices.length > 0;
  const interactionsAvailable = hasChoices || state.ui.npcs.length > 0;
  dom.continueButton.disabled = interactionsAvailable;
  dom.skipButton.disabled = interactionsAvailable;
}
