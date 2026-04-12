/* voice.js - ElevenLabs text-to-speech for dialogue */
var Voice = (function () {

  var apiKey = "";
  var enabled = true;
  var currentAudio = null;
  var cache = {}; // text hash -> audio blob URL

  // Map NPC keys to ElevenLabs voice IDs
  // Replace these with your actual ElevenLabs voice IDs
  var voiceMap = {
    rowan:    "", // Guildmaster Rowan
    bram:     "", // Bram Ironhand
    harlan:   "", // Harlan Stonevein
    mira:     "", // Mira Voss
    toma:     "", // Toma Reed
    elric:    "", // Captain Elric Vale
    elira:    "", // Elira Ashfen
    grisk:    "", // Goblin Chief Grisk
    merchant: "", // Traveling Merchant
    fauna:    "", // Fauna (Pet Shop)
    selene:   "", // Selene Ashford (Innkeeper)
    varn:     "", // Varn the Ironclad
    shade:    "", // Shade
    theron:   "", // Sage Theron
    lysara:   "", // Dame Lysara
    grul:     "", // Grul
    whisper:  "", // Whisper
    fenn:     "", // Warden Fenn
    cindra:   "", // Cindra
    maren:    "", // Sister Maren
    cedric:   "", // Sir Cedric
    _default: ""  // Fallback voice for unknown speakers
  };

  function init(key) {
    if (key) apiKey = key;
    // Try to load saved key
    if (!apiKey) {
      try { apiKey = localStorage.getItem("elderbrook_xi_key") || ""; } catch (e) {}
    }
    // Load enabled preference
    try {
      var saved = localStorage.getItem("elderbrook_voice_enabled");
      if (saved !== null) enabled = saved === "true";
    } catch (e) {}
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

  function speak(text, speakerName) {
    if (!enabled || !apiKey) return;
    var voiceId = getVoiceId(speakerName);
    if (!voiceId) return;

    stop();

    // Check cache
    var cacheKey = voiceId + "_" + hashText(text);
    if (cache[cacheKey]) {
      playBlob(cache[cacheKey]);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId);
    xhr.setRequestHeader("xi-api-key", apiKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "blob";

    xhr.onload = function () {
      if (xhr.status === 200) {
        var blobUrl = URL.createObjectURL(xhr.response);
        cache[cacheKey] = blobUrl;
        playBlob(blobUrl);
      }
    };

    xhr.send(JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    }));
  }

  function playBlob(blobUrl) {
    stop();
    currentAudio = new window.Audio(blobUrl);
    currentAudio.play().catch(function () {});
  }

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
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
    stop: stop,
    setVoice: setVoice,
    getVoiceMap: getVoiceMap
  };
})();
