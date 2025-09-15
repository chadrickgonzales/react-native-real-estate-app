/**
 * Utility function to safely convert any value to a string URI for Image components
 * This prevents RCTImageView errors when numeric values are passed as URIs
 */
export const getImageUri = (value: any, fallback?: any): string | any => {
  // If value is null, undefined, or empty, return fallback
  if (!value) {
    return fallback;
  }
  
  // If value is already a string, return it
  if (typeof value === 'string') {
    return value;
  }
  
  // If value is a number, convert to string
  if (typeof value === 'number') {
    return String(value);
  }
  
  // For any other type, try to convert to string
  try {
    return String(value);
  } catch (error) {
    console.warn('Failed to convert image value to string:', value, error);
    return fallback;
  }
};

/**
 * Creates a safe image source object for React Native Image components
 */
export const createImageSource = (uri: any, fallback?: any) => {
  const safeUri = getImageUri(uri, fallback);
  
  // If we have a fallback and the URI is the fallback, return the fallback directly
  if (fallback && safeUri === fallback) {
    return fallback;
  }
  
  // Otherwise, return the URI object
  return { uri: safeUri };
};
