// Simple inventory system for SAO Text Adventure demo
(function(){
  class Inventory {
    constructor(){
      // items: array of objects {id,name,type,slot,atk,def,heal,equipped,count}
      this.items = [];
    }

    // addItem will stack consumables and resources with same name/type
    addItem(item, count = 1){
      const it = Object.assign({}, item);
      it.id = it.id || ('item_' + Date.now() + '_' + Math.floor(Math.random()*1000));
      it.equipped = !!it.equipped;
      it.count = count || (it.count || 1);
      // merge stacks for consumables and resources (items with same name & type)
      if(it.type === 'consumable' || it.type === 'resource'){
        const existing = this.items.find(i=> i.type === it.type && i.name === it.name && !i.equipped);
        if(existing){ existing.count = (existing.count || 1) + it.count; return existing; }
      }
      this.items.push(it);
      return it;
    }

    removeItem(id, quantity = 1){
      const idx = this.items.findIndex(i=>i.id===id);
      if(idx===-1) return null;
      const item = this.items[idx];
      if(item.count > quantity){
        item.count -= quantity;
        return Object.assign({}, item, {removed:quantity});
      }
      return this.items.splice(idx,1)[0];
    }

    getItem(id){ return this.items.find(i=>i.id===id); }

    useItem(id, player){
      const it = this.getItem(id);
      if(!it) return {used:false,reason:'not found'};
      if(it.type === 'consumable'){
        if(it.heal){
          const healed = Math.min(player.maxHP - player.hp, it.heal);
          player.hp = Math.min(player.maxHP, player.hp + it.heal);
          this.removeItem(id,1);
          return {used:true,heal:healed};
        }
        if(it.cure){
          // remove matching status effects from player
          const cures = Array.isArray(it.cure) ? it.cure : [it.cure];
          if(player && player.statusEffects && player.statusEffects.length){
            let removed = 0;
            for(let i=player.statusEffects.length-1;i>=0;i--){
              if(cures.includes(player.statusEffects[i].type)){
                player.statusEffects.splice(i,1);
                removed++;
              }
            }
            this.removeItem(id,1);
            return {used:true,cured:removed};
          } else {
            // still consume if intended
            this.removeItem(id,1);
            return {used:true,cured:0};
          }
        }
        // other consumable effects can be added here
      }
      return {used:false,reason:'not usable'};
    }

    equipItem(id, player){
      const it = this.getItem(id);
      if(!it || it.type !== 'equipment') return {ok:false,reason:'not equipment'};
      if(it.equipped) return {ok:false,reason:'already equipped'};
      // ensure slot uniqueness
      if(it.slot){
        const existing = this.items.find(x => x.slot === it.slot && x.equipped);
        if(existing){ this.unequipItem(existing.id, player); }
      }
      it.equipped = true;
      if(it.atk) player.atk += it.atk;
      if(it.def) player.def += it.def;
      return {ok:true};
    }

    unequipItem(id, player){
      const it = this.getItem(id);
      if(!it || !it.equipped) return {ok:false};
      it.equipped = false;
      if(it.atk) player.atk = Math.max(0, player.atk - it.atk);
      if(it.def) player.def = Math.max(0, player.def - it.def);
      return {ok:true};
    }

    toJSON(){ return {items:this.items}; }

    fromJSON(obj, player){
      this.items = obj && obj.items ? obj.items : [];
      // reapply equipped bonuses to player when loading
      if(player){
        this.items.forEach(it=>{
          if(it.equipped){
            if(it.atk) player.atk += it.atk;
            if(it.def) player.def += it.def;
          }
        });
      }
    }
  }

  // expose globally for the main game script
  window.Inventory = Inventory;
})();