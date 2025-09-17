// Geocoding utility to convert search terms to coordinates
// This is a simplified implementation - in production, you'd use Google Places API or similar

interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  placeName: string;
}

// Mock geocoding data for common places in Tarlac, Philippines
const mockPlaces: Record<string, GeocodeResult> = {
  // Malls and Shopping Centers
  'sm tarlac': { latitude: 15.4869, longitude: 120.5986, address: 'SM City Tarlac, Tarlac City', placeName: 'SM City Tarlac' },
  'sm mall': { latitude: 15.4869, longitude: 120.5986, address: 'SM City Tarlac, Tarlac City', placeName: 'SM City Tarlac' },
  'robinsons tarlac': { latitude: 15.4800, longitude: 120.5900, address: 'Robinsons Place Tarlac, Tarlac City', placeName: 'Robinsons Place Tarlac' },
  'robinsons mall': { latitude: 15.4800, longitude: 120.5900, address: 'Robinsons Place Tarlac, Tarlac City', placeName: 'Robinsons Place Tarlac' },
  
  // Restaurants and Food
  'jollibee': { latitude: 15.4850, longitude: 120.5950, address: 'Jollibee Tarlac, Tarlac City', placeName: 'Jollibee' },
  'mcdonalds': { latitude: 15.4870, longitude: 120.5970, address: 'McDonalds Tarlac, Tarlac City', placeName: 'McDonalds' },
  'kfc': { latitude: 15.4840, longitude: 120.5940, address: 'KFC Tarlac, Tarlac City', placeName: 'KFC' },
  'chowking': { latitude: 15.4860, longitude: 120.5960, address: 'Chowking Tarlac, Tarlac City', placeName: 'Chowking' },
  
  // Schools and Universities
  'tarlac state university': { latitude: 15.4700, longitude: 120.5800, address: 'Tarlac State University, Tarlac City', placeName: 'Tarlac State University' },
  'tsu': { latitude: 15.4700, longitude: 120.5800, address: 'Tarlac State University, Tarlac City', placeName: 'TSU' },
  'don bosco': { latitude: 15.4750, longitude: 120.5850, address: 'Don Bosco Technical Institute, Tarlac City', placeName: 'Don Bosco Technical Institute' },
  
  // Hospitals
  'tarlac provincial hospital': { latitude: 15.4900, longitude: 120.6000, address: 'Tarlac Provincial Hospital, Tarlac City', placeName: 'Tarlac Provincial Hospital' },
  'hospital': { latitude: 15.4900, longitude: 120.6000, address: 'Tarlac Provincial Hospital, Tarlac City', placeName: 'Tarlac Provincial Hospital' },
  
  // Government and Landmarks
  'capitol': { latitude: 15.4850, longitude: 120.5900, address: 'Tarlac Provincial Capitol, Tarlac City', placeName: 'Tarlac Provincial Capitol' },
  'city hall': { latitude: 15.4830, longitude: 120.5920, address: 'Tarlac City Hall, Tarlac City', placeName: 'Tarlac City Hall' },
  
  // Parks and Recreation
  'plaza': { latitude: 15.4840, longitude: 120.5910, address: 'Tarlac City Plaza, Tarlac City', placeName: 'Tarlac City Plaza' },
  'park': { latitude: 15.4840, longitude: 120.5910, address: 'Tarlac City Plaza, Tarlac City', placeName: 'Tarlac City Plaza' },
  
  // Transportation
  'bus terminal': { latitude: 15.4880, longitude: 120.5980, address: 'Tarlac Bus Terminal, Tarlac City', placeName: 'Tarlac Bus Terminal' },
  'terminal': { latitude: 15.4880, longitude: 120.5980, address: 'Tarlac Bus Terminal, Tarlac City', placeName: 'Tarlac Bus Terminal' },
  
  // Generic locations
  'tarlac city': { latitude: 15.4869, longitude: 120.5986, address: 'Tarlac City, Tarlac', placeName: 'Tarlac City' },
  'tarlac': { latitude: 15.4869, longitude: 120.5986, address: 'Tarlac City, Tarlac', placeName: 'Tarlac City' },
  'downtown': { latitude: 15.4840, longitude: 120.5910, address: 'Downtown Tarlac, Tarlac City', placeName: 'Downtown Tarlac' },
  'center': { latitude: 15.4840, longitude: 120.5910, address: 'Tarlac City Center, Tarlac City', placeName: 'Tarlac City Center' },
};

export const geocodeSearchTerm = async (searchTerm: string): Promise<GeocodeResult | null> => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return null;
  }

  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  // Direct match
  if (mockPlaces[normalizedTerm]) {
    return mockPlaces[normalizedTerm];
  }
  
  // Partial match - find places that contain the search term
  const matchingPlaces = Object.entries(mockPlaces).filter(([key, _]) => 
    key.includes(normalizedTerm) || normalizedTerm.includes(key)
  );
  
  if (matchingPlaces.length > 0) {
    // Return the first match
    return matchingPlaces[0][1];
  }
  
  // If no match found, return null
  return null;
};

export const getSearchSuggestions = (searchTerm: string): string[] => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  const suggestions = Object.keys(mockPlaces).filter(place => 
    place.includes(normalizedTerm)
  );
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Filter properties by distance from a location
export const filterPropertiesByDistance = (
  properties: any[], 
  centerLat: number, 
  centerLon: number, 
  maxDistanceKm: number = 5
): any[] => {
  return properties.filter(property => {
    if (!property.latitude || !property.longitude) {
      return false;
    }
    
    const distance = calculateDistance(
      centerLat, 
      centerLon, 
      property.latitude, 
      property.longitude
    );
    
    return distance <= maxDistanceKm;
  });
};
