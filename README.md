# Elderbrook

[![Play Now](https://img.shields.io/badge/Play%20Now-Elderbrook-cf9f4a?style=for-the-badge)](https://aaronc1992.github.io/Elderbrook/)

**A browser-based RPG with turn-based combat, dungeon crawling, and full character progression — playable instantly with zero downloads.**

---

## The Product

Elderbrook is a fully playable single-player RPG that runs entirely in the browser. Inspired by classic titles like AdventureQuest and early Final Fantasy, it delivers a complete gameplay loop — character creation, exploration, combat, loot, and a narrative arc — without requiring any installs, accounts, or plugins.

Players create a character, explore five distinct regions, fight 22+ enemy types across turn-based encounters, gear up through three shops, complete quests, delve into multi-room dungeons, and ultimately face a final boss to save the realm.

## Key Features

- **5 Explorable Regions** — Goblin Cave, Bandit Camp, Dark Forest, Haunted Ruins, and Dragon's Lair, each with unique enemies, loot tables, and boss encounters
- **Turn-Based Combat** — Attack, skill, potion, and flee options with status effects (poison, bleed, stun), magic scaling, and tactical depth
- **11 Unlockable Skills** — Physical and magic skill trees that scale with player stats, including AoE attacks, healing, buffs, and INT-scaling spells
- **Dungeon System** — 5 multi-room dungeons with branching paths, treasure rooms, rest points, and boss chambers
- **Full Progression Loop** — Leveling with allocatable stat points, 40+ equippable items across 4 tiers, and a bestiary that tracks every kill
- **13 Quests** — Kill quests, boss bounties, and milestone objectives with unique gear rewards
- **Gated World Map** — Areas unlock through level thresholds and quest completion, giving players clear goals
- **Save/Load System** — LocalStorage persistence so players can return anytime
- **Synthesized Audio** — Web Audio API sound effects with no external file dependencies
- **Zero Dependencies** — Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build tools, no server required

## Market Opportunity

Browser-based and idle RPGs represent a proven, high-engagement category. Titles like AdventureQuest (100M+ accounts), Melvor Idle, and Kingdom of Loathing have demonstrated that lightweight RPGs with deep progression systems generate strong retention and monetization potential.

Elderbrook is positioned to capture this audience with a modern UX, mobile-ready design, and a zero-friction entry point — no app store, no download, just click and play.

### Potential Revenue Paths

- **Cosmetic microtransactions** — Character skins, portrait packs, UI themes
- **Premium content expansions** — New regions, story arcs, endgame dungeons
- **Ad-supported free tier** — Interstitial ads between combat encounters
- **Subscription model** — XP/gold boosts, exclusive items, early access to new content

## Technical Overview

| Aspect | Detail |
|---|---|
| **Stack** | HTML5, CSS3, Vanilla JavaScript (ES5 compatible) |
| **Architecture** | Modular IIFE pattern, 14 self-contained modules |
| **Deployment** | Static hosting (GitHub Pages, any CDN) |
| **Performance** | <500KB total payload, instant load, no build step |
| **Compatibility** | All modern browsers, desktop and mobile |
| **Audio** | Procedural Web Audio API — zero asset downloads |
| **Persistence** | LocalStorage save system with backward-compatible loading |

## Current Status

Elderbrook is a **fully playable vertical slice** with a complete gameplay arc from character creation through final boss victory. The core engine, combat system, progression mechanics, and content pipeline are production-ready.

### Completed

- Complete 5-area world with progressive gating
- 22 enemies, 5 bosses, 1 final boss
- Turn-based combat with skills, magic, status effects
- Equipment, inventory, and shop systems
- Quest tracking with rewards
- Multi-room dungeon crawling
- Stat allocation and character progression
- Save/load persistence
- Victory condition and endgame screen

### Roadmap

- Multiplayer PvP arena
- Expanded story with branching narrative
- Crafting and enchantment systems
- Leaderboards and achievements
- Mobile-optimized touch controls
- Additional regions and endgame content

## Run Locally

No build tools required. Open `index.html` in any browser, or use a local server:

1. Right-click `index.html` in VS Code
2. Select "Open with Live Server"

---

<p align="center"><strong>Elderbrook</strong> — Click. Play. Adventure.</p>
