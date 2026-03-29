import { dom } from "../core/dom.js";
import { setState } from "../core/state.js";
import { ASSETS } from "../data/assets.js";

const ARCHETYPE_STARTERS = {
  sellsword: "basic-iron-sword.png",
  ranger: "basic-short-bow.png",
  arcanist: "basic-staff.png"
};

const ARCHETYPE_DESCS = {
  sellsword: "Tough melee fighter. Highest HP and bonus melee damage.",
  ranger: "Swift and precise. Balanced HP with steady ranged attacks.",
  arcanist: "Wielder of arcane force. Lower HP but starts with a mana potion for burst damage."
};

const ORIGIN_DESCS = {
  brookfield: "A quiet farming village at the edge of Elderbrook's reach.",
  ironvale: "A fortified mining outpost known for its iron trade and hard people.",
  northwatch: "A frozen border garrison where survival is the first lesson."
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

function updateSetupPortrait() {
  const gender = dom.playerSetupForm.querySelector('input[name="gender"]:checked')?.value;
  dom.setupPortrait.src = gender === "female" ? ASSETS.portraits.playerFemale : ASSETS.portraits.playerMale;
}

function updateArchetypeDesc() {
  dom.archetypeDesc.textContent = ARCHETYPE_DESCS[dom.archetypeSelect.value] ?? "";
}

function updateOriginDesc() {
  dom.originDesc.textContent = ORIGIN_DESCS[dom.originSelect.value] ?? "";
}

export function initPlayerSetup(onStartGame) {
  dom.playerNameInput.value = "";
  dom.setupError.textContent = "";
  updateSetupPortrait();
  updateArchetypeDesc();
  updateOriginDesc();

  dom.playerSetupForm.querySelectorAll('input[name="gender"]').forEach((radio) => {
    radio.addEventListener("change", updateSetupPortrait);
  });

  dom.archetypeSelect.addEventListener("change", updateArchetypeDesc);
  dom.originSelect.addEventListener("change", updateOriginDesc);

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
