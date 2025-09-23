import { useEffect, useState } from 'react';
import { offlineDataProvider } from './offline-data-provider';
import { isOnline } from './offline-sync';

export interface UseOfflineDataProviderOptions {
  autoInitialize?: boolean;
  refreshInterval?: number;
}

export function useOfflineDataProvider(options: UseOfflineDataProviderOptions = {}) {
  const { autoInitialize = true, refreshInterval = 30000 } = options;
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  const [dataStats, setDataStats] = useState<any>(null);

  // Initialize offline data
  useEffect(() => {
    if (autoInitialize && !isOnlineStatus) {
      initializeOfflineData();
    }
  }, [autoInitialize, isOnlineStatus]);

  // Monitor online status
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnlineStatus(isOnline());
    };

    const interval = setInterval(checkOnlineStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Refresh data stats periodically
  useEffect(() => {
    if (isInitialized && !isOnlineStatus) {
      const interval = setInterval(async () => {
        const stats = await offlineDataProvider.getDataStats();
        setDataStats(stats);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, isOnlineStatus, refreshInterval]);

  const initializeOfflineData = async () => {
    try {
      await offlineDataProvider.initializeOfflineData();
      setIsInitialized(true);
      
      const stats = await offlineDataProvider.getDataStats();
      setDataStats(stats);
    } catch (error) {
      console.error('Failed to initialize offline data:', error);
    }
  };

  // Properties
  const getProperties = async (filters?: any, pagination?: any) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getProperties(filters, pagination);
  };

  const getPropertyById = async (propertyId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getPropertyById(propertyId);
  };

  const searchProperties = async (query: string, filters?: any) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.searchProperties(query, filters);
  };

  // Bookings
  const getBookings = async (userId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getBookings(userId);
  };

  const addBooking = async (bookingData: any) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.addBooking(bookingData);
  };

  // Reviews
  const getReviews = async (propertyId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getReviews(propertyId);
  };

  const addReview = async (reviewData: any) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.addReview(reviewData);
  };

  // Chat
  const getChatConversations = async (userId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getChatConversations(userId);
  };

  const getChatMessages = async (chatId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getChatMessages(chatId);
  };

  // Saved Properties
  const getSavedProperties = async (userId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getSavedProperties(userId);
  };

  const toggleSavedProperty = async (userId: string, propertyId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.toggleSavedProperty(userId, propertyId);
  };

  // Notifications
  const getNotifications = async (userId: string) => {
    if (isOnlineStatus) {
      throw new Error('This method should only be used when offline');
    }
    return await offlineDataProvider.getNotifications(userId);
  };

  // Utility methods
  const clearOfflineData = async () => {
    await offlineDataProvider.clearOfflineData();
    setIsInitialized(false);
    setDataStats(null);
  };

  const refreshDataStats = async () => {
    const stats = await offlineDataProvider.getDataStats();
    setDataStats(stats);
  };

  return {
    // Status
    isInitialized,
    isOnline: isOnlineStatus,
    dataStats,
    
    // Properties
    getProperties,
    getPropertyById,
    searchProperties,
    
    // Bookings
    getBookings,
    addBooking,
    
    // Reviews
    getReviews,
    addReview,
    
    // Chat
    getChatConversations,
    getChatMessages,
    
    // Saved Properties
    getSavedProperties,
    toggleSavedProperty,
    
    // Notifications
    getNotifications,
    
    // Utility
    initializeOfflineData,
    clearOfflineData,
    refreshDataStats
  };
}

// Specialized hooks for common use cases
export function useOfflineProperties(filters?: any, pagination?: any) {
  const { getProperties, isInitialized, isOnline } = useOfflineDataProvider();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && !isOnline) {
      loadProperties();
    }
  }, [isInitialized, isOnline, filters, pagination]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProperties(filters, pagination);
      setProperties(result.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  return {
    properties,
    loading,
    error,
    refetch: loadProperties
  };
}

export function useOfflineProperty(propertyId: string) {
  const { getPropertyById, isInitialized, isOnline } = useOfflineDataProvider();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && !isOnline && propertyId) {
      loadProperty();
    }
  }, [isInitialized, isOnline, propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPropertyById(propertyId);
      setProperty(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  return {
    property,
    loading,
    error,
    refetch: loadProperty
  };
}

export function useOfflineBookings(userId: string) {
  const { getBookings, isInitialized, isOnline } = useOfflineDataProvider();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && !isOnline && userId) {
      loadBookings();
    }
  }, [isInitialized, isOnline, userId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBookings(userId);
      setBookings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: loadBookings
  };
}

export function useOfflineReviews(propertyId: string) {
  const { getReviews, isInitialized, isOnline } = useOfflineDataProvider();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && !isOnline && propertyId) {
      loadReviews();
    }
  }, [isInitialized, isOnline, propertyId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getReviews(propertyId);
      setReviews(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    refetch: loadReviews
  };
}
