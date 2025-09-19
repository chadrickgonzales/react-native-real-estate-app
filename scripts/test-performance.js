#!/usr/bin/env node

/**
 * Performance and Stress Test Suite
 * 
 * This script tests the performance and scalability of the Real Estate App
 * by simulating high load scenarios and measuring response times.
 */

const { Client, Databases, Query, ID } = require('appwrite');
const { searchProperties } = require('./search-workaround');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

// Performance tracking
const performanceResults = {
  tests: [],
  totalTime: 0,
  averageTime: 0,
  slowestTest: null,
  fastestTest: null
};

function measureTime(testName, testFunction) {
  return async (...args) => {
    const startTime = Date.now();
    try {
      const result = await testFunction(...args);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      performanceResults.tests.push({
        name: testName,
        duration: duration,
        success: true,
        error: null
      });
      
      console.log(`✅ ${testName} - ${duration}ms`);
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      performanceResults.tests.push({
        name: testName,
        duration: duration,
        success: false,
        error: error.message
      });
      
      console.log(`❌ ${testName} - ${duration}ms - ${error.message}`);
      throw error;
    }
  };
}

async function testPropertyRetrievalPerformance() {
  console.log('\n🏠 TESTING PROPERTY RETRIEVAL PERFORMANCE');
  console.log('=' .repeat(50));
  
  const testCases = [
    { name: 'Single Property', limit: 1 },
    { name: 'Small Batch (5)', limit: 5 },
    { name: 'Medium Batch (20)', limit: 20 },
    { name: 'Large Batch (50)', limit: 50 },
    { name: 'Very Large Batch (100)', limit: 100 }
  ];
  
  for (const testCase of testCases) {
    await measureTime(`Property Retrieval (${testCase.name})`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [Query.limit(testCase.limit)]
      );
    })();
  }
}

async function testSearchPerformance() {
  console.log('\n🔍 TESTING SEARCH PERFORMANCE');
  console.log('=' .repeat(50));
  
  const searchTerms = ['house', 'apartment', 'villa', 'condo', 'beautiful'];
  
  for (const term of searchTerms) {
    await measureTime(`Search: "${term}"`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [Query.search("name", term), Query.limit(10)]
      );
    })();
  }
}

async function testFilteringPerformance() {
  console.log('\n🔧 TESTING FILTERING PERFORMANCE');
  console.log('=' .repeat(50));
  
  const filters = [
    { name: 'Type Filter', query: [Query.equal("type", "House")] },
    { name: 'Price Range', query: [Query.greaterThanEqual("price", 100000), Query.lessThanEqual("price", 1000000)] },
    { name: 'Bedrooms', query: [Query.equal("bedrooms", 3)] },
    { name: 'Bathrooms', query: [Query.equal("bathrooms", 2)] },
    { name: 'Pet Friendly', query: [Query.equal("petFriendly", true)] },
    { name: 'Has Pool', query: [Query.equal("hasPool", true)] },
    { name: 'Complex Filter', query: [
      Query.equal("type", "House"),
      Query.greaterThanEqual("price", 200000),
      Query.lessThanEqual("price", 800000),
      Query.equal("bedrooms", 3),
      Query.equal("bathrooms", 2)
    ]}
  ];
  
  for (const filter of filters) {
    await measureTime(`Filter: ${filter.name}`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [...filter.query, Query.limit(20)]
      );
    })();
  }
}

async function testConcurrentRequests() {
  console.log('\n⚡ TESTING CONCURRENT REQUESTS');
  console.log('=' .repeat(50));
  
  const concurrentTests = [
    { name: '5 Concurrent Requests', count: 5 },
    { name: '10 Concurrent Requests', count: 10 },
    { name: '20 Concurrent Requests', count: 20 }
  ];
  
  for (const test of concurrentTests) {
    await measureTime(`Concurrent: ${test.name}`, async () => {
      const promises = [];
      for (let i = 0; i < test.count; i++) {
        promises.push(
          databases.listDocuments(
            DATABASE_ID,
            "properties",
            [Query.limit(5)]
          )
        );
      }
      await Promise.all(promises);
    })();
  }
}

