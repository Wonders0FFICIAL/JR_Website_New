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
  const KEY_ORIGINAL = 'tempOriginalImage';
  const KEY_CROPPED = 'tempCroppedImage';
  const KEY_CROPPER_DATA = 'tempCropperData';
  const KEY_CROPBOX_DATA = 'tempCropBoxData';
  const KEY_CANVAS_DATA = 'tempCanvasData';

  let cropper = null;
  let currentImageSrc = null;
  let tempCroppedImage = null;
  let isProcessing = false;

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const CROPPED_SIZE = 300;

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
    [saveProfileButton, uploadPictureBtn, doneCropBtn].forEach(btn => {
      if (btn) btn.disabled = disabled;
    });
  }
  function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
    closeErrorBtn?.focus();
  }
  function hideError() {
    errorMessage.textContent = '';
    errorModal.style.display = 'none';
  }
  function updateZoomDisplay(zoom) {
    zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
  }

  function validateFile(file) {
    if (!file) return { valid: false, error: 'No file selected' };
    if (!ALLOWED_TYPES.includes(file.type)) return { valid: false, error: 'Invalid file type. Use JPEG, PNG, or WebP.' };
    if (file.size > MAX_FILE_SIZE) return { valid: false, error: 'File size must be less than 10MB' };
    return { valid: true };
  }
  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  async function processImageUpload(file) {
    const validation = validateFile(file);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }
    showLoading();
    try {
      const imageSrc = await loadImageFile(file);
      sessionStorage.setItem(KEY_ORIGINAL, imageSrc);
      [KEY_CROPPED, KEY_CROPPER_DATA, KEY_CROPBOX_DATA, KEY_CANVAS_DATA].forEach(k => sessionStorage.removeItem(k));
      currentImageSrc = imageSrc;
      openCropperModal(imageSrc, false);
    } catch (err) {
      showError(err.message);
    } finally {
      hideLoading();
    }
  }

  function initializeCropper(imageSrc) {
    if (cropper) cropper.destroy();

    imageCropper.style.opacity = '0';

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
      cropBoxMovable: true,
      cropBoxResizable: true,
      minCropBoxWidth: 50,
      minCropBoxHeight: 50,
      wheelZoomRatio: 0.1,
      ready() {
        imageCropper.style.opacity = '1';
        const imgData = this.getImageData();
        const actualZoom = imgData.width / imgData.naturalWidth;
        zoomSlider.value = actualZoom.toFixed(2);
        updateZoomDisplay(actualZoom);
      }
    });
  }

  function openCropperModal(imageSrc, restoreState = true) {
    imageCropperModal.style.display = 'flex';

    if (!restoreState) {
      [KEY_CROPPER_DATA, KEY_CROPBOX_DATA, KEY_CANVAS_DATA].forEach(k => sessionStorage.removeItem(k));
    }
    initializeCropper(imageSrc);
  }

  function closeCropperModal() {
    imageCropperModal.style.display = 'none';
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    profileImageInput.value = '';
  }

  function applyCrop() {
    if (!cropper) return;
    showLoading();
    try {
      const canvas = cropper.getCroppedCanvas({
        width: CROPPED_SIZE,
        height: CROPPED_SIZE,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      tempCroppedImage = canvas.toDataURL('image/png', 0.9);
      updateProfileImageDisplay(tempCroppedImage);
      sessionStorage.setItem(KEY_CROPPED, tempCroppedImage);
      sessionStorage.setItem(KEY_CROPPER_DATA, JSON.stringify(cropper.getData(true)));
      sessionStorage.setItem(KEY_CROPBOX_DATA, JSON.stringify(cropper.getCropBoxData()));
      sessionStorage.setItem(KEY_CANVAS_DATA, JSON.stringify(cropper.getCanvasData()));
    } catch {
      showError('Failed to process image.');
    } finally {
      hideLoading();
      closeCropperModal();
    }
  }

  function updateProfileImageDisplay(imageSrc) {
    profileImage.innerHTML = '';
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Profile picture';
    profileImage.appendChild(img);
  }

  function handleZoomSlider(e) {
    if (!cropper) return;
    const newZoom = parseFloat(e.target.value);
    cropper.zoomTo(newZoom);
    updateZoomDisplay(newZoom);
  }
  function handleZoomIn() {
    if (!cropper) return;
    cropper.zoom(0.1);
    const imgData = cropper.getImageData();
    const actualZoom = imgData.width / imgData.naturalWidth;
    zoomSlider.value = actualZoom.toFixed(2);
    updateZoomDisplay(actualZoom);
  }
  function handleZoomOut() {
    if (!cropper) return;
    cropper.zoom(-0.1);
    const imgData = cropper.getImageData();
    const actualZoom = imgData.width / imgData.naturalWidth;
    zoomSlider.value = actualZoom.toFixed(2);
    updateZoomDisplay(actualZoom);
  }

  function loadProfileData() {
    const savedCropped = sessionStorage.getItem(KEY_CROPPED);
    const savedOriginal = sessionStorage.getItem(KEY_ORIGINAL);
    if (savedCropped) {
      updateProfileImageDisplay(savedCropped);
      currentImageSrc = savedOriginal || savedCropped;
    } else if (savedOriginal) {
      updateProfileImageDisplay(savedOriginal);
      currentImageSrc = savedOriginal;
    }
  }

  function saveProfile() {
    if (isProcessing) return;
    showLoading();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
    currentUser.username = usernameInput.value.trim();
    currentUser.displayName = displayNameInput.value.trim();
    currentUser.profileSetup = true;
    const preview = tempCroppedImage || sessionStorage.getItem(KEY_CROPPED);
    if (preview) currentUser.profileImage = preview;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    hideLoading();
    window.location.href = 'myprofile.html';
  }

  function attachEventListeners() {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

    profileImage.addEventListener('click', () => {
      const orig = sessionStorage.getItem(KEY_ORIGINAL);
      const preview = sessionStorage.getItem(KEY_CROPPED);
      if (orig) openCropperModal(orig, true);
      else if (preview) openCropperModal(preview, true);
      else profileImageInput.click();
    });
    uploadPictureBtn.addEventListener('click', () => profileImageInput.click());
    profileImageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await processImageUpload(file);
    });

    closeModalBtn.addEventListener('click', closeCropperModal);
    cancelCropBtn.addEventListener('click', closeCropperModal);
    doneCropBtn.addEventListener('click', applyCrop);

    zoomSlider.addEventListener('input', handleZoomSlider);
    zoomInBtn.addEventListener('click', handleZoomIn);
    zoomOutBtn.addEventListener('click', handleZoomOut);

    saveProfileButton.addEventListener('click', e => { e.preventDefault(); saveProfile(); });

    closeErrorBtn.addEventListener('click', hideError);
    closeErrorModalBtn.addEventListener('click', hideError);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (imageCropperModal.style.display === 'flex') closeCropperModal();
        else if (errorModal.style.display === 'flex') hideError();
      }
    });
    imageCropperModal.addEventListener('click', e => {
      if (e.target === imageCropperModal) closeCropperModal();
    });
    errorModal.addEventListener('click', e => {
      if (e.target === errorModal) hideError();
    });
  }

  function initialize() {
    attachEventListeners();
    loadProfileData();
  }

  initialize();
});
