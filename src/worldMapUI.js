// worldMapUI.js
// Visual world map with clickable zone nodes and travel flow

import { GameState } from './gameState.js';
import { listZones, canEnterZone, applyZoneStartEffects } from './zones.js';
import { showScreen, setBackground, addBattleLogEntry } from './renderer.js';
import { playAmbience, playSoundZoneTransition } from './audio.js';
import { getRandomForestEnemy, getRandomCaveEnemy, getRandomElfGroveEnemy, getRandomRuinsEnemy, getRandomDepthsEnemy } from './enemies.js';
import { Battle } from './battleSystem.js';

const NODE_CONFIG = {
  forest: { displayName: 'Elderbrook Forest', entryPoint: 'battle', backgroundKey: 'forest' },
  cave: { displayName: 'The Hollow Cave', entryPoint: 'battle', backgroundKey: 'cave' },
  grove: { displayName: 'Elven Grove', entryPoint: 'battle', backgroundKey: 'grove' },
  ruins: { displayName: 'Ancient Ruins', entryPoint: 'battle', backgroundKey: 'ruins' },
  depths: { displayName: "Wyrm's Depths", entryPoint: 'battle', backgroundKey: 'depths' }
};

function getZoneEnemyPicker(key){
  switch(key){
    case 'forest': return getRandomForestEnemy;
    case 'cave': return getRandomCaveEnemy;
    case 'grove': return getRandomElfGroveEnemy;
    case 'ruins': return getRandomRuinsEnemy;
    case 'depths': return getRandomDepthsEnemy;
    default: return getRandomForestEnemy;
  }
}

export const WorldMapUI = {
  init(){
    // Create screen if not present
    if (!document.querySelector('#screen-world-map')){
      const screen = document.createElement('div');
      screen.id = 'screen-world-map';
      screen.className = 'screen hidden';
      screen.innerHTML = `
        <div class="panel world-map-panel">
          <div class="world-map-bg">
            <div id="world-map-nodes"></div>
            <div id="world-map-markers"></div>
          </div>
          <div class="row right"><button id="world-map-back">Back to Town</button></div>
        </div>`;
      document.body.appendChild(screen);
      document.querySelector('#world-map-back').addEventListener('click', () => {
        showScreen('screen-town');
        setBackground('town');
      });
    }
    this.render();
  },
  render(){
    const nodesRoot = document.querySelector('#world-map-nodes');
    const zones = listZones();
    const p = GameState.player;
    nodesRoot.innerHTML = '';
    // Optional fog-of-war overlay: show until map viewed once
    const fogHost = document.querySelector('#world-map-markers');
    const fogOn = !(p?.flags?.mapViewed);
    if (fogHost){
      const existingFog = document.getElementById('world-map-fog');
      if (!existingFog && fogOn){
        const fog = document.createElement('div');
        fog.id = 'world-map-fog';
        fog.style.position = 'absolute'; fog.style.inset = '0';
        fog.style.pointerEvents = 'none';
        fog.style.background = 'radial-gradient(ellipse at 30% 30%, rgba(0,0,0,0.35), rgba(0,0,0,0.65))';
        fogHost.appendChild(fog);
      } else if (existingFog && !fogOn){
        existingFog.remove();
      }
    }
    zones.forEach((z, idx) => {
      const cfg = NODE_CONFIG[z.key] || {};
      const node = document.createElement('div');
      node.className = 'map-node';
      node.dataset.zoneKey = z.key;
      // Position nodes roughly; later can use CSS grid or absolute positions tied to background image
      node.style.left = (10 + idx*18) + '%';
      node.style.top = (20 + idx*10) + '%';
      const unlocked = canEnterZone(z.key, p);
      const current = (p?.currentZone === z.key);
      const newlyUnlocked = unlocked && !(p.unlockedZones?.includes(z.key)); // fallback, usually zones.js keeps this updated
      node.classList.toggle('locked', !unlocked);
      node.classList.toggle('current', !!current);
      if (newlyUnlocked) node.classList.add('newly-unlocked');
      const displayName = cfg.displayName || z.zoneName;
      // Difficulty indicator based on recommended level vs player level
      const rec = Number(z.recommendedLevel ?? 1);
      const pl = Number(p?.level ?? 1);
      let diffClass = '';
      if (unlocked){
        const delta = rec - pl;
        if (delta <= -3) diffClass = 'easy';
        else if (delta <= 1) diffClass = 'fair';
        else if (delta <= 3) diffClass = 'hard';
        else diffClass = 'impossible';
        node.classList.add(diffClass);
      }
      const tooltip = `${displayName}\nLv ${z.recommendedLevel} • ${z.description}`;
      node.setAttribute('data-tooltip', tooltip);
      node.innerHTML = `<span class="node-label">${displayName}</span>`;
      node.addEventListener('click', () => {
        if (!unlocked){
          const req = z.entryRequirements;
          const reasons = [];
          if ((p.level ?? 1) < (req.minLevel || 1)) reasons.push(`Need Lv ${req.minLevel}`);
          if (req.milestoneQuestId && !p.quests?.completed?.some(q => q.id === req.milestoneQuestId)) reasons.push(`Complete quest: ${req.milestoneQuestId}`);
          if (req.requiredItemId && !p.inventory.includes(req.requiredItemId) && p.equipment.armor?.id !== req.requiredItemId && p.equipment.weapon?.id !== req.requiredItemId) reasons.push(`Require item: ${req.requiredItemId}`);
          this.showReason(displayName, reasons);
          return;
        }
        this.travelToZone(z.key);
      });
      nodesRoot.appendChild(node);
    });
    // Flavor markers
    const markersRoot = document.querySelector('#world-map-markers');
    markersRoot.innerHTML = `
      <div class="map-marker" style="left:72%;top:18%" data-tooltip="Broken spire — whispers of older paths."></div>
      <div class="map-marker" style="left:34%;top:66%" data-tooltip="Runestone shard — promises made to keep the Deep asleep."></div>
      <div class="map-marker" style="left:58%;top:44%" data-tooltip="Fossil bed — the earth remembers teeth."></div>
    `;
  },
  show(){
    this.init();
    showScreen('screen-world-map');
    GameState.player.flags = GameState.player.flags || {};
    GameState.player.flags.mapViewed = true;
  },
  showReason(zoneName, reasons){
    const msg = `${zoneName} is locked.\n${(reasons.length? reasons.join('\n') : 'Meet level/quest/item requirements')}`;
    const modal = document.querySelector('#screen-message');
    if (modal){
      import('./renderer.js').then(r => r.showModalMessage(msg));
    } else {
      alert(msg);
    }
  },
  travelToZone(zoneKey){
    const p = GameState.player;
    if (!p) return;
    // Short travel animation/delay
    const panel = document.querySelector('.world-map-panel');
    if (panel){ panel.classList.add('traveling'); }
    playSoundZoneTransition();
    setTimeout(() => {
      if (panel){ panel.classList.remove('traveling'); }
      // Set background, apply zone effects, and start an encounter or show town
      setBackground(zoneKey);
      GameState.player.currentZone = zoneKey;
      GameState.player.flags.lastVisitedZone = zoneKey;
      // Apply zone start effects via battle system when starting battle; here we can also set ambience
      playAmbience(zoneKey);
      // Start a standard battle for now; later can branch to zone content
      const pick = getZoneEnemyPicker(zoneKey);
      const enemy = pick(p.level);
      Battle.startBattle(enemy, zoneKey);
    }, 900);
  }
};

// Convenience export to open the world map screen from other modules
export function openWorldMap(){
  WorldMapUI.show();
}
