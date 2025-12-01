// gameState.js
// Holds player state, derived stats, and save/load helpers
// Races & passives (current):
// Human: balanced, no bonus
// Beast: +1 STR
// Elf: +1 INT & modest attack speed bonus
// Bug: +1 DEX & increased attack speed
// UPDATED RACE BONUSES (expanded):
// Human: +2 to chosen stat (selected during character creation)
// Beast: +4 STR (future: +8% max HP scaling)
// Elf: +3 INT (future: +5% crit chance, cooldown recovery bonus)
// Bug: +3 DEX (future: attack speed scaling passive)
// Undead: +3 VIT (future: +10% status resistance)
// NOTE: Future percentage / special passives intentionally deferred. Implement by storing passive modifiers
// on player (e.g., player.passives = { critChancePct:5, hpPct:8 }) and integrating them inside recalculateDerived().
//
// Talent System:
// - player.talentPoints: unspent points gained on level-up
// - player.spentTalents: array of talent ids taken
// Talents are defined in talents.js and applied via applyTalentsToPlayer(player)
// Effects include stat/cooldown/skill modifiers and are combined with base/race/class bonuses.

import { getItemById } from './items.js';
import { updateZoneUnlocks } from './zones.js';
import { applyTalentsToPlayer } from './talents.js';
import { playSoundLevelUp } from './audio.js';

const STORAGE_KEY = "arcane_quest_save_v1";
const SAVE_VERSION = 2;

