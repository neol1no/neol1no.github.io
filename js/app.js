// Initialize Lucide icons
lucide.createIcons();

// GSAP Animations
gsap.registerPlugin(Flip, ScrollTrigger);

// Navigation Logic
const navPill = document.getElementById('nav-pill');
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view-container');
const app = document.getElementById('app');

// State
let currentView = 'home';

// Initial Animation
// Initial Animation
function animateCards() {
    gsap.fromTo('.card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateCards);
} else {
    animateCards();
}

// Navigation Click Handler
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.target;

        if (target === currentView) return;

        // Update Pill Position
        const rect = link.getBoundingClientRect();
        const navRect = link.parentElement.getBoundingClientRect();

        navPill.style.width = `${rect.width}px`;
        navPill.style.transform = `translateX(${rect.left - navRect.left}px)`;

        // Update Text Colors
        navLinks.forEach(l => {
            l.classList.remove('text-black');
            l.classList.add('text-white/60');
        });
        link.classList.remove('text-white/60');
        link.classList.add('text-black');

        // Switch View
        switchView(target);
    });
});

function switchView(view) {
    const currentViewEl = document.getElementById(`${currentView}-view`);
    const nextViewEl = document.getElementById(`${view}-view`);

    // Fade out current
    gsap.to(currentViewEl, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
            currentViewEl.classList.add('hidden');
            nextViewEl.classList.remove('hidden');

            // Fade in next
            gsap.fromTo(nextViewEl, {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            });

            currentView = view;
        }
    });
}

// Time Update
function updateTime() {
    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'Europe/Berlin'
        });
    }
}
setInterval(updateTime, 1000);
updateTime();

// Discord Copy
const discordBtn = document.getElementById('discord-btn');
const discordTooltip = document.getElementById('discord-tooltip');

if (discordBtn) {
    discordBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('neol1no');

        const originalText = discordTooltip.textContent;
        discordTooltip.textContent = 'Copied!';
        discordTooltip.classList.remove('opacity-0');

        setTimeout(() => {
            discordTooltip.classList.add('opacity-0');
            setTimeout(() => {
                discordTooltip.textContent = originalText;
            }, 300);
        }, 2000);
    });
}

// Folder Logic
const folderLunar = document.getElementById('folder-lunar');
const folderOverlay = document.getElementById('folder-blur-overlay');
const folderSubCards = document.getElementById('folder-sub-cards');
const closeFolderBtn = document.getElementById('close-folder-overlay');

if (folderLunar) {
    folderLunar.addEventListener('click', () => {
        folderOverlay.style.opacity = '1';
        folderOverlay.style.pointerEvents = 'auto';

        folderSubCards.style.opacity = '1';
        folderSubCards.style.pointerEvents = 'auto';
        folderSubCards.style.transform = 'scale(1)';
    });
}

function closeFolder() {
    folderOverlay.style.opacity = '0';
    folderOverlay.style.pointerEvents = 'none';

    folderSubCards.style.opacity = '0';
    folderSubCards.style.pointerEvents = 'none';
    folderSubCards.style.transform = 'scale(0.95)';
}

if (closeFolderBtn) {
    closeFolderBtn.addEventListener('click', closeFolder);
    folderOverlay.addEventListener('click', closeFolder);
}

// --- MUSIC PLAYER LOGIC ---

const songs = [
    {
        title: "The Devil",
        artist: "Lieless",
        src: "assets/music/Lieless_TheDevil/THE_DEVIL_KLICKAUD.mp3",
        art: "assets/music/Lieless_TheDevil/SoundCloudAud.jpg"
    },
    {
        title: "Never Ending Story",
        artist: "Astroraver",
        src: "assets/music/astroraver_neverendingstory/NEVER_ENDING_STORYastro_raver_bootleg_KLICKAUD.mp3",
        art: "assets/music/astroraver_neverendingstory/SoundCloudAud(2).jpg"
    },
    {
        title: "Grim Reaper",
        artist: "ily",
        src: "assets/music/ily_grimreaper/grim_reaper_KLICKAUD.mp3",
        art: "assets/music/ily_grimreaper/SoundCloudAud(1).jpg"
    }
];

let currentSongIndex = 0;
let isPlaying = false;
const audio = new Audio();
audio.volume = 0.5; // Default 50%

// DOM Elements
const musicArt = document.getElementById('music-art');
const musicBg = document.getElementById('music-bg');
const musicTitle = document.getElementById('music-title');
const musicArtist = document.getElementById('music-artist');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const musicCurrent = document.getElementById('music-current');
const musicTotal = document.getElementById('music-total');
const volContainer = document.getElementById('vol-container');
const volBar = document.getElementById('vol-bar');
const muteBtn = document.getElementById('mute-btn');
const playlistToggle = document.getElementById('playlist-toggle');
const playlistOverlay = document.getElementById('playlist-overlay');
const playlistClose = document.getElementById('playlist-close');
const playlistItems = document.getElementById('playlist-items');

// Load Song
function loadSong(index) {
    const song = songs[index];
    musicTitle.textContent = song.title;
    musicArtist.textContent = song.artist;
    musicArt.src = song.art;
    musicBg.style.backgroundImage = `url('${song.art}')`;
    audio.src = song.src;

    // Reset Progress
    progressBar.style.width = '0%';
    musicCurrent.textContent = '0:00';
    musicTotal.textContent = '0:00';

    updatePlaylistUI();
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 fill-current ml-0.5"></i>';
    } else {
        audio.play();
        playBtn.innerHTML = '<i data-lucide="pause" class="w-5 h-5 fill-current"></i>';
    }
    isPlaying = !isPlaying;
    lucide.createIcons();
}

