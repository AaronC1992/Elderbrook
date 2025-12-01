// enemies.js
// Defines enemies and helpers to pick/scaling
// Balancing & scaling notes:
// - Each zone pool has a base array with baseline stats (hp, atk, def, cd).
// - Per-zone generators (getRandomXEnemy) scale stats relative to player level with small per-level multipliers.
// - Forest: gentlest ramp (hp*0.12/level over base); Cave: tougher (hp*0.14); Grove: 0.13; Ruins: 0.15; Depths: 0.16.
// - Rewards (gold/xp) follow zone difficulty ordering and scale implicitly via stronger enemies; boss/portal use bespoke values.
// - Rare encounters: small chance to spawn an Elite variant (+20–25% stats, +50% rewards) to keep progression spicy without grinding.
//
// ENEMY SKILLS SYSTEM:
// - Enemies can define a `skills` array with skill definitions similar to player skills
// - Each skill has: id, name, description, cooldownMax, basePower, scalingStat, effectType, appliedStatus, telegraphText
// - Enemy AI in battleSystem.js will choose between basic attack and skills based on cooldown/priority
// - Skills with `priority: 'high'` are preferred when off cooldown
// - Telegraph messages warn the player 1-2 seconds before dangerous skills execute

import { clamp, randChoice, randInt } from './utils.js';

const forestBase = [
  // Basic enemy: no skills, just attacks
  { id: 'forest_slime', name: 'Forest Slime', level: 1, maxHp: 28, attackPower: 6, defense: 1, goldReward: 6, xpReward: 12, attackCooldownMax: 2.4, attackSpeedModifier: 1.0 },
  
  { id: 'rabid_squirrel', name: 'Rabid Squirrel', level: 2, maxHp: 32, attackPower: 7, defense: 2, goldReward: 8, xpReward: 16, attackCooldownMax: 2.0, attackSpeedModifier: 1.2,
    skills: [
      {
        id: 'feral_bite',
        name: 'Feral Bite',
        description: 'A vicious bite that causes bleeding',
        cooldownMax: 8,
        basePower: 4,
        scalingStat: 'strength',
        effectType: 'damage',
        damageType: 'physical',
        appliedStatus: 'bleed',
        statusChance: 0.4,
        priority: 'medium',
        telegraphText: 'The squirrel bares its yellowed fangs!'
      }
    ]
  },
  
  { id: 'bandit', name: 'Bandit', level: 3, maxHp: 40, attackPower: 10, defense: 3, goldReward: 12, xpReward: 22, attackCooldownMax: 2.2, attackSpeedModifier: 1.0,
    skills: [
      {
        id: 'cheap_shot',
        name: 'Cheap Shot',
        description: 'A dirty trick that briefly staggers',
        cooldownMax: 10,
        basePower: 3,
        scalingStat: 'strength',
        effectType: 'damage',
        damageType: 'physical',
        appliedStatus: 'stagger',
        statusChance: 0.5,
        priority: 'medium',
        telegraphText: 'The bandit reaches for something hidden!'
      }
    ]
  },
  
  { id: 'wolf', name: 'Grey Wolf', level: 4, maxHp: 44, attackPower: 12, defense: 3, goldReward: 12, xpReward: 26, attackCooldownMax: 1.9, attackSpeedModifier: 1.1,
    skills: [
      {
        id: 'pack_howl',
        name: 'Pack Howl',
        description: 'An intimidating howl that boosts attack',
        cooldownMax: 12,
        basePower: 0,
        scalingStat: 'strength',
        effectType: 'buff',
        appliedStatus: 'enrage',
        priority: 'high',
        telegraphText: 'The wolf throws back its head and howls!'
      }
    ]
  },
  
  { id: 'spriggan', name: 'Lesser Spriggan', level: 5, maxHp: 52, attackPower: 14, defense: 4, goldReward: 16, xpReward: 30, attackCooldownMax: 2.3, attackSpeedModifier: 1.0,
    skills: [
      {
        id: 'thorn_spray',
        name: 'Thorn Spray',
        description: 'Fires sharp thorns that cause bleeding',
        cooldownMax: 9,
        basePower: 6,
        scalingStat: 'intelligence',
        effectType: 'damage',
        damageType: 'magical',
        appliedStatus: 'bleed',
        statusChance: 0.35,
        priority: 'high',
        telegraphText: 'The spriggan\'s bark begins to bristle with thorns!'
      }
    ]
  },
  
  { id: 'bee', name: 'Giant Bee', level: 2, maxHp: 30, attackPower: 8, defense: 2, goldReward: 8, xpReward: 15, attackCooldownMax: 1.8, attackSpeedModifier: 1.25, image: 'enemy/enemy-bee.png',
    skills: [
      {
        id: 'poison_sting',
        name: 'Poison Sting',
        description: 'A toxic sting that poisons the target',
        cooldownMax: 10,
        basePower: 5,
        scalingStat: 'dexterity',
        effectType: 'damage',
        damageType: 'physical',
        appliedStatus: 'poison',
        statusChance: 0.6,
        priority: 'high',
        telegraphText: 'The bee\'s stinger drips with venom!'
      }
    ]
  },
];

