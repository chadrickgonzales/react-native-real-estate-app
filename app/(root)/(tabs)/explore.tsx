import Filters from '@/components/Filters';
import { getProperties } from '@/lib/appwrite';
import { calculateDistance, filterPropertiesByDistance, geocodeSearchTerm, getSearchSuggestions } from '@/lib/geocoding';
import { useGlobalContext } from '@/lib/global-provider';
import { useAppwrite } from '@/lib/useAppwrite';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';


// Custom Property Marker Component
const PropertyMarker = ({ property, onPress }: { property: any; onPress: (property: any) => void }) => {
  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'house':
      case 'home':
        return 'home'; // Traditional house icon
      case 'apartment':
        return 'business'; // Building icon for apartments
      case 'condo':
      case 'condos':
        return 'business-sharp'; // Modern building icon for condos
      case 'townhouse':
      case 'townhomes':
        return 'home-outline'; // Outlined house for townhouses
      case 'villa':
        return 'diamond'; // Diamond icon for luxury villas
      case 'duplex':
      case 'duplexes':
        return 'copy'; // Copy icon representing duplex structure
      case 'studio':
      case 'studios':
        return 'square'; // Square icon for studios
      default:
        return 'home'; // Default house icon
    }
  };

  const getPropertyColor = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'house':
      case 'home':
        return '#10B981'; // Emerald Green - Traditional homes
      case 'apartment':
        return '#3B82F6'; // Blue - Modern apartments
      case 'condo':
      case 'condos':
        return '#8B5CF6'; // Purple - Luxury condos
      case 'townhouse':
      case 'townhomes':
        return '#F59E0B'; // Amber - Townhouses
      case 'villa':
        return '#EF4444'; // Red - Luxury villas
      case 'duplex':
      case 'duplexes':
        return '#06B6D4'; // Cyan - Duplexes
      case 'studio':
      case 'studios':
        return '#84CC16'; // Lime Green - Studios
      default:
        return '#6B7280'; // Gray - Default
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
      <View className="items-center justify-center">
        <View 
          className="w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-lg"
          style={{ backgroundColor: getPropertyColor(property.type) }}
        >
          <Ionicons 
            name={getPropertyIcon(property.type)} 
            size={16} 
            color="white" 
          />
        </View>
        <View 
          className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent -mt-px shadow-sm"
          style={{ borderTopColor: getPropertyColor(property.type) }}
        />
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
  const { location, locationLoading, locationError, mapPreloaded } = useGlobalContext();
  const params = useLocalSearchParams<{
    propertyId?: string;
    propertyType?: string;
    latitude?: string;
    longitude?: string;
    openModal?: string;
  }>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'rent' | 'sell'>('sell');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLocation, setSearchLocation] = useState<{latitude: number, longitude: number, placeName: string} | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
  const [destinationProperty, setDestinationProperty] = useState<any>(null);
  const [currentInstruction, setCurrentInstruction] = useState('Continue straight');
  const [nextInstruction, setNextInstruction] = useState('');
  const [showNextInstruction, setShowNextInstruction] = useState(false);
  const [eta, setEta] = useState('1 hr 13 min');
  const [arrivalTime, setArrivalTime] = useState('10:28 AM');
  const [showArrivalPrompt, setShowArrivalPrompt] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const lastLocationRef = useRef<any>(null);
  const lastLocationTimeRef = useRef<number>(0);
  const [cameraMode, setCameraMode] = useState<'free' | 'following' | 'navigation'>('free');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<any>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch all properties with coordinates
  const { data: properties, loading: isLoading, refetch: refetchProperties } = useAppwrite({
    fn: ({ filter, query, limit, propertyType }: { filter: string; query: string; limit: number; propertyType: string }) => 
      getProperties({
        filter,
        query,
        limit,
        propertyType,
      }),
    params: {
      filter: selectedCategory,
      query: searchQuery,
      limit: 100,
      propertyType: propertyTypeFilter,
    },
    skip: false,
  });

  // Set map region when location is available from global context
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

  // Handle incoming parameters from property detail page
  useEffect(() => {
    if (params.openModal === 'true' && params.propertyId && params.latitude && params.longitude) {
      // Set the property type filter if provided and different from current
      if (params.propertyType && params.propertyType !== propertyTypeFilter) {
        setPropertyTypeFilter(params.propertyType as 'rent' | 'sell');
      }
      
      // Pan camera to the specific property location
      const targetLatitude = parseFloat(params.latitude);
      const targetLongitude = parseFloat(params.longitude);
      
      if (!isNaN(targetLatitude) && !isNaN(targetLongitude)) {
        setMapRegion({
          latitude: targetLatitude,
          longitude: targetLongitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    }
  }, [params.openModal, params.propertyId, params.latitude, params.longitude, params.propertyType]);

  // Separate effect to handle opening the modal when properties are loaded
  useEffect(() => {
    if (params.openModal === 'true' && params.propertyId && properties && properties.length > 0) {
      const targetProperty = properties.find(p => p.$id === params.propertyId);
      if (targetProperty && (!selectedProperty || selectedProperty.$id !== targetProperty.$id)) {
        setSelectedProperty(targetProperty);
        setShowPropertyModal(true);
      }
    }
  }, [params.openModal, params.propertyId, properties, selectedProperty]);

  // Cleanup effect to close modal when navigating away or parameters change
  useEffect(() => {
    // If openModal is not 'true' or propertyId changes, close the modal
    if (params.openModal !== 'true' || !params.propertyId) {
      setShowPropertyModal(false);
      setSelectedProperty(null);
    }
  }, [params.openModal, params.propertyId]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      setShowPropertyModal(false);
      setSelectedProperty(null);
    };
  }, []);

  // Function to manually close modal and clear parameters
  const closeModalAndClearParams = () => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
    // Clear the URL parameters by navigating to the same route without params
    router.replace('/(root)/(tabs)/explore');
  };

  // Memoize the map region to prevent unnecessary re-renders
  const stableMapRegion = useMemo(() => {
    return mapRegion || {
      latitude: location?.coords.latitude || 0,
      longitude: location?.coords.longitude || 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [mapRegion, location?.coords.latitude, location?.coords.longitude]);

  // Track initial load completion
  useEffect(() => {
    if (!isLoading && !locationLoading && mapPreloaded && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, locationLoading, mapPreloaded, isInitialLoad]);

  // Search is now handled automatically by useAppwrite hook when searchQuery changes

  // Filter properties that have valid coordinates - memoized to prevent unnecessary re-filtering
  const propertiesWithCoords = useMemo(() => {
    let filteredProperties = properties?.filter((property: any) => 
      property.latitude && 
      property.longitude && 
      property.latitude !== 0 && 
      property.longitude !== 0
    ) || [];

    // If search location is set, filter by distance
    if (searchLocation) {
      filteredProperties = filterPropertiesByDistance(
        filteredProperties,
        searchLocation.latitude,
        searchLocation.longitude,
        2.5 // 2.5km radius
      );
      
      // Sort by distance (closest to farthest)
      filteredProperties = filteredProperties.sort((a, b) => {
        const distanceA = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          (a as any).latitude,
          (a as any).longitude
        );
        const distanceB = calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          (b as any).latitude,
          (b as any).longitude
        );
        return distanceA - distanceB; // Closest first
      });
    }

    return filteredProperties;
  }, [properties, searchLocation]);

  // Handle property marker press
  const handlePropertyPress = (property: any) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.length >= 2) {
      const suggestions = getSearchSuggestions(text);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchLocation(null);
      return;
    }

    const geocodeResult = await geocodeSearchTerm(searchQuery);
    if (geocodeResult) {
      setSearchLocation({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        placeName: geocodeResult.placeName
      });
      setShowSuggestions(false);
      
      // Pan camera to the searched location
      setMapRegion({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      // If no geocoding result, clear location and show all properties
      setSearchLocation(null);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    
    const geocodeResult = await geocodeSearchTerm(suggestion);
    if (geocodeResult) {
      setSearchLocation({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        placeName: geocodeResult.placeName
      });
      
      // Pan camera to the searched location
      setMapRegion({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
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
    setCurrentSpeed(0);
    lastLocationRef.current = null;
    lastLocationTimeRef.current = 0;
    setCurrentInstruction('Continue straight');
    // Clear URL parameters if they exist
    if (params.openModal === 'true') {
      router.replace('/(root)/(tabs)/explore');
    }
    setNextInstruction('');
    setShowNextInstruction(false);
    setEta('1 hr 13 min');
    setArrivalTime('10:28 AM');
    setCameraMode('free');
    setShowArrivalPrompt(false);
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

  // Add intermediate points to short routes for better turn detection
  const addIntermediatePoints = useCallback((coordinates: any[]) => {
    if (coordinates.length < 2) return coordinates;
    
    const newCoordinates = [coordinates[0]]; // Start with first point
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const current = coordinates[i];
      const next = coordinates[i + 1];
      
      // Add the current point
      newCoordinates.push(current);
      
      // Calculate distance between points
      const distance = calculateDistance(
        current.latitude, current.longitude,
        next.latitude, next.longitude
      );
      
      // If distance is large, add intermediate points
      if (distance > 0.1) { // More than 100m
        const numPoints = Math.ceil(distance / 0.05); // Add point every 50m
        
        for (let j = 1; j < numPoints; j++) {
          const ratio = j / numPoints;
          const lat = current.latitude + (next.latitude - current.latitude) * ratio;
          const lng = current.longitude + (next.longitude - current.longitude) * ratio;
          
          newCoordinates.push({ latitude: lat, longitude: lng });
        }
      }
    }
    
    // Add the last point
    newCoordinates.push(coordinates[coordinates.length - 1]);
    
    console.log('Added intermediate points:', {
      original: coordinates.length,
      new: newCoordinates.length
    });
    
    return newCoordinates;
  }, []);

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
        let coordinates = data.features[0].geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        // If route has too few points, add intermediate points
        if (coordinates.length < 5) {
          console.log('Route too short, adding intermediate points');
          coordinates = addIntermediatePoints(coordinates);
        }
        
        // Get total distance from the route
        const totalDistanceKm = data.features[0].properties.summary.distance / 1000; // Convert meters to km
        
        console.log('Route generated:', {
          originalPoints: data.features[0].geometry.coordinates.length,
          finalPoints: coordinates.length,
          totalDistance: totalDistanceKm
        });
        
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
        
        // Enable navigation camera mode
        setCameraMode('navigation');
        
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


  // Calculate speed in km/h
  const calculateSpeed = (distance: number, timeDiff: number) => {
    if (timeDiff === 0) return 0;
    const speedKmh = (distance / timeDiff) * 3600; // Convert to km/h
    return Math.max(0, Math.min(speedKmh, 200)); // Cap between 0-200 km/h
  };

  // Format time duration
  const formatDuration = (hours: number) => {
    if (hours < 1/60) { // Less than 1 minute
      const seconds = Math.round(hours * 3600);
      return `${seconds} sec`;
    } else if (hours < 1) { // Less than 1 hour
      const minutes = Math.round(hours * 60);
      return minutes > 0 ? `${minutes} min` : '1 min';
    } else {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return minutes > 0 ? `${wholeHours} hr ${minutes} min` : `${wholeHours} hr`;
    }
  };

  // Format arrival time
  const formatArrivalTime = (hoursFromNow: number) => {
    const now = new Date();
    const arrival = new Date(now.getTime() + (hoursFromNow * 60 * 60 * 1000));
    return arrival.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Update speed based on location changes
  const updateSpeed = useCallback(() => {
    if (location && lastLocationRef.current && lastLocationTimeRef.current > 0) {
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastLocationTimeRef.current) / 1000; // seconds
      
      if (timeDiff > 0) {
        const distance = calculateDistance(
          lastLocationRef.current.coords.latitude,
          lastLocationRef.current.coords.longitude,
          location.coords.latitude,
          location.coords.longitude
        );
        
        const speed = calculateSpeed(distance, timeDiff);
        setCurrentSpeed(speed);
      }
    }
  }, [location]);

  // Update ETA and arrival time
  const updateETA = useCallback(() => {
    if (remainingDistance > 0 && currentSpeed > 0) {
      const hoursToDestination = remainingDistance / currentSpeed;
      setEta(formatDuration(hoursToDestination));
      setArrivalTime(formatArrivalTime(hoursToDestination));
    } else if (remainingDistance > 0) {
      // Fallback: assume average speed of 30 km/h in city
      const hoursToDestination = remainingDistance / 30;
      setEta(formatDuration(hoursToDestination));
      setArrivalTime(formatArrivalTime(hoursToDestination));
    }
  }, [remainingDistance, currentSpeed]);

  const calculateBearing = useCallback((from: any, to: any) => {
    if (!from || !to) return 0;
    
    const lat1 = from.coords.latitude * Math.PI / 180;
    const lat2 = to.coords.latitude * Math.PI / 180;
    const deltaLon = (to.coords.longitude - from.coords.longitude) * Math.PI / 180;
    
    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  }, []);

  // Robust turn detection that works with short routes
  const analyzeUpcomingTurn = useCallback((currentIndex: number, routeCoords: any[]) => {
    console.log('Route analysis:', {
      currentIndex,
      routeLength: routeCoords.length,
      remainingPoints: routeCoords.length - currentIndex
    });
    
    // If route is too short, use destination-based detection
    if (routeCoords.length < 3) {
      console.log('Route too short, using destination-based detection');
      return null;
    }
    
    // If near end of route, check if we need to turn to reach destination
    if (currentIndex >= routeCoords.length - 2) {
      console.log('Near end of route, checking destination direction');
      return null;
    }
    
    // Try to find the best points to analyze
    let currentPoint, nextPoint, futurePoint;
    
    // Use current point and next available point
    currentPoint = routeCoords[currentIndex];
    nextPoint = routeCoords[Math.min(currentIndex + 1, routeCoords.length - 1)];
    
    // For future point, try to find a point further ahead, or use destination
    if (currentIndex + 2 < routeCoords.length) {
      futurePoint = routeCoords[currentIndex + 2];
    } else if (routeCoords.length > 1) {
      // Use the last point (destination) as future point
      futurePoint = routeCoords[routeCoords.length - 1];
    } else {
      return null;
    }
    
    if (!currentPoint || !nextPoint || !futurePoint) {
      console.log('Missing route points');
      return null;
    }
    
    console.log('Using points:', { currentPoint, nextPoint, futurePoint });
    
    // Calculate bearings
    const currentBearing = calculateBearing(
      { coords: { latitude: currentPoint.latitude, longitude: currentPoint.longitude } },
      { coords: { latitude: nextPoint.latitude, longitude: nextPoint.longitude } }
    );
    
    const futureBearing = calculateBearing(
      { coords: { latitude: nextPoint.latitude, longitude: nextPoint.longitude } },
      { coords: { latitude: futurePoint.latitude, longitude: futurePoint.longitude } }
    );
    
    // Calculate turn angle
    let turnAngle = futureBearing - currentBearing;
    if (turnAngle > 180) turnAngle -= 360;
    if (turnAngle < -180) turnAngle += 360;
    
    const absAngle = Math.abs(turnAngle);
    
    // Debug logging
    console.log('Turn Analysis:', {
      currentBearing,
      futureBearing,
      turnAngle,
      absAngle,
      currentIndex,
      routeLength: routeCoords.length
    });
    
    // Detect turns with lower threshold for better sensitivity
    if (absAngle >= 8) { // Even more sensitive
      const turnDirection = turnAngle > 0 ? 'Turn right' : 'Turn left';
      console.log('Turn detected:', turnDirection, 'Angle:', absAngle);
      return turnDirection;
    }
    
    console.log('No turn detected, going straight. Angle:', absAngle);
    return null; // Going straight
  }, [calculateBearing]);

  // Simple distance calculation to next turn
  const getDistanceToNextTurn = useCallback((currentIndex: number, routeCoords: any[]) => {
    if (currentIndex >= routeCoords.length - 1) return 0;
    
    let distance = 0;
    // Look ahead up to 10 points to find next turn
    for (let i = currentIndex; i < Math.min(currentIndex + 10, routeCoords.length - 1); i++) {
      const current = routeCoords[i];
      const next = routeCoords[i + 1];
      distance += calculateDistance(current.latitude, current.longitude, next.latitude, next.longitude);
    }
    return distance;
  }, []);

  // Check if user has arrived at destination
  const checkArrival = useCallback(() => {
    if (location && destinationProperty && showRoute) {
      const distanceToDestination = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        destinationProperty.latitude,
        destinationProperty.longitude
      );
      
      // Consider arrived if within 50 meters of destination
      if (distanceToDestination <= 0.05 && !showArrivalPrompt) {
        setShowArrivalPrompt(true);
        setCurrentInstruction('You have arrived!');
        setNextInstruction('');
        setShowNextInstruction(false);
      }
    }
  }, [location, destinationProperty, showRoute, showArrivalPrompt]);

  // Handle arrival confirmation
  const handleArrivalConfirmation = useCallback(() => {
    setShowArrivalPrompt(false);
    setShowRoute(false);
    setRouteCoordinates([]);
    setRemainingDistance(0);
    setTotalDistance(0);
    setRouteProgress(0);
    setDestinationProperty(null);
    setCurrentSpeed(0);
    lastLocationRef.current = null;
    lastLocationTimeRef.current = 0;
    setCurrentInstruction('Continue straight');
    setNextInstruction('');
    setShowNextInstruction(false);
    setEta('1 hr 13 min');
    setArrivalTime('10:28 AM');
    setCameraMode('free');
  }, []);

  // Update navigation instructions based on route progress
  const updateNavigationInstructions = useCallback(() => {
    if (routeCoordinates.length > 0 && location) {
      // Find the closest point on the route to current location
      let closestIndex = 0;
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
          closestIndex = index;
        }
      });
      
      // Analyze upcoming turn
      const upcomingTurn = analyzeUpcomingTurn(closestIndex, routeCoordinates);
      const distanceToTurn = getDistanceToNextTurn(closestIndex, routeCoordinates);
      
      // Debug logging to identify the issue
      console.log('Turn Detection Debug:', {
        closestIndex,
        routeLength: routeCoordinates.length,
        upcomingTurn,
        distanceToTurn,
        currentLocation: location.coords,
        routeCoords: routeCoordinates.slice(closestIndex, closestIndex + 5)
      });
      
      // Update current instruction based on whether there's an upcoming turn
      if (!upcomingTurn) {
        // No turn detected - check if we need a fallback based on distance to destination
        if (distanceToTurn < 0.05) { // Less than 50m to destination
          setCurrentInstruction('Arriving at destination');
        } else if (distanceToTurn < 0.15) { // Less than 150m - likely a turn coming
          // Fallback: If close and no turn detected, check direction to destination
          if (location && destinationProperty) {
            const directDistance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              destinationProperty.latitude,
              destinationProperty.longitude
            );
            
            // If direct distance is much less than route distance, there's likely a turn
            if (directDistance < distanceToTurn * 0.7) {
              setCurrentInstruction('Turn ahead');
            } else {
              setCurrentInstruction('Continue straight');
            }
          } else {
            setCurrentInstruction('Turn ahead');
          }
        } else {
          setCurrentInstruction('Continue straight');
        }
      } else {
        // There is a turn coming up - show distance-based instructions
        if (distanceToTurn > 0.2) { // More than 200m to turn
          setCurrentInstruction('Continue straight');
        } else if (distanceToTurn > 0.1) { // 100-200m to turn
          setCurrentInstruction(`${upcomingTurn} ahead`);
        } else { // Less than 100m to turn
          setCurrentInstruction(upcomingTurn);
        }
      }
      
      // Update next instruction - only show if there's a significant turn coming
      if (upcomingTurn && distanceToTurn > 0.1) {
        // Format distance for display
        let distanceText = '';
        if (distanceToTurn >= 1) {
          distanceText = `${distanceToTurn.toFixed(1)} km`;
        } else {
          distanceText = `${Math.round(distanceToTurn * 1000)} m`;
        }
        
        setNextInstruction(`${upcomingTurn} in ${distanceText}`);
        setShowNextInstruction(true);
      } else {
        setNextInstruction('');
        setShowNextInstruction(false);
      }
      
      // Check if near destination
      const progressPercent = (closestIndex / routeCoordinates.length) * 100;
      if (progressPercent > 95) {
        setCurrentInstruction('Arriving at destination');
        setNextInstruction('');
        setShowNextInstruction(false);
      }
    }
  }, [routeCoordinates, location, analyzeUpcomingTurn, getDistanceToNextTurn]);

  // Camera control functions
  const animateToLocation = useCallback((location: any, zoomLevel: number = 0.01, duration: number = 1000) => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      }, duration);
    }
  }, []);

  const animateToNavigationView = useCallback((location: any, bearing: number = 0, duration: number = 1000) => {
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        pitch: 45, // Tilt the camera for 3D effect
        heading: bearing, // Rotate camera based on movement direction
        altitude: 1000, // Height above ground
      }, { duration });
    }
  }, []);

  // Track location changes for speed calculation and camera movement
  useEffect(() => {
    if (location && showRoute) {
      const currentTime = Date.now();
      
      if (lastLocationRef.current && lastLocationTimeRef.current > 0) {
        updateSpeed();
        
        // Calculate bearing for camera rotation
        const bearing = calculateBearing(lastLocationRef.current, location);
        
        // Animate camera to follow user with rotation
        animateToNavigationView(location, bearing, 500);
      } else {
        // First location update - zoom in for navigation
        animateToLocation(location, 0.005, 1000);
        setCameraMode('navigation');
      }
      
      lastLocationRef.current = location;
      lastLocationTimeRef.current = currentTime;
    }
  }, [location, showRoute, updateSpeed, calculateBearing, animateToNavigationView, animateToLocation]);

  // Update ETA when speed or distance changes
  useEffect(() => {
    if (showRoute) {
      updateETA();
    }
  }, [showRoute, updateETA]);

  // Update navigation instructions when route or location changes
  useEffect(() => {
    if (showRoute) {
      updateNavigationInstructions();
    }
  }, [showRoute, updateNavigationInstructions]);

  // Update navigation instructions when location changes (more responsive)
  useEffect(() => {
    if (showRoute && location) {
      updateNavigationInstructions();
    }
  }, [location, showRoute, updateNavigationInstructions]);

  // Check for arrival when location changes
  useEffect(() => {
    if (showRoute && !showArrivalPrompt) {
      checkArrival();
    }
  }, [showRoute, showArrivalPrompt, checkArrival]);

  // Update camera when location changes during navigation
  useEffect(() => {
    if (location && showRoute && cameraMode === 'navigation' && mapRef.current) {
      // Animate camera to follow user with rotation
      animateToNavigationView(location);
    }
  }, [location, showRoute, cameraMode, animateToNavigationView]);

  if (errorMsg) {
    Alert.alert('Error', errorMsg);
  }

  return (
    <View className="flex-1">
      {/* Search Bar and Filter - Hidden during navigation */}
      {!showRoute && (
        <>
          <View className="absolute top-14 left-5 right-5 z-50 flex-row items-center gap-2 mt-2">
            {/* Search Bar */}
            <View className="flex-1 mb-6 bg-white rounded-full shadow-lg">
              <View className="flex-row items-center">
                <View className="flex-1 bg-white rounded-full px-3 py-3 mr-1">
                  <TextInput
                    className="text-base font-rubik text-black-300"
                    placeholder="Search malls, restaurants, schools..."
                    placeholderTextColor="#8c8e98"
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={handleSearch}
                    onFocus={() => {
                      if (searchSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                </View>
                <TouchableOpacity
                  className="w-16 h-16 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: '#14b8a6' }}
                  onPress={handleSearch}
                >
                  <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Result Indicator */}
            {searchLocation && (
              <View className="absolute top-40 left-5 right-5 z-40">
                <View className="bg-blue-50 rounded-lg p-3 flex-row items-center">
                  <Ionicons name="location" size={20} color="#3B82F6" />
                  <Text className="text-blue-600 font-rubik-medium ml-2">
                    Showing properties within 2.5km of {searchLocation.placeName}
                  </Text>
                  <TouchableOpacity 
                    className="ml-auto"
                    onPress={() => {
                      setSearchLocation(null);
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                  >
                    <Ionicons name="close" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Search Suggestions Overlay */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
                <View className="absolute inset-0 z-[9998]">
                  <View className="absolute top-20 left-5 right-24 bg-white rounded-2xl shadow-lg z-[9999]">
                    {searchSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        className="px-4 py-3 border-b border-gray-100"
                        onPress={() => handleSuggestionSelect(suggestion)}
                      >
                        <Text className="text-gray-800 font-rubik">{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* Rent/Buy Filter */}
              <TouchableOpacity
                className="bg-white w-16 h-16 mb-6 rounded-full items-center justify-center shadow-lg"
                onPress={async () => {
                  const newFilter = propertyTypeFilter === 'sell' ? 'rent' : 'sell';
                  setPropertyTypeFilter(newFilter);
                  
                  // Manually refetch data with new filter and current category
                  await refetchProperties({ 
                    filter: selectedCategory, 
                    query: searchQuery, 
                    limit: 100,
                    propertyType: newFilter
                  });
                }}
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
                onCategoryChange={async (category) => {
                  setSelectedCategory(category);
                  // Refetch data with new category filter
                  await refetchProperties({ 
                    filter: category, 
                    query: searchQuery, 
                    limit: 100,
                    propertyType: propertyTypeFilter
                  });
                }}
              />
            </View>
          </View>
        </>
      )}

      {isInitialLoad || locationLoading || !location || !mapPreloaded ? (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#0061FF" />
          <Text className="mt-2.5 text-base text-gray-800">
            {locationLoading ? 'Getting your location...' : 
             !mapPreloaded ? 'Preparing map...' : 'Loading properties...'}
          </Text>
        </View>
      ) : (
        <MapView
          key="explore-map" // Stable key to prevent re-mounting
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          region={stableMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          mapType="standard"
          customMapStyle={mapStyle}
          followsUserLocation={cameraMode === 'navigation' || cameraMode === 'following'}
          userLocationPriority="high"
          userLocationUpdateInterval={1000}
          userLocationFastestInterval={500}
        >
          
          {/* Property markers from database */}
          {propertiesWithCoords.map((property, index) => (
            <PropertyMarker
              key={`property-${property.$id || index}`}
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
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          zIndex: 10,
        }}
        pointerEvents="none"
      />

    


      {/* Navigation UI - Top Bar */}
      {showRoute && (
        <View className="absolute top-20 left-0 right-0 z-50 px-4">
          {/* Main Navigation Instruction */}
            <View className="rounded-t-2xl px-8 py-5 flex-row items-center justify-between" style={{ backgroundColor: 'rgba(20, 184, 166, 0.9)' }}>
            <View className="flex-row items-center">
              <Ionicons name="arrow-up" size={20} color="white" />
              <Text className="text-white text-2xl font-semibold ml-2">{currentInstruction}</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white justify-center items-center">
              <View className="w-6 h-6 rounded-full bg-red-400 justify-center items-center">
                <View className="w-3 h-3 rounded-full bg-white" />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Next Instruction - Only show when there's an upcoming turn */}
          {showNextInstruction && nextInstruction && (
            <View className="rounded-b-lg px-4 py-2 flex-row items-center max-w-1/3" style={{ backgroundColor: 'rgba(20, 184, 166, 0.9)' }}>
              <Text className="text-white text-sm font-medium mr-2">{nextInstruction}</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </View>
          )}
        </View>
      )}

      {/* Navigation UI - Bottom Summary Bar */}
      {showRoute && (
        <View className="absolute bottom-28 left-0 right-0 bg-white px-4 py-4 flex-row items-center justify-between border-t border-gray-200 z-50 mr-4 ml-4 rounded-2xl shadow-lg overflow-hidden">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => {
              setShowRoute(false);
              setRouteCoordinates([]);
              setRemainingDistance(0);
              setTotalDistance(0);
              setRouteProgress(0);
              setDestinationProperty(null);
              setCurrentSpeed(0);
              lastLocationRef.current = null;
              lastLocationTimeRef.current = 0;
              setCurrentInstruction('Continue straight');
              setNextInstruction('');
              setShowNextInstruction(false);
              setEta('1 hr 13 min');
              setArrivalTime('10:28 AM');
              setCameraMode('free');
              setShowArrivalPrompt(false);
            }}
          >
            <Ionicons name="close" size={20} color="black" />
          </TouchableOpacity>
          
          <View className="flex-1 items-center mx-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-green-600 text-lg font-bold mr-2">{eta}</Text>
              <TouchableOpacity className="w-5 h-5 justify-center items-center">
                <Ionicons name="information-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 text-sm mr-4">{remainingDistance.toFixed(1)} km</Text>
              <Text className="text-gray-600 text-sm">{arrivalTime}</Text>
            </View>
          </View>
          
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm">
            <Ionicons name="swap-horizontal" size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}


      {/* Navigation UI - Speed Indicator */}
      {showRoute && (
        <View className="absolute bottom-52 left-4 w-16 h-16 rounded-full shadow-lg z-50">
          <View className="w-16 h-16 rounded-full bg-white justify-center items-center">
            <Text className="text-xs font-semibold text-gray-800">{Math.round(currentSpeed)} km/h</Text>
          </View>
        </View>
      )}

      {/* Navigation UI - Recenter FAB */}
      {showRoute && (
        <View className="absolute bottom-52 right-4 w-16 h-16 rounded-full shadow-lg z-50">
          <TouchableOpacity 
            className="w-16 h-16 rounded-full bg-white justify-center items-center"
            onPress={() => {
              // Recenter map to user's location
              if (location) {
                if (cameraMode === 'navigation') {
                  // In navigation mode, use 3D camera view
                  animateToNavigationView(location);
                } else {
                  // In free mode, use standard view
                  animateToLocation(location, 0.01, 1000);
                }
              }
            }}
          >
            <Ionicons name="locate" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Arrival Prompt Modal */}
      {showArrivalPrompt && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center z-50">
          <View className="bg-white rounded-2xl p-8 items-center mx-10 shadow-xl">
            <View className="mb-5">
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">You have arrived!</Text>
            <Text className="text-base text-gray-600 mb-8 text-center">
              You have reached your destination
            </Text>
            <TouchableOpacity 
              className="bg-green-500 px-10 py-4 rounded-xl min-w-48"
              onPress={handleArrivalConfirmation}
            >
              <Text className="text-white text-lg font-semibold text-center">End Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Property Modal */}
      {showPropertyModal && selectedProperty && (
        <TouchableOpacity 
          className="absolute top-0 left-0 right-0 bottom-28 z-50 justify-end pb-0 px-0 mr-4 ml-4"
          activeOpacity={1}
          onPress={closePropertyModal}
        >
              <TouchableOpacity
            className="bg-white rounded-2xl shadow-lg overflow-hidden pt-2 px-2 pb-4 max-h-3/5"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Property Image */}
            <View className="relative h-40 rounded-xl overflow-hidden mb-2">
              <Image
                source={
                  selectedProperty.images && selectedProperty.images.length > 0
                    ? { uri: selectedProperty.images[0] }
                    : require('@/assets/images/new-york.png')
                }
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
              
              {/* Property Type Badge */}
              <View className="absolute top-3 left-3 bg-black/80 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  {selectedProperty.type || 'Property'}
                </Text>
              </View>
              
              {/* Favorite Button */}
              <TouchableOpacity className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                <Ionicons name="heart-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Property Details */}
            <View className="px-2">
                {/* Title and Price Row */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={1}>
                    {selectedProperty.name || 'Property Name'}
                  </Text>
                  <Text className="text-base font-bold text-gray-800">
                    ${selectedProperty.price?.toLocaleString() || '0'}
                  </Text>
                </View>

              {/* Address and Distance Row */}
              <View className="flex-row items-center justify-between mb-2">
                {/* Address */}
                <Text className="text-sm text-gray-600 flex-1 mr-2" numberOfLines={1}>
                  {selectedProperty.address || 'Address not available'}
                </Text>

                {/* Distance from User */}
                {location && selectedProperty.latitude && selectedProperty.longitude && (
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#10B981" />
                    <Text className="text-sm text-green-500 ml-1 font-medium">
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
              <View className="flex-row gap-2">
                <View className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-2xl">
                  <Ionicons name="bed-outline" size={16} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1 font-medium">
                    {selectedProperty.bedrooms || 0} Beds
                  </Text>
                </View>
                <View className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-2xl">
                  <Ionicons name="water-outline" size={16} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1 font-medium">
                    {selectedProperty.bathrooms || 0} Baths
                  </Text>
                </View>
                <View className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-2xl">
                  <Ionicons name="resize-outline" size={16} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1 font-medium">
                    {selectedProperty.area || 0} Sqft
                  </Text>
                </View>
              </View>

              {/* View/Cancel Button */}
              <TouchableOpacity 
                className={`flex-row items-center justify-center py-3 px-5 rounded-xl mt-3 ${isCalculatingRoute ? 'opacity-70' : ''}`}
                style={{ backgroundColor: isCalculatingRoute ? '#9CA3AF' : '#3B82F6' }}
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
                    <Text className="text-white text-base font-semibold ml-2">Calculating Route...</Text>
                  </>
                ) : showRoute ? (
                  <>
                    <Text className="text-white text-base font-semibold ml-2">Cancel Viewing</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-sm font-semibold ml-2">View Property</Text>
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



export default Explore;