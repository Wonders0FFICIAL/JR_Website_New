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
    
    // Custom pronouns elements
    const pronounsSelect = document.getElementById('pronouns');
    const customPronounsContainer = document.getElementById('custom-pronouns-container');
    const customPronounsInput = document.getElementById('custom-pronouns');

    // Handle display of custom pronouns input
    if (pronounsSelect && customPronounsContainer && customPronounsInput) {
        pronounsSelect.addEventListener('change', () => {
            if (pronounsSelect.value === 'custom') {
                customPronounsContainer.style.display = 'block';
                customPronounsInput.focus();
            } else {
                customPronounsContainer.style.display = 'none';
            }
        });
        
        // Initialize custom pronouns container visibility
        if (pronounsSelect.value === 'custom') {
            customPronounsContainer.style.display = 'block';
        }
    }

    // Initialize originalValues if the form elements exist
    const originalValues = {};
    
    if (usernameInput) originalValues.username = usernameInput.value;
    if (displayNameInput) originalValues.displayName = displayNameInput.value;
    
    const bioElement = document.getElementById('bio');
    if (bioElement) originalValues.bio = bioElement.value;
    
    const pronounsElement = document.getElementById('pronouns');
    if (pronounsElement) originalValues.pronouns = pronounsElement.value;
    
    // Add original value for custom pronouns if present
    if (customPronounsInput) originalValues.customPronouns = customPronounsInput.value;
    
    const locationElement = document.getElementById('location');
    if (locationElement) originalValues.location = locationElement.value;
    
    const timezoneElement = document.getElementById('timezone');
    if (timezoneElement) originalValues.timezone = timezoneElement.value;
    
    const displayLocalTimeElement = document.getElementById('displayLocalTime');
    if (displayLocalTimeElement) originalValues.displayLocalTime = displayLocalTimeElement.checked;

    // Track if fields have been interacted with
    const fieldInteracted = {
        username: false,
        displayName: false,
        bio: false,
        customPronouns: false
    };

    // Edit profile picture functionality
    const editPicBtn = document.querySelector('.edit-pic-btn');
    if (editPicBtn) {
        editPicBtn.addEventListener('click', () => {
            alert('This would open a file upload dialog in a real application');
        });
    }

    // Username validation function - improved with code from profile.js
    function validateUsername() {
        // If the field hasn't been interacted with, don't show errors yet
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

    // Display name validation function
    function validateDisplayName() {
        // If the field hasn't been interacted with, don't show errors yet
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

   // Bio validation function
    function validateBio() {
        // If the field hasn't been interacted with, don't show errors yet
        if (!fieldInteracted.bio && !isFormSubmission) {
            return true;
        }
        
        const b = bioInput.value;
        
        // Bio is not required, so empty is fine
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
        
        // Check for URLs/links in bio
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

    // Custom pronouns validation - only needed if 'custom' is selected
    function validateCustomPronouns() {
        if (pronounsSelect.value !== 'custom') {
            return true;
        }
        
        // If custom is selected but no value is provided
        if (customPronounsInput.value.trim() === '') {
            customPronounsInput.classList.add('input-error');
            return false;
        }
        
        customPronounsInput.classList.remove('input-error');
        return true;
    }

    // Flag to track if validation is triggered by form submission
    let isFormSubmission = false;

    // Add event listeners for validation
    if (usernameInput) {
        // Don't validate on load - wait for user interaction
        usernameError.textContent = '';
        
        usernameInput.addEventListener('input', () => {
            // Mark as interacted with on first keystroke
            if (!fieldInteracted.username && usernameInput.value.trim() !== '') {
                fieldInteracted.username = true;
            }
            
            // Validate in real-time once interaction has begun
            if (fieldInteracted.username) {
                validateUsername();
            }
        });
        
        // Also validate on blur for when a user tabs through fields
        usernameInput.addEventListener('blur', () => {
            fieldInteracted.username = true;
            validateUsername();
        });
    }

    if (displayNameInput) {
        // Don't validate on load - wait for user interaction
        displayNameError.textContent = '';
        
        displayNameInput.addEventListener('input', () => {
            // Mark as interacted with on first keystroke
            if (!fieldInteracted.displayName && displayNameInput.value.trim() !== '') {
                fieldInteracted.displayName = true;
            }
            
            // Validate in real-time once interaction has begun
            if (fieldInteracted.displayName) {
                validateDisplayName();
            }
        });
        
        // Also validate on blur for when a user tabs through fields
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
        // Don't validate on load - wait for user interaction
        bioError.textContent = '';
        
        // Update placeholder to include character limit
        bioInput.setAttribute('placeholder', 'Tell us about yourself... Share your interests, expertise, or anything you\'d like others to know');
        
        // Add character counter display
        const bioCharCounter = document.getElementById('bio-char-count');
        
        function updateBioCounter() {
            const charCount = bioInput.value.length;
            const remainingChars = 500 - charCount;
            bioCharCounter.textContent = remainingChars.toString();
            
            // Add visual indicator when approaching limit
            if (remainingChars <= -1 && remainingChars >= 0) {
                bioCharCounter.classList.add('approaching-limit');
                bioCharCounter.classList.remove('over-limit');
            } else if (remainingChars < 0) {
                bioCharCounter.classList.remove('approaching-limit');
                bioCharCounter.classList.add('over-limit');
                // Make the negative number text red
                bioCharCounter.style.color = '#ff0000';
            } else {
                bioCharCounter.classList.remove('approaching-limit', 'over-limit');
                // Reset the color to default
                bioCharCounter.style.color = '';
            }
        }
        
        // Initialize counter
        if (bioCharCounter) {
            updateBioCounter();
        }
        
        bioInput.addEventListener('input', () => {
            // Mark as interacted with on first keystroke
            if (!fieldInteracted.bio && bioInput.value.trim() !== '') {
                fieldInteracted.bio = true;
            }
            
            // Update character counter
            if (bioCharCounter) {
                updateBioCounter();
            }
            
            // Validate in real-time once interaction has begun
            if (fieldInteracted.bio) {
                validateBio();
            }
        });
        
        // Also validate on blur for when a user tabs through fields
        bioInput.addEventListener('blur', () => {
            fieldInteracted.bio = true;
            validateBio();
        });
    }

    // Save button functionality
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Set form submission flag to true for validation
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
            
            // If using custom pronouns, we would store the value here in a real app
            if (pronounsSelect.value === 'custom' && customPronounsInput) {
                // In a real app, we'd store the custom pronouns value from customPronounsInput.value
                console.log('Custom pronouns:', customPronounsInput.value);
            }
            
            showNotification('Settings saved successfully!');
            
            // Update original values
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
            
            // Update custom pronouns original value if relevant
            if (customPronounsInput && pronounsSelect.value === 'custom') {
                originalValues.customPronouns = customPronounsInput.value;
            }
            
            isFormSubmission = false;
        });
    }

    // Cancel button functionality
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
            
            // Reset custom pronouns field specifically
            if (pronounsSelect) {
                pronounsSelect.value = originalValues.pronouns || '';
                
                // Toggle visibility of custom pronouns input
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
            
            // Clear error messages and reset field interaction status
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
                
                // Update character counter if it exists
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

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm) {
                    showNotification(`Searching for: "${searchTerm}"`);
                    // In a real application, this would perform a search
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

    // Load profile data from session storage if available
    function loadProfileData() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser'));
        if (cu?.username && usernameInput) usernameInput.value = cu.username;
        if (cu?.displayName && displayNameInput) displayNameInput.value = cu.displayName;
        if (cu?.bio && bioInput) bioInput.value = cu.bio;
        if (cu?.pronouns && pronounsSelect) {
            // Handle custom pronouns if needed
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
        
        // Update originalValues for newly loaded values
        if (usernameInput) originalValues.username = usernameInput.value;
        if (displayNameInput) originalValues.displayName = displayNameInput.value;
        if (bioInput) originalValues.bio = bioInput.value;
        if (pronounsSelect) originalValues.pronouns = pronounsSelect.value;
        if (customPronounsInput && pronounsSelect.value === 'custom') {
            originalValues.customPronouns = customPronounsInput.value;
        }
        
        // Update bio character counter if it exists
        if (bioInput) {
            const bioCharCounter = document.getElementById('bio-char-count');
            if (bioCharCounter) {
                const remainingChars = 500 - bioInput.value.length;
                bioCharCounter.textContent = remainingChars.toString();
            }
        }
        
        // Don't run validation on initial load
    }
    
    // Try to load profile data if available
    try {
        loadProfileData();
    } catch (error) {
        console.error("Error loading profile data:", error);
    }
    
    // Ensure error messages are empty on initial load
    if (usernameError) usernameError.textContent = '';
    if (displayNameError) displayNameError.textContent = '';
    if (bioError) bioError.textContent = '';
});