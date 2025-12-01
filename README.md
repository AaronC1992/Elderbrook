# Elderbrook (HTML/CSS/JS)

Single‑file browser RPG (formerly Arcane Quest) with a cooldown-based combat system built in plain HTML, CSS, and vanilla ES modules.

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

## Structure

- `index.html` — all screens (creation, town, battle, modal)
- `styles.css` — layout, panels, bars, buttons
- `src/`
	- `main.js` — bootstrap, character creation wiring
	- `townUI.js` — town actions (fight/rest/save/load)
	- `battleSystem.js` — RAF cooldown combat loop
	- `renderer.js` — DOM helpers and screen rendering
	- `gameState.js` — player model, derived stats, save/load
	- `enemies.js` — forest enemy data + scaler
	- `items.js`, `shops.js` — stubs for later
	- `utils.js` — small helpers

## Quick Test

1) Enter name, choose class, allocate 5 points, Confirm
2) Hunt in the Forest → Attack when CD is full
3) Run (50% chance) or finish fight → Return to Town
4) Save/Load/Rest to verify state

