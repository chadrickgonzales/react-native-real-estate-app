import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getLatestProperties, getProperties } from '../lib/appwrite';
import { useAppwrite } from '../lib/useAppwrite';

const PropertiesDebug = () => {
  // Fetch latest properties
  const { data: latestProperties, loading: latestLoading, refetch: refetchLatest } = useAppwrite({
    fn: getLatestProperties,
  });

  // Fetch all properties
  const { data: allProperties, loading: allLoading, refetch: refetchAll } = useAppwrite({
    fn: getProperties,
    params: {
      filter: "",
      query: "",
      limit: 10,
    },
  });

  const handleRefresh = () => {
    refetchLatest();
    refetchAll();
  };

  return (
    <View className="p-4 bg-white rounded-lg shadow-md m-4">
      <Text className="text-lg font-rubik-bold text-black mb-4">
        Properties Database Debug
      </Text>
      
      <TouchableOpacity
        onPress={handleRefresh}
        className="bg-blue-600 py-3 px-4 rounded-lg mb-4"
      >
        <Text className="text-white font-rubik-bold text-center">
          Refresh Data
        </Text>
      </TouchableOpacity>

      <ScrollView className="max-h-96">
        <View className="mb-4">
          <Text className="text-base font-rubik-bold text-black mb-2">
            Latest Properties ({latestProperties?.length || 0})
          </Text>
          {latestLoading ? (
            <Text className="text-gray-600">Loading...</Text>
          ) : latestProperties && latestProperties.length > 0 ? (
            latestProperties.map((property: any, index: number) => (
              <View key={property.$id} className="bg-gray-100 p-2 rounded mb-2">
                <Text className="font-rubik-bold text-sm">
                  {index + 1}. {property.name}
                </Text>
                <Text className="text-xs text-gray-600">
                  ID: {property.$id}
                </Text>
                <Text className="text-xs text-gray-600">
                  Price: ${property.price}
                </Text>
                <Text className="text-xs text-gray-600">
                  Images: {property.images ? JSON.parse(property.images).length : 0}
                </Text>
                <Text className="text-xs text-gray-600">
                  Address: {property.address}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-600">No latest properties found</Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-base font-rubik-bold text-black mb-2">
            All Properties ({allProperties?.length || 0})
          </Text>
          {allLoading ? (
            <Text className="text-gray-600">Loading...</Text>
          ) : allProperties && allProperties.length > 0 ? (
            allProperties.map((property: any, index: number) => (
              <View key={property.$id} className="bg-gray-100 p-2 rounded mb-2">
                <Text className="font-rubik-bold text-sm">
                  {index + 1}. {property.name}
                </Text>
                <Text className="text-xs text-gray-600">
                  ID: {property.$id}
                </Text>
                <Text className="text-xs text-gray-600">
                  Price: ${property.price}
                </Text>
                <Text className="text-xs text-gray-600">
                  Images: {property.images ? JSON.parse(property.images).length : 0}
                </Text>
                <Text className="text-xs text-gray-600">
                  Address: {property.address}
                </Text>
                <Text className="text-xs text-gray-600">
                  Created: {new Date(property.$createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-600">No properties found</Text>
          )}
        </View>
      </ScrollView>

      <Text className="text-sm text-gray-600 mt-4">
        This component shows all properties from your database. 
        If you see properties here, they should also appear in your app.
      </Text>
    </View>
  );
};

export default PropertiesDebug;
