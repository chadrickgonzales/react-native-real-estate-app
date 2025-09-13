import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Explore = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

  if (errorMsg) {
    Alert.alert('Error', errorMsg);
  }

  return (
    <View style={styles.container}>
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
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
          />
        )}
        
        {/* Sample property markers - you can replace these with real data */}
        <Marker
          coordinate={{
            latitude: 37.7849,
            longitude: -122.4094,
          }}
          title="Sample Property 1"
          description="$500,000 - 2 Bed, 2 Bath"
        />
        
        <Marker
          coordinate={{
            latitude: 37.7749,
            longitude: -122.4194,
          }}
          title="Sample Property 2"
          description="$750,000 - 3 Bed, 2 Bath"
        />
      </MapView>
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
});

export default Explore;