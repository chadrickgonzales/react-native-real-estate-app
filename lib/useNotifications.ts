import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useGlobalContext } from './global-provider';

// Conditionally import expo-notifications to avoid errors in Expo Go
let Notifications: any = null;
let pushNotificationFunctions: any = null;

// Check if we're in Expo Go and on Android
const isExpoGo = Constants.appOwnership === 'expo';
const isAndroid = Platform.OS === 'android';

if (!(isExpoGo && isAndroid)) {
  // Only import if not in Expo Go on Android
  try {
    Notifications = require('expo-notifications');
    pushNotificationFunctions = require('./push-notifications');
  } catch (error) {
    console.warn('Failed to load notification modules:', error);
  }
}

interface NotificationState {
  isInitialized: boolean;
  pushToken: any | null;
  permissions: 'granted' | 'denied' | 'undetermined';
  pendingNotifications: any[];
  badgeCount: number;
}

interface UseNotificationsReturn extends NotificationState {
  initialize: () => Promise<void>;
  sendNotification: (notification: any) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  refreshPendingNotifications: () => Promise<void>;
  clearBadge: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  scheduleBookingReminder: (propertyName: string, date: Date) => Promise<string>;
  scheduleReviewRequest: (propertyName: string, delay?: number) => Promise<string>;
  sendBookingConfirmation: (propertyName: string, date: string, time: string) => Promise<string>;
  sendNewMessageNotification: (senderName: string, message: string) => Promise<string>;
  sendPropertyAlert: (propertyName: string, location: string, price: string) => Promise<string>;
  sendPriceReductionAlert: (propertyName: string, oldPrice: string, newPrice: string) => Promise<string>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useGlobalContext();
  const [state, setState] = useState<NotificationState>({
    isInitialized: false,
    pushToken: null,
    permissions: 'undetermined',
    pendingNotifications: [],
    badgeCount: 0
  });

  // Initialize notifications
  const initialize = useCallback(async () => {
    try {
      // Check if we're in Expo Go and on Android
      if (isExpoGo && isAndroid) {
        console.warn('Push notifications are not supported in Expo Go on Android. Please use a development build for full functionality.');
        setState(prev => ({
          ...prev,
          isInitialized: true,
          pushToken: null,
          permissions: 'denied',
          pendingNotifications: []
        }));
        return;
      }

      // Check if notification modules are available
      if (!Notifications || !pushNotificationFunctions) {
        console.warn('Notification modules not available. Running in limited mode.');
        setState(prev => ({
          ...prev,
          isInitialized: true,
          pushToken: null,
          permissions: 'denied',
          pendingNotifications: []
        }));
        return;
      }

      const pushToken = await pushNotificationFunctions.initializePushNotifications();
      const { status } = await Notifications.getPermissionsAsync();
      const pending = await pushNotificationFunctions.getPendingNotifications();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        pushToken,
        permissions: status,
        pendingNotifications: pending
      }));

