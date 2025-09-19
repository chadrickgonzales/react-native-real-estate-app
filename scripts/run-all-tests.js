#!/usr/bin/env node

/**
 * Master Test Runner
 * 
 * This script runs all test suites to provide a comprehensive
 * overview of the entire Real Estate App functionality.
 */

const { exec } = require('child_process');
const path = require('path');

const testSuites = [
  {
    name: 'All Features Test',
    script: 'test-all-features.js',
    description: 'Tests all core features and functionality'
  },
  {
    name: 'UI Features Test',
    script: 'test-ui-features.js',
    description: 'Tests UI-related features and data structures'
  },
  {
    name: 'Performance Test',
    script: 'test-performance.js',
    description: 'Tests performance and scalability'
  },
  {
    name: 'Notification Test',
    script: 'test-notifications-comprehensive.js',
    description: 'Tests notification system specifically'
  },
  {
    name: 'Verification Test',
    script: 'verify-notifications.js',
    description: 'Verifies notification system is working'
  }
];

function runTestSuite(suite) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${suite.name}...`);
    console.log(`📝 ${suite.description}`);
    console.log('=' .repeat(60));
    
    const scriptPath = path.join(__dirname, suite.script);
    
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${suite.name} failed: ${error.message}`);
        resolve({
          name: suite.name,
          success: false,
          error: error.message,
          output: stdout,
          stderr: stderr
        });
        return;
      }
      
      console.log(stdout);
      if (stderr) {
        console.log('⚠️ Warnings:', stderr);
      }
      
      resolve({
        name: suite.name,
        success: true,
        error: null,
        output: stdout,
        stderr: stderr
      });
    });
  });
}

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE REAL ESTATE APP TEST SUITE');
  console.log('=' .repeat(70));
  console.log('Running all test suites to verify complete functionality...\n');
  
  const startTime = Date.now();
  const results = [];
  
  // Run all test suites
  for (const suite of testSuites) {
    try {
      const result = await runTestSuite(suite);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to run ${suite.name}:`, error.message);
      results.push({
        name: suite.name,
        success: false,
        error: error.message,
        output: '',
        stderr: ''
      });
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calculate summary
  const successfulTests = results.filter(result => result.success);
  const failedTests = results.filter(result => !result.success);
  
  // Final Results
  console.log('\n' + '=' .repeat(70));
  console.log('🎉 COMPREHENSIVE TEST RESULTS');
  console.log('=' .repeat(70));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Successful Test Suites: ${successfulTests.length}`);
  console.log(`   ❌ Failed Test Suites: ${failedTests.length}`);
  console.log(`   📈 Total Test Suites: ${results.length}`);
  console.log(`   ⏱️  Total Execution Time: ${totalTime}ms`);
  console.log(`   📊 Success Rate: ${((successfulTests.length / results.length) * 100).toFixed(1)}%`);
  
  console.log('\n📋 TEST SUITE RESULTS:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}`);
    if (!result.success && result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TEST SUITES:');
    failedTests.forEach(test => {
      console.log(`   • ${test.name}`);
      if (test.error) {
        console.log(`     Error: ${test.error}`);
      }
    });
  }
  
  // Overall assessment
  if (successfulTests.length === results.length) {
    console.log('\n🎉 ALL TEST SUITES PASSED!');
    console.log('✨ Your Real Estate App is fully functional and ready for production!');
    console.log('\n📋 WHAT THIS MEANS:');
    console.log('   • All core features are working correctly');
    console.log('   • UI components have proper data structures');
    console.log('   • Performance is within acceptable limits');
    console.log('   • Notification system is fully functional');
    console.log('   • Database operations are working properly');
  } else if (successfulTests.length > failedTests.length) {
    console.log('\n⚠️  MOSTLY SUCCESSFUL');
    console.log('✨ Most features are working, but some issues need attention');
    console.log('\n💡 NEXT STEPS:');
    console.log('   • Review failed test suites above');
    console.log('   • Fix any identified issues');
    console.log('   • Re-run specific test suites to verify fixes');
  } else {
    console.log('\n❌ MULTIPLE TEST SUITES FAILED');
    console.log('⚠️  Several issues need to be addressed');
    console.log('\n💡 RECOMMENDED ACTIONS:');
    console.log('   • Check your Appwrite configuration');
    console.log('   • Verify all collections exist and have proper schemas');
    console.log('   • Run individual test suites to identify specific issues');
    console.log('   • Check the scripts/README.md for setup instructions');
  }
  
  console.log('\n📚 AVAILABLE TEST SUITES:');
  testSuites.forEach(suite => {
    console.log(`   • ${suite.script} - ${suite.description}`);
  });
  
  console.log('\n🔧 QUICK COMMANDS:');
  console.log('   node run.js test-notifications  # Test notifications only');
  console.log('   node run.js verify             # Verify notifications');
  console.log('   node run.js check-saved        # Check saved properties');
  console.log('   node run.js check-notifications # Check notification settings');
  
  console.log('\n📖 For detailed information, see scripts/README.md');
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Master test runner failed:', error.message);
  console.error('Full error:', error);
});
