import { ID } from "react-native-appwrite";
import { config, databases } from "./appwrite";
import {
    propertiesImages,
} from "./data";

const COLLECTIONS = {
  PROPERTY: config.propertiesCollectionId,
  USER: config.usersCollectionId,
  REVIEWS: config.reviewsCollectionId,
  GALLERIES: config.galleriesCollectionId,
  AGENTS: config.agentsCollectionId,
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

const ownerNames = [
  "Juan Dela Cruz", "Maria Santos", "Pedro Rodriguez", "Ana Garcia",
  "Carlos Lopez", "Isabella Martinez", "Miguel Torres", "Sofia Hernandez",
  "Diego Ramirez", "Valentina Flores", "Alejandro Morales", "Camila Vega",
  "Sebastian Castro", "Gabriela Ruiz", "Nicolas Jimenez", "Valeria Mendoza"
];

const ownerEmails = [
  "juan.delacruz@email.com", "maria.santos@email.com", "pedro.rodriguez@email.com",
  "ana.garcia@email.com", "carlos.lopez@email.com", "isabella.martinez@email.com",
  "miguel.torres@email.com", "sofia.hernandez@email.com", "diego.ramirez@email.com",
  "valentina.flores@email.com", "alejandro.morales@email.com", "camila.vega@email.com",
  "sebastian.castro@email.com", "gabriela.ruiz@email.com", "nicolas.jimenez@email.com",
  "valeria.mendoza@email.com"
];

const phoneNumbers = [
  "+63-912-345-6789", "+63-917-234-5678", "+63-918-345-6789", "+63-919-456-7890",
  "+63-920-567-8901", "+63-921-678-9012", "+63-922-789-0123", "+63-923-890-1234",
  "+63-924-901-2345", "+63-925-012-3456", "+63-926-123-4567", "+63-927-234-5678",
  "+63-928-345-6789", "+63-929-456-7890", "+63-930-567-8901", "+63-931-678-9012"
];

const streets = [
  "Rizal St", "Burgos Ave", "Mabini Rd", "Luna St", "Bonifacio Ave", "Quezon Blvd",
  "Tarlac-MacArthur Hwy", "San Miguel St", "San Nicolas Ave", "San Sebastian Rd",
  "Jose Rizal Ave", "Andres Bonifacio St", "Marcelo H. del Pilar Ave", "Graciano Lopez St",
  "Juan Luna Ave", "Antonio Luna St", "Emilio Aguinaldo Ave", "Apolinario Mabini St"
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

async function clearCollection(collectionId: string, collectionName: string) {
  try {
    console.log(`🧹 Clearing ${collectionName} collection...`);
    const documents = await databases.listDocuments(config.databaseId!, collectionId);
    
    for (const doc of documents.documents) {
      await databases.deleteDocument(config.databaseId!, collectionId, doc.$id);
    }
    
    console.log(`✅ Cleared ${documents.documents.length} documents from ${collectionName}`);
  } catch (error) {
    console.log(`⚠️ Could not clear ${collectionName}: ${error.message}`);
  }
}

async function seedBookings() {
  console.log("📅 Seeding bookings...");
  
  try {
    // Get some properties to create bookings for
    const properties = await databases.listDocuments(config.databaseId!, COLLECTIONS.PROPERTY!);
    
    if (properties.documents.length === 0) {
      console.log("⚠️ No properties found to create bookings for");
      return;
    }
    
    // Create 20 sample bookings
    for (let i = 1; i <= 20; i++) {
      const property = properties.documents[Math.floor(Math.random() * properties.documents.length)];
      
      // Generate booking date (past and future)
      const bookingDate = new Date();
      const isPastBooking = Math.random() > 0.7; // 30% chance of past booking
      if (isPastBooking) {
        bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 30));
      } else {
        bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30));
      }
      
      // Generate time slot (9 AM to 5 PM, 30-minute intervals)
      const hour = Math.floor(Math.random() * 8) + 9; // 9-16 (9 AM to 4 PM)
      const minute = Math.random() > 0.5 ? 30 : 0;
      const bookingTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Determine status based on date
      let status = 'pending';
      if (isPastBooking) {
        status = Math.random() > 0.2 ? 'completed' : 'cancelled';
      } else {
        status = Math.random() > 0.3 ? 'confirmed' : 'pending';
      }
      
      const booking = await databases.createDocument(
        config.databaseId!,
        'bookings',
        ID.unique(),
        {
          userId: `user_${Math.floor(Math.random() * 10) + 1}`,
          propertyId: property.$id,
          propertyName: property.name,
          propertyAddress: property.address,
          propertyImage: property.image,
          ownerId: property.ownerId || `owner_${Math.floor(Math.random() * 10) + 1}`,
          ownerName: property.ownerName || ownerNames[Math.floor(Math.random() * ownerNames.length)],
          ownerEmail: property.contactEmail,
          ownerPhone: property.contactPhone,
          bookingDate: bookingDate.toISOString().split('T')[0],
          bookingTime: bookingTime,
          duration: 60,
          status: status,
          totalAmount: property.price,
          currency: 'PHP',
          guests: Math.floor(Math.random() * 4) + 1,
          specialRequests: Math.random() > 0.7 ? 'Need parking for 2 cars' : '',
          cancellationReason: status === 'cancelled' ? 'Schedule conflict' : '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      
      console.log(`✅ Seeded booking: ${booking.propertyName} on ${booking.bookingDate} at ${booking.bookingTime}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not seed bookings: ${error.message}`);
  }
}

async function seedReviews() {
  console.log("⭐ Seeding reviews...");
  
  try {
    // Get some properties to create reviews for
    const properties = await databases.listDocuments(config.databaseId!, COLLECTIONS.PROPERTY!);
    
    if (properties.documents.length === 0) {
      console.log("⚠️ No properties found to create reviews for");
      return;
    }
    
    // Create 30 sample reviews
    for (let i = 1; i <= 30; i++) {
      const property = properties.documents[Math.floor(Math.random() * properties.documents.length)];
      
      const reviewTexts = [
        "Excellent property! Very clean and well-maintained.",
        "Great location and amazing amenities. Highly recommended!",
        "The property exceeded our expectations. Perfect for families.",
        "Beautiful place with modern facilities. Will definitely book again.",
        "Outstanding service and wonderful property. 5 stars!",
        "Very satisfied with our stay. The property is exactly as described.",
        "Fantastic experience! The owner was very helpful and responsive.",
        "Amazing property with great views. Perfect for a relaxing getaway.",
        "Clean, comfortable, and well-equipped. Highly recommend!",
        "Excellent value for money. The property is in great condition."
      ];
      
      const review = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.REVIEWS!,
        ID.unique(),
        {
          propertyId: property.$id,
          userId: `user_${Math.floor(Math.random() * 10) + 1}`,
          userName: `User${Math.floor(Math.random() * 100) + 1}`,
          rating: Math.floor(Math.random() * 5) + 1,
          reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          createdAt: new Date().toISOString()
        }
      );
      
      console.log(`✅ Seeded review: ${review.rating} stars for ${property.name}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not seed reviews: ${error.message}`);
  }
}

async function seed() {
  try {
    console.log("🌱 Starting complete database seeding...\n");
    
    // Clear all collections except users
    await clearCollection(COLLECTIONS.PROPERTY!, "Properties");
    await clearCollection('bookings', "Bookings");
    await clearCollection(COLLECTIONS.REVIEWS!, "Reviews");
    await clearCollection(COLLECTIONS.GALLERIES!, "Galleries");
    await clearCollection(COLLECTIONS.AGENTS!, "Agents");
    
    console.log("\n📊 Seeding data...\n");

    // Seed Properties
    for (let i = 1; i <= 50; i++) {
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
      
      // Select owner details
      const ownerIndex = Math.floor(Math.random() * ownerNames.length);
      const ownerName = ownerNames[ownerIndex];
      const ownerEmail = ownerEmails[ownerIndex];
      const ownerPhone = phoneNumbers[ownerIndex];
      
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
          contactPhone: ownerPhone,
          contactEmail: ownerEmail,
          
          // Owner information (for bookings)
          ownerId: `owner_${i}`,
          ownerName: ownerName,
          
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

      console.log(`✅ Seeded ${propertyType} property: ${property.name}`);
    }

    // Seed additional data
    await seedBookings();
    await seedReviews();

    console.log("\n🎉 Complete database seeding finished!");
    console.log("\n📋 Summary:");
    console.log("• Properties: 50 properties (mix of sale/rent)");
    console.log("• Bookings: 20 sample bookings (past and future)");
    console.log("• Reviews: 30 property reviews");
    console.log("• All collections cleared and repopulated");
    console.log("\n🧪 You can now test all features:");
    console.log("• Property browsing and details");
    console.log("• Booking system and calendar");
    console.log("• Time slot selection");
    console.log("• Property reviews");
    console.log("• Search and filtering");
    
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  }
}

export default seed;