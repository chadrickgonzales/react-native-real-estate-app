#!/usr/bin/env node

/**
 * Quick Offline Login Helper
 * 
 * This script helps you quickly login with sample users for offline development.
 */

console.log('🔐 Offline Development Login Options\n');

console.log('📱 Available Sample Users:');
console.log('');
console.log('1. 👤 John Doe (Tenant)');
console.log('   Email: john.doe@email.com');
console.log('   Role: Tenant');
console.log('   Preferences: Houses, Apartments, Max ₱25,000, 2+ bedrooms');
console.log('');

console.log('2. 🏠 Maria Santos (Owner)');
console.log('   Email: maria.santos@email.com');
console.log('   Role: Property Owner');
console.log('   Preferences: Houses, Villas, Max ₱5M, 3+ bedrooms');
console.log('');

console.log('3. 👤 Carlos Rodriguez (Tenant)');
console.log('   Email: carlos.rodriguez@email.com');
console.log('   Role: Tenant');
console.log('   Preferences: Studios, Apartments, Max ₱15,000, 1+ bedroom');
console.log('');

console.log('🚀 How to Use:');
console.log('');
console.log('Option 1: Use the OfflineLogin component');
console.log('- Import and use the OfflineLogin component in your app');
console.log('- Users can select from the available sample users');
console.log('- All data will be stored locally');
console.log('');

console.log('Option 2: Quick login in code');
console.log('```typescript');
console.log('import { offlineAuth } from "@/lib/offline-auth";');
console.log('');
console.log('// Login as John (Tenant)');
console.log('const user = await offlineAuth.loginAsJohn();');
console.log('');
console.log('// Login as Maria (Owner)');
console.log('const user = await offlineAuth.loginAsMaria();');
console.log('');
console.log('// Login as Carlos (Tenant)');
console.log('const user = await offlineAuth.loginAsCarlos();');
console.log('```');
console.log('');

console.log('Option 3: Login with email');
console.log('```typescript');
console.log('import { offlineAuth } from "@/lib/offline-auth";');
console.log('');
console.log('// Login with any sample user email');
console.log('const user = await offlineAuth.loginWithEmail("john.doe@email.com");');
console.log('```');
console.log('');

console.log('💡 Development Tips:');
console.log('- Use John Doe for testing tenant features');
console.log('- Use Maria Santos for testing owner features');
console.log('- Use Carlos Rodriguez for testing different preferences');
console.log('- All users have access to the same sample data');
console.log('- Data persists between app restarts');
console.log('');

console.log('🔧 Integration Example:');
console.log('```typescript');
console.log('// In your login screen or app initialization');
console.log('import { offlineAuth } from "@/lib/offline-auth";');
console.log('');
console.log('useEffect(() => {');
console.log('  const checkAuth = async () => {');
console.log('    const user = await offlineAuth.getCurrentUser();');
console.log('    if (user) {');
console.log('      // User is logged in, proceed to app');
console.log('      setUser(user);');
console.log('    } else {');
console.log('      // Show login screen');
console.log('      setShowLogin(true);');
console.log('    }');
console.log('  };');
console.log('  checkAuth();');
console.log('}, []);');
console.log('```');
console.log('');

console.log('✅ Ready for offline development!');
console.log('🎉 You can now test all features with realistic user data.');
