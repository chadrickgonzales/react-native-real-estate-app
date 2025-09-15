import { useGlobalContext } from '@/lib/global-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface NotificationSettings {
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  bookingUpdates: boolean
  priceAlerts: boolean
  newProperties: boolean
  promotionalOffers: boolean
  securityAlerts: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
}

const NotificationItem = ({ 
  title, 
  description, 
  value, 
  onValueChange, 
  icon 
}: {
  title: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
  icon: string
}) => (
  <View className="flex-row items-center justify-between py-4 px-2">
    <View className="flex-row items-center flex-1">
      <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#0061FF" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-rubik-bold text-black-300 mb-1">{title}</Text>
        <Text className="text-sm font-rubik text-black-200">{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E5E7EB', true: '#0061FF' }}
      thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
    />
  </View>
)

export default function NotificationsSettings() {
  const { user } = useGlobalContext()
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    bookingUpdates: true,
    priceAlerts: true,
    newProperties: false,
    promotionalOffers: false,
    securityAlerts: true,
    weeklyDigest: true,
    marketingEmails: false
  })

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // Implement save to backend
    Alert.alert('Success', 'Notification settings saved successfully!')
  }

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          setSettings({
            pushNotifications: true,
            emailNotifications: true,
            smsNotifications: false,
            bookingUpdates: true,
            priceAlerts: true,
            newProperties: false,
            promotionalOffers: false,
            securityAlerts: true,
            weeklyDigest: true,
            marketingEmails: false
          })
          Alert.alert('Success', 'Settings reset to default!')
        }}
      ]
    )
  }

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        {/* Header */}
        <View className="flex flex-row items-center justify-between mt-5 mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="#191D31" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-rubik-bold text-black-300">Notifications</Text>
          <View className="w-10" />
        </View>

        {/* Notification Overview */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <Text className="text-xl font-rubik-bold text-black-300 mb-4">Notification Preferences</Text>
          <Text className="text-sm font-rubik text-black-200 mb-4">
            Customize how you receive notifications about bookings, updates, and offers.
          </Text>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm font-rubik-medium text-black-300">
              {Object.values(settings).filter(Boolean).length} of {Object.keys(settings).length} notifications enabled
            </Text>
          </View>
        </View>

        {/* General Notifications */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">General Notifications</Text>
          <View className="space-y-2">
            <NotificationItem
              title="Push Notifications"
              description="Receive push notifications on your device"
              value={settings.pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              icon="notifications-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <NotificationItem
              title="Email Notifications"
              description="Receive notifications via email"
              value={settings.emailNotifications}
              onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              icon="mail-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <NotificationItem
              title="SMS Notifications"
              description="Receive notifications via text message"
              value={settings.smsNotifications}
              onValueChange={(value) => handleSettingChange('smsNotifications', value)}
              icon="chatbubble-outline"
            />
          </View>
        </View>

        {/* Booking & Travel */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Booking & Travel</Text>
          <View className="space-y-2">
            <NotificationItem
              title="Booking Updates"
              description="Updates about your bookings and reservations"
              value={settings.bookingUpdates}
              onValueChange={(value) => handleSettingChange('bookingUpdates', value)}
              icon="calendar-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <NotificationItem
              title="Price Alerts"
              description="Alerts when prices drop for your favorite properties"
              value={settings.priceAlerts}
              onValueChange={(value) => handleSettingChange('priceAlerts', value)}
              icon="trending-down-outline"
            />
          </View>
        </View>

        {/* Property & Offers */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Properties & Offers</Text>
          <View className="space-y-2">
            <NotificationItem
              title="New Properties"
              description="Notifications about new properties in your area"
              value={settings.newProperties}
              onValueChange={(value) => handleSettingChange('newProperties', value)}
              icon="home-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <NotificationItem
              title="Promotional Offers"
              description="Special deals and promotional offers"
              value={settings.promotionalOffers}
              onValueChange={(value) => handleSettingChange('promotionalOffers', value)}
              icon="gift-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <NotificationItem
              title="Marketing Emails"
              description="Newsletters and marketing communications"
              value={settings.marketingEmails}
              onValueChange={(value) => handleSettingChange('marketingEmails', value)}
              icon="megaphone-outline"
            />
          </View>
        </View>

        {/* Security & Account */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Security & Account</Text>
          <View className="space-y-2">
            <NotificationItem
              title="Security Alerts"
              description="Important security notifications and account updates"
              value={settings.securityAlerts}
              onValueChange={(value) => handleSettingChange('securityAlerts', value)}
              icon="shield-checkmark-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <NotificationItem
              title="Weekly Digest"
              description="Weekly summary of your activity and recommendations"
              value={settings.weeklyDigest}
              onValueChange={(value) => handleSettingChange('weeklyDigest', value)}
              icon="newspaper-outline"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 mb-6">
          <TouchableOpacity
            className="bg-primary-300 py-4 rounded-xl active:bg-primary-400"
            onPress={handleSaveSettings}
          >
            <Text className="text-center text-white font-rubik-bold">Save Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-accent-100 py-4 rounded-xl active:bg-accent-200"
            onPress={handleResetToDefaults}
          >
            <Text className="text-center text-black-300 font-rubik-bold">Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View className="bg-accent-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="information-circle-outline" size={16} color="#0061FF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-rubik-bold text-black-300 mb-1">Notification Tips</Text>
              <Text className="text-sm font-rubik text-black-200">
                • You can change these settings anytime{'\n'}
                • Some notifications are required for account security{'\n'}
                • Email notifications will be sent to {user?.email}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
