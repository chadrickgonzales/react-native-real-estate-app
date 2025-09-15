import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const PolicySection = ({ title, content }: { title: string; content: string }) => (
  <View className="mb-6">
    <Text className="text-lg font-rubik-bold text-black-300 mb-3">{title}</Text>
    <Text className="text-sm font-rubik text-black-200 leading-6">{content}</Text>
  </View>
)

export default function PrivacyPolicy() {
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
          <Text className="text-xl font-rubik-bold text-black-300">Privacy Policy</Text>
          <View className="w-10" />
        </View>

        {/* Last Updated */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <Text className="text-lg font-rubik-bold text-black-300 mb-2">Privacy Policy</Text>
          <Text className="text-sm font-rubik text-black-200">
            Last updated: January 15, 2024
          </Text>
        </View>

        {/* Introduction */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Introduction"
            content="Welcome to Real Estate App. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our app and tell you about your privacy rights and how the law protects you."
          />
        </View>

        {/* Information We Collect */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Information We Collect"
            content="We may collect, use, store and transfer different kinds of personal data about you including:\n\n• Identity Data: Name, username, date of birth, gender\n• Contact Data: Email address, telephone numbers, address\n• Profile Data: Username, password, preferences, interests\n• Usage Data: Information about how you use our app\n• Marketing Data: Your preferences in receiving marketing communications\n• Technical Data: IP address, browser type, device information"
          />
        </View>

        {/* How We Use Your Information */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="How We Use Your Information"
            content="We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:\n\n• To provide and maintain our service\n• To notify you about changes to our service\n• To provide customer support\n• To gather analysis or valuable information so that we can improve our service\n• To monitor the usage of our service\n• To detect, prevent and address technical issues\n• To provide you with news, special offers and general information about our services"
          />
        </View>

        {/* Data Sharing */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Data Sharing and Disclosure"
            content="We may share your personal information in the following situations:\n\n• With Service Providers: We may share your personal information with service providers to monitor and analyze the use of our service\n• For Business Transfers: We may share or transfer your personal information in connection with any merger, sale of company assets, financing, or acquisition\n• With Your Consent: We may disclose your personal information for any other purpose with your consent\n• For Legal Requirements: We may disclose your personal information if required to do so by law or in response to valid requests by public authorities"
          />
        </View>

        {/* Data Security */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Data Security"
            content="We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use industry-standard encryption and security protocols to protect your data. However, no method of transmission over the internet or electronic storage is 100% secure."
          />
        </View>

        {/* Your Rights */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Your Legal Rights"
            content="Under certain circumstances, you have rights under data protection laws in relation to your personal data:\n\n• Request access to your personal data\n• Request correction of your personal data\n• Request erasure of your personal data\n• Object to processing of your personal data\n• Request restriction of processing your personal data\n• Request transfer of your personal data\n• Withdraw consent at any time"
          />
        </View>

        {/* Cookies */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Cookies and Tracking Technologies"
            content="We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
          />
        </View>

        {/* Third Party Services */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Third Party Services"
            content="Our service may contain links to other websites that are not operated by us. We strongly advise you to review the privacy policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services."
          />
        </View>

        {/* Children's Privacy */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Children's Privacy"
            content="Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us."
          />
        </View>

        {/* Changes to Policy */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <PolicySection
            title="Changes to This Privacy Policy"
            content="We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the 'last updated' date. You are advised to review this privacy policy periodically for any changes."
          />
        </View>

        {/* Contact Information */}
        <View className="bg-accent-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="mail-outline" size={16} color="#0061FF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-rubik-bold text-black-300 mb-1">Contact Us</Text>
              <Text className="text-sm font-rubik text-black-200">
                If you have any questions about this privacy policy, please contact us at:{'\n\n'}
                Email: privacy@realestateapp.com{'\n'}
                Phone: +1 (555) 123-4567{'\n'}
                Address: 123 Main Street, San Francisco, CA 94105
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