// Cave enemies: tougher variants, diverse speed profiles
const caveBase = [
  { id: 'cave_bat', name: 'Cave Bat', level: 3, maxHp: 38, attackPower: 11, defense: 3, goldReward: 18, xpReward: 34, attackCooldownMax: 1.5, attackSpeedModifier: 1.15,
    skills: [
      {
        id: 'sonic_screech',
        name: 'Sonic Screech',
        description: 'A disorienting screech that briefly stuns',
        cooldownMax: 11,
        basePower: 4,
        scalingStat: 'intelligence',
        effectType: 'damage',
        damageType: 'magical',
        appliedStatus: 'stun',
        statusChance: 0.3,
        priority: 'high',
        telegraphText: 'The bat inhales deeply, wings spread wide!'
      }
    ]
  },
  
  { id: 'stone_beetle', name: 'Stone Beetle', level: 4, maxHp: 70, attackPower: 14, defense: 6, goldReward: 22, xpReward: 40, attackCooldownMax: 2.4, attackSpeedModifier: 1.0,
    skills: [
      {
        id: 'shell_bash',
        name: 'Shell Bash',
        description: 'Heavy impact that can stagger',
        cooldownMax: 10,
        basePower: 8,
        scalingStat: 'strength',
        effectType: 'damage',
        damageType: 'physical',
        appliedStatus: 'stagger',
        statusChance: 0.45,
        priority: 'high',
        telegraphText: 'The beetle rears back, shell gleaming!'
      }
    ]
  },
  
  { id: 'goblin_miner', name: 'Goblin Miner', level: 5, maxHp: 80, attackPower: 16, defense: 5, goldReward: 26, xpReward: 48, attackCooldownMax: 2.1, attackSpeedModifier: 1.05,
    skills: [
      {
        id: 'pickaxe_swing',
        name: 'Wild Pickaxe Swing',
        description: 'A reckless swing with mining equipment',
        cooldownMax: 8,
        basePower: 7,
        scalingStat: 'strength',
        effectType: 'damage',
        damageType: 'physical',
        priority: 'medium',
        telegraphText: 'The goblin raises its pickaxe overhead!'
      }
    ]
  },
  
  { id: 'cave_troll', name: 'Cave Troll', level: 6, maxHp: 130, attackPower: 26, defense: 8, goldReward: 40, xpReward: 70, attackCooldownMax: 3.0, attackSpeedModifier: 0.95,
    skills: [
      {
        id: 'ground_slam',
        name: 'Ground Slam',
        description: 'Massive attack that shakes the ground',
        cooldownMax: 12,
        basePower: 12,
        scalingStat: 'strength',
        effectType: 'damage',
        damageType: 'physical',
        appliedStatus: 'stagger',
        statusChance: 0.5,
        priority: 'high',
        telegraphText: 'The troll lifts both fists high - the ground trembles!'
      }
    ]
  },
];

