function getCurrentUserEmail() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const userData = JSON.parse(currentUser);
            return userData.email || 'user@example.com';
        } catch (e) {
            const userData = JSON.parse(localStorage.getItem(currentUser));
            return userData ? userData.email : 'user@example.com';
        }
    }
    return 'user@example.com';
}

function isEmailVerified() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const userData = JSON.parse(currentUser);
            return userData.emailVerified || false;
        } catch (e) {
            const userData = JSON.parse(localStorage.getItem(currentUser));
            return userData ? userData.emailVerified || false : false;
        }
    }
    return false;
}

function getCurrentUserPassword() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const userData = JSON.parse(currentUser);
            return userData.password || '';
        } catch (e) {
            const userData = JSON.parse(localStorage.getItem(currentUser));
            return userData ? userData.password : '';
        }
    }
    return '';
}

function hasPasswordAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const userData = JSON.parse(currentUser);
            return !userData.provider;
        } catch (e) {
            const userData = JSON.parse(localStorage.getItem(currentUser));
            return userData ? !userData.provider : false;
        }
    }
    return false;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    if (email.startsWith('.') || email.startsWith('@')) {
        return { valid: false, error: 'Email cannot start with . or @' };
    }

    if (email.endsWith('.') || email.endsWith('@')) {
        return { valid: false, error: 'Email cannot end with . or @' };
    }

    if (email.includes('..')) {
        return { valid: false, error: 'Email cannot contain consecutive dots' };
    }

    const [localPart, domain] = email.split('@');

    if (localPart.length === 0 || localPart.length > 64) {
        return { valid: false, error: 'Email username must be 1-64 characters' };
    }

    if (!domain || domain.length === 0) {
        return { valid: false, error: 'Email must have a domain' };
    }

    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
        return { valid: false, error: 'Email domain must include a top-level domain (e.g., .com)' };
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
        return { valid: false, error: 'Top-level domain must be at least 2 characters' };
    }

    const validCharsRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!validCharsRegex.test(email)) {
        return { valid: false, error: 'Email contains invalid characters' };
    }

    return { valid: true, error: null };
}

function initializeEmail() {
    const email = getCurrentUserEmail();
    const verified = isEmailVerified();

    document.getElementById('currentEmail').textContent = email;

    const verifiedBadge = document.getElementById('verifiedBadge');
    if (verified) {
        verifiedBadge.style.display = 'flex';
        verifiedBadge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
    } else {
        verifiedBadge.style.display = 'flex';
        verifiedBadge.style.color = '#ff9800';
        verifiedBadge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Not Verified';
    }
}

function initializePasswordSection() {
    const hasPassword = hasPasswordAuth();
    const passwordSection = document.getElementById('passwordSection');

    if (!hasPassword) {
        passwordSection.style.display = 'none';
        return;
    }

    passwordSection.style.display = 'block';

    const togglePasswordBtn = document.getElementById('toggleCurrentPassword');
    const passwordValue = document.getElementById('currentPasswordValue');
    let isPasswordVisible = false;

    togglePasswordBtn.addEventListener('click', function () {
        const currentPassword = getCurrentUserPassword();
        if (isPasswordVisible) {
            passwordValue.textContent = '••••••••';
            this.innerHTML = '<i class="fa fa-eye"></i>';
        } else {
            passwordValue.textContent = currentPassword;
            this.innerHTML = '<i class="fa fa-eye-slash"></i>';
        }
        isPasswordVisible = !isPasswordVisible;
    });
}

function setupPasswordChange() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');

    setupPasswordToggle('toggleCurrentPasswordInput', 'currentPasswordInput');
    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmPassword', 'confirmNewPassword');

    changePasswordBtn.addEventListener('click', function () {
        changePasswordForm.style.display = 'block';
        this.style.display = 'none';
    });

    cancelPasswordBtn.addEventListener('click', function () {
        changePasswordForm.style.display = 'none';
        changePasswordBtn.style.display = 'block';
        resetPasswordForm();
    });

    const newPasswordInput = document.getElementById('newPassword');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');

    newPasswordInput.addEventListener('input', function () {
        validateNewPassword();
        updatePasswordStrength(this.value);
    });

    currentPasswordInput.addEventListener('input', function () {
        validateCurrentPassword();
    });

    confirmPasswordInput.addEventListener('input', function () {
        validateConfirmPassword();
    });

    savePasswordBtn.addEventListener('click', function () {
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        const currentPasswordValid = validateCurrentPassword();
        const newPasswordValid = validateNewPassword();
        const confirmPasswordValid = validateConfirmPassword();

        if (currentPasswordValid && newPasswordValid && confirmPasswordValid) {
            updateUserPassword(newPassword);

            document.getElementById('passwordSuccessNotice').style.display = 'flex';

            changePasswordForm.style.display = 'none';
            changePasswordBtn.style.display = 'block';
            resetPasswordForm();

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    });
}

