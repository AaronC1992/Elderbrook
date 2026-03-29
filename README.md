# Elderbrook

Browser-based RPG foundation inspired by AdventureQuest and visual novels.

## Stack

- HTML
- CSS
- Vanilla JavaScript (ES modules)

## Folder Structure

- `assets/backgrounds` scene backgrounds
- `assets/portraits` characters and NPC portraits
- `assets/items` equipment and item art
- `assets/ui` UI-specific sprites
- `css/styles.css` global game styling
- `js/data/assets.js` centralized asset path map
- `js/data/items.js` item stats and potion data
- `js/data/shops.js` shop metadata and inventories
- `js/data/enemies.js` enemy combat stats and rewards
- `js/data/scenes.js` story and scene definitions
- `js/core/state.js` reactive state store
- `js/core/dom.js` DOM references
- `js/systems/sceneSystem.js` scene loading, step progress, choice routing
- `js/systems/dialogueSystem.js` player input handling
- `js/systems/actionRouter.js` routes UI actions (town, shops, combat)
- `js/systems/shopSystem.js` buying flow and gold checks
- `js/systems/combatSystem.js` goblin combat and reward loop
- `js/systems/playerSetupSystem.js` character creator and starter loadout
- `js/systems/uiRenderer.js` UI render layer
- `js/main.js` bootstrap and debug hooks

## How It Works

1. `playerSetupSystem` blocks game start until the player sets name/gender/origin/archetype.
2. `loadScene(sceneId)` loads a dialogue scene with text, portraits, choices, and optional clickable NPC hotspots.
3. In `townHub`, clicking NPCs opens shops or starts a goblin fight.
4. Shops spend gold and update inventory/equipment/potions.
5. Combat uses equipped gear and rewards gold on victory.
6. State updates trigger UI re-rendering through `subscribe()`.

## Quick Test Path

1. Create your character and enter town.
2. Click `Blacksmith Ivar` and buy a weapon.
3. Click `Armorer Sela` and buy armor.
4. Click `Apothecary Mira` and buy Health Potions and Mana Potions.
5. Click `Guildmaster Rowan` to start a goblin fight.
6. Use potion actions during combat to test both potion types.
7. Win to earn gold, then return to town and buy more upgrades.

## Expanding The Game

- Add new scenes in `js/data/scenes.js`.
- Add new asset keys in `js/data/assets.js`.
- Add more effect types in `applyEffects()` inside `js/systems/sceneSystem.js`.
- Add combat/inventory screens as new systems under `js/systems`.

## Run Locally

Use any static server from the project root.

Example with VS Code Live Server:

- Right click `index.html`
- Open with Live Server
