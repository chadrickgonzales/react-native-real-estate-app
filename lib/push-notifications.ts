import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
  priority?: 'low' | 'normal' | 'high' | 'max';
  sound?: boolean | string;
  vibrate?: boolean;
  badge?: number;
  scheduledFor?: Date;
  repeat?: 'daily' | 'weekly' | 'monthly';
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

// Initialize push notifications
export async function initializePushNotifications(): Promise<PushToken | null> {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId,
    });

    console.log('Push token obtained:', tokenData.data);

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    // Setup notification categories
    await setupNotificationCategories();

    return {
      token: tokenData.data,
      platform: Platform.OS as 'ios' | 'android',
      deviceId: Device.osInternalBuildId || 'unknown'
    };
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return null;
  }
}

// Setup Android notification channels
async function setupAndroidChannels(): Promise<void> {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });

  await Notifications.setNotificationChannelAsync('bookings', {
    name: 'Bookings',
    description: 'Booking confirmations and updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    description: 'Chat messages and communications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 150, 150, 150],
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('properties', {
    name: 'Properties',
    description: 'New property alerts and updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 200, 200],
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    description: 'Appointment and viewing reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 300, 300],
    sound: 'default',
  });
}

// Setup notification categories with actions
async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('booking', {
    identifier: 'booking',
    actions: [
      {
        identifier: 'view_booking',
        buttonTitle: 'View',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'cancel_booking',
        buttonTitle: 'Cancel',
        options: {
          isDestructive: true,
          opensAppToForeground: true,
        },
      },
    ],
  });

  await Notifications.setNotificationCategoryAsync('message', {
    identifier: 'message',
    actions: [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        textInput: {
          submitButtonTitle: 'Send',
          placeholder: 'Type your reply...',
        },
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'view_chat',
        buttonTitle: 'View Chat',
        options: {
          opensAppToForeground: true,
        },
      },
    ],
  });

  await Notifications.setNotificationCategoryAsync('property_alert', {
    identifier: 'property_alert',
    actions: [
      {
        identifier: 'view_property',
        buttonTitle: 'View',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'save_property',
        buttonTitle: 'Save',
        options: {
          opensAppToForeground: false,
        },
      },
    ],
  });
}

// Send local notification
export async function sendLocalNotification(notification: NotificationData): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        categoryIdentifier: notification.categoryId,
        sound: notification.sound !== false ? (notification.sound || 'default') : undefined,
        badge: notification.badge,
        priority: notification.priority === 'high' ? Notifications.AndroidImportance.HIGH : 
                notification.priority === 'max' ? Notifications.AndroidImportance.MAX :
                notification.priority === 'low' ? Notifications.AndroidImportance.LOW :
                Notifications.AndroidImportance.DEFAULT,
      },
      trigger: notification.scheduledFor ? {
        date: notification.scheduledFor,
        repeats: !!notification.repeat,
      } : null,
    });

    console.log('Local notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error sending local notification:', error);
    throw error;
  }
}

// Cancel notification
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

// Get pending notifications
export async function getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
}

// Clear notification badge
export async function clearBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

// Notification event listeners
export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

// Predefined notification templates
export const NotificationTemplates = {
  bookingConfirmed: (propertyName: string, date: string, time: string): NotificationData => ({
    title: 'Booking Confirmed! 🎉',
    body: `Your viewing for ${propertyName} is confirmed for ${date} at ${time}`,
    categoryId: 'booking',
    priority: 'high',
    data: { type: 'booking_confirmed', propertyName, date, time }
  }),

  bookingReminder: (propertyName: string, time: string): NotificationData => ({
    title: 'Viewing Reminder 📅',
    body: `Don't forget your viewing at ${propertyName} in ${time}`,
    categoryId: 'booking',
    priority: 'high',
    data: { type: 'booking_reminder', propertyName }
  }),

  newMessage: (senderName: string, message: string): NotificationData => ({
    title: `Message from ${senderName} 💬`,
    body: message,
    categoryId: 'message',
    priority: 'high',
    data: { type: 'new_message', senderName }
  }),

  propertyAlert: (propertyName: string, location: string, price: string): NotificationData => ({
    title: 'New Property Match! 🏠',
    body: `${propertyName} in ${location} for ${price} matches your preferences`,
    categoryId: 'property_alert',
    priority: 'normal',
    data: { type: 'property_alert', propertyName, location, price }
  }),

  priceReduction: (propertyName: string, oldPrice: string, newPrice: string): NotificationData => ({
    title: 'Price Drop Alert! 💰',
    body: `${propertyName} price reduced from ${oldPrice} to ${newPrice}`,
    categoryId: 'property_alert',
    priority: 'high',
    data: { type: 'price_reduction', propertyName, oldPrice, newPrice }
  }),

  reviewRequest: (propertyName: string): NotificationData => ({
    title: 'How was your visit? ⭐',
    body: `Please share your experience at ${propertyName}`,
    categoryId: 'default',
    priority: 'normal',
    data: { type: 'review_request', propertyName }
  })
};

// Schedule recurring notifications
export async function scheduleRecurringNotification(
  notification: NotificationData,
  interval: 'daily' | 'weekly' | 'monthly'
): Promise<string> {
  const trigger = {
    repeats: true,
    ...(interval === 'daily' && { seconds: 24 * 60 * 60 }),
    ...(interval === 'weekly' && { seconds: 7 * 24 * 60 * 60 }),
    ...(interval === 'monthly' && { seconds: 30 * 24 * 60 * 60 }),
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      categoryIdentifier: notification.categoryId,
      sound: notification.sound !== false ? (notification.sound || 'default') : undefined,
    },
    trigger,
  });

  return notificationId;
}

// Handle notification actions
export function handleNotificationAction(
  actionIdentifier: string,
  notification: Notifications.Notification,
  textInput?: string
): void {
  const { data } = notification.request.content;
  
  switch (actionIdentifier) {
    case 'view_booking':
      // Navigate to booking details
      console.log('Navigate to booking:', data);
      break;
    
    case 'cancel_booking':
      // Handle booking cancellation
      console.log('Cancel booking:', data);
      break;
    
    case 'reply':
      // Handle message reply
      console.log('Reply to message:', textInput, data);
      break;
    
    case 'view_chat':
      // Navigate to chat
      console.log('Navigate to chat:', data);
      break;
    
    case 'view_property':
      // Navigate to property details
      console.log('Navigate to property:', data);
      break;
    
    case 'save_property':
      // Save property to favorites
      console.log('Save property:', data);
      break;
    
    default:
      console.log('Unknown action:', actionIdentifier);
  }
}