function validateCurrentPassword() {
    const currentPassword = document.getElementById('currentPasswordInput').value;
    const storedPassword = getCurrentUserPassword();
    const errorElement = document.getElementById('current-password-error');

    if (!currentPassword) {
        errorElement.textContent = 'Please enter your current password';
        return false;
    }

    if (currentPassword !== storedPassword) {
        errorElement.textContent = 'Current password is incorrect';
        return false;
    }

    errorElement.textContent = '';
    return true;
}

function validateNewPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const currentPassword = document.getElementById('currentPasswordInput').value;
    const storedPassword = getCurrentUserPassword();
    const errorElement = document.getElementById('new-password-error');

    if (!newPassword) {
        errorElement.textContent = 'Please enter a new password';
        return false;
    }

    if (newPassword.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long';
        return false;
    }

    if (newPassword === storedPassword) {
        errorElement.textContent = 'New password cannot be the same as current password';
        return false;
    }

    if (currentPassword && newPassword === currentPassword) {
        errorElement.textContent = 'New password cannot be the same as current password';
        return false;
    }

    errorElement.textContent = '';
    return true;
}

function validateConfirmPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const errorElement = document.getElementById('confirm-password-error');

    if (!confirmPassword) {
        errorElement.textContent = 'Please confirm your new password';
        return false;
    }

    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return false;
    }

    errorElement.textContent = '';
    return true;
}

function setupPasswordToggle(toggleId, inputId) {
    const toggleBtn = document.getElementById(toggleId);
    const passwordInput = document.getElementById(inputId);

    toggleBtn.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.innerHTML = '<i class="fa fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            this.innerHTML = '<i class="fa fa-eye"></i>';
        }
    });
}

function updatePasswordStrength(password) {
    const passwordStrengthContainer = document.getElementById('password-strength-container');
    const passwordStrengthBar = document.getElementById('password-strength-bar');

    if (password.length === 0) {
        passwordStrengthContainer.style.display = 'none';
        return;
    }

    passwordStrengthContainer.style.display = 'block';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const strengthPercentage = (strength / 5) * 100;
    passwordStrengthBar.style.width = `${strengthPercentage}%`;

    if (strength <= 1) {
        passwordStrengthBar.style.backgroundColor = '#ff0000';
    } else if (strength <= 3) {
        passwordStrengthBar.style.backgroundColor = '#ffa500';
    } else {
        passwordStrengthBar.style.backgroundColor = '#008000';
    }
}

function updateUserPassword(newPassword) {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        let userData;
        try {
            userData = JSON.parse(currentUser);
        } catch (e) {
            userData = JSON.parse(localStorage.getItem(currentUser));
        }

        if (userData) {
            userData.password = newPassword;

            if (currentUser.includes('_user_')) {
                localStorage.setItem(currentUser, JSON.stringify(userData));
            } else {
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        }
    }
}

function resetPasswordForm() {
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('current-password-error').textContent = '';
    document.getElementById('new-password-error').textContent = '';
    document.getElementById('confirm-password-error').textContent = '';
    document.getElementById('password-strength-container').style.display = 'none';
}

document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = this.value;
    const passwordError = document.getElementById('password-error');
    const currentUser = localStorage.getItem('currentUser');

    if (!password) {
        passwordError.textContent = '';
        return;
    }

    if (currentUser) {
        let userData;
        try {
            userData = JSON.parse(currentUser);
            if (userData.provider) {
                passwordError.textContent = 'Social login accounts cannot change email this way';
                return;
            }
            if (userData && userData.password === password) {
                passwordError.textContent = '';
            } else {
                passwordError.textContent = 'Incorrect password. Please enter your JR. account password';
            }
        } catch (e) {
            userData = JSON.parse(localStorage.getItem(currentUser));
            if (userData && userData.password === password) {
                passwordError.textContent = '';
            } else {
                passwordError.textContent = 'Incorrect password. Please enter your JR. account password';
            }
        }
    }
});

