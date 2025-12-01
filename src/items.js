// items.js
// Simple item definitions for weapons/armors (stub for now)

// Weapon identity extensions:
// Each weapon now defines combat behavior fields:
// baseDamage: inherent damage portion added to stat-derived damage
// cooldownModifier: additive or multiplicative tweak to base cooldown (seconds to add). Existing attackCooldownModifier kept for compatibility.
// critChance: bonus crit chance (0.10 = +10%)
// weaponClass: one of 'light','heavy','magic','ranged'
// onHitEffect: optional status id applied on successful hit (chance handled in battleSystem)
export const items = {
  weapon: [
    { id: 'w_stick', name: 'Wooden Stick', type: 'weapon', price: 15, attackBonus: 2, baseDamage: 2, cooldownModifier: 0.0, critChance: 0.00, weaponClass: 'light', attackCooldownModifier: 0.0 },
    { id: 'w_dagger', name: 'Rusty Dagger', type: 'weapon', price: 40, attackBonus: 5, baseDamage: 4, cooldownModifier: -0.10, critChance: 0.05, weaponClass: 'light', attackCooldownModifier: -0.05 },
    { id: 'w_staff', name: 'Apprentice Staff', type: 'weapon', price: 60, attackBonus: 3, magicBonus: 3, baseDamage: 3, cooldownModifier: 0.0, critChance: 0.02, weaponClass: 'magic', attackCooldownModifier: 0.0 },
    { id: 'w_sword', name: 'Iron Sword', type: 'weapon', price: 120, attackBonus: 10, baseDamage: 8, cooldownModifier: 0.15, critChance: 0.00, weaponClass: 'heavy', attackCooldownModifier: -0.08 },
    // Elf-only starter weapon: moderate attack, slight speed bonus, ranged behavior
    { id: 'elven_shortbow', name: 'Elven Shortbow', type: 'weapon', price: 0, attackBonus: 4, baseDamage: 5, cooldownModifier: -0.05, critChance: 0.03, weaponClass: 'ranged', attackCooldownModifier: -0.03, elfOnly: true },
    { id: 'wyrm_fang_blade', name: 'Wyrm Fang Blade', type: 'weapon', price: 0, attackBonus: 18, baseDamage: 14, cooldownModifier: 0.20, critChance: 0.02, weaponClass: 'heavy', attackCooldownModifier: -0.06, onHitEffect: 'bleed' },
    { id: 'relic_arc_staff', name: 'Relic Arc Staff', type: 'weapon', price: 650, attackBonus: 10, magicBonus: 20, baseDamage: 12, cooldownModifier: 0.05, critChance: 0.04, weaponClass: 'magic', attackCooldownModifier: -0.04, onHitEffect: 'burn' },
    { id: 'relic_shadow_dagger', name: 'Relic Shadow Dagger', type: 'weapon', price: 620, attackBonus: 14, baseDamage: 11, cooldownModifier: -0.15, critChance: 0.08, weaponClass: 'light', attackCooldownModifier: -0.12, onHitEffect: 'poison' }
    ,{ id: 'forest_thorn_blade', name: 'Thorn Blade', type: 'weapon', price: 90, attackBonus: 8, baseDamage: 6, cooldownModifier: -0.05, critChance: 0.04, weaponClass: 'light', attackCooldownModifier: -0.06, onHitEffect: 'bleed' }
    ,{ id: 'echo_hammer', name: 'Echo Hammer', type: 'weapon', price: 160, attackBonus: 16, baseDamage: 10, cooldownModifier: 0.20, critChance: 0.02, weaponClass: 'heavy', attackCooldownModifier: 0.10 }
    ,{ id: 'grove_wand', name: 'Grove Wand', type: 'weapon', price: 210, attackBonus: 6, magicBonus: 12, baseDamage: 9, cooldownModifier: 0.0, critChance: 0.05, weaponClass: 'magic', attackCooldownModifier: -0.05, onHitEffect: 'burn' }
    ,{ id: 'ruin_pike', name: 'Runed Pike', type: 'weapon', price: 300, attackBonus: 20, baseDamage: 14, cooldownModifier: 0.10, critChance: 0.03, weaponClass: 'heavy', attackCooldownModifier: 0.0, onHitEffect: 'stagger' }
    ,{ id: 'wyrmfire_lance', name: 'Wyrmfire Lance', type: 'weapon', price: 500, attackBonus: 26, magicBonus: 8, baseDamage: 18, cooldownModifier: 0.25, critChance: 0.04, weaponClass: 'heavy', attackCooldownModifier: 0.05, onHitEffect: 'burn' }
    ,{ id: 'elder_wyrmfang_blade', name: 'Elder Wyrmfang Blade', type: 'weapon', price: 0, attackBonus: 30, baseDamage: 24, cooldownModifier: 0.20, critChance: 0.06, weaponClass: 'heavy', attackCooldownModifier: -0.05, onHitEffect: 'stagger' }
  ],
  armor: [
    { id: 'a_cloth', name: 'Cloth Robe', type: 'armor', price: 30, defenseBonus: 2 },
    { id: 'a_leather', name: 'Leather Vest', type: 'armor', price: 70, defenseBonus: 5 },
    { id: 'a_chain', name: 'Chainmail', type: 'armor', price: 150, defenseBonus: 10 },
    { id: 'wyrm_scale_armor', name: 'Wyrm Scale Armor', type: 'armor', price: 0, defenseBonus: 16 }
    ,{ id: 'relic_mystic_robes', name: 'Relic Mystic Robes', type: 'armor', price: 600, defenseBonus: 12 }
    ,{ id: 'bark_tunic', name: 'Bark Tunic', type: 'armor', price: 85, defenseBonus: 6 }
    ,{ id: 'stone_shell', name: 'Stone Shell', type: 'armor', price: 170, defenseBonus: 12 }
    ,{ id: 'living_vine_wrap', name: 'Living Vine Wrap', type: 'armor', price: 230, defenseBonus: 14 }
    ,{ id: 'ancient_plate', name: 'Ancient Plate', type: 'armor', price: 320, defenseBonus: 18 }
    ,{ id: 'ember_scale_mail', name: 'Ember Scale Mail', type: 'armor', price: 480, defenseBonus: 22 }
    ,{ id: 'molten_scale_carapace', name: 'Molten Scale Carapace', type: 'armor', price: 0, defenseBonus: 28 }
  ],
  consumable: [
    { id: 'forest_elixir', name: 'Forest Elixir', type: 'consumable', price: 40, effect: 'Boost momentum gain next battle', onUse: (p)=>{ p.flags = p.flags||{}; p.flags.buff_forest_elixir = true; } },
    { id: 'torch_oil', name: 'Torch Oil', type: 'consumable', price: 55, effect: 'Negate cave darkness crit penalty for one battle', onUse: (p)=>{ p.flags = p.flags||{}; p.flags.buff_torch_oil = true; } },
    { id: 'sprite_draught', name: 'Sprite Draught', type: 'consumable', price: 70, effect: 'Regenerate small MP after battle', onUse: (p)=>{ p.flags = p.flags||{}; p.flags.buff_sprite_draught = true; } },
    { id: 'ether_coating', name: 'Ether Coating', type: 'consumable', price: 90, effect: 'Reduce stagger resistance penalty in Ruins', onUse: (p)=>{ p.flags = p.flags||{}; p.flags.buff_ether_coating = true; } },
    { id: 'flameguard_potion', name: 'Flameguard Potion', type: 'consumable', price: 120, effect: 'Protects against burn hazards in Depths for one battle', onUse: (p)=>{ p.flags = p.flags||{}; p.flags.buff_flameguard = true; } },
    { id: 'ember_charm', name: 'Ember Charm', type: 'consumable', price: 0, effect: 'A forged charm that wards the Depths heat (one battle).', onUse: (p)=>{ p.flags = p.flags||{}; p.flags.buff_flameguard = true; } }
  ],
  component: [
    { id: 'forest_resin', name: 'Forest Resin', type: 'component', price: 12 },
    { id: 'luminescent_shard', name: 'Luminescent Shard', type: 'component', price: 24 },
    { id: 'arcane_pollen', name: 'Arcane Pollen', type: 'component', price: 30 },
    { id: 'runed_fragment', name: 'Runed Fragment', type: 'component', price: 42 },
    { id: 'molten_core', name: 'Molten Core', type: 'component', price: 60 },
    { id: 'elder_molten_core', name: 'Elder Molten Core', type: 'component', price: 0 }
  ]
};

export function getItemById(id) {
  const all = [...items.weapon, ...items.armor, ...(items.consumable||[]), ...(items.component||[])];
  return all.find(i => i.id === id) || null;
}
