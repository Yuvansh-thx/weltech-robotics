/**
 * Weltech — Intelligence That Feels
 * Interactive WebGL / Canvas / Audio & Motion Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Audio System (Synthesized via Web Audio API)
  // -------------------------------------------------------------------------
  let audioCtx = null;
  let isSoundEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  const soundToggle = document.getElementById('btnSoundToggle');
  const soundIconOn = soundToggle.querySelector('.sound-icon-on');
  const soundIconOff = soundToggle.querySelector('.sound-icon-off');
  const soundLabel = document.getElementById('soundLabel');

  soundToggle.addEventListener('click', () => {
    initAudio();
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundIconOn.style.display = 'block';
      soundIconOff.style.display = 'none';
      soundLabel.textContent = 'Audio On';
      soundToggle.classList.add('active');
      playChime(587.33, 'triangle', 0.15, 0.2); // D5 chime
    } else {
      soundIconOn.style.display = 'none';
      soundIconOff.style.display = 'block';
      soundLabel.textContent = 'Muted';
      soundToggle.classList.remove('active');
    }
  });

  // Synthesized sounds
  function playClick(freq = 1200, duration = 0.04) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playChime(freq = 440, type = 'sine', duration = 0.6, vol = 0.12) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // Dual oscillator harmonic
      [freq, freq * 1.5].forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(vol / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {}
  }

  function playSliderGlide(pct = 0.5) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      // Map 0..1 to 240Hz..720Hz
      const freq = 240 + pct * 480;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // -------------------------------------------------------------------------
  // 2. Full Web Application Scroll Controller
  // -------------------------------------------------------------------------
  const scrollContainer = document.getElementById('siteScrollContainer');
  const mainNav = document.getElementById('mainNav');
  const urlParams = new URLSearchParams(window.location.search);
  const testScroll = urlParams.get('scroll');
  if (testScroll) {
    window.scrollTo({ top: parseInt(testScroll, 10), behavior: 'instant' });
  }

  window.addEventListener('scroll', () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    if (mainNav) {
      if (y > 20) {
        mainNav.classList.add('scrolled');
      } else {
        mainNav.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 3. Hero Section: Touching Hands at Start & Scroll-Driven Separation
  // -------------------------------------------------------------------------
  const heroSection = document.getElementById('hero');
  const heroStage = document.getElementById('heroHandsStage');
  const humanHand = document.getElementById('humanHandWrapper');
  const robotHand = document.getElementById('robotHandWrapper');
  const touchSparkPoint = document.getElementById('touchSparkPoint');

  let mouseStage = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let currentSep = 0;
  let targetSep = 0;
  let isTouching = true;
  let lastWasTouching = true;

  // Track scroll position of document relative to hero top
  function getScrollTop() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop || (scrollContainer ? scrollContainer.scrollTop : 0);
    const heroTop = heroSection ? heroSection.offsetTop : 0;
    return Math.max(0, pageY - heroTop);
  }

  function updateHandsPositions() {
    const scrollTop = urlParams.get('scroll') ? parseInt(urlParams.get('scroll'), 10) : getScrollTop();
    const heroH = heroSection ? heroSection.offsetHeight : 600;

    // Progress: 0 at top, 1 when scrolled 75% of hero height
    const progress = Math.min(1, Math.max(0, scrollTop / (heroH * 0.75)));

    // Smooth power curve for natural kinetic separation
    const eased = 1 - Math.pow(1 - progress, 2.2);

    // Maximum separation distance responsive to screen width (Phone, Tablet, PC)
    const w = window.innerWidth;
    const isMobile = w <= 640;
    const isTablet = w > 640 && w <= 1024;
    const maxSep = isMobile
      ? Math.min(w * 0.28, 110)
      : isTablet
      ? Math.min(w * 0.36, 260)
      : Math.min(w * 0.42, 500);

    targetSep = eased * maxSep;

    // Smooth interpolation for silky feel
    currentSep += (targetSep - currentSep) * 0.22;
    if (heroStage) {
      heroStage.setAttribute('data-scroll-top', scrollTop.toFixed(1));
      heroStage.setAttribute('data-target-sep', targetSep.toFixed(1));
      heroStage.setAttribute('data-current-sep', currentSep.toFixed(1));
    }
    mouseStage.x += (mouseStage.targetX - mouseStage.x) * 0.12;
    mouseStage.y += (mouseStage.targetY - mouseStage.y) * 0.12;

    const mx = mouseStage.x * (isMobile ? 6 : 16);
    const my = mouseStage.y * (isMobile ? 4 : 10);

    // Human Hand (Left): at rest touches center, moves left on scroll
    if (humanHand) {
      humanHand.style.transform = `translate(calc(-78.42% - ${currentSep.toFixed(2)}px + ${mx.toFixed(2)}px), calc(-46.81% + ${my.toFixed(2)}px))`;
    }

    // Robot Hand (Right): at rest touches center, moves right on scroll
    if (robotHand) {
      robotHand.style.transform = `translate(calc(-10.90% + ${currentSep.toFixed(2)}px - ${mx.toFixed(2)}px), calc(-42.84% - ${my.toFixed(2)}px))`;
    }

    // Touch spark fades as soon as hands start pulling apart
    if (touchSparkPoint) {
      const sparkThreshold = isMobile ? 14 : 25;
      const sparkOpacity = Math.max(0, 1 - (currentSep / sparkThreshold));
      touchSparkPoint.style.opacity = sparkOpacity.toFixed(3);
      touchSparkPoint.style.transform = `translate(-50%, -50%) scale(${(0.6 + sparkOpacity * 0.4).toFixed(3)})`;
    }

    // Audio chime trigger when hands reconnect at top
    isTouching = currentSep < 4;
    if (isTouching && !lastWasTouching) {
      playChime(659.25, 'triangle', 0.5, 0.1); // subtle touch reconnection tone
    }
    lastWasTouching = isTouching;

    requestAnimationFrame(updateHandsPositions);
  }
  requestAnimationFrame(updateHandsPositions);

  // Mouse Parallax across Hero Stage
  if (heroStage) {
    heroStage.style.pointerEvents = 'auto'; // allow mouse tracking and clicks
    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      mouseStage.targetX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseStage.targetY = (e.clientY - rect.top) / rect.height - 0.5;
    });

    heroStage.addEventListener('mouseleave', () => {
      mouseStage.targetX = 0;
      mouseStage.targetY = 0;
    });

    // Tap/Click on contact stage pulses touch spark
    heroStage.addEventListener('click', () => {
      playChime(587.33, 'sine', 0.6, 0.12);
      if (touchSparkPoint) {
        touchSparkPoint.classList.remove('pulse-active');
        void touchSparkPoint.offsetWidth;
        touchSparkPoint.classList.add('pulse-active');
      }
    });
  }

  // Category filter pills in Hero
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      playClick(1000);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Section 2: Quantum Tunnel & Morphing Words
  // -------------------------------------------------------------------------
  const tunnelCanvas = document.getElementById('tunnelCanvas');
  const tCtx = tunnelCanvas.getContext('2d');
  const morphWord = document.getElementById('morphWord');

  const wordsList = ['NEXT-GEN', 'ENGINEERING', 'AUTONOMOUS AI', 'SYNAPSE CORE', 'PRECISION ROBOTICS'];
  let currentWordIdx = 0;

  setInterval(() => {
    morphWord.classList.add('changing');
    setTimeout(() => {
      currentWordIdx = (currentWordIdx + 1) % wordsList.length;
      morphWord.textContent = wordsList[currentWordIdx];
      morphWord.classList.remove('changing');
    }, 320);
  }, 3200);

  // Tunnel particle hyperspace effect
  let tWidth, tHeight;
  function resizeTunnel() {
    tWidth = tunnelCanvas.width = tunnelCanvas.offsetWidth;
    tHeight = tunnelCanvas.height = tunnelCanvas.offsetHeight;
  }
  window.addEventListener('resize', resizeTunnel);
  resizeTunnel();

  const numParticles = 60;
  const particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      z: Math.random() * 800 + 50,
      speed: Math.random() * 6 + 4,
    });
  }

  function renderTunnel() {
    if (tWidth <= 0 || tHeight <= 0) {
      resizeTunnel();
    }
    tCtx.clearRect(0, 0, tWidth, tHeight);

    const cx = tWidth * 0.5;
    const cy = tHeight * 0.5;

    for (let i = 0; i < numParticles; i++) {
      const p = particles[i];
      p.z -= p.speed;
      if (p.z <= 10) {
        p.z = 800;
        p.x = (Math.random() - 0.5) * 800;
        p.y = (Math.random() - 0.5) * 800;
      }

      const k = 400 / p.z;
      const px = cx + p.x * k;
      const py = cy + p.y * k;
      const size = Math.max(0.5, (1 - p.z / 800) * 3);

      if (px >= 0 && px <= tWidth && py >= 0 && py <= tHeight) {
        tCtx.beginPath();
        tCtx.arc(px, py, size, 0, Math.PI * 2);
        const alpha = (1 - p.z / 800) * 0.7;
        tCtx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        tCtx.fill();
      }
    }

    requestAnimationFrame(renderTunnel);
  }
  renderTunnel();

  // -------------------------------------------------------------------------
  // 6. Section 3: Interactive Draggable Sliders & Live Metrics
  // -------------------------------------------------------------------------
  const slidersConfig = [
    {
      id: 1,
      min: 80,
      max: 99,
      current: 97,
      unit: '%',
      valElem: document.getElementById('metricVal1'),
      track: document.getElementById('track1'),
      fill: document.getElementById('fill1'),
      thumb: document.getElementById('thumb1'),
      tooltip: document.getElementById('tooltip1'),
      formatTip: (v) => `+${Math.round((v - 70) * 1.4)}% over traditional automation`,
    },
    {
      id: 2,
      min: 4,
      max: 48,
      current: 12,
      unit: ' K',
      valElem: document.getElementById('metricVal2'),
      track: document.getElementById('track2'),
      fill: document.getElementById('fill2'),
      thumb: document.getElementById('thumb2'),
      tooltip: document.getElementById('tooltip2'),
      formatTip: (v) => `${(v * 1.2).toFixed(1)}k live neural operations/sec`,
    },
    {
      id: 3,
      min: 10,
      max: 75,
      current: 30,
      unit: '+',
      valElem: document.getElementById('metricVal3'),
      track: document.getElementById('track3'),
      fill: document.getElementById('fill3'),
      thumb: document.getElementById('thumb3'),
      tooltip: document.getElementById('tooltip3'),
      formatTip: (v) => `Deployments across ${Math.round(v * 0.45)} global manufacturing clusters`,
    },
  ];

  slidersConfig.forEach((cfg) => {
    let isDragging = false;

    function updateFromPos(clientX) {
      const rect = cfg.track.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));

      const val = Math.round(cfg.min + pct * (cfg.max - cfg.min));
      cfg.valElem.textContent = val;
      cfg.fill.style.width = `${pct * 100}%`;
      cfg.thumb.style.left = `${pct * 100}%`;
      cfg.tooltip.textContent = cfg.formatTip(val);

      playSliderGlide(pct);
    }

    cfg.track.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateFromPos(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateFromPos(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        playClick(800, 0.05);
      }
    });

    // Touch support for mobile / tablets
    cfg.track.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateFromPos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        updateFromPos(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  });

  // -------------------------------------------------------------------------
  // 7. Section 4: 3D Perspective Card Deck & Technical Inspector Modal
  // -------------------------------------------------------------------------
  const deckWrapper = document.getElementById('fannedDeck');
  const deckCards = document.querySelectorAll('.deck-card');

  // Dynamic 3D tilt tracking cursor on cards deck (Desktop only)
  deckWrapper.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const rect = deckWrapper.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    const rotY = nx * 14;
    const rotX = -ny * 10;
    deckWrapper.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
  });

  deckWrapper.addEventListener('mouseleave', () => {
    deckWrapper.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });

  // Card Spec Data for Modal
  const cardsData = {
    1: {
      tag: 'BIONIC CORE',
      title: 'Tactile Hand v4.2',
      desc: 'High-density synthetic tactile arrays with 0.01s closed-loop neural reaction time. Engineered for sub-millimeter precision manipulation in delicate assembly.',
      img: 'assets/images/card_1.jpg',
      specs: [
        { k: 'DEGREES OF FREEDOM', v: '22 Active DoF' },
        { k: 'TACTILE RESOLUTION', v: '1,024 pressure nodes' },
        { k: 'RESPONSE LATENCY', v: '< 10 ms closed-loop' },
        { k: 'PAYLOAD CAPACITY', v: '18.5 kg continuous' },
      ],
    },
    2: {
      tag: 'PERCEPTION CORE',
      title: 'Stereoscopic Neural LiDAR Head',
      desc: 'Integrated dual 8K depth cameras paired with a 360-degree solid-state LiDAR module. Provides ultra-dense spatial point clouds processed at 120 FPS on-chassis.',
      img: 'assets/images/card_2.jpg',
      specs: [
        { k: 'VISION RESOLUTION', v: 'Dual 8K HDR 120fps' },
        { k: 'LIDAR RANGE', v: '0.05m to 45m' },
        { k: 'SPATIAL ACCURACY', v: '± 0.25 mm' },
        { k: 'NEURAL ACCELERATOR', v: 'NPU-700 120 TOPS' },
      ],
    },
    3: {
      tag: 'DRIVE SYSTEM',
      title: 'High-Torque Harmonic Piston',
      desc: 'Titanium-alloy harmonic drive actuator with zero-backlash planetary gears. Delivers instantaneous torque with sub-milliradian positioning accuracy.',
      img: 'assets/images/card_3.jpg',
      specs: [
        { k: 'PEAK TORQUE', v: '1,200 N·m' },
        { k: 'BACKLASH', v: '< 1 arc-sec' },
        { k: 'EFFICIENCY', v: '96.8% at peak load' },
        { k: 'THERMAL COOLING', v: 'Direct-phase microfluidic' },
      ],
    },
    4: {
      tag: 'PRECISION MECHANICS',
      title: 'Aerospace Ring Bearing Joint',
      desc: 'Custom preloaded crossed-roller bearing built from vacuum-arc remelted Grade 5 Titanium. Designed for multi-million cycle endurance under extreme load.',
      img: 'assets/images/card_4.jpg',
      specs: [
        { k: 'MATERIAL', v: 'Ti-6Al-4V Grade 5' },
        { k: 'RADIAL RUNOUT', v: '< 1.5 µm' },
        { k: 'FATIGUE LIFE', v: '> 50M continuous cycles' },
        { k: 'LUBRICATION', v: 'Synthetic vacuum-sealed grease' },
      ],
    },
    5: {
      tag: 'MODULAR KINEMATICS',
      title: 'Modular Forearm Assembly',
      desc: 'Ultra-lightweight structural carbon fiber composite forearm housing internal wire routing, power bus, and quick-disconnect tool changing mechanism.',
      img: 'assets/images/card_5.jpg',
      specs: [
        { k: 'CHASSIS WEIGHT', v: '1.42 kg' },
        { k: 'INTERFACE BUS', v: '10 Gbps Weltech Synapse' },
        { k: 'TOOL COUPLING', v: 'Magnetic ISO-9409 Quick-Latch' },
        { k: 'POWER BUS', v: '48V DC / 35A Peak' },
      ],
    },
  };

  const cardModal = document.getElementById('cardModal');
  const cardModalImg = document.getElementById('cardModalImg');
  const cardModalTag = document.getElementById('cardModalTag');
  const cardModalTitle = document.getElementById('cardModalTitle');
  const cardModalDesc = document.getElementById('cardModalDesc');
  const cardModalSpecs = document.getElementById('cardModalSpecs');
  const btnCardModalClose = document.getElementById('btnCardModalClose');
  const cardModalBackdrop = document.getElementById('cardModalBackdrop');

  function openCardModal(cardId) {
    const data = cardsData[cardId] || cardsData[1];
    cardModalImg.src = data.img;
    cardModalTag.textContent = data.tag;
    cardModalTitle.textContent = data.title;
    cardModalDesc.textContent = data.desc;

    cardModalSpecs.innerHTML = data.specs
      .map(
        (s) => `
      <div class="spec-row">
        <span class="spec-row-k">${s.k}</span>
        <span class="spec-row-v">${s.v}</span>
      </div>
    `
      )
      .join('');

    cardModal.classList.add('open');
    cardModal.setAttribute('aria-hidden', 'false');
    playClick(1500, 0.08);
  }

  function closeCardModal() {
    cardModal.classList.remove('open');
    cardModal.setAttribute('aria-hidden', 'true');
    playClick(700, 0.05);
  }

  // Active Card Management for Touch & Responsive Viewports
  let activeCardIndex = 3; // Center card (Harmonic Piston) default

  function setActiveCard(targetIndex, shouldOpenModalIfActive = false) {
    targetIndex = parseInt(targetIndex, 10);
    if (targetIndex < 1) targetIndex = 5;
    if (targetIndex > 5) targetIndex = 1;

    if (targetIndex === activeCardIndex && shouldOpenModalIfActive) {
      openCardModal(targetIndex);
      return;
    }

    activeCardIndex = targetIndex;
    const totalCards = 5;

    deckCards.forEach((c) => {
      const cId = parseInt(c.getAttribute('data-card'), 10);
      let diff = cId - activeCardIndex;
      while (diff > 2) diff -= totalCards;
      while (diff < -2) diff += totalCards;
      const pos = diff + 3; // maps -2..2 to 1..5

      c.classList.remove('card-pos-1', 'card-pos-2', 'card-pos-3', 'card-pos-4', 'card-pos-5', 'active-center');
      c.classList.add(`card-pos-${pos}`);
      if (pos === 3) {
        c.classList.add('active-center');
      }
    });

    // Update navigation dots
    const dots = document.querySelectorAll('.deck-dot');
    dots.forEach((dot) => {
      const idx = parseInt(dot.getAttribute('data-idx'), 10);
      dot.classList.toggle('active', idx === activeCardIndex);
    });

    playClick(1050, 0.04);
  }

  deckCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const id = parseInt(card.getAttribute('data-card'), 10);
      const isTouch = window.innerWidth <= 768;
      if (isTouch) {
        if (id === activeCardIndex) {
          openCardModal(id);
        } else {
          setActiveCard(id, false);
        }
      } else {
        setActiveCard(id, false);
        openCardModal(id);
      }
    });
  });

  // Mobile prev/next buttons
  const btnDeckPrev = document.getElementById('btnDeckPrev');
  const btnDeckNext = document.getElementById('btnDeckNext');
  const deckDots = document.querySelectorAll('.deck-dot');

  if (btnDeckPrev) {
    btnDeckPrev.addEventListener('click', () => {
      setActiveCard(activeCardIndex - 1);
    });
  }

  if (btnDeckNext) {
    btnDeckNext.addEventListener('click', () => {
      setActiveCard(activeCardIndex + 1);
    });
  }

  deckDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-idx'), 10);
      setActiveCard(idx);
    });
  });

  // Touch Swipe for Mobile & Tablet on Fanned Deck
  let touchDeckStartX = 0;
  let touchDeckStartY = 0;

  if (deckWrapper) {
    deckWrapper.addEventListener('touchstart', (e) => {
      touchDeckStartX = e.changedTouches[0].clientX;
      touchDeckStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    deckWrapper.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchDeckStartX;
      const deltaY = e.changedTouches[0].clientY - touchDeckStartY;

      // Only handle if horizontal swipe is dominant and significant
      if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0) {
          // Swipe left -> next card
          setActiveCard(activeCardIndex + 1);
        } else {
          // Swipe right -> prev card
          setActiveCard(activeCardIndex - 1);
        }
      }
    }, { passive: true });
  }

  btnCardModalClose.addEventListener('click', closeCardModal);
  cardModalBackdrop.addEventListener('click', closeCardModal);



  // -------------------------------------------------------------------------
  // 9. Menu Drawer & Navigation Links
  // -------------------------------------------------------------------------
  const btnMenuToggle = document.getElementById('btnMenuToggle');
  const menuDrawer = document.getElementById('menuDrawer');
  const btnMenuClose = document.getElementById('btnMenuClose');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openMenu() {
    menuDrawer.classList.add('open');
    menuDrawer.setAttribute('aria-hidden', 'false');
    btnMenuToggle.setAttribute('aria-expanded', 'true');
    playClick(1200);
  }

  function closeMenu() {
    menuDrawer.classList.remove('open');
    menuDrawer.setAttribute('aria-hidden', 'true');
    btnMenuToggle.setAttribute('aria-expanded', 'false');
    playClick(700);
  }

  btnMenuToggle.addEventListener('click', openMenu);
  btnMenuClose.addEventListener('click', closeMenu);
  drawerOverlay.addEventListener('click', closeMenu);

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // -------------------------------------------------------------------------
  // 10. Scalable Solutions Configurator Modal
  // -------------------------------------------------------------------------
  const btnSolutionsModal = document.getElementById('btnSolutionsModal');
  const solutionsModal = document.getElementById('solutionsModal');
  const btnModalClose = document.getElementById('btnModalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const fleetRange = document.getElementById('fleetRange');
  const fleetCountLabel = document.getElementById('fleetCountLabel');
  const estGain = document.getElementById('estGain');
  const estCycle = document.getElementById('estCycle');
  const industryPills = document.querySelectorAll('.form-pill');
  const configuratorForm = document.getElementById('configuratorForm');
  const btnDrawerInquire = document.getElementById('btnDrawerInquire');
  const btnOrderHardware = document.getElementById('btnOrderHardwareSample');

  function openSolutionsModal() {
    solutionsModal.classList.add('open');
    solutionsModal.setAttribute('aria-hidden', 'false');
    playClick(1300);
  }

  function closeSolutionsModal() {
    solutionsModal.classList.remove('open');
    solutionsModal.setAttribute('aria-hidden', 'true');
    playClick(600);
  }

  btnSolutionsModal.addEventListener('click', openSolutionsModal);
  btnModalClose.addEventListener('click', closeSolutionsModal);
  modalBackdrop.addEventListener('click', closeSolutionsModal);

  if (btnDrawerInquire) {
    btnDrawerInquire.addEventListener('click', () => {
      closeMenu();
      openSolutionsModal();
    });
  }

  if (btnOrderHardware) {
    btnOrderHardware.addEventListener('click', () => {
      closeCardModal();
      openSolutionsModal();
    });
  }

  // Interactive fleet calculator
  fleetRange.addEventListener('input', () => {
    const count = parseInt(fleetRange.value, 10);
    fleetCountLabel.textContent = `${count} Units`;

    const gain = (34 + (count / 500) * 28).toFixed(1);
    const cycle = Math.round(200 + (count / 500) * 450);

    estGain.textContent = `+${gain}%`;
    estCycle.textContent = `-${cycle}ms`;
    playSliderGlide(count / 500);
  });

  industryPills.forEach((p) => {
    p.addEventListener('click', () => {
      industryPills.forEach((pill) => pill.classList.remove('active'));
      p.classList.add('active');
      playClick(1000);
    });
  });

  configuratorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('inputWorkEmail').value;
    playChime(784, 'triangle', 0.5, 0.2);
    alert(`Thank you! A custom Weltech robotics blueprint for ${fleetRange.value} units has been dispatched to ${email}.`);
    closeSolutionsModal();
  });

  // -------------------------------------------------------------------------
  // 11. Intuition Section Meta Pills & Footer Email Copy
  // -------------------------------------------------------------------------
  const metaPills = document.querySelectorAll('.meta-pill');
  metaPills.forEach((p) => {
    p.addEventListener('click', () => {
      metaPills.forEach((pill) => pill.classList.remove('active'));
      p.classList.add('active');
      playClick(1100);
    });
  });

  const footerEmail = document.getElementById('footerEmail');
  const copyBadge = document.getElementById('copyBadge');

  footerEmail.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('contact@weltech.ai').then(() => {
      copyBadge.classList.add('visible');
      playClick(1600, 0.08);
      setTimeout(() => {
        copyBadge.classList.remove('visible');
      }, 2000);
    });
  });

  // -------------------------------------------------------------------------
  // 12. Smooth Anchor Navigation inside Scroll Container
  // -------------------------------------------------------------------------
  function scrollToElement(targetEl, instant = false) {
    if (!targetEl) return;
    targetEl.scrollIntoView({
      behavior: instant ? 'instant' : 'smooth',
      block: 'start',
    });
  }

  function handleHashNavigation() {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        scrollToElement(target, true);
      }
    }
  }

  // Intercept all anchor clicks with hash hrefs
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          scrollToElement(target);
          history.pushState(null, '', href);
          playClick(1100, 0.04);
        }
      }
    });
  });

  window.addEventListener('hashchange', handleHashNavigation);
  setTimeout(handleHashNavigation, 150);

  // Global Keybindings (ESC to close modals/drawers)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeSolutionsModal();
      closeCardModal();
    }
  });

  console.log('Weltech Core initialized. Precision Engineering online.');
});
