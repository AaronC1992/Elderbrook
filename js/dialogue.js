/* dialogue.js - Branching dialogue system with portraits and choices */
var Dialogue = (function () {

  var currentDialogue = null;
  var currentNode = 0;
  var onEndCallback = null;

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
    html += '<div class="dialogue-text">' + node.text + '</div>';

    // Choices or continue button
    if (node.choices && node.choices.length > 0) {
      html += '<div class="dialogue-choices">';
      for (var i = 0; i < node.choices.length; i++) {
        html += '<button class="btn dialogue-choice-btn" data-action="dialogue-choice" data-choice="' + i + '">' + node.choices[i].text + '</button>';
      }
      html += '</div>';
    } else {
      var isLast = currentNode >= currentDialogue.nodes.length - 1;
      html += '<button class="btn dialogue-continue-btn" data-action="dialogue-continue">' + (isLast ? "Close" : "Continue") + '</button>';
    }

    container.innerHTML = html;
  }

  function advance() {
    if (!currentDialogue) return;
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
    if (currentDialogue && currentDialogue.onEnd) {
      var actions = currentDialogue.onEnd;
      if (actions.flags) Player.setFlags(actions.flags);
      if (actions.giveQuest) Quests.accept(actions.giveQuest);
      if (actions.giveItems) {
        for (var i = 0; i < actions.giveItems.length; i++) {
          Player.addItem(actions.giveItems[i]);
        }
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

  return {
    start: start,
    advance: advance,
    choose: choose,
    end: end,
    isActive: isActive
  };
})();
