# Production Onboarding Setup

This document describes the production-ready onboarding flow implemented for first-time app launch.

## Overview

The application now includes a complete onboarding system that:
- Detects when no users exist in the system
- Automatically redirects to an onboarding page
- Allows creation of the first admin user
- Removes all test user code and references

## Changes Made

### 1. Auth Service (`src/renderer/src/lib/auth-service.ts`)

**Removed:**
- Test user creation from `initializeAuth()`

**Added:**
- `hasUsers()` - Checks if any users exist in the database
- `register()` - Creates a new user with validation for duplicate usernames/emails

### 2. Onboarding Page (`src/renderer/src/pages/OnboardingPage.tsx`)

**New Component:**
A complete registration form with:
- Full name input
- Username input (min 3 characters)
- Email input with validation
- Password input (min 8 characters)
- Password confirmation
- Form validation
- Beautiful UI with icons and proper UX

### 3. Auth Context (`src/renderer/src/lib/auth-context.tsx`)

**Added:**
- `needsOnboarding` state - Tracks if users exist
- `checkForUsers()` - Function to check user existence
- Automatic user check on initialization

### 4. App Routing (`src/renderer/src/App.tsx`)

**Added:**
- `/onboarding` route for first-time setup

### 5. Login Page (`src/renderer/src/pages/LoginPage.tsx`)

**Changed:**
- Automatically redirects to `/onboarding` if no users exist
- Removed test user credentials display

### 6. User Service (`src/renderer/src/lib/db/sqlite-user-service.ts`)

**Removed:**
- `createTestUser()` method
- Compatibility wrapper with test user creation

### 7. Database Service (`src/renderer/src/lib/db/db-service.ts`)

**Removed:**
- `initializeTestUser()` function

## User Flow

### First Launch (No Users)
1. App initializes and checks for existing users
2. `needsOnboarding` is set to `true`
3. User is automatically redirected to `/onboarding`
4. User fills out the registration form
5. First user is created as admin
6. User is redirected to login page
7. User logs in with their new credentials

### Subsequent Launches (Users Exist)
1. App initializes and detects existing users
2. `needsOnboarding` is set to `false`
3. User sees the normal login page
4. User logs in with their credentials

## Security Notes

⚠️ **Important:** The current implementation stores passwords in plain text. For production use, you should:

1. Install a password hashing library (e.g., bcryptjs)
2. Hash passwords before storing them
3. Compare hashed passwords during login

Example implementation:
```typescript
import bcrypt from 'bcryptjs'

// When registering
const hashedPassword = await bcrypt.hash(password, 10)

// When logging in
const isValid = await bcrypt.compare(password, user.password)
```

## Testing the Onboarding Flow

To test the onboarding flow:

1. Clear your application data (IndexedDB/SQLite database)
2. Launch the application
3. You should be automatically redirected to the onboarding page
4. Create your admin account
5. Login with your new credentials

## Database Reset (For Testing)

To reset the database and test onboarding again:

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Application tab
3. Find IndexedDB
4. Delete the payroll databases
5. Refresh the app

**Or programmatically:**
```javascript
// In browser console
indexedDB.deleteDatabase('payroll_users')
```

## Next Steps

Consider implementing:
1. Password hashing (bcryptjs)
2. Email verification
3. Password strength indicator
4. Password reset functionality
5. Multi-factor authentication
6. User management (add/edit/delete users)
7. Role-based access control
