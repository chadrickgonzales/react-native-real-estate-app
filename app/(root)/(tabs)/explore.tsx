import Filters from '@/components/Filters';
import { getProperties } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// Custom User Location Marker Component
const UserLocationMarker = ({ location }: { location: any }) => {
  return (
    <Marker
      coordinate={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }}
      title="Your Location"
      description="You are here"
    >
      <View style={styles.userMarker}>
        <View style={styles.userMarkerContainer}>
          <Ionicons 
            name="person" 
            size={20} 
            color="white" 
          />
        </View>
      </View>
    </Marker>
  );
};

// Custom Property Marker Component
const PropertyMarker = ({ property, onPress }: { property: any; onPress: (property: any) => void }) => {
  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'house':
      case 'home':
        return 'home';
      case 'apartment':
        return 'business';
      case 'condo':
        return 'business-outline';
      case 'townhouse':
        return 'home-outline';
      case 'villa':
        return 'home-sharp';
      default:
        return 'home';
    }
  };

  const getPropertyColor = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'house':
      case 'home':
        return '#10B981'; // Green
      case 'apartment':
        return '#3B82F6'; // Blue
      case 'condo':
        return '#8B5CF6'; // Purple
      case 'townhouse':
        return '#F59E0B'; // Orange
      case 'villa':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: property.latitude,
        longitude: property.longitude,
      }}
      title={property.name || 'Property'}
      description={`$${property.price?.toLocaleString() || '0'} - ${property.bedrooms || 0} Bed, ${property.bathrooms || 0} Bath`}
      onPress={onPress}
    >
      <View style={styles.customMarker}>
        <View style={[
          styles.markerContainer, 
          { backgroundColor: getPropertyColor(property.type) }
        ]}>
          <Ionicons 
            name={getPropertyIcon(property.type)} 
            size={20} 
            color="white" 
          />
        </View>
        <View style={[
          styles.markerShadow, 
          { backgroundColor: getPropertyColor(property.type) }
        ]} />
      </View>
    </Marker>
  );
};

// Custom Map Style - Clean Light Theme (Non-Google Style)
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

