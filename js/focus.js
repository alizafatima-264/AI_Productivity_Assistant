/**
 * Focus Timer Module – Auto-Pomodoro Segmentation & Web Audio Synthesizer
 */

(function() {
  const timerRing        = document.getElementById('timer-progress-ring');
  const timerDisplay     = document.getElementById('timer-display');
  const timerStateLabel  = document.getElementById('timer-state-label');
  const toggleBtn        = document.getElementById('timer-btn-toggle');
  const resetBtn         = document.getElementById('timer-btn-reset');
  const skipBtn          = document.getElementById('timer-btn-skip');
  const taskSelect       = document.getElementById('focus-task-select');
  const volumeSlider     = document.getElementById('focus-volume-slider');
  const volumeValDisplay = document.getElementById('volume-val-display');
  const distractionCountVal = document.getElementById('focus-distractions-val');
  const playPauseIcon    = document.getElementById('play-pause-icon');

  const RING_CIRCUMFERENCE = 282.7;

  // ─── Timer State ──────────────────────────────────────────────────────────
  let timerInterval   = null;
  let timerRunning    = false;
  let distractionCount = 0;
  let targetMissionId = '';

  // Pomodoro Segment State
  // pomodoroSegments: Array of { type: 'focus'|'break', durationSeconds: number, label: string }
  let pomodoroSegments    = [];
  let currentSegmentIndex = 0;
  let timerDuration       = 25 * 60; // seconds for current segment
  let timeLeft            = timerDuration;
  let totalFocusMinutes   = 0; // total focus minutes for the whole task (sum of focus segments)

  // Audio
  let audioCtx        = null;
  let soundSourceNode = null;
  let masterGainNode  = null;
  let activeSoundType = 'none';

  // ─── Timer Ring & Display ─────────────────────────────────────────────────
  function updateTimerRing() {
    if (!timerRing) return;
    const progress = timerDuration > 0 ? timeLeft / timerDuration : 0;
    timerRing.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    if (timerDisplay) timerDisplay.innerText = formatTime(timeLeft);
    updateTimerRing();
  }

  // ─── Pomodoro Segment Builder ─────────────────────────────────────────────
  // Given total task duration (minutes), build [Focus(T/2), Break(5), Focus(T/2)]
  function buildPomodoroSegments(totalMins) {
    if (totalMins <= 30) {
      const half = Math.max(1, Math.round(totalMins / 2));
      return [
        { type: 'focus', durationSeconds: half * 60, label: `Focus – Part 1 (${half}m)` },
        { type: 'break', durationSeconds: 5 * 60,        label: 'Short Break (5m)' },
        { type: 'focus', durationSeconds: (totalMins - half) * 60, label: `Focus – Part 2 (${totalMins - half}m)` }
      ];
    }
    
    const numSegments = Math.ceil(totalMins / 30);
    const segmentSize = Math.floor(totalMins / numSegments);
    const remainder = totalMins % numSegments;
    
    const segments = [];
    for (let i = 0; i < numSegments; i++) {
      const size = segmentSize + (i < remainder ? 1 : 0);
      segments.push({
        type: 'focus',
        durationSeconds: size * 60,
        label: `Focus – Part ${i + 1} (${size}m)`
      });
      if (i < numSegments - 1) {
        segments.push({
          type: 'break',
          durationSeconds: 5 * 60,
          label: 'Short Break (5m)'
        });
      }
    }
    return segments;
  }

  // Render the Pomodoro train UI (segment dots below the timer)
  function renderPomodoroTrain() {
    let train = document.getElementById('pomodoro-train-el');
    if (!train) {
      // Create it beneath the timer display area if not yet present
      const timerCard = timerDisplay ? timerDisplay.closest('.timer-section') || timerDisplay.parentElement : null;
      if (!timerCard) return;
      train = document.createElement('div');
      train.id = 'pomodoro-train-el';
      train.className = 'pomodoro-train';
      // Insert after the timer state label
      const labelEl = timerStateLabel || timerDisplay;
      if (labelEl && labelEl.parentElement) {
        labelEl.parentElement.insertBefore(train, labelEl.nextSibling);
      } else {
        timerCard.appendChild(train);
      }
    }

    if (pomodoroSegments.length === 0) {
      train.style.display = 'none';
      return;
    }

    train.style.display = 'flex';
    train.innerHTML = '';

    pomodoroSegments.forEach((seg, idx) => {
      const pill = document.createElement('div');
      pill.className = 'pomo-train-segment';
      if (idx < currentSegmentIndex) pill.classList.add('completed-seg');
      if (idx === currentSegmentIndex) pill.classList.add('active');

      const icon = seg.type === 'break' ? '☕' : '⚡';
      pill.innerHTML = `<div>${icon}</div><div style="margin-top:2px;">${seg.label}</div>`;
      train.appendChild(pill);

      if (idx < pomodoroSegments.length - 1) {
        const arrow = document.createElement('div');
        arrow.style.cssText = 'color: var(--text-muted); font-size: 0.8rem; flex-shrink: 0;';
        arrow.textContent = '→';
        train.appendChild(arrow);
      }
    });
  }

  function loadSegment(index) {
    if (index >= pomodoroSegments.length) return false;
    const seg = pomodoroSegments[index];
    currentSegmentIndex = index;
    timerDuration = seg.durationSeconds;
    timeLeft = timerDuration;
    if (timerStateLabel) timerStateLabel.innerText = seg.type === 'focus' ? 'Deep Focus' : 'Rest Break';
    renderPomodoroTrain();
    updateTimerDisplay();

    // Dynamically update overall task/session progress
    const activeProgress = document.getElementById('focus-active-progress');
    if (activeProgress && targetMissionId && window.AppState && window.AppState.data) {
      const mission = window.AppState.data.missions.find(m => m.id === targetMissionId);
      if (mission) {
        const goal = window.AppState.data.goals.find(g => g.id === mission.goalId);
        const goalPct = goal ? goal.progress || 0 : 0;
        const progressPct = Math.round((index / pomodoroSegments.length) * 100);
        activeProgress.textContent = `Session Progress: ${progressPct}% (Segment ${index + 1}/${pomodoroSegments.length}) • Goal: ${goalPct}%`;
      }
    }
    return true;
  }

  // ─── Mission Dropdown ─────────────────────────────────────────────────────
  function renderMissionDropdown() {
    if (!taskSelect) return;
    const currentMissions = window.AppState.getTodaysMissions();
    const currentSelectedVal = taskSelect.value;
    taskSelect.innerHTML = `<option value="">-- No Mission Selected (General Focus) --</option>`;
    currentMissions.forEach(m => {
      if (!m.completed) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `[${m.goalTitle}] – ${m.title} (${m.focusTimeRequired}m)`;
        if (m.id === currentSelectedVal) opt.selected = true;
        taskSelect.appendChild(opt);
      }
    });
  }

  window.addEventListener('stateChanged', renderMissionDropdown);

  // ─── Audio Synthesis ──────────────────────────────────────────────────────
  function initAudioContext() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(
      (volumeSlider ? volumeSlider.value : 50) / 100 * 0.15,
      audioCtx.currentTime
    );
    masterGainNode.connect(audioCtx.destination);
  }

  function createNoiseBuffer() {
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  function playRainSound() {
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = createNoiseBuffer();
    noiseNode.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 600;
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass'; bandpass.frequency.value = 300; bandpass.Q.value = 0.5;
    noiseNode.connect(filter); filter.connect(bandpass); bandpass.connect(masterGainNode);
    noiseNode.start();
    return noiseNode;
  }

  function playWhiteNoise() {
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = createNoiseBuffer();
    noiseNode.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1200;
    noiseNode.connect(filter); filter.connect(masterGainNode);
    noiseNode.start();
    return noiseNode;
  }

  function playLofiDrone() {
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc1.type = 'sine'; osc1.frequency.value = 80;
    osc2.type = 'sine'; osc2.frequency.value = 120.3;
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc1.connect(gainNode); osc2.connect(gainNode); gainNode.connect(masterGainNode);
    osc1.start(); osc2.start();
    return { stop: () => { osc1.stop(); osc2.stop(); } };
  }

  // ─── Clock Tick Synthesizer ───────────────────────────────────────────────
  // Schedules sharp triangular impulse bursts at exactly 1-second intervals
  // using AudioContext timeline — drift-free, authentic analog clock feel.
  function playClockTick() {
    initAudioContext();
    let active = true;
    let nextTickTime = audioCtx.currentTime + 0.05; // small startup delay

    function scheduleTick(when) {
      if (!active) return;

      // Main click — sharp high-freq impulse
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, when);
      osc.frequency.exponentialRampToValueAtTime(400, when + 0.04);
      gain.gain.setValueAtTime(0.0, when);
      gain.gain.linearRampToValueAtTime(1.0, when + 0.002);  // fast attack
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.06); // fast decay
      osc.connect(gain);
      gain.connect(masterGainNode);
      osc.start(when);
      osc.stop(when + 0.08);

      // Subtle resonance tail — body of the tick
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, when);
      gain2.gain.setValueAtTime(0.0, when);
      gain2.gain.linearRampToValueAtTime(0.35, when + 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.001, when + 0.09);
      osc2.connect(gain2);
      gain2.connect(masterGainNode);
      osc2.start(when);
      osc2.stop(when + 0.1);

      nextTickTime += 1.0; // exactly one second between ticks

      // Schedule the next tick ~100ms before it's due (lookahead scheduling)
      const msUntilNext = Math.max(0, (nextTickTime - audioCtx.currentTime - 0.1) * 1000);
      setTimeout(() => scheduleTick(nextTickTime), msUntilNext);
    }

    scheduleTick(nextTickTime);

    return {
      stop: () => { active = false; }
    };
  }

  function playSuccessAlert() {
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.15);
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.7);
  }

  function stopActiveSound() {
    if (soundSourceNode) {
      try { soundSourceNode.stop(); } catch (e) { if (soundSourceNode.stop) soundSourceNode.stop(); }
      soundSourceNode = null;
    }
  }

  function updateAmbientSound(soundType) {
    activeSoundType = soundType;
    stopActiveSound();
    if (!timerRunning || soundType === 'none') return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (soundType === 'noise') soundSourceNode = playWhiteNoise();
    else if (soundType === 'rain') soundSourceNode = playRainSound();
    else if (soundType === 'lofi') soundSourceNode = playLofiDrone();
    else if (soundType === 'tick') soundSourceNode = playClockTick();
  }

  // ─── Timer Controls ───────────────────────────────────────────────────────
  function startTimer() {
    if (timerRunning) return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    timerRunning = true;
    document.body.classList.add('focus-running');
    if (playPauseIcon) playPauseIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
    updateAmbientSound(activeSoundType);

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) handleSegmentCompletion();
    }, 1000);
  }

  function pauseTimer() {
    if (!timerRunning) return;
    timerRunning = false;
    document.body.classList.remove('focus-running');
    if (playPauseIcon) playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    clearInterval(timerInterval);
    stopActiveSound();
  }

  function resetTimer() {
    pauseTimer();
    // Rebuild segments from scratch if a mission is selected
    if (pomodoroSegments.length > 0) {
      loadSegment(0);
    } else {
      timerDuration = 25 * 60;
      timeLeft = timerDuration;
      updateTimerDisplay();
    }
  }

  function handleSegmentCompletion() {
    pauseTimer();
    playSuccessAlert();

    const completedSeg = pomodoroSegments[currentSegmentIndex];

    if (completedSeg && completedSeg.type === 'focus') {
      window.showToast(
        currentSegmentIndex < pomodoroSegments.length - 1
          ? "Focus block done! Starting your break…"
          : "Final focus block complete! Outstanding work.",
        'accent'
      );
    } else if (completedSeg && completedSeg.type === 'break') {
      window.showToast("Break over. Back to focus!", 'primary');
    }

    const nextIdx = currentSegmentIndex + 1;

    if (nextIdx < pomodoroSegments.length) {
      // Auto-advance to the next segment after 1.5s
      setTimeout(() => {
        loadSegment(nextIdx);
        // Auto-start break and next focus phases
        startTimer();
      }, 1500);
    } else {
      // All segments done — session complete!
      if (targetMissionId) {
        window.AppState.completeFocusSession(targetMissionId, totalFocusMinutes);
        window.triggerConfetti();
        window.openAccountabilityModal(targetMissionId);
      } else {
        window.triggerConfetti();
        window.showToast("Focus session complete! Great work.", 'accent');
      }
      // Reset to idle
      pomodoroSegments = [];
      currentSegmentIndex = 0;
      timerDuration = 25 * 60;
      timeLeft = timerDuration;
      if (timerStateLabel) timerStateLabel.innerText = 'Deep Focus';
      updateTimerDisplay();
      renderPomodoroTrain();
    }
  }

  // ─── Distraction Detection ────────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    const seg = pomodoroSegments[currentSegmentIndex];
    const isFocusSeg = !seg || seg.type === 'focus';
    if (document.visibilityState === 'hidden' && timerRunning && isFocusSeg) {
      distractionCount++;
      if (distractionCountVal) distractionCountVal.innerText = distractionCount;
      window.showToast("Warning: You strayed away from the focus dashboard!", 'warning');
      if (audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
      }
    }
  });

  // ─── Event Bindings ───────────────────────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      timerRunning ? pauseTimer() : startTimer();
    });
  }
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      if (confirm("Skip this interval? Current session will not count towards history.")) {
        handleSegmentCompletion();
      }
    });
  }

  if (taskSelect) {
    taskSelect.addEventListener('change', (e) => {
      targetMissionId = e.target.value;
      const activeInfo     = document.getElementById('focus-active-info');
      const activeGoalTag  = document.getElementById('focus-active-goal-tag');
      const activeTaskTitle = document.getElementById('focus-active-task-title');
      const activeProgress = document.getElementById('focus-active-progress');

      if (targetMissionId) {
        const mission = window.AppState.data.missions.find(m => m.id === targetMissionId);
        if (mission) {
          // Build Pomodoro segments automatically
          totalFocusMinutes = mission.focusTimeRequired;
          pomodoroSegments    = buildPomodoroSegments(totalFocusMinutes);
          currentSegmentIndex = 0;
          loadSegment(0);

          if (activeInfo) activeInfo.style.display = 'block';
          if (activeGoalTag) activeGoalTag.textContent = mission.goalTitle;
          if (activeTaskTitle) activeTaskTitle.textContent = mission.title;
          const goal = window.AppState.data.goals.find(g => g.id === mission.goalId);
          if (activeProgress && goal) activeProgress.textContent = `Goal Progress: ${goal.progress || 0}%`;
        }
      } else {
        // General focus – no segments, default 25m
        pomodoroSegments    = [];
        currentSegmentIndex = 0;
        totalFocusMinutes   = 0;
        timerDuration = 25 * 60;
        timeLeft      = timerDuration;
        if (timerStateLabel) timerStateLabel.innerText = 'Deep Focus';
        updateTimerDisplay();
        renderPomodoroTrain();
        if (activeInfo) activeInfo.style.display = 'none';
      }
    });
  }

  // Sound picker
  document.querySelectorAll('.sound-option').forEach(elem => {
    elem.addEventListener('click', (e) => {
      document.querySelectorAll('.sound-option').forEach(s => s.classList.remove('active'));
      e.currentTarget.classList.add('active');
      updateAmbientSound(e.currentTarget.getAttribute('data-sound'));
    });
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = e.target.value;
      if (volumeValDisplay) volumeValDisplay.textContent = `${vol}%`;
      if (masterGainNode && audioCtx) {
        masterGainNode.gain.setValueAtTime(vol / 100 * 0.15, audioCtx.currentTime);
      }
    });
  }

  // ─── Global Trigger (called from dashboard "Start Focus Now" button) ───────
  window.triggerFocusTimerStart = function(missionId) {
    if (taskSelect) {
      let exists = false;
      for (let i = 0; i < taskSelect.options.length; i++) {
        if (taskSelect.options[i].value === missionId) {
          exists = true;
          break;
        }
      }
      if (!exists && window.AppState && window.AppState.data) {
        const mission = window.AppState.data.missions.find(m => m.id === missionId);
        if (mission) {
          const opt = document.createElement('option');
          opt.value = mission.id;
          opt.textContent = `[${mission.goalTitle}] – ${mission.title} (${mission.focusTimeRequired}m)`;
          taskSelect.appendChild(opt);
        }
      }
      taskSelect.value = missionId;
      taskSelect.dispatchEvent(new Event('change'));
    }
    const focusNavBtn = document.querySelector('[data-view="focus-view"]');
    if (focusNavBtn) focusNavBtn.click();
    setTimeout(() => startTimer(), 300);
  };

  // Initial setup
  renderMissionDropdown();
  updateTimerDisplay();
  renderPomodoroTrain();
})();
