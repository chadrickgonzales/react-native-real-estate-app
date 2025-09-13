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

// Mock favorites data - replace with actual API calls
const mockFavorites = [
  {
    id: '1',
    propertyId: 'prop1',
    propertyName: 'Modern Downtown Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    propertyAddress: '123 Main St, Downtown',
    price: 1200,
    priceType: 'per night',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    propertyType: 'Apartment',
    rating: 4.8,
    reviews: 124,
    addedDate: '2024-01-15',
    amenities: ['WiFi', 'Parking', 'Pool', 'Gym']
  },
  {
    id: '2',
    propertyId: 'prop2',
    propertyName: 'Luxury Villa with Pool',
    propertyImage: 'https://images.unsplash.com/photo-1605146768851-eda79da39897?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    propertyAddress: '456 Ocean View, Beachside',
    price: 2800,
    priceType: 'per night',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    propertyType: 'Villa',
    rating: 4.9,
    reviews: 89,
    addedDate: '2024-01-20',
    amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Beach Access']
  },
  {
    id: '3',
    propertyId: 'prop3',
    propertyName: 'Cozy Studio in City Center',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    propertyAddress: '789 Central Ave, City Center',
    price: 450,
    priceType: 'per night',
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    propertyType: 'Studio',
    rating: 4.6,
    reviews: 67,
    addedDate: '2024-01-25',
    amenities: ['WiFi', 'Parking']
  }
]

interface FavoriteProperty {
  id: string
  propertyId: string
  propertyName: string
  propertyImage: string
  propertyAddress: string
  price: number
  priceType: string
  bedrooms: number
  bathrooms: number
  area: number
  propertyType: string
  rating: number
  reviews: number
  addedDate: string
  amenities: string[]
}

const FavoriteCard = ({ property }: { property: FavoriteProperty }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleRemoveFavorite = (propertyId: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this property from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'Property removed from favorites!')
        }}
      ]
    )
  }

  const handleBookNow = (propertyId: string) => {
    Alert.alert('Book Now', 'Redirecting to booking page...')
    // router.push(`/booking/${propertyId}`)
  }

  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
      {/* Property Image and Actions */}
      <View className="relative mb-6">
        <Image
          source={createImageSource(property.propertyImage)}
          className="w-full h-48 rounded-xl"
          resizeMode="cover"
        />
        <TouchableOpacity
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg"
          onPress={() => handleRemoveFavorite(property.id)}
        >
          <Ionicons name="heart" size={20} color="#FF6B6B" />
        </TouchableOpacity>
        <View className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full">
          <Text className="text-xs font-rubik-bold text-primary-300">{property.propertyType}</Text>
        </View>
      </View>

      {/* Property Details */}
      <View className="mb-6">
        <Text className="text-xl font-rubik-bold text-black-300 mb-2">{property.propertyName}</Text>
        <View className="flex-row items-center mb-3">
          <View className="w-5 h-5 items-center justify-center mr-2">
            <Ionicons name="location-outline" size={16} color="#666876" />
          </View>
          <Text className="text-sm font-rubik text-black-200 flex-1">{property.propertyAddress}</Text>
        </View>

        {/* Rating */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center mr-4">
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text className="text-sm font-rubik-bold text-black-300 ml-1">{property.rating}</Text>
            <Text className="text-sm font-rubik text-black-200 ml-1">({property.reviews} reviews)</Text>
          </View>
        </View>

        {/* Property Features */}
        <View className="flex-row items-center space-x-4 mb-3">
          <View className="flex-row items-center">
            <Ionicons name="bed-outline" size={16} color="#666876" />
            <Text className="text-sm font-rubik text-black-200 ml-1">{property.bedrooms}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="water-outline" size={16} color="#666876" />
            <Text className="text-sm font-rubik text-black-200 ml-1">{property.bathrooms}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="resize-outline" size={16} color="#666876" />
            <Text className="text-sm font-rubik text-black-200 ml-1">{property.area} sq ft</Text>
          </View>
        </View>

        {/* Amenities */}
        <View className="flex-row flex-wrap">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} className="bg-accent-100 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-xs font-rubik-medium text-black-300">{amenity}</Text>
            </View>
          ))}
          {property.amenities.length > 3 && (
            <View className="bg-accent-100 px-3 py-1 rounded-full mr-2 mb-2">
              <Text className="text-xs font-rubik-medium text-black-300">+{property.amenities.length - 3} more</Text>
            </View>
          )}
        </View>
      </View>

      {/* Price and Actions */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-rubik-bold text-primary-300">${property.price}</Text>
          <Text className="text-sm font-rubik text-black-200">{property.priceType}</Text>
          <Text className="text-xs font-rubik text-black-200">Added {formatDate(property.addedDate)}</Text>
        </View>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="bg-accent-100 px-4 py-3 rounded-xl active:bg-accent-200"
            onPress={() => router.push(`/properties/${property.propertyId}`)}
          >
            <Text className="text-black-300 font-rubik-bold">View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary-300 px-4 py-3 rounded-xl active:bg-primary-400"
            onPress={() => handleBookNow(property.propertyId)}
          >
            <Text className="text-white font-rubik-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>(mockFavorites)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const { user } = useGlobalContext()

  const filters = [
    { key: 'all', label: 'All Properties' },
    { key: 'apartment', label: 'Apartments' },
    { key: 'villa', label: 'Villas' },
    { key: 'studio', label: 'Studios' }
  ]

  const filteredFavorites = favorites.filter(property => 
    selectedFilter === 'all' || property.propertyType.toLowerCase() === selectedFilter
  )

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getFavoriteStats = () => {
    const total = favorites.length
    const apartments = favorites.filter(p => p.propertyType.toLowerCase() === 'apartment').length
    const villas = favorites.filter(p => p.propertyType.toLowerCase() === 'villa').length
    const studios = favorites.filter(p => p.propertyType.toLowerCase() === 'studio').length

    return { total, apartments, villas, studios }
  }

  const stats = getFavoriteStats()

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
          <Text className="text-xl font-rubik-bold text-black-300">My Favorites</Text>
          <TouchableOpacity>
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="search-outline" size={24} color="#191D31" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Favorites Stats */}
        <View className="mt-6 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-6 mb-6">
          <Text className="text-xl font-rubik-bold text-black-300 mb-6">Favorites Overview</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-primary-300">{stats.total}</Text>
              <Text className="text-sm font-rubik text-black-200">Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-blue-600">{stats.apartments}</Text>
              <Text className="text-sm font-rubik text-black-200">Apartments</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-green-600">{stats.villas}</Text>
              <Text className="text-sm font-rubik text-black-200">Villas</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-rubik-bold text-purple-600">{stats.studios}</Text>
              <Text className="text-sm font-rubik text-black-200">Studios</Text>
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

        {/* Favorites List */}
        {filteredFavorites.length > 0 ? (
          <FlatList
            data={filteredFavorites}
            renderItem={({ item }) => <FavoriteCard property={item} />}
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
            <Text className="text-xl font-rubik-bold text-black-300 mb-2">No Favorites Found</Text>
            <Text className="text-base font-rubik text-black-200 text-center mb-6">
              {selectedFilter === 'all' 
                ? "You haven't added any properties to favorites yet."
                : `No ${selectedFilter} properties in your favorites.`
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
