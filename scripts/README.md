# Scripts Directory

This directory contains all setup, migration, and testing scripts for the Real Estate App.

## 📋 Setup Scripts

### `setup-appwrite.js`
- **Purpose**: Initial Appwrite project setup
- **Usage**: `node setup-appwrite.js`
- **Description**: Sets up the main Appwrite project with database and collections

### `setup-chat.js`
- **Purpose**: Chat functionality setup
- **Usage**: `node setup-chat.js`
- **Description**: Interactive script to set up chat collections and get collection IDs

### `setup-saved-collections.js`
- **Purpose**: Saved properties and notifications setup
- **Usage**: `node setup-saved-collections.js`
- **Description**: Creates collections for saved properties, searches, notifications, and settings

## 🔄 Migration Scripts

### `migrate-saved-properties-listing-type.js`
- **Purpose**: Add listingType field to saved_properties
- **Usage**: `node migrate-saved-properties-listing-type.js`
- **Description**: Adds listingType field to existing saved_properties collection
- **Status**: ⚠️ Requires manual database update (see update-saved-properties-manual.md)

## 🧪 Testing Scripts

### `test-all-features.js`
- **Purpose**: Comprehensive feature test suite
- **Usage**: `node test-all-features.js`
- **Description**: Tests ALL features including authentication, properties, saved properties, chat, notifications, filtering, and more

### `test-ui-features.js`
- **Purpose**: UI features and data structure test
- **Usage**: `node test-ui-features.js`
- **Description**: Tests UI-related features, data structures, and user interface components

### `test-performance.js`
- **Purpose**: Performance and stress testing
- **Usage**: `node test-performance.js`
- **Description**: Tests performance, scalability, concurrent requests, and database stress

### `test-notifications.js`
- **Purpose**: Basic notification system test
- **Usage**: `node test-notifications.js`
- **Description**: Tests basic notification functionality

### `test-notifications-comprehensive.js`
- **Purpose**: Comprehensive notification system test
- **Usage**: `node test-notifications-comprehensive.js`
- **Description**: Detailed test of all notification features and provides fix instructions

### `verify-notifications.js`
- **Purpose**: Final notification system verification
- **Usage**: `node verify-notifications.js`
- **Description**: Verifies that all notification features are working after manual fixes

### `run-all-tests.js`
- **Purpose**: Master test runner
- **Usage**: `node run-all-tests.js`
- **Description**: Runs all test suites and provides comprehensive overview

## 🔍 Diagnostic Scripts

### `check-saved-properties.js`
- **Purpose**: Check saved_properties collection status
- **Usage**: `node check-saved-properties.js`
- **Description**: Checks if saved_properties collection exists and shows its structure

### `check-notification-settings.js`
- **Purpose**: Check notification_settings collection schema
- **Usage**: `node check-notification-settings.js`
- **Description**: Checks notification_settings collection and shows available fields

### `fix-notification-settings.js`
- **Purpose**: Fix notification_settings schema
- **Usage**: `node fix-notification-settings.js`
- **Description**: Attempts to add missing attributes to notification_settings collection
- **Status**: ⚠️ Requires manual database update

## 📖 Documentation

### `update-saved-properties-manual.md`
- **Purpose**: Manual database update instructions
- **Description**: Step-by-step guide for manually adding listingType field to saved_properties collection

## 🚀 Quick Start

1. **Initial Setup**:
   ```bash
   node setup-appwrite.js
   node setup-saved-collections.js
   ```

2. **Chat Setup** (if needed):
   ```bash
   node setup-chat.js
   ```

3. **Run Comprehensive Tests**:
   ```bash
   node run-all-tests.js
   ```

4. **Test Individual Features**:
   ```bash
   node test-all-features.js      # Test all features
   node test-ui-features.js       # Test UI components
   node test-performance.js       # Test performance
   ```

5. **Fix Identified Issues**:
   ```bash
   node fix-identified-issues.js  # Diagnose and get fix instructions
   ```

## 📝 Notes

- Some scripts require manual database updates through the Appwrite Console
- Always run tests after making changes to verify everything works
- Check the documentation files for manual setup instructions
- All scripts include error handling and detailed output

## 🔧 Troubleshooting

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your Appwrite project configuration
3. Ensure all required collections exist
4. Run diagnostic scripts to identify problems
5. Check the manual update documentation for schema fixes
