# 🔧 Enemy Randomization Bug Fix

## Problem
Players are only encountering **Frenzy Boar** enemies regardless of:
- Current floor
- Location (field vs dungeon)
- Enemy type (regular vs boss)

## Root Cause Analysis
Most likely causes:
1. **Browser cache** - Old JavaScript files cached, preventing new code from loading
2. **Old save data** - Corrupted or outdated save might be causing issues
3. **Math.random() seeding** - Rare issue where RNG always returns same value

## Solution Steps

### Step 1: Clear Browser Cache (MOST IMPORTANT)
**For All Browsers:**
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

**OR use Hard Refresh:**
- `Ctrl + F5` (Windows)
- `Cmd + Shift + R` (Mac)

### Step 2: Clear Game Save Data
1. Open the game in your browser
2. Press `F12` to open Developer Console
3. Go to the **Console** tab
4. Type this command and press Enter:
   ```javascript
   localStorage.clear(); location.reload();
   ```
5. This will delete your save and restart the game fresh

### Step 3: Test Enemy Randomization
1. Open `test-enemies.html` in your browser
2. This will automatically generate 20 random enemies
3. **Expected Result:** You should see a mix of:
   - Frenzy Boar
   - Little Nepent
   - Dire Wolf
   - Ruin Kobold Sentinel
4. **If you still only see Boars:** The issue is deeper

### Step 4: Verify in Console
1. Open the game (`index.html`)
2. Press `F12` for Developer Console
3. Go to **Console** tab
4. Type these commands one by one:
   ```javascript
   // Check if FLOOR_DEFS is loaded
   console.log('FLOOR_DEFS:', FLOOR_DEFS[1]);
   
   // Check enemies array
   console.log('Enemies:', FLOOR_DEFS[1].enemies);
   
   // Test enemy generation manually
   for(let i=0; i<10; i++) {
     const e = makeEnemy(1, 'field');
     console.log(i+1, e.name);
   }
   ```
5. **Expected:** You should see different enemy names in the loop

## Changes Made

### 1. `js/enemies.js` - Enemy Generator
- ✅ Already has proper randomization: `Math.floor(Math.random()*def.enemies.length)`
- ✅ Correctly selects from FLOOR_DEFS enemy pool
- ✅ No changes needed - code is correct

### 2. `index.html` - Cache Busting
- ✅ Added version parameters to script tags: `?v=1.1`
- This forces browsers to download fresh copies of JavaScript files

### 3. `test-enemies.html` - Testing Tool
- ✅ New file created to test enemy randomization in isolation
- Generates 20 enemies and shows distribution statistics
- Opens automatically to test on load

## Verification Checklist

After following the steps above:

- [ ] Hard refresh browser (`Ctrl+F5`)
- [ ] Clear localStorage (console: `localStorage.clear()`)
- [ ] Open `test-enemies.html` - see variety?
- [ ] Open game and explore field - see different enemies?
- [ ] Enter dungeon - see different enemies?
- [ ] Check console for any JavaScript errors

## If Problem Persists

If you still only see Boars after ALL these steps:

1. **Check Browser Console for Errors**
   - Look for red error messages
   - Screenshot and share them

2. **Test in Different Browser**
   - Try Chrome if using Firefox
   - Try Firefox if using Chrome
   - Try Incognito/Private mode

3. **Verify File Integrity**
   - Make sure `js/enemies.js` was saved correctly
   - Check that `js/config.js` has all 4 enemies defined in FLOOR_DEFS[1]

4. **Last Resort - Fresh Copy**
   - Back up your save: `localStorage.getItem('sao_text_demo_v1')`
   - Delete the entire SAO-1 folder
   - Re-download/copy fresh files
   - Restore save if needed

## Expected Enemy Variety

**Floor 1 (Field & Dungeon):**
- Frenzy Boar (25% chance)
- Little Nepent (25% chance)
- Dire Wolf (25% chance)
- Ruin Kobold Sentinel (25% chance)

Each enemy should appear roughly equally over multiple encounters.

## Contact
If none of these solutions work, the issue may be with:
- Browser JavaScript engine
- System-level RNG seeding
- Corrupted FLOOR_DEFS data structure

Share console output from Step 4 for further diagnosis.
