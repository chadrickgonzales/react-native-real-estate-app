import images from '@/constants/images'
import { updateUserProfile } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function EditProfile() {
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    location: '',
    bio: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user, refetch } = useGlobalContext()

  // Initialize form data with current user data
  React.useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.userName.trim()) {
      Alert.alert('Error', 'Please enter your username')
      return false
    }
    if (formData.userName.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const result = await updateUserProfile({
        userId: user?.$id || '',
        profileData: {
          userName: formData.userName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
        }
      })

      if (result) {
        refetch()
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ])
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    )
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-base font-rubik-medium text-black-300">Cancel</Text>
          </TouchableOpacity>
          
          <Text className="text-lg font-rubik-bold text-black-300">Edit Profile</Text>
          
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <Text className={`text-base font-rubik-bold ${isLoading ? 'text-gray-400' : 'text-primary-300'}`}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Profile Picture Section */}
          <View className="flex items-center mt-8 mb-8">
            <View className="relative">
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.avatar}
                className="size-32 rounded-full"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 bg-primary-300 rounded-full p-2">
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-base font-rubik-medium text-primary-300 mt-3">
              Change Profile Picture
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Username *
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="person-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Enter your username"
                  placeholderTextColor="#8c8e98"
                  value={formData.userName}
                  onChangeText={(value) => handleInputChange('userName', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Phone Number
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="call-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#8c8e98"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Location
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="location-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Enter your city or area"
                  placeholderTextColor="#8c8e98"
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Bio (Optional)
              </Text>
              <View className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <TextInput
                  className="text-base font-rubik text-black-300 min-h-[100px]"
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#8c8e98"
                  value={formData.bio}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`mt-8 py-4 rounded-xl ${isLoading ? 'bg-primary-200' : 'bg-primary-300'}`}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-rubik-bold text-center">
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
