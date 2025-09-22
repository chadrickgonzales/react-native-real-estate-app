import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPropertiesByOwner } from "@/lib/appwrite";
import { cancelBooking, confirmBooking, getOwnerBookings } from "@/lib/booking";
import { useGlobalContext } from "@/lib/global-provider";
import { createImageSource } from "@/lib/imageUtils";

const OwnerDashboard = () => {
  const { user } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings'>('overview');
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load properties and bookings in parallel
      const [propertiesData, bookingsData] = await Promise.all([
        getPropertiesByOwner(user.$id),
        getOwnerBookings(user.$id)
      ]);
      
      setProperties(propertiesData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
      // Refresh data after confirmation
      await loadDashboardData();
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId, 'Cancelled by property owner');
      // Refresh data after cancellation
      await loadDashboardData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const renderOverview = () => (
    <View className="flex-1">
      {/* Stats Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="home" size={24} color="#3B82F6" />
            <Text className="text-2xl font-rubik-bold text-gray-900">{properties.length}</Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm">Properties</Text>
        </View>
        
        <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="calendar" size={24} color="#10B981" />
            <Text className="text-2xl font-rubik-bold text-gray-900">{bookings.length}</Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm">Total Bookings</Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="time" size={24} color="#F59E0B" />
            <Text className="text-2xl font-rubik-bold text-gray-900">
              {bookings.filter(b => b.status === 'pending').length}
            </Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm">Pending</Text>
        </View>
        
        <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text className="text-2xl font-rubik-bold text-gray-900">
              {bookings.filter(b => b.status === 'confirmed').length}
            </Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm">Confirmed</Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="checkmark-done-circle" size={24} color="#3B82F6" />
            <Text className="text-2xl font-rubik-bold text-gray-900">
              {bookings.filter(b => b.status === 'completed').length}
            </Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm">Completed</Text>
        </View>
        
        <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="close-circle" size={24} color="#EF4444" />
            <Text className="text-2xl font-rubik-bold text-gray-900">
              {bookings.filter(b => b.status === 'cancelled').length}
            </Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm">Cancelled</Text>
        </View>
      </View>

      {/* Recent Bookings */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-rubik-bold text-gray-900">Recent Bookings</Text>
          <TouchableOpacity onPress={() => setActiveTab('bookings')}>
            <Text className="text-blue-500 font-rubik-medium">View All</Text>
          </TouchableOpacity>
        </View>
        
        {bookings.slice(0, 3).map((booking) => (
          <View key={booking.$id} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <View className="flex-1">
              <Text className="font-rubik-bold text-gray-900">{booking.propertyName}</Text>
              <Text className="text-sm text-gray-600 font-rubik">
                {formatDate(booking.bookingDate)} at {formatTime(booking.bookingTime)}
              </Text>
            </View>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
              <Text className={`text-xs font-rubik-medium ${getStatusColor(booking.status).split(' ')[1]}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Text>
            </View>
          </View>
        ))}
        
        {bookings.length === 0 && (
          <Text className="text-gray-500 font-rubik text-center py-4">No bookings yet</Text>
        )}
      </View>
    </View>
  );

  const renderProperties = () => (
    <View className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-rubik-bold text-gray-900">My Properties</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.push('/add-property')}
        >
          <Text className="text-white font-rubik-bold">Add Property</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={properties}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push(`/(root)/properties/${item.$id}`)}
          >
            <Image
              source={createImageSource(item.image || item.images?.[0])}
              className="w-full h-48 rounded-lg mb-3"
              resizeMode="cover"
            />
            <Text className="font-rubik-bold text-lg text-gray-900 mb-1">{item.name}</Text>
            <Text className="text-gray-600 font-rubik mb-2">{item.address}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-blue-500 font-rubik-bold text-lg">₱{item.price?.toLocaleString()}</Text>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text className="text-gray-600 font-rubik ml-1">
                  {bookings.filter(b => b.propertyId === item.$id).length} bookings
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-8">
            <Ionicons name="home-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 font-rubik text-center mt-4">No properties yet</Text>
            <Text className="text-gray-400 font-rubik text-center">Add your first property to get started</Text>
          </View>
        )}
      />
    </View>
  );

  const renderBookings = () => (
    <View className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-rubik-bold text-gray-900">All Bookings</Text>
        <View className="flex-row">
          <TouchableOpacity 
            className={`px-3 py-1 rounded-lg mr-2 ${activeTab === 'overview' ? 'bg-blue-500' : 'bg-gray-200'}`}
            onPress={() => setActiveTab('overview')}
          >
            <Text className={`font-rubik-medium ${activeTab === 'overview' ? 'text-white' : 'text-gray-600'}`}>
              All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="font-rubik-bold text-lg text-gray-900 mb-1">{item.propertyName}</Text>
                <Text className="text-gray-600 font-rubik mb-2">{item.propertyAddress}</Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text className="text-gray-600 font-rubik ml-2">
                    {formatDate(item.bookingDate)} at {formatTime(item.bookingTime)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text className="text-gray-600 font-rubik ml-2">{item.guests} guests</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                <Text className={`text-sm font-rubik-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            
            {item.specialRequests && (
              <View className="bg-gray-50 rounded-lg p-3 mb-3">
                <Text className="text-gray-600 font-rubik text-sm">
                  <Text className="font-rubik-bold">Special Requests:</Text> {item.specialRequests}
                </Text>
              </View>
            )}
            
            <View className="flex-row items-center justify-between">
              <Text className="text-blue-500 font-rubik-bold text-lg">₱{item.totalAmount?.toLocaleString()}</Text>
              <View className="flex-row">
                {item.status === 'pending' && (
                  <>
                    <TouchableOpacity 
                      className="bg-green-500 px-4 py-2 rounded-lg mr-2"
                      onPress={() => handleConfirmBooking(item.$id)}
                    >
                      <Text className="text-white font-rubik-bold text-sm">Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="bg-red-500 px-4 py-2 rounded-lg mr-2"
                      onPress={() => handleCancelBooking(item.$id)}
                    >
                      <Text className="text-white font-rubik-bold text-sm">Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg">
                  <Text className="text-gray-700 font-rubik-bold text-sm">View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-8">
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 font-rubik text-center mt-4">No bookings yet</Text>
            <Text className="text-gray-400 font-rubik text-center">Bookings will appear here when customers book your properties</Text>
          </View>
        )}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="hourglass" size={48} color="#3B82F6" />
          <Text className="text-gray-600 font-rubik mt-4">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <View>
          <Text className="text-xl font-rubik-bold text-gray-900">Owner Dashboard</Text>
          <Text className="text-gray-600 font-rubik">Manage your properties and bookings</Text>
        </View>
        <TouchableOpacity 
          className="bg-gray-100 p-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white px-4 py-2">
        <TouchableOpacity 
          className={`flex-1 py-3 px-4 rounded-lg mr-2 ${activeTab === 'overview' ? 'bg-blue-500' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('overview')}
        >
          <Text className={`font-rubik-bold text-center ${activeTab === 'overview' ? 'text-white' : 'text-gray-600'}`}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 px-4 rounded-lg mx-1 ${activeTab === 'properties' ? 'bg-blue-500' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('properties')}
        >
          <Text className={`font-rubik-bold text-center ${activeTab === 'properties' ? 'text-white' : 'text-gray-600'}`}>
            Properties
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 px-4 rounded-lg ml-2 ${activeTab === 'bookings' ? 'bg-blue-500' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('bookings')}
        >
          <Text className={`font-rubik-bold text-center ${activeTab === 'bookings' ? 'text-white' : 'text-gray-600'}`}>
            Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'properties' && renderProperties()}
        {activeTab === 'bookings' && renderBookings()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OwnerDashboard;
