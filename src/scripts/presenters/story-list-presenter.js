import { fetchStories } from '../models/story-model.js';
import { showLoginPrompt, showLoading, showError, renderStories } from '../views/story-list-view.js';

export class StoryListPresenter {
  constructor(view, container) {
    this.view = view;
    this.container = container;
  }

  async loadStories() {
    const token = localStorage.getItem('token');
    if (!token) {
      showLoginPrompt(this.container);
      return;
    }

    showLoading(this.container);

    try {
      const stories = await fetchStories();
      renderStories(this.container, stories);
    } catch (error) {
      showError(this.container, error.message);
    }
  }
}
