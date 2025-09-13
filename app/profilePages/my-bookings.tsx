import images from '@/constants/images'
import { useGlobalContext } from '@/lib/global-provider'
import { createImageSource } from '@/lib/imageUtils'
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

// Mock booking data - replace with actual API calls
const mockBookings = [
  {
    id: '1',
    propertyId: 'prop1',
    propertyName: 'Modern Downtown Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    propertyAddress: '123 Main St, Downtown',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    totalAmount: 1200,
    status: 'confirmed',
    bookingDate: '2024-01-10',
    guests: 2,
    propertyType: 'Apartment'
  },
  {
    id: '2',
    propertyId: 'prop2',
    propertyName: 'Luxury Villa with Pool',
    propertyImage: 'https://images.unsplash.com/photo-1605146768851-eda79da39897?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    propertyAddress: '456 Ocean View, Beachside',
    checkIn: '2024-02-01',
    checkOut: '2024-02-07',
    totalAmount: 2800,
    status: 'pending',
    bookingDate: '2024-01-25',
    guests: 4,
    propertyType: 'Villa'
  },
  {
    id: '3',
    propertyId: 'prop3',
    propertyName: 'Cozy Studio in City Center',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    propertyAddress: '789 Central Ave, City Center',
    checkIn: '2024-01-05',
    checkOut: '2024-01-08',
    totalAmount: 450,
    status: 'completed',
    bookingDate: '2023-12-20',
    guests: 1,
    propertyType: 'Studio'
  }
]

interface Booking {
  id: string
  propertyId: string
  propertyName: string
  propertyImage: string
  propertyAddress: string
  checkIn: string
  checkOut: string
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  bookingDate: string
  guests: number
  propertyType: string
}