async function testNotificationPerformance() {
  console.log('\n🔔 TESTING NOTIFICATION PERFORMANCE');
  console.log('=' .repeat(50));
  
  const notificationTests = [
    { name: 'Get User Notifications', query: [Query.equal("userId", "test_user")] },
    { name: 'Get Unread Notifications', query: [Query.equal("isRead", false)] },
    { name: 'Get High Priority', query: [Query.equal("priority", "high")] },
    { name: 'Get by Type', query: [Query.equal("type", "property")] }
  ];
  
  for (const test of notificationTests) {
    await measureTime(`Notifications: ${test.name}`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        "notifications",
        [...test.query, Query.limit(20)]
      );
    })();
  }
}

async function testChatPerformance() {
  console.log('\n💬 TESTING CHAT PERFORMANCE');
  console.log('=' .repeat(50));
  
  const chatTests = [
    { name: 'Get User Chats', query: [Query.equal("buyerId", "test_user")] },
    { name: 'Get Chat Messages', query: [Query.equal("chatId", "test_chat")] },
    { name: 'Get Unread Messages', query: [Query.equal("isRead", false)] }
  ];
  
  for (const test of chatTests) {
    await measureTime(`Chat: ${test.name}`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        test.name.includes('Messages') ? "messages" : "chats",
        [...test.query, Query.limit(20)]
      );
    })();
  }
}

async function testSavedPropertiesPerformance() {
  console.log('\n💾 TESTING SAVED PROPERTIES PERFORMANCE');
  console.log('=' .repeat(50));
  
  const savedTests = [
    { name: 'Get Saved Properties', query: [Query.equal("userId", "test_user")] },
    { name: 'Get Sale Properties', query: [Query.equal("listingType", "sale")] },
    { name: 'Get Rent Properties', query: [Query.equal("listingType", "rent")] },
    { name: 'Get Recent Saves', query: [Query.orderDesc("addedDate")] }
  ];
  
  for (const test of savedTests) {
    await measureTime(`Saved Properties: ${test.name}`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        "saved_properties",
        [...test.query, Query.limit(20)]
      );
    })();
  }
}

async function testDatabaseStress() {
  console.log('\n💪 TESTING DATABASE STRESS');
  console.log('=' .repeat(50));
  
  // Test rapid sequential requests
  await measureTime('Rapid Sequential Requests (10)', async () => {
    for (let i = 0; i < 10; i++) {
      await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [Query.limit(5)]
      );
    }
  })();
  
  // Test mixed operations
  await measureTime('Mixed Operations (5 each)', async () => {
    const operations = [
      () => databases.listDocuments(DATABASE_ID, "properties", [Query.limit(5)]),
      () => databases.listDocuments(DATABASE_ID, "notifications", [Query.limit(5)]),
      () => databases.listDocuments(DATABASE_ID, "saved_properties", [Query.limit(5)]),
      () => databases.listDocuments(DATABASE_ID, "chats", [Query.limit(5)]),
      () => databases.listDocuments(DATABASE_ID, "users", [Query.limit(5)])
    ];
    
    for (let i = 0; i < 5; i++) {
      for (const operation of operations) {
        await operation();
      }
    }
  })();
}

