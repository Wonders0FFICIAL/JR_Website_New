document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    const signupButton = document.getElementById('signup-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordIcon = togglePasswordBtn.querySelector('i');
    
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const passwordStrengthBar = document.getElementById('password-strength-bar');
    const passwordStrengthContainer = document.getElementById('password-strength-container');
    const googleBtn = document.querySelector('.google-btn');
    const githubBtn = document.querySelector('.github-btn');
    const appleBtn = document.querySelector('.apple-btn');
    const loginBtn = document.getElementById('login-btn');

    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            passwordIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    emailInput.addEventListener('input', () => {
        emailInput.value = emailInput.value.replace(/\s+/g, '');
        validateEmail();
    });

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

        if (!email) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        if (!emailRegex.test(email)) {
            emailError.textContent = 'Invalid email format';
            return false;
        }
        emailError.textContent = '';
        return true;
    }

    passwordInput.addEventListener('input', () => {
        passwordInput.value = passwordInput.value.replace(/\s+/g, '');
        validatePassword();
    });

    function validatePassword() {
        const password = passwordInput.value;
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

        if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters long';
            return false;
        }
        passwordError.textContent = '';
        return true;
    }

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            console.log('Form submitted successfully', {
                email: emailInput.value,
                password: passwordInput.value
            });
            
            const userId = 'user_' + Date.now();
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: userId,
                email: emailInput.value,
            }));
            
            window.location.href = 'profile-setup.html';
        } else {
            if (!isEmailValid) emailInput.focus();
            else if (!isPasswordValid) passwordInput.focus();
        }
    });
    
    googleBtn.addEventListener('click', () => {
        console.log('Google signup clicked');
        const demoUser = {
            id: 'google_user_' + Date.now(),
            email: 'google_user@example.com',
            provider: 'google'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        window.location.href = 'profile-setup.html';
    });
    
    githubBtn.addEventListener('click', () => {
        console.log('GitHub signup clicked');
        const demoUser = {
            id: 'github_user_' + Date.now(),
            email: 'github_user@example.com',
            provider: 'github'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        window.location.href = 'profile-setup.html';
    });
    
    appleBtn.addEventListener('click', () => {
        console.log('Apple signup clicked');
        const demoUser = {
            id: 'apple_user_' + Date.now(),
            email: 'apple_user@example.com',
            provider: 'apple'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        window.location.href = 'profile-setup.html';
    });
    
    loginBtn.addEventListener('click', () => {
        console.log('Login clicked');
        window.location.href = 'login.html';
    });
});