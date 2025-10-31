# SAO Text Adventure - New Features Part 2

This document describes the three newly implemented features that enhance the UX, visual clarity, and RPG identity of the game.

---

## 1. Equipment Preview (#2)

**Purpose**: Help players make informed equipment decisions by showing stat changes before committing to an equip/unequip action.

### Features
- **Real-time stat comparison**: Hover over any equipment item in inventory or the equip modal to see how your ATK and DEF will change
- **Visual delta indicators**: 
  - Green text for stat increases
  - Red text for stat decreases
  - Clear "from → to" format
- **Smart slot handling**: Automatically compares with currently equipped item in the same slot
- **Swap logic**: Properly handles replacing one equipped item with another

### Implementation Details
- **UI Element**: `#equip-preview` div in the player status card
- **Functions**:
  - `showEquipPreview(item)`: Calculates and displays stat deltas
  - `clearEquipPreview()`: Hides preview on mouse leave
- **Event Wiring**: 
  - Inventory items: mouseenter/mouseleave on equipment list items
  - Equip modal: hover on equipment rows
- **CSS**: `.equip-preview` with `.delta-pos` (green) and `.delta-neg` (red) classes

### User Experience
- Hover over any equipment piece to instantly see how it affects your stats
- Make strategic choices about weapon/armor swaps without guesswork
- Visual feedback reduces accidental downgrades

---

## 2. Animated Combat Log (#1)

**Purpose**: Make the combat log more engaging and easier to parse with visual feedback and type-specific styling.

### Features
- **Type-specific styling**: Each log entry type gets a unique colored accent bar:
  - **Attack** (⚔️): Blue accent (`#4fc3f7`)
  - **Heal** (🩹): Green accent (`#66bb6a`)
  - **Gold** (💰): Yellow accent (`#ffd54f`)
  - **Quest** (📜): Purple accent (`#ba68c8`)
  - **Loot** (🎁): Light green accent (`#81c784`)
  - **Boss** (👑): Red accent (`#ef5350`)
  - **Info** (ℹ️): White accent (subtle)
- **Entrance animation**: Each new log entry fades in and slides up smoothly (260ms)
- **Automatic trimming**: Log keeps only the last 120 entries for performance
- **Enhanced readability**: Colored left borders and subtle backgrounds make scanning easier

### Implementation Details
- **Functions**:
  - `log(text, cls, type)`: Enhanced to accept a `type` parameter for styling
  - `logEvent(type, message, detail, cls)`: Now passes type to `log()` for CSS classes
  - `trimLog(max)`: Removes oldest entries when limit exceeded
- **CSS**:
  - `.log-line` base styles with fade-in animation (`logEnter`)
  - `.log-attack`, `.log-heal`, `.log-gold`, etc. for type-specific borders
  - Smooth opacity and transform transitions

### User Experience
- Instantly recognize event types by color without reading icons
- Smooth animations make the log feel more alive
- Performance stays smooth even during long play sessions

---

## 3. Character Archetypes (#4)

**Purpose**: Add meaningful RPG identity and specialization to the player character with unique passive bonuses.

### The Four Archetypes

#### **Striker** (Offensive)
- **Stat Bonus**: +2 ATK
- **Passive**: +5% critical hit chance
- **Playstyle**: High damage output, aggressive combat approach
- **Best For**: Players who want to maximize damage and end fights quickly

#### **Guardian** (Defensive)
- **Stat Bonus**: +2 DEF
- **Passive**: -1 flat damage reduction on all incoming hits
- **Playstyle**: Tanky survivability, reduced damage taken
- **Best For**: Players who want to outlast enemies and survive tough encounters

#### **Rogue** (Evasive)
- **Stat Bonus**: +2 DEX
- **Passive**: +5% dodge chance
- **Playstyle**: Avoidance-based defense, high mobility
- **Best For**: Players who prefer dodging attacks over tanking damage

#### **Sage** (Explorer/Support)
- **Stat Bonus**: +1 Luck
- **Passive**: 
  - +10% XP from all sources
  - +10% item drop chance
- **Playstyle**: Faster progression, better loot acquisition
- **Best For**: Players who want to level faster and find more resources

### Features
- **One-time choice**: Archetype selection is permanent (adds weight to the decision)
- **Stat integration**: Bonuses applied immediately upon selection
- **Combat passives**: 
  - Striker/Rogue bonuses affect crit/dodge calculations in `attackAction()` and `enemyTurn()`
  - Guardian bonus reduces damage in `enemyTurn()`
  - Sage bonuses modify XP gain in `onEnemyDefeated()` and drop rates
- **UI display**: Shows "Archetype: [Name]" in player status panel
- **Choose button**: Opens selection modal; disabled after choice is made
- **Persistence**: Archetype saved in player data (survives save/load)

### Implementation Details
- **Data Structure**: `ARCHETYPES` object with 4 archetype definitions
  - Each contains: `id`, `name`, `desc`, `mods` (stat adjustments), `passives` (special bonuses)
- **Player Property**: `player.archetype` stores chosen archetype ID (null by default)
- **Modal Function**: `showArchetypeModal()` presents choices and applies selection
- **Combat Integration**:
  - `attackAction()`: Adds `ARCHETYPES.striker.passives.critBonus` to crit chance
  - `enemyTurn()`: 
    - Adds `ARCHETYPES.rogue.passives.dodgeBonus` to dodge chance
    - Subtracts `ARCHETYPES.guardian.passives.flatDamageReduction` from damage
  - `onEnemyDefeated()`: Multiplies XP by `ARCHETYPES.sage.passives.xpMult` and adds `dropBonus` to drop chance

### User Experience
- Choose your archetype early to define your character's identity
- Each archetype provides a noticeable gameplay difference
- Permanent choice encourages replayability (try different builds)
- Stat bonuses feel immediately impactful in combat

---

## How to Use

### Equipment Preview
1. Open your inventory or click an equipment slot
2. Hover over any equipment item
3. Check the preview panel for stat changes
4. Decide whether to equip/unequip based on the preview

### Animated Combat Log
- No action needed! The log automatically styles and animates all entries
- Watch for colored accents to quickly identify important events
- The log trims old entries automatically

### Character Archetypes
1. Look for the "Archetype: None" line in your player status
2. Click the **Choose** button next to it
3. Read each archetype's description and bonuses
4. Click **Choose** on your preferred archetype
5. Your stats and passives update immediately
6. The choice is permanent for this save file

---

## Technical Notes

- **Performance**: Log trimming ensures the DOM doesn't bloat during long sessions
- **Accessibility**: Color-coded log entries also include emoji icons for color-blind users
- **Responsive**: Equipment preview adapts to available space
- **Save/Load**: Archetype is saved in `player.toJSON()` and restored in `load()`
- **CSS Animations**: Uses `@keyframes` with `ease` timing for smooth, natural motion

---

## Future Enhancements (Optional)

### Equipment Preview
- Show HP changes for armor with HP bonuses
- Display luck/dex changes for accessories
- Preview multiple stat lines for complex equipment

### Animated Combat Log
- Add sound effects tied to log types
- Implement log filters to show/hide specific event types
- Add "minimize" toggle to collapse log during exploration

### Character Archetypes
- Add advanced archetypes unlocked at higher levels
- Implement hybrid archetype system (combine traits)
- Create archetype-specific quest chains

---

**Status**: ✅ All three features fully implemented and tested  
**Version**: 1.0  
**Date**: 2025
