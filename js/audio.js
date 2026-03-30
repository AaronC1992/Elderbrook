/* audio.js - Sound effects and ambient audio */
var Audio = (function () {
  var enabled = true;
  var volume = 0.4;
  var sounds = {};
  var currentMusic = null;
  var musicVolume = 0.2;

  // Define sound effects using Web Audio API oscillator tones (no external files needed)
  var ctx = null;

  function getContext() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        enabled = false;
      }
    }
    return ctx;
  }

  function playTone(freq, duration, type, vol) {
    if (!enabled) return;
    var c = getContext();
    if (!c) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.value = (vol || volume) * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  function playSequence(notes, tempo) {
    if (!enabled) return;
    var delay = 0;
    for (var i = 0; i < notes.length; i++) {
      (function (note, d) {
        setTimeout(function () {
          playTone(note.freq, note.dur || 0.15, note.type || "square", note.vol);
        }, d);
      })(notes[i], delay);
      delay += (tempo || 120);
    }
  }

  // --- Sound Effect Presets ---
  function swordHit() {
    playTone(200, 0.08, "sawtooth", 0.5);
    setTimeout(function () { playTone(150, 0.06, "sawtooth", 0.3); }, 40);
  }

  function enemyHit() {
    playTone(120, 0.1, "sawtooth", 0.4);
    setTimeout(function () { playTone(80, 0.08, "sawtooth", 0.2); }, 50);
  }

  function potionDrink() {
    playSequence([
      { freq: 400, dur: 0.1, type: "sine" },
      { freq: 500, dur: 0.1, type: "sine" },
      { freq: 600, dur: 0.15, type: "sine" }
    ], 80);
  }

  function heal() {
    playSequence([
      { freq: 523, dur: 0.12, type: "sine" },
      { freq: 659, dur: 0.12, type: "sine" },
      { freq: 784, dur: 0.2, type: "sine" }
    ], 100);
  }

  function levelUp() {
    playSequence([
      { freq: 523, dur: 0.15, type: "square" },
      { freq: 659, dur: 0.15, type: "square" },
      { freq: 784, dur: 0.15, type: "square" },
      { freq: 1047, dur: 0.3, type: "square" }
    ], 150);
  }

  function victory() {
    playSequence([
      { freq: 523, dur: 0.15, type: "square" },
      { freq: 659, dur: 0.15, type: "square" },
      { freq: 784, dur: 0.15, type: "square" },
      { freq: 659, dur: 0.1, type: "square" },
      { freq: 784, dur: 0.1, type: "square" },
      { freq: 1047, dur: 0.35, type: "square" }
    ], 130);
  }

  function defeat() {
    playSequence([
      { freq: 300, dur: 0.2, type: "sawtooth" },
      { freq: 250, dur: 0.2, type: "sawtooth" },
      { freq: 200, dur: 0.3, type: "sawtooth" },
      { freq: 150, dur: 0.5, type: "sawtooth" }
    ], 200);
  }

  function buttonClick() {
    playTone(800, 0.04, "square", 0.15);
  }

  function shopBuy() {
    playSequence([
      { freq: 600, dur: 0.06, type: "sine" },
      { freq: 800, dur: 0.08, type: "sine" }
    ], 60);
  }

  function questComplete() {
    playSequence([
      { freq: 440, dur: 0.12, type: "square" },
      { freq: 554, dur: 0.12, type: "square" },
      { freq: 659, dur: 0.12, type: "square" },
      { freq: 880, dur: 0.25, type: "square" }
    ], 120);
  }

  function runAway() {
    playSequence([
      { freq: 400, dur: 0.08, type: "square" },
      { freq: 350, dur: 0.08, type: "square" },
      { freq: 300, dur: 0.08, type: "square" }
    ], 70);
  }

  function statusPoison() {
    playTone(180, 0.15, "sawtooth", 0.25);
  }

  function statusStun() {
    playSequence([
      { freq: 1200, dur: 0.05, type: "sine", vol: 0.3 },
      { freq: 1000, dur: 0.05, type: "sine", vol: 0.2 },
      { freq: 800, dur: 0.05, type: "sine", vol: 0.1 }
    ], 50);
  }

  function miss() {
    playTone(250, 0.06, "triangle", 0.2);
  }

  function areaUnlock() {
    playSequence([
      { freq: 440, dur: 0.15, type: "square" },
      { freq: 554, dur: 0.15, type: "square" },
      { freq: 659, dur: 0.15, type: "square" },
      { freq: 880, dur: 0.3, type: "square" },
      { freq: 1047, dur: 0.4, type: "square" }
    ], 140);
  }

  function finalVictory() {
    playSequence([
      { freq: 523, dur: 0.2, type: "square" },
      { freq: 659, dur: 0.2, type: "square" },
      { freq: 784, dur: 0.2, type: "square" },
      { freq: 1047, dur: 0.3, type: "square" },
      { freq: 784, dur: 0.15, type: "sine" },
      { freq: 1047, dur: 0.15, type: "sine" },
      { freq: 1319, dur: 0.15, type: "sine" },
      { freq: 1568, dur: 0.5, type: "sine" }
    ], 160);
  }

  function magicCast() {
    playSequence([
      { freq: 800, dur: 0.08, type: "sine", vol: 0.3 },
      { freq: 1000, dur: 0.08, type: "sine", vol: 0.25 },
      { freq: 1200, dur: 0.12, type: "sine", vol: 0.2 }
    ], 60);
  }

  function setEnabled(val) {
    enabled = !!val;
  }

  function isEnabled() {
    return enabled;
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  return {
    swordHit: swordHit,
    enemyHit: enemyHit,
    potionDrink: potionDrink,
    heal: heal,
    levelUp: levelUp,
    victory: victory,
    defeat: defeat,
    buttonClick: buttonClick,
    shopBuy: shopBuy,
    questComplete: questComplete,
    runAway: runAway,
    statusPoison: statusPoison,
    statusStun: statusStun,
    miss: miss,
    areaUnlock: areaUnlock,
    finalVictory: finalVictory,
    magicCast: magicCast,
    toggle: toggle,
    isEnabled: isEnabled,
    setEnabled: setEnabled
  };
})();