      // Store push token for the user if available
      if (pushToken && user) {
        // Here you would typically send the token to your backend
        console.log('Push token for user', user.$id, ':', pushToken.token);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      setState(prev => ({ ...prev, isInitialized: false }));
    }
  }, [user]);

  // Send notification
  const sendNotificationHandler = useCallback(async (notification: any): Promise<string> => {
    try {
      // Check if we're in Expo Go and on Android
      if (isExpoGo && isAndroid) {
        console.warn('Push notifications are not supported in Expo Go on Android. Notification not sent.');
        return 'expo-go-limited';
      }

      // Check if notification modules are available
      if (!pushNotificationFunctions) {
        console.warn('Notification modules not available. Notification not sent.');
        return 'modules-unavailable';
      }

      const id = await pushNotificationFunctions.sendLocalNotification(notification);
      await refreshPendingNotifications();
      return id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }, []);

  // Cancel notification
  const cancelNotificationHandler = useCallback(async (id: string): Promise<void> => {
    try {
      if (!pushNotificationFunctions) {
        console.warn('Notification modules not available.');
        return;
      }
      await pushNotificationFunctions.cancelNotification(id);
      await refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      throw error;
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotificationsHandler = useCallback(async (): Promise<void> => {
    try {
      if (!pushNotificationFunctions) {
        console.warn('Notification modules not available.');
        return;
      }
      await pushNotificationFunctions.cancelAllNotifications();
      await refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      throw error;
    }
  }, []);

  // Refresh pending notifications
  const refreshPendingNotifications = useCallback(async (): Promise<void> => {
    try {
      if (!pushNotificationFunctions) {
        console.warn('Notification modules not available.');
        return;
      }
      const pending = await pushNotificationFunctions.getPendingNotifications();
      setState(prev => ({ ...prev, pendingNotifications: pending }));
    } catch (error) {
      console.error('Failed to refresh pending notifications:', error);
    }
  }, []);

  // Clear badge
  const clearBadgeHandler = useCallback(async (): Promise<void> => {
    try {
      if (!pushNotificationFunctions) {
        console.warn('Notification modules not available.');
        return;
      }
      await pushNotificationFunctions.clearBadge();
      setState(prev => ({ ...prev, badgeCount: 0 }));
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }, []);

  // Set badge count
  const setBadgeCountHandler = useCallback(async (count: number): Promise<void> => {
    try {
      if (!pushNotificationFunctions) {
        console.warn('Notification modules not available.');
        return;
      }
      await pushNotificationFunctions.setBadgeCount(count);
      setState(prev => ({ ...prev, badgeCount: count }));
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }, []);

  // Schedule booking reminder
  const scheduleBookingReminder = useCallback(async (propertyName: string, date: Date): Promise<string> => {
    if (!pushNotificationFunctions) {
      console.warn('Notification modules not available.');
      return 'modules-unavailable';
    }

    // Schedule reminder 1 hour before the appointment
    const reminderTime = new Date(date.getTime() - 60 * 60 * 1000);
    const now = new Date();
    
    if (reminderTime <= now) {
      throw new Error('Cannot schedule reminder for past time');
    }

    const notification = pushNotificationFunctions.NotificationTemplates.bookingReminder(
      propertyName,
      '1 hour'
    );
    
    notification.scheduledFor = reminderTime;
    
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Schedule review request
  const scheduleReviewRequest = useCallback(async (propertyName: string, delay: number = 24): Promise<string> => {
    if (!pushNotificationFunctions) {
      console.warn('Notification modules not available.');
      return 'modules-unavailable';
    }

    const requestTime = new Date(Date.now() + delay * 60 * 60 * 1000); // delay in hours
    
    const notification = pushNotificationFunctions.NotificationTemplates.reviewRequest(propertyName);
    notification.scheduledFor = requestTime;
    
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send booking confirmation
  const sendBookingConfirmation = useCallback(async (propertyName: string, date: string, time: string): Promise<string> => {
    if (!pushNotificationFunctions) {
      console.warn('Notification modules not available.');
      return 'modules-unavailable';
    }

    const notification = pushNotificationFunctions.NotificationTemplates.bookingConfirmed(propertyName, date, time);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send new message notification
  const sendNewMessageNotification = useCallback(async (senderName: string, message: string): Promise<string> => {
    if (!pushNotificationFunctions) {
      console.warn('Notification modules not available.');
      return 'modules-unavailable';
    }

    const notification = pushNotificationFunctions.NotificationTemplates.newMessage(senderName, message);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send property alert
  const sendPropertyAlert = useCallback(async (propertyName: string, location: string, price: string): Promise<string> => {
    if (!pushNotificationFunctions) {
      console.warn('Notification modules not available.');
      return 'modules-unavailable';
    }

    const notification = pushNotificationFunctions.NotificationTemplates.propertyAlert(propertyName, location, price);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send price reduction alert
  const sendPriceReductionAlert = useCallback(async (propertyName: string, oldPrice: string, newPrice: string): Promise<string> => {
    if (!pushNotificationFunctions) {
      console.warn('Notification modules not available.');
      return 'modules-unavailable';
    }

    const notification = pushNotificationFunctions.NotificationTemplates.priceReduction(propertyName, oldPrice, newPrice);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Setup notification listeners
  useEffect(() => {
    if (!state.isInitialized || !pushNotificationFunctions) return;

    // Listen for notifications received while app is in foreground
    const notificationReceivedSubscription = pushNotificationFunctions.addNotificationReceivedListener(
      (notification: any) => {
        console.log('Notification received:', notification);
        // You can show in-app notification here
      }
    );

    // Listen for notification responses (user tapped notification)
    const notificationResponseSubscription = pushNotificationFunctions.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log('Notification response:', response);
        pushNotificationFunctions.handleNotificationAction(
          response.actionIdentifier,
          response.notification,
          response.userText
        );
      }
    );

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [state.isInitialized]);

  // Auto-initialize when user is available
  useEffect(() => {
    if (user && !state.isInitialized) {
      initialize();
    }
  }, [user, state.isInitialized, initialize]);

  return {
    ...state,
    initialize,
    sendNotification: sendNotificationHandler,
    cancelNotification: cancelNotificationHandler,
    cancelAllNotifications: cancelAllNotificationsHandler,
    refreshPendingNotifications,
    clearBadge: clearBadgeHandler,
    setBadgeCount: setBadgeCountHandler,
    scheduleBookingReminder,
    scheduleReviewRequest,
    sendBookingConfirmation,
    sendNewMessageNotification,
    sendPropertyAlert,
    sendPriceReductionAlert
  };
}

// Convenience hook for notification permissions
export function useNotificationPermissions() {
  const [permissions, setPermissions] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    try {
      setLoading(true);
      if (!Notifications) {
        setPermissions('denied');
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();
      setPermissions(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setPermissions('denied');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!Notifications) {
        setPermissions('denied');
        return false;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissions(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setPermissions('denied');
      return false;
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    loading,
    requestPermissions,
    checkPermissions,
    hasPermissions: permissions === 'granted'
  };
}
