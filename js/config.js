// Global game configuration and data
const MAX_FLOORS = 100;
const SAVE_KEY = 'sao_text_demo_v1';

// First 10 floor definitions (unique themes, enemies, bosses, and quests)
const FLOOR_DEFS = {
  1: {
    name: 'Town of Beginnings', 
    theme: 'meadow', 
    dungeonRooms: 20, // The labyrinth consists of 20 floors
    description: 'The first floor of Aincrad is geographically the largest floor, almost completely circular with a diameter of ten kilometers. The great expanse includes diverse biomes: large plains and grasslands, low mountains, lakes of varying sizes, and deciduous forests that change with seasons.',
    settlements: {
      main: 'Town of Beginnings',
      subs: ['Horunka', 'Tolbana']
    },
    locations: [
      'Stone Valley - rivers and forests surrounded by low mountain ranges',
      'Plains - grasslands stretching from the Town of Beginnings walls',
      'Titan\'s Peak - summit of Mount Katen with grand floor views',
      'Monument to Grath - 20-foot statue celebrating the fall of the first labyrinth guardian'
    ],
    enemies: [
      {name:'Frenzy Boar',hpMul:0.8,atkMul:0.7,exp:8,gold:5,desc:'Common boar in the plains, bane of low-level players'},
      {name:'Little Nepent',hpMul:0.9,atkMul:0.6,exp:6,gold:4,desc:'Small plant-like creature found in forests'},
      {name:'Dire Wolf',hpMul:1.4,atkMul:1.1,exp:14,gold:10,desc:'Wolf-type monster prowling grasslands'},
      {name:'Ruin Kobold Sentinel',hpMul:1.6,atkMul:1.3,exp:18,gold:12,desc:'Kobold guard found in mountainous ruins'}
    ],
    fieldBoss: {
      name:'Grath the Swine God',
      hpMul:4,
      atk:8,
      def:2,
      exp:180,
      gold:120,
      desc:'The enormous boar that guarded the way to the floor boss. Legends say he roamed freely across the plains with a sounder of smaller boars obeying his will.'
    },
    boss: {
      id:'boss1',
      name:'Illfang the Kobold Lord',
      hpMul:12, // increased from 8
      atk:9, // increased from 6
      def:3, // increased from 2
      exp:300, // increased from 240
      gold:200, // increased from 150
      desc:'The first floor boss, a powerful Kobold Lord who guards the path to Floor 2. Defeated in the labyrinth boss room.'
    },
    quests: [
      {id:'f1q1',title:'Secret Medicine of the Forest',desc:'Find the secret medicine in the forest area of Stone Valley',type:'gather',target:1,reward:{xp:100,gold:60},isRepeatable:false},
      {id:'f1q2',title:'Hunt the Frenzy Boars',desc:'Defeat 10 Frenzy Boars in the plains',type:'kill',target:10,reward:{xp:120,gold:80},isRepeatable:true},
      {id:'f1q3',title:'Journey to Tolbana',desc:'Travel to Tolbana, the second largest town on Floor 1',type:'explore',target:1,reward:{xp:80,gold:50},isRepeatable:false}
    ]
  },
  2: {
    name: 'Urbus',
    theme: 'mountain',
    dungeonRooms: 15, // Spiral Mountain labyrinth with natural caverns and burrows
    description: 'The 2nd Floor of Aincrad is vast and mountainous, nearly ten kilometers in diameter. The majority of the mountains include lush plateaus, tablelands and mesas with countless rivers. Tall pine forests cover the mountains and define large valleys. The wilder areas are overrun by giant insects.',
    settlements: {
      main: 'Urbus',
      subs: ['Marome Village', 'Taran Village']
    },
    locations: [
      'Tablelands - large flatland areas atop high cliffs, arid and rocky with sparse vegetation',
      'Rough Mountains - chain of table-top mountains with rocky trails and small bandit camps',
      'High Fields of Crossing - peaceful mountaintop covered in flora, hosts the Flora Festival',
      'Crystal Cave - large cave with glowing crystals, inhabited by goblins and spiders',
      'Spiral Mountain - the labyrinth location, created by rolling giant armadillidiidae'
    ],
    npcs: [
      {name:'Rex',role:'Rusty Dagger Tavern Owner',desc:'NPC owner of a hangout for rogues and info brokers. Does not tolerate rough housing.'},
      {name:'Marome Guard Captain',role:'Fortress Commander',desc:'Guards the large stone fortress of Marome Village.'},
      {name:'Taran Sentinel',role:'Village Guard',desc:'Questions travelers before allowing entry to Taran.'}
    ],
    enemies: [
      {name:'Trembling Ox',hpMul:1.1,atkMul:0.9,exp:12,gold:8,desc:'Large ox found in the mountain valleys'},
      {name:'Wind Wasp',hpMul:0.9,atkMul:1.0,exp:10,gold:7,desc:'Giant wasp that patrols the pine forests'},
      {name:'Scarab Beetle',hpMul:1.3,atkMul:1.1,exp:15,gold:10,desc:'Giant insect common in wilder areas'},
      {name:'Mountain Goblin',hpMul:1.2,atkMul:1.2,exp:14,gold:9,desc:'Goblin inhabiting caves and mountain paths'},
      {name:'Tunnel Spider',hpMul:1.5,atkMul:1.3,exp:18,gold:12,desc:'Large spider found in Crystal Cave and labyrinth tunnels'},
      {name:'Roc Pillbug',hpMul:1.8,atkMul:1.4,exp:22,gold:15,desc:'Giant armadillidiidae that rolls down Spiral Mountain'},
      {name:'Bandit Rogue',hpMul:1.4,atkMul:1.5,exp:20,gold:18,desc:'NPC bandit found along isolated roads and mountain camps'}
    ],
    fieldBoss: {
      name:'Bullbous Bow',
      hpMul:5,
      atk:10,
      def:3,
      exp:280,
      gold:180,
      desc:'A giant bull monster that roams the tablelands. Extremely territorial and aggressive, with a devastating charge attack.'
    },
    boss: {
      id:'boss2',
      name:'Armadelon the Crusher',
      hpMul:18, // increased from 12
      atk:13, // increased from 9
      def:7, // increased from 5
      exp:550, // increased from 400
      gold:350, // increased from 250
      desc:'An insanely large armadillidiidae with near-impregnable defenses and crushing power. Created the spiral ruts of the mountain. NPCs fear "The Day of the Crusher" when it might destroy civilization. Has high DEF that must be overcome.'
    },
    labyrinthMechanic: {
      type: 'sound_based',
      desc: 'Mobs are attracted to sound and vibrations. Metal armor scraping or weapons clanging draws attention. Can be used for distractions.',
      crystalLighting: true,
      routes: ['Spiral slope with rolling hazards', 'Burrowing tunnels with dead ends']
    },
    quests: [
      {id:'f2q1',title:'Clear the Crystal Cave',desc:'Defeat 8 goblins or spiders in the Crystal Cave',type:'kill',target:8,reward:{xp:180,gold:120}},
      {id:'f2q2',title:'Mine Glowing Crystals',desc:'Collect 5 glowing crystals from the cave for lighting',type:'gather',target:5,reward:{xp:150,gold:100}},
      {id:'f2q3',title:'Bandit Suppression',desc:'Eliminate 6 bandit rogues from the mountain camps',type:'kill',target:6,reward:{xp:220,gold:140}},
      {id:'f2q4',title:'Scale Spiral Mountain',desc:'Reach the peak of Spiral Mountain (explore labyrinth entrance)',type:'explore',target:1,reward:{xp:200,gold:130}}
    ]
  },
  3: {
    name: 'Forest of Wavering Mist',
    theme: 'forest',
    dungeonRooms: 25, // The Dark Thicket labyrinth
    description: 'The 3rd Floor of Aincrad consists primarily of expansive plains and dense forests, laced together by long winding rivers. Nearly ten kilometers in diameter, most central areas are flat with occasional grassy knolls. High mountains ring the outer edge with unscalable slopes. Ancient deciduous forests transition to coniferous trees climbing into the mountains.',
    settlements: {
      main: 'Aruyt',
      subs: ['Town of Flora', 'Faerie']
    },
    locations: [
      'Aruyt - main settlement in the eastern forests, home to the Faune, built in the trees',
      'Town of Flora - homely village in southern plains, surrounded by colorful delilah fields',
      'Faerie - relocated Fae court hidden beyond the Gates of Fae, beautiful realm with Nightingbloom flowers',
      'Forest of Wavering Mist - ancient forest with perpetual mist, treacherous paths, and malevolent spirits',
      'Spider Queen\'s Nest - deepest reaches of the mist forest, covered in webs',
      'The Lake Below - shallow lake at base of Aruyt\'s trees, fed by all floor rivers',
      'Cavern of Faeries - dimly lit caverns beneath Faerie where captives are held',
      'The Dark Thicket - labyrinth made of thorned trees, former Fae homeland'
    ],
    npcs: [
      {name:'Faune Guard',role:'Aruyt Sentinel',desc:'Armed Faune wielding daggers and hunting bows, guarding bridges with heightened hearing'},
      {name:'Fae Trickster',role:'Cunning Deceiver',desc:'Beautiful but cruel Fae with mismatched eyes, masters of double-speak'},
      {name:'King Nyx',role:'Fae Monarch',desc:'Two-century-old ruler of the Fae, driven from Dark Thicket by Blightwood'},
      {name:'Flora Merchant',role:'Exile Trader',desc:'Faune or Fae exile living in Town of Flora, offers unique forest wares'}
    ],
    enemies: [
      {name:'Feral Wolf',hpMul:1.5,atkMul:1.3,exp:16,gold:11,desc:'Wolf prowling the plains and forest edges'},
      {name:'Mist Wraith',hpMul:1.8,atkMul:1.5,exp:20,gold:14,desc:'Spectral creature in the Forest of Wavering Mist'},
      {name:'Corrupted Treant',hpMul:2.2,atkMul:1.7,exp:24,gold:18,desc:'Tree monster twisted by dark magic'},
      {name:'Web Spinner',hpMul:1.6,atkMul:1.4,exp:18,gold:13,desc:'Giant spider near the Spider Queen\'s Nest'},
      {name:'Fae Sentinel',hpMul:2.0,atkMul:1.8,exp:26,gold:20,desc:'Fae patrol guarding the Dark Thicket'},
      {name:'Twisted Faune',hpMul:2.4,atkMul:2.0,exp:30,gold:22,desc:'Warped captive from Cavern of Faeries, abomination of magic'}
    ],
    fieldBoss: {
      name:'Spider Queen',
      hpMul:6,
      atk:12,
      def:4,
      exp:320,
      gold:200,
      desc:'A very large respawning spider mob at the center of the nest in Forest of Wavering Mist. When killed, an egg hatches and within an hour a new Spider Queen grows to full size.'
    },
    boss: {
      id:'boss3',
      name:'Blightwood the Maverick',
      hpMul:20, // increased from 14
      atk:14, // increased from 10
      def:7, // increased from 5
      exp:650, // increased from 480
      gold:420, // increased from 300
      desc:'A thousand-year-old treant awakened by Fae blood magic. Drove King Nyx from the Dark Thicket and crushed all who remained. Guards the boss room in the former Fae castle at the labyrinth center.'
    },
    labyrinthMechanic: {
      type: 'illusion_maze',
      desc: 'The Dark Thicket is a maze of thorned trees. Fae magic creates illusions that confuse and misdirect adventurers into ambushes. Dead grass ceiling blocks most sunlight. Temperature drops near center.',
      magicTraps: true,
      routes: ['Winding paths that lead to dead ends', 'Fae-guarded passages', 'Illusion-filled corridors']
    },
    quests: [
      {id:'f3q1',title:'Captured',desc:'Rescue 5 Faune captives from the Cavern of Faeries',type:'escort',target:5,reward:{xp:280,gold:180}},
      {id:'f3q2',title:'Search For The Hoya',desc:'Find the legendary Hoya flower deep in the Forest of Wavering Mist',type:'gather',target:1,reward:{xp:240,gold:150}},
      {id:'f3q3',title:'Lost Blessings & Ancient Evils',desc:'Investigate the pact between Fae and forest spirits',type:'explore',target:1,reward:{xp:300,gold:200}},
      {id:'f3q4',title:'Spider Extermination',desc:'Clear 8 Web Spinners from the Spider Queen\'s Nest area',type:'kill',target:8,reward:{xp:220,gold:140}},
      {id:'f3q5',title:'Faune Relations',desc:'Earn trust of Aruyt guards by helping the Faune',type:'explore',target:1,reward:{xp:200,gold:120}}
    ]
  },
  4: {
    name:'Sunken Marsh', theme:'swamp', dungeonRooms:5,
    enemies:[{name:'Swamp Leech',hpMul:1.6,atkMul:1.4,exp:18,gold:12},{name:'Bog Troll',hpMul:2.4,atkMul:1.8,exp:30,gold:22}],
    boss:{id:'boss4',name:'Marsh Colossus',hpMul:18,atk:13,def:6,exp:680,gold:450}, // increased from hpMul:12, atk:9, def:4
    quests:[{id:'f4q1',title:'Clear the Bog',desc:'Defeat 6 swamp creatures on Floor 4',type:'kill',target:6,reward:{xp:260,gold:180}}]
  },
  5: {
    name:'Scarlet Dunes', theme:'desert', dungeonRooms:6,
    enemies:[{name:'Sand Serpent',hpMul:1.8,atkMul:1.6,exp:22,gold:16},{name:'Dune Raider',hpMul:2.2,atkMul:1.8,exp:28,gold:20}],
    boss:{id:'boss5',name:'Scourge of Dunes',hpMul:22,atk:16,def:8,exp:900,gold:600}, // increased from hpMul:14, atk:11, def:5
    quests:[{id:'f5q1',title:'Find the Oasis Relic',desc:'Recover the Oasis Relic from the dunes (1)',type:'gather',target:1,reward:{xp:320,gold:240}}]
  },
  6: {name:'Frost Reach',theme:'ice',dungeonRooms:6,
    enemies:[{name:'Frostling',hpMul:2.0,atkMul:1.8,exp:30,gold:20},{name:'Ice Wolf',hpMul:2.6,atkMul:2.0,exp:36,gold:26}],
    boss:{id:'boss6',name:'Glacier Wyrm',hpMul:26,atk:19,def:9,exp:1200,gold:800}, // increased from hpMul:16, atk:13, def:6
    quests:[{id:'f6q1',title:'Hunt the Ice Wolves',desc:'Defeat 5 Ice Wolves on Floor 6',type:'kill',target:5,reward:{xp:380,gold:260}}]
  },
  7: {name:'Sky Terrace',theme:'sky',dungeonRooms:4,
    enemies:[{name:'Gale Sprite',hpMul:1.6,atkMul:1.6,exp:26,gold:18},{name:'Storm Drake',hpMul:3.0,atkMul:2.6,exp:48,gold:40}],
    boss:{id:'boss7',name:'Tempest Drake',hpMul:30,atk:22,def:10,exp:1400,gold:1000}, // increased from hpMul:18, atk:15, def:7
    quests:[{id:'f7q1',title:'Calm the Winds',desc:'Defeat 3 Storm Drakes patrolling the terrace',type:'kill',target:3,reward:{xp:420,gold:320}}]
  },
  8: {name:'Ember Hollow',theme:'volcano',dungeonRooms:7,
    enemies:[{name:'Lava Imp',hpMul:2.2,atkMul:2.0,exp:34,gold:24},{name:'Magma Hound',hpMul:3.2,atkMul:2.8,exp:54,gold:44}],
    boss:{id:'boss8',name:'Flame Sovereign',hpMul:35,atk:26,def:12,exp:1800,gold:1300}, // increased from hpMul:20, atk:18, def:8
    quests:[{id:'f8q1',title:'Quench the Flame',desc:'Gather 4 Cooling Stones from Ember Hollow',type:'gather',target:4,reward:{xp:520,gold:360}}]
  },
  9: {name:'Abyssal Reach',theme:'abyss',dungeonRooms:8,
    enemies:[{name:'Abyss Crawler',hpMul:2.8,atkMul:2.4,exp:44,gold:32},{name:'Void Wraith',hpMul:3.8,atkMul:3.0,exp:64,gold:50}],
    boss:{id:'boss9',name:'Abyssal Sovereign',hpMul:42,atk:30,def:14,exp:2400,gold:1800}, // increased from hpMul:24, atk:20, def:10
    quests:[{id:'f9q1',title:'Purge the Depths',desc:'Defeat 7 Abyssal creatures on Floor 9',type:'kill',target:7,reward:{xp:720,gold:520}}]
  },
  10: {name:'Crystal Palace',theme:'crystal',dungeonRooms:10,
    enemies:[{name:'Shardling',hpMul:3.0,atkMul:2.8,exp:56,gold:44},{name:'Prism Knight',hpMul:4.2,atkMul:3.6,exp:88,gold:72}],
    boss:{id:'boss10',name:'Crystal Matriarch',hpMul:50,atk:36,def:16,exp:3200,gold:2600}, // increased from hpMul:30, atk:24, def:12
    quests:[{id:'f10q1',title:'Claim the Crystal Heart',desc:'Obtain the Crystal Heart from the palace (1)',type:'gather',target:1,reward:{xp:1200,gold:900}}]
  }
};

// Skill definitions
const SKILLS = {
  vertical_arc: {id:'vertical_arc',name:'Vertical Arc',type:'active',desc:'A heavy strike that deals 1.5x ATK damage. Cooldown: 2',cost:0,cooldown:2,spCost:10},
  quick_heal: {id:'quick_heal',name:'Quick Heal',type:'active',desc:'Restore a portion of max HP. Cooldown:3',cost:0,cooldown:3,spCost:12},
  stance_change: {id:'stance_change',name:'Stance Change',type:'active',desc:'Adopt a guarded stance: reduce damage taken for 2 turns. Cooldown:4',cost:0,cooldown:4,spCost:8},
  burst_strike: {id:'burst_strike',name:'Burst Strike',type:'active',desc:'Deal 2x damage but suffer Weakened (take more damage) for 1 turn. Cooldown:4',cost:0,cooldown:4,spCost:15},
  battle_focus: {id:'battle_focus',name:'Battle Focus',type:'passive',desc:'Small chance to critically strike more often.',cost:1},
  survival_instinct: {id:'survival_instinct',name:'Survival Instinct',type:'passive',desc:'Increase max HP on level up.',cost:1}
};