// Elf Grove: agile, mixed magical/physical foes
const elfGroveBase = [
  { id: 'corrupted_sprite', name: 'Corrupted Sprite', level: 4, maxHp: 42, attackPower: 13, defense: 3, goldReward: 20, xpReward: 36, attackCooldownMax: 1.7, attackSpeedModifier: 1.15,
    skills: [
      {
        id: 'shadow_bolt',
        name: 'Shadow Bolt',
        description: 'Dark magic that saps vitality',
        cooldownMax: 9,
        basePower: 7,
        scalingStat: 'intelligence',
        effectType: 'damage',
        damageType: 'magical',
        appliedStatus: 'poison',
        statusChance: 0.25,
        priority: 'high',
        telegraphText: 'The sprite\'s form darkens, crackling with shadow energy!'
      }
    ]
  },
  
  { id: 'thorn_guardian', name: 'Thorn Guardian', level: 5, maxHp: 95, attackPower: 18, defense: 6, goldReward: 30, xpReward: 52, attackCooldownMax: 2.5, attackSpeedModifier: 1.0,
    skills: [
      {
        id: 'root_grasp',
        name: 'Root Grasp',
        description: 'Entangling roots that restrict movement',
        cooldownMax: 11,
        basePower: 8,
        scalingStat: 'strength',
        effectType: 'damage',
        damageType: 'physical',
        appliedStatus: 'stagger',
        statusChance: 0.5,
        priority: 'high',
        telegraphText: 'Roots burst from the ground around the guardian!'
      }
    ]
  },
  
  { id: 'wayward_ranger', name: 'Wayward Ranger', level: 6, maxHp: 110, attackPower: 22, defense: 7, goldReward: 38, xpReward: 68, attackCooldownMax: 2.0, attackSpeedModifier: 1.1,
    skills: [
      {
        id: 'piercing_shot',
        name: 'Piercing Shot',
        description: 'Precise arrow that ignores some armor',
        cooldownMax: 8,
        basePower: 9,
        scalingStat: 'dexterity',
        effectType: 'damage',
        damageType: 'physical',
        priority: 'high',
        telegraphText: 'The ranger draws back a shimmering arrow!'
      }
    ]
  },
];

// Ancient Ruins enemies: post-boss tougher foes
const ruinsBase = [
  { id: 'ruins_specter', name: 'Ruins Specter', level: 7, maxHp: 140, attackPower: 24, defense: 9, goldReward: 55, xpReward: 110, attackCooldownMax: 2.2, attackSpeedModifier: 1.05 },
  { id: 'ancient_construct', name: 'Ancient Construct', level: 8, maxHp: 190, attackPower: 30, defense: 12, goldReward: 70, xpReward: 140, attackCooldownMax: 2.6, attackSpeedModifier: 1.0 },
  { id: 'ruins_champion', name: 'Ruins Champion', level: 9, maxHp: 240, attackPower: 34, defense: 14, goldReward: 85, xpReward: 170, attackCooldownMax: 2.4, attackSpeedModifier: 1.05 },
];

// Shadow Portal enemies: appear in groups (multi-enemy battles)
const portalPool = [
  { id: 'shadow_imp', name: 'Shadow Imp', level: 9, maxHp: 120, attackPower: 28, defense: 10, goldReward: 40, xpReward: 90, attackCooldownMax: 1.9, attackSpeedModifier: 1.1 },
  { id: 'void_shade', name: 'Void Shade', level: 10, maxHp: 150, attackPower: 30, defense: 11, goldReward: 48, xpReward: 105, attackCooldownMax: 2.1, attackSpeedModifier: 1.05 },
  { id: 'abyssal_eye', name: 'Abyssal Eye', level: 11, maxHp: 170, attackPower: 34, defense: 12, goldReward: 55, xpReward: 120, attackCooldownMax: 2.3, attackSpeedModifier: 1.0 },
];

// Cave Wyrm boss template
export const caveWyrmTemplate = {
  id: 'boss_cave_wyrm',
  name: 'Cave Wyrm',
  level: 7,
  maxHp: 300,
  attackPower: 32, // balanced downward slightly after crit system added
  defense: 10,
  goldReward: 80,
  xpReward: 180,
  attackCooldownMax: 2.8,
  attackSpeedModifier: 1.0,
  hasSpecialAttack: true,
  // Special attack definition for telegraph system
  specialAttack: {
    name: 'Tail Smash',
    windup: 1.6, // seconds warning
    cooldown: 9.0, // time between specials
    damageMultiplier: 2.0 // scales off base attackPower
  }
};

