// talents.js
// Data-driven talent trees and application helpers.
//
// Current trees:
// - Class Talents: Warrior (Heavy Blows, Sturdy Armor), Mage (Arcane Focus, Mana Flow), Rogue (Quick Hands, Backstabber)
// - Race Talents: Human (Adaptable), Beast (Feral Might), Elf (Elven Grace), Bug (Swarm Instinct)
//
// Add new talents by appending to classTalents/raceTalents with unique ids and effect descriptors.
// Effects support:
// - statModifiers: flat or multiplier fields like { attackMultiplier: 1.10, defenseMultiplier: 1.10, hpMultiplier: 1.05, intFlat: 1 }
// - cooldownModifiers: { baseCooldownMultiplier: 0.95, skillCooldownMultiplier: 0.9 }
// - skillModifiers: { powerStrikeDamageMultiplier: 1.25, critChanceBonus: 0.05 }
// Requirements:
// - requires: { minLevel?: number, requiredTalentIds?: string[] }
// - maxRank: simple integer; we start at 1
//
// Boss pattern notes (see Cave Wyrm in enemies.js):
// - Define boss template with special flags
// - Implement special behavior in battleSystem based on flags/counters
// - Gate via townUI and quests.js

export const classTalents = {
  Warrior: [
    {
      id: 'war_heavy_blows',
      name: 'Heavy Blows',
      description: 'Increase physical damage dealt.',
      type: 'stat',
      requires: { minLevel: 2 },
      maxRank: 1,
      effect: { statModifiers: { attackMultiplier: 1.12 } }
    },
    {
      id: 'war_sturdy_armor',
      name: 'Sturdy Armor',
      description: 'Increase defense and max HP slightly.',
      type: 'stat',
      requires: { minLevel: 3, requiredTalentIds: ['war_heavy_blows'] },
      maxRank: 1,
      effect: { statModifiers: { defenseMultiplier: 1.10, hpMultiplier: 1.05 } }
    }
    ,{
      id: 'war_power_mastery',
      name: 'Power Mastery',
      description: 'Power Strike deals more damage.',
      type: 'skill_modifier',
      requires: { minLevel: 4, requiredTalentIds: ['war_heavy_blows'] },
      maxRank: 1,
      effect: { skillModifiers: { powerStrikeDamageMultiplier: 1.25 } }
    }
  ],
  Mage: [
    {
      id: 'mag_arcane_focus',
      name: 'Arcane Focus',
      description: 'Increase magical damage.',
      type: 'stat',
      requires: { minLevel: 2 },
      maxRank: 1,
      effect: { statModifiers: { magicMultiplier: 1.15 } }
    },
    {
      id: 'mag_mana_flow',
      name: 'Mana Flow',
      description: 'Slightly reduce skill cooldowns.',
      type: 'cooldown',
      requires: { minLevel: 3, requiredTalentIds: ['mag_arcane_focus'] },
      maxRank: 1,
      effect: { cooldownModifiers: { skillCooldownMultiplier: 0.95 } }
    }
    ,{
      id: 'mag_fire_mastery',
      name: 'Fire Mastery',
      description: 'Firebolt deals increased damage.',
      type: 'skill_modifier',
      requires: { minLevel: 4, requiredTalentIds: ['mag_arcane_focus'] },
      maxRank: 1,
      effect: { skillModifiers: { fireboltDamageMultiplier: 1.30 } }
    }
  ],
  Rogue: [
    {
      id: 'rog_quick_hands',
      name: 'Quick Hands',
      description: 'Faster attacks overall.',
      type: 'cooldown',
      requires: { minLevel: 2 },
      maxRank: 1,
      effect: { cooldownModifiers: { baseCooldownMultiplier: 0.92 } }
    },
    {
      id: 'rog_backstabber',
      name: 'Backstabber',
      description: 'Increase crit chance slightly.',
      type: 'skill_modifier',
      requires: { minLevel: 3, requiredTalentIds: ['rog_quick_hands'] },
      maxRank: 1,
      effect: { skillModifiers: { critChanceBonus: 0.05 } }
    }
    ,{
      id: 'rog_jab_mastery',
      name: 'Jab Mastery',
      description: 'Quick Jab recovers even faster.',
      type: 'skill_modifier',
      requires: { minLevel: 4, requiredTalentIds: ['rog_quick_hands'] },
      maxRank: 1,
      effect: { skillModifiers: { quickJabCooldownMultiplier: 0.85 } }
    }
  ]
};

export const raceTalents = {
  Human: [
    {
      id: 'rac_adaptable',
      name: 'Adaptable',
      description: 'Small boost to all attributes.',
      type: 'stat',
      requires: {},
      maxRank: 1,
      effect: { statModifiers: { strFlat: 1, dexFlat: 1, intFlat: 1, vitFlat: 1 } }
    }
  ],
  Beast: [
    {
      id: 'rac_feral_might',
      name: 'Feral Might',
      description: 'Increase STR-based damage.',
      type: 'stat',
      requires: {},
      maxRank: 1,
      effect: { statModifiers: { attackMultiplier: 1.1 } }
    }
  ],
  Elf: [
    {
      id: 'rac_elven_grace',
      name: 'Elven Grace',
      description: 'Increase INT and modest cooldown bonus.',
      type: 'stat',
      requires: {},
      maxRank: 1,
      effect: { statModifiers: { intFlat: 1 }, cooldownModifiers: { baseCooldownMultiplier: 0.97 } }
    }
  ],
  Bug: [
    {
      id: 'rac_swarm_instinct',
      name: 'Swarm Instinct',
      description: 'Increase DEX or crit chance.',
      type: 'skill_modifier',
      requires: {},
      maxRank: 1,
      effect: { statModifiers: { dexFlat: 1 }, skillModifiers: { critChanceBonus: 0.05 } }
    }
  ]
};

