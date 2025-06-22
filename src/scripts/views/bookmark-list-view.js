import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class BookmarkListView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.map = null; 
    this.currentStory = null; 
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  renderLoading() {
    this.container.innerHTML = '<h2>Loading Bookmarks...</h2>';
  }

  renderError(message) {
    this.container.innerHTML = `<p class="text-red-600">${message}</p>`;
  }

  renderBookmarkList(stories) {
    this.container.innerHTML = `
      <div class="container mx-auto px-4">
        <h2 class="font-bold mb-4 text-xl" style="text-align: center">
          Cerita tersimpan
        </h2>
        <div 
          id="bookmark-list" 
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          role="list"
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
              </div>
            </div>
          </div>
      </div>
    `;

    if (!stories.length) {
      this.container.querySelector('#bookmark-list').innerHTML = '<p class="text-center">Belum ada cerita tersimpan</p>';
      return;
    }

    const listEl = this.container.querySelector('#bookmark-list');
    const mapModal = this.container.querySelector('#map-modal'); 
    const modalContent = this.container.querySelector('#modal-content'); 

    stories.forEach((story) => {
      const item = document.createElement('article');
      item.className = 'bg-white rounded-xl shadow-md overflow-hidden p-4 flex flex-col gap-2 text-sm';
      item.innerHTML = `
        <img src="${story.photoUrl}" alt="Photo from ${story.name}" class="w-full h-auto rounded-md object-cover cursor-pointer" loading="lazy" />
        <h3 class="text-lg font-semibold">${story.name}</h3>
        <p class="text-gray-700">${story.description}</p>
        <small class="text-gray-500">Created: ${new Date(story.createdAt).toLocaleString()}</small>
        <button data-story-id="${story.id}" class="remove-bookmark-btn bg-red-500 text-white px-4 py-2 rounded-md mt-2">Hapus Bookmark</button>
      `;
      listEl.appendChild(item);

      item.querySelector('img').addEventListener('click', () => { 
        this.renderStory(story); 
      });

      item.querySelector('.remove-bookmark-btn').addEventListener('click', async (e) => {
        const storyIdToRemove = e.target.dataset.storyId;
        await this.presenter.removeBookmark(storyIdToRemove);
        this.renderBookmarkList(await this.presenter.getBookmarkStories());
      });
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

  async renderStory(story) { 
    this.currentStory = story;

    const storyTitle = this.container.querySelector('#story-title');
    const storyDesc = this.container.querySelector('#story-description');
    const storyCreated = this.container.querySelector('#story-created');
    const mapModal = this.container.querySelector('#map-modal');
    const modalContent = this.container.querySelector('#modal-content');

    mapModal.style.display = 'flex';
    modalContent.focus();

    storyTitle.textContent = story.name;
    storyDesc.textContent = story.description;
    storyCreated.textContent = `Dibuat: ${new Date(story.createdAt).toLocaleString()}`;

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
        "Stadia satellite": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
          attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          ext: 'jpg'
        }),
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
}