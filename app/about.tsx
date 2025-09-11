import { useGlobalContext } from '@/lib/global-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import {
    Alert,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const AboutItem = ({ 
  title, 
  description, 
  onPress, 
  icon,
  showArrow = true
}: {
  title: string
  description: string
  onPress: () => void
  icon: string
  showArrow?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-accent-50"
  >
    <View className="flex-row items-center flex-1">
      <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#0061FF" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-rubik-bold text-black-300 mb-1">{title}</Text>
        <Text className="text-sm font-rubik text-black-200">{description}</Text>
      </View>
    </View>
    {showArrow && (
      <View className="w-6 h-6 items-center justify-center">
        <Ionicons name="chevron-forward" size={16} color="#666876" />
      </View>
    )}
  </TouchableOpacity>
)

export default function About() {
  const { user } = useGlobalContext()

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy')
  }

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of Service page will be implemented here.')
  }

  const handleOpenWebsite = () => {
    Linking.openURL('https://example.com')
  }

  const handleOpenSocialMedia = (platform: string) => {
    const urls = {
      twitter: 'https://twitter.com/example',
      facebook: 'https://facebook.com/example',
      instagram: 'https://instagram.com/example',
      linkedin: 'https://linkedin.com/company/example'
    }
    Linking.openURL(urls[platform as keyof typeof urls])
  }

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Thank you for your feedback! This will open the app store.')
  }

  const handleShareApp = () => {
    Alert.alert('Share App', 'Share this app with your friends and family!')
  }

  const handleContactUs = () => {
    Alert.alert('Contact Us', 'Email: support@example.com\nPhone: +1 (555) 123-4567')
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
          <Text className="text-xl font-rubik-bold text-black-300">About</Text>
          <View className="w-10" />
        </View>

        {/* App Info */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-primary-300 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="home" size={40} color="white" />
            </View>
            <Text className="text-2xl font-rubik-bold text-black-300 mb-2">Real Estate App</Text>
            <Text className="text-sm font-rubik text-black-200">Version 1.0.0</Text>
          </View>
          <Text className="text-sm font-rubik text-black-200 text-center leading-6">
            Your trusted platform for finding and booking the perfect property. 
            We connect travelers with unique accommodations worldwide.
          </Text>
        </View>

        {/* App Information */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">App Information</Text>
          <View className="space-y-2">
            <AboutItem
              title="Privacy Policy"
              description="Learn how we protect your data"
              onPress={handlePrivacyPolicy}
              icon="shield-checkmark-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="Terms of Service"
              description="Read our terms and conditions"
              onPress={handleTermsOfService}
              icon="document-text-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="Website"
              description="Visit our official website"
              onPress={handleOpenWebsite}
              icon="globe-outline"
            />
          </View>
        </View>

        {/* Social Media */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Follow Us</Text>
          <View className="space-y-2">
            <AboutItem
              title="Twitter"
              description="@realestateapp"
              onPress={() => handleOpenSocialMedia('twitter')}
              icon="logo-twitter"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="Facebook"
              description="Real Estate App"
              onPress={() => handleOpenSocialMedia('facebook')}
              icon="logo-facebook"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="Instagram"
              description="@realestateapp"
              onPress={() => handleOpenSocialMedia('instagram')}
              icon="logo-instagram"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="LinkedIn"
              description="Real Estate App Company"
              onPress={() => handleOpenSocialMedia('linkedin')}
              icon="logo-linkedin"
            />
          </View>
        </View>

        {/* App Actions */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">App Actions</Text>
          <View className="space-y-2">
            <AboutItem
              title="Rate App"
              description="Rate us on the app store"
              onPress={handleRateApp}
              icon="star-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="Share App"
              description="Share with friends and family"
              onPress={handleShareApp}
              icon="share-outline"
            />
            <View className="h-px bg-gray-200 mx-4" />
            <AboutItem
              title="Contact Us"
              description="Get in touch with our team"
              onPress={handleContactUs}
              icon="mail-outline"
            />
          </View>
        </View>

        {/* Company Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Company Information</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-1">Company Name</Text>
              <Text className="text-sm font-rubik text-black-200">Real Estate App Inc.</Text>
            </View>
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-1">Founded</Text>
              <Text className="text-sm font-rubik text-black-200">2024</Text>
            </View>
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-1">Headquarters</Text>
              <Text className="text-sm font-rubik text-black-200">San Francisco, CA</Text>
            </View>
            <View>
              <Text className="text-sm font-rubik-medium text-black-300 mb-1">Mission</Text>
              <Text className="text-sm font-rubik text-black-200">
                To make property discovery and booking simple, secure, and enjoyable for everyone.
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Info */}
        <View className="bg-accent-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="information-circle-outline" size={16} color="#0061FF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-rubik-bold text-black-300 mb-1">Technical Information</Text>
              <Text className="text-sm font-rubik text-black-200">
                Built with React Native and Expo{'\n'}
                Backend powered by Appwrite{'\n'}
                Last updated: January 2024{'\n'}
                Minimum iOS: 13.0{'\n'}
                Minimum Android: API 21
              </Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View className="items-center py-4">
          <Text className="text-xs font-rubik text-black-200 text-center">
            © 2024 Real Estate App Inc.{'\n'}
            All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
