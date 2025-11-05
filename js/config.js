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
    name: 'Aruyt',
    theme: 'forest',
    dungeonRooms: 25, // The Dark Thicket labyrinth
    description: 'The 3rd Floor consists of expansive plains and dense ancient forests laced by winding rivers. Nearly ten kilometers in diameter with flat central areas dotted by grassy knolls. High mountains with unscalable slopes ring the outer edge. Deciduous forests dominate, transitioning to conifers near mountains. Dozens of streams pool into a large central lake.',
    settlements: {
      main: 'Aruyt',
      subs: ['Town of Flora', 'Faerie']
    },
    locations: [
      'Aruyt - Faune tree-city in eastern forests, accessed by two bridge-trunk entrances with armed guards',
      'Town of Flora - medieval village in southern plains surrounded by colorful delilah fields, home to exiled Faune and Fae',
      'Faerie - relocated Fae court hidden beyond Gates of Fae, shimmers with Nightingbloom flowers at night',
      'Forest of Wavering Mist - ancient forest with perpetual cold mist, treacherous shifting paths, Fae tricksters',
      'Spider Queen\'s Nest - deepest mist forest covered in barely-visible webs with respawning boss',
      'The Lake Below - shallow lagoon at base of Aruyt trees where rivers pool, abundant fishing materials',
      'Cavern of Faeries - dimly lit prison beneath Faerie holding twisted Faune captives',
      'The Dark Thicket - thorn-tree labyrinth, former Fae homeland abandoned after Blightwood summoning'
    ],
    npcs: [
      {name:'Faune Sentinel',role:'Aruyt Bridge Guard',desc:'Rabbit-eared hunter with heightened senses, wields daggers and hunting bow, detects uninvited forest guests'},
      {name:'Fae Deceiver',role:'Cunning Trickster',desc:'Beautiful creature with mismatched eyes (one bright, one dark), masters of double-speak who cannot lie but excel at deception'},
      {name:'King Nyx',role:'Fae Monarch',desc:'Two-century-old ruler, driven from Dark Thicket by Blightwood, maintains court in Faerie while concealing his shame'},
      {name:'Flora Exile',role:'Peaceful Trader',desc:'Faune or Fae outcast living harmoniously in Town of Flora, shunned by kin but content in peace'}
    ],
    enemies: [
      {name:'Roaring Wolf',hpMul:1.4,atkMul:1.2,exp:16,gold:11,desc:'Medium yellow wolf hunting in packs, howls for reinforcements at half health'},
      {name:'Thicket Spider',hpMul:1.6,atkMul:1.4,exp:18,gold:13,desc:'Arachnid ambushing from trees with venomous fangs'},
      {name:'Mountain Lion',hpMul:1.8,atkMul:1.5,exp:20,gold:14,desc:'Feline predator hiding near outer mountains, waiting for prey'},
      {name:'Hostile Fae',hpMul:2.0,atkMul:1.8,exp:26,gold:20,desc:'Brilliant, quick Fae wielding slender blades and dark magic'},
      {name:'Twisted Faune',hpMul:2.4,atkMul:2.0,exp:30,gold:22,desc:'Hideous creature warped by dark magic, uses claws to rip through opponents'}
    ],
    fieldBoss: {
      name:'Yeff, The Darkest Elf',
      hpMul:5.5,
      atk:11,
      def:3,
      exp:320,
      gold:200,
      desc:'Dishonored elf cursed with darkness for shadow meddling, left behind by his fleeing tribe. Moves swiftly with great precision but poor vitality. May attack lowest-hate target unpredictably.'
    },
    boss: {
      id:'boss3',
      name:'Blightwood the Maverick',
      hpMul:20,
      atk:14,
      def:7,
      exp:650,
      gold:420,
      desc:'Thousand-year-old treant awakened by Fae blood magic. Refused to be their puppet, drove Nyx from Dark Thicket and crushed all who remained. Guards the boss room in former Fae castle at labyrinth center.'
    },
    labyrinthMechanic: {
      type: 'illusion_maze',
      desc: 'The Dark Thicket: thorned-tree maze with dead grass ceiling blocking sunlight. Fae magic creates winding illusions and false paths. Temperature drops near center. Fae patrols capture wanderers for Cavern repurposing.',
      magicTraps: true,
      routes: ['Maze of thorned walls', 'Illusory passages', 'Fae ambush zones']
    },
    quests: [
      {id:'f3q1',title:'Captured',desc:'Rescue 5 Faune captives from the Cavern of Faeries',type:'escort',target:5,reward:{xp:280,gold:180}},
      {id:'f3q2',title:'Search For The Hoya',desc:'Find the legendary Hoya flower deep in the Forest of Wavering Mist',type:'gather',target:1,reward:{xp:240,gold:150}},
      {id:'f3q3',title:'Lost Blessings & Ancient Evils',desc:'Investigate the ancient pact between Fae and forest spirits',type:'explore',target:1,reward:{xp:300,gold:200}},
      {id:'f3q4',title:'Web Weaver Hunt',desc:'Clear 8 Thicket Spiders from Spider Queen\'s Nest area',type:'kill',target:8,reward:{xp:220,gold:140}},
      {id:'f3q5',title:'Earn Faune Trust',desc:'Aid the Faune to gain entry to Aruyt\'s inner sanctums',type:'explore',target:1,reward:{xp:200,gold:120}}
    ]
  },
  4: {
    name:'Snowfrost',
    theme:'snow',
    dungeonRooms:18, // Mountain labyrinth with eternal magical blizzard
    description:'The 4th Floor is entirely snow-covered with massive evergreens stretching 60-80 feet tall. Rolling hills and flatlands mix with rugged snow-covered peaks. Small frozen rivers and lakes dot the valleys. Cloud cover is near-constant with frequent blizzards. The infinite winter forces reliance on hunting and logging.',
    settlements: {
      main:'Snowfrost',
      subs:['Starglades']
    },
    locations:[
      'Snowfrost - cozy eastern village with skating on frozen stream, constant snowfall, famed for Frosty\'s Cafe hot chocolate and ice cream',
      'Frostbite Lake - northwest of Snowfrost between two mountains, 100m long/75m wide, popular for ice fishing and skating despite rumors of treasure beneath ice',
      'Winter Wood - snowy forest covering most of floor, home to many animals and monsters',
      'The Starglades - unguarded safe zone 200m north of Snowfrost, glade offering fantastic night sky views',
      'Glacial Cove - fluorescent blue ice cave glowing day and night, home to elite monsters and lost treasures'
    ],
    npcs:[
      {name:'Snowfrost Guard',role:'Master Huntsman',desc:'Expert tracker and defender, not easily dismissed if challenged'},
      {name:'Child NPC',role:'Ice Skater',desc:'Playful child skating on frozen stream, warns of Snowmaw legend'},
      {name:'Frosty',role:'Cafe Owner',desc:'Cheerful proprietor of famous hot chocolate and ice cream shop'}
    ],
    enemies:[
      {name:'Ice Wolf',hpMul:1.7,atkMul:1.5,exp:20,gold:14,desc:'White-pelted wolf hunting in small groups with ambush tactics, some can freeze opponents'},
      {name:'Great Bear',hpMul:2.2,atkMul:1.8,exp:28,gold:20,desc:'Large bear emerging from dens to hunt fish, extremely dangerous when encountered'},
      {name:'Rabid Moose',hpMul:1.9,atkMul:1.6,exp:24,gold:16,desc:'Strange creature charging in and fleeing randomly, can escape on low LD rolls'},
      {name:'Ice Drake',hpMul:2.4,atkMul:2.0,exp:32,gold:24,desc:'Young scaled reptile with sharp talons and icy breath, hard protective scales'},
      {name:'Ice Elemental',hpMul:2.6,atkMul:2.2,exp:36,gold:28,desc:'Floating ice orb pelting enemies with chunks, immune to freeze, vulnerable to burn'},
      {name:'Frost Troll',hpMul:3.0,atkMul:2.4,exp:42,gold:32,desc:'Large primal beast with extreme strength but lacking speed and intelligence'}
    ],
    fieldBoss:{
      name:'Avalanche',
      hpMul:6.5,
      atk:13,
      def:5,
      exp:420,
      gold:260,
      desc:'15-foot tall ice elemental appearing during heavy snowstorms. Slow but extremely powerful, constructed entirely of ice. Takes no burn damage but loses MIT when burned (stacks 3x). Sweeping shard attack hits all players.'
    },
    boss:{
      id:'boss4',
      name:'Snowmaw the Carnivorous',
      hpMul:22,
      atk:16,
      def:8,
      exp:820,
      gold:520,
      desc:'Legendary massive white-furred beast standing over 10 feet tall, walking on two legs with titan strength. Its mouth is large enough to eat a human whole. Parents tell children only warm fires and obedience can protect from it.'
    },
    labyrinthMechanic:{
      type:'magical_blizzard',
      desc:'Mountain labyrinth is single large cavern with eternal magical blizzard limiting visibility. Crosswinds disorient and threaten footing. Five tall granite obelisks at equidistant points can be climbed for vantage. Frost Troll minions wander seeking victims.',
      environmentalHazard:true,
      routes:['Blizzard-obscured central chamber','Climbable obelisks for navigation','Frost Troll patrol zones']
    },
    quests:[
      {id:'f4q1',title:'The Night\'s King Trilogy',desc:'Investigate the ancient legend of the Night\'s King',type:'explore',target:1,reward:{xp:320,gold:220}},
      {id:'f4q2',title:'Absolute Zero',desc:'Defeat 6 Ice Elementals in Glacial Cove',type:'kill',target:6,reward:{xp:360,gold:240}},
      {id:'f4q3',title:'True Family',desc:'Help reunite separated families in the harsh winter',type:'escort',target:3,reward:{xp:280,gold:180}},
      {id:'f4q4',title:'Frostbite Fishing',desc:'Gather 5 rare ice fish from Frostbite Lake',type:'gather',target:5,reward:{xp:240,gold:160}}
    ]
  },
  5: {
    name:'Fortaleza',
    theme:'desert',
    dungeonRooms:20, // Underground labyrinth beneath blistering sands
    description:'The 5th Floor consists almost entirely of deserts and barren sandy wastelands with sparse settlement. Spiked rock formations and rubble litter the landscape. Scrub brush and cactuses survive the extreme heat. Sandstorms frequently rage. Few caves provide shelter but often harbor wildlife and monsters.',
    settlements:{
      main:'Fortaleza',
      subs:['Saharda','Clycama']
    },
    locations:[
      'Fortaleza - one of few settlements, surrounded by sandstone walls against storms, temporary cloth structures and permanent sandstone buildings',
      'Saharda - town built around rare oasis, no defenses, constantly raided by bandits',
      'Clycama - remote northern outpost at edge of Aincrad, built where water trickles over world\'s edge, crumbling state of disrepair',
      'The Firefly Oasis - west of Fortaleza with crystal clear water, fireflies gather at evening creating magnificent glow',
      'The Calmest Badlands - depressed flatlands with crystalline formations, desiccated winds drain moisture',
      'El Paso del Diablo - winding canyon path linking Fortaleza to Saharda, perfect for ambushes',
      'El Perdido - vast wasteland west of Fortaleza where foul creatures live under sands'
    ],
    npcs:[
      {name:'Fortaleza Guard',role:'Wall Sentinel',desc:'Bribe-accepting guard patrolling sandstone walls, overlooks rules for coin'},
      {name:'True People Cultist',role:'Scorpion Worshipper',desc:'Secret worshipper of Chardark with hidden scorpion wrist tattoo, master of deceit and thievery'},
      {name:'Desert Bandit',role:'Raider',desc:'Desperate thief turned to banditry for survival in harsh wasteland'},
      {name:'Saharda Merchant',role:'Oasis Trader',desc:'Trader at vulnerable oasis town, deals in water and survival goods'}
    ],
    enemies:[
      {name:'Saltworm',hpMul:2.0,atkMul:1.7,exp:24,gold:16,desc:'Large sand-colored worm encrusted in blinding white salt, no vision but rows of dagger teeth'},
      {name:'Violent Armadillo',hpMul:2.2,atkMul:1.8,exp:28,gold:20,desc:'Larger than average with taste for blood, armored plates make efficient attacks difficult'},
      {name:'Sand Hyena',hpMul:1.8,atkMul:1.6,exp:22,gold:16,desc:'Pack hunter with sand-camouflaging fur, thrives in harshest conditions'},
      {name:'Giant Rattlesnake',hpMul:2.4,atkMul:2.0,exp:32,gold:24,desc:'Abnormally large serpent stretching fifteen feet long'},
      {name:'Rock Golem',hpMul:2.8,atkMul:2.2,exp:38,gold:28,desc:'Being made of rocks hiding in sand to fool travelers'},
      {name:'Giant Scorpion',hpMul:3.0,atkMul:2.4,exp:42,gold:32,desc:'Adult-sized scorpion burying beneath sand with abnormally large stinger'}
    ],
    fieldBoss:{
      name:'Sand Shark',
      hpMul:7,
      atk:15,
      def:4,
      exp:480,
      gold:300,
      desc:'Ancient sightless shark swimming through sand using perfected hearing and smell. Missing attacks causes bad footing dealing bonus damage. Sharp jaws reduce MIT. Advised to remain still when encountered.'
    },
    boss:{
      id:'boss5',
      name:'Chardark the Scorpion King',
      hpMul:24,
      atk:18,
      def:9,
      exp:1100,
      gold:720,
      desc:'Floor boss hidden beneath desert sands. Thrives in pure darkness and intense heat with impenetrable armor and steel-snapping pincers. Lures victims with treasures from The True People. Fed on greed and avarice before defeat.'
    },
    labyrinthMechanic:{
      type:'underground_darkness',
      desc:'Labyrinth lies beneath sands with hard sandstone floors/walls. Bare rooms except for monsters. Advances downward, deeper beneath desert. Stale, oppressively hot air. Unlit throughout making exploration treacherous. Sand pits swallow players to next level; wrong pits lead to mob-filled nests.',
      levels:5,
      routes:['Descending sand pits','Trap-filled mob rooms','Concealed stair climbs back up']
    },
    quests:[
      {id:'f5q1',title:'Arabian Nights: The First Of Many',desc:'Begin epic quest series in the scorching desert',type:'explore',target:1,reward:{xp:380,gold:260}},
      {id:'f5q2',title:'Butcher In The Sands',desc:'Hunt down the notorious desert butcher bandit leader',type:'kill',target:1,reward:{xp:420,gold:280}},
      {id:'f5q3',title:'Bloodstained Land',desc:'Investigate the bloody history of El Perdido wasteland',type:'explore',target:1,reward:{xp:360,gold:240}},
      {id:'f5q4',title:'The Traveler',desc:'Escort a merchant through El Paso del Diablo safely',type:'escort',target:1,reward:{xp:400,gold:260}},
      {id:'f5q5',title:'Of Greed And Avarice',desc:'Uncover secrets of The True People and Chardark worship',type:'explore',target:1,reward:{xp:440,gold:300}}
    ]
  },
  6: {
    name:'Krycim',
    theme:'jungle',
    dungeonRooms:22, // Plant-based labyrinth with grasping vines
    description:'The 6th Floor is a massive jungle with impossibly large trees dwarfing redwoods. Hills and mountains feature thousands of waterfalls cascading into deep gorges. Vegetation creates labyrinth of nature with countless kudzu-covered ruins. Perfect habitat for predators and plant-based monsters.',
    settlements:{
      main:'Krycim',
      subs:['Senimoh']
    },
    locations:[
      'Krycim - western village of ~100 Amazonian women next to large waterfall, handcrafted reed structures on bamboo frames',
      'Senimoh - eastern male Amazon village next to swamp for catching alligators, wood houses, heavy meat diet',
      'Jungle Expanse - rich green foliage with thick tree patterns, diseased areas to east, wildlife migration to west',
      'Ruins of Tsjericanth - massive eroded clay/stone ruins with columns telling snake beast story',
      'Waterfall of the Sage - eastern great waterfall with warm glow, meditation site where players become immortal objects'
    ],
    npcs:[
      {name:'Amazon Huntress',role:'Krycim Warrior',desc:'Skilled female hunter trained in jungle survival, cautious of male players outside ritual season'},
      {name:'Amazon Hunter',role:'Senimoh Warrior',desc:'Male hunter wearing crocodile skin, skilled with wooden spears and sharpened rocks'},
      {name:'Ritual Elder',role:'Ceremony Keeper',desc:'Oversees annual Ritual of Procreation where 20 young men journey from Senimoh'}
    ],
    enemies:[
      {name:'Man-Eating Plant',hpMul:2.2,atkMul:1.9,exp:30,gold:22,desc:'Extremely large Venus Fly Trap capturing and digesting opponents with damage over time'},
      {name:'Killer Vine',hpMul:2.4,atkMul:2.0,exp:34,gold:26,desc:'Giant flower using long whip-like vines to strangle victims, difficult to pierce'},
      {name:'Jungle Predator',hpMul:2.6,atkMul:2.2,exp:38,gold:28,desc:'Tigers, leopards, alligators - diseased ones far more aggressive with no self-preservation'},
      {name:'Diseased Hunter',hpMul:2.8,atkMul:2.4,exp:42,gold:32,desc:'Maddened Krycim resident from diseased plants, fights tooth and nail retaining weapon skills'},
      {name:'Spirit of Tsjericanth',hpMul:3.0,atkMul:2.6,exp:46,gold:36,desc:'Fallen inhabitant seeking revenge on humans, ethereal matter reforms after defeat'},
      {name:'Shadow of the Once',hpMul:3.4,atkMul:2.8,exp:52,gold:40,desc:'Physical manifestation of inner demons, driven by darkness and hate, can\'t be reasoned with'}
    ],
    fieldBoss:{
      name:'Byakko',
      hpMul:8,
      atk:17,
      def:5,
      exp:560,
      gold:360,
      desc:'Tiger of flame and smoke prowling the floor, source of most wildfires. Draws power from infernos. Hitting with Frostbite/Freeze removes BURN and ACC. Frantic attacks can strike twice. Wildfire ability hits all for unmitigatable damage and burn unless stunned.'
    },
    boss:{
      id:'boss6',
      name:'Oro the Blight',
      hpMul:26,
      atk:20,
      def:10,
      exp:1400,
      gold:920,
      desc:'Terrible foliage-based monstrosity spreading disease transforming plants to cause mental affliction. Animals became rabid, humans succumbed to madness. Many infected plants still linger despite Oro\'s destruction, causing sickness and nausea for hours or days.'
    },
    labyrinthMechanic:{
      type:'living_plant_maze',
      desc:'Southern floor labyrinth: impenetrable tree-wall with difficult-to-reach gap entry. Vines snatch players by legs upon entry, dragging them randomly throughout. Grove of dead trees at center holds boss chamber doors. Monsters stronger feeding on rich soil and abundant sunlight. Killer vines with thorns, man-eating plants with serrated teeth, grasping greenery everywhere.',
      randomSpawns:true,
      routes:['Vine-dragged random entry points','Dead tree grove center','Constricting plant corridors']
    },
    quests:[
      {id:'f6q1',title:'The Gemini',desc:'Face your mirror self in trial of duality',type:'explore',target:1,reward:{xp:460,gold:320}},
      {id:'f6q2',title:'Calming The Soul',desc:'Meditate at Waterfall of the Sage to quell inner darkness',type:'explore',target:1,reward:{xp:420,gold:280}},
      {id:'f6q3',title:'Plagues & Decay',desc:'Investigate lingering blight infection in jungle plants',type:'explore',target:1,reward:{xp:500,gold:340}},
      {id:'f6q4',title:'Amazon Alliance',desc:'Earn respect of both Krycim and Senimoh villages',type:'explore',target:1,reward:{xp:440,gold:300}},
      {id:'f6q5',title:'Ruins Expedition',desc:'Explore Tsjericanth ruins and battle 8 Spirits',type:'kill',target:8,reward:{xp:480,gold:320}}
    ]
  },
  7: {
    name:'Nimbus',
    theme:'mountain',
    dungeonRooms:24, // Mountain interior with elemental lizardmen
    description:'The 7th Floor consists of rocky mountainous terrain with several high peaks. Coarse hardy grasses grow in thin soil patches with rocky outcroppings. Dynamic topography with near-sheer angles creating massive cliffs. Higher peaks covered in snow. Lower slopes host small hamlets. Aggressive elemental lizardmen tribes ambush players and NPCs.',
    settlements:{
      main:'Nimbus',
      subs:['Deepedge']
    },
    locations:[
      'Nimbus - massive stone fortress inside hollowed mountain, heavily guarded safe haven from lizardmen. Green Lumen crystals provide light and ward off monsters',
      'Deepedge - largest village outside Nimbus, built on steep mountainside gorge edge with precarious positioning',
      'Rocky Plains - grassland valleys with rolling hills, beautiful sun or torrential storms with Storm Lizardmen attacks',
      'Mountain Ranges - several dominating peaks with caves, dungeons, frost-lizardmen lairs',
      'The Eye - highest point where griffin appears at noon offering egg rewards',
      'Temple of Three - Japanese-style temple with three statues: Chansi, Dharma, destroyed Vinaya. Elderly deaf Keeper'
    ],
    npcs:[
      {name:'Nimbus Guard',role:'Stone City Sentinel',desc:'Heavily armed militia member keeping crime minimal in mountain fortress'},
      {name:'Lumen Miner',role:'Crystal Harvester',desc:'Extracts green Lumen crystals essential for light and lizardmen deterrence'},
      {name:'Deepedge Villager',role:'Mountainside Resident',desc:'Hardy soul living on precarious cliff edge, constantly wary of lizardmen raids'},
      {name:'Temple Keeper',role:'Deaf Caretaker',desc:'Elderly silent man guarding Temple of Three, offers quest for statue restoration'}
    ],
    enemies:[
      {name:'Rock-Lizardman',hpMul:2.6,atkMul:2.2,exp:38,gold:28,desc:'Grey-scaled humanoid reptile hiding in grass/rubble with hammers/clubs, MIT equals half damage, fears Lumen crystals'},
      {name:'Frost-Lizardman',hpMul:2.8,atkMul:2.4,exp:42,gold:32,desc:'White-scaled peak dweller blending with snow, always has Freeze/Frostbite, immune to both, double damage from Burn'},
      {name:'Fire-Lizardman',hpMul:3.0,atkMul:2.6,exp:46,gold:36,desc:'Crimson-scaled plains dweller lacking camouflage but superior fighter, always carries Burn, benefits from Fireproof, double damage from Freeze'},
      {name:'Storm-Lizardman',hpMul:3.2,atkMul:2.8,exp:50,gold:40,desc:'Light blue winged reptile appearing in storms with spears/javelins/whips, attacks from air, minimum EVA 1, paralytic immunity'},
      {name:'Golemite',hpMul:3.6,atkMul:3.0,exp:56,gold:44,desc:'Rock creature indiscernible from ground, slow but durable with high damage/MIT, can\'t dodge (perfect accuracy), +50 MIT vs most weapons except hammers/warhammers/martial arts'}
    ],
    fieldBoss:{
      name:'Avian Avenger',
      hpMul:9,
      atk:19,
      def:6,
      exp:640,
      gold:420,
      desc:'Large predatory bird atop highest mountain, only appears when sun is highest. Protects indestructible golden egg that disappears when boss dies. Twister ability stuns lowest MIT player. King of Sky gives -1 ACC to two-handed weapons.'
    },
    boss:{
      id:'boss7',
      name:'Antharas the Unearthed',
      hpMul:30,
      atk:23,
      def:11,
      exp:1800,
      gold:1200,
      desc:'The Great Beast that carved Nimbus mountain as sanctuary for hundreds before slumbering. Awakening caused massive earthquakes threatening settlement. Despite worship offerings, cared nothing for residents. Would have destroyed them all if players hadn\'t intervened.'
    },
    labyrinthMechanic:{
      type:'elemental_tri_path',
      desc:'Floor seven labyrinth inside peak where Antharas slumbered. Mountain somehow remains intact. Enter from flat mountaintop with scattered stone pillars. Three elemental areas: West=cold/slippery (-2 EVA/ACC, freeze danger), Center=electric crystals (paralysis danger), East=magma pools (reduced damage/MIT, burn danger). Each path requires 3 out-of-combat posts and 4 monster fights. All converge at base outside boss room with immense T-Rex skeleton.',
      triPath:true,
      routes:['Western frost zone','Central electric zone','Eastern magma zone']
    },
    quests:[
      {id:'f7q1',title:'Case Of Wurms',desc:'Investigate strange wurm sightings in mountain caves',type:'explore',target:1,reward:{xp:520,gold:360}},
      {id:'f7q2',title:'Unfinished Business',desc:'Help spirits with regrets find peace',type:'explore',target:1,reward:{xp:480,gold:320}},
      {id:'f7q3',title:'The King & The Conquerer',desc:'Learn truth of Antharas and Nimbus\' founding',type:'explore',target:1,reward:{xp:580,gold:400}},
      {id:'f7q4',title:'Lumen Harvest',desc:'Mine 10 green Lumen crystals for Nimbus defenders',type:'gather',target:10,reward:{xp:460,gold:300}},
      {id:'f7q5',title:'Lizardmen Purge',desc:'Defeat 10 elemental lizardmen of any type',type:'kill',target:10,reward:{xp:540,gold:360}}
    ]
  },
  8: {
    name:'Ellesmera',
    theme:'forest',
    dungeonRooms:26, // Labyrinth of fire and ash with cursed monsters
    description:'The 8th Floor is covered with vast forest of massive 60-80 foot tall trees creating hall of wooden columns reaching to dense canopy. Mostly deciduous with conifers near edges. Forest floor varies from bare soil to fern/moss carpets. Perpetual late spring/early summer. Rain only falls at night. Rare glades treated as sacred by residents.',
    settlements:{
      main:'Ellesmera',
      subs:['Baobab','Florenthia']
    },
    locations:[
      'Ellesmera - elven city at base of Great Tree overlooking magnificent waterfall, sculptural architecture appearing grown not built, protected by tree-knitted palisade',
      'Baobab - holy glade near eastern edge, safe zone, treant king stands at center waiting to return to Great Tree',
      'Florenthia - refuge village for those escaping forest war, elves and treants living harmoniously despite being exiled',
      'Forest of the Great Tree - entire floor seeded from single sprout, connected woodlands with abundant strengthened wildlife',
      'No Man\'s Land - devastated 300x100ft charred area halfway between Ellesmera and Baobab where flames never die',
      'Graveyard of the Willowed - sepulcher north of Ellesmera where elven warrior ashes are spread, willow trees and memorial stones'
    ],
    npcs:[
      {name:'Queen Haela',role:'Elven Monarch',desc:'Nearly millennium-old queen ruling from palatial residence opposite Great Tree, weary from war losses'},
      {name:'Treant King',role:'Ancient Guardian',desc:'Largest treant standing in Baobab center, waiting to reclaim Great Tree from elves'},
      {name:'Elven Hunter',role:'Forest Ranger',desc:'Ageless elegant elf, master of archery and magic, takes every life loss seriously'},
      {name:'Exile Resident',role:'Florenthia Pariah',desc:'Elf or treant living in harmony, shunned by kin but content in peace'}
    ],
    enemies:[
      {name:'Great Tailed Deer',hpMul:3.0,atkMul:2.6,exp:48,gold:38,desc:'Proud creature with curved antlers, long soft fluffy tail, provides meat and fur for elves'},
      {name:'Great Bear',hpMul:3.4,atkMul:2.9,exp:54,gold:42,desc:'8-foot tall solitary beast with razor-sharp claws, attacks threats, deafening roar, surprisingly quick climber'},
      {name:'Firefox',hpMul:2.8,atkMul:2.5,exp:44,gold:34,desc:'Fox spirit with fire magic breath, elven creation to attack treants, deadly burn but fragile'},
      {name:'Blazing Treant',hpMul:3.8,atkMul:3.2,exp:60,gold:48,desc:'Treant set alight losing all reason, attacks anything elf-like, vicious with Burn enhancement but less durable'},
      {name:'Rogue Elf',hpMul:3.2,atkMul:2.8,exp:52,gold:40,desc:'Extremist elf believing players threaten Great Tree, operates solo or in cells attacking players'}
    ],
    fieldBoss:{
      name:'The Ashen One',
      hpMul:10,
      atk:21,
      def:6,
      exp:720,
      gold:480,
      desc:'Ancient intelligent forest deity that created Baobab foundation. Became volatile after accidental fire, extremely aggressive to players but leaves villages alone. Smokescreen blinds on crit, major AoE damage if not cleared. Weakness to TOXIC VENOM drops stats significantly.'
    },
    boss:{
      id:'boss8',
      name:'Kro the Ruined',
      hpMul:35,
      atk:26,
      def:12,
      exp:2200,
      gold:1500,
      desc:'Malevolent creature of wood and fire, vile pestilence consuming everything touched. Over 10 feet tall, victims set alight by accursed flames and driven to madness. Elves blame treants\' magic draw, treants blame elven fire magic. Feud continues despite Kro\'s death.'
    },
    labyrinthMechanic:{
      type:'scorched_poisonous',
      desc:'Labyrinth similar to No Man\'s Land: scorched trees, still-burning, poisonous smoke blanketing area. Paths through burning trees require speed to avoid thick toxic smoke (20 unmitigatable damage per post, 10 with Survival). Filled with Great Bears, Great Tailed Deer, Blazing Treants - all cursed with black flame madness and soulless eyes. Increased damage, speed, intent to kill on sight. Light obscured but flames provide visibility.',
      environmentalDamage:true,
      routes:['Smoke-choked burning paths','Black flame cursed creature zones','Speed-required corridors']
    },
    quests:[
      {id:'f8q1',title:'Monkey King',desc:'Track down the legendary trickster Monkey King of the forest',type:'explore',target:1,reward:{xp:600,gold:420}},
      {id:'f8q2',title:'Elvish Conflict',desc:'Mediate between Ellesmera elves and resolve their war stance',type:'explore',target:1,reward:{xp:640,gold:440}},
      {id:'f8q3',title:'Treant Conflict',desc:'Negotiate with Baobab treant king about Great Tree',type:'explore',target:1,reward:{xp:640,gold:440}},
      {id:'f8q4',title:'Ferocious Foe',desc:'Defeat 7 Blazing Treants in the labyrinth',type:'kill',target:7,reward:{xp:580,gold:400}},
      {id:'f8q5',title:'The Keeper Of Life & Death',desc:'Uncover truth about Great Tree and floor\'s fate',type:'explore',target:1,reward:{xp:700,gold:480}}
    ]
  },
  9: {
    name:'Yōgan Village',
    theme:'volcano',
    dungeonRooms:28, // Mount Kazan interior with lava rivers
    description:'The 9th Floor is craggy lava-filled hellscape covered in ash from constant lava flow. Thick low-hanging doom-clouds hover overhead. Peaks spew grey pillars into red-black sky feeding oppressive magma-fed heat. Mount Kazan reaches overwhelming temperatures. No greenery survived. Charred and copper-skinned humans/dwarves adapted to heat.',
    settlements:{
      main:'Yōgan Village',
      subs:['Knorilt Village']
    },
    locations:[
      'Yōgan Village - mining settlement at Mount Kazan base, active trading hub for ores/metals, surrounded by cooled magma barrier from boss death',
      'Knorilt Village - smaller dwarven village atop inactive Mount Hellion volcano, reeks of sulfur, employs Mining Guild factions',
      'Volcanic Flatlands - basalt and igneous rock expanses with constantly shifting terrain from cooling lava flows',
      'Mount Stylahm - tallest volcano regularly spewing lava, vast cave network maze with frequent spawns',
      'The Profaned Peak - flat-topped mountain with lava lake, stone platform with massive meteor-carved throne and jeweled crown',
      'Wrought-Iron Ruins - charred iron battleground ruins haunted by iron-clad undead soldiers whose armor seared to flesh'
    ],
    npcs:[
      {name:'Mining Guild Thug',role:'Hired Muscle',desc:'Mercenary keeping rabble from Yōgan, hired to protect mining interests'},
      {name:'Knorilt Dwarf',role:'Obsidian Harvester',desc:'Dwarf employed by Mining Guild, competitive for promising territory and finds'},
      {name:'Yōgan Prospector',role:'Fortune Seeker',desc:'One seeking fortune or glory hunting elementals, or fading to anonymity in harsh heat'}
    ],
    enemies:[
      {name:'Rock Golem',hpMul:3.6,atkMul:3.0,exp:58,gold:46,desc:'Bulky durable construct from magma/stone with cooled shell barely containing molten interior, swings arms or throws limbs'},
      {name:'Lava Elemental',hpMul:3.4,atkMul:2.9,exp:54,gold:42,desc:'Pure magma spirit of unbridled anger, swift and slick spewing fire gouts, grows sluggish away from pools'},
      {name:'Pyre Vulture',hpMul:3.2,atkMul:2.8,exp:52,gold:40,desc:'Elemental avian with ash-flake feathers and fire core, rides thermals through smoke concealment, volcanic glass talons'},
      {name:'Iron Knight',hpMul:4.0,atkMul:3.4,exp:64,gold:52,desc:'Still-moving beaten armor from ancient battles, flesh seared to interior, no intelligence, attacks living on sight'}
    ],
    fieldBoss:{
      name:'Phoenix',
      hpMul:11,
      atk:23,
      def:7,
      exp:800,
      gold:540,
      desc:'Born from floor volcanoes soaring over lava rivers. Difficult to catch and kill. Ashborn ability restores to 225 HP once with boosted 110 DMG. Inferno rains fire on highest hate for 150 DMG applying T2 BURN to all.'
    },
    boss:{
      id:'boss9',
      name:'Grivas the Hydra',
      hpMul:42,
      atk:30,
      def:14,
      exp:2800,
      gold:1900,
      desc:'Multi-headed drake primary source of constant magma permeating floor. Emerged randomly from hidden lair to raze landscape and forge anew with molten lava footsteps. Death caused Mount Kazan peak to be covered in cooled magma caul, volcano became dormant.'
    },
    labyrinthMechanic:{
      type:'suffocating_depths',
      desc:'Floor nine labyrinth at Mount Kazan top. Grivas travelled through solid rock creating ever-shifting tunnels. Secondary structure at peak housed volcanic river confluence network, mostly clogged post-dormancy but some passable. Every step churns ash into air making breathing difficult (10 unmitigatable per post without Survival/Fireproof, both negates). Boss room offers air break. Deeper tunnels 20 damage per post (10 with one protection, 0 with both). Early: 2 posts, 2 monsters. Deep: 3 posts, 3 monsters. Boss room has Grivas hide fused to basalt structure.',
      suffocation:true,
      routes:['Early ash-choked tunnels','Boss room air break','Deep volcanic fog network']
    },
    quests:[
      {id:'f9q1',title:'Guardian Of Fire',desc:'Defeat the ancient fire guardian protecting volcanic secrets',type:'kill',target:1,reward:{xp:700,gold:500}},
      {id:'f9q2',title:'Gatekeeper Of Fire',desc:'Pass trials of the fire gatekeeper to proceed',type:'explore',target:1,reward:{xp:660,gold:460}},
      {id:'f9q3',title:'The Iron Guardian',desc:'Investigate Wrought-Iron Ruins and defeat 6 Iron Knights',type:'kill',target:6,reward:{xp:640,gold:440}},
      {id:'f9q4',title:'Bandit Camp',desc:'Clear the bandit camp preying on miners and prospectors',type:'kill',target:8,reward:{xp:620,gold:420}},
      {id:'f9q5',title:'Cavity Of Ruin',desc:'Explore Mount Stylahm\'s deepest cavern mysteries',type:'explore',target:1,reward:{xp:760,gold:520}}
    ]
  },
  10: {
    name:'Yomi',
    theme:'shadow',
    dungeonRooms:30, // Shadow world labyrinth accessed through black crystals
    description:'The 10th Floor appears entirely underground, utterly devoid of sunlight. Endless cave network with giant glowing mushrooms, crystal mazes, massive ravines with roaring waterfalls. Dim-blue lighting from phosphorescent mosses, fungi, crystals. Distinct silence suddenly shattered by distant screeches. Gaunt skeletal creatures haunt floor, strongest are \'the Shadowed\'. Rivers glow with toxic chemicals.',
    settlements:{
      main:'Yomi',
      subs:[]
    },
    locations:[
      'Yomi - once large Japanese-influenced city now populated only by spirit echoes, buildings intact but markets empty, twisted pink-glowing trees line streets',
      'Endless Caverns - entirety of floor, ever-twisting caves impossible to fully explore, constant mental assault, terrain from razor rock to fungal jungles',
      'Tartarus - massive abandoned prison fortress swamped with hostile enemies and miasma, Banshee haunts grounds',
      'The Void - farthest northern pit with no bottom leading nowhere, 40ft wide marked by ancient serpent ouroboros, Echo Flowers repeat distorted sounds',
      'Stygian River - largest floor river, brackish highly acidic dissolving skeletons instantly, gazing reveals innermost desires as miasmic materializations'
    ],
    npcs:[
      {name:'Spirit Echo',role:'Lost Soul',desc:'Glowing spirit of lingering dead soul lamenting lost vibrant life, brightness fluctuates with passion/hope'},
      {name:'Skeletal Dragon Guardian',role:'Yomi Protector',desc:'One of two skeletal dragons chained to town entry gates, vaporizes approaching monsters with cold/acid'},
      {name:'Mad Spirit',role:'Grief-Driven Shade',desc:'Spirit driven insane by loss, clings to existence to fulfill deep-seeded longing from finding dolly to slaughter'}
    ],
    enemies:[
      {name:'Skeletal Monster',hpMul:3.8,atkMul:3.2,exp:62,gold:50,desc:'Remains of various monsters/animals, aggressive, often brittle especially to crushing weapons'},
      {name:'Shadow Monster',hpMul:4.2,atkMul:3.6,exp:68,gold:56,desc:'Lightless spectral entity, highly effective in low-lit areas, bigger and shape-changing in darkness, cower from Holy weapons'},
      {name:'Shadow Knight',hpMul:4.6,atkMul:4.0,exp:74,gold:62,desc:'Ancient Tartarus guards, shades in metal armor carrying special hatred for living, especially naive/innocent'},
      {name:'Drake',hpMul:4.4,atkMul:3.8,exp:70,gold:58,desc:'Large wingless lizard, rare living organism adapted to toxic waters, very aggressive due to food scarcity'}
    ],
    fieldBoss:{
      name:'Banshee',
      hpMul:12,
      atk:25,
      def:4,
      exp:900,
      gold:620,
      desc:'Cried to warn of impending death for centuries until cursed by distraught widow. Now screams eternally within Tartarus prison, sound heard across entire floor. Undead: healing skills deal double damage. Ghostly Form: halves all non-healing damage. Ear Piercing Screech paralyzes all for one turn on CD 9+.'
    },
    boss:{
      id:'boss10',
      name:'Kagenomura',
      hpMul:50,
      atk:36,
      def:16,
      exp:3800,
      gold:2800,
      desc:'Samurai lord wielding blade fumed with heavy darkness. Ruled land of shadows home to pure darkness creatures. Drawn to floor by local warrior\'s obsessive research who succumbed to madness. Despite death, shadow realm maintains its dominion over entire floor.'
    },
    labyrinthMechanic:{
      type:'shadow_world_shift',
      desc:'Floor ten labyrinth difficult to locate. Must find rare black floating crystal at deepest cavern end. Contact melts world around, entering parallel monochromatic black-and-white world. Reality distorted into living nightmare. Constantly shifting walls. Dark desire whispers tempt slumber. Travel through Shadow World finding next black crystal to return mortal plane, melting through ground back to physical body to continue labyrinth. Tracking does not work on this floor.',
      parallelWorld:true,
      routes:['Black crystal search in deep caverns','Shadow World monochrome nightmare','Reality-melting transitions']
    },
    quests:[
      {id:'f10q1',title:'Echoes of the Lost',desc:'Collect 10 Echo Flower recordings from The Void area',type:'gather',target:10,reward:{xp:840,gold:600}},
      {id:'f10q2',title:'Tartarus Breakout',desc:'Help 5 trapped spirits escape Tartarus prison',type:'escort',target:5,reward:{xp:900,gold:640}},
      {id:'f10q3',title:'Stygian Reflections',desc:'Gaze into Stygian River and confront your materialized desire',type:'explore',target:1,reward:{xp:1000,gold:700}},
      {id:'f10q4',title:'Shadow Slayer',desc:'Defeat 8 Shadow Monsters or Shadow Knights',type:'kill',target:8,reward:{xp:860,gold:620}},
      {id:'f10q5',title:'Void Investigation',desc:'Approach The Void and survive the freezing cold and voices',type:'explore',target:1,reward:{xp:1100,gold:800}}
    ]
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
