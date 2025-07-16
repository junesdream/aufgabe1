let mediaItems = [];
let likedItems = [];
let view = localStorage.getItem('viewMode') || 'list';
let showOnlyFavs = localStorage.getItem('showOnlyFavs') === 'true';

const main = document.getElementById('mediaMain');
const toggleBtn = document.getElementById('toggleView');
const toggleIcon = document.getElementById('toggleIcon');
const favBtn = document.getElementById('showFavorites');
const favIcon = document.getElementById('favIcon');
const addBtn = document.querySelector('.add-item');
const likedHeader = document.getElementById('likedHeader');
const mainHeader = document.getElementById('mainHeader');
const likedTopbar = document.getElementById('likedTopbar');
const likedCount = document.getElementById('likedCount');
const backBtn = document.getElementById('backBtn');

// Haupt-Rendering
function render() {
    if (showOnlyFavs) {
        renderLiked();
        return;
    }
    mainHeader.style.display = '';
    likedHeader.style.display = 'none';
    likedTopbar.style.display = 'none';
    main.style.display = '';
    main.className = view + '-view';

    main.innerHTML = mediaItems.map((item, idx) => {
        const likedIdx = likedItems.findIndex(liked => liked.img === item.img && liked.title === item.title);
        // Grid-Ansicht
        if (view === 'grid') {
            return `
                <div class="media-item" data-idx="${idx}">
                    <img src="${item.img}" alt="${item.title}">
                    <button class="fav-btn" data-idx="${idx}">
                        <img src="img/${likedIdx !== -1 ? 'star-filled.png' : 'star.png'}" alt="Favorit" width="26" height="26" />
                    </button>
                </div>
            `;
        }
        // Listenansicht
        return `
            <div class="media-item" data-idx="${idx}">
                <img src="${item.img}" alt="${item.title}">
                <div class="media-info">
                    <span class="media-source">${item.source}</span>
                    <span class="media-title">${item.title}</span>
                    <div class="media-tags-row">
                        <span class="tag-icon">&#9654;</span>
                        <span class="tag-count">${item.count}</span>
                    </div>
                </div>
                <div class="media-meta">
                    <span class="media-date">${item.date}</span>
                    <button class="fav-btn" data-idx="${idx}">
                        <img src="img/${likedIdx !== -1 ? 'star-filled.png' : 'star.png'}" alt="Favorit" width="24" height="24" />
                    </button>
                    <button class="options-btn" data-idx="${idx}" aria-label="Optionen">⋮</button>
                </div>
            </div>
        `;
    }).join('');

    // Favoriten-Button
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.onclick = function (e) {
            e.stopPropagation();
            const idx = Number(this.dataset.idx);
            const item = mediaItems[idx];
            const likedIdx = likedItems.findIndex(liked => liked.img === item.img && liked.title === item.title);
            if (likedIdx !== -1) {
                likedItems.splice(likedIdx, 1);
            } else {
                likedItems.push({
                    img: item.img,
                    artist: item.source || 'Unbekannt',
                    title: item.title,
                    count: item.count,
                    duration: item.date || '3:00'
                });
            }
            localStorage.setItem('likedItems', JSON.stringify(likedItems));
            render();
        }
    });

    // Optionen-Button (löscht aus Medien-Liste)
    document.querySelectorAll('.options-btn').forEach(btn => {
        btn.onclick = function (e) {
            e.stopPropagation();
            const idx = Number(this.dataset.idx);
            if (confirm("Wirklich löschen?")) {
                mediaItems.splice(idx, 1);
                render();
            }
        }
    });

    favIcon.src = showOnlyFavs ? 'img/star-filled.png' : 'img/star.png';
}

// Liked-Tracks Ansicht
function renderLiked() {
    mainHeader.style.display = 'none';
    likedHeader.style.display = '';
    likedTopbar.style.display = 'flex';
    main.style.display = '';
    main.className = "";
    likedCount.textContent = `${likedItems.length} tracks`;

    main.innerHTML = likedItems.map((item, idx) => `
        <div class="track-item">
            <img src="${item.img}" alt="${item.title}">
            <div class="track-info">
                <span class="track-artist">${item.artist || ''}</span>
                <span class="track-title">${item.title || ''}</span>
                <div class="track-tags-row">
                    <span class="tag-icon">&#9654;</span>
                    <span class="tag-count">${(item.count || '0').toLocaleString('de-DE')}</span>
                </div>
            </div>
            <div class="track-meta">
                <span class="track-time">${item.duration || ''}</span>
                <button class="options-btn" data-idx="${idx}" aria-label="Optionen">⋮</button>
            </div>
        </div>
    `).join('');

    // Liked-Tracks: Löschen
    document.querySelectorAll('.options-btn').forEach(btn => {
        btn.onclick = function (e) {
            e.stopPropagation();
            const idx = Number(this.dataset.idx);
            if (confirm("Von den Likes entfernen?")) {
                likedItems.splice(idx, 1);
                localStorage.setItem('likedItems', JSON.stringify(likedItems));
                render();
            }
        }
    });
}

// --- Event Listener ---
toggleBtn.addEventListener('click', function () {
    setView(view === 'list' ? 'grid' : 'list');
});

favBtn.addEventListener('click', function () {
    showOnlyFavs = !showOnlyFavs;
    localStorage.setItem('showOnlyFavs', showOnlyFavs);
    render();
});

addBtn.addEventListener('click', function () {
    // Suche alle möglichen Einträge, die noch NICHT drin sind:
    fetch('data/listitems.json')
        .then(res => res.json())
        .then(allItems => {
            let filtered = allItems.filter(newItem =>
                !mediaItems.some(mi => mi.img === newItem.img && mi.title === newItem.title)
            );
            let item;
            if (filtered.length > 0) {
                item = filtered[Math.floor(Math.random() * filtered.length)];
            } else {
                item = allItems[Math.floor(Math.random() * allItems.length)];
            }
            mediaItems.unshift({ ...item });
            render();
        });
});

if (backBtn) {
    backBtn.addEventListener('click', function() {
        showOnlyFavs = false;
        localStorage.setItem('showOnlyFavs', false);
        render();
    });
}

function setView(mode) {
    view = mode;
    localStorage.setItem('viewMode', view);
    render();
    toggleIcon.src = (view === 'grid') ? 'img/list.png' : 'img/grid.png';
}

// Daten laden aus JSON, dann aus LocalStorage Likes!
function fetchData() {
    fetch('data/listitems.json')
        .then(res => res.json())
        .then(json => {
            mediaItems = json;
            let localLikes = localStorage.getItem('likedItems');
            if (localLikes) {
                likedItems = JSON.parse(localLikes);
                render();
            } else {
                fetch('data/likeditems.json')
                    .then(res2 => res2.json())
                    .then(json2 => {
                        likedItems = json2;
                        localStorage.setItem('likedItems', JSON.stringify(likedItems));
                        render();
                    });
            }
        });
}
fetchData();