// Wyrm's Depths biome: fiery minions supporting final progression
const depthsBase = [
  { id: 'depths_wyrmspawn', name: 'Wyrmspawn', level: 9, maxHp: 260, attackPower: 38, defense: 16, goldReward: 95, xpReward: 190, attackCooldownMax: 2.6, attackSpeedModifier: 1.0 },
  { id: 'depths_magma_serpent', name: 'Magma Serpent', level: 10, maxHp: 300, attackPower: 42, defense: 18, goldReward: 110, xpReward: 220, attackCooldownMax: 2.4, attackSpeedModifier: 1.05 },
  { id: 'depths_lava_wisp', name: 'Lava Wisp', level: 11, maxHp: 240, attackPower: 40, defense: 15, goldReward: 105, xpReward: 210, attackCooldownMax: 1.8, attackSpeedModifier: 1.2 },
];

export function getRandomForestEnemy(playerLevel = 1) {
  // Choose a base template and scale around the player's level
  const base = randChoice(forestBase);
  const levelDelta = clamp(randInt(-1, 1), -2, 2);
  const level = Math.max(1, (playerLevel ?? 1) + levelDelta);
  const scale = 1 + Math.max(0, level - base.level) * 0.12; // small per-level scaling up
  return maybeElite({
    ...base,
    level,
    maxHp: Math.round(base.maxHp * scale),
    attackPower: Math.round(base.attackPower * (1 + (level - base.level) * 0.08)),
    defense: Math.round(base.defense * (1 + (level - base.level) * 0.06)),
  }, 0.10);
}

export function getRandomCaveEnemy(playerLevel = 1) {
  const base = randChoice(caveBase);
  const levelDelta = clamp(randInt(-1, 1), -2, 2);
  const level = Math.max(1, (playerLevel ?? 1) + levelDelta);
  const scale = 1 + Math.max(0, level - base.level) * 0.14; // cave scales a bit stronger
  return maybeElite({
    ...base,
    level,
    maxHp: Math.round(base.maxHp * scale),
    attackPower: Math.round(base.attackPower * (1 + (level - base.level) * 0.1)),
    defense: Math.round(base.defense * (1 + (level - base.level) * 0.07)),
  }, 0.10);
}

export function getRandomElfGroveEnemy(playerLevel = 1) {
  const base = randChoice(elfGroveBase);
  const levelDelta = clamp(randInt(-1, 1), -2, 2);
  const level = Math.max(1, (playerLevel ?? 1) + levelDelta);
  // Grove scaling: between forest and cave
  const scale = 1 + Math.max(0, level - base.level) * 0.13;
  return maybeElite({
    ...base,
    level,
    maxHp: Math.round(base.maxHp * scale),
    attackPower: Math.round(base.attackPower * (1 + (level - base.level) * 0.09)),
    defense: Math.round(base.defense * (1 + (level - base.level) * 0.065)),
  }, 0.10);
}

export function getRandomRuinsEnemy(playerLevel = 1) {
  const base = randChoice(ruinsBase);
  const levelDelta = clamp(randInt(-1,1), -2, 2);
  const level = Math.max(1, (playerLevel ?? 1) + levelDelta);
  const scale = 1 + Math.max(0, level - base.level) * 0.15; // slightly higher scaling
  return maybeElite({ ...base,
    level,
    maxHp: Math.round(base.maxHp * scale),
    attackPower: Math.round(base.attackPower * (1 + (level - base.level) * 0.11)),
    defense: Math.round(base.defense * (1 + (level - base.level) * 0.075)),
  }, 0.10);
}

export function getRandomDepthsEnemy(playerLevel = 1){
  const base = randChoice(depthsBase);
  const levelDelta = clamp(randInt(-1,1), -2,2);
  const level = Math.max(1, (playerLevel ?? 1) + levelDelta);
  const scale = 1 + Math.max(0, level - base.level) * 0.16; // slightly higher scaling in final biome
  return maybeElite({ ...base,
    level,
    maxHp: Math.round(base.maxHp * scale),
    attackPower: Math.round(base.attackPower * (1 + (level - base.level) * 0.12)),
    defense: Math.round(base.defense * (1 + (level - base.level) * 0.08)),
  }, 0.08);
}

