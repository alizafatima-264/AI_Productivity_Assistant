/**
 * State Management Engine for AI Productivity Assistant
 */

const STATE_KEY = 'aegis_focus_state_v1';

// Initial default state
const initialData = {
  goals: [], // { id, title, reason, deadline, dateCreated, status: 'active'|'completed' }
  missions: [], // { id, goalId, goalTitle, title, dayIndex, completed: false, focusSessionCompleted: false, focusTimeRequired: 25, reflections: '' }
  userStats: {
    streak: 0,
    longestStreak: 0,
    totalFocusMinutes: 0,
    focusSessionsCount: 0,
    resilienceScore: 100,
    status: 'active', // 'active' | 'recovery'
    missedDaysCount: 0,
    lastActiveDate: null, // "YYYY-MM-DD"
    history: [] // { date: "YYYY-MM-DD", focusMinutes: number, missionsCompleted: number, totalMissions: number }
  },
  achievements: [
    { id: 'first_goal',     name: 'First Milestone',      desc: 'Create your first goal with a personal reason.',              unlocked: false },
    { id: 'deep_focus',    name: 'Deep Diver',            desc: 'Complete a full focus session without leaving the tab.',       unlocked: false },
    { id: 'streak_3',      name: 'Three Flame',           desc: 'Maintain a 3-day focus streak.',                              unlocked: false },
    { id: 'streak_7',      name: '7-Day Warrior',         desc: 'Maintain a full week of unbroken focus execution.',           unlocked: false },
    { id: 'focus_100h',    name: 'Century Club',          desc: 'Accumulate 100 total hours (6,000 minutes) of deep focus.',   unlocked: false },
    { id: 'goal_champion', name: 'Goal Champion',         desc: 'Complete and archive your first goal entirely.',              unlocked: false },
    { id: 'bounceback',    name: 'Resilient Bounceback',  desc: 'Graduate from Recovery Mode by completing missions.',         unlocked: false }
  ]
};