async function testLocationBasedPerformance() {
  console.log('\n🗺️ TESTING LOCATION-BASED PERFORMANCE');
  console.log('=' .repeat(50));
  
  const locationTests = [
    { name: 'Latitude Range', query: [Query.greaterThan("latitude", 40.0), Query.lessThan("latitude", 41.0)] },
    { name: 'Longitude Range', query: [Query.greaterThan("longitude", -75.0), Query.lessThan("longitude", -74.0)] },
    { name: 'Location Box', query: [
      Query.greaterThan("latitude", 40.0),
      Query.lessThan("latitude", 41.0),
      Query.greaterThan("longitude", -75.0),
      Query.lessThan("longitude", -74.0)
    ]}
  ];
  
  for (const test of locationTests) {
    await measureTime(`Location: ${test.name}`, async () => {
      await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [...test.query, Query.limit(20)]
      );
    })();
  }
}

async function runPerformanceTests() {
  console.log('⚡ COMPREHENSIVE PERFORMANCE TEST SUITE');
  console.log('=' .repeat(60));
  console.log('Testing performance and scalability...\n');
  
  const startTime = Date.now();
  
  await testPropertyRetrievalPerformance();
  await testSearchPerformance();
  await testFilteringPerformance();
  await testConcurrentRequests();
  await testNotificationPerformance();
  await testChatPerformance();
  await testSavedPropertiesPerformance();
  await testDatabaseStress();
  await testLocationBasedPerformance();
  
  const endTime = Date.now();
  performanceResults.totalTime = endTime - startTime;
  
  // Calculate statistics
  const successfulTests = performanceResults.tests.filter(test => test.success);
  const failedTests = performanceResults.tests.filter(test => !test.success);
  
  if (successfulTests.length > 0) {
    const durations = successfulTests.map(test => test.duration);
    performanceResults.averageTime = durations.reduce((a, b) => a + b, 0) / durations.length;
    performanceResults.slowestTest = successfulTests.reduce((max, test) => 
      test.duration > max.duration ? test : max
    );
    performanceResults.fastestTest = successfulTests.reduce((min, test) => 
      test.duration < min.duration ? test : min
    );
  }
  
  // Final Results
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 PERFORMANCE TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Successful: ${successfulTests.length}`);
  console.log(`   ❌ Failed: ${failedTests.length}`);
  console.log(`   📈 Total Tests: ${performanceResults.tests.length}`);
  console.log(`   ⏱️  Total Time: ${performanceResults.totalTime}ms`);
  console.log(`   📊 Average Time: ${performanceResults.averageTime.toFixed(2)}ms`);
  
  if (performanceResults.slowestTest) {
    console.log(`   🐌 Slowest Test: ${performanceResults.slowestTest.name} (${performanceResults.slowestTest.duration}ms)`);
  }
  
  if (performanceResults.fastestTest) {
    console.log(`   🚀 Fastest Test: ${performanceResults.fastestTest.name} (${performanceResults.fastestTest.duration}ms)`);
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });
  }
  
  // Performance recommendations
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
  
  if (performanceResults.averageTime > 1000) {
    console.log('   ⚠️  Average response time is high (>1s)');
    console.log('   💡 Consider optimizing database queries');
  }
  
  if (performanceResults.slowestTest && performanceResults.slowestTest.duration > 5000) {
    console.log('   ⚠️  Some tests are very slow (>5s)');
    console.log('   💡 Consider adding database indexes');
  }
  
  if (successfulTests.length === performanceResults.tests.length) {
    console.log('   ✅ All performance tests passed');
    console.log('   🎉 Your app is performing well!');
  } else {
    console.log('   ⚠️  Some performance tests failed');
    console.log('   💡 Check failed tests and optimize accordingly');
  }
  
  console.log('\n📋 PERFORMANCE FEATURES TESTED:');
  console.log('   • Property retrieval performance');
  console.log('   • Search performance');
  console.log('   • Filtering performance');
  console.log('   • Concurrent request handling');
  console.log('   • Notification performance');
  console.log('   • Chat performance');
  console.log('   • Saved properties performance');
  console.log('   • Database stress testing');
  console.log('   • Location-based performance');
}

// Run performance tests
runPerformanceTests().catch(error => {
  console.error('❌ Performance test suite failed:', error.message);
  console.error('Full error:', error);
});