// Rare encounter helper: 12% chance to upgrade to Elite version (stat/reward bump)
function maybeElite(template, chance = 0.12){
  if (Math.random() >= chance) return template;
  const t = { ...template };
  t.id = `${t.id}_elite`;
  t.name = `Elite ${t.name}`;
  t.maxHp = Math.round(t.maxHp * 1.25);
  t.attackPower = Math.round(t.attackPower * 1.22);
  t.defense = Math.round(t.defense * 1.2);
  t.goldReward = Math.round((t.goldReward || 0) * 1.5);
  t.xpReward = Math.round((t.xpReward || 0) * 1.5);
  return t;
}

// Rare encounter integration is applied inline in each generator via maybeElite(..., chance)

export function getCaveWyrm(){
  // return a fresh copy with independent hp/counters
  return { ...caveWyrmTemplate, hp: caveWyrmTemplate.maxHp, _attackCounter: 0 };
}

export function getShadowPortalGroup(playerLevel = 1){
  // Choose 2-3 enemies scaled slightly by player level
  const count = randInt(2,3);
  const group = [];
  for (let i=0;i<count;i++){
    const base = randChoice(portalPool);
    const levelDelta = clamp(randInt(-1,1), -2,2);
    const level = Math.max(1, (playerLevel ?? base.level) + levelDelta);
    const scale = 1 + Math.max(0, level - base.level) * 0.12;
    group.push({
      ...base,
      level,
      maxHp: Math.round(base.maxHp * scale),
      attackPower: Math.round(base.attackPower * (1 + (level - base.level) * 0.09)),
      defense: Math.round(base.defense * (1 + (level - base.level) * 0.065)),
    });
  }
  return group;
}

// The Wyrm of Elder Deep — multi-phase endgame boss
export function getElderDeepWyrm(){
  const boss = {
    id: 'boss_elder_wyrm',
    name: 'The Wyrm of Elder Deep',
    level: 12,
    maxHp: 1200,
    hp: 1200,
    attackPower: 52,
    defense: 20,
    goldReward: 500,
    xpReward: 1200,
    attackCooldownMax: 2.6,
    attackSpeedModifier: 1.0,
    // New boss schema fields
    phases: [
      {
        key: 'burrow_and_strike',
        thresholdHpPct: 0.7, // P1 until 70%
        stats: { attackCooldownMax: 3.0, attackPowerMult: 1.15, defenseMult: 1.0 },
        pattern: ['bite','burrow','bite'],
        introLine: '…stone groans as the elder wyrm stirs.'
      },
      {
        key: 'molten_core',
        thresholdHpPct: 0.35, // P2 until 35%
        stats: { attackCooldownMax: 2.4, attackPowerMult: 1.2, defenseMult: 1.05 },
        pattern: ['fire_breath','bite','heatwave','firewall'],
        introLine: 'Molten veins ignite; the Deep itself breathes fire.'
      },
      {
        key: 'ancient_fury',
        thresholdHpPct: 0.0, // P3 to finish
        stats: { attackCooldownMax: 2.0, attackPowerMult: 1.3, defenseMult: 1.1 },
        pattern: ['bite','elder_rupture','bite'],
        introLine: 'Ancient memory awakens — the world-tremor returns.'
      }
    ],
    currentPhase: 0,
    transitionConditions: 'Phase shifts at 70% and 35% HP.',
    specialAttacks: {
      burrow: { windup: 1.5, cooldown: 11, damageMult: 1.6 },
      fire_breath: { windup: 1.2, cooldown: 9, damageMult: 1.4, status:'burn' },
      firewall: { windup: 0.8, cooldown: 10, damageMult: 1.0, status:'burn' },
      heatwave: { windup: 0.6, cooldown: 8, damageMult: 0.8, aoe:true },
      elder_rupture: { windup: 2.2, cooldown: 14, damageMult: 2.8 }
    },
    resistances: { immune:['stun'], resist: { burn: 0.6, poison: 0.7, stagger: 0.6 } },
    loreLine: '“Elderbrook was not found — it was promised.”',
    lootTable: { weapon: 'elder_wyrmfang_blade', armor: 'molten_scale_carapace', component: 'elder_molten_core' },
    musicKey: 'elder_wyrm_theme',
    onDefeat: 'elder_wyrm_defeated'
  };
  return boss;
}
