import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    getNotificationSettings,
    updateNotificationSettings,
    type NotificationSettings
} from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";

const NotificationsSettings = () => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  // Get notification settings
  const { data: settings, loading: settingsLoading, refetch } = useAppwrite({
    fn: ({ userId }: { userId: string }) => getNotificationSettings(userId),
    params: { userId: user?.$id || "" },
    skip: !user?.$id,
  });

  const handleToggleSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user?.$id || !settings) return;

    setLoading(true);
    try {
      await updateNotificationSettings(user.$id, { [key]: value });
      await refetch({ userId: user.$id });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.$id || !settings) return;

    setLoading(true);
    try {
      await updateNotificationSettings(user.$id, settings);
      Alert.alert('Success', 'Notification settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const SettingRow = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    icon: string;
  }) => (
    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
          <Ionicons name={icon as any} size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-rubik-bold text-gray-900 mb-1">
            {title}
          </Text>
          <Text className="text-sm font-rubik text-gray-600">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
        thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
        disabled={loading}
      />
    </View>
  );

  if (settingsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0061FF" />
          <Text className="text-sm font-rubik text-gray-600 mt-2">Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="settings-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-rubik-bold text-gray-900 mt-4 mb-2">
            Settings Not Available
          </Text>
          <Text className="text-base font-rubik text-gray-600 text-center">
            Unable to load notification settings. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="w-10 h-10 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#191D31" />
          </View>
        </TouchableOpacity>
        <Text className="text-xl font-rubik-bold text-gray-900">Notification Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property Notifications */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            Property Notifications
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="Property Updates"
              description="Get notified when saved properties are updated"
              value={settings.propertyNotifications}
              onToggle={(value) => handleToggleSetting('propertyNotifications', value)}
              icon="home"
            />
            <SettingRow
              title="New Matches"
              description="Get notified about new properties matching your searches"
              value={settings.propertyNotifications}
              onToggle={(value) => handleToggleSetting('propertyNotifications', value)}
              icon="search"
            />
            <SettingRow
              title="Price Changes"
              description="Get notified when saved properties change price"
              value={settings.propertyNotifications}
              onToggle={(value) => handleToggleSetting('propertyNotifications', value)}
              icon="trending-up"
            />
          </View>
        </View>

        {/* Booking Notifications */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            Booking Notifications
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="Booking Updates"
              description="Get notified about booking status changes"
              value={settings.bookingNotifications}
              onToggle={(value) => handleToggleSetting('bookingNotifications', value)}
              icon="calendar"
            />
            <SettingRow
              title="Booking Reminders"
              description="Get reminded about upcoming bookings"
              value={settings.bookingNotifications}
              onToggle={(value) => handleToggleSetting('bookingNotifications', value)}
              icon="time"
            />
          </View>
        </View>

        {/* Communication Notifications */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            Communication
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="New Messages"
              description="Get notified about new messages from property owners"
              value={settings.communicationNotifications}
              onToggle={(value) => handleToggleSetting('communicationNotifications', value)}
              icon="chatbubble"
            />
            <SettingRow
              title="Message Responses"
              description="Get notified when someone responds to your messages"
              value={settings.communicationNotifications}
              onToggle={(value) => handleToggleSetting('communicationNotifications', value)}
              icon="chatbubbles"
            />
          </View>
        </View>

        {/* Location Notifications */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            Location & Discovery
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="Nearby Properties"
              description="Get notified about properties near your location"
              value={settings.locationNotifications}
              onToggle={(value) => handleToggleSetting('locationNotifications', value)}
              icon="location"
            />
            <SettingRow
              title="Market Updates"
              description="Get notified about market changes in your area"
              value={settings.locationNotifications}
              onToggle={(value) => handleToggleSetting('locationNotifications', value)}
              icon="trending-up"
            />
          </View>
        </View>

        {/* System Notifications */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            System & App
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="App Updates"
              description="Get notified about new features and updates"
              value={settings.systemNotifications}
              onToggle={(value) => handleToggleSetting('systemNotifications', value)}
              icon="settings"
            />
            <SettingRow
              title="Security Alerts"
              description="Get notified about account security updates"
              value={settings.systemNotifications}
              onToggle={(value) => handleToggleSetting('systemNotifications', value)}
              icon="shield"
            />
          </View>
        </View>

        {/* Engagement Notifications */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            Engagement & Tips
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="Tips & Suggestions"
              description="Get helpful tips to improve your property search"
              value={settings.engagementNotifications}
              onToggle={(value) => handleToggleSetting('engagementNotifications', value)}
              icon="bulb"
            />
            <SettingRow
              title="Profile Reminders"
              description="Get reminded to complete your profile"
              value={settings.engagementNotifications}
              onToggle={(value) => handleToggleSetting('engagementNotifications', value)}
              icon="person"
            />
          </View>
        </View>

        {/* Delivery Methods */}
        <View className="mt-6">
          <Text className="text-lg font-rubik-bold text-gray-900 px-4 mb-2">
            Delivery Methods
          </Text>
          <View className="bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
            <SettingRow
              title="Push Notifications"
              description="Receive notifications on your device"
              value={settings.pushNotifications}
              onToggle={(value) => handleToggleSetting('pushNotifications', value)}
              icon="phone-portrait"
            />
            <SettingRow
              title="Email Notifications"
              description="Receive notifications via email"
              value={settings.emailNotifications}
              onToggle={(value) => handleToggleSetting('emailNotifications', value)}
              icon="mail"
            />
          </View>
        </View>

        {/* Save Button */}
        <View className="px-4 py-6">
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl items-center"
            onPress={handleSaveAll}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-rubik-bold text-lg">Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="px-4 pb-8">
          <View className="bg-blue-50 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" className="mr-3 mt-1" />
              <View className="flex-1">
                <Text className="text-sm font-rubik-bold text-blue-900 mb-1">
                  Notification Preferences
                </Text>
                <Text className="text-sm font-rubik text-blue-800">
                  You can customize which notifications you receive. Turning off notifications 
                  for certain categories will help reduce notification fatigue while keeping 
                  you informed about the things that matter most to you.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsSettings;