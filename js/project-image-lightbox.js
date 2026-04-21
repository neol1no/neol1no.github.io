(function () {
    function closeLightbox() {
        const overlay = document.querySelector('.project-lightbox-overlay');
        if (!overlay) return;
        document.body.style.overflow = '';
        overlay.remove();
        document.removeEventListener('keydown', onKeyDown);
    }

    function onKeyDown(event) {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    }

    function openLightbox(src, alt) {
        closeLightbox();

        const overlay = document.createElement('div');
        overlay.className = 'project-lightbox-overlay';

        const img = document.createElement('img');
        img.className = 'project-lightbox-image';
        img.src = src;
        img.alt = alt || 'Expanded project image';

        const closeButton = document.createElement('button');
        closeButton.className = 'project-lightbox-close';
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Close image preview');
        closeButton.textContent = '×';

        closeButton.addEventListener('click', closeLightbox);
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeLightbox();
            }
        });

        overlay.appendChild(img);
        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const images = document.querySelectorAll('main img');
        images.forEach(function (img) {
            img.classList.add('project-lightbox-target');
            img.addEventListener('click', function () {
                openLightbox(img.currentSrc || img.src, img.alt);
            });
        });
    });
})();
