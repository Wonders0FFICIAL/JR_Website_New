const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const profileImg = document.getElementById('profileImg');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

function loadProfileData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};

    const savedProfileImage = currentUser.profileImage ||
        sessionStorage.getItem('profileImage') ||
        sessionStorage.getItem('tempCroppedImage');

    if (savedProfileImage && profileImg) {
        profileImg.src = savedProfileImage;
        profileImg.alt = 'Profile Picture';
    } else if (profileImg) {
        profileImg.src = 'https://via.placeholder.com/180x180/5638E5/white?text=U';
        profileImg.alt = 'Profile Picture';
    }

    const displayName = currentUser.displayName || currentUser.username || 'New User';
    const username = currentUser.username || 'newuser';

    if (profileName) {
        profileName.textContent = displayName;
    }
    document.title = `${displayName} - My Profile`;

    if (profileUsername) {
        profileUsername.textContent = `@${username}`;
    }

    if (currentUser.email) {
        const emailElement = document.querySelector('.contact-item:nth-child(1) p');
        if (emailElement) emailElement.textContent = currentUser.email;
    }

    if (currentUser.phone) {
        const phoneElement = document.querySelector('.contact-item:nth-child(2) p');
        if (phoneElement) phoneElement.textContent = currentUser.phone;
    }

    if (currentUser.location) {
        const locationElements = document.querySelectorAll('.contact-item:nth-child(3) p, .profile-location');
        locationElements.forEach(el => {
            if (el.classList.contains('profile-location')) {
                el.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${currentUser.location}`;
            } else {
                el.textContent = currentUser.location;
            }
        });
    }
}

function refreshProfileData() {
    loadProfileData();
}

window.addEventListener('storage', function (e) {
    if (e.key === 'currentUser') {
        loadProfileData();
    }
});

document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        loadProfileData();
    }
});

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        btn.classList.add('active');

        const sectionId = btn.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

function validateDateRange(startMonth, startYear, endMonth, endYear) {
    if (!startMonth || !startYear) {
        return { valid: false, message: 'Please select a valid start date' };
    }

    if (!endMonth || !endYear) {
        return { valid: true };
    }

    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
    const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);

    if (endDate < startDate) {
        return { valid: false, message: 'End date cannot be earlier than start date' };
    }

    if (endDate > new Date()) {
        return { valid: false, message: 'End date cannot be in the future' };
    }

    return { valid: true };
}

function createModal(title, fields, onSubmit) {
    const existingModal = document.querySelector('.input-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'input-modal';

    const fieldsHTML = fields.map(field => {
        if (field.type === 'textarea') {
            return `
                <div class="form-group">
                    ${field.label ? `<label>${field.label}</label>` : ''}
                    <textarea id="${field.id}" placeholder="${field.placeholder}" ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}></textarea>
                </div>
            `;
        } else if (field.type === 'date-pair') {
            return `
                <div class="form-group">
                    <label>${field.label}</label>
                    <div class="date-pair-container">
                        <select id="${field.monthId}">
                            <option value="">Select Month</option>
                            ${field.monthOptions}
                        </select>
                        <select id="${field.yearId}">
                            <option value="">Select Year</option>
                            ${field.yearOptions}
                        </select>
                    </div>
                </div>
            `;
        } else if (field.type === 'checkbox') {
            return `
                <div class="form-group checkbox-group">
                    <div class="custom-checkbox">
                        <input type="checkbox" id="${field.id}">
                        <span class="checkmark"></span>
                    </div>
                    <label for="${field.id}">${field.label}</label>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    ${field.label ? `<label>${field.label}</label>` : ''}
                    <input type="${field.type || 'text'}" id="${field.id}" placeholder="${field.placeholder}" ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}>
                </div>
            `;
        }
    }).join('');

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                ${fieldsHTML}
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm">Add</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modal.querySelector('.btn-confirm').addEventListener('click', () => {
        const values = {};
        fields.forEach(field => {
            if (field.type === 'date-pair') {
                values[field.monthId] = document.getElementById(field.monthId).value.trim();
                values[field.yearId] = document.getElementById(field.yearId).value.trim();
            } else {
                const element = document.getElementById(field.id);
                if (field.type === 'checkbox') {
                    values[field.id] = element.checked;
                } else {
                    values[field.id] = element.value.trim();
                }
            }
        });

        if (onSubmit(values)) {
            closeModal();
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    }, 100);

    const currentRoleCheckbox = modal.querySelector('#currentRole');
    const endMonth = modal.querySelector('#endMonth');
    const endYear = modal.querySelector('#endYear');

    if (currentRoleCheckbox && endMonth && endYear) {
        const customCheckbox = modal.querySelector('.custom-checkbox');
        if (customCheckbox) {
            customCheckbox.addEventListener('click', (e) => {
                if (e.target !== currentRoleCheckbox) {
                    currentRoleCheckbox.checked = !currentRoleCheckbox.checked;
                    currentRoleCheckbox.dispatchEvent(new Event('change'));
                }
            });
        }

        currentRoleCheckbox.addEventListener('change', () => {
            const isDisabled = currentRoleCheckbox.checked;
            endMonth.disabled = isDisabled;
            endYear.disabled = isDisabled;
            if (isDisabled) {
                endMonth.value = '';
                endYear.value = '';
            }
        });
    }
}

function addSkill(category) {
    createModal(`Add ${category} Skill`, [
        { id: 'skill', label: 'Skill Name', placeholder: 'e.g., JavaScript, Python', maxLength: 25 }
    ], (values) => {
        if (!values.skill) {
            showNotification('Please enter a skill name', 'error');
            return false;
        }

        const categories = document.querySelectorAll('.skill-category');
        let added = false;

        categories.forEach(cat => {
            const header = cat.querySelector('h3');
            if (!header) return;

            const headerText = header.textContent.toLowerCase();
            const shouldAdd = (category === 'frontend' && headerText.includes('frontend')) ||
                (category === 'backend' && headerText.includes('backend')) ||
                (category === 'tools' && headerText.includes('tools'));

            if (shouldAdd) {
                const list = cat.querySelector('.skill-list');
                const addButton = list.querySelector('.add-skill-btn');

                const existingSkills = Array.from(list.querySelectorAll('.skill-tag'))
                    .map(tag => tag.textContent.toLowerCase());

                if (existingSkills.includes(values.skill.toLowerCase())) {
                    showNotification('Skill already exists!', 'error');
                    return false;
                }

                const skillTag = document.createElement('span');
                skillTag.className = 'skill-tag';
                skillTag.textContent = values.skill;

                list.insertBefore(skillTag, addButton);
                added = true;
            }
        });

        if (added) {
            showNotification(`Added "${values.skill}" to ${category} skills!`, 'success');
            return true;
        } else {
            showNotification('Could not find skill category', 'error');
            return false;
        }
    });
}

function addProject() {
    createModal('Add New Project', [
        { id: 'name', label: 'Project Name', placeholder: 'My Awesome Project', maxLength: 50 },
        { id: 'description', label: 'Description', placeholder: 'Brief description of your project', type: 'textarea' },
        { id: 'tags', label: 'Tags', placeholder: 'JavaScript, React, Node.js (comma-separated)' }
    ], (values) => {
        if (!values.name || !values.description) {
            showNotification('Please fill in project name and description', 'error');
            return false;
        }

        const tagArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (!portfolioGrid) {
            showNotification('Portfolio grid not found', 'error');
            return false;
        }

        const addProjectContainer = portfolioGrid.querySelector('.add-project-container');

        const projectItem = document.createElement('div');
        projectItem.className = 'portfolio-item';
        projectItem.innerHTML = `
            <div class="portfolio-image">
                <img src="https://via.placeholder.com/300x200/5638E5/white?text=${encodeURIComponent(values.name.substring(0, 10))}" alt="${values.name}">
            </div>
            <div class="portfolio-content">
                <h3>${values.name}</h3>
                <p>${values.description}</p>
                <div class="portfolio-tags">
                    ${tagArray.map(tag => `<span>${tag}</span>`).join('')}
                </div>
            </div>
        `;

        projectItem.addEventListener('click', () => {
            showProjectModal(values.name, values.description);
        });

        if (addProjectContainer) {
            portfolioGrid.insertBefore(projectItem, addProjectContainer);
        } else {
            portfolioGrid.appendChild(projectItem);
        }

        showNotification('Project added successfully!', 'success');
        return true;
    });
}

function addExperience() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1970; year--) {
        years.push(year);
    }

    const monthOptions = months.map((month, index) =>
        `<option value="${index + 1}">${month}</option>`
    ).join('');

    const yearOptions = years.map(year =>
        `<option value="${year}">${year}</option>`
    ).join('');

    createModal('Add Work Experience', [
        { id: 'jobTitle', label: 'Job Title', placeholder: 'Software Developer' },
        { id: 'company', label: 'Company', placeholder: 'Tech Company Inc.' },
        {
            id: 'startDate',
            label: 'Start Date',
            type: 'date-pair',
            monthId: 'startMonth',
            yearId: 'startYear',
            monthOptions: monthOptions,
            yearOptions: yearOptions
        },
        {
            id: 'endDate',
            label: 'End Date',
            type: 'date-pair',
            monthId: 'endMonth',
            yearId: 'endYear',
            monthOptions: monthOptions,
            yearOptions: yearOptions
        },
        {
            id: 'currentRole',
            label: 'I am currently working in this role',
            type: 'checkbox'
        },
        { id: 'description', label: 'Description', placeholder: 'Describe your role and achievements', type: 'textarea' }
    ], (values) => {
        if (!values.jobTitle || !values.company || !values.startMonth || !values.startYear || !values.description) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        if (!values.currentRole) {
            if (!values.endMonth || !values.endYear) {
                showNotification('Please select an end date or check "currently working"', 'error');
                return false;
            }

            const dateValidation = validateDateRange(
                values.startMonth,
                values.startYear,
                values.endMonth,
                values.endYear
            );

            if (!dateValidation.valid) {
                showNotification(dateValidation.message, 'error');
                return false;
            }
        }

        const startDate = `${months[values.startMonth - 1]} ${values.startYear}`;
        let dateRange;

        if (values.currentRole) {
            dateRange = `${startDate} - Present`;
        } else {
            const endDate = `${months[values.endMonth - 1]} ${values.endYear}`;
            dateRange = `${startDate} - ${endDate}`;
        }

        const timeline = document.querySelector('.timeline');
        if (!timeline) {
            showNotification('Timeline not found', 'error');
            return false;
        }

        const experienceItem = document.createElement('div');
        experienceItem.className = 'timeline-item';
        experienceItem.style.opacity = '1';
        experienceItem.style.transform = 'translateY(0)';
        experienceItem.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h3>${values.jobTitle}</h3>
                <h4>${values.company}</h4>
                <span class="timeline-date">${dateRange}</span>
                <p>${values.description}</p>
            </div>
        `;

        timeline.appendChild(experienceItem);
        showNotification('Experience added successfully!', 'success');
        return true;
    });
}