export const GameState = {
  player: null,

  /**
   * Create a new player character from character creation options
   * @param {Object} options - Character creation options
   * @param {string} options.name - Player name
   * @param {string} options.className - Character class
   * @param {Object} options.stats - Stat allocation
   * @param {string} options.race - Character race
   */
  createNewPlayerFromOptions(options) {
    if (!options) {
      console.error('Cannot create player: missing options');
      return;
    }
    
    const { name, className, stats, race, humanBonusTarget } = options; // humanBonusTarget used when race === 'Human'
    const base = {
      name: name || "Hero",
      class: className || "Warrior",
      race: race || "Human", // player race
      level: 1,
      xp: 0,
      xpToNextLevel: 50,
      gold: 50,
      stats: {
        strength: stats?.str ?? 3,
        dexterity: stats?.dex ?? 3,
        intelligence: stats?.int ?? 3,
        vitality: stats?.vit ?? 3,
      },
      // Inventory holds item ids as strings
      inventory: [],
      // Equipped items (simple slots)
      equipment: { weapon: null, armor: null, accessory: null },
      // Talents
      talentPoints: 0,
      spentTalents: [],
      // Flags for world progression / unlocks
      flags: {},
      // NPC interaction & narrative states
      npcStates: {},
      // Quest tracking container
      quests: { active: [], completed: [] },
      maxHp: 0, hp: 0, maxMp: 0, mp: 0,
      attackPower: 0, magicPower: 0, defense: 0,
    };
    // Apply race stat bonuses (expanded definitions)
    // NOTE: Percentage / advanced bonuses like crit chance %, cooldown recovery, HP %, status resist
    // are NOT yet implemented mechanically. Future extension point: store passive modifiers and apply in recalculateDerived().
    switch (base.race) {
      case 'Human': {
        // Flexible +2 to chosen stat (defaults to strength if missing)
        const target = (humanBonusTarget || 'str').toLowerCase();
        if (target === 'str') base.stats.strength += 2;
        else if (target === 'dex') base.stats.dexterity += 2;
        else if (target === 'int') base.stats.intelligence += 2;
        else if (target === 'vit') base.stats.vitality += 2;
        else base.stats.strength += 2; // fallback
        break;
      }
      case 'Beast': {
        base.stats.strength += 4;
        // Future: base.maxHp scaling +8% after derived calc
        break;
      }
      case 'Elf': {
        base.stats.intelligence += 3;
        // Future: crit chance +5%, cooldown recovery bonus
        break;
      }
      case 'Bug': {
        base.stats.dexterity += 3;
        // Future: attack speed scaling passive
        break;
      }
      case 'Undead': {
        base.stats.vitality += 3;
        // Future: status resistance +10%
        break;
      }
    }

    // Elf starts with an Elven Shortbow (if defined) auto-equipped.
    if (base.race === 'Elf') {
      const bow = getItemById('elven_shortbow');
      if (bow) {
        base.equipment.weapon = bow; // direct assign before derived stat calc
        // Do not add to inventory (starter bound item) – can be replaced later.
      }
    }
    this.player = base;
    this.recalculateDerived();
    // Start at full resources
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    // Initialize zone progression
    this.player.currentZone = 'town';
    this.player.unlockedZones = ['forest'];
    updateZoneUnlocks(this.player);
  },

  /**
   * Recalculate all derived stats (HP, MP, ATK, DEF, etc.)
   * Must be called after any stat changes, equipment changes, or talent selection
   */
  recalculateDerived() {
    if (!this.player) {
      console.warn('Cannot recalculate: no player');
      return;
    }
    const p = this.player;
    const wAtk = p.equipment.weapon?.attackBonus ?? 0;
    const aDef = p.equipment.armor?.defenseBonus ?? 0;
    const str = p.stats.strength;
    const dex = p.stats.dexterity;
    const int = p.stats.intelligence;
    const vit = p.stats.vitality;

    p.attackPower = Math.floor(str * 2 + dex * 1 + wAtk);
    p.magicPower = Math.floor(int * 2 + dex * 0.5);
    p.defense = Math.floor(vit * 1.5 + aDef);
    p.maxHp = 30 + vit * 10;
    p.maxMp = 10 + int * 5;
    p.hp = Math.min(p.hp ?? p.maxHp, p.maxHp);
    p.mp = Math.min(p.mp ?? p.maxMp, p.maxMp);
    // Apply talent modifiers (may adjust derived or attach skill/global multipliers on player)
    applyTalentsToPlayer(p);
  },

  /**
   * Gain experience and automatically level up if threshold reached
   */
  gainXp(amount) {
    if (!this.player) return;
    this.player.xp += amount;
    while (this.player.xp >= this.player.xpToNextLevel) {
      this.player.xp -= this.player.xpToNextLevel;
      this.levelUp();
    }
  },

  /**
   * Level up the player, increase stats, and grant talent points
   */
  levelUp() {
    const p = this.player;
    p.level += 1;
    
    // Play level up sound
    playSoundLevelUp();
    
    // Simple scaling
    p.stats.vitality += 1;
    p.stats.strength += 1;
    if (p.class === "Mage") p.stats.intelligence += 1; else p.stats.dexterity += 1;
    p.xpToNextLevel = Math.floor(p.xpToNextLevel * 1.35);
    // Talent points gain (baseline + milestones)
    let gained = 1;
    if (p.level === 5 || p.level === 10) gained += 1; // example milestones
    p.talentPoints = (p.talentPoints ?? 0) + gained;
    this.recalculateDerived();
    p.hp = p.maxHp; p.mp = p.maxMp;
    try {
      const evt = new CustomEvent('talentPointGained', { detail: { amount: gained } });
      window.dispatchEvent(evt);
    } catch {}
    // Re-evaluate zone unlocks after level change
    updateZoneUnlocks(p);
  },

  /**
   * Save entire game state to localStorage
   */
  saveToLocalStorage() {
    try {
      const saveData = {
        player: this.player,
        saveVersion: SAVE_VERSION,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) { 
      console.error("Save failed", e); 
      return false;
    }
  },

  /**
   * Load game state from localStorage with migration support
   */
  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data?.player) return false;
      this.player = data.player;
      const ver = data.saveVersion || 1;
      
      // Migration for older saves
      if (ver < SAVE_VERSION) {
        if (!this.player.flags) this.player.flags = {};
        if (typeof this.player.talentPoints !== 'number') this.player.talentPoints = 0;
        if (!Array.isArray(this.player.spentTalents)) this.player.spentTalents = [];
      }
      
      // Ensure all required fields exist
      if (!this.player.quests) this.player.quests = { active: [], completed: [] };
      if (!this.player.unlockedZones) this.player.unlockedZones = ['forest'];
      if (!this.player.currentZone) this.player.currentZone = 'town';
      updateZoneUnlocks(this.player);
      if (typeof this.player.talentPoints !== 'number') this.player.talentPoints = 0;
      if (!Array.isArray(this.player.spentTalents)) this.player.spentTalents = [];
      if (!this.player.flags) this.player.flags = {};
      if (!this.player.npcStates) this.player.npcStates = {};
      if (!this.player.inventory) this.player.inventory = [];
      if (!this.player.equipment) this.player.equipment = { weapon: null, armor: null, accessory: null };
      
      this.recalculateDerived();
      return true;
    } catch (e) { 
      console.error("Load failed", e); 
      return false;
    }
  },

  /**
   * Check if a save exists
   */
  hasSaveData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return !!raw;
    } catch {
      return false;
    }
  },

  /**
   * Reset game state and clear save
   */
  resetGame() {
    this.player = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  },

  // Inventory helpers
  /**
   * Add an item to player inventory
   */
  addItemToInventory(itemId) {
    if (!this.player) {
      console.warn('No player to add item to');
      return;
    }
    if (!itemId) {
      console.warn('Invalid item ID');
      return;
    }
    this.player.inventory.push(itemId);
    // Item acquisition may unlock next zone (e.g., luminescent_shard, runed_fragment)
    updateZoneUnlocks(this.player);
  },
  
  /**
   * Remove an item from player inventory
   */
  removeItemFromInventory(itemId) {
    if (!this.player) return false;
    const idx = this.player.inventory.indexOf(itemId);
    if (idx >= 0) { 
      this.player.inventory.splice(idx, 1); 
      return true; 
    }
    return false;
  },
  
  /**
   * Equip an item, moving current item to inventory if needed
   */
  equipItem(item) {
    if (!this.player || !item) {
      console.warn('Cannot equip: missing player or item');
      return false;
    }
    
    const slot = item.type; // 'weapon' or 'armor'
    if (slot !== 'weapon' && slot !== 'armor') {
      console.warn('Invalid equipment slot:', slot);
      return false;
    }
    
    // Check race restrictions
    if (item.elfOnly && this.player.race !== 'Elf') {
      console.warn('Item is Elf-only');
      return false;
    }
    
    const currently = this.player.equipment[slot];
    if (currently?.id) this.addItemToInventory(currently.id);
    this.player.equipment[slot] = item;
    this.recalculateDerived();
    updateZoneUnlocks(this.player);
    return true;
  }
};
