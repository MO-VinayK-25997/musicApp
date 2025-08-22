let currentHls = null;
let currentStationName = null;

function showInfo(msg) {
    const info = document.getElementById('infoMessage');
    info.textContent = msg;
    info.style.display = 'block';
}

function hideInfo() {
    document.getElementById('infoMessage').style.display = 'none';
}

function showCategory(cat) {
    // Remove active class from all menu buttons
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button - safer approach
    document.querySelectorAll('.menu-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes("'" + cat + "'")) {
            btn.classList.add('active');
        }
    });
    
    // Filter stations based on category
    document.querySelectorAll('.station').forEach(station => {
        const stationName = station.querySelector('.station-name').textContent.toLowerCase();
        const stationDesc = station.querySelector('.station-desc').textContent.toLowerCase();
        let shouldShow = false;
        
        if (cat === 'all') {
            shouldShow = true;
        } else if (cat === 'bollywood') {
            // Check for Bollywood-related content
            shouldShow = stationDesc.includes('bollywood') || 
                       stationDesc.includes('hindi') || 
                       stationName.includes('radio city') ||
                       stationName.includes('hungama') ||
                       stationName.includes('mirchi');
        } else if (cat === 'regional') {
            // For now, no regional stations - could add more later
            shouldShow = stationDesc.includes('regional') || 
                       stationName.includes('regional');
        } else if (cat === 'news') {
            // Check for news content
            shouldShow = stationDesc.includes('news') || 
                       stationName.includes('air fm') ||
                       stationDesc.includes('talk');
        } else if (cat === 'favorites') {
            // For now, no favorites system - could be enhanced
            shouldShow = false;
        }
        
        station.style.display = shouldShow ? '' : 'none';
    });
}

function playStation(name, desc, streamUrl) {
    hideInfo();
    const audio = document.getElementById('mainAudio');
    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }
    audio.pause();
    audio.src = '';
    document.getElementById('playerBar').style.display = 'flex';
    document.getElementById('playerName').textContent = name;
    document.getElementById('playerDesc').textContent = desc;
    document.getElementById('pauseBtn').style.display = '';
    document.getElementById('playBtn').style.display = 'none';
    currentStationName = name;
    
    // Highlight active station
    document.querySelectorAll('.station').forEach(station => {
        const stationName = station.querySelector('.station-name').textContent;
        if (stationName === name) {
            station.classList.add('active');
        } else {
            station.classList.remove('active');
        }
    });
    
    if (streamUrl.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
            currentHls = new Hls();
            currentHls.loadSource(streamUrl);
            currentHls.attachMedia(audio);
            currentHls.on(Hls.Events.MANIFEST_PARSED, function() {
                audio.play().catch(() => {
                    showInfo('Playback failed. Please click the play button again or try a different browser.');
                });
            });
            currentHls.on(Hls.Events.ERROR, function(event, data) {
                showInfo('Playback error. This station may not be supported in your browser or is blocked by CORS.');
            });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = streamUrl;
            audio.play().catch(() => {
                showInfo('Playback failed. Please click the play button again or try a different browser.');
            });
        } else {
            showInfo('HLS stream not supported in this browser. Try Chrome or Edge.');
        }
    } else {
        audio.src = streamUrl;
        audio.play().catch(() => {
            showInfo('Playback failed. This station may not be supported in your browser or is blocked by CORS.');
        });
    }
}

function pauseCurrent() {
    const audio = document.getElementById('mainAudio');
    audio.pause();
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('playBtn').style.display = '';
}

function resumeCurrent() {
    const audio = document.getElementById('mainAudio');
    audio.play().catch(() => {
        showInfo('Playback failed. Please click the play button again or try a different browser.');
    });
    document.getElementById('pauseBtn').style.display = '';
    document.getElementById('playBtn').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const mainAudio = document.getElementById('mainAudio');
    
    mainAudio.addEventListener('ended', () => {
        document.getElementById('playerBar').style.display = 'none';
        document.querySelectorAll('.station').forEach(station => {
            station.classList.remove('active');
        });
    });

    mainAudio.addEventListener('error', () => {
        showInfo('Playback error. This station may not be supported in your browser or is blocked by CORS.');
    });

    showInfo('Tip: If playback does not start, click the play button again or try a different browser (Chrome/Edge recommended).');
});
