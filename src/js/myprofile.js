const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const profileImg = document.getElementById('profileImg');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

let experiences = [];
let projects = [];
let editingProjectIndex = -1;

const cachedElements = {
    projectsCountElement: null,
    portfolioGrid: null,
    timeline: null
};

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
            defaultP.textContent = "Hey, I'm new to JR.!";
            aboutText.appendChild(defaultP);
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

function updateProjectsCount() {
    if (!cachedElements.projectsCountElement) {
        cachedElements.projectsCountElement = document.querySelector('.stat:nth-child(1) .stat-number');
    }
    if (cachedElements.projectsCountElement) {
        cachedElements.projectsCountElement.textContent = projects.length;
    }
}

function validateAndProcessImage(file) {
    return new Promise((resolve, reject) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            reject('Please select a valid image file (JPG, PNG, or WebP)');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            reject('Image size must be less than 5MB');
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = function () {
            const maxWidth = 1920;
            const maxHeight = 1080;

            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const widthRatio = maxWidth / width;
                const heightRatio = maxHeight / height;
                const ratio = Math.min(widthRatio, heightRatio);

                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImageData = canvas.toDataURL('image/jpeg', 0.9);
            resolve(resizedImageData);
        };

        img.onerror = function () {
            reject('Failed to process image');
        };

        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.onerror = function () {
            reject('Failed to read image file');
        };
        reader.readAsDataURL(file);
    });
}

