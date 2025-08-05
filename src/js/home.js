document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});

let starPositions = [];

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
    const container = document.querySelector('.container');
    const testimonialsSection = document.querySelector('.testimonials-section');
    const navbar = document.querySelector('.navbar');
    const divider = document.querySelector('.divider');
    const footer = document.querySelector('footer');
    
    const buffer = 50;
    const dividerBuffer = 30;
    
    if (container) {
        const containerRect = container.getBoundingClientRect();
        
        if (position.x >= containerRect.left - buffer && 
            position.x <= containerRect.right + buffer &&
            position.y >= containerRect.top - buffer && 
            position.y <= containerRect.bottom + buffer) {
            return true;
        }
    }
    
    if (testimonialsSection) {
        const testimonialsRect = testimonialsSection.getBoundingClientRect();
        
        if (position.x >= testimonialsRect.left - buffer && 
            position.x <= testimonialsRect.right + buffer &&
            position.y >= testimonialsRect.top - buffer && 
            position.y <= testimonialsRect.bottom + buffer) {
            return true;
        }
    }
    
    if (navbar) {
        const navbarRect = navbar.getBoundingClientRect();
        
        if (position.x >= navbarRect.left - dividerBuffer && 
            position.x <= navbarRect.right + dividerBuffer &&
            position.y >= navbarRect.top - dividerBuffer && 
            position.y <= navbarRect.bottom + dividerBuffer) {
            return true;
        }
    }
    
    if (divider) {
        const dividerRect = divider.getBoundingClientRect();
        
        if (position.x >= dividerRect.left - dividerBuffer && 
            position.x <= dividerRect.right + dividerBuffer &&
            position.y >= dividerRect.top - dividerBuffer && 
            position.y <= dividerRect.bottom + dividerBuffer) {
            return true;
        }
    }
    
    if (footer) {
        const footerRect = footer.getBoundingClientRect();
        
        if (position.x >= footerRect.left - dividerBuffer && 
            position.x <= footerRect.right + dividerBuffer &&
            position.y >= footerRect.top - dividerBuffer && 
            position.y <= footerRect.bottom + dividerBuffer) {
            return true;
        }
    }
    
    return false;
}

function findSafeStarPosition(maxAttempts = 20) {
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
    
    for (let i = 0; i < 10; i++) {
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

function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 80;

    for (let i = 0; i < starCount; i++) {
        const position = findSafeStarPosition();
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = position.x + 'px';
        star.style.top = position.y + 'px';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        starPositions.push(position);
        starsContainer.appendChild(star);
    }
}

document.addEventListener('mousemove', (e) => {
    const stars = document.querySelectorAll('.star');
    
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    stars.forEach((star, index) => {
        const speed = (index % 3 + 1) * 0.5;
        star.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        createStars();
    }, 300);
});