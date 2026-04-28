document.addEventListener('DOMContentLoaded', () => {

    const usernameInput    = document.getElementById('username');
    const displayNameInput = document.getElementById('displayName');
    const usernameError    = document.getElementById('username-error');
    const displayNameError = document.getElementById('display-name-error');
    const saveBtn          = document.querySelector('.save-btn');
    const cancelBtn        = document.querySelector('.cancel-btn');
    const changePicBtn     = document.getElementById('changePicBtn');
    const userIdDisplay    = document.getElementById('userIdDisplay');
    const copyIdBtn        = document.getElementById('copyIdBtn');

    const profileImageInput   = document.getElementById('profile-image-input');
    const imageCropperModal   = document.getElementById('image-cropper-modal');
    const imageCropperEl      = document.getElementById('image-cropper');
    const closeModalBtn       = document.querySelector('.close-modal');
    const doneCropBtn         = document.getElementById('done-crop-btn');
    const cancelCropBtn       = document.getElementById('cancel-crop-btn');
    const zoomSlider          = document.getElementById('zoom-slider');
    const zoomInBtn           = document.getElementById('zoom-in-btn');
    const zoomOutBtn          = document.getElementById('zoom-out-btn');
    const zoomDisplay         = document.getElementById('zoom-display');

    let originalUsername    = '';
    let originalDisplayName = '';
    let cropper             = null;
    let tempCroppedImage    = null;
    let isDirty             = false;

    const CROPPED_SIZE  = 300;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    function setDirty(dirty) {
        isDirty = dirty;
        if (saveBtn) {
            saveBtn.disabled = !dirty;
        }
        if (cancelBtn) {
            cancelBtn.disabled = !dirty;
        }
    }

    setDirty(false);

    function loadUserId() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (!cu.userId) {
            cu.userId = Math.floor(100000000 + Math.random() * 900000000).toString();
            sessionStorage.setItem('currentUser', JSON.stringify(cu));
        }
        userIdDisplay.textContent = cu.userId;
    }

    loadUserId();

    if (copyIdBtn) {
        copyIdBtn.addEventListener('click', () => {
            const id = userIdDisplay.textContent;
            if (!id || id === '—') return;
            navigator.clipboard.writeText(id).then(() => {
                copyIdBtn.textContent = 'Copied!';
                copyIdBtn.classList.add('copied');
                setTimeout(() => {
                    copyIdBtn.textContent = 'Copy';
                    copyIdBtn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = id;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                copyIdBtn.textContent = 'Copied!';
                copyIdBtn.classList.add('copied');
                setTimeout(() => {
                    copyIdBtn.textContent = 'Copy';
                    copyIdBtn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    function loadProfileData() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (cu.username)    usernameInput.value    = cu.username;
        if (cu.displayName) displayNameInput.value = cu.displayName;
        originalUsername    = usernameInput.value;
        originalDisplayName = displayNameInput.value;
        if (cu.profileImage) setProfilePic(cu.profileImage);
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

    function validateUsername(value) {
        const u = value.trim();
        if (!u)                             return { valid: false, error: 'Username is required' };
        if (u.length < 3 || u.length > 21) return { valid: false, error: 'Usernames can be 3 to 21 characters long' };
        if (!/^[a-zA-Z0-9._-]*$/.test(u))  return { valid: false, error: 'Only letters, numbers, periods, hyphens and underscores are allowed' };
        if (/^[._-]/.test(u) || /[._-]$/.test(u)) return { valid: false, error: 'Cannot start or end with period, underscore, or hyphen' };
        if (/[._-]{2}/.test(u))            return { valid: false, error: 'Cannot use consecutive periods, underscores, or hyphens' };
        const reserved = ['admin', 'moderator', 'root', 'null'];
        if (reserved.includes(u.toLowerCase())) return { valid: false, error: 'This username is reserved' };
        const emailPattern = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
        if (emailPattern.test(u) || u.toLowerCase().startsWith('http')) return { valid: false, error: 'Username cannot be an email address or URL' };
        return { valid: true };
    }

    function validateDisplayName(value) {
        const d = value.trim();
        if (!d)                             return { valid: false, error: 'Display name is required' };
        if (!/^[a-zA-Z0-9._\- ]*$/.test(d)) return { valid: false, error: 'Only letters, numbers, spaces, periods, hyphens and underscores are allowed' };
        if (/[._-]{2}/.test(d))            return { valid: false, error: 'Cannot use consecutive periods, underscores, or hyphens' };
        if (d.length < 2 || d.length > 30) return { valid: false, error: 'Display name must be 2-30 characters' };
        return { valid: true };
    }

    function showFieldError(el, msg) {
        el.textContent = msg;
        el.previousElementSibling
            ? el.previousElementSibling.classList.add('input-error')
            : null;
        const input = el.id === 'username-error' ? usernameInput : displayNameInput;
        input.classList.add('input-error');
    }

    function clearFieldError(el) {
        el.textContent = '';
        const input = el.id === 'username-error' ? usernameInput : displayNameInput;
        input.classList.remove('input-error');
    }

    usernameInput.addEventListener('input', () => {
        const result = validateUsername(usernameInput.value);
        if (result.valid) clearFieldError(usernameError);
        else showFieldError(usernameError, result.error);
        checkDirty();
    });

    displayNameInput.addEventListener('input', () => {
        const value = displayNameInput.value;
        if (!value.trim()) {
            clearFieldError(displayNameError);
            checkDirty();
            return;
        }
        const result = validateDisplayName(value);
        if (result.valid) clearFieldError(displayNameError);
        else showFieldError(displayNameError, result.error);
        checkDirty();
    });

    function checkDirty() {
        const usernameChanged = usernameInput.value.trim() !== originalUsername;
        const displayNameChanged = displayNameInput.value.trim() !== originalDisplayName;
        setDirty(usernameChanged || displayNameChanged || !!tempCroppedImage);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const unResult = validateUsername(usernameInput.value);
            if (!unResult.valid) {
                showFieldError(usernameError, unResult.error);
                usernameInput.focus();
                return;
            }

            const dnResult = validateDisplayName(displayNameInput.value);
            if (!dnResult.valid) {
                showFieldError(displayNameError, dnResult.error);
                displayNameInput.focus();
                return;
            }

            const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            cu.username    = usernameInput.value.trim();
            cu.displayName = displayNameInput.value.trim();

            if (tempCroppedImage) {
                cu.profileImage = tempCroppedImage;
                sessionStorage.setItem('profileImage', tempCroppedImage);
                tempCroppedImage = null;
            }

            sessionStorage.setItem('currentUser', JSON.stringify(cu));
            originalUsername    = cu.username;
            originalDisplayName = cu.displayName;
            setDirty(false);

            showNotification('Profile saved successfully!');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            usernameInput.value    = originalUsername;
            displayNameInput.value = originalDisplayName;
            clearFieldError(usernameError);
            clearFieldError(displayNameError);
            tempCroppedImage = null;
            const cu = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            if (cu.profileImage) setProfilePic(cu.profileImage);
            setDirty(false);
            showNotification('Changes discarded');
        });
    }

    if (changePicBtn) {
        changePicBtn.addEventListener('click', () => profileImageInput.click());
    }

    const profilePicCircle = document.getElementById('profilePicCircle');
    if (profilePicCircle) {
        profilePicCircle.style.cursor = 'pointer';
        profilePicCircle.addEventListener('click', () => profileImageInput.click());
    }

    profileImageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('Invalid file type. Use JPEG, PNG, or WebP.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert('File size must be less than 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => openCropperModal(ev.target.result);
        reader.readAsDataURL(file);
    });

    function openCropperModal(imageSrc) {
        imageCropperModal.style.display = 'flex';
        if (cropper) { cropper.destroy(); cropper = null; }

        imageCropperEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.maxWidth = '100%';
        imageCropperEl.appendChild(img);

        cropper = new Cropper(img, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            cropBoxMovable: true,
            cropBoxResizable: true,
            minCropBoxWidth: 50,
            minCropBoxHeight: 50,
            wheelZoomRatio: 0.1,
            ready() {
                const imgData = this.getImageData();
                const actualZoom = imgData.width / imgData.naturalWidth;
                zoomSlider.value = actualZoom.toFixed(2);
                updateZoomDisplay(actualZoom);
            }
        });
    }

    function closeCropperModal() {
        imageCropperModal.style.display = 'none';
        if (cropper) { cropper.destroy(); cropper = null; }
        profileImageInput.value = '';
    }

    function applyCrop() {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({
            width: CROPPED_SIZE,
            height: CROPPED_SIZE,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        tempCroppedImage = canvas.toDataURL('image/png', 0.9);
        setProfilePic(tempCroppedImage);
        setDirty(true);
        closeCropperModal();
    }

    function updateZoomDisplay(zoom) {
        if (zoomDisplay) zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
    }

    if (closeModalBtn)  closeModalBtn.addEventListener('click', closeCropperModal);
    if (cancelCropBtn)  cancelCropBtn.addEventListener('click', closeCropperModal);
    if (doneCropBtn)    doneCropBtn.addEventListener('click', applyCrop);

    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            if (!cropper) return;
            const z = parseFloat(e.target.value);
            cropper.zoomTo(z);
            updateZoomDisplay(z);
        });
    }
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (!cropper) return;
            cropper.zoom(0.1);
            const z = cropper.getImageData().width / cropper.getImageData().naturalWidth;
            zoomSlider.value = z.toFixed(2);
            updateZoomDisplay(z);
        });
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (!cropper) return;
            cropper.zoom(-0.1);
            const z = cropper.getImageData().width / cropper.getImageData().naturalWidth;
            zoomSlider.value = z.toFixed(2);
            updateZoomDisplay(z);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageCropperModal.style.display === 'flex') {
            closeCropperModal();
        }
    });
    imageCropperModal.addEventListener('click', (e) => {
        if (e.target === imageCropperModal) closeCropperModal();
    });

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