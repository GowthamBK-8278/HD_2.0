/**
 * HACKDAY 2.0 - Interactive Front-End Engine
 * Features:
 *   - Three.js 3D Hero Scene (Floating Laptops, Rocket, Lightbulb, Stars)
 *   - Web Audio API Sound Synthesizer (Cartoon Pops & Audio Toggle)
 *   - 3D Card Perspective Tilt
 *   - Real-Time Countdown to Dec 19, 2026
 *   - Webinar Locked State & Shake Alert
 *   - Confetti Burst on CTA Click
 *   - Sticky Note Checklist & 3D Book Stack Interactions
 *   - Cartoon Preloader
 */

// ==============================================================================
// 0. FRONT-END EVENT CONFIGURATION
// ==============================================================================
const EVENT_CONFIG = {
  // Toggle to true to unlock the webinar cards and reveal live session links
  webinar_unlocked: false,
  webinar_link: 'https://meet.google.com/decode-hackday-live',
  unstop_url: 'https://unstop.com/o/zTIUx2V?lb=CJ',
  unstop_competition_id: '1773120',
  event_date: '2026-12-19T09:00:00',
  default_participant_count: 426
};


// ==============================================================================
// 1. CARTOON SOUND SYNTHESIZER (Web Audio API)
// ==============================================================================
const CartoonAudio = (() => {
  let ctx = null;
  let isMuted = localStorage.getItem('hackday_muted') === 'true';

  const initContext = () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  const playPop = (freq = 420, duration = 0.08) => {
    if (isMuted) return;
    try {
      initContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const playBoop = () => {
    if (isMuted) return;
    playPop(260, 0.12);
  };

  const playSuccess = () => {
    if (isMuted) return;
    try {
      initContext();
      if (!ctx) return;
      const notes = [330, 440, 554, 659];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        }, idx * 70);
      });
    } catch (e) {}
  };

  const playLockedShake = () => {
    if (isMuted) return;
    try {
      initContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const toggleMute = (btnEl) => {
    isMuted = !isMuted;
    localStorage.setItem('hackday_muted', isMuted);
    if (btnEl) {
      btnEl.textContent = isMuted ? '🔇' : '🔊';
      btnEl.setAttribute('aria-label', isMuted ? 'Unmute Audio' : 'Mute Audio');
    }
    if (!isMuted) playPop(500);
  };

  return { playPop, playBoop, playSuccess, playLockedShake, toggleMute, isMuted: () => isMuted };
})();