const Explore = () => {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'rent' | 'sell'>('sell');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
  const [destinationProperty, setDestinationProperty] = useState<any>(null);

  // Fetch all properties with coordinates
  const { data: properties, loading: isLoading } = useAppwrite({
    fn: () => getProperties({ 
      filter: selectedCategory, 
      query: searchQuery, 
      limit: 100,
      propertyType: propertyTypeFilter
    }),
    params: {},
    skip: false,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Set map region to center on user's location
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // Set initial map region to user's location immediately
  useEffect(() => {
    if (location && !mapRegion) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location, mapRegion]);

  // Filter properties that have valid coordinates
  const propertiesWithCoords = properties?.filter((property: any) => 
    property.latitude && 
    property.longitude && 
    property.latitude !== 0 && 
    property.longitude !== 0
  ) || [];

  // Handle property marker press
  const handlePropertyPress = (property: any) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  // Close property modal
  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
    setShowRoute(false);
    setRouteCoordinates([]);
    setRemainingDistance(0);
    setTotalDistance(0);
    setRouteProgress(0);
    setDestinationProperty(null);
  };

  // Update route progress based on current location
  const updateRouteProgress = useCallback(() => {
    if (location && routeCoordinates.length > 0 && totalDistance > 0) {
      // Find the closest point on the route to current location
      let minDistance = Infinity;
      
      routeCoordinates.forEach((point, index) => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          point.latitude,
          point.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
        }
      });
      
      // Calculate remaining distance (simplified - distance from current position to destination)
      const destination = routeCoordinates[routeCoordinates.length - 1];
      const remainingDist = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        destination.latitude,
        destination.longitude
      );
      
      setRemainingDistance(remainingDist);
      setRouteProgress(((totalDistance - remainingDist) / totalDistance) * 100);
    }
  }, [location, routeCoordinates, totalDistance]);

  // Update progress when location changes
  useEffect(() => {
    if (showRoute && location) {
      updateRouteProgress();
    }
  }, [location, showRoute, totalDistance, updateRouteProgress]);

  // Get route from OpenRouteService API
  const getRoute = async (startLat: number, startLon: number, endLat: number, endLon: number) => {
    try {
      // Using OpenRouteService API (free tier available)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4YTMyYjkzNTYxNTQwZTI5NzE0MDJlZGQ3Y2UwZGU4IiwiaCI6Im11cm11cjY0In0=&start=${startLon},${startLat}&end=${endLon},${endLat}`
      );
      
      if (!response.ok) {
        throw new Error('Route service unavailable');
      }
      
      const data = await response.json();
      
      if (data.features && data.features[0] && data.features[0].geometry) {
        // Decode the polyline coordinates
        const coordinates = data.features[0].geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        // Get total distance from the route
        const totalDistanceKm = data.features[0].properties.summary.distance / 1000; // Convert meters to km
        
        return { coordinates, totalDistance: totalDistanceKm };
      }
      
      throw new Error('No route found');
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback to straight line if API fails
      const fallbackCoords = [
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon }
      ];
      const fallbackDistance = calculateDistance(startLat, startLon, endLat, endLon);
      return { coordinates: fallbackCoords, totalDistance: fallbackDistance };
    }
  };

  // Handle view property button
  const handleViewProperty = async () => {
    if (location && selectedProperty) {
      try {
        setIsCalculatingRoute(true);
        setShowRoute(false);
        setRouteCoordinates([]);
        
        // Get route from routing service
        const routeData = await getRoute(
          location.coords.latitude,
          location.coords.longitude,
          selectedProperty.latitude,
          selectedProperty.longitude
        );
        
        setRouteCoordinates(routeData.coordinates);
        setTotalDistance(routeData.totalDistance);
        setRemainingDistance(routeData.totalDistance);
        setRouteProgress(0);
        setDestinationProperty(selectedProperty);
        setShowRoute(true);
        setIsCalculatingRoute(false);
        
        // Close the modal
        setShowPropertyModal(false);
        setSelectedProperty(null);
      } catch (error) {
        console.error('Error creating route:', error);
        setIsCalculatingRoute(false);
        
        // Fallback to straight line
        const fallbackRoute = [
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          {
            latitude: selectedProperty.latitude,
            longitude: selectedProperty.longitude,
          }
        ];
        
        const fallbackDistance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          selectedProperty.latitude,
          selectedProperty.longitude
        );
        
        setRouteCoordinates(fallbackRoute);
        setTotalDistance(fallbackDistance);
        setRemainingDistance(fallbackDistance);
        setRouteProgress(0);
        setDestinationProperty(selectedProperty);
        setShowRoute(true);
        setShowPropertyModal(false);
        setSelectedProperty(null);
      }
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  if (errorMsg) {
    Alert.alert('Error', errorMsg);
  }

  return (
    <View style={styles.container}>
      {/* Search Bar and Filter */}
      <View className="absolute top-12 left-5 right-5 z-50 flex-row items-center gap-2 mt-2">
        {/* Search Bar */}
        <View className="flex-1 flex-row items-center mb-6 bg-white rounded-full shadow-lg">
          <View className="flex-1 bg-white rounded-full px-3 py-3 mr-1">
            <TextInput
              className="text-base font-rubik text-black-300"
              placeholder="Find something new"
              placeholderTextColor="#8c8e98"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-primary-300 w-16 h-16 rounded-full items-center justify-center mr-2">
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Rent/Buy Filter */}
        <TouchableOpacity
          className="bg-white w-16 h-16 mb-6 rounded-full items-center justify-center shadow-lg"
          onPress={() => setPropertyTypeFilter(propertyTypeFilter === 'sell' ? 'rent' : 'sell')}
          activeOpacity={1}
        >
          <Ionicons 
            name={propertyTypeFilter === 'sell' ? 'home-outline' : 'key-outline'} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <View className="absolute top-32 left-5 right-5 z-40 mt-6">
        <View className="bg-white px-2 py-2 rounded-full shadow-lg">
          <Filters 
            propertyType={propertyTypeFilter}
            onCategoryChange={setSelectedCategory}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0061FF" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={mapRegion || (location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          })}
          showsUserLocation={false}
          showsMyLocationButton={false}
          mapType="standard"
          customMapStyle={mapStyle}
        >
          {/* User's current location marker */}
          {location && (
            <UserLocationMarker location={location} />
          )}
          
          {/* Property markers from database */}
          {propertiesWithCoords.map((property, index) => (
            <PropertyMarker
              key={property.$id || index}
              property={property}
              onPress={() => handlePropertyPress(property)}
            />
          ))}

          {/* Route Polyline */}
          {showRoute && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0061FF"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {/* Route Progress FAB */}
      {showRoute && (
        <View style={styles.fabContainer}>
          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View style={[styles.progressFill, { 
              transform: [{ rotate: `${(routeProgress / 100) * 360}deg` }] 
            }]} />
          </View>
          
          {/* FAB Button */}
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => {
              // Show the destination property modal
              if (destinationProperty) {
                setSelectedProperty(destinationProperty);
                setShowPropertyModal(true);
              }
            }}
          >
            <Ionicons name="navigate" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Distance Text */}
          <Text style={styles.distanceText}>
            {remainingDistance.toFixed(1)} km
          </Text>
        </View>
      )}

      {/* Property Modal */}
      {showPropertyModal && selectedProperty && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closePropertyModal}
        >
              <TouchableOpacity
            style={styles.propertyModal}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Property Image */}
            <View style={styles.propertyImageContainer}>
              <Image
                source={
                  selectedProperty.images && selectedProperty.images.length > 0
                    ? { uri: selectedProperty.images[0] }
                    : require('@/assets/images/new-york.png')
                }
                style={styles.propertyImage}
                resizeMode="cover"
              />
              
              {/* Property Type Badge */}
              <View style={styles.propertyTypeBadge}>
                <Text style={styles.propertyTypeText}>
                  {selectedProperty.type || 'Property'}
                </Text>
              </View>
              
              {/* Favorite Button */}
              <TouchableOpacity style={styles.favoriteButton}>
                <Ionicons name="heart-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Property Details */}
            <View style={styles.propertyDetails}>
                {/* Title and Price Row */}
                <View style={styles.titlePriceRow}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {selectedProperty.name || 'Property Name'}
                  </Text>
                  <Text style={styles.propertyPrice}>
                    ${selectedProperty.price?.toLocaleString() || '0'}
                  </Text>
                </View>

              {/* Address and Distance Row */}
              <View style={styles.addressDistanceRow}>
                {/* Address */}
                <Text style={styles.propertyAddress} numberOfLines={1}>
                  {selectedProperty.address || 'Address not available'}
                </Text>

                {/* Distance from User */}
                {location && selectedProperty.latitude && selectedProperty.longitude && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location-outline" size={16} color="#10B981" />
                    <Text style={styles.modalDistanceText}>
                      {calculateDistance(
                        location.coords.latitude,
                        location.coords.longitude,
                        selectedProperty.latitude,
                        selectedProperty.longitude
                      ).toFixed(1)} km
                    </Text>
                  </View>
                )}
              </View>

              {/* Feature Badges */}
              <View style={styles.featureBadges}>
                <View style={styles.featureBadge}>
                  <Ionicons name="bed-outline" size={16} color="#666" />
                  <Text style={styles.featureText}>
                    {selectedProperty.bedrooms || 0} Beds
                  </Text>
                </View>
                <View style={styles.featureBadge}>
                  <Ionicons name="water-outline" size={16} color="#666" />
                  <Text style={styles.featureText}>
                    {selectedProperty.bathrooms || 0} Baths
                  </Text>
                </View>
                <View style={styles.featureBadge}>
                  <Ionicons name="resize-outline" size={16} color="#666" />
                  <Text style={styles.featureText}>
                    {selectedProperty.area || 0} Sqft
              </Text>
            </View>
          </View>

              {/* View/Cancel Button */}
              <TouchableOpacity 
                style={[styles.viewButton, isCalculatingRoute && styles.viewButtonDisabled]}
                onPress={showRoute ? () => {
                  setShowRoute(false);
                  setRouteCoordinates([]);
                  setRemainingDistance(0);
                  setTotalDistance(0);
                  setRouteProgress(0);
                  setDestinationProperty(null);
                  setShowPropertyModal(false);
                  setSelectedProperty(null);
                } : handleViewProperty}
                disabled={isCalculatingRoute}
              >
                {isCalculatingRoute ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.viewButtonText}>Calculating Route...</Text>
                  </>
                ) : showRoute ? (
                  <>
                    <Ionicons name="close-outline" size={20} color="white" />
                    <Text style={styles.viewButtonText}>Cancel Viewing</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="eye-outline" size={20} color="white" />
                    <Text style={styles.viewButtonText}>View Property</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerShadow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -2,
    opacity: 0.6,
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Property Modal Styles - Matching Home Page Card Design
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-end',
    paddingBottom: 100, // Above navigation bar
    paddingHorizontal: 20,
  },
  propertyModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  propertyImageContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  propertyTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  propertyTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyDetails: {
    paddingHorizontal: 8,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addressDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDistanceText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  featureBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#0061FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  viewButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Gradient Overlay
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  // FAB and Progress Ring Styles
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(0, 97, 255, 0.3)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#0061FF',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
  },
  fab: {
    marginTop: 5,
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: '#0061FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -45,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default Explore;