const BookingCard = ({ booking }: { booking: Booking }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle'
      case 'pending': return 'time'
      case 'cancelled': return 'close-circle'
      case 'completed': return 'checkmark-done-circle'
      default: return 'help-circle'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleBookingAction = (action: string, bookingId: string) => {
    switch (action) {
      case 'view':
        router.push(`/properties/${booking.propertyId}`)
        break
      case 'cancel':
        Alert.alert(
          'Cancel Booking',
          'Are you sure you want to cancel this booking?',
          [
            { text: 'Keep Booking', style: 'cancel' },
            { text: 'Cancel Booking', style: 'destructive', onPress: () => handleCancelBooking(bookingId) }
          ]
        )
        break
      case 'reschedule':
        Alert.alert('Reschedule', 'Reschedule functionality will be implemented here.')
        break
    }
  }

  const handleCancelBooking = (bookingId: string) => {
    // Implement cancel booking logic
    Alert.alert('Success', 'Booking cancelled successfully!')
  }

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
      {/* Property Image and Status */}
      <View className="relative mb-6">
        <Image
          source={createImageSource(booking.propertyImage)}
          className="w-full h-48 rounded-xl"
          resizeMode="cover"
        />
        <View className={`absolute top-3 right-3 px-3 py-2 rounded-full flex-row items-center ${getStatusColor(booking.status)}`}>
          <Ionicons name={getStatusIcon(booking.status) as any} size={12} color="currentColor" />
          <Text className="text-xs font-rubik-bold ml-1 capitalize">{booking.status}</Text>
        </View>
      </View>

      {/* Property Details */}
      <View className="mb-6">
        <Text className="text-xl font-rubik-bold text-black-300 mb-2">{booking.propertyName}</Text>
        <View className="flex-row items-center mb-2">
          <View className="w-5 h-5 items-center justify-center mr-2">
            <Ionicons name="location-outline" size={16} color="#666876" />
          </View>
          <Text className="text-sm font-rubik text-black-200">{booking.propertyAddress}</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-5 h-5 items-center justify-center mr-2">
            <Ionicons name="home-outline" size={16} color="#666876" />
          </View>
          <Text className="text-sm font-rubik text-black-200">{booking.propertyType}</Text>
        </View>
      </View>

      {/* Booking Details */}
      <View className="bg-accent-50 rounded-xl p-4 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-rubik-medium text-black-200">Check-in</Text>
          <Text className="text-sm font-rubik-bold text-black-300">{formatDate(booking.checkIn)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-rubik-medium text-black-200">Check-out</Text>
          <Text className="text-sm font-rubik-bold text-black-300">{formatDate(booking.checkOut)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-rubik-medium text-black-200">Guests</Text>
          <Text className="text-sm font-rubik-bold text-black-300">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-rubik-medium text-black-200">Total Amount</Text>
          <Text className="text-lg font-rubik-bold text-primary-300">${booking.totalAmount}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          className="flex-1 bg-primary-100 py-4 rounded-xl active:bg-primary-200"
          onPress={() => handleBookingAction('view', booking.id)}
        >
          <Text className="text-center text-primary-300 font-rubik-bold">View Property</Text>
        </TouchableOpacity>
        
        {booking.status === 'confirmed' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-yellow-100 py-4 rounded-xl active:bg-yellow-200"
              onPress={() => handleBookingAction('reschedule', booking.id)}
            >
              <Text className="text-center text-yellow-800 font-rubik-bold">Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-100 py-4 rounded-xl active:bg-red-200"
              onPress={() => handleBookingAction('cancel', booking.id)}
            >
              <Text className="text-center text-red-800 font-rubik-bold">Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {booking.status === 'pending' && (
          <TouchableOpacity
            className="flex-1 bg-red-100 py-4 rounded-xl active:bg-red-200"
            onPress={() => handleBookingAction('cancel', booking.id)}
          >
            <Text className="text-center text-red-800 font-rubik-bold">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const { user } = useGlobalContext()

  const filters = [
    { key: 'all', label: 'All Bookings' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ]

  const filteredBookings = bookings.filter(booking => 
    selectedFilter === 'all' || booking.status === selectedFilter
  )

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getBookingStats = () => {
    const total = bookings.length
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const pending = bookings.filter(b => b.status === 'pending').length
    const completed = bookings.filter(b => b.status === 'completed').length

    return { total, confirmed, pending, completed }
  }

  const stats = getBookingStats()

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex flex-row items-center justify-between mt-5 mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="#191D31" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-rubik-bold text-black-300">My Bookings</Text>
          <View className="w-10" />
        </View>

        {/* Booking Stats */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <Text className="text-xl font-rubik-bold text-black-300 mb-6">Booking Overview</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-primary-300">{stats.total}</Text>
              <Text className="text-sm font-rubik text-black-200">Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-green-600">{stats.confirmed}</Text>
              <Text className="text-sm font-rubik text-black-200">Confirmed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-yellow-600">{stats.pending}</Text>
              <Text className="text-sm font-rubik text-black-200">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-blue-600">{stats.completed}</Text>
              <Text className="text-sm font-rubik text-black-200">Completed</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                className={`px-4 py-3 rounded-full mr-3 ${
                  selectedFilter === filter.key
                    ? 'bg-primary-300'
                    : 'bg-accent-100 border border-gray-200'
                }`}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  className={`text-sm font-rubik-medium ${
                    selectedFilter === filter.key
                      ? 'text-white'
                      : 'text-black-300'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <FlatList
            data={filteredBookings}
            renderItem={({ item }) => <BookingCard booking={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="items-center py-12">
            <Image
              source={images.noResult}
              className="w-48 h-48 mb-6"
              resizeMode="contain"
            />
            <Text className="text-xl font-rubik-bold text-black-300 mb-2">No Bookings Found</Text>
            <Text className="text-base font-rubik text-black-200 text-center mb-6">
              {selectedFilter === 'all' 
                ? "You haven't made any bookings yet."
                : `No ${selectedFilter} bookings found.`
              }
            </Text>
            <TouchableOpacity
              className="bg-primary-300 px-6 py-4 rounded-xl active:bg-primary-400"
              onPress={() => router.push('/(root)/(tabs)')}
            >
              <Text className="text-white font-rubik-bold">Explore Properties</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