// ==============================================================================
// 2. THREE.JS 3D HERO SCENE
// ==============================================================================
function initThreeScene() {
  const container = document.getElementById('three-hero-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Ambient & Directional Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const warmLight = new THREE.PointLight(0xffd400, 1.8, 50);
  warmLight.position.set(10, 12, 10);
  scene.add(warmLight);

  const purpleLight = new THREE.PointLight(0x8b5cf6, 1.4, 50);
  purpleLight.position.set(-10, -8, 8);
  scene.add(purpleLight);

  const group = new THREE.Group();
  scene.add(group);

  // Group for floating elements
  const floatingObjects = [];

  // Helper: create a cartoon 3D laptop
  function createLaptop(colorHex = 0x2563eb) {
    const laptopGroup = new THREE.Group();

    // Base keyboard
    const baseGeo = new THREE.BoxGeometry(3.2, 0.2, 2.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.6
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    laptopGroup.add(baseMesh);

    // Screen
    const screenGeo = new THREE.BoxGeometry(3.2, 2.2, 0.16);
    const screenMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.2,
      metalness: 0.3
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 1.1, -1.05);
    screenMesh.rotation.x = -0.3;
    laptopGroup.add(screenMesh);

    // Glow display face
    const displayGeo = new THREE.PlaneGeometry(2.8, 1.8);
    const displayMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.set(0, 1.1, -0.96);
    displayMesh.rotation.x = -0.3;
    laptopGroup.add(displayMesh);

    return laptopGroup;
  }

  // Add 3D Laptops
  const laptop1 = createLaptop(0xe8222e);
  laptop1.position.set(-8, 3, -2);
  laptop1.rotation.set(0.3, 0.6, -0.2);
  group.add(laptop1);
  floatingObjects.push({ mesh: laptop1, speedY: 0.015, rotSpeed: 0.008, basePos: { ...laptop1.position } });

  const laptop2 = createLaptop(0xffd400);
  laptop2.position.set(9, -2, -3);
  laptop2.rotation.set(-0.2, -0.7, 0.15);
  group.add(laptop2);
  floatingObjects.push({ mesh: laptop2, speedY: 0.018, rotSpeed: -0.007, basePos: { ...laptop2.position } });

  // Helper: create 3D Cartoon Rocket
  function createRocket() {
    const rocket = new THREE.Group();

    // Rocket body
    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.9, 3.2, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    rocket.add(body);

    // Nose cone (Red)
    const noseGeo = new THREE.ConeGeometry(0.8, 1.4, 16);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xe8222e, roughness: 0.3 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.y = 2.3;
    rocket.add(nose);

    // Window portal
    const windowGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.rotation.x = Math.PI / 2;
    win.position.set(0, 0.6, 0.88);
    rocket.add(win);

    // Rocket fins
    const finGeo = new THREE.BoxGeometry(0.1, 1.2, 1);
    const finMat = new THREE.MeshStandardMaterial({ color: 0xffd400 });
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.rotation.y = (i * Math.PI * 2) / 3;
      fin.position.y = -1.2;
      fin.position.x = Math.sin((i * Math.PI * 2) / 3) * 0.9;
      fin.position.z = Math.cos((i * Math.PI * 2) / 3) * 0.9;
      rocket.add(fin);
    }

    // Rocket flame thruster
    const flameGeo = new THREE.ConeGeometry(0.6, 1.4, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd400 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = -2.2;
    flame.rotation.x = Math.PI;
    rocket.add(flame);

    return rocket;
  }

  const rocketObj = createRocket();
  rocketObj.position.set(7, 5, -4);
  rocketObj.rotation.set(0.4, -0.4, -0.5);
  rocketObj.scale.set(0.9, 0.9, 0.9);
  group.add(rocketObj);
  floatingObjects.push({ mesh: rocketObj, speedY: 0.02, rotSpeed: 0.012, basePos: { ...rocketObj.position } });

  // 3D Cartoon Lightbulb (Idea prop)
  const bulbGroup = new THREE.Group();
  const bulbGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffd400,
    emissive: 0xffa500,
    emissiveIntensity: 0.6,
    roughness: 0.2
  });
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
  bulbGroup.add(bulbMesh);

  // Bulb metal base
  const bulbBaseGeo = new THREE.CylinderGeometry(0.6, 0.5, 0.6, 12);
  const bulbBaseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
  const bulbBase = new THREE.Mesh(bulbBaseGeo, bulbBaseMat);
  bulbBase.position.y = -1.2;
  bulbGroup.add(bulbBase);

  bulbGroup.position.set(-7, -4, -1);
  group.add(bulbGroup);
  floatingObjects.push({ mesh: bulbGroup, speedY: 0.016, rotSpeed: 0.009, basePos: { ...bulbGroup.position } });

  // Floating 3D Gold Stars
  for (let i = 0; i < 14; i++) {
    const starGeo = new THREE.OctahedronGeometry(0.4 + Math.random() * 0.4, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0xffd400 : 0xffffff,
      roughness: 0.3,
      metalness: 0.4
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 12 - 2
    );
    group.add(star);
    floatingObjects.push({
      mesh: star,
      speedY: 0.01 + Math.random() * 0.02,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      basePos: { ...star.position }
    });
  }

  // Floating Cartoon Cubes
  for (let i = 0; i < 6; i++) {
    const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: [0xe8222e, 0x06b6d4, 0x8b5cf6, 0xffd400][i % 4],
      roughness: 0.4
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 10
    );
    group.add(cube);
    floatingObjects.push({
      mesh: cube,
      speedY: 0.012 + Math.random() * 0.015,
      rotSpeed: 0.015,
      basePos: { ...cube.position }
    });
  }

  // Mouse & Touch Parallax with Ambient Idle Sway
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  // Responsive Canvas & Camera Scale Handler
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (w < 480) {
      group.scale.set(0.52, 0.52, 0.52);
      camera.position.z = 30;
    } else if (w < 768) {
      group.scale.set(0.68, 0.68, 0.68);
      camera.position.z = 28;
    } else if (w < 1024) {
      group.scale.set(0.85, 0.85, 0.85);
      camera.position.z = 26;
    } else {
      group.scale.set(1, 1, 1);
      camera.position.z = 24;
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Idle ambient sway + mouse/touch lerp for constant dynamic 3D feel
    const idleSwayX = Math.sin(elapsedTime * 0.5) * 0.08;
    const idleSwayY = Math.cos(elapsedTime * 0.6) * 0.06;
    targetX = mouseX * 0.25 + idleSwayX;
    targetY = mouseY * 0.2 + idleSwayY;
    group.rotation.y += (targetX - group.rotation.y) * 0.05;
    group.rotation.x += (-targetY - group.rotation.x) * 0.05;

    // Bobbing and spinning objects
    floatingObjects.forEach((obj, idx) => {
      obj.mesh.position.y = obj.basePos.y + Math.sin(elapsedTime * 2 + idx) * 0.6;
      obj.mesh.rotation.x += obj.rotSpeed;
      obj.mesh.rotation.y += obj.rotSpeed * 1.2;
    });

    renderer.render(scene, camera);
  }

  animate();
}

