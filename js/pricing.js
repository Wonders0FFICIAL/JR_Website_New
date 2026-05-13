document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.product-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    const pricingContainer = document.querySelector('.pricing-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateTab(tab);
            }
        });
    });

    const ORB_CLASSES = ['orb-moka', 'orb-avery', 'orb-forge', 'orb-lapis'];

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
    }

    activateTab(document.querySelector('.product-tab.active'));

    const billingToggle = document.getElementById('billing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    const billingPeriods = document.querySelectorAll('.billing-period');
    const lblMonthly = document.getElementById('lbl-monthly');
    const lblYearly = document.getElementById('lbl-yearly');

    billingToggle.addEventListener('change', () => {
        const isYearly = billingToggle.checked;
        lblMonthly.classList.toggle('active', !isYearly);
        lblYearly.classList.toggle('active', isYearly);

        monthlyPrices.forEach(el => el.style.display = isYearly ? 'none' : 'block');
        yearlyPrices.forEach(el => el.style.display = isYearly ? 'block' : 'none');
        billingPeriods.forEach(el => el.textContent = isYearly ? 'per year' : 'per month');
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
        document.addEventListener('click', e => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.plan-cta').forEach(button => {
        button.addEventListener('click', () => {
            const label = button.textContent.trim();
            if (label === 'Contact sales') {
                window.location.href = '/contact';
            } else if (label === 'Current plan') {
                window.location.href = '/billing';
            } else {
                window.location.href = '/signup';
            }
        });
    });
});