import { useLocalSearchParams } from 'expo-router/build/hooks';
import React from 'react';
import { Text, View } from 'react-native';

const Property = () => {
  const { id } = useLocalSearchParams();  

  return (
    <View>
      <Text>Property {id}</Text>
    </View>
  )
}

export default Property;