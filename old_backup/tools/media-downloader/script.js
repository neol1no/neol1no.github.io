document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const formatSelect = document.getElementById('formatSelect');
    const status = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const downloadContainer = document.getElementById('downloadContainer');

    downloadBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        const format = formatSelect.value;

        if (!url) {
            status.textContent = 'Please enter a URL';
            status.style.color = 'red';
            return;
        }

        if (!isValidUrl(url)) {
            status.textContent = 'Please enter a valid YouTube or SoundCloud URL';
            status.style.color = 'red';
            return;
        }

        status.textContent = 'Generating download button...';
        status.style.color = '#1a73e8';
        downloadLink.innerHTML = '';
        downloadContainer.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '100px';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.src = `https://loader.to/api/button/?url=${encodeURIComponent(url)}&f=${format}`;
        
        downloadContainer.appendChild(iframe);
        status.textContent = 'Download button ready!';
        status.style.color = 'green';
    });

    function isValidUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const soundcloudRegex = /^(https?:\/\/)?(www\.)?soundcloud\.com\/.+$/;
        return youtubeRegex.test(url) || soundcloudRegex.test(url);
    }
}); 