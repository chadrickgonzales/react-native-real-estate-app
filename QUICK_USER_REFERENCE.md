# 🚀 Quick User Reference Card

## 👥 **Available Users for Offline Development**

| User | Email | Role | Best For |
|------|-------|------|----------|
| **John Doe** | `john.doe@email.com` | Tenant | Property browsing, bookings, reviews |
| **Maria Santos** | `maria.santos@email.com` | Owner | Property management, owner dashboard |
| **Carlos Rodriguez** | `carlos.rodriguez@email.com` | Tenant | Budget properties, studios |

---

## 🔐 **Quick Login Commands**

```typescript
import { offlineAuth } from "@/lib/offline-auth";

// Quick login functions
await offlineAuth.loginAsJohn();      // John Doe (Tenant)
await offlineAuth.loginAsMaria();     // Maria Santos (Owner)
await offlineAuth.loginAsCarlos();    // Carlos Rodriguez (Tenant)

// Login with email
await offlineAuth.loginWithEmail("john.doe@email.com");
await offlineAuth.loginWithEmail("maria.santos@email.com");
await offlineAuth.loginWithEmail("carlos.rodriguez@email.com");
```

---

## 🎯 **Testing Scenarios**

### **👤 John Doe (Tenant)**
- Browse houses & apartments
- Book property viewings
- Add property reviews
- Save favorite properties
- Chat with owners

### **🏠 Maria Santos (Owner)**
- Manage property listings
- Handle booking requests
- View property analytics
- Respond to reviews
- Chat with tenants

### **👤 Carlos Rodriguez (Tenant)**
- Browse studios & apartments
- Filter budget properties
- Book affordable properties
- Review budget properties
- Chat with owners

---

## 🔧 **User Preferences**

| User | Property Types | Max Price | Min Bedrooms |
|------|----------------|-----------|--------------|
| John Doe | Houses, Apartments | ₱25,000 | 2 |
| Maria Santos | Houses, Villas | ₱5M | 3 |
| Carlos Rodriguez | Studios, Apartments | ₱15,000 | 1 |

---

## 📱 **Quick Start**

1. **Start Expo**: `npx expo start --offline`
2. **Choose a user** from the list above
3. **Login with email** or use quick login functions
4. **Test all features** with realistic data
5. **Switch users** to test different scenarios

**All data works offline! 🎉**
