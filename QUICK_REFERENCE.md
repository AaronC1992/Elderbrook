# Elderbrook - Quick Reference Guide for New Features

## For Players

### Visual Feedback
- **Flash & Shake Effects**: When you or enemies take damage, you'll see visual feedback
- **Glowing Buttons**: Buttons pulse when you hover over them
- **Ready Indicator**: Attack button glows green when your cooldown is complete
- **Smooth Transitions**: Screens fade in smoothly when navigating

### Battle Improvements
- **Enemy Attack Warning**: See "Attacking!" or countdown timer when enemies are about to strike
- **Status Icons**: Hover over colored icons (P=Poison, B=Burn, S=Stun) to see remaining duration
- **Color-Coded Combat Log**:
  - Red: Damage taken
  - Yellow: Critical hits
  - Purple: Status effects
  - Blue: Information
  - Green: Victory messages

### Shopping & Inventory
- **Item Tooltips**: Hover over any item to see full stats and value
- **Color-Coded Rarity**: Items colored by value (gray→green→blue→purple→orange)
- **Clear Indicators**: Unaffordable items are dimmed, owned items have green border

### Audio System
- Sound effects play for attacks, purchases, level-ups, and more
- Adjust volume or disable in Settings
- Currently logs to console (placeholder for future audio files)

### Settings Menu
Access via "Settings" button in town:
- Toggle sound effects on/off
- Adjust sound volume
- Toggle music (placeholder)
- Disable animations for better performance

### Save System
- Confirmation required before overwriting saves
- Load warns about losing unsaved progress
- Reset requires double confirmation

---

## For Developers

### Adding New Sound Effects
1. Add audio file to project
2. Update path in `audio.js` → `SoundAssets` object
3. Sound will automatically play when corresponding event occurs

Example:
```javascript
const SoundAssets = {
  attack: './assets/sounds/attack.mp3', // Update this path
  // ... rest of sounds
};
```

### Adding New Status Effects
1. Define in `statuses.js` → `StatusDefinitions`
2. Add CSS class in `styles.css` for icon color
3. Use `applyStatus(entity, 'status_id', logFn)` to apply

### Adding New Item Rarities
Modify `getItemRarity()` in `renderer.js` and `townUI.js`:
```javascript
if (item.price >= 1000) return 'mythic'; // New tier
```

Then add CSS class:
```css
.item-mythic { color: #ff69b4; } /* Pink for mythic */
```

### Customizing Animations
Edit keyframes in `styles.css`:
- `@keyframes hit-flash` - Damage flash effect
- `@keyframes shake` - Shake intensity
- `@keyframes pulse-glow` - Button hover glow
- `@keyframes screen-fade-in` - Screen transition speed

### Error Handling Pattern
Use validation helpers:
```javascript
if (!validateBattleState(this)) return; // Check battle is valid
if (!GameState.player) {
  console.error('No player found');
  return;
}
```

### Logging Combat Events
Use typed log entries:
```javascript
addBattleLogEntry('Message text', 'damage'); // Red damage text
addBattleLogEntry('Message text', 'crit');   // Yellow crit text
addBattleLogEntry('Message text', 'status'); // Purple status text
addBattleLogEntry('Message text', 'info');   // Blue info text
addBattleLogEntry('Message text', 'victory'); // Green victory text
```

### Visual Feedback Integration
```javascript
// In combat code
const enemyCombatant = document.querySelector('.combatant.enemy');
flashHit(enemyCombatant);  // Flash effect
shakeElement(enemyCombatant); // Shake effect
playSoundAttack(); // Audio feedback
```

### Settings Persistence
Settings automatically save to localStorage. To add new settings:
1. Add UI control in `index.html` → `#screen-settings`
2. Add to `AudioSettings` object in `audio.js`
3. Wire up event listener in `townUI.js` → `openSettings()`

---

## File Structure

### New Files
- `src/audio.js` - Audio management system
- `ENHANCEMENT_SUMMARY.md` - Detailed documentation
- `QUICK_REFERENCE.md` - This file

### Modified Files
#### Core Systems
- `src/battleSystem.js` - Visual/audio feedback, validation
- `src/gameState.js` - Enhanced save/load, error handling
- `src/renderer.js` - Tooltips, status icons, confirmations
- `src/statuses.js` - Typed logging

#### UI Systems
- `src/townUI.js` - Settings screen, shop improvements
- `src/shops.js` - Purchase validation, audio
- `src/quests.js` - Quest completion audio

#### Styling
- `styles.css` - Animations, status icons, tooltips, shop states

#### Structure
- `index.html` - Settings screen markup

---

## Configuration

### Audio Volume Defaults
Edit in `audio.js`:
```javascript
export const AudioSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7, // 0.0 to 1.0
  musicVolume: 0.4,
};
```

### Animation Timing
Edit in `styles.css`:
```css
.hit-flash { animation: hit-flash 0.4s ease-out; } /* Adjust duration */
.shake { animation: shake 0.3s ease-out; }
.screen:not(.hidden) { animation: screen-fade-in 0.3s ease-out; }
```

### Item Rarity Thresholds
Edit in `renderer.js` and `townUI.js`:
```javascript
getItemRarity(item) {
  if (item.price >= 600) return 'legendary';
  if (item.price >= 400) return 'epic';
  if (item.price >= 150) return 'rare';
  if (item.price >= 50) return 'uncommon';
  return 'common';
}
```

---

## Browser Compatibility

Tested features:
- CSS animations (all modern browsers)
- LocalStorage (IE8+)
- CSS pseudo-elements (all modern browsers)
- RequestAnimationFrame (all modern browsers)

Fallbacks:
- Console logging if audio unavailable
- Static display if animations disabled
- Default settings if localStorage fails

---

## Performance Tips

1. **Disable Animations**: Use settings menu for low-end devices
2. **Clear Browser Cache**: If tooltips don't appear correctly
3. **Check Console**: Audio events log to console for debugging
4. **Save Often**: Auto-save not implemented - use Save button

---

## Troubleshooting

### Tooltips Not Showing
- Check browser supports CSS `::after` pseudo-elements
- Ensure item has `item-tooltip` class and `data-tooltip` attribute

### Animations Not Playing
- Check Settings → "Enable Background Animations"
- Verify CSS loaded correctly (check browser dev tools)
- Try disabling browser extensions

### Sounds Not Playing
- Check console for `[Audio] 🔊 soundName` messages
- Verify Settings → "Enable Sound Effects" is checked
- Audio files not yet added (currently placeholder system)

### Save/Load Issues
- Check browser localStorage is enabled
- Clear localStorage if corrupted: `localStorage.clear()` in console
- Check console for error messages

---

## Known Limitations

1. Audio files are placeholders (console logging only)
2. Combat text speed not adjustable (future feature)
3. Status effects don't stack (refresh duration instead)
4. Tooltips require hover (not touch-friendly yet)
5. Settings screen uses dynamic import (requires module support)

---

## Changelog

### Version 1.1 (This Update)
- Added complete audio system framework
- Implemented visual combat feedback
- Enhanced shop and inventory UI
- Added status effect tooltips
- Improved save/load with confirmations
- Added settings screen
- Screen transition animations
- Comprehensive error handling
- JSDoc documentation throughout

### Version 1.0 (Original)
- Core gameplay systems
- Character creation
- Battle system
- Quest system
- Crafting system
- Talent trees

---

For detailed technical information, see `ENHANCEMENT_SUMMARY.md`
