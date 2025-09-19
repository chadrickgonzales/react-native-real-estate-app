#!/usr/bin/env node

/**
 * Search Workaround Script
 * 
 * This script provides search functionality using filtering instead of
 * fulltext search until indexes are added to Appwrite Console.
 */

const { Client, Databases, Query } = require('appwrite');

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

async function searchProperties(searchTerm, limit = 10) {
  try {
    // Get all properties and filter client-side
    const allProperties = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [Query.limit(100)] // Get more properties for filtering
    );
    
    // Filter properties that match the search term
    const filteredProperties = allProperties.documents.filter(property => {
      const searchLower = searchTerm.toLowerCase();
      return (
        property.name?.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower)
      );
    });
    
    // Return limited results
    return {
      documents: filteredProperties.slice(0, limit),
      total: filteredProperties.length
    };
  } catch (error) {
    console.error('Search error:', error.message);
    return { documents: [], total: 0 };
  }
}

// Export for use in other scripts
module.exports = { searchProperties };

// If run directly, test the search
if (require.main === module) {
  searchProperties('house', 5).then(results => {
    console.log('Search results:', results);
  });
}