// ==============================================================================
// 3. 3D CARD PERSPECTIVE TILT
// ==============================================================================
function initCardTilt() {
  // Disable 3D tilt on touch devices to avoid stuck tilted state
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.info-card, .webinar-card, .comic-frame, .sticky-note-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ==============================================================================
// 4. LIVE 3D FLIP COUNTDOWN TIMER
// ==============================================================================
function initCountdown(targetDateStr = '2026-12-19T09:00:00') {
  const targetDate = new Date(targetDateStr).getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => (n < 10 ? '0' + n : String(n));

    if (daysEl.textContent !== pad(days)) daysEl.textContent = pad(days);
    if (hoursEl.textContent !== pad(hours)) hoursEl.textContent = pad(hours);
    if (minutesEl.textContent !== pad(minutes)) minutesEl.textContent = pad(minutes);
    if (secondsEl.textContent !== pad(seconds)) secondsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

// ==============================================================================
// 5. CONFETTI BURST (Lightweight Canvas Particle Explosion)
// ==============================================================================
const Confetti = (() => {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let isRunning = false;

  const init = () => {
    canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  };

  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const burst = (originX, originY) => {
    if (!canvas) init();
    const colors = ['#FFD400', '#E8222E', '#06B6D4', '#8B5CF6', '#FFFFFF', '#10B981'];
    const count = 90;

    const x = originX || window.innerWidth / 2;
    const y = originY || window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 6 + Math.random() * 12;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        size: 7 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        drag: 0.94,
        alpha: 1,
        life: 100 + Math.random() * 40
      });
    }

    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(render);
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotationSpeed;
      p.life--;
      p.alpha = Math.max(0, p.life / 60);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if (p.life <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      requestAnimationFrame(render);
    } else {
      isRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return { burst, init };
})();

// ==============================================================================
// 6. TOAST NOTIFICATIONS
// ==============================================================================
function showComicToast(message, icon = '🔒') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Remove any existing toast
  container.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = 'comic-toast';
  toast.innerHTML = `<span style="font-size:1.3rem;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

// ==============================================================================
// 7. WEBINAR LOCK LOGIC & INTERACTION
// ==============================================================================
function setupWebinarLogic() {
  const webinarCards = document.querySelectorAll('.webinar-card');
  const isUnlocked = EVENT_CONFIG.webinar_unlocked === true;

  webinarCards.forEach(card => {
    if (isUnlocked) {
      card.classList.remove('is-locked');
      card.classList.add('unlocked');

      // Render join button if not already present
      if (!card.querySelector('.btn-join-webinar')) {
        const joinBtn = document.createElement('a');
        joinBtn.href = EVENT_CONFIG.webinar_link || '#';
        joinBtn.target = '_blank';
        joinBtn.rel = 'noopener noreferrer';
        joinBtn.className = 'btn-join-webinar clickable';
        joinBtn.innerHTML = '<span>🚀 Join Webinar Live</span>';
        joinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          CartoonAudio.playPop(520);
        });
        card.appendChild(joinBtn);
      }
    } else {
      card.classList.add('is-locked');
      card.classList.remove('unlocked');
    }
  });

  // Handle clicking locked cards
  webinarCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-locked')) {
        card.classList.remove('cartoon-shake');
        // Force reflow
        void card.offsetWidth;
        card.classList.add('cartoon-shake');

        CartoonAudio.playLockedShake();
        showComicToast('Webinar details unlock soon! Register to get notified.', '🔒');
      }
    });
  });
}

// ==============================================================================
// 8. WORKFLOW STICKY NOTE & 3D BOOK STACK
// ==============================================================================
function initWorkflowAndBooks() {
  // Sticky note step check toggles
  const steps = document.querySelectorAll('.workflow-step-item');
  const stepTips = {
    'Innovation': 'Innovation: Highlight creative problem-solving & breakthrough technology! 💡',
    'Uniqueness': 'Uniqueness: Showcase what sets your project apart from existing tools! ✨',
    'Feature Friendly': 'Feature Friendly: Deliver intuitive UX, smooth flow & accessibility! 🎯',
    'Impact and Effects': 'Impact & Effects: Prove measurable real-world value & user benefits! 🌍',
    'Reference': 'Reference: Credit research papers, open-source libraries & API docs! 📚',
    'Feasibility': 'Feasibility: Detail your scalable architecture & viable deployment! ⚙️',
    'Challenges': 'Challenges: Share roadblocks overcome & resilience learnings! 🏆',
    'Idea': 'Idea: Define your problem statement & core project vision! 🚀'
  };

  steps.forEach(step => {
    step.addEventListener('click', () => {
      const isDone = step.classList.toggle('step-done');
      const stepName = step.getAttribute('data-step') || '';
      if (isDone) {
        CartoonAudio.playSuccess();
        const rect = step.getBoundingClientRect();
        Confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        if (stepTips[stepName]) {
          showComicToast(stepTips[stepName], '✅');
        }
      } else {
        CartoonAudio.playPop(320, 0.05);
      }
    });
  });

  // 3D Books slide-out interaction
  const books = document.querySelectorAll('.book-item');
  books.forEach(book => {
    book.addEventListener('click', () => {
      CartoonAudio.playPop(380);
      const spine = book.getAttribute('data-book');
      showComicToast(`Book: ${spine} — Essential Guide ready!`, '📚');
    });
    book.addEventListener('mouseenter', () => {
      CartoonAudio.playPop(480, 0.05);
    });
  });
}

// ==============================================================================
// 9. REGISTER BUTTONS CONFETTI & TRACKING
// ==============================================================================
function setupRegisterButtons() {
  const registerButtons = document.querySelectorAll('.btn-register-bouncy, .status-banner-card a, #hero-register-btn');
  const countEl = document.getElementById('footer-hacker-count');

  let currentClicks = parseInt(localStorage.getItem('hackday_clicks') || EVENT_CONFIG.base_clicks, 10);
  if (countEl) countEl.textContent = currentClicks;

  registerButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      Confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      CartoonAudio.playSuccess();

      // Increment click tracker client-side
      currentClicks += 1;
      localStorage.setItem('hackday_clicks', currentClicks);
      if (countEl) countEl.textContent = currentClicks;
    });

    btn.addEventListener('mouseenter', () => {
      CartoonAudio.playPop(440, 0.06);
    });
  });
}

// ==============================================================================
// 10. PRELOADER DISMISSAL
// ==============================================================================
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const barFill = document.querySelector('.preloader-bar-fill');
  const preloaderText = document.querySelector('.preloader-text');
  if (!preloader) return;

  let progress = 10;
  const messages = [
    'Waking up Shiro...',
    'Pouring hot coffee...',
    'Sharpening crayons...',
    'Tuning Three.js 3D world...',
    'Almost ready for madness!'
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 25) + 15;
    if (barFill) barFill.style.width = Math.min(progress, 100) + '%';
    const msgIdx = Math.min(Math.floor((progress / 100) * messages.length), messages.length - 1);
    if (preloaderText) preloaderText.textContent = messages[msgIdx];

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('fade-out');
        CartoonAudio.playSuccess();
              }, 400);
    }
  }, 160);
}

// ==============================================================================
// 11. RESPONSIVE MOBILE NAVIGATION
// ==============================================================================
function initMobileNav() {
  const hamburgerBtn = document.getElementById('nav-hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  if (!hamburgerBtn || !navMenu) return;

  let lastScrollY = window.scrollY;

  const closeMenu = () => {
    if (navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  };

  const toggleMenu = (e) => {
    if (e) e.stopPropagation();
    const isOpen = navMenu.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    lastScrollY = window.scrollY;
    CartoonAudio.playPop(isOpen ? 520 : 360, 0.06);
  };

  hamburgerBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking any nav link
  document.querySelectorAll('.nav-link, .nav-register-cta').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Automatically close/disappear mobile menu when the page is scrolled
  window.addEventListener('scroll', () => {
    if (navMenu.classList.contains('is-open')) {
      if (Math.abs(window.scrollY - lastScrollY) > 8) {
        closeMenu();
      }
    }
  }, { passive: true });

  // Close menu on touchmove (drag/scroll on mobile) outside the menu
  document.addEventListener('touchmove', (e) => {
    if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      closeMenu();
    }
  }, { passive: true });

  // Close menu when tapping/clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on touchstart outside
  document.addEventListener('touchstart', (e) => {
    if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      closeMenu();
    }
  }, { passive: true });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
      hamburgerBtn.focus();
    }
  });

  // Automatically close mobile menu if viewport resized to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

// ==============================================================================
// 12. BACK TO TOP BUTTON
// ==============================================================================
function initBackToTop() {
  const topBtn = document.getElementById('back-to-top-btn');
  if (!topBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 380) {
      topBtn.style.opacity = '1';
      topBtn.style.pointerEvents = 'auto';
      topBtn.style.transform = 'scale(1)';
    } else {
      topBtn.style.opacity = '0';
      topBtn.style.pointerEvents = 'none';
      topBtn.style.transform = 'scale(0.8)';
    }
  }, { passive: true });

  topBtn.addEventListener('click', () => {
    CartoonAudio.playSuccess();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==============================================================================
// 10. LIVE UNSTOP PARTICIPANT COUNTER FETCHER & ANIMATOR
// ==============================================================================
function initLiveUnstopCounter() {
  const elements = [
    document.getElementById('footer-live-count'),
    document.getElementById('hero-live-count')
  ];

  let currentCount = EVENT_CONFIG.default_participant_count || 426;

  function animateNumber(targetVal) {
    elements.forEach(el => {
      if (!el) return;
      const start = parseInt(el.textContent, 10) || 0;
      const range = targetVal - start;
      const duration = 1200;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + range * ease);
        el.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = targetVal;
        }
      }
      requestAnimationFrame(update);
    });
  }

  async function fetchLiveCount() {
    const compId = EVENT_CONFIG.unstop_competition_id || '1773120';
    try {
      const response = await fetch(`https://unstop.com/api/public/competition/${compId}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const count = data?.data?.competition?.registerCount || data?.data?.competition?.players_count;
        if (count && !isNaN(count)) {
          const num = parseInt(count, 10);
          if (num > 0) {
            currentCount = num;
            animateNumber(currentCount);
            return;
          }
        }
      }
    } catch (e) {
      try {
        const proxyRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://unstop.com/api/public/competition/${compId}`)}`);
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          const parsed = JSON.parse(proxyData.contents);
          const count = parsed?.data?.competition?.registerCount || parsed?.data?.competition?.players_count;
          if (count && !isNaN(count)) {
            const num = parseInt(count, 10);
            if (num > 0) {
              currentCount = num;
              animateNumber(currentCount);
              return;
            }
          }
        }
      } catch (err) {}
    }
    // Animate current verified count
    animateNumber(currentCount);
  }

  fetchLiveCount();
  // Poll every 60 seconds
  setInterval(fetchLiveCount, 60000);
}

