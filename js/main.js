// Simple text-based SAO-inspired adventure (client-side only)
(() => {
  // Note: MAX_FLOORS, SAVE_KEY, FLOOR_DEFS, SKILLS already defined in config.js
  
  const SAVE_VERSION = 2; // Increment when save schema changes

  // Utility functions
  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)) }
  
  // Performance optimization: Debounce function to limit UI update frequency
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Performance optimization: Request animation frame throttle
  function throttleRAF(func) {
    let scheduled = false;
    return function(...args) {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          func.apply(this, args);
          scheduled = false;
        });
      }
    };
  }

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
      this.maxSP = 50; // Skill Points resource
      this.sp = this.maxSP;
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
      // Quest availability control (accept once; disappear after complete/abandon)
      this.acceptedOriginalQuestIds = [];
      this.finishedOriginalQuestIds = [];
      // Tutorial completion flag
      this.tutorialComplete = false;
      // Faction reputation (affects prices, events, quest access)
      this.reputation = { faune: 0, fae: 0, merchants: 0 };
      // NPC unlock system - NPCs are discovered naturally through gameplay
      this.unlockedNPCs = ['npc_argo']; // Start with Argo the information broker
    }
    nextXp(){ return 50 + Math.floor(60 * (this.level-1) * 1.3) }
    addXp(amount){
      this.xp += amount;
      let leveled = 0;
      while(this.xp >= this.nextXp()){
        this.xp -= this.nextXp();
        this.level++;
        this.maxSP += 5; // Increase max SP on level-up
        this.sp = this.maxSP; // Restore SP to max
        this.pendingStatPoints = (this.pendingStatPoints || 0) + 2;
        // Award skill point every 3 levels (instead of every level)
        if(this.level % 3 === 0) this.skillPoints = (this.skillPoints || 0) + 1;
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
        maxHP: this.maxHP, hp: this.hp, maxSP: this.maxSP, sp: this.sp, atk: this.atk, def: this.def, dex: this.dex, luck: this.luck,
        quests: this.quests, pendingStatPoints: this.pendingStatPoints, skillPoints: this.skillPoints,
        skills: this.skills, skillCooldowns: this.skillCooldowns, statusEffects: this.statusEffects,
        stash: this.stash, completedQuests: this.completedQuests, tokens: this.tokens,
        clearedBosses: this.clearedBosses, dungeonProgress: this.dungeonProgress, fieldProgress: this.fieldProgress,
        achievements: this.achievements, kills: this.kills, bossKills: this.bossKills, criticalHits: this.criticalHits,
        dodges: this.dodges, dodgeStreak: this.dodgeStreak, fieldBosses: this.fieldBosses, stashCount: this.stashCount,
        storageUsed: this.storageUsed, consumablesUsed: this.consumablesUsed, questsAccepted: this.questsAccepted,
        questsCompleted: this.questsCompleted, nearDeathSurvival: this.nearDeathSurvival, equipmentUpgrades: this.equipmentUpgrades,
        npcsTalked: this.npcsTalked, archetype: this.archetype, comboCount: this.comboCount, maxCombo: this.maxCombo,
        acceptedOriginalQuestIds: this.acceptedOriginalQuestIds, finishedOriginalQuestIds: this.finishedOriginalQuestIds,
        tutorialComplete: this.tutorialComplete,
        reputation: this.reputation,
        unlockedNPCs: this.unlockedNPCs
      };
    }
    
    fromJSON(data){
      Object.assign(this, data);
      // ensure reputation exists for old saves
      if(!this.reputation) this.reputation = { faune: 0, fae: 0, merchants: 0 };
      // ensure unlockedNPCs exists for old saves
      if(!this.unlockedNPCs) this.unlockedNPCs = ['npc_argo', 'npc_agil', 'npc_lind']; // Give old players first 3 NPCs
      // ensure SP exists for old saves
      if(!this.maxSP) this.maxSP = 50;
      if(this.sp === undefined) this.sp = this.maxSP;
    }
  }

  // Minimal, forward-only migration to ensure old saves load safely
  function migrateSaveData(data){
    try{
      const migrated = Object.assign({}, data || {});
      const v = Number.isFinite(migrated.version) ? migrated.version : 0;
      // Ensure nested objects/arrays exist
      migrated.player = migrated.player || {};
      migrated.inventory = migrated.inventory || {items:[]};
      migrated.quests = Array.isArray(migrated.quests) ? migrated.quests : (migrated.player.quests || []);
      migrated.completedQuests = Array.isArray(migrated.completedQuests) ? migrated.completedQuests : (migrated.player.completedQuests || []);
      migrated.stash = Array.isArray(migrated.stash) ? migrated.stash : (migrated.player.stash || []);
      migrated.skillCooldowns = migrated.skillCooldowns || (migrated.player.skillCooldowns || {});
      migrated.statusEffects = migrated.statusEffects || (migrated.player.statusEffects || []);
      migrated.fieldProgress = migrated.fieldProgress || (migrated.player.fieldProgress || {});
      migrated.dungeonProgress = migrated.dungeonProgress || (migrated.player.dungeonProgress || {});
      migrated.clearedBosses = migrated.clearedBosses || (migrated.player.clearedBosses || []);
      migrated.tokens = typeof migrated.tokens === 'number' ? migrated.tokens : (migrated.player.tokens || 0);
      migrated.inTown = !!migrated.inTown;
      migrated.autoExplore = !!migrated.autoExplore;
      // Add currentFloor fallback
      if(typeof migrated.currentFloor !== 'number'){
        migrated.currentFloor = (migrated.player && typeof migrated.player.floor === 'number') ? migrated.player.floor : 1;
      }
      // Future migrations by version number can be handled here
  // Ensure reputation exists
  if(!migrated.player.reputation){ migrated.player.reputation = { faune: 0, fae: 0, merchants: 0 }; }
  migrated.version = SAVE_VERSION;
      return migrated;
    }catch(e){
      // If anything goes wrong, fall back to a fresh scaffold
      return {version:SAVE_VERSION, player:new Player().toJSON(), inventory:{items:[]}, quests:[], completedQuests:[], stash:[], skillCooldowns:{}, statusEffects:[], fieldProgress:{}, dungeonProgress:{}, clearedBosses:[], tokens:0, inTown:false, autoExplore:false, currentFloor:1};
    }
  }

  // Enemy factory
  function makeEnemy(floor, type='normal'){
    const def = FLOOR_DEFS[floor] || FLOOR_DEFS[1];
    let enemy;
    if(type === 'boss'){
      const b = def.boss;
      // Increase boss HP scaling for difficulty
      enemy = {
        name: b.name, hp: Math.floor(b.hpMul * 12), maxHP: Math.floor(b.hpMul * 12),
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
      
      // Performance optimization: Throttled UI update
      this._updateUIImmediate = this.updateUI.bind(this);
      this.updateUI = throttleRAF(this._updateUIImmediate);
      
      // Performance optimization: Debounced combat UI update
      this._updateCombatUIImmediate = this.updateCombatUI.bind(this);
      this.updateCombatUI = debounce(this._updateCombatUIImmediate, 50);
      
      // Performance optimization: Cache frequently accessed DOM elements
      this.domCache = {
        playerName: document.getElementById('player-name'),
        playerLevel: document.getElementById('player-level'),
        playerXp: document.getElementById('player-xp'),
        playerNextXp: document.getElementById('player-nextxp'),
        playerHp: document.getElementById('player-hp'),
        playerMaxHp: document.getElementById('player-maxhp'),
        playerAtk: document.getElementById('player-atk'),
        playerDef: document.getElementById('player-def'),
        playerDex: document.getElementById('player-dex'),
        playerLuck: document.getElementById('player-luck'),
        playerArchetype: document.getElementById('player-archetype'),
        playerGold: document.getElementById('player-gold'),
        playerFloor: document.getElementById('player-floor'),
        questCount: document.getElementById('quest-count'),
        playerPoints: document.getElementById('player-points'),
        playerSkillpoints: document.getElementById('player-skillpoints'),
        playerTokens: document.getElementById('player-tokens'),
        xpBar: document.getElementById('xp-bar'),
        hpBar: document.getElementById('hp-bar'),
        btnAllocateSkills: document.getElementById('btn-allocate-skills'),
        btnAllocateStats: document.getElementById('btn-allocate-stats'),
        btnArchetype: document.getElementById('btn-archetype'),
        achievementCount: document.getElementById('achievement-count'),
        achievementTotal: document.getElementById('achievement-total'),
        questProgressBars: document.getElementById('quest-progress-bars'),
        repFaune: document.getElementById('rep-faune'),
        repFae: document.getElementById('rep-fae'),
        repMerchants: document.getElementById('rep-merchants')
      };
      
      this.logEl = document.getElementById('log-entries');
      this.questListEl = document.getElementById('quest-list');
      this.inventoryListEl = document.getElementById('inventory-list');
      this.autoTimer = null;
      this.busy = false;
      this.inTown = false; // whether player is currently in town/hub
      this.playerTurn = true; // track whose turn it is in combat
      // Daily goals / streak data (localStorage-backed)
      this.daily = null;
      // Auto-save interval
      this.autoSaveTimer = null;
      this.initUI();
      this.initDailyGoals();
      this.initAutoSave();
      this.checkNewPlayer();
    }
    initUI(){
      document.getElementById('btn-field').addEventListener('click', ()=>this.explore('field'));
      document.getElementById('btn-dungeon').addEventListener('click', ()=>this.explore('dungeon'));
      document.getElementById('btn-npc').addEventListener('click', ()=>this.openNPCDialog());
      const skBtn = document.getElementById('btn-skills'); if(skBtn) skBtn.addEventListener('click', ()=> this.openSkillModal());
  const spBtn = document.getElementById('btn-allocate-skills'); if(spBtn) spBtn.addEventListener('click', ()=> this.openSkillModal());
  const statBtn = document.getElementById('btn-allocate-stats'); if(statBtn) statBtn.addEventListener('click', ()=> this.pauseForStatAllocation());
    const achBtn = document.getElementById('btn-achievements'); if(achBtn) achBtn.addEventListener('click', ()=> this.showAchievementsModal());
    const archBtn = document.getElementById('btn-archetype'); if(archBtn) archBtn.addEventListener('click', ()=> this.showArchetypeModal());
  // Crafting removed
      const townBtn = document.getElementById('btn-town'); if(townBtn) townBtn.addEventListener('click', ()=> this.showTownMenu());
      document.getElementById('btn-rest').addEventListener('click', ()=>this.rest());
      document.getElementById('btn-save').addEventListener('click', ()=>this.save());
      document.getElementById('btn-load').addEventListener('click', ()=>this.load());
      // HUD save button (mobile-friendly)
      const hudSaveBtn = document.getElementById('hud-save-btn');
      if(hudSaveBtn) hudSaveBtn.addEventListener('click', ()=>this.save());
      document.getElementById('auto-explore').addEventListener('change',(e)=>this.toggleAuto(e.target.checked));
      // modal close on backdrop click
      const modal = document.getElementById('modal');
      if(modal){ modal.querySelector('.modal-backdrop').addEventListener('click', ()=> this.hideModal()); }
      // quick heal button
      const qh = document.getElementById('quick-heal'); if(qh) qh.addEventListener('click', ()=> this.quickHeal());
        // combat action buttons (old interface)
        document.getElementById('btn-attack').addEventListener('click', ()=> this.attackAction());
        document.getElementById('btn-defend').addEventListener('click', ()=> this.defendAction());
        document.getElementById('btn-flee').addEventListener('click', ()=> this.fleeAction());
        document.getElementById('btn-skill-combat').addEventListener('click', ()=> this.showCombatSkillMenu());
        document.getElementById('btn-use-item').addEventListener('click', ()=> this.showCombatItemMenu());
        // battle screen action buttons (new interface)
        const attackBtn = document.getElementById('attack-btn');
        if(attackBtn) attackBtn.addEventListener('click', ()=> this.attackAction());
        const skillsBtn = document.getElementById('skills-btn');
        if(skillsBtn) skillsBtn.addEventListener('click', ()=> this.showCombatSkillMenu());
        const itemsBtn = document.getElementById('items-btn');
        if(itemsBtn) itemsBtn.addEventListener('click', ()=> this.showCombatItemMenu());
        const defendBtn = document.getElementById('defend-btn');
        if(defendBtn) defendBtn.addEventListener('click', ()=> this.defendAction());
        const runBtn = document.getElementById('run-btn');
        if(runBtn) runBtn.addEventListener('click', ()=> this.fleeAction());
        // town action buttons (persistent panel)
        const tb = document.getElementById('btn-blacksmith'); if(tb) tb.addEventListener('click', ()=> this.showBlacksmithModal());
        const tm = document.getElementById('btn-market'); if(tm) tm.addEventListener('click', ()=> this.showMarketModal());
          const tArena = document.getElementById('btn-boss-arena'); if(tArena) tArena.addEventListener('click', ()=> this.showBossArenaModal());
    const tTravel = document.getElementById('btn-travel'); if(tTravel) tTravel.addEventListener('click', ()=> this.showTravelModal());
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
        this.hideModal(); 
        this.busy = false; // Reset busy flag before entering combat
        this.setButtonsDisabled(false);
        this.fight(boss);
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

    // Travel between floors (select a target floor; ensure at least Floor 2 is available)
    showTravelModal(){
      const p = this.player;
      const cleared = Array.isArray(p.clearedBosses) ? p.clearedBosses : [];
      let maxUnlocked = 1;
      if(cleared.length) maxUnlocked = Math.max(...cleared) + 1;
      // Ensure floor 2 is always selectable as requested
  // Strict gating: can only travel up to next floor after cleared boss; do not force unlock Floor 2
      maxUnlocked = Math.min(MAX_FLOORS, maxUnlocked);

      const buttons = [];
      for(let f=1; f<=maxUnlocked; f++){
        const current = (f === p.floor) ? ' (current)' : '';
        buttons.push(`<button data-floor="${f}">Floor ${f}${current}</button>`);
      }
      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div><strong>Travel</strong><div class="muted">Choose a floor to set as your current exploration floor. Higher floors are tougher.</div></div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">${buttons.join('')}</div>
        </div>
      `;
      this.showModal('Travel Between Floors', html, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-floor]').forEach(btn=> btn.addEventListener('click', ()=>{
        const f = parseInt(btn.getAttribute('data-floor'));
        if(!Number.isFinite(f)) return;
        p.floor = f;
        this.logEvent('info', `Set current floor to ${f}.`);
        this.hideModal();
        this.updateUI();
      }));
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
        const price = Math.max(1, Math.floor(buyLike / 5)); // sell for roughly 1/5 of buy-like price (reduced from 1/4)
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div>${it.name} ${it.count && it.count>1?('x'+it.count):''}${it.equipped? ' (equipped)':''}</div><div>${canSell?`<button data-sell="${it.id}" data-price="${price}">Sell (${price}g)</button>`:'<span class="muted">Equipped</span>'}</div></div>`;
      }).join('') || '<div class="muted">No items to sell.</div>';
      const priceMul = this.getPriceMultiplier();
      this.logEvent('info', `Merchant rates: ${Math.round(priceMul*100)}%`);
      const buyHtml = shopItems.map((it,i)=>{
        const base = Math.max(1, Math.floor((it.basePrice || 20) + floor * 2));
        const price = Math.max(1, Math.floor(base * priceMul));
        const desc = it.type + (it.atk?(' ATK+'+it.atk):'') + (it.def?(' DEF+'+it.def):'') + (it.heal?(' Heal:'+it.heal):'') + (it.cure?(' Cures:'+it.cure.join(',')):'');
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${it.name}</strong><div class="muted">${desc}</div></div><div><button data-buy="${i}" data-price="${price}">Buy (${price}g)</button></div></div>`;
      }).join('');
      const html = `<div style="display:flex;gap:12px"><div style="flex:1"><h4>Buy</h4>${buyHtml}</div><div style="flex:1"><h4>Sell</h4>${sellListHtml}</div></div>`;
      this.showModal('Market', html, [{text:'Close', action:()=> this.hideModal()}]);
      const body = document.getElementById('modal-body');
      body.querySelectorAll('button[data-buy]').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-buy')); const price = parseInt(btn.getAttribute('data-price'));
        const it = shopItems[idx]; 
        if(this.player.gold < price){ this.logEvent('info','Not enough gold to buy.'); return; }
        // Prevent buying duplicate equipment by name
        if(it.type === 'equipment'){
          const hasSame = this.inventory.items.some(x=> x.type==='equipment' && x.name === it.name);
          if(hasSame){ this.logEvent('info', `You already own ${it.name}.`); return; }
        }
        this.player.gold -= price; const added = this.inventory.addItem(Object.assign({}, it)); this.logEvent('info', `Bought ${added.name} for ${price} gold.`); this.showInventoryBadge();
        // Merchants like good customers
        this.modifyReputation('merchants', +1, 'Purchase');
        this.updateUI();
      }));
      body.querySelectorAll('button[data-sell]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-sell'); const price = parseInt(btn.getAttribute('data-price'));
        // Double-guard: prevent selling equipped items
        const itm = this.inventory.getItem(id);
        if(itm && itm.equipped){ this.logEvent('info','Unequip item before selling.'); return; }
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
            const cost = 200 + (it.atk||0)*60; const material = 'Ingot'; const matCount = 2;
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
            this.player.equipmentUpgrades = (this.player.equipmentUpgrades || 0) + 1; // Track for achievements
            this.logEvent('info', `Upgraded ${it.name}. ATK increased.`);
            this.hideModal(); this.updateUI();
          }));
        }
        if(act === 'fortify'){
          const armors = this.inventory.items.filter(i=> i.type==='equipment' && (i.slot||'').toLowerCase() === 'armor');
          const list = armors.length ? armors.map((it,i)=>{
            const cost = 180 + (it.def||0)*55; const material = 'Ore'; const matCount = 2;
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
            this.player.equipmentUpgrades = (this.player.equipmentUpgrades || 0) + 1; // Track for achievements
            this.logEvent('info', `Fortified ${it.name}. DEF increased.`);
            this.hideModal(); this.updateUI();
          }));
        }
      }));
    }

    // Quest Board: global/board quests including escort/delivery/daily
    showQuestBoardModal(){
      // Daily Goals section
      const daily = this.daily || this.getDailyData();
      const dailyTasks = daily.tasks.map(t=>{
        const pct = Math.min(100, Math.round((t.progress / t.target) * 100));
        const status = t.progress >= t.target ? 'Completed' : `${t.progress}/${t.target}`;
        const rewardStr = t.reward.tokenFragments? `${t.reward.tokenFragments} Token Fragment(s)` : (t.reward.mats? `${t.reward.mats} Mats` : `${t.reward.gold||0} Gold`);
        return `<div class="daily-item"><div><strong>${t.title}</strong> — <span class="muted">${status}</span><div class="muted">Reward: ${rewardStr}</div></div><div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div></div>`;
      }).join('');
      const dailyHtml = `
        <div class="card" style="padding:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <h4 style="margin:0">Daily Goals</h4>
            <div class="muted">Streak: ${daily.streak || 0} day(s)${(daily.streak||0)>0? ' — +3% XP':''}</div>
          </div>
          ${dailyTasks || '<div class="muted">No daily tasks.</div>'}
        </div>`;

      // some sample board quests (with faction requirements)
      const boardQuests = [
        {id:'board1',title:'Escort the Merchant',desc:'Escort a merchant through 4 encounters without fleeing. Reward: 200 XP, 150g',type:'escort',target:4,reward:{xp:200,gold:150}, reqRep:{merchants:1}},
        {id:'board2',title:'Deliver Parcel',desc:'Deliver a sealed parcel to Floor 3 (must return to town). Reward: 180 XP, 120g',type:'delivery',target:1,reward:{xp:180,gold:120}, reqRep:{faune:2}},
        {id:'board3',title:'Daily Skirmish',desc:'Defeat 3 monsters on your floor. Repeatable daily. Reward: 50 XP, 30g',type:'kill',target:3,reward:{xp:50,gold:30},repeatable:true}
      ];

  // Build UI with tabs: Available / Active / Completed
  const p = this.player;
  p.acceptedOriginalQuestIds = p.acceptedOriginalQuestIds || [];
  p.finishedOriginalQuestIds = p.finishedOriginalQuestIds || [];
  const acceptedSet = new Set(p.acceptedOriginalQuestIds);
  const finishedSet = new Set(p.finishedOriginalQuestIds);
  const available = boardQuests.filter(q=> !acceptedSet.has(q.id) && !finishedSet.has(q.id));
  const rep = p.reputation || {faune:0, fae:0, merchants:0};
  const availHtml = available.map((q,i)=>{
    // check faction requirements
    let locked = false; let lockText = '';
    if(q.reqRep){
      for(const k of Object.keys(q.reqRep)){
        const need = q.reqRep[k]; const cur = rep[k]||0;
        if(cur < need){ locked = true; lockText = `Locked (need ${k[0].toUpperCase()+k.slice(1)} ${need}+)`; break; }
      }
    }
    const right = locked ? `<span class="muted">${lockText}</span>` : `<button data-board="${i}">Accept</button>`;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${q.title}</strong><div class="muted">${q.desc}</div></div><div>${right}</div></div>`;
  }).join('') || '<div class="muted">No available quests.</div>';
      const activeHtml = (this.player.quests || []).map((q,idx)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${q.title}</strong><div class="muted">${q.desc}</div><div class="muted">Progress: ${q.progress||0}/${q.target}</div></div><div><button data-abandon="${q.id}">Abandon</button></div></div>`).join('') || '<div class="muted">No active quests.</div>';
      const completedHtml = (this.player.completedQuests || []).map((q,idx)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${q.title}</strong><div class="muted">Reward: ${q.reward.xp} XP, ${q.reward.gold} gold</div></div><div><button data-collect="${idx}">Collect</button></div></div>`).join('') || '<div class="muted">No completed quests.</div>';

      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${dailyHtml}
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
        const base = available[idx]; if(!base) return; // safety
        // guard: check reqRep again
        if(base.reqRep){
          const rep2 = this.player.reputation || {};
          for(const k of Object.keys(base.reqRep)){
            if((rep2[k]||0) < base.reqRep[k]){
              this.logEvent('info', `You lack the required reputation to accept this quest.`);
              return;
            }
          }
        }
        // Hard guard: prevent accepting a second instance of the same original quest
        const alreadyActive = (p.quests||[]).some(q=> q.meta && q.meta.original && q.meta.original.id === base.id);
        const alreadyCompleted = (p.completedQuests||[]).some(q=> q.meta && q.meta.original && q.meta.original.id === base.id);
        const markedAccepted = (p.acceptedOriginalQuestIds||[]).includes(base.id);
        const markedFinished = (p.finishedOriginalQuestIds||[]).includes(base.id);
        if(alreadyActive || alreadyCompleted || markedAccepted || markedFinished){
          this.logEvent('info', 'You already took this quest. Finish or abandon it first.');
          return;
        }
        const raw = Object.assign({}, base); raw.id = raw.id + '_' + Date.now();
        // attach per-type meta and special behavior
        const pushQ = {id:raw.id,title:raw.title,desc:raw.desc,type:raw.type,target:raw.target,progress:0,reward:raw.reward,meta:{original:base}};
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
        // mark original quest as accepted so it cannot be accepted again
        if(pushQ.meta && pushQ.meta.original && pushQ.meta.original.id){
          if(!p.acceptedOriginalQuestIds.includes(pushQ.meta.original.id)) p.acceptedOriginalQuestIds.push(pushQ.meta.original.id);
        }
        this.player.questsAccepted = (this.player.questsAccepted || 0) + 1; // Track for achievements
        this.logEvent('quest', `Accepted quest: ${pushQ.title}`);
        this.hideModal(); this.updateUI();
      }));

      // abandon active
      body.querySelectorAll('button[data-abandon]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-abandon');
        const q = (p.quests||[]).find(x=> x.id===id);
        // Remove from active
        this.player.quests = this.player.quests.filter(qx=> qx.id !== id);
        // Treat as consumed so it cannot be accepted again (only once rule)
        if(q && q.meta && q.meta.original && q.meta.original.id){
          if(!p.finishedOriginalQuestIds.includes(q.meta.original.id)) p.finishedOriginalQuestIds.push(q.meta.original.id);
        }
        this.log('Quest abandoned. It cannot be accepted again.');
        this.hideModal(); this.updateUI();
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
        // Mark as permanently finished to hide from Available (only once rule)
        if(q.meta && q.meta.original && q.meta.original.id){
          if(!p.finishedOriginalQuestIds.includes(q.meta.original.id)) p.finishedOriginalQuestIds.push(q.meta.original.id);
          // Also cleanup accepted marker
          p.acceptedOriginalQuestIds = (p.acceptedOriginalQuestIds||[]).filter(x=> x !== q.meta.original.id);
        }
        if(leveled){ this.log(`Gained ${leveled} level(s)! Allocate your stat points.`); this.pauseForStatAllocation(); }
        this.save(); // Auto-save on quest completion
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
      const c = this.domCache; // Use cached elements
      
      this.setBackgroundForFloor();
      
      // Update all UI elements using cache
      if(c.playerName) c.playerName.textContent = p.name;
      if(c.playerLevel) c.playerLevel.textContent = p.level;
      if(c.playerXp) c.playerXp.textContent = p.xp;
      if(c.playerNextXp) c.playerNextXp.textContent = p.nextXp();
      if(c.playerHp) c.playerHp.textContent = p.hp;
      if(c.playerMaxHp) c.playerMaxHp.textContent = p.maxHP;
      if(c.playerAtk) c.playerAtk.textContent = p.atk;
      if(c.playerDef) c.playerDef.textContent = p.def;
      if(c.playerDex) c.playerDex.textContent = p.dex;
      if(c.playerLuck) c.playerLuck.textContent = p.luck;
      if(c.playerArchetype) c.playerArchetype.textContent = p.archetype ? (ARCHETYPES[p.archetype]?.name || p.archetype) : 'None';
      if(c.btnArchetype) c.btnArchetype.disabled = !!p.archetype;
      if(c.playerGold) c.playerGold.textContent = p.gold;
      if(c.playerFloor) c.playerFloor.textContent = p.floor;
      if(c.questCount) c.questCount.textContent = p.quests.length;
      if(c.playerPoints) c.playerPoints.textContent = p.pendingStatPoints || 0;
      if(c.playerSkillpoints) c.playerSkillpoints.textContent = p.skillPoints || 0;
      
      // Show/hide Allocate SP button based on available skill points
      if(c.btnAllocateSkills){
        if(p.skillPoints > 0){
          c.btnAllocateSkills.style.display = 'inline-block';
          c.btnAllocateSkills.textContent = `Allocate SP (${p.skillPoints})`;
        } else {
          c.btnAllocateSkills.style.display = 'none';
        }
      }
      
      // Show/hide Allocate Stats button when pending stat points are available
      if(c.btnAllocateStats){
        const pending = p.pendingStatPoints || 0;
        if(pending > 0){
          c.btnAllocateStats.style.display = 'inline-block';
          c.btnAllocateStats.textContent = `Allocate Stats (${pending})`;
        } else {
          c.btnAllocateStats.style.display = 'none';
        }
      }
      
      if(c.playerTokens) c.playerTokens.textContent = p.tokens || 0;
      if(c.achievementCount) c.achievementCount.textContent = Object.keys(p.achievements || {}).length;
      if(c.achievementTotal && window.ACHIEVEMENTS) c.achievementTotal.textContent = Object.keys(window.ACHIEVEMENTS).length;

      // HP/XP progress bars
      if(c.xpBar) {
        const xpPct = Math.min(100, Math.round((p.xp / p.nextXp()) * 100));
        c.xpBar.style.width = xpPct + '%';
        c.xpBar.style.background = 'linear-gradient(90deg,#4fc3f7,#1976a5)';
      }
      if(c.hpBar) {
        const hpPct = Math.min(100, Math.round((p.hp / p.maxHP) * 100));
        c.hpBar.style.width = hpPct + '%';
        c.hpBar.style.background = 'linear-gradient(90deg,#e53935,#fbc02d)';
      }

      // quests
      this.questListEl.innerHTML = '';
      if(c.questProgressBars) c.questProgressBars.innerHTML = '';
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
        if(c.questProgressBars && typeof q.target === 'number' && q.target > 1) {
          const pct = Math.min(100, Math.round(((q.progress||0) / q.target) * 100));
          const barWrap = document.createElement('div');
          barWrap.className = 'bar-wrap';
          barWrap.innerHTML = `<div class="bar-label">${q.title}</div><div class="bar-outer"><div class="bar-inner" style="width:${pct}%;background:linear-gradient(90deg,#ffd600,#4fc3f7)"></div></div>`;
          c.questProgressBars.appendChild(barWrap);
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
      // Check for NPC unlocks
      this.checkNPCUnlocks();
      // equipment panel render
      // Update combat skill button label to reflect cooldown (min of active)
      const btnSk = document.getElementById('btn-skill-combat');
      if(btnSk){
        const act = Object.keys(SKILLS).filter(k=> SKILLS[k].type==='active' && p.skills && p.skills[k]);
        const cds = act.map(k=> (p.skillCooldowns && p.skillCooldowns[k]) || 0).filter(v=> v>0);
        if(cds.length){ btnSk.textContent = `Use Skill (CD: ${Math.min(...cds)})`; }
        else { btnSk.textContent = 'Use Skill'; }
      }
      // Update compact HUD (always visible on mobile)
      this.updateHud();
      // Update reputation display (in details)
      const rep = p.reputation || {faune:0, fae:0, merchants:0};
      if(c.repFaune) c.repFaune.textContent = rep.faune;
      if(c.repFae) c.repFae.textContent = rep.fae;
      if(c.repMerchants) c.repMerchants.textContent = rep.merchants;
    }

    // Reputation and checks
    modifyReputation(faction, delta, reason='action'){
      const key = String(faction||'').toLowerCase();
      const rep = this.player.reputation || (this.player.reputation = {faune:0, fae:0, merchants:0});
      if(!(key in rep)) return;
      rep[key] = Math.max(-5, Math.min(10, (rep[key]||0) + delta));
      const arrow = delta>=0 ? '↑' : '↓';
      this.logEvent('info', `Reputation ${arrow} ${key} (${reason}) → ${rep[key]}`);
      this.updateUI();
      try{ this.save(); }catch{}
    }
    getPriceMultiplier(){
      const rep = (this.player.reputation && this.player.reputation.merchants) || 0;
      const mul = 1 - rep * 0.03; // 3% per point
      return Math.max(0.7, Math.min(1.1, mul));
    }
    skillCheck(stat, dc, advantage=0){
      const d20 = 1 + Math.floor(Math.random()*20);
      const bonus = (this.player[stat]||0) + (advantage*2);
      const total = d20 + bonus;
      const ok = total >= dc;
      this.logEvent('info', `Skill Check: d20(${d20}) + ${stat.toUpperCase()}(${bonus}) = ${total} ${ok?'✓':'✗'} (DC ${dc})`);
      return ok;
    }

    // ========== COMBAT VISUAL SYSTEM ==========
    
    // Show combat stage with full visual layout
    showCombatStage(){
      // Use new battle screen functions
      if(typeof window.showBattleScreen === 'function'){
        window.showBattleScreen();
      } else {
        // Fallback to old method
        const stage = document.getElementById('combat-stage');
        const advLog = document.getElementById('adventure-log');
        const cmdPanel = document.getElementById('command-panel');
        
        if(stage) stage.style.display = 'flex';
        if(advLog) advLog.style.display = 'none';
        if(cmdPanel) cmdPanel.style.display = 'flex';
      }
      
      // Initialize combat visuals
      this.updateCombatUI();
      if(typeof window.updateBattleLog === 'function'){
        window.updateBattleLog('The battle begins!');
      } else {
        this.clearCombatLog();
      }
    }
    
    // Hide combat stage and return to exploration view
    hideCombatStage(){
      // Use new battle screen functions
      if(typeof window.hideBattleScreen === 'function'){
        window.hideBattleScreen();
      } else {
        // Fallback to old method
        const stage = document.getElementById('combat-stage');
        const advLog = document.getElementById('adventure-log');
        
        if(stage) stage.style.display = 'none';
        if(advLog) advLog.style.display = 'block';
      }
    }
    
    // Update all combat UI elements (HP/SP bars, names, status icons)
    updateCombatUI(){
      const p = this.player;
      const enemy = this.currentEnemy;
      
      // Player info
      const pName = document.getElementById('player-combat-name');
      if(pName) pName.textContent = p.name;
      
      // Use helper if available for player HP
      if(typeof window.updatePlayerHP === 'function'){
        window.updatePlayerHP(p.hp, p.maxHP);
      } else {
        // Fallback
        const pHpBar = document.getElementById('player-combat-hp-bar');
        const pHpText = document.getElementById('player-combat-hp-text');
        if(pHpBar && pHpText){
          const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHP) * 100));
          pHpBar.style.width = hpPct + '%';
          pHpText.textContent = `${Math.max(0, p.hp)}/${p.maxHP}`;

          // Update player underbar (beneath character art)
          const pUnderBar = document.getElementById('player-under-hp-bar');
          const pUnderText = document.getElementById('player-under-hp-text');
          if(pUnderBar && pUnderText){
            pUnderBar.style.width = hpPct + '%';
            pUnderText.textContent = `${Math.max(0, p.hp)}/${p.maxHP}`;
          }
        }
      }
      
      const pSpBar = document.getElementById('player-combat-sp-bar');
      const pSpText = document.getElementById('player-combat-sp-text');
      if(pSpBar && pSpText){
        const spPct = Math.max(0, Math.min(100, (p.sp / p.maxSP) * 100));
        pSpBar.style.width = spPct + '%';
        pSpText.textContent = `${Math.max(0, p.sp)}/${p.maxSP}`;
      }
      
      // Player status icons
      this.updateStatusIcons('player', p.statusEffects || []);
      
      // Enemy info
      if(enemy){
        const eName = document.getElementById('enemy-combat-name');
        if(eName) eName.textContent = enemy.name + (enemy.isBoss ? ' (Boss)' : '') + ' LVL ' + (enemy.level || this.player.floor);
        
        // Use new helper if available
        if(typeof window.updateEnemyHP === 'function'){
          window.updateEnemyHP(enemy.hp, enemy.maxHP);
        } else {
          // Fallback to old method
          const eHpBar = document.getElementById('enemy-combat-hp-bar');
          const eHpText = document.getElementById('enemy-combat-hp-text');
          if(eHpBar && eHpText){
            const hpPct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHP) * 100));
            eHpBar.style.width = hpPct + '%';
            eHpText.textContent = `${Math.max(0, enemy.hp)}/${enemy.maxHP}`;
          }
          // Update enemy underbar (beneath character art)
          {
            const eUnderBar = document.getElementById('enemy-under-hp-bar');
            const eUnderText = document.getElementById('enemy-under-hp-text');
            if(eUnderBar && eUnderText){
              const ePct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHP) * 100));
              eUnderBar.style.width = ePct + '%';
              eUnderText.textContent = Math.round(ePct) + '%';
            }
          }
        }
        
        // Enemy status icons
        this.updateStatusIcons('enemy', enemy.statusEffects || []);
      }
    }
    
    // Update status effect icons for player or enemy
    updateStatusIcons(target, effects){
      const container = document.getElementById(`${target}-status-icons`);
      if(!container) return;
      
      container.innerHTML = '';
      effects.forEach(eff => {
        if(!eff || eff.turns <= 0) return;
        const icon = document.createElement('div');
        icon.className = 'status-icon';
        icon.setAttribute('data-turns', eff.turns);
        icon.setAttribute('title', `${eff.type} (${eff.turns} turns)`);
        
        // Icon mapping
        const iconMap = {
          poison: '🧪', stun: '⚡', slow: '🐌', regen: '💚',
          bless_atk: '⚔️', bless_def: '🛡️', lucky: '🍀', weaken: '💔', defend: '🛡️'
        };
        icon.textContent = iconMap[eff.type] || '❓';
        container.appendChild(icon);
      });
    }
    
    // Show turn indicator (YOUR TURN or ENEMY TURN)
    showTurnIndicator(isPlayerTurn){
      // Use new battle screen function if available
      if(typeof window.showBattleTurnIndicator === 'function'){
        window.showBattleTurnIndicator(isPlayerTurn);
        return;
      }
      
      // Fallback to old method
      const indicator = document.getElementById('turn-indicator');
      const text = document.querySelector('.turn-text, .turn-text-new');
      
      if(!indicator || !text) return;
      
      indicator.classList.remove('show', 'enemy-turn');
      text.textContent = isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN';
      
      if(!isPlayerTurn) indicator.classList.add('enemy-turn');
      
      // Trigger animation
      setTimeout(() => indicator.classList.add('show'), 50);
      
      // Auto-hide
      setTimeout(() => indicator.classList.remove('show'), 1500);
    }
    
    // Show damage number floating up from combatant
    showDamageNumber(amount, target, isCrit = false, isHeal = false, isDodge = false){
      // Use new battle screen function if available
      if(typeof window.showBattleDamage === 'function'){
        let type = 'damage';
        if(isDodge) type = 'dodge';
        else if(isHeal) type = 'heal';
        else if(isCrit) type = 'critical';
        
        window.showBattleDamage(amount, target, type);
        return;
      }
      
      // Fallback to old method
      const container = document.getElementById('damage-numbers');
      if(!container) return;
      
      const dmgEl = document.createElement('div');
      dmgEl.className = 'damage-number';
      
      if(isDodge){
        dmgEl.textContent = 'DODGE!';
        dmgEl.classList.add('dodge');
      } else if(isHeal){
        dmgEl.textContent = '+' + amount;
        dmgEl.classList.add('heal');
      } else {
        dmgEl.textContent = '-' + amount;
        if(isCrit) dmgEl.classList.add('critical');
      }
      
      // Position based on target
      const targetEl = document.getElementById(`${target}-combatant`) || document.getElementById(`${target}-display`);
      if(targetEl){
        const rect = targetEl.getBoundingClientRect();
        dmgEl.style.left = (rect.left + rect.width / 2) + 'px';
        dmgEl.style.top = (rect.top + 40) + 'px';
      } else {
        dmgEl.style.left = (target === 'player' ? '25%' : '75%');
        dmgEl.style.top = '40%';
      }
      
      container.appendChild(dmgEl);
      
      // Remove after animation
      setTimeout(() => {
        if(dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl);
      }, 1200);
    }
    
    // Trigger attack animation on combatant sprite
    animateAttack(target){
      const sprite = document.querySelector(`.${target}-sprite`);
      if(!sprite) return;
      
      sprite.classList.remove('attacking');
      setTimeout(() => sprite.classList.add('attacking'), 10);
      setTimeout(() => sprite.classList.remove('attacking'), 500);
    }
    
    // Trigger hit/damage animation on combatant sprite
    animateHit(target){
      const sprite = document.querySelector(`.${target}-sprite`);
      if(!sprite) return;
      
      sprite.classList.remove('hit');
      setTimeout(() => sprite.classList.add('hit'), 10);
      setTimeout(() => sprite.classList.remove('hit'), 400);
    }
    
    // Trigger defend animation on combatant sprite
    animateDefend(target){
      const sprite = document.querySelector(`.${target}-sprite`);
      if(!sprite) return;
      
      sprite.classList.remove('defending');
      setTimeout(() => sprite.classList.add('defending'), 10);
      setTimeout(() => sprite.classList.remove('defending'), 600);
    }
    
    // Add message to combat log overlay
    logCombat(message, type = 'info'){
      // Use new battle log if available
      if(typeof window.updateBattleLog === 'function'){
        window.updateBattleLog(message);
      } else {
        // Fallback to old method
        const container = document.getElementById('combat-log-entries');
        if(!container) return;
        
        const line = document.createElement('div');
        line.className = `combat-log-line log-${type}`;
        line.textContent = message;
        
        container.appendChild(line);
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        // Keep only last 10 messages
        while(container.children.length > 10){
          container.removeChild(container.firstChild);
        }
      }
    }
    
    // Clear combat log
    clearCombatLog(){
      const container = document.getElementById('combat-log-entries');
      if(container) container.innerHTML = '';
    }
    
    // Show enemy intent (next action preview)
    showEnemyIntent(action){
      const intentEl = document.getElementById('enemy-intent');
      if(!intentEl) return;
      
      const iconEl = intentEl.querySelector('.intent-icon');
      const textEl = intentEl.querySelector('.intent-text');
      
      if(iconEl && textEl){
        const intentMap = {
          attack: { icon: '⚔️', text: 'Preparing attack' },
          skill: { icon: '✨', text: 'Charging skill' },
          heal: { icon: '💚', text: 'Preparing to heal' },
          defend: { icon: '🛡️', text: 'Raising guard' }
        };
        
        const intent = intentMap[action] || { icon: '❓', text: 'Preparing...' };
        iconEl.textContent = intent.icon;
        textEl.textContent = intent.text;
      }
    }

    // ========== END COMBAT VISUAL SYSTEM ==========

    // Compact HUD updater
    updateHud(){
      const p = this.player || {};
      const byId = (id)=> document.getElementById(id);
      const setText = (id, val)=>{ const el = byId(id); if(el) el.textContent = val; };
      setText('hud-name', p.name || 'Player');
      setText('hud-level', p.level ?? 1);
      setText('hud-floor', p.floor ?? 1);
      setText('hud-gold', p.gold ?? 0);
      const hpBar = byId('hud-hp-bar');
      const xpBar = byId('hud-xp-bar');
      if(hpBar){
        const max = Math.max(1, p.maxHP || 1);
        const hp = Math.max(0, Math.min(p.hp || 0, max));
        hpBar.style.width = Math.min(100, Math.round((hp/max)*100)) + '%';
      }
      if(xpBar){
        const next = (typeof p.nextXp === 'function') ? p.nextXp() : (p.nextXp || 1);
        const xp = Math.max(0, p.xp || 0);
        xpBar.style.width = Math.min(100, Math.round((xp/Math.max(1,next))*100)) + '%';
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
            // Daily: delivery progress
            this.progressDaily('deliver1', 1);
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
              // Try an exploration event before spawning the enemy
              if(this.tryExplorationEvent(floor, 'dungeon')){ return; }
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
            this.shakeScreen(400);
            this.playSfx('boss');
            this.fight(boss);
          } else if(found < 0.75){
            // Try an exploration event before spawning the enemy
            if(this.tryExplorationEvent(floor, 'field')){ return; }
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

    // Try to trigger one exploration event; returns true if it handled the step (either started combat or resolved modal)
    tryExplorationEvent(floor, context='field'){
      const def = FLOOR_DEFS[floor];
      const evts = (def && Array.isArray(def.events)) ? def.events : null;
      if(!evts || evts.length===0) return false;
      // roll one event by chance
      for(const e of evts){
        if(Math.random() < (e.chance || 0)){
          // resolve by type
          if(e.type === 'merchant') return this.eventMerchant(floor);
          if(e.type === 'shrine') return this.eventShrine(floor);
          if(e.type === 'ambush') return this.eventAmbush(floor, context);
          if(e.type === 'lost_faune') return this.eventLostFaune(floor);
        }
      }
      return false;
    }

    eventMerchant(floor){
      const base = 50 + Math.max(0, floor-1) * 2;
      const price = Math.max(1, Math.floor(base * this.getPriceMultiplier()));
      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div><strong>Wandering Merchant</strong></div>
          <div class="muted">"A blessing for brave explorers!"</div>
          <div>Rates adjusted by reputation. Pay ${price}g for a temporary blessing (+1 ATK, +1 DEF for 3 battles)?</div>
        </div>`;
      this.showModal('Merchant in the Woods', html, [
        {text:'Buy Blessing', action:()=>{
          if(this.player.gold < price){ this.logEvent('info','Not enough gold.'); this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI(); return; }
          this.player.gold -= price;
          this.applyStatusToPlayer('bless_atk', 3, 1);
          this.applyStatusToPlayer('bless_def', 3, 1);
          this.logEvent('info','You feel empowered by the blessing (+1 ATK/DEF for 3 battles).');
          this.modifyReputation('merchants', +1, 'Supported a wandering merchant');
          this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI();
        }},
        {text:'Ignore', action:()=>{ this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI(); }}
      ]);
      return true;
    }

    eventShrine(floor){
      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div><strong>Hidden Shrine</strong></div>
          <div class="muted">A faint hum resonates from the shrine.</div>
          <div>Pray and accept fate? (Random boon 70% / curse 30%)</div>
        </div>`;
      this.showModal('Hidden Shrine', html, [
        {text:'Pray', action:()=>{
          const boon = this.skillCheck('luck', 12, 0) || Math.random() < 0.5;
          if(boon){
            this.player.hp = this.player.maxHP;
            this.applyStatusToPlayer('lucky', 3, 1);
            this.logEvent('info','The shrine blesses you. HP restored and +1 Luck (3 battles).');
          } else {
            this.applyStatusToPlayer('weaken', 2, -1);
            this.logEvent('info','A dark chill weakens you (-1 ATK for 2 battles).');
            this.modifyReputation('faune', -1, 'Desecrated sacred ground');
          }
          this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI();
        }},
        {text:'Leave', action:()=>{ this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI(); }}
      ]);
      return true;
    }

    eventAmbush(floor, context){
      // If Fae reputation is decent, attempt to parley
      if((this.player.reputation?.fae || 0) >= 2){
        const html = `
          <div style="display:flex;flex-direction:column;gap:8px">
            <div><strong>Ambush</strong></div>
            <div class="muted">Figures emerge from the shadows. They recognize your Fae ties.</div>
            <div>Try to parley (Luck check) or fight?</div>
          </div>`;
        this.showModal('Ambush!', html, [
          {text:'Parley', action:()=>{
            const ok = this.skillCheck('luck', 11, 1);
            if(ok){
              this.modifyReputation('fae', +1, 'Parleyed with ambushers');
              this.player.gold += 15; this.logEvent('gold','You trade words, not blows. They tip 15g.');
              this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI();
            } else {
              this.modifyReputation('fae', -1, 'Parley failed');
              const enemy = makeEnemy(floor, context==='dungeon' ? 'dungeon' : 'field');
              enemy.floor = floor; enemy.rareDropBoost = true;
              this.hideModal(); 
              this.busy = false; // Reset busy flag before entering combat
              this.logEvent('info','Parley fails. They attack!'); 
              this.fight(enemy);
            }
          }},
          {text:'Fight', action:()=>{
            const enemy = makeEnemy(floor, context==='dungeon' ? 'dungeon' : 'field');
            enemy.floor = floor; enemy.rareDropBoost = true;
            this.hideModal(); 
            this.busy = false; // Reset busy flag before entering combat
            this.fight(enemy);
          }}
        ]);
        return true;
      }
      // Default: immediate fight with improved drops
      const enemy = makeEnemy(floor, context==='dungeon' ? 'dungeon' : 'field');
      enemy.floor = floor; enemy.rareDropBoost = true;
      this.logEvent('info', 'Ambush! Enemies leap from the shadows!', 'Drops boosted');
      this.fight(enemy);
      return true;
    }

    eventLostFaune(floor){
      const html = `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div><strong>Lost Faune</strong></div>
          <div class="muted">A timid faune looks disoriented.</div>
          <div>Help guide them out of the woods?</div>
        </div>`;
      this.showModal('Lost Faune', html, [
        {text:'Help', action:()=>{
          const ok = this.skillCheck('dex', 12, 0);
          const reward = ok ? (Math.random() < 0.6 ? 'Raw Crystal' : 'Ingot') : 'Herb';
          const type = reward==='Herb' ? {type:'consumable',heal:20} : {type:'resource'};
          const itm = this.inventory.addItem(Object.assign({name:reward}, type));
          if(ok){ this.modifyReputation('faune', +1, 'Guided a lost faune'); }
          this.logEvent('loot', `The faune thanks you with ${itm.name}.`);
          this.showInventoryBadge();
          this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI();
        }},
        {text:'Decline', action:()=>{ this.hideModal(); this.busy=false; this.setButtonsDisabled(false); this.updateUI(); }}
      ]);
      return true;
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
      
      // Log to combat overlay
      if(this.currentEnemy.isBoss){
        this.logCombat(`🔥 BOSS BATTLE: ${this.currentEnemy.name}!`, 'boss');
      } else {
        this.logCombat(`⚔️ ${this.currentEnemy.name} appears!`, 'combat');
      }
      
      this.busy = true;
      // Show combat visual stage
      this.showCombatStage();
      // Show combat actions
      this.enterCombat();
      // Start turn-based combat
      this.combatTurn();
    }
    
      enterCombat(){
        const mainAct = document.getElementById('main-actions'); if(mainAct) mainAct.style.display = 'none';
        const townAct = document.getElementById('town-actions'); if(townAct) townAct.style.display = 'none';
        const combatAct = document.getElementById('combat-actions'); if(combatAct) combatAct.style.display = 'block';
        document.body.classList.add('in-combat');
        // Disable non-combat controls while fighting
        this.setNonCombatControlsDisabled(true);
        // Start with player turn enabled
        this.setCombatButtonsEnabled(true);
        this.playerTurn = true; // reset turn to player when combat starts
        
        // Update combat visual UI
        this.updateCombatUI();
        this.showTurnIndicator(true); // Show "YOUR TURN"
      }
    
      exitCombat(){
        // Hide combat visual stage
        this.hideCombatStage();
        
        const mainAct = document.getElementById('main-actions'); if(mainAct) mainAct.style.display = 'flex';
        const combatAct = document.getElementById('combat-actions'); if(combatAct) combatAct.style.display = 'none';
        document.body.classList.remove('in-combat');
        this.currentEnemy = null;
        this.busy = false;
        this.playerTurn = true; // reset for next combat
        // Re-enable non-combat controls after fight
        this.setNonCombatControlsDisabled(false);
        this.setCombatButtonsEnabled(false);
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
          this.vibrate([25,25]);
          this.playerTurn = false; // mark as not player turn
          this.setCombatButtonsEnabled(false);
          return setTimeout(()=> this.enemyTurn(true), 400);
        }
        this.playerTurn = true; // it's now player's turn
        this.logEvent('info', `Your turn! ${enemy.name} HP: ${enemy.hp}/${enemy.maxHP}`, 'Choose your action');
      this.showTurnIndicator(true); // Show "YOUR TURN"
      this.logCombat(`Your turn! ${enemy.name} HP: ${enemy.hp}/${enemy.maxHP}`, 'info');
        // Decrement skill cooldowns
        Object.keys(p.skillCooldowns||{}).forEach(k=>{ if(p.skillCooldowns[k] > 0) p.skillCooldowns[k]--; });
        this.processPlayerStatusEffects();
        this.updateUI();
      this.updateCombatUI();
        // Enable combat actions for the player
        this.setCombatButtonsEnabled(true);
        // Combat actions are now available via buttons - wait for player input
    }
    
        attackAction(){
      const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
      if(!this.playerTurn) return; // prevent spam clicking
      this.playerTurn = false; // lock out other actions this turn
      
      // Trigger attack animation
      this.animateAttack('player');
      this.logCombat(`${p.name} attacks!`, 'action');
      
      // Small delay for animation
      setTimeout(() => {
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
    const luckBonus = this.getPlayerTempBonus('luck');
    let critChance = 0.05 + ((p.luck || 0) + luckBonus) * 0.01 + (p.dex || 0) * 0.003;
    if(p.archetype === 'striker') critChance += (ARCHETYPES.striker.passives.critBonus || 0);
        if(p.skills && p.skills['battle_focus']) critChance += 0.05; // passive bonus
        const isCrit = guaranteedCrit || Math.random() < critChance;
        if(isCrit) p.criticalHits = (p.criticalHits || 0) + 1; // Track crits for achievements
        
    const atkBonus = this.getPlayerTempBonus('atk');
    const playerDamageRaw = (p.atk + atkBonus) + rand(-1,2);
        let playerDamage = Math.max(1, playerDamageRaw - (enemy.def||0));
        playerDamage = Math.floor(playerDamage * comboMultiplier); // Apply combo bonus
        if(isCrit){ playerDamage = playerDamage * 2; }
        
        enemy.hp -= playerDamage;
        
        // Trigger hit animation and damage number
        this.animateHit('enemy');
        this.showDamageNumber(playerDamage, 'enemy', isCrit, false, false);
        
        // Increment combo on successful hit
        p.comboCount = (p.comboCount || 0) + 1;
        if(p.comboCount > (p.maxCombo || 0)) p.maxCombo = p.comboCount;
        
        // Display combo counter if >= 3
        const comboText = p.comboCount >= 3 ? ` ×${p.comboCount} COMBO!` : '';
        const detail = `Attack: ${playerDamageRaw} - DEF: ${enemy.def||0}${comboMultiplier > 1 ? ` (×${comboMultiplier} combo)` : ''}`;
        
        if(isCrit){
          this.logEvent('attack', `⚔️ CRITICAL HIT! ${this.player.name} struck for ${playerDamage} damage!${comboText}`, detail, 'log-critical');
          this.logCombat(`💥 CRITICAL HIT! ${playerDamage} damage!${comboText}`, 'critical');
          this.vibrate([40,60,40]);
          this.playSfx('attack');
          this.shakeScreen(200);
        } else {
          this.logEvent('attack', `You hit ${enemy.name} for ${playerDamage} damage${comboText}`, detail);
          this.logCombat(`Hit for ${playerDamage} damage${comboText}`, 'combat');
          this.playSfx('attack');
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
          this.logCombat(`💫 MEGA COMBO! Restored ${healAmount} HP!`, 'heal');
        }
        
        this.flashElement(document.getElementById('player-xp'),'glow-xp',500);
        this.updateUI();
        this.updateCombatUI();
        
        // check death
          if(enemy.hp <= 0){
            this.vibrate([30,30,60]);
            this.shakeScreen(260);
            this.onEnemyDefeated(enemy);
            this.exitCombat();
            return;
          }
          // enemy turn
          setTimeout(()=> this.enemyTurn(), 400 + Math.random()*300);
        }, 300); // End of attack animation delay
    }
    
    defendAction(){
      // reduce next incoming damage
      if(!this.playerTurn) return; // prevent spam clicking
      this.playerTurn = false; // lock out other actions
      this.player.isDefending = true;
        this.animateDefend('player');
      this.logEvent('info','You brace for the next attack','Incoming damage reduced');
        this.logCombat(`${this.player.name} defends!`, 'action');
      setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
    }
    
    fleeAction(){
      const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
      if(!this.playerTurn) return; // prevent spam clicking
      this.playerTurn = false; // lock out other actions
      // cannot flee if escorting or from certain enemies
      const escortActive = (p.quests || []).some(q=> q.type === 'escort');
      if(escortActive){ this.logEvent('info','Cannot flee while escorting!'); return; }
      if(enemy.cannotFlee || enemy.isBoss){ this.logEvent('info','Cannot flee from this enemy!'); this.logCombat('You cannot flee from this foe!', 'info'); setTimeout(()=> this.enemyTurn(), 300); return; }
      // Calculate flee chance based on DEX
      const baseChance = enemy.inDungeon ? 0.3 : 0.5;
      const dexBonus = ((p.dex || 1) - (enemy.dex || 1)) * 0.02;
      const fleeChance = Math.max(0.1, Math.min(0.9, baseChance + dexBonus));
      if(Math.random() < fleeChance){
        this.logEvent('info','You escaped safely!','Fled from combat');
        this.logCombat('🧭 You fled the battle.', 'info');
        this.exitCombat();
      } else {
        this.logEvent('info','Escape failed! Enemy attacks!');
        this.logCombat('Escape failed! Enemy attacks!', 'enemy');
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
          if(res.heal){
            this.logEvent('heal', `Used ${it.name}. Restored ${res.heal||0} HP`); 
            this.logCombat(`💚 +${res.heal||0} HP (${it.name})`, 'heal');
            this.showDamageNumber(res.heal||0, 'player', false, true, false);
          }
          if(res.cured){
            this.logEvent('info', `Used ${it.name}. Cured ${res.cured} status effects`);
            this.logCombat(`✨ Cured ${res.cured} status`, 'status');
          }
          this.player.consumablesUsed = (this.player.consumablesUsed || 0) + 1; // Track for achievements
        }
        else { this.logEvent('info', `Could not use ${it.name}`); }
        this.hideModal();
        this.updateUI();
        this.updateCombatUI();
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
        const spCost = sk.spCost || 0;
        const hasSP = (p.sp || 0) >= spCost;
        const canUse = cd === 0 && hasSP;
        const spLine = spCost > 0 ? `<div class=\"muted\">SP Cost: ${spCost}</div>` : '';
        const cdLine = cd > 0 ? `<div class=\"muted\">Cooldown: ${cd} turns</div>` : '';
        const disableReason = !hasSP && cd===0 ? ' (No SP)' : (cd>0 ? ' (CD)' : '');
        return `<div style=\"display:flex;justify-content:space-between;align-items:center;padding:6px\"><div><strong>${sk.name}</strong><div class=\"muted\">${sk.desc}</div>${spLine}${cdLine}</div><button data-skill=\"${k}\" ${canUse ? '' : 'disabled'}>Use${disableReason}</button></div>`;
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
        // SP cost check
        const spCost = sk.spCost || 0;
        if(p.sp < spCost){
          this.logEvent('info', `Not enough SP for ${sk.name}. (${p.sp}/${spCost})`);
          this.logCombat(`Not enough SP for ${sk.name}`, 'info');
          this.playerTurn = true;
          return;
        }
        if(spCost > 0){
          p.sp = Math.max(0, p.sp - spCost);
          this.updateCombatUI();
        }
      
        // Apply skill effect
        if(skillId === 'vertical_arc'){
          const damage = Math.floor(p.atk * 1.5);
          const finalDamage = Math.max(1, damage - (enemy.def||0));
          enemy.hp -= finalDamage;
          this.animateAttack('player');
          setTimeout(()=>{
            this.animateHit('enemy');
            this.showDamageNumber(finalDamage, 'enemy', false, false, false);
          }, 200);
          this.logEvent('attack', `${sk.name}! ${finalDamage} damage to ${enemy.name}`, 'Powerful strike!');
          this.logCombat(`✨ ${sk.name} dealt ${finalDamage}!`, 'critical');
          p.skillCooldowns[skillId] = sk.cooldown || 2;
        } else if(skillId === 'quick_heal'){
          const heal = Math.floor(p.maxHP * 0.3);
          p.hp = Math.min(p.maxHP, p.hp + heal);
          this.logEvent('heal', `${sk.name}! Restored ${heal} HP`, 'Quick recovery');
          this.logCombat(`💚 ${sk.name} +${heal} HP`, 'heal');
          this.showDamageNumber(heal, 'player', false, true, false);
          p.skillCooldowns[skillId] = sk.cooldown || 3;
        } else if(skillId === 'stance_change'){
          // add guard status for 2 turns
          p.statusEffects = p.statusEffects || [];
          p.statusEffects.push({type:'guard', turns:2, value:2});
          this.logEvent('info', 'You brace yourself. Incoming damage will be reduced for 2 turns.');
          this.logCombat('🛡️ Guard up for 2 turns', 'info');
          this.animateDefend('player');
          p.skillCooldowns[skillId] = sk.cooldown || 4;
        } else if(skillId === 'burst_strike'){
          // big hit, then weakened for 1 turn
          const damage = Math.floor(p.atk * 2.0);
          const finalDamage = Math.max(1, damage - (enemy.def||0));
          enemy.hp -= finalDamage;
          this.animateAttack('player');
          setTimeout(()=>{
            this.animateHit('enemy');
            this.showDamageNumber(finalDamage, 'enemy', true, false, false);
          }, 200);
          this.logEvent('attack', `${sk.name}! You dealt ${finalDamage} damage but feel exposed.`, 'Weakened');
          this.logCombat(`💥 ${sk.name} ${finalDamage}! (Weakened)`, 'critical');
          p.statusEffects = p.statusEffects || [];
          p.statusEffects.push({type:'weakened', turns:1, value:1});
          p.skillCooldowns[skillId] = sk.cooldown || 4;
        }
      
  this.updateUI();
        this.updateCombatUI();
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
        this.setCombatButtonsEnabled(false);
      
        // Show enemy turn indicator
        this.showTurnIndicator(false);
        this.logCombat(`${enemy.name}'s turn...`, 'enemy');
      
      // process enemy status effects (poison etc.) at start of its action
      this.processEnemyStatusEffects(enemy);
      
        // Show enemy intent (prepare to attack)
        this.showEnemyIntent('attack');
      
      // dodge/evasion check based on DEX
      const enemyDex = enemy.dex || Math.max(1, Math.floor((enemy.atk||1)*0.5));
      let baseDodge = 0.05 + Math.max(-0.2, Math.min(0.3, ((p.dex||1) - enemyDex) * 0.02));
      if(p.archetype === 'rogue') baseDodge += (ARCHETYPES.rogue.passives.dodgeBonus || 0);
      const dodgeChance = Math.max(0.05, Math.min(0.45, baseDodge));
      if(!freeAttack && Math.random() < dodgeChance){
        this.logEvent('info', `💨 You narrowly evaded ${enemy.name}'s attack!`, null, 'log-dodge');
          this.animateAttack('enemy');
          this.showDamageNumber(0, 'player', false, false, true); // Show DODGE
          this.logCombat(`${p.name} dodged the attack!`, 'dodge');
        // Track dodge stats
        p.dodges = (p.dodges || 0) + 1;
        p.dodgeStreak = (p.dodgeStreak || 0) + 1;
        return setTimeout(()=> this.combatTurn(), 300);
      }
      // Reset dodge streak on hit (or miss)
      p.dodgeStreak = 0;
      
        // Animate enemy attack
        this.animateAttack('enemy');
      
        // Small delay then show damage
        setTimeout(() => {
  const defBonus = this.getPlayerTempBonus('def');
  const enemyDamageRaw = enemy.atk + rand(-1,2);
      // apply guard/weakened modifiers
      const guardStacks = (p.statusEffects||[]).filter(s=> s.type==='guard' && s.turns>0).reduce((a,s)=> a + (s.value||0), 0);
      const weakened = (p.statusEffects||[]).some(s=> s.type==='weakened' && s.turns>0);
  let enemyDamage = Math.max(1, enemyDamageRaw - (p.def + defBonus + guardStacks));
      if(p.archetype === 'guardian') enemyDamage = Math.max(1, enemyDamage - (ARCHETYPES.guardian.passives.flatDamageReduction || 0));
      if(weakened) enemyDamage = Math.ceil(enemyDamage * 1.25);
        if(p.isDefending && !freeAttack){ 
          enemyDamage = Math.ceil(enemyDamage/2); 
          this.logEvent('info','Your defense absorbs some damage!','Reduced by 50%');
            this.logCombat('Defense absorbed damage!', 'info');
          p.isDefending = false; 
        }
      p.hp -= enemyDamage;
      
          // Show hit animation and damage number
          this.animateHit('player');
          this.showDamageNumber(enemyDamage, 'player', false, false, false);
        
      // Reset combo on taking damage
      if(p.comboCount > 0) {
        this.logEvent('info', `Combo broken! (Was at ×${p.comboCount})`);
          this.logCombat(`Combo broken!`, 'info');
        p.comboCount = 0;
      }
      
  this.logEvent('attack', `${enemy.name} hits you for ${enemyDamage} damage`, `Attack: ${enemyDamageRaw} - DEF: ${p.def + defBonus}`);
    this.logCombat(`${enemy.name} hit for ${enemyDamage} damage`, 'enemy');
  this.playSfx('hit');
  this.vibrate([20]);
      this.flashElement(document.getElementById('player-hp'),'flash-red',700);
      // Track near-death survival achievement
      if(p.hp > 0 && p.hp <= p.maxHP * 0.1) {
        p.nearDeathSurvival = true;
      }
      // enemy may apply a status on hit
      if(enemy.statusOnHit && Math.random() < (enemy.statusOnHit.chance || 0)){
        this.applyStatusToPlayer(enemy.statusOnHit.type, enemy.statusOnHit.turns || 2, enemy.statusOnHit.value || 0);
        this.logEvent('info', `${enemy.name} inflicted ${enemy.statusOnHit.type} on you!`);
          this.logCombat(`${enemy.name} inflicted ${enemy.statusOnHit.type}!`, 'status');
      }
      this.updateUI();
        this.updateCombatUI();
      if(p.hp <= 0){ 
        this.logEvent('info','You were defeated...','HP and gold reduced'); 
          this.logCombat('You were defeated...', 'defeat');
        this.vibrate([80,60,80]);
        this.failEscortQuests(); 
        p.hp = Math.max(1, Math.floor(p.maxHP/2)); 
        p.gold = Math.max(0, Math.floor(p.gold*0.7));
        p.comboCount = 0; // Reset combo on death
        this.exitCombat();
        return;
      }
      // Next turn
      setTimeout(()=> this.combatTurn(), 300);
        }, 300); // End of attack animation delay
    }

    onEnemyDefeated(enemy){
      const p = this.player;
      this.logEvent('boss', `Defeated ${enemy.name}!`, `+${enemy.exp} XP, +${enemy.gold} gold`);
      // Archetype XP bonus (Sage)
      const xpArche = p.archetype === 'sage' ? (ARCHETYPES.sage.passives.xpMult || 1) : 1;
      const xpStreak = this.getXpStreakMultiplier();
      const xpMult = xpArche * xpStreak;
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
  const luckBonus2 = this.getPlayerTempBonus('luck');
  let dropBase = 0.35 + ((p.luck||0)+luckBonus2)*0.02 + (p.archetype==='sage' ? (ARCHETYPES.sage.passives.dropBonus || 0) : 0);
      if(enemy.rareDropBoost) dropBase = Math.min(0.95, dropBase + 0.2);
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
          // Daily: dungeon clear progress
          this.progressDaily('clear1', 1);
          this.save(); // Auto-save on boss clear
        }
      }
      // Field boss rare drop
      if(enemy.isBoss && !enemy.arena){
        const drop = this.inventory.addItem({name:'Lucky Pendant', type:'equipment', slot:'Accessory', def:1, luck:1});
        this.logEvent('loot', `Rare drop: ${drop.name} (+1 LUCK, +1 DEF)`);
        this.showInventoryBadge();
        this.showDropFlair('epic');
      }
      this.progressQuests('kill',1);
      if(leveled){ 
        this.log(`Gained ${leveled} level(s)! Allocate your stat points.`); 
        const statusCard = document.getElementById('status'); 
        this.flashElement(statusCard,'levelup-flash',1200);
        this.playSfx('levelup');
        this.save(); // Auto-save on level-up
        this.pauseForStatAllocation(); 
      }
      // Daily: win 5 fights progress
      this.progressDaily('win5', 1);
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
        if(s.type === 'bless_atk'){ /* handled during damage calc via value */ }
        if(s.type === 'bless_def'){ /* handled during defense calc */ }
        if(s.type === 'lucky'){ /* handled in drop/xp multipliers implicitly via luck */ }
        if(s.type === 'weaken'){ /* handled in damage calc via negative atk */ }
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
      
      // Show completed quests with gold glow (top priority)
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

      // Show only the first 3 active quests to avoid clutter
      const activeQuests = p.quests.slice(0, 3);
      activeQuests.forEach(q => {
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

      // If there are more than 3 active quests, show a hint
      if(p.quests.length > 3){
        const hint = document.createElement('div');
        hint.className = 'quest-more-hint';
        hint.style.cssText = 'text-align:center;padding:8px;font-size:11px;color:rgba(255,255,255,0.6);cursor:pointer;';
        hint.textContent = `+${p.quests.length - 3} more quest(s) — open Quest Log to view all`;
        hint.addEventListener('click', ()=>{
          // Toggle the quests-mobile details element
          const questsPanel = document.getElementById('quests-mobile');
          if(questsPanel && questsPanel.tagName === 'DETAILS') questsPanel.open = true;
          // Scroll into view
          if(questsPanel) questsPanel.scrollIntoView({behavior:'smooth', block:'start'});
        });
        trackerList.appendChild(hint);
      }

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
      // Modal-based NPC dialog - only show unlocked NPCs
      const unlockedIds = this.player.unlockedNPCs || ['npc_argo'];
      const unlockedNPCs = this.npcs.filter(n => unlockedIds.includes(n.id));
      
      if(unlockedNPCs.length === 0){
        this.showModal('NPCs', '<div class="muted">You haven\'t met any NPCs yet. Explore the world to discover them!</div>', [
          {text:'Close',action:()=>this.hideModal()}
        ]);
        return;
      }
      
      const npcListHtml = unlockedNPCs.map((n)=>{
        const originalIndex = this.npcs.findIndex(npc => npc.id === n.id);
        const isNew = !this.player.npcsTalked.includes(n.id);
        const newBadge = isNew ? '<span style="color:#4fc3f7;font-size:12px;margin-left:8px">✨ NEW</span>' : '';
        return `<div class="npc-item" data-idx="${originalIndex}"><strong>${n.name}</strong>${newBadge}<div class="muted">${n.desc}</div></div>`;
      }).join('');
      
      const lockedCount = this.npcs.length - unlockedNPCs.length;
      const footerHtml = lockedCount > 0 ? `<div class="muted" style="margin-top:12px;text-align:center">🔒 ${lockedCount} more NPCs to discover</div>` : '';
      
      this.showModal('NPCs', `<div style="display:flex;flex-direction:column;gap:8px">${npcListHtml}${footerHtml}</div>`, [
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
      
      // Mark NPC as talked to
      if(!this.player.npcsTalked.includes(npc.id)){
        this.player.npcsTalked.push(npc.id);
      }
      
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
    
    // Unlock NPC system - called when conditions are met
    unlockNPC(npcId, reason = 'discovery'){
      if(!this.player.unlockedNPCs) this.player.unlockedNPCs = ['npc_argo'];
      
      // Check if already unlocked
      if(this.player.unlockedNPCs.includes(npcId)) return;
      
      // Find NPC by ID
      const npc = this.npcs.find(n => n.id === npcId);
      if(!npc) return;
      
      // Unlock the NPC
      this.player.unlockedNPCs.push(npcId);
      
      // Show unlock notification
      this.logEvent('info', `🎭 New NPC discovered: ${npc.name}!`);
      this.showAchievementPopup({
        name: 'NPC Discovered',
        desc: `You've met ${npc.name}`,
        icon: '🎭'
      });
      
      try { this.save(); } catch(e) {}
    }
    
    // Check for NPC unlocks based on game progress
    checkNPCUnlocks(){
      const p = this.player;
      
      // Agil - Unlock at level 2 or when you have 50+ gold
      if((p.level >= 2 || p.gold >= 50) && !this.player.unlockedNPCs.includes('npc_agil')){
        this.unlockNPC('npc_agil', 'Found the friendly merchant');
      }
      
      // Lind - Unlock at level 4 or after first boss kill
      if((p.level >= 4 || p.bossKills >= 1) && !this.player.unlockedNPCs.includes('npc_lind')){
        this.unlockNPC('npc_lind', 'Met the guild leader');
      }
      
      // Kibaou - Unlock at level 5 or after 20 kills
      if((p.level >= 5 || p.kills >= 20) && !this.player.unlockedNPCs.includes('npc_kibaou')){
        this.unlockNPC('npc_kibaou', 'Encountered the aggressive player');
      }
      
      // Blacksmith - Unlock at level 6 or on floor 2+
      if((p.level >= 6 || p.floor >= 2) && !this.player.unlockedNPCs.includes('npc_blacksmith')){
        this.unlockNPC('npc_blacksmith', 'Found the Horunka blacksmith');
      }
      
      // Forest Hermit - Unlock on floor 3+ or with 10+ completed quests
      if((p.floor >= 3 || p.questsCompleted >= 10) && !this.player.unlockedNPCs.includes('npc_old_hermit')){
        this.unlockNPC('npc_old_hermit', 'Discovered the forest hermit');
      }
      
      // Rex - Unlock on floor 2+
      if(p.floor >= 2 && !this.player.unlockedNPCs.includes('npc_rex')){
        this.unlockNPC('npc_rex', 'Found the Rusty Dagger tavern');
      }
      
      // Marome Guard Captain - Unlock on floor 3+
      if(p.floor >= 3 && !this.player.unlockedNPCs.includes('npc_marome_captain')){
        this.unlockNPC('npc_marome_captain', 'Met the fortress commander');
      }
      
      // Taran Sentinel - Unlock on floor 4+
      if(p.floor >= 4 && !this.player.unlockedNPCs.includes('npc_taran_sentinel')){
        this.unlockNPC('npc_taran_sentinel', 'Reached Taran Village');
      }
      
      // Crystal Miner - Unlock on floor 5+ or with 50+ kills
      if((p.floor >= 5 || p.kills >= 50) && !this.player.unlockedNPCs.includes('npc_crystal_miner')){
        this.unlockNPC('npc_crystal_miner', 'Found the crystal caves');
      }
      
      // Flora Festival Organizer - Unlock on floor 6+ or with high reputation
      if((p.floor >= 6 || p.reputation.merchants >= 3) && !this.player.unlockedNPCs.includes('npc_flora_organizer')){
        this.unlockNPC('npc_flora_organizer', 'Discovered the High Fields festival');
      }
      
      // Faune Elder - Unlock on floor 7+ or with positive faune reputation
      if((p.floor >= 7 || p.reputation.faune >= 2) && !this.player.unlockedNPCs.includes('npc_faune_elder')){
        this.unlockNPC('npc_faune_elder', 'Gained trust of the Faune people');
      }
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
      const titleEl = document.getElementById('modal-title'); if(titleEl) titleEl.textContent = title;
      const body = document.getElementById('modal-body'); if(body) body.innerHTML = bodyHtml;
      const actionsEl = document.getElementById('modal-actions'); 
      if(actionsEl){
        actionsEl.innerHTML='';
        (actions || []).forEach(a=>{
          const btn = document.createElement('button'); btn.textContent = a.text;
          btn.addEventListener('click', ()=> a.action && a.action());
          actionsEl.appendChild(btn);
        });
      }
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
      const rewardEl = popup.querySelector('.achievement-reward');
      if(rewardEl){
        rewardEl.textContent = ach.reward ? `+${ach.reward} Gold` : (ach.icon || '🎉');
      }
      
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
    showArchetypeModal(callback = null){
      if(this.player.archetype){
        this.showModal('Archetype', `<div>You've already chosen the <strong>${ARCHETYPES[this.player.archetype]?.name}</strong> archetype. This choice is permanent for your journey.</div>`, [{text:'Close', action:()=>this.hideModal()}]);
        return;
      }
      
      const tutorialStatus = this.player.skipTutorial ? 
        '<div style="color:#4fc3f7;font-size:12px;margin-bottom:12px">📝 Step 2/2: Choose Archetype (Tutorial will be skipped)</div>' : 
        '<div style="color:#4fc3f7;font-size:12px;margin-bottom:12px">📝 Step 2/3: Choose Archetype</div>';
      
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
      this.showModal('Choose Your Archetype', `${tutorialStatus}<div style="margin-bottom:8px">Select an archetype to define your playstyle. This choice is permanent.</div>${html}`, [{text:'Cancel', action:()=>this.hideModal()}]);
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
        
        // Call callback if provided (for new player flow)
        if(callback) {
          callback();
        } else {
          // Original behavior: continue tutorial if player hasn't completed it
          if(!this.player.tutorialComplete) {
            setTimeout(()=> this.showTutorialStep1(), 500);
          }
        }
      }));
    }
    
    // Wrapper for new player flow with callback
    showArchetypeModalWithCallback(callback) {
      this.showArchetypeModal(callback);
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
          version: SAVE_VERSION,
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
        let data;
        try{ data = JSON.parse(raw); }
        catch(parseErr){ this.log('Corrupt save detected. Attempting recovery...'); data = {}; }
        // Migrate older save formats / ensure defaults
        data = migrateSaveData(data);
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

    // Disable non-combat controls (main + town + utility) during combat
    setNonCombatControlsDisabled(disabled){
      const ids = ['btn-field','btn-dungeon','btn-town','btn-npc','btn-rest','btn-save','btn-load','btn-blacksmith','btn-market','btn-storage','btn-quest-board','btn-field-return'];
      ids.forEach(id=>{ const el = document.getElementById(id); if(el) el.disabled = disabled; });
    }

    // Enable/disable all combat action buttons
    setCombatButtonsEnabled(enabled){
      const container = document.getElementById('combat-actions');
      if(!container) return;
      Array.from(container.querySelectorAll('button')).forEach(b=> b.disabled = !enabled);
    }

    // ---------- Daily goals & streak ----------
    initDailyGoals(){
      const today = new Date();
      const key = 'sao_daily_v1';
      const raw = localStorage.getItem(key);
      let data = null;
      try{ data = raw ? JSON.parse(raw) : null; }catch{ data = null; }
      if(!data){ data = this.newDailyData(); }
      // reset if date changed
      const last = data.date;
      const todayStr = this.formatDateKey(today);
      if(last !== todayStr){
        // if yesterday had all completed, advance streak; else reset
        const yesterday = this.yesterdayKey(todayStr);
        const newStreak = (last === yesterday && this.areAllDailyTasksComplete(data)) ? ((data.streak||0)+1) : 0;
        // new tasks for today
        data = this.newDailyData();
        data.streak = newStreak;
      }
      this.daily = data;
      this.saveDailyData();
    }

    getDailyData(){ return this.daily || this.newDailyData(); }
    saveDailyData(){ try{ localStorage.setItem('sao_daily_v1', JSON.stringify(this.daily)); }catch{} }
    formatDateKey(d){ const dt = (d instanceof Date)? d : new Date(d); return dt.toISOString().slice(0,10); }
    yesterdayKey(todayKey){ const d = new Date(todayKey); d.setDate(d.getDate()-1); return this.formatDateKey(d); }
    newDailyData(){ return { date: this.formatDateKey(new Date()), streak: (this.daily && this.daily.streak)||0, tasks:[
      {id:'win5', title:'Win 5 fights', target:5, progress:0, reward:{gold:80}},
      {id:'clear1', title:'Clear 1 dungeon', target:1, progress:0, reward:{mats:2}},
      {id:'deliver1', title:'Deliver 1 parcel', target:1, progress:0, reward:{tokenFragments:1}}
    ]}; }
    areAllDailyTasksComplete(d){ return (d.tasks||[]).every(t=> (t.progress||0) >= (t.target||1)); }
    progressDaily(id, amount=1){
      if(!this.daily) this.initDailyGoals();
      const t = (this.daily.tasks||[]).find(x=> x.id===id);
      if(!t) return;
      if(t.progress >= t.target) return; // already complete
      t.progress = Math.min(t.target, (t.progress||0) + amount);
      // reward on completion
      if(t.progress >= t.target){
        if(t.reward.gold){ this.player.gold += t.reward.gold; }
        if(t.reward.mats){ this.inventory.addItem({name:'Ore',type:'resource'}, t.reward.mats); }
        if(t.reward.tokenFragments){
          this.player.tokenFragments = (this.player.tokenFragments||0) + t.reward.tokenFragments;
          // convert to full token at 5 fragments
          while(this.player.tokenFragments >= 5){ this.player.tokenFragments -= 5; this.player.tokens = (this.player.tokens||0) + 1; this.logEvent('info','Converted 5 fragments into 1 Token'); }
        }
        // popup
        this.showAchievementPopup({name:`Daily Complete: ${t.title}`, desc:'Daily goal completed', reward: t.reward.gold? `${t.reward.gold}g` : (t.reward.mats? `${t.reward.mats} mats` : `${t.reward.tokenFragments} fragment`) });
        this.logEvent('quest', `Daily completed: ${t.title}`);
        // if all complete, persist and maybe notify
        if(this.areAllDailyTasksComplete(this.daily)){
          this.logEvent('info','All daily goals completed! Keep logging in daily to build streak (+3% XP).');
        }
      }
      this.saveDailyData(); this.updateUI();
    }
    getXpStreakMultiplier(){ const d = this.getDailyData(); return (d.streak||0) > 0 ? 1.03 : 1.0; }

    // ---------- Temporary bonuses from status ----------
    getPlayerTempBonus(stat){
      const p = this.player; if(!p || !p.statusEffects) return 0;
      let sum = 0;
      p.statusEffects.forEach(s=>{
        if(stat==='atk' && (s.type==='bless_atk' || s.type==='weaken')) sum += (s.value||0);
        if(stat==='def' && s.type==='bless_def') sum += (s.value||0);
        if(stat==='luck' && s.type==='lucky') sum += (s.value||0);
      });
      return sum;
    }

    // ---------- SFX / Haptics / Flair ----------
    playSfx(name){
      try{
        const ctx = this._audioCtx || (this._audioCtx = new (window.AudioContext||window.webkitAudioContext)());
        const o = ctx.createOscillator(); const g = ctx.createGain();
        const now = ctx.currentTime;
        let freq = 220;
        if(name==='attack') freq = 320; else if(name==='hit') freq = 180; else if(name==='levelup') freq = 520; else if(name==='boss') freq = 120;
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.2);
      }catch{}
    }
    vibrate(pattern){ if(navigator && navigator.vibrate) try{ navigator.vibrate(pattern); }catch{} }
    shakeScreen(ms=250){ document.body.classList.add('screen-shake'); setTimeout(()=> document.body.classList.remove('screen-shake'), ms); }
    showDropFlair(rarity='epic'){
      // simple confetti burst
      const container = document.createElement('div');
      container.style.position='fixed'; container.style.left='0'; container.style.top='0'; container.style.width='100%'; container.style.height='100%'; container.style.pointerEvents='none'; container.style.zIndex='9999';
      for(let i=0;i<30;i++){
        const c = document.createElement('div');
        const size = 6 + Math.random()*6;
        c.style.position='absolute'; c.style.width=`${size}px`; c.style.height=`${size}px`;
        c.style.background = `hsl(${Math.floor(Math.random()*360)},85%,60%)`;
        c.style.left = `${Math.random()*100}%`; c.style.top = '0%';
        c.style.opacity='0.9'; c.style.borderRadius='2px';
        c.style.transform = `translateY(0)`;
        container.appendChild(c);
        const dy = 60 + Math.random()*40;
        setTimeout(()=>{ c.style.transition='transform 700ms ease-out, opacity 700ms ease-out'; c.style.transform = `translateY(${dy}vh)`; c.style.opacity='0'; }, 10);
      }
      document.body.appendChild(container);
      setTimeout(()=>{ if(container.parentNode) container.parentNode.removeChild(container); }, 800);
    }

    // ---------- Auto-save system ----------
    initAutoSave(){
      // Auto-save every 2 minutes (reduced from 30 seconds for better performance)
      this.autoSaveTimer = setInterval(()=> {
        try {
          this.save();
          console.log('[Auto-save] Progress saved at ' + new Date().toLocaleTimeString());
        } catch(e) {
          console.error('[Auto-save] Failed:', e);
        }
      }, 120000); // 2 minutes = 120000ms
    }

    // ---------- New player onboarding ----------
    checkNewPlayer(){
      const hasSave = localStorage.getItem(SAVE_KEY);
      console.log('[New Player Check] Has save:', !!hasSave);
      
      // If save exists, auto-load it
      if(hasSave){
        console.log('[Auto-load] Loading saved game...');
        this.load(); // Auto-load the save
        return; // Exit early - load() calls updateUI()
      }
      
      // No save - show welcome for new players
      console.log('[New Player Check] No save found - showing welcome');
      this.updateUI();
      setTimeout(()=> this.showWelcomeModal(), 800);
    }

    showWelcomeModal() {
      console.log('[Welcome Modal] Showing welcome modal...');
      const html = `
        <div style="text-align:center;padding:20px">
          <h2 style="color:#4fc3f7;margin-bottom:16px">⚔️ Welcome to Sword Art Online ⚔️</h2>
          <div style="margin-bottom:12px;line-height:1.6">
            You are trapped in a deadly VRMMO. The only way out is to reach Floor 100 and defeat the final boss.
          </div>
          <div class="muted" style="margin-bottom:20px">
            Death in the game means death in real life. Fight wisely, explore carefully, and never give up.
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-top:16px;text-align:left">
            <strong>Game Features:</strong><br>
            ⚔️ Turn-based combat with skills<br>
            🏰 100 floors with unique themes<br>
            📜 Quests, NPCs, and story events<br>
            🎯 Achievements and daily goals<br>
            🛡️ Equipment upgrades and crafting<br>
            🏆 Boss raids and field bosses
          </div>
        </div>
      `;
      this.showModal('Welcome to SAO', html, [
        {text:'🎓 New Player (With Tutorial)', action:()=> {
          this.player.skipTutorial = false;
          this.showNameInput();
        }},
        {text:'⚔️ Experienced Player (Skip Tutorial)', action:()=> {
          this.player.skipTutorial = true;
          this.player.tutorialComplete = true;
          this.showNameInput();
        }}
      ]);
    }

    showNameInput() {
      const tutorialStatus = this.player.skipTutorial ? 
        '<div style="color:#4fc3f7;font-size:12px;margin-bottom:8px">📝 Step 1/2: Choose Name (Tutorial will be skipped)</div>' : 
        '<div style="color:#4fc3f7;font-size:12px;margin-bottom:8px">📝 Step 1/3: Choose Name</div>';
      const html = `
        <div style="padding:12px">
          ${tutorialStatus}
          <div style="margin-bottom:12px">Choose your in-game name. This will be your identity in Aincrad.</div>
          <input type="text" id="player-name-input" placeholder="Enter your name" 
                 style="width:100%;padding:10px;font-size:16px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#fff" 
                 maxlength="20" />
          <div class="muted" style="margin-top:8px;font-size:12px">2-20 characters. Choose wisely!</div>
        </div>
      `;
      this.showModal('Choose Your Name', html, [
        {text:'✓ Confirm Name', action:()=> {
          const input = document.getElementById('player-name-input');
          const name = (input?.value || '').trim();
          if(name.length < 2) { 
            alert('Name must be at least 2 characters.');
            return; 
          }
          this.player.name = name;
          this.hideModal();
          this.logEvent('info', `Welcome, ${name}!`);
          this.showArchetypeSelection();
          this.updateUI();
        }},
        {text:'Use "Player"', action:()=> { 
          this.player.name = 'Player'; 
          this.hideModal(); 
          this.showArchetypeSelection(); 
          this.updateUI();
        }}
      ]);
      // Auto-focus input and handle Enter key
      setTimeout(()=> {
        const input = document.getElementById('player-name-input');
        if(input) {
          input.focus();
          input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
              const name = input.value.trim();
              if(name.length >= 2) {
                this.player.name = name;
                this.hideModal();
                this.logEvent('info', `Welcome, ${name}!`);
                this.showArchetypeSelection();
                this.updateUI();
              } else {
                alert('Name must be at least 2 characters.');
              }
            }
          });
        }
      }, 100);
    }

    showArchetypeSelection() {
      this.logEvent('info', 'Choose your archetype to define your playstyle.');
      // Show archetype modal, then trigger tutorial if not skipped
      this.showArchetypeModalWithCallback(() => {
        if(!this.player.skipTutorial && !this.player.tutorialComplete) {
          setTimeout(()=> this.showTutorialStep1(), 500);
        } else {
          this.logEvent('info', 'Adventure begins! Good luck, and stay alive!');
        }
      });
    }

    showTutorialStep1() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Exploration</h3>
          <div style="margin:12px 0;line-height:1.6">
            You are now on <strong>Floor 1: Town of Beginnings</strong>. To progress, you must explore and fight monsters.
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li><strong>Explore Field:</strong> Find monsters and resources on the floor.</li>
            <li><strong>Explore Dungeon:</strong> Tougher enemies, but better rewards. Unlock by exploring the field first.</li>
            <li><strong>Go to Town:</strong> Rest, shop, and manage quests.</li>
          </ul>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: Start by exploring the field to gain XP and gold!
          </div>
        </div>
      `;
      this.showModal('Tutorial: Exploration', html, [{text:'Next: Combat →', action:()=> this.showTutorialStep2()}]);
    }

    showTutorialStep2() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Turn-Based Combat</h3>
          <div style="margin:12px 0;line-height:1.6">
            When you encounter an enemy, combat begins. You must choose <strong>one action per turn</strong>:
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li><strong>⚔️ Attack:</strong> Deal damage (may crit based on LUCK/DEX).</li>
            <li><strong>🛡️ Defend:</strong> Reduce next incoming damage by 50%.</li>
            <li><strong>🏃 Flee:</strong> Attempt to escape (success based on DEX). Cannot flee from bosses!</li>
            <li><strong>✨ Use Skill:</strong> Powerful attacks or buffs (has cooldowns).</li>
            <li><strong>🧪 Use Item:</strong> Heal or cure status effects.</li>
          </ul>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: Build combos! Land 3+ hits in a row for bonus damage (up to ×10 for +50% damage + HP restore).
          </div>
        </div>
      `;
      this.showModal('Tutorial: Combat', html, [{text:'Next: Leveling →', action:()=> this.showTutorialStep3()}]);
    }

    showTutorialStep3() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Leveling Up</h3>
          <div style="margin:12px 0;line-height:1.6">
            Defeat enemies to gain <strong>XP</strong>. When you level up, you get <strong>2 Stat Points</strong> to allocate:
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li><strong>+5 Max HP:</strong> Increases survivability.</li>
            <li><strong>+1 ATK:</strong> Deal more damage per hit.</li>
            <li><strong>+1 DEF:</strong> Reduce incoming damage.</li>
          </ul>
          <div style="margin:12px 0;line-height:1.6">
            Every <strong>3 levels</strong>, you earn <strong>1 Skill Point</strong> to unlock:
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li><strong>Active Skills:</strong> Vertical Arc, Quick Heal, Burst Strike</li>
            <li><strong>Passive Skills:</strong> Battle Focus (+crit), Survival Instinct (+HP)</li>
          </ul>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: Balance HP, ATK, and DEF based on your archetype! Use the "Allocate Stats" button when you have points.
          </div>
        </div>
      `;
      this.showModal('Tutorial: Leveling', html, [{text:'Next: Town Services →', action:()=> this.showTutorialStep4()}]);
    }

    showTutorialStep4() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Town Hub</h3>
          <div style="margin:12px 0;line-height:1.6">
            Return to town to access important services:
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li><strong>🔨 Blacksmith:</strong> Upgrade weapons (+ATK) and fortify armor (+DEF) using materials and gold.</li>
            <li><strong>🛒 Market:</strong> Buy consumables and equipment; sell unwanted items for gold.</li>
            <li><strong>📜 Quest Board:</strong> Accept quests for XP, gold, and rewards. Complete daily goals for bonuses.</li>
            <li><strong>📦 Storage:</strong> Store extra items in your infinite stash.</li>
            <li><strong>👑 Boss Arena:</strong> Use Boss Keys (from dungeons) to fight floor bosses and unlock the next floor.</li>
            <li><strong>🗺️ Travel:</strong> Change your current floor after clearing boss fights.</li>
          </ul>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: HP is fully restored when entering town!
          </div>
        </div>
      `;
      this.showModal('Tutorial: Town Hub', html, [{text:'Next: Quests →', action:()=> this.showTutorialStep5()}]);
    }

    showTutorialStep5() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Quest System</h3>
          <div style="margin:12px 0;line-height:1.6">
            Quests give you goals and rewards. There are several types:
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li><strong>Kill Quests:</strong> Defeat X monsters.</li>
            <li><strong>Gather Quests:</strong> Collect X resources from exploration.</li>
            <li><strong>Escort Quests:</strong> Protect an NPC for X encounters (no fleeing!).</li>
            <li><strong>Delivery Quests:</strong> Bring a parcel to a specific floor.</li>
          </ul>
          <div style="margin:12px 0;line-height:1.6;background:rgba(255,193,7,0.1);padding:10px;border-left:3px solid #ffc107">
            <strong>⭐ Daily Goals:</strong> Complete 3 tasks daily (win fights, clear dungeons, deliver parcels) to build a <strong>streak</strong> for +3% XP!
          </div>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: Active quests appear in the Quest Tracker. Each quest can only be accepted once!
          </div>
        </div>
      `;
      this.showModal('Tutorial: Quests', html, [{text:'Next: Achievements →', action:()=> this.showTutorialStep6()}]);
    }

    showTutorialStep6() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Achievements & Combos</h3>
          <div style="margin:12px 0;line-height:1.6">
            <strong>🏆 Achievements:</strong> Unlock 30+ achievements by reaching milestones:
          </div>
          <ul style="margin-left:20px;line-height:1.8">
            <li>Defeat 10/50/100 enemies</li>
            <li>Reach level 10/25/50</li>
            <li>Land 10 critical hits</li>
            <li>Clear 5/10 floor bosses</li>
          </ul>
          <div style="margin:12px 0;line-height:1.6">
            Each achievement grants <strong>50 gold</strong>!
          </div>
          <div style="margin:12px 0;line-height:1.6;background:rgba(229,57,53,0.1);padding:10px;border-left:3px solid #e53935">
            <strong>⚔️ Combo System:</strong> Land consecutive hits without taking damage:
            <ul style="margin:8px 0 0 20px;line-height:1.6">
              <li><strong>×3 Combo:</strong> +10% damage</li>
              <li><strong>×5 Combo:</strong> +25% damage + guaranteed crit</li>
              <li><strong>×10 Combo:</strong> +50% damage + restore 50% HP</li>
            </ul>
          </div>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: Dodge or defend to preserve your combo streak!
          </div>
        </div>
      `;
      this.showModal('Tutorial: Achievements & Combos', html, [{text:'Next: Floor Progression →', action:()=> this.showTutorialStep7()}]);
    }

    showTutorialStep7() {
      const html = `
        <div style="padding:12px">
          <h3 style="color:#4fc3f7;margin-bottom:12px">Tutorial: Floor Progression</h3>
          <div style="margin:12px 0;line-height:1.6">
            To unlock the next floor, you must defeat the <strong>Floor Boss</strong>:
          </div>
          <ol style="margin-left:20px;line-height:1.8">
            <li>Explore the <strong>field</strong> several times to unlock the <strong>dungeon</strong>.</li>
            <li>Progress through the dungeon to fight a <strong>miniboss</strong>.</li>
            <li>The miniboss drops a <strong>Boss Key</strong> for the current floor.</li>
            <li>Return to town and use the Boss Key at the <strong>Boss Arena</strong>.</li>
            <li>Defeat the arena boss to clear the floor and unlock the next one!</li>
            <li>Use <strong>Travel</strong> in town to change your current floor.</li>
          </ol>
          <div style="margin:12px 0;background:rgba(255,193,7,0.1);border-left:3px solid #ffc107;padding:10px">
            <strong>⚠️ Warning:</strong> Field bosses (2% encounter chance) are rare, powerful enemies with unique drops. You cannot flee from them!
          </div>
          <div style="margin:12px 0;background:rgba(76,175,80,0.1);border-left:3px solid #4caf50;padding:10px">
            <strong>💾 Auto-Save:</strong> Your progress is automatically saved every 30 seconds and on major events!
          </div>
          <div class="muted" style="margin-top:12px;padding:8px;background:rgba(79,195,247,0.1);border-left:3px solid #4fc3f7">
            💡 Tip: Each floor has a unique theme, enemies, and boss. Prepare well before boss fights!
          </div>
        </div>
      `;
      this.showModal('Tutorial: Floor Progression', html, [
        {text:'Start Playing! 🎮', action:()=> {
          this.hideModal();
          this.player.tutorialComplete = true;
          this.logEvent('quest', '🎮 Tutorial complete! Your journey begins now. Good luck, and stay alive!');
          this.save(); // Save tutorial completion
          this.updateUI();
        }}
      ]);
    }
  }

  // Start game when DOM ready
  window.addEventListener('DOMContentLoaded', ()=> {
    // Show loading screen during initialization
    const loadingScreen = document.getElementById('loading-screen');
    
    // Initialize game
    window.game = new Game();
    
    // Hide loading screen after brief delay (allow game to render initial state)
    setTimeout(() => {
      if(loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 800);
  });
})();

