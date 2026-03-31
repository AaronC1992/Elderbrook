/* dialogue.js - Branching dialogue system with portraits and choices */
var Dialogue = (function () {

  var currentDialogue = null;
  var currentNode = 0;
  var onEndCallback = null;
  var typewriterTimer = null;
  var typewriterDone = false;

  var SPEED_MAP = { slow: 60, normal: 30, fast: 10, instant: 0 };

  function start(dialogueId, callback) {
    var data = Chapter1.getDialogue(dialogueId);
    if (!data) return false;

    // If it's a random-line type (NPC idle chatter), pick one and show it briefly
    if (data.lines) {
      var randomLine = data.lines[Math.floor(Math.random() * data.lines.length)];
      currentDialogue = {
        nodes: [{ speaker: "", portrait: "", text: randomLine }],
        onEnd: null
      };
      currentNode = 0;
      onEndCallback = callback || null;
      render();
      UI.showScreen("dialogue");
      return true;
    }

    currentDialogue = data;
    currentNode = 0;
    onEndCallback = callback || null;
    render();
    UI.showScreen("dialogue");
    return true;
  }

  function render() {
    if (!currentDialogue || !currentDialogue.nodes) return;
    var node = currentDialogue.nodes[currentNode];
    if (!node) return;

    var container = document.getElementById("dialogue-content");
    if (!container) return;

    var html = "";

    // Portrait and speaker
    if (node.portrait) {
      html += '<div class="dialogue-portrait-wrap">';
      html += '<img class="dialogue-portrait" src="' + node.portrait + '" alt="' + (node.speaker || '') + '" onerror="this.style.display=\'none\'">';
      html += '</div>';
    }
    if (node.speaker) {
      html += '<div class="dialogue-speaker">' + node.speaker + '</div>';
    }
    html += '<div class="dialogue-text" id="dialogue-typewriter"></div>';

    // Choices or continue button
    if (node.choices && node.choices.length > 0) {
      html += '<div class="dialogue-choices" id="dialogue-choices-wrap" style="display:none">';
      for (var i = 0; i < node.choices.length; i++) {
        html += '<button class="btn dialogue-choice-btn" data-action="dialogue-choice" data-choice="' + i + '">' + node.choices[i].text + '</button>';
      }
      html += '</div>';
    } else {
      var isLast = currentNode >= currentDialogue.nodes.length - 1 || node.end;
      html += '<div id="dialogue-continue-wrap" style="display:none">';
      html += '<button class="btn dialogue-continue-btn" data-action="dialogue-continue">' + (isLast ? "Close" : "Continue") + '</button>';
      html += '</div>';
    }

    // Skip button
    html += '<button class="btn btn-secondary dialogue-skip-btn" data-action="dialogue-skip">Skip</button>';

    container.innerHTML = html;
    startTypewriter(node.text);
  }

  function advance() {
    if (!currentDialogue) return;
    var node = currentDialogue.nodes[currentNode];
    if (node && node.end) {
      end();
      return;
    }
    currentNode++;
    if (currentNode >= currentDialogue.nodes.length) {
      end();
    } else {
      render();
    }
  }

  function choose(choiceIndex) {
    if (!currentDialogue) return;
    var node = currentDialogue.nodes[currentNode];
    if (!node || !node.choices || !node.choices[choiceIndex]) return;

    var choice = node.choices[choiceIndex];

    // Track choice consequence
    if (currentDialogue.id) {
      Player.recordChoice(currentDialogue.id + '_node' + currentNode, choiceIndex);
    }

    // Set flags from choice
    if (choice.flags) Player.setFlags(choice.flags);

    // Navigate to target node
    if (typeof choice.next === "number") {
      currentNode = choice.next;
      render();
    } else {
      end();
    }
  }

  function end() {
    stopTypewriter();
    if (currentDialogue && currentDialogue.onEnd) {
      var actions = currentDialogue.onEnd;
      if (actions.flags) Player.setFlags(actions.flags);
      if (actions.giveQuest) Quests.accept(actions.giveQuest);
      if (actions.giveItems) {
        for (var i = 0; i < actions.giveItems.length; i++) {
          Player.addItem(actions.giveItems[i]);
        }
      }
      if (actions.addAffinity && typeof Relationships !== 'undefined') {
        Relationships.addAffinity(actions.addAffinity.npc, actions.addAffinity.amount);
      }
    }

    var cb = onEndCallback;
    currentDialogue = null;
    currentNode = 0;
    onEndCallback = null;

    if (cb) cb();
  }

  function isActive() {
    return currentDialogue !== null;
  }

  function startDirect(data, callback) {
    currentDialogue = data;
    currentNode = 0;
    onEndCallback = callback || null;
    render();
    UI.showScreen("dialogue");
    return true;
  }

  function startTypewriter(text) {
    stopTypewriter();
    typewriterDone = false;
    var el = document.getElementById('dialogue-typewriter');
    if (!el) return;

    var p = Player.get();
    var speed = SPEED_MAP[(p && p.settings && p.settings.textSpeed) || 'normal'];

    if (speed === 0) {
      el.textContent = text;
      onTypewriterDone();
      return;
    }

    var idx = 0;
    el.textContent = '';
    typewriterTimer = setInterval(function () {
      idx++;
      el.textContent = text.substring(0, idx);
      if (idx >= text.length) {
        onTypewriterDone();
      }
    }, speed);
  }

  function stopTypewriter() {
    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }

  function onTypewriterDone() {
    stopTypewriter();
    typewriterDone = true;
    var choices = document.getElementById('dialogue-choices-wrap');
    var cont = document.getElementById('dialogue-continue-wrap');
    if (choices) choices.style.display = '';
    if (cont) cont.style.display = '';
  }

  function skipText() {
    if (!typewriterDone) {
      // Finish the current text instantly
      stopTypewriter();
      var node = currentDialogue && currentDialogue.nodes[currentNode];
      var el = document.getElementById('dialogue-typewriter');
      if (node && el) el.textContent = node.text;
      onTypewriterDone();
    } else {
      // Already done — advance or end
      advance();
    }
  }

  return {
    start: start,
    startDirect: startDirect,
    advance: advance,
    choose: choose,
    end: end,
    isActive: isActive,
    skipText: skipText
  };
})();
