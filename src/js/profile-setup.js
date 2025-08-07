document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
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
    const cancelCropBtn = document.getElementById('cancel-crop-btn');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomDisplay = document.getElementById('zoom-display');
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const closeErrorBtn = document.getElementById('close-error-btn');
    const closeErrorModalBtn = document.querySelector('.close-error-modal');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    let cropper = null;
    let currentImageSrc = null;
    let cropperData = null;
    let zoomLevel = 1;
    let isProcessing = false;
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const CROPPED_SIZE = 300;
    const RESERVED_USERNAMES = ['admin', 'moderator', 'root', 'null', 'undefined', 'system', 'support', 'help'];
    
    function showLoading() {
        loadingIndicator.style.display = 'flex';
        isProcessing = true;
        disableButtons(true);
    }
    
    function hideLoading() {
        loadingIndicator.style.display = 'none';
        isProcessing = false;
        disableButtons(false);
    }
    
    function disableButtons(disabled) {
        saveProfileButton.disabled = disabled;
        uploadPictureBtn.disabled = disabled;
        if (doneCropBtn) doneCropBtn.disabled = disabled;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.classList.add('show');
        errorModal.style.display = 'flex';
    }
    
    function hideError() {
        errorModal.classList.remove('show');
        errorModal.style.display = 'none';
        errorMessage.textContent = '';
    }
    
    function updateZoomDisplay(zoom) {
        const percentage = Math.round(zoom * 100);
        zoomDisplay.textContent = `${percentage}%`;
    }
    
    function checkAuth() {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser) {
                console.warn('No authenticated user found, redirecting to signup');
                window.location.href = 'signup.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            window.location.href = 'signup.html';
            return false;
        }
    }
    
    function initializeNavigation() {
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }

    function validateFile(file) {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { 
                valid: false, 
                error: 'Invalid file type. Please use JPEG, PNG, or WebP images.' 
            };
        }
        
        if (file.size > MAX_FILE_SIZE) {
            return { 
                valid: false, 
                error: 'File size must be less than 10MB' 
            };
        }
        
        return { valid: true };
    }
        
    function loadImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read image file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    async function processImageUpload(file) {
        if (isProcessing) return;
        
        try {
            showLoading();
            
            const validation = validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            const imageSrc = await loadImageFile(file);
            currentImageSrc = imageSrc;
            cropperData = null;
            zoomLevel = 1;
            
            openCropperModal(imageSrc);
            
        } catch (error) {
            console.error('Error processing image:', error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    }
    
    function initializeCropper(imageSrc) {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        
        imageCropper.innerHTML = '';
        imageCropper.appendChild(img);
        
        cropper = new Cropper(img, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            minCropBoxWidth: 50,
            minCropBoxHeight: 50,
            wheelZoomRatio: 0,
            
            ready() {
                console.log('Cropper initialized');
                zoomSlider.value = zoomLevel;
                updateZoomDisplay(zoomLevel);
                
                if (zoomLevel !== 1) {
                    this.zoomTo(zoomLevel);
                }
                
                if (cropperData) {
                    this.setData(cropperData);
                }
            },
            
            crop(event) {
                cropperData = event.detail;
            },
            
            zoom(event) {
                if (event.detail.ratio !== undefined) {
                    zoomLevel = event.detail.ratio;
                    zoomSlider.value = zoomLevel;
                    updateZoomDisplay(zoomLevel);
                }
            }
        });
    }
    
    function openCropperModal(imageSrc) {
        try {
            initializeCropper(imageSrc);
            imageCropperModal.classList.add('show');
            imageCropperModal.style.display = 'flex';
            setTimeout(() => {
                if (doneCropBtn) doneCropBtn.focus();
            }, 100);
            
        } catch (error) {
            console.error('Error opening cropper modal:', error);
            showError('Failed to open image editor');
        }
    }
    
    function closeCropperModal() {
        imageCropperModal.classList.remove('show');
        imageCropperModal.style.display = 'none';
        
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        if (profileImageInput) {
            profileImageInput.value = '';
        }
    }
    
    function applyCrop() {
        if (!cropper) {
            console.error('No cropper instance available');
            return;
        }
        
        try {
            showLoading();
            
            const canvas = cropper.getCroppedCanvas({
                width: CROPPED_SIZE,
                height: CROPPED_SIZE,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
            
            if (!canvas) {
                throw new Error('Failed to create cropped image');
            }
            
            const croppedImageData = canvas.toDataURL('image/png', 0.9);
            updateProfileImageDisplay(croppedImageData);
            sessionStorage.setItem('profileImage', croppedImageData);
            sessionStorage.setItem('cropperData', JSON.stringify(cropperData));
            sessionStorage.setItem('cropperZoom', zoomLevel.toString());
            
            closeCropperModal();
            
        } catch (error) {
            console.error('Error applying crop:', error);
            showError('Failed to process image. Please try again.');
        } finally {
            hideLoading();
        }
    }
    
    function updateProfileImageDisplay(imageSrc) {
        profileImage.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Profile picture';
        profileImage.appendChild(img);
    }
    
    function handleZoomSlider(event) {
        if (!cropper) return;
        
        const newZoom = parseFloat(event.target.value);
        cropper.zoomTo(newZoom);
        zoomLevel = newZoom;
        updateZoomDisplay(newZoom);
    }
    
    function handleZoomIn() {
        if (!cropper) return;
        
        const currentZoom = parseFloat(zoomSlider.value);
        const newZoom = Math.min(currentZoom + 0.1, 3);
        
        zoomSlider.value = newZoom;
        cropper.zoomTo(newZoom);
        zoomLevel = newZoom;
        updateZoomDisplay(newZoom);
    }
    
    function handleZoomOut() {
        if (!cropper) return;
        
        const currentZoom = parseFloat(zoomSlider.value);
        const newZoom = Math.max(currentZoom - 0.1, 1);
        
        zoomSlider.value = newZoom;
        cropper.zoomTo(newZoom);
        zoomLevel = newZoom;
        updateZoomDisplay(newZoom);
    }
        
    function validateUsername() {
        const username = usernameInput.value.trim();

        usernameError.textContent = '';
        usernameInput.classList.remove('error');
        
        if (!username) {
            setFieldError(usernameInput, usernameError, 'Username is required');
            return false;
        }
        
        if (username.length < 3) {
            setFieldError(usernameInput, usernameError, 'Username must be at least 3 characters');
            return false;
        }
        
        if (username.length > 21) {
            setFieldError(usernameInput, usernameError, 'Username cannot exceed 21 characters');
            return false;
        }
        
        if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
            setFieldError(usernameInput, usernameError, 'Only letters, numbers, periods, hyphens and underscores are allowed');
            return false;
        }
        
        if (/^[._-]/.test(username) || /[._-]$/.test(username)) {
            setFieldError(usernameInput, usernameError, 'Cannot start or end with period, underscore, or hyphen');
            return false;
        }
        
        if (/[._-]{2,}/.test(username)) {
            setFieldError(usernameInput, usernameError, 'Cannot use consecutive periods, underscores, or hyphens');
            return false;
        }
        
        if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
            setFieldError(usernameInput, usernameError, 'This username is reserved');
            return false;
        }
        
        const emailPattern = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
        if (emailPattern.test(username) || username.toLowerCase().startsWith('http')) {
            setFieldError(usernameInput, usernameError, 'Username cannot be an email address or URL');
            return false;
        }
        
        return true;
    }
    
    function validateDisplayName() {
        const displayName = displayNameInput.value.trim();
        
        displayNameError.textContent = '';
        displayNameInput.classList.remove('error');

        if (!displayName) {
            setFieldError(displayNameInput, displayNameError, 'Display name is required');
            return false;
        }
        
        if (displayName.length < 2) {
            setFieldError(displayNameInput, displayNameError, 'Display name must be at least 2 characters');
            return false;
        }
        
        if (displayName.length > 30) {
            setFieldError(displayNameInput, displayNameError, 'Display name cannot exceed 30 characters');
            return false;
        }
        
        if (!/^[a-zA-Z0-9._\s-]+$/.test(displayName)) {
            setFieldError(displayNameInput, displayNameError, 'Only letters, numbers, spaces, periods, hyphens and underscores are allowed');
            return false;
        }
        
        if (/[._-]{2,}/.test(displayName)) {
            setFieldError(displayNameInput, displayNameError, 'Cannot use consecutive periods, underscores, or hyphens');
            return false;
        }
        
        if (/\s{2,}/.test(displayName)) {
            setFieldError(displayNameInput, displayNameError, 'Cannot use consecutive spaces');
            return false;
        }
        
        return true;
    }
    
    function setFieldError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('error-style');
    }
    
    function loadProfileData() {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            
            if (currentUser?.username) {
                usernameInput.value = currentUser.username;
            }
            
            if (currentUser?.displayName) {
                displayNameInput.value = currentUser.displayName;
            }
            
            const profileImageData = sessionStorage.getItem('profileImage');
            if (profileImageData) {
                updateProfileImageDisplay(profileImageData);
                currentImageSrc = profileImageData;
            }
            
            const savedCropperData = sessionStorage.getItem('cropperData');
            if (savedCropperData) {
                cropperData = JSON.parse(savedCropperData);
            }
            
            const savedZoom = sessionStorage.getItem('cropperZoom');
            if (savedZoom) {
                zoomLevel = parseFloat(savedZoom);
            }
            
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }
    
    function saveProfile() {
        if (isProcessing) return;
        
        try {
            showLoading();
            
            const isUsernameValid = validateUsername();
            const isDisplayNameValid = validateDisplayName();
            
            if (!isUsernameValid || !isDisplayNameValid) {
                if (!isUsernameValid) {
                    usernameInput.focus();
                } else {
                    displayNameInput.focus();
                }
                return;
            }
            
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
            
            currentUser.username = usernameInput.value.trim();
            currentUser.displayName = displayNameInput.value.trim();
            currentUser.profileSetup = true;
        
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            setTimeout(() => {
                window.location.href = 'myprofile.html';
            }, 500);
            
        } catch (error) {
            console.error('Error saving profile:', error);
            showError('Failed to save profile. Please try again.');
        } finally {
            hideLoading();
        }
    }
    
    function attachEventListeners() {
        initializeNavigation();
        
        if (profileImage) {
            profileImage.addEventListener('click', () => {
                if (currentImageSrc) {
                    openCropperModal(currentImageSrc);
                } else {
                    profileImageInput.click();
                }
            });
            
            profileImage.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (currentImageSrc) {
                        openCropperModal(currentImageSrc);
                    } else {
                        profileImageInput.click();
                    }
                }
            });
        }
        
        if (uploadPictureBtn) {
            uploadPictureBtn.addEventListener('click', () => {
                profileImageInput.click();
            });
        }
        
        if (profileImageInput) {
            profileImageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await processImageUpload(file);
                }
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeCropperModal);
        }
        
        if (cancelCropBtn) {
            cancelCropBtn.addEventListener('click', closeCropperModal);
        }
        
        if (doneCropBtn) {
            doneCropBtn.addEventListener('click', applyCrop);
        }
        
        if (zoomSlider) {
            zoomSlider.addEventListener('input', handleZoomSlider);
        }
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', handleZoomIn);
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', handleZoomOut);
        }
        
        if (usernameInput) {
            usernameInput.addEventListener('input', validateUsername);
            usernameInput.addEventListener('blur', validateUsername);
        }
        
        if (displayNameInput) {
            displayNameInput.addEventListener('input', validateDisplayName);
            displayNameInput.addEventListener('blur', validateDisplayName);
        }
        
        if (saveProfileButton) {
            saveProfileButton.addEventListener('click', (e) => {
                e.preventDefault();
                saveProfile();
            });
        }
        
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', hideError);
        }
        
        if (closeErrorModalBtn) {
            closeErrorModalBtn.addEventListener('click', hideError);
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (imageCropperModal.style.display === 'flex') {
                    closeCropperModal();
                } else if (errorModal.style.display === 'flex') {
                    hideError();
                }
            }
        });
        
        if (imageCropperModal) {
            imageCropperModal.addEventListener('click', (e) => {
                if (e.target === imageCropperModal) {
                    closeCropperModal();
                }
            });
        }
        
        if (errorModal) {
            errorModal.addEventListener('click', (e) => {
                if (e.target === errorModal) {
                    hideError();
                }
            });
        }
    }

    function initialize() {
        try {
            console.log('Initializing profile setup page');
            
            if (!checkAuth()) {
                return;
            }
            
            attachEventListeners();
            
            loadProfileData();
        
            updateZoomDisplay(zoomLevel);
            
            console.log('Profile setup page initialized successfully');
            
        } catch (error) {
            console.error('Error initializing profile setup:', error);
            showError('Page failed to load properly. Please refresh and try again.');
        }
    }

    initialize();
});