// Script to check what database fields are missing for availability functionality
const { Client, Databases, ID } = require('appwrite');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";
const PROPERTIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || "properties";

async function checkDatabaseFields() {
  try {
    console.log('🔍 Checking database fields for availability functionality...\n');
    
    if (!PROPERTIES_COLLECTION_ID) {
      console.error('❌ PROPERTIES_COLLECTION_ID not found in environment variables');
      return;
    }

    // Try to get a sample document to see what fields exist
    try {
      console.log('🔍 Checking existing properties to see current fields...');
      
      // Get a sample property to see what fields are available
      const properties = await databases.listDocuments(
        DATABASE_ID, 
        PROPERTIES_COLLECTION_ID,
        [],
        1 // Limit to 1 document
      );
      
      if (properties.documents && properties.documents.length > 0) {
        const sampleProperty = properties.documents[0];
        console.log('✅ Found existing properties');
        console.log('📋 Current fields in properties:');
        
        Object.keys(sampleProperty).forEach(key => {
          if (!key.startsWith('$')) { // Skip system fields
            console.log(`  - ${key}`);
          }
        });
      } else {
        console.log('⚠️  No properties found in the collection');
      }
      
    } catch (error) {
      console.error('❌ Error checking properties:', error.message);
      console.log('This might mean the collection doesn\'t exist or has no documents yet.');
    }

    // List of required availability fields
    const requiredAvailabilityFields = [
      'viewingStartDate',
      'viewingEndDate', 
      'viewingTimeSlots',
      'rentalStartDate',
      'rentalEndDate',
      'checkInTime',
      'checkoutTime',
      'rentalPeriod',
      'minimumStay',
      'maximumStay'
    ];

    console.log('\n🎯 Required availability fields:');
    requiredAvailabilityFields.forEach(field => {
      console.log(`  - ${field}`);
    });

    console.log('\n📝 To add missing fields to your Appwrite database:');
    console.log('1. Go to your Appwrite Console');
    console.log('2. Navigate to Databases → Properties Collection');
    console.log('3. Click "Create Attribute" for each missing field:');
    console.log('');
    
    console.log('For Sale Properties (Viewing Availability):');
    console.log('  viewingStartDate: String, Size: 20, Required: No');
    console.log('  viewingEndDate: String, Size: 20, Required: No');
    console.log('  viewingTimeSlots: String, Size: 500, Required: No');
    console.log('');
    
    console.log('For Rental Properties (Booking Availability):');
    console.log('  rentalStartDate: String, Size: 20, Required: No');
    console.log('  rentalEndDate: String, Size: 20, Required: No');
    console.log('  checkInTime: String, Size: 20, Required: No');
    console.log('  checkoutTime: String, Size: 20, Required: No');
    console.log('  rentalPeriod: String, Size: 50, Required: No');
    console.log('  minimumStay: Integer, Required: No');
    console.log('  maximumStay: Integer, Required: No');
    
    console.log('\n⚠️  Note: All fields should be marked as "Not Required" to avoid breaking existing properties.');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

// Run the check
checkDatabaseFields();
