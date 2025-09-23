# 👥 Offline Development Users Guide

## 🔐 Available Sample Users for Offline Development

This guide provides a complete list of sample users you can use for offline development. All users have realistic data and different roles to test various app features.

---

## 📱 **User List**

### **1. 👤 John Doe (Tenant)**
- **User ID**: `user_1`
- **Email**: `john.doe@email.com`
- **Phone**: `+63-912-345-6789`
- **Role**: Tenant
- **Avatar**: Professional headshot
- **Preferences**:
  - Property Types: Houses, Apartments
  - Max Price: ₱25,000
  - Min Bedrooms: 2
  - Location: Tarlac City

**Best for testing**: Property browsing, booking system, reviews, tenant features

---

### **2. 🏠 Maria Santos (Property Owner)**
- **User ID**: `user_2`
- **Email**: `maria.santos@email.com`
- **Phone**: `+63-917-234-5678`
- **Role**: Property Owner
- **Avatar**: Professional headshot
- **Preferences**:
  - Property Types: Houses, Villas
  - Max Price: ₱5,000,000
  - Min Bedrooms: 3
  - Location: Tarlac City

**Best for testing**: Property management, owner dashboard, property listings, owner features

---

### **3. 👤 Carlos Rodriguez (Tenant)**
- **User ID**: `user_3`
- **Email**: `carlos.rodriguez@email.com`
- **Phone**: `+63-918-345-6789`
- **Role**: Tenant
- **Avatar**: Professional headshot
- **Preferences**:
  - Property Types: Studios, Apartments
  - Max Price: ₱15,000
  - Min Bedrooms: 1
  - Location: Tarlac City

**Best for testing**: Budget-friendly properties, studio apartments, different user preferences

---

## 🚀 **How to Login with These Users**

### **Method 1: Quick Login Functions**
```typescript
import { offlineAuth } from "@/lib/offline-auth";

// Login as John Doe (Tenant)
const john = await offlineAuth.loginAsJohn();

// Login as Maria Santos (Owner)
const maria = await offlineAuth.loginAsMaria();

// Login as Carlos Rodriguez (Tenant)
const carlos = await offlineAuth.loginAsCarlos();
```

### **Method 2: Login with Email**
```typescript
import { offlineAuth } from "@/lib/offline-auth";

// Login with any user's email
const user = await offlineAuth.loginWithEmail("john.doe@email.com");
const user = await offlineAuth.loginWithEmail("maria.santos@email.com");
const user = await offlineAuth.loginWithEmail("carlos.rodriguez@email.com");
```

### **Method 3: Login with User ID**
```typescript
import { offlineAuth } from "@/lib/offline-auth";

// Login with user ID
const user = await offlineAuth.loginWithSampleUser("user_1"); // John Doe
const user = await offlineAuth.loginWithSampleUser("user_2"); // Maria Santos
const user = await offlineAuth.loginWithSampleUser("user_3"); // Carlos Rodriguez
```

### **Method 4: Use OfflineLogin Component**
```typescript
import OfflineLogin from "@/components/OfflineLogin";

// In your login screen
<OfflineLogin onLogin={(user) => {
  // Handle successful login
  setCurrentUser(user);
  setShowLogin(false);
}} />
```

---

## 🎯 **Testing Scenarios by User**

### **👤 John Doe (Tenant) - Testing Scenarios**
- ✅ **Property Browsing**: Browse houses and apartments
- ✅ **Search & Filter**: Search for properties under ₱25,000
- ✅ **Property Details**: View detailed property information
- ✅ **Booking System**: Book property viewings
- ✅ **Reviews**: Add reviews for properties
- ✅ **Saved Properties**: Save favorite properties
- ✅ **Chat**: Message property owners
- ✅ **Profile Management**: Update tenant preferences

