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
    const settings = getAppearanceSettings();

    showSaveNotification();

    console.log('Settings applied to all pages. Other pages will use these settings when loaded.');
}

function initializeAppearance() {
    const settings = getAppearanceSettings();

    applyTheme(settings.theme);

    const starsToggle = document.getElementById('starsToggle');
    if (starsToggle) {
        starsToggle.checked = settings.starsEnabled;
    }
    toggleStars(settings.starsEnabled);
}

function setupThemeSelection() {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', function () {
            const theme = this.dataset.theme;
            const settings = getAppearanceSettings();
            settings.theme = theme;

            applyTheme(theme);
            saveAppearanceSettings(settings);
        });
    });
}

function setupStarsToggle() {
    const starsToggle = document.getElementById('starsToggle');
    if (starsToggle) {
        starsToggle.addEventListener('change', function () {
            const enabled = this.checked;
            const settings = getAppearanceSettings();
            settings.starsEnabled = enabled;

            toggleStars(enabled);
            saveAppearanceSettings(settings);
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

            applyTheme(defaultSettings.theme);

            const starsToggle = document.getElementById('starsToggle');
            if (starsToggle) {
                starsToggle.checked = defaultSettings.starsEnabled;
            }
            toggleStars(defaultSettings.starsEnabled);

            saveAppearanceSettings(defaultSettings);
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