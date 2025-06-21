
import { openDB } from 'idb'; 

const DB_NAME = 'story-app-db'; 
const DB_VERSION = 1; 
const STORE_NAME = 'bookmarks'; 

const initDb = async () => { 
  return openDB(DB_NAME, DB_VERSION, { 
    upgrade(database) { 
      database.createObjectStore(STORE_NAME, { keyPath: 'id' }); 
    },
  });
};

export const bookmarkDb = { 
  async getStory(id) { 
    const db = await initDb(); 
    return db.get(STORE_NAME, id); 
  },
  async getAllStories() { 
    const db = await initDb(); 
    return db.getAll(STORE_NAME); 
  },
  async putStory(story) { 
    const db = await initDb(); 
    return db.put(STORE_NAME, story); 
  },
  async deleteStory(id) { 
    const db = await initDb(); 
    return db.delete(STORE_NAME, id); 
  },
};