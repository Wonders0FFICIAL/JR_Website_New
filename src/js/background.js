let starPositions = [];
let starsInitialized = false;

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

function isInContentZone(position) {
    const contentSelectors = [
        '.container',
        '.testimonials-section', 
        '.blog-container',
        '.blog-header',
        '.projects-grid',
        '.navbar',
        '.divider',
        'footer'
    ];
    
    const buffer = 50;
    const dividerBuffer = 30;
    
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

function findSafeStarPosition(maxAttempts = 15) {
    for (let i = 0; i < maxAttempts; i++) {
        const position = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };

        if (isInContentZone(position)) {
            continue;
        }

        if (!wouldCollide(position, starPositions, 30)) {
            return position;
        }
    }

    for (let i = 0; i < 5; i++) {
        const position = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };

        if (!isInContentZone(position)) {
            return position;
        }
    }

    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
    };
}

function getOptimalStarCount() {
    const screenArea = window.innerWidth * window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        return Math.min(40, Math.floor(screenArea / 15000));
    } else {
        return Math.min(80, Math.floor(screenArea / 12000));
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
    console.log(`Created ${starCount} stars`); 
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
    }, 150);
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.readyState === 'complete') {
        setTimeout(() => {
            if (!starsInitialized) {
                createStars();
            }
        }, 300);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!starsInitialized) {
                    createStars();
                }
            }, 300);
        });
    }
});

setTimeout(() => {
    if (!starsInitialized) {
        createStars();
    }
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});