// Simple text-based SAO-inspired adventure (client-side only)
(() => {
  const MAX_FLOORS = 100;
  const SAVE_KEY = 'sao_text_demo_v1';

  // First 10 floor definitions (unique themes, enemies, bosses, and quests)
  const FLOOR_DEFS = {
    1: {
      name: 'Green Plains', theme: 'meadow', dungeonRooms: 3,
      enemies: [
        {name:'Slime',hpMul:0.8,atkMul:0.6,exp:6,gold:4},
        {name:'Field Hare',hpMul:1.0,atkMul:0.8,exp:8,gold:6},
        {name:'Giant Beetle',hpMul:1.2,atkMul:1.0,exp:10,gold:8}
      ],
      boss: {id:'boss1',name:'Slime King',hpMul:6,atk:4,def:1,exp:120,gold:80},
      quests: [{id:'f1q1',title:'Clear the Meadow',desc:'Defeat 8 Slimes or field monsters on Floor 1',type:'kill',target:8,reward:{xp:120,gold:80}}]
    },
    2: {
      name: 'Whispering Woods', theme:'forest', dungeonRooms:4,
      enemies:[{name:'Forest Imp',hpMul:1.2,atkMul:1.0,exp:12,gold:8},{name:'Dire Wolf',hpMul:1.6,atkMul:1.4,exp:18,gold:12}],
      boss:{id:'boss2',name:'Ancient Ent',hpMul:8,atk:6,def:2,exp:220,gold:150},
      quests:[{id:'f2q1',title:'Gather Bark',desc:'Collect 4 Bark Fragments from the woods',type:'gather',target:4,reward:{xp:140,gold:90}}]
    },
    3: {
      name: 'Crystal Caves', theme:'cave', dungeonRooms:5,
      enemies:[{name:'Cave Bat',hpMul:1.4,atkMul:1.2,exp:14,gold:10},{name:'Crystal Golem',hpMul:2.0,atkMul:1.6,exp:26,gold:20}],
      boss:{id:'boss3',name:'Glimmer Golem',hpMul:10,atk:8,def:3,exp:360,gold:240},
      quests:[{id:'f3q1',title:'Mine Crystals',desc:'Bring back 3 Raw Crystals from Floor 3 caves',type:'gather',target:3,reward:{xp:200,gold:140}}]
    },
    4: {
      name:'Sunken Marsh', theme:'swamp', dungeonRooms:5,
      enemies:[{name:'Swamp Leech',hpMul:1.6,atkMul:1.4,exp:18,gold:12},{name:'Bog Troll',hpMul:2.4,atkMul:1.8,exp:30,gold:22}],
      boss:{id:'boss4',name:'Marsh Colossus',hpMul:12,atk:9,def:4,exp:480,gold:320},
      quests:[{id:'f4q1',title:'Clear the Bog',desc:'Defeat 6 swamp creatures on Floor 4',type:'kill',target:6,reward:{xp:260,gold:180}}]
    },
    5: {
      name:'Scarlet Dunes', theme:'desert', dungeonRooms:6,
      enemies:[{name:'Sand Serpent',hpMul:1.8,atkMul:1.6,exp:22,gold:16},{name:'Dune Raider',hpMul:2.2,atkMul:1.8,exp:28,gold:20}],
      boss:{id:'boss5',name:'Scourge of Dunes',hpMul:14,atk:11,def:5,exp:640,gold:420},
      quests:[{id:'f5q1',title:'Find the Oasis Relic',desc:'Recover the Oasis Relic from the dunes (1)',type:'gather',target:1,reward:{xp:320,gold:240}}]
    },
    6: {name:'Frost Reach',theme:'ice',dungeonRooms:6,
      enemies:[{name:'Frostling',hpMul:2.0,atkMul:1.8,exp:30,gold:20},{name:'Ice Wolf',hpMul:2.6,atkMul:2.0,exp:36,gold:26}],
      boss:{id:'boss6',name:'Glacier Wyrm',hpMul:16,atk:13,def:6,exp:840,gold:560},
      quests:[{id:'f6q1',title:'Hunt the Ice Wolves',desc:'Defeat 5 Ice Wolves on Floor 6',type:'kill',target:5,reward:{xp:380,gold:260}}]
    },
    7: {name:'Sky Terrace',theme:'sky',dungeonRooms:4,
      enemies:[{name:'Gale Sprite',hpMul:1.6,atkMul:1.6,exp:26,gold:18},{name:'Storm Drake',hpMul:3.0,atkMul:2.6,exp:48,gold:40}],
      boss:{id:'boss7',name:'Tempest Drake',hpMul:18,atk:15,def:7,exp:960,gold:680},
      quests:[{id:'f7q1',title:'Calm the Winds',desc:'Defeat 3 Storm Drakes patrolling the terrace',type:'kill',target:3,reward:{xp:420,gold:320}}]
    },
    8: {name:'Ember Hollow',theme:'volcano',dungeonRooms:7,
      enemies:[{name:'Lava Imp',hpMul:2.2,atkMul:2.0,exp:34,gold:24},{name:'Magma Hound',hpMul:3.2,atkMul:2.8,exp:54,gold:44}],
      boss:{id:'boss8',name:'Flame Sovereign',hpMul:20,atk:18,def:8,exp:1200,gold:900},
      quests:[{id:'f8q1',title:'Quench the Flame',desc:'Gather 4 Cooling Stones from Ember Hollow',type:'gather',target:4,reward:{xp:520,gold:360}}]
    },
    9: {name:'Abyssal Reach',theme:'abyss',dungeonRooms:8,
      enemies:[{name:'Abyss Crawler',hpMul:2.8,atkMul:2.4,exp:44,gold:32},{name:'Void Wraith',hpMul:3.8,atkMul:3.0,exp:64,gold:50}],
      boss:{id:'boss9',name:'Abyssal Sovereign',hpMul:24,atk:20,def:10,exp:1600,gold:1200},
      quests:[{id:'f9q1',title:'Purge the Depths',desc:'Defeat 7 Abyssal creatures on Floor 9',type:'kill',target:7,reward:{xp:720,gold:520}}]
    },
    10: {name:'Crystal Palace',theme:'crystal',dungeonRooms:10,
      enemies:[{name:'Shardling',hpMul:3.0,atkMul:2.8,exp:56,gold:44},{name:'Prism Knight',hpMul:4.2,atkMul:3.6,exp:88,gold:72}],
      boss:{id:'boss10',name:'Crystal Matriarch',hpMul:30,atk:24,def:12,exp:2200,gold:1800},
      quests:[{id:'f10q1',title:'Claim the Crystal Heart',desc:'Obtain the Crystal Heart from the palace (1)',type:'gather',target:1,reward:{xp:1200,gold:900}}]
    }
  };

  // Utility
  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)) }

  // Skill definitions
  const SKILLS = {
    vertical_arc: {id:'vertical_arc',name:'Vertical Arc',type:'active',desc:'A heavy strike that deals 1.5x ATK damage. Cooldown: 2',cost:0,cooldown:2},
    quick_heal: {id:'quick_heal',name:'Quick Heal',type:'active',desc:'Restore a portion of max HP. Cooldown:3',cost:0,cooldown:3},
    stance_change: {id:'stance_change',name:'Stance Change',type:'active',desc:'Adopt a guarded stance: reduce damage taken for 2 turns. Cooldown:4',cost:0,cooldown:4},
    burst_strike: {id:'burst_strike',name:'Burst Strike',type:'active',desc:'Deal 2x damage but suffer Weakened (take more damage) for 1 turn. Cooldown:4',cost:0,cooldown:4},
    battle_focus: {id:'battle_focus',name:'Battle Focus',type:'passive',desc:'Small chance to critically strike more often.',cost:1},
    survival_instinct: {id:'survival_instinct',name:'Survival Instinct',type:'passive',desc:'Increase max HP on level up.',cost:1}
  };

  // Character Archetypes
  const ARCHETYPES = {
    striker: { id:'striker', name:'Striker', desc:'Aggressive attacker. +2 ATK, +5% crit chance.', mods:{atk:2}, passives:{critBonus:0.05} },
    guardian: { id:'guardian', name:'Guardian', desc:'Stalwart defender. +2 DEF, -1 damage taken.', mods:{def:2}, passives:{flatDamageReduction:1} },
    rogue: { id:'rogue', name:'Rogue', desc:'Evasive duelist. +2 DEX, +5% dodge chance.', mods:{dex:2}, passives:{dodgeBonus:0.05} },
    sage: { id:'sage', name:'Sage', desc:'Wise explorer. +1 Luck, +10% XP and drop chance.', mods:{luck:1}, passives:{xpMult:1.10, dropBonus:0.10} }
  };

  // Player model
  class Player {
    constructor(){
      this.name = 'Player';
      this.level = 1;
      this.xp = 0;
      this.gold = 0;
      this.floor = 1;
      this.maxHP = 10;
      this.hp = this.maxHP;
      this.atk = 2;
      this.def = 1;
      this.dex = 1;
      this.luck = 0;
      this.quests = [];
      this.pendingStatPoints = 0; // unspent points from leveling
      this.skillPoints = 0; // points to unlock skills
      this.skills = {}; // unlocked skills
      this.skillCooldowns = {};
      this.statusEffects = [];
  this.stash = [];
  this.completedQuests = []; // quests completed but not yet turned-in/collected
  this.tokens = 0; // special quest tokens
      this.clearedBosses = [];
      this.dungeonProgress = {};
      this.fieldProgress = {};
        this.isDefending = false; // flag for defend action
      // Achievement tracking stats
      this.achievements = {}; // {achievementId: true}
      this.kills = 0;
      this.bossKills = 0;
      this.criticalHits = 0;
      this.dodges = 0;
      this.dodgeStreak = 0;
      this.fieldBosses = 0;
      this.stashCount = 0;
      this.storageUsed = false;
      this.consumablesUsed = 0;
      this.questsAccepted = 0;
      this.questsCompleted = 0;
      this.nearDeathSurvival = false;
      this.equipmentUpgrades = 0;
      this.npcsTalked = [];
      this.archetype = null;
      // Combo system
      this.comboCount = 0;
      this.maxCombo = 0;
    }
    nextXp(){ return 50 + Math.floor(50 * (this.level-1) * 1.2) }
    addXp(amount){
      this.xp += amount;
      let leveled = 0;
      while(this.xp >= this.nextXp()){
        this.xp -= this.nextXp();
        this.level++;
        this.pendingStatPoints = (this.pendingStatPoints || 0) + 2;
        this.skillPoints = (this.skillPoints || 0) + 1;
        leveled++;
      }
      return leveled;
    }
    
    applyStatAllocation(alloc){
      this.maxHP += (alloc.hp || 0) * 5;
      this.hp = this.maxHP;
      this.atk += (alloc.atk || 0);
      this.def += (alloc.def || 0);
      this.pendingStatPoints -= (alloc.hp + alloc.atk + alloc.def);
    }
    
    toJSON(){
      return {
        name: this.name, level: this.level, xp: this.xp, gold: this.gold, floor: this.floor,
        maxHP: this.maxHP, hp: this.hp, atk: this.atk, def: this.def, dex: this.dex, luck: this.luck,
        quests: this.quests, pendingStatPoints: this.pendingStatPoints, skillPoints: this.skillPoints,
        skills: this.skills, skillCooldowns: this.skillCooldowns, statusEffects: this.statusEffects,
        stash: this.stash, completedQuests: this.completedQuests, tokens: this.tokens,
        clearedBosses: this.clearedBosses, dungeonProgress: this.dungeonProgress, fieldProgress: this.fieldProgress,
        achievements: this.achievements, kills: this.kills, bossKills: this.bossKills, criticalHits: this.criticalHits,
        dodges: this.dodges, dodgeStreak: this.dodgeStreak, fieldBosses: this.fieldBosses, stashCount: this.stashCount,
        storageUsed: this.storageUsed, consumablesUsed: this.consumablesUsed, questsAccepted: this.questsAccepted,
        questsCompleted: this.questsCompleted, nearDeathSurvival: this.nearDeathSurvival, equipmentUpgrades: this.equipmentUpgrades,
        npcsTalked: this.npcsTalked, archetype: this.archetype, comboCount: this.comboCount, maxCombo: this.maxCombo
      };
    }
    
    fromJSON(data){
      Object.assign(this, data);
    }
  }

  // Enemy factory
  function makeEnemy(floor, type='normal'){
    const def = FLOOR_DEFS[floor] || FLOOR_DEFS[1];
    let enemy;
    if(type === 'boss'){
      const b = def.boss;
      enemy = {
        name: b.name, hp: Math.floor(b.hpMul * 10), maxHP: Math.floor(b.hpMul * 10),
        atk: b.atk, def: b.def, exp: b.exp, gold: b.gold, isBoss: true, id: b.id
      };
    } else {
      const list = def.enemies || [];
      const e = list[rand(0, list.length-1)] || {name:'Monster',hpMul:1,atkMul:1,exp:10,gold:5};
      const hpBase = 8 + floor * 2;
      const atkBase = 2 + Math.floor(floor * 0.5);
      enemy = {
        name: e.name, hp: Math.floor(e.hpMul * hpBase), maxHP: Math.floor(e.hpMul * hpBase),
        atk: Math.floor(e.atkMul * atkBase), def: Math.floor(floor * 0.3), dex: 1 + Math.floor(floor * 0.4), exp: e.exp, gold: e.gold
      };
    }
    // apply status effects based on enemy name
    const nm = (enemy.name||'').toLowerCase();
    if(nm.includes('slime')) enemy.statusOnHit = {type:'slow',chance:0.25,turns:2};
    if(nm.includes('leech') || nm.includes('bog') || nm.includes('poison')) enemy.statusOnHit = {type:'poison',chance:0.2,turns:3,value:2};
    if(nm.includes('ent') || nm.includes('golem')) enemy.statusOnHit = {type:'regen',chance:0.12,turns:3,value:6};
    if(nm.includes('frenzy boar')) enemy.statusOnHit = {type:'stun',chance:0.2,turns:1};
    if(nm.includes('little nepent')) enemy.statusOnHit = {type:'poison',chance:0.25,turns:3,value:2};
    return enemy;
  }

