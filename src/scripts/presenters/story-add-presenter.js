import imageCompression from 'browser-image-compression';
import { submitStory, sendNewStoryNotification } from '../models/story-model.js'; 

export class StoryAddPresenter {
  constructor() {
    this.view = null;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async onSubmitPhoto(photo, formData) {
    if (!photo) {
      this.view.renderSubmitError('Foto wajib diunggah');
      return;
    }

    const options = {
      maxSizeMB: 1, 
      maxWidthOrHeight: 1024,
      useWebWorker: true
    };

    let compressedPhoto;
    try {
      compressedPhoto = await imageCompression(photo, options);
    } catch (compressionErr) {
      this.view.renderSubmitError('Gagal mengompresi foto: ' + compressionErr.message);
      return;
    }

    if (compressedPhoto.size > 1048576) {
      this.view.renderSubmitError('Foto setelah kompresi masih lebih dari 1MB, mohon gunakan kamera web/pilih file lain');
      return;
    }

    formData.set('photo', compressedPhoto); 

    this.view.showLoadingOverlay('Mengunggah cerita...');

    try {
      const result = await submitStory(formData); 
      this.view.renderSubmitSuccess(); 
      this.view.navigateTo('#/stories'); 

      const description = formData.get('description'); 
      sendNewStoryNotification(description); 
    } catch (err) {
      this.view.renderSubmitError('Gagal menambahkan cerita: ' + err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}