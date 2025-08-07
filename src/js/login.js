document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordIcon = togglePasswordBtn.querySelector('i');
    
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const googleBtn = document.querySelector('.google-btn');
    const githubBtn = document.querySelector('.github-btn');
    const appleBtn = document.querySelector('.apple-btn');
    const signupBtn = document.getElementById('signup-btn');

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

    function updateLayoutForErrors() {
        const passwordError = document.getElementById('password-error');
        const forgotPasswordDiv = document.querySelector('.forgot-password');
        
        setTimeout(() => {
            if (passwordError.textContent.trim() !== '') {
                forgotPasswordDiv.style.marginTop = '4px'; 
            } else {
                forgotPasswordDiv.style.marginTop = '8px'; 
            }
        }, 10);
    }
    
    function validatePassword() {
        const password = passwordInput.value;

        if (password.length < 1) {
            passwordError.textContent = 'Please enter your password';
            updateLayoutForErrors();
            return false;
        }
        passwordError.textContent = '';
        updateLayoutForErrors();
        return true;
    }

    loginButton.addEventListener('click', (e) => {
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
    
    forgotPasswordBtn.addEventListener('click', () => {
        console.log('Forgot password clicked');
        alert('Password reset link will be sent to your email address.');
    });
    
    googleBtn.addEventListener('click', () => {
        console.log('Google login clicked');
        const demoUser = {
            id: 'google_user_' + Date.now(),
            email: 'google_user@example.com',
            provider: 'google'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        window.location.href = 'profile-setup.html';
    });
    
    githubBtn.addEventListener('click', () => {
        console.log('GitHub login clicked');
        const demoUser = {
            id: 'github_user_' + Date.now(),
            email: 'github_user@example.com',
            provider: 'github'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        window.location.href = 'profile-setup.html';
    });
    
    appleBtn.addEventListener('click', () => {
        console.log('Apple login clicked');
        const demoUser = {
            id: 'apple_user_' + Date.now(),
            email: 'apple_user@example.com',
            provider: 'apple'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        window.location.href = 'profile-setup.html';
    });
    
    signupBtn.addEventListener('click', () => {
        console.log('Sign up clicked');
        window.location.href = 'signup.html';
    });
    updateLayoutForErrors();
});