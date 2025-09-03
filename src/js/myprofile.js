const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const profileImg = document.getElementById('profileImg');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const timelineItems = document.querySelectorAll('.timeline-item');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

function loadProfileData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};

    if (currentUser.profileImage) {
        profileImg.src = currentUser.profileImage;
        profileImg.alt = 'Profile Picture';
    }

    const displayName = currentUser.displayName || currentUser.username;
    if (displayName) {
        profileName.textContent = displayName;
        document.title = `${displayName} - My Profile`;
    }

    if (currentUser.username) {
        profileUsername.textContent = `@${currentUser.username}`;
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        btn.classList.add('active');

        const sectionId = btn.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
        targetSection.classList.add('active');
    });
});

function handleFormSubmit(e) {
    e.preventDefault();

    const form = document.getElementById('contactForm');
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;

    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    setTimeout(() => {
        showNotification('Message sent successfully!', 'success');
        form.querySelector('input[type="text"]').value = '';
        form.querySelector('input[type="email"]').value = '';
        form.querySelector('textarea').value = '';
    }, 1000);
}

const portfolioItems = document.querySelectorAll('.portfolio-item');
portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const title = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;
        const modal = document.createElement('div');
        modal.className = 'portfolio-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h2>${title}</h2>
                <p>${description}</p>
                <div class="modal-buttons">
                    <button class="btn-primary">View Project</button>
                    <button class="btn-secondary">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const closeBtnSecondary = modal.querySelector('.btn-secondary');

        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        closeBtnSecondary.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function animateOnScroll() {
    timelineItems.forEach(item => {
        const position = item.getBoundingClientRect();

        if (position.top < window.innerHeight && position.bottom >= 0) {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }
    });
}

timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(stat => {
    const target = parseInt(stat.textContent);
    let current = 0;
    const increment = Math.ceil(target / 50);

    const updateStat = () => {
        if (current < target) {
            current += increment;
            if (current > target) current = target;
            stat.textContent = current.toLocaleString();
            setTimeout(updateStat, 20);
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateStat();
                observer.unobserve(entry.target);
            }
        });
    });

    observer.observe(stat);
});

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);