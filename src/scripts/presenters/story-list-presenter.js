
import { fetchStories } from '../models/story-model.js'; 
import { getToken } from '../models/auth-model.js'; 
import { bookmarkDb } from '../data/bookmark-db.js'; 

export class StoryListPresenter {
  constructor() {
    this.view = null; 
    this.cachedStories = []; 
    this.bookmarkDb = bookmarkDb; 
  } 

  setView(view) { 
      this.view = view; 
  }
  
  async onLoginClicked() { 
    this.view.navigateTo('#/stories'); 
  }
  
  async onPageLoad() { 
    const token = getToken(); 
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
      this.view.showLocationError(); 
    } else {
      this.view.renderStory(story); 
    }
  }

  async checkBookmarkStatus(storyId) { 
    return await this.bookmarkDb.getStory(storyId); 
  }

  async toggleBookmark(story) { 
    const isBookmarked = await this.checkBookmarkStatus(story.id); 
    if (isBookmarked) { 
      await this.bookmarkDb.deleteStory(story.id); 
      alert('Cerita dihapus dari bookmarks!'); 
    } else {
      await this.bookmarkDb.putStory(story); 
      alert('Cerita ditambahkan ke bookmarks!'); 
    }
  }
}