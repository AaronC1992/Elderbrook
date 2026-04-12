/* voice.js - ElevenLabs text-to-speech for dialogue */
var _NativeAudio = window.Audio; // capture before audio.js overwrites it
var Voice = (function () {

  var apiKey = "";
  var enabled = true;
  var currentAudio = null;
  var cache = {}; // text hash -> audio blob URL
  var onEndedCallback = null;
  var DB_NAME = 'elderbrook_voice_cache';
  var DB_STORE = 'audio';
  var db = null;

  /* ── IndexedDB persistent cache ── */
  function openDB(cb) {
    if (db) { if (cb) cb(db); return; }
    var req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = function (e) {
      e.target.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = function (e) {
      db = e.target.result;
      if (cb) cb(db);
    };
    req.onerror = function () { if (cb) cb(null); };
  }

  function dbGet(key, cb) {
    openDB(function (d) {
      if (!d) { cb(null); return; }
      try {
        var tx = d.transaction(DB_STORE, 'readonly');
        var req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = function () { cb(req.result || null); };
        req.onerror = function () { cb(null); };
      } catch (e) { cb(null); }
    });
  }

  function dbPut(key, blob) {
    openDB(function (d) {
      if (!d) return;
      try {
        var tx = d.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(blob, key);
      } catch (e) {}
    });
  }

  var voiceMap = {
    rowan:    "JBFqnCBsd6RMkjVDRZzb", // George – Warm, Captivating Storyteller
    bram:     "IKne3meq5aSn9XLyUdCD", // Charlie – Deep, Confident
    harlan:   "nPczCjzI2devNBz1zQrb", // Brian – Deep, Resonant
    mira:     "EXAVITQu4vr4xnSDxMaL", // Sarah – Mature, Reassuring
    toma:     "bIHbv24MWmeRgasZH58o", // Will – Relaxed Optimist
    elric:    "pNInz6obpgDQGcFmaJgB", // Adam – Dominant, Commanding
    elira:    "FGY2WhTYpPnrIDTdsKH5", // Laura – Quirky, Sassy
    grisk:    "N2lVS1w4EtoT3dr4eOWO", // Callum – Husky Trickster
    merchant: "iP95p4xoKVk53GoZ742B", // Chris – Charming, Down-to-Earth
    fauna:    "cgSgspJ2msm6clMCkdW9", // Jessica – Playful, Warm
    selene:   "hpp4J3VqNfWAUOO0d1Us", // Bella – Professional, Warm
    varn:     "TX3LPaxmHKxFdv7VOQHJ", // Liam – Energetic, Confident
    shade:    "CwhRBWXzGAHq8TQ4Fs17", // Roger – Laid-Back, Casual
    theron:   "pqHfZKP75CvOlQylNhV4", // Bill – Wise, Mature
    lysara:   "Xb7hH8MSUJpSbSDYk0k2", // Alice – Clear, British
    grul:     "SOYHLrjzK2X1ezoPC6cr", // Harry – Fierce Warrior
    whisper:  "SAz9YHcvj6GT2YYXdXww", // River – Neutral, Calm
    fenn:     "onwK4e9ZLuTAKqWW03F9", // Daniel – Steady, Formal
    cindra:   "XrExE9yKIg1WjnnlVkGX", // Matilda – Knowledgable
    maren:    "pFZP5JQG7iQjIQuC4Bku", // Lily – Velvety, Gentle
    cedric:   "cjVigY5qzO86Huf0OWal", // Eric – Smooth, Trustworthy
    villager: "EXAVITQu4vr4xnSDxMaL", // Sarah – Female Villager
    _default: "onwK4e9ZLuTAKqWW03F9"  // Daniel – Steady Narrator fallback
  };

  function init(key) {
    if (key) apiKey = key;
    // Load saved API key from localStorage
    if (!apiKey) {
      try { apiKey = localStorage.getItem("elderbrook_xi_key") || ""; } catch (e) {}
    }
    // Load enabled preference (default is on)
    try {
      var saved = localStorage.getItem("elderbrook_voice_enabled");
      if (saved !== null) enabled = saved === "true";
    } catch (e) {}
    // Open IndexedDB cache early
    openDB(function () {});
  }

  function setApiKey(key) {
    apiKey = key || "";
    try { localStorage.setItem("elderbrook_xi_key", apiKey); } catch (e) {}
  }

  function getApiKey() {
    return apiKey;
  }

  function setEnabled(on) {
    enabled = !!on;
    try { localStorage.setItem("elderbrook_voice_enabled", String(enabled)); } catch (e) {}
    if (!enabled) stop();
  }

  function isEnabled() {
    return enabled && !!apiKey;
  }

  function getVoiceId(speakerName) {
    // Try to match speaker name to NPC key
    if (!speakerName) return voiceMap._default;
    var lower = speakerName.toLowerCase();
    // Direct key match
    if (voiceMap[lower] !== undefined && voiceMap[lower]) return voiceMap[lower];
    // Partial match (e.g. "Guildmaster Rowan" -> check if any key is in the name)
    for (var key in voiceMap) {
      if (key === "_default") continue;
      if (voiceMap[key] && lower.indexOf(key) !== -1) return voiceMap[key];
    }
    return voiceMap._default || "";
  }

  function hashText(text) {
    var hash = 0;
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  function fetchAudio(voiceId, text, cb) {
    var cacheKey = voiceId + "_" + hashText(text);

    // 1. In-memory cache (instant)
    if (cache[cacheKey]) { cb(cache[cacheKey]); return; }

    // 2. IndexedDB cache (no API hit)
    dbGet(cacheKey, function (blob) {
      if (blob) {
        var blobUrl = URL.createObjectURL(blob);
        cache[cacheKey] = blobUrl;
        cb(blobUrl);
        return;
      }

      // 3. Fetch from API
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId);
      xhr.setRequestHeader("xi-api-key", apiKey);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.responseType = "blob";

      xhr.onload = function () {
        if (xhr.status === 200) {
          dbPut(cacheKey, xhr.response); // persist raw blob
          var blobUrl = URL.createObjectURL(xhr.response);
          cache[cacheKey] = blobUrl;
          cb(blobUrl);
        }
      };

      xhr.send(JSON.stringify({
        text: text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }));
    });
  }

  function speak(text, speakerName) {
    if (!enabled || !apiKey) return;
    var voiceId = getVoiceId(speakerName);
    if (!voiceId) return;

    stop();

    fetchAudio(voiceId, text, function (blobUrl) {
      playBlob(blobUrl);
    });
  }

  /* Pre-fetch audio for upcoming lines so they play instantly */
  function prefetch(text, speakerName) {
    if (!enabled || !apiKey) return;
    var voiceId = getVoiceId(speakerName);
    if (!voiceId) return;
    var cacheKey = voiceId + "_" + hashText(text);
    if (cache[cacheKey]) return; // already cached in memory
    fetchAudio(voiceId, text, function () {}); // fetch silently
  }

  function playBlob(blobUrl) {
    stop();
    currentAudio = new _NativeAudio(blobUrl);
    currentAudio.onended = function () {
      currentAudio = null;
      if (onEndedCallback) {
        var cb = onEndedCallback;
        onEndedCallback = null;
        cb();
      }
    };
    currentAudio.play().catch(function () {});
  }

  function stop() {
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    onEndedCallback = null;
  }

  function setVoice(npcKey, voiceId) {
    voiceMap[npcKey] = voiceId;
  }

  function getVoiceMap() {
    return voiceMap;
  }

  return {
    init: init,
    setApiKey: setApiKey,
    getApiKey: getApiKey,
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    speak: speak,
    prefetch: prefetch,
    stop: stop,
    onEnded: function (cb) { onEndedCallback = cb; },
    isPlaying: function () { return !!currentAudio; },
    setVoice: setVoice,
    getVoiceMap: getVoiceMap
  };
})();
