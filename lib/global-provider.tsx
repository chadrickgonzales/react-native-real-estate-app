import * as Location from 'expo-location';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

import { getCurrentUser } from "./appwrite";
import { useAppwrite } from "./useAppwrite";

interface GlobalContextType {
  isLogged: boolean;
  user: User | null;
  loading: boolean;
  refetch: () => void;
  location: Location.LocationObject | null;
  locationLoading: boolean;
  locationError: string | null;
  mapPreloaded: boolean;
}

interface User {
  $id: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  location?: string;
  avatar?: string;
  preferences?: {
    propertyType?: string;
    budget?: string;
    bedrooms?: string;
  };
  bio?: string;
  setupCompleted?: boolean;
  $createdAt?: string;
  createdAt?: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapPreloaded, setMapPreloaded] = useState(false);

  const isLogged = !!user;

  // Get user location as soon as the app starts
  useEffect(() => {
    (async () => {
      try {
        setLocationLoading(true);
        setLocationError(null);

        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          setLocationLoading(false);
          return;
        }

        // Get initial location with high accuracy
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setLocation(currentLocation);
        console.log('📍 User location gathered:', {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Failed to get your location. Please check your GPS settings.');
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Preload map component after location is available
  useEffect(() => {
    if (location && !mapPreloaded) {
      // Small delay to ensure location is fully processed
      const timer = setTimeout(() => {
        setMapPreloaded(true);
        console.log('🗺️ Map preloaded and ready');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location, mapPreloaded]);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        loading,
        refetch,
        location,
        locationLoading,
        locationError,
        mapPreloaded,
      }}
    >
      {children}
      {/* Hidden map component for preloading */}
      {location && !mapPreloaded && (
        <View style={styles.hiddenMapContainer}>
          <MapView
            style={styles.hiddenMap}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onMapReady={() => {
              console.log('🗺️ Hidden map ready for preloading');
            }}
          />
        </View>
      )}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

const styles = StyleSheet.create({
  hiddenMapContainer: {
    position: 'absolute',
    top: -1000, // Hide off-screen
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
  hiddenMap: {
    width: 1,
    height: 1,
  },
});

export default GlobalProvider;