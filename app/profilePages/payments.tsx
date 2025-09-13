import images from '@/constants/images'
import { useGlobalContext } from '@/lib/global-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock payment data - replace with actual API calls
const mockPayments = [
  {
    id: '1',
    bookingId: 'booking1',
    propertyName: 'Modern Downtown Apartment',
    amount: 1200,
    status: 'completed',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    paymentDate: '2024-01-10',
    transactionId: 'txn_123456789',
    type: 'booking_payment'
  },
  {
    id: '2',
    bookingId: 'booking2',
    propertyName: 'Luxury Villa with Pool',
    amount: 2800,
    status: 'pending',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    paymentDate: '2024-01-25',
    transactionId: 'txn_987654321',
    type: 'booking_payment'
  },
  {
    id: '3',
    bookingId: 'booking3',
    propertyName: 'Cozy Studio in City Center',
    amount: 450,
    status: 'completed',
    paymentMethod: 'PayPal',
    cardLast4: null,
    paymentDate: '2023-12-20',
    transactionId: 'txn_456789123',
    type: 'booking_payment'
  },
  {
    id: '4',
    bookingId: null,
    propertyName: 'Security Deposit Refund',
    amount: -500,
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    cardLast4: null,
    paymentDate: '2024-01-12',
    transactionId: 'txn_refund_789',
    type: 'refund'
  }
]

const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit_card',
    cardNumber: '**** **** **** 4242',
    expiryDate: '12/26',
    cardholderName: 'John Doe',
    isDefault: true,
    brand: 'visa'
  },
  {
    id: '2',
    type: 'credit_card',
    cardNumber: '**** **** **** 5555',
    expiryDate: '08/25',
    cardholderName: 'John Doe',
    isDefault: false,
    brand: 'mastercard'
  },
  {
    id: '3',
    type: 'paypal',
    email: 'john.doe@example.com',
    isDefault: false,
    brand: 'paypal'
  }
]

interface Payment {
  id: string
  bookingId: string | null
  propertyName: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  paymentMethod: string
  cardLast4: string | null
  paymentDate: string
  transactionId: string
  type: 'booking_payment' | 'refund' | 'deposit'
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'paypal' | 'bank_transfer'
  cardNumber?: string
  expiryDate?: string
  cardholderName?: string
  email?: string
  isDefault: boolean
  brand: string
}