document.getElementById('changeEmailBtn').addEventListener('click', function () {
    document.getElementById('changeEmailForm').style.display = 'block';
    this.style.display = 'none';
});

document.getElementById('cancelEmailBtn').addEventListener('click', function () {
    document.getElementById('changeEmailForm').style.display = 'none';
    document.getElementById('changeEmailBtn').style.display = 'block';
    document.getElementById('newEmail').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
});

document.getElementById('newEmail').addEventListener('input', function () {
    const email = this.value.trim();
    const emailError = document.getElementById('email-error');

    if (email.length > 0) {
        const validation = isValidEmail(email);
        if (!validation.valid) {
            emailError.textContent = validation.error;
        } else {
            emailError.textContent = '';
        }
    } else {
        emailError.textContent = '';
    }
});

document.getElementById('saveEmailBtn').addEventListener('click', function () {
    const newEmail = document.getElementById('newEmail').value.trim();
    const password = document.getElementById('confirmPassword').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    emailError.textContent = '';
    passwordError.textContent = '';

    if (!newEmail) {
        emailError.textContent = 'Please enter a new email address';
        return;
    }

    const validation = isValidEmail(newEmail);
    if (!validation.valid) {
        emailError.textContent = validation.error;
        return;
    }

    const currentEmail = getCurrentUserEmail();
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
        emailError.textContent = 'New email must be different from current email';
        return;
    }

    if (!password) {
        passwordError.textContent = 'Please enter your password to confirm';
        return;
    }

    if (passwordError.textContent) {
        return;
    }

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        let userData;
        let passwordMatch = false;

        try {
            userData = JSON.parse(currentUser);
            if (userData.provider) {
                passwordError.textContent = 'Social login accounts cannot change email this way';
                return;
            }
            if (userData && userData.password === password) {
                passwordMatch = true;
            }
        } catch (e) {
            userData = JSON.parse(localStorage.getItem(currentUser));
            if (userData && userData.password === password) {
                passwordMatch = true;
            }
        }

        if (!passwordMatch && !userData.provider) {
            passwordError.textContent = 'Incorrect password. Please enter your JR. account password';
            return;
        }

        userData.email = newEmail;
        userData.emailVerified = false;

        if (currentUser.includes('_user_')) {
            localStorage.setItem(currentUser, JSON.stringify(userData));
        } else {
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }

        document.getElementById('currentEmail').textContent = newEmail;
        const verifiedBadge = document.getElementById('verifiedBadge');
        verifiedBadge.style.display = 'flex';
        verifiedBadge.style.color = '#ff9800';
        verifiedBadge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Not Verified';

        document.getElementById('verificationNotice').style.display = 'flex';

        document.getElementById('changeEmailForm').style.display = 'none';
        document.getElementById('changeEmailBtn').style.display = 'block';

        document.getElementById('newEmail').value = '';
        document.getElementById('confirmPassword').value = '';

        setTimeout(() => {
            userData.emailVerified = true;
            if (currentUser.includes('_user_')) {
                localStorage.setItem(currentUser, JSON.stringify(userData));
            } else {
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
            verifiedBadge.style.color = '#4CAF50';
            verifiedBadge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            document.getElementById('verificationNotice').style.display = 'none';
        }, 3000);
    }
});

function initializeLinkedAccounts() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        let userData;
        try {
            userData = JSON.parse(currentUser);
        } catch (e) {
            userData = JSON.parse(localStorage.getItem(currentUser));
        }

        if (userData && userData.linkedAccounts) {
            if (userData.linkedAccounts.google) {
                updateAccountStatus('google', userData.linkedAccounts.google);
            }

            if (userData.linkedAccounts.github) {
                updateAccountStatus('github', userData.linkedAccounts.github);
            }

            if (userData.linkedAccounts.apple) {
                updateAccountStatus('apple', userData.linkedAccounts.apple);
            }
        }
    }
}

