/* ============================================
   BATTLE SCREEN ADAPTER
   Maps old combat UI IDs to new battle screen IDs
   ============================================ */

(function() {
  'use strict';
  
  // Store original getElementById - use bind to preserve context
  const originalGetElementById = document.getElementById.bind(document);
  
  // ID mapping from old combat UI to new battle screen
  const ID_MAP = {
    // Main container
    'combat-stage': 'battle-screen-container',
    
    // Combat log
    'combat-log-entries': 'battle-log-text',
    'combat-log-overlay': 'top-info-banner',
    
    // Player elements
    'player-combat-name': 'player-character-label',
    'player-combat-hp-bar': 'player-hp-bar',
    'player-combat-hp-text': 'player-hp-text',
    'player-combat-sp-bar': 'player-sp-bar',
    'player-combat-sp-text': 'player-sp-text',
    'player-combatant': 'player-display',
    'player-status-icons': 'player-stats-overlay', // Approximate mapping
    
    // Enemy elements
    'enemy-combat-name': 'enemy-name-level',
    'enemy-combat-hp-bar': 'enemy-hp-bar',
    'enemy-combat-hp-text': 'enemy-hp-percentage',
    'enemy-combatant': 'enemy-display',
    'enemy-intent': 'enemy-name-level', // Will be shown in name area
    'enemy-status-icons': 'enemy-stats-overlay', // Approximate mapping
    
    // Combat action buttons - map old IDs to new
    'btn-attack': 'attack-btn',
    'btn-skill-combat': 'skills-btn',
    'btn-use-item': 'items-btn',
    'btn-defend': 'defend-btn',
    'btn-flee': 'run-btn',
    
    // Other elements
    'turn-indicator': 'turn-indicator',
    'damage-numbers': 'damage-numbers'
  };
  
  // Override getElementById to use mapping
  document.getElementById = function(id) {
    const mappedId = ID_MAP[id] || id;
    const element = originalGetElementById(mappedId);
    if (!element && mappedId !== id) {
      // Fallback to original ID if mapped ID not found
      return originalGetElementById(id);
    }
    return element;
  };
  
  // Helper function to update combat log in new format
  window.updateBattleLog = function(message) {
    const logText = originalGetElementById('battle-log-text');
    if (logText) {
      logText.textContent = message;
      // Add animation class
      logText.style.animation = 'none';
      setTimeout(() => {
        logText.style.animation = '';
      }, 10);
    }
  };
  
  // Helper to show turn indicator with new class
  window.showBattleTurnIndicator = function(isPlayerTurn) {
    const indicator = originalGetElementById('turn-indicator');
    const textEl = indicator ? indicator.querySelector('.turn-text-new') : null;
    
    if (indicator && textEl) {
      textEl.textContent = isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN';
      indicator.classList.remove('show', 'enemy-turn');
      
      if (!isPlayerTurn) {
        indicator.classList.add('enemy-turn');
      }
      
      // Trigger animation
      setTimeout(() => {
        indicator.classList.add('show');
      }, 50);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);
    }
  };
  
  // Helper to show damage numbers
  window.showBattleDamage = function(amount, target, type = 'damage') {
    const container = originalGetElementById('damage-numbers');
    if (!container) return;
    
    const dmgEl = document.createElement('div');
    dmgEl.className = 'damage-number';
    dmgEl.textContent = amount;
    
    // Add type class
    if (type === 'critical') dmgEl.classList.add('critical');
    if (type === 'heal') dmgEl.classList.add('heal');
    if (type === 'dodge') {
      dmgEl.classList.add('dodge');
      dmgEl.textContent = 'DODGE!';
    }
    
    // Position based on target
    const targetEl = originalGetElementById(
      target === 'player' ? 'player-display' : 'enemy-display'
    );
    
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      dmgEl.style.left = (rect.left + rect.width / 2) + 'px';
      dmgEl.style.top = (rect.top + rect.height / 2) + 'px';
    }
    
    container.appendChild(dmgEl);
    
    // Remove after animation
    setTimeout(() => {
      dmgEl.remove();
    }, 1500);
  };
  
  // Helper to update enemy HP with percentage
  window.updateEnemyHP = function(current, max) {
    const hpBar = originalGetElementById('enemy-hp-bar');
    const hpText = originalGetElementById('enemy-hp-percentage');
    
    if (hpBar) {
      const pct = Math.max(0, Math.min(100, (current / max) * 100));
      hpBar.style.width = pct + '%';
    }
    
    if (hpText) {
      const pct = Math.round((current / max) * 100);
      hpText.textContent = pct + '%';
    }
    
    // Also update underbar
    const underBar = originalGetElementById('enemy-under-hp-bar');
    const underText = originalGetElementById('enemy-under-hp-text');
    if (underBar) {
      const pct = Math.max(0, Math.min(100, (current / max) * 100));
      underBar.style.width = pct + '%';
    }
    if (underText) {
      const pct = Math.round((current / max) * 100);
      underText.textContent = pct + '%';
    }
  };
  
  // Helper to update player HP
  window.updatePlayerHP = function(current, max) {
    const hpBar = originalGetElementById('player-hp-bar');
    const hpText = originalGetElementById('player-hp-text');
    
    if (hpBar) {
      const pct = Math.max(0, Math.min(100, (current / max) * 100));
      hpBar.style.width = pct + '%';
    }
    
    if (hpText) {
      hpText.textContent = `${Math.max(0, current)}/${max}`;
    }
    
    // Also update underbar
    const underBar = originalGetElementById('player-under-hp-bar');
    const underText = originalGetElementById('player-under-hp-text');
    if (underBar) {
      const pct = Math.max(0, Math.min(100, (current / max) * 100));
      underBar.style.width = pct + '%';
    }
    if (underText) {
      underText.textContent = `${Math.max(0, current)}/${max}`;
    }
  };
  
  // Helper to update combo meter
  window.updateComboMeter = function(comboValue) {
    const comboMeter = originalGetElementById('combo-meter');
    const comboValueEl = comboMeter ? comboMeter.querySelector('.combo-value') : null;
    
    if (comboMeter && comboValueEl) {
      comboValueEl.textContent = 'x' + comboValue;
      
      if (comboValue > 1) {
        comboMeter.classList.add('active');
      } else {
        comboMeter.classList.remove('active');
      }
    }
  };
  
  // Helper to show/hide battle screen
  window.showBattleScreen = function() {
    const battleScreen = originalGetElementById('battle-screen-container');
    const advLog = originalGetElementById('adventure-log');
    const cmdPanel = originalGetElementById('command-panel');
    
    if (battleScreen) battleScreen.style.display = 'block';
    if (advLog) advLog.style.display = 'none';
    if (cmdPanel) {
      // Hide normal action buttons, combat buttons will show via CSS
      const mainActions = originalGetElementById('main-actions');
      const combatActions = originalGetElementById('combat-actions');
      if (mainActions) mainActions.style.display = 'none';
      if (combatActions) combatActions.style.display = 'none';
    }
    
    document.body.classList.add('in-battle');
  };
  
  window.hideBattleScreen = function() {
    const battleScreen = originalGetElementById('battle-screen-container');
    const advLog = originalGetElementById('adventure-log');
    const cmdPanel = originalGetElementById('command-panel');
    
    if (battleScreen) battleScreen.style.display = 'none';
    if (advLog) advLog.style.display = 'block';
    if (cmdPanel) {
      const mainActions = originalGetElementById('main-actions');
      const combatActions = originalGetElementById('combat-actions');
      if (mainActions) mainActions.style.display = 'flex';
      if (combatActions) combatActions.style.display = 'none';
    }
    
    document.body.classList.remove('in-battle');
  };
  
  // Map button event listeners
  window.addEventListener('DOMContentLoaded', function() {
    // Map attack button
    const oldAttack = originalGetElementById('btn-attack');
    const newAttack = originalGetElementById('attack-btn');
    if (oldAttack && newAttack && oldAttack.onclick) {
      newAttack.onclick = oldAttack.onclick;
    }
    
    // Map skill button
    const oldSkill = originalGetElementById('btn-skill-combat');
    const newSkill = originalGetElementById('skills-btn');
    if (oldSkill && newSkill && oldSkill.onclick) {
      newSkill.onclick = oldSkill.onclick;
    }
    
    // Map item button
    const oldItem = originalGetElementById('btn-use-item');
    const newItem = originalGetElementById('items-btn');
    if (oldItem && newItem && oldItem.onclick) {
      newItem.onclick = oldItem.onclick;
    }
    
    // Map defend button
    const oldDefend = originalGetElementById('btn-defend');
    const newDefend = originalGetElementById('defend-btn');
    if (oldDefend && newDefend && oldDefend.onclick) {
      newDefend.onclick = oldDefend.onclick;
    }
    
    // Map flee button
    const oldFlee = originalGetElementById('btn-flee');
    const newFlee = originalGetElementById('run-btn');
    if (oldFlee && newFlee && oldFlee.onclick) {
      newFlee.onclick = oldFlee.onclick;
    }
  });
  
  console.log('[Battle Screen Adapter] Loaded - Old combat UI IDs mapped to new battle screen');
})();
