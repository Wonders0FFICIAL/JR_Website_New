document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
    const profileImage = document.getElementById('profile-image');
    const uploadPictureBtn = document.getElementById('upload-picture-btn');
    const profileImageInput = document.getElementById('profile-image-input');
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name');
    const saveProfileButton = document.getElementById('save-profile-button');
    const usernameError = document.getElementById('username-error');
    const displayNameError = document.getElementById('display-name-error');
    
    const imageCropperModal = document.getElementById('image-cropper-modal');
    const imageCropper = document.getElementById('image-cropper');
    const closeModalBtn = document.querySelector('.close-modal');
    const doneCropBtn = document.getElementById('done-crop-btn');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    
    let cropper;
    let currentImageSrc = null;
    let cropperData = null;
    let zoomLevel = 1;
    
    function checkAuth() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'signup.html';
        }
    }

    checkAuth();
    
    // Image upload & cropping logic (unchanged)...
    profileImage.addEventListener('click', () => {
        if (currentImageSrc) openCropperModal(currentImageSrc);
        else profileImageInput.click();
    });
    uploadPictureBtn.addEventListener('click', () => profileImageInput.click());
    profileImageInput.addEventListener('change', e => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                currentImageSrc = event.target.result;
                cropperData = null;
                zoomLevel = 1;
                openCropperModal(currentImageSrc);
            };
            reader.readAsDataURL(file);
        }
    });
    function openCropperModal(imageSrc) {
        if (cropper) { cropper.destroy(); cropper = null; }
        const img = document.createElement('img');
        img.src = imageSrc;
        imageCropper.innerHTML = '';
        imageCropper.appendChild(img);
        imageCropperModal.style.display = 'flex';
        cropper = new Cropper(img, {
            aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 1,
            restore: false, guides: true, center: true, highlight: false,
            cropBoxMovable: true, cropBoxResizable: true, toggleDragModeOnDblclick: false,
            ready() {
                zoomSlider.value = zoomLevel;
                if (zoomLevel !== 1) this.zoomTo(zoomLevel);
                if (cropperData) this.setData(cropperData);
            },
            crop() { cropperData = cropper.getData(); },
            zoom(e) { zoomLevel = e.detail.ratio; zoomSlider.value = zoomLevel; }
        });
    }
    zoomSlider.addEventListener('input', e => {
        if (cropper) { const z = parseFloat(e.target.value); cropper.zoomTo(z); zoomLevel = z; }
    });
    zoomInBtn.addEventListener('click', () => {
        if (cropper) {
            const newZ = Math.min(parseFloat(zoomSlider.value) + 0.1, 3);
            zoomSlider.value = newZ; cropper.zoomTo(newZ); zoomLevel = newZ;
        }
    });
    zoomOutBtn.addEventListener('click', () => {
        if (cropper) {
            const newZ = Math.max(parseFloat(zoomSlider.value) - 0.1, 1);
            zoomSlider.value = newZ; cropper.zoomTo(newZ); zoomLevel = newZ;
        }
    });
    function closeModal() { imageCropperModal.style.display = 'none'; }
    closeModalBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && imageCropperModal.style.display === 'flex') closeModal();
    });
    doneCropBtn.addEventListener('click', () => {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
        if (canvas) {
            const data = canvas.toDataURL();
            profileImage.innerHTML = '';
            const img = document.createElement('img');
            img.src = data;
            profileImage.appendChild(img);
            sessionStorage.setItem('profileImage', data);
            sessionStorage.setItem('cropperData', JSON.stringify(cropperData));
            sessionStorage.setItem('cropperZoom', zoomLevel);
        }
        closeModal();
    });

    // Username validation
    usernameInput.addEventListener('input', validateUsername);
    displayNameInput.addEventListener('input', validateDisplayName);

    function validateUsername() {
        const u = usernameInput.value.trim();
        
        // Invalid characters
        if (!/^[a-zA-Z0-9._-]*$/.test(u)) {
            usernameError.textContent = 'Only letters, numbers, periods, hyphens and underscores are allowed';
            return false;
        }
        
        // Start/end special chars
        if (/^[._-]/.test(u) || /[._-]$/.test(u)) {
            usernameError.textContent = 'Cannot start or end with period, underscore, or hyphen';
            return false;
        }
        
        // Consecutive special characters
        if (/[._-]{2}/.test(u)) {
            usernameError.textContent = 'Cannot use consecutive periods, underscores, or hyphens';
            return false;
        }
        
        // Reserved words
        const reserved = ['admin', 'moderator', 'root', 'null'];
        if (reserved.includes(u.toLowerCase())) {
            usernameError.textContent = 'This username is reserved';
            return false;
        }
        
        // Email/URL style
        const emailPattern = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
        if (emailPattern.test(u) || u.toLowerCase().startsWith('http')) {
            usernameError.textContent = 'Username cannot be an email address or URL';
            return false;
        }
        
        // Required
        if (!u) {
            usernameError.textContent = 'Username is required';
            return false;
        }
        
        // Length checks
        if (u.length < 3) {
            usernameError.textContent = 'Username must be at least 3 characters';
            return false;
        }
        if (u.length > 21) {
            usernameError.textContent = 'Username cannot exceed 21 characters';
            return false;
        }
        
        usernameError.textContent = '';
        return true;
    }

    function validateDisplayName() {
        const d = displayNameInput.value.trim();
      
        if (!/^[a-zA-Z0-9._-]*$/.test(d)) {
          displayNameError.textContent = 'Only letters, numbers, periods, hyphens and underscores are allowed';
          return false;
        }
        if (/[._-]{2}/.test(d)) {
          displayNameError.textContent = 'Cannot use consecutive periods, underscores, or hyphens';
          return false;
        }
        if (d.length < 2 || d.length > 30) {
          displayNameError.textContent = 'Display name must be 2-30 characters';
          return false;
        }
      
        displayNameError.textContent = '';
        return true;
      }
      
    // Save profile
    saveProfileButton.addEventListener('click', e => {
        e.preventDefault();
        const okUser = validateUsername();
        const okDisplay = validateDisplayName();
        if (okUser && okDisplay) {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            currentUser.username = usernameInput.value.trim();
            currentUser.displayName = displayNameInput.value.trim();
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = 'myprofile.html';
        } else {
            if (!okUser) usernameInput.focus();
            else displayNameInput.focus();
        }
    });

    // Load existing data
    function loadProfileData() {
        const cu = JSON.parse(sessionStorage.getItem('currentUser'));
        if (cu?.username) usernameInput.value = cu.username;
        if (cu?.displayName) displayNameInput.value = cu.displayName;
        const pi = sessionStorage.getItem('profileImage');
        if (pi) {
            profileImage.innerHTML = '';
            const img = document.createElement('img');
            img.src = pi;
            profileImage.appendChild(img);
            currentImageSrc = pi;
        }
        const cd = sessionStorage.getItem('cropperData');
        if (cd) cropperData = JSON.parse(cd);
        const zz = sessionStorage.getItem('cropperZoom');
        if (zz) zoomLevel = parseFloat(zz);
    }
    loadProfileData();
});
