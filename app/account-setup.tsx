import { updateUserProfile } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AccountSetup() {
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    location: '',
    preferences: {
      propertyType: '',
      budget: '',
      bedrooms: '',
    },
    bio: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { user, refetch } = useGlobalContext()

  // Check if user needs to set username (Google OAuth users)
  const needsUsername = user && !user.userName && user.email
  const totalSteps = needsUsername ? 4 : 3

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateStep = (step: number) => {
    const adjustedStep = needsUsername ? step : step + 1
    
    switch (adjustedStep) {
      case 1: // Username step (only for Google OAuth users)
        if (!formData.userName.trim()) {
          Alert.alert('Error', 'Please enter a username')
          return false
        }
        if (formData.userName.length < 3) {
          Alert.alert('Error', 'Username must be at least 3 characters long')
          return false
        }
        return true
      case 2: // Contact information
        if (!formData.phoneNumber.trim()) {
          Alert.alert('Error', 'Please enter your phone number')
          return false
        }
        if (!formData.location.trim()) {
          Alert.alert('Error', 'Please enter your location')
          return false
        }
        return true
      case 3: // Property preferences
        if (!formData.preferences.propertyType) {
          Alert.alert('Error', 'Please select a property type')
          return false
        }
        if (!formData.preferences.budget) {
          Alert.alert('Error', 'Please enter your budget')
          return false
        }
        return true
      case 4: // Bio (optional)
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleCompleteSetup()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCompleteSetup = async () => {
    setIsLoading(true)
    try {
      const profileData: any = {
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        preferences: JSON.stringify(formData.preferences),
        bio: formData.bio,
        setupCompleted: true,
      }

      // Include username if it was collected (for Google OAuth users)
      if (needsUsername && formData.userName) {
        profileData.userName = formData.userName
      }

      const result = await updateUserProfile({
        userId: user?.$id || '',
        profileData
      })

      if (result) {
        refetch()
        Alert.alert('Success', 'Profile setup completed!', [
          { text: 'OK', onPress: () => router.push('/(root)/(tabs)') }
        ])
      }
    } catch (error: any) {
      console.error('Setup completion error:', error)
      Alert.alert('Error', 'Failed to complete setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderUsernameStep = () => (
    <View className="space-y-6">
      <View>
        <Text className="text-sm font-rubik-medium text-black-300 mb-2">
          Choose a Username
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
        <Text className="text-xs font-rubik text-black-200 mt-2">
          This will be displayed as your name in the app
        </Text>
      </View>
    </View>
  )

  const renderStep1 = () => (
    <View className="space-y-6">
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
    </View>
  )

  const renderStep2 = () => (
    <View className="space-y-6">
      <View>
        <Text className="text-sm font-rubik-medium text-black-300 mb-2">
          Property Type
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {['Apartment', 'House', 'Condo', 'Townhouse', 'Studio'].map((type) => (
            <TouchableOpacity
              key={type}
              className={`px-4 py-3 rounded-xl border ${
                formData.preferences.propertyType === type
                  ? 'bg-primary-300 border-primary-300'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => handleInputChange('preferences.propertyType', type)}
            >
              <Text
                className={`font-rubik-medium ${
                  formData.preferences.propertyType === type
                    ? 'text-white'
                    : 'text-black-300'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <Text className="text-sm font-rubik-medium text-black-300 mb-2">
          Budget Range
        </Text>
        <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
          <Ionicons name="wallet-outline" size={20} color="#666876" />
          <TextInput
            className="flex-1 ml-3 text-base font-rubik text-black-300"
            placeholder="e.g., $500,000 - $750,000"
            placeholderTextColor="#8c8e98"
            value={formData.preferences.budget}
            onChangeText={(value) => handleInputChange('preferences.budget', value)}
          />
        </View>
      </View>

      <View>
        <Text className="text-sm font-rubik-medium text-black-300 mb-2">
          Bedrooms
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {['1', '2', '3', '4', '5+'].map((bedrooms) => (
            <TouchableOpacity
              key={bedrooms}
              className={`px-4 py-3 rounded-xl border ${
                formData.preferences.bedrooms === bedrooms
                  ? 'bg-primary-300 border-primary-300'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => handleInputChange('preferences.bedrooms', bedrooms)}
            >
              <Text
                className={`font-rubik-medium ${
                  formData.preferences.bedrooms === bedrooms
                    ? 'text-white'
                    : 'text-black-300'
                }`}
              >
                {bedrooms}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View className="space-y-6">
      <View>
        <Text className="text-sm font-rubik-medium text-black-300 mb-2">
          Tell us about yourself (Optional)
        </Text>
        <View className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
          <TextInput
            className="text-base font-rubik text-black-300 min-h-[120px]"
            placeholder="Share a bit about yourself, your preferences, or what you're looking for in a home..."
            placeholderTextColor="#8c8e98"
            value={formData.bio}
            onChangeText={(value) => handleInputChange('bio', value)}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>
    </View>
  )

  const renderCurrentStep = () => {
    if (needsUsername) {
      switch (currentStep) {
        case 1:
          return renderUsernameStep()
        case 2:
          return renderStep1()
        case 3:
          return renderStep2()
        case 4:
          return renderStep3()
        default:
          return renderUsernameStep()
      }
    } else {
      switch (currentStep) {
        case 1:
          return renderStep1()
        case 2:
          return renderStep2()
        case 3:
          return renderStep3()
        default:
          return renderStep1()
      }
    }
  }

  const getStepTitle = () => {
    if (needsUsername) {
      switch (currentStep) {
        case 1:
          return 'Choose Username'
        case 2:
          return 'Contact Information'
        case 3:
          return 'Property Preferences'
        case 4:
          return 'About You'
        default:
          return 'Setup'
      }
    } else {
      switch (currentStep) {
        case 1:
          return 'Contact Information'
        case 2:
          return 'Property Preferences'
        case 3:
          return 'About You'
        default:
          return 'Setup'
      }
    }
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header */}
          <View className="mt-8 mb-8">
            <Text className="text-3xl font-rubik-bold text-black-300 text-center">
              Complete Your Profile
            </Text>
            <Text className="text-base font-rubik text-black-200 text-center mt-2">
              Help us personalize your experience
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-rubik-medium text-black-300">
                {getStepTitle()}
              </Text>
              <Text className="text-sm font-rubik text-black-200">
                {currentStep} of {totalSteps}
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full">
              <View
                className="h-2 bg-primary-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </View>
          </View>

          {/* Step Content */}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View className="flex-row justify-between mt-8">
            {currentStep > 1 && (
              <TouchableOpacity
                className="px-6 py-4 rounded-xl border border-gray-200"
                onPress={handleBack}
              >
                <Text className="text-base font-rubik-medium text-black-300">
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`px-6 py-4 rounded-xl ${
                isLoading ? 'bg-primary-200' : 'bg-primary-300'
              } ${currentStep === 1 ? 'ml-auto' : 'flex-1 ml-4'}`}
              onPress={handleNext}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-rubik-bold text-center">
                {isLoading
                  ? 'Completing...'
                  : currentStep === totalSteps
                  ? 'Complete Setup'
                  : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
