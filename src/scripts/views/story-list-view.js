import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class StoryListView {
  constructor(container, bookmarkModel) {
    this.container = container;
    this.presenter = null;
    this.map = null;
    this.bookmarkModel = bookmarkModel;
    this.currentStory = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  showLocationError() {
    alert('Cerita ini tidak memiliki data lokasi.');
  }

  renderLoading() {
    this.container.innerHTML = '<h2>Memuat cerita...</h2>';
  }

  renderError(message) {
    this.container.innerHTML = `<p class="text-red-600">${message}</p>`;
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  renderStoryList(stories) {
    this.container.innerHTML = `
        <div class="container mx-auto px-4">
          <a href="#story-list" class="skip-link">Lewati ke konten utama</a>

          <h2 class="font-bold mb-4 text-xl" id="story-list-heading" style="text-align: center">
            Daftar Cerita
          </h2>

          <section>
            <div class="reports-map-container">
              <div id="map-reports" class="reports-map-container"></div>
              <div id="map-loading-container"></div>
            </div>
          </section>

          <div 
            id="story-list" 
            tabindex="-1"
            role="main"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            role="list"
            aria-labelledby="story-list-heading"
          ></div>

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
                aria-hidden="true"
              ></div>
              <div id="story-detail" style="padding: 1rem;" aria-live="polite">
                <h3 id="story-title" class="font-bold mb-4"></h3>
                <p id="story-description"></p>
                <small id="story-created"></small>
                <button 
                id="bookmark-button"
                class="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 mb-4 float-right">
                aria-label="Tambah cerita ke daftar simpanan/bookmark"
                </button>
              </div>
            </div>
          </div>
        </div>
`;

    if (!stories.length) {
      this.container.innerHTML = '<h2 class="font-bold mb-4 text-xl">Belum ada cerita</h2>';
      return;
    }

    const mainContent = document.querySelector("#story-list");
    const skipLink = document.querySelector(".skip-link");
    const listEl = this.container.querySelector('#story-list');
    const mapModal = this.container.querySelector('#map-modal');
    const modalContent = this.container.querySelector('#modal-content');
    const mapEl = document.querySelector('#map-reports');
    const bookmarkButton = this.container.querySelector('#bookmark-button');

    L.Marker.prototype.options.icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          shadownAnchor: [12, 41]
        });

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });

    stories.forEach((story, index) => {
      const item = document.createElement('article');
      item.className = 'bg-white rounded-xl shadow-md overflow-hidden p-4 flex flex-col gap-2 text-sm hover:shadow-lg transition-shadow duration-200';
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
    <img src="${story.photoUrl}" alt="Foto dari ${story.name}" class="w-full h-auto rounded-md cursor-pointer object-cover" loading="lazy" />
    <h3 class="text-lg font-semibold">${story.name}</h3>
    <p class="text-gray-700">${story.description}</p>
    <small class="text-gray-500">Dibuat: ${new Date(story.createdAt).toLocaleString()}</small>
  `;

      item.style.cursor = 'pointer';
      item.addEventListener('click', () => { this.presenter.onStorySelected(index); });
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

    this.mapReports = L.map(mapEl).setView([-2.5, 118], 5);

    const baseLayers = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }),
      "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenTopoMap contributors'
      }),
      "Esri World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    };

    baseLayers["OpenStreetMap"].addTo(this.mapReports);

    L.control.layers(baseLayers).addTo(this.mapReports);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(this.mapReports)
          .bindPopup(`<strong>${story.name}</strong>`);
      }
    });
  }

  async renderStory(story) {
    this.currentStory = story;
    const storyTitle = this.container.querySelector('#story-title');
    const storyDesc = this.container.querySelector('#story-description');
    const storyCreated = this.container.querySelector('#story-created');
    const mapModal = this.container.querySelector('#map-modal');
    const modalContent = this.container.querySelector('#modal-content');
    const bookmarkButton = this.container.querySelector('#bookmark-button');

    L.Marker.prototype.options.icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          shadownAnchor: [12, 41]
        });

    mapModal.style.display = 'flex';
    modalContent.focus();

    storyTitle.textContent = story.name;
    storyDesc.textContent = story.description;
    storyCreated.textContent = `Dibuat: ${new Date(story.createdAt).toLocaleString()}`;

    const isBookmarked = await this.presenter.checkBookmarkStatus(story.id);
    this.updateBookmarkButton(isBookmarked);

    bookmarkButton.onclick = async () => {
      await this.presenter.toggleBookmark(this.currentStory);
      const updatedStatus = await this.presenter.checkBookmarkStatus(this.currentStory.id);
      this.updateBookmarkButton(updatedStatus);
    };

    if (this.map === null) {
      const mapEl = this.container.querySelector('#map');
      this.map = L.map(mapEl).setView([story.lat, story.lon], 13);

      const baseLayers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }),
        "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; OpenTopoMap contributors'
        }),
        "Esri World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
      };
      baseLayers["OpenStreetMap"].addTo(this.map);
      L.control.layers(baseLayers).addTo(this.map);
    } else {
      this.map.setView([story.lat, story.lon], 13);
    }

    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });
    L.marker([story.lat, story.lon]).addTo(this.map)
      .bindPopup(`<strong>${story.name}</strong><br>${story.description}`)
      .openPopup();
  }

  updateBookmarkButton(isBookmarked) {
    const bookmarkButton = this.container.querySelector('#bookmark-button');
    if (isBookmarked) {
      bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
      // bookmarkButton.classList.remove('bg-blue-500'); 
      // bookmarkButton.classList.add('bg-red-500'); 
    } else {
      bookmarkButton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
      // bookmarkButton.classList.remove('bg-red-500'); 
      // bookmarkButton.classList.add('bg-blue-500'); 
    }
  }
}