### **🏠 Maria Santos (Owner) - Testing Scenarios**
- ✅ **Property Management**: Manage property listings
- ✅ **Owner Dashboard**: View property analytics
- ✅ **Booking Management**: Handle booking requests
- ✅ **Property Analytics**: View property performance
- ✅ **Owner Profile**: Update owner information
- ✅ **Property Reviews**: Respond to reviews
- ✅ **Chat**: Message with potential tenants
- ✅ **Property Listings**: Add/edit property details

### **👤 Carlos Rodriguez (Tenant) - Testing Scenarios**
- ✅ **Budget Properties**: Browse studios and apartments
- ✅ **Price Filtering**: Filter properties under ₱15,000
- ✅ **Studio Apartments**: Focus on smaller properties
- ✅ **Different Preferences**: Test different user preferences
- ✅ **Booking System**: Book budget-friendly properties
- ✅ **Reviews**: Review affordable properties
- ✅ **Chat**: Message owners of budget properties

---

## 🔧 **User Data Structure**

Each user has the following data structure:

```typescript
interface OfflineUser {
  $id: string;                    // Unique user ID
  name: string;                   // Full name
  email: string;                  // Email address
  phone: string;                  // Phone number
  avatar: string;                 // Profile image URL
  role: 'tenant' | 'owner';      // User role
  preferences: {
    propertyTypes: string[];      // Preferred property types
    maxPrice: number;             // Maximum budget
    minBedrooms: number;          // Minimum bedrooms
    location: string;             // Preferred location
  };
}
```

---

## 📊 **User Statistics**

| User | Role | Properties | Bookings | Reviews | Chat Messages |
|------|------|------------|----------|---------|---------------|
| John Doe | Tenant | 0 | 5 | 3 | 8 |
| Maria Santos | Owner | 3 | 0 | 0 | 5 |
| Carlos Rodriguez | Tenant | 0 | 2 | 1 | 3 |

---

## 🎨 **User Interface Testing**

### **Login Screen**
- Test user selection interface
- Verify user avatars display correctly
- Test user role indicators
- Verify user preferences display

### **Profile Screen**
- Test user information display
- Verify avatar loading
- Test preference settings
- Verify role-specific features

### **Property Browsing**
- Test property filtering by user preferences
- Verify price range filtering
- Test property type filtering
- Verify location-based filtering

---

## 🔄 **Switching Between Users**

### **Quick User Switch**
```typescript
// Switch to different user
const newUser = await offlineAuth.loginWithEmail("maria.santos@email.com");
setCurrentUser(newUser);
```

### **Check Current User**
```typescript
// Get current logged-in user
const currentUser = await offlineAuth.getCurrentUser();
console.log('Current user:', currentUser?.name);
```

### **Logout**
```typescript
// Logout current user
await offlineAuth.logout();
```

---

## 💡 **Development Tips**

### **For UI Development**
- Use **John Doe** for testing tenant-focused UI
- Use **Maria Santos** for testing owner-focused UI
- Use **Carlos Rodriguez** for testing different user preferences

### **For Feature Testing**
- Test **booking system** with John Doe (tenant perspective)
- Test **property management** with Maria Santos (owner perspective)
- Test **search and filtering** with Carlos Rodriguez (different preferences)

### **For Data Testing**
- All users have access to the same 50 sample properties
- Each user has different booking history
- Each user has different review history
- Each user has different chat conversations

---

## 🚨 **Troubleshooting**

### **User Not Found**
```typescript
// Check if user exists
const users = offlineAuth.getAvailableUsers();
console.log('Available users:', users.map(u => u.email));
```

### **Login Issues**
```typescript
// Check current login status
const isLoggedIn = await offlineAuth.isLoggedIn();
console.log('Is logged in:', isLoggedIn);
```

### **Data Persistence**
- User login persists between app restarts
- All user data is stored locally
- No internet connection required
- Data syncs when connection returns

---

## ✅ **Ready for Development!**

You now have 3 complete user profiles to test all app features:

1. **👤 John Doe** - Perfect for tenant features
2. **🏠 Maria Santos** - Perfect for owner features  
3. **👤 Carlos Rodriguez** - Perfect for different user preferences

**Start developing with any user and test all features offline! 🚀**
