// Script to add missing fields to properties collection
const { databases } = require('../lib/appwrite');

async function updatePropertiesSchema() {
  try {
    console.log('🏠 Updating properties collection schema...');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID;
    
    if (!databaseId || !collectionId) {
      throw new Error('Missing database or collection ID in environment variables');
    }
    
    // Define all the attributes we need to add
    const attributes = [
      // Contact Information
      { key: 'contactPhone', type: 'string', size: 20, required: false },
      { key: 'contactEmail', type: 'string', size: 255, required: false },
      
      // Property Details for Sale Properties
      { key: 'yearBuilt', type: 'string', size: 10, required: false },
      { key: 'propertyAge', type: 'string', size: 50, required: false },
      { key: 'lotSize', type: 'string', size: 50, required: false },
      { key: 'propertyCondition', type: 'string', size: 50, required: false },
      { key: 'hoaFees', type: 'string', size: 20, required: false },
      { key: 'propertyTaxes', type: 'string', size: 20, required: false },
      
      // Rental Details
      { key: 'leaseDuration', type: 'string', size: 50, required: false },
      { key: 'deposit', type: 'string', size: 20, required: false },
      { key: 'petDeposit', type: 'string', size: 20, required: false },
      { key: 'utilities', type: 'string', size: 500, required: false },
      { key: 'moveInRequirements', type: 'string', size: 500, required: false },
      
      // Property Features (boolean fields)
      { key: 'furnishedStatus', type: 'boolean', required: false },
      { key: 'petFriendly', type: 'boolean', required: false },
      { key: 'hasHOA', type: 'boolean', required: false },
      { key: 'hasPool', type: 'boolean', required: false },
      { key: 'hasGarage', type: 'boolean', required: false },
      { key: 'utilitiesIncluded', type: 'boolean', required: false },
      { key: 'smokingAllowed', type: 'boolean', required: false },
      { key: 'backgroundCheckRequired', type: 'boolean', required: false },
      
      // Additional Details
      { key: 'parkingSpaces', type: 'string', size: 10, required: false },
      { key: 'amenities', type: 'string', size: 1000, required: false }
    ];

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const attr of attributes) {
      try {
        if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required
          );
        } else {
          await databases.createStringAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.size,
            attr.required
          );
        }
        console.log(`✅ Added attribute: ${attr.key}`);
        successCount++;
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️ Attribute ${attr.key} already exists`);
          skipCount++;
        } else {
          console.error(`❌ Error adding ${attr.key}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Schema Update Summary:');
    console.log(`✅ Successfully added: ${successCount} attributes`);
    console.log(`⚠️ Already existed: ${skipCount} attributes`);
    console.log(`❌ Failed to add: ${errorCount} attributes`);
    
    return { success: errorCount === 0, successCount, skipCount, errorCount };
  } catch (error) {
    console.error('❌ Error updating properties schema:', error.message);
    throw error;
  }
}

// Run the schema update
updatePropertiesSchema()
  .then((result) => {
    if (result.success) {
      console.log('🎉 Properties schema update completed successfully!');
    } else {
      console.log('⚠️ Properties schema update completed with some errors');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema update failed:', error.message);
    process.exit(1);
  });