// ==============================================================================
// SHINCHAN INTERACTIVE POSTER PULL-TO-REVEAL SYSTEM (DRAG & STOP PHYSICS)
// ==============================================================================
function initShinchanPullFeature() {
  const stage = document.getElementById('hero-pull-stage');
  const haulUnit = document.getElementById('poster-haul-unit');
  const pullContainer = document.getElementById('shinchan-pull-container');
  const sloganBadge = document.getElementById('pull-me-slogan');
  const bubbleText = document.getElementById('bubble-text');
  const posterFrame = document.getElementById('hero-poster-frame');
  const pullAgainBtn = document.getElementById('btn-pull-again');

  if (!stage || !haulUnit || !pullContainer || !posterFrame) return;

  let isPlaced = false;
  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startOffset = 0;
  let quoteIndex = 0;

  function calculateMaxOffset() {
    if (window.innerWidth <= 480) {
      return Math.min(260, Math.max(160, window.innerWidth - 140));
    } else if (window.innerWidth <= 992) {
      return 360;
    }
    return 440;
  }

  let maxOffset = calculateMaxOffset();
  let currentOffset = maxOffset;

  // Initialize starting position
  haulUnit.style.transform = `translateX(${currentOffset}px)`;

  window.addEventListener('resize', () => {
    maxOffset = calculateMaxOffset();
    if (!isPlaced && currentOffset > maxOffset) {
      currentOffset = maxOffset;
      haulUnit.style.transform = `translateX(${currentOffset}px)`;
    }
  });

  const celebrationQuotes = [
    "BWAHAHA! WE DID IT! 🥳 HACKDAY 2.0 IS LIVE!",
    "Look at my streetwear drip! Cool right? 😎",
    "Action Kamen says: REGISTER NOW! 🦸",
    "Dec 19-20! Same madness, bigger ideas! ⚡",
    "Misae won't let me hack without you! 😜",
    "Buri Buri Zaemon will take the 1st prize! 🐷",
    "Free registration! Even Shiro knows that! 🐶",
    "Good ideas happen here! Let's code! 🚀"
  ];

  // Function to lock the poster smoothly into place & celebrate
  function pullPosterIntoPlace() {
    if (isPlaced) return;
    isPlaced = true;
    currentOffset = 0;

    haulUnit.classList.remove('is-dragging');
    pullContainer.classList.remove('is-grabbing');

    // Smooth elastic spring into placement slot
    haulUnit.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.35, 0.64, 1)';
    haulUnit.style.transform = 'translateX(0px)';

    // Sound effects
    CartoonAudio.playPop(480, 0.12);
    setTimeout(() => {
      CartoonAudio.playPop(680, 0.14);
    }, 150);

    // Switch stage state to placed
    setTimeout(() => {
      stage.classList.remove('is-unpulled');
      stage.classList.add('is-placed');

      CartoonAudio.playSuccess();
      const rect = posterFrame.getBoundingClientRect();
      if (typeof Confetti !== 'undefined' && Confetti.burst) {
        Confetti.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.45);
      }

      if (bubbleText) {
        bubbleText.textContent = celebrationQuotes[0];
      }

      if (typeof showWebinarToast === 'function') {
        showWebinarToast('🎉 POSTER PLACED! DEC 19–20, 2026!');
      }
    }, 380);
  }

  // Function to reset and pull again
  function resetPosterPull() {
    isPlaced = false;
    maxOffset = calculateMaxOffset();
    currentOffset = maxOffset;

    stage.classList.remove('is-placed');
    stage.classList.add('is-unpulled');

    haulUnit.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.35, 0.64, 1)';
    haulUnit.style.transform = `translateX(${currentOffset}px)`;

    CartoonAudio.playPop(380, 0.1);

    if (bubbleText) {
      bubbleText.textContent = "Oi oi! Help me pull! 😣💦";
    }

    if (typeof showWebinarToast === 'function') {
      showWebinarToast('🔄 Shinchan is ready to pull again!');
    }
  }

  // Pointer Down - start drag or handle celebration click
  function onPointerDown(e) {
    if (isPlaced) {
      // Celebrating interaction
      CartoonAudio.playPop(520, 0.12);
      setTimeout(() => {
        CartoonAudio.playPop(780, 0.15);
      }, 120);

      const rect = pullContainer.getBoundingClientRect();
      if (typeof Confetti !== 'undefined' && Confetti.burst) {
        Confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      quoteIndex = (quoteIndex + 1) % celebrationQuotes.length;
      if (bubbleText) {
        bubbleText.textContent = celebrationQuotes[quoteIndex];
      }

      pullContainer.style.transform = 'scale(1.15) translateY(-10px)';
      setTimeout(() => {
        pullContainer.style.transform = '';
      }, 300);
      return;
    }

    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startOffset = currentOffset;

    haulUnit.classList.add('is-dragging');
    pullContainer.classList.add('is-grabbing');
    try {
      pullContainer.setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  // Pointer Move - real-time responsive dragging!
  function onPointerMove(e) {
    if (!isDragging || isPlaced) return;

    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 4) {
      hasMoved = true;
    }

    // Pulling to the left decreases offset
    let targetX = startOffset + deltaX;
    targetX = Math.max(0, Math.min(maxOffset, targetX));
    currentOffset = targetX;

    haulUnit.style.transform = `translateX(${currentOffset}px)`;

    // Dynamic speech feedback while dragging
    const progress = 1 - (currentOffset / maxOffset);
    if (bubbleText) {
      if (progress < 0.3) {
        bubbleText.textContent = "Oi oi! Keep pulling! 🏋️‍♂️";
      } else if (progress < 0.75) {
        bubbleText.textContent = "HEAAAAVE! Halfway there! 💦";
      } else {
        bubbleText.textContent = "ALMOST IN THE SLOT! PULL! ⚡";
      }
    }
  }

  // Pointer Up - stop where we stop, or snap into place if close!
  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    haulUnit.classList.remove('is-dragging');
    pullContainer.classList.remove('is-grabbing');

    try {
      pullContainer.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // If simply tapped/clicked without dragging, pull all the way into slot!
    if (!hasMoved) {
      pullPosterIntoPlace();
      return;
    }

    // If pulled close enough to the slot (e.g. within 55px or >85% progress), lock in!
    const snapThreshold = Math.min(65, maxOffset * 0.2);
    if (currentOffset <= snapThreshold) {
      pullPosterIntoPlace();
    } else {
      // STOP WHERE WE STOP! Poster and Shinchan stay right at current dragged position!
      haulUnit.style.transition = 'transform 0.18s ease-out';
      haulUnit.style.transform = `translateX(${currentOffset}px)`;
      CartoonAudio.playPop(340, 0.08);

      if (bubbleText) {
        bubbleText.textContent = "Phew! Don't stop, pull me more! 😜";
      }
    }
  }

  function onPointerCancel(e) {
    if (isDragging) {
      isDragging = false;
      haulUnit.classList.remove('is-dragging');
      pullContainer.classList.remove('is-grabbing');
    }
  }

  // Attach pointer drag listeners to Shinchan mascot, slogan badge, and poster frame
  pullContainer.addEventListener('pointerdown', onPointerDown);
  pullContainer.addEventListener('pointermove', onPointerMove);
  pullContainer.addEventListener('pointerup', onPointerUp);
  pullContainer.addEventListener('pointercancel', onPointerCancel);

  posterFrame.addEventListener('pointerdown', (e) => {
    if (!isPlaced) onPointerDown(e);
  });
  posterFrame.addEventListener('pointermove', onPointerMove);
  posterFrame.addEventListener('pointerup', onPointerUp);

  // Pull Again button
  if (pullAgainBtn) {
    pullAgainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetPosterPull();
    });
  }
}

// ==============================================================================
// INITIALIZATION ON DOM READY
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  initPreloader();

  // Shinchan Hero Mascot Interactive Peeking Animation
  initShinchanPullFeature();

  // Responsive Mobile Navigation & Back to Top
  initMobileNav();
  initBackToTop();

  // Live Unstop participant counter
  initLiveUnstopCounter();

  // Three.js 3D hero scene
  initThreeScene();

  // Card perspective tilt
  initCardTilt();

  // 3D Flip countdown
  initCountdown(EVENT_CONFIG.event_date);

  // Confetti system
  Confetti.init();

  // Webinar lock logic & toasts
  setupWebinarLogic();

  // Workflow checklist & books
  initWorkflowAndBooks();

  // Register buttons hooks
  setupRegisterButtons();

  // Audio mute button hook
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.textContent = CartoonAudio.isMuted() ? '🔇' : '🔊';
    audioToggleBtn.addEventListener('click', () => {
      CartoonAudio.toggleMute(audioToggleBtn);
    });
  }

  // Hover sound on all interactive buttons
  document.querySelectorAll('button, .clickable').forEach(el => {
    el.addEventListener('mouseenter', () => {
      CartoonAudio.playPop(420, 0.05);
    });
  });
});
