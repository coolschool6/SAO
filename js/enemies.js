// Enemy generator using floor definitions; type = 'field' or 'dungeon' or 'boss' or 'fieldboss'
function makeEnemy(floor, type = 'field'){
  const def = FLOOR_DEFS[floor] || null;
  const base = Math.max(1, floor);
  
  // Field Boss (special rare encounter like Grath)
  if(type === 'fieldboss' && def && def.fieldBoss){
    const fb = def.fieldBoss;
    const hp = Math.floor((10 + base * fb.hpMul) * (1 + Math.random()*0.1));
    return {
      name: fb.name,
      hp,
      maxHP: hp,
      atk: fb.atk,
      def: fb.def,
      exp: fb.exp,
      gold: fb.gold,
      isFieldBoss: true,
      cannotFlee: true,
      desc: fb.desc
    };
  }
  
  // Labyrinth/Dungeon Boss
  if(type === 'boss' && def && def.boss){
    const b = def.boss;
    const hp = Math.floor((10 + base * b.hpMul) * (1 + Math.random()*0.08));
    return {
      name: b.name,
      hp,
      maxHP: hp,
      atk: b.atk,
      def: b.def,
      exp: b.exp,
      gold: b.gold,
      isBoss: true,
      id: b.id,
      desc: b.desc
    };
  }
  
  // pick a template from the floor or fallback
  let template;
  if(def && def.enemies && def.enemies.length){
    // In dungeons, enemies are slightly stronger
    template = def.enemies[Math.floor(Math.random()*def.enemies.length)];
    if(type === 'dungeon'){
      // Dungeon enemies get a buff
      template = Object.assign({}, template);
      template.hpMul = (template.hpMul || 1.0) * 1.3;
      template.atkMul = (template.atkMul || 1.0) * 1.2;
      template.exp = Math.floor((template.exp || 10) * 1.5);
      template.gold = Math.floor((template.gold || 5) * 1.3);
    }
  } else {
    template = {name:'Field Beast',hpMul:1.0,atkMul:1.0,exp:10,gold:5};
  }
  
  const hp = Math.max(3, Math.floor((5 + base * template.hpMul) * (1 + Math.random()*0.4)));
  const atk = Math.max(1, Math.floor((1 + base * template.atkMul) + Math.random()*2));
  const dex = Math.max(0, Math.floor(base*0.05));
  const exp = Math.max(1, Math.floor(template.exp + base*2 + Math.random()*8));
  const gold = Math.max(0, Math.floor(template.gold + base*1.2 + Math.random()*6));
  const enemy = {
    name: template.name,
    hp,
    maxHP: hp,
    atk,
    def: dex,
    exp,
    gold,
    desc: template.desc
  };
  
  // simple status-on-hit heuristics based on enemy name/type
  const nm = (enemy.name||'').toLowerCase();
  if(nm.includes('boar') || nm.includes('frenzy')) enemy.statusOnHit = {type:'stun',chance:0.15,turns:1};
  if(nm.includes('nepent') || nm.includes('plant')) enemy.statusOnHit = {type:'poison',chance:0.2,turns:2,value:1};
  if(nm.includes('wolf') || nm.includes('dire')) enemy.statusOnHit = {type:'bleed',chance:0.18,turns:2,value:2};
  if(nm.includes('kobold')) enemy.statusOnHit = {type:'slow',chance:0.12,turns:2};
  // Floor 2 specific enemies
  if(nm.includes('wasp') || nm.includes('wind')) enemy.statusOnHit = {type:'poison',chance:0.25,turns:3,value:2};
  if(nm.includes('scarab') || nm.includes('beetle') || nm.includes('pillbug')) enemy.statusOnHit = {type:'stun',chance:0.2,turns:1};
  if(nm.includes('spider')) enemy.statusOnHit = {type:'poison',chance:0.3,turns:3,value:3};
  if(nm.includes('goblin')) enemy.statusOnHit = {type:'bleed',chance:0.15,turns:2,value:1};
  if(nm.includes('bandit') || nm.includes('rogue')) enemy.statusOnHit = {type:'slow',chance:0.2,turns:2};
  if(nm.includes('ox') || nm.includes('bull')) enemy.statusOnHit = {type:'stun',chance:0.25,turns:2};
  // Generic patterns
  if(nm.includes('slime')) enemy.statusOnHit = {type:'slow',chance:0.25,turns:2};
  if(nm.includes('leech') || nm.includes('bog') || nm.includes('poison')) enemy.statusOnHit = {type:'poison',chance:0.2,turns:3,value:2};
  if(nm.includes('ent') || nm.includes('golem')) enemy.statusOnHit = {type:'regen',chance:0.12,turns:3,value:6};
  
  return enemy;
}
