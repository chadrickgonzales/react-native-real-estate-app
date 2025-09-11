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

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I book a property?',
    answer: 'To book a property, browse our listings, select your desired dates, and click "Book Now". You\'ll be guided through the booking process with payment options.',
    category: 'Booking'
  },
  {
    id: '2',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking through the "My Bookings" section. Cancellation policies vary by property and are displayed during booking.',
    category: 'Booking'
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers. Payment methods can be managed in your account settings.',
    category: 'Payment'
  },
  {
    id: '4',
    question: 'How do I contact property owners?',
    answer: 'You can contact property owners through our messaging system after booking. Contact information is provided in your booking confirmation.',
    category: 'Communication'
  },
  {
    id: '5',
    question: 'What if I have issues with my stay?',
    answer: 'Contact our 24/7 support team immediately. We\'ll work with the property owner to resolve any issues during your stay.',
    category: 'Support'
  },
  {
    id: '6',
    question: 'How do I update my profile?',
    answer: 'Go to your profile page and tap "Edit Profile" to update your information, including contact details and preferences.',
    category: 'Account'
  }
]

const FAQCard = ({ faq, isExpanded, onToggle }: { 
  faq: FAQItem
  isExpanded: boolean
  onToggle: () => void 
}) => (
  <View className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100">
    <TouchableOpacity
      onPress={onToggle}
      className="p-6 flex-row items-center justify-between"
    >
      <View className="flex-1 mr-4">
        <Text className="text-base font-rubik-bold text-black-300 mb-1">{faq.question}</Text>
        <Text className="text-sm font-rubik text-black-200">{faq.category}</Text>
      </View>
      <Ionicons 
        name={isExpanded ? "chevron-up" : "chevron-down"} 
        size={20} 
        color="#666876" 
      />
    </TouchableOpacity>
    {isExpanded && (
      <View className="px-6 pb-6">
        <View className="h-px bg-gray-200 mb-4" />
        <Text className="text-sm font-rubik text-black-200 leading-6">{faq.answer}</Text>
      </View>
    )}
  </View>
)

const ContactMethod = ({ 
  title, 
  description, 
  icon, 
  onPress 
}: {
  title: string
  description: string
  icon: string
  onPress: () => void
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100 active:bg-accent-50"
  >
    <View className="flex-row items-center">
      <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon as any} size={24} color="#0061FF" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-rubik-bold text-black-300 mb-1">{title}</Text>
        <Text className="text-sm font-rubik text-black-200">{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666876" />
    </View>
  </TouchableOpacity>
)

export default function HelpSupport() {
  const { user } = useGlobalContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [contactMessage, setContactMessage] = useState('')

  const categories = ['All', 'Booking', 'Payment', 'Communication', 'Support', 'Account']

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Connecting you to our support team...')
  }

  const handleEmailSupport = () => {
    Alert.alert('Email Support', 'Opening email client to contact support...')
  }

  const handlePhoneSupport = () => {
    Alert.alert('Phone Support', 'Calling our support line: +1 (555) 123-4567')
  }

  const handleSubmitFeedback = () => {
    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Please enter your message')
      return
    }
    Alert.alert('Success', 'Your feedback has been submitted. Thank you!')
    setContactMessage('')
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
          <Text className="text-xl font-rubik-bold text-black-300">Help & Support</Text>
          <View className="w-10" />
        </View>

        {/* Support Overview */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <Text className="text-xl font-rubik-bold text-black-300 mb-4">How can we help you?</Text>
          <Text className="text-sm font-rubik text-black-200 mb-4">
            Find answers to common questions or contact our support team for assistance.
          </Text>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm font-rubik-medium text-black-300">
              Support available 24/7
            </Text>
          </View>
        </View>

        {/* Search */}
        <View className="mb-6">
          <View className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="search-outline" size={20} color="#666876" />
              <TextInput
                className="flex-1 ml-3 text-base font-rubik text-black-300"
                placeholder="Search for help..."
                placeholderTextColor="#8c8e98"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {/* Contact Methods */}
        <View className="mb-6">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Contact Support</Text>
          <ContactMethod
            title="Live Chat"
            description="Chat with our support team in real-time"
            icon="chatbubbles-outline"
            onPress={handleLiveChat}
          />
          <ContactMethod
            title="Email Support"
            description="Send us an email and we'll respond within 24 hours"
            icon="mail-outline"
            onPress={handleEmailSupport}
          />
          <ContactMethod
            title="Phone Support"
            description="Call us for immediate assistance"
            icon="call-outline"
            onPress={handlePhoneSupport}
          />
        </View>

        {/* FAQ Categories */}
        <View className="mb-6">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Frequently Asked Questions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-3 rounded-full mr-3 ${
                  selectedCategory === category
                    ? 'bg-primary-300'
                    : 'bg-accent-100 border border-gray-200'
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  className={`text-sm font-rubik-medium ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'text-black-300'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View className="mb-6">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                isExpanded={expandedFAQ === faq.id}
                onToggle={() => handleFAQToggle(faq.id)}
              />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Text className="text-center text-black-300 font-rubik-medium">
                No FAQs found for your search.
              </Text>
            </View>
          )}
        </View>

        {/* Feedback Form */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Send Feedback</Text>
          <Text className="text-sm font-rubik text-black-200 mb-4">
            Help us improve by sharing your feedback or reporting issues.
          </Text>
          <View className="mb-4">
            <TextInput
              className="bg-accent-100 rounded-xl px-4 py-4 border border-gray-200"
              placeholder="Tell us how we can help..."
              placeholderTextColor="#8c8e98"
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <TouchableOpacity
            className="bg-primary-300 py-4 rounded-xl active:bg-primary-400"
            onPress={handleSubmitFeedback}
          >
            <Text className="text-center text-white font-rubik-bold">Send Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Resources */}
        <View className="bg-accent-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-3 mt-1">
              <Ionicons name="information-circle-outline" size={16} color="#0061FF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-rubik-bold text-black-300 mb-1">Additional Resources</Text>
              <Text className="text-sm font-rubik text-black-200">
                • Check our Terms of Service and Privacy Policy{'\n'}
                • Visit our community forum for tips and discussions{'\n'}
                • Follow us on social media for updates and announcements
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
