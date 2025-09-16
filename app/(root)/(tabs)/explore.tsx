import Filters from '@/components/Filters';
import { getProperties } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useAppwrite } from '@/lib/useAppwrite';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      <View style={styles.customMarker}>
        <View style={[
          styles.pinContainer, 
          { backgroundColor: getPropertyColor(property.type) }
        ]}>
          <Ionicons 
            name={getPropertyIcon(property.type)} 
            size={16} 
            color="white" 
          />
        </View>
        <View style={[
          styles.pinPoint,
          { borderTopColor: getPropertyColor(property.type) }
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
  const { location, locationLoading, locationError, mapPreloaded } = useGlobalContext();
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
    return properties?.filter((property: any) => 
      property.latitude && 
      property.longitude && 
      property.latitude !== 0 && 
      property.longitude !== 0
    ) || [];
  }, [properties]);

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
    <View style={styles.container}>
      {/* Search Bar and Filter - Hidden during navigation */}
      {!showRoute && (
        <>
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
              <TouchableOpacity 
                className="bg-primary-300 w-16 h-16 rounded-full items-center justify-center mr-2"
                onPress={() => {
                  // Search is handled automatically by debounced effect
                }}
              >
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0061FF" />
          <Text style={styles.loadingText}>
            {locationLoading ? 'Getting your location...' : 
             !mapPreloaded ? 'Preparing map...' : 'Loading properties...'}
          </Text>
        </View>
      ) : (
        <MapView
          key="explore-map" // Stable key to prevent re-mounting
          ref={mapRef}
          style={styles.map}
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
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      {/* Property Type Legend - Only show when not in navigation mode */}
      {!showRoute && (
        <View style={styles.propertyLegend}>
          <View style={styles.legendHeader}>
            <Text style={styles.legendTitle}>Property Types</Text>
          </View>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#10B981' }]}>
                <Ionicons name="home" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>House</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="business" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>Apartment</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="business-sharp" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>Condo</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="home-outline" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>Townhouse</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="diamond" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>Villa</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#06B6D4' }]}>
                <Ionicons name="copy" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>Duplex</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendMarker, { backgroundColor: '#84CC16' }]}>
                <Ionicons name="square" size={12} color="white" />
              </View>
              <Text style={styles.legendText}>Studio</Text>
            </View>
          </View>
        </View>
      )}


      {/* Navigation UI - Top Bar */}
      {showRoute && (
        <View style={styles.navigationTopBar}>
          {/* Main Navigation Instruction */}
          <View style={styles.mainInstruction}>
            <View style={styles.instructionContent}>
              <Ionicons name="arrow-up" size={20} color="white" />
              <Text style={styles.instructionText}>{currentInstruction}</Text>
            </View>
            <TouchableOpacity style={styles.voiceButton}>
              <View style={styles.voiceIcon}>
                <View style={styles.voiceMic} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Next Instruction - Only show when there's an upcoming turn */}
          {showNextInstruction && nextInstruction && (
            <View style={styles.nextInstruction}>
              <Text style={styles.nextInstructionText}>{nextInstruction}</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </View>
          )}
        </View>
      )}

      {/* Navigation UI - Bottom Summary Bar */}
      {showRoute && (
        <View style={styles.navigationBottomBar}>
          <TouchableOpacity 
            style={styles.closeButton}
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
          
          <View style={styles.routeInfo}>
            <View style={styles.etaContainer}>
              <Text style={styles.etaText}>{eta}</Text>
              <TouchableOpacity style={styles.infoButton}>
                <Ionicons name="information-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.routeDetails}>
              <Text style={styles.distanceText}>{remainingDistance.toFixed(1)} km</Text>
              <Text style={styles.arrivalText}>{arrivalTime}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.routeOptionsButton}>
            <Ionicons name="swap-horizontal" size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}


      {/* Navigation UI - Speed Indicator */}
      {showRoute && (
        <View style={styles.speedIndicatorContainer}>
          <View style={styles.speedIndicator}>
            <Text style={styles.speedText}>{Math.round(currentSpeed)} km/h</Text>
          </View>
        </View>
      )}

      {/* Navigation UI - Recenter FAB */}
      {showRoute && (
        <View style={styles.recenterFabContainer}>
          <TouchableOpacity 
            style={styles.recenterFab}
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
        <View style={styles.arrivalPromptOverlay}>
          <View style={styles.arrivalPrompt}>
            <View style={styles.arrivalIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text style={styles.arrivalTitle}>You have arrived!</Text>
            <Text style={styles.arrivalSubtitle}>
              You have reached your destination
            </Text>
            <TouchableOpacity 
              style={styles.arrivalConfirmButton}
              onPress={handleArrivalConfirmation}
            >
              <Text style={styles.arrivalConfirmText}>End Navigation</Text>
            </TouchableOpacity>
          </View>
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
  pinContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerShadow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -2,
    opacity: 0.6,
  },
  // Property Modal Styles - Navigation Style
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    zIndex: 1000,
    justifyContent: 'flex-end',
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  propertyModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 16,
    maxHeight: '80%',
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
  // Navigation UI Styles
  navigationTopBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,

  },
  mainInstruction: {
    backgroundColor: '#1F8A3A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceMic: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  nextInstruction: {
    backgroundColor: '#2A9D4A',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '30%',
  },
  nextInstructionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  navigationBottomBar: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    zIndex: 1000,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  etaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F8A3A',
    marginRight: 8,
  },
  infoButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  arrivalText: {
    fontSize: 14,
    color: '#666',
  },
  routeOptionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speedIndicatorContainer: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  speedIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  // Arrival Prompt Styles
  arrivalPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  arrivalPrompt: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  arrivalIcon: {
    marginBottom: 20,
  },
  arrivalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  arrivalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  arrivalConfirmButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 200,
  },
  arrivalConfirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  recenterFabContainer: {
    position: 'absolute',
    bottom: 160,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  recenterFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Property Legend Styles
  propertyLegend: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  legendHeader: {
    marginBottom: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '48%',
  },
  legendMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});


export default Explore;