function showProjectModal(title, description) {
    const existingModal = document.querySelector('.portfolio-modal');
    if (existingModal) {
        existingModal.remove();
    }

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
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
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
    if (!form) return;

    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const messageInput = form.querySelector('textarea');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

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
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (messageInput) messageInput.value = '';
    }, 1000);
}

function showNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

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

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
}

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    refreshProfileData();

    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
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
    
    .portfolio-modal .modal-content {
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

    .input-modal {
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

    .input-modal .modal-content {
        background: #0E0F1D;
        border: 2px solid #5638E5;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        animation: slideUp 0.3s ease;
        color: white;
    }

    .modal-header {
        padding: 20px 25px;
        border-bottom: 1px solid #2C2F45;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        color: #5638E5;
        margin: 0;
        font-size: 1.3rem;
    }

    .input-modal .modal-close {
        font-size: 24px;
        cursor: pointer;
        color: #ccc;
        transition: color 0.3s ease;
        position: static;
    }

    .input-modal .modal-close:hover {
        color: #5638E5;
    }

    .modal-body {
        padding: 25px;
    }

    .modal-body .form-group {
        margin-bottom: 20px;
    }

    .modal-body label {
        display: block;
        margin-bottom: 8px;
        color: #5638E5;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .modal-body input,
    .modal-body textarea,
    .modal-body select {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid #2C2F45;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        font-family: inherit;
        background: rgba(10, 13, 24, 0.8);
        color: white;
        box-sizing: border-box;
    }

    .modal-body input::placeholder,
    .modal-body textarea::placeholder {
        color: #888;
    }

    .modal-body input:focus,
    .modal-body textarea:focus,
    .modal-body select:focus {
        outline: none;
        border-color: #5638E5;
        box-shadow: 0 0 10px rgba(86, 56, 229, 0.3);
    }

    .modal-footer {
        padding: 20px 25px;
        border-top: 1px solid #2C2F45;
        display: flex;
        gap: 15px;
        justify-content: flex-end;
    }

    .btn-cancel,
    .btn-confirm {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-family: 'Comfortaa', sans-serif;
        transition: all 0.3s ease;
    }

    .btn-cancel {
        background: #2C2F45;
        color: white;
    }

    .btn-cancel:hover {
        background: #3C3F55;
    }

    .btn-confirm {
        background: linear-gradient(45deg, #5638E5, #0E0634);
        color: white;
    }

    .btn-confirm:hover {
        box-shadow: 0 5px 15px rgba(86, 56, 229, 0.4);
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding: 12px 0;
    }

    .custom-checkbox {
        position: relative;
        display: inline-block;
        cursor: pointer;
    }

    .custom-checkbox input[type="checkbox"] {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
    }

    .checkmark {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
        background: rgba(10, 13, 24, 0.8);
        border: 2px solid #5638E5;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .checkmark::after {
        content: '';
        position: absolute;
        display: none;
        left: 6px;
        top: 2px;
        width: 6px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }

    .custom-checkbox input:checked ~ .checkmark {
        background: linear-gradient(45deg, #5638E5, #0E0634);
        border-color: #5638E5;
    }

    .custom-checkbox input:checked ~ .checkmark::after {
        display: block;
    }

    .custom-checkbox:hover .checkmark {
        border-color: #6f54f8;
        box-shadow: 0 0 10px rgba(86, 56, 229, 0.3);
    }

    .checkbox-group label {
        margin: 0;
        cursor: pointer;
        color: #5638E5;
        font-weight: 600;
        font-size: 0.95rem;
        user-select: none;
    }

    .date-pair-container {
        display: flex;
        gap: 10px;
    }

    .date-pair-container select {
        flex: 1;
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg fill="%23fff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 16px;
        padding-right: 40px;
    }

    .date-pair-container select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .date-pair-container select option {
        background: #0a0d18;
        color: white;
    }

    .portfolio-item {
        background: rgba(10, 13, 24, 0.8);
        border-radius: 15px;
        overflow: hidden;
        border: 1px solid #2C2F45;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .portfolio-item:hover {
        box-shadow: 0 10px 30px rgba(86, 56, 229, 0.3);
        border-color: #5638E5;
    }

    .portfolio-image img {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }

    .portfolio-content {
        padding: 20px;
    }

    .portfolio-content h3 {
        color: white;
        margin-bottom: 10px;
        font-size: 1.2rem;
    }

    .portfolio-content p {
        color: #ccc;
        margin-bottom: 15px;
        line-height: 1.5;
    }

    .portfolio-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .portfolio-tags span {
        background: rgba(86, 56, 229, 0.2);
        color: #5638E5;
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        border: 1px solid rgba(86, 56, 229, 0.3);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

document.head.appendChild(enhancedStyle);