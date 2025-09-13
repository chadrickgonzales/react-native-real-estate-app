import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PropertyTypeFilterProps {
  selectedType: 'all' | 'rent' | 'sell';
  onTypeChange: (type: 'all' | 'rent' | 'sell') => void;
}

const PropertyTypeFilter: React.FC<PropertyTypeFilterProps> = ({ 
  selectedType, 
  onTypeChange 
}) => {
  return (
    <View className="flex-row bg-gray-100 rounded-full p-1 mb-4">
      <TouchableOpacity 
        className={`flex-1 py-3 rounded-full ${
          selectedType === 'all' 
            ? 'bg-white shadow-sm' 
            : ''
        }`}
        onPress={() => onTypeChange('all')}
      >
        <Text className={`text-center font-rubik-medium text-sm ${
          selectedType === 'all' 
            ? 'text-black' 
            : 'text-gray-600'
        }`}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`flex-1 py-3 rounded-full ${
          selectedType === 'rent' 
            ? 'bg-white shadow-sm' 
            : ''
        }`}
        onPress={() => onTypeChange('rent')}
      >
        <Text className={`text-center font-rubik-medium text-sm ${
          selectedType === 'rent' 
            ? 'text-black' 
            : 'text-gray-600'
        }`}>
          For Rent
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`flex-1 py-3 rounded-full ${
          selectedType === 'sell' 
            ? 'bg-white shadow-sm' 
            : ''
        }`}
        onPress={() => onTypeChange('sell')}
      >
        <Text className={`text-center font-rubik-medium text-sm ${
          selectedType === 'sell' 
            ? 'text-black' 
            : 'text-gray-600'
        }`}>
          For Sale
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PropertyTypeFilter;