// Game engine
class Game {
    constructor(){
      this.player = new Player();
      this.npcs = sampleNPCs();
      // inventory system (provided by inventory.js)
      this.inventory = new Inventory();
      // starting item for demo
      this.inventory.addItem({name:'Healing Herb',type:'consumable',heal:20});
      this.logEl = document.getElementById('log-entries');
      this.questListEl = document.getElementById('quest-list');
      this.inventoryListEl = document.getElementById('inventory-list');
      this.autoTimer = null;
      this.busy = false;
      this.inTown = false; // whether player is currently in town/hub
      this.playerTurn = true; // track whose turn it is in combat
      this.initUI();
      this.updateUI();
      this.log('Welcome to SAO Text Adventure. Talk to NPCs for quests and explore to gain XP.');
    }
    initUI(){
      document.getElementById('btn-field').addEventListener('click', ()=>this.explore('field'));
      document.getElementById('btn-dungeon').addEventListener('click', ()=>this.explore('dungeon'));
      document.getElementById('btn-npc').addEventListener('click', ()=>this.openNPCDialog());
      const skBtn = document.getElementById('btn-skills'); if(skBtn) skBtn.addEventListener('click', ()=> this.openSkillModal());
    const achBtn = document.getElementById('btn-achievements'); if(achBtn) achBtn.addEventListener('click', ()=> this.showAchievementsModal());
    const archBtn = document.getElementById('btn-archetype'); if(archBtn) archBtn.addEventListener('click', ()=> this.showArchetypeModal());
  // Crafting removed
      const townBtn = document.getElementById('btn-town'); if(townBtn) townBtn.addEventListener('click', ()=> this.showTownMenu());
      document.getElementById('btn-rest').addEventListener('click', ()=>this.rest());
      document.getElementById('btn-save').addEventListener('click', ()=>this.save());
      document.getElementById('btn-load').addEventListener('click', ()=>this.load());
      document.getElementById('auto-explore').addEventListener('change',(e)=>this.toggleAuto(e.target.checked));
      // modal close on backdrop click
      const modal = document.getElementById('modal');
      if(modal){ modal.querySelector('.modal-backdrop').addEventListener('click', ()=> this.hideModal()); }
      // quick heal button
      const qh = document.getElementById('quick-heal'); if(qh) qh.addEventListener('click', ()=> this.quickHeal());
        // combat action buttons
        document.getElementById('btn-attack').addEventListener('click', ()=> this.attackAction());
        document.getElementById('btn-defend').addEventListener('click', ()=> this.defendAction());
        document.getElementById('btn-flee').addEventListener('click', ()=> this.fleeAction());
        document.getElementById('btn-skill-combat').addEventListener('click', ()=> this.showCombatSkillMenu());
        document.getElementById('btn-use-item').addEventListener('click', ()=> this.showCombatItemMenu());
        // town action buttons (persistent panel)
        const tb = document.getElementById('btn-blacksmith'); if(tb) tb.addEventListener('click', ()=> this.showBlacksmithModal());
        const tm = document.getElementById('btn-market'); if(tm) tm.addEventListener('click', ()=> this.showMarketModal());
        const tStorage = document.getElementById('btn-storage'); if(tStorage) tStorage.addEventListener('click', ()=> this.showStorageModal());
        const tq = document.getElementById('btn-quest-board'); if(tq) tq.addEventListener('click', ()=> this.showQuestBoardModal());
        const tr = document.getElementById('btn-field-return'); if(tr) tr.addEventListener('click', ()=> this.returnToField());
    }

    // Town/hub menu (persistent panel instead of modal)
    showTownMenu(){
      this.enterTown();
      this.log('You safely return to town. HP fully restored. Choose a service.');
    }

