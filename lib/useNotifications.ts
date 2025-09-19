import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useGlobalContext } from './global-provider';
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    cancelAllNotifications,
    cancelNotification,
    clearBadge,
    getPendingNotifications,
    handleNotificationAction,
    initializePushNotifications,
    NotificationData,
    NotificationTemplates,
    PushToken,
    sendLocalNotification,
    setBadgeCount
} from './push-notifications';

interface NotificationState {
  isInitialized: boolean;
  pushToken: PushToken | null;
  permissions: 'granted' | 'denied' | 'undetermined';
  pendingNotifications: Notifications.NotificationRequest[];
  badgeCount: number;
}

interface UseNotificationsReturn extends NotificationState {
  initialize: () => Promise<void>;
  sendNotification: (notification: NotificationData) => Promise<string>;
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

  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';
  
  // Initialize notifications
  const initialize = useCallback(async () => {
    try {
      // Check if we're in Expo Go and on Android
      if (isExpoGo && Platform.OS === 'android') {
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

      const pushToken = await initializePushNotifications();
      const { status } = await Notifications.getPermissionsAsync();
      const pending = await getPendingNotifications();
      
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
  }, [user, isExpoGo]);

  // Send notification
  const sendNotificationHandler = useCallback(async (notification: NotificationData): Promise<string> => {
    try {
      // Check if we're in Expo Go and on Android
      if (isExpoGo && Platform.OS === 'android') {
        console.warn('Push notifications are not supported in Expo Go on Android. Notification not sent.');
        return 'expo-go-limited';
      }

      const id = await sendLocalNotification(notification);
      await refreshPendingNotifications();
      return id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }, [isExpoGo]);

  // Cancel notification
  const cancelNotificationHandler = useCallback(async (id: string): Promise<void> => {
    try {
      await cancelNotification(id);
      await refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      throw error;
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotificationsHandler = useCallback(async (): Promise<void> => {
    try {
      await cancelAllNotifications();
      await refreshPendingNotifications();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
      throw error;
    }
  }, []);

  // Refresh pending notifications
  const refreshPendingNotifications = useCallback(async (): Promise<void> => {
    try {
      const pending = await getPendingNotifications();
      setState(prev => ({ ...prev, pendingNotifications: pending }));
    } catch (error) {
      console.error('Failed to refresh pending notifications:', error);
    }
  }, []);

  // Clear badge
  const clearBadgeHandler = useCallback(async (): Promise<void> => {
    try {
      await clearBadge();
      setState(prev => ({ ...prev, badgeCount: 0 }));
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }, []);

  // Set badge count
  const setBadgeCountHandler = useCallback(async (count: number): Promise<void> => {
    try {
      await setBadgeCount(count);
      setState(prev => ({ ...prev, badgeCount: count }));
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }, []);

  // Schedule booking reminder
  const scheduleBookingReminder = useCallback(async (propertyName: string, date: Date): Promise<string> => {
    // Schedule reminder 1 hour before the appointment
    const reminderTime = new Date(date.getTime() - 60 * 60 * 1000);
    const now = new Date();
    
    if (reminderTime <= now) {
      throw new Error('Cannot schedule reminder for past time');
    }

    const notification = NotificationTemplates.bookingReminder(
      propertyName,
      '1 hour'
    );
    
    notification.scheduledFor = reminderTime;
    
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Schedule review request
  const scheduleReviewRequest = useCallback(async (propertyName: string, delay: number = 24): Promise<string> => {
    const requestTime = new Date(Date.now() + delay * 60 * 60 * 1000); // delay in hours
    
    const notification = NotificationTemplates.reviewRequest(propertyName);
    notification.scheduledFor = requestTime;
    
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send booking confirmation
  const sendBookingConfirmation = useCallback(async (propertyName: string, date: string, time: string): Promise<string> => {
    const notification = NotificationTemplates.bookingConfirmed(propertyName, date, time);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send new message notification
  const sendNewMessageNotification = useCallback(async (senderName: string, message: string): Promise<string> => {
    const notification = NotificationTemplates.newMessage(senderName, message);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send property alert
  const sendPropertyAlert = useCallback(async (propertyName: string, location: string, price: string): Promise<string> => {
    const notification = NotificationTemplates.propertyAlert(propertyName, location, price);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Send price reduction alert
  const sendPriceReductionAlert = useCallback(async (propertyName: string, oldPrice: string, newPrice: string): Promise<string> => {
    const notification = NotificationTemplates.priceReduction(propertyName, oldPrice, newPrice);
    return await sendNotificationHandler(notification);
  }, [sendNotificationHandler]);

  // Setup notification listeners
  useEffect(() => {
    if (!state.isInitialized) return;

    // Listen for notifications received while app is in foreground
    const notificationReceivedSubscription = addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
        // You can show in-app notification here
      }
    );

    // Listen for notification responses (user tapped notification)
    const notificationResponseSubscription = addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('Notification response:', response);
        handleNotificationAction(
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
      const { status } = await Notifications.getPermissionsAsync();
      setPermissions(status);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissions(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
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
