export function loadStoryListView(container, presenter) {
  container.innerHTML = '<h2>Memuat cerita...</h2>';
  presenter.loadStories();
}

export function showLoginPrompt(container) {
  container.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
      font-size: 1.25rem;
    ">
      <p>Silakan <a style="text-decoration: underline; color: #3b82f6" href="#/login">masuk</a> untuk melihat daftar cerita</p>
    </div>`;
}

export function showLoading(container) {
  container.innerHTML = '<h2>Memuat cerita...</h2>';
}

export function showError(container, message) {
  container.innerHTML = `<p class="text-red-600">${message}</p>`;
}

export function renderStories(container, stories) {
  container.innerHTML = `
  <h2 class="font-bold mb-4 text-xl" id="story-list-heading" 
  style="
  text-align: center
  ">Daftar Cerita</h2>
  <div 
    id="story-list" 
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
    role="list"
    aria-labelledby="story-list-heading"
  ></div>
  <main id=stories> 
  <h2 id="modal-title" class="sr-only">Detail Cerita</h2> 
  <div 
    id="map-modal" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title" 
    aria-describedby="story-description story-created"
    style="
      display: none; 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: rgba(0, 0, 0, 0.7); 
      justify-content: center; 
      align-items: center; 
      z-index: 1000;
    "
  >
    <div 
      id="modal-content" 
      tabindex="-1" 
      aria-label="Detail lokasi cerita dalam peta"
      style="
        width: 90%; 
        max-width: 800px; 
        background: #fff; 
        border-radius: 8px; 
        overflow: hidden; 
        position: relative; 
        outline: none; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      "
    >
      <div 
        id="map" 
        style="width: 100%; height: 300px;" 
        aria-hidden="true">
      </div>

      <div id="story-detail" style="padding: 1rem;" aria-live="polite">
        <h3 id="story-title" class="font-bold mb-4"></h3>
        <p id="story-description"></p>
        <small id="story-created"></small>
      </div>
    </div>
  </div>
  </main>
`;

  document.getElementById('main-content')?.focus();

  if (stories.length === 0) {
    container.innerHTML = '<h2 class="font-bold mb-4 text-xl">Belum ada cerita</h2>';
    return;
  }

  const listEl = container.querySelector('#story-list');
  const mapModal = container.querySelector('#map-modal');
  const modalContent = container.querySelector('#modal-content');
  const mapEl = container.querySelector('#map');
  const storyTitle = container.querySelector('#story-title');
  const storyDesc = container.querySelector('#story-description');
  const storyCreated = container.querySelector('#story-created');

  let mapInitialized = false;
  let map;

  stories.forEach(story => {
    const item = document.createElement('article');
    item.className = 'bg-white rounded-xl shadow-md overflow-hidden p-4 flex flex-col gap-2 text-sm hover:shadow-lg transition-shadow duration-200';
    item.innerHTML = `
  <img src="${story.photoUrl}" alt="Foto dari ${story.name}" class="w-full h-auto rounded-md cursor-pointer object-cover" loading="lazy" />
  <h3 class="text-lg font-semibold">${story.name}</h3>
  <p class="text-gray-700">${story.description}</p>
  <small class="text-gray-500">Dibuat: ${new Date(story.createdAt).toLocaleString()}</small>
`;

    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      if (!story.lat || !story.lon) {
        alert('Cerita ini tidak memiliki data lokasi.');
        return;
      }

      mapModal.style.display = 'flex';
      modalContent.focus();

      storyTitle.textContent = story.name;
      storyDesc.textContent = story.description;
      storyCreated.textContent = `Dibuat: ${new Date(story.createdAt).toLocaleString()}`;

      if (!mapInitialized) {
        map = L.map(mapEl).setView([story.lat, story.lon], 13);

        const baseLayers = {
          "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }),
          "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; OpenTopoMap contributors'
          }),
          "Stadia satellite": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
            attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            ext: 'jpg'
          }),
        };

        baseLayers["OpenStreetMap"].addTo(map);

        L.control.layers(baseLayers).addTo(map);

        mapInitialized = true;
      } else {
        map.setView([story.lat, story.lon], 13);
      }

      map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      L.marker([story.lat, story.lon]).addTo(map)
        .bindPopup(`<strong>${story.name}</strong><br>${story.description}`)
        .openPopup();

    });

    listEl.appendChild(item);
  });

  mapModal.addEventListener('click', e => {
    if (e.target === mapModal) {
      mapModal.style.display = 'none';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mapModal.style.display === 'flex') {
      mapModal.style.display = 'none';
    }
  });

  mapModal.addEventListener('keydown', e => {
    const focusableElements = modalContent.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });
}


