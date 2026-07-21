/**
 * Confetti Canvas Particle Physics and Toast UI Alerts
 */

(function() {
  // 1. Toast Notification System
  const toastContainer = document.getElementById('toast-container');

  window.showToast = function(message, type = 'primary') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add custom content
    let icon = '🔔';
    if (type === 'primary') icon = '⚡';
    if (type === 'accent') icon = '🎉';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div style="font-size: 1.25rem;">${icon}</div>
      <div style="font-size: 0.85rem; font-weight: 500;">${message}</div>
      <div class="toast-progress"></div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Achievement emoji & color mapping
  const ACHIEVEMENT_META = {
    first_goal:     { emoji: '⭐', color: '#22C55E' },
    deep_focus:     { emoji: '🎯', color: '#EC4899' },
    streak_3:       { emoji: '🔥', color: '#F59E0B' },
    streak_7:       { emoji: '🗓️', color: '#38BDF8' },
    focus_100h:     { emoji: '💯', color: '#A855F7' },
    goal_champion:  { emoji: '🏆', color: '#22C55E' },
    bounceback:     { emoji: '🛡️', color: '#F59E0B' }
  };

  // Achievement celebration modal
  const achModal = document.getElementById('achievement-modal');
  const achModalTitle = document.getElementById('achievement-modal-title');
  const achModalDesc = document.getElementById('achievement-modal-desc');
  const achModalEmoji = document.getElementById('achievement-modal-emoji');
  const achModalClose = document.getElementById('achievement-modal-close');

  if (achModalClose) {
    achModalClose.addEventListener('click', () => {
      achModal.style.display = 'none';
    });
  }

  function showAchievementModal(ach) {
    if (!achModal) return;
    const meta = ACHIEVEMENT_META[ach.id] || { emoji: '🏅', color: '#22C55E' };

    achModalEmoji.textContent = meta.emoji;
    achModalTitle.textContent = ach.name;
    achModalDesc.textContent = ach.desc;

    // Tint the glow color dynamically
    achModal.querySelector('div').style.boxShadow = `0 0 60px ${meta.color}40`;
    achModal.querySelector('div').style.borderColor = `${meta.color}55`;

    achModal.style.display = 'flex';
    window.triggerConfetti();

    // Auto-close after 8 seconds
    setTimeout(() => {
      if (achModal.style.display === 'flex') {
        achModal.style.display = 'none';
      }
    }, 8000);
  }

  // Listen to state achievement unlocks
  window.addEventListener('achievementUnlocked', (e) => {
    const ach = e.detail;
    // Brief toast first
    window.showToast(`🏅 Achievement: ${ach.name}`, 'accent');
    // Full celebration modal with confetti
    setTimeout(() => showAchievementModal(ach), 600);
  });

  // 2. Confetti Particle System
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let particles = [];
  const colors = ['#22C55E', '#EC4899', '#F59E0B', '#38BDF8', '#A855F7', '#FFFFFF'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.r = Math.random() * 6 + 4;
      this.d = Math.random() * canvas.height;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.tilt = Math.random() * 10 - 5;
      this.tiltAngleIncremental = Math.random() * 0.07 + 0.02;
      this.tiltAngle = 0;
      this.speed = Math.random() * 3 + 2;
    }

    update() {
      this.tiltAngle += this.tiltAngleIncremental;
      this.y += (Math.cos(this.d) + 3 + this.r / 2) / 2 * (this.speed * 0.5);
      this.x += Math.sin(this.tiltAngle);
      this.tilt = Math.sin(this.tiltAngle - this.r / 2) * 5;
    }

    draw() {
      ctx.beginPath();
      ctx.lineWidth = this.r;
      ctx.strokeStyle = this.color;
      ctx.moveTo(this.x + this.tilt + this.r / 2, this.y);
      ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 2);
      ctx.stroke();
    }
  }

  window.triggerConfetti = function() {
    // Generate particles
    particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push(new ConfettiParticle());
    }

    // Cancel old loop if running
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // Run animation
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let alive = false;
      particles.forEach(p => {
        p.update();
        p.draw();
        if (p.y < canvas.height) {
          alive = true;
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    loop();
  };
})();
