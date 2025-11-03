// Quick diagnostic script to test enemy randomization
// Open browser console and paste this entire script to test

console.log('=== ENEMY RANDOMIZATION DIAGNOSTIC ===\n');

// Test 1: Check if FLOOR_DEFS exists
console.log('✓ Test 1: Checking FLOOR_DEFS...');
if (typeof FLOOR_DEFS === 'undefined') {
  console.error('❌ FLOOR_DEFS is not defined! config.js not loaded properly.');
} else {
  console.log('✅ FLOOR_DEFS exists');
  console.log('   Floor 1 data:', FLOOR_DEFS[1] ? 'Found' : 'Missing');
  if (FLOOR_DEFS[1]) {
    console.log('   Enemies defined:', FLOOR_DEFS[1].enemies ? FLOOR_DEFS[1].enemies.length : 0);
    if (FLOOR_DEFS[1].enemies) {
      console.log('   Enemy names:', FLOOR_DEFS[1].enemies.map(e => e.name).join(', '));
    }
  }
}

console.log('\n✓ Test 2: Checking makeEnemy function...');
if (typeof makeEnemy === 'undefined') {
  console.error('❌ makeEnemy is not defined! enemies.js not loaded properly.');
} else {
  console.log('✅ makeEnemy function exists');
}

console.log('\n✓ Test 3: Testing Math.random()...');
const randoms = [];
for(let i = 0; i < 10; i++) {
  randoms.push(Math.random());
}
const allSame = randoms.every(r => r === randoms[0]);
if (allSame) {
  console.error('❌ Math.random() is broken - returns same value!');
} else {
  console.log('✅ Math.random() is working correctly');
  console.log('   Sample values:', randoms.slice(0, 5).map(r => r.toFixed(4)).join(', '));
}

console.log('\n✓ Test 4: Generating 20 enemies...');
if (typeof makeEnemy !== 'undefined' && typeof FLOOR_DEFS !== 'undefined') {
  const enemyCounts = {};
  const enemyDetails = [];
  
  for(let i = 0; i < 20; i++) {
    try {
      const enemy = makeEnemy(1, 'field');
      enemyCounts[enemy.name] = (enemyCounts[enemy.name] || 0) + 1;
      enemyDetails.push(`  ${i+1}. ${enemy.name}`);
    } catch(error) {
      console.error(`❌ Error generating enemy ${i+1}:`, error);
    }
  }
  
  console.log(enemyDetails.join('\n'));
  
  console.log('\n✓ Test 5: Distribution analysis...');
  const uniqueEnemies = Object.keys(enemyCounts).length;
  
  if (uniqueEnemies === 1) {
    console.error('❌ PROBLEM DETECTED: Only 1 enemy type generated!');
    console.error('   This confirms the randomization bug.');
  } else if (uniqueEnemies < 3) {
    console.warn('⚠️ WARNING: Low diversity - only ' + uniqueEnemies + ' enemy types.');
  } else {
    console.log('✅ Good diversity: ' + uniqueEnemies + ' different enemy types');
  }
  
  console.log('\nDistribution:');
  Object.entries(enemyCounts).forEach(([name, count]) => {
    const percentage = (count / 20 * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / 2));
    console.log(`  ${name}: ${count} (${percentage}%) ${bar}`);
  });
  
  console.log('\n✓ Test 6: Testing dungeon enemies...');
  const dungeonCounts = {};
  for(let i = 0; i < 10; i++) {
    const enemy = makeEnemy(1, 'dungeon');
    dungeonCounts[enemy.name] = (dungeonCounts[enemy.name] || 0) + 1;
  }
  console.log('Dungeon enemy types:', Object.keys(dungeonCounts).length);
  console.log('Names:', Object.keys(dungeonCounts).join(', '));
  
  console.log('\n✓ Test 7: Testing boss...');
  try {
    const boss = makeEnemy(1, 'boss');
    console.log('✅ Boss generated:', boss.name);
    console.log('   isBoss flag:', boss.isBoss ? 'Yes' : 'No');
  } catch(error) {
    console.error('❌ Error generating boss:', error);
  }
  
} else {
  console.error('❌ Cannot run tests - required functions/data missing');
}

console.log('\n=== DIAGNOSTIC COMPLETE ===');
console.log('\n📋 SUMMARY:');
if (typeof FLOOR_DEFS !== 'undefined' && typeof makeEnemy !== 'undefined') {
  const testEnemy = makeEnemy(1, 'field');
  if (testEnemy.name === 'Frenzy Boar') {
    console.log('⚠️  Generated Frenzy Boar - if this happens every time, there IS a problem.');
  } else {
    console.log('✅ Generated ' + testEnemy.name + ' - system appears to be working!');
  }
  console.log('\n💡 If you only see Frenzy Boar above, try:');
  console.log('   1. Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)');
  console.log('   2. Clear cache: Ctrl+Shift+Delete');
  console.log('   3. Clear save: localStorage.clear(); location.reload();');
} else {
  console.log('❌ Core functions missing - script files not loaded correctly');
}
