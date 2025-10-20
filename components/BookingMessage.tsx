import { cancelBooking, confirmBooking, getBookingById } from '@/lib/booking'
import { createImageSource } from '@/lib/imageUtils'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native'

interface BookingMessageProps {
  booking: {
    $id: string
    propertyId: string
    propertyName: string
    propertyAddress: string
    propertyImage: string
    bookingDate: string
    bookingTime: string
    duration: number
    totalAmount: number
    currency: string
    guests: number
    specialRequests?: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    bookingType?: 'viewing' | 'rental'
    senderId: string
    senderName: string
  }
  currentUserId: string
  isPropertyOwner: boolean
  onBookingUpdate: () => void
}

export default function BookingMessage({ 
  booking, 
  currentUserId, 
  isPropertyOwner, 
  onBookingUpdate 
}: BookingMessageProps) {
  const [latestBooking, setLatestBooking] = useState(booking)
  const [loading, setLoading] = useState(false)

  // Debug logging for property image
  console.log('BookingMessage - Property image data:', {
    propertyImage: booking.propertyImage,
    propertyName: booking.propertyName,
    bookingId: booking.$id
  });

  // Fetch latest booking data from database
  const fetchLatestBooking = async () => {
    try {
      setLoading(true)
      const updatedBooking = await getBookingById(booking.$id)
      setLatestBooking(updatedBooking)
    } catch (error) {
      console.error('Error fetching latest booking:', error)
      // Keep the original booking data if fetch fails
    } finally {
      setLoading(false)
    }
  }

  // Fetch latest booking data when component mounts
  useEffect(() => {
    fetchLatestBooking()
  }, [booking.$id])

  // Use latest booking data instead of the original booking data
  const currentBooking = latestBooking
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

  const handleConfirmBooking = async () => {
    try {
      await confirmBooking(currentBooking.$id)
      Alert.alert('Success', 'Booking confirmed successfully!')
      // Refresh the booking data after confirmation
      await fetchLatestBooking()
      onBookingUpdate()
    } catch (error) {
      console.error('Error confirming booking:', error)
      Alert.alert('Error', 'Failed to confirm booking. Please try again.')
    }
  }

  const handleCancelBooking = async (isUserCancelling: boolean = false) => {
    const cancelMessage = isUserCancelling 
      ? 'Are you sure you want to cancel your booking? This action cannot be undone.'
      : 'Are you sure you want to cancel this booking?'
    
    const cancelReason = isUserCancelling 
      ? 'Cancelled by user'
      : 'Cancelled by property owner'

    Alert.alert(
      'Cancel Booking',
      cancelMessage,
      [
        { text: 'Keep', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await cancelBooking(currentBooking.$id, cancelReason)
              Alert.alert('Success', 'Booking cancelled successfully!')
              // Refresh the booking data after cancellation
              await fetchLatestBooking()
              onBookingUpdate()
            } catch (error) {
              console.error('Error cancelling booking:', error)
              Alert.alert('Error', 'Failed to cancel booking. Please try again.')
            }
          }
        }
      ]
    )
  }

  const handleViewProperty = () => {
    router.push(`/properties/${currentBooking.propertyId}`)
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text className="text-lg font-rubik-bold text-black-300 ml-2">
            {currentBooking.bookingType === 'viewing' ? 'Viewing Request' : 'Booking Request'}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(currentBooking.status)}`}>
          <Ionicons name={getStatusIcon(currentBooking.status) as any} size={12} color="currentColor" />
          <Text className="text-xs font-rubik-bold ml-1 capitalize">{currentBooking.status}</Text>
        </View>
      </View>

      {/* Property Image */}
      <View className="mb-4">
        {currentBooking.propertyImage ? (
          <Image
            source={createImageSource(currentBooking.propertyImage)}
            className="w-full h-32 rounded-xl"
            resizeMode="cover"
            onError={() => console.log('Property image failed to load:', currentBooking.propertyImage)}
            onLoad={() => console.log('Property image loaded successfully:', currentBooking.propertyImage)}
          />
        ) : (
          <View className="w-full h-32 rounded-xl bg-gray-200 items-center justify-center">
            <Ionicons name="home-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 font-rubik text-sm mt-2">No Image Available</Text>
          </View>
        )}
      </View>

      {/* Property Details */}
      <View className="mb-4">
        <Text className="text-lg font-rubik-bold text-black-300 mb-2">{currentBooking.propertyName}</Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#666876" />
          <Text className="text-sm font-rubik text-black-200 ml-2">{currentBooking.propertyAddress}</Text>
        </View>
      </View>

      {/* Booking Details */}
      <View className="bg-accent-50 rounded-xl p-4 mb-4">
        {currentBooking.bookingType === 'viewing' ? (
          <>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Viewing Date</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(currentBooking.bookingDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Viewing Time</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{currentBooking.bookingTime}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-rubik-medium text-black-200">Attendees</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{currentBooking.guests} {currentBooking.guests === 1 ? 'Person' : 'People'}</Text>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Check-in</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(currentBooking.bookingDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Check-out</Text>
              <Text className="text-sm font-rubik-bold text-black-300">
                {formatDate(new Date(new Date(currentBooking.bookingDate).getTime() + currentBooking.duration * 60000).toISOString().split('T')[0])}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Guests</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{currentBooking.guests} {currentBooking.guests === 1 ? 'Guest' : 'Guests'}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-rubik-medium text-black-200">Total Amount</Text>
              <Text className="text-lg font-rubik-bold text-primary-300">₱{currentBooking.totalAmount.toLocaleString()}</Text>
            </View>
          </>
        )}
      </View>

      {/* Special Requests */}
      {currentBooking.specialRequests && (
        <View className="mb-4">
          <Text className="text-sm font-rubik-medium text-black-200 mb-1">Special Requests:</Text>
          <Text className="text-sm font-rubik text-black-300 bg-gray-50 p-3 rounded-lg">
            {currentBooking.specialRequests}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-primary-100 py-3 rounded-full active:bg-primary-200 shadow-md"
          onPress={handleViewProperty}
        >
          <Text className="text-center text-primary-300 font-rubik-medium">View Property</Text>
        </TouchableOpacity>

        {/* Property Owner Actions */}
        {isPropertyOwner && currentBooking.status === 'pending' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-green-100 py-3 rounded-full active:bg-green-200 shadow-md"
              onPress={handleConfirmBooking}
            >
              <Text className="text-center text-green-800 font-rubik-medium">Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-100 py-3 rounded-full active:bg-red-200 shadow-md"
              onPress={() => handleCancelBooking(false)}
            >
              <Text className="text-center text-red-800 font-rubik-medium">Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {/* User Actions - Allow users to cancel their own bookings */}
        {!isPropertyOwner && currentBooking.status === 'pending' && currentBooking.senderId === currentUserId && (
          <TouchableOpacity
            className="flex-1 bg-red-100 py-3 rounded-full active:bg-red-200 shadow-md"
            onPress={() => handleCancelBooking(true)}
          >
            <Text className="text-center text-red-800 font-rubik-medium">Cancel Booking</Text>
          </TouchableOpacity>
        )}

        {/* Booking Status Display for non-owners or when booking is not pending */}
        {(!isPropertyOwner && (currentBooking.status !== 'pending' || currentBooking.senderId !== currentUserId)) && (
          <View className="flex-1 items-center justify-center py-3">
            <Text className="text-sm font-rubik-medium text-gray-600">
              Status: <Text className="font-rubik-bold capitalize">{currentBooking.status}</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
