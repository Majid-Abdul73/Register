const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheItem {
  data: any;
  timestamp: number;
}

class RouteCache {
  private cache: Map<string, CacheItem> = new Map();

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const routeCache = new RouteCache();