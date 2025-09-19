import { ID } from "react-native-appwrite";
import { config, databases } from "./appwrite";
import {
    propertiesImages,
} from "./data";

const COLLECTIONS = {
  PROPERTY: config.propertiesCollectionId,
};

const propertyTypes = [
  "House",
  "Apartment",
  "Villa",
  "Condos",
  "Duplexes",
  "Studios",
  "Townhomes",
];

const propertyCategories = [
  "House",
  "Apartment",
  "Villa",
  "Condos",
  "Duplexes",
  "Studios",
  "Townhomes",
];


const amenities = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Balcony",
  "Garden",
  "Security",
  "Elevator",
  "Air Conditioning",
  "Heating",
  "Dishwasher",
  "Washing Machine",
  "Dryer",
  "WiFi",
  "Cable TV",
  "Pet Friendly",
  "Furnished",
  "Unfurnished",
  "Near Public Transport",
  "Shopping Center",
  "School Nearby",
];

const propertyConditions = [
  "New",
  "Excellent", 
  "Good",
  "Fair",
  "Needs Renovation",
];

const leaseDurations = [
  "6 months",
  "12 months", 
  "18 months",
  "24 months",
  "Month-to-month",
];

const utilitiesOptions = [
  "Electricity",
  "Gas",
  "Water",
  "Internet",
  "Cable TV",
  "Trash",
  "Sewer",
];

const moveInRequirements = [
  "Credit Check",
  "Background Check", 
  "References",
  "Employment Verification",
  "Income Verification",
  "Security Deposit",
  "First Month Rent",
  "Last Month Rent",
];

const propertyNamePrefixes = [
  "Casa",
  "Villa",
  "Residence",
  "Manor",
  "Garden",
  "Park",
  "Heights",
  "View",
  "Plaza",
  "Terraces",
  "Estates",
  "Haven",
  "Retreat",
  "Oasis",
  "Sanctuary",
  "Palace",
  "Court",
  "Square",
  "Place",
  "Homes",
];

const propertyNameSuffixes = [
  "de Tarlac",
  "del Norte",
  "de la Paz",
  "de San Miguel",
  "de San Nicolas",
  "de San Sebastian",
  "de Rizal",
  "de Burgos",
  "de Mabini",
  "de Luna",
  "de Bonifacio",
  "de Quezon",
  "de MacArthur",
  "de la Salle",
  "de San Jose",
  "de San Antonio",
  "de San Pedro",
  "de San Pablo",
  "de San Juan",
  "de San Francisco",
];

const propertyNameMiddle = [
  "Grand",
  "Royal",
  "Elite",
  "Premium",
  "Luxury",
  "Modern",
  "Classic",
  "Elegant",
  "Charming",
  "Beautiful",
  "Spacious",
  "Cozy",
  "Bright",
  "Serene",
  "Peaceful",
  "Tranquil",
  "Exclusive",
  "Private",
  "Secure",
  "Family",
];

function getRandomSubset<T>(
  array: T[],
  minItems: number,
  maxItems: number
): T[] {
  if (minItems > maxItems) {
    throw new Error("minItems cannot be greater than maxItems");
  }
  if (minItems < 0 || maxItems > array.length) {
    throw new Error(
      "minItems or maxItems are out of valid range for the array"
    );
  }

  // Generate a random size for the subset within the range [minItems, maxItems]
  const subsetSize =
    Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

  // Create a copy of the array to avoid modifying the original
  const arrayCopy = [...array];

  // Shuffle the array copy using Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[i],
    ];
  }

  // Return the first `subsetSize` elements of the shuffled array
  return arrayCopy.slice(0, subsetSize);
}

function generatePropertyName(): string {
  const prefix = propertyNamePrefixes[Math.floor(Math.random() * propertyNamePrefixes.length)];
  const middle = propertyNameMiddle[Math.floor(Math.random() * propertyNameMiddle.length)];
  const suffix = propertyNameSuffixes[Math.floor(Math.random() * propertyNameSuffixes.length)];
  
  // Sometimes add a number for variety
  const hasNumber = Math.random() > 0.7;
  const number = hasNumber ? ` ${Math.floor(Math.random() * 99) + 1}` : '';
  
  return `${prefix} ${middle}${number} ${suffix}`;
}

