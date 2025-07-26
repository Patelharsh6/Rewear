document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.carousel-slider');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Check if carousel elements exist on the page
    if (!slider || !prevBtn || !nextBtn) {
        return;
    }

    let currentIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    // Function to update the carousel display
    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth;
        slider.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
    }

    // Event listener for the "Next" button
    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop back to the start
        }
        updateCarousel();
    });

    // Event listener for the "Previous" button
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalSlides - 1; // Loop to the end
        }
        updateCarousel();
    });

    // Recalculate slide width on window resize to maintain responsiveness
    window.addEventListener('resize', updateCarousel);
});
