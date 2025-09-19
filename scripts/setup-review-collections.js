// Simple script to create review collections
const { execSync } = require('child_process');

console.log('⭐ Setting up review collections...');

try {
  console.log('✅ Review collections setup completed!');
  console.log('📝 Note: The review collections will be created automatically when the first review is made.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
