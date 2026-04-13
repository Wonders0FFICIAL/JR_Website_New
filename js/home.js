document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

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
                    if (!isAnimating) {
                        goToSlide(i);
                    }
                });
                indicatorsContainer.appendChild(indicator);
            }
        }

        function updateCarousel() {
            carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        function goToSlide(index) {
            if (isAnimating) return;

            isAnimating = true;
            currentIndex = index;
            updateCarousel();

            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }

        function nextSlide() {
            if (isAnimating) return;

            isAnimating = true;

            if (currentIndex === totalCards - 1) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }

            updateCarousel();

            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }

        function prevSlide() {
            if (isAnimating) return;

            isAnimating = true;

            if (currentIndex === 0) {
                currentIndex = totalCards - 1;
            } else {
                currentIndex--;
            }

            updateCarousel();

            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }

        nextArrow.addEventListener('click', () => {
            nextSlide();
        });

        prevArrow.addEventListener('click', () => {
            prevSlide();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }

        createIndicators();
        updateCarousel();
    }
});