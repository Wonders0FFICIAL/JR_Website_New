document.addEventListener('DOMContentLoaded', function () {
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    function loadThemeSettings() {
        const savedTheme = localStorage.getItem('theme') || 'default';
        applyTheme(savedTheme);
    }

    loadThemeSettings();

    window.addEventListener('storage', function (e) {
        if (e.key === 'theme') {
            applyTheme(e.newValue);
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    window.pushNotificationsEnabled = false;
    window.dndEndTime = null;

    function saveNotificationPreferences() {
        const preferences = {
            email: {
                accountActivity: document.getElementById('emailAccountActivity').checked,
                productUpdates: document.getElementById('emailProductUpdates').checked,
                newsletter: document.getElementById('emailNewsletter').checked,
                marketing: document.getElementById('emailMarketing').checked,
                community: document.getElementById('emailCommunity').checked
            },
            push: {
                enabled: window.pushNotificationsEnabled,
                messages: document.getElementById('pushMessages').checked,
                followers: document.getElementById('pushFollowers').checked,
                likes: document.getElementById('pushLikes').checked,
                mentions: document.getElementById('pushMentions').checked
            },
            frequency: document.querySelector('input[name="frequency"]:checked').value,
            dnd: {
                enabled: document.getElementById('doNotDisturb').checked,
                duration: parseInt(document.querySelector('.schedule-btn.active')?.dataset.duration || 1),
                endTime: window.dndEndTime
            },
            sounds: {
                enabled: document.getElementById('notificationSounds').checked,
                volume: parseInt(document.getElementById('volumeSlider').value)
            }
        };

        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        console.log('Saved preferences:', preferences);
    }

    function loadNotificationPreferences() {
        const savedPreferences = JSON.parse(localStorage.getItem('notificationPreferences')) || {};
        console.log('Loading preferences:', savedPreferences);

        const emailPrefs = savedPreferences.email || {
            accountActivity: true,
            productUpdates: true,
            newsletter: false,
            marketing: false,
            community: true
        };

        document.getElementById('emailAccountActivity').checked = emailPrefs.accountActivity;
        document.getElementById('emailProductUpdates').checked = emailPrefs.productUpdates;
        document.getElementById('emailNewsletter').checked = emailPrefs.newsletter;
        document.getElementById('emailMarketing').checked = emailPrefs.marketing;
        document.getElementById('emailCommunity').checked = emailPrefs.community;

        const pushPrefs = savedPreferences.push || {
            enabled: false,
            messages: true,
            followers: true,
            likes: false,
            mentions: true
        };

        window.pushNotificationsEnabled = pushPrefs.enabled;

        if (pushPrefs.enabled) {
            document.getElementById('pushNotificationStatus').style.display = 'none';
            document.getElementById('pushPreferences').style.display = 'flex';
        } else {
            document.getElementById('pushNotificationStatus').style.display = 'flex';
            document.getElementById('pushPreferences').style.display = 'none';
        }

        document.getElementById('pushMessages').checked = pushPrefs.messages;
        document.getElementById('pushFollowers').checked = pushPrefs.followers;
        document.getElementById('pushLikes').checked = pushPrefs.likes;
        document.getElementById('pushMentions').checked = pushPrefs.mentions;

        const frequency = savedPreferences.frequency || 'realtime';
        const frequencyRadio = document.querySelector(`input[name="frequency"][value="${frequency}"]`);
        if (frequencyRadio) {
            frequencyRadio.checked = true;
        }

        const dnd = savedPreferences.dnd || {
            enabled: false,
            duration: 1,
            endTime: null
        };

        const scheduleButtons = document.querySelectorAll('.schedule-btn');
        scheduleButtons.forEach(btn => btn.classList.remove('active'));
        const activeDurationBtn = document.querySelector(`.schedule-btn[data-duration="${dnd.duration}"]`);
        if (activeDurationBtn) {
            activeDurationBtn.classList.add('active');
        } else {
            scheduleButtons[0]?.classList.add('active');
        }

        document.getElementById('doNotDisturb').checked = dnd.enabled;
        const dndSchedule = document.getElementById('dndSchedule');

        if (dnd.enabled) {
            if (dnd.endTime) {
                const now = new Date().getTime();
                if (now < dnd.endTime) {
                    dndSchedule.style.display = 'block';
                    window.dndEndTime = dnd.endTime;
                    updateDndStatus(dnd.endTime);
                } else {
                    document.getElementById('doNotDisturb').checked = false;
                    dndSchedule.style.display = 'none';
                    window.dndEndTime = null;
                }
            } else {
                dndSchedule.style.display = 'block';
            }
        } else {
            dndSchedule.style.display = 'none';
        }

        const sounds = savedPreferences.sounds || {
            enabled: true,
            volume: 70
        };

        document.getElementById('notificationSounds').checked = sounds.enabled;
        document.getElementById('volumeSlider').value = sounds.volume;
        document.getElementById('volumeValue').textContent = sounds.volume + '%';

        const volumeControl = document.getElementById('volumeControl');
        if (sounds.enabled) {
            volumeControl.style.display = 'block';
        } else {
            volumeControl.style.display = 'none';
        }
    }

    loadNotificationPreferences();

    const enablePushBtn = document.getElementById('enablePushBtn');
    if (enablePushBtn) {
        enablePushBtn.addEventListener('click', function () {
            if ('Notification' in window) {
                Notification.requestPermission().then(function (permission) {
                    if (permission === 'granted') {
                        window.pushNotificationsEnabled = true;
                        document.getElementById('pushNotificationStatus').style.display = 'none';
                        document.getElementById('pushPreferences').style.display = 'flex';
                        showNotification('Push notifications enabled! Click "Save Changes" to keep this setting.');
                    } else {
                        showNotification('Push notification permission denied', 'error');
                    }
                });
            } else {
                showNotification('Push notifications are not supported in your browser', 'error');
            }
        });
    }

    const disablePushBtn = document.getElementById('disablePushBtn');
    if (disablePushBtn) {
        disablePushBtn.addEventListener('click', function() {
            this.classList.add('btn-loading');
            this.disabled = true;
            
            setTimeout(() => {
                window.pushNotificationsEnabled = false;
                document.getElementById('pushNotificationStatus').style.display = 'flex';
                document.getElementById('pushPreferences').style.display = 'none';

                document.getElementById('pushMessages').checked = false;
                document.getElementById('pushFollowers').checked = false;
                document.getElementById('pushLikes').checked = false;
                document.getElementById('pushMentions').checked = false;
                
                this.classList.remove('btn-loading');
                this.disabled = false;
                
                showNotification('Push notifications disabled. Click "Save Changes" to keep this setting.');
            }, 800);
        });
    }

    const dndToggle = document.getElementById('doNotDisturb');
    const dndSchedule = document.getElementById('dndSchedule');

    if (dndToggle) {
        dndToggle.addEventListener('change', function () {
            if (this.checked) {
                dndSchedule.style.display = 'block';
                const duration = parseInt(document.querySelector('.schedule-btn.active').dataset.duration);
                const endTime = new Date().getTime() + (duration * 60 * 60 * 1000);
                window.dndEndTime = endTime;
                updateDndStatus(endTime);
            } else {
                dndSchedule.style.display = 'none';
                window.dndEndTime = null;
            }
        });
    }

    function updateDndStatus(endTime) {
        const statusElement = document.getElementById('dndStatus');
        const now = new Date().getTime();
        const remaining = endTime - now;

        if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            statusElement.textContent = `Do Not Disturb active for ${hours}h ${minutes}m`;
            setTimeout(() => updateDndStatus(endTime), 60000);
        } else {
            statusElement.textContent = '';
            document.getElementById('doNotDisturb').checked = false;
            document.getElementById('dndSchedule').style.display = 'none';
            window.dndEndTime = null;
        }
    }

    const scheduleButtons = document.querySelectorAll('.schedule-btn');
    scheduleButtons.forEach(button => {
        button.addEventListener('click', function () {
            scheduleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            if (document.getElementById('doNotDisturb').checked) {
                const duration = parseInt(this.dataset.duration);
                const endTime = new Date().getTime() + (duration * 60 * 60 * 1000);
                window.dndEndTime = endTime;
                updateDndStatus(endTime);
            }
        });
    });

    const soundsToggle = document.getElementById('notificationSounds');
    const volumeControl = document.getElementById('volumeControl');

    if (soundsToggle) {
        soundsToggle.addEventListener('change', function () {
            if (this.checked) {
                volumeControl.style.display = 'block';
            } else {
                volumeControl.style.display = 'none';
            }
        });
    }

    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');

    if (volumeSlider) {
        volumeSlider.addEventListener('input', function () {
            volumeValue.textContent = this.value + '%';
        });
    }

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            saveNotificationPreferences();
            showNotification('Notification settings saved successfully!');
        });
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to reset all notification settings to default? This will clear your saved preferences.')) {
                localStorage.removeItem('notificationPreferences');

                window.pushNotificationsEnabled = false;
                window.dndEndTime = null;

                loadNotificationPreferences();

                showNotification('Notification settings reset to default');
            }
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

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content ${type}">
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

        const backgroundColor = type === 'error' ? '#ff4444' : '#5638E5';
        Object.assign(notification.querySelector('.notification-content').style, {
            background: backgroundColor,
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
});