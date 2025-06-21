import { bookmarkDb } from '../data/bookmark-db.js'; 

export class BookmarkListPresenter {
  constructor() {
    this.view = null; 
    this.bookmarkDb = bookmarkDb; 
  }

  setView(view) { 
    this.view = view; 
  }

  async onPageLoad() { 
    this.view.renderLoading(); 
    try {
      const stories = await this.bookmarkDb.getAllStories(); 
      this.view.renderBookmarkList(stories); 
    } catch (error) {
      this.view.renderError('Failed to load bookmarked stories: ' + error.message); 
    }
  }

  async getBookmarkStories() { 
    return await this.bookmarkDb.getAllStories(); 
  }

  async removeBookmark(id) { 
    await this.bookmarkDb.deleteStory(id); 
    alert('Story removed from bookmarks!'); 
  }
}