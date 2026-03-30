/* audio.js - Web Audio API oscillator-based sound effects */
var Audio = (function () {

  var ctx = null;
  var enabled = true;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    return ctx;
  }

  function playTone(freq, duration, type, volume) {
    if (!enabled) return;
    var c = getCtx();
    if (!c) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.value = volume || 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  function playSequence(notes) {
    if (!enabled) return;
    var c = getCtx();
    if (!c) return;
    var time = c.currentTime;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = n.type || "square";
      osc.frequency.value = n.freq;
      gain.gain.value = n.volume || 0.08;
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(time);
      osc.stop(time + n.duration);
      time += n.duration * 0.9;
    }
  }

  var presets = {
    swordHit: function () { playTone(200, 0.1, "sawtooth", 0.06); },
    enemyHit: function () { playTone(150, 0.12, "sawtooth", 0.07); },
    potionDrink: function () { playSequence([{ freq: 400, duration: 0.08 }, { freq: 600, duration: 0.08 }, { freq: 800, duration: 0.12 }]); },
    heal: function () { playSequence([{ freq: 523, duration: 0.1, type: "sine" }, { freq: 659, duration: 0.1, type: "sine" }, { freq: 784, duration: 0.15, type: "sine" }]); },
    levelUp: function () { playSequence([{ freq: 523, duration: 0.1 }, { freq: 659, duration: 0.1 }, { freq: 784, duration: 0.1 }, { freq: 1047, duration: 0.2 }]); },
    victory: function () { playSequence([{ freq: 523, duration: 0.12 }, { freq: 659, duration: 0.12 }, { freq: 784, duration: 0.2 }]); },
    defeat: function () { playSequence([{ freq: 300, duration: 0.2, type: "sawtooth" }, { freq: 200, duration: 0.3, type: "sawtooth" }]); },
    buttonClick: function () { playTone(600, 0.04, "square", 0.04); },
    shopBuy: function () { playSequence([{ freq: 800, duration: 0.06 }, { freq: 1000, duration: 0.08 }]); },
    questComplete: function () { playSequence([{ freq: 523, duration: 0.1, type: "sine" }, { freq: 784, duration: 0.1, type: "sine" }, { freq: 1047, duration: 0.2, type: "sine" }]); },
    runAway: function () { playSequence([{ freq: 400, duration: 0.08 }, { freq: 300, duration: 0.08 }, { freq: 200, duration: 0.1 }]); },
    statusPoison: function () { playTone(180, 0.15, "sawtooth", 0.05); },
    statusStun: function () { playTone(100, 0.2, "square", 0.06); },
    miss: function () { playTone(350, 0.06, "sine", 0.04); },
    magicCast: function () { playSequence([{ freq: 600, duration: 0.08, type: "sine" }, { freq: 900, duration: 0.12, type: "sine" }]); },
    dialogueOpen: function () { playTone(500, 0.06, "sine", 0.04); },
    error: function () { playSequence([{ freq: 200, duration: 0.1, type: "square" }, { freq: 150, duration: 0.15, type: "square" }]); }
  };

  function play(name) {
    if (presets[name]) presets[name]();
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  function isEnabled() { return enabled; }

  return {
    play: play,
    toggle: toggle,
    isEnabled: isEnabled
  };
})();
