/**
 * Canvas Charts and Productivity DNA Grid Heatmap
 */

(function() {
  const chartCanvas = document.getElementById('focus-duration-chart');
  const heatmapGrid = document.getElementById('analytics-heatmap-grid');

  // Redraw analytics when state changes
  window.addEventListener('stateChanged', renderAnalytics);

  function getPast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  function getDayLabel(dateStr) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  }

  // 1. Draw Canvas Chart for Focus Duration
  function drawChart() {
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    
    // Set display sizing correctly for high DPI screens
    const rect = chartCanvas.getBoundingClientRect();
    chartCanvas.width = rect.width * window.devicePixelRatio;
    chartCanvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Get stats data
    const last7Days = getPast7Days();
    const history = window.AppState.data.userStats.history || [];

    // Synthesize data if empty so the UI looks beautiful immediately
    const chartData = last7Days.map(date => {
      const histEntry = history.find(h => h.date === date);
      if (histEntry) {
        return { date, value: histEntry.focusMinutes };
      } else {
        // Return 0 if no record exists
        return { date, value: 0 };
      }
    });

    // Determine max value for scaling (min 60 to look nice)
    const maxVal = Math.max(60, ...chartData.map(d => d.value)) * 1.15;

    // Chart layouts
    const paddingLeft = 35;
    const paddingBottom = 25;
    const paddingTop = 20;
    const paddingRight = 10;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Draw Y-Axis grid lines
    const gridLinesCount = 4;
    ctx.strokeStyle = 'rgba(32, 58, 52, 0.3)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8EAEA5';
    ctx.font = '10px Inter';
    
    for (let i = 0; i <= gridLinesCount; i++) {
      const val = Math.round((maxVal / gridLinesCount) * i);
      const y = height - paddingBottom - (chartHeight / gridLinesCount) * i;
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Label
      ctx.fillText(`${val}m`, 5, y + 3);
    }

    // Draw Bars
    const barCount = chartData.length;
    const spacing = 18;
    const totalSpacing = spacing * (barCount - 1);
    const barWidth = (chartWidth - totalSpacing) / barCount;

    chartData.forEach((d, idx) => {
      const x = paddingLeft + idx * (barWidth + spacing);
      const barHeight = (d.value / maxVal) * chartHeight;
      const y = height - paddingBottom - barHeight;

      // Draw rounded bar
      ctx.fillStyle = d.value > 0 ? 'rgba(255, 77, 141, 0.85)' : 'rgba(32, 58, 52, 0.2)';
      
      // If value is greater than 0, add glowing shadows
      if (d.value > 0) {
        ctx.shadowColor = 'rgba(255, 77, 141, 0.4)';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      if (barHeight > 5) {
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
      } else {
        ctx.rect(x, y, barWidth, Math.max(2, barHeight));
      }
      ctx.fill();

      // Draw bar value label
      if (d.value > 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FF4D8D';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.value}m`, x + barWidth / 2, y - 6);
      }

      // Draw X-axis label
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8EAEA5';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(getDayLabel(d.date), x + barWidth / 2, height - 8);
    });
  }

  // 2. Weekly Consistency DNA Heatmap
  function drawHeatmap() {
    if (!heatmapGrid) return;
    
    // Set headers (Mon-Sun)
    heatmapGrid.innerHTML = '';
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Inject headers
    dayLabels.forEach(d => {
      const header = document.createElement('div');
      header.className = 'heatmap-day-header';
      header.textContent = d;
      heatmapGrid.appendChild(header);
    });

    const last7Days = getPast7Days();
    const history = window.AppState.data.userStats.history || [];

    // Map each of the last 7 days to Mon-Sun index matching
    // Heatmap grid is just 1 row of 7 columns for simplicity in our view
    last7Days.forEach(date => {
      const histEntry = history.find(h => h.date === date);
      const minutes = histEntry ? histEntry.focusMinutes : 0;
      
      let level = '';
      if (minutes > 0 && minutes <= 25) level = 'level-1';
      else if (minutes > 25 && minutes <= 50) level = 'level-2';
      else if (minutes > 50) level = 'level-3';

      const cell = document.createElement('div');
      cell.className = `heatmap-cell ${level}`;
      cell.textContent = minutes > 0 ? `${minutes}m` : '-';
      cell.title = `Date: ${date}\nFocus: ${minutes} minutes`;
      
      heatmapGrid.appendChild(cell);
    });
  }

  function computeDNAInsights() {
    if (!window.AppState || !window.AppState.data) return;
    const stats = window.AppState.data.userStats;
    const history = stats.history || [];
    const missions = window.AppState.data.missions || [];
    const activeGoals = window.AppState.getActiveGoals();

    // --- Best Study Time ---
    // Derived from user answers across goals
    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    activeGoals.forEach(g => {
      const t = (g.answers && g.answers.workingTime) ? g.answers.workingTime : 'morning';
      if (timeCounts[t] !== undefined) timeCounts[t]++;
    });
    const bestTime = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0][0];
    const bestTimeStr = bestTime.charAt(0).toUpperCase() + bestTime.slice(1);

    // --- Average Focus Time Per Session ---
    const totalSessions = stats.focusSessionsCount || 0;
    const avgFocus = totalSessions > 0
      ? Math.round(stats.totalFocusMinutes / totalSessions)
      : 25;

    // --- Consistency Score ---
    // Percentage of last 7 days where at least one mission was completed
    const last7Days = getPast7Days();
    const activeDays = last7Days.filter(date => {
      const entry = history.find(h => h.date === date);
      return entry && entry.missionsCompleted > 0;
    }).length;
    const consistencyScore = Math.round((activeDays / 7) * 100);

    // --- Weekly Completion Rate ---
    const weeklyMissions = missions.filter(m => last7Days.includes(m.date));
    const completedWeeklyMissions = weeklyMissions.filter(m => m.completed).length;
    const weeklyCompletionRate = weeklyMissions.length > 0
      ? Math.round((completedWeeklyMissions / weeklyMissions.length) * 100)
      : 0;

    // --- Best Focus Day ---
    const dayMins = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    history.forEach(h => {
      const d = new Date(h.date).getDay();
      dayMins[d] += h.focusMinutes;
    });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedDays = Object.entries(dayMins).sort((a, b) => b[1] - a[1]);
    const bestDayIndex = sortedDays[0][0];
    const bestDayMins = sortedDays[0][1];
    const bestFocusDay = bestDayMins > 0 ? dayNames[bestDayIndex] : "None";

    // --- Productivity Trend ---
    // Compare last 3 days vs. prior 3 days by total focus minutes
    const recentDays = last7Days.slice(4, 7); // last 3
    const priorDays = last7Days.slice(1, 4);   // prior 3
    const recentMins = recentDays.reduce((sum, date) => {
      const e = history.find(h => h.date === date);
      return sum + (e ? e.focusMinutes : 0);
    }, 0);
    const priorMins = priorDays.reduce((sum, date) => {
      const e = history.find(h => h.date === date);
      return sum + (e ? e.focusMinutes : 0);
    }, 0);
    let trend = 'Steady';
    if (recentMins > priorMins + 10) trend = '📈 Rising';
    else if (recentMins < priorMins - 10) trend = '📉 Declining';
    else trend = '⚖️ Steady';

    // --- Recommended Session Duration ---
    // Based on average and whether in recovery or active
    let recDuration = avgFocus > 0 ? avgFocus : 25;
    if (stats.status === 'recovery') recDuration = Math.max(15, Math.round(recDuration * 0.5));
    recDuration = Math.min(recDuration, 60); // cap at 60

    // Dynamic Strengths
    const strengths = [];
    if (consistencyScore > 70) {
      strengths.push("High Consistency: You maintain focus on 70%+ of active days.");
    } else {
      strengths.push("Rhythm Building: You have established your active roadmap foundation.");
    }
    if (stats.streak >= 3) {
      strengths.push(`Active Momentum: Maintaining a strong ${stats.streak}-day focus streak.`);
    }
    if (stats.totalFocusMinutes > 180) {
      strengths.push("Stamina Champion: Strong cognitive endurance during deep blocks.");
    }

    // Dynamic Weaknesses
    const weaknesses = [];
    if (consistencyScore < 30) {
      weaknesses.push("Irregular rhythm: Focus days are highly scattered.");
    }
    if (stats.resilienceScore < 80) {
      weaknesses.push("Burnout Risk: Susceptible to long gaps after missing tasks.");
    }
    if (avgFocus < 20) {
      weaknesses.push("Short sprints: Session lengths tend to fall under 20 mins.");
    }
    if (weaknesses.length === 0) {
      weaknesses.push("No severe focus vulnerabilities identified this week.");
    }

    // Dynamic Suggestions
    const suggestions = [];
    if (stats.status === 'recovery') {
      suggestions.push("Recovery focus: Tackle today's reduced-load missions first to regain Active status.");
    } else {
      suggestions.push(`Peak productivity suggestion: Schedule your next deep focus block during your peak window (${bestTimeStr}).`);
    }
    if (bestFocusDay !== "None") {
      suggestions.push(`Anchor days: Double down on your strongest focus day (${bestFocusDay}) for core goals.`);
    }
    suggestions.push("Fatigue anchor: Turn on synthesized rain or lofi drone audio to filter external distractions.");
    suggestions.push("Pomodoro auto-split: Break tasks larger than 30 mins into dual Focus sessions.");

    // Write to DOM
    const el = id => document.getElementById(id);
    if (el('insight-dna-best-time')) el('insight-dna-best-time').textContent = bestTimeStr;
    if (el('insight-dna-best-day'))  el('insight-dna-best-day').textContent  = bestFocusDay;
    if (el('insight-dna-avg-time'))  el('insight-dna-avg-time').textContent  = `${avgFocus} Min`;
    if (el('insight-dna-consistency')) el('insight-dna-consistency').textContent = `${consistencyScore}%`;
    if (el('insight-dna-trend'))     el('insight-dna-trend').textContent     = trend;
    if (el('insight-dna-rec-duration')) el('insight-dna-rec-duration').textContent = `${recDuration} Min`;

    // Dynamic lists
    const strengthsEl = el('insight-dna-strengths');
    if (strengthsEl) {
      strengthsEl.innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
    }
    const weaknessesEl = el('insight-dna-weaknesses');
    if (weaknessesEl) {
      weaknessesEl.innerHTML = weaknesses.map(w => `<li>${w}</li>`).join('');
    }
    const suggestionsEl = el('insight-dna-suggestions');
    if (suggestionsEl) {
      suggestionsEl.innerHTML = suggestions.map(s => `
        <div style="background: rgba(59, 130, 246, 0.05); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid rgba(59, 130, 246, 0.12); font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary);">
          ${s}
        </div>
      `).join('');
    }

    // Stat boxes
    if (el('stat-total-mins'))    el('stat-total-mins').textContent    = (stats.totalFocusMinutes / 60).toFixed(1);
    if (el('stat-weekly-completion')) el('stat-weekly-completion').textContent = `${weeklyCompletionRate}%`;
    if (el('stat-streak-max'))    el('stat-streak-max').textContent    = `${stats.longestStreak || stats.streak}d`;
    if (el('stat-sessions-count')) el('stat-sessions-count').textContent = totalSessions;
    if (el('stat-current-streak')) el('stat-current-streak').textContent = `${stats.streak}d`;
    if (el('stat-goal-completion') && window.AppState.data) {
      const completedG = window.AppState.data.goals.filter(g => g.status === 'completed').length;
      const totalG = window.AppState.data.goals.length;
      el('stat-goal-completion').textContent = `${completedG} / ${totalG}`;
    }
  }

  function renderAnalytics() {
    if (!window.AppState || !window.AppState.data) return;
    computeDNAInsights();
    drawChart();
    drawHeatmap();
  }

  // Initialize charts on window resize
  window.addEventListener('resize', renderAnalytics);

  // Expose triggers
  window.renderAnalytics = renderAnalytics;
})();
