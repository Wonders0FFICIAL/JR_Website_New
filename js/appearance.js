let currentSelectedTheme = 'default';

function getAppearanceSettings() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    return { theme: savedTheme };
}

function saveAppearanceSettings(settings) {
    localStorage.setItem('theme', settings.theme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.theme === theme);
    });
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
    const selectedCard = document.querySelector('.theme-card.selected');
    const theme = selectedCard ? selectedCard.dataset.theme : currentSelectedTheme;

    currentSelectedTheme = theme;
    saveAppearanceSettings({ theme });
    applyTheme(theme);
    showSaveNotification();
}

function initializeAppearance() {
    const settings = getAppearanceSettings();
    currentSelectedTheme = settings.theme;
    applyTheme(settings.theme);

    const defaultImg = document.querySelector('.theme-img[data-theme-type="default"]');
    const lightImg = document.querySelector('.theme-img[data-theme-type="light"]');

    if (defaultImg) defaultImg.src = '../assets/images/theme-default-preview.png';
    if (lightImg) lightImg.src = '../assets/images/theme-light-preview.png';
}

function setupThemeSelection() {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', function () {
            const theme = this.dataset.theme;
            currentSelectedTheme = theme;

            document.querySelectorAll('.theme-card').forEach(c => {
                c.classList.toggle('selected', c.dataset.theme === theme);
            });

            applyTheme(theme);
        });
    });
}

function setupSaveButton() {
    const saveBtn = document.getElementById('saveAppearance');
    if (saveBtn) {
        saveBtn.addEventListener('click', applyToAllPages);
    }
}

function setupResetButton() {
    const resetBtn = document.getElementById('resetAppearance');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            currentSelectedTheme = 'default';
            saveAppearanceSettings({ theme: 'default' });
            applyTheme('default');
            showSaveNotification();
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeAppearance();
    setupThemeSelection();
    setupSaveButton();
    setupResetButton();
});