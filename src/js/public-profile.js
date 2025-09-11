document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    const settingsForm = document.querySelector('.settings-form');
    const saveBtn = document.querySelector('.save-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('displayName');
    const bioInput = document.getElementById('bio');
    const usernameError = document.getElementById('username-error');
    const displayNameError = document.getElementById('display-name-error');
    const bioError = document.getElementById('bio-error');
    const pronounsSelect = document.getElementById('pronouns');
    const customPronounsContainer = document.getElementById('custom-pronouns-container');
    const customPronounsInput = document.getElementById('custom-pronouns');

    if (pronounsSelect && customPronounsContainer && customPronounsInput) {
        pronounsSelect.addEventListener('change', () => {
            if (pronounsSelect.value === 'custom') {
                customPronounsContainer.style.display = 'block';
                customPronounsInput.focus();
            } else {
                customPronounsContainer.style.display = 'none';
            }
        });
        
        if (pronounsSelect.value === 'custom') {
            customPronounsContainer.style.display = 'block';
        }
    }

    const originalValues = {};
    
    if (usernameInput) originalValues.username = usernameInput.value;
    if (displayNameInput) originalValues.displayName = displayNameInput.value;
    
    const bioElement = document.getElementById('bio');
    if (bioElement) originalValues.bio = bioElement.value;
    
    const pronounsElement = document.getElementById('pronouns');
    if (pronounsElement) originalValues.pronouns = pronounsElement.value;
    
    if (customPronounsInput) originalValues.customPronouns = customPronounsInput.value;
    
    const locationElement = document.getElementById('location');
    if (locationElement) originalValues.location = locationElement.value;
    
    const timezoneElement = document.getElementById('timezone');
    if (timezoneElement) originalValues.timezone = timezoneElement.value;
    
    const displayLocalTimeElement = document.getElementById('displayLocalTime');
    if (displayLocalTimeElement) originalValues.displayLocalTime = displayLocalTimeElement.checked;

    const fieldInteracted = {
        username: false,
        displayName: false,
        bio: false,
        customPronouns: false
    };

    const editPicBtn = document.querySelector('.edit-pic-btn');
    if (editPicBtn) {
        editPicBtn.addEventListener('click', () => {
            window.location.href = 'profile-setup.html';
        });
    }

    function validateUsername() {

        if (!fieldInteracted.username && !isFormSubmission) {
            return true;
        }
        
        const u = usernameInput.value.trim();
        
        if (!u) {
            usernameError.textContent = 'Username is required';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        if (!/^[a-zA-Z0-9._-]*$/.test(u)) {
            usernameError.textContent = 'Only letters, numbers, periods, hyphens and underscores are allowed';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        if (/^[._-]/.test(u) || /[._-]$/.test(u)) {
            usernameError.textContent = 'Cannot start or end with period, underscore, or hyphen';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        if (/[._-]{2}/.test(u)) {
            usernameError.textContent = 'Cannot use consecutive periods, underscores, or hyphens';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        if (u.length < 3) {
            usernameError.textContent = 'Username must be at least 3 characters';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        if (u.length > 21) {
            usernameError.textContent = 'Username cannot exceed 21 characters';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        const reserved = ['admin', 'moderator', 'root', 'null'];
        if (reserved.includes(u.toLowerCase())) {
            usernameError.textContent = 'This username is reserved';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        const emailPattern = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
        if (emailPattern.test(u) || u.toLowerCase().startsWith('http')) {
            usernameError.textContent = 'Username cannot be an email address or URL';
            usernameInput.classList.add('input-error');
            return false;
        }
        
        usernameError.textContent = '';
        usernameInput.classList.remove('input-error');
        return true;
    }

    function validateDisplayName() {
        if (!fieldInteracted.displayName && !isFormSubmission) {
            return true;
        }
        
        const d = displayNameInput.value.trim();
        
        if (!d) {
            displayNameError.textContent = 'Display name is required';
            displayNameInput.classList.add('input-error');
            return false;
        }
      
        if (!/^[a-zA-Z0-9._-]*$/.test(d)) {
            displayNameError.textContent = 'Only letters, numbers, periods, hyphens and underscores are allowed';
            displayNameInput.classList.add('input-error');
            return false;
        }
        
        if (/[._-]{2}/.test(d)) {
            displayNameError.textContent = 'Cannot use consecutive periods, underscores, or hyphens';
            displayNameInput.classList.add('input-error');
            return false;
        }
        
        if (d.length < 2 || d.length > 30) {
            displayNameError.textContent = 'Display name must be 2-30 characters';
            displayNameInput.classList.add('input-error');
            return false;
        }
      
        displayNameError.textContent = '';
        displayNameInput.classList.remove('input-error');
        return true;
    }

    function validateBio() {
        if (!fieldInteracted.bio && !isFormSubmission) {
            return true;
        }
        
        const b = bioInput.value;
        
        if (!b) {
            bioError.textContent = '';
            bioInput.classList.remove('input-error');
            return true;
        }
        
        if (b.length > 500) {
            bioError.textContent = 'Bio cannot exceed 500 characters';
            bioInput.classList.add('input-error');
            return false;
        }
        
        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|org|net|edu|gov|io|co)[^\s]*)/gi;
        if (urlPattern.test(b)) {
            bioError.textContent = 'Links are not allowed in bio';
            bioInput.classList.add('input-error');
            return false;
        }
        
        bioError.textContent = '';
        bioInput.classList.remove('input-error');
        return true;
    }

    function validateCustomPronouns() {
        if (pronounsSelect.value !== 'custom') {
            return true;
        }

        if (customPronounsInput.value.trim() === '') {
            customPronounsInput.classList.add('input-error');
            return false;
        }
        
        customPronounsInput.classList.remove('input-error');
        return true;
    }

    let isFormSubmission = false;

    if (usernameInput) {

        usernameError.textContent = '';
        
        usernameInput.addEventListener('input', () => {
            if (!fieldInteracted.username && usernameInput.value.trim() !== '') {
                fieldInteracted.username = true;
            }

            if (fieldInteracted.username) {
                validateUsername();
            }
        });

        usernameInput.addEventListener('blur', () => {
            fieldInteracted.username = true;
            validateUsername();
        });
    }

    if (displayNameInput) {
        displayNameError.textContent = '';
        
        displayNameInput.addEventListener('input', () => {
            if (!fieldInteracted.displayName && displayNameInput.value.trim() !== '') {
                fieldInteracted.displayName = true;
            }
            
            if (fieldInteracted.displayName) {
                validateDisplayName();
            }
        });
        
        displayNameInput.addEventListener('blur', () => {
            fieldInteracted.displayName = true;
            validateDisplayName();
        });
    }

    if (customPronounsInput) {
        customPronounsInput.addEventListener('input', () => {
            if (!fieldInteracted.customPronouns && customPronounsInput.value.trim() !== '') {
                fieldInteracted.customPronouns = true;
            }
            
            if (fieldInteracted.customPronouns) {
                validateCustomPronouns();
            }
        });
        
        customPronounsInput.addEventListener('blur', () => {
            fieldInteracted.customPronouns = true;
            validateCustomPronouns();
        });
    }

    if (bioInput) {
        bioError.textContent = '';
        
        bioInput.setAttribute('placeholder', 'Tell us about yourself... Share your interests, expertise, or anything you\'d like others to know');
        
        const bioCharCounter = document.getElementById('bio-char-count');
        
        function updateBioCounter() {
            const charCount = bioInput.value.length;
            const remainingChars = 500 - charCount;
            bioCharCounter.textContent = remainingChars.toString();
        
            if (remainingChars <= -1 && remainingChars >= 0) {
                bioCharCounter.classList.add('approaching-limit');
                bioCharCounter.classList.remove('over-limit');
            } else if (remainingChars < 0) {
                bioCharCounter.classList.remove('approaching-limit');
                bioCharCounter.classList.add('over-limit');
                bioCharCounter.style.color = '#ff0000';
            } else {
                bioCharCounter.classList.remove('approaching-limit', 'over-limit');
                bioCharCounter.style.color = '';
            }
        }
        
        if (bioCharCounter) {
            updateBioCounter();
        }
        
        bioInput.addEventListener('input', () => {
            if (!fieldInteracted.bio && bioInput.value.trim() !== '') {
                fieldInteracted.bio = true;
            }
            

            if (bioCharCounter) {
                updateBioCounter();
            }
            
            if (fieldInteracted.bio) {
                validateBio();
            }
        });

        bioInput.addEventListener('blur', () => {
            fieldInteracted.bio = true;
            validateBio();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            isFormSubmission = true;
            
            let isValid = true;
            
            if (usernameInput && !validateUsername()) {
                isValid = false;
                usernameInput.focus();
            }
            
            if (displayNameInput && !validateDisplayName()) {
                if (isValid) {
                    isValid = false;
                    displayNameInput.focus();
                }
            }
            
            if (bioInput && !validateBio()) {
                if (isValid) {
                    isValid = false;
                    bioInput.focus();
                }
            }
            
            if (customPronounsInput && pronounsSelect.value === 'custom' && !validateCustomPronouns()) {
                if (isValid) {
                    isValid = false;
                    customPronounsInput.focus();
                }
            }
            
            if (!isValid) {
                isFormSubmission = false;
                return;
            }
            
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
            if (usernameInput) currentUser.username = usernameInput.value.trim();
            if (displayNameInput) currentUser.displayName = displayNameInput.value.trim();
            if (bioInput) currentUser.bio = bioInput.value.trim();
            if (pronounsSelect) {
                if (pronounsSelect.value === 'custom' && customPronounsInput) {
                    currentUser.pronouns = customPronounsInput.value.trim();
                } else {
                    currentUser.pronouns = pronounsSelect.value;
                }
            }
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            if (pronounsSelect.value === 'custom' && customPronounsInput) {
                console.log('Custom pronouns:', customPronounsInput.value);
            }
            
            showNotification('Settings saved successfully!');

            Object.keys(originalValues).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        originalValues[key] = element.checked;
                    } else {
                        originalValues[key] = element.value;
                    }
                }
            });
            
            if (customPronounsInput && pronounsSelect.value === 'custom') {
                originalValues.customPronouns = customPronounsInput.value;
            }
            
            isFormSubmission = false;
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            Object.keys(originalValues).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = originalValues[key];
                    } else {
                        element.value = originalValues[key];
                    }
                }
            });
            
            if (pronounsSelect) {
                pronounsSelect.value = originalValues.pronouns || '';

                if (customPronounsContainer) {
                    if (pronounsSelect.value === 'custom') {
                        customPronounsContainer.style.display = 'block';
                        if (customPronounsInput) {
                            customPronounsInput.value = originalValues.customPronouns || '';
                        }
                    } else {
                        customPronounsContainer.style.display = 'none';
                    }
                }
            }
            
            if (usernameError) {
                usernameError.textContent = '';
                usernameInput.classList.remove('input-error');
                fieldInteracted.username = false;
            }
            
            if (displayNameError) {
                displayNameError.textContent = '';
                displayNameInput.classList.remove('input-error');
                fieldInteracted.displayName = false;
            }
            
            if (bioError) {
                bioError.textContent = '';
                bioInput.classList.remove('input-error');
                fieldInteracted.bio = false;
                
                const bioCharCounter = document.getElementById('bio-char-count');
                if (bioCharCounter) {
                    const remainingChars = 500 - bioInput.value.length;
                    bioCharCounter.textContent = remainingChars.toString();
                    bioCharCounter.classList.remove('approaching-limit', 'over-limit');
                }
            }
            
            if (customPronounsInput) {
                customPronounsInput.classList.remove('input-error');
                fieldInteracted.customPronouns = false;
            }
            
            showNotification('Changes discarded');
        });
    }

    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm) {
                    showNotification(`Searching for: "${searchTerm}"`);
                }
            }
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
                <button class="notification-close">×</button>
            </div>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
        
        Object.assign(notification.querySelector('.notification-content').style, {
            background: '#5638E5',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '16px'
        });
        
        Object.assign(notification.querySelector('.notification-close').style, {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: '15px'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

    function loadProfileData() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser'));
        if (cu?.username && usernameInput) usernameInput.value = cu.username;
        if (cu?.displayName && displayNameInput) displayNameInput.value = cu.displayName;
        if (cu?.bio && bioInput) bioInput.value = cu.bio;
        if (cu?.pronouns && pronounsSelect) {
            if (cu.pronouns !== 'he/him' && cu.pronouns !== 'she/her' && 
                cu.pronouns !== 'they/them' && cu.pronouns !== 'other' && 
                cu.pronouns !== '' && customPronounsInput) {
                pronounsSelect.value = 'custom';
                customPronounsInput.value = cu.pronouns;
                if (customPronounsContainer) {
                    customPronounsContainer.style.display = 'block';
                }
            } else {
                pronounsSelect.value = cu.pronouns;
            }
        }
        
        if (usernameInput) originalValues.username = usernameInput.value;
        if (displayNameInput) originalValues.displayName = displayNameInput.value;
        if (bioInput) originalValues.bio = bioInput.value;
        if (pronounsSelect) originalValues.pronouns = pronounsSelect.value;
        if (customPronounsInput && pronounsSelect.value === 'custom') {
            originalValues.customPronouns = customPronounsInput.value;
        }
        
        const profilePicCircle = document.querySelector('.profile-pic-circle');
        if (profilePicCircle && cu?.profileImage) {
            profilePicCircle.innerHTML = '';
            const img = document.createElement('img');
            img.src = cu.profileImage;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.alt = 'Profile picture';
            profilePicCircle.appendChild(img);
        }

        if (bioInput) {
            const bioCharCounter = document.getElementById('bio-char-count');
            if (bioCharCounter) {
                const remainingChars = 500 - bioInput.value.length;
                bioCharCounter.textContent = remainingChars.toString();
            }
        }
        
    }
    
    try {
        loadProfileData();
    } catch (error) {
        console.error("Error loading profile data:", error);
    }
    
    if (usernameError) usernameError.textContent = '';
    if (displayNameError) displayNameError.textContent = '';
    if (bioError) bioError.textContent = '';
});