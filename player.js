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
  }
  nextXp(){ return 50 + Math.floor(50 * (this.level-1) * 1.2) }
  addXp(amount){
    this.xp += amount;
    let leveled = 0;
    while(this.xp >= this.nextXp()){
      this.xp -= this.nextXp();
      this.level++;
      // award 2 stat points per level
      this.pendingStatPoints += 2;
      // occasionally award a skill point on milestone levels
      if(this.level % 3 === 0) this.skillPoints = (this.skillPoints || 0) + 1;
      leveled++;
    }
    return leveled;
  }
  applyStatAllocation({hp=0,atk=0,def=0,dex=0,luck=0}){
    if(hp){ this.maxHP += 5 * hp; this.hp = this.maxHP; }
    if(atk){ this.atk += atk; }
    if(def){ this.def += def; }
    if(dex){ this.dex += dex; }
    if(luck){ this.luck += luck; }
    const spent = (hp + atk + def + dex + luck);
    this.pendingStatPoints = Math.max(0, this.pendingStatPoints - spent);
  }
  toJSON(){
    return {name:this.name,level:this.level,xp:this.xp,gold:this.gold,floor:this.floor,maxHP:this.maxHP,hp:this.hp,atk:this.atk,def:this.def,dex:this.dex,luck:this.luck,quests:this.quests,pendingStatPoints:this.pendingStatPoints,skillPoints:this.skillPoints,skills:this.skills,stash:this.stash,completedQuests:this.completedQuests,tokens:this.tokens,clearedBosses:this.clearedBosses,dungeonProgress:this.dungeonProgress,fieldProgress:this.fieldProgress};
  }
  fromJSON(o){ Object.assign(this,o); this.clearedBosses = o.clearedBosses || []; this.dungeonProgress = o.dungeonProgress || {}; this.fieldProgress = o.fieldProgress || {}; this.skills = o.skills || {}; this.skillPoints = o.skillPoints || 0; this.stash = o.stash || []; this.completedQuests = o.completedQuests || []; this.tokens = o.tokens || 0; }
}
