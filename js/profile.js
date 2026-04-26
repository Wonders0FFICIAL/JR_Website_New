document.addEventListener('DOMContentLoaded', () => {

    const usernameInput    = document.getElementById('username');
    const displayNameInput = document.getElementById('displayName');
    const usernameError    = document.getElementById('username-error');
    const displayNameError = document.getElementById('display-name-error');
    const saveBtn          = document.querySelector('.save-btn');
    const cancelBtn        = document.querySelector('.cancel-btn');
    const editPicBtn       = document.getElementById('editPicBtn');
    const userIdDisplay    = document.getElementById('userIdDisplay');

    let originalUsername    = '';
    let originalDisplayName = '';
    let isFormSubmission    = false;

    function getOrCreateUserId() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (cu.userId) return cu.userId;

        const id = Math.floor(100000000 + Math.random() * 900000000).toString();
        cu.userId = id;
        sessionStorage.setItem('currentUser', JSON.stringify(cu));
        return id;
    }

    userIdDisplay.textContent = getOrCreateUserId();

    function loadProfileData() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

        if (cu.username)    usernameInput.value    = cu.username;
        if (cu.displayName) displayNameInput.value = cu.displayName;

        originalUsername    = usernameInput.value;
        originalDisplayName = displayNameInput.value;

        if (cu.profileImage) {
            setProfilePic(cu.profileImage);
        }
    }

    function setProfilePic(src) {
        const circle = document.getElementById('profilePicCircle');
        circle.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Profile picture';
        circle.appendChild(img);
    }

    loadProfileData();

    if (editPicBtn) {
        editPicBtn.addEventListener('click', () => {
            window.location.href = '/profile-setup';
        });
    }

    function validateUsername(force) {
        if (!force && !isFormSubmission) return true;

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

        usernameError.textContent = '';
        usernameInput.classList.remove('input-error');
        return true;
    }

    function validateDisplayName(force) {
        if (!force && !isFormSubmission) return true;

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
            displayNameError.textContent = 'Display name must be 2–30 characters';
            displayNameInput.classList.add('input-error');
            return false;
        }

        displayNameError.textContent = '';
        displayNameInput.classList.remove('input-error');
        return true;
    }

    usernameInput.addEventListener('blur',    () => validateUsername(true));
    displayNameInput.addEventListener('blur', () => validateDisplayName(true));

    usernameInput.addEventListener('input', () => {
        if (isFormSubmission) validateUsername(true);
        else { usernameError.textContent = ''; usernameInput.classList.remove('input-error'); }
    });

    displayNameInput.addEventListener('input', () => {
        if (isFormSubmission) validateDisplayName(true);
        else { displayNameError.textContent = ''; displayNameInput.classList.remove('input-error'); }
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isFormSubmission = true;

            const usernameOk    = validateUsername(true);
            const displayNameOk = validateDisplayName(true);

            if (!usernameOk) { usernameInput.focus(); isFormSubmission = false; return; }
            if (!displayNameOk) { displayNameInput.focus(); isFormSubmission = false; return; }

            const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            cu.username    = usernameInput.value.trim();
            cu.displayName = displayNameInput.value.trim();
            sessionStorage.setItem('currentUser', JSON.stringify(cu));

            originalUsername    = cu.username;
            originalDisplayName = cu.displayName;

            showNotification('Profile saved successfully!');
            isFormSubmission = false;
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            usernameInput.value    = originalUsername;
            displayNameInput.value = originalDisplayName;
            usernameError.textContent    = '';
            displayNameError.textContent = '';
            usernameInput.classList.remove('input-error');
            displayNameInput.classList.remove('input-error');
            isFormSubmission = false;
            showNotification('Changes discarded');
        });
    }

    function showNotification(message) {
        const existing = document.querySelector('.profile-notification');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = 'profile-notification';
        el.textContent = message;
        Object.assign(el.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#5638E5',
            color: 'white',
            padding: '14px 22px',
            borderRadius: '8px',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '15px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease',
        });
        document.body.appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }

});