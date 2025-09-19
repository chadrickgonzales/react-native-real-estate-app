import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { categories } from "@/constants/data";

interface FiltersProps {
  propertyType?: 'rent' | 'sell';
  onCategoryChange?: (category: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ propertyType, onCategoryChange }) => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [selectedCategory, setSelectedCategory] = useState(
    params.filter || "All"
  );

  // Get property type icon
  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'house': case 'home': return 'home';
      case 'apartment': return 'business';
      case 'condo': case 'condos': return 'business-sharp';
      case 'townhouse': case 'townhomes': return 'home-outline';
      case 'villa': return 'diamond';
      case 'duplex': case 'duplexes': return 'copy';
      case 'studio': case 'studios': return 'square';
      default: return 'home';
    }
  };

  // Get property type color
  const getPropertyColor = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'house': case 'home': return '#10B981'; // Emerald Green
      case 'apartment': return '#3B82F6'; // Blue
      case 'condo': case 'condos': return '#8B5CF6'; // Purple
      case 'townhouse': case 'townhomes': return '#F59E0B'; // Amber
      case 'villa': return '#EF4444'; // Red
      case 'duplex': case 'duplexes': return '#06B6D4'; // Cyan
      case 'studio': case 'studios': return '#84CC16'; // Lime Green
      default: return '#6B7280'; // Gray
    }
  };

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("All");
      router.setParams({ filter: "All" });
      onCategoryChange?.("All");
      return;
    }

    setSelectedCategory(category);
    router.setParams({ filter: category });
    onCategoryChange?.(category);
  };

  // Filter categories based on property type
  const getFilteredCategories = () => {
    if (propertyType === 'rent') {
      return categories.filter(cat => 
        ['All', 'House', 'Apartment', 'Villa', 'Studios', 'Townhomes'].includes(cat.category)
      );
    }
    if (propertyType === 'sell') {
      return categories.filter(cat => 
        ['All', 'House', 'Villa', 'Condos', 'Duplexes', 'Townhomes'].includes(cat.category)
      );
    }
    return categories;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName=""
      className="rounded-full"
    >
      {getFilteredCategories().map((item, index) => {
        const isSelected = selectedCategory === item.category;
        const iconName = item.category === 'All' ? 'grid-outline' : getPropertyIcon(item.category);
        const iconColor = item.category === 'All' ? '#6B7280' : getPropertyColor(item.category);
        
        return (
          <TouchableOpacity
            onPress={() => handleCategoryPress(item.category)}
            key={index}
            className={`px-4 py-3 rounded-full mr-3 flex-row items-center ${
              isSelected
                ? ""
                : "bg-gray-100"
            }`}
            style={isSelected ? { backgroundColor: '#14b8a6' } : {}}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={iconName as any} 
                size={16} 
                color={isSelected ? "white" : iconColor} 
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-sm font-rubik-medium ${
                  isSelected
                    ? "text-white"
                    : "text-black-300"
                }`}
              >
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default Filters;