// Application Global State
window.AppState = {
  currentUser: localStorage.getItem('aegis_current_user_v1') || null,
  data: null,

  init() {
    if (this.currentUser) {
      this.loadUser(this.currentUser);
    }
  },

  register(username, password) {
    const users = JSON.parse(localStorage.getItem('aegis_users_v1')) || {};
    const lowerName = username.trim().toLowerCase();
    if (!lowerName || !password) {
      throw new Error("Username and password are required.");
    }
    if (users[lowerName]) {
      throw new Error("Username already exists.");
    }
    users[lowerName] = {
      username: username.trim(),
      password: password,
      data: JSON.parse(JSON.stringify(initialData))
    };
    localStorage.setItem('aegis_users_v1', JSON.stringify(users));
  },

  login(username, password) {
    const users = JSON.parse(localStorage.getItem('aegis_users_v1')) || {};
    const lowerName = username.trim().toLowerCase();
    if (!users[lowerName] || users[lowerName].password !== password) {
      throw new Error("Invalid username or password.");
    }
    localStorage.setItem('aegis_current_user_v1', users[lowerName].username);
    this.loadUser(users[lowerName].username);
    window.dispatchEvent(new CustomEvent('authChanged'));
  },

  logout() {
    localStorage.removeItem('aegis_current_user_v1');
    this.currentUser = null;
    this.data = null;
    window.dispatchEvent(new CustomEvent('authChanged'));
  },

  loadUser(username) {
    const users = JSON.parse(localStorage.getItem('aegis_users_v1')) || {};
    const lowerName = username.toLowerCase();
    if (users[lowerName]) {
      this.currentUser = users[lowerName].username;
      this.data = users[lowerName].data;
    }
  },

  // Save state to localstorage for current user
  save() {
    if (!this.currentUser) return;
    const users = JSON.parse(localStorage.getItem('aegis_users_v1')) || {};
    const lowerName = this.currentUser.toLowerCase();
    if (users[lowerName]) {
      users[lowerName].data = this.data;
      localStorage.setItem('aegis_users_v1', JSON.stringify(users));
    }
    // Dispatch state changed event for components to re-render
    window.dispatchEvent(new CustomEvent('stateChanged'));
  },

  // Reset to initial state
  reset() {
    if (!this.currentUser) return;
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
  },

  // Rename current username/profile
  changeUsername(newUsername) {
    const trimmed = newUsername.trim();
    if (!trimmed) {
      throw new Error("Username cannot be empty.");
    }
    if (!this.currentUser) return;
    const lowerOld = this.currentUser.toLowerCase();
    const lowerNew = trimmed.toLowerCase();

    const users = JSON.parse(localStorage.getItem('aegis_users_v1')) || {};

    if (lowerOld === lowerNew) {
      if (users[lowerOld]) {
        users[lowerOld].username = trimmed;
        localStorage.setItem('aegis_users_v1', JSON.stringify(users));
        this.currentUser = trimmed;
        localStorage.setItem('aegis_current_user_v1', trimmed);
        this.save();
      }
      return;
    }

    if (users[lowerNew]) {
      throw new Error("Username already exists.");
    }

    if (users[lowerOld]) {
      users[lowerNew] = {
        username: trimmed,
        password: users[lowerOld].password,
        data: this.data
      };
      delete users[lowerOld];
      localStorage.setItem('aegis_users_v1', JSON.stringify(users));
      this.currentUser = trimmed;
      localStorage.setItem('aegis_current_user_v1', trimmed);
      this.save();
    }
  },

  // Helper: Get active goals (limit is 3)
  getActiveGoals() {
    if (!this.data || !this.data.goals) return [];
    return this.data.goals.filter(g => g.status === 'active');
  },

  // Add new Goal and generate plans
  addGoal(title, reason, deadline, answers, priority, missionsList) {
    if (this.getActiveGoals().length >= 3) {
      throw new Error("Goal limit reached. You can only have up to 3 active goals simultaneously.");
    }
    if (!reason || reason.trim().length < 10) {
      throw new Error("Goal reason is mandatory to keep you accountable (Rule 1).");
    }

    const goalId = 'goal_' + Date.now();
    const newGoal = {
      id: goalId,
      title: title.trim(),
      reason: reason.trim(),
      deadline: deadline,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      answers: answers,
      priority: priority
    };

    this.data.goals.push(newGoal);

    // Map and add missions
    const formattedMissions = missionsList.map((m, idx) => ({
      id: `mission_${goalId}_${idx}`,
      goalId: goalId,
      goalTitle: newGoal.title,
      title: m.title,
      date: m.date,
      dayIndex: m.dayIndex,
      timeSlot: m.timeSlot || "09:00 AM",
      completed: false,
      focusSessionCompleted: false,
      focusTimeRequired: m.focusTimeRequired || 25,
      reflections: ''
    }));

    this.data.missions.push(...formattedMissions);
    this.triggerAchievement('first_goal');
    this.save();
    return newGoal;
  },

  // Toggle Goal status
  completeGoal(goalId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal) {
      goal.status = 'completed';
      // Mark outstanding missions as completed or delete them
      this.data.missions = this.data.missions.filter(m => m.goalId !== goalId || m.completed);
      this.triggerAchievement('goal_champion');
      this.save();
    }
  },

  // Get missions for "Today"
  getTodaysMissions() {
    if (!this.data || !this.data.missions) return [];
    const activeGoals = this.getActiveGoals();
    const activeGoalIds = activeGoals.map(g => g.id);
    const today = new Date().toISOString().split('T')[0];
    
    return this.data.missions.filter(m => {
      // Must belong to active goal
      if (!activeGoalIds.includes(m.goalId)) return false;
      return m.date === today;
    });
  },

  // Complete a focus session for a mission
  completeFocusSession(missionId, focusMinutes) {
    const mission = this.data.missions.find(m => m.id === missionId);
    if (mission) {
      mission.focusSessionCompleted = true;
      
      // Update statistics
      this.data.userStats.totalFocusMinutes += focusMinutes;
      this.data.userStats.focusSessionsCount += 1;
      
      this.triggerAchievement('deep_focus');
      this.save();
    } else {
      // General focus session (no mission)
      this.data.userStats.totalFocusMinutes += focusMinutes;
      this.data.userStats.focusSessionsCount += 1;
      this.save();
    }
  },

  // Complete mission with accountability reflection (Rule 3 check)
  completeMission(missionId, reflections) {
    const mission = this.data.missions.find(m => m.id === missionId);
    if (!mission) return;
    
    if (!mission.focusSessionCompleted) {
      throw new Error("Rule 3: You must complete a focus session before marking this task complete.");
    }
    
    mission.completed = true;
    mission.reflections = reflections.trim();
    
    // Update goal progress
    this.updateGoalProgress(mission.goalId);
    this.updateDailyStats();
    
    // If in recovery mode, check if all today's missions are completed
    if (this.data.userStats.status === 'recovery') {
      const todaysMissions = this.getTodaysMissions();
      const allCompleted = todaysMissions.every(m => m.completed);
      if (allCompleted) {
        this.graduateRecoveryMode();
      }
    }

    this.save();
  },

  // Update percentage progress for a goal
  updateGoalProgress(goalId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const goalMissions = this.data.missions.filter(m => m.goalId === goalId);
    const completedCount = goalMissions.filter(m => m.completed).length;
    
    if (goalMissions.length > 0) {
      goal.progress = Math.round((completedCount / goalMissions.length) * 100);
      if (goal.progress >= 100) {
        goal.status = 'completed';
      }
    }
  },

  // Unlock an achievement
  triggerAchievement(id) {
    const ach = this.data.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      // Dispatch toast event
      window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: ach }));
    }
  },

  // Helper date diff
  getDaysDifference(date1Str, date2Str) {
    const d1 = new Date(date1Str);
    const d2 = new Date(date2Str);
    const diffTime = d2 - d1;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  },

  // Handle day-by-day stats rollup
  updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.data.userStats;
    
    // Update streak if this is a new day
    if (stats.lastActiveDate !== today) {
      if (stats.lastActiveDate) {
        const diff = this.getDaysDifference(stats.lastActiveDate, today);
        if (diff === 1) {
          stats.streak += 1;
          if (stats.streak > stats.longestStreak) {
            stats.longestStreak = stats.streak;
          }
          if (stats.streak >= 3) this.triggerAchievement('streak_3');
          if (stats.streak >= 7) this.triggerAchievement('streak_7');
        } else if (diff > 1) {
          // Reset streak
          stats.streak = 1;
        }
      } else {
        stats.streak = 1;
      }
      stats.lastActiveDate = today;
    }

    // Century Club: 6000 minutes = 100 hours
    if (stats.totalFocusMinutes >= 6000) {
      this.triggerAchievement('focus_100h');
    }
  },

  // Transition day simulation helper
  simulateDayPassage() {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.data.userStats;

    // Log yesterday's history
    const todaysMissions = this.getTodaysMissions();
    const completedCount = todaysMissions.filter(m => m.completed).length;
    const focusMinsToday = todaysMissions
      .filter(m => m.completed)
      .reduce((sum, m) => sum + (m.focusTimeRequired || 25), 0);

    // Find and update/add history entry for yesterday
    const existingHistoryIdx = stats.history.findIndex(h => h.date === today);
    if (existingHistoryIdx >= 0) {
      stats.history[existingHistoryIdx].focusMinutes += focusMinsToday;
      stats.history[existingHistoryIdx].missionsCompleted += completedCount;
      stats.history[existingHistoryIdx].totalMissions += todaysMissions.length;
    } else {
      stats.history.push({
        date: today,
        focusMinutes: focusMinsToday,
        missionsCompleted: completedCount,
        totalMissions: todaysMissions.length
      });
    }

    // Shift all mission dates back by 1 day so that tomorrow's missions become today's
    this.data.missions.forEach(m => {
      const d = new Date(m.date);
      d.setDate(d.getDate() - 1);
      m.date = d.toISOString().split('T')[0];
    });

    // Shift goal start dates and deadlines back by 1 day
    this.data.goals.forEach(g => {
      if (g.status === 'active') {
        const d1 = new Date(g.dateCreated);
        d1.setDate(d1.getDate() - 1);
        g.dateCreated = d1.toISOString().split('T')[0];

        const d2 = new Date(g.deadline);
        d2.setDate(d2.getDate() - 1);
        g.deadline = d2.toISOString().split('T')[0];
      }
    });

    // Handle missed day triggers for streak/recovery
    if (completedCount === 0 && todaysMissions.length > 0) {
      stats.missedDaysCount += 1;
      stats.streak = 0; // Streak breaks

      if (stats.missedDaysCount >= 3) {
        this.triggerRecoveryMode();
      }
    } else {
      stats.missedDaysCount = 0; // reset counter
    }

    // Adapt: redistribute missed missions to future days
    this.redistributeMissedMissions();

    // Reset daily checkboxes & focus session markers for next day's tasks (which are now shifted to today)
    const nextMissions = this.getTodaysMissions();
    nextMissions.forEach(m => {
      m.completed = false;
      m.focusSessionCompleted = false;
      m.reflections = '';
    });

    // Keep history clean (last 14 days)
    if (stats.history.length > 14) {
      stats.history.shift();
    }

    this.save();
  },

  // Simulate skipping 3 consecutive days directly
  simulateMissedDaysTrigger() {
    const stats = this.data.userStats;
    stats.streak = 0;
    stats.missedDaysCount = 3;
    this.triggerRecoveryMode();
    this.save();
  },

  // Recovery Mode activation
  triggerRecoveryMode() {
    const stats = this.data.userStats;
    stats.status = 'recovery';
    stats.resilienceScore = Math.max(20, stats.resilienceScore - 15);
    
    // Scale and split any upcoming missions
    this.scaleAndSplitMissionsForRecovery();

    // Inject custom UI visual state
    document.body.classList.add('in-recovery-mode');
    this.save();
  },

  // Recovery Mode graduation
  graduateRecoveryMode() {
    const stats = this.data.userStats;
    stats.status = 'active';
    stats.missedDaysCount = 0;
    stats.resilienceScore = Math.min(100, stats.resilienceScore + 10);
    
    document.body.classList.remove('in-recovery-mode');
    this.triggerAchievement('bounceback');
    this.save();
  },

  // Redistribute missed missions starting from today
  redistributeMissedMissions() {
    const today = new Date().toISOString().split('T')[0];
    const activeGoalIds = this.getActiveGoals().map(g => g.id);
    // Find uncompleted missions of active goals in the past
    const pastUncompleted = this.data.missions.filter(m => 
      activeGoalIds.includes(m.goalId) && !m.completed && m.date < today
    );
    
    if (pastUncompleted.length === 0) return;
    
    let currentMoveDate = new Date(today);
    
    pastUncompleted.forEach(m => {
      let found = false;
      while (!found) {
        const checkDateStr = currentMoveDate.toISOString().split('T')[0];
        // Count missions currently scheduled on this date
        const countOnDate = this.data.missions.filter(tm => tm.date === checkDateStr && activeGoalIds.includes(tm.goalId)).length;
        
        if (countOnDate < 2) {
          m.date = checkDateStr;
          found = true;
        }
        currentMoveDate.setDate(currentMoveDate.getDate() + 1);
      }
    });
  },

  // Scale and split missions in recovery mode
  scaleAndSplitMissionsForRecovery() {
    const today = new Date().toISOString().split('T')[0];
    const activeGoalIds = this.getActiveGoals().map(g => g.id);
    
    const futureMissions = this.data.missions.filter(m => 
      activeGoalIds.includes(m.goalId) && !m.completed && m.date >= today
    );

    const extraMissions = [];

    futureMissions.forEach(m => {
      // Split if greater than 30 mins
      if (m.focusTimeRequired > 30) {
        const originalDuration = m.focusTimeRequired;
        const firstHalf = Math.round(originalDuration / 2);
        const secondHalf = originalDuration - firstHalf;

        m.focusTimeRequired = firstHalf;

        const nextDay = new Date(m.date);
        nextDay.setDate(nextDay.getDate() + 1);

        extraMissions.push({
          id: m.id + '_split_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          goalId: m.goalId,
          goalTitle: m.goalTitle,
          title: `${m.title} (Part 2)`,
          date: nextDay.toISOString().split('T')[0],
          dayIndex: m.dayIndex + 1,
          timeSlot: m.timeSlot,
          completed: false,
          focusSessionCompleted: false,
          focusTimeRequired: secondHalf,
          reflections: ''
        });
      }
    });

    if (extraMissions.length > 0) {
      this.data.missions.push(...extraMissions);
    }
  }
};

// Initialize AppState on load
window.AppState.init();

if (window.AppState.data && window.AppState.data.userStats && window.AppState.data.userStats.status === 'recovery') {
  document.body.classList.add('in-recovery-mode');
}
