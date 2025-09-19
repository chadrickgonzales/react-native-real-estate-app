import NetInfo from '@react-native-community/netinfo';
import { 
  getOfflineActions, 
  removeOfflineAction, 
  updateOfflineActionRetries,
  setLastSyncTime,
  OfflineAction,
  cacheProperties,
  cacheUserData,
  cacheBookings,
  cacheReviews
} from './offline-storage';
import { 
  getLatestProperties, 
  getCurrentUser, 
  createProperty, 
  updateUserProfile,
  createBooking,
  createPropertyReview
} from './appwrite';
import { getUserBookings } from './booking';
import { getPropertyReviews } from './reviews';

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // If we just came back online, sync offline actions
      if (wasOffline && this.isOnline) {
        this.syncOfflineActions();
      }
      
      this.notifyListeners({
        isOnline: this.isOnline,
        isSyncing: this.syncInProgress,
        lastSync: null
      });
    });
  }

  public addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
  }

  public removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  private notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  public async syncOfflineActions(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners({
      isOnline: this.isOnline,
      isSyncing: true,
      lastSync: null
    });

    try {
      const actions = await getOfflineActions();
      console.log(`Syncing ${actions.length} offline actions...`);

      for (const action of actions) {
        try {
          await this.executeOfflineAction(action);
          await removeOfflineAction(action.id);
          console.log(`Successfully synced action: ${action.type} ${action.collection}`);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Retry logic: remove action if it has failed too many times
          if (action.retries >= 3) {
            await removeOfflineAction(action.id);
            console.log(`Removed action ${action.id} after 3 failed attempts`);
          } else {
            await updateOfflineActionRetries(action.id);
          }
        }
      }

      await setLastSyncTime();
      console.log('Offline sync completed successfully');
    } catch (error) {
      console.error('Offline sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.notifyListeners({
        isOnline: this.isOnline,
        isSyncing: false,
        lastSync: Date.now()
      });
    }
  }

  private async executeOfflineAction(action: OfflineAction): Promise<void> {
    switch (action.collection) {
      case 'properties':
        if (action.type === 'create') {
          await createProperty(action.data);
        }
        break;
      
      case 'bookings':
        if (action.type === 'create') {
          await createBooking(action.data);
        }
        break;
      
      case 'reviews':
        if (action.type === 'create') {
          await createPropertyReview(action.data);
        }
        break;
      
      case 'users':
        if (action.type === 'update') {
          await updateUserProfile(action.data);
        }
        break;
      
      default:
        throw new Error(`Unknown collection: ${action.collection}`);
    }
  }

  public async syncDataFromServer(userId?: string): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync data: offline');
      return;
    }

    try {
      console.log('Syncing data from server...');

      // Sync properties
      const properties = await getLatestProperties();
      if (properties && properties.length > 0) {
        await cacheProperties(properties);
        console.log(`Cached ${properties.length} properties`);
      }

      // Sync user data if user is logged in
      if (userId) {
        const userData = await getCurrentUser();
        if (userData) {
          await cacheUserData(userData);
          console.log('Cached user data');
        }

        // Sync user bookings
        const bookings = await getUserBookings(userId);
        if (bookings && bookings.length > 0) {
          await cacheBookings(bookings);
          console.log(`Cached ${bookings.length} bookings`);
        }
      }

      await setLastSyncTime();
      console.log('Data sync from server completed');
    } catch (error) {
      console.error('Failed to sync data from server:', error);
    }
  }

  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  public isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  // Force sync - useful for manual refresh
  public async forcSync(userId?: string): Promise<void> {
    await Promise.all([
      this.syncOfflineActions(),
      this.syncDataFromServer(userId)
    ]);
  }
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
}

// Convenience functions
export const offlineSyncManager = OfflineSyncManager.getInstance();

export async function initializeOfflineSync(userId?: string): Promise<void> {
  // Initial data sync
  await offlineSyncManager.syncDataFromServer(userId);
  
  // Sync any pending offline actions
  await offlineSyncManager.syncOfflineActions();
}

export function addSyncStatusListener(listener: (status: SyncStatus) => void): void {
  offlineSyncManager.addSyncListener(listener);
}

export function removeSyncStatusListener(listener: (status: SyncStatus) => void): void {
  offlineSyncManager.removeSyncListener(listener);
}

export function isOnline(): boolean {
  return offlineSyncManager.isOnlineStatus();
}

export function isSyncing(): boolean {
  return offlineSyncManager.isSyncInProgress();
}

export async function forceSync(userId?: string): Promise<void> {
  await offlineSyncManager.forcSync(userId);
}
