import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
export const CACHE_KEYS = {
  PROPERTIES: 'cached_properties',
  USER_DATA: 'cached_user_data',
  BOOKINGS: 'cached_bookings',
  REVIEWS: 'cached_reviews',
  SEARCH_HISTORY: 'search_history',
  SAVED_PROPERTIES: 'saved_properties',
  LAST_SYNC: 'last_sync_timestamp',
  OFFLINE_ACTIONS: 'offline_actions'
};

// Cache expiry times (in milliseconds)
export const CACHE_EXPIRY = {
  PROPERTIES: 30 * 60 * 1000, // 30 minutes
  USER_DATA: 60 * 60 * 1000,  // 1 hour
  BOOKINGS: 10 * 60 * 1000,   // 10 minutes
  REVIEWS: 60 * 60 * 1000,    // 1 hour
  SEARCH_HISTORY: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retries: number;
}

// Generic cache functions
export async function setCache<T>(key: string, data: T, expiry: number = CACHE_EXPIRY.PROPERTIES): Promise<void> {
  try {
    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry
    };
    await AsyncStorage.setItem(key, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cachedString = await AsyncStorage.getItem(key);
    if (!cachedString) return null;

    const cachedData: CachedData<T> = JSON.parse(cachedString);
    
    // Check if cache has expired
    if (Date.now() - cachedData.timestamp > cachedData.expiry) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cachedData.data;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

// Properties cache
export async function cacheProperties(properties: any[]): Promise<void> {
  await setCache(CACHE_KEYS.PROPERTIES, properties, CACHE_EXPIRY.PROPERTIES);
}

export async function getCachedProperties(): Promise<any[] | null> {
  return await getCache<any[]>(CACHE_KEYS.PROPERTIES);
}

// User data cache
export async function cacheUserData(userData: any): Promise<void> {
  await setCache(CACHE_KEYS.USER_DATA, userData, CACHE_EXPIRY.USER_DATA);
}

export async function getCachedUserData(): Promise<any | null> {
  return await getCache<any>(CACHE_KEYS.USER_DATA);
}

// Bookings cache
export async function cacheBookings(bookings: any[]): Promise<void> {
  await setCache(CACHE_KEYS.BOOKINGS, bookings, CACHE_EXPIRY.BOOKINGS);
}

export async function getCachedBookings(): Promise<any[] | null> {
  return await getCache<any[]>(CACHE_KEYS.BOOKINGS);
}

// Reviews cache
export async function cacheReviews(reviews: any[]): Promise<void> {
  await setCache(CACHE_KEYS.REVIEWS, reviews, CACHE_EXPIRY.REVIEWS);
}

export async function getCachedReviews(): Promise<any[] | null> {
  return await getCache<any[]>(CACHE_KEYS.REVIEWS);
}

// Search history
export async function addToSearchHistory(query: string): Promise<void> {
  try {
    const history = await getSearchHistory();
    const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 20); // Keep last 20 searches
    await setCache(CACHE_KEYS.SEARCH_HISTORY, newHistory, CACHE_EXPIRY.SEARCH_HISTORY);
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
}

export async function getSearchHistory(): Promise<string[]> {
  const history = await getCache<string[]>(CACHE_KEYS.SEARCH_HISTORY);
  return history || [];
}

export async function clearSearchHistory(): Promise<void> {
  await clearCache(CACHE_KEYS.SEARCH_HISTORY);
}

// Saved properties (for offline access)
export async function cacheSavedProperties(propertyIds: string[]): Promise<void> {
  await setCache(CACHE_KEYS.SAVED_PROPERTIES, propertyIds, 7 * 24 * 60 * 60 * 1000); // 7 days
}

export async function getCachedSavedProperties(): Promise<string[]> {
  const saved = await getCache<string[]>(CACHE_KEYS.SAVED_PROPERTIES);
  return saved || [];
}

// Offline actions queue
export async function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  try {
    const actions = await getOfflineActions();
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retries: 0
    };
    
    actions.push(newAction);
    await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions));
  } catch (error) {
    console.error('Error adding offline action:', error);
  }
}

export async function getOfflineActions(): Promise<OfflineAction[]> {
  try {
    const actionsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_ACTIONS);
    return actionsString ? JSON.parse(actionsString) : [];
  } catch (error) {
    console.error('Error getting offline actions:', error);
    return [];
  }
}

export async function removeOfflineAction(actionId: string): Promise<void> {
  try {
    const actions = await getOfflineActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_ACTIONS, JSON.stringify(filteredActions));
  } catch (error) {
    console.error('Error removing offline action:', error);
  }
}

export async function updateOfflineActionRetries(actionId: string): Promise<void> {
  try {
    const actions = await getOfflineActions();
    const actionIndex = actions.findIndex(action => action.id === actionId);
    
    if (actionIndex !== -1) {
      actions[actionIndex].retries += 1;
      await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_ACTIONS, JSON.stringify(actions));
    }
  } catch (error) {
    console.error('Error updating offline action retries:', error);
  }
}

// Sync status
export async function setLastSyncTime(): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
}

export async function getLastSyncTime(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp) : null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
}

// Cache statistics
export async function getCacheStats(): Promise<{
  totalSize: number;
  itemCount: number;
  lastSync: number | null;
  offlineActionsCount: number;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => Object.values(CACHE_KEYS).includes(key));
    
    let totalSize = 0;
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    const lastSync = await getLastSyncTime();
    const offlineActions = await getOfflineActions();

    return {
      totalSize,
      itemCount: cacheKeys.length,
      lastSync,
      offlineActionsCount: offlineActions.length
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalSize: 0,
      itemCount: 0,
      lastSync: null,
      offlineActionsCount: 0
    };
  }
}
