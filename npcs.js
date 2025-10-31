// NPC definitions
function sampleNPCs(){
  return [
    {
      id:'npc_argo',
      name:'Argo the Rat',
      desc:'An information broker known for her whiskers and vast knowledge. She can provide intel on monsters, quests, and hidden locations.',
      quests:[
        {id:'argo_q1',title:'Information Network',desc:'Help Argo gather intel by defeating 8 different enemy types',type:'kill',target:8,reward:{xp:150,gold:100}}
      ]
    },
    {
      id:'npc_agil',
      name:'Agil',
      desc:'A friendly merchant who runs a shop. Known for his ax and warm demeanor.',
      quests:[
        {id:'agil_q1',title:'Supply Run',desc:'Gather 5 materials from the field to help stock the shop',type:'gather',target:5,reward:{xp:100,gold:80}}
      ]
    },
    {
      id:'npc_lind',
      name:'Lind',
      desc:'Leader of a guild. Focused on clearing floors and maintaining order.',
      quests:[
        {id:'lind_q1',title:'Guild Recruitment',desc:'Prove your worth by defeating 10 monsters',type:'kill',target:10,reward:{xp:180,gold:120}}
      ]
    },
    {
      id:'npc_kibaou',
      name:'Kibaou',
      desc:'An aggressive player who distrusts former beta testers. Often seen rallying others.',
      quests:[
        {id:'kibaou_q1',title:'Show of Strength',desc:'Clear a difficult area by defeating 6 elite monsters',type:'kill',target:6,reward:{xp:140,gold:90}}
      ]
    },
    {
      id:'npc_blacksmith',
      name:'Horunka Blacksmith',
      desc:'A skilled blacksmith in Horunka village. Can upgrade weapons and armor.',
      quests:[
        {id:'smith_q1',title:'Materials for the Forge',desc:'Bring 3 ore samples from the mountain region',type:'gather',target:3,reward:{xp:120,gold:100}}
      ]
    },
    {
      id:'npc_old_hermit',
      name:'Forest Hermit',
      desc:'An old NPC living in the Stone Valley forest. Knows the secret medicine recipe.',
      quests:[
        {id:'hermit_q1',title:'Secret Medicine of the Forest',desc:'Gather rare herbs from deep in the Stone Valley forest',type:'gather',target:1,reward:{xp:100,gold:60,token:1}}
      ]
    },
    {
      id:'npc_rex',
      name:'Rex',
      desc:'Owner of the Rusty Dagger tavern in Urbus on Floor 2. Serves rogues and info brokers but does not tolerate rough housing.',
      quests:[
        {id:'rex_q1',title:'Keep the Peace',desc:'Help Rex maintain order by dealing with 5 troublesome bandits',type:'kill',target:5,reward:{xp:160,gold:110}}
      ]
    },
    {
      id:'npc_marome_captain',
      name:'Marome Guard Captain',
      desc:'Commander of the fortress in Marome Village. Concerned about the giant insects overrunning the wilds.',
      quests:[
        {id:'marome_q1',title:'Insect Extermination',desc:'Clear the area of 8 giant insects (wasps, beetles, or pillbugs)',type:'kill',target:8,reward:{xp:200,gold:140}}
      ]
    },
    {
      id:'npc_taran_sentinel',
      name:'Taran Sentinel',
      desc:'Guard at Taran Village entrance. Questions all travelers before allowing entry.',
      quests:[
        {id:'taran_q1',title:'Prove Your Worth',desc:'Defeat 6 mountain monsters to gain Taran\'s trust',type:'kill',target:6,reward:{xp:180,gold:120}}
      ]
    },
    {
      id:'npc_crystal_miner',
      name:'Crystal Miner',
      desc:'An NPC who mines glowing crystals from the Crystal Cave. Needs protection from the goblins and spiders.',
      quests:[
        {id:'miner_q1',title:'Cave Protection',desc:'Clear 5 goblins or spiders from Crystal Cave',type:'kill',target:5,reward:{xp:150,gold:100}},
        {id:'miner_q2',title:'Crystal Delivery',desc:'Deliver 3 glowing crystals to Urbus for lighting',type:'gather',target:3,reward:{xp:120,gold:90}}
      ]
    },
    {
      id:'npc_flora_organizer',
      name:'Flora Festival Organizer',
      desc:'NPC who organizes the Flora Festival at High Fields of Crossing. Needs help preparing the event.',
      quests:[
        {id:'flora_q1',title:'Festival Preparations',desc:'Gather 10 rare flowers from the High Fields',type:'gather',target:10,reward:{xp:180,gold:130,token:1}}
      ]
    },
    {
      id:'npc_faune_elder',
      name:'Faune Elder',
      desc:'Wise elder of Aruyt with rabbit-like ears. Deeply connected to the forest, cautious of humans but willing to help those who respect nature.',
      quests:[
        {id:'faune_q1',title:'Respect the Forest',desc:'Prove your respect by planting 5 saplings in damaged areas',type:'gather',target:5,reward:{xp:200,gold:140}},
        {id:'faune_q2',title:'Dangerous Mist',desc:'Investigate disturbances in the Forest of Wavering Mist',type:'explore',target:1,reward:{xp:260,gold:170}}
      ]
    },
    {
      id:'npc_fae_merchant',
      name:'Exiled Fae Merchant',
      desc:'A Fae exile living in Town of Flora with mismatched eyes. Wealthier than most, sells rare forest goods. Speaks in riddles and double-meanings.',
      quests:[
        {id:'fae_q1',title:'A Deal Most Fair',desc:'Retrieve 3 Nightingbloom petals without entering Faerie itself',type:'gather',target:3,reward:{xp:240,gold:180}},
        {id:'fae_q2',title:'Truth in Lies',desc:'Decode the Fae merchant\'s warning about King Nyx\'s plans',type:'explore',target:1,reward:{xp:280,gold:200}}
      ]
    },
    {
      id:'npc_faune_scout',
      name:'Faune Scout',
      desc:'Young Faune ranger with exceptional hearing. Guards the southern bridge to Aruyt, warns travelers of Fae trickery.',
      quests:[
        {id:'scout_q1',title:'Bridge Guard Duty',desc:'Help patrol and defend the Aruyt bridges from Fae incursions',type:'kill',target:6,reward:{xp:220,gold:150}},
        {id:'scout_q2',title:'Lost in the Mist',desc:'Rescue a Faune who wandered into the Forest of Wavering Mist',type:'escort',target:1,reward:{xp:260,gold:170}}
      ]
    },
    {
      id:'npc_twisted_survivor',
      name:'Former Captive',
      desc:'A traumatized player who escaped the Cavern of Faeries. Shares warnings about Fae feasts and the Twisted.',
      quests:[
        {id:'captive_q1',title:'Never Again',desc:'Free 5 captives from the Cavern of Faeries before they become Twisted',type:'escort',target:5,reward:{xp:300,gold:220}},
        {id:'captive_q2',title:'Destroy the Cages',desc:'Break 8 magically sealed cages in the caverns',type:'explore',target:8,reward:{xp:280,gold:190}}
      ]
    }
  ];
}