function updateAccountStatus(provider, username) {
    const statusElement = document.getElementById(`${provider}Status`);
    const buttonElement = document.getElementById(`${provider}Btn`);

    if (username) {
        statusElement.textContent = `Connected as ${username}`;
        statusElement.classList.add('connected');
        buttonElement.textContent = 'Disconnect';
        buttonElement.classList.add('connected');
    } else {
        statusElement.textContent = 'Not connected';
        statusElement.classList.remove('connected');
        buttonElement.textContent = 'Connect';
        buttonElement.classList.remove('connected');
    }
}

document.querySelectorAll('.connect-btn').forEach(button => {
    button.addEventListener('click', function () {
        const provider = this.dataset.provider;
        const currentUser = localStorage.getItem('currentUser');

        if (currentUser) {
            let userData;
            try {
                userData = JSON.parse(currentUser);
                if (!userData.linkedAccounts) {
                    userData.linkedAccounts = {};
                }
            } catch (e) {
                userData = JSON.parse(localStorage.getItem(currentUser));
                if (!userData.linkedAccounts) {
                    userData.linkedAccounts = {};
                }
            }

            if (this.textContent === 'Connect') {
                const username = prompt(`Enter your ${provider.charAt(0).toUpperCase() + provider.slice(1)} username:`);
                if (username) {
                    userData.linkedAccounts[provider] = username;
                    if (currentUser.includes('_user_')) {
                        localStorage.setItem(currentUser, JSON.stringify(userData));
                    } else {
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                    }
                    updateAccountStatus(provider, username);
                }
            } else {
                if (confirm(`Are you sure you want to disconnect your ${provider.charAt(0).toUpperCase() + provider.slice(1)} account?`)) {
                    userData.linkedAccounts[provider] = null;
                    if (currentUser.includes('_user_')) {
                        localStorage.setItem(currentUser, JSON.stringify(userData));
                    } else {
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                    }
                    updateAccountStatus(provider, null);
                }
            }
        }
    });
});

async function getActiveSessions() {
    const sessions = [];

    const userAgent = navigator.userAgent;
    let browserName = 'Unknown Browser';
    let osName = 'Unknown OS';

    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
        browserName = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
        browserName = 'Safari';
    } else if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
    } else if (userAgent.indexOf('Edg') > -1) {
        browserName = 'Edge';
    }

    if (userAgent.indexOf('Win') > -1) {
        osName = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
        osName = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
        osName = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
        osName = 'Android';
    } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1) {
        osName = 'iOS';
    }

    let deviceIcon = 'fa-desktop';
    if (userAgent.indexOf('Mobile') > -1 || userAgent.indexOf('Android') > -1 || userAgent.indexOf('iPhone') > -1) {
        deviceIcon = 'fa-mobile-alt';
    } else if (userAgent.indexOf('Tablet') > -1 || userAgent.indexOf('iPad') > -1) {
        deviceIcon = 'fa-tablet-alt';
    }

    let currentIP = 'Unknown';
    let currentLocation = 'Unknown Location';

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        currentIP = data.ip;

        const locationResponse = await fetch(`https://ipapi.co/${currentIP}/json/`);
        const locationData = await locationResponse.json();
        currentLocation = `${locationData.city}, ${locationData.region}, ${locationData.country_name}`;
    } catch (error) {
        console.error('Error fetching IP and location:', error);
        currentIP = '192.168.1.1';
        currentLocation = 'Kanayannur, Kerala, IN';
    }

    sessions.push({
        id: 'current',
        deviceName: `${browserName} on ${osName}`,
        icon: deviceIcon,
        location: currentLocation,
        lastActive: 'Active now',
        ip: currentIP,
        isCurrent: true
    });

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        let userData;
        try {
            userData = JSON.parse(currentUser);
        } catch (e) {
            userData = JSON.parse(localStorage.getItem(currentUser));
        }

        if (userData && userData.sessions) {
            sessions.push(...userData.sessions);
        }
    }

    return sessions;
}

