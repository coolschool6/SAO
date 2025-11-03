# 🎨 Character Artwork Integration Guide

## 📋 Overview

This guide shows you how to replace the emoji placeholders with actual character artwork in the new battle screen UI.

## 🖼️ Current Placeholders

### Player Character
- **Current:** ⚔️ emoji
- **Location:** `#player-character-art` in HTML
- **ID:** `.character-placeholder` inside player display

### Enemy Character
- **Current:** 🐗 emoji (changes per enemy type)
- **Location:** `#enemy-character-art` in HTML
- **ID:** `.character-placeholder` inside enemy display

## 🎯 Recommended Artwork Specifications

### Image Specs:
- **Format:** PNG with transparency (recommended) or JPG
- **Size:** 256x256px minimum, 512x512px ideal
- **Aspect Ratio:** 1:1 (square)
- **Color Mode:** RGB
- **File Size:** < 500KB for fast loading

### Style Recommendations:
- **Player:** Heroic pose, facing right
- **Enemy:** Menacing pose, facing left
- **Background:** Transparent or solid color to remove
- **Lighting:** Consistent with dark forest theme
- **Detail Level:** Medium to high (visible at 180px display)

## 🔧 Implementation Methods

### Method 1: Direct HTML Replacement (Simplest)

**For Player Character:**

Find this in `index.html` (around line 220):
```html
<div id="player-character-art" class="player-character-art">
  <div class="character-placeholder">
    <span class="character-icon">⚔️</span>
    <div class="character-label">KIRITO</div>
  </div>
</div>
```

Replace with:
```html
<div id="player-character-art" class="player-character-art">
  <img src="images/kirito-art.png" alt="Kirito" class="character-artwork">
  <div class="character-label">KIRITO</div>
</div>
```

**For Enemy Character:**

Find this in `index.html` (around line 240):
```html
<div id="enemy-character-art" class="enemy-character-art">
  <div class="character-placeholder enemy-placeholder">
    <span class="character-icon">🐗</span>
    <div class="character-label enemy-label">FRENZY BOAR</div>
  </div>
</div>
```

Replace with:
```html
<div id="enemy-character-art" class="enemy-character-art">
  <img src="images/frenzy-boar.png" alt="Frenzy Boar" id="enemy-art-img" class="character-artwork">
  <div class="character-label enemy-label">FRENZY BOAR</div>
</div>
```

### Method 2: CSS Background Images

Add to `battle-screen.css`:
```css
/* Player character artwork */
.player-character-art .character-placeholder {
  background-image: url('../images/kirito-art.png');
  background-size: cover;
  background-position: center;
  width: 160px;
  height: 160px;
}

.player-character-art .character-icon {
  display: none; /* Hide emoji */
}

/* Enemy character artwork */
.enemy-character-art .character-placeholder {
  background-image: url('../images/frenzy-boar.png');
  background-size: cover;
  background-position: center;
  width: 160px;
  height: 160px;
}

.enemy-character-art .character-icon {
  display: none; /* Hide emoji */
}
```

### Method 3: Dynamic JavaScript (Most Flexible)

Add to `main.js` in the `updateCombatUI()` method:

```javascript
// In updateCombatUI() method, after enemy info update:
updateCombatUI(){
  // ... existing code ...
  
  // Update player artwork
  const playerArt = document.querySelector('#player-character-art .character-icon');
  if(playerArt){
    playerArt.innerHTML = `<img src="images/${this.player.name.toLowerCase()}-art.png" 
                                 alt="${this.player.name}" 
                                 class="character-artwork">`;
  }
  
  // Update enemy artwork dynamically based on enemy type
  if(enemy){
    const enemyArt = document.querySelector('#enemy-character-art .character-icon');
    if(enemyArt){
      const enemyImage = enemy.name.toLowerCase().replace(/ /g, '-');
      enemyArt.innerHTML = `<img src="images/enemies/${enemyImage}.png" 
                                 alt="${enemy.name}" 
                                 class="character-artwork">`;
    }
  }
}
```

## 📁 Recommended Folder Structure

```
SAO-1/
├── images/
│   ├── player/
│   │   ├── kirito-art.png
│   │   ├── asuna-art.png
│   │   └── ...
│   ├── enemies/
│   │   ├── frenzy-boar.png
│   │   ├── dire-wolf.png
│   │   ├── forest-spider.png
│   │   └── ...
│   └── bosses/
│       ├── floor-1-boss.png
│       └── ...
├── battle-screen.css
├── index.html
└── main.js
```

## 🎨 CSS Styling for Artwork

Add these styles to `battle-screen.css` to properly display images:

```css
/* Character artwork image styling */
.character-artwork {
  width: 160px;
  height: 160px;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 0 20px currentColor);
  animation: characterBreath 3s ease-in-out infinite;
}

/* Player artwork specific */
.player-character-art .character-artwork {
  filter: drop-shadow(0 0 25px rgba(79, 195, 247, 0.8));
}

/* Enemy artwork specific */
.enemy-character-art .character-artwork {
  filter: drop-shadow(0 0 25px rgba(229, 57, 53, 0.8));
}

/* Breathing animation for characters */
@keyframes characterBreath {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

/* On attack animation */
.character-artwork.attacking {
  animation: attackLunge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes attackLunge {
  0% {
    transform: scale(1) translateX(0);
  }
  50% {
    transform: scale(1.1) translateX(15px);
  }
  100% {
    transform: scale(1) translateX(0);
  }
}

/* On hit animation */
.character-artwork.hit {
  animation: hitFlash 0.4s ease-out;
}

@keyframes hitFlash {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(2) saturate(2) hue-rotate(-30deg);
  }
}
```

