import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";

import ReviewForm from "@/components/ReviewForm";
import { getPropertyById } from "@/lib/appwrite";
import { createBooking } from "@/lib/booking";
import { useGlobalContext } from "@/lib/global-provider";
import { createImageSource } from "@/lib/imageUtils";
import { createPropertyReview, getPropertyReviewStats } from "@/lib/reviews";
import { useAppwrite } from "@/lib/useAppwrite";

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useGlobalContext();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<number | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [requestedDays, setRequestedDays] = useState<number>(1);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState<number>(0);
  const [showAvailabilityDetails, setShowAvailabilityDetails] = useState(false);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const windowHeight = Dimensions.get("window").height;

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const generateCalendarDays = (date: Date) => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(date);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isDateAvailable = (day: number, month: Date) => {
    if (!day) return false;
    
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For staycation properties (Villa/Townhomes), check availability
    if (property?.propertyType === 'rent' && (property.type === 'Villa' || property.type === 'Townhomes')) {
      // More realistic booking pattern for staycation properties
      // Weekends (Fri-Sun) are more likely to be booked
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
      
      // Simulate higher booking rates on weekends
      const random = (date.getTime() + day) % 10;
      if (isWeekend) {
        return random >= 3; // 70% chance available on weekends
      } else {
        return random >= 1; // 90% chance available on weekdays
      }
    }
    
    // For sale properties, check viewing availability
    if (property?.propertyType === 'sell') {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
      
      // For viewing appointments, most days have multiple slots available
      // Only mark as unavailable if the day is completely booked or blocked
      const random = (date.getTime() + day) % 10;
      if (isWeekend) {
        return random >= 1; // 90% chance has available viewing slots on weekends
      } else {
        return random >= 2; // 80% chance has available viewing slots on weekdays
      }
    }
    
    return date >= today;
  };

  const isDateBooked = (day: number, month: Date) => {
    if (!day) return false;
    
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For staycation properties, simulate realistic booking patterns
    if (property?.propertyType === 'rent' && (property.type === 'Villa' || property.type === 'Townhomes')) {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
      
      const random = (date.getTime() + day) % 10;
      if (isWeekend) {
        return random < 3; // 30% chance booked on weekends
      } else {
        return random < 1; // 10% chance booked on weekdays
      }
    }
    
    // For sale properties, simulate viewing appointments
    if (property?.propertyType === 'sell') {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
      
      // Only mark as "booked" if the day is completely unavailable (rare)
      // Most days will have some viewing slots available
      const random = (date.getTime() + day) % 10;
      if (isWeekend) {
        return random < 1; // 10% chance completely booked on weekends
      } else {
        return random < 2; // 20% chance completely booked on weekdays
      }
    }
    
    return false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const generateTimeSlots = (day: number) => {
    const timeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Generate 2 slots per hour (30 minutes each)
      timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // 70% chance available
        id: `${day}-${hour}-00`
      });
      timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        available: Math.random() > 0.3, // 70% chance available
        id: `${day}-${hour}-30`
      });
    }
    
    return timeSlots;
  };

  // Calculate maximum consecutive days available from a given date
  const calculateMaxConsecutiveDays = (startDay: number, month: Date): number => {
    let consecutiveDays = 0;
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    for (let i = 0; i < 30; i++) { // Check up to 30 days ahead
      const checkDay = startDay + i;
      const checkDate = new Date(year, monthIndex, checkDay);
      
      // Check if date is available and not booked
      if (isDateAvailable(checkDay, month) && !isDateBooked(checkDay, month)) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };

  // Check if requested days are available and return blocked dates
  const checkDaysAvailability = (startDay: number, requestedDays: number, month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const blockedDates = [];
    
    for (let i = 0; i < requestedDays; i++) {
      const checkDay = startDay + i;
      const checkDate = new Date(year, monthIndex, checkDay);
      
      if (isDateBooked(checkDay, month)) {
        blockedDates.push({
          day: checkDay,
          date: checkDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return {
      isAvailable: blockedDates.length === 0,
      blockedDates
    };
  };

  const handleDateClick = async (day: number) => {
    if (isDateAvailable(day, currentMonth) && !isDateBooked(day, currentMonth)) {
      setSelectedDate(day);
      setSelectedEndDate(null);
      
      // For sale properties (viewing), show time slots
      if (property?.propertyType === 'sell') {
        setShowTimeSlots(true);
        // Generate time slots for viewing
        const timeSlots = generateTimeSlots(day);
        setAvailableSlots(timeSlots);
      } else {
        // For rental properties (booking), show booking modal
        setShowTimeSlots(true);
        
        // Calculate maximum consecutive days available from this date
        const maxDays = calculateMaxConsecutiveDays(day, currentMonth);
        setMaxConsecutiveDays(maxDays);
        
        // Reset requested days if it exceeds available days
        if (requestedDays > maxDays) {
          setRequestedDays(Math.max(1, maxDays));
        }
      }
    }
  };

  const closeTimeSlots = () => {
    setShowTimeSlots(false);
    setSelectedDate(null);
    setSelectedEndDate(null);
    setSelectedTimeSlot(null);
    setRequestedDays(1);
    setMaxConsecutiveDays(0);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowTimeSlots(false);
    setShowBookingConfirmation(true);
  };

  const confirmBooking = async () => {
    if (!user || !property || !selectedDate) {
      alert('Please complete all booking details');
      return;
    }

    if (requestedDays > maxConsecutiveDays) {
      alert(`Only ${maxConsecutiveDays} consecutive days available from this date. Please adjust your selection.`);
      return;
    }

    setIsCreatingBooking(true);
    
    try {
      const startDateString = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;
      
      // Calculate end date based on requested days
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + requestedDays - 1);
      const endDateString = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
      
      // Create the booking
      const bookingData = {
        userId: user.$id,
        propertyId: property.$id,
        propertyName: property.name || 'Property',
        propertyAddress: property.address || 'Address not specified',
        propertyImage: property.images?.[0] || property.image || '',
        ownerId: property.ownerId || 'unknown',
        ownerName: property.ownerName || 'Property Owner',
        ownerEmail: property.contactEmail || 'owner@example.com',
        ownerPhone: property.contactPhone || 'N/A',
        bookingDate: startDateString,
        bookingTime: '3:00 PM', // Default check-in time
        duration: requestedDays * 24 * 60, // Duration in minutes for multiple days
        totalAmount: (property.price || 0) * requestedDays,
        currency: 'PHP',
        guests,
        specialRequests: `${specialRequests}\n\nBooking Period: ${requestedDays} day${requestedDays > 1 ? 's' : ''} (${startDateString} to ${endDateString})\nCheck-in: 3:00 PM | Checkout: 11:00 AM`
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + requestedDays - 1);
        const dateRangeText = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
          
        if (property?.propertyType === 'sell') {
          alert(`Viewing appointment confirmed!\n\nProperty: ${property.name}\nDate: ${currentMonth.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}\nTime: ${selectedTimeSlot}\n\nYou will receive a confirmation email shortly.`);
        } else {
          alert(`Booking confirmed!\n\nProperty: ${property.name}\nCheck-in: ${dateRangeText}\nDuration: ${requestedDays} day${requestedDays > 1 ? 's' : ''}\nCheck-in: 3:00 PM | Checkout: 11:00 AM\nTotal: ₱${bookingData.totalAmount.toLocaleString()}\n\nYou will receive a confirmation email shortly.`);
        }
        
        // Close all modals and reset state
        setShowBookingConfirmation(false);
        setSelectedDate(null);
        setSelectedEndDate(null);
        setRequestedDays(1);
        setMaxConsecutiveDays(0);
        setGuests(1);
        setSpecialRequests("");
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const cancelBooking = () => {
    setShowBookingConfirmation(false);
    setSelectedDate(null);
    setSelectedEndDate(null);
    setRequestedDays(1);
    setMaxConsecutiveDays(0);
    setSpecialRequests("");
    setGuests(1);
    setMessageText("");
  };

  const { data: property, loading } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: id!,
    },
  });

  // Load review stats when property is loaded
  const loadReviewStats = async () => {
    if (!id) return;
    
    try {
      const stats = await getPropertyReviewStats(id);
      setReviewStats(stats);
    } catch (error) {
      console.error('Error loading review stats:', error);
      // Set default stats if no reviews exist
      setReviewStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
  };

  // Load review stats when property is available
  React.useEffect(() => {
    if (property) {
      loadReviewStats();
    }
  }, [property]);

  // Handle review submission
  const handleSubmitReview = async (reviewData: { rating: number; title: string; comment: string }) => {
    if (!user || !id) return;
    
    setSubmittingReview(true);
    
    try {
      await createPropertyReview({
        userId: user.$id,
        userName: user.userName || 'Anonymous',
        userAvatar: user.avatar,
        propertyId: id,
        propertyName: property?.name || 'Property',
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment
      });
      
      setShowReviewForm(false);
      await loadReviewStats(); // Refresh review stats
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '₱0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeDisplay = () => {
    if (property?.propertyType === 'sell') return 'Home in';
    if (property?.propertyType === 'rent') return 'Rental in';
    return 'Property in';
  };

  const getLocationFromAddress = (address: string) => {
    if (!address) return 'Location';
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return address;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-600 text-lg font-rubik">Loading property...</Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-600 text-lg font-rubik">Property not found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-rubik-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentImage = property.images && property.images.length > 0 
    ? property.images[currentImageIndex] 
    : property.image;

  return (
    <View className="flex-1">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-gray-100"
      >
        {/* Hero Image Card */}
        
        {/* Property Details Card */}
        <View>
          <View className="bg-white mb-1 shadow-lg p-6">
              {/* Floating Navigation Buttons */}
      <View className="bg-white absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
            {/* Hero Image Card */}
        <View className="mx-6 mt-20 mb-6">
          <View className="bg-white rounded-3xl  overflow-hidden" style={{ height: windowHeight * 0.4, backgroundColor: '#FFFFFF' }}>
            <View className="relative">
              <Image
                source={
                  !imageError && currentImage
                    ? createImageSource(currentImage)
                    : images.newYork
                }
                className="w-full h-full bg-white"
                resizeMode="cover"
                onError={() => {
                  console.log('Hero image load error, using fallback');
                  setImageError(true);
                }}
              />
              <View className="absolute inset-0 bg-white/0" />
            </View>
            
            
            
           
            {/* Favorite Button with White Background */}
            <View className="absolute bottom-5 right-5">
             
                {/* Background Image */}
                <Image 
                  source={require('@/assets/images/Group 1.png')} 
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    right: -30,
                    width: 152,
                    height: 152,
                   
                  }}
                  resizeMode="cover"
                />
              
             
              
              {/* Teal Heart Button */}
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  width: 75,
                  height: 75,
                  backgroundColor: '#14b8a6',
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                 
                }}
              >
                <Ionicons name="heart-outline" size={35} color="white" />
              </TouchableOpacity>
            </View>

            {/* Image Indicators */}
            {property.images && property.images.length > 1 && (
              <View className="absolute bottom-6 left-6 flex-row space-x-2">
                {property.images.map((_: any, index: number) => (
                  <View
                    key={index}
                    className={`rounded-full ${
                      index === currentImageIndex ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-gray-400'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
            
              {/* Title */}
              <View className="mb-3">
                <Text className="text-2xl font-rubik-bold text-gray-900">
                  {property.name || `${getPropertyTypeDisplay()} ${getLocationFromAddress(property.address)}`}
                </Text>
              </View>

            {/* Location */}
            <View className="flex-row items-center mb-3">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 font-rubik ml-1 flex-1" numberOfLines={1}>
                {property.address || 'Address not specified'}
              </Text>
            </View>

            {/* Price */}
            <View className="mb-3 ml-2">
              <Text className="text-gray-600 font-rubik">
                {formatPrice(property.price)}
              </Text>
            </View>

            {/* Message Section */}
            <View className="mb-6 bg-white rounded-2xl p-4 border border-gray-200">
              {/* Send Message Header */}
              <View className="flex-row items-center mb-4">
                <Text className="text-black font-rubik-medium text-base">Send seller a message</Text>
              </View>
              
                {/* Message Input */}
                <View className="flex-row items-center mb-6">
                  <TextInput
                    className="flex-1 bg-gray-100 rounded-full px-4 py-4 mr-3 text-gray-900 font-rubik text-base"
                    placeholder="Is this still available?"
                    placeholderTextColor="#9CA3AF"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline={false}
                    maxLength={200}
                  />
                  <TouchableOpacity 
                    className="bg-blue-500 px-6 py-4 rounded-full"
                    onPress={() => {
                      console.log("Send button clicked with message:", messageText);
                      router.push({
                        pathname: '/chat-conversation',
                        params: {
                          propertyId: property?.$id,
                          propertyName: property?.name || 'Property',
                          sellerName: 'Property Owner',
                          sellerAvatar: property?.image,
                          initialMessage: messageText
                        }
                      });
                    }}
                  >
                    <Text className="text-white font-rubik-bold text-base">Send</Text>
                  </TouchableOpacity>
                </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-lg font-rubik-bold text-gray-900 mb-3">Description</Text>
              <Text 
                className="text-gray-600 font-rubik leading-6"
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {property.description || 'This exquisitely engineered property is a masterpiece of superior craftsmanship and modern design.'}
              </Text>
              {property.description && property.description.length > 150 && (
                <TouchableOpacity 
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2"
                >
                  <Text className="text-blue-600 font-rubik-medium">
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Reviews Section */}
            <View className="mb-6 bg-white rounded-2xl p-4 border border-gray-200">
              {/* Reviews Header */}
              <View className="flex-row items-center mb-4">
                <Text className="text-black font-rubik-medium text-base">Reviews</Text>
                <TouchableOpacity 
                  onPress={() => router.push(`/property-reviews?id=${id}`)}
                  className="flex-row items-center ml-auto"
                >
                  <Text className="text-blue-500 font-rubik-medium mr-1">View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              
              {/* Rating Display */}
              <View className="flex-row items-center mb-4">
                <View className="flex-row mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(reviewStats?.averageRating || 0) ? "star" : "star-outline"}
                      size={16}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <Text className="text-gray-600 font-rubik">
                  {reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0'} ({reviewStats?.totalReviews || 0} reviews)
                </Text>
              </View>
              
              {/* Write Review Input */}
              {user && (
                <TouchableOpacity 
                  className="w-full bg-gray-100 rounded-full px-4 py-4 border border-gray-300"
                  onPress={() => setShowReviewForm(true)}
                >
                  <Text className="text-gray-500 font-rubik">
                    Write Review
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
          
          {/* Availability Calendar - For staycation-friendly rental properties */}
          {property.propertyType === 'rent' && (
            // Show booking for properties that are suitable for short-term stays
            property.type === 'Villa' || 
            property.type === 'Townhomes' || 
            property.type === 'House' && property.furnishedStatus === true ||
            property.type === 'Apartment' && property.furnishedStatus === true ||
            property.type === 'Condos' && property.furnishedStatus === true
          ) && (
            <View className="bg-white mb-1 shadow-lg p-6">
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Availability for Booking</Text>
                
                
                {/* Calendar Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigateMonth('prev')}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <Text className="text-gray-900 font-rubik-bold text-lg">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigateMonth('next')}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Calendar Grid */}
                <View className="bg-gray-50 rounded-lg p-3">
                  {/* Day Headers */}
                  <View className="flex-row mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <View key={day} className="flex-1 items-center py-2">
                        <Text className="text-gray-500 font-rubik-medium text-xs">{day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Days */}
                  <View className="flex-row flex-wrap">
                    {generateCalendarDays(currentMonth).map((day, index) => {
                      const isSelected = selectedDate === day;
                      const isInRange = selectedDate && day && day > selectedDate && day < selectedDate + requestedDays;
                      
                      return (
                        <View key={index} className="w-[14.28%] aspect-square items-center justify-center">
                          {day ? (
                            <TouchableOpacity 
                              onPress={() => handleDateClick(day)}
                              className={`w-8 h-8 rounded-full items-center justify-center ${
                                isDateBooked(day, currentMonth) 
                                  ? 'bg-red-100' 
                                  : isSelected
                                  ? 'bg-blue-500'
                                  : isInRange
                                  ? 'bg-blue-200'
                                  : 'bg-green-100'
                              }`}
                              disabled={isDateBooked(day, currentMonth)}
                            >
                              <Text className={`font-rubik text-sm ${
                                isDateBooked(day, currentMonth) 
                                  ? 'text-red-600' 
                                  : isSelected
                                  ? 'text-white'
                                  : isInRange
                                  ? 'text-blue-800'
                                  : 'text-green-600'
                              }`}>
                                {day}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View className="w-8 h-8" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Legend */}
                <View className="flex-row justify-center mt-4 space-x-4">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-green-100 rounded-full mr-2" />
                    <Text className="text-gray-600 font-rubik text-xs">Available</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-red-100 rounded-full mr-2" />
                    <Text className="text-gray-600 font-rubik text-xs">Booked</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    <Text className="text-gray-600 font-rubik text-xs">Check-in</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-blue-200 rounded-full mr-2" />
                    <Text className="text-gray-600 font-rubik text-xs">Stay Period</Text>
                  </View>
                </View>

                {/* Staycation Info */}
                <View className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="home" size={16} color="#8B5CF6" />
                    <Text className="text-purple-600 font-rubik-medium ml-2 text-sm">Perfect for Staycation</Text>
                  </View>
                  <Text className="text-gray-600 font-rubik text-sm mb-2">
                    {property.type} - Ideal for weekend getaways, family vacations, and tourist stays
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={14} color="#8B5CF6" />
                    <Text className="text-gray-600 font-rubik text-xs ml-2">
                      Minimum stay: 2 nights • Perfect for tourists & weekend trips
                    </Text>
                  </View>
                  {property.furnishedStatus && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="checkmark-circle" size={14} color="#8B5CF6" />
                      <Text className="text-gray-600 font-rubik text-xs ml-2">
                        Fully furnished • Ready for immediate stay
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Availability for Viewing - For sale properties */}
          {property.propertyType === 'sell' && (
            <View className="bg-white mb-1 shadow-lg p-6">
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Availability for Viewing</Text>
                
                {/* Calendar Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <TouchableOpacity 
                    onPress={() => navigateMonth('prev')}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="chevron-back" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  
                  <Text className="text-gray-900 font-rubik-bold text-lg">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => navigateMonth('next')}
                    className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Calendar Grid */}
                <View className="bg-gray-50 rounded-lg p-3">
                  {/* Day Headers */}
                  <View className="flex-row mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <View key={day} className="flex-1 items-center py-2">
                        <Text className="text-gray-500 font-rubik-medium text-xs">{day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Days */}
                  <View className="flex-row flex-wrap">
                    {generateCalendarDays(currentMonth).map((day, index) => (
                      <View key={index} className="w-[14.28%] aspect-square items-center justify-center">
                        {day ? (
                          <TouchableOpacity 
                            onPress={() => handleDateClick(day)}
                            className={`w-8 h-8 rounded-full items-center justify-center ${
                              isDateBooked(day, currentMonth) 
                                ? 'bg-red-100' 
                                : 'bg-green-100'
                            }`}
                            disabled={isDateBooked(day, currentMonth)}
                          >
                            <Text className={`font-rubik text-sm ${
                              isDateBooked(day, currentMonth) 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View className="w-8 h-8" />
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Legend */}
                <View className="flex-row justify-center mt-4 gap-4">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-green-100 rounded-full mr-2" />
                    <Text className="text-gray-600 font-rubik text-xs">Available for Viewing</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-red-100 rounded-full mr-2" />
                    <Text className="text-gray-600 font-rubik text-xs">Viewing Booked</Text>
                  </View>
                </View>

                {/* Viewing Info */}
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="eye" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-rubik-medium ml-2 text-sm">Property Viewing</Text>
                  </View>
                  <Text className="text-gray-600 font-rubik text-sm mb-2">
                    Schedule a viewing appointment to see this {property.type} in person
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="time" size={14} color="#3B82F6" />
                    <Text className="text-gray-600 font-rubik text-xs ml-2">
                      Multiple time slots available per day (30-60 min each)
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="information-circle" size={14} color="#3B82F6" />
                    <Text className="text-gray-600 font-rubik text-xs ml-2">
                      Green = Has available slots • Red = Fully booked day
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}


          {/* Basic Availability Info - For long-term rental properties */}
          {property.propertyType === 'rent' && !(
            property.type === 'Villa' || 
            property.type === 'Townhomes' || 
            property.type === 'House' && property.furnishedStatus === true ||
            property.type === 'Apartment' && property.furnishedStatus === true ||
            property.type === 'Condos' && property.furnishedStatus === true
          ) && (
            <View className="bg-white mb-1 shadow-lg p-6">
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Availability</Text>
                
                {/* Available Date */}
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="calendar-outline" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-rubik-medium text-base">Available From</Text>
                    <Text className="text-gray-600 font-rubik">
                      {property.availableDate 
                        ? new Date(property.availableDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Available Now'
                      }
                    </Text>
                  </View>
                </View>

                {/* Rental Type */}
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="home-outline" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-rubik-medium text-base">Rental Type</Text>
                    <Text className="text-gray-600 font-rubik">
                      {property.furnishedStatus 
                        ? 'Furnished - Perfect for Tourists & Staycation' 
                        : 'Unfurnished - Long-term Rental (6+ months)'
                      }
                    </Text>
                  </View>
                </View>

                {/* Minimum Stay */}
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-rubik-medium text-base">Minimum Stay</Text>
                    <Text className="text-gray-600 font-rubik">
                      {property.furnishedStatus ? '2 nights minimum' : '6 months minimum'}
                    </Text>
                  </View>
                </View>

                {/* Booking Status */}
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle-outline" size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-rubik-medium text-base">Booking Status</Text>
                    <Text className="text-green-600 font-rubik-medium">
                      Available for Booking
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          
          <View className="bg-white mb-1 shadow-lg p-6">
            {/* Facilities */}
            <View className="mb-4">
              <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Facilities</Text>
              <FlatList
                data={[
                  { icon: 'bed-outline', text: `${property.bedrooms || 0} Beds` },
                  { icon: 'water-outline', text: `${property.bathrooms || 0} Baths` },
                  { icon: 'restaurant-outline', text: `${property.kitchens || 1} Kitchen` },
                  { icon: 'resize-outline', text: `${property.area || 0} sq ft` },
                  { icon: 'car-outline', text: `${property.parkingSpaces || 1} Parking` },
                  { icon: 'calendar-outline', text: property.availableDate ? new Date(property.availableDate).toLocaleDateString() : 'Available Now' }
                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View className="mr-4">
                    <View className="flex-row items-center bg-gray-50 rounded-full px-4 py-2">
                      <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                      <Text className="text-gray-600 font-rubik ml-2">
                        {item.text}
                      </Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 0 }}
              />
            </View>

            {/* Property Details - Buying */}
            {property.propertyType === 'sell' && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Details</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Year Built</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.yearBuilt || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Property Age</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.propertyAge || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Lot Size</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.lotSize || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Condition</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.propertyCondition || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">HOA Fees</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.hoaFees ? `${property.hoaFees}/mo` : 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Property Taxes</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.propertyTaxes ? `${property.propertyTaxes}/yr` : 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Property Details - Renting */}
            {property.propertyType === 'rent' && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Rental Details</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Lease Duration</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.leaseDuration || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Security Deposit</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.deposit ? `${property.deposit}` : 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Pet Deposit</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.petDeposit ? `${property.petDeposit}` : 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Available Date</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.availableDate || 'N/A'}</Text>
                  </View>
                  <View className="w-full mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Utilities</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.utilities || 'N/A'}</Text>
                  </View>
                  <View className="w-full mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Move-in Requirements</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.moveInRequirements || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Property Features */}
            {(property.furnishedStatus || property.petFriendly || property.hasHOA || property.hasPool || property.hasGarage || property.utilitiesIncluded || property.smokingAllowed || property.backgroundCheckRequired) && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Features</Text>
                <View className="flex-row flex-wrap">
                  {property.furnishedStatus && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Furnished</Text>
                      </View>
                    </View>
                  )}
                  {property.petFriendly && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Pet Friendly</Text>
                      </View>
                    </View>
                  )}
                  {property.hasHOA && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Has HOA</Text>
                      </View>
                    </View>
                  )}
                  {property.hasPool && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Has Pool</Text>
                      </View>
                    </View>
                  )}
                  {property.hasGarage && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Has Garage</Text>
                      </View>
                    </View>
                  )}
                  {property.utilitiesIncluded && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Utilities Included</Text>
                      </View>
                    </View>
                  )}
                  {property.smokingAllowed && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Smoking Allowed</Text>
                      </View>
                    </View>
                  )}
                  {property.backgroundCheckRequired && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Background Check</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Amenities */}
            {property.amenities && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Amenities</Text>
                <Text className="text-gray-600 font-rubik leading-6">{property.amenities}</Text>
              </View>
            )}
          </View>


          <View className="bg-white shadow-lg p-6">
            {/* Contact Information */}
            <View className="mb-6">
              <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Contact Information</Text>
              <View className="space-y-3">
                {property.contactPhone && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="call-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-900 font-rubik-medium">{property.contactPhone}</Text>
                  </View>
                )}
                {property.contactEmail && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="mail-outline" size={20} color="#10B981" />
                    </View>
                    <Text className="text-gray-900 font-rubik-medium">{property.contactEmail}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity 
            className="bg-purple-100 py-4 rounded-full flex-row items-center justify-center mb-4"
            onPress={() => {
              router.push({
                pathname: '/(root)/(tabs)/explore',
                params: {
                  propertyId: property.$id,
                  propertyType: property.type,
                  latitude: property.latitude?.toString(),
                  longitude: property.longitude?.toString(),
                  openModal: 'true'
                }
              });
            }}
          >
            <Ionicons name="map-outline" size={20} color="#8B5CF6" />
            <Text className="text-purple-600 font-rubik-bold ml-2">Explore The Property</Text>
          </TouchableOpacity>

        </View>
        </View>
      </ScrollView>

      {/* Time Slots / Booking Modal */}
      <Modal
        visible={showTimeSlots}
        transparent={true}
        animationType="fade"
        onRequestClose={closeTimeSlots}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-rubik-bold text-gray-900">
                {property?.propertyType === 'sell' ? 'Select Viewing Time' : 'Booking Details'}
              </Text>
              <TouchableOpacity onPress={closeTimeSlots}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-600 font-rubik mb-4">
              {currentMonth.toLocaleDateString('en-US', { month: 'long' })} {selectedDate}, {currentMonth.getFullYear()}
            </Text>

            {/* Viewing Time Slots for Sale Properties */}
            {property?.propertyType === 'sell' && (
              <View className="mb-4">
                <Text className="text-gray-900 font-rubik-bold text-base mb-3">Available Time Slots</Text>
                <View className="flex-row flex-wrap gap-2">
                  {availableSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleTimeSlotSelect(slot.time)}
                      className={`px-4 py-3 rounded-lg border ${
                        slot.available 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                      disabled={!slot.available}
                    >
                      <Text className={`font-rubik ${
                        slot.available 
                          ? 'text-green-700' 
                          : 'text-red-500'
                      }`}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <Text className="text-blue-600 font-rubik-bold text-sm mb-1">Viewing Information</Text>
                  <Text className="text-blue-500 font-rubik text-xs">
                    • Each viewing lasts 30-60 minutes
                  </Text>
                  <Text className="text-blue-500 font-rubik text-xs">
                    • You'll receive confirmation details via email
                  </Text>
                </View>
              </View>
            )}

            {/* Booking Details for Rental Properties */}
            {property?.propertyType === 'rent' && (
              <>
                {/* Check-in/Checkout Times */}
                <View className="mb-4">
                  <Text className="text-gray-900 font-rubik-bold text-base mb-3">Check-in & Checkout Times</Text>
              
              <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="log-in" size={16} color="#10B981" />
                  <Text className="text-gray-700 font-rubik-medium ml-2">Check-in</Text>
                </View>
                <Text className="text-gray-900 font-rubik-bold">3:00 PM</Text>
              </View>
              
              <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
                <View className="flex-row items-center">
                  <Ionicons name="log-out" size={16} color="#EF4444" />
                  <Text className="text-gray-700 font-rubik-medium ml-2">Checkout</Text>
                </View>
                <Text className="text-gray-900 font-rubik-bold">11:00 AM</Text>
              </View>
            </View>

            {/* Days Selection */}
            <View className="mb-4">
              <Text className="text-gray-900 font-rubik-bold text-base mb-3">How many days will you be staying?</Text>
              
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-600 font-rubik">Number of days:</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setRequestedDays(Math.max(1, requestedDays - 1))}
                    className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                    disabled={requestedDays <= 1}
                  >
                    <Ionicons name="remove" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <Text className="text-gray-900 font-rubik-bold text-lg mx-4 min-w-[40px] text-center">
                    {requestedDays}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newDays = requestedDays + 1;
                      if (newDays <= maxConsecutiveDays) {
                        setRequestedDays(newDays);
                      } else {
                        // Show message about blocked dates
                        const availability = checkDaysAvailability(selectedDate!, newDays, currentMonth);
                        if (!availability.isAvailable) {
                          const blockedDatesText = availability.blockedDates
                            .map(d => d.date)
                            .join(', ');
                          alert(`Cannot book ${newDays} days. The following dates are already booked:\n\n${blockedDatesText}\n\nMaximum available: ${maxConsecutiveDays} consecutive days from this date.`);
                        }
                      }
                    }}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      requestedDays >= maxConsecutiveDays 
                        ? 'bg-red-200' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <Ionicons 
                      name="add" 
                      size={16} 
                      color={requestedDays >= maxConsecutiveDays ? "#EF4444" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Availability Warning */}
              {maxConsecutiveDays < requestedDays && (
                <View className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text className="text-yellow-700 font-rubik-medium ml-2 text-sm">Limited Availability</Text>
                  </View>
                  <Text className="text-yellow-600 font-rubik text-xs mt-1">
                    Only {maxConsecutiveDays} consecutive days available from this date. Some dates in your selection are already booked.
                  </Text>
                </View>
              )}

              {/* Booking Summary */}
              <View className="p-3 bg-blue-50 rounded-lg">
                <Text className="text-blue-700 font-rubik-bold text-sm mb-1">Booking Summary</Text>
                <Text className="text-blue-600 font-rubik text-xs">
                  {requestedDays} day{requestedDays > 1 ? 's' : ''} • Total: ${(property?.price || 0) * requestedDays}
                </Text>
              </View>
            </View>

                {/* Continue Button */}
                <TouchableOpacity
                  onPress={() => {
                    if (maxConsecutiveDays >= requestedDays) {
                      setShowTimeSlots(false);
                      setShowBookingConfirmation(true);
                    } else {
                      // Show detailed availability information
                      const availability = checkDaysAvailability(selectedDate!, requestedDays, currentMonth);
                      if (!availability.isAvailable) {
                        const blockedDatesText = availability.blockedDates
                          .map(d => d.date)
                          .join(', ');
                        alert(`Cannot book ${requestedDays} days. The following dates are already booked:\n\n${blockedDatesText}\n\nMaximum available: ${maxConsecutiveDays} consecutive days from this date.`);
                      }
                    }
                  }}
                  className={`py-3 px-4 rounded-lg ${
                    maxConsecutiveDays >= requestedDays 
                      ? 'bg-blue-600' 
                      : 'bg-red-500'
                  }`}
                >
                  <Text className={`text-center font-rubik-bold ${
                    maxConsecutiveDays >= requestedDays 
                      ? 'text-white' 
                      : 'text-white'
                  }`}>
                    {maxConsecutiveDays >= requestedDays ? 'Continue to Booking' : 'Show Blocked Dates'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showBookingConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelBooking}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-rubik-bold text-gray-900">
                {property?.propertyType === 'sell' ? 'Confirm Viewing Appointment' : 'Confirm Booking'}
              </Text>
              <TouchableOpacity onPress={cancelBooking}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {/* Property Info */}
            <View className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-900 font-rubik-bold text-base mb-1">
                {property?.name || 'Property'}
              </Text>
              <Text className="text-gray-600 font-rubik text-sm">
                {property?.address || 'Address not specified'}
              </Text>
            </View>

            {/* Booking/Viewing Details */}
            <View className="mb-4">
              <Text className="text-gray-900 font-rubik-bold text-base mb-3">
                {property?.propertyType === 'sell' ? 'Viewing Details' : 'Booking Details'}
              </Text>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={16} color="#3B82F6" />
                <Text className="text-gray-600 font-rubik ml-2">
                  {currentMonth.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {property?.propertyType === 'rent' && ` - ${(() => {
                    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate!);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + requestedDays - 1);
                    return endDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                  })()}`}
                </Text>
              </View>
              
              {property?.propertyType === 'sell' && selectedTimeSlot && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time" size={16} color="#3B82F6" />
                  <Text className="text-gray-600 font-rubik ml-2">
                    Viewing Time: {selectedTimeSlot}
                  </Text>
                </View>
              )}
              
              {property?.propertyType === 'rent' && (
                <>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time" size={16} color="#3B82F6" />
                    <Text className="text-gray-600 font-rubik ml-2">
                      {requestedDays} day{requestedDays > 1 ? 's' : ''} • Check-in: 3:00 PM • Checkout: 11:00 AM
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="people" size={16} color="#3B82F6" />
                    <Text className="text-gray-600 font-rubik ml-2">
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cash" size={16} color="#3B82F6" />
                    <Text className="text-gray-600 font-rubik ml-2">
                      Total: ₱{(property?.price || 0) * requestedDays} PHP
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Guest Count - Only for rental properties */}
            {property?.propertyType === 'rent' && (
              <View className="mb-4">
                <Text className="text-gray-900 font-rubik-bold text-base mb-2">Number of Guests</Text>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                >
                  <Ionicons name="remove" size={16} color="#666" />
                </TouchableOpacity>
                <Text className="mx-4 text-lg font-rubik-bold">{guests}</Text>
                <TouchableOpacity 
                  onPress={() => setGuests(guests + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              </View>
            )}

            {/* Special Requests - Only for rental properties */}
            {property?.propertyType === 'rent' && (
              <View className="mb-4">
                <Text className="text-gray-900 font-rubik-bold text-base mb-2">Special Requests (Optional)</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                placeholder="Any special requirements or notes..."
                placeholderTextColor="#9CA3AF"
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              </View>
            )}

            {/* Contact Info */}
            <View className="mb-6 p-3 bg-blue-50 rounded-lg">
              <Text className="text-blue-600 font-rubik-bold text-sm mb-1">Contact Information</Text>
              <Text className="text-gray-600 font-rubik text-xs">
                {property?.propertyType === 'sell' 
                  ? 'You will receive a confirmation email with viewing details and property owner contact information.'
                  : 'You will receive a confirmation email with property details and contact information.'
                }
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={cancelBooking}
                className="flex-1 py-3 px-4 bg-gray-100 rounded-lg"
              >
                <Text className="text-gray-600 font-rubik-bold text-center">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={confirmBooking}
                disabled={isCreatingBooking}
                className={`flex-1 py-3 px-4 rounded-lg ${isCreatingBooking ? 'bg-gray-400' : 'bg-blue-500'}`}
              >
                {isCreatingBooking ? (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white font-rubik-bold mr-2">Creating...</Text>
                    <Ionicons name="hourglass" size={16} color="white" />
                  </View>
                ) : (
                  <Text className="text-white font-rubik-bold text-center">
                    {property?.propertyType === 'sell' ? 'Confirm Viewing' : 'Confirm Booking'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Form Modal */}
      <ReviewForm
        visible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleSubmitReview}
        loading={submittingReview}
        propertyName={property?.name || 'Property'}
      />
    </View>
  );
};

export default Property;