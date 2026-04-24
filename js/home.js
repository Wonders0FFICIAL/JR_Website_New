document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.getElementById('carouselContainer');
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    const indicatorsContainer = document.getElementById('indicators');

    if (carouselContainer && prevArrow && nextArrow && indicatorsContainer) {
        const cards = document.querySelectorAll('.project-card');
        const totalCards = cards.length;
        let currentIndex = 0;
        let isAnimating = false;

        function createIndicators() {
            indicatorsContainer.innerHTML = '';
            for (let i = 0; i < totalCards; i++) {
                const indicator = document.createElement('div');
                indicator.className = 'indicator';
                if (i === 0) indicator.classList.add('active');
                indicator.dataset.index = i;
                indicator.addEventListener('click', () => {
                    if (!isAnimating) goToSlide(i);
                });
                indicatorsContainer.appendChild(indicator);
            }
        }

        function updateCarousel() {
            carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = index;
            updateCarousel();
            setTimeout(() => { isAnimating = false; }, 500);
        }

        function nextSlide() {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = currentIndex === totalCards - 1 ? 0 : currentIndex + 1;
            updateCarousel();
            setTimeout(() => { isAnimating = false; }, 500);
        }

        function prevSlide() {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = currentIndex === 0 ? totalCards - 1 : currentIndex - 1;
            updateCarousel();
            setTimeout(() => { isAnimating = false; }, 500);
        }

        nextArrow.addEventListener('click', nextSlide);
        prevArrow.addEventListener('click', prevSlide);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'ArrowRight') nextSlide();
        });

        let touchStartX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselContainer.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? nextSlide() : prevSlide();
            }
        }, { passive: true });

        createIndicators();
        updateCarousel();
    }
});