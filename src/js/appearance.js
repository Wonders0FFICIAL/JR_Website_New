let currentSelectedTheme = 'default';
let currentStarsToggleState = true;

function getAppearanceSettings() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    const savedStars = localStorage.getItem('starsEnabled');
    const starsEnabled = savedStars === null ? true : savedStars === 'true';

    return {
        theme: savedTheme,
        starsEnabled: starsEnabled
    };
}

function saveAppearanceSettings(settings) {
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('starsEnabled', settings.starsEnabled);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    document.querySelectorAll('.theme-card').forEach(card => {
        if (card.dataset.theme === theme) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function updateDefaultThemePreview() {
    const defaultThemeImg = document.querySelector('.theme-card[data-theme="default"] .theme-img');
    const starsToggle = document.getElementById('starsToggle');

    if (defaultThemeImg && starsToggle) {
        if (starsToggle.checked && !starsToggle.disabled) {
            defaultThemeImg.src = '../assets/images/theme-default-stars-preview.png';
        } else {
            defaultThemeImg.src = '../assets/images/theme-default-preview.png';
        }
    }
}

function updateStarsToggleState() {
    const starsToggle = document.getElementById('starsToggle');
    const effectContainer = document.querySelector('.effect-toggle-container');

    if (starsToggle && effectContainer) {
        if (currentSelectedTheme === 'light') {
            starsToggle.checked = false;
            starsToggle.disabled = true;
            effectContainer.style.opacity = '0.6';
            effectContainer.style.cursor = 'not-allowed';

            const effectDescription = effectContainer.querySelector('p');
            if (effectDescription) {
                effectDescription.textContent = 'Stars are only available in Default theme';
            }
        } else {
            starsToggle.disabled = false;
            starsToggle.checked = currentStarsToggleState;
            effectContainer.style.opacity = '1';
            effectContainer.style.cursor = 'default';

            const effectDescription = effectContainer.querySelector('p');
            if (effectDescription) {
                effectDescription.textContent = 'Display twinkling stars in the background';
            }
        }

        updateDefaultThemePreview();
    }
}

function toggleStars(enabled) {
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
        if (enabled) {
            starsContainer.style.display = 'block';
            if (typeof createStars === 'function') {
                createStars();
            }
        } else {
            starsContainer.style.display = 'none';
            starsContainer.innerHTML = '';
        }
    }
}

function showSaveNotification() {
    const saveNotice = document.getElementById('saveNotice');
    if (saveNotice) {
        saveNotice.style.display = 'flex';
        setTimeout(() => {
            saveNotice.style.display = 'none';
        }, 3000);
    }
}

function applyToAllPages() {
    const selectedThemeCard = document.querySelector('.theme-card.selected');
    const theme = selectedThemeCard ? selectedThemeCard.dataset.theme : 'default';
    
    const starsEnabled = (theme === 'light') ? false : document.getElementById('starsToggle').checked;

    const settings = {
        theme: theme,
        starsEnabled: starsEnabled
    };

    saveAppearanceSettings(settings);

    currentSelectedTheme = theme;
    currentStarsToggleState = starsEnabled;

    applyTheme(settings.theme);
    updateStarsToggleState();
    toggleStars(settings.starsEnabled);

    showSaveNotification();

    console.log('Settings applied to all pages. Other pages will use these settings when loaded.');
}

function initializeAppearance() {
    const settings = getAppearanceSettings();

    currentSelectedTheme = settings.theme;
    currentStarsToggleState = settings.starsEnabled;

    applyTheme(settings.theme);

    const starsToggle = document.getElementById('starsToggle');
    if (starsToggle) {
        starsToggle.checked = currentStarsToggleState;
    }

    updateStarsToggleState();

    const defaultImg = document.querySelector('.theme-img[data-theme-type="default"]');
    const lightImg = document.querySelector('.theme-img[data-theme-type="light"]');

    if (defaultImg) {
        defaultImg.src = settings.starsEnabled
            ? '../assets/images/theme-default-stars-preview.png'
            : '../assets/images/theme-default-preview.png';
    }
    if (lightImg) {
        lightImg.src = '../assets/images/theme-light-preview.png';
    }
}

function setupThemeSelection() {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', function () {
            const theme = this.dataset.theme;
            currentSelectedTheme = theme;

            document.querySelectorAll('.theme-card').forEach(c => {
                if (c.dataset.theme === theme) {
                    c.classList.add('selected');
                } else {
                    c.classList.remove('selected');
                }
            });

            updateStarsToggleState();
        });
    });
}

function setupStarsToggle() {
    const starsToggle = document.getElementById('starsToggle');
    if (starsToggle) {
        starsToggle.addEventListener('change', function () {
            if (!starsToggle.disabled) {
                currentStarsToggleState = this.checked;

                updateDefaultThemePreview();
            }
        });
    }
}

function setupSaveButton() {
    const saveBtn = document.getElementById('saveAppearance');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            applyToAllPages();
        });
    }
}

function setupResetButton() {
    const resetBtn = document.getElementById('resetAppearance');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            const defaultSettings = {
                theme: 'default',
                starsEnabled: true
            };

            currentSelectedTheme = defaultSettings.theme;
            currentStarsToggleState = defaultSettings.starsEnabled;

            applyTheme(defaultSettings.theme);
            updateStarsToggleState();

            showSaveNotification();
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeAppearance();
    setupThemeSelection();
    setupStarsToggle();
    setupSaveButton();
    setupResetButton();
});