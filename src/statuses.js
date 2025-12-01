// statuses.js
// Simple status effect framework: define effects and helpers to apply & tick.
// Each status: { id, name, duration, tickInterval, onApply(entity), onTick(entity), onExpire(entity) }
// Entities (player/enemy) hold statusEffects: [{ id, remaining, nextTick }]
// Extend by adding new status definitions below.

export const StatusDefinitions = {
  poison: {
    id: 'poison', name: 'Poison', duration: 8, tickInterval: 2,
    onApply: (e) => {},
    onTick: (e) => { e.hp = Math.max(0, e.hp - 5); },
    onExpire: (e) => {}
  },
  burn: {
    id: 'burn', name: 'Burn', duration: 6, tickInterval: 1.5,
    onApply: (e) => {},
    onTick: (e) => { e.hp = Math.max(0, e.hp - 7); },
    onExpire: (e) => {}
  },
  stun: {
    id: 'stun', name: 'Stun', duration: 2.5, tickInterval: 0, // no periodic damage
    onApply: (e) => { e._stunned = true; },
    onTick: () => {},
    onExpire: (e) => { e._stunned = false; }
  },
  bleed: {
    id: 'bleed', name: 'Bleed', duration: 6, tickInterval: 0,
    // Bleed damaged entity takes extra damage whenever struck (handled in battleSystem)
    onApply: (e) => { e._bleedStacks = (e._bleedStacks || 0) + 1; },
    onTick: () => {},
    onExpire: (e) => { e._bleedStacks = Math.max(0, (e._bleedStacks || 0) - 1); }
  },
  stagger: {
    id: 'stagger', name: 'Stagger', duration: 1.8, tickInterval: 0,
    // Delay next attack by resetting cooldown progress
    onApply: (e) => { if (e.cdCurrent !== undefined) e.cdCurrent = 0; if (e.enemyCooldownCurrent !== undefined) e.enemyCooldownCurrent = 0; },
    onTick: () => {},
    onExpire: () => {}
  },
  slow: {
    id: 'slow', name: 'Slow', duration: 5, tickInterval: 0,
    onApply: (e) => {
      // Increase effective cooldown length
      if (e._originalCdMax == null) {
        if (e.cdMax !== undefined) { e._originalCdMax = e.cdMax; e.cdMax *= 1.25; }
        if (e.enemyCooldownMax !== undefined) { e._originalEnemyCdMax = e.enemyCooldownMax; e.enemyCooldownMax *= 1.25; }
      }
    },
    onTick: () => {},
    onExpire: (e) => {
      if (e._originalCdMax != null) { e.cdMax = e._originalCdMax; e._originalCdMax = null; }
      if (e._originalEnemyCdMax != null) { e.enemyCooldownMax = e._originalEnemyCdMax; e._originalEnemyCdMax = null; }
    }
  }
};

/**
 * Apply a status effect to an entity
 */
export function applyStatus(entity, statusId, logFn){
  const def = StatusDefinitions[statusId];
  if (!def) return false;
  // Handle resistances/immunities if present on entity
  if (entity && entity.resistances){
    // Support two shapes: array (immune list) or object { immune:[], resist:{ id:coef } }
    if (Array.isArray(entity.resistances)){
      if (entity.resistances.includes(statusId)){
        logFn?.(`${entity.name} shrugs off ${def.name}.`, 'status');
        return false;
      }
    } else {
      if (entity.resistances.immune?.includes?.(statusId)){
        logFn?.(`${entity.name} is immune to ${def.name}.`, 'status');
        return false;
      }
    }
  }
  entity.statusEffects = entity.statusEffects || [];
  // Do not stack identical statuses — refresh duration instead
  const existing = entity.statusEffects.find(s => s.id === statusId);
  // Compute effective duration with optional resistance coefficient
  let duration = def.duration;
  if (entity && entity.resistances && !Array.isArray(entity.resistances)){
    const coef = entity.resistances.resist?.[statusId];
    if (typeof coef === 'number' && coef >= 0 && coef <= 1){
      duration = Math.max(0.1, duration * coef);
    }
  }
  // Zone-specific stagger resistance hook (set by zones.js via battleState)
  if (statusId === 'stagger' && typeof window !== 'undefined'){
    const bs = window.__activeBattleState;
    if (bs?._zoneStaggerResistance){
      duration = Math.max(0.1, duration * bs._zoneStaggerResistance);
    }
  }
  if (existing){
    existing.remaining = duration;
    existing.nextTick = def.tickInterval;
    logFn?.(`${def.name} refreshed on ${entity.name}.`, 'status');
    return true;
  }
  const inst = { id: statusId, remaining: duration, nextTick: def.tickInterval };
  entity.statusEffects.push(inst);
  def.onApply(entity);
  logFn?.(`${entity.name} is afflicted with ${def.name}.`, 'status');
  return true;
}

/**
 * Tick status effects on an entity (damage over time, duration tracking)
 */
export function tickStatuses(entity, dt, logFn){
  if (!entity?.statusEffects?.length) return;
  const keep = [];
  for (const s of entity.statusEffects){
    s.remaining -= dt;
    if (s.nextTick !== 0){
      s.nextTick -= dt;
      if (s.nextTick <= 0){
        const def = StatusDefinitions[s.id];
        def?.onTick(entity);
        logFn?.(`${def?.name} deals its effect to ${entity.name}.`, 'status');
        s.nextTick += def.tickInterval; // schedule next
      }
    }
    if (s.remaining > 0){
      keep.push(s);
    } else {
      StatusDefinitions[s.id]?.onExpire(entity);
      logFn?.(`${StatusDefinitions[s.id]?.name} fades from ${entity.name}.`, 'status');
    }
  }
  entity.statusEffects = keep;
}
