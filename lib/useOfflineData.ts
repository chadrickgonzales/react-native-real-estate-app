import { useState, useEffect, useCallback } from 'react';
import { 
  getCachedProperties, 
  getCachedUserData, 
  getCachedBookings, 
  getCachedReviews,
  cacheProperties,
  cacheUserData,
  cacheBookings,
  cacheReviews,
  addOfflineAction
} from './offline-storage';
import { isOnline, addSyncStatusListener, removeSyncStatusListener, SyncStatus } from './offline-sync';

interface UseOfflineDataOptions<T> {
  fetchFunction: () => Promise<T>;
  cacheFunction: (data: T) => Promise<void>;
  getCacheFunction: () => Promise<T | null>;
  fallbackData?: T;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface OfflineDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isFromCache: boolean;
  lastUpdated: number | null;
  refetch: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export function useOfflineData<T>({
  fetchFunction,
  cacheFunction,
  getCacheFunction,
  fallbackData = null,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes
}: UseOfflineDataOptions<T>): OfflineDataState<T> {
  const [data, setData] = useState<T | null>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: isOnline(),
    isSyncing: false,
    lastSync: null
  });

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // If online or force refresh, try to fetch from server
      if (syncStatus.isOnline || forceRefresh) {
        try {
          const freshData = await fetchFunction();
          setData(freshData);
          setIsFromCache(false);
          setLastUpdated(Date.now());
          
          // Cache the fresh data
          if (freshData) {
            await cacheFunction(freshData);
          }
        } catch (fetchError) {
          console.warn('Failed to fetch fresh data, falling back to cache:', fetchError);
          
          // If fetch fails, try to get cached data
          const cachedData = await getCacheFunction();
          if (cachedData) {
            setData(cachedData);
            setIsFromCache(true);
          } else {
            throw fetchError;
          }
        }
      } else {
        // If offline, get cached data
        const cachedData = await getCacheFunction();
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
        } else {
          setData(fallbackData);
          setIsFromCache(false);
        }
      }
    } catch (err) {
      setError(err as Error);
      setData(fallbackData);
      setIsFromCache(false);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, cacheFunction, getCacheFunction, fallbackData, syncStatus.isOnline]);

  const clearCache = useCallback(async () => {
    // This would need to be implemented per cache type
    // For now, we'll just refetch
    await fetchData(true);
  }, [fetchData]);

  // Effect for initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Effect for sync status changes
  useEffect(() => {
    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
      
      // If we just came online and have cached data, refresh
      if (status.isOnline && !status.isSyncing && isFromCache) {
        fetchData();
      }
    };

    addSyncStatusListener(handleSyncStatusChange);
    
    return () => {
      removeSyncStatusListener(handleSyncStatusChange);
    };
  }, [fetchData, isFromCache]);

  // Effect for auto-refresh
  useEffect(() => {
    if (!autoRefresh || !syncStatus.isOnline) {
      return;
    }

    const interval = setInterval(() => {
      if (syncStatus.isOnline && !syncStatus.isSyncing) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, syncStatus.isOnline, syncStatus.isSyncing, fetchData]);

  return {
    data,
    loading,
    error,
    isFromCache,
    lastUpdated,
    refetch: () => fetchData(true),
    clearCache
  };
}

// Specialized hooks for common data types
export function useOfflineProperties() {
  return useOfflineData({
    fetchFunction: async () => {
      const { getLatestProperties } = await import('./appwrite');
      return await getLatestProperties();
    },
    cacheFunction: cacheProperties,
    getCacheFunction: getCachedProperties,
    fallbackData: []
  });
}

export function useOfflineUserData(userId?: string) {
  return useOfflineData({
    fetchFunction: async () => {
      if (!userId) return null;
      const { getCurrentUser } = await import('./appwrite');
      return await getCurrentUser();
    },
    cacheFunction: cacheUserData,
    getCacheFunction: getCachedUserData,
    fallbackData: null,
    autoRefresh: false // User data doesn't change frequently
  });
}

export function useOfflineBookings(userId?: string) {
  return useOfflineData({
    fetchFunction: async () => {
      if (!userId) return [];
      const { getUserBookings } = await import('./booking');
      return await getUserBookings(userId);
    },
    cacheFunction: cacheBookings,
    getCacheFunction: getCachedBookings,
    fallbackData: [],
    refreshInterval: 2 * 60 * 1000 // 2 minutes (bookings change more frequently)
  });
}

export function useOfflineReviews(propertyId?: string) {
  return useOfflineData({
    fetchFunction: async () => {
      if (!propertyId) return [];
      const { getPropertyReviews } = await import('./reviews');
      return await getPropertyReviews(propertyId);
    },
    cacheFunction: cacheReviews,
    getCacheFunction: getCachedReviews,
    fallbackData: [],
    refreshInterval: 10 * 60 * 1000 // 10 minutes
  });
}

// Offline-aware mutation functions
export async function createOfflineBooking(bookingData: any) {
  if (isOnline()) {
    try {
      const { createBooking } = await import('./booking');
      return await createBooking(bookingData);
    } catch (error) {
      // If online request fails, queue for offline sync
      await addOfflineAction({
        type: 'create',
        collection: 'bookings',
        data: bookingData
      });
      throw error;
    }
  } else {
    // Queue for offline sync
    await addOfflineAction({
      type: 'create',
      collection: 'bookings',
      data: bookingData
    });
    
    return { 
      success: true, 
      data: { ...bookingData, $id: 'offline_' + Date.now() },
      isOffline: true 
    };
  }
}

export async function createOfflineReview(reviewData: any) {
  if (isOnline()) {
    try {
      const { createPropertyReview } = await import('./reviews');
      return await createPropertyReview(reviewData);
    } catch (error) {
      // If online request fails, queue for offline sync
      await addOfflineAction({
        type: 'create',
        collection: 'reviews',
        data: reviewData
      });
      throw error;
    }
  } else {
    // Queue for offline sync
    await addOfflineAction({
      type: 'create',
      collection: 'reviews',
      data: reviewData
    });
    
    return { 
      success: true, 
      data: { ...reviewData, $id: 'offline_' + Date.now() },
      isOffline: true 
    };
  }
}

export async function updateOfflineUserProfile(profileData: any) {
  if (isOnline()) {
    try {
      const { updateUserProfile } = await import('./appwrite');
      return await updateUserProfile(profileData);
    } catch (error) {
      // If online request fails, queue for offline sync
      await addOfflineAction({
        type: 'update',
        collection: 'users',
        data: profileData
      });
      throw error;
    }
  } else {
    // Queue for offline sync
    await addOfflineAction({
      type: 'update',
      collection: 'users',
      data: profileData
    });
    
    return { 
      success: true, 
      data: profileData,
      isOffline: true 
    };
  }
}