async function seed() {
  try {
    // Clear existing data from properties collection
    const documents = await databases.listDocuments(
      config.databaseId!,
      COLLECTIONS.PROPERTY!
    );
    for (const doc of documents.documents) {
      await databases.deleteDocument(
        config.databaseId!,
        COLLECTIONS.PROPERTY!,
        doc.$id
      );
    }

    console.log("Cleared all existing properties.");

    // Seed Properties
    for (let i = 1; i <= 60; i++) {
      const selectedAmenities = amenities
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 3); // 3-7 amenities

      // Generate multiple images for the property (using local image paths)
      const propertyImages = [];
      for (let j = 0; j < Math.floor(Math.random() * 3) + 2; j++) { // 2-4 images
        const randomImage = propertiesImages[Math.floor(Math.random() * propertiesImages.length)];
        propertyImages.push(randomImage);
      }

      // Primary image (first image in the array)
      const primaryImage = propertyImages.length > 0 ? propertyImages[0] : "";

      // Random property type (sell or rent)
      const propertyType = Math.random() > 0.5 ? 'sell' : 'rent';
      
      // Generate realistic coordinates (around Tarlac City, Philippines)
      const baseLat = 15.4869 + (Math.random() - 0.5) * 0.05; // Tarlac City center
      const baseLng = 120.5986 + (Math.random() - 0.5) * 0.05;

      // Generate available date (within next 3 months)
      const availableDate = new Date();
      availableDate.setDate(availableDate.getDate() + Math.floor(Math.random() * 90));

      // Generate consistent property type for this property
      const selectedPropertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      
      const property = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.PROPERTY!,
        ID.unique(),
        {
          // Basic property information
          name: generatePropertyName(),
          type: selectedPropertyType,
          description: `Beautiful ${selectedPropertyType} located in a prime area. This property features modern amenities and is perfect for ${propertyType === 'sell' ? 'buyers' : 'renters'} looking for quality living space.`,
          address: `${Math.floor(Math.random() * 999) + 1} ${['Rizal St', 'Burgos Ave', 'Mabini Rd', 'Luna St', 'Bonifacio Ave', 'Quezon Blvd', 'Tarlac-MacArthur Hwy', 'San Miguel St', 'San Nicolas Ave', 'San Sebastian Rd'][Math.floor(Math.random() * 10)]}, Tarlac City, Tarlac`,
          price: propertyType === 'sell' 
            ? Math.floor(Math.random() * 8000000) + 2000000 // ₱2M - ₱10M for sale
            : Math.floor(Math.random() * 30000) + 10000, // ₱10k - ₱40k for rent
          area: Math.floor(Math.random() * 3000) + 500,
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 4) + 1,
          rating: Math.floor(Math.random() * 5) + 1,
          
          // Images
          image: primaryImage, // Primary image
          images: JSON.stringify(propertyImages), // All images as JSON string
          
          // Property type and availability
          propertyType: propertyType,
          availableDate: availableDate.toISOString().split('T')[0], // YYYY-MM-DD format
          
          // Contact information
          contactPhone: `+63-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          contactEmail: `property${i}@example.com`,
          
          // Location coordinates
          latitude: baseLat,
          longitude: baseLng,
          
          // Boolean features
          furnishedStatus: Math.random() > 0.7, // 30% chance
          petFriendly: Math.random() > 0.6, // 40% chance
          hasHOA: Math.random() > 0.8, // 20% chance
          hasPool: Math.random() > 0.85, // 15% chance
          hasGarage: Math.random() > 0.5, // 50% chance
          utilitiesIncluded: propertyType === 'rent' && Math.random() > 0.6, // 40% chance for rentals
          smokingAllowed: propertyType === 'rent' && Math.random() > 0.8, // 20% chance for rentals
          backgroundCheckRequired: propertyType === 'rent' && Math.random() > 0.7, // 30% chance for rentals
          
          // Property details
          propertyAge: (Math.floor(Math.random() * 50) + 1).toString(), // 1-50 years as string
          parkingSpaces: (Math.floor(Math.random() * 4) + 1).toString(), // 1-4 spaces as string
          yearBuilt: (2024 - Math.floor(Math.random() * 50)).toString(), // Built between 1974-2024
          lotSize: (Math.floor(Math.random() * 10000) + 2000).toString(), // 2000-12000 sq ft as string
          propertyCondition: propertyConditions[Math.floor(Math.random() * propertyConditions.length)],
          
          // Financial details (for selling)
          hoaFees: propertyType === 'sell' && Math.random() > 0.7 
            ? `₱${Math.floor(Math.random() * 5000) + 1000}` 
            : "",
          propertyTaxes: propertyType === 'sell' 
            ? `₱${Math.floor(Math.random() * 100000) + 20000}` 
            : "",
          
          // Rental details (for renting)
          leaseDuration: propertyType === 'rent' 
            ? leaseDurations[Math.floor(Math.random() * leaseDurations.length)]
            : "",
          deposit: propertyType === 'rent' 
            ? `₱${Math.floor(Math.random() * 20000) + 5000}` 
            : "",
          utilities: propertyType === 'rent' 
            ? getRandomSubset(utilitiesOptions, 2, 4).join(', ')
            : "",
          moveInRequirements: propertyType === 'rent' 
            ? getRandomSubset(moveInRequirements, 2, 4).join(', ')
            : "",
          petDeposit: propertyType === 'rent' && Math.random() > 0.6
            ? `₱${Math.floor(Math.random() * 5000) + 2000}`
            : "",
          utilitiesResponsibility: propertyType === 'rent'
            ? `Tenant pays: ${getRandomSubset(utilitiesOptions, 1, 3).join(', ')}. Landlord pays: ${getRandomSubset(utilitiesOptions, 1, 2).join(', ')}.`
            : "",
          furnitureIncluded: propertyType === 'rent' && Math.random() > 0.5
            ? ['Bed', 'Dresser', 'Dining Table', 'Sofa', 'TV Stand'][Math.floor(Math.random() * 5)]
            : "",
          utilitiesIncludedText: propertyType === 'rent' && Math.random() > 0.6
            ? getRandomSubset(utilitiesOptions, 2, 4).join(', ')
            : "",
          
          // Amenities and features
          amenities: selectedAmenities.join(', '),
        }
      );

      console.log(`Seeded ${propertyType} property: ${property.name}`);
    }

    console.log("Data seeding completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

export default seed;