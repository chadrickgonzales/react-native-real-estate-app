import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface CallNotificationData {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  chatId: string;
  propertyId: string;
  callType: 'incoming' | 'outgoing';
}

export class CallNotificationService {
  private static instance: CallNotificationService;
  private expoPushToken: string | null = null;

  static getInstance(): CallNotificationService {
    if (!CallNotificationService.instance) {
      CallNotificationService.instance = new CallNotificationService();
    }
    return CallNotificationService.instance;
  }

  async initialize(): Promise<string | null> {
    try {
      console.log('📞 Initializing call notification service...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('📞 ❌ Notification permissions not granted');
        return null;
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.expoPushToken = token.data;
        console.log('📞 ✅ Push token obtained:', this.expoPushToken);
        return this.expoPushToken;
      } else {
        console.log('📞 ❌ Must use physical device for push notifications');
        return null;
      }
    } catch (error) {
      console.error('📞 Error initializing call notifications:', error);
      return null;
    }
  }

  async sendCallNotification(
    toUserId: string,
    callData: CallNotificationData
  ): Promise<boolean> {
    try {
      console.log('📞 Sending call notification to user:', toUserId);
      console.log('📞 Call data:', callData);

      // For now, we'll use local notifications since we need a backend to send push notifications
      // In a real app, you'd send this to your backend which would then send the push notification
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📞 Incoming Call`,
          body: `${callData.callerName} is calling you`,
          data: callData,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'call',
        },
        trigger: null, // Show immediately
      });

      console.log('📞 ✅ Call notification sent locally');
      return true;
    } catch (error) {
      console.error('📞 Error sending call notification:', error);
      return false;
    }
  }

  async sendCallResponseNotification(
    toUserId: string,
    callId: string,
    response: 'answered' | 'declined' | 'missed'
  ): Promise<boolean> {
    try {
      console.log(`📞 Sending call ${response} notification to user:`, toUserId);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📞 Call ${response.charAt(0).toUpperCase() + response.slice(1)}`,
          body: `Call has been ${response}`,
          data: { callId, response },
          sound: response === 'answered' ? 'default' : null,
        },
        trigger: null,
      });

      console.log(`📞 ✅ Call ${response} notification sent`);
      return true;
    } catch (error) {
      console.error(`📞 Error sending call ${response} notification:`, error);
      return false;
    }
  }

  // Listen for notification responses (when user taps on notification)
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Listen for notifications received while app is in foreground
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Cancel a specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('📞 ✅ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('📞 Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('📞 ✅ All notifications cancelled');
    } catch (error) {
      console.error('📞 Error cancelling all notifications:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default CallNotificationService;