// Next/Prev
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) audio.play();
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) audio.play();
}

// Progress Bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update Time Display
    musicCurrent.textContent = formatTime(currentTime);
    musicTotal.textContent = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Volume Control
let isDraggingVolume = false;

function setVolume(e) {
    const rect = volContainer.getBoundingClientRect();
    const width = rect.width;
    const clickX = e.clientX - rect.left;
    const volume = clickX / width;

    audio.volume = Math.max(0, Math.min(1, volume));
    updateVolumeUI();
}

function updateVolumeUI() {
    volBar.style.width = `${audio.volume * 100}%`;

    // Update Icon
    if (audio.volume === 0) {
        muteBtn.innerHTML = '<i data-lucide="volume-x" class="w-4 h-4"></i>';
    } else if (audio.volume < 0.5) {
        muteBtn.innerHTML = '<i data-lucide="volume-1" class="w-4 h-4"></i>';
    } else {
        muteBtn.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
    }
    lucide.createIcons();
}

function toggleMute() {
    if (audio.volume > 0) {
        audio.dataset.lastVolume = audio.volume;
        audio.volume = 0;
    } else {
        audio.volume = audio.dataset.lastVolume || 0.5;
    }
    updateVolumeUI();
}

// Playlist Logic
function togglePlaylist() {
    playlistOverlay.classList.toggle('translate-y-full');
}

function updatePlaylistUI() {
    playlistItems.innerHTML = '';
    songs.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = `flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${index === currentSongIndex ? 'bg-white/10' : ''}`;
        item.onclick = () => {
            currentSongIndex = index;
            loadSong(index);
            if (!isPlaying) togglePlay();
            else audio.play();
            togglePlaylist();
        };

        item.innerHTML = `
            <div class="w-8 h-8 rounded bg-white/10 overflow-hidden shrink-0">
                <img src="${song.art}" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0">
                <p class="text-xs font-bold text-white truncate ${index === currentSongIndex ? 'text-purple-400' : ''}">${song.title}</p>
                <p class="text-[10px] text-white/60 truncate">${song.artist}</p>
            </div>
            ${index === currentSongIndex ? '<i data-lucide="bar-chart-2" class="w-4 h-4 text-purple-400 ml-auto"></i>' : ''}
        `;
        playlistItems.appendChild(item);
    });
    lucide.createIcons();
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong);
progressContainer.addEventListener('click', setProgress);
// Volume Drag Events
volContainer.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    setVolume(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) {
        e.preventDefault(); // Prevent selection
        setVolume(e);
    }
});
document.addEventListener('mouseup', () => {
    isDraggingVolume = false;
});
muteBtn.addEventListener('click', toggleMute);
playlistToggle.addEventListener('click', togglePlaylist);
playlistClose.addEventListener('click', togglePlaylist);

// Init
loadSong(currentSongIndex);
updateVolumeUI();
// --- FEATURED PROJECT CAROUSEL ---

const featuredProjects = [
    {
        title: "Lunar GeoGuessr Script",
        desc: "Advanced utility suite for Geoguessr players with location specs and automation.",
        bg: "assets/images/geoguessr_logo_planet.jpg",
        link: "projects/lunar-geoguessr-script.html",
        color: "text-purple-400"
    },
    {
        title: "Eclipse Client",
        desc: "Premium Minecraft Bedrock Edition Utility Mod with high performance and customization.",
        bg: "assets/images/eclipse/eclipse_menu.png",
        link: "projects/eclipse.html",
        color: "text-red-400"
    },
    {
        title: "Riot API Lookup",
        desc: "Comprehensive player statistics and match history lookup tool using the official Riot Games API.",
        bg: "assets/images/riot_api/riot_api_2.png",
        link: "projects/riot_api.html",
        color: "text-blue-400"
    }
];

let currentHeroIndex = 0;
const heroCard = document.getElementById('hero-card');
const heroBg = document.getElementById('hero-bg');
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-desc');
const heroLabel = document.getElementById('hero-label');
const heroDots = document.getElementById('hero-dots');

function updateHero(index) {
    const project = featuredProjects[index];

    // Fade Out Text
    gsap.to([heroTitle, heroDesc, heroLabel], {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
            // Update Content
            heroTitle.textContent = project.title;
            heroDesc.textContent = project.desc;
            heroLabel.className = `text-sm font-medium mb-2 ${project.color}`;
            heroCard.href = project.link;

            // Update Background
            heroBg.style.backgroundImage = `url('${project.bg}')`;

            // Fade In Text
            gsap.to([heroTitle, heroDesc, heroLabel], {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    });

    // Update Dots
    if (heroDots) {
        Array.from(heroDots.children).forEach((dot, i) => {
            if (i === index) {
                dot.className = 'w-2 h-2 rounded-full bg-white transition-all';
            } else {
                dot.className = 'w-2 h-2 rounded-full bg-white/30 transition-all';
            }
        });
    }
}

function nextHero() {
    currentHeroIndex = (currentHeroIndex + 1) % featuredProjects.length;
    updateHero(currentHeroIndex);
}

// Auto Switch every 5 seconds
setInterval(nextHero, 5000);
