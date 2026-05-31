// Serverless In-Memory Cache Utility for RapidKitchen
class AppCache {
  constructor() {
    // Ensure the cache map persists across serverless warm container lifecycles
    if (!global._appCache) {
      global._appCache = new Map();
    }
  }

  // Retrieve an item from the cache if it exists and has not expired
  get(key) {
    const entry = global._appCache.get(key);
    if (!entry) return null;
    
    // Check if the item has expired
    if (Date.now() > entry.expiry) {
      global._appCache.delete(key);
      return null;
    }
    return entry.data;
  }

  // Set an item in the cache with a specific Time To Live (TTL) in seconds
  set(key, data, ttlSeconds = 30) {
    global._appCache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  // Delete a specific key
  delete(key) {
    global._appCache.delete(key);
  }

  // Delete all keys starting with a prefix (e.g. "products:") when modifications happen
  clearPrefix(prefix) {
    for (const key of global._appCache.keys()) {
      if (key.startsWith(prefix)) {
        global._appCache.delete(key);
      }
    }
  }

  // Clear the entire cache
  clear() {
    global._appCache.clear();
  }
}

export const cache = new AppCache();
export default cache;