## 🎭 Advanced: Multiple Character Poses

For dynamic poses (attack, defend, idle, hit):

### HTML Structure:
```html
<div id="player-character-art" class="player-character-art">
  <img src="images/kirito-idle.png" id="player-art-img" class="character-artwork" alt="Kirito">
  <div class="character-label">KIRITO</div>
</div>
```

### JavaScript to Swap Poses:
```javascript
// In main.js, create helper function:
changeCharacterPose(target, pose){
  const imgEl = document.getElementById(`${target}-art-img`);
  if(!imgEl) return;
  
  const character = target === 'player' ? this.player.name.toLowerCase() : 
                    this.currentEnemy.name.toLowerCase().replace(/ /g, '-');
  
  imgEl.src = `images/${target === 'player' ? 'player' : 'enemies'}/${character}-${pose}.png`;
  
  // Add animation class
  imgEl.classList.add(pose);
  setTimeout(() => imgEl.classList.remove(pose), 600);
}

// Usage in combat:
// When player attacks:
this.changeCharacterPose('player', 'attack');

// When player takes damage:
this.changeCharacterPose('player', 'hit');

// When player defends:
this.changeCharacterPose('player', 'defend');
```

## 🖌️ Free Art Resources

### Where to Find Character Art:

1. **OpenGameArt.org**
   - Free game assets
   - RPG character sprites
   - License: CC0/CC-BY

2. **Itch.io Assets**
   - Search: "RPG character sprites"
   - Many free/paid options
   - Check license terms

3. **Kenney.nl**
   - Free game assets
   - Consistent art style
   - Public domain

4. **CraftPix.net**
   - Free game graphics
   - Character packs
   - Some premium options

### Creating Custom Art:

1. **Commission an Artist**
   - Fiverr, Upwork, ArtStation
   - Specify: 256x256px PNG, transparent
   - Budget: $10-$50 per character

2. **AI Art Generation**
   - Midjourney, Stable Diffusion
   - Prompt: "RPG character, battle stance, transparent background"
   - May need manual cleanup

3. **Edit Existing Assets**
   - Use GIMP or Photoshop
   - Combine/modify free assets
   - Respect licenses

## 🔄 Enemy Art Dynamic Loading

For enemies that change per floor/type:

```javascript
// Add to config.js FLOOR_DEFS:
FLOOR_DEFS: [
  {
    floor: 1,
    enemies: [
      { 
        name: 'Frenzy Boar', 
        artwork: 'frenzy-boar.png',
        // ... other stats
      },
      { 
        name: 'Forest Spider', 
        artwork: 'forest-spider.png',
        // ... other stats
      }
    ]
  }
]

// In main.js updateCombatUI():
if(enemy && enemy.artwork){
  const enemyImg = document.getElementById('enemy-art-img');
  if(enemyImg){
    enemyImg.src = `images/enemies/${enemy.artwork}`;
    enemyImg.alt = enemy.name;
  }
}
```

## ✅ Testing Your Artwork

### Checklist:
- [ ] Image loads without errors (check console)
- [ ] Image scales properly to 180px circle
- [ ] Transparent background shows correctly
- [ ] Colors match theme (blue for player, red for enemy)
- [ ] Animations still work (idle, attack, hit)
- [ ] Label text still visible below image
- [ ] Glow effects apply to artwork
- [ ] Mobile view displays correctly

### Common Issues:

**Issue: Image not showing**
- Check file path is correct
- Verify image file exists
- Check console for 404 errors
- Try absolute path: `/images/...`

**Issue: Image stretched/squished**
- Use `object-fit: contain` in CSS
- Verify image is square (1:1 ratio)
- Check parent container size

**Issue: Animations not working**
- Verify animation classes applied to `<img>` tag
- Check CSS targets `.character-artwork`
- Ensure keyframes defined in CSS

## 🎬 Example: Complete Implementation

### 1. Add images to folder:
```
SAO-1/images/player/kirito-art.png
SAO-1/images/enemies/frenzy-boar.png
```

### 2. Update HTML (index.html):
```html
<!-- Player -->
<div id="player-character-art" class="player-character-art">
  <img src="images/player/kirito-art.png" alt="Kirito" class="character-artwork">
  <div class="character-label">KIRITO</div>
</div>

<!-- Enemy -->
<div id="enemy-character-art" class="enemy-character-art">
  <img src="images/enemies/frenzy-boar.png" alt="Frenzy Boar" id="enemy-art-img" class="character-artwork">
  <div class="character-label enemy-label">FRENZY BOAR</div>
</div>
```

### 3. Add CSS (battle-screen.css):
```css
.character-artwork {
  width: 160px;
  height: 160px;
  object-fit: contain;
  filter: drop-shadow(0 0 25px currentColor);
}
```

### 4. Test in browser:
- Clear cache (Ctrl+F5)
- Enter battle
- Verify images show correctly

## 🎉 You're Done!

Once artwork is implemented, your battle screen will look professional and polished!

**Next Steps:**
- Add more enemy artwork for variety
- Create attack/defend pose variations
- Add particle effects around characters
- Implement victory pose animations
