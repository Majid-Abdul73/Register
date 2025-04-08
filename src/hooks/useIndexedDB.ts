import { openDB } from 'idb';

const DB_NAME = 'registerDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores with keyPath
      if (!db.objectStoreNames.contains('campaigns')) {
        db.createObjectStore('campaigns', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('campaign-details')) {
        db.createObjectStore('campaign-details', { keyPath: 'id' });
      }
    },
  });
};

export const useIndexedDB = () => {
  const saveToDB = async (storeName: string, data: any) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Ensure data has the required id field
    const dataToStore = Array.isArray(data) 
      ? data 
      : { id: storeName, data, timestamp: Date.now() };
    
    try {
      if (Array.isArray(dataToStore)) {
        // If it's an array, store each item individually
        await Promise.all(dataToStore.map(item => store.put(item)));
      } else {
        await store.put(dataToStore);
      }
    } catch (error) {
      console.error('IndexedDB save error:', error);
      throw error;
    }
  };

  const getFromDB = async (storeName: string, key: string) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    try {
      const result = await store.get(key);
      return result?.data || result;
    } catch (error) {
      console.error('IndexedDB get error:', error);
      throw error;
    }
  };

  return { saveToDB, getFromDB };
};