/* relationships.js - Relationship building, gift-giving, and dating system */
var Relationships = (function () {

  /* ── Relationship Level Thresholds ── */
  var LEVELS = [
    { name: "Stranger",          min: 0 },
    { name: "Acquaintance",      min: 15 },
    { name: "Friend",            min: 35 },
    { name: "Close Friend",      min: 55 },
    { name: "Romantic Partner",   min: 75 }
  ];

  var MILESTONES = [15, 35, 55, 75];
  var MAX_AFFINITY = 100;

  /* ── NPC Relationship Config ── */
  var config = {
    mira: {
      name: "Mira Voss",
      portrait: "assets/portraits/mira.png",
      lovedGifts: ["wildflowers", "herbal-tea", "cave-herb"],
      likedGifts: ["moonstone", "health-potion", "mana-potion"],
      bonus: { intelligence: 2 },
      chatLines: [
        "I've been experimenting with a new kind of salve. It smells terrible, but it works wonders on burns!",
        "Did you know cave herbs glow faintly under moonlight? I find it absolutely fascinating.",
        "Sometimes I wonder what plants grow beyond the frontier. There's so much left to discover.",
        "My mother was an herbalist too. She taught me that every plant has a story to tell.",
        "You're easy to talk to, you know that? Most adventurers just want their potions and leave."
      ],
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
        onEnd: { addAffinity: { npc: "mira", amount: 8 } }
      }
    },

    toma: {
      name: "Toma Reed",
      portrait: "assets/portraits/toma.png",
      lovedGifts: ["sweet-roll", "wildflowers", "old-book"],
      likedGifts: ["herbal-tea", "moonstone"],
      bonus: { dexterity: 2 },
      chatLines: [
        "I sorted the entire quest board by region today. Nobody noticed, but I feel great about it.",
        "Don't tell anyone, but sometimes I read the quest descriptions and imagine I'm the one going on adventures.",
        "My parents wanted me to be a merchant. I guess alphabetizing job postings is close enough?",
        "You ever wonder what's past the goblin cave? I bet there's a whole world out there waiting.",
        "Thanks for stopping by. It gets quiet here between postings."
      ],
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
        onEnd: { addAffinity: { npc: "toma", amount: 8 } }
      }
    },

    elira: {
      name: "Elira Ashfen",
      portrait: "assets/portraits/elira.png",
      lovedGifts: ["old-book", "moonstone", "strange-sigil"],
      likedGifts: ["herbal-tea", "silver-ring"],
      bonus: { intelligence: 1, dexterity: 1 },
      chatLines: [
        "The stars here are different from the ones I grew up under. Brighter, somehow.",
        "I've been studying the goblin markings. They remind me of something I saw in the far north, long ago.",
        "Most people find my silence unsettling. You seem... comfortable with it.",
        "There are ruins beneath this land. Older than the trees. Older than the rivers. I can feel them.",
        "You ask good questions. That's rare in a world full of people who only want answers."
      ],
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
        onEnd: { addAffinity: { npc: "elira", amount: 8 } }
      }
    },

    bram: {
      name: "Bram Ironhand",
      portrait: "assets/portraits/bram.png",
      lovedGifts: ["iron-ingot", "fine-leather"],
      likedGifts: ["sweet-roll", "moonstone"],
      bonus: { attack: 2 },
      chatLines: [
        "People think smithing is just hitting metal. It's not. It's listening to the steel and knowing when it's ready.",
        "Made my first knife when I was eight. Cut myself on it immediately. Still have the scar.",
        "The best blade I ever forged was for a knight who never came back for it. Still sits in my workshop.",
        "Goblins don't maintain their weapons. That's why they break so easily. No respect for the craft.",
        "You're alright, you know that? Not many people stick around to talk to the sweaty forge guy."
      ],
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
        onEnd: { addAffinity: { npc: "bram", amount: 8 } }
      }
    },

    harlan: {
      name: "Harlan Stonevein",
      portrait: "assets/portraits/harlan.png",
      lovedGifts: ["fine-leather", "iron-ingot", "silver-ring"],
      likedGifts: ["sweet-roll", "old-book"],
      bonus: { defense: 2 },
      chatLines: [
        "In the army, they said armor is your second skin. I took that literally. Haven't stopped working with it since.",
        "I've seen more battles than birthdays at this point. Elderbrook is supposed to be my quiet retirement. So much for that.",
        "Every scar tells a story. Most of mine say the same thing: I didn't dodge fast enough.",
        "You want to survive out there? Move like the armor is part of you. Don't fight it.",
        "You're tougher than you look. That's a compliment, by the way."
      ],
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
        onEnd: { addAffinity: { npc: "harlan", amount: 8 } }
      }
    },

    elric: {
      name: "Captain Elric",
      portrait: "assets/portraits/elric.png",
      lovedGifts: ["old-book", "sweet-roll", "silver-ring"],
      likedGifts: ["iron-ingot", "herbal-tea"],
      bonus: { defense: 1, attack: 1 },
      chatLines: [
        "Another quiet patrol. I should be grateful, but the quiet makes me nervous these days.",
        "The men look to me for confidence. Some days I have to fake it. Don't tell them that.",
        "I joined the guard because I believed in protecting people. That hasn't changed, even if everything else has.",
        "Paperwork. Reports. Requisition forms. They never mention this part when you sign up.",
        "Appreciate you checking in. It's good to know someone out there actually cares about the guard."
      ],
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
        ]
      },
      milestoneDialogues: {
        15: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I'll admit, when you first arrived, I didn't trust you. New face, unknown background. I'm suspicious by nature." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "But you've proven yourself. You've done more for this town in weeks than most do in years." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "Consider my suspicion officially withdrawn." }
          ]
        },
        35: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I wasn't always a captain. Started as a gate guard. Twelve hour shifts, standing in the rain." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "Worked my way up by never missing a shift and always volunteering for the hard jobs." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "The title is lonely, though. Everyone sees the rank. Not many see the person behind it." }
          ]
        },
        55: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I almost left Elderbrook last year. The politics, the underfunding, the feeling that nobody cares..." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I stayed because of the people. Rowan, Mira, even Bram in his grumpy way. And now you." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "You give me a reason to keep fighting for this town. I hope you know that." }
          ]
        },
        75: {
          nodes: [
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I've written this speech three times and thrown it away each time. So I'll just say it plainly." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "You're the first person who's made me feel like more than just a uniform and a title." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "When I'm with you, I remember who I was before all the duty and the stress. I remember what happiness feels like." },
            {
              speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I'm not good at this. But I have to ask. Could there ever be something more between us?",
              choices: [
                { text: "There already is, Elric. I've felt it for a while.", next: 4, flags: ["elricRomantic"] },
                { text: "You're a wonderful person, but I only see you as a friend.", next: 6 }
              ]
            },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "You have no idea how long I've wanted to hear that." },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I'll protect this town, and I'll protect what we have. You have my word as a captain and as yours.", end: true },
            { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I understand. And I respect it completely. Our friendship means the world to me. That won't change." }
          ]
        }
      },
      dateDialogue: {
        nodes: [
          { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "Dinner? I... yes. Let me tell the lieutenant he has the watch tonight." },
          { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I can't remember the last time I sat down for a meal without a report in my other hand." },
          { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "This is nice. Really nice. Just two people, a warm fire, and no emergencies." },
          { speaker: "Captain Elric", portrait: "assets/portraits/elric.png", text: "I don't want this evening to end. But duty calls at dawn. Let's do this again soon." }
        ],
        onEnd: { addAffinity: { npc: "elric", amount: 8 } }
      }
    }
  };

  /* ── Helper Functions ── */

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

  /* ── Chat System ── */

  function canChat(npcId) {
    var rel = getRelData(npcId);
    return rel && !rel.chatted;
  }

  function chat(npcId, callback) {
    var rel = getRelData(npcId);
    var cfg = config[npcId];
    if (!rel || !cfg) return;

    rel.chatted = true;
    var line = cfg.chatLines[Math.floor(Math.random() * cfg.chatLines.length)];
    var amount = 2 + Math.floor(Math.random() * 2); // +2 or +3
    addAffinity(npcId, amount);

    Dialogue.startDirect({
      nodes: [{ speaker: cfg.name, portrait: cfg.portrait, text: line }],
      onEnd: null
    }, function () {
      UI.showMessage("+" + amount + " affinity with " + cfg.name);
      checkMilestone(npcId, callback);
    });
  }

  /* ── Gift System ── */

  function canGift(npcId) {
    var rel = getRelData(npcId);
    return rel && !rel.gifted;
  }

  function getGiftReaction(npcId, itemId) {
    var cfg = config[npcId];
    if (!cfg) return "neutral";
    if (cfg.lovedGifts.indexOf(itemId) !== -1) return "loved";
    if (cfg.likedGifts.indexOf(itemId) !== -1) return "liked";
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
    var amount = reaction === "loved" ? 8 : (reaction === "liked" ? 5 : 2);
    addAffinity(npcId, amount);

    var lines = cfg.giftReactions[reaction];
    var line = lines[Math.floor(Math.random() * lines.length)];

    Dialogue.startDirect({
      nodes: [{ speaker: cfg.name, portrait: cfg.portrait, text: line }],
      onEnd: null
    }, function () {
      UI.showMessage("+" + amount + " affinity with " + cfg.name + "!");
      checkMilestone(npcId, callback);
    });
  }

  /* ── Date System ── */

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

  /* ── Milestone System ── */

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

  /* ── Daily Reset (called on inn rest) ── */

  function resetDaily() {
    var p = Player.get();
    if (!p || !p.relationships) return;
    for (var key in p.relationships) {
      p.relationships[key].chatted = false;
      p.relationships[key].gifted = false;
      p.relationships[key].dated = false;
    }
  }

  /* ── Partner Bonus ── */

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

  /* ── Gift Inventory Helper ── */

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

  return {
    LEVELS: LEVELS,
    MAX_AFFINITY: MAX_AFFINITY,
    getConfig: getConfig,
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
