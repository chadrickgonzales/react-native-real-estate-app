import images from '@/constants/images'
import { Booking, cancelBooking, getUserBookings } from '@/lib/booking'
import { useGlobalContext } from '@/lib/global-provider'
import { createImageSource } from '@/lib/imageUtils'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Extended Booking interface for display purposes
interface ExtendedBooking extends Booking {
  propertyType?: string
  bookingType?: 'viewing' | 'rental'
}
const { height: screenHeight } = Dimensions.get('window');

const BookingCard = ({ booking, onBookingUpdate }: { booking: ExtendedBooking, onBookingUpdate: () => void }) => {
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
        const cancelTitle = booking.bookingType === 'viewing' ? 'Cancel Viewing' : 'Cancel Booking'
        const cancelMessage = booking.bookingType === 'viewing' 
          ? 'Are you sure you want to cancel this viewing appointment?' 
          : 'Are you sure you want to cancel this booking?'
        Alert.alert(
          cancelTitle,
          cancelMessage,
          [
            { text: 'Keep', style: 'cancel' },
            { text: 'Cancel', style: 'destructive', onPress: () => handleCancelBooking(bookingId) }
          ]
        )
        break
      case 'reschedule':
        const rescheduleTitle = booking.bookingType === 'viewing' ? 'Reschedule Viewing' : 'Reschedule Booking'
        Alert.alert(rescheduleTitle, 'Reschedule functionality will be implemented here.')
        break
      case 'review':
        const reviewTitle = booking.bookingType === 'viewing' ? 'Leave Review' : 'Leave Review'
        Alert.alert(reviewTitle, 'Review functionality will be implemented here.')
        break
      case 'rebook':
        const rebookTitle = booking.bookingType === 'viewing' ? 'Book Viewing Again' : 'Book Again'
        Alert.alert(rebookTitle, 'Rebook functionality will be implemented here.')
        break
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId, 'Cancelled by user')
      Alert.alert('Success', 'Booking cancelled successfully!')
      onBookingUpdate() // Refresh the bookings list
    } catch (error) {
      console.error('Error cancelling booking:', error)
      Alert.alert('Error', 'Failed to cancel booking. Please try again.')
    }
  }

  return (
    <View className="bg-white rounded-2xl p-2 mb-6 shadow-sm border border-gray-100">
      {/* Property Image and Status */}
      <View className="relative mb-6">
        <Image
          source={createImageSource(booking.propertyImage)}
          style={{ 
            width: '100%', 
            height: screenHeight * 0.35,
            borderRadius: 16 
          }}
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
        {booking.bookingType === 'viewing' ? (
          // Viewing appointment details
          <>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-rubik-medium text-black-200">Viewing Date</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(booking.bookingDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-rubik-medium text-black-200">Viewing Time</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{booking.bookingTime}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-rubik-medium text-black-200">Duration</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{booking.duration} minutes</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-rubik-medium text-black-200">Attendees</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{booking.guests} {booking.guests === 1 ? 'Person' : 'People'}</Text>
            </View>
          </>
        ) : (
          // Rental booking details
          <>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-rubik-medium text-black-200">Check-in</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(booking.bookingDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-rubik-medium text-black-200">Check-out</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(new Date(new Date(booking.bookingDate).getTime() + booking.duration * 60000).toISOString().split('T')[0])}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-rubik-medium text-black-200">Guests</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-rubik-medium text-black-200">Total Amount</Text>
              <Text className="text-lg font-rubik-bold text-primary-300">₱{booking.totalAmount.toLocaleString()}</Text>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-primary-100 py-4 rounded-full active:bg-primary-200 shadow-md"
          onPress={() => handleBookingAction('view', booking.$id)}
        >
          <Text className="text-center text-primary-300 font-rubik-medium">View Property</Text>
        </TouchableOpacity>
        
        {booking.status === 'confirmed' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-yellow-100 py-4 rounded-full active:bg-yellow-200 shadow-lg"
              onPress={() => handleBookingAction('reschedule', booking.$id)}
            >
              <Text className="text-center text-yellow-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Reschedule' : 'Reschedule'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-100 py-4 rounded-full active:bg-red-200 shadow-lg"
              onPress={() => handleBookingAction('cancel', booking.$id)}
            >
              <Text className="text-center text-red-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Cancel Viewing' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {booking.status === 'pending' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-yellow-100 py-4 rounded-full active:bg-yellow-200 shadow-lg"
              onPress={() => handleBookingAction('reschedule', booking.$id)}
            >
              <Text className="text-center text-yellow-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Reschedule' : 'Reschedule'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-100 py-4 rounded-full active:bg-red-200 shadow-lg"
              onPress={() => handleBookingAction('cancel', booking.$id)}
            >
              <Text className="text-center text-red-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Cancel Viewing' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {booking.status === 'completed' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-blue-100 py-4 rounded-full active:bg-blue-200 shadow-lg"
              onPress={() => handleBookingAction('review', booking.$id)}
            >
              <Text className="text-center text-blue-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Leave Review' : 'Leave Review'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-100 py-4 rounded-full active:bg-green-200 shadow-lg"
              onPress={() => handleBookingAction('rebook', booking.$id)}
            >
              <Text className="text-center text-green-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Book Again' : 'Book Again'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {booking.status === 'cancelled' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-blue-100 py-4 rounded-full active:bg-blue-200 shadow-lg"
              onPress={() => handleBookingAction('review', booking.$id)}
            >
              <Text className="text-center text-blue-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Leave Review' : 'Leave Review'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-100 py-4 rounded-full active:bg-green-200 shadow-lg"
              onPress={() => handleBookingAction('rebook', booking.$id)}
            >
              <Text className="text-center text-green-800 font-rubik-medium">
                {booking.bookingType === 'viewing' ? 'Book Again' : 'Book Again'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedTab, setSelectedTab] = useState<'viewing' | 'bookings'>('viewing')
  const { user } = useGlobalContext()

  // Fetch bookings from database
  const fetchBookings = async () => {
    if (!user?.$id) return
    
    try {
      setLoading(true)
      const userBookings = await getUserBookings(user.$id)
      
      // Add display properties to bookings
      const extendedBookings: ExtendedBooking[] = userBookings.map(booking => ({
        ...booking,
        propertyType: booking.propertyName.includes('Villa') ? 'Villa' : 
                     booking.propertyName.includes('Studio') ? 'Studio' :
                     booking.propertyName.includes('Condo') ? 'Condo' :
                     booking.propertyName.includes('House') ? 'House' : 'Apartment',
        bookingType: booking.totalAmount > 0 ? 'rental' : 'viewing'
      }))
      
      setBookings(extendedBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      Alert.alert('Error', 'Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load bookings on component mount
  useEffect(() => {
    fetchBookings()
  }, [user?.$id])

  const filters = [
    { key: 'all', label: selectedTab === 'viewing' ? 'All Viewings' : 'All Bookings' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ]

  const filteredBookings = bookings.filter(booking => {
    // First filter by tab selection
    if (selectedTab === 'viewing' && booking.bookingType !== 'viewing') return false
    if (selectedTab === 'bookings' && booking.bookingType !== 'rental') return false
    
    // Then filter by status if not 'all'
    if (selectedFilter === 'all') return true
    return booking.status === selectedFilter
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchBookings()
    setRefreshing(false)
  }


  return (
    <SafeAreaView className="h-full bg-background-100">
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

        {/* Segmented Control */}
        <View className="bg-white rounded-full p-2 mb-2">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full mr-2 ${
                selectedTab === 'viewing' 
                  ?  "bg-primary-300"
                  : "bg-background-100"
              }`}
              onPress={() => setSelectedTab('viewing')}
            >
              <Text className={`text-center font-rubik-bold ${
                selectedTab === 'viewing' 
                  ? "text-white"
                    : "text-gray-600"
              }`}>
                Viewing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full ${
                selectedTab === 'bookings' 
                  ? "bg-primary-300"
                  : "bg-background-100"
              }`}
              onPress={() => setSelectedTab('bookings')}
            >
              <Text className={`text-center font-rubik-bold ${
                selectedTab === 'bookings' 
                  ? "text-white"
                    : "text-gray-600"
              }`}>
                Bookings
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Filter Tabs */}
        <View className="mb-6 bg-white rounded-full p-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            className="rounded-full"
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                className={`px-4 py-3 rounded-full mr-3 ${
                  selectedFilter === filter.key
                    ? "bg-primary-300"
                  : "bg-background-100"
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

        {/* Loading State */}
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-base font-rubik text-black-200 mt-4">Loading bookings...</Text>
          </View>
        ) : (
          /* Bookings List */
          filteredBookings.length > 0 ? (
            <FlatList
              data={filteredBookings}
              renderItem={({ item }) => <BookingCard booking={item} onBookingUpdate={fetchBookings} />}
              keyExtractor={(item) => item.$id}
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
              <Text className="text-xl font-rubik-bold text-black-300 mb-2">
                {selectedTab === 'viewing' ? 'No Viewing Appointments Found' : 'No Bookings Found'}
              </Text>
              <Text className="text-base font-rubik text-black-200 text-center mb-6">
                {selectedTab === 'viewing' 
                  ? "You haven't scheduled any viewing appointments yet."
                  : "You haven't made any property bookings yet."
                }
              </Text>
              <TouchableOpacity
                className="bg-primary-300 px-6 py-4 rounded-xl active:bg-primary-400"
                onPress={() => router.push('/(root)/(tabs)')}
              >
                <Text className="text-white font-rubik-bold">Explore Properties</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
