const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const profileImg = document.getElementById('profileImg');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

function loadProfileData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};

    if (currentUser.profileImage) {
        profileImg.src = currentUser.profileImage;
        profileImg.alt = 'Profile Picture';
    }

    const displayName = currentUser.displayName || currentUser.username || 'New User';
    profileName.textContent = displayName;
    document.title = `${displayName} - My Profile`;

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

function addSkill(category) {
    const skill = prompt(`Enter a ${category} skill (max 25 characters):`);
    if (skill && skill.trim()) {
        if (skill.trim().length > 25) {
            showNotification('Skill name must be 25 characters or less', 'error');
            return;
        }

        const categories = document.querySelectorAll('.skill-category');
        categories.forEach(cat => {
            const header = cat.querySelector('h3').textContent.toLowerCase();
            if ((category === 'frontend' && header.includes('frontend')) ||
                (category === 'backend' && header.includes('backend')) ||
                (category === 'tools' && header.includes('tools'))) {
                const list = cat.querySelector('.skill-list');
                const addButton = list.querySelector('.add-skill-btn');

                const skillTag = document.createElement('span');
                skillTag.className = 'skill-tag';
                skillTag.textContent = skill.trim();

                list.insertBefore(skillTag, addButton);
                showNotification(`Added "${skill.trim()}" to ${category} skills!`, 'success');
            }
        });
    }
}

function addProject() {
    const name = prompt('Enter project name (max 50 characters):');
    if (!name || !name.trim()) return;

    if (name.trim().length > 50) {
        showNotification('Project name must be 50 characters or less', 'error');
        return;
    }

    const description = prompt('Enter project description:');
    if (!description || !description.trim()) return;

    const tags = prompt('Enter tags (comma-separated):');
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const portfolioGrid = document.querySelector('.portfolio-grid');
    const addProjectContainer = portfolioGrid.querySelector('.add-project-container');

    const projectItem = document.createElement('div');
    projectItem.className = 'portfolio-item';
    projectItem.innerHTML = `
                <div class="portfolio-image">
                    <img src="https://via.placeholder.com/300x200/5638E5/white?text=${encodeURIComponent(name.trim().substring(0, 10))}" alt="${name.trim()}">
                </div>
                <div class="portfolio-content">
                    <h3>${name.trim()}</h3>
                    <p>${description.trim()}</p>
                    <div class="portfolio-tags">
                        ${tagArray.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>
            `;

    projectItem.addEventListener('click', () => {
        showProjectModal(name.trim(), description.trim());
    });

    portfolioGrid.insertBefore(projectItem, addProjectContainer);
    showNotification('Project added successfully!', 'success');
}

function addExperience() {
    const jobTitle = prompt('Enter job title:');
    if (!jobTitle || !jobTitle.trim()) return;

    const company = prompt('Enter company name:');
    if (!company || !company.trim()) return;

    const dateRange = prompt('Enter date range (e.g., Jan 2020 - Dec 2021):');
    if (!dateRange || !dateRange.trim()) return;

    const description = prompt('Enter job description:');
    if (!description || !description.trim()) return;

    const timeline = document.querySelector('.timeline');

    const experienceItem = document.createElement('div');
    experienceItem.className = 'timeline-item';
    experienceItem.style.opacity = '1';
    experienceItem.style.transform = 'translateY(0)';
    experienceItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h3>${jobTitle.trim()}</h3>
                    <h4>${company.trim()}</h4>
                    <span class="timeline-date">${dateRange.trim()}</span>
                    <p>${description.trim()}</p>
                </div>
            `;

    timeline.appendChild(experienceItem);
    showNotification('Experience added successfully!', 'success');
}

function showProjectModal(title, description) {
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
}

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

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
});

const style = document.createElement('style');
style.textContent = `
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .portfolio-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                animation: slideUp 0.3s ease;
                color: #333;
            }
            
            .modal-close {
                position: absolute;
                top: 15px;
                right: 20px;
                font-size: 30px;
                cursor: pointer;
                color: #666;
            }
            
            .modal-buttons {
                margin-top: 20px;
                display: flex;
                gap: 15px;
            }
            
            .btn-primary, .btn-secondary {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
            }
            
            .btn-secondary {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #eee;
            }
            
            .btn-primary:hover, .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
document.head.appendChild(style);