import { useGlobalContext } from '@/lib/global-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SecuritySettings {
  twoFactorAuth: boolean
  biometricAuth: boolean
  sessionTimeout: string
  loginAlerts: boolean
  deviceManagement: boolean
}

const SecurityItem = ({ 
  title, 
  description, 
  value, 
  onPress, 
  icon,
  showArrow = true,
  danger = false
}: {
  title: string
  description: string
  value?: string
  onPress: () => void
  icon: string
  showArrow?: boolean
  danger?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-accent-50"
  >
    <View className="flex-row items-center flex-1">
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${danger ? 'bg-red-100' : 'bg-primary-100'}`}>
        <Ionicons name={icon as any} size={20} color={danger ? '#EF4444' : '#0061FF'} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-rubik-bold mb-1 ${danger ? 'text-red-600' : 'text-black-300'}`}>
          {title}
        </Text>
        <Text className="text-sm font-rubik text-black-200">{description}</Text>
        {value && (
          <Text className="text-sm font-rubik-medium text-primary-300 mt-1">{value}</Text>
        )}
      </View>
    </View>
    {showArrow && (
      <View className="w-6 h-6 items-center justify-center">
        <Ionicons name="chevron-forward" size={16} color="#666876" />
      </View>
    )}
  </TouchableOpacity>
)

export default function SecuritySettings() {
  const { user } = useGlobalContext()
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    biometricAuth: true,
    sessionTimeout: '30 minutes',
    loginAlerts: true,
    deviceManagement: true
  })

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleTwoFactorAuth = () => {
    Alert.alert(
      'Two-Factor Authentication',
      settings.twoFactorAuth 
        ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
        : 'Two-factor authentication adds an extra layer of security to your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: settings.twoFactorAuth ? 'Disable' : 'Enable', onPress: () => {
          setSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))
          Alert.alert('Success', `Two-factor authentication ${settings.twoFactorAuth ? 'disabled' : 'enabled'}!`)
        }}
      ]
    )
  }

  const handleBiometricAuth = () => {
    Alert.alert(
      'Biometric Authentication',
      settings.biometricAuth 
        ? 'Are you sure you want to disable biometric authentication?'
        : 'Enable biometric authentication for quick and secure access.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: settings.biometricAuth ? 'Disable' : 'Enable', onPress: () => {
          setSettings(prev => ({ ...prev, biometricAuth: !prev.biometricAuth }))
          Alert.alert('Success', `Biometric authentication ${settings.biometricAuth ? 'disabled' : 'enabled'}!`)
        }}
      ]
    )
  }

  const handleSessionTimeout = () => {
    Alert.alert(
      'Session Timeout',
      'Choose how long you want to stay logged in:',
      [
        { text: '15 minutes', onPress: () => setSettings(prev => ({ ...prev, sessionTimeout: '15 minutes' })) },
        { text: '30 minutes', onPress: () => setSettings(prev => ({ ...prev, sessionTimeout: '30 minutes' })) },
        { text: '1 hour', onPress: () => setSettings(prev => ({ ...prev, sessionTimeout: '1 hour' })) },
        { text: 'Never', onPress: () => setSettings(prev => ({ ...prev, sessionTimeout: 'Never' })) },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long')
      return
    }

    // Implement password change logic
    Alert.alert('Success', 'Password changed successfully!')
    setShowChangePassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLoginAlerts = () => {
    setSettings(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))
    Alert.alert('Success', `Login alerts ${settings.loginAlerts ? 'disabled' : 'enabled'}!`)
  }

  const handleDeviceManagement = () => {
    Alert.alert('Device Management', 'This feature will show all devices logged into your account.')
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Account Deletion', 'Account deletion request submitted. You will receive an email confirmation.')
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
          <Text className="text-xl font-rubik-bold text-black-300">Security</Text>
          <View className="w-10" />
        </View>

        {/* Security Overview */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <Text className="text-xl font-rubik-bold text-black-300 mb-4">Security Overview</Text>
          <Text className="text-sm font-rubik text-black-200 mb-4">
            Manage your account security settings and privacy preferences.
          </Text>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm font-rubik-medium text-black-300">
              Account security is active
            </Text>
          </View>
        </View>

        {/* Authentication */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Authentication</Text>
          <View className="space-y-2">
            <SecurityItem
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
              onPress={handleTwoFactorAuth}
              icon="shield-checkmark-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <SecurityItem
              title="Biometric Authentication"
              description="Use fingerprint or face recognition to sign in"
              value={settings.biometricAuth ? 'Enabled' : 'Disabled'}
              onPress={handleBiometricAuth}
              icon="finger-print-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <SecurityItem
              title="Change Password"
              description="Update your account password"
              onPress={() => setShowChangePassword(true)}
              icon="key-outline"
            />
          </View>
        </View>

        {/* Change Password Modal */}
        {showChangePassword && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-rubik-bold text-black-300 mb-4">Change Password</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-rubik-medium text-black-300 mb-2">Current Password</Text>
                <TextInput
                  className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200"
                  placeholder="Enter current password"
                  placeholderTextColor="#8c8e98"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>
              <View>
                <Text className="text-sm font-rubik-medium text-black-300 mb-2">New Password</Text>
                <TextInput
                  className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200"
                  placeholder="Enter new password"
                  placeholderTextColor="#8c8e98"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View>
                <Text className="text-sm font-rubik-medium text-black-300 mb-2">Confirm New Password</Text>
                <TextInput
                  className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200"
                  placeholder="Confirm new password"
                  placeholderTextColor="#8c8e98"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-accent-100 py-3 rounded-xl active:bg-accent-200"
                  onPress={() => setShowChangePassword(false)}
                >
                  <Text className="text-center text-black-300 font-rubik-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary-300 py-3 rounded-xl active:bg-primary-400"
                  onPress={handleChangePassword}
                >
                  <Text className="text-center text-white font-rubik-bold">Change Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Privacy & Sessions */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Privacy & Sessions</Text>
          <View className="space-y-2">
            <SecurityItem
              title="Session Timeout"
              description="Automatically sign out after inactivity"
              value={settings.sessionTimeout}
              onPress={handleSessionTimeout}
              icon="time-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <SecurityItem
              title="Login Alerts"
              description="Get notified when someone signs into your account"
              value={settings.loginAlerts ? 'Enabled' : 'Disabled'}
              onPress={handleLoginAlerts}
              icon="notifications-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <SecurityItem
              title="Device Management"
              description="View and manage devices signed into your account"
              onPress={handleDeviceManagement}
              icon="phone-portrait-outline"
            />
          </View>
        </View>

        {/* Account Actions */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Account Actions</Text>
          <View className="space-y-2">
            <SecurityItem
              title="Download Data"
              description="Download a copy of your account data"
              onPress={() => Alert.alert('Download Data', 'Data download request submitted. You will receive an email when ready.')}
              icon="download-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <SecurityItem
              title="Delete Account"
              description="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              icon="trash-outline"
              danger={true}
            />
          </View>
        </View>

        {/* Security Tips */}
        <View className="bg-accent-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="information-circle-outline" size={16} color="#0061FF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-rubik-bold text-black-300 mb-1">Security Tips</Text>
              <Text className="text-sm font-rubik text-black-200">
                • Use a strong, unique password{'\n'}
                • Enable two-factor authentication{'\n'}
                • Keep your app updated{'\n'}
                • Don't share your login credentials
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
