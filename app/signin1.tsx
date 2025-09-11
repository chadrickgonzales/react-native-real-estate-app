import icons from "@/constants/icons"
import { login, signUp } from "@/lib/appwrite"
import { useGlobalContext } from "@/lib/global-provider"
import { Ionicons } from '@expo/vector-icons'
import { Link, Redirect, router } from 'expo-router'
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

export default function Signin1() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return false
    }
    return true
  }

  const handleSignUp = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })

      if (result) {
        // Refetch user data to update global state
        refetch()
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.push('/(root)/(tabs)') }
        ])
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      let errorMessage = 'Failed to create account. Please try again.'
      
      // Handle specific Appwrite errors
      if (error.message?.includes('email')) {
        errorMessage = 'An account with this email already exists.'
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password does not meet requirements.'
      } else if (error.message?.includes('name')) {
        errorMessage = 'Please enter a valid name.'
      }
      
      Alert.alert('Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }


  const { refetch, loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleLogin = async () => {
    const result = await login();
    if (result) {
      refetch();
    } else {
      Alert.alert("Error", "Failed to login");
    }
  };

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
              Join us and find your dream home
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Name Input */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Full Name
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="person-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Enter your full name"
                  placeholderTextColor="#8c8e98"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
              </View>
            </View>

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

            {/* Confirm Password Input */}
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#666876" />
                <TextInput
                  className="flex-1 ml-3 text-base font-rubik text-black-300"
                  placeholder="Confirm your password"
                  placeholderTextColor="#8c8e98"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666876" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`mt-8 py-4 rounded-xl ${
              isLoading ? 'bg-primary-200' : 'bg-primary-300'
            }`}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text className="text-white text-lg font-rubik-bold text-center">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <Text className="text-xs font-rubik text-black-200 text-center mt-4 px-4">
            By creating an account, you agree to our{' '}
            <Text className="text-primary-300">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-primary-300">Privacy Policy</Text>
          </Text>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-base font-rubik text-black-200">
              Already have an account?{' '}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-base font-rubik-bold text-primary-300">
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
