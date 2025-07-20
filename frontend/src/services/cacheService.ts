interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultExpiry: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (Date.now() > item.timestamp + item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param expiry Optional expiry time in milliseconds
   */
  set<T>(key: string, data: T, expiry: number = this.defaultExpiry): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Remove an item from the cache
   * @param key The cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear all items that match a key prefix
   * @param prefix The key prefix to match
   */
  clearByPrefix(prefix: string): void {
    // Convert keys iterator to array to avoid TypeScript error
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
  }
}

// Create a singleton instance
const cacheServiceInstance = new CacheService();

// Export the singleton instance
export default cacheServiceInstance;