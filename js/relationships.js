/* relationships.js - Relationship building, gift-giving, and dating system */
var Relationships = (function () {

  /* â”€â”€ Relationship Level Thresholds â”€â”€ */
  var LEVELS = [
    { name: "Stranger",          min: 0 },
    { name: "Acquaintance",      min: 15 },
    { name: "Friend",            min: 35 },
    { name: "Close Friend",      min: 55 },
    { name: "Romantic Partner",   min: 75 }
  ];

  var MILESTONES = [15, 35, 55, 75];
  var MAX_AFFINITY = 100;

  /* â”€â”€ NPC Relationship Config â”€â”€ */
  var config = {
    mira: {
      name: "Mira Voss",
      portrait: "assets/portraits/mira.png",
      lovedGifts: ["wildflowers", "herbal-tea", "cave-herb"],
      likedGifts: ["moonstone", "health-potion", "mana-potion"],
      dislikedGifts: ["iron-ingot", "fine-leather"],
      bonus: { intelligence: 2 },
      preferredClass: "mage",
      chatLines: [
        "I've been experimenting with a new kind of salve. It smells terrible, but it works wonders on burns!",
        "Did you know cave herbs glow faintly under moonlight? I find it absolutely fascinating.",
        "Sometimes I wonder what plants grow beyond the frontier. There's so much left to discover.",
        "My mother was an herbalist too. She taught me that every plant has a story to tell.",
        "You're easy to talk to, you know that? Most adventurers just want their potions and leave.",
        "I nearly blew up my workshop last week trying a new mixture. Don't worry, I replaced the wall.",
        "The wildflowers near the river are blooming early this year. I wonder what's changed in the soil.",
        "I've been cataloguing every herb within a day's walk of town. I'm up to forty-seven varieties.",
        "Rowan keeps asking me to make something for his back pain. I keep telling him to stop lifting barrels.",
        "There's a certain peace in grinding herbs. Repetitive, yes, but meditative.",
        "I labeled all my potions after the last mix-up. Harlan was NOT happy about the hair growth tonic.",
        "I told Bram I could make fireproof coating for his gloves. He asked how many workshops I'd destroyed testing it. Rude. Accurate, but rude.",
        "A customer asked if my health potion had any side effects. I said 'continued living.' He didn't tip.",
        "I keep a journal of every failed experiment. It's my thickest book. I prefer to think of it as thorough research."
      ],
      contextualLines: {
        chapterEndPrepared: "You told Rowan we all need to be ready. That's wise. I've been stockpiling extra supplies because of it.",
        completedMQ3: "I heard you cleared that goblin camp. Please tell me you didn't get poisoned. Let me check your eyes.",
        elricJoinedMQ4: "Elric went with you? He hasn't left the guard post in months. You must have made quite an impression on him.",
        completedMQ4: "The trail sounds horrible. Please come see me if you have any wounds that need treating. Both of you.",
        completedMQ5: "The things you've told me about the deeper caves... I need to study those fungal samples.",
        completedMQ7: "You and Elric took down the goblin chief together? The whole town is talking about it. Even Harlan cracked a smile.",
        completedMQ8: "After everything that's happened, I want you to know: Elderbrook is safer because of you."
      },
      giftReactions: {
        loved: [
          "Oh! These are beautiful! How did you know I love these?",
          "You really do pay attention, don't you? Thank you so much!",
          "This is perfect for my research! You're too kind."
        ],
        liked: [
          "That's very thoughtful of you. Thank you!",
          "How sweet! I appreciate it."
        ],
        neutral: [
          "Oh, for me? Thank you, that's nice.",
          "That's... interesting! I'll find a use for it."
        ],
        disliked: [
          "Oh... iron? That's more Bram's thing. But, um, thanks.",
          "I appreciate the thought, but this isn't really my area."
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "You know, most people in Elderbrook only come to me when they need healing. It's nice to have someone who visits just to talk." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "I moved here from the southern provinces three years ago. The herbs here are unlike anything I'd seen before." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "I'm glad you came to Elderbrook. It feels a little less lonely now." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Can I tell you something? When I first came here, nobody trusted me. An outsider mixing strange potions? They were terrified." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Rowan was the first to give me a chance. And now you. I don't take that lightly." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "I consider you a real friend. I hope that's okay to say." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "I've been meaning to tell you... My mother died because the village healer didn't have the right medicine." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "That's why I became an alchemist. I swore I'd never let someone go without the remedy they needed." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Having you around makes me feel like maybe I can actually make a difference here. Thank you for believing in me." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "I've been trying to say this for a while now, but I keep losing my nerve..." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "When you walk into my shop, my heart races and I forget what I was doing. Every time." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "I think... I think I have feelings for you. And I hope I'm not imagining that you feel it too." },
            {
              speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Do you... feel the same way?",
              choices: [
                { text: "I do, Mira. I have for a while.", next: 4, flags: ["miraRomantic"] },
                { text: "I care about you, but as a friend.", next: 6 }
              ]
            },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Really? You do? I... I was so nervous to say anything." },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Then let's see where this goes. Together.", end: true },
            { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Oh... I understand. I value our friendship more than anything. Let's not let this change things between us." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "A walk by the river? I'd love that! Let me grab my cloak." },
          { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "Look at how the moonlight catches the water. You can see why the herbs here are so potent. The river practically glows." },
          { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "You know, I used to take walks like this alone. Always collecting samples, always working." },
          { speaker: "Mira Voss", portrait: "assets/portraits/mira.png", text: "This is much better. Thank you for tonight." }
        ],
        onEnd: { addAffinity: { npc: "mira", amount: 5 } }
      }
    },

    toma: {
      name: "Toma Reed",
      portrait: "assets/portraits/toma.png",
      lovedGifts: ["sweet-roll", "wildflowers", "old-book"],
      likedGifts: ["herbal-tea", "moonstone"],
      dislikedGifts: ["iron-ingot", "fine-leather"],
      bonus: { dexterity: 2 },
      preferredClass: "rogue",
      chatLines: [
        "I sorted the entire quest board by region today. Nobody noticed, but I feel great about it.",
        "Don't tell anyone, but sometimes I read the quest descriptions and imagine I'm the one going on adventures.",
        "My parents wanted me to be a merchant. I guess alphabetizing job postings is close enough?",
        "You ever wonder what's past the goblin cave? I bet there's a whole world out there waiting.",
        "Thanks for stopping by. It gets quiet here between postings.",
        "I found a quest posting from ten years ago stuck behind the board. Someone wanted help finding a lost cat. I hope they found it.",
        "Sometimes adventurers come back and don't even check off their quests. The filing system only works if you file things!",
        "I tried to learn sword fighting once. Rowan was very polite about how bad I was.",
        "Do you think quests will always need a board? Maybe someday they'll have, I don't know, magical message crystals.",
        "I keep a tally of how many quests get completed each month. This month is a record, thanks to you.",
        "I made a pie chart of quest types. Mostly it's 'kill goblins.' The pie chart was not very exciting. But it was accurate.",
        "Someone posted a quest that just said 'HELP' in huge letters. No details, no reward, no name. I filed it under 'concerning.'",
        "I've started rating the quest handwriting. Yours is... legible. That puts you in the top three.",
        "Rowan told me to take a day off. I organized my desk instead. It's basically the same thing, right?"
      ],
      contextualLines: {
        completedMQ3: "Everyone's talking about what you did at the goblin camp. I may have bragged that I know you personally.",
        elricJoinedMQ4: "The quest board's been buzzing since you and Captain Elric headed out together. People feel braver just hearing about it.",
        completedMQ4: "I had to add a whole new section to the board for Goblin Trail reports. Most of them are about you.",
        completedMQ5: "I pinned your name on the board's 'Top Adventurers' list. Don't worry, I made it official-looking.",
        defeatedGrisk: "I've updated the records three times today. 'Goblin Chief Grisk: DEFEATED.' Feels really good to write.",
        completedMQ8: "I've started a special section on the board just for your accomplishments. It's getting crowded."
      },
      giftReactions: {
        loved: [
          "A sweet roll! You remembered! These are my absolute favorite!",
          "For me? Really? This is so thoughtful, I don't know what to say!",
          "You always know how to make my day better."
        ],
        liked: [
          "Oh, that's really nice of you! Thank you!",
          "I appreciate that, truly."
        ],
        neutral: [
          "That's kind of you. Thanks!",
          "Oh! Well, it's the thought that counts, right?"
        ],
        disliked: [
          "Oh. An iron ingot. That's, uh... heavy. In every sense.",
          "I'm more of a books-and-pastries person, but I appreciate the gesture!"
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "You know, you're the first adventurer who actually talks to me like a person and not just the quest board guy." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I moved to Elderbrook to find some excitement. Turns out I found paperwork instead. But it's growing on me." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I'm glad we're getting to know each other. It means more than you think." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "Can I be honest with you? I applied to be an adventurer once. Failed the physical test. Badly." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "Rowan gave me the clerk job instead. Said every hero needs someone keeping track of things back home." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I used to be embarrassed about it. But you make me feel like my job actually matters." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I've never told anyone this, but when I was young, my village was raided. We lost everything." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "That's why I came here. Elderbrook felt safe. And honestly, meeting you has made it feel like home." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I just wanted you to know that. You're important to me." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I've been rehearsing this all morning. Okay. Here goes..." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "Every time you come to the quest board, my hands start shaking and I can barely read my own handwriting." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I think about you constantly. When you're out there fighting, I worry. When you come back, I'm relieved." },
            {
              speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I guess what I'm saying is... I'm in love with you. Is that okay?",
              choices: [
                { text: "More than okay, Toma. I feel the same.", next: 4, flags: ["tomaRomantic"] },
                { text: "You mean the world to me, but as a friend.", next: 6 }
              ]
            },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "You... really? I didn't think someone like you would ever feel that way about someone like me." },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I promise I'll be worthy of it. Every day.", end: true },
            { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "Oh. I... yeah. Of course. That's fine. I'm fine. Really. Let's just... keep being friends. That's good." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "Wait, you want to have dinner with me? At the inn? Let me just close up the board real quick!" },
          { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "I ordered the stew. I always get the stew. Is that boring? I hope that's not boring." },
          { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "You know what I love about this town? On nights like this, you can hear the crickets over the walls. It's peaceful." },
          { speaker: "Toma Reed", portrait: "assets/portraits/toma.png", text: "This was the best evening I've had in... maybe ever. Thank you." }
        ],
        onEnd: { addAffinity: { npc: "toma", amount: 5 } }
      }
    },

    elira: {
      name: "Elira Ashfen",
      portrait: "assets/portraits/elira.png",
      lovedGifts: ["old-book", "moonstone", "strange-sigil"],
      likedGifts: ["herbal-tea", "silver-ring"],
      dislikedGifts: ["sweet-roll", "iron-ingot"],
      bonus: { intelligence: 1, dexterity: 1 },
      preferredClass: "mage",
      chatLines: [
        "The stars here are different from the ones I grew up under. Brighter, somehow.",
        "I've been studying the goblin markings. They remind me of something I saw in the far north, long ago.",
        "Most people find my silence unsettling. You seem... comfortable with it.",
        "There are ruins beneath this land. Older than the trees. Older than the rivers. I can feel them.",
        "You ask good questions. That's rare in a world full of people who only want answers.",
        "I found a reference to Elderbrook in a text that's over three hundred years old. It was called something different then.",
        "The sigils on the cave walls aren't goblin-made. They're far older. Someone put them there as a warning.",
        "Don't mistake my silence for disinterest. I'm usually thinking. About many things. Including you.",
        "I've been dreaming about the ruins again. The same corridor, the same locked door. It means something.",
        "Knowledge without wisdom is dangerous. I've seen it destroy people. I try to remember that every day.",
        "I realize I say 'when the time is right' quite often. In my defense, the timing is genuinely terrible right now.",
        "Mira asked me to explain the sigil markings. I started at the beginning. Three hours later she told me there's such a thing as too much context.",
        "I once tried to be forthcoming and direct. People said I was 'ruining the mystique.' You can't win.",
        "The ancient texts are surprisingly petty. One scholar spent six pages insulting another's footnote formatting. Some things never change."
      ],
      contextualLines: {
        completedMQ3: "The goblin activity is connected to something deeper. I've seen similar patterns before, in the northern wastes.",
        completedMQ5: "What you found in those caves confirms my suspicions. There's an older power at work here.",
        completedMQ8: "You've uncovered more than you realize. When you're ready, I have theories I'd like to share."
      },
      giftReactions: {
        loved: [
          "This is... remarkable. Where did you find this? I must study it further.",
          "You have an eye for the extraordinary. Thank you, truly.",
          "I rarely accept gifts. But from you, I'll make an exception."
        ],
        liked: [
          "Thoughtful. I appreciate the gesture.",
          "Thank you. This is more than I expected."
        ],
        neutral: [
          "An interesting choice. Thank you.",
          "You didn't need to, but I appreciate it."
        ],
        disliked: [
          "A sweet roll? I... don't really have a taste for these. But thank you.",
          "This isn't quite what I look for, but the thought is noted."
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "You've been persistent. Most people stop trying to talk to me after the first cold shoulder." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I travel alone by choice. The things I study are... not for everyone. But you seem different." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "Perhaps I've been too guarded. You've earned a measure of my trust." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I owe you the truth. I'm not just a traveler. I'm a scholar of the old world, the civilizations that came before." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "The sigils, the ruins, the things stirring underground... I've been tracking them for years." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I came to Elderbrook because the signs led me here. And then I met you. That was not part of the plan." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I had a companion once. Another scholar. We traveled together for three years." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "She entered a ruin that I warned her about. She never came out. I've been alone since." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "Being close to you terrifies me. But staying distant from you is worse. I didn't expect that." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I need to tell you something. And I need you to not interrupt until I'm finished." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I have spent my entire life building walls. Knowledge instead of connection. Distance instead of vulnerability." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "But you walked through every wall I built. Patiently. Consistently. Without asking for anything in return." },
            {
              speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I have feelings for you that I cannot rationalize away. And I need to know if they're returned.",
              choices: [
                { text: "They are, Elira. Every one of them.", next: 4, flags: ["eliraRomantic"] },
                { text: "I care deeply about you, but not in that way.", next: 6 }
              ]
            },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I... had hoped. But hearing it is something else entirely." },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "Then we face what comes next together. Whatever it is.", end: true },
            { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I see. Thank you for your honesty. I would rather have a true friend than a false lover. We'll speak no more of it." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "Stargazing on the hill? I suppose I can spare an evening from my research." },
          { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "That constellation there, the old scholars called it the Watcher. They believed it kept vigil over buried secrets." },
          { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "I've seen the sky from a hundred places. But somehow it looks different when I'm with you." },
          { speaker: "Elira Ashfen", portrait: "assets/portraits/elira.png", text: "Thank you for this. I had forgotten what peace feels like." }
        ],
        onEnd: { addAffinity: { npc: "elira", amount: 5 } }
      }
    },

    bram: {
      name: "Bram Ironhand",
      portrait: "assets/portraits/bram.png",
      lovedGifts: ["iron-ingot", "fine-leather"],
      likedGifts: ["sweet-roll", "moonstone"],
      dislikedGifts: ["wildflowers", "herbal-tea"],
      bonus: { attack: 2 },
      preferredClass: "warrior",
      chatLines: [
        "People think smithing is just hitting metal. It's not. It's listening to the steel and knowing when it's ready.",
        "Made my first knife when I was eight. Cut myself on it immediately. Still have the scar.",
        "The best blade I ever forged was for a knight who never came back for it. Still sits in my workshop.",
        "Goblins don't maintain their weapons. That's why they break so easily. No respect for the craft.",
        "You're alright, you know that? Not many people stick around to talk to the sweaty forge guy.",
        "I temper every blade three times. Most smiths do it once. That's why my work lasts.",
        "Had a customer try to haggle down a sword I spent forty hours on. I told him to go buy a stick.",
        "The furnace needs new bellows. Again. I swear I go through them faster than anyone.",
        "Ever held a blade fresh from the quench? There's a moment where it hums. That's how you know it's right.",
        "Mira keeps asking me to make herb-drying racks. Fine work, but not exactly glorious smithing.",
        "Someone brought me a sword and asked me to make it 'more legendary.' I said 'go do something legendary with it.' Problem solved.",
        "Toma ordered a custom quill holder. Shaped like a tiny sword. I put more effort into it than I'll ever admit.",
        "Harlan critiques my blades and I critique his armor. It's how we say we respect each other. Don't tell him I said that.",
        "An adventurer once returned a sword saying it was 'too sharp.' I'm still processing that complaint."
      ],
      contextualLines: {
        chapterEndBrave: "I heard what you said to Rowan. 'I'll face it.' That's the kind of talk I respect. Warrior spirit.",
        completedMQ3: "Heard you smashed through some goblins. How'd the gear hold up? Be honest.",
        elricJoinedMQ4: "Elric's out there with you? Good. That man's been cooped up at the guard post too long. Keep my blades sharp and him alive.",
        completedMQ5: "If you're going deeper into those caves, you'll need better steel. Come talk to me before you go.",
        defeatedGrisk: "You brought down a goblin chief. With Elric at your side, no less. That's the kind of story they'll tell in this shop for years.",
        completedMQ8: "You've earned the right to commission something special from me. Say the word."
      },
      giftReactions: {
        loved: [
          "Quality iron! Now that's a gift I can work with. You've got good taste.",
          "This is excellent material. I know exactly what I'll make from this. Thank you.",
          "You actually understand what matters to a smith. I'm impressed."
        ],
        liked: [
          "Hey, that's nice. I appreciate it.",
          "Well now, that's a pleasant surprise. Thanks."
        ],
        neutral: [
          "Oh. Thanks? I'll, uh, put it somewhere safe.",
          "Huh. Thoughtful. Not really my thing, but I appreciate it."
        ],
        disliked: [
          "Flowers? What am I gonna do with flowers? ...Don't answer that.",
          "Herbal tea? Do I look like a tea person to you?"
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "You keep coming back and you're not even buying anything. That's either friendship or you're casing the place." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I came to Elderbrook five years ago. The capital had too many smiths and not enough honesty." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Out here, people appreciate good work. And apparently, good company. Alright, we're friends." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I don't talk about this much, but I had a partner once. Another smith. We shared a forge in the capital." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Things fell apart. Not in a dramatic way. We just wanted different things. I wanted honest work. They wanted fame." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I haven't let anyone close since. But somehow you snuck past the gate. Sneaky." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I made something for you. Here, before I talk myself out of it." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "It's a small pendant. Iron and silver. Not flashy, but it'll last forever." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I wanted you to have something that... represents what I can't say with words. I'm better with metal than feelings." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Alright. I've been going back and forth about this for weeks and I'm tired of arguing with myself." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I'm not good at this. Feelings aren't metal. I can't shape them or hammer them into something neat." },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "But here's the truth: you're the first person in years who makes me look forward to tomorrow." },
            {
              speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "So just tell me straight. Is this something, or am I making a fool of myself?",
              choices: [
                { text: "It's something, Bram. It's definitely something.", next: 4, flags: ["bramRomantic"] },
                { text: "You're not a fool. But I see you as a friend.", next: 6 }
              ]
            },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Yeah? Good. That's... that's really good. I think I'm smiling. Is this what smiling feels like?" },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Right. Well. Don't expect me to start writing poetry. But I'll forge you the finest blade you've ever held.", end: true },
            { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Fair enough. Can't force steel into a shape it doesn't want to take. We're good. Truly." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Dinner at the inn? Sure. But I'm ordering the biggest plate they've got. Forging works up an appetite." },
          { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "You know, my old man used to say the measure of a meal is the company, not the food. I'm starting to understand that." },
          { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "I built my life around things I could hold. Iron, steel, stone. But sitting here with you... this might be worth more than all of it." },
          { speaker: "Bram Ironhand", portrait: "assets/portraits/bram.png", text: "Good food, good company. A man could get used to this." }
        ],
        onEnd: { addAffinity: { npc: "bram", amount: 5 } }
      }
    },

    harlan: {
      name: "Harlan Stonevein",
      portrait: "assets/portraits/harlan.png",
      lovedGifts: ["fine-leather", "iron-ingot", "silver-ring"],
      likedGifts: ["sweet-roll", "old-book"],
      dislikedGifts: ["wildflowers", "cave-herb"],
      bonus: { defense: 2 },
      preferredClass: "warrior",
      chatLines: [
        "In the army, they said armor is your second skin. I took that literally. Haven't stopped working with it since.",
        "I've seen more battles than birthdays at this point. Elderbrook is supposed to be my quiet retirement. So much for that.",
        "Every scar tells a story. Most of mine say the same thing: I didn't dodge fast enough.",
        "You want to survive out there? Move like the armor is part of you. Don't fight it.",
        "You're tougher than you look. That's a compliment, by the way.",
        "I keep the old army shield above my bed. Not for decoration. Habit.",
        "Trained a recruit last week who held his sword backwards. Backwards. We have work to do.",
        "The walls here are solid but the gatehouse needs reinforcing. I've told Elric twice.",
        "Best armor I ever wore stopped an arrow meant for my heart. I retired it. Couldn't bear to melt it down.",
        "Some nights I still wake up reaching for my weapon. Twenty years of service doesn't wash off easy.",
        "Bram says I'm too hard on the recruits. The recruits are alive. You're welcome, Bram.",
        "A young guard asked me what the secret to surviving combat is. I said 'don't get hit.' He expected something deeper. There isn't.",
        "Mira offered me a 'relaxation tonic.' I drank it. Woke up fourteen hours later in Bram's chair. I don't relax well.",
        "The council invited me to a 'team-building dinner.' I told them I build teams by making them run uphill in full plate. Invitation was rescinded."
      ],
      contextualLines: {
        completedMQ3: "Good work on that camp. Your form's improving, but watch your left flank next time.",
        completedMQ5: "You've seen real combat now. The look in your eyes has changed. That's not a bad thing.",
        completedMQ8: "You fight like someone who's found something worth protecting. That's the mark of a true warrior."
      },
      giftReactions: {
        loved: [
          "Hmph. Fine quality. You've got a soldier's eye for materials. I approve.",
          "Now this is a proper gift. Practical and well-chosen. Thank you.",
          "You keep this up and I might actually start smiling."
        ],
        liked: [
          "Not bad. I appreciate the thought.",
          "Decent choice. Thank you."
        ],
        neutral: [
          "Well. It's... something. Thanks, I suppose.",
          "I've received worse. Thank you."
        ],
        disliked: [
          "Flowers? I'm a soldier, not a florist. But... thanks.",
          "Herbs? I suppose I could make a poultice if I get desperate."
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "You come around a lot for someone who's not buying armor. Fine. I can respect persistence." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I served twenty years in the southern border guard. When I retired, they handed me a medal and forgot my name." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "Elderbrook is small, but at least here, people know who I am. Including you, apparently." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I had a squad once. Twelve soldiers. We held a bridge for three days against impossible odds." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "Four of us walked away. The armor I made for the others wasn't good enough. That haunts me still." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I work harder now because of them. Every piece I craft is an oath that no one else dies on my watch." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I don't let people in easily. You should know that by now." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "But you've proven yourself. In battle, in character, and in patience with a stubborn old soldier." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I trust you. Completely. That's not something I say to many people." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I've been a soldier my whole life. Discipline, duty, distance. That's all I knew." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "Then you came along and broke every rule in my book. And I let you." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I'm not good at tender words. But I know what I feel. And it's something I haven't felt in a very long time." },
            {
              speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I need a straight answer. No games. Do you feel the same?",
              choices: [
                { text: "I do, Harlan. Without question.", next: 4, flags: ["harlanRomantic"] },
                { text: "I respect you deeply, but only as a friend.", next: 6 }
              ]
            },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "Then I'll stand by your side. Not just as your armorer. As your partner." },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I don't make promises lightly. But this one I'll keep until my last breath.", end: true },
            { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "Understood. I respect your honesty. That takes courage. We'll remain as we are." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "A walk along the walls? Hmph. Alright. I know the best vantage points." },
          { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "See that treeline? I've watched it every sunset for three years. Never gets old." },
          { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "I used to think peace was boring. Now I think peace is just... hard-earned quiet. And it's better shared." },
          { speaker: "Harlan Stonevein", portrait: "assets/portraits/harlan.png", text: "Thank you for dragging me out of the shop. I needed this more than I realized." }
        ],
        onEnd: { addAffinity: { npc: "harlan", amount: 5 } }
      }
    },

    elric: {
      name: "Captain Elric",
      portrait: "assets/portraits/Guard_captain.png",
      lovedGifts: ["old-book", "sweet-roll", "silver-ring"],
      likedGifts: ["iron-ingot", "herbal-tea"],
      dislikedGifts: ["cave-herb", "wildflowers"],
      bonus: { defense: 1, attack: 1 },
      preferredClass: "warrior",
      chatLines: [
        "Another quiet patrol. I should be grateful, but the quiet makes me nervous these days.",
        "The men look to me for confidence. Some days I have to fake it. Don't tell them that.",
        "I joined the guard because I believed in protecting people. That hasn't changed, even if everything else has.",
        "Paperwork. Reports. Requisition forms. They never mention this part when you sign up.",
        "Appreciate you checking in. It's good to know someone out there actually cares about the guard.",
        "Lost two guards to 'better opportunities' in the capital last month. Can't compete with city wages.",
        "I keep a map of every goblin sighting on my wall. The pins are getting closer to town.",
        "My lieutenant thinks I work too hard. My lieutenant is right, but don't tell him I said that.",
        "The council wants results but won't approve the budget for new equipment. Classic.",
        "Sometimes I walk the walls at night alone. Old habit. The town looks peaceful from up there.",
        "I requested a budget increase for the third time. The council counter-offered with 'have you tried motivation?' I have. It doesn't stop goblin arrows.",
        "Harlan offered to give my guards a 'pep talk.' Six of them requested transfers afterward. Very peppy.",
        "Someone on the council suggested the goblins might respond to a sternly worded letter. I'm still waiting for the punchline.",
        "The job posting for new guards says 'exciting opportunities in a dynamic environment.' Harlan wrote it. He has a dark sense of humor."
      ],
      contextualLines: {
        choiceTeamwork: "Rowan told me you suggested involving the guard when the goblins started organizing. That means a lot. Most adventurers prefer to work alone.",
        completedMQ3: "Your report on the goblin camp was thorough. My guards could learn something from you.",
        elricJoinedMQ4: "Good to be back. Fighting alongside you out there was... different. It reminded me why I became a guard in the first place.",
        completedMQ4: "That trail was worse than I expected. But we made it through together. That counts for something.",
        completedMQ5: "I've increased patrols based on what you've found. Whatever is down there, we need to be ready.",
        completedMQ7: "We did it. Grisk is finished. I won't forget standing beside you when the blades came out. Not many people I'd trust to watch my back like that.",
        defeatedGrisk: "The men can breathe again. You gave them that. You gave me that.",
        completedMQ8: "You've done what the entire guard couldn't. I owe you more than I can say."
      },
      giftReactions: {
        loved: [
          "This is... very kind. You didn't have to. But I'm glad you did.",
          "I'm not used to this. Receiving gifts, I mean. Thank you, sincerely.",
          "It's been a long time since someone thought of me outside of duty. I'm touched."
        ],
        liked: [
          "Thank you. I'll put it to good use.",
          "A thoughtful gesture. I appreciate it."
        ],
        neutral: [
          "That's kind. Thank you.",
          "I appreciate the thought behind it."
        ],
        disliked: [
          "Cave herbs? I'm not sure what I'd do with these. But thank you.",
          "Flowers are nice, I suppose, but I'm more of a practical gifts person."
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I'll admit, when you first arrived, I didn't trust you. New face, unknown background. I'm suspicious by nature." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "But you've proven yourself. You've done more for this town in weeks than most do in years." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "Consider my suspicion officially withdrawn." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I wasn't always a captain. Started as a gate guard. Twelve hour shifts, standing in the rain." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "Worked my way up by never missing a shift and always volunteering for the hard jobs." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "The title is lonely, though. Everyone sees the rank. Not many see the person behind it." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I almost left Elderbrook last year. The politics, the underfunding, the feeling that nobody cares..." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I stayed because of the people. Rowan, Mira, even Bram in his grumpy way. And now you." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "You give me a reason to keep fighting for this town. I hope you know that." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I've written this speech three times and thrown it away each time. So I'll just say it plainly." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "You're the first person who's made me feel like more than just a uniform and a title." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "When I'm with you, I remember who I was before all the duty and the stress. I remember what happiness feels like." },
            {
              speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I'm not good at this. But I have to ask. Could there ever be something more between us?",
              choices: [
                { text: "There already is, Elric. I've felt it for a while.", next: 4, flags: ["elricRomantic"] },
                { text: "You're a wonderful person, but I only see you as a friend.", next: 6 }
              ]
            },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "You have no idea how long I've wanted to hear that." },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I'll protect this town, and I'll protect what we have. You have my word as a captain and as yours.", end: true },
            { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I understand. And I respect it completely. Our friendship means the world to me. That won't change." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "Dinner? I... yes. Let me tell the lieutenant he has the watch tonight." },
          { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I can't remember the last time I sat down for a meal without a report in my other hand." },
          { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "This is nice. Really nice. Just two people, a warm fire, and no emergencies." },
          { speaker: "Captain Elric", portrait: "assets/portraits/Guard_captain.png", text: "I don't want this evening to end. But duty calls at dawn. Let's do this again soon." }
        ],
        onEnd: { addAffinity: { npc: "elric", amount: 5 } }
      }
    },

    fauna: {
      name: "Fauna",
      portrait: "assets/portraits/pet-shop-keeper.png",
      lovedGifts: ["wildflowers", "herbal-tea", "sweet-roll"],
      likedGifts: ["moonstone", "old-book", "cave-herb"],
      dislikedGifts: ["iron-ingot", "smelling-salts"],
      bonus: { dexterity: 1, defense: 1, maxHp: 6 },
      chatLines: [
        "If an animal trusts you quickly, it usually means your heart is kinder than your reputation.",
        "The fox kits always try to nap in the sunniest corner. Honestly, I can't blame them.",
        "I grew up on the edge of the deepwood. You learn patience when every creature is deciding whether you're friend or threat.",
        "Some people come in asking for the fiercest companion I have. I prefer the ones asking which pet needs the gentlest home.",
        "This shop smells like cedar, hay, and a little bit of mischief. That's how I know it's a good day.",
        "The barn owl watches everyone who enters. She has excellent judgment, so if she likes you, I probably will too.",
        "I braid ribbons into the collars of the shy ones. It helps people notice how lovely they are.",
        "You'd be surprised how often wounded strays find their way to my door before they trust anyone else in town."
      ],
      contextualLines: {
        completedMQ3: "Word travels fast in Elderbrook. The creatures settled down after what you did at the goblin camp. They can tell when the danger eases.",
        completedMQ5: "The animals were restless last night. Whatever you found out there... I think they felt it too.",
        completedMQ8: "The town is breathing easier now. Even the shy little ones are coming out from under the blankets again."
      },
      giftReactions: {
        loved: [
          "These are perfect. You have a sweet instinct for what brings comfort.",
          "You brought me exactly the sort of thing that makes this place feel warm. Thank you.",
          "Oh, that's lovely. You've made both me and half the shop very happy."
        ],
        liked: [
          "That's thoughtful of you. I'll treasure it.",
          "You always bring a little more light with you, don't you?"
        ],
        neutral: [
          "Thank you. That's kind of you.",
          "That's sweet. I'll make room for it here."
        ],
        disliked: [
          "Oh... that's a little harsher than what I usually keep around the animals, but thank you.",
          "I appreciate the gesture, even if this one isn't really me."
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "Most people see a pet shop. I see a place where frightened hearts learn they can feel safe again." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "You have that effect too, you know. The room softens a little when you walk in." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "I'm glad you've started stopping by for more than simple errands." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "I used to travel with caravans, tending injured pack animals and any soul who needed a quiet word." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "Elderbrook was the first place that ever felt worth staying in. You are part of that now." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "There's a steadiness in you I find myself leaning toward." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "Can I confess something? I notice the sound of your footsteps before I see you." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "The animals calm down when you're near. So do I, which is rarer than I'd like to admit." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "You've become very dear to me." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "I've spent years teaching skittish creatures that love is safest when it's chosen freely." },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "So I'll ask plainly, with no tricks and no leash: would you let me be more to you than a friend?" },
            {
              speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "Because I would like that very much.",
              choices: [
                { text: "Yes. I want that too.", next: 3, flags: ["faunaRomantic"] },
                { text: "I care for you deeply, but only as a friend.", next: 5 }
              ]
            },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "Then come here, darling. Let the whole shop see what happiness looks like.", end: true },
            { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "I won't let awkwardness spoil what we have. You're still precious to me.", end: true }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "A little evening walk through town? I'd love that. Let me wash the fox pawprints off my skirt first." },
          { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "The lantern light makes Elderbrook look softer at night. Almost like the whole place is exhaling." },
          { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "I spend so much time caring for others that I forget how nice it feels to be looked after in return." },
          { speaker: "Fauna", portrait: "assets/portraits/pet-shop-keeper.png", text: "Thank you for tonight. I was already fond of you. This certainly didn't help me be less so.", end: true }
        ],
        onEnd: { addAffinity: { npc: "fauna", amount: 5 } }
      }
    },

    liora: {
      name: "Liora Bloom",
      portrait: "assets/portraits/liora.png",
      lovedGifts: ["wildflowers", "silver-ring", "sweet-roll"],
      likedGifts: ["herbal-tea", "old-book", "moonstone"],
      dislikedGifts: ["iron-ingot", "smelling-salts"],
      bonus: { dexterity: 1, intelligence: 1 },
      preferredClass: "rogue",
      chatLines: [
        "I arrange the flowers by mood instead of color. It confuses Bram terribly, which is a bonus.",
        "A market square needs something beautiful in it, otherwise it starts to feel like everyone is only hurrying through life.",
        "I grew up with caravan traders. You learn to make a place feel welcoming very quickly when home is always moving.",
        "People think flowers are delicate. They've clearly never seen a rose push up through stone.",
        "You always arrive like you're carrying a storm. I don't mind. Storms make the air honest.",
        "Children buy the brightest ribbons. Soldiers buy the smallest bouquets. Those details tell you everything about a town.",
        "I've started setting aside the prettiest blossoms because I keep thinking you'd notice them too.",
        "The square feels lighter when you stop to talk. That's not flirtation. Well. Not only flirtation."
      ],
      contextualLines: {
        completedMQ3: "The whole square was buzzing after the goblin camp raid. People stood a little taller today because of you.",
        elricJoinedMQ4: "I saw Captain Elric heading out of town in full armor. He never does that. Be careful out there, both of you.",
        completedMQ4: "You came back in one piece. I was worried. The flowers seemed to droop all morning. Maybe they were worried too.",
        completedMQ5: "You have that faraway look again. Whatever you found beyond town, don't carry it alone.",
        defeatedGrisk: "The town feels different today. Lighter. Like something heavy has been lifted. I think that's because of you.",
        completedMQ8: "Elderbrook finally sounds like itself again. Laughter, haggling, children underfoot. You gave that back to us."
      },
      giftReactions: {
        loved: [
          "Oh, this is lovely. You have a dangerously good instinct for charming me.",
          "This is exactly the sort of gift that makes a person feel seen. Thank you.",
          "You brought me beauty wrapped in kindness. That's hard to top."
        ],
        liked: [
          "That's sweet of you. Truly.",
          "You always seem to know how to brighten my day a little."
        ],
        neutral: [
          "Thank you. That's thoughtful.",
          "A kind gesture is always welcome here."
        ],
        disliked: [
          "Oh... practical, certainly. Just not very romantic, is it?",
          "I appreciate the thought, but this one's a little severe for my tastes."
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "Most people come to my stall for ribbon or flowers. You come because you actually want to linger." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "I like that about you. It feels like you're choosing to breathe for a moment instead of rushing to the next fire." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "You make the square feel less crowded in the nicest possible way." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "I wasn't born in Elderbrook. My family traveled with the trade roads, selling blooms, dyes, and little festival trinkets." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "I stayed because this town looked like it needed someone stubborn enough to keep beauty alive in hard times." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "Lately, I think I stayed because somewhere along the way, I started hoping you'd stop by." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "Do you know what I admire most about you? It's not the heroics. It's the gentleness you still have left after all of it." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "You've seen ugliness and somehow still make room for kindness. That's rarer than courage, if you ask me." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "I think about you far more often than is sensible." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "I've arranged this speech in my head a dozen times. Flowers first, then charm, then a graceful exit if I panic." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "But the truth is simpler: you've become very precious to me, and I don't want to pretend otherwise anymore." },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "So tell me honestly. May I love you out loud?", choices: [
              { text: "Yes. Please do.", next: 3, flags: ["lioraRomantic"] },
              { text: "I care for you, but only as a friend.", next: 5 }
            ] },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "Oh, thank the stars. I was aiming for poised and nearly landed on terrified.", end: true },
            { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "Then I will keep loving what we already are. Friendship is no small thing, and I won't treat it like one.", end: true }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "A quiet evening walk through the square after the market closes? That sounds perfect." },
          { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "I like town best at this hour. The noise softens, the lanterns glow, and everything feels a little more possible." },
          { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "You know, if you stood beside me every evening, I don't think I'd ever call this place lonely again." },
          { speaker: "Liora Bloom", portrait: "assets/portraits/liora.png", text: "Thank you. Tonight felt like a pressed flower in a favorite book. Something worth keeping.", end: true }
        ],
        onEnd: { addAffinity: { npc: "liora", amount: 5 } }
      }
    }
  };

  /* â”€â”€ Helper Functions â”€â”€ */

  function getConfig(npcId) {
    return config[npcId] || null;
  }

  function getRelData(npcId) {
    var p = Player.get();
    if (!p || !p.relationships || !p.relationships[npcId]) return null;
    return p.relationships[npcId];
  }

  function getLevelName(affinity) {
    var name = LEVELS[0].name;
    for (var i = 0; i < LEVELS.length; i++) {
      if (affinity >= LEVELS[i].min) name = LEVELS[i].name;
    }
    return name;
  }

  function getLevelIndex(affinity) {
    var idx = 0;
    for (var i = 0; i < LEVELS.length; i++) {
      if (affinity >= LEVELS[i].min) idx = i;
    }
    return idx;
  }

  function addAffinity(npcId, amount) {
    var rel = getRelData(npcId);
    if (!rel) return;
    rel.affinity = Math.min(MAX_AFFINITY, Math.max(0, rel.affinity + amount));
  }

  function getDateableNPCs() {
    var ids = [];
    for (var key in config) {
      ids.push(key);
    }
    return ids;
  }

  /* â”€â”€ Chat System â”€â”€ */

  function canChat(npcId) {
    var rel = getRelData(npcId);
    return rel && !rel.chatted;
  }

  function chat(npcId, callback) {
    var rel = getRelData(npcId);
    var cfg = config[npcId];
    if (!rel || !cfg) return;

    rel.chatted = true;

    // Try contextual story-reactive line first
    var line = null;
    if (cfg.contextualLines) {
      var ctxKeys = Object.keys(cfg.contextualLines);
      if (!rel.seenContextual) rel.seenContextual = {};
      for (var c = ctxKeys.length - 1; c >= 0; c--) {
        if (Player.hasFlag(ctxKeys[c])) {
          // 75% first time, 40% if already seen
          var ctxChance = rel.seenContextual[ctxKeys[c]] ? 0.4 : 0.75;
          if (Math.random() < ctxChance) {
            line = cfg.contextualLines[ctxKeys[c]];
            rel.seenContextual[ctxKeys[c]] = true;
          }
          break;
        }
      }
    }
    if (!line) {
      line = cfg.chatLines[Math.floor(Math.random() * cfg.chatLines.length)];
    }

    var amount = 2 + Math.floor(Math.random() * 2); // +2 or +3
    // Class preference bonus (subclasses match their parent)
    if (cfg.preferredClass && Player.get()) {
      var bc = Player.get().buildClass;
      var def = Player.CLASS_DEFS && Player.CLASS_DEFS[bc];
      if (bc === cfg.preferredClass || (def && def.base === cfg.preferredClass)) amount += 1;
    }
    // Charm bonus: +1 affinity per 3 charm above base
    var p = Player.get();
    if (p && p.charm > 1) {
      amount += Math.floor((p.charm - 1) / 3);
    }
    addAffinity(npcId, amount);

    Dialogue.startDirect({
      nodes: [{ speaker: cfg.name, portrait: cfg.portrait, text: line }],
      onEnd: null
    }, function () {
      UI.showMessage("+" + amount + " affinity with " + cfg.name);
      checkMilestone(npcId, callback);
    });
  }

  /* â”€â”€ Gift System â”€â”€ */

  function canGift(npcId) {
    var rel = getRelData(npcId);
    return rel && !rel.gifted;
  }

  function getGiftReaction(npcId, itemId) {
    var cfg = config[npcId];
    if (!cfg) return "neutral";
    if (cfg.lovedGifts.indexOf(itemId) !== -1) return "loved";
    if (cfg.likedGifts.indexOf(itemId) !== -1) return "liked";
    if (cfg.dislikedGifts && cfg.dislikedGifts.indexOf(itemId) !== -1) return "disliked";
    return "neutral";
  }

  function giveGift(npcId, itemId, callback) {
    var rel = getRelData(npcId);
    var cfg = config[npcId];
    if (!rel || !cfg) return;

    // Remove item from inventory
    if (!Player.removeItem(itemId)) return;

    rel.gifted = true;
    var reaction = getGiftReaction(npcId, itemId);
    var amount = reaction === "loved" ? 8 : (reaction === "liked" ? 5 : (reaction === "disliked" ? -3 : 2));
    // Class preference bonus (subclasses match their parent)
    if (cfg.preferredClass && Player.get() && amount > 0) {
      var bc2 = Player.get().buildClass;
      var def2 = Player.CLASS_DEFS && Player.CLASS_DEFS[bc2];
      if (bc2 === cfg.preferredClass || (def2 && def2.base === cfg.preferredClass)) amount += 2;
    }
    // Charm bonus on positive gifts: +1 per 3 charm above base
    if (amount > 0) {
      var pc = Player.get();
      if (pc && pc.charm > 1) {
        amount += Math.floor((pc.charm - 1) / 3);
      }
    }
    addAffinity(npcId, amount);

    var lines = cfg.giftReactions[reaction] || cfg.giftReactions.neutral;
    var line = lines[Math.floor(Math.random() * lines.length)];

    Dialogue.startDirect({
      nodes: [{ speaker: cfg.name, portrait: cfg.portrait, text: line }],
      onEnd: null
    }, function () {
      if (amount >= 0) {
        UI.showMessage("+" + amount + " affinity with " + cfg.name + "!");
      } else {
        UI.showMessage(amount + " affinity with " + cfg.name + "...");
      }
      checkMilestone(npcId, callback);
    });
  }

  /* â”€â”€ Date System â”€â”€ */

  function canDate(npcId) {
    var rel = getRelData(npcId);
    if (!rel) return false;
    return rel.affinity >= 55 && !rel.dated;
  }

  function goOnDate(npcId, callback) {
    var rel = getRelData(npcId);
    var cfg = config[npcId];
    if (!rel || !cfg || !cfg.dateDialogue) return;

    rel.dated = true;

    Dialogue.startDirect(cfg.dateDialogue, function () {
      UI.showMessage("A wonderful time with " + cfg.name + "!");
      checkMilestone(npcId, callback);
    });
  }

  /* â”€â”€ Milestone System â”€â”€ */

  function getPendingMilestone(npcId) {
    var rel = getRelData(npcId);
    var cfg = config[npcId];
    if (!rel || !cfg) return null;

    for (var i = 0; i < MILESTONES.length; i++) {
      var m = MILESTONES[i];
      if (rel.affinity >= m && rel.milestones.indexOf(m) === -1 && cfg.milestoneDialogues[m]) {
        return m;
      }
    }
    return null;
  }

  function checkMilestone(npcId, callback) {
    var milestone = getPendingMilestone(npcId);
    if (milestone === null) {
      if (callback) callback();
      return;
    }

    var rel = getRelData(npcId);
    var cfg = config[npcId];
    rel.milestones.push(milestone);

    var dialogueData = cfg.milestoneDialogues[milestone];
    Dialogue.startDirect(dialogueData, function () {
      var levelName = getLevelName(rel.affinity);
      UI.showMessage("Relationship with " + cfg.name + ": " + levelName + "!");
      if (callback) callback();
    });
  }

  /* â”€â”€ Daily Reset (called on inn rest) â”€â”€ */

  function resetDaily() {
    var p = Player.get();
    if (!p || !p.relationships) return;
    for (var key in p.relationships) {
      p.relationships[key].chatted = false;
      p.relationships[key].gifted = false;
      p.relationships[key].dated = false;
    }
  }

  /* â”€â”€ Partner Bonus â”€â”€ */

  function getPartnerBonus() {
    var p = Player.get();
    if (!p || !p.relationships) return null;
    for (var key in p.relationships) {
      if (p.relationships[key].affinity >= 75 && Player.hasFlag(key + "Romantic")) {
        return { npc: key, bonus: config[key].bonus };
      }
    }
    return null;
  }

  /* â”€â”€ Gift Inventory Helper â”€â”€ */

  function getGiftableItems() {
    var p = Player.get();
    if (!p) return [];
    var seen = {};
    var result = [];
    for (var i = 0; i < p.inventory.length; i++) {
      var item = Items.get(p.inventory[i]);
      if (item && item.type === "gift" && !seen[item.id]) {
        seen[item.id] = true;
        result.push({ item: item, count: Player.countItem(item.id) });
      }
    }
    return result;
  }

  function getClassPreference(npcId) {
    var cfg = config[npcId];
    return cfg ? (cfg.preferredClass || null) : null;
  }

  return {
    LEVELS: LEVELS,
    MAX_AFFINITY: MAX_AFFINITY,
    getConfig: getConfig,
    getClassPreference: getClassPreference,
    getRelData: getRelData,
    getLevelName: getLevelName,
    getLevelIndex: getLevelIndex,
    addAffinity: addAffinity,
    getDateableNPCs: getDateableNPCs,
    canChat: canChat,
    chat: chat,
    canGift: canGift,
    getGiftReaction: getGiftReaction,
    giveGift: giveGift,
    canDate: canDate,
    goOnDate: goOnDate,
    getPendingMilestone: getPendingMilestone,
    checkMilestone: checkMilestone,
    resetDaily: resetDaily,
    getPartnerBonus: getPartnerBonus,
    getGiftableItems: getGiftableItems
  };
})();
