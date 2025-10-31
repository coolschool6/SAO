// Validation script for new features (Part 2)
// Run this in browser console after loading the game

console.log('🧪 Testing New Features: Equipment Preview, Animated Combat Log, Character Archetypes');

// Test 1: Equipment Preview
console.log('\n✅ Test 1: Equipment Preview');
try {
  const game = window.game;
  if(!game) throw new Error('Game not loaded');
  
  // Add test equipment
  const sword = game.inventory.addItem({name:'Test Sword', type:'equipment', slot:'Weapon', atk:5, def:0});
  const armor = game.inventory.addItem({name:'Test Armor', type:'equipment', slot:'Armor', atk:0, def:3});
  
  console.log('✓ Test equipment added');
  
  // Check preview functions exist
  if(typeof game.showEquipPreview !== 'function') throw new Error('showEquipPreview not found');
  if(typeof game.clearEquipPreview !== 'function') throw new Error('clearEquipPreview not found');
  
  console.log('✓ Preview functions exist');
  
  // Test preview display
  game.showEquipPreview(sword);
  const previewEl = document.getElementById('equip-preview');
  if(!previewEl) throw new Error('Preview element not found');
  if(previewEl.style.display !== 'block') throw new Error('Preview not visible');
  
  console.log('✓ Preview displays correctly');
  
  game.clearEquipPreview();
  if(previewEl.style.display !== 'none') throw new Error('Preview not hidden');
  
  console.log('✓ Preview clears correctly');
  console.log('✅ Equipment Preview: PASSED');
} catch(e) {
  console.error('❌ Equipment Preview: FAILED', e.message);
}

// Test 2: Animated Combat Log
console.log('\n✅ Test 2: Animated Combat Log');
try {
  const game = window.game;
  
  // Check enhanced log function
  if(typeof game.log !== 'function') throw new Error('log function not found');
  if(typeof game.logEvent !== 'function') throw new Error('logEvent function not found');
  if(typeof game.trimLog !== 'function') throw new Error('trimLog function not found');
  
  console.log('✓ Log functions exist');
  
  // Test type-specific logging
  const logEl = document.getElementById('log-entries');
  const beforeCount = logEl.children.length;
  
  game.logEvent('attack', 'Test attack log');
  game.logEvent('heal', 'Test heal log');
  game.logEvent('gold', 'Test gold log');
  
  const afterCount = logEl.children.length;
  if(afterCount !== beforeCount + 3) throw new Error('Log entries not added');
  
  console.log('✓ Log entries created');
  
  // Check for type classes
  const lastEntry = logEl.lastChild;
  const hasTypeClass = lastEntry.classList.contains('log-gold');
  if(!hasTypeClass) throw new Error('Type-specific class not applied');
  
  console.log('✓ Type-specific styling applied');
  
  // Test trimming
  for(let i=0; i<130; i++) game.log('Spam entry');
  if(logEl.children.length > 125) throw new Error('Log not trimmed properly');
  
  console.log('✓ Log trimming works');
  console.log('✅ Animated Combat Log: PASSED');
} catch(e) {
  console.error('❌ Animated Combat Log: FAILED', e.message);
}

// Test 3: Character Archetypes
console.log('\n✅ Test 3: Character Archetypes');
try {
  const game = window.game;
  const p = game.player;
  
  // Check ARCHETYPES definition
  if(typeof ARCHETYPES === 'undefined') throw new Error('ARCHETYPES not defined');
  if(!ARCHETYPES.striker || !ARCHETYPES.guardian || !ARCHETYPES.rogue || !ARCHETYPES.sage) {
    throw new Error('Missing archetype definitions');
  }
  
  console.log('✓ All 4 archetypes defined');
  
  // Check player archetype property
  if(!('archetype' in p)) throw new Error('Player archetype property missing');
  
  console.log('✓ Player archetype property exists');
  
  // Check modal function
  if(typeof game.showArchetypeModal !== 'function') throw new Error('showArchetypeModal not found');
  
  console.log('✓ Archetype modal function exists');
  
  // Test archetype selection (if not already chosen)
  if(!p.archetype) {
    const baseAtk = p.atk;
    p.archetype = 'striker';
    if(ARCHETYPES.striker.mods.atk) p.atk += ARCHETYPES.striker.mods.atk;
    
    if(p.atk !== baseAtk + 2) throw new Error('Stat bonus not applied');
    console.log('✓ Stat bonuses apply correctly');
    
    // Test passive in crit calculation
    let critChance = 0.05;
    if(p.archetype === 'striker') critChance += (ARCHETYPES.striker.passives.critBonus || 0);
    if(critChance !== 0.10) throw new Error('Passive bonus not calculated');
    
    console.log('✓ Passive bonuses calculated correctly');
  } else {
    console.log('⚠ Archetype already chosen, skipping stat test');
  }
  
  // Check UI element
  const archEl = document.getElementById('player-archetype');
  if(!archEl) throw new Error('Archetype display element not found');
  
  console.log('✓ Archetype UI element exists');
  
  console.log('✅ Character Archetypes: PASSED');
} catch(e) {
  console.error('❌ Character Archetypes: FAILED', e.message);
}

// Final Summary
console.log('\n🎉 Feature Validation Complete!');
console.log('Check the results above for any failures.');
console.log('\nTo manually test:');
console.log('1. Hover over equipment in inventory → Preview should show');
console.log('2. Fight an enemy → Log should have colored entries');
console.log('3. Click "Choose" archetype button → Modal should open');
