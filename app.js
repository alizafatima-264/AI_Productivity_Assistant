/**
 * Aegis Focus - Application Central Controller
 */

(function() {
  // Authentication Elements
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.querySelector('.app-container');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginPanel = document.getElementById('login-form-panel');
  const registerPanel = document.getElementById('register-form-panel');
  const toRegisterBtn = document.getElementById('to-register-btn');
  const toLoginBtn = document.getElementById('to-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const sidebarUsername = document.getElementById('sidebar-username');

  // Navigation & View Routing
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');

  function checkAuth() {
    if (window.AppState.currentUser) {
      if (authContainer) authContainer.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';
      if (sidebarUsername) sidebarUsername.textContent = window.AppState.currentUser;
      // Guarantee redirect to Dashboard view on login
      const dashboardNav = document.querySelector('[data-view="dashboard-view"]');
      if (dashboardNav) {
        dashboardNav.click();
      } else {
        renderDashboard();
      }
    } else {
      if (authContainer) authContainer.style.display = 'flex';
      if (appContainer) appContainer.style.display = 'none';
    }
  }

  window.addEventListener('authChanged', () => {
    checkAuth();
  });

  // Dashboard elements
  const goalsListContainer = document.getElementById('dashboard-goals-list');
  const missionsListContainer = document.getElementById('dashboard-missions-list');
  const achievementsContainer = document.getElementById('dashboard-achievements-list');
  const goalsCountLabel = document.getElementById('goals-count');

  // Stats header pills
  const streakPill = document.getElementById('streak-stat-val');
  const minutesPill = document.getElementById('minutes-stat-val');
  const sidebarStatusBadge = document.getElementById('sidebar-status-badge');

  // Modals
  const limitModal = document.getElementById('goal-limit-modal');
  const limitModalClose = document.getElementById('modal-goal-limit-close');
  const dashboardAddGoalBtn = document.getElementById('dashboard-add-goal-btn');

  // Dynamic Insight elements
  const insightDnaLevel = document.getElementById('insight-dna-level');
  const insightCompletions = document.getElementById('insight-completions');
  const insightResilience = document.getElementById('insight-resilience');

  // 1. Navigation Routing Handler
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      
      // Update sidebar state
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update active view panel
      viewSections.forEach(section => {
        section.classList.remove('active-view');
        if (section.id === targetView) {
          section.classList.add('active-view');
        }
      });

      // Update titles and run specific callbacks
      updateViewHeaders(targetView);
    });
  });

  function updateViewHeaders(viewId) {
    const topStats = document.querySelector('.top-stats');
    if (topStats) {
      if (viewId === 'dashboard-view' || viewId === 'settings-view') {
        topStats.style.display = 'none';
      } else {
        topStats.style.display = 'flex';
      }
    }

    if (viewId === 'dashboard-view') {
      const hour = new Date().getHours();
      let greeting = "Good Morning";
      let greetingEmoji = '🌅';
      if (hour >= 12 && hour < 17) { greeting = "Good Afternoon"; greetingEmoji = '☀️'; }
      else if (hour >= 17 && hour < 22) { greeting = "Good Evening"; greetingEmoji = '🌆'; }
      else if (hour >= 22 || hour < 5) { greeting = "Good Night"; greetingEmoji = '🌙'; }
      const userName = window.AppState.currentUser || 'Productive Self';
      viewTitle.textContent = `${greeting}, ${userName}!`;
      viewSubtitle.textContent = "Here's your execution brief for today.";
      // Update new greeting heading inside dashboard section
      const greetTextEl = document.getElementById('dashboard-greeting-text');
      const greetSubEl = document.getElementById('dashboard-greeting-sub');
      if (greetTextEl) greetTextEl.textContent = `${greeting}, ${userName}`;
      if (greetSubEl) greetSubEl.textContent = "Here's your execution brief for today.";
      renderDashboard();
    } else if (viewId === 'goals-view') {
      viewTitle.textContent = "Goal Hub";
      viewSubtitle.textContent = "Manage your active goals, track progress, and archive completed ones.";
      renderGoalsView();
    } else if (viewId === 'planner-view') {
      viewTitle.textContent = "Weekly Focus Calendar";
      viewSubtitle.textContent = "Your AI-scheduled sessions for this week – click any card to start a session.";
      if (window.renderWeeklyCalendar) window.renderWeeklyCalendar();
    } else if (viewId === 'focus-view') {
      viewTitle.textContent = "Deep Focus Mode";
      viewSubtitle.textContent = "Auto-segmented Pomodoro sessions with ambient soundscapes.";
    } else if (viewId === 'progress-view') {
      viewTitle.textContent = "Progress Overview";
      viewSubtitle.textContent = "Focus history, session stats, and consistency heatmap.";
      renderProgressView();
    } else if (viewId === 'analytics-view') {
      viewTitle.textContent = "Productivity DNA";
      viewSubtitle.textContent = "AI behavioural insights based on your historical focus patterns.";
      if (window.renderAnalytics) window.renderAnalytics();
    } else if (viewId === 'recovery-view') {
      viewTitle.textContent = "Recovery Mode";
      viewSubtitle.textContent = "Automated workload scaling when consecutive sessions are missed.";
      renderRecoveryView();
    } else if (viewId === 'achievements-view') {
      viewTitle.textContent = "Achievements";
      viewSubtitle.textContent = "Unlock badges by maintaining streaks, deep focus sessions, and completing goals.";
      renderAchievementsView();
    } else if (viewId === 'settings-view') {
      viewTitle.textContent = "Settings";
      viewSubtitle.textContent = "Manage your profile and application data.";
      renderSettingsView();
    }
  }

  // 2. Render Dashboard Methods
  function renderDashboard() {
    renderStatsHeader();
    renderActiveGoals();
    renderDailyMissions();
    renderAchievementsList();
    renderNextFocusHighlight();
    renderSmartReminders();
  }

  function renderNextFocusHighlight() {
    const highlightPanel = document.getElementById('active-focus-highlight');
    const noMissionCard = document.getElementById('dashboard-no-mission-card');
    if (!highlightPanel) return;

    const todaysMissions = window.AppState.getTodaysMissions();
    const nextPending = todaysMissions.find(m => !m.completed);
    const activeGoals = window.AppState.getActiveGoals();

    if (nextPending) {
      highlightPanel.style.display = 'block';
      if (noMissionCard) noMissionCard.style.display = 'none';

      document.getElementById('active-focus-title').textContent = nextPending.title;
      document.getElementById('active-focus-subtitle').textContent = `Goal: ${nextPending.goalTitle} • Scheduled: ${nextPending.timeSlot || '09:00 AM'}`;

      const duration = window.getScaledFocusDuration(nextPending);
      const breakDuration = duration >= 45 ? 10 : 5;

      document.getElementById('active-focus-duration').textContent = duration;
      document.getElementById('active-focus-break').textContent = breakDuration;

      const startBtn = document.getElementById('active-focus-start-btn');
      if (startBtn) startBtn.onclick = () => { window.triggerFocusTimerStart(nextPending.id); };
    } else {
      highlightPanel.style.display = 'none';
      // Show empty state card only when there are no goals at all
      if (noMissionCard) {
        noMissionCard.style.display = activeGoals.length === 0 ? 'block' : 'none';
      }
    }
  }

  function renderSmartReminders() {
    const remindersContainer = document.getElementById('reminders-list');
    if (!remindersContainer) return;
    remindersContainer.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const missions = window.AppState.data ? window.AppState.data.missions || [] : [];
    const activeGoals = window.AppState.getActiveGoals();
    const activeGoalIds = activeGoals.map(g => g.id);

    const reminderItems = [];

    // 1. Check for missed tasks (uncompleted missions in the past of active goals)
    const missedMissions = missions.filter(m => activeGoalIds.includes(m.goalId) && !m.completed && m.date < today);
    if (missedMissions.length > 0) {
      missedMissions.slice(0, 2).forEach(m => {
        reminderItems.push({
          type: 'warning',
          title: 'MISSED SESSION',
          msg: `Warning: You missed "${m.title}" scheduled for ${m.date}. Aegis has redistributed it.`,
          icon: '⚠️'
        });
      });
    }

    // 2. Check for upcoming sessions (uncompleted missions scheduled for today)
    const upcomingMissions = missions.filter(m => activeGoalIds.includes(m.goalId) && !m.completed && m.date === today);
    if (upcomingMissions.length > 0) {
      upcomingMissions.forEach(m => {
        reminderItems.push({
          type: 'info',
          title: 'UPCOMING SESSION',
          msg: `⏰ Focus scheduled: "${m.title}" at ${m.timeSlot} today. Keep your streak!`,
          icon: '⏰'
        });
      });
    }

    // 3. Preferred study time reminders
    activeGoals.forEach(goal => {
      const answers = goal.answers || {};
      const preferredTime = answers.workingTime || 'morning';
      const slot = answers.dailyTime || '30m';
      
      const hour = new Date().getHours();
      let matchesTimeOfDay = false;
      if (preferredTime === 'morning' && hour >= 6 && hour < 12) matchesTimeOfDay = true;
      else if (preferredTime === 'afternoon' && hour >= 12 && hour < 17) matchesTimeOfDay = true;
      else if (preferredTime === 'evening' && hour >= 17 && hour < 22) matchesTimeOfDay = true;
      else if (preferredTime === 'night' && (hour >= 22 || hour < 6)) matchesTimeOfDay = true;

      let msg = "";
      if (matchesTimeOfDay) {
        msg = `Your focus window for "${goal.title}" is open. Perfect time to focus!`;
      } else {
        msg = `Prepare for a ${slot} focus session scheduled for this ${preferredTime}.`;
      }

      reminderItems.push({
        type: 'primary',
        title: `${preferredTime.toUpperCase()} FOCUS WINDOW`,
        msg: msg,
        icon: '🔔'
      });
    });

    if (reminderItems.length === 0) {
      remindersContainer.innerHTML = `
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; padding: 0.5rem;">
          No reminders. You are fully up to date!
        </div>
      `;
      return;
    }

    // Limit display to 3 total reminders, prioritizing warnings and upcomings
    reminderItems.sort((a, b) => {
      const order = { 'warning': 1, 'info': 2, 'primary': 3 };
      return order[a.type] - order[b.type];
    });

    reminderItems.slice(0, 3).forEach(item => {
      const card = document.createElement('div');
      card.className = 'reminder-item';
      
      let borderCol = 'rgba(56, 189, 248, 0.15)';
      let bgCol = 'rgba(56, 189, 248, 0.08)';
      let textCol = 'var(--info)';
      if (item.type === 'warning') {
        borderCol = 'rgba(245, 158, 11, 0.2)';
        bgCol = 'rgba(245, 158, 11, 0.06)';
        textCol = 'var(--warning)';
      } else if (item.type === 'primary') {
        borderCol = 'rgba(59, 130, 246, 0.2)';
        bgCol = 'rgba(59, 130, 246, 0.06)';
        textCol = 'var(--primary)';
      }

      card.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        background: ${bgCol};
        padding: 0.75rem;
        border-radius: var(--radius-md);
        border: 1px solid ${borderCol};
      `;
      card.innerHTML = `
        <div style="font-size: 1.1rem; color: ${textCol};">${item.icon}</div>
        <div>
          <h5 style="font-weight: 600; font-size: 0.8rem; color: ${textCol};">${item.title}</h5>
          <p style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.1rem; line-height: 1.35;">${item.msg}</p>
        </div>
      `;
      remindersContainer.appendChild(card);
    });
  }

  function renderStatsHeader() {
    const stats = window.AppState.data.userStats;
    
    // Streaks & Hours
    streakPill.textContent = `${stats.streak} Day Streak`;
    const focusHours = (stats.totalFocusMinutes / 60).toFixed(1);
    minutesPill.textContent = `${focusHours} Hours Focus`;

    // Quick Progress panel (new dashboard sidebar)
    const dashStreakQuick = document.getElementById('dash-streak-quick');
    if (dashStreakQuick) dashStreakQuick.textContent = `${stats.streak} days`;

    // Weekly ring animation
    const weeklyRingCircle = document.getElementById('weekly-ring-circle');
    const weeklyRingPct = document.getElementById('weekly-ring-pct');
    const weeklyDoneLabel = document.getElementById('weekly-done-label');
    if (weeklyRingCircle && window.AppState.data) {
      const today = new Date();
      const allMissions = window.AppState.data.missions || [];
      // Count missions in the current 7-day window
      let weekDone = 0, weekTotal = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const dayMissions = allMissions.filter(m => m.date === ds);
        weekTotal += dayMissions.length;
        weekDone += dayMissions.filter(m => m.completed).length;
      }
      const pct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
      const circumference = 182.2;
      weeklyRingCircle.style.strokeDashoffset = circumference - (circumference * pct / 100);
      if (weeklyRingPct) weeklyRingPct.textContent = `${pct}%`;
      if (weeklyDoneLabel) weeklyDoneLabel.textContent = `${weekDone} / ${weekTotal} sessions`;
    }
 
    // Status Badge & Sidebar formatting
    sidebarStatusBadge.textContent = stats.status === 'recovery' ? 'Recovery' : 'Active';
    if (stats.status === 'recovery') {
      sidebarStatusBadge.style.color = 'var(--warning)';
      sidebarStatusBadge.style.textShadow = '0 0 8px var(--warning-glow)';
      document.getElementById('avatar-circle').style.background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    } else {
      sidebarStatusBadge.style.color = 'var(--primary)';
      sidebarStatusBadge.style.textShadow = '0 0 8px var(--primary-glow)';
      document.getElementById('avatar-circle').style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';
    }

    // Daily Insight Values
    let lvl = "Initiate (Level 1)";
    if (stats.totalFocusMinutes >= 600) lvl = "Zen Master (Level 4)";
    else if (stats.totalFocusMinutes >= 300) lvl = "Deep Diver (Level 3)";
    else if (stats.totalFocusMinutes >= 100) lvl = "Adept (Level 2)";
    if (insightDnaLevel) insightDnaLevel.textContent = lvl;

    // Completions ratio — updates both the old insight chip and new schedule badge
    const todaysMissions = window.AppState.getTodaysMissions();
    const completedMissions = todaysMissions.filter(m => m.completed).length;
    const completionText = `${completedMissions} / ${todaysMissions.length} done`;
    if (insightCompletions) insightCompletions.textContent = completionText;

    // Resilience score
    if (insightResilience) insightResilience.textContent = `${stats.resilienceScore}%`;
  }

  function renderActiveGoals() {
    if (!goalsListContainer) return;
    goalsListContainer.innerHTML = '';

    const activeGoals = window.AppState.getActiveGoals();
    goalsCountLabel.textContent = `(${activeGoals.length}/3)`;

    if (activeGoals.length === 0) {
      // Render Empty State
      goalsListContainer.innerHTML = `
        <div class="goals-empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24"><path stroke="currentColor" fill="none" stroke-width="2" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h4 style="margin-bottom: 0.25rem;">No Active Goals</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Rule 2 requires at least one active goal to list tasks. Let's create one!</p>
          </div>
          <button class="btn btn-primary" id="empty-state-create-btn" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">
            Launch AI Planner
          </button>
        </div>
      `;

      // Bind empty state button
      document.getElementById('empty-state-create-btn').addEventListener('click', () => {
        document.querySelector('[data-view="planner-view"]').click();
      });
      return;
    }

    activeGoals.forEach(goal => {
      const card = document.createElement('div');
      card.className = 'glass-card goal-card';
      card.innerHTML = `
        <div class="goal-header">
          <div>
            <h4 class="goal-title">${goal.title}</h4>
            <div class="goal-reason">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>${goal.reason}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap: 0.5rem;">
            <span class="goal-deadline">Ends: ${goal.deadline}</span>
            <button class="btn btn-secondary complete-goal-btn" data-goal-id="${goal.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Archive / Complete Goal">
              Archive
            </button>
          </div>
        </div>
        <div class="goal-progress-bar-container">
          <div class="goal-progress-bar" style="width: ${goal.progress}%"></div>
        </div>
        <div class="goal-stats">
          <span>Overall Plan Progress</span>
          <span class="goal-percent">${goal.progress}%</span>
        </div>
      `;

      // Bind Complete/Archive Goal Action
      card.querySelector('.complete-goal-btn').addEventListener('click', (e) => {
        const goalId = e.target.getAttribute('data-goal-id');
        if (confirm("Are you sure you want to archive this goal? Outstanding missions will be cleared.")) {
          window.AppState.completeGoal(goalId);
          window.showToast("Goal successfully completed/archived.", 'primary');
        }
      });

      goalsListContainer.appendChild(card);
    });
  }

  function renderDailyMissions() {
    if (!missionsListContainer) return;
    missionsListContainer.innerHTML = '';

    const todaysMissions = window.AppState.getTodaysMissions();

    if (todaysMissions.length === 0) {
      missionsListContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem;">
          No active daily daily missions. Plan a goal to generate focus objectives.
        </div>
      `;
      return;
    }

    const isInRecovery = window.AppState.data.userStats.status === 'recovery';

    todaysMissions.forEach(mission => {
      const item = document.createElement('div');
      item.className = `mission-item ${mission.completed ? 'completed' : ''}`;
      
      const duration = window.getScaledFocusDuration(mission);
      const breakDuration = duration >= 45 ? 10 : 5;
      const isTimerNeeded = !mission.focusSessionCompleted && !mission.completed;

      item.innerHTML = `
        <div class="mission-left">
          <div class="mission-checkbox" data-mission-id="${mission.id}">
            ${mission.completed ? '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </div>
          <div class="mission-content">
            <span class="mission-title">${mission.title}</span>
            <span class="mission-goal-name">Origin: ${mission.goalTitle} • Scheduled: ${mission.timeSlot || '09:00 AM'}</span>
            ${mission.completed ? `<span style="font-size: 0.75rem; color: var(--primary); font-style: italic; margin-top: 0.15rem;">Reflection: "${mission.reflections}"</span>` : ''}
          </div>
        </div>
        <div class="mission-right">
          <span class="mission-focus-tag" style="${mission.focusSessionCompleted ? 'color: var(--primary); border-color: rgba(34, 197, 94, 0.25); background: rgba(34, 197, 94, 0.05);' : ''}">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${duration}m Focus + ${breakDuration}m Break${isInRecovery ? '*' : ''}
          </span>
          ${isTimerNeeded ? `
            <button class="btn btn-primary start-mission-timer-btn" data-mission-id="${mission.id}" style="padding: 0.4rem 0.85rem; font-size: 0.75rem;">
              Start Focus
            </button>
          ` : ''}
        </div>
      `;

      // 1. Checkbox click trigger (mark complete)
      item.querySelector('.mission-checkbox').addEventListener('click', () => {
        if (mission.completed) return;

        if (mission.focusSessionCompleted) {
          window.openAccountabilityModal(mission.id);
        } else {
          window.showToast("Rule 3: Start a focus session before marking this task complete.", 'warning');
          // highlight start timer btn
          const timerBtn = item.querySelector('.start-mission-timer-btn');
          if (timerBtn) {
            timerBtn.style.animation = 'pulseScale 0.6s infinite ease-in-out';
            setTimeout(() => timerBtn.style.animation = '', 1800);
          }
        }
      });

      // 2. Start Focus button click trigger
      if (isTimerNeeded) {
        item.querySelector('.start-mission-timer-btn').addEventListener('click', (e) => {
          const missionId = e.target.getAttribute('data-mission-id');
          window.triggerFocusTimerStart(missionId);
        });
      }

      missionsListContainer.appendChild(item);
    });
  }

  function renderAchievementsList() {
    if (!achievementsContainer) return;
    achievementsContainer.innerHTML = '';

    const achievements = window.AppState.data.achievements;
    const stats = window.AppState.data.userStats;

    const ICONS = {
      first_goal:     { emoji: '⭐', color: '#22C55E', hint: 'Create a goal' },
      deep_focus:     { emoji: '🎯', color: '#EC4899', hint: 'Complete a focus session' },
      streak_3:       { emoji: '🔥', color: '#F59E0B', hint: `${stats.streak}/3 day streak` },
      streak_7:       { emoji: '🗓️', color: '#38BDF8', hint: `${stats.streak}/7 day streak` },
      focus_100h:     { emoji: '💯', color: '#A855F7', hint: `${stats.totalFocusMinutes}/6000 min` },
      goal_champion:  { emoji: '🏆', color: '#22C55E', hint: 'Archive a completed goal' },
      bounceback:     { emoji: '🛡️', color: '#F59E0B', hint: 'Graduate from recovery mode' }
    };

    achievements.forEach(ach => {
      const meta = ICONS[ach.id] || { emoji: '🏅', color: '#22C55E', hint: '' };
      const badge = document.createElement('div');
      badge.className = `achievement-badge ${ach.unlocked ? '' : 'locked'}`;

      if (ach.unlocked) {
        badge.style.cssText = `border-color: ${meta.color}40; box-shadow: 0 0 20px ${meta.color}18;`;
      }

      badge.innerHTML = `
        <div class="achievement-icon-wrapper" style="${ach.unlocked ? `color: ${meta.color}; filter: drop-shadow(0 0 6px ${meta.color}80);` : 'opacity: 0.35;'}">${ach.unlocked ? meta.emoji : '🔒'}</div>
        <div class="achievement-info">
          <span class="achievement-name" style="${ach.unlocked ? `color: ${meta.color};` : ''}">${ach.name}</span>
          <span class="achievement-desc">${ach.desc}</span>
          ${!ach.unlocked ? `<span style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.15rem; font-style: italic;">Hint: ${meta.hint}</span>` : `<span style="font-size: 0.7rem; color: ${meta.color}; margin-top: 0.15rem; font-weight: 600;">✓ Unlocked</span>`}
        </div>
      `;
      achievementsContainer.appendChild(badge);
    });
  }

  // ─── New View Renderers ───────────────────────────────────────────────────

  function renderGoalsView() {
    const activeList   = document.getElementById('goals-view-active-list');
    const archivedList = document.getElementById('goals-view-archived-list');
    if (!activeList || !archivedList || !window.AppState.data) return;

    const allGoals = window.AppState.data.goals;
    const activeGoals   = allGoals.filter(g => g.status === 'active');
    const archivedGoals = allGoals.filter(g => g.status !== 'active');

    activeList.innerHTML = '';
    if (activeGoals.length === 0) {
      activeList.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:2rem;font-size:0.85rem;">No active goals. Click "+ Create New Goal" to get started.</div>`;
    } else {
      activeGoals.forEach(goal => {
        const card = document.createElement('div');
        card.className = 'glass-card goal-card';
        card.innerHTML = `
          <div class="goal-header">
            <div>
              <h4 class="goal-title">${goal.title}</h4>
              <div class="goal-reason"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>${goal.reason}</span></div>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span class="goal-deadline">Ends: ${goal.deadline}</span>
              <button class="btn btn-secondary complete-goal-btn" data-goal-id="${goal.id}" style="padding:0.25rem 0.5rem;font-size:0.75rem;">Archive</button>
            </div>
          </div>
          <div class="goal-progress-bar-container"><div class="goal-progress-bar" style="width:${goal.progress || 0}%"></div></div>
          <div class="goal-stats"><span>Plan Progress</span><span class="goal-percent">${goal.progress || 0}%</span></div>
        `;
        card.querySelector('.complete-goal-btn').addEventListener('click', e => {
          if (confirm('Archive this goal? Outstanding missions will be cleared.')) {
            window.AppState.completeGoal(e.target.getAttribute('data-goal-id'));
            window.showToast('Goal archived.', 'primary');
          }
        });
        activeList.appendChild(card);
      });
    }

    archivedList.innerHTML = '';
    if (archivedGoals.length === 0) {
      archivedList.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;">No archived goals yet.</div>`;
    } else {
      archivedGoals.forEach(goal => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;border-radius:var(--radius-md);background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.1);';
        row.innerHTML = `<div><strong style="font-size:0.9rem;">${goal.title}</strong><div style="font-size:0.75rem;color:var(--text-muted);">Completed · ${goal.deadline}</div></div><span style="color:var(--emerald);font-size:0.8rem;font-weight:600;">✓ Archived</span>`;
        archivedList.appendChild(row);
      });
    }

    // Wire the Create New Goal button in goals-view
    const goalsAddBtn = document.getElementById('goals-add-goal-btn');
    if (goalsAddBtn) {
      goalsAddBtn.onclick = () => {
        if (window.AppState.getActiveGoals().length >= 3) { window.openGoalLimitModal(); return; }
        document.querySelector('[data-view="planner-view"]').click();
        setTimeout(() => {
          const cc = document.getElementById('planner-calendar-container');
          const wc = document.getElementById('planner-wizard-container');
          if (cc) cc.style.display = 'none';
          if (wc) wc.style.display = 'block';
        }, 100);
      };
    }
  }

  function renderProgressView() {
    if (!window.AppState.data) return;
    const stats = window.AppState.data.userStats;
    const totalMins  = document.getElementById('stat-total-mins');
    const streakMax  = document.getElementById('stat-streak-max');
    const sessCount  = document.getElementById('stat-sessions-count');
    if (totalMins)  totalMins.textContent  = stats.totalFocusMinutes;
    if (streakMax)  streakMax.textContent  = `${stats.longestStreak}d`;
    if (sessCount)  sessCount.textContent  = stats.focusSessionsCount;
    if (window.renderAnalytics) window.renderAnalytics();
  }

  function renderRecoveryView() {
    if (!window.AppState.data) return;
    const stats = window.AppState.data.userStats;
    const statusEl = document.getElementById('recovery-status-val');
    const scaleEl  = document.getElementById('recovery-scale-val');
    const splitEl  = document.getElementById('recovery-split-val');
    const listEl   = document.getElementById('recovery-missions-list');

    const isRecovery = stats.status === 'recovery';
    if (statusEl) { statusEl.textContent = isRecovery ? '⚠️ Active – Scaled Mode' : '✅ Deactivated (Normal)'; statusEl.style.color = isRecovery ? 'var(--warning)' : 'var(--emerald)'; }
    if (scaleEl)  scaleEl.textContent  = isRecovery ? '50% (Recovery Mode)' : '100% (Normal)';
    if (splitEl)  splitEl.textContent  = isRecovery ? 'Sessions > 30m split into 2' : 'None';

    if (listEl) {
      const today = new Date().toISOString().split('T')[0];
      const todayMissions = (window.AppState.data.missions || []).filter(m => m.date === today);
      if (todayMissions.length === 0) {
        listEl.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;">No missions scheduled for today.</div>`;
      } else {
        listEl.innerHTML = '';
        todayMissions.forEach(m => {
          const el = document.createElement('div');
          el.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;border-radius:var(--radius-md);background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.1);margin-bottom:0.5rem;';
          el.innerHTML = `<div><strong style="font-size:0.85rem;">${m.title}</strong><div style="font-size:0.72rem;color:var(--text-muted);">${m.goalTitle} · ${m.focusTimeRequired}m · ${m.timeSlot}</div></div>${m.completed ? '<span style="color:var(--emerald);font-size:0.8rem;">✓ Done</span>' : `<button class="btn btn-primary" data-mid="${m.id}" style="padding:0.35rem 0.75rem;font-size:0.75rem;">Start</button>`}`;
          if (!m.completed) {
            el.querySelector('button').addEventListener('click', e => window.triggerFocusTimerStart(e.target.getAttribute('data-mid')));
          }
          listEl.appendChild(el);
        });
      }
    }
  }

  function renderAchievementsView() {
    const container = document.getElementById('achievements-view-full-list');
    if (!container || !window.AppState.data) return;
    container.innerHTML = '';

    const achievements = window.AppState.data.achievements;
    const stats = window.AppState.data.userStats;
    const ICONS = {
      first_goal:     { emoji: '⭐', color: 'var(--emerald)',  hint: 'Create your first goal' },
      deep_focus:     { emoji: '🎯', color: 'var(--accent)',   hint: 'Complete a full focus session' },
      streak_3:       { emoji: '🔥', color: 'var(--warning)',  hint: `${stats.streak}/3 day streak` },
      streak_7:       { emoji: '🗓️', color: 'var(--info)',     hint: `${stats.streak}/7 day streak` },
      focus_100h:     { emoji: '💯', color: 'var(--accent)',   hint: `${stats.totalFocusMinutes}/6000 min` },
      goal_champion:  { emoji: '🏆', color: 'var(--primary)',  hint: 'Archive a completed goal' },
      bounceback:     { emoji: '🛡️', color: 'var(--warning)',  hint: 'Graduate from recovery mode' }
    };

    achievements.forEach(ach => {
      const meta = ICONS[ach.id] || { emoji: '🏅', color: 'var(--primary)', hint: '' };
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.cssText = `padding:1.5rem;display:flex;align-items:center;gap:1.25rem;border-color:${ach.unlocked ? meta.color + '40' : 'var(--card-border)'};${ach.unlocked ? 'box-shadow:0 0 20px ' + meta.color + '18;' : 'opacity:0.6;'}`;
      card.innerHTML = `
        <div style="font-size:2.5rem;filter:${ach.unlocked ? 'none' : 'grayscale(1)'};">${ach.unlocked ? meta.emoji : '🔒'}</div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:0.95rem;color:${ach.unlocked ? meta.color : 'var(--text-secondary)'}; margin-bottom:0.3rem;">${ach.name}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.4rem;">${ach.desc}</div>
          ${ach.unlocked
            ? `<span style="font-size:0.75rem;color:${meta.color};font-weight:600;">✓ Unlocked</span>`
            : `<span style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">Hint: ${meta.hint}</span>`}
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderSettingsView() {
    const usernameInput = document.getElementById('settings-username-input');
    if (usernameInput && window.AppState.currentUser) {
      usernameInput.value = window.AppState.currentUser;
    }
    const saveBtn = document.getElementById('settings-save-profile-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const newName = usernameInput.value.trim();
        try {
          if (newName !== window.AppState.currentUser) {
            window.AppState.changeUsername(newName);
            sidebarUsername.textContent = newName;
            window.showToast('Profile username updated successfully.', 'accent');
          } else {
            window.showToast('Profile settings saved.', 'accent');
          }
        } catch (e) {
          window.showToast(e.message, 'warning');
        }
      };
    }
    const resetBtn = document.getElementById('settings-btn-reset-data');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Reset ALL application data? This cannot be undone.')) {
          window.AppState.reset();
          window.showToast('All data has been reset.', 'warning');
          document.querySelector('[data-view="dashboard-view"]').click();
        }
      };
    }
  }

  // 3. Goal Limit Modals
  window.openGoalLimitModal = function() {
    if (limitModal) limitModal.classList.add('active-modal');
  };

  if (limitModalClose) {
    limitModalClose.addEventListener('click', () => {
      limitModal.classList.remove('active-modal');
    });
  }

  if (dashboardAddGoalBtn) {
    dashboardAddGoalBtn.addEventListener('click', () => {
      if (window.AppState.getActiveGoals().length >= 3) {
        window.openGoalLimitModal();
      } else {
        document.querySelector('[data-view="planner-view"]').click();
        setTimeout(() => {
          const cc = document.getElementById('planner-calendar-container');
          const wc = document.getElementById('planner-wizard-container');
          if (cc) cc.style.display = 'none';
          if (wc) wc.style.display = 'block';
        }, 100);
      }
    });
  }

  // 4. Hook Authentication & State Changes
  if (toRegisterBtn) {
    toRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginPanel.style.display = 'none';
      registerPanel.style.display = 'block';
    });
  }
  if (toLoginBtn) {
    toLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      registerPanel.style.display = 'none';
      loginPanel.style.display = 'block';
    });
  }
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('login-username').value;
      const pass = document.getElementById('login-password').value;
      try {
        window.AppState.login(user, pass);
        window.showToast("Logged in successfully!", 'accent');
      } catch (err) {
        window.showToast(err.message, 'warning');
      }
    });
  }
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('register-username').value;
      const pass = document.getElementById('register-password').value;
      try {
        window.AppState.register(user, pass);
        window.showToast("Account created! Please log in.", 'accent');
        registerForm.reset();
        toLoginBtn.click();
      } catch (err) {
        window.showToast(err.message, 'warning');
      }
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.AppState.logout();
      window.showToast("Logged out successfully.", 'primary');
    });
  }

  window.addEventListener('stateChanged', () => {
    if (!window.AppState.currentUser) return;
    renderDashboard();
    // Refresh whichever secondary view is currently active
    const activeView = document.querySelector('.view-section.active-view');
    if (activeView) {
      const vid = activeView.id;
      if (vid === 'goals-view')        renderGoalsView();
      else if (vid === 'progress-view')   renderProgressView();
      else if (vid === 'recovery-view')   renderRecoveryView();
      else if (vid === 'achievements-view') renderAchievementsView();
      else if (vid === 'planner-view' && window.renderWeeklyCalendar) window.renderWeeklyCalendar();
    }
  });

  // Initial authentication check
  checkAuth();
})();