async function renderSessions() {
    const sessionsList = document.getElementById('sessionsList');
    const sessions = await getActiveSessions();

    sessionsList.innerHTML = sessions.map(session => {
        if (session.isCurrent) {
            return `
                <div class="session-item current-session">
                    <div class="session-info">
                        <div class="session-icon">
                            <i class="fas ${session.icon}"></i>
                        </div>
                        <div class="session-details">
                            <div class="session-header">
                                <span class="device-name">${session.deviceName}</span>
                                <span class="current-badge">Current Session • Active Now</span>
                            </div>
                            <div class="session-meta">
                                <span class="location">${session.location}</span>
                            </div>
                            <div class="session-ip">IP: ${session.ip}</div>
                        </div>
                    </div>
                    <div class="session-actions">
                        <span class="current-indicator">This device</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="session-item">
                    <div class="session-info">
                        <div class="session-icon">
                            <i class="fas ${session.icon}"></i>
                        </div>
                        <div class="session-details">
                            <div class="session-header">
                                <span class="device-name">${session.deviceName}</span>
                            </div>
                            <div class="session-meta">
                                <span class="location">${session.location}</span>
                                <span class="last-active">${session.lastActive}</span>
                            </div>
                            <div class="session-ip">IP: ${session.ip}</div>
                        </div>
                    </div>
                    <div class="session-actions">
                        <button class="logout-session-btn" data-session-id="${session.id}">Sign Out</button>
                    </div>
                </div>
            `;
        }
    }).join('');

    document.querySelectorAll('.logout-session-btn').forEach(button => {
        button.addEventListener('click', function () {
            const sessionId = this.dataset.sessionId;
            showLogoutModal(sessionId);
        });
    });
}

let currentLogoutSessionId = null;

function showLogoutModal(sessionId) {
    currentLogoutSessionId = sessionId;
    document.getElementById('logoutModalOverlay').style.display = 'flex';
}

document.getElementById('confirmLogoutBtn').addEventListener('click', function () {
    if (currentLogoutSessionId) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            let userData;
            try {
                userData = JSON.parse(currentUser);
            } catch (e) {
                userData = JSON.parse(localStorage.getItem(currentUser));
            }

            if (userData && userData.sessions) {
                userData.sessions = userData.sessions.filter(s => s.id !== currentLogoutSessionId);
                if (currentUser.includes('_user_')) {
                    localStorage.setItem(currentUser, JSON.stringify(userData));
                } else {
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                }
                renderSessions();
            }
        }
    }
    document.getElementById('logoutModalOverlay').style.display = 'none';
    currentLogoutSessionId = null;
});

document.getElementById('cancelLogoutBtn').addEventListener('click', function () {
    document.getElementById('logoutModalOverlay').style.display = 'none';
    currentLogoutSessionId = null;
});

document.getElementById('closeLogoutModal').addEventListener('click', function () {
    document.getElementById('logoutModalOverlay').style.display = 'none';
    currentLogoutSessionId = null;
});

document.getElementById('logoutAllBtn').addEventListener('click', function () {
    if (confirm('Are you sure you want to sign out of all other sessions?')) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            let userData;
            try {
                userData = JSON.parse(currentUser);
            } catch (e) {
                userData = JSON.parse(localStorage.getItem(currentUser));
            }

            if (userData) {
                userData.sessions = [];
                if (currentUser.includes('_user_')) {
                    localStorage.setItem(currentUser, JSON.stringify(userData));
                } else {
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                }
                renderSessions();
            }
        }
    }
});

document.getElementById('deleteAccountBtn').addEventListener('click', function () {
    document.getElementById('deleteModalOverlay').style.display = 'flex';
});

document.getElementById('closeDeleteModal').addEventListener('click', function () {
    document.getElementById('deleteModalOverlay').style.display = 'none';
    document.getElementById('deleteConfirmation').value = '';
    document.getElementById('confirmDeleteBtn').disabled = true;
});

document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
    document.getElementById('deleteModalOverlay').style.display = 'none';
    document.getElementById('deleteConfirmation').value = '';
    document.getElementById('confirmDeleteBtn').disabled = true;
});

document.getElementById('deleteConfirmation').addEventListener('input', function () {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (this.value === 'DELETE') {
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
});

document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            localStorage.removeItem('currentUser');
        } catch (e) {
            localStorage.removeItem(currentUser);
            localStorage.removeItem('currentUser');
        }

        alert('Your account has been deleted successfully.');
        window.location.href = 'home.html';
    }
});

document.getElementById('deleteModalOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
        document.getElementById('deleteConfirmation').value = '';
        document.getElementById('confirmDeleteBtn').disabled = true;
    }
});

document.getElementById('logoutModalOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
        currentLogoutSessionId = null;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    initializeEmail();
    initializePasswordSection();
    setupPasswordChange();
    initializeLinkedAccounts();
    renderSessions();
});