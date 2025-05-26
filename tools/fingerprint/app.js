document.addEventListener('DOMContentLoaded', () => {
    // Browser Information
    document.getElementById('userAgent').textContent = navigator.userAgent;
    document.getElementById('browser').textContent = getBrowserInfo();
    document.getElementById('os').textContent = getOSInfo();
    document.getElementById('language').textContent = navigator.language || 'Unknown';

    // Screen Information
    document.getElementById('screenResolution').textContent = `${window.screen.width}x${window.screen.height}`;
    document.getElementById('colorDepth').textContent = `${window.screen.colorDepth} bit`;
    document.getElementById('pixelRatio').textContent = window.devicePixelRatio;

    // Network Information
    document.getElementById('connectionType').textContent = getConnectionType();
    
    // Fetch IPv4
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipv4Address').textContent = data.ip || 'Unknown';
        })
        .catch(() => {
            document.getElementById('ipv4Address').textContent = 'Unable to fetch IPv4';
        });

    // Fetch IPv6
    fetch('https://api64.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipv6Address').textContent = data.ip || 'Unknown';
        })
        .catch(() => {
            document.getElementById('ipv6Address').textContent = 'Unable to fetch IPv6';
        });

    // Fetch location info
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('location').textContent = `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
            document.getElementById('isp').textContent = data.org || 'Unknown';
        })
        .catch(() => {
            document.getElementById('location').textContent = 'Unable to fetch location';
            document.getElementById('isp').textContent = 'Unable to fetch ISP';
        });

    // Privacy Information
    document.getElementById('cookiesEnabled').textContent = navigator.cookieEnabled ? 'Yes' : 'No';
    document.getElementById('doNotTrack').textContent = navigator.doNotTrack || 'Not set';
    
    // Enhanced Local Storage Information
    const localStorageInfo = document.getElementById('localStorage');
    if (isLocalStorageAvailable()) {
        const storageSize = new Blob(Object.keys(localStorage).map(key => localStorage[key])).size;
        const itemCount = localStorage.length;
        const keys = Object.keys(localStorage);
        localStorageInfo.textContent = `Available (${itemCount} items, ${(storageSize / 1024).toFixed(2)} KB)`;
        
        // Add a tooltip or expandable section to show the keys
        const storageDetails = document.createElement('div');
        storageDetails.style.marginTop = '10px';
        storageDetails.style.fontSize = '0.9em';
        storageDetails.style.color = 'var(--secondary-color)';
        storageDetails.textContent = `Keys: ${keys.join(', ') || 'None'}`;
        localStorageInfo.parentNode.appendChild(storageDetails);
    } else {
        localStorageInfo.textContent = 'Not available';
    }

    // Hardware Information
    document.getElementById('cpuCores').textContent = navigator.hardwareConcurrency || 'Unknown';
    document.getElementById('deviceMemory').textContent = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
    document.getElementById('hardwareConcurrency').textContent = navigator.hardwareConcurrency || 'Unknown';
    
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            document.getElementById('batteryStatus').textContent = 
                `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Not charging'})`;
        });
    } else {
        document.getElementById('batteryStatus').textContent = 'Not available';
    }

    // Graphics Information
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
        document.getElementById('webglVendor').textContent = gl.getParameter(gl.VENDOR);
        document.getElementById('webglRenderer').textContent = gl.getParameter(gl.RENDERER);
        document.getElementById('webgl').textContent = 'Available';
    } else {
        document.getElementById('webglVendor').textContent = 'Not available';
        document.getElementById('webglRenderer').textContent = 'Not available';
        document.getElementById('webgl').textContent = 'Not available';
    }

    // Canvas Fingerprint
    const canvasFingerprint = getCanvasFingerprint();
    document.getElementById('canvasFingerprint').textContent = canvasFingerprint;

    // Audio Fingerprint
    getAudioFingerprint().then(fingerprint => {
        document.getElementById('audioFingerprint').textContent = fingerprint;
    });

    // Browser Capabilities
    document.getElementById('webrtc').textContent = 'RTCPeerConnection' in window ? 'Available' : 'Not available';
    document.getElementById('webp').textContent = checkWebPSupport() ? 'Supported' : 'Not supported';
    document.getElementById('webm').textContent = checkWebMSupport() ? 'Supported' : 'Not supported';
});

function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName;

    if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
        browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
        browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
        browserName = "Edge";
    } else {
        browserName = "Unknown";
    }

    return browserName;
}

function getOSInfo() {
    const userAgent = navigator.userAgent;
    let osName;

    if (userAgent.match(/win/i)) {
        osName = "Windows";
    } else if (userAgent.match(/mac/i)) {
        osName = "MacOS";
    } else if (userAgent.match(/linux/i)) {
        osName = "Linux";
    } else if (userAgent.match(/android/i)) {
        osName = "Android";
    } else if (userAgent.match(/like mac os x/i)) {
        osName = "iOS";
    } else {
        osName = "Unknown";
    }

    return osName;
}

function getConnectionType() {
    if (navigator.connection) {
        return navigator.connection.effectiveType || 'Unknown';
    }
    return 'Unknown';
}

function isLocalStorageAvailable() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

function isSessionStorageAvailable() {
    try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Draw background
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = '18px Arial';
    ctx.textBaseline = 'top';
    ctx.fillText('Browser Fingerprint', 10, 10);
    
    // Draw shapes
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(10, 50, 50, 50);
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillRect(70, 50, 50, 50);
    ctx.fillStyle = 'rgb(0, 0, 255)';
    ctx.fillRect(130, 50, 50, 50);
    
    return canvas.toDataURL().slice(-32);
}

async function getAudioFingerprint() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        gainNode.gain.value = 0;
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(0);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        oscillator.stop();
        audioContext.close();
        
        return dataArray.slice(0, 16).join('').slice(0, 32);
    } catch (e) {
        return 'Not available';
    }
}

function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

function checkWebMSupport() {
    const video = document.createElement('video');
    return video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
} 