function validateUrl(url, type = 'general') {
    if (!url || url.trim() === '') return { valid: true };

    url = url.trim();

    const dangerousChars = /[<>'"(){}[\]\\`]/;
    if (dangerousChars.test(url)) {
        return {
            valid: false,
            message: 'URL contains invalid characters. Please remove: < > \' " ( ) { } [ ] \\ `'
        };
    }

    let urlToValidate = url;
    let hasProtocol = false;
    let finalUrl = url;

    if (/^https?:\/\//i.test(url)) {
        hasProtocol = true;
        finalUrl = url;
    } else {
        urlToValidate = 'https://' + url;
        finalUrl = 'https://' + url;
    }

    let urlObj;
    try {
        urlObj = new URL(urlToValidate);
    } catch (e) {
        return {
            valid: false,
            message: 'Invalid URL format. Please check your URL.'
        };
    }

    const hostname = urlObj.hostname.toLowerCase();

    const localPatterns = [
        /^localhost$/i,
        /^127\.\d+\.\d+\.\d+$/,
        /^192\.168\.\d+\.\d+$/,
        /^10\.\d+\.\d+\.\d+$/,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
        /^0\.\d+\.\d+\.\d+$/,
        /\.local$/i,
        /^::1$/,
        /^fe80::/i
    ];

    if (localPatterns.some(pattern => pattern.test(hostname))) {
        return {
            valid: false,
            message: 'Local addresses and localhost are not allowed. Please use a public URL.'
        };
    }

    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
        return {
            valid: false,
            message: 'IP addresses are not allowed. Please use a domain name.'
        };
    }

    const parts = hostname.split('.');
    if (parts.length < 2) {
        return {
            valid: false,
            message: 'Domain must have at least two parts (e.g., example.com)'
        };
    }

    const tld = parts[parts.length - 1];
    const sld = parts[parts.length - 2];

    const tldPattern = /^[a-z]{2,63}$/i;
    if (!tldPattern.test(tld)) {
        return {
            valid: false,
            message: 'Invalid top-level domain. TLD must be 2-63 letters only.'
        };
    }

    const sldPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (!sldPattern.test(sld)) {
        return {
            valid: false,
            message: 'Invalid domain name. Domain should contain only letters, numbers, and hyphens (not at start/end).'
        };
    }

    for (const part of parts) {
        if (part.includes('--')) {
            return {
                valid: false,
                message: 'Domain cannot contain consecutive hyphens.'
            };
        }
    }

    for (const part of parts) {
        if (part.length > 63) {
            return {
                valid: false,
                message: 'Each part of the domain must be 63 characters or less.'
            };
        }
    }

    if (hostname.length > 253) {
        return {
            valid: false,
            message: 'Domain name is too long (max 253 characters).'
        };
    }

    if (url.includes(' ')) {
        return {
            valid: false,
            message: 'URL cannot contain spaces. Please remove any spaces.'
        };
    }

    if (type === 'github') {
        const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/.+/i;
        if (!githubPattern.test(url)) {
            return {
                valid: false,
                message: 'GitHub URL must be from github.com (e.g., github.com/username or github.com/username/repo)'
            };
        }

        const githubUrl = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
        const pathMatch = githubUrl.match(/^github\.com\/(.+)/i);
        
        if (!pathMatch) {
            return {
                valid: false,
                message: 'Invalid GitHub URL format.'
            };
        }

        const path = pathMatch[1].replace(/\/$/, '');
        const pathParts = path.split('/').filter(part => part.trim() !== '');

        if (pathParts.length === 0) {
            return {
                valid: false,
                message: 'GitHub URL must include a username (e.g., github.com/username)'
            };
        }

        const username = pathParts[0];
        const usernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
        if (!usernamePattern.test(username)) {
            return {
                valid: false,
                message: 'Invalid GitHub username. Must be 1-39 characters, alphanumeric and hyphens only, cannot start or end with hyphen.'
            };
        }

        if (pathParts.length > 1) {
            const repoName = pathParts[1];
            const repoPattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,98}[a-zA-Z0-9])?$/;
            if (!repoPattern.test(repoName) || repoName === '.' || repoName === '..') {
                return {
                    valid: false,
                    message: 'Invalid GitHub repository name. Can contain letters, numbers, hyphens, dots, underscores, up to 100 characters.'
                };
            }
        }

        if (finalUrl.length > 200) {
            return {
                valid: false,
                message: 'GitHub URL is too long. Please use a shorter URL.'
            };
        }
    }

    if (type === 'project') {
        const blockedPatterns = [
            /^example\.(com|org|net|io)$/i,
            /^test\.(com|org|net|io)$/i,
            /^localhost$/i,
            /\.(test|invalid|localhost|example)$/i
        ];

        if (blockedPatterns.some(pattern => pattern.test(hostname))) {
            return {
                valid: false,
                message: 'Please provide a real project URL, not a placeholder or test domain.'
            };
        }

        if (finalUrl.length > 2000) {
            return {
                valid: false,
                message: 'URL is too long. Please use a shorter URL or URL shortener.'
            };
        }
    }

    if (finalUrl.length > 2048) {
        return {
            valid: false,
            message: 'URL is too long. Please use a shorter URL.'
        };
    }

    if (hasProtocol) {
        try {
            decodeURIComponent(url);
        } catch (e) {
            return {
                valid: false,
                message: 'URL contains invalid encoded characters.'
            };
        }
    }

    return { 
        valid: true, 
        url: finalUrl
    };
}

