# Elderbrook (HTML/CSS/JS)

[Live Demo](https://aaronc1992.github.io/Elderbrook/) · GitHub Pages enabled

Cooldown-based browser RPG with zones, a world map, NPCs, and an endgame boss — built in plain HTML/CSS and vanilla ES modules.

## Run Locally

Open a local static server (modules won’t load via `file://`). Pick one:

PowerShell (Python 3):

```powershell
python -m http.server 5173
```

Node.js (npx serve):

```powershell
npx serve -l 5173
```

VS Code Live Server:
- Right‑click `index.html` → Open with Live Server

Then open: `http://localhost:5173/`

## Play Online

Once GitHub Pages is enabled for this repo, you can play directly in your browser here:

https://aaronc1992.github.io/Elderbrook/

If the link shows a 404, enable Pages first (see Deploy section below), wait ~2 minutes, then refresh.

### Troubleshooting
- If assets don’t load, ensure paths in `index.html`/`styles.css` are relative (e.g., `./src/main.js`, `./backgrounds/...`).
- Clear browser cache or use a hard refresh (Ctrl+F5) after enabling Pages.

## Structure

- `index.html` — screens and UI containers
- `styles.css` — layout, components, animations, backgrounds (`bg-*` classes)
- `backgrounds/` — background images (village, zones)
- `src/`
	- `main.js` — bootstrap, character creation wiring
	- `townUI.js` — town actions (fight/rest/save/load, World Map button)
	- `battleSystem.js` — RAF cooldown combat loop, boss hooks
	- `renderer.js` — DOM helpers, screen shells (NPC, World Map), `setBackground`
	- `gameState.js` — player model, derived stats, save/load
	- `zones.js` — zone data, entry requirements, start effects
	- `enemies.js` — enemies, elites, endgame boss
	- `worldMapUI.js` — world map screen, nodes, travel flow
	- `npcs.js` — NPC roster, dialogues, interactions
	- `items.js`, `shops.js`, `crafting.js`, `talents.js`, `quests.js`, `statuses.js`, `utils.js`

## Quick Test

1) Enter name, choose class, allocate 5 points, Confirm
2) Hunt in the Forest → Attack when CD is full
3) Run (50% chance) or finish fight → Return to Town
4) Save/Load/Rest to verify state

5) World Map: from Town click “World Map” → hover nodes for details, click unlocked zones to travel and start a battle

## World Map & Backgrounds

- Dynamic backgrounds: `setBackground('<key>')` applies any `.bg-<key>` class — add new CSS background classes without changing JS.
- Map nodes: pulled from `zones.js` and rendered by `worldMapUI.js` with unlock checks (`canEnterZone`). Locked nodes show reasons (level, quest, item).
- Travel flow: short animation → set background → play ambience → start an encounter. Persists `flags.mapViewed` and `flags.lastVisitedZone` in `gameState`.
- Flavor markers: simple lore dots with tooltips; optional fog‑of‑war overlay hides after first map view.
- Difficulty indicators: node border colors based on `recommendedLevel` vs your level:
	- Green `easy` (≥3 levels below)
	- Amber `fair` (within −2..+1 levels)
	- Red `hard` (+2..+3 levels)
	- Gray `impossible` (≥+4 levels)

## Deploy (GitHub Pages)

You can host quickly via GitHub Pages:

1. Push `main` to GitHub (already done).
2. In the repo → Settings → Pages → “Source: Deploy from a branch” → Branch `main` → `/ (root)` → Save.
3. Pages will publish in ~2 minutes. Open the public URL.

If using modules, ensure the site serves via HTTPS and paths are relative. For local dev, prefer a static server over `file://` (see Run Locally).

