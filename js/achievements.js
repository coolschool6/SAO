// Achievement definitions for SAO text RPG
(() => {
  window.ACHIEVEMENTS = {
    // Combat achievements
    first_blood: {
      id: 'first_blood',
      name: 'First Blood',
      desc: 'Win your first combat encounter',
      reward: 50,
      check: (p) => p.kills >= 1
    },
    fighter: {
      id: 'fighter',
      name: 'Fighter',
      desc: 'Defeat 10 enemies',
      reward: 50,
      check: (p) => p.kills >= 10
    },
    warrior: {
      id: 'warrior',
      name: 'Warrior',
      desc: 'Defeat 25 enemies',
      reward: 50,
      check: (p) => p.kills >= 25
    },
    slayer: {
      id: 'slayer',
      name: 'Slayer',
      desc: 'Defeat 50 enemies',
      reward: 50,
      check: (p) => p.kills >= 50
    },
    legend: {
      id: 'legend',
      name: 'Legend',
      desc: 'Defeat 100 enemies',
      reward: 50,
      check: (p) => p.kills >= 100
    },
    boss_hunter: {
      id: 'boss_hunter',
      name: 'Boss Hunter',
      desc: 'Defeat your first boss',
      reward: 50,
      check: (p) => p.bossKills >= 1
    },
    boss_slayer: {
      id: 'boss_slayer',
      name: 'Boss Slayer',
      desc: 'Defeat 5 bosses',
      reward: 50,
      check: (p) => p.bossKills >= 5
    },
    boss_master: {
      id: 'boss_master',
      name: 'Boss Master',
      desc: 'Defeat 10 bosses',
      reward: 50,
      check: (p) => p.bossKills >= 10
    },
    critical_expert: {
      id: 'critical_expert',
      name: 'Critical Expert',
      desc: 'Land 10 critical hits',
      reward: 50,
      check: (p) => p.criticalHits >= 10
    },
    dodge_master: {
      id: 'dodge_master',
      name: 'Dodge Master',
      desc: 'Successfully dodge 15 attacks',
      reward: 50,
      check: (p) => p.dodges >= 15
    },
    untouchable: {
      id: 'untouchable',
      name: 'Untouchable',
      desc: 'Dodge 5 attacks in a row',
      reward: 50,
      check: (p) => p.dodgeStreak >= 5
    },

    // Exploration achievements
    explorer: {
      id: 'explorer',
      name: 'Explorer',
      desc: 'Reach Floor 5',
      reward: 50,
      check: (p) => p.floor >= 5
    },
    adventurer: {
      id: 'adventurer',
      name: 'Adventurer',
      desc: 'Reach Floor 10',
      reward: 50,
      check: (p) => p.floor >= 10
    },
    floor_clearer: {
      id: 'floor_clearer',
      name: 'Floor Clearer',
      desc: 'Reach Floor 25',
      reward: 50,
      check: (p) => p.floor >= 25
    },
    field_boss_encounter: {
      id: 'field_boss_encounter',
      name: 'Rare Encounter',
      desc: 'Encounter a Field Boss',
      reward: 50,
      check: (p) => p.fieldBosses >= 1
    },

    // Character progression
    leveling_up: {
      id: 'leveling_up',
      name: 'Leveling Up',
      desc: 'Reach level 5',
      reward: 50,
      check: (p) => p.level >= 5
    },
    veteran: {
      id: 'veteran',
      name: 'Veteran',
      desc: 'Reach level 10',
      reward: 50,
      check: (p) => p.level >= 10
    },
    expert: {
      id: 'expert',
      name: 'Expert',
      desc: 'Reach level 15',
      reward: 50,
      check: (p) => p.level >= 15
    },
    skill_master: {
      id: 'skill_master',
      name: 'Skill Master',
      desc: 'Unlock all 6 skills',
      reward: 50,
      check: (p) => Object.keys(p.skills || {}).length >= 6
    },

    // Economy achievements
    merchant: {
      id: 'merchant',
      name: 'Merchant',
      desc: 'Accumulate 1000 gold',
      reward: 50,
      check: (p) => p.gold >= 1000
    },
    wealthy: {
      id: 'wealthy',
      name: 'Wealthy',
      desc: 'Accumulate 5000 gold',
      reward: 50,
      check: (p) => p.gold >= 5000
    },
    collector: {
      id: 'collector',
      name: 'Collector',
      desc: 'Store 10 items in your stash',
      reward: 50,
      check: (p) => p.stashCount >= 10
    },
    storage_user: {
      id: 'storage_user',
      name: 'Storage User',
      desc: 'Use the Storage facility',
      reward: 50,
      check: (p) => p.storageUsed === true
    },
    potion_addict: {
      id: 'potion_addict',
      name: 'Potion Addict',
      desc: 'Use 20 consumable items',
      reward: 50,
      check: (p) => p.consumablesUsed >= 20
    },

    // Quest achievements
    quest_starter: {
      id: 'quest_starter',
      name: 'Quest Starter',
      desc: 'Accept your first quest',
      reward: 50,
      check: (p) => p.questsAccepted >= 1
    },
    quest_completer: {
      id: 'quest_completer',
      name: 'Quest Completer',
      desc: 'Complete 5 quests',
      reward: 50,
      check: (p) => p.questsCompleted >= 5
    },
    quest_master: {
      id: 'quest_master',
      name: 'Quest Master',
      desc: 'Complete 15 quests',
      reward: 50,
      check: (p) => p.questsCompleted >= 15
    },

    // Special achievements
    survivor: {
      id: 'survivor',
      name: 'Survivor',
      desc: 'Survive with less than 10% HP',
      reward: 50,
      check: (p) => p.nearDeathSurvival === true
    },
    blacksmith_friend: {
      id: 'blacksmith_friend',
      name: 'Blacksmith Friend',
      desc: 'Upgrade equipment 5 times',
      reward: 50,
      check: (p) => p.equipmentUpgrades >= 5
    },
    social_butterfly: {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      desc: 'Talk to 5 different NPCs',
      reward: 50,
      check: (p) => (p.npcsTalked || []).length >= 5
    },
    lucky_find: {
      id: 'lucky_find',
      name: 'Lucky Find',
      desc: 'Obtain the Lucky Pendant',
      reward: 50,
      check: (p, inv) => inv.items.some(it => it.id === 'lucky_pendant')
    }
  };
})();