export function getTalentsFor(player){
  const cls = classTalents[player.class] || [];
  const rac = raceTalents[player.race] || [];
  return { class: cls, race: rac };
}

export function requirementsMet(player, talent){
  const req = talent.requires || {};
  if (req.minLevel && player.level < req.minLevel) return false;
  if (req.requiredTalentIds && req.requiredTalentIds.some(id => !player.spentTalents.includes(id))) return false;
  return true;
}

// Applies talent effects onto the player.
// Resets transient multipliers and accumulates from taken talents.
export function applyTalentsToPlayer(player){
  // Reset transient fields used by battleSystem
  player._modifiers = player._modifiers || {};
  const mods = player._modifiers;
  mods.attackMultiplier = 1.0;
  mods.magicMultiplier = 1.0;
  mods.defenseMultiplier = 1.0;
  mods.hpMultiplier = 1.0;
  mods.baseCooldownMultiplier = 1.0;
  mods.skillCooldownMultiplier = 1.0;
  mods.critChanceBonus = 0.0;
  mods.powerStrikeDamageMultiplier = 1.0;
  mods.fireboltDamageMultiplier = 1.0;
  mods.quickJabCooldownMultiplier = 1.0;
  // Momentum related modifiers (new)
  mods.momentumDamageMultiplier = 1.0; // scales damage portion contributed by momentum
  mods.momentumCritBonusMultiplier = 1.0; // scales crit chance bonus from momentum
  mods.momentumGainMultiplier = 1.0; // scales momentum gain per successful action
  
  // New skill modifiers for active skills system
  mods.skillCostReduction = 0; // flat MP cost reduction
  mods.skillCooldownReduction = 0; // flat cooldown reduction in seconds
  mods.skillStatusChanceBonus = 0; // bonus to status effect application chance

  // Flat stat bonuses (applied to base stats prior to derived calc)
  const flat = { strFlat: 0, dexFlat: 0, intFlat: 0, vitFlat: 0 };

  const all = [...(classTalents[player.class] || []), ...(raceTalents[player.race] || [])];
  for (const id of player.spentTalents || []){
    const t = all.find(x => x.id === id);
    if (!t) continue;
    const eff = t.effect || {};
    const s = eff.statModifiers || {};
    const c = eff.cooldownModifiers || {};
    const k = eff.skillModifiers || {};
    // accumulate
    mods.attackMultiplier *= (s.attackMultiplier || 1.0);
    mods.magicMultiplier *= (s.magicMultiplier || 1.0);
    mods.defenseMultiplier *= (s.defenseMultiplier || 1.0);
    mods.hpMultiplier *= (s.hpMultiplier || 1.0);
    mods.baseCooldownMultiplier *= (c.baseCooldownMultiplier || 1.0);
    mods.skillCooldownMultiplier *= (c.skillCooldownMultiplier || 1.0);
    mods.critChanceBonus += (k.critChanceBonus || 0.0);
    mods.powerStrikeDamageMultiplier *= (k.powerStrikeDamageMultiplier || 1.0);
    mods.fireboltDamageMultiplier *= (k.fireboltDamageMultiplier || 1.0);
    mods.quickJabCooldownMultiplier *= (k.quickJabCooldownMultiplier || 1.0);
    // New skill system modifiers
    mods.skillCostReduction += (k.skillCostReduction || 0);
    mods.skillCooldownReduction += (k.skillCooldownReduction || 0);
    mods.skillStatusChanceBonus += (k.skillStatusChanceBonus || 0);
    // Future: talents could define momentum tuning like { momentumDamageMultiplier:1.15 }
    if (k.momentumDamageMultiplier) mods.momentumDamageMultiplier *= k.momentumDamageMultiplier;
    if (k.momentumCritBonusMultiplier) mods.momentumCritBonusMultiplier *= k.momentumCritBonusMultiplier;
    if (k.momentumGainMultiplier) mods.momentumGainMultiplier *= k.momentumGainMultiplier;
    flat.strFlat += (s.strFlat || 0);
    flat.dexFlat += (s.dexFlat || 0);
    flat.intFlat += (s.intFlat || 0);
    flat.vitFlat += (s.vitFlat || 0);
  }

  // Apply flat stat boosts
  player.stats.strength += flat.strFlat;
  player.stats.dexterity += flat.dexFlat;
  player.stats.intelligence += flat.intFlat;
  player.stats.vitality += flat.vitFlat;

  // Note: derived calculation multiplies after base computation. The host should read mods.*.
}

// Summary helper
export function summarizeTakenTalents(player){
  const { class: cls, race: rac } = getTalentsFor(player);
  const lookup = new Map([...cls, ...rac].map(t => [t.id, t]));
  return (player.spentTalents || []).map(id => lookup.get(id)?.name || id);
}
