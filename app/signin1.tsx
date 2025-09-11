import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
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

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function Signin1() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = () => {
    if (validateForm()) {
      // Here you would typically handle the signup logic
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.push('/login') }
      ])
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
              Create Account
            </Text>
            <Text className="text-base font-rubik text-black-200 text-center mt-2">
              Join us and find your perfect home
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Name Field */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Full Name
              </Text>
              <View className="relative">
                <TextInput
                  className={`bg-accent-100 border-2 rounded-xl px-4 py-4 text-base font-rubik ${
                    errors.name ? 'border-danger' : 'border-transparent'
                  }`}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8c8e98"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                />
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color="#8c8e98" 
                  className="absolute right-4 top-4"
                />
              </View>
              {errors.name && (
                <Text className="text-danger text-sm font-rubik mt-1">
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Email Field */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Email Address
              </Text>
              <View className="relative">
                <TextInput
                  className={`bg-accent-100 border-2 rounded-xl px-4 py-4 text-base font-rubik ${
                    errors.email ? 'border-danger' : 'border-transparent'
                  }`}
                  placeholder="Enter your email"
                  placeholderTextColor="#8c8e98"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                />
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#8c8e98" 
                  className="absolute right-4 top-4"
                />
              </View>
              {errors.email && (
                <Text className="text-danger text-sm font-rubik mt-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password Field */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className={`bg-accent-100 border-2 rounded-xl px-4 py-4 text-base font-rubik pr-12 ${
                    errors.password ? 'border-danger' : 'border-transparent'
                  }`}
                  placeholder="Enter your password"
                  placeholderTextColor="#8c8e98"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#8c8e98" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-danger text-sm font-rubik mt-1">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Confirm Password
              </Text>
              <View className="relative">
                <TextInput
                  className={`bg-accent-100 border-2 rounded-xl px-4 py-4 text-base font-rubik pr-12 ${
                    errors.confirmPassword ? 'border-danger' : 'border-transparent'
                  }`}
                  placeholder="Confirm your password"
                  placeholderTextColor="#8c8e98"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#8c8e98" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-danger text-sm font-rubik mt-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-primary-300 rounded-xl py-4 mt-8 shadow-lg shadow-primary-300/30"
          >
            <Text className="text-white text-lg font-rubik-bold text-center">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-black-100" />
            <Text className="mx-4 text-black-200 font-rubik">or</Text>
            <View className="flex-1 h-px bg-black-100" />
          </View>

          {/* Social Sign Up */}
          <TouchableOpacity className="bg-white border-2 border-black-100 rounded-xl py-4 flex-row items-center justify-center">
            <Ionicons name="logo-google" size={20} color="#0061ff" />
            <Text className="text-black-300 text-lg font-rubik-medium ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-black-200 font-rubik">
              Already have an account?{' '}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary-300 font-rubik-bold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
