import AsyncStorage from '@react-native-async-storage/async-storage';
import { OFFLINE_SAMPLE_DATA } from './offline-sample-data';

const OFFLINE_USER_KEY = 'offline_current_user';

export interface OfflineUser {
  $id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'tenant' | 'owner';
  preferences: {
    propertyTypes: string[];
    maxPrice: number;
    minBedrooms: number;
    location: string;
  };
}

export class OfflineAuth {
  private static instance: OfflineAuth;

  public static getInstance(): OfflineAuth {
    if (!OfflineAuth.instance) {
      OfflineAuth.instance = new OfflineAuth();
    }
    return OfflineAuth.instance;
  }

  // Get available sample users
  public getAvailableUsers(): OfflineUser[] {
    return OFFLINE_SAMPLE_DATA.users;
  }

  // Login with sample user
  public async loginWithSampleUser(userId: string): Promise<OfflineUser | null> {
    try {
      const users = this.getAvailableUsers();
      const user = users.find(u => u.$id === userId);
      
      if (user) {
        await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(user));
        console.log(`✅ Logged in as: ${user.name} (${user.role})`);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error logging in with sample user:', error);
      return null;
    }
  }

  // Login with email (for convenience)
  public async loginWithEmail(email: string): Promise<OfflineUser | null> {
    try {
      const users = this.getAvailableUsers();
      const user = users.find(u => u.email === email);
      
      if (user) {
        await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(user));
        console.log(`✅ Logged in as: ${user.name} (${user.role})`);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error logging in with email:', error);
      return null;
    }
  }

  // Get current user
  public async getCurrentUser(): Promise<OfflineUser | null> {
    try {
      const userString = await AsyncStorage.getItem(OFFLINE_USER_KEY);
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_USER_KEY);
      console.log('✅ Logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Check if user is logged in
  public async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Quick login methods for development
  public async loginAsJohn(): Promise<OfflineUser | null> {
    return this.loginWithEmail('john.doe@email.com');
  }

  public async loginAsMaria(): Promise<OfflineUser | null> {
    return this.loginWithEmail('maria.santos@email.com');
  }

  public async loginAsCarlos(): Promise<OfflineUser | null> {
    return this.loginWithEmail('carlos.rodriguez@email.com');
  }
}

// Export singleton instance
export const offlineAuth = OfflineAuth.getInstance();
