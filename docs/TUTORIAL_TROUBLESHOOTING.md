# Tutorial & New Player Screen - Troubleshooting Guide

## 🐛 Issue: Tutorial Screen Not Showing

### **Root Cause:**
The tutorial screen (name input and class selection) only appears for **NEW players without any saved game data**. If you have an existing save file in browser storage, the game will automatically load it instead of showing the tutorial.

---

## ✅ **Solution: Start a New Game**

### **Option 1: Use the "New Game" Button** (Recommended)
1. Look for the **"New Game"** button in the command footer (bottom area)
2. Click it
3. Confirm when asked if you want to delete your current save
4. Game will reload with the tutorial screen

### **Option 2: Browser Developer Console**
1. Open your browser's Developer Console:
   - **Chrome/Edge**: Press `F12` or `Ctrl + Shift + I`
   - **Firefox**: Press `F12` or `Ctrl + Shift + K`
   - **Safari**: Enable Developer menu first, then press `Cmd + Option + C`

2. Type this command in the Console tab:
   ```javascript
   localStorage.removeItem('sao_text_demo_v1')
   ```

3. Press Enter

4. Refresh the page (`F5` or `Ctrl + R`)

5. Tutorial should now appear!

### **Option 3: Clear All Browser Data**
1. Open browser settings
2. Find "Clear browsing data" or "Privacy"
3. Select "Cookies and site data" or "Local storage"
4. Clear for the game's website/localhost
5. Refresh the page

---

## 🎓 **Tutorial Flow (New Player Experience)**

When starting fresh, you'll see:

### **1. Welcome Screen**
- Introduction to SAO world
- Game features overview
- Choice: "New Player (With Tutorial)" or "Experienced Player (Skip Tutorial)"

### **2. Name Input (Step 1/3 or 1/2)**
- Enter your character name (2-20 characters)
- Or use default "Player" name

### **3. Archetype Selection (Step 2/3 or 2/2)**
- Choose your class/playstyle:
  - **Berserker**: High ATK, aggressive combat
  - **Tank**: High DEF, defensive play
  - **Scout**: High DEX, evasion focus
  - **Rogue**: High LUCK, critical hits
- This choice is **permanent**

### **4. Tutorial Steps (Step 3/3 - if not skipped)**
- Tutorial Step 1: Exploration
- Tutorial Step 2: Combat
- Tutorial Step 3: Leveling
- Tutorial Step 4: Town Services
- Tutorial Step 5: Quests
- Tutorial Step 6: Tips & Strategy

---

## 🔍 **Checking If You Have a Save File**

### Browser Console Method:
```javascript
// Check if save exists
localStorage.getItem('sao_text_demo_v1') !== null

// View your save data
JSON.parse(localStorage.getItem('sao_text_demo_v1'))
```

If it returns data, you have an existing save that's preventing the tutorial from showing.

---

## 🎮 **Testing the Tutorial**

### **Quick Test Cycle:**
1. Click "New Game" button
2. Confirm deletion
3. Wait for reload
4. Should see Welcome Modal → Name Input → Archetype → Tutorial

### **Skip Tutorial Test:**
1. Start new game
2. Choose "Experienced Player (Skip Tutorial)"
3. Enter name
4. Choose archetype
5. Game starts immediately without tutorial steps

---

## 📝 **Technical Details**

### **How Detection Works:**
```javascript
checkNewPlayer(){
  const hasSave = localStorage.getItem(SAVE_KEY);
  
  if(hasSave){
    // Auto-load existing game
    this.load();
    return;
  }
  
  // No save - show welcome modal
  this.showWelcomeModal();
}
```

### **Save Key:**
- Key: `'sao_text_demo_v1'`
- Storage: Browser LocalStorage
- Scope: Per domain/localhost

---

## 🚨 **Common Issues**

### **Issue 1: Tutorial shows but then disappears**
- **Cause**: Auto-save triggered before completing tutorial
- **Fix**: Complete name and archetype selection quickly, or disable auto-save temporarily

### **Issue 2: "Confirm Name" button not working**
- **Cause**: Name is less than 2 characters
- **Fix**: Enter at least 2 characters for your name

### **Issue 3: Archetype selection stuck**
- **Cause**: JavaScript error or button not responding
- **Fix**: Check browser console for errors, refresh and try again

### **Issue 4: Tutorial skipped even though I didn't choose it**
- **Cause**: Save file has `tutorialComplete: true` flag
- **Fix**: Start a completely new game (clear save first)

---

## 🔧 **For Developers**

### **Force Tutorial to Show (Even With Save):**
```javascript
// In browser console
const game = document.game; // or however you access the game instance
game.player.tutorialComplete = false;
game.player.skipTutorial = false;
game.showWelcomeModal();
```

### **Manually Trigger Each Screen:**
```javascript
// Welcome screen
game.showWelcomeModal();

// Name input
game.showNameInput();

// Archetype selection
game.showArchetypeSelection();

// Tutorial steps
game.showTutorialStep1();
game.showTutorialStep2();
// ... up to step 6
```

---

## ✅ **Verification Checklist**

After clicking "New Game":
- [ ] Browser reloads
- [ ] Welcome modal appears with SAO logo
- [ ] Can choose tutorial or skip
- [ ] Name input screen shows (Step 1/3 or 1/2)
- [ ] Can enter name or use "Player"
- [ ] Archetype selection shows (Step 2/3 or 2/2)
- [ ] Can choose class (Berserker/Tank/Scout/Rogue)
- [ ] Tutorial begins (if not skipped)
- [ ] Game starts after completion

---

## 📞 **Still Having Issues?**

1. **Check browser console** (F12) for JavaScript errors
2. **Try different browser** (Chrome, Firefox, Edge)
3. **Clear all site data** completely
4. **Disable browser extensions** that might interfere
5. **Check if localStorage is enabled** in browser settings

---

## 🎯 **Quick Fix Commands**

Copy and paste into browser console:

```javascript
// Nuclear option - clear everything and restart
localStorage.clear();
location.reload();

// Just clear SAO save
localStorage.removeItem('sao_text_demo_v1');
location.reload();

// Check what's stored
console.log('Save exists:', localStorage.getItem('sao_text_demo_v1') !== null);
```

---

**The tutorial screen is working correctly!** It just needs a fresh start without any existing save data. Use the "New Game" button to test it properly. 🎮✨
