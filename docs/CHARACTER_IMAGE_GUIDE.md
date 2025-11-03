# Character Image Integration Guide

## 📸 Adding Character Art to Battle Screen

The battle screen now supports **actual character images** alongside the emoji placeholder fallbacks!

## 🎨 Image Specifications

### Player Character (Kirito)
- **Path**: `assets/player_kirito.png`
- **Recommended Size**: 400x600px - 800x1200px
- **Format**: PNG with transparency
- **Style**: Full-body character art, standing pose
- **Background**: Transparent
- **Positioning**: Character should be centered/bottom-aligned in the image

### Enemy Characters
- **Path**: `assets/enemies/[enemy_name].png`
- **Examples**: 
  - `assets/enemies/frenzy_boar.png`
  - `assets/enemies/ruin_kobold_sentinel.png`
  - `assets/enemies/forest_guardian.png`
- **Recommended Size**: 400x600px - 800x1200px
- **Format**: PNG with transparency
- **Style**: Full-body or prominent creature art
- **Background**: Transparent

## 📁 Folder Structure

```
SAO-1/
├── assets/
│   ├── player_kirito.png         # Main player character
│   ├── backgrounds/               # Optional battle backgrounds
│   │   ├── forest_night.jpg
│   │   ├── dungeon_depths.jpg
│   │   └── boss_arena.jpg
│   └── enemies/                   # Enemy character images
│       ├── frenzy_boar.png
│       ├── ruin_kobold_sentinel.png
│       ├── forest_wolf.png
│       └── floor_boss.png
```

## 🔧 How It Works

### Automatic Fallback System
The battle screen has a smart image loading system:

1. **Image Available**: Character art displays with glow effects
2. **Image Missing/Failed**: Falls back to emoji placeholder (⚔️ for player, creature emoji for enemy)
3. **No Manual Changes Needed**: The system auto-detects image availability

### HTML Structure (Already Implemented)
```html
<!-- Player -->
<img id="player-char-img" class="character-image" 
     src="assets/player_kirito.png" 
     style="display:none;" 
     onerror="this.style.display='none';" 
     onload="this.style.display='block'; this.parentElement.querySelector('.character-placeholder').style.display='none';">

<!-- Enemy (dynamically set by JavaScript) -->
<img id="enemy-char-img" class="character-image" 
     src="" 
     style="display:none;">
```

## 💻 JavaScript Integration

### Setting Enemy Images Dynamically

In your `main.js` when starting combat:

```javascript
fight(enemy){
  // ... existing code ...
  
  // Set enemy character image
  const enemyImg = document.getElementById('enemy-char-img');
  const enemyPlaceholder = document.querySelector('.enemy-placeholder');
  
  // Try to load enemy-specific image
  const enemyImagePath = `assets/enemies/${enemy.name.toLowerCase().replace(/\s+/g, '_')}.png`;
  enemyImg.src = enemyImagePath;
  
  // If image loads successfully, hide placeholder
  enemyImg.onload = function() {
    this.style.display = 'block';
    if(enemyPlaceholder) enemyPlaceholder.style.display = 'none';
  };
  
  // If image fails, keep using placeholder
  enemyImg.onerror = function() {
    this.style.display = 'none';
    if(enemyPlaceholder) enemyPlaceholder.style.display = 'flex';
  };
  
  // ... rest of combat code ...
}
```

## 🎨 Creating Character Art

### Option 1: AI Art Generation
Use tools like:
- **Midjourney**: `/imagine anime character warrior black sword art online style`
- **DALL-E 3**: "Full body anime character, male swordsman, black coat, detailed"
- **Stable Diffusion**: With anime model, prompt for SAO-style characters

### Option 2: Commission Artists
- **Fiverr**: Search "anime character art" or "SAO style art"
- **DeviantArt**: Commission section
- **ArtStation**: Professional character artists

### Option 3: Use Existing Art (With Permission)
- Ensure you have rights/permission to use the image
- Credit the artist in your README
- Use royalty-free anime character databases

### Option 4: Temporary Placeholders
Until you get proper art, use these free resources:
- **Placeholder Images**: Use colored silhouettes
- **Icon Libraries**: Large fantasy character icons
- **Open Game Art**: opengameart.org has free character sprites

## 📝 Image Guidelines

### DO:
- ✅ Use transparent backgrounds (PNG)
- ✅ Center character in the image
- ✅ Keep consistent art style across all characters
- ✅ Optimize file sizes (under 500KB per image)
- ✅ Use descriptive filenames (e.g., `forest_wolf.png` not `img1.png`)

### DON'T:
- ❌ Use copyrighted images without permission
- ❌ Mix drastically different art styles
- ❌ Use huge file sizes (no 5MB+ images)
- ❌ Include backgrounds in character images (breaks the immersion)

## 🚀 Testing Your Images

1. Add your image to `assets/` folder
2. Refresh the game in browser (Ctrl+F5 to clear cache)
3. Start a battle
4. Image should appear automatically
5. If not, check browser console (F12) for errors

## 🐛 Troubleshooting

### Image Not Showing?
1. **Check file path**: Ensure `assets/player_kirito.png` exists
2. **Check file name**: Exact spelling, case-sensitive on some systems
3. **Check file format**: Must be `.png`, `.jpg`, or `.webp`
4. **Browser cache**: Hard refresh (Ctrl+F5)
5. **Console errors**: Open DevTools (F12) and check for errors

### Image Shows But Looks Wrong?
1. **Check aspect ratio**: Should be portrait (taller than wide)
2. **Check transparency**: Background should be transparent
3. **Check size**: Very large images may look pixelated when scaled

## 🎯 Quick Start

**No images yet? No problem!**

The system works perfectly with emoji placeholders. Add images when you're ready:

1. Create `assets` folder (already done ✅)
2. Add `player_kirito.png` when ready
3. Add enemy images to `assets/enemies/` as needed
4. Refresh game - images load automatically!

The game will continue to work beautifully with or without actual character art! 🎮✨
