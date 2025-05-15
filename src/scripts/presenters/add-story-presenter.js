import { submitStory, getCameraStream, stopStream, captureImageFromVideo, canvasToFile } from '../models/add-story-model.js';

export class AddStoryPresenter {
    constructor(viewFunction, container) {
        this.view = viewFunction;
        this.container = container;
    }    

    async init() {
        this.view(this.container, this);
        this.setupFormHandler();
        this.setupCamera();
    }

    setupFormHandler() {
        const form = document.getElementById('story-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const photo = form.photo.files[0];
            if (!photo || photo.size > 1048576) {
                alert('Foto wajib diunggah dan harus kurang dari 1MB');
                return;
            }

            const formData = new FormData(form);
            const token = localStorage.getItem('token');

            try {
                await submitStory(formData, token);
                alert('Cerita berhasil ditambahkan!');
                window.location.hash = '#/stories';
            } catch (err) {
                alert('Gagal menambahkan cerita: ' + err.message);
            }
        });
    }

    setupCamera() {
        const cameraButton = document.getElementById('camera-button');
        const cameraPreview = document.getElementById('camera-preview');
        const video = document.getElementById('video');
        const captureButton = document.getElementById('capture-button');
        const cancelButton = document.getElementById('cancel-button');
        const photoInput = document.getElementById('photo');

        let stream;

        async function stopCamera() {
            stopStream(stream, video);
            stream = null;
            cameraPreview.style.display = 'none';
        }

        cameraButton.addEventListener('click', async () => {
            cameraPreview.style.display = 'block';
            if (!stream) {
                try {
                    stream = await getCameraStream();
                    video.srcObject = stream;
                } catch (err) {
                    console.error('Camera error:', err);
                    alert('Tidak dapat mengakses kamera!');
                }
            }
        });

        captureButton.addEventListener('click', () => {
            if (!stream) return;

            const canvas = captureImageFromVideo(video);
            stopStream(stream, video);
            stream = null;
            cameraPreview.style.display = 'none';

            canvasToFile(canvas, (file) => {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                photoInput.files = dataTransfer.files;
            });
        });

        cancelButton.addEventListener('click', stopCamera);
        window.addEventListener('hashchange', stopCamera);
    }
}
