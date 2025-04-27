document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const userMenuTrigger = document.getElementById('user-menu-trigger');
    const userMenu = document.getElementById('user-menu');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Profile elements
    const profileImage = document.getElementById('profile-image');
    const navProfileImage = document.getElementById('nav-profile-image');
    const menuProfileImage = document.getElementById('menu-profile-image');
    const displayNameEl = document.getElementById('display-name');
    const usernameEl = document.getElementById('username');
    const menuDisplayName = document.getElementById('menu-display-name');
    const menuUsername = document.getElementById('menu-username');
    
    // Check if the user is logged in
    function checkAuth() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'signup.html';
        }
        return currentUser;
    }
    
    // Load user data
    function loadUserData() {
        const currentUser = checkAuth();
        
        // Set username and display name
        if (currentUser.username) {
            usernameEl.textContent = '@' + currentUser.username;
            menuUsername.textContent = '@' + currentUser.username;
        }
        
        if (currentUser.displayName) {
            displayNameEl.textContent = currentUser.displayName;
            menuDisplayName.textContent = currentUser.displayName;
        }
        
        // Load profile image
        const profileImageSrc = sessionStorage.getItem('profileImage');
        if (profileImageSrc) {
            profileImage.src = profileImageSrc;
            navProfileImage.src = profileImageSrc;
            menuProfileImage.src = profileImageSrc;
        }
    }
    
    // Mobile navigation toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    // User menu toggle
    userMenuTrigger.addEventListener('click', () => {
        userMenu.classList.toggle('active');
    });
    
    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuTrigger.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
    
    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Edit profile button
    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('profileImage');
        sessionStorage.removeItem('cropperData');
        sessionStorage.removeItem('cropperZoom');
        window.location.href = 'signup.html';
    });
    
    // Create and append theme picker
    function createThemePicker() {
        const profileHeaderBg = document.querySelector('.profile-header-bg');
        const themePicker = document.createElement('div');
        themePicker.className = 'theme-picker';
        
        const themes = ['purple', 'blue', 'pink', 'orange', 'green'];
        
        themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${theme}`;
            themeOption.addEventListener('click', () => {
                // Remove all theme classes
                themes.forEach(t => document.body.classList.remove(`theme-${t}`));
                // Add selected theme class
                document.body.classList.add(`theme-${theme}`);
                
                // Save theme preference
                sessionStorage.setItem('userTheme', theme);
            });
            themePicker.appendChild(themeOption);
        });
        
        profileHeaderBg.appendChild(themePicker);
        
        // Load saved theme
        const savedTheme = sessionStorage.getItem('userTheme');
        if (savedTheme) {
            document.body.classList.add(`theme-${savedTheme}`);
        }
    }
    
    // Animation for empty states
    function animateEmptyStates() {
        const emptyStates = document.querySelectorAll('.empty-state, .empty-projects, .empty-activity');
        
        emptyStates.forEach(state => {
            state.style.opacity = '0';
            state.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                state.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                state.style.opacity = '1';
                state.style.transform = 'translateY(0)';
            }, 300);
        });
    }
    
    // Add hover effect to achievements and badges
    function addHoverEffects() {
        const items = document.querySelectorAll('.achievement, .badge');
        
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (item.classList.contains('locked')) return;
                
                const icon = item.querySelector('.achievement-icon, .badge-icon');
                icon.style.transform = 'scale(1.1)';
                icon.style.transition = 'transform 0.3s ease';
            });
            
            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('.achievement-icon, .badge-icon');
                icon.style.transform = 'scale(1)';
            });
        });
    }
    
    // Initialize
    function init() {
        loadUserData();
        createThemePicker();
        animateEmptyStates();
        addHoverEffects();
    }
    
    init();
});