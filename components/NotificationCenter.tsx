import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type Notification
} from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ visible, onClose }: NotificationCenterProps) => {
  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  // Get user notifications
  const { data: notifications, loading, refetch } = useAppwrite({
    fn: ({ userId }: { userId: string }) => getUserNotifications(userId),
    params: { userId: user?.$id || "" },
    skip: !user?.$id,
  });

  const onRefresh = useCallback(async () => {
    if (user?.$id) {
      setRefreshing(true);
      await refetch({ userId: user.$id });
      setRefreshing(false);
    }
  }, [user?.$id, refetch]);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markNotificationAsRead(notification.$id);
        await refetch({ userId: user?.$id || "" });
      }

      // Handle navigation based on notification type and data
      if (notification.data) {
        const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
        
        switch (notification.type) {
          case 'property':
            if (data.propertyId) {
              router.push(`/properties/${data.propertyId}`);
              onClose();
            }
            break;
          case 'booking':
            if (data.bookingId) {
              router.push('/profilePages/my-bookings');
              onClose();
            }
            break;
          case 'communication':
            if (data.chatId) {
              router.push({
                pathname: '/chat-conversation',
                params: {
                  chatId: data.chatId,
                }
              });
              onClose();
            }
            break;
          case 'location':
            router.push('/(root)/(tabs)/explore');
            onClose();
            break;
          default:
            // For other types, just close the modal
            onClose();
        }
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.$id) return;
    
    try {
      await markAllNotificationsAsRead(user.$id);
      await refetch({ userId: user.$id });
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property':
        return 'home';
      case 'booking':
        return 'calendar';
      case 'communication':
        return 'chatbubble';
      case 'system':
        return 'settings';
      case 'location':
        return 'location';
      case 'engagement':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return '#EF4444'; // Red
    if (priority === 'medium') return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <Text className="text-xl font-rubik-bold text-gray-900">Notifications</Text>
            {unreadCount > 0 && (
              <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center ml-2">
                <Text className="text-white text-xs font-rubik-bold">{unreadCount}</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                className="mr-4"
              >
                <Text className="text-blue-600 font-rubik-medium">Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0061FF" />
            <Text className="text-sm font-rubik text-gray-600 mt-2">Loading notifications...</Text>
          </View>
        ) : notifications && notifications.length > 0 ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.$id}
                className={`p-4 border-b border-gray-100 ${
                  !notification.isRead ? 'bg-blue-50' : 'bg-white'
                }`}
                onPress={() => handleNotificationPress(notification)}
              >
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: getNotificationColor(notification.type, notification.priority) + '20' }}
                    >
                      <Ionicons 
                        name={getNotificationIcon(notification.type) as any} 
                        size={20} 
                        color={getNotificationColor(notification.type, notification.priority)} 
                      />
                    </View>
                    {!notification.isRead && (
                      <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-rubik-bold text-gray-900 mb-1">
                      {notification.title}
                    </Text>
                    <Text className="text-sm font-rubik text-gray-600 mb-2">
                      {notification.message}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-rubik text-gray-500">
                        {formatTime(notification.createdAt)}
                      </Text>
                      {notification.priority === 'high' && (
                        <View className="bg-red-100 px-2 py-1 rounded-full">
                          <Text className="text-xs font-rubik-bold text-red-600">High Priority</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="notifications-outline" size={80} color="#9CA3AF" />
            <Text className="text-xl font-rubik-bold text-gray-900 mt-4 mb-2">
              No Notifications
            </Text>
            <Text className="text-base font-rubik text-gray-600 text-center">
              You're all caught up! We'll notify you when there's something new.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default NotificationCenter;
