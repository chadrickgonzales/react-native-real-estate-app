import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface AdvancedSearchProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query?: string;
  propertyType?: 'sell' | 'rent' | '';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  location?: string;
  amenities?: string[];
  features?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'rating';
}

const AdvancedSearch = ({ visible, onClose, onSearch, initialFilters = {} }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const propertyTypes = [
    { value: '', label: 'Any' },
    { value: 'sell', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' }
  ];

  const categories = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Loft', 'Penthouse'
  ];

  const amenitiesList = [
    'Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Terrace', 'Security', 'Elevator',
    'Air Conditioning', 'Heating', 'Internet', 'Cable TV', 'Laundry', 'Kitchen'
  ];

  const featuresList = [
    'Furnished', 'Pet Friendly', 'Smoking Allowed', 'Wheelchair Accessible', 
    'Near Transport', 'Near Schools', 'Near Hospital', 'Near Shopping'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'amenities' | 'features', item: string) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFilter(key, newArray);
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.propertyType) count++;
    if (filters.category) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.minArea || filters.maxArea) count++;
    if (filters.location) count++;
    if (filters.amenities?.length) count++;
    if (filters.features?.length) count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-rubik-bold text-gray-900">Advanced Search</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text className="text-blue-500 font-rubik-medium">Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Search Query */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Search Keywords</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="Enter keywords..."
              value={filters.query || ''}
              onChangeText={(value) => updateFilter('query', value)}
            />
          </View>

          {/* Property Type */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Property Type</Text>
            <View className="flex-row flex-wrap">
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                    filters.propertyType === type.value 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => updateFilter('propertyType', type.value)}
                >
                  <Text className={`font-rubik-medium ${
                    filters.propertyType === type.value 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Category</Text>
            <View className="flex-row flex-wrap">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                    filters.category === category 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => updateFilter('category', category)}
                >
                  <Text className={`font-rubik-medium ${
                    filters.category === category 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Price Range</Text>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-gray-700 font-rubik-medium mb-2">Min Price</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                  placeholder="0"
                  value={filters.minPrice?.toString() || ''}
                  onChangeText={(value) => updateFilter('minPrice', value ? parseInt(value) : undefined)}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-rubik-medium mb-2">Max Price</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                  placeholder="No limit"
                  value={filters.maxPrice?.toString() || ''}
                  onChangeText={(value) => updateFilter('maxPrice', value ? parseInt(value) : undefined)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Bedrooms & Bathrooms */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Bedrooms & Bathrooms</Text>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-gray-700 font-rubik-medium mb-2">Bedrooms</Text>
                <View className="flex-row space-x-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <TouchableOpacity
                      key={num}
                      className={`px-3 py-2 rounded-lg ${
                        filters.bedrooms === num ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                      onPress={() => updateFilter('bedrooms', num)}
                    >
                      <Text className={`font-rubik-medium ${
                        filters.bedrooms === num ? 'text-white' : 'text-gray-700'
                      }`}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-rubik-medium mb-2">Bathrooms</Text>
                <View className="flex-row space-x-2">
                  {[1, 2, 3, 4].map((num) => (
                    <TouchableOpacity
                      key={num}
                      className={`px-3 py-2 rounded-lg ${
                        filters.bathrooms === num ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                      onPress={() => updateFilter('bathrooms', num)}
                    >
                      <Text className={`font-rubik-medium ${
                        filters.bathrooms === num ? 'text-white' : 'text-gray-700'
                      }`}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Area Range */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Area (sq ft)</Text>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-gray-700 font-rubik-medium mb-2">Min Area</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                  placeholder="0"
                  value={filters.minArea?.toString() || ''}
                  onChangeText={(value) => updateFilter('minArea', value ? parseInt(value) : undefined)}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-rubik-medium mb-2">Max Area</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                  placeholder="No limit"
                  value={filters.maxArea?.toString() || ''}
                  onChangeText={(value) => updateFilter('maxArea', value ? parseInt(value) : undefined)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Location */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Location</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="Enter city, neighborhood, or address..."
              value={filters.location || ''}
              onChangeText={(value) => updateFilter('location', value)}
            />
          </View>

          {/* Amenities */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Amenities</Text>
            <View className="flex-row flex-wrap">
              {amenitiesList.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                    filters.amenities?.includes(amenity) 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => toggleArrayItem('amenities', amenity)}
                >
                  <Text className={`font-rubik-medium ${
                    filters.amenities?.includes(amenity) 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Features */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Features</Text>
            <View className="flex-row flex-wrap">
              {featuresList.map((feature) => (
                <TouchableOpacity
                  key={feature}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                    filters.features?.includes(feature) 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => toggleArrayItem('features', feature)}
                >
                  <Text className={`font-rubik-medium ${
                    filters.features?.includes(feature) 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {feature}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Sort By</Text>
            <View className="flex-row flex-wrap">
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                    filters.sortBy === option.value 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  onPress={() => updateFilter('sortBy', option.value)}
                >
                  <Text className={`font-rubik-medium ${
                    filters.sortBy === option.value 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="bg-white p-4 border-t border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-600 font-rubik">
              {getActiveFiltersCount()} filters applied
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-500 py-4 rounded-lg"
            onPress={handleSearch}
          >
            <Text className="text-white font-rubik-bold text-center text-lg">
              Search Properties
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AdvancedSearch;