    // Boss Arena: consume Boss Key to face the arena boss for that floor
    showBossArenaModal(){
      // list boss keys in inventory
      const keys = this.inventory.items.filter(i=> i.type === 'quest' && i.name && i.name.startsWith('Boss Key'));
      const html = keys.length ? keys.map((k,i)=>{
        // try to parse floor from name like 'Boss Key (Floor N)'
        const m = (k.name||'').match(/Floor\s*(\d+)/i); const floor = m ? parseInt(m[1]) : this.player.floor;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${k.name}</strong><div class="muted">Use to challenge the Boss Arena for Floor ${floor}</div></div><div><button data-key="${i}" data-floor="${floor}">Enter Arena</button></div></div>`;
      }).join('') : '<div class="muted">No Boss Keys available. Obtain one by clearing a dungeon miniboss.</div>';
      this.showModal('Boss Arena', `<div style="display:flex;flex-direction:column;gap:8px">${html}</div>`, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-key]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-key')); const k = keys[idx]; const floor = parseInt(btn.getAttribute('data-floor')) || this.player.floor;
        if(!k) return; // safety
        // consume key
        this.inventory.removeItem(k.id,1);
        this.logEvent('info', `Used ${k.name} to enter the Boss Arena (Floor ${floor}).`);
        // spawn the arena boss
        const boss = makeEnemy(floor,'boss'); boss.arena = true; boss.floor = floor; boss.isBoss = true; boss.inDungeon = false;
        this.hideModal(); this.fight(boss);
      }));
    }

    enterTown(){
      this.inTown = true;
      // stop auto-explore while in town
      const autoCheckbox = document.getElementById('auto-explore'); if(autoCheckbox && autoCheckbox.checked){ autoCheckbox.checked = false; }
      if(this.autoTimer){ clearInterval(this.autoTimer); this.autoTimer = null; this.log('Auto-explore paused while in town.'); }
      // restore HP on entering town
      this.player.hp = this.player.maxHP;
      // disable field/dungeon exploration buttons
      ['btn-field','btn-dungeon'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled = true; });
      // toggle town UI panel
      document.body.classList.add('in-town');
      const mainAct = document.getElementById('main-actions'); if(mainAct) mainAct.style.display = 'none';
      const townAct = document.getElementById('town-actions'); if(townAct) townAct.style.display = 'flex';
      const combatAct = document.getElementById('combat-actions'); if(combatAct) combatAct.style.display = 'none';
      this.updateUI();
    }

    leaveTown(){
      this.inTown = false;
      this.hideModal();
      // re-enable exploration buttons
      ['btn-field','btn-dungeon'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled = false; });
      // toggle UI back to field
      document.body.classList.remove('in-town');
      const townAct = document.getElementById('town-actions'); if(townAct) townAct.style.display = 'none';
      const mainAct = document.getElementById('main-actions'); if(mainAct) mainAct.style.display = 'flex';
      this.log('You leave the town and return to the field.');
      this.updateUI();
    }

    returnToField(){
      this.leaveTown();
    }

    // Simple shop modal: sells a few basic items
    showShopModal(){
      const items = [
        {id:'sword1',name:'Iron Sword',type:'equipment',slot:'Weapon',atk:3,def:0,price:120},
        {id:'armor1',name:'Leather Armor',type:'equipment',slot:'Armor',atk:0,def:2,price:100},
        {id:'herb',name:'Healing Herb',type:'consumable',heal:20,price:15}
      ];
      const html = items.map((it,i)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${it.name}</strong><div class="muted">${it.type}${it.atk?(' ATK+'+it.atk):''}${it.def?(' DEF+'+it.def):''}${it.heal?(' Heal:'+it.heal):''}</div></div><div><button data-buy="${i}">Buy (${it.price}g)</button></div></div>`).join('');
      this.showModal('Shop', `<div style="display:flex;flex-direction:column;gap:8px">${html}</div>`, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-buy]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-buy'));
        const it = items[idx];
        if(this.player.gold < it.price){ this.logEvent('info','Not enough gold to buy that item.'); return; }
        this.player.gold -= it.price; const added = this.inventory.addItem(Object.assign({}, it)); this.logEvent('info', `Bought ${added.name} for ${it.price} gold.`); this.showInventoryBadge(); this.updateUI();
      }));
    }

    // Market (buy & sell combined)
    showMarketModal(){
      const floor = clamp(this.player.floor,1,MAX_FLOORS);
      // Generate shop items scaled by floor
      const shopItems = [
        {id:'herb',name:'Healing Herb',type:'consumable',heal:20,basePrice:10},
        {id:'potion',name:'Minor Potion',type:'consumable',heal:40,basePrice:25},
        {id:'antidote',name:'Antidote',type:'consumable',cure:['poison','slow'],basePrice:18},
        {id:'sword_basic',name:'Iron Sword',type:'equipment',slot:'Weapon',atk:2 + Math.floor(floor/5),def:0,basePrice:120 + floor*3},
        {id:'armor_basic',name:'Leather Armor',type:'equipment',slot:'Armor',atk:0,def:1 + Math.floor(floor/6),basePrice:100 + floor*2}
      ];
      const sellListHtml = this.inventory.items.map((it,i)=>{
        // don't allow selling equipped items
        const canSell = !it.equipped;
        // heuristic buy price for this item based on stats (used to compute sell price)
        const buyLike = ((it.atk||0)*30 + (it.def||0)*25 + (it.heal||0)*8) || 20;
        const price = Math.max(1, Math.floor(buyLike / 4)); // sell for roughly 1/4 of buy-like price
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div>${it.name} ${it.count && it.count>1?('x'+it.count):''}${it.equipped? ' (equipped)':''}</div><div>${canSell?`<button data-sell="${it.id}" data-price="${price}">Sell (${price}g)</button>`:'<span class="muted">Equipped</span>'}</div></div>`;
      }).join('') || '<div class="muted">No items to sell.</div>';
      const buyHtml = shopItems.map((it,i)=>{
        const price = Math.max(1, Math.floor((it.basePrice || 20) + floor * 2));
        const desc = it.type + (it.atk?(' ATK+'+it.atk):'') + (it.def?(' DEF+'+it.def):'') + (it.heal?(' Heal:'+it.heal):'') + (it.cure?(' Cures:'+it.cure.join(',')):'');
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${it.name}</strong><div class="muted">${desc}</div></div><div><button data-buy="${i}" data-price="${price}">Buy (${price}g)</button></div></div>`;
      }).join('');
      const html = `<div style="display:flex;gap:12px"><div style="flex:1"><h4>Buy</h4>${buyHtml}</div><div style="flex:1"><h4>Sell</h4>${sellListHtml}</div></div>`;
      this.showModal('Market', html, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-buy]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-buy')); const price = parseInt(btn.getAttribute('data-price'));
        const it = shopItems[idx]; if(this.player.gold < price){ this.logEvent('info','Not enough gold to buy.'); return; }
        this.player.gold -= price; const added = this.inventory.addItem(Object.assign({}, it)); this.logEvent('info', `Bought ${added.name} for ${price} gold.`); this.showInventoryBadge(); this.updateUI();
      }));
      body.querySelectorAll('button[data-sell]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-sell'); const price = parseInt(btn.getAttribute('data-price'));
        const removed = this.inventory.removeItem(id,1);
        if(removed){ this.player.gold += price; this.logEvent('gold', `Sold ${removed.name} for ${price} gold.`); this.updateUI(); }
      }));
    }

    // Blacksmith: upgrade or repair equipment (simple upgrade mechanic)
    showBlacksmithModal(){
      // Blacksmith services: Upgrade Weapon or Fortify Armor
      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div><strong>Blacksmith</strong><div class="muted">Choose a service: Upgrade Weapon (ATK) or Fortify Armor (DEF).</div></div>
          <div style="display:flex;gap:8px"><button data-bs="upgrade">Upgrade Weapon</button><button data-bs="fortify">Fortify Armor</button></div>
        </div>
      `;
      this.showModal('Blacksmith', html, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-bs]').forEach(btn=> btn.addEventListener('click', ()=>{
        const act = btn.getAttribute('data-bs');
        if(act === 'upgrade'){
          // list equipped weapons only
          const weapons = this.inventory.items.filter(i=> i.type==='equipment' && (i.slot||'').toLowerCase() === 'weapon');
          const list = weapons.length ? weapons.map((it,i)=>{
            const cost = 150 + (it.atk||0)*40; const material = 'Ingot'; const matCount = 1;
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${it.name}</strong><div class="muted">ATK:${it.atk||0}${it.equipped? ' (equipped)':''}</div></div><div><button data-upgrade-w="${i}" data-cost="${cost}" data-mat="${material}" data-matcount="${matCount}">Upgrade (${cost}g + ${matCount} ${material})</button></div></div>`;
          }).join('') : '<div class="muted">No weapons available for upgrade.</div>';
          this.showModal('Upgrade Weapon', `<div style="display:flex;flex-direction:column;gap:8px">${list}</div>`, [{text:'Back', action:()=> this.showBlacksmithModal()},{text:'Close', action:()=> this.hideModal()}]);
          const b2 = document.getElementById('modal-body');
          b2.querySelectorAll('button[data-upgrade-w]').forEach(btn2=> btn2.addEventListener('click', ()=>{
            const idx = parseInt(btn2.getAttribute('data-upgrade-w')); const cost = parseInt(btn2.getAttribute('data-cost'));
            const mat = btn2.getAttribute('data-mat'); const matCount = parseInt(btn2.getAttribute('data-matcount'));
            const it = weapons[idx];
            // ensure material in inventory
            // accept either the named material or Raw Crystal as alternative
            const materialCandidates = [mat, 'Raw Crystal', 'Ore', 'Ingot'];
            const materialItem = this.inventory.items.find(x=> materialCandidates.includes(x.name));
            if(this.player.gold < cost){ this.logEvent('info','Not enough gold to upgrade.'); return; }
            if(!materialItem || materialItem.count < matCount){ this.logEvent('info', `Blacksmith needs ${matCount} ${mat} (or Raw Crystal) to upgrade.`); return; }
            // consume
            this.inventory.removeItem(materialItem.id, matCount);
            this.player.gold -= cost;
            it.atk = (it.atk||0) + 1;
            this.logEvent('info', `Upgraded ${it.name}. ATK increased.`);
            this.hideModal(); this.updateUI();
          }));
        }
        if(act === 'fortify'){
          const armors = this.inventory.items.filter(i=> i.type==='equipment' && (i.slot||'').toLowerCase() === 'armor');
          const list = armors.length ? armors.map((it,i)=>{
            const cost = 140 + (it.def||0)*35; const material = 'Ore'; const matCount = 1;
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${it.name}</strong><div class="muted">DEF:${it.def||0}${it.equipped? ' (equipped)':''}</div></div><div><button data-fortify-a="${i}" data-cost="${cost}" data-mat="${material}" data-matcount="${matCount}">Fortify (${cost}g + ${matCount} ${material})</button></div></div>`;
          }).join('') : '<div class="muted">No armor available for fortify.</div>';
          this.showModal('Fortify Armor', `<div style="display:flex;flex-direction:column;gap:8px">${list}</div>`, [{text:'Back', action:()=> this.showBlacksmithModal()},{text:'Close', action:()=> this.hideModal()}]);
          const b3 = document.getElementById('modal-body');
          b3.querySelectorAll('button[data-fortify-a]').forEach(btn3=> btn3.addEventListener('click', ()=>{
            const idx = parseInt(btn3.getAttribute('data-fortify-a')); const cost = parseInt(btn3.getAttribute('data-cost'));
            const mat = btn3.getAttribute('data-mat'); const matCount = parseInt(btn3.getAttribute('data-matcount'));
            const it = armors[idx];
            const materialCandidates = [mat, 'Raw Crystal', 'Ore', 'Ingot'];
            const materialItem = this.inventory.items.find(x=> materialCandidates.includes(x.name));
            if(this.player.gold < cost){ this.logEvent('info','Not enough gold to fortify.'); return; }
            if(!materialItem || materialItem.count < matCount){ this.logEvent('info', `Blacksmith needs ${matCount} ${mat} (or Raw Crystal) to fortify.`); return; }
            this.inventory.removeItem(materialItem.id, matCount);
            this.player.gold -= cost;
            it.def = (it.def||0) + 1;
            this.logEvent('info', `Fortified ${it.name}. DEF increased.`);
            this.hideModal(); this.updateUI();
          }));
        }
      }));
    }

    // Quest Board: global/board quests including escort/delivery/daily
    showQuestBoardModal(){
      // some sample board quests
      const boardQuests = [
        {id:'board1',title:'Escort the Merchant',desc:'Escort a merchant through 4 encounters without fleeing. Reward: 200 XP, 150g',type:'escort',target:4,reward:{xp:200,gold:150}},
        {id:'board2',title:'Deliver Parcel',desc:'Deliver a sealed parcel to Floor 3 (must return to town). Reward: 180 XP, 120g',type:'delivery',target:1,reward:{xp:180,gold:120}},
        {id:'board3',title:'Daily Skirmish',desc:'Defeat 3 monsters on your floor. Repeatable daily. Reward: 50 XP, 30g',type:'kill',target:3,reward:{xp:50,gold:30},repeatable:true}
      ];

      // Build UI with tabs: Available / Active / Completed
      const availHtml = boardQuests.map((q,i)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${q.title}</strong><div class="muted">${q.desc}</div></div><div><button data-board="${i}">Accept</button></div></div>`).join('') || '<div class="muted">No available quests.</div>';
      const activeHtml = (this.player.quests || []).map((q,idx)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${q.title}</strong><div class="muted">${q.desc}</div><div class="muted">Progress: ${q.progress||0}/${q.target}</div></div><div><button data-abandon="${q.id}">Abandon</button></div></div>`).join('') || '<div class="muted">No active quests.</div>';
      const completedHtml = (this.player.completedQuests || []).map((q,idx)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${q.title}</strong><div class="muted">Reward: ${q.reward.xp} XP, ${q.reward.gold} gold</div></div><div><button data-collect="${idx}">Collect</button></div></div>`).join('') || '<div class="muted">No completed quests.</div>';

      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;gap:8px"><button data-tab="avail">Available</button><button data-tab="active">Active</button><button data-tab="completed">Completed</button></div>
          <div id="qboard-avail">${availHtml}</div>
          <div id="qboard-active" style="display:none">${activeHtml}</div>
          <div id="qboard-completed" style="display:none">${completedHtml}</div>
        </div>
      `;

      this.showModal('Quest Board', html, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      // tab switching
      body.querySelectorAll('button[data-tab]').forEach(btn=> btn.addEventListener('click', ()=>{
        const t = btn.getAttribute('data-tab');
        body.querySelector('#qboard-avail').style.display = t==='avail' ? 'block' : 'none';
        body.querySelector('#qboard-active').style.display = t==='active' ? 'block' : 'none';
        body.querySelector('#qboard-completed').style.display = t==='completed' ? 'block' : 'none';
      }));

      // accept available
      body.querySelectorAll('button[data-board]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-board'));
        const raw = Object.assign({}, boardQuests[idx]); raw.id = raw.id + '_' + Date.now();
        // attach per-type meta and special behavior
        const pushQ = {id:raw.id,title:raw.title,desc:raw.desc,type:raw.type,target:raw.target,progress:0,reward:raw.reward,meta:{original:boardQuests[idx]}};
        if(raw.type === 'escort'){
          pushQ.meta.remaining = raw.target; // track remaining encounters if desired
        }
        if(raw.type === 'delivery'){
          // include destination floor in meta (board quest defined for Floor 3)
          pushQ.meta.destinationFloor = 3;
          // give the player the sealed parcel item to carry
          const parcel = this.inventory.addItem({name:`Sealed Parcel (${raw.title})`, type:'quest', questId:raw.id});
          this.logEvent('info', `Received quest item: ${parcel.name}`);
          this.showInventoryBadge();
        }
        this.player.quests.push(pushQ);
        this.player.questsAccepted = (this.player.questsAccepted || 0) + 1; // Track for achievements
        this.logEvent('quest', `Accepted quest: ${pushQ.title}`);
        this.hideModal(); this.updateUI();
      }));

      // abandon active
      body.querySelectorAll('button[data-abandon]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-abandon'); this.player.quests = this.player.quests.filter(q=> q.id !== id); this.log('Quest abandoned.'); this.hideModal(); this.updateUI();
      }));

      // collect completed
      body.querySelectorAll('button[data-collect]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-collect'));
        const q = this.player.completedQuests[idx]; if(!q) return;
        // grant reward
        this.player.gold += q.reward.gold || 0; const leveled = this.player.addXp(q.reward.xp || 0);
        this.player.questsCompleted = (this.player.questsCompleted || 0) + 1; // Track for achievements
        // delivery quest: remove associated parcel item from inventory
        const isDelivery = (q.meta && ((q.meta.original && q.meta.original.type === 'delivery') || q.type === 'delivery'));
        if(isDelivery){
          // remove any quest item with questId matching the completed quest's id
          const itemsToRemove = this.inventory.items.filter(i=> i.type==='quest' && i.questId === q.id);
          itemsToRemove.forEach(it=>{ this.inventory.removeItem(it.id, it.count || 1); });
        }
        // optional token reward
        if(q.reward.token) this.player.tokens = (this.player.tokens || 0) + (q.reward.token||0);
        this.log(`Collected rewards for ${q.title}: ${q.reward.xp || 0} XP, ${q.reward.gold || 0} gold.`);
        // remove from completed list
        this.player.completedQuests.splice(idx,1);
        if(leveled){ this.log(`Gained ${leveled} level(s)! Allocate your stat points.`); this.pauseForStatAllocation(); }
        this.hideModal(); this.updateUI();
      }));
    }

    // Storage: simple stash where player can move items between inventory and stash
    showStorageModal(){
      // Track storage usage for achievements
      if(!this.player.storageUsed) this.player.storageUsed = true;
      
      const invHtml = this.inventory.items.map((it)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div>${it.name} x${it.count||1}${it.equipped? ' (equipped)':''}</div><div>${!it.equipped?`<button data-stash-put="${it.id}">Store</button>`:'<span class="muted">Equipped</span>'}</div></div>`).join('') || '<div class="muted">Inventory empty</div>';
      const stashHtml = (this.player.stash || []).map((it,idx)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div>${it.name} x${it.count||1}</div><div><button data-stash-get="${idx}">Retrieve</button></div></div>`).join('') || '<div class="muted">Stash empty</div>';
      const html = `<div style="display:flex;gap:12px"><div style="flex:1"><h4>Inventory</h4>${invHtml}</div><div style="flex:1"><h4>Stash</h4>${stashHtml}</div></div>`;
      this.showModal('Storage', html, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-stash-put]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-stash-put'); const it = this.inventory.getItem(id);
        if(!it) return;
        if(it.equipped){ this.logEvent('info','Unequip item before storing.'); return; }
        // move one count to stash
        const removed = this.inventory.removeItem(id,1);
        if(removed){
          // stack into stash by name
          const existing = this.player.stash.find(s=> s.name === removed.name);
          if(existing) existing.count = (existing.count||1) + (removed.count||1);
          else this.player.stash.push(Object.assign({}, removed, {count: removed.count||1}));
          this.logEvent('info', `Stored ${removed.name} into stash.`);
          // Track stash count
          this.player.stashCount = this.player.stash.reduce((sum, s) => sum + (s.count || 1), 0);
          this.hideModal(); this.updateUI();
        }
      }));
      body.querySelectorAll('button[data-stash-get]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-stash-get'));
        const st = this.player.stash[idx]; if(!st) return;
        // move one back into inventory
        const added = this.inventory.addItem({name:st.name,type:st.type,slot:st.slot,atk:st.atk,def:st.def,heal:st.heal}, 1);
        st.count = st.count - 1; if(st.count <= 0) this.player.stash.splice(idx,1);
        this.logEvent('info', `Retrieved ${added.name} from stash.`);
        // Update stash count
        this.player.stashCount = this.player.stash.reduce((sum, s) => sum + (s.count || 1), 0);
        this.hideModal(); this.showInventoryBadge(); this.updateUI();
      }));
    }

    quickHeal(){
      // Use the first available healing consumable (prefer 'Healing Herb')
      const herbs = this.inventory.items.filter(i=> i.type==='consumable');
      if(herbs.length===0){ this.logEvent('info','No healing items available'); return; }
      // try prefer Healing Herb
      let idx = herbs.findIndex(h=> h.name.toLowerCase().includes('herb'));
      if(idx === -1) idx = 0;
      const it = herbs[idx];
      const res = this.inventory.useItem(it.id, this.player);
      if(res.used){ 
        this.logEvent('heal', `Used ${it.name} (quick). Restored ${res.heal||0} HP`); 
        this.player.consumablesUsed = (this.player.consumablesUsed || 0) + 1; // Track for achievements
        this.updateUI(); 
      }
      else this.logEvent('info','Could not use item');
      // if in combat, enemy gets a turn
      if(this.currentEnemy) setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
    }
    log(text,cls,type){
      const div = document.createElement('div');
      div.className = 'log-line';
      if(type) div.classList.add('log-'+type);
      if(cls) div.classList.add(cls);
      div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
      this.logEl.appendChild(div);
      // Trim log to last 120 entries
      this.trimLog(120);
      // Auto-scroll log entries to bottom
      this.logEl.scrollTop = this.logEl.scrollHeight;
      // Also scroll adventure log container for mobile view
      const adventureLog = document.getElementById('adventure-log');
      if(adventureLog) {
        setTimeout(() => {
          adventureLog.scrollTop = adventureLog.scrollHeight;
        }, 50);
      }
    }

    // enhanced log with icons and detail
    logEvent(type, message, detail, cls){
      const icons = {attack:'⚔️',heal:'🩹',gold:'💰',info:'ℹ️',quest:'📜',loot:'🎁',boss:'👑'};
      const icon = icons[type] || icons.info;
      const text = `${icon} ${message}` + (detail ? ` (${detail})` : '');
      this.log(text, cls, type);
    }
    
    trimLog(max){
      const entries = this.logEl ? Array.from(this.logEl.children) : [];
      const extra = entries.length - max;
      if(extra > 0){
        for(let i=0;i<extra;i++) this.logEl.removeChild(this.logEl.firstChild);
      }
    }

    flashElement(el,cls,duration=700){
      if(!el) return;
      el.classList.add(cls);
      setTimeout(()=> el.classList.remove(cls), duration);
    }
    
     showComboOverlay(comboCount){
       const overlay = document.getElementById('combo-overlay');
       if(!overlay) return;
     
       const text = overlay.querySelector('.combo-text');
       text.textContent = `×${comboCount} COMBO!`;
     
       // Remove existing tier classes
       overlay.classList.remove('tier-1', 'tier-2', 'tier-3');
     
       // Add tier class based on combo count
       if(comboCount >= 10) {
         overlay.classList.add('tier-3');
         // Screen shake effect for mega combos
         document.body.classList.add('screen-shake');
         setTimeout(() => document.body.classList.remove('screen-shake'), 300);
       } else if(comboCount >= 5) {
         overlay.classList.add('tier-2');
       } else {
         overlay.classList.add('tier-1');
       }
     
       overlay.classList.add('show');
     
       setTimeout(() => {
         overlay.classList.remove('show');
       }, 800);
     }
   
    setBackgroundForFloor() {
      const p = this.player;
      const def = FLOOR_DEFS[p.floor] || {};
      let theme = def.theme || 'meadow';
      let bg = '';
      switch(theme) {
        case 'meadow':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #a8e063 0%, #56ab2f 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'forest':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #228B22 0%, #013220 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'cave':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #b0bec5 0%, #263238 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'swamp':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #4e9a51 0%, #2e4a2e 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'desert':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #ffe082 0%, #fbc02d 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'ice':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #e0f7fa 0%, #01579b 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'sky':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #81d4fa 0%, #0288d1 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'volcano':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #ff7043 0%, #bf360c 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'abyss':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #212121 0%, #000000 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        case 'crystal':
          bg = 'radial-gradient(1200px 600px at 10% 10%, #e1bee7 0%, #6a1b9a 100%), linear-gradient(180deg,#071028,#052033)';
          break;
        default:
          bg = 'radial-gradient(1200px 600px at 10% 10%, #4fc3f7 0%, #071028 100%), linear-gradient(180deg,#071028,#052033)';
      }
      document.body.style.background = bg;
    }
    
    updateUI(){
      const p = this.player;
      this.setBackgroundForFloor();
      document.getElementById('player-name').textContent = p.name;
      document.getElementById('player-level').textContent = p.level;
      document.getElementById('player-xp').textContent = p.xp;
      document.getElementById('player-nextxp').textContent = p.nextXp();
      document.getElementById('player-hp').textContent = p.hp;
      document.getElementById('player-maxhp').textContent = p.maxHP;
      document.getElementById('player-atk').textContent = p.atk;
      document.getElementById('player-def').textContent = p.def;
      const dexEl = document.getElementById('player-dex'); if(dexEl) dexEl.textContent = p.dex;
      const luckEl = document.getElementById('player-luck'); if(luckEl) luckEl.textContent = p.luck;
  const archEl = document.getElementById('player-archetype'); if(archEl) archEl.textContent = p.archetype ? (ARCHETYPES[p.archetype]?.name || p.archetype) : 'None';
  const archBtn = document.getElementById('btn-archetype'); if(archBtn) archBtn.disabled = !!p.archetype;
      document.getElementById('player-gold').textContent = p.gold;
      document.getElementById('player-floor').textContent = p.floor;
      document.getElementById('quest-count').textContent = p.quests.length;
      const pointsEl = document.getElementById('player-points'); if(pointsEl) pointsEl.textContent = p.pendingStatPoints || 0;
      const spEl = document.getElementById('player-skillpoints'); if(spEl) spEl.textContent = p.skillPoints || 0;
      const tokEl = document.getElementById('player-tokens'); if(tokEl) tokEl.textContent = p.tokens || 0;
      const achCountEl = document.getElementById('achievement-count'); if(achCountEl) achCountEl.textContent = Object.keys(p.achievements || {}).length;
      const achTotalEl = document.getElementById('achievement-total'); if(achTotalEl && window.ACHIEVEMENTS) achTotalEl.textContent = Object.keys(window.ACHIEVEMENTS).length;

      // HP/XP progress bars
      const xpBar = document.getElementById('xp-bar');
      if(xpBar) {
        const xpPct = Math.min(100, Math.round((p.xp / p.nextXp()) * 100));
        xpBar.style.width = xpPct + '%';
        xpBar.style.background = 'linear-gradient(90deg,#4fc3f7,#1976a5)';
      }
      const hpBar = document.getElementById('hp-bar');
      if(hpBar) {
        const hpPct = Math.min(100, Math.round((p.hp / p.maxHP) * 100));
        hpBar.style.width = hpPct + '%';
        hpBar.style.background = 'linear-gradient(90deg,#e53935,#fbc02d)';
      }

      // quests
      this.questListEl.innerHTML = '';
      const questProgressBars = document.getElementById('quest-progress-bars');
      if(questProgressBars) questProgressBars.innerHTML = '';
      p.quests.forEach(q=>{
        const li = document.createElement('li');
        li.textContent = `${q.title} — ${q.desc} (${q.progress||0}/${q.target})`;
        const btn = document.createElement('button');
        btn.textContent = 'Abandon';
        btn.style.marginLeft='8px';
        btn.addEventListener('click', ()=>{ this.abandonQuest(q.id) });
        li.appendChild(btn);
        this.questListEl.appendChild(li);
        // Quest progress bar
        if(questProgressBars && typeof q.target === 'number' && q.target > 1) {
          const pct = Math.min(100, Math.round(((q.progress||0) / q.target) * 100));
          const barWrap = document.createElement('div');
          barWrap.className = 'bar-wrap';
          barWrap.innerHTML = `<div class="bar-label">${q.title}</div><div class="bar-outer"><div class="bar-inner" style="width:${pct}%;background:linear-gradient(90deg,#ffd600,#4fc3f7)"></div></div>`;
          questProgressBars.appendChild(barWrap);
        }
      });
  // inventory UI
  this.updateInventoryUI();
  // equipment UI
  this.updateEquipmentUI();
      // Update quest tracker sidebar
      this.updateQuestTracker();
      // Check achievements
      this.checkAchievements();
      // equipment panel render
      // Update combat skill button label to reflect cooldown (min of active)
      const btnSk = document.getElementById('btn-skill-combat');
      if(btnSk){
        const act = Object.keys(SKILLS).filter(k=> SKILLS[k].type==='active' && p.skills && p.skills[k]);
        const cds = act.map(k=> (p.skillCooldowns && p.skillCooldowns[k]) || 0).filter(v=> v>0);
        if(cds.length){ btnSk.textContent = `Use Skill (CD: ${Math.min(...cds)})`; }
        else { btnSk.textContent = 'Use Skill'; }
      }
    }

    updateInventoryUI(){
      if(!this.inventoryListEl) return;
      this.inventoryListEl.innerHTML = '';
      this.inventory.items.forEach(it=>{
        const li = document.createElement('li');
        // name + count
        const title = document.createElement('div');
        title.style.display='flex'; title.style.alignItems='center';
        const nameSpan = document.createElement('div'); nameSpan.textContent = it.name + (it.equipped? ' (equipped)':'');
        title.appendChild(nameSpan);
        if(it.count && it.count > 1){ const badge = document.createElement('div'); badge.className='count-badge'; badge.textContent = 'x' + it.count; title.appendChild(badge); }
        li.appendChild(title);
        const span = document.createElement('span');
        span.style.marginLeft = '8px';
        // Use button for consumables
        if(it.type === 'consumable'){
          const useBtn = document.createElement('button');
          useBtn.textContent = 'Use';
          useBtn.addEventListener('click', ()=>{
            const res = this.inventory.useItem(it.id, this.player);
            if(res.used){ 
              if(res.heal) this.log(`Used ${it.name}. Restored HP.`); 
              if(res.cured) this.log(`Used ${it.name}. Cured status effects.`);
            }
            else this.log(`Could not use ${it.name}.`);
            this.updateUI();
          });
          span.appendChild(useBtn);
        }
        // Equip / Unequip for equipment
        if(it.type === 'equipment'){
          const eqBtn = document.createElement('button');
          eqBtn.textContent = it.equipped ? 'Unequip' : 'Equip';
          eqBtn.addEventListener('click', ()=>{
            if(it.equipped){ this.inventory.unequipItem(it.id, this.player); this.log(`Unequipped ${it.name}.`); }
            else{ this.inventory.equipItem(it.id, this.player); this.log(`Equipped ${it.name}.`); }
            this.updateUI();
          });
          span.appendChild(eqBtn);
          // Equipment preview on hover
          li.addEventListener('mouseenter', ()=> this.showEquipPreview(it));
          li.addEventListener('mouseleave', ()=> this.clearEquipPreview());
        }
  // Drop button
        const dropBtn = document.createElement('button');
        dropBtn.textContent = 'Drop';
        dropBtn.style.marginLeft = '6px';
        dropBtn.addEventListener('click', ()=>{
          if(it.equipped) this.inventory.unequipItem(it.id, this.player);
          this.inventory.removeItem(it.id);
          this.log(`Dropped ${it.name}.`);
          this.updateUI();
        });
        span.appendChild(dropBtn);
        // mark new item badge briefly when adding items
        // we will show badge when inventory change occurs elsewhere by calling showInventoryBadge()
        li.appendChild(span);
        this.inventoryListEl.appendChild(li);
      });
    }

    // Equipment preview helpers
    showEquipPreview(item){
      if(!item || item.type !== 'equipment') return;
      const p = this.player;
      const previewEl = document.getElementById('equip-preview'); if(!previewEl) return;
      // Find currently equipped item for this slot
      const cur = this.inventory.items.find(i=> i.equipped && i.slot && item.slot && i.slot.toLowerCase()===item.slot.toLowerCase());
      // Calculate deltas: remove current then add new
      const baseAtk = p.atk - (cur?.atk||0);
      const baseDef = p.def - (cur?.def||0);
      const toAtk = baseAtk + (item.atk||0);
      const toDef = baseDef + (item.def||0);
      const line = (name, from, to)=>{
        const cls = (to>from)?'delta-pos':(to<from)?'delta-neg':'';
        return `<div class="line"><div class="stat-name">${name}</div><div class="from">${from}</div><div class="arrow">→</div><div class="to ${cls}">${to}</div></div>`;
      };
      previewEl.innerHTML = `<div class="muted" style="margin-bottom:4px">Preview: ${item.name}</div>`
        + line('ATK', p.atk, toAtk)
        + line('DEF', p.def, toDef);
      previewEl.style.display = 'block';
    }
    clearEquipPreview(){
      const previewEl = document.getElementById('equip-preview'); if(!previewEl) return; previewEl.style.display='none'; previewEl.innerHTML='';
    }

    showInventoryBadge(){
      const b = document.getElementById('inventory-badge');
      if(!b) return;
      b.style.display = 'inline-block';
      setTimeout(()=>{ b.style.display = 'none'; }, 2200);
    }

    // equipment UI: displays slots and equipped item names
    updateEquipmentUI(){
      const tpl = document.getElementById('equipment-template');
      const container = document.querySelector('#left');
      if(!tpl || !container) return;
      // ensure equipment panel present
      if(!document.getElementById('equipment')){
        const clone = tpl.content.cloneNode(true);
        // insert after quests card
        const questsCard = document.getElementById('quests');
        questsCard.insertAdjacentElement('afterend', clone.children ? clone.children[0] : clone);
      }
      const eqSlots = document.getElementById('equipment-slots');
      eqSlots.innerHTML = '';
      // determine slots from equipped items and default common slots
      const knownSlots = ['Weapon','Armor','Accessory'];
      knownSlots.forEach(slotName=>{
        const slotDiv = document.createElement('div'); slotDiv.className='equip-slot';
        const nameEl = document.createElement('div'); nameEl.className='slot-name'; nameEl.textContent = slotName;
        const itemEl = document.createElement('div'); itemEl.className='slot-item'; itemEl.textContent = '—';
        // find equipped item for this slot
        const found = this.inventory.items.find(it => it.equipped && (it.slot || '').toLowerCase() === slotName.toLowerCase());
        if(found){ itemEl.textContent = `${found.name}`; }
        slotDiv.appendChild(nameEl); slotDiv.appendChild(itemEl);
        // click-to-equip: open modal filtered to items for this slot
        slotDiv.style.cursor = 'pointer';
        slotDiv.title = 'Click to manage slot';
        slotDiv.addEventListener('click', ()=> this.openEquipModal(slotName));
        eqSlots.appendChild(slotDiv);
      });
    }

    openEquipModal(slotName){
      // show equipment in inventory eligible for this slot
      const eligible = this.inventory.items.filter(i=> i.type==='equipment' && ((i.slot||'').toLowerCase() === slotName.toLowerCase()));
      // also allow unequip action
      const content = eligible.length ? eligible.map((it,i)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px" data-idx="${i}"><div>${it.name} ${it.equipped? '(equipped)':''}</div><div><button data-equip="${i}">${it.equipped? 'Unequip':'Equip'}</button></div></div>`).join('') : '<div class="muted">No items for this slot.</div>';
      this.showModal(`${slotName} - Equipment`, `<div style="display:flex;flex-direction:column;gap:8px">${content}</div>`, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      // Hover preview within modal
      body.querySelectorAll('[data-idx]').forEach(row=>{
        row.addEventListener('mouseenter', ()=>{ const i = parseInt(row.getAttribute('data-idx')); const it = eligible[i]; this.showEquipPreview(it); });
        row.addEventListener('mouseleave', ()=> this.clearEquipPreview());
      });
      body.querySelectorAll('button[data-equip]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-equip'));
        const it = eligible[idx];
        if(it.equipped){ this.inventory.unequipItem(it.id, this.player); this.logEvent('info', `Unequipped ${it.name}`); }
        else{ this.inventory.equipItem(it.id, this.player); this.logEvent('info', `Equipped ${it.name}`); }
        this.hideModal(); this.updateUI();
      }));
    }

    explore(type){
      if(this.busy) return this.log('You are busy. Wait until current action finishes.');
      this.busy = true;
      this.setButtonsDisabled(true);
      const floor = clamp(this.player.floor,1,MAX_FLOORS);
      // track field progress counts (used to unlock dungeon access)
      if(type === 'field'){ this.player.fieldProgress[floor] = (this.player.fieldProgress[floor] || 0) + 1; }
      // Check for delivery quests: if player carries the parcel and is on the destination floor, mark progress
      (this.player.quests || []).forEach(q => {
        if(q.type === 'delivery' && q.meta && q.meta.destinationFloor === floor){
          // verify player has parcel item for this quest
          const hasParcel = this.inventory.items.find(i=> i.type === 'quest' && i.questId === q.id);
          if(hasParcel){
            this.logEvent('info', `You arrived at Floor ${floor} with the parcel for '${q.title}'. Return to the Quest Board to collect the reward.`);
            // mark delivered for this specific quest (progress 1)
            this.progressQuests('delivery', 1, q.id);
            // do not remove parcel here; it will be removed when player collects reward
          }
        }
      });
      this.log(`Exploring the ${type} on floor ${floor}...`);
      // environmental hazards per floor theme (simple examples)
      const def = FLOOR_DEFS[floor];
      if(def && def.theme === 'ice'){
        // if player lacks Warm Cloak accessory, take small cold damage
        const hasCloak = this.inventory.items.find(i=> i.equipped && i.name === 'Warm Cloak');
        if(!hasCloak){ const cold = rand(1,3); this.player.hp = Math.max(1, this.player.hp - cold); this.logEvent('info', `The cold bites you for ${cold} HP (Warm Cloak would protect you).`); }
      }
      // small simulated delay
      setTimeout(()=>{
        // chance to find enemy or resource
        const found = Math.random();
        // const def = FLOOR_DEFS[floor];
        if(type === 'dungeon'){
          // require some minimal field exploration before first dungeon access on this floor
          const roomsNeeded = Math.max(2, Math.floor((def && def.dungeonRooms? def.dungeonRooms : 4)/2));
          const done = this.player.fieldProgress[floor] || 0;
          if((!this.player.clearedBosses.includes(floor)) && done < roomsNeeded){
            this.logEvent('info', `The dungeon entrance seems sealed. Explore the field more (${done}/${roomsNeeded}) to gain access.`);
            this.busy=false; this.setButtonsDisabled(false); this.updateUI();
            return;
          }
          // progress through dungeon rooms
          this.player.dungeonProgress[floor] = (this.player.dungeonProgress[floor] || 0) + 1;
          const prog = this.player.dungeonProgress[floor];
          const rooms = def ? def.dungeonRooms : 3;
          this.log(`You progress through the dungeon (room ${prog}/${rooms}).`);
          // if reached final room and boss not defeated, spawn boss
          const bossCleared = this.player.clearedBosses && this.player.clearedBosses.includes(floor);
          if(prog >= rooms && !bossCleared){
            // spawn a miniboss that drops the Boss Key (allows access to Boss Arena)
            const mini = makeEnemy(floor,'boss');
            mini.isMiniBoss = true; mini.name = `${mini.name} Lieutenant`;
            mini.hp = Math.max(6, Math.floor(mini.hp * 0.65)); mini.atk = Math.max(1, Math.floor(mini.atk * 0.7));
            mini.exp = Math.max(1, Math.floor(mini.exp * 0.5)); mini.gold = Math.max(0, Math.floor(mini.gold * 0.5));
            mini.floor = floor; mini.inDungeon = true;
            this.log(`A miniboss blocks the way: ${mini.name} (HP:${mini.hp} ATK:${mini.atk} DEF:${mini.def})`);
            this.fight(mini);
          } else {
            if(found < 0.75){
              const enemy = makeEnemy(floor,'dungeon'); enemy.floor = floor;
                // attach escort quest flags if escort active
                const escortQ = (this.player.quests || []).find(q=> q.type === 'escort');
                if(escortQ){ enemy.escortQuestId = escortQ.id; }
              this.log(`Encountered ${enemy.name} (HP:${enemy.hp} ATK:${enemy.atk} DEF:${enemy.def})`);
              this.fight(enemy);
            } else {
              const res = (Math.random()<0.6) ? 'herb' : 'nothing';
              if(res==='herb'){
          const herb = this.inventory.addItem({name:'Healing Herb',type:'consumable',heal:20});
          this.logEvent('loot', 'Found a Healing Herb', 'Added to inventory');
          this.showInventoryBadge();
                this.progressQuests('gather',1);
              } else this.log('Nothing found this time.');
              this.busy=false; this.setButtonsDisabled(false); this.updateUI();
            }
          }
        } else {
          // 2% chance for a rare field boss
          if(Math.random() < 0.02 && (FLOOR_DEFS[floor] && FLOOR_DEFS[floor].fieldBoss)){
            const fb = FLOOR_DEFS[floor].fieldBoss;
            const boss = {name: fb.name, hp: Math.floor(fb.hpMul*8), maxHP: Math.floor(fb.hpMul*8), atk: fb.atk, def: fb.def, dex: 1 + Math.floor(floor*0.4), exp: fb.exp, gold: fb.gold, isBoss: true, floor, cannotFlee:false, inDungeon:false};
            this.logEvent('info', `⚠️ The earth trembles! A RARE FIELD BOSS, ${boss.name}, has appeared!`);
            this.fight(boss);
          } else if(found < 0.75){
            const enemy = makeEnemy(floor,'field'); enemy.floor = floor;
            // attach escort quest flags if escort active
            const escortQ2 = (this.player.quests || []).find(q=> q.type === 'escort');
            if(escortQ2){ enemy.escortQuestId = escortQ2.id; }
            this.log(`Encountered ${enemy.name} (HP:${enemy.hp} ATK:${enemy.atk} DEF:${enemy.def})`);
            this.fight(enemy);
          } else {
            // resource or nothing
            const res = (Math.random()<0.6) ? 'herb' : 'nothing';
            if(res==='herb'){
              // add herb to inventory
              const herb = this.inventory.addItem({name:'Healing Herb',type:'consumable',heal:20});
              this.log('You found a healing herb and placed it in your inventory.');
              this.progressQuests('gather',1);
            } else this.log('Nothing found this time.');
            this.busy=false; this.setButtonsDisabled(false); this.updateUI();
          }
        }
      }, 700 + Math.random()*800);
    }

    fight(enemy){
      // Interrupt auto-explore when combat begins
      const autoCheckbox = document.getElementById('auto-explore');
      if(autoCheckbox && autoCheckbox.checked){ autoCheckbox.checked = false; if(this.autoTimer){ clearInterval(this.autoTimer); this.autoTimer = null; this.log('Auto-explore paused for combat.'); } }
      // set current enemy and switch to player decision flow
      this.currentEnemy = Object.assign({}, enemy);
      this.currentEnemy.floor = enemy.floor || this.player.floor;
      this.currentEnemy.isBoss = !!enemy.isBoss;
      this.logEvent('info', `Encountered: ${this.currentEnemy.name}`, this.currentEnemy.isBoss ? 'Boss' : 'Enemy');
        this.busy = true;
        // Show combat actions
        this.enterCombat();
        // Start turn-based combat
        this.combatTurn();
    }
    
      enterCombat(){
        document.getElementById('main-actions').style.display = 'none';
        document.getElementById('combat-actions').style.display = 'block';
        document.body.classList.add('in-combat');
        this.playerTurn = true; // reset turn to player when combat starts
      }
    
      exitCombat(){
        document.getElementById('main-actions').style.display = 'flex';
        document.getElementById('combat-actions').style.display = 'none';
        document.body.classList.remove('in-combat');
        this.currentEnemy = null;
        this.busy = false;
        this.playerTurn = true; // reset for next combat
        this.updateUI();
      }
    
      combatTurn(){
        const p = this.player;
        const enemy = this.currentEnemy;
        if(!enemy || enemy.hp <= 0){
          this.exitCombat();
          return;
        }
        if(p.hp <= 0){
          this.logEvent('info', 'You were defeated...', 'HP restored to half');
          p.hp = Math.floor(p.maxHP / 2);
          this.exitCombat();
          return;
        }
      
        // Player's turn - wait for action
        // If stunned, skip player's turn
        const isStunned = (p.statusEffects||[]).some(s=> s.type==='stun' && s.turns>0);
        if(isStunned){
          // decrement stun duration
          for(let i=p.statusEffects.length-1;i>=0;i--){ if(p.statusEffects[i].type==='stun'){ p.statusEffects[i].turns--; if(p.statusEffects[i].turns<=0) p.statusEffects.splice(i,1); break; } }
          this.logEvent('info','You are stunned and cannot act this turn');
          this.playerTurn = false; // mark as not player turn
          return setTimeout(()=> this.enemyTurn(true), 400);
        }
        this.playerTurn = true; // it's now player's turn
        this.logEvent('info', `Your turn! ${enemy.name} HP: ${enemy.hp}/${enemy.maxHP}`, 'Choose your action');
        // Decrement skill cooldowns
        Object.keys(p.skillCooldowns||{}).forEach(k=>{ if(p.skillCooldowns[k] > 0) p.skillCooldowns[k]--; });
        this.processPlayerStatusEffects();
        this.updateUI();
        // Combat actions are now available via buttons - wait for player input
    }
    
        attackAction(){
      const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
      if(!this.playerTurn) return; // prevent spam clicking
      this.playerTurn = false; // lock out other actions this turn
      
      // Combo bonus system
      let comboMultiplier = 1.0;
      let guaranteedCrit = false;
      if(p.comboCount >= 10) {
        comboMultiplier = 1.5; // +50% at 10+ combo
      } else if(p.comboCount >= 5) {
        comboMultiplier = 1.25; // +25% at 5+ combo
        guaranteedCrit = true;
      } else if(p.comboCount >= 3) {
        comboMultiplier = 1.1; // +10% at 3+ combo
      }
      
  // critical hit calculation (base 5% + Luck scaling + small DEX)
  let critChance = 0.05 + (p.luck || 0) * 0.01 + (p.dex || 0) * 0.003;
  if(p.archetype === 'striker') critChance += (ARCHETYPES.striker.passives.critBonus || 0);
      if(p.skills && p.skills['battle_focus']) critChance += 0.05; // passive bonus
      const isCrit = guaranteedCrit || Math.random() < critChance;
      if(isCrit) p.criticalHits = (p.criticalHits || 0) + 1; // Track crits for achievements
      
      const playerDamageRaw = p.atk + rand(-1,2);
      let playerDamage = Math.max(1, playerDamageRaw - (enemy.def||0));
      playerDamage = Math.floor(playerDamage * comboMultiplier); // Apply combo bonus
      if(isCrit){ playerDamage = playerDamage * 2; }
      
      enemy.hp -= playerDamage;
      
      // Increment combo on successful hit
      p.comboCount = (p.comboCount || 0) + 1;
      if(p.comboCount > (p.maxCombo || 0)) p.maxCombo = p.comboCount;
      
      // Display combo counter if >= 3
      const comboText = p.comboCount >= 3 ? ` ×${p.comboCount} COMBO!` : '';
      const detail = `Attack: ${playerDamageRaw} - DEF: ${enemy.def||0}${comboMultiplier > 1 ? ` (×${comboMultiplier} combo)` : ''}`;
      
      if(isCrit){
        this.logEvent('attack', `⚔️ CRITICAL HIT! ${this.player.name} struck for ${playerDamage} damage!${comboText}`, detail, 'log-critical');
      } else {
        this.logEvent('attack', `You hit ${enemy.name} for ${playerDamage} damage${comboText}`, detail);
      }
      
      // Show combo UI overlay for high combos
      if(p.comboCount >= 3) {
        this.showComboOverlay(p.comboCount);
      }
      
      // Combo milestone bonuses
      if(p.comboCount === 10) {
        const healAmount = Math.floor(p.maxHP * 0.5);
        p.hp = Math.min(p.maxHP, p.hp + healAmount);
        this.logEvent('heal', `💫 MEGA COMBO! Restored ${healAmount} HP!`, null, 'log-critical');
      }
      
      this.flashElement(document.getElementById('player-xp'),'glow-xp',500);
      this.updateUI();
      
      // check death
      if(enemy.hp <= 0){
        this.onEnemyDefeated(enemy);
        this.exitCombat();
        return;
      }
      // enemy turn
      setTimeout(()=> this.enemyTurn(), 400 + Math.random()*300);
    }
    
    defendAction(){
      // reduce next incoming damage
      if(!this.playerTurn) return; // prevent spam clicking
      this.playerTurn = false; // lock out other actions
      this.player.isDefending = true;
      this.logEvent('info','You brace for the next attack','Incoming damage reduced');
      setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
    }
    
    fleeAction(){
      const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
      if(!this.playerTurn) return; // prevent spam clicking
      this.playerTurn = false; // lock out other actions
      // cannot flee if escorting or from certain enemies
      const escortActive = (p.quests || []).some(q=> q.type === 'escort');
      if(escortActive){ this.logEvent('info','Cannot flee while escorting!'); return; }
      if(enemy.cannotFlee || enemy.isBoss){ this.logEvent('info','Cannot flee from this enemy!'); setTimeout(()=> this.enemyTurn(), 300); return; }
      // Calculate flee chance based on DEX
      const baseChance = enemy.inDungeon ? 0.3 : 0.5;
      const dexBonus = ((p.dex || 1) - (enemy.dex || 1)) * 0.02;
      const fleeChance = Math.max(0.1, Math.min(0.9, baseChance + dexBonus));
      if(Math.random() < fleeChance){
        this.logEvent('info','You escaped safely!','Fled from combat');
        this.exitCombat();
      } else {
        this.logEvent('info','Escape failed! Enemy attacks!');
        setTimeout(()=> this.enemyTurn(), 300);
      }
    }
    
    showCombatItemMenu(){
      if(!this.playerTurn) return; // prevent opening during enemy turn
      const consumables = this.inventory.items.filter(i=> i.type==='consumable');
      if(consumables.length===0){ this.logEvent('info','No consumables available'); return; }
      const html = consumables.map((it,i)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div>${it.name} x${it.count||1} (Heal: ${it.heal||0})</div><button data-use="${i}">Use</button></div>`).join('');
      this.showModal('Use Item in Combat', `<div style="display:flex;flex-direction:column;gap:6px">${html}</div>`, [{text:'Cancel', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-use]').forEach(btn=> btn.addEventListener('click', ()=>{
        if(!this.playerTurn) return; // double-check before item use
        this.playerTurn = false; // lock turn
        const idx = parseInt(btn.getAttribute('data-use'));
        const it = consumables[idx];
        const res = this.inventory.useItem(it.id, this.player);
        if(res.used){ 
          if(res.heal) this.logEvent('heal', `Used ${it.name}. Restored ${res.heal||0} HP`); 
          if(res.cured) this.logEvent('info', `Used ${it.name}. Cured ${res.cured} status effects`);
          this.player.consumablesUsed = (this.player.consumablesUsed || 0) + 1; // Track for achievements
        }
        else { this.logEvent('info', `Could not use ${it.name}`); }
        this.hideModal();
        this.updateUI();
        setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
      }));
    }
    
    showCombatSkillMenu(){
      if(!this.playerTurn) return; // prevent opening during enemy turn
      const p = this.player;
      const activeSkills = Object.keys(SKILLS).filter(k=> {
        const sk = SKILLS[k];
        return sk.type === 'active' && p.skills && p.skills[k];
      });
      if(activeSkills.length === 0){ this.logEvent('info','No active skills available'); return; }
      const html = activeSkills.map((k,i)=> {
        const sk = SKILLS[k];
        const cd = (p.skillCooldowns && p.skillCooldowns[k]) || 0;
        const canUse = cd === 0;
        return `<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px\"><div><strong>${sk.name}</strong><div class=\"muted\">${sk.desc}</div>${cd > 0 ? `<div class=\"muted\">Cooldown: ${cd} turns</div>` : ''}</div><button data-skill=\"${k}\" ${canUse ? '' : 'disabled'}>Use</button></div>`;
      }).join('');
      this.showModal('Use Skill in Combat', `<div style="display:flex;flex-direction:column;gap:6px">${html}</div>`, [{text:'Cancel', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-skill]').forEach(btn=> btn.addEventListener('click', ()=>{
        if(!this.playerTurn) return; // prevent skill use during enemy turn
        const skillId = btn.getAttribute('data-skill');
        this.hideModal();
        this.useSkillInCombat(skillId);
      }));
    }
    
      useSkillInCombat(skillId){
        const p = this.player;
        const enemy = this.currentEnemy;
        if(!enemy) return;
        if(!this.playerTurn) return; // prevent skill spam
        this.playerTurn = false; // lock turn
        const sk = SKILLS[skillId];
        if(!sk){ this.logEvent('info','Skill not found'); return; }
        const cd = (p.skillCooldowns && p.skillCooldowns[skillId]) || 0;
        if(cd > 0){ this.logEvent('info',`${sk.name} is on cooldown for ${cd} more turns`); this.playerTurn = true; return; }
      
        // Apply skill effect
        if(skillId === 'vertical_arc'){
          const damage = Math.floor(p.atk * 1.5);
          const finalDamage = Math.max(1, damage - (enemy.def||0));
          enemy.hp -= finalDamage;
          this.logEvent('attack', `${sk.name}! ${finalDamage} damage to ${enemy.name}`, 'Powerful strike!');
          p.skillCooldowns[skillId] = sk.cooldown || 2;
        } else if(skillId === 'quick_heal'){
          const heal = Math.floor(p.maxHP * 0.3);
          p.hp = Math.min(p.maxHP, p.hp + heal);
          this.logEvent('heal', `${sk.name}! Restored ${heal} HP`, 'Quick recovery');
          p.skillCooldowns[skillId] = sk.cooldown || 3;
        } else if(skillId === 'stance_change'){
          // add guard status for 2 turns
          p.statusEffects = p.statusEffects || [];
          p.statusEffects.push({type:'guard', turns:2, value:2});
          this.logEvent('info', 'You brace yourself. Incoming damage will be reduced for 2 turns.');
          p.skillCooldowns[skillId] = sk.cooldown || 4;
        } else if(skillId === 'burst_strike'){
          // big hit, then weakened for 1 turn
          const damage = Math.floor(p.atk * 2.0);
          const finalDamage = Math.max(1, damage - (enemy.def||0));
          enemy.hp -= finalDamage;
          this.logEvent('attack', `${sk.name}! You dealt ${finalDamage} damage but feel exposed.`, 'Weakened');
          p.statusEffects = p.statusEffects || [];
          p.statusEffects.push({type:'weakened', turns:1, value:1});
          p.skillCooldowns[skillId] = sk.cooldown || 4;
        }
      
        this.updateUI();
        // Check if enemy died
        if(enemy.hp <= 0){
          this.onEnemyDefeated(enemy);
          this.exitCombat();
          return;
        }
        // Enemy turn
        setTimeout(()=> this.enemyTurn(), 400);
      }
    
    enemyTurn(freeAttack=false){
      const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
      this.playerTurn = false; // ensure player can't act during enemy turn
      // process enemy status effects (poison etc.) at start of its action
      this.processEnemyStatusEffects(enemy);
      // dodge/evasion check based on DEX
      const enemyDex = enemy.dex || Math.max(1, Math.floor((enemy.atk||1)*0.5));
      let baseDodge = 0.05 + Math.max(-0.2, Math.min(0.3, ((p.dex||1) - enemyDex) * 0.02));
      if(p.archetype === 'rogue') baseDodge += (ARCHETYPES.rogue.passives.dodgeBonus || 0);
      const dodgeChance = Math.max(0.05, Math.min(0.45, baseDodge));
      if(!freeAttack && Math.random() < dodgeChance){
        this.logEvent('info', `💨 You narrowly evaded ${enemy.name}'s attack!`, null, 'log-dodge');
        // Track dodge stats
        p.dodges = (p.dodges || 0) + 1;
        p.dodgeStreak = (p.dodgeStreak || 0) + 1;
        return setTimeout(()=> this.combatTurn(), 300);
      }
      // Reset dodge streak on hit (or miss)
      p.dodgeStreak = 0;
      
      const enemyDamageRaw = enemy.atk + rand(-1,2);
      // apply guard/weakened modifiers
      const guardStacks = (p.statusEffects||[]).filter(s=> s.type==='guard' && s.turns>0).reduce((a,s)=> a + (s.value||0), 0);
      const weakened = (p.statusEffects||[]).some(s=> s.type==='weakened' && s.turns>0);
      let enemyDamage = Math.max(1, enemyDamageRaw - (p.def + guardStacks));
      if(p.archetype === 'guardian') enemyDamage = Math.max(1, enemyDamage - (ARCHETYPES.guardian.passives.flatDamageReduction || 0));
      if(weakened) enemyDamage = Math.ceil(enemyDamage * 1.25);
        if(p.isDefending && !freeAttack){ 
          enemyDamage = Math.ceil(enemyDamage/2); 
          this.logEvent('info','Your defense absorbs some damage!','Reduced by 50%');
          p.isDefending = false; 
        }
      p.hp -= enemyDamage;
      
      // Reset combo on taking damage
      if(p.comboCount > 0) {
        this.logEvent('info', `Combo broken! (Was at ×${p.comboCount})`);
        p.comboCount = 0;
      }
      
      this.logEvent('attack', `${enemy.name} hits you for ${enemyDamage} damage`, `Attack: ${enemyDamageRaw} - DEF: ${p.def}`);
      this.flashElement(document.getElementById('player-hp'),'flash-red',700);
      // Track near-death survival achievement
      if(p.hp > 0 && p.hp <= p.maxHP * 0.1) {
        p.nearDeathSurvival = true;
      }
      // enemy may apply a status on hit
      if(enemy.statusOnHit && Math.random() < (enemy.statusOnHit.chance || 0)){
        this.applyStatusToPlayer(enemy.statusOnHit.type, enemy.statusOnHit.turns || 2, enemy.statusOnHit.value || 0);
        this.logEvent('info', `${enemy.name} inflicted ${enemy.statusOnHit.type} on you!`);
      }
      this.updateUI();
      if(p.hp <= 0){ 
        this.logEvent('info','You were defeated...','HP and gold reduced'); 
        this.failEscortQuests(); 
        p.hp = Math.max(1, Math.floor(p.maxHP/2)); 
        p.gold = Math.max(0, Math.floor(p.gold*0.7));
        p.comboCount = 0; // Reset combo on death
        this.exitCombat();
        return;
      }
      // Next turn
      setTimeout(()=> this.combatTurn(), 300);
    }

    onEnemyDefeated(enemy){
      const p = this.player;
      this.logEvent('boss', `Defeated ${enemy.name}!`, `+${enemy.exp} XP, +${enemy.gold} gold`);
      // Archetype XP bonus (Sage)
      const xpMult = p.archetype === 'sage' ? (ARCHETYPES.sage.passives.xpMult || 1) : 1;
      const leveled = p.addXp(Math.floor(enemy.exp * xpMult));
      p.gold += enemy.gold;
      
      // Track achievement stats
      p.kills = (p.kills || 0) + 1;
      if(enemy.isBoss) p.bossKills = (p.bossKills || 0) + 1;
      if(enemy.fieldBoss) p.fieldBosses = (p.fieldBosses || 0) + 1;
      
      // if miniboss, drop a Boss Key for current floor
      if(enemy.isMiniBoss){
        const f = enemy.floor || p.floor;
        const key = this.inventory.addItem({name:`Boss Key (Floor ${f})`, type:'quest', floor:f});
        this.logEvent('info', `You found a ${key.name}! Return to town to face the Boss Arena.`);
        this.showInventoryBadge();
      }
      // if this enemy was part of an escort quest, progress that quest
      if(enemy.escortQuestId){
        // progress the specific escort quest by 1 per encounter defeated
        this.progressQuests('escort', 1, enemy.escortQuestId);
      }
      // chance to drop a resource tied to enemy/floor
      const res = this.getResourceForEnemy(enemy);
      const dropBase = 0.5 + (p.luck||0)*0.02 + (p.archetype==='sage' ? (ARCHETYPES.sage.passives.dropBonus || 0) : 0);
      if(res && Math.random() < dropBase){
        const dropped = this.inventory.addItem({name:res,type:'resource'}, 1);
        this.logEvent('loot', `Found resource: ${dropped.name}`);
        this.showInventoryBadge();
      }
      // if this was the arena boss, clear the floor and unlock next one
      if(enemy.isBoss && enemy.arena){
        const f = enemy.floor || p.floor;
        if(!p.clearedBosses.includes(f)){
          p.clearedBosses.push(f); p.dungeonProgress[f]=0; this.log(`Floor ${f} boss cleared in the Arena.`);
          if(p.floor===f){ p.floor = Math.min(MAX_FLOORS, p.floor+1); this.log(`You may now progress to Floor ${p.floor}.`); }
          // award token on floor boss clear
          p.tokens = (p.tokens||0) + 1; this.logEvent('info', 'Awarded a Quest Token for clearing the floor boss!');
          const statusCard = document.getElementById('status'); this.flashElement(statusCard,'levelup-flash',1200);
        }
      }
      // Field boss rare drop
      if(enemy.isBoss && !enemy.arena){
        const drop = this.inventory.addItem({name:'Lucky Pendant', type:'equipment', slot:'Accessory', def:1, luck:1});
        this.logEvent('loot', `Rare drop: ${drop.name} (+1 LUCK, +1 DEF)`);
        this.showInventoryBadge();
      }
      this.progressQuests('kill',1);
      if(leveled){ 
        this.log(`Gained ${leveled} level(s)! Allocate your stat points.`); 
        const statusCard = document.getElementById('status'); 
        this.flashElement(statusCard,'levelup-flash',1200);
        this.pauseForStatAllocation(); 
      }
      this.currentEnemy = null; this.busy=false; this.setButtonsDisabled(false); this.updateUI();
    }

    // Map enemies to potential resource drops (simple mapping)
    getResourceForEnemy(enemy){
      const name = (enemy.name||'').toLowerCase();
      if(name.includes('slime')) return 'Slime Jelly';
      if(name.includes('wolf')) return 'Dire Wolf Pelt';
      if(name.includes('crystal') || name.includes('shard')) return 'Raw Crystal';
      if(name.includes('ice')) return 'Ice Shard';
      if(name.includes('magma') || name.includes('lava') || name.includes('hound')) return 'Magma Core';
      return null;
    }

    // Status effect helpers
    applyStatusToPlayer(type, turns=2, value=0){ this.player.statusEffects.push({type,turns,value}); }
    applyStatusToEnemy(enemy, type, turns=2, value=0){ enemy.statusEffects = enemy.statusEffects || []; enemy.statusEffects.push({type,turns,value}); }
    processPlayerStatusEffects(){
      const p = this.player; if(!p.statusEffects || p.statusEffects.length===0) return;
      for(let i=p.statusEffects.length-1;i>=0;i--){ const s = p.statusEffects[i];
        if(s.type === 'poison'){ const dmg = Math.max(1, Math.floor((p.maxHP||10)*0.03)); p.hp -= dmg; this.logEvent('attack', `Poison deals ${dmg} damage to you`); }
        if(s.type === 'slow'){ /* can be used to reduce action options — keeping simple */ }
        s.turns--; if(s.turns <= 0) p.statusEffects.splice(i,1);
      }
      if(p.hp <= 0){ this.logEvent('info','You succumbed to status effects...'); p.hp = Math.max(1, Math.floor(p.maxHP/2)); }
      // if player was reduced to zero by status effects, any escort runs fail
      if(p.hp <= 0){ this.failEscortQuests(); }
      this.updateUI();
    }
    processEnemyStatusEffects(enemy){
      if(!enemy || !enemy.statusEffects || enemy.statusEffects.length===0) return;
      for(let i=enemy.statusEffects.length-1;i>=0;i--){ const s = enemy.statusEffects[i];
        if(s.type === 'poison'){ const dmg = Math.max(1, Math.floor((enemy.maxHP||10)*0.04)); enemy.hp -= dmg; this.logEvent('attack', `${enemy.name} suffers ${dmg} poison damage`); }
        if(s.type === 'regen'){ enemy.hp = Math.min(enemy.maxHP, enemy.hp + (s.value||5)); this.logEvent('info', `${enemy.name} regenerates ${s.value||5} HP`); }
        s.turns--; if(s.turns <= 0) enemy.statusEffects.splice(i,1);
      }
      if(enemy.hp <= 0){ this.onEnemyDefeated(enemy); }
    }

    // Fail any active escort quests (used when player dies or other fail conditions)
    failEscortQuests(){
      const p = this.player;
      const removed = (p.quests || []).filter(q=> q.type === 'escort');
      if(removed.length){
        p.quests = (p.quests || []).filter(q=> q.type !== 'escort');
        removed.forEach(q=> this.logEvent('info', `Escort quest failed: ${q.title}`));
        this.updateUI();
      }
    }

    // Skills UI and execution
    openSkillModal(){
      const p = this.player;
      // if in combat and it's player's turn, show usable skills
      const unlocked = Object.keys(p.skills || {});
      const available = Object.keys(SKILLS).map(k=> SKILLS[k]);
      const html = available.map(s => {
        const unlockedMark = p.skills && p.skills[s.id] ? ' (Unlocked)' : '';
        const cd = (p.skillCooldowns && p.skillCooldowns[s.id]) ? ` — CD:${p.skillCooldowns[s.id]}` : '';
        const cost = s.type==='passive' ? `Cost: ${s.cost} SP` : `Cooldown: ${s.cooldown||0}`;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${s.name}</strong>${unlockedMark}<div class="muted">${s.desc}</div><div class="muted">${cost}${cd}</div></div><div>${p.skills && p.skills[s.id] ? `<button data-skill-use="${s.id}">Use</button>` : `<button data-skill-buy="${s.id}">Unlock</button>`}</div></div>`;
      }).join('');
      this.showModal('Skills', `<div style="display:flex;flex-direction:column;gap:8px">${html}</div>`, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-skill-buy]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-skill-buy');
        const sk = SKILLS[id]; if(!sk) return;
        if(p.skillPoints <= 0){ this.logEvent('info','Not enough skill points.'); return; }
        p.skillPoints--; p.skills[id] = true; this.logEvent('info', `Unlocked skill: ${sk.name}`);
        // apply passive effects immediately
        if(sk.type === 'passive'){
          if(id === 'battle_focus'){ /* passive applied through check in crit calc */ }
          if(id === 'survival_instinct'){ p.maxHP += 5; p.hp = p.maxHP; }
        }
        this.hideModal(); this.updateUI();
      }));
      body.querySelectorAll('button[data-skill-use]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-skill-use'); this.hideModal(); this.useSkill(id);
      }));
    }

    useSkill(id){
      const p = this.player; const enemy = this.currentEnemy;
      const sk = SKILLS[id]; if(!sk) return;
      if(!p.skills || !p.skills[id]){ this.logEvent('info','Skill not unlocked.'); return; }
      if(sk.type === 'active'){
        const cd = p.skillCooldowns[id] || 0; if(cd > 0){ this.logEvent('info', 'Skill on cooldown.'); return; }
        if(!enemy){ this.logEvent('info','No target.'); return; }
        if(id === 'vertical_arc'){
          const raw = Math.floor(p.atk * 1.5) + rand(-1,2);
          let dmg = Math.max(1, raw - (enemy.def||0));
          const isCrit = Math.random() < (0.03 + (p.luck||0)*0.01 + (p.dex||0)*0.005 + (p.skills && p.skills['battle_focus'] ? 0.05 : 0));
          if(isCrit){ dmg *= 2; }
          enemy.hp -= dmg; this.logEvent('attack', `Used Vertical Arc on ${enemy.name} for ${dmg} damage` + (isCrit ? ' — CRITICAL!' : ''), `Skill`);
        }
        if(id === 'quick_heal'){
          const heal = Math.min(p.maxHP - p.hp, Math.floor(p.maxHP * 0.35)); p.hp += heal; this.logEvent('heal', `Used Quick Heal, restored ${heal} HP`);
        }
        p.skillCooldowns[id] = sk.cooldown || 2;
        this.updateUI();
        // check if enemy died
        if(enemy && enemy.hp <= 0){ this.onEnemyDefeated(enemy); return; }
        // enemy turn
        setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
      }
    }

    // Crafting removed

    progressQuests(type,amount, questIdFilter=null){
      const p = this.player;
      let completed = [];
      let progressedQuestIds = []; // track which quests got updated
      p.quests.forEach(q=>{
        if(q.type === type && (!questIdFilter || q.id === questIdFilter)){
          q.progress = (q.progress||0) + amount;
          progressedQuestIds.push(q.id);
          if(q.progress >= q.target){
            // mark complete and move to completedQuests (player must collect rewards at the quest board)
            completed.push(q.id);
            p.completedQuests = p.completedQuests || [];
            p.completedQuests.push({id:q.id,title:q.title, reward:q.reward, meta:q.meta || {}});
            this.log(`Quest complete: ${q.title}. Return to the Quest Board to collect your reward.`);
          }
        }
      });
      if(completed.length){
        p.quests = p.quests.filter(q=>!completed.includes(q.id));
      }
      this.updateUI();
      // Ping quest tracker for progressed/completed quests
      progressedQuestIds.forEach(qid => {
        this.pingQuestTracker(qid);
      });
    }

    updateQuestTracker(){
      const trackerList = document.getElementById('quest-tracker-list');
      if(!trackerList) return;
      const p = this.player;
      const completed = p.completedQuests || [];
      
      // Update quest count display in mobile summary
      const questCountDisplay = document.getElementById('quest-count-display');
      if(questCountDisplay) questCountDisplay.textContent = (p.quests || []).length + completed.length;
      
      // Build HTML for active quests
      trackerList.innerHTML = '';
      
      // Show completed quests with gold glow
      completed.forEach(cq => {
        const div = document.createElement('div');
        div.className = 'quest-item complete';
        div.innerHTML = `
          <div class="quest-item-title">✓ ${cq.title}</div>
          <div class="quest-item-desc">Complete! Return to Quest Board</div>
          <div class="bar-outer"><div class="bar-inner" style="width:100%"></div></div>
        `;
        div.addEventListener('click', () => {
          this.showModal('Quest Complete', `<strong>${cq.title}</strong><br><br>Complete! Visit the Quest Board in town to collect your reward.`, [
            {text:'Close', action:()=>this.hideModal()}
          ]);
        });
        trackerList.appendChild(div);
      });

      // Show active quests
      p.quests.forEach(q => {
        const prog = q.progress || 0;
        const pct = Math.min(100, Math.round((prog / q.target) * 100));
        const div = document.createElement('div');
        div.className = 'quest-item';
        div.setAttribute('data-quest-id', q.id);
        div.innerHTML = `
          <div class="quest-item-title">${q.title}</div>
          <div class="quest-item-desc">${q.desc}</div>
          <div class="quest-item-progress">${prog} / ${q.target}</div>
          <div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div>
        `;
        div.addEventListener('click', () => {
          const typeLabel = {kill:'Kill', gather:'Gather', escort:'Escort', delivery:'Delivery', explore:'Explore'}[q.type] || q.type;
          this.showModal(q.title, `
            <strong>${q.title}</strong><br>
            <div class="muted" style="margin:8px 0">${q.desc}</div>
            <div style="margin-top:8px">
              <strong>Type:</strong> ${typeLabel}<br>
              <strong>Progress:</strong> ${prog} / ${q.target}<br>
              <strong>Reward:</strong> ${q.reward.xp} XP, ${q.reward.gold} Gold
            </div>
          `, [
            {text:'Close', action:()=>this.hideModal()}
          ]);
        });
        trackerList.appendChild(div);
      });

      // Show empty state if no quests
      if(p.quests.length === 0 && completed.length === 0){
        trackerList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;font-size:12px;">No active quests.<br>Visit the Quest Board in town!</div>';
      }
    }

    pingQuestTracker(questId){
      // Add visual ping animation to quest item
      const trackerList = document.getElementById('quest-tracker-list');
      if(!trackerList) return;
      const questItem = trackerList.querySelector(`[data-quest-id="${questId}"]`);
      if(questItem){
        questItem.classList.add('pinged');
        setTimeout(()=> questItem.classList.remove('pinged'), 500);
      }
    }

    openNPCDialog(){
      // Modal-based NPC dialog
      const npcListHtml = this.npcs.map((n,i)=>{
        return `<div class="npc-item" data-idx="${i}"><strong>${n.name}</strong><div class="muted">${n.desc}</div></div>`;
      }).join('');
      this.showModal('NPCs', `<div style="display:flex;flex-direction:column;gap:8px">${npcListHtml}</div>`, [
        {text:'Close',action:()=>this.hideModal()}
      ]);
      // attach click handlers
      const body = document.getElementById('modal-body');
      body.querySelectorAll('.npc-item').forEach(el=>{
        el.style.cursor = 'pointer';
        el.addEventListener('click', ()=>{
          const idx = parseInt(el.getAttribute('data-idx'));
          this.showNPCOptions(idx);
        });
      });
    }

    showNPCOptions(npcIndex){
      const npc = this.npcs[npcIndex];
      const optsHtml = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div><strong>${npc.name}</strong><div class="muted">${npc.desc}</div></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button data-npcact="quests">View Quests</button>
            <button data-npcact="boss">Ask about Boss</button>
            <button data-npcact="gossip">Gossip</button>
            <button data-npcact="exchange">Exchange</button>
          </div>
        </div>
      `;
      this.showModal(`${npc.name}`, optsHtml, [{text:'Back', action:()=> this.openNPCDialog()}, {text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-npcact]').forEach(btn=> btn.addEventListener('click', ()=>{
        const act = btn.getAttribute('data-npcact');
        if(act==='quests'){ this.hideModal(); this.showNPCQuests(npcIndex); }
        if(act==='boss'){ this.hideModal(); this.logEvent('info', `${npc.name} says: "Watch for ${FLOOR_DEFS[this.player.floor]?.boss?.name || 'the boss'} — it has a powerful attack.'`); }
        if(act==='gossip'){ this.hideModal(); this.npcGossip(npcIndex); }
        if(act==='exchange'){ this.hideModal(); this.npcExchange(npcIndex); }
      }));
    }

    npcGossip(npcIndex){
      // small chance for gold or low-level item
      const chance = Math.random();
      if(chance < 0.35){ const gold = rand(5,25); this.player.gold += gold; this.logEvent('gold', `${this.npcs[npcIndex].name} gave you ${gold} gold`); }
      else if(chance < 0.6){ const it = this.inventory.addItem({name:'Curious Trinket',type:'equipment',slot:'Accessory',atk:0,def:1}); this.logEvent('loot', `Received a ${it.name}`); this.showInventoryBadge(); }
      else { this.logEvent('info', `${this.npcs[npcIndex].name} had nothing of note.`); }
      this.updateUI();
    }

    npcExchange(npcIndex){
      // simple exchange: sell gold for a basic weapon if player has enough
      const npc = this.npcs[npcIndex];
      if(this.player.gold >= 100){
        const weapon = {name:'Basic Sword',type:'equipment',slot:'Weapon',atk:2,def:0};
        const it = this.inventory.addItem(weapon);
        this.player.gold -= 100;
        this.logEvent('info', `${npc.name} sold you a ${it.name} for 100 gold.`);
        this.showInventoryBadge();
      } else {
        this.logEvent('info', `${npc.name} says: "You need 100 gold for a basic weapon."`);
      }
      this.updateUI();
    }

    showNPCQuests(npcIndex){
      const npc = this.npcs[npcIndex];
      // combine NPC quests with floor-specific quests (if any)
      const floorDef = FLOOR_DEFS[this.player.floor] || null;
      const floorQuests = floorDef && floorDef.quests ? floorDef.quests : [];
      const combined = npc.quests.concat(floorQuests);
      // filter out quests already accepted by id prefix
      const already = (this.player.quests || []).map(q=>q.id.split('_')[0]);
      const visible = combined.filter(q=> !already.includes(q.id));
      const qHtml = visible.map((q,i)=>{
        return `<div class="quest-item" data-idx="${i}"><strong>${q.title}</strong><div class="muted">${q.desc}</div><div class="muted">Reward: ${q.reward.xp} XP, ${q.reward.gold} gold</div></div>`;
      }).join('') || '<div class="muted">No available quests.</div>';
      this.showModal(`${npc.name} — Quests`, `<div style="display:flex;flex-direction:column;gap:8px">${qHtml}</div>`, [
        {text:'Back',action:()=> this.openNPCDialog()},
        {text:'Close',action:()=> this.hideModal()}
      ]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('.quest-item').forEach(el=>{
        el.style.cursor='pointer';
        el.addEventListener('click', ()=>{
          const qIdx = parseInt(el.getAttribute('data-idx'));
          const questToAdd = Object.assign({}, visible[qIdx]);
          questToAdd.id = questToAdd.id + '_' + Date.now();
          this.player.quests.push({id:questToAdd.id,title:questToAdd.title,desc:questToAdd.desc,type:questToAdd.type,target:questToAdd.target,progress:0,reward:questToAdd.reward});
          this.log(`Accepted quest: ${questToAdd.title}`);
          this.hideModal();
          this.updateUI();
        });
      });
    }

    // Simple modal helpers
    showModal(title, bodyHtml, actions){
      const modal = document.getElementById('modal');
      if(!modal) return;
      modal.setAttribute('aria-hidden','false');
      document.getElementById('modal-title').textContent = title;
      const body = document.getElementById('modal-body'); body.innerHTML = bodyHtml;
      const actionsEl = document.getElementById('modal-actions'); actionsEl.innerHTML='';
      actions.forEach(a=>{
        const btn = document.createElement('button'); btn.textContent = a.text;
        btn.addEventListener('click', ()=> a.action && a.action());
        actionsEl.appendChild(btn);
      });
    }

    hideModal(){
      const modal = document.getElementById('modal'); if(!modal) return; modal.setAttribute('aria-hidden','true');
    }

    // Achievement System
    checkAchievements(){
      if(!window.ACHIEVEMENTS) return;
      const p = this.player;
      p.achievements = p.achievements || {};
      
      Object.values(window.ACHIEVEMENTS).forEach(ach => {
        if(p.achievements[ach.id]) return; // already unlocked
        
        // Check if achievement condition is met
        if(ach.check(p, this.inventory)){
          p.achievements[ach.id] = true;
          p.gold += ach.reward;
          this.showAchievementPopup(ach);
          this.logEvent('achievement', `Achievement Unlocked: ${ach.name} (+${ach.reward} gold)`);
        }
      });
      
      // Update achievement count in UI
      const countEl = document.getElementById('achievement-count');
      if(countEl) countEl.textContent = Object.keys(p.achievements).length;
    }

    showAchievementPopup(ach){
      const popup = document.getElementById('achievement-popup');
      if(!popup) return;
      
      popup.querySelector('.achievement-name').textContent = ach.name;
      popup.querySelector('.achievement-desc').textContent = ach.desc;
      popup.querySelector('.achievement-reward').textContent = `+${ach.reward} Gold`;
      
      popup.classList.add('show');
      
      setTimeout(() => {
        popup.classList.remove('show');
      }, 4000);
    }

    showAchievementsModal(){
      if(!window.ACHIEVEMENTS) {
        this.showModal('Achievements', '<div>No achievements available.</div>', [{text:'Close', action:()=>this.hideModal()}]);
        return;
      }
      
      const p = this.player;
      p.achievements = p.achievements || {};
      const unlocked = Object.keys(p.achievements).length;
      const total = Object.keys(window.ACHIEVEMENTS).length;
      
      // Group achievements by category
      const categories = {
        Combat: ['first_blood', 'fighter', 'warrior', 'slayer', 'legend', 'boss_hunter', 'boss_slayer', 'boss_master', 'critical_expert', 'dodge_master', 'untouchable'],
        Exploration: ['explorer', 'adventurer', 'floor_clearer', 'field_boss_encounter'],
        Progression: ['leveling_up', 'veteran', 'expert', 'skill_master'],
        Economy: ['merchant', 'wealthy', 'collector', 'storage_user', 'potion_addict'],
        Quests: ['quest_starter', 'quest_completer', 'quest_master'],
        Special: ['survivor', 'blacksmith_friend', 'social_butterfly', 'lucky_find']
      };
      
      let html = `<div style="margin-bottom:12px"><strong>Progress:</strong> ${unlocked} / ${total} unlocked</div><div class="achievement-grid">`;
      
      Object.entries(categories).forEach(([cat, ids]) => {
        ids.forEach(id => {
          const ach = window.ACHIEVEMENTS[id];
          if(!ach) return;
          const isUnlocked = p.achievements[id] || false;
          const lockedClass = isUnlocked ? 'unlocked' : 'locked';
          const icon = isUnlocked ? '🏆' : '🔒';
          
          html += `
            <div class="achievement-card ${lockedClass}">
              <div class="achievement-card-header">
                <div class="achievement-card-icon">${icon}</div>
                <div class="achievement-card-info">
                  <div class="achievement-card-name">${ach.name}</div>
                  <div class="achievement-card-desc">${ach.desc}</div>
                </div>
              </div>
              <div class="achievement-card-reward">${isUnlocked ? 'Unlocked!' : `Reward: ${ach.reward} Gold`}</div>
            </div>
          `;
        });
      });
      
      html += '</div>';
      
      this.showModal('Achievements', html, [{text:'Close', action:()=>this.hideModal()}]);
    }

    // Archetype Selection Modal
    showArchetypeModal(){
      if(this.player.archetype){
        this.showModal('Archetype', `<div>You've already chosen the <strong>${ARCHETYPES[this.player.archetype]?.name}</strong> archetype. This choice is permanent for your journey.</div>`, [{text:'Close', action:()=>this.hideModal()}]);
        return;
      }
      const html = Object.values(ARCHETYPES).map((arch,i)=> `
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:16px;font-weight:700;color:#fff">${arch.name}</div>
              <div style="font-size:12px;color:var(--muted);margin:6px 0">${arch.desc}</div>
              <div style="font-size:11px;color:var(--muted)">
                Stat Bonuses: ${Object.entries(arch.mods).map(([stat,val])=>`${stat.toUpperCase()} +${val}`).join(', ')}
              </div>
            </div>
            <button data-arch="${arch.id}" style="min-width:80px">Choose</button>
          </div>
        </div>
      `).join('');
      this.showModal('Choose Your Archetype', `<div style="margin-bottom:8px">Select an archetype to define your playstyle. This choice is permanent.</div>${html}`, [{text:'Cancel', action:()=>this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-arch]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-arch');
        const arch = ARCHETYPES[id];
        if(!arch) return;
        // Apply archetype stat mods
        this.player.archetype = id;
        if(arch.mods.atk) this.player.atk += arch.mods.atk;
        if(arch.mods.def) this.player.def += arch.mods.def;
        if(arch.mods.dex) this.player.dex += arch.mods.dex;
        if(arch.mods.luck) this.player.luck += arch.mods.luck;
        this.logEvent('info', `You have chosen the ${arch.name} archetype! Stats adjusted.`);
        this.hideModal();
        this.updateUI();
      }));
    }

    // Pause game and show stat allocation UI for pending stat points
    pauseForStatAllocation(){
      const p = this.player;
      if(!p.pendingStatPoints || p.pendingStatPoints <= 0) return;
      // disable main buttons while allocating
      this.setButtonsDisabled(true); this.busy = true;
      // allocation state
      let remaining = p.pendingStatPoints;
      let alloc = {hp:0,atk:0,def:0};
      const bodyHtml = `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>Level ${p.level} reached — allocate your points.</div>
          <div><strong>Points to spend:</strong> <span id="alloc-remaining">${remaining}</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <div style="flex:1">
              <div><strong>+5 Max HP</strong></div>
              <div class="muted">Increase max HP and fully restore when confirmed.</div>
              <div style="margin-top:6px"><button data-action="hp-plus">+1</button> <span id="alloc-hp">0</span></div>
            </div>
            <div style="flex:1">
              <div><strong>+1 ATK</strong></div>
              <div class="muted">Increase attack power.</div>
              <div style="margin-top:6px"><button data-action="atk-plus">+1</button> <span id="alloc-atk">0</span></div>
            </div>
            <div style="flex:1">
              <div><strong>+1 DEF</strong></div>
              <div class="muted">Increase defense.</div>
              <div style="margin-top:6px"><button data-action="def-plus">+1</button> <span id="alloc-def">0</span></div>
            </div>
          </div>
        </div>
      `;
      this.showModal('Allocate Stat Points', bodyHtml, [
        {text:'Confirm', action:()=>{
          // apply allocation
          p.applyStatAllocation(alloc);
          this.log(`Applied stat allocation: HP+${alloc.hp*5}, ATK+${alloc.atk}, DEF+${alloc.def}`);
          this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI();
        }},
        {text:'Cancel', action:()=>{ this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI(); }}
      ]);
      // attach allocation button handlers
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', ()=>{
          const act = btn.getAttribute('data-action');
          if(remaining <= 0) return;
          if(act === 'hp-plus'){ alloc.hp += 1; }
          if(act === 'atk-plus'){ alloc.atk += 1; }
          if(act === 'def-plus'){ alloc.def += 1; }
          remaining = p.pendingStatPoints - (alloc.hp + alloc.atk + alloc.def);
          // update UI
          const remEl = document.getElementById('alloc-remaining'); if(remEl) remEl.textContent = remaining;
          const hEl = document.getElementById('alloc-hp'); if(hEl) hEl.textContent = alloc.hp;
          const aEl = document.getElementById('alloc-atk'); if(aEl) aEl.textContent = alloc.atk;
          const dEl = document.getElementById('alloc-def'); if(dEl) dEl.textContent = alloc.def;
        });
      });
    }

    abandonQuest(id){
      // remove any quest-linked items (e.g., delivery parcel)
      const linkedItems = this.inventory.items.filter(i=> i.type==='quest' && i.questId === id);
      linkedItems.forEach(it=> this.inventory.removeItem(it.id, it.count || 1));
      this.player.quests = this.player.quests.filter(q=>q.id!==id);
      this.log('Quest abandoned.');
      this.updateUI();
    }

    rest(){
      if(this.busy) return this.log('Busy right now.');
      this.player.hp = this.player.maxHP;
      this.log('You rested and fully recovered HP.');
      this.updateUI();
    }

    toggleAuto(enable){
      if(enable){
        this.log('Auto-explore enabled (field every 3s).');
        this.autoTimer = setInterval(()=>{
          if(!this.busy) this.explore('field');
        }, 3000);
      } else {
        this.log('Auto-explore disabled.');
        if(this.autoTimer) clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
    }


  save() {
      try {
        const data = {
          player: this.player.toJSON(),
          inventory: this.inventory.toJSON(),
          quests: this.player.quests || [],
          completedQuests: this.player.completedQuests || [],
          stash: this.player.stash || [],
          skillCooldowns: this.player.skillCooldowns || {},
          statusEffects: this.player.statusEffects || [],
          fieldProgress: this.player.fieldProgress || {},
          dungeonProgress: this.player.dungeonProgress || {},
          clearedBosses: this.player.clearedBosses || [],
          tokens: this.player.tokens || 0,
          inTown: this.inTown || false,
          autoExplore: !!this.autoTimer,
          currentFloor: this.player.floor,
          timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        this.log('Game saved to browser storage.');
      } catch (e) {
        this.log('Save failed: ' + e.message);
      }
    }

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return this.log('No save found.');
        const data = JSON.parse(raw);
        this.player = new Player();
        this.player.fromJSON(data.player);
        // Restore inventory
        this.inventory = new Inventory();
        if (data.inventory) this.inventory.fromJSON(data.inventory, this.player);
        // Restore additional state
        this.player.quests = data.quests || [];
        this.player.completedQuests = data.completedQuests || [];
        this.player.stash = data.stash || [];
        this.player.skillCooldowns = data.skillCooldowns || {};
        this.player.statusEffects = data.statusEffects || [];
        this.player.fieldProgress = data.fieldProgress || {};
        this.player.dungeonProgress = data.dungeonProgress || {};
        this.player.clearedBosses = data.clearedBosses || [];
        this.player.tokens = data.tokens || 0;
        this.inTown = data.inTown || false;
        // Restore auto-explore
        if (this.autoTimer) clearInterval(this.autoTimer);
        if (data.autoExplore) {
          this.toggleAuto(true);
        }
        // Restore current floor
        if (typeof data.currentFloor === 'number') {
          this.player.floor = data.currentFloor;
        }
        this.log('Save loaded.');
        this.updateUI();
      } catch (e) {
        this.log('Load failed: ' + e.message);
      }
    }

    setButtonsDisabled(val){
      ['btn-field','btn-dungeon','btn-npc','btn-rest','btn-save','btn-load'].forEach(id=>{
        const el = document.getElementById(id); if(el) el.disabled = val;
      });
    }
  }

  // Start game when DOM ready
  window.addEventListener('DOMContentLoaded', ()=> window.game = new Game());
})();

