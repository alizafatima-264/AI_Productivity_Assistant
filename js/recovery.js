/**
 * Accountability Reflections and Recovery Workload Scaling
 */

(function() {
  const modalOverlay = document.getElementById('accountability-modal');
  const closeBtn = document.getElementById('modal-accountability-close');
  const submitBtn = document.getElementById('modal-accountability-submit');
  const reflectionInput = document.getElementById('reflection-input');

  let activeMissionId = null;

  // 1. Accountability Reflection Modal
  window.openAccountabilityModal = function(missionId) {
    if (!modalOverlay) return;
    activeMissionId = missionId;
    reflectionInput.value = '';
    modalOverlay.classList.add('active-modal');
  };

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active-modal');
    }
    activeMissionId = null;
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const text = reflectionInput.value.trim();
      
      if (!text || text.length < 5) {
        window.showToast("Reflection too short! Write at least 5 characters to lock in progress.", 'warning');
        return;
      }

      if (activeMissionId) {
        try {
          window.AppState.completeMission(activeMissionId, text);
          window.showToast("Mission completed! Streak updated.", 'primary');
          window.triggerConfetti();
          closeModal();
        } catch (e) {
          window.showToast(e.message, 'warning');
        }
      }
    });
  }

  // 2. Recovery Workload Scaling
  // Intercept mission focus durations to apply 50% discount if in recovery
  window.getScaledFocusDuration = function(mission) {
    const stats = window.AppState.data.userStats;
    if (stats.status === 'recovery') {
      // 50% reduced duration (round to nearest minute, minimum 5 mins)
      return Math.max(5, Math.round(mission.focusTimeRequired * 0.5));
    }
    return mission.focusTimeRequired;
  };
})();