const PaymentCard = ({ payment }: { payment: Payment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle'
      case 'pending': return 'time'
      case 'failed': return 'close-circle'
      case 'refunded': return 'refresh-circle'
      default: return 'help-circle'
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card': return 'card'
      case 'paypal': return 'logo-paypal'
      case 'bank transfer': return 'business'
      default: return 'card'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0
    const absAmount = Math.abs(amount)
    return `${isNegative ? '-' : ''}$${absAmount}`
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
            <Ionicons name={getPaymentIcon(payment.paymentMethod) as any} size={20} color="#0061FF" />
          </View>
          <View>
            <Text className="text-base font-rubik-bold text-black-300">{payment.propertyName}</Text>
            <Text className="text-sm font-rubik text-black-200">
              {payment.paymentMethod} {payment.cardLast4 && `****${payment.cardLast4}`}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(payment.status)}`}>
          <Ionicons name={getStatusIcon(payment.status) as any} size={12} color="currentColor" />
          <Text className="text-xs font-rubik-bold ml-1 capitalize">{payment.status}</Text>
        </View>
      </View>

      {/* Payment Details */}
      <View className="bg-accent-50 rounded-xl p-3 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-rubik-medium text-black-200">Amount</Text>
          <Text className={`text-lg font-rubik-bold ${payment.amount < 0 ? 'text-green-600' : 'text-primary-300'}`}>
            {formatAmount(payment.amount)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-rubik-medium text-black-200">Date</Text>
          <Text className="text-sm font-rubik-bold text-black-300">{formatDate(payment.paymentDate)}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-rubik-medium text-black-200">Transaction ID</Text>
          <Text className="text-sm font-rubik-bold text-black-300">{payment.transactionId}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <TouchableOpacity className="flex-1 bg-primary-100 py-3 rounded-xl">
          <Text className="text-center text-primary-300 font-rubik-bold">View Receipt</Text>
        </TouchableOpacity>
        {payment.bookingId && (
          <TouchableOpacity 
            className="flex-1 bg-accent-100 py-3 rounded-xl"
            onPress={() => router.push(`/properties/${payment.bookingId}`)}
          >
            <Text className="text-center text-black-300 font-rubik-bold">View Property</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const PaymentMethodCard = ({ method }: { method: PaymentMethod }) => {
  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return 'card'
      case 'mastercard': return 'card'
      case 'paypal': return 'logo-paypal'
      default: return 'card'
    }
  }

  const handleSetDefault = () => {
    Alert.alert('Set Default', 'Set as default payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Set Default', onPress: () => {
        Alert.alert('Success', 'Payment method set as default!')
      }}
    ])
  }

  const handleRemove = () => {
    Alert.alert('Remove Payment Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        Alert.alert('Success', 'Payment method removed!')
      }}
    ])
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-4">
            <Ionicons name={getBrandIcon(method.brand) as any} size={24} color="#0061FF" />
          </View>
          <View className="flex-1">
            {method.type === 'credit_card' ? (
              <>
                <Text className="text-base font-rubik-bold text-black-300 capitalize">{method.brand} Card</Text>
                <Text className="text-sm font-rubik text-black-200">{method.cardNumber}</Text>
                <Text className="text-sm font-rubik text-black-200">Expires {method.expiryDate}</Text>
              </>
            ) : (
              <>
                <Text className="text-base font-rubik-bold text-black-300 capitalize">{method.brand}</Text>
                <Text className="text-sm font-rubik text-black-200">{method.email}</Text>
              </>
            )}
            {method.isDefault && (
              <View className="flex-row items-center mt-1">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-xs font-rubik-medium text-green-600">Default</Text>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row space-x-2">
          {!method.isDefault && (
            <TouchableOpacity
              className="bg-primary-100 px-3 py-2 rounded-lg"
              onPress={handleSetDefault}
            >
              <Text className="text-xs font-rubik-bold text-primary-300">Set Default</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="bg-red-100 px-3 py-2 rounded-lg"
            onPress={handleRemove}
          >
            <Text className="text-xs font-rubik-bold text-red-600">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'history' | 'methods'>('history')
  const { user } = useGlobalContext()

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getPaymentStats = () => {
    const totalSpent = payments
      .filter(p => p.status === 'completed' && p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0)
    
    const totalRefunded = payments
      .filter(p => p.status === 'completed' && p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0)

    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)

    return { totalSpent, totalRefunded, pendingAmount }
  }

  const stats = getPaymentStats()

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#191D31" />
        </TouchableOpacity>
        <Text className="text-lg font-rubik-bold text-black-300">Payments</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#0061FF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Payment Stats */}
        <View className="mt-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-rubik-bold text-black-300 mb-4">Payment Overview</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-primary-300">${stats.totalSpent}</Text>
              <Text className="text-sm font-rubik text-black-200">Total Spent</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-green-600">${stats.totalRefunded}</Text>
              <Text className="text-sm font-rubik text-black-200">Refunded</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-yellow-600">${stats.pendingAmount}</Text>
              <Text className="text-sm font-rubik text-black-200">Pending</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-accent-100 rounded-xl p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${activeTab === 'history' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('history')}
          >
            <Text className={`text-center font-rubik-bold ${activeTab === 'history' ? 'text-primary-300' : 'text-black-200'}`}>
              Payment History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${activeTab === 'methods' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('methods')}
          >
            <Text className={`text-center font-rubik-bold ${activeTab === 'methods' ? 'text-primary-300' : 'text-black-200'}`}>
              Payment Methods
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'history' ? (
          <View>
            {payments.length > 0 ? (
              <FlatList
                data={payments}
                renderItem={({ item }) => <PaymentCard payment={item} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View className="items-center py-12">
                <Image
                  source={images.noResult}
                  className="w-48 h-48 mb-4"
                  resizeMode="contain"
                />
                <Text className="text-xl font-rubik-bold text-black-300 mb-2">No Payment History</Text>
                <Text className="text-base font-rubik text-black-200 text-center">
                  You haven&apos;t made any payments yet.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-rubik-bold text-black-300">Payment Methods</Text>
              <TouchableOpacity className="bg-primary-300 px-4 py-2 rounded-xl">
                <Text className="text-white font-rubik-bold text-sm">Add New</Text>
              </TouchableOpacity>
            </View>
            
            {paymentMethods.length > 0 ? (
              <FlatList
                data={paymentMethods}
                renderItem={({ item }) => <PaymentMethodCard method={item} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View className="items-center py-12">
                <Image
                  source={images.noResult}
                  className="w-48 h-48 mb-4"
                  resizeMode="contain"
                />
                <Text className="text-xl font-rubik-bold text-black-300 mb-2">No Payment Methods</Text>
                <Text className="text-base font-rubik text-black-200 text-center mb-6">
                  Add a payment method to make bookings easier.
                </Text>
                <TouchableOpacity className="bg-primary-300 px-6 py-3 rounded-xl">
                  <Text className="text-white font-rubik-bold">Add Payment Method</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
