# SAO — Text Adventure (Demo)

This is a client-side text-based demo inspired by Sword Art Online. It's intentionally simple and runs entirely in the browser (no server required).

## Features

### Core Systems
- **Multi-Floor Progression**: 100 unique floors with themed environments, scaling enemies, and epic boss battles
- **Turn-Based Combat**: Strategic combat with attack, defend, flee, skills, and items
- **Quest System**: Accept quests from NPCs and the Quest Board; track progress in real-time
- **Achievement System**: 30+ achievements across combat, exploration, progression, economy, and special categories
- **Inventory & Equipment**: Collect, equip, and upgrade weapons and armor
- **Skills**: Unlock active and passive skills as you level up
- **Town Hub**: Visit the blacksmith, market, storage, and quest board

### Visual & UX Enhancements
- **Quest Tracker Sidebar**: Live quest progress with click-to-expand details and completion glow
- **Equipment Preview**: Hover over items to see stat changes before equipping (green/red deltas)
- **Animated Combat Log**: Type-specific colors and smooth entrance animations
- **Combat Combo System**: Build combos for damage bonuses, guaranteed crits, and healing
- **Character Archetypes**: Choose from Striker, Guardian, Rogue, or Sage for unique passive bonuses
- **Dynamic Backgrounds**: Environments change based on floor theme (forest, ice, volcano, etc.)

### Progression & Depth
- **Status Effects**: Poison, slow, stun, regen, guard, and weakened
- **Critical Hits & Dodging**: Luck/Dex-based mechanics with visual feedback
- **Boss Arena**: Use Boss Keys from dungeon mini-bosses to challenge floor bosses
- **Field Bosses**: Rare encounters with exclusive loot
- **Storage System**: Stash items in town for safe keeping
- **Escort & Delivery Quests**: Multi-step quest types with special mechanics

## Files
- `index.html` — Main page and UI structure
- `styles.css` — Visual styling with animations and responsive design
- `main.js` — Core game engine: combat, progression, quests, save/load
- `inventory.js` — Inventory management and equipment system
- `achievements.js` — Achievement definitions and reward logic
- `npcs.js` — NPC data and dialogue
- `config.js` — Game configuration and constants
- `NEW_FEATURES_SUMMARY.md` — Documentation for Quest Tracker, Achievements, and Combos
- `NEW_FEATURES_PART2.md` — Documentation for Equipment Preview, Animated Log, and Archetypes

## How to Run
1. Open `index.html` in your browser (double-click or serve with a static server).
2. Use the buttons to explore fields/dungeons, talk to NPCs, accept quests, and gain XP.
3. Enable "Auto-explore" to have the game explore the field every 3 seconds.
4. Use Save / Load to persist progress in your browser's localStorage.
5. Click "Choose" to select your character archetype (permanent choice!).

## Tips
- Visit town often to rest, upgrade equipment, and turn in completed quests
- Hover over equipment to preview stat changes before equipping
- Build combat combos by landing consecutive hits without taking damage
- Choose your archetype carefully — it's permanent and defines your playstyle!
- Complete achievements for bonus gold rewards

License: use and modify freely for learning and prototyping.

