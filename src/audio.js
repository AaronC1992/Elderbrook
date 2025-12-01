// audio.js
// Audio system with placeholder hooks for sound effects and music
// Sounds can be easily replaced by updating the sound file paths
// All functions check settings to respect user preferences

/**
 * Audio settings - can be modified via settings UI
 */
export const AudioSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.4,
};

/**
 * Placeholder audio files - replace these paths with actual audio assets
 */
const SoundAssets = {
  attack: null, // Future: './assets/sounds/attack.mp3'
  hit: null,    // Future: './assets/sounds/hit.mp3'
  skill: null,  // Future: './assets/sounds/skill.mp3'
  purchase: null, // Future: './assets/sounds/purchase.mp3'
  levelUp: null, // Future: './assets/sounds/levelup.mp3'
  questComplete: null, // Future: './assets/sounds/quest.mp3'
  victory: null, // Future: './assets/sounds/victory.mp3'
  defeat: null,  // Future: './assets/sounds/defeat.mp3'
  buttonClick: null, // Future: './assets/sounds/click.mp3'
  heal: null, // Future: './assets/sounds/heal.mp3'
  crit: null, // Future: './assets/sounds/crit.mp3'
  block: null, // Future: './assets/sounds/block.mp3'
  enemySpecial: null, // Future: './assets/sounds/enemy_special.mp3'
  zoneTransition: null, // Future: './assets/sounds/zone_transition.mp3'
  ambience_forest: null,
  ambience_cave: null,
  ambience_grove: null,
  ambience_ruins: null,
  ambience_depths: null
};

/**
 * Sound pool to manage multiple simultaneous sounds
 */
const soundPool = new Map();

/**
 * Play a sound effect (non-blocking)
 * @param {string} soundId - Key from SoundAssets
 */
export function playSound(soundId) {
  if (!AudioSettings.soundEnabled) return;
  
  const assetPath = SoundAssets[soundId];
  if (!assetPath) {
    // Placeholder: log instead of playing
    console.log(`[Audio] 🔊 ${soundId}`);
    return;
  }
  
  try {
    const audio = new Audio(assetPath);
    audio.volume = AudioSettings.soundVolume;
    audio.play().catch(err => {
      console.warn(`Failed to play sound: ${soundId}`, err);
    });
    
    // Clean up after playing
    audio.addEventListener('ended', () => {
      audio.remove();
    });
  } catch (err) {
    console.warn(`Error loading sound: ${soundId}`, err);
  }
}

/**
 * Play attack sound effect
 */
export function playSoundAttack() {
  playSound('attack');
}

/**
 * Play hit/damage sound effect
 */
export function playSoundHit() {
  playSound('hit');
}

/**
 * Play skill activation sound
 */
export function playSoundSkill() {
  playSound('skill');
}

/**
 * Play purchase sound effect
 */
export function playSoundPurchase() {
  playSound('purchase');
}

/**
 * Play level up sound effect
 */
export function playSoundLevelUp() {
  playSound('levelUp');
}

/**
 * Play quest completion sound
 */
export function playSoundQuestComplete() {
  playSound('questComplete');
}

/**
 * Play victory sound
 */
export function playSoundVictory() {
  playSound('victory');
}

/**
 * Play defeat sound
 */
export function playSoundDefeat() {
  playSound('defeat');
}

/**
 * Play button click sound
 */
export function playSoundButtonClick() {
  playSound('buttonClick');
}

/**
 * Play heal/rest sound
 */
export function playSoundHeal() {
  playSound('heal');
}

/**
 * Play critical hit sound
 */
export function playSoundCrit() {
  playSound('crit');
}

/**
 * Play block/parry sound
 */
export function playSoundBlock() {
  playSound('block');
}

/**
 * Play enemy special attack charge/execute sound
 */
export function playSoundEnemySpecial() {
  playSound('enemySpecial');
}

/**
 * Play zone transition sound
 */
export function playSoundZoneTransition(){
  playSound('zoneTransition');
}

/**
 * Play looping ambience placeholder (currently logs). Real implementation could manage Audio objects.
 * @param {string} zoneKey
 */
export function playAmbience(zoneKey){
  if (!AudioSettings.soundEnabled) return;
  const assetMap = {
    forest: 'ambience_forest', cave: 'ambience_cave', grove: 'ambience_grove', ruins: 'ambience_ruins', depths: 'ambience_depths'
  };
  const key = assetMap[zoneKey];
  if (!key){ console.log('[Audio] ambience unknown zone', zoneKey); return; }
  playSound(key);
}

/**
 * Boss music hooks (placeholder): start/stop special track
 */
export function playBossMusic(musicKey){
  if (!AudioSettings.musicEnabled) return;
  console.log(`[Audio] 🎵 Boss music start: ${musicKey}`);
}
export function stopBossMusic(){
  if (!AudioSettings.musicEnabled) return;
  console.log('[Audio] 🎵 Boss music stop');
}

/**
 * Update audio settings
 * @param {Object} settings - New settings to apply
 */
export function updateAudioSettings(settings) {
  Object.assign(AudioSettings, settings);
  saveAudioSettings();
}

/**
 * Save audio settings to localStorage
 */
function saveAudioSettings() {
  try {
    localStorage.setItem('elderbrook_audio_settings', JSON.stringify(AudioSettings));
  } catch (e) {
    console.warn('Failed to save audio settings', e);
  }
}

/**
 * Load audio settings from localStorage
 */
export function loadAudioSettings() {
  try {
    const saved = localStorage.getItem('elderbrook_audio_settings');
    if (saved) {
      Object.assign(AudioSettings, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load audio settings', e);
  }
}

// Load settings on module initialization
loadAudioSettings();
