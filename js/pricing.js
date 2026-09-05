document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.product-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const pricingContainer = document.querySelector('.pricing-container');

    const PRODUCT_COLORS = {
        moka:    { r: 200, g: 162, b: 122 },
        ai:      { r: 244, g: 114, b: 182 },
        forge:   { r: 249, g: 115, b: 22  },
        cloud:   { r: 0,   g: 72,  b: 186 },
        bundles: { r: 86,  g: 56,  b: 229 },
    };

    const NAVBAR_COLORS = {
        moka:    '#C8A27A',
        ai:      '#F472B6',
        forge:   '#F97316',
        cloud:   '#0048BA',
        bundles: '#5638E5',
    };

    const TITLE_GRADIENTS = {
        moka:    'linear-gradient(135deg, #e8c99a 0%, #C8A27A 55%, #a07040 100%)',
        ai:      'linear-gradient(135deg, #f9a8d4 0%, #F472B6 55%, #db2777 100%)',
        forge:   'linear-gradient(135deg, #fdba74 0%, #F97316 55%, #c2410c 100%)',
        cloud:   'linear-gradient(135deg, #6eaff7 0%, #3b82f6 55%, #0048BA 100%)',
        bundles: 'linear-gradient(135deg, #c4b0ff 0%, #7c5cf8 50%, #5638E5 100%)',
    };

    const ORB_CLASSES = ['orb-moka', 'orb-avery', 'orb-forge', 'orb-lapis'];
    const forgeTab = document.querySelector('.product-tab[data-tab="forge"]');
    const forgeIcon = forgeTab ? forgeTab.querySelector('.tab-product-icon') : null;
    const pricingTitleSpan = document.querySelector('.pricing-title span');
    const navbar = document.querySelector('.navbar');

    const canvas = document.createElement('canvas');
    canvas.id = 'pricing-constellation';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.55;';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const STAR_COUNT = 110;
    const CONN_DIST = 140;
    let stars = [], W, H;
    let targetR = 86, targetG = 56, targetB = 229;
    let curR = 86, curG = 56, curB = 229;
    let colorDirty = false;

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function buildStars() {
        stars = Array.from({ length: STAR_COUNT }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            r:  Math.random() * 1.6 + 0.4,
            a:  Math.random() * 0.6 + 0.25,
        }));
    }

    resizeCanvas();
    buildStars();
    window.addEventListener('resize', () => { resizeCanvas(); buildStars(); });

    function lerpColor() {
        if (!colorDirty) return;
        const s = 0.04;
        curR += (targetR - curR) * s;
        curG += (targetG - curG) * s;
        curB += (targetB - curB) * s;
        if (Math.abs(targetR - curR) < 0.1 && Math.abs(targetG - curG) < 0.1 && Math.abs(targetB - curB) < 0.1) {
            curR = targetR; curG = targetG; curB = targetB;
            colorDirty = false;
        }
    }

    function drawConstellation() {
        lerpColor();
        ctx.clearRect(0, 0, W, H);
        const r = Math.round(curR), g = Math.round(curG), b = Math.round(curB);

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
                if (dist < CONN_DIST) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / CONN_DIST) * 0.18})`;
                    ctx.lineWidth = 0.65;
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.stroke();
                }
            }
        }

        for (const s of stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${s.a * 0.5})`;
            ctx.fill();
        }

        requestAnimationFrame(drawConstellation);
    }

    drawConstellation();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateTab(tab);
            }
        });
    });

    function setNavbarAccent(tabName) {
        const c = PRODUCT_COLORS[tabName] ?? PRODUCT_COLORS.bundles;
        const color = NAVBAR_COLORS[tabName] ?? NAVBAR_COLORS.bundles;
        const rgb = `${c.r},${c.g},${c.b}`;
        const root = document.documentElement;
        root.style.setProperty('--accent',            color);
        root.style.setProperty('--accent-glow',       `rgba(${rgb},0.18)`);
        root.style.setProperty('--accent-glow-strong',`rgba(${rgb},0.35)`);
        root.style.setProperty('--accent-subtle',     `rgba(${rgb},0.08)`);
        root.style.setProperty('--accent-tab-bg',     `rgba(${rgb},0.12)`);
        document.body.dataset.pricing = tabName;
    }

    function setConstellationColor(tabName) {
        const c = PRODUCT_COLORS[tabName] ?? PRODUCT_COLORS.bundles;
        targetR = c.r; targetG = c.g; targetB = c.b;
        colorDirty = true;
    }

    function activateTab(tab) {
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const tabName = tab.dataset.tab;
        const target = document.getElementById(`${tabName}-content`);
        if (target) target.classList.add('active');
        if (pricingContainer) pricingContainer.dataset.product = tabName;

        document.body.classList.remove(...ORB_CLASSES);
        if (tabName === 'moka') document.body.classList.add('orb-moka');
        else if (tabName === 'ai') document.body.classList.add('orb-avery');
        else if (tabName === 'forge') document.body.classList.add('orb-forge');
        else if (tabName === 'cloud') document.body.classList.add('orb-lapis');

        if (pricingTitleSpan) {
            pricingTitleSpan.style.backgroundImage = TITLE_GRADIENTS[tabName] ?? TITLE_GRADIENTS.bundles;
        }

        setNavbarAccent(tabName);
        setConstellationColor(tabName);

        if (forgeIcon) {
            forgeIcon.src = tabName === 'forge'
                ? '/assets/images/forge-logo2.png'
                : '/assets/images/forge-logo.png';
        }
    }

    activateTab(document.querySelector('.product-tab.active'));

    const billingToggle = document.getElementById('billing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices  = document.querySelectorAll('.yearly-price');
    const billingPeriods = document.querySelectorAll('.billing-period');
    const lblMonthly = document.getElementById('lbl-monthly');
    const lblYearly  = document.getElementById('lbl-yearly');

    billingToggle.addEventListener('change', () => {
        const isYearly = billingToggle.checked;
        lblMonthly.classList.toggle('active', !isYearly);
        lblYearly.classList.toggle('active', isYearly);
        monthlyPrices.forEach(el => el.style.display = isYearly ? 'none' : 'block');
        yearlyPrices.forEach(el => el.style.display = isYearly ? 'block' : 'none');
        billingPeriods.forEach(el => el.textContent = isYearly ? 'per year' : 'per month');
    });

    document.querySelectorAll('.plan-cta').forEach(button => {
        button.addEventListener('click', () => {
            const label = button.textContent.trim();
            if (label === 'Contact sales') window.location.href = '/contact';
            else if (label === 'Current plan') window.location.href = '/billing';
            else window.location.href = '/signup';
        });
    });
});