document.addEventListener('DOMContentLoaded', () => {

  const PRODUCTS = {
    moka:  { word: 'browsing', r: 200, g: 162, b: 122 },
    avery: { word: 'thinking', r: 244, g: 114, b: 182 },
    forge: { word: 'shipping', r: 249, g: 115, b: 22  },
    lapis: { word: 'hosting',  r: 96,  g: 165, b: 250 },
    juno:  { word: 'speed',    r: 0,   g: 200, b: 150 },
  };

  const SKELETON_DURATION = 620;
  const SKELETON_HOLD     = 260;

  let currentProduct = 'moka';

  const canvas    = document.getElementById('constellation-canvas');
  const ctx       = canvas.getContext('2d');
  const pills     = document.querySelectorAll('.selector-pill');
  const indicator = document.getElementById('selectorIndicator');
  const heroGrad  = document.getElementById('heroGradientText');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  const STAR_COUNT      = 130;
  const CONNECTION_DIST = 145;
  let stars = [];
  let W, H;
  let targetR = 200, targetG = 162, targetB = 122;
  let currentR = 200, currentG = 162, currentB = 122;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r:  Math.random() * 1.7 + 0.4,
      a:  Math.random() * 0.65 + 0.25,
    }));
  }

  resizeCanvas();
  buildStars();
  window.addEventListener('resize', () => { resizeCanvas(); buildStars(); });

  function lerpColor() {
    const speed = 0.04;
    currentR += (targetR - currentR) * speed;
    currentG += (targetG - currentG) * speed;
    currentB += (targetB - currentB) * speed;
  }

  function drawConstellation() {
    lerpColor();
    ctx.clearRect(0, 0, W, H);
    const r = Math.round(currentR);
    const g = Math.round(currentG);
    const b = Math.round(currentB);

    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    }

    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / CONNECTION_DIST) * 0.2})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${s.a * 0.55})`;
      ctx.fill();
    }

    requestAnimationFrame(drawConstellation);
  }

  drawConstellation();

  function positionIndicator(pill) {
    const trackRect = pill.parentElement.getBoundingClientRect();
    const pillRect  = pill.getBoundingClientRect();
    indicator.style.left  = (pillRect.left - trackRect.left) + 'px';
    indicator.style.width = pillRect.width + 'px';
  }

  function buildSkeletons(panel) {
    const grid = panel.querySelector('.panel-features-grid');
    const ecosystem = panel.querySelector('.ecosystem-strip');

    const cards = grid ? Array.from(grid.querySelectorAll('.feature-card')) : [];

    cards.forEach(card => {
      card.style.transition = 'none';
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(14px)';
      card.dataset.skeletonPending = '1';
    });

    const skeletonGrid = document.createElement('div');
    skeletonGrid.className = 'skeleton-grid';

    cards.forEach(() => {
      const sk = document.createElement('div');
      sk.className = 'skeleton-card';
      sk.innerHTML = '<div class="skeleton-icon"></div><div class="skeleton-line skeleton-title"></div><div class="skeleton-line skeleton-desc-1"></div><div class="skeleton-line skeleton-desc-2"></div>';
      skeletonGrid.appendChild(sk);
    });

    if (grid) grid.before(skeletonGrid);

    let skeletonEco = null;
    if (ecosystem) {
      ecosystem.style.transition = 'none';
      ecosystem.style.opacity    = '0';
      ecosystem.style.transform  = 'translateY(10px)';

      skeletonEco = document.createElement('div');
      skeletonEco.className = 'skeleton-ecosystem';
      skeletonEco.innerHTML = '<div class="skeleton-eco-text"><div class="skeleton-line skeleton-eco-title"></div><div class="skeleton-line skeleton-eco-sub"></div></div><div class="skeleton-eco-btn"></div>';
      ecosystem.after(skeletonEco);
    }

    return { skeletonGrid, skeletonEco };
  }

  function revealCards(panel, skeletons) {
    const grid      = panel.querySelector('.panel-features-grid');
    const ecosystem = panel.querySelector('.ecosystem-strip');
    const cards     = grid ? Array.from(grid.querySelectorAll('.feature-card')) : [];

    const { skeletonGrid, skeletonEco } = skeletons || {};

    if (skeletonGrid) {
      skeletonGrid.classList.add('skeleton-fade-out');
      setTimeout(() => skeletonGrid.remove(), 350);
    }

    if (skeletonEco) {
      const ecoDelay = cards.length * 65 + 60;
      setTimeout(() => {
        skeletonEco.classList.add('skeleton-fade-out');
        setTimeout(() => skeletonEco.remove(), 350);
      }, ecoDelay);
    }

    cards.forEach((card, i) => {
      delete card.dataset.skeletonPending;
      setTimeout(() => {
        card.style.transition = `opacity 0.48s cubic-bezier(0.22,1,0.36,1), transform 0.48s cubic-bezier(0.22,1,0.36,1)`;
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, i * 65);
    });

    if (ecosystem) {
      const delay = cards.length * 65 + 60;
      setTimeout(() => {
        ecosystem.style.transition = `opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)`;
        ecosystem.style.opacity    = '1';
        ecosystem.style.transform  = 'translateY(0)';
      }, delay);
    }
  }

  function updatePillLogos(activeId) {
    pills.forEach(pill => {
      const img = pill.querySelector('.pill-icon');
      if (!img) return;
      img.src = pill.dataset.product === activeId ? img.dataset.logo2 : img.dataset.logo;
    });
  }

  function switchProduct(id) {
    if (id === currentProduct) return;
    const prev = currentProduct;
    currentProduct = id;

    const data = PRODUCTS[id];
    targetR = data.r; targetG = data.g; targetB = data.b;

    document.body.dataset.active = id;

    pills.forEach(p => p.classList.toggle('active', p.dataset.product === id));
    updatePillLogos(id);

    const activePill = document.querySelector(`.selector-pill[data-product="${id}"]`);
    if (activePill) positionIndicator(activePill);

    heroGrad.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    heroGrad.style.opacity    = '0';
    heroGrad.style.transform  = 'translateY(5px)';
    setTimeout(() => {
      heroGrad.textContent      = data.word;
      heroGrad.style.transition = 'opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)';
      heroGrad.style.opacity    = '1';
      heroGrad.style.transform  = 'translateY(0)';
    }, 220);

    const prevPanel = document.querySelector(`.product-panel[data-panel="${prev}"]`);
    const nextPanel = document.querySelector(`.product-panel[data-panel="${id}"]`);

    if (prevPanel) prevPanel.classList.remove('active');
    if (!nextPanel) return;

    nextPanel.style.opacity   = '0';
    nextPanel.style.transform = 'translateY(12px)';
    nextPanel.style.transition = 'none';
    nextPanel.classList.add('active');

    const skeletons = buildSkeletons(nextPanel);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      nextPanel.style.transition = 'opacity 0.42s cubic-bezier(0.22,1,0.36,1), transform 0.42s cubic-bezier(0.22,1,0.36,1)';
      nextPanel.style.opacity    = '1';
      nextPanel.style.transform  = 'translateY(0)';
    }));

    setTimeout(() => {
      nextPanel.style.transition = '';
      nextPanel.style.opacity    = '';
      nextPanel.style.transform  = '';
      revealCards(nextPanel, skeletons);
    }, SKELETON_DURATION + SKELETON_HOLD);
  }

  pills.forEach((pill, i) => {
    pill.setAttribute('tabindex', '0');
    pill.addEventListener('click', () => switchProduct(pill.dataset.product));
    pill.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchProduct(pill.dataset.product); }
      if (e.key === 'ArrowRight') { e.preventDefault(); const n = pills[(i + 1) % pills.length]; n.focus(); switchProduct(n.dataset.product); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); const p = pills[(i - 1 + pills.length) % pills.length]; p.focus(); switchProduct(p.dataset.product); }
    });
  });

  window.addEventListener('resize', () => {
    const activePill = document.querySelector('.selector-pill.active');
    if (activePill) positionIndicator(activePill);
  });

  const initialPill = document.querySelector('.selector-pill.active');
  if (initialPill) positionIndicator(initialPill);

  const initialPanel = document.querySelector('.product-panel.active');
  if (initialPanel) revealCards(initialPanel, { skeletonGrid: null, skeletonEco: null });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    hamburger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navLinks.classList.toggle('active'); }
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) navLinks.classList.remove('active');
    });
  }

});