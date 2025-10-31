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
    this.initUI();
    this.updateUI();
    this.log('Welcome to SAO Text Adventure. Talk to NPCs for quests and explore to gain XP.');
  }
  initUI(){
    document.getElementById('btn-field').addEventListener('click', ()=>this.explore('field'));
    document.getElementById('btn-dungeon').addEventListener('click', ()=>this.explore('dungeon'));
    document.getElementById('btn-npc').addEventListener('click', ()=>this.openNPCDialog());
    const skBtn = document.getElementById('btn-skills'); if(skBtn) skBtn.addEventListener('click', ()=> this.openSkillModal());
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
  }

  // Town/hub menu
  showTownMenu(){
    // enter town state and disable exploration while in town
    this.enterTown();
    const html = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <div><strong>Town Hub</strong><div class="muted">Choose a service or return to the field.</div></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button data-town="explore">Explore (Field)</button>
          <button data-town="dungeon">Enter Dungeon</button>
          <button data-town="npcs">NPCs</button>
          <button data-town="shop">Shop</button>
          <button data-town="blacksmith">Blacksmith</button>
          <button data-town="inn">Inn (Rest)</button>
          <button data-town="skills">Skills</button>
          <button data-town="arena">Boss Arena</button>
          <button data-town="leave">Leave Town</button>
        </div>
      </div>
    `;
    this.showModal('Town Hub', html, [{text:'Close', action:()=>{ this.leaveTown(); }}]);
    const body = document.getElementById('modal-body');
    body.querySelectorAll('button[data-town]').forEach(btn=> btn.addEventListener('click', ()=>{
      const act = btn.getAttribute('data-town');
      if(act === 'explore'){ this.leaveTown(); this.explore('field'); }
      if(act === 'dungeon'){ this.leaveTown(); this.explore('dungeon'); }
      if(act === 'npcs'){ this.hideModal(); this.openNPCDialog(); }
      if(act === 'shop'){ this.hideModal(); this.showShopModal(); }
      if(act === 'blacksmith'){ this.hideModal(); this.showBlacksmithModal(); }
      if(act === 'inn'){ this.hideModal(); this.rest(); }
      if(act === 'skills'){ this.hideModal(); this.openSkillModal(); }
      if(act === 'arena'){ this.hideModal(); this.showBossArenaModal(); }
      if(act === 'leave'){ this.leaveTown(); }
    }));
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
    // disable auto-explore and exploration buttons while in town
    const autoCheckbox = document.getElementById('auto-explore'); if(autoCheckbox && autoCheckbox.checked){ autoCheckbox.checked = false; if(this.autoTimer){ clearInterval(this.autoTimer); this.autoTimer = null; this.log('Auto-explore paused while in town.'); } }
    ['btn-field','btn-dungeon'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled = true; });
    this.log('You enter the town. Services are available here.');
  }

  leaveTown(){
    this.inTown = false;
    this.hideModal();
    ['btn-field','btn-dungeon'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled = false; });
    this.log('You leave the town and return to the field.');
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
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px"><div><strong>${it.name}</strong><div class="muted">${it.type}${it.atk?(' ATK+'+it.atk):''}${it.def?(' DEF+'+it.def):''}${it.heal?(' Heal:'+it.heal):''}</div></div><div><button data-buy="${i}" data-price="${price}">Buy (${price}g)</button></div></div>`;
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
        this.hideModal(); this.updateUI();
      }
    }));
    body.querySelectorAll('button[data-stash-get]').forEach(btn=> btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.getAttribute('data-stash-get'));
      const st = this.player.stash[idx]; if(!st) return;
      // move one back into inventory
      const added = this.inventory.addItem({name:st.name,type:st.type,slot:st.slot,atk:st.atk,def:st.def,heal:st.heal}, 1);
      st.count = st.count - 1; if(st.count <= 0) this.player.stash.splice(idx,1);
      this.logEvent('info', `Retrieved ${added.name} from stash.`); this.hideModal(); this.showInventoryBadge(); this.updateUI();
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
    if(res.used){ this.logEvent('heal', `Used ${it.name} (quick). Restored ${res.heal||0} HP`); this.updateUI(); }
    else this.logEvent('info','Could not use item');
    // if in combat, enemy gets a turn
    if(this.currentEnemy) setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
  }
  log(text,cls){
    const div = document.createElement('div');
    div.className = 'log-line';
    if(cls) div.classList.add(cls);
    div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    this.logEl.appendChild(div);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  // enhanced log with icons and detail
  logEvent(type, message, detail){
    const icons = {attack:'⚔️',heal:'🩹',gold:'💰',info:'ℹ️',quest:'📜',loot:'🎁',boss:'👑'};
    const icon = icons[type] || icons.info;
    const text = `${icon} ${message}` + (detail ? ` (${detail})` : '');
    this.log(text);
  }

  flashElement(el,cls,duration=700){
    if(!el) return;
    el.classList.add(cls);
    setTimeout(()=> el.classList.remove(cls), duration);
  }
  updateUI(){
    const p = this.player;
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
    document.getElementById('player-gold').textContent = p.gold;
    document.getElementById('player-floor').textContent = p.floor;
    document.getElementById('quest-count').textContent = p.quests.length;
    const pointsEl = document.getElementById('player-points'); if(pointsEl) pointsEl.textContent = p.pendingStatPoints || 0;
    const spEl = document.getElementById('player-skillpoints'); if(spEl) spEl.textContent = p.skillPoints || 0;
    const tokEl = document.getElementById('player-tokens'); if(tokEl) tokEl.textContent = p.tokens || 0;

    // quests
    this.questListEl.innerHTML = '';
    p.quests.forEach(q=>{
      const li = document.createElement('li');
      li.textContent = `${q.title} — ${q.desc} (${q.progress||0}/${q.target})`;
      const btn = document.createElement('button');
      btn.textContent = 'Abandon';
      btn.style.marginLeft='8px';
      btn.addEventListener('click', ()=>{ this.abandonQuest(q.id) });
      li.appendChild(btn);
      this.questListEl.appendChild(li);
    });
    // inventory UI
    this.updateInventoryUI();
    // equipment panel render
    this.updateEquipmentUI();
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
          if(res.used){ this.log(`Used ${it.name}. Restored HP.`); }
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
        if(found < 0.75){
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
    this.busy = true; this.setButtonsDisabled(true);
    // start player turn
    this.playerTurn();
  }

  // Player decision flow
  playerTurn(){
    const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
    // decrement skill cooldowns at start of player's turn
    Object.keys(p.skillCooldowns||{}).forEach(k=>{ if(p.skillCooldowns[k] > 0) p.skillCooldowns[k]--; });
    // process player status effects (poison, etc.) at start of turn
    this.processPlayerStatusEffects();
    const bodyHtml = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <div><strong>${enemy.name}</strong> — HP: ${Math.max(0,enemy.hp)}/${enemy.maxHP}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button data-act="attack">Attack ⚔️</button>
          <button data-act="skill">Skill ✨</button>
          <button data-act="item">Use Item 🩹</button>
          <button data-act="defend">Defend 🛡️</button>
          <button data-act="flee">Flee 🏃</button>
        </div>
      </div>
    `;
    this.showModal('Choose Action', bodyHtml, [{text:'Close', action:()=>{ this.hideModal(); }}]);
    const body = document.getElementById('modal-body');
    body.querySelectorAll('button[data-act]').forEach(btn=> btn.addEventListener('click', ()=>{
      const act = btn.getAttribute('data-act'); this.hideModal();
      if(act==='attack') this.playerAttack();
      if(act==='skill') this.openSkillModal();
      if(act==='item') this.openItemUseModal();
      if(act==='defend') this.playerDefend();
      if(act==='flee') this.attemptFlee();
    }));
  }

  playerAttack(){
    const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
    // critical hit calculation
    let critChance = 0.03 + (p.luck || 0) * 0.01 + (p.dex || 0) * 0.005;
    if(p.skills && p.skills['battle_focus']) critChance += 0.05; // passive bonus
    const isCrit = Math.random() < critChance;
    const playerDamageRaw = p.atk + rand(-1,2);
    let playerDamage = Math.max(1, playerDamageRaw - (enemy.def||0));
    if(isCrit){ playerDamage = playerDamage * 2; }
    enemy.hp -= playerDamage;
    const detail = `Attack: ${playerDamageRaw} - DEF: ${enemy.def||0}` + (isCrit ? ' — CRITICAL!' : '');
    this.logEvent('attack', `You hit ${enemy.name} for ${playerDamage} damage` + (isCrit ? ' — CRITICAL HIT!' : ''), detail);
    this.flashElement(document.getElementById('player-xp'),'glow-xp',500);
    // check death
    if(enemy.hp <= 0){
      this.onEnemyDefeated(enemy);
      return;
    }
    // enemy turn
    setTimeout(()=> this.enemyTurn(), 400 + Math.random()*300);
  }

  playerDefend(){
    // reduce next incoming damage
    this.player._defend = true;
    this.logEvent('info','You brace for the next attack','Incoming damage reduced');
    setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
  }

  openItemUseModal(){
    const consumables = this.inventory.items.filter(i=> i.type==='consumable');
    if(consumables.length===0){ this.logEvent('info','No consumables available'); this.playerTurn(); return; }
    const html = consumables.map((it,i)=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px" data-idx="${i}"><div>${it.name} x${it.count||1}</div><button data-use="${i}">Use</button></div>`).join('');
    this.showModal('Use Item', `<div style="display:flex;flex-direction:column;gap:6px">${html}</div>`, [{text:'Back', action:()=> { this.hideModal(); this.playerTurn(); }}]);
    const body = document.getElementById('modal-body');
    body.querySelectorAll('button[data-use]').forEach(btn=> btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.getAttribute('data-use'));
      const it = consumables[idx];
      const res = this.inventory.useItem(it.id, this.player);
      if(res.used){ this.logEvent('heal', `Used ${it.name}. Restored ${res.heal||0} HP`); }
      else this.logEvent('info', `Could not use ${it.name}`);
      this.hideModal(); this.updateUI();
      setTimeout(()=> this.enemyTurn(), 300 + Math.random()*200);
    }));
  }

  attemptFlee(){
    const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
    // fleeing is harder in dungeons and impossible against some enemies
    // also, you cannot flee while escorting a merchant
    const escortActive = (p.quests || []).some(q=> q.type === 'escort');
    if(escortActive){ this.logEvent('info','You cannot flee while escorting the merchant!'); return; }
    if(enemy.cannotFlee || enemy.isBoss){ this.logEvent('info','You cannot flee from this foe!'); setTimeout(()=> this.enemyTurn(true), 300 + Math.random()*200); return; }
    const baseChance = enemy.inDungeon ? 0.25 : 0.45;
    const chance = Math.random();
    if(chance < baseChance){ this.logEvent('info','You escaped the battle successfully'); this.currentEnemy = null; this.busy=false; this.setButtonsDisabled(false); this.updateUI(); }
    else { this.logEvent('info','Flee failed — enemy strikes!'); setTimeout(()=> this.enemyTurn(true), 300 + Math.random()*200); }
  }

  enemyTurn(freeAttack=false){
    const p = this.player; const enemy = this.currentEnemy; if(!enemy) return;
    // process enemy status effects (poison etc.) at start of its action
    this.processEnemyStatusEffects(enemy);
    const enemyDamageRaw = enemy.atk + rand(-1,2);
    let enemyDamage = Math.max(1, enemyDamageRaw - p.def);
    if(p._defend && !freeAttack){ enemyDamage = Math.ceil(enemyDamage/2); p._defend = false; }
    p.hp -= enemyDamage;
    this.logEvent('attack', `${enemy.name} hits you for ${enemyDamage} damage`, `Attack: ${enemyDamageRaw} - DEF: ${p.def}`);
    this.flashElement(document.getElementById('player-hp'),'flash-red',700);
    // enemy may apply a status on hit
    if(enemy.statusOnHit && Math.random() < (enemy.statusOnHit.chance || 0)){
      this.applyStatusToPlayer(enemy.statusOnHit.type, enemy.statusOnHit.turns || 2, enemy.statusOnHit.value || 0);
      this.logEvent('info', `${enemy.name} inflicted ${enemy.statusOnHit.type} on you!`);
    }
    if(p.hp <= 0){ this.logEvent('info','You were defeated...'); this.failEscortQuests(); p.hp = Math.max(1, Math.floor(p.maxHP/2)); p.gold = Math.max(0, Math.floor(p.gold*0.7)); this.currentEnemy = null; this.busy=false; this.setButtonsDisabled(false); this.updateUI(); return; }
    // next player turn
    setTimeout(()=> this.playerTurn(), 300 + Math.random()*200);
  }

  onEnemyDefeated(enemy){
    const p = this.player;
    this.logEvent('boss', `Defeated ${enemy.name}!`, `+${enemy.exp} XP, +${enemy.gold} gold`);
    const leveled = p.addXp(enemy.exp);
    p.gold += enemy.gold;
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
    if(res && Math.random() < (0.5 + (p.luck||0)*0.02)){
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
      }
    }
    this.progressQuests('kill',1);
    if(leveled){ this.log(`Gained ${leveled} level(s)! Allocate your stat points.`); this.pauseForStatAllocation(); }
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
    p.quests.forEach(q=>{
      if(q.type === type && (!questIdFilter || q.id === questIdFilter)){
        q.progress = (q.progress||0) + amount;
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

  save(){
    try{
      const data = {player:this.player.toJSON(), inventory:this.inventory.toJSON(), timestamp:Date.now()};
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      this.log('Game saved to browser storage.');
    }catch(e){ this.log('Save failed: ' + e.message); }
  }

  load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return this.log('No save found.');
      const data = JSON.parse(raw);
      this.player = new Player();
      this.player.fromJSON(data.player);
      // restore inventory
      this.inventory = new Inventory();
      if(data.inventory) this.inventory.fromJSON(data.inventory, this.player);
      this.log('Save loaded.');
      this.updateUI();
    }catch(e){ this.log('Load failed: ' + e.message); }
  }

  setButtonsDisabled(val){
    ['btn-field','btn-dungeon','btn-npc','btn-rest','btn-save','btn-load'].forEach(id=>{
      const el = document.getElementById(id); if(el) el.disabled = val;
    });
  }
}
