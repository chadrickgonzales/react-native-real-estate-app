#!/usr/bin/env node

/**
 * Script Runner
 * 
 * A convenient way to run common setup and testing tasks
 */

const { exec } = require('child_process');
const path = require('path');

const scripts = {
  'setup': 'setup-appwrite.js',
  'setup-saved': 'setup-saved-collections.js',
  'setup-chat': 'setup-chat.js',
  'test-all': 'test-all-features.js',
  'test-ui': 'test-ui-features.js',
  'test-performance': 'test-performance.js',
  'test-notifications': 'test-notifications-comprehensive.js',
  'verify': 'verify-notifications.js',
  'run-all-tests': 'run-all-tests.js',
  'check-saved': 'check-saved-properties.js',
  'check-notifications': 'check-notification-settings.js'
};

function runScript(scriptName) {
  const scriptPath = path.join(__dirname, scripts[scriptName]);
  
  if (!scripts[scriptName]) {
    console.log('❌ Unknown script:', scriptName);
    console.log('\n📋 Available scripts:');
    Object.keys(scripts).forEach(key => {
      console.log(`   • ${key} - ${scripts[key]}`);
    });
    return;
  }

  console.log(`🚀 Running ${scripts[scriptName]}...\n`);
  
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Script failed:', error.message);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Script warnings:', stderr);
    }
    
    console.log(stdout);
  });
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔧 Script Runner for Real Estate App\n');
  console.log('Usage: node run.js <script-name>\n');
  console.log('📋 Available scripts:');
  Object.keys(scripts).forEach(key => {
    console.log(`   • ${key} - ${scripts[key]}`);
  });
  console.log('\n💡 Examples:');
  console.log('   node run.js setup');
  console.log('   node run.js test-notifications');
  console.log('   node run.js verify');
} else {
  runScript(args[0]);
}
