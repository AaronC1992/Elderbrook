// skills.js
// Active skill definitions for combat
// Each skill defines: resource cost, cooldown, scaling stat, base power, and effects
//
// To add a new skill:
// 1. Add a new entry to the SKILLS array below
// 2. Define its scaling (STR/DEX/INT), cost, cooldown, and effect type
// 3. Optional: add status application (e.g., 'bleed', 'burn', 'stun')
// 4. Wire it to a UI button in townUI.js if needed

/**
 * Skill definition structure:
 * @typedef {Object} Skill
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Short description of effect
 * @property {number} resourceCost - MP/Focus cost to use
 * @property {number} cooldownMax - Cooldown duration in seconds
 * @property {string} scalingStat - Primary stat: 'STR', 'DEX', 'INT', 'VIT'
 * @property {number} basePower - Base damage/effect multiplier
 * @property {string} effectType - 'damage', 'heal', 'buff', 'debuff'
 * @property {string} [statusEffect] - Optional status to apply (from statuses.js)
 * @property {number} [statusChance] - Chance to apply status (0-1)
 * @property {number} [critBonus] - Additional crit chance for this skill
 * @property {string} [damageType] - 'physical' or 'magical'
 */

export const SKILLS = [
  {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A heavy blow dealing increased physical damage.',
    resourceCost: 15,
    cooldownMax: 8.0,
    scalingStat: 'STR',
    basePower: 1.8, // 180% of normal damage
    effectType: 'damage',
    damageType: 'physical',
    statusEffect: 'stagger',
    statusChance: 0.25,
    critBonus: 0.05
  },
  {
    id: 'quick_jab',
    name: 'Quick Jab',
    description: 'A rapid strike with low damage but short cooldown.',
    resourceCost: 8,
    cooldownMax: 3.5,
    scalingStat: 'DEX',
    basePower: 0.85, // 85% of normal damage
    effectType: 'damage',
    damageType: 'physical',
    critBonus: 0.10
  },
  {
    id: 'arcane_bolt',
    name: 'Arcane Bolt',
    description: 'A magical projectile that can burn the target.',
    resourceCost: 20,
    cooldownMax: 6.0,
    scalingStat: 'INT',
    basePower: 1.5, // 150% of magic damage
    effectType: 'damage',
    damageType: 'magical',
    statusEffect: 'burn',
    statusChance: 0.35,
    critBonus: 0.03
  },
  {
    id: 'guarding_stance',
    name: 'Guarding Stance',
    description: 'Reduce incoming damage for a short time.',
    resourceCost: 12,
    cooldownMax: 15.0,
    scalingStat: 'VIT',
    basePower: 0.5, // 50% damage reduction
    effectType: 'buff',
    damageType: 'physical',
    duration: 5.0 // Duration in seconds for the buff
  }
];

/**
 * Get skill by ID
 * @param {string} skillId - Skill identifier
 * @returns {Skill|null} Skill definition or null if not found
 */
export function getSkillById(skillId) {
  return SKILLS.find(s => s.id === skillId) || null;
}

/**
 * Get all available skills for a player (can be filtered by class/talents later)
 * @param {Object} player - Player object
 * @returns {Array<Skill>} Array of available skills
 */
export function getAvailableSkills(player) {
  // For now, return all skills
  // Later: filter by player class, talents, or learned skills
  return [...SKILLS];
}

/**
 * Check if player can afford to use a skill
 * @param {Object} player - Player object
 * @param {Skill} skill - Skill definition
 * @returns {boolean} True if player has enough MP
 */
export function canAffordSkill(player, skill) {
  return player.mp >= skill.resourceCost;
}
