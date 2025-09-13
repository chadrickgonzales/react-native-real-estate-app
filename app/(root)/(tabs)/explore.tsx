import { getProperties } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Explore = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch all properties with coordinates
  const { data: properties, isLoading, refetch } = useAppwrite({
    fn: () => getProperties({ filter: '', query: '', limit: 100 }),
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

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Filter properties that have valid coordinates
  const propertiesWithCoords = properties?.filter(property => 
    property.latitude && 
    property.longitude && 
    property.latitude !== 0 && 
    property.longitude !== 0
  ) || [];

  if (errorMsg) {
    Alert.alert('Error', errorMsg);
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0061FF" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords?.latitude || 37.78825,
            longitude: location?.coords?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User's current location marker */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description="You are here"
              pinColor="blue"
            />
          )}
          
          {/* Property markers from database */}
          {propertiesWithCoords.map((property, index) => (
            <Marker
              key={property.$id || index}
              coordinate={{
                latitude: property.latitude,
                longitude: property.longitude,
              }}
              title={property.name || 'Property'}
              description={`$${property.price?.toLocaleString() || '0'} - ${property.bedrooms || 0} Bed, ${property.bathrooms || 0} Bath`}
              pinColor="red"
            />
          ))}
        </MapView>
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
});

export default Explore;