
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("artist");
const cover = document.getElementById("cover");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const playlistEl = document.getElementById("playlist");
const autoplayCheckbox = document.getElementById("autoplay");
const fileInput = document.getElementById("file-input");
const statusEl = document.getElementById("status");

const songs = [
    {
        title: "SoundHelix Song 1",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "SoundHelix Song 2",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "SoundHelix Song 3",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title: "SoundHelix Song 4",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        title: "SoundHelix Song 5",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    }
];

let songIndex = 0;
let isShuffle = false;
let isRepeat = false;
let loadVersion = 0;
let currentObjectUrl = null;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function renderPlaylist() {
    playlistEl.innerHTML = "";

    songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.classList.toggle("active", index === songIndex);

        const number = document.createElement("span");
        number.className = "track-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const info = document.createElement("div");
        info.className = "track-info";

        const songTitle = document.createElement("strong");
        songTitle.textContent = song.title;

        const songArtist = document.createElement("span");
        songArtist.textContent = song.artist;

        info.append(songTitle, songArtist);

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-play";

        li.append(number, info, icon);

        li.addEventListener("click", () => {
            songIndex = index;
            loadSong(songIndex);
            playSong();
        });

        playlistEl.appendChild(li);
    });
}

function loadSong(index) {
    loadVersion++;
    audio.pause();

    const song = songs[index];

    audio.src = song.src;
    audio.load();

    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    progress.style.width = "0%";

    cover.classList.remove("playing");
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

    statusEl.textContent = "Ready to play.";
    renderPlaylist();
}

async function playSong() {
    const version = loadVersion;
    statusEl.textContent = "Loading audio...";

    try {
        await audio.play();

        if (version !== loadVersion) return;

        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        cover.classList.add("playing");
        statusEl.textContent = "Now playing.";
        renderPlaylist();
    } catch (error) {
        if (version !== loadVersion) return;

        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        cover.classList.remove("playing");
        statusEl.textContent =
            "Unable to play this track. Check your internet or choose a local song.";
    }
}

function pauseSong() {
    audio.pause();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    cover.classList.remove("playing");
    statusEl.textContent = "Paused.";
    renderPlaylist();
}

function togglePlay() {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
}

function nextSong() {
    if (songs.length === 0) return;

    if (isShuffle && songs.length > 1) {
        let nextIndex;

        do {
            nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === songIndex);

        songIndex = nextIndex;
    } else {
        songIndex = (songIndex + 1) % songs.length;
    }

    loadSong(songIndex);
    playSong();
}

function previousSong() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songIndex);
    playSong();
}

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", previousSong);

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "#a78bfa" : "#ffffff";
    statusEl.textContent = isShuffle ? "Shuffle enabled." : "Shuffle disabled.";
});

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    audio.loop = isRepeat;
    repeatBtn.style.color = isRepeat ? "#a78bfa" : "#ffffff";
    statusEl.textContent = isRepeat ? "Repeat enabled." : "Repeat disabled.";
});

audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("error", () => {
    if (audio.currentSrc) {
        statusEl.textContent =
            "Audio could not load. Try another track or add a song from your computer.";
    }
});

audio.addEventListener("play", () => {
    cover.classList.add("playing");
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
});

audio.addEventListener("pause", () => {
    cover.classList.remove("playing");
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
});

audio.addEventListener("ended", () => {
    if (isRepeat) return;

    if (autoplayCheckbox.checked) {
        nextSong();
    } else {
        statusEl.textContent = "Track finished.";
    }
});

progressContainer.addEventListener("click", (event) => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const rect = progressContainer.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));

    audio.currentTime = position * audio.duration;
});

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || [])
        .filter(file => file.type.startsWith("audio/"));

    if (files.length === 0) return;

    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }

    songs.splice(0, songs.length, ...files.map(file => ({
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Audio",
        src: URL.createObjectURL(file)
    })));

    songIndex = 0;
    loadSong(songIndex);

    statusEl.textContent = `${songs.length} song(s) added from your computer.`;
    playSong();

    fileInput.value = "";
});

audio.volume = Number(volume.value);

window.addEventListener("beforeunload", () => {
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
    }

    songs.forEach(song => {
        if (song.src.startsWith("blob:")) {
            URL.revokeObjectURL(song.src);
        }
    });
});

loadSong(songIndex);