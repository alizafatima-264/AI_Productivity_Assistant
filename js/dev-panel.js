/**
 * Developer Simulator Panel Controls
 */

(function() {
  const panel = document.getElementById('dev-simulator-panel');
  const toggleBtn = document.getElementById('dev-toggle-btn');
  const btnForwardDay = document.getElementById('dev-btn-forward-day');
  const btnSkip3Days = document.getElementById('dev-btn-skip-3-days');
  const btnResetData = document.getElementById('dev-btn-reset-data');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      panel.classList.toggle('open');
    });
  }

  // 1. Simulate passage of 1 day
  if (btnForwardDay) {
    btnForwardDay.addEventListener('click', () => {
      window.AppState.simulateDayPassage();
      window.showToast("Time Travelled! Simulated +1 Day passage.", 'primary');
    });
  }

  // 2. Simulate 3 consecutive missed days
  if (btnSkip3Days) {
    btnSkip3Days.addEventListener('click', () => {
      window.AppState.simulateMissedDaysTrigger();
      window.showToast("Simulated 3 missed days. Recovery Mode active!", 'warning');
    });
  }

  // 3. Reset all localStorage state
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm("Reset application data? This clears all goals, focus time, and achievements.")) {
        window.AppState.reset();
        window.showToast("Application data reset successfully.", 'accent');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    });
  }
})();
