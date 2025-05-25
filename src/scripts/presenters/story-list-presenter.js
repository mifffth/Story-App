import { fetchStories } from '../models/story-model.js';

export class StoryListPresenter {
  constructor() {
    this.view = null;
    this.cachedStories = [];
  } 

  setView(view) {
      this.view = view;
  }
  
  async onLoginClicked() {
    window.location.hash = '#/login';
  }

  async onPageLoad() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.view.renderLogin();
      return;
    }

    this.view.renderLoading();
    try {
      this.cachedStories = await fetchStories();
      this.view.renderStoryList(this.cachedStories);
    } catch (error) {
      this.view.renderError(error.message);
    }
  }

  async onStorySelected(index) {
    const story = this.cachedStories[index];
    if (!story.lat || !story.lon) {
      alert('Cerita ini tidak memiliki data lokasi.');
    } else {
      this.view.renderStory(story);
    }
  }
}
