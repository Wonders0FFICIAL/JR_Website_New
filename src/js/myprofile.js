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

    if (profileName) profileName.textContent = displayName;
    if (profileUsername) profileUsername.textContent = `@${username}`;

    document.title = `${displayName} - My Profile`;

    updatePronounsDisplay(currentUser.pronouns);
    updateBioDisplay(currentUser.bio);

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
                el.style.display = 'block';
            } else {
                el.textContent = currentUser.location;
            }
        });
    } else {
        const profileLocationElement = document.querySelector('.profile-location');
        if (profileLocationElement) profileLocationElement.style.display = 'none';
    }
}

function updatePronounsDisplay(pronouns) {
    const existingPronouns = document.querySelector('.profile-pronouns');
    if (existingPronouns) existingPronouns.remove();

    if (pronouns && pronouns.trim() !== '' && pronouns !== 'other') {
        const profileInfo = document.querySelector('.profile-info');
        const profileUsername = document.querySelector('.profile-username');
        const profileLocation = document.querySelector('.profile-location');

        if (profileInfo && profileUsername) {
            const pronounsElement = document.createElement('div');
            pronounsElement.className = 'profile-pronouns';
            pronounsElement.textContent = pronouns;

            if (profileLocation) {
                profileInfo.insertBefore(pronounsElement, profileLocation);
            } else {
                const profileStats = document.querySelector('.profile-stats');
                if (profileStats) {
                    profileInfo.insertBefore(pronounsElement, profileStats);
                } else {
                    profileUsername.insertAdjacentElement('afterend', pronounsElement);
                }
            }
        }
    }
}

function updateBioDisplay(bio) {
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.innerHTML = '';

        if (bio && bio.trim() !== '') {
            const bioP = document.createElement('p');
            bioP.textContent = bio;
            aboutText.appendChild(bioP);
        } else {
            const defaultP = document.createElement('p');
            defaultP.textContent = 'Welcome to my profile! I\'m passionate about technology and always eager to learn new things.';
            aboutText.appendChild(defaultP);

            const defaultP2 = document.createElement('p');
            defaultP2.textContent = 'Feel free to connect with me and explore my work.';
            aboutText.appendChild(defaultP2);
        }
    }
}

window.addEventListener('storage', function (e) {
    if (e.key === 'currentUser') loadProfileData();
});

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        btn.classList.add('active');

        const sectionId = btn.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add('active');
    });
});

function validateDateRange(startMonth, startYear, endMonth, endYear) {
    if (!startMonth || !startYear) {
        return { valid: false, message: 'Please select a valid start date' };
    }

    if (!endMonth || !endYear) return { valid: true };

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
    if (existingModal) existingModal.remove();

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
            if (document.body.contains(modal)) document.body.removeChild(modal);
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

        if (onSubmit(values)) closeModal();
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
    if (existingModal) existingModal.remove();

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

    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(modal)) document.body.removeChild(modal);
        }, 300);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.btn-secondary').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
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
            if (document.body.contains(notification)) document.body.removeChild(notification);
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

    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
});