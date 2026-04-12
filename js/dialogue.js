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
      // During festival, try festival-specific idle lines first
      var lines = data.lines;
      if (typeof Player !== 'undefined' && Player.isFestivalActive()) {
        var festivalData = Chapter1.getDialogue(dialogueId + "-festival");
        if (festivalData && festivalData.lines) {
          lines = festivalData.lines;
        }
      }
      var randomLine = lines[Math.floor(Math.random() * lines.length)];
      // Resolve NPC speaker/portrait from dialogue ID (e.g. "mira-idle" → "mira")
      var speakerName = "";
      var speakerPortrait = "";
      var npcKey = dialogueId.replace(/-idle$/, "");
      if (npcKey !== dialogueId) {
        var npc = Chapter1.getNPC(npcKey);
        if (npc) {
          speakerName = npc.name || "";
          speakerPortrait = npc.portrait || "";
        }
      }
      currentDialogue = {
        nodes: [{ speaker: speakerName, portrait: speakerPortrait, text: randomLine }],
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

    // Full portrait in the portrait area (visual novel style)
    var portraitArea = document.getElementById("dialogue-portrait-area");
    if (portraitArea) {
      if (node.portrait) {
        portraitArea.innerHTML = '<img class="dialogue-portrait portrait-bust-crop" src="' + node.portrait + '" alt="' + (node.speaker || '') + '" onerror="this.style.display=\'none\'">';
      } else {
        portraitArea.innerHTML = '';
      }
    }

    // Speaker name tag (floating above the box)
    if (node.speaker) {
      html += '<div class="dialogue-speaker-tag">' + node.speaker + '</div>';
    }

    // Text body
    html += '<div class="dialogue-text-body">';
    html += '<div class="dialogue-text" id="dialogue-typewriter"></div>';

    // Choices or continue button + skip
    html += '<div class="dialogue-bottom-row">';
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
    html += '<button class="btn btn-secondary dialogue-skip-btn" data-action="dialogue-skip">Skip</button>';
    html += '</div>';
    html += '</div>'; /* close dialogue-text-body */

    container.innerHTML = html;
    startTypewriter(node.text);

    // Auto-play voice for this dialogue line
    if (typeof Voice !== 'undefined' && Voice.isEnabled()) {
      Voice.speak(node.text, node.speaker);
      // Auto-advance when voice finishes (skip if choices present)
      if (!node.choices || node.choices.length === 0) {
        Voice.onEnded(function () {
          if (currentDialogue && currentDialogue.nodes[currentNode] === node) {
            advance();
          }
        });
      }
      // Pre-fetch the next line so it plays instantly
      var nextIdx = (typeof node.next === "number") ? node.next : currentNode + 1;
      var nextNode = currentDialogue.nodes[nextIdx];
      if (nextNode && nextNode.text) {
        Voice.prefetch(nextNode.text, nextNode.speaker);
      }
    }
  }

  function advance() {
    if (!currentDialogue) return;
    var node = currentDialogue.nodes[currentNode];
    if (node && node.end) {
      end();
      return;
    }
    if (typeof node.next === "number") {
      currentNode = node.next;
    } else {
      currentNode++;
    }
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

    // Give items from choice
    if (choice.giveItems) {
      for (var k = 0; k < choice.giveItems.length; k++) {
        Player.addItem(choice.giveItems[k]);
      }
    }

    // Grant quest from choice
    if (choice.giveQuest || choice.quest) {
      Quests.accept(choice.giveQuest || choice.quest);
    }

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
    if (typeof Voice !== 'undefined') Voice.stop();
    if (currentDialogue && currentDialogue.onEnd) {
      var actions = currentDialogue.onEnd;
      if (actions.flags) Player.setFlags(actions.flags);
      if (actions.giveQuest || actions.quest) Quests.accept(actions.giveQuest || actions.quest);
      if (actions.giveItems) {
        for (var i = 0; i < actions.giveItems.length; i++) {
          Player.addItem(actions.giveItems[i]);
        }
      }
      if (actions.addAffinity && typeof Relationships !== 'undefined') {
        Relationships.addAffinity(actions.addAffinity.npc, actions.addAffinity.amount);
      }
      if (actions.buildClass) {
        var pb = Player.get();
        var classDef = Player.CLASS_DEFS[actions.buildClass];
        if (pb.buildClass && Player.CLASS_DEFS[pb.buildClass]) {
          var oldSkill = Player.CLASS_DEFS[pb.buildClass].skill;
          if (oldSkill && pb.learnedSkills) {
            var osi = pb.learnedSkills.indexOf(oldSkill);
            if (osi > -1) pb.learnedSkills.splice(osi, 1);
          }
        }
        pb.buildClass = actions.buildClass;
        Player.setFlag('choseBuild');
        if (classDef && classDef.unlockFlag) Player.setFlag(classDef.unlockFlag);
        if (classDef && classDef.skill) {
          if (!pb.learnedSkills) pb.learnedSkills = [];
          if (pb.learnedSkills.indexOf(classDef.skill) === -1) pb.learnedSkills.push(classDef.skill);
        }
        Player.recalcStats();
        Audio.play('achievement');
        var cName = classDef ? classDef.name : actions.buildClass;
        var skillDef = classDef && classDef.skill ? Skills.get(classDef.skill) : null;
        UI.showMessage('You chose the ' + cName + ' path! Learned skill: ' + (skillDef ? skillDef.name : '') + '.');
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
