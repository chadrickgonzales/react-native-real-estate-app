import { cancelBooking, confirmBooking } from '@/lib/booking'
import { createImageSource } from '@/lib/imageUtils'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
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
      await confirmBooking(booking.$id)
      Alert.alert('Success', 'Booking confirmed successfully!')
      onBookingUpdate()
    } catch (error) {
      console.error('Error confirming booking:', error)
      Alert.alert('Error', 'Failed to confirm booking. Please try again.')
    }
  }

  const handleCancelBooking = async () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await cancelBooking(booking.$id, 'Cancelled by property owner')
              Alert.alert('Success', 'Booking cancelled successfully!')
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
    router.push(`/properties/${booking.propertyId}`)
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text className="text-lg font-rubik-bold text-black-300 ml-2">
            {booking.bookingType === 'viewing' ? 'Viewing Request' : 'Booking Request'}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(booking.status)}`}>
          <Ionicons name={getStatusIcon(booking.status) as any} size={12} color="currentColor" />
          <Text className="text-xs font-rubik-bold ml-1 capitalize">{booking.status}</Text>
        </View>
      </View>

      {/* Property Image */}
      <View className="mb-4">
        <Image
          source={createImageSource(booking.propertyImage)}
          className="w-full h-32 rounded-xl"
          resizeMode="cover"
        />
      </View>

      {/* Property Details */}
      <View className="mb-4">
        <Text className="text-lg font-rubik-bold text-black-300 mb-2">{booking.propertyName}</Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#666876" />
          <Text className="text-sm font-rubik text-black-200 ml-2">{booking.propertyAddress}</Text>
        </View>
      </View>

      {/* Booking Details */}
      <View className="bg-accent-50 rounded-xl p-4 mb-4">
        {booking.bookingType === 'viewing' ? (
          <>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Viewing Date</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(booking.bookingDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Viewing Time</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{booking.bookingTime}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-rubik-medium text-black-200">Attendees</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{booking.guests} {booking.guests === 1 ? 'Person' : 'People'}</Text>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Check-in</Text>
              <Text className="text-sm font-rubik-bold text-black-300">{formatDate(booking.bookingDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-rubik-medium text-black-200">Check-out</Text>
              <Text className="text-sm font-rubik-bold text-black-300">
                {formatDate(new Date(new Date(booking.bookingDate).getTime() + booking.duration * 60000).toISOString().split('T')[0])}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
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

      {/* Special Requests */}
      {booking.specialRequests && (
        <View className="mb-4">
          <Text className="text-sm font-rubik-medium text-black-200 mb-1">Special Requests:</Text>
          <Text className="text-sm font-rubik text-black-300 bg-gray-50 p-3 rounded-lg">
            {booking.specialRequests}
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
        {isPropertyOwner && booking.status === 'pending' && (
          <>
            <TouchableOpacity
              className="flex-1 bg-green-100 py-3 rounded-full active:bg-green-200 shadow-md"
              onPress={handleConfirmBooking}
            >
              <Text className="text-center text-green-800 font-rubik-medium">Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-100 py-3 rounded-full active:bg-red-200 shadow-md"
              onPress={handleCancelBooking}
            >
              <Text className="text-center text-red-800 font-rubik-medium">Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Booking Status Display */}
        {!isPropertyOwner && (
          <View className="flex-1 items-center justify-center py-3">
            <Text className="text-sm font-rubik-medium text-gray-600">
              Status: <Text className="font-rubik-bold capitalize">{booking.status}</Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
