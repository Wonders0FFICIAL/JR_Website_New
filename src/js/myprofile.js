const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const profileImg = document.getElementById('profileImg');
const contactForm = document.getElementById('contactForm');
const themeToggle = document.getElementById('themeToggle');
const timelineItems = document.querySelectorAll('.timeline-item');

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

profileImg.addEventListener('click', () => {
    const newImageUrl = prompt('Enter new profile image URL:');
    if (newImageUrl) {
        profileImg.src = newImageUrl;
        showNotification('Profile image updated successfully!', 'success');
    }
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const message = contactForm.querySelector('textarea').value;

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
        contactForm.reset();
    }, 1000);
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

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
        
        if(position.top < window.innerHeight && position.bottom >= 0) {
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

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

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