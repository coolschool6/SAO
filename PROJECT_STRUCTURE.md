# SAO Text Adventure - Project Structure

## 📁 Folder Organization

```
SAO-1/
├── index.html          # Main HTML file
├── server.js           # Development server
├── package.json        # Project dependencies
├── README.md          # Project documentation
│
├── js/                # JavaScript files
│   ├── main.js        # Core game logic
│   ├── config.js      # Game configuration
│   ├── inventory.js   # Inventory system
│   ├── achievements.js # Achievement definitions
│   ├── npcs.js        # NPC data and dialogs
│   ├── enemies.js     # Enemy data
│   ├── battle-adapter.js # Battle screen adapter
│   ├── game.js        # Additional game logic
│   ├── player.js      # Player class
│   ├── utils.js       # Utility functions
│   └── test-features.js # Testing utilities
│
├── css/               # Stylesheets
│   ├── styles.css     # Main styles
│   ├── combat-styles.css # Combat UI styles
│   ├── combat-styles-enhanced.css # Enhanced combat styles
│   └── battle-screen.css # Battle screen styles
│
└── docs/              # Documentation
    ├── BATTLE_SCREEN_IMPLEMENTATION.md
    ├── CHARACTER_ARTWORK_GUIDE.md
    ├── COMBAT_VISUAL_SYSTEM.md
    ├── FLOOR_1_LORE.md
    ├── FLOOR_2_LORE.md
    ├── FUN_FEATURES_SUMMARY.md
    ├── MOBILE_UX_REFACTOR.md
    ├── NEW_FEATURES_PART2.md
    ├── NEW_FEATURES_SUMMARY.md
    ├── OPTIMIZATION_GUIDE.md
    ├── PERFORMANCE_OPTIMIZATIONS.md
    ├── TESTING_GUIDE.md
    ├── UI_REDESIGN.md
    └── V1_PRODUCTION_READINESS_SUMMARY.md
```

## 🚀 Running the Game

1. Start the development server:
   ```bash
   node server.js
   ```

2. Open your browser to:
   ```
   http://localhost:3000
   ```

## 📝 Notes

- All paths in `index.html` have been updated to reference the new folder structure
- JavaScript files are loaded from `js/` folder
- CSS files are loaded from `css/` folder
- Documentation is organized in `docs/` folder
