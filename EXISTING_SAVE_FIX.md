# 🔄 EXISTING SAVE COMPATIBILITY GUIDE

## Problem
All the new updates (dungeon progress counter, NPC unlocks, enemy variety) **don't work for existing accounts** because old save data is missing the new properties.

## ✅ Solution Applied

I've implemented **automatic save migration** that will:

1. **Detect old save versions** (v0, v1, v2)
2. **Automatically upgrade** to v3 when you load the game
3. **Add missing properties** without losing your progress
4. **Grant legacy rewards** to existing players

## 🎁 What You Get (Legacy Players)

When your save is migrated, you'll automatically receive:

- ✅ **3 NPCs unlocked**: Argo, Agil, Lind (as a thank you for playing early!)
- ✅ **Dungeon progress tracking** initialized
- ✅ **Enemy variety** enabled (no more boar-only bug!)
- ✅ **All new features** active immediately

## 🚀 How to Apply the Update

### Step 1: Hard Refresh Browser
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```
This forces the browser to download the new code files.

### Step 2: Load Your Save
1. Open the game normally
2. If you have auto-load enabled, it will load automatically
3. Otherwise, click "Load Game"

### Step 3: Check the Log
You should see this message:
```
💾 Save upgraded from v2 to v3
✨ New features unlocked: Dungeon progress tracking, NPC progression system!
```

### Step 4: Verify Everything Works

**Check NPCs:**
- Click "Talk to NPC" button
- You should see: Argo, Agil, and Lind
- More NPCs will unlock as you level up!

**Check Enemy Variety:**
- Click "Explore Field"
- You should encounter different enemies:
  - Frenzy Boar
  - Little Nepent
  - Dire Wolf
  - Ruin Kobold Sentinel

**Check Dungeon Counter:**
- Once you explore field 2+ times, enter dungeon
- You'll see: `🏰 Dungeon: 1/20 rooms` below your XP bar

## 🐛 Troubleshooting

### Still Only Seeing Boars?
1. **Clear browser cache completely:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Clear data
2. **Hard refresh again:** `Ctrl + F5`
3. **Check console for errors:**
   - Press `F12` → Console tab
   - Look for red error messages

### NPCs Not Showing?
1. **Check console:**
   ```javascript
   console.log(game.player.unlockedNPCs);
   ```
   Should show: `['npc_argo', 'npc_agil', 'npc_lind']`

2. **Force unlock manually (if needed):**
   ```javascript
   game.player.unlockedNPCs = ['npc_argo', 'npc_agil', 'npc_lind'];
   game.save();
   ```

### Migration Not Triggering?
**Check save version:**
```javascript
// In browser console (F12)
const save = JSON.parse(localStorage.getItem('sao_text_demo_v1'));
console.log('Current save version:', save.version);
```

If version is still `0`, `1`, or `2`:
1. Reload the page with hard refresh
2. Click "Load Game" manually
3. Check the log for migration message

### Nuclear Option - Force Migration
If nothing else works, paste this in console:
```javascript
// Load current save
const save = JSON.parse(localStorage.getItem('sao_text_demo_v1'));

// Force upgrade
save.version = 3;
save.player.unlockedNPCs = ['npc_argo', 'npc_agil', 'npc_lind'];
save.fieldProgress = save.fieldProgress || {};
save.dungeonProgress = save.dungeonProgress || {};
save.clearedBosses = save.clearedBosses || [];

// Save back
localStorage.setItem('sao_text_demo_v1', JSON.stringify(save));

// Reload
location.reload();
```

## 📊 Migration Details

### What Gets Migrated:

| Property | Old Save | After Migration |
|----------|----------|-----------------|
| `version` | 0, 1, or 2 | 3 |
| `unlockedNPCs` | Missing | `['npc_argo', 'npc_agil', 'npc_lind']` |
| `fieldProgress` | Missing | `{}` (empty, tracks as you play) |
| `dungeonProgress` | Missing | `{}` (empty, tracks as you play) |
| `clearedBosses` | Missing | `[]` (empty, tracks as you play) |
| All other data | Unchanged | Unchanged |

### What You Keep:

- ✅ Player level, XP, stats
- ✅ Gold and items
- ✅ Equipment
- ✅ Quests and achievements
- ✅ Skills and cooldowns
- ✅ Reputation
- ✅ Current floor

## 🎮 New Features Explained

### 1. Dungeon Progress Counter
- Shows `🏰 Dungeon: X/20 rooms` in Player Status
- Updates as you explore dungeons
- Disappears after beating floor boss

### 2. NPC Unlock System
Instead of all NPCs available at start, you unlock them by:
- **Argo**: Always available (info broker)
- **Agil**: Level 2 OR 50+ gold
- **Lind**: Level 4 OR 1+ boss kill
- **Kibaou**: Level 5 OR 20+ kills
- **Blacksmith**: Level 6 OR Floor 2+
- **Old Hermit**: Floor 3+ OR 10+ quests
- **Rex**: Floor 2+
- **Asuna**: Floor 2+ (quest-based)
- **Klein**: Level 3+ (event-based)
- **Silica**: Level 7+ (event-based)
- **Lizbeth**: Floor 3+ (blacksmith-related)

### 3. Enemy Variety Fix
- Each floor has 4 different enemy types
- Random selection each encounter
- Proper boss spawning for mini-bosses and floor bosses

## ✨ Future-Proof

This migration system is now in place, so all future updates will automatically migrate your save data. You'll never lose progress!

## Need Help?

If you're still having issues after trying all the troubleshooting steps:
1. Open browser console (F12)
2. Type: `console.log(game.player);`
3. Share the output for diagnosis
