import { dom } from "../core/dom.js";
import { setState } from "../core/state.js";

const ARCHETYPE_STARTERS = {
  sellsword: "basic-iron-sword.png",
  ranger: "basic-short-bow.png",
  arcanist: "basic-staff.png"
};

function normalizeName(rawValue) {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/\s+/g, " ");
}

function buildProfile(formData) {
  return {
    name: normalizeName(String(formData.get("playerName") ?? "")),
    gender: String(formData.get("gender") ?? "male"),
    origin: String(formData.get("origin") ?? "brookfield"),
    archetype: String(formData.get("archetype") ?? "sellsword")
  };
}

function validateProfile(profile) {
  if (profile.name.length < 2) {
    return "Enter a name with at least 2 characters.";
  }

  if (profile.name.length > 20) {
    return "Name must be 20 characters or fewer.";
  }

  if (!["male", "female"].includes(profile.gender)) {
    return "Select a valid gender.";
  }

  return "";
}

function applyStartingLoadout(profile) {
  setState((draftState) => {
    draftState.player = profile;
    draftState.isSetupComplete = true;

    const starter = ARCHETYPE_STARTERS[profile.archetype];
    if (starter && !draftState.inventory.includes(starter)) {
      draftState.inventory.push(starter);
      draftState.equippedWeapon = starter;
    }

    if (profile.archetype === "sellsword") {
      draftState.maxHp = 24;
    }

    if (profile.archetype === "ranger") {
      draftState.maxHp = 21;
    }

    if (profile.archetype === "arcanist") {
      draftState.maxHp = 20;
      draftState.manaPotionCount += 1;
    }

    draftState.hp = draftState.maxHp;

    const originFlag = `origin:${profile.origin}`;
    const archetypeFlag = `archetype:${profile.archetype}`;

    if (!draftState.flags.includes(originFlag)) {
      draftState.flags.push(originFlag);
    }

    if (!draftState.flags.includes(archetypeFlag)) {
      draftState.flags.push(archetypeFlag);
    }
  });
}

export function initPlayerSetup(onStartGame) {
  dom.playerNameInput.value = "";
  dom.setupError.textContent = "";

  dom.playerSetupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(dom.playerSetupForm);
    const profile = buildProfile(formData);
    const error = validateProfile(profile);

    if (error) {
      dom.setupError.textContent = error;
      return;
    }

    dom.setupError.textContent = "";
    applyStartingLoadout(profile);
    dom.playerSetup.classList.add("is-hidden");
    onStartGame();
  });
}
