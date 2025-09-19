import icons from '@/constants/icons'
import { router, useLocalSearchParams, usePathname } from 'expo-router'
import React, { useState } from 'react'
import { Image, TextInput, TouchableOpacity, View } from 'react-native'
import { useDebouncedCallback } from "use-debounce"
import AdvancedSearch, { SearchFilters } from './AdvancedSearch'

interface SearchProps {
  onAdvancedSearch?: (filters: SearchFilters) => void;
  showAdvancedSearch?: boolean;
}

const Search = ({ onAdvancedSearch, showAdvancedSearch = true }: SearchProps) => {
  const params = useLocalSearchParams<{ query?: string }>()
  const path = usePathname();
  const [search, setSearch] = useState(params.query);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const debouncedSearch = useDebouncedCallback ((text:string) => router.setParams({ query: text}), 500);

  const handleSearch = (text: string) =>{ setSearch(text); debouncedSearch(text); }

  const handleAdvancedSearch = (filters: SearchFilters) => {
    if (onAdvancedSearch) {
      onAdvancedSearch(filters);
    } else {
      // Default behavior: update URL params with filters
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
    }
  };

  return (
    <>
      <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
        <View className="flex-1 flex flex-row items-center justify-start z-50">
          <Image source={icons.search} className="size-5"/>
          <TextInput 
            value={search} 
            onChangeText={handleSearch} 
            placeholder="Search for anything" 
            className="text-sm font-rubik text-black-300 ml-2 flex-1"
          />
        </View>

        {showAdvancedSearch && (
          <TouchableOpacity onPress={() => setShowAdvanced(true)}>
            <Image source={icons.filter} className="size-5"/>
          </TouchableOpacity>
        )}
      </View>

      {showAdvancedSearch && (
        <AdvancedSearch
          visible={showAdvanced}
          onClose={() => setShowAdvanced(false)}
          onSearch={handleAdvancedSearch}
          initialFilters={{ query: search || '' }}
        />
      )}
    </>
  )
}

export default Search
