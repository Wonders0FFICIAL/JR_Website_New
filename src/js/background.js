let starPositions = [];
let starsInitialized = false;

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename.includes('pricing') || document.querySelector('.pricing-container')) {
        return 'pricing';
    } else if (filename.includes('community') || document.querySelector('.community-card')) {
        return 'community';
    } else {
        return 'other';
    }
}

function wouldCollide(newPos, existingPositions, minDistance) {
    for (let existing of existingPositions) {
        const dx = newPos.x - existing.x;
        const dy = newPos.y - existing.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            return true;
        }
    }
    return false;
}

function isInContentZoneOriginal(position) {
    const contentSelectors = [
        '.container',
        '.title',
        '.subtitle',
        '.description', 
        '.testimonials-section', 
        '.blog-container',
        '.blog-header',
        '.projects-grid',
        '.cards-container',
        '.newsletter-section',
        '.navbar',
        '.divider',
        'footer'
    ];
    
    const buffer = 60;
    const dividerBuffer = 40;
    
    for (let selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        
        const useBuffer = (selector === '.navbar' || selector === '.divider' || selector === 'footer') 
            ? dividerBuffer : buffer;
        
        if (position.x >= rect.left - useBuffer &&
            position.x <= rect.right + useBuffer &&
            position.y >= rect.top - useBuffer &&
            position.y <= rect.bottom + useBuffer) {
            return true;
        }
    }
    
    return false;
}

function isInContentZonePricing(position) {
    const contentSelectors = [
        '.navbar',
        'footer',
        '.pricing-title',
        '.pricing-subtitle', 
        '.product-tabs',
        '.toggle-container',
        '.pricing-card',
        '.comparison-table'
    ];
    
    for (let selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        
        for (let element of elements) {
            if (!element) continue;
            
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            
            let buffer = 25;
            
            if (selector === '.navbar' || selector === 'footer') {
                buffer = 40;
            } else if (selector === '.pricing-card') {
                buffer = 20;
            } else if (selector === '.pricing-title') {
                buffer = 30;
            }
            
            if (position.x >= rect.left - buffer &&
                position.x <= rect.right + buffer &&
                position.y >= rect.top - buffer &&
                position.y <= rect.bottom + buffer) {
                return true;
            }
        }
    }
    
    return false;
}

function isInDeadZone(position) {
    if (getCurrentPage() !== 'pricing') return false;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const centerLeft = screenWidth * 0.15;
    const centerRight = screenWidth * 0.85;
    
    if (position.x > centerLeft && position.x < centerRight) {
        const hasContent = document.querySelector('.pricing-container');
        if (hasContent) {
            const contentTop = 100;
            const contentBottom = screenHeight - 200;
            
            if (position.y > contentTop && position.y < contentBottom) {
                return Math.random() > 0.7;
            }
        }
    }
    
    return false;
}

function findSafeStarPositionOriginal(maxAttempts = 20) {
    for (let i = 0; i < maxAttempts; i++) {
        const position = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };

        if (isInContentZoneOriginal(position)) {
            continue;
        }

        if (!wouldCollide(position, starPositions, 35)) {
            return position;
        }
    }

    for (let i = 0; i < 8; i++) {
        const position = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };

        if (!isInContentZoneOriginal(position)) {
            return position;
        }
    }

    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
    };
}

function findSafeStarPositionPricing(maxAttempts = 25) {
    for (let i = 0; i < maxAttempts; i++) {
        const position = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };

        if (isInDeadZone(position)) {
            continue;
        }

        if (isInContentZonePricing(position)) {
            continue;
        }

        if (!wouldCollide(position, starPositions, 30)) {
            return position;
        }
    }

    for (let i = 0; i < 10; i++) {
        const side = Math.random();
        let position;
        
        if (side < 0.25) {
            position = {
                x: Math.random() * (window.innerWidth * 0.15),
                y: Math.random() * window.innerHeight
            };
        } else if (side < 0.5) {
            position = {
                x: window.innerWidth * 0.85 + Math.random() * (window.innerWidth * 0.15),
                y: Math.random() * window.innerHeight
            };
        } else if (side < 0.75) {
            position = {
                x: Math.random() * window.innerWidth,
                y: Math.random() * (window.innerHeight * 0.2)
            };
        } else {
            position = {
                x: Math.random() * window.innerWidth,
                y: window.innerHeight * 0.8 + Math.random() * (window.innerHeight * 0.2)
            };
        }

        if (!isInContentZonePricing(position)) {
            return position;
        }
    }

    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
    };
}

function findSafeStarPosition(maxAttempts) {
    const currentPage = getCurrentPage();
    
    if (currentPage === 'pricing') {
        return findSafeStarPositionPricing(maxAttempts);
    } else {
        return findSafeStarPositionOriginal(maxAttempts);
    }
}

function getOptimalStarCount() {
    const screenArea = window.innerWidth * window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    const currentPage = getCurrentPage();
    
    if (currentPage === 'pricing') {
        if (isMobile) {
            return Math.min(50, Math.floor(screenArea / 12000));
        } else {
            return Math.min(100, Math.floor(screenArea / 10000));
        }
    } else {
        if (isMobile) {
            return Math.min(35, Math.floor(screenArea / 16000));
        } else {
            return Math.min(75, Math.floor(screenArea / 13000));
        }
    }
}

function createStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    starsContainer.innerHTML = '';
    starPositions = [];

    const starCount = getOptimalStarCount();
    
    document.body.offsetHeight;

    for (let i = 0; i < starCount; i++) {
        const position = findSafeStarPosition();
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = position.x + 'px';
        star.style.top = position.y + 'px';
        const size = Math.random() * 2.5 + 0.8; 
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        
        starPositions.push(position);
        starsContainer.appendChild(star);
    }
    
    starsInitialized = true;
    console.log(`Created ${starCount} stars for ${getCurrentPage()} page`); 
}

let mouseX = 0, mouseY = 0;
let animationFrameId = null;

function updateStarPositions() {
    const stars = document.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        const speed = (index % 3 + 1) * 0.3;
        star.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
    
    animationFrameId = null;
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
    
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateStarPositions);
    }
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        createStars();
    }, 200);
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.readyState === 'complete') {
        setTimeout(() => {
            if (!starsInitialized) {
                createStars();
            }
        }, getCurrentPage() === 'pricing' ? 400 : 600);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!starsInitialized) {
                    createStars();
                }
            }, getCurrentPage() === 'pricing' ? 400 : 600);
        });
    }
});

setTimeout(() => {
    if (!starsInitialized) {
        createStars();
    }
}, getCurrentPage() === 'pricing' ? 1200 : 1500);

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});