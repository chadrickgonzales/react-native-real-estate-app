import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompleteOfflineData } from './offline-sample-data';

const CACHE_KEYS = {
  OFFLINE_PROPERTIES: 'offline_properties',
  OFFLINE_USERS: 'offline_users',
  OFFLINE_BOOKINGS: 'offline_bookings',
  OFFLINE_REVIEWS: 'offline_reviews',
  OFFLINE_CHAT_CONVERSATIONS: 'offline_chat_conversations',
  OFFLINE_CHAT_MESSAGES: 'offline_chat_messages',
  OFFLINE_SAVED_PROPERTIES: 'offline_saved_properties',
  OFFLINE_NOTIFICATIONS: 'offline_notifications',
  OFFLINE_DATA_INITIALIZED: 'offline_data_initialized'
};

export class OfflineDataProvider {
  private static instance: OfflineDataProvider;
  private isInitialized = false;

  public static getInstance(): OfflineDataProvider {
    if (!OfflineDataProvider.instance) {
      OfflineDataProvider.instance = new OfflineDataProvider();
    }
    return OfflineDataProvider.instance;
  }

  // Initialize offline data if not already done
  public async initializeOfflineData(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const isInitialized = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_DATA_INITIALIZED);
      
      if (!isInitialized) {
        console.log('🌱 Initializing offline sample data...');
        
        const completeData = getCompleteOfflineData();
        
        // Store all data in AsyncStorage
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_PROPERTIES, JSON.stringify(completeData.properties));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_USERS, JSON.stringify(completeData.users));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_BOOKINGS, JSON.stringify(completeData.bookings));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_REVIEWS, JSON.stringify(completeData.reviews));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_CHAT_CONVERSATIONS, JSON.stringify(completeData.chatConversations));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_CHAT_MESSAGES, JSON.stringify(completeData.chatMessages));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_SAVED_PROPERTIES, JSON.stringify(completeData.savedProperties));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_NOTIFICATIONS, JSON.stringify(completeData.notifications));
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_DATA_INITIALIZED, 'true');
        
        console.log('✅ Offline sample data initialized successfully!');
        console.log(`📊 Data summary:`);
        console.log(`• Properties: ${completeData.properties.length}`);
        console.log(`• Users: ${completeData.users.length}`);
        console.log(`• Bookings: ${completeData.bookings.length}`);
        console.log(`• Reviews: ${completeData.reviews.length}`);
        console.log(`• Chat Conversations: ${completeData.chatConversations.length}`);
        console.log(`• Chat Messages: ${completeData.chatMessages.length}`);
        console.log(`• Saved Properties: ${completeData.savedProperties.length}`);
        console.log(`• Notifications: ${completeData.notifications.length}`);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing offline data:', error);
    }
  }

  // Get properties (with filtering and pagination)
  public async getProperties(filters?: {
    propertyType?: 'sell' | 'rent';
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    location?: string;
  }, pagination?: { page: number; limit: number }): Promise<{
    properties: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const propertiesString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_PROPERTIES);
      if (!propertiesString) {
        await this.initializeOfflineData();
        return this.getProperties(filters, pagination);
      }

      let properties = JSON.parse(propertiesString);

      // Apply filters
      if (filters) {
        if (filters.propertyType) {
          properties = properties.filter((p: any) => p.propertyType === filters.propertyType);
        }
        if (filters.type) {
          properties = properties.filter((p: any) => p.type === filters.type);
        }
        if (filters.minPrice) {
          properties = properties.filter((p: any) => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice) {
          properties = properties.filter((p: any) => p.price <= filters.maxPrice!);
        }
        if (filters.bedrooms) {
          properties = properties.filter((p: any) => p.bedrooms >= filters.bedrooms!);
        }
        if (filters.bathrooms) {
          properties = properties.filter((p: any) => p.bathrooms >= filters.bathrooms!);
        }
        if (filters.amenities && filters.amenities.length > 0) {
          properties = properties.filter((p: any) => 
            filters.amenities!.some(amenity => p.amenities.includes(amenity))
          );
        }
        if (filters.location) {
          properties = properties.filter((p: any) => 
            p.address.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }
      }

      const total = properties.length;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return {
        properties: properties.slice(startIndex, endIndex),
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error getting properties:', error);
      return { properties: [], total: 0, page: 1, limit: 20 };
    }
  }

  // Get single property by ID
  public async getPropertyById(propertyId: string): Promise<any | null> {
    try {
      const propertiesString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_PROPERTIES);
      if (!propertiesString) {
        await this.initializeOfflineData();
        return this.getPropertyById(propertyId);
      }

      const properties = JSON.parse(propertiesString);
      return properties.find((p: any) => p.$id === propertyId) || null;
    } catch (error) {
      console.error('Error getting property by ID:', error);
      return null;
    }
  }

  // Get bookings for a user
  public async getBookings(userId: string): Promise<any[]> {
    try {
      const bookingsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_BOOKINGS);
      if (!bookingsString) {
        await this.initializeOfflineData();
        return this.getBookings(userId);
      }

      const bookings = JSON.parse(bookingsString);
      return bookings.filter((b: any) => b.userId === userId);
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  // Get reviews for a property
  public async getReviews(propertyId: string): Promise<any[]> {
    try {
      const reviewsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_REVIEWS);
      if (!reviewsString) {
        await this.initializeOfflineData();
        return this.getReviews(propertyId);
      }

      const reviews = JSON.parse(reviewsString);
      return reviews.filter((r: any) => r.propertyId === propertyId);
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }

  // Get chat conversations for a user
  public async getChatConversations(userId: string): Promise<any[]> {
    try {
      const conversationsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_CHAT_CONVERSATIONS);
      if (!conversationsString) {
        await this.initializeOfflineData();
        return this.getChatConversations(userId);
      }

      const conversations = JSON.parse(conversationsString);
      return conversations.filter((c: any) => c.participants.includes(userId));
    } catch (error) {
      console.error('Error getting chat conversations:', error);
      return [];
    }
  }

  // Get chat messages for a conversation
  public async getChatMessages(chatId: string): Promise<any[]> {
    try {
      const messagesString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_CHAT_MESSAGES);
      if (!messagesString) {
        await this.initializeOfflineData();
        return this.getChatMessages(chatId);
      }

      const messages = JSON.parse(messagesString);
      return messages.filter((m: any) => m.chatId === chatId);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  // Get saved properties for a user
  public async getSavedProperties(userId: string): Promise<any[]> {
    try {
      const savedString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_SAVED_PROPERTIES);
      const propertiesString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_PROPERTIES);
      
      if (!savedString || !propertiesString) {
        await this.initializeOfflineData();
        return this.getSavedProperties(userId);
      }

      const savedProperties = JSON.parse(savedString);
      const properties = JSON.parse(propertiesString);
      
      const userSaved = savedProperties.filter((s: any) => s.userId === userId);
      return userSaved.map((saved: any) => 
        properties.find((p: any) => p.$id === saved.propertyId)
      ).filter(Boolean);
    } catch (error) {
      console.error('Error getting saved properties:', error);
      return [];
    }
  }

  // Get notifications for a user
  public async getNotifications(userId: string): Promise<any[]> {
    try {
      const notificationsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_NOTIFICATIONS);
      if (!notificationsString) {
        await this.initializeOfflineData();
        return this.getNotifications(userId);
      }

      const notifications = JSON.parse(notificationsString);
      return notifications.filter((n: any) => n.userId === userId);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Search properties
  public async searchProperties(query: string, filters?: any): Promise<any[]> {
    try {
      const result = await this.getProperties(filters);
      const properties = result.properties;
      
      if (!query) return properties;
      
      const searchTerm = query.toLowerCase();
      return properties.filter((property: any) => 
        property.name.toLowerCase().includes(searchTerm) ||
        property.description.toLowerCase().includes(searchTerm) ||
        property.address.toLowerCase().includes(searchTerm) ||
        property.amenities.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }

  // Add a new booking (offline)
  public async addBooking(bookingData: any): Promise<any> {
    try {
      const bookingsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_BOOKINGS);
      const bookings = bookingsString ? JSON.parse(bookingsString) : [];
      
      const newBooking = {
        ...bookingData,
        $id: `booking_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      bookings.push(newBooking);
      await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_BOOKINGS, JSON.stringify(bookings));
      
      return newBooking;
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  }

  // Add a new review (offline)
  public async addReview(reviewData: any): Promise<any> {
    try {
      const reviewsString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_REVIEWS);
      const reviews = reviewsString ? JSON.parse(reviewsString) : [];
      
      const newReview = {
        ...reviewData,
        $id: `review_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      reviews.push(newReview);
      await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_REVIEWS, JSON.stringify(reviews));
      
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Save/unsave a property
  public async toggleSavedProperty(userId: string, propertyId: string): Promise<boolean> {
    try {
      const savedString = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_SAVED_PROPERTIES);
      const savedProperties = savedString ? JSON.parse(savedString) : [];
      
      const existingIndex = savedProperties.findIndex(
        (s: any) => s.userId === userId && s.propertyId === propertyId
      );
      
      if (existingIndex >= 0) {
        // Remove from saved
        savedProperties.splice(existingIndex, 1);
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_SAVED_PROPERTIES, JSON.stringify(savedProperties));
        return false;
      } else {
        // Add to saved
        const newSaved = {
          $id: `saved_${Date.now()}`,
          userId,
          propertyId,
          savedAt: new Date().toISOString()
        };
        savedProperties.push(newSaved);
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_SAVED_PROPERTIES, JSON.stringify(savedProperties));
        return true;
      }
    } catch (error) {
      console.error('Error toggling saved property:', error);
      return false;
    }
  }

  // Clear all offline data
  public async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.OFFLINE_PROPERTIES,
        CACHE_KEYS.OFFLINE_USERS,
        CACHE_KEYS.OFFLINE_BOOKINGS,
        CACHE_KEYS.OFFLINE_REVIEWS,
        CACHE_KEYS.OFFLINE_CHAT_CONVERSATIONS,
        CACHE_KEYS.OFFLINE_CHAT_MESSAGES,
        CACHE_KEYS.OFFLINE_SAVED_PROPERTIES,
        CACHE_KEYS.OFFLINE_NOTIFICATIONS,
        CACHE_KEYS.OFFLINE_DATA_INITIALIZED
      ]);
      
      this.isInitialized = false;
      console.log('✅ Offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Get data statistics
  public async getDataStats(): Promise<{
    properties: number;
    users: number;
    bookings: number;
    reviews: number;
    conversations: number;
    messages: number;
    savedProperties: number;
    notifications: number;
  }> {
    try {
      const [
        propertiesString,
        usersString,
        bookingsString,
        reviewsString,
        conversationsString,
        messagesString,
        savedString,
        notificationsString
      ] = await AsyncStorage.multiGet([
        CACHE_KEYS.OFFLINE_PROPERTIES,
        CACHE_KEYS.OFFLINE_USERS,
        CACHE_KEYS.OFFLINE_BOOKINGS,
        CACHE_KEYS.OFFLINE_REVIEWS,
        CACHE_KEYS.OFFLINE_CHAT_CONVERSATIONS,
        CACHE_KEYS.OFFLINE_CHAT_MESSAGES,
        CACHE_KEYS.OFFLINE_SAVED_PROPERTIES,
        CACHE_KEYS.OFFLINE_NOTIFICATIONS
      ]);

      return {
        properties: propertiesString ? JSON.parse(propertiesString).length : 0,
        users: usersString ? JSON.parse(usersString).length : 0,
        bookings: bookingsString ? JSON.parse(bookingsString).length : 0,
        reviews: reviewsString ? JSON.parse(reviewsString).length : 0,
        conversations: conversationsString ? JSON.parse(conversationsString).length : 0,
        messages: messagesString ? JSON.parse(messagesString).length : 0,
        savedProperties: savedString ? JSON.parse(savedString).length : 0,
        notifications: notificationsString ? JSON.parse(notificationsString).length : 0
      };
    } catch (error) {
      console.error('Error getting data stats:', error);
      return {
        properties: 0,
        users: 0,
        bookings: 0,
        reviews: 0,
        conversations: 0,
        messages: 0,
        savedProperties: 0,
        notifications: 0
      };
    }
  }
}

// Export singleton instance
export const offlineDataProvider = OfflineDataProvider.getInstance();
