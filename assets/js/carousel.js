document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let currentIndex = 0;
        let interval;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('opacity-0', i !== index);
                slide.classList.toggle('opacity-100', i === index);
            });
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('bg-white', i === index);
                indicator.classList.toggle('bg-white/20', i !== index);
            });
            currentIndex = index;
        };

        const nextSlide = () => {
            showSlide((currentIndex + 1) % slides.length);
        };

        const prevSlide = () => {
            showSlide((currentIndex - 1 + slides.length) % slides.length);
        };

        const startAutoPlay = () => {
            interval = setInterval(nextSlide, 5000);
        };

        const stopAutoPlay = () => {
            clearInterval(interval);
        };

        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });

        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                showSlide(index);
                stopAutoPlay();
                startAutoPlay();
            });
        });

        // Initialize
        showSlide(0);
        startAutoPlay();
    });
});
