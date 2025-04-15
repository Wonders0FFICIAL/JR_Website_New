document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.product-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    const billingToggle = document.getElementById('billing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    const billingPeriods = document.querySelectorAll('.billing-period');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    
    billingToggle.addEventListener('change', () => {
        toggleLabels.forEach((label, index) => {
            label.classList.toggle('active');
        });
        
        if (billingToggle.checked) {
            monthlyPrices.forEach(price => price.style.display = 'none');
            yearlyPrices.forEach(price => price.style.display = 'block');
            billingPeriods.forEach(period => period.textContent = 'per year');
        } else {
            monthlyPrices.forEach(price => price.style.display = 'block');
            yearlyPrices.forEach(price => price.style.display = 'none');
            billingPeriods.forEach(period => period.textContent = 'per month');
        }
    });
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            if (card.classList.contains('featured')) {
                card.style.boxShadow = '0 10px 30px rgba(86, 56, 229, 0.3)';
            } else {
                card.style.boxShadow = '0 10px 30px rgba(86, 56, 229, 0.2)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
    
    const ctaButtons = document.querySelectorAll('.plan-cta');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent === 'Contact Sales') {
                alert('Thank you for your interest! Our sales team will contact you shortly.');
            } else {
                alert('Thank you for choosing JR! Redirecting to registration...');
            }
        });
    });
});