function createImageUploadField(fieldId, currentImage = null) {
    return `
        <div class="form-group">
            <label>Project Image</label>
            <div class="image-upload-container">
                <input type="file" id="${fieldId}" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;">
                <div class="image-preview" id="imagePreview">
                    ${currentImage ? `<img src="${currentImage}" alt="Project preview" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">` : ''}
                    <div class="upload-placeholder" style="display: ${currentImage ? 'none' : 'flex'};">
                        <i class="fas fa-camera"></i>
                        <span>Click to upload image</span>
                        <small>JPG, PNG, WebP (max 5MB, 1920x1080)</small>
                    </div>
                </div>
                <button type="button" class="browse-btn" id="browseBtn">
                    <i class="fas fa-folder-open"></i> Browse Files
                </button>
                ${currentImage ? `<button type="button" class="remove-image-btn" id="removeImageBtn"><i class="fas fa-trash"></i> Remove Image</button>` : ''}
            </div>
        </div>
    `;
}

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
                    ${field.label ? `<label>${field.label}${field.required ? ' *' : ''}</label>` : ''}
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
                    ${field.label ? `<label>${field.label}${field.required ? ' *' : ''}</label>` : ''}
                    <input type="${field.type || 'text'}" id="${field.id}" placeholder="${field.placeholder}" ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}>
                </div>
            `;
        }
    }).join('');

    const imageUploadField = title.includes('Project') ? createImageUploadField('projectImage', null) : '';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                ${fieldsHTML}
                ${imageUploadField}
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm">${title.includes('Edit') ? 'Update' : 'Add'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
        editingProjectIndex = -1;
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
    let selectedImageData = null;
    const isEditing = editingProjectIndex >= 0;
    const existingProject = isEditing ? projects[editingProjectIndex] : null;

    createModal(isEditing ? 'Edit Project' : 'Add New Project', [
        { id: 'name', label: 'Project Name', placeholder: 'My Awesome Project', maxLength: 50, required: true },
        { id: 'description', label: 'Description', placeholder: 'Brief description of your project', type: 'textarea', required: true },
        { id: 'tags', label: 'Tags', placeholder: 'JavaScript, React, Node.js (comma-separated)', required: true },
        { id: 'projectUrl', label: 'Project URL', placeholder: 'https://myproject.com' },
        { id: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/username/project' }
    ], (values) => {
        if (!values.name || !values.description || !values.tags) {
            showNotification('Please fill in project name, description, and tags', 'error');
            return false;
        }

        const projectUrlValidation = validateUrl(values.projectUrl || '', 'project');
        if (values.projectUrl && !projectUrlValidation.valid) {
            showNotification(projectUrlValidation.message, 'error');
            return false;
        }

        const githubUrlValidation = validateUrl(values.githubUrl || '', 'github');
        if (values.githubUrl && !githubUrlValidation.valid) {
            showNotification(githubUrlValidation.message, 'error');
            return false;
        }

        const tagArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

const projectData = {
    name: values.name,
    description: values.description,
    tags: tagArray,
    projectUrl: projectUrlValidation.valid && projectUrlValidation.url ? projectUrlValidation.url : null,
    githubUrl: githubUrlValidation.valid && githubUrlValidation.url ? githubUrlValidation.url : null,
    image: selectedImageData || existingProject?.image || null
};

        if (isEditing) {
            projects[editingProjectIndex] = projectData;
            editingProjectIndex = -1;
            renderProjects();
            showNotification('Project updated successfully!', 'success');
        } else {
            projects.push(projectData);
            renderProjects();
            updateProjectsCount();
            showNotification('Project added successfully!', 'success');
        }

        return true;
    });

    if (isEditing && existingProject) {
        setTimeout(() => {
            document.getElementById('name').value = existingProject.name;
            document.getElementById('description').value = existingProject.description;
            document.getElementById('tags').value = existingProject.tags.join(', ');
            document.getElementById('projectUrl').value = existingProject.projectUrl || '';
            document.getElementById('githubUrl').value = existingProject.githubUrl || '';
        }, 50);
    }

    setTimeout(() => {
        const imageInput = document.getElementById('projectImage');
        const imagePreview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeImageBtn');
        const browseBtn = document.getElementById('browseBtn');

        if (browseBtn && imageInput) {
            browseBtn.addEventListener('click', () => {
                imageInput.click();
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', async function (e) {
                const file = e.target.files[0];
                if (file) {
                    try {
                        selectedImageData = await validateAndProcessImage(file);

                        imagePreview.innerHTML = `
                            <img src="${selectedImageData}" alt="Project preview" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
                        `;

                        browseBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Image';
                        browseBtn.onclick = () => {
                            selectedImageData = null;
                            imageInput.value = '';
                            imagePreview.innerHTML = `
                                <div class="upload-placeholder" style="display: flex;">
                                    <i class="fas fa-camera"></i>
                                    <span>Click to upload image</span>
                                    <small>JPG, PNG, WebP (max 5MB, 1920x1080)</small>
                                </div>
                            `;
                            browseBtn.innerHTML = '<i class="fas fa-folder-open"></i> Browse Files';
                            browseBtn.onclick = () => imageInput.click();
                        };

                    } catch (error) {
                        showNotification(error, 'error');
                        imageInput.value = '';
                    }
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', function () {
                selectedImageData = null;
                if (imageInput) imageInput.value = '';
                imagePreview.innerHTML = `
                    <div class="upload-placeholder" style="display: flex;">
                        <i class="fas fa-camera"></i>
                        <span>Click to upload image</span>
                        <small>JPG, PNG, WebP (max 5MB, 1920x1080)</small>
                    </div>
                `;
            });
        }
    }, 10);
}

function renderProjects() {
    if (!cachedElements.portfolioGrid) {
        cachedElements.portfolioGrid = document.querySelector('.portfolio-grid');
    }

    const portfolioGrid = cachedElements.portfolioGrid;
    if (!portfolioGrid) return;

    const addProjectContainer = portfolioGrid.querySelector('.add-project-container');
    portfolioGrid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    projects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'portfolio-item';

        const imageSection = project.image ? `
            <div class="portfolio-image">
                <img src="${project.image}" alt="${project.name}">
            </div>
        ` : '';

        projectItem.innerHTML = `
            ${imageSection}
            <div class="portfolio-content">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <div class="portfolio-tags">
                    ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <div class="portfolio-actions">
                    ${project.projectUrl ? `<a href="${project.projectUrl}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> View Live</a>` : ''}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
                </div>
            </div>
        `;

        projectItem.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) return;

            editingProjectIndex = index;
            addProject();
        });

        fragment.appendChild(projectItem);
    });

    portfolioGrid.appendChild(fragment);

    if (addProjectContainer) {
        portfolioGrid.appendChild(addProjectContainer);
    }
}

function sortAndRenderExperiences() {
    experiences.sort((a, b) => {
        if (a.currentRole && !b.currentRole) return -1;
        if (!a.currentRole && b.currentRole) return 1;

        if (a.currentRole && b.currentRole) {
            const aStartDate = new Date(a.startYear, a.startMonth - 1);
            const bStartDate = new Date(b.startYear, b.startMonth - 1);
            return bStartDate - aStartDate;
        }

        if (!a.currentRole && !b.currentRole) {
            const aEndDate = new Date(a.endYear, a.endMonth - 1);
            const bEndDate = new Date(b.endYear, b.endMonth - 1);
            return bEndDate - aEndDate;
        }

        return 0;
    });

    if (!cachedElements.timeline) {
        cachedElements.timeline = document.querySelector('.timeline');
    }

    const timeline = cachedElements.timeline;
    if (timeline) {
        timeline.innerHTML = '';

        const fragment = document.createDocumentFragment();

        experiences.forEach((exp, index) => {
            const experienceItem = document.createElement('div');
            experienceItem.className = 'timeline-item';
            experienceItem.style.opacity = '0';
            experienceItem.style.transform = 'translateY(20px)';
            experienceItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h3>${exp.jobTitle}</h3>
                    <h4>${exp.company}</h4>
                    <span class="timeline-date">${exp.dateRange}</span>
                    <p>${exp.description}</p>
                </div>
            `;

            fragment.appendChild(experienceItem);

            setTimeout(() => {
                experienceItem.style.opacity = '1';
                experienceItem.style.transform = 'translateY(0)';
            }, index * 100);
        });

        timeline.appendChild(fragment);
    }
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

        const newExperience = {
            jobTitle: values.jobTitle,
            company: values.company,
            startMonth: parseInt(values.startMonth),
            startYear: parseInt(values.startYear),
            endMonth: values.currentRole ? null : parseInt(values.endMonth),
            endYear: values.currentRole ? null : parseInt(values.endYear),
            currentRole: values.currentRole,
            dateRange: dateRange,
            description: values.description
        };

        experiences.push(newExperience);
        sortAndRenderExperiences();

        showNotification('Experience added successfully!', 'success');
        return true;
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
    updateProjectsCount();

    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
});