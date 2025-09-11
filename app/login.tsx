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
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        // Here you would typically handle the login logic
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => router.push('/(root)/(tabs)') }
        ])
      }, 1500)
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality would be implemented here.',
      [{ text: 'OK' }]
    )
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
          <View className="mt-12 mb-8">
            <Text className="text-3xl font-rubik-bold text-black-300 text-center">
              Welcome Back
            </Text>
            <Text className="text-base font-rubik text-black-200 text-center mt-2">
              Sign in to continue your journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
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
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={handleForgotPassword}
            className="self-end mt-2"
          >
            <Text className="text-primary-300 text-sm font-rubik-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`rounded-xl py-4 mt-6 shadow-lg ${
              isLoading 
                ? 'bg-black-100' 
                : 'bg-primary-300 shadow-primary-300/30'
            }`}
          >
            <Text className="text-white text-lg font-rubik-bold text-center">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-black-100" />
            <Text className="mx-4 text-black-200 font-rubik">or</Text>
            <View className="flex-1 h-px bg-black-100" />
          </View>

          {/* Social Login */}
          <TouchableOpacity className="bg-white border-2 border-black-100 rounded-xl py-4 flex-row items-center justify-center">
            <Ionicons name="logo-google" size={20} color="#0061ff" />
            <Text className="text-black-300 text-lg font-rubik-medium ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-black-200 font-rubik">
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/signin1" asChild>
              <TouchableOpacity>
                <Text className="text-primary-300 font-rubik-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Back to Home */}
          <View className="flex-row justify-center items-center mt-4">
            <Link href="/signin" asChild>
              <TouchableOpacity>
                <Text className="text-black-100 font-rubik text-sm">
                  ← Back to Welcome
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}