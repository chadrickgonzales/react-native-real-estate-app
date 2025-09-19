import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { searchProperties, getSearchSuggestions } from "@/lib/appwrite";
import { SearchFilters } from "@/components/AdvancedSearch";
import Search from "@/components/search";
import Cards from "@/components/Cards";
import NoResults from "@/components/NoResults";

const SearchResults = () => {
  const params = useLocalSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Parse URL parameters into filters
  const getFiltersFromParams = (): SearchFilters => {
    return {
      query: params.query as string || '',
      propertyType: params.propertyType as 'sell' | 'rent' | '' || '',
      category: params.category as string || '',
      minPrice: params.minPrice ? parseInt(params.minPrice as string) : undefined,
      maxPrice: params.maxPrice ? parseInt(params.maxPrice as string) : undefined,
      bedrooms: params.bedrooms ? parseInt(params.bedrooms as string) : undefined,
      bathrooms: params.bathrooms ? parseInt(params.bathrooms as string) : undefined,
      location: params.location as string || '',
      sortBy: params.sortBy as SearchFilters['sortBy'] || 'newest'
    };
  };

  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(getFiltersFromParams());

  useEffect(() => {
    const newFilters = getFiltersFromParams();
    setCurrentFilters(newFilters);
    setSearchQuery(newFilters.query || '');
    performSearch(newFilters);
  }, [params]);

  const performSearch = async (filters: SearchFilters = currentFilters) => {
    setLoading(true);
    setShowSuggestions(false);
    
    try {
      const results = await searchProperties(filters);
      setProperties(results);
    } catch (error) {
      console.error('Search error:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    performSearch(filters);
    
    // Update URL params
    const searchParams: Record<string, string> = {};
    if (filters.query) searchParams.query = filters.query;
    if (filters.propertyType) searchParams.propertyType = filters.propertyType;
    if (filters.category) searchParams.category = filters.category;
    if (filters.minPrice) searchParams.minPrice = filters.minPrice.toString();
    if (filters.maxPrice) searchParams.maxPrice = filters.maxPrice.toString();
    if (filters.bedrooms) searchParams.bedrooms = filters.bedrooms.toString();
    if (filters.bathrooms) searchParams.bathrooms = filters.bathrooms.toString();
    if (filters.location) searchParams.location = filters.location;
    if (filters.sortBy) searchParams.sortBy = filters.sortBy;
    
    router.setParams(searchParams);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await performSearch();
    setRefreshing(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.query) count++;
    if (currentFilters.propertyType) count++;
    if (currentFilters.category) count++;
    if (currentFilters.minPrice || currentFilters.maxPrice) count++;
    if (currentFilters.bedrooms) count++;
    if (currentFilters.bathrooms) count++;
    if (currentFilters.location) count++;
    return count;
  };

  const getResultsText = () => {
    const count = properties.length;
    const filtersCount = getActiveFiltersCount();
    
    if (count === 0) {
      return filtersCount > 0 ? 'No properties match your filters' : 'No results found';
    }
    
    return `${count} ${count === 1 ? 'property' : 'properties'} found`;
  };

  const getSortText = () => {
    switch (currentFilters.sortBy) {
      case 'price_asc': return 'Price: Low to High';
      case 'price_desc': return 'Price: High to Low';
      case 'oldest': return 'Oldest First';
      case 'rating': return 'Highest Rated';
      default: return 'Newest First';
    }
  };

  if (loading && properties.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="hourglass" size={48} color="#3B82F6" />
          <Text className="text-gray-600 font-rubik mt-4">Searching properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-rubik-bold text-gray-900">Search Results</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 bg-white pb-4">
        <Search 
          onAdvancedSearch={handleAdvancedSearch}
          showAdvancedSearch={true}
        />
      </View>

      {/* Results Info */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 font-rubik-bold">{getResultsText()}</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600 font-rubik text-sm mr-2">Sort: {getSortText()}</Text>
            {getActiveFiltersCount() > 0 && (
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-600 font-rubik-bold text-xs">
                  {getActiveFiltersCount()} filters
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <Cards item={item} onPress={() => router.push(`/(root)/properties/${item.$id}`)} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <NoResults />
        )}
        ListFooterComponent={() => (
          properties.length > 0 ? (
            <View className="py-4">
              <Text className="text-center text-gray-500 font-rubik">
                {properties.length} of {properties.length} properties shown
              </Text>
            </View>
          ) : null
        )}
      />
    </SafeAreaView>
  );
};

export default SearchResults;
