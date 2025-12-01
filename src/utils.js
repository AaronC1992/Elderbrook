// utils.js
// Small shared helpers

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function formatHpMp(hp, maxHp, mp, maxMp) {
  return {
    hpText: `${Math.max(0, Math.ceil(hp))}/${maxHp}`,
    mpText: `${Math.max(0, Math.ceil(mp))}/${maxMp}`,
  };
}
