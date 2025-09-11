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

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return false
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password')
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      // TODO: Implement actual login logic here
      console.log('Login data:', formData)
      Alert.alert('Success', 'Login successful!', [
        { text: 'OK', onPress: () => router.push('/(root)/(tabs)') }
      ])
    } catch {
      Alert.alert('Error', 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented here.',
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
          <View className="mt-8 mb-8">
            <Text className="text-3xl font-rubik-bold text-black-300 text-center">
              Welcome Back
            </Text>
            <Text className="text-base font-rubik text-black-200 text-center mt-2">
              Sign in to continue your journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Enter your email"
                  placeholderTextColor="#8c8e98"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Enter your password"
                  placeholderTextColor="#8c8e98"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666876" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                rememberMe ? 'bg-primary-300 border-primary-300' : 'border-gray-300'
              }`}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
              <Text className="text-sm font-rubik text-black-200">
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-sm font-rubik-medium text-primary-300">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className={`mt-8 py-4 rounded-xl ${
              isLoading ? 'bg-primary-200' : 'bg-primary-300'
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-rubik-bold text-center">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mt-8 mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-sm font-rubik text-black-200">
              Or continue with
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login Buttons */}
          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center justify-center py-4 rounded-xl border border-gray-200 bg-white">
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text className="ml-3 text-base font-rubik-medium text-black-300">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center py-4 rounded-xl border border-gray-200 bg-white">
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text className="ml-3 text-base font-rubik-medium text-black-300">
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-base font-rubik text-black-200">
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/signin1" asChild>
              <TouchableOpacity>
                <Text className="text-base font-rubik-bold text-primary-300">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}