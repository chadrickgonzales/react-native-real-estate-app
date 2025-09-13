import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

import { categories } from "@/constants/data";

interface FiltersProps {
  propertyType?: 'rent' | 'sell';
  onCategoryChange?: (category: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ propertyType, onCategoryChange }) => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [selectedCategory, setSelectedCategory] = useState(
    params.filter || "Trending"
  );

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("Trending");
      router.setParams({ filter: "Trending" });
      onCategoryChange?.("Trending");
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
        ['Trending', 'House', 'Apartment', 'Villa', 'Studios', 'Apartments', 'Townhomes'].includes(cat.category)
      );
    }
    if (propertyType === 'sell') {
      return categories.filter(cat => 
        ['Trending', 'House', 'Villa', 'Condos', 'Duplexes', 'Townhomes'].includes(cat.category)
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
      {getFilteredCategories().map((item, index) => (
        <TouchableOpacity
          onPress={() => handleCategoryPress(item.category)}
          key={index}
          className={`px-6 py-3 rounded-full mr-3 ${
            selectedCategory === item.category
              ? "bg-primary-300"
              : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-sm font-rubik-medium ${
              selectedCategory === item.category
                ? "text-white"
                : "text-black-300"
            }`}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Filters;