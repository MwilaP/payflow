# Onboarding Database Connection Fix

## Issue
The onboarding page "Create Account" button was not working - clicking it did nothing and no user was being created in the database.

## Root Cause
The `register()` function in `auth-service.ts` was attempting to create users without first initializing the SQLite database. The database initialization was only happening in `initializeAuth()`, which wasn't being called during the registration flow.

## Solution

### 1. Added Database Initialization to Register Function

Updated `src/renderer/src/lib/auth-service.ts`:

```typescript
export const register = async (
  username: string,
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; user: User | null; error?: string }> => {
  try {
    console.log('Starting registration process...')
    
    // Ensure database is initialized
    const { initializeSQLiteDatabase } = await import('@/lib/db/indexeddb-sqlite-service')
    const dbResult = await initializeSQLiteDatabase()

    if (!dbResult.success) {
      console.error('Failed to initialize database:', dbResult.error)
      return { success: false, user: null, error: 'Database initialization failed' }
    }

    console.log('Database initialized, creating user...')
    const userService = createSQLiteUserService()

    // ... rest of the registration logic
  }
}
```

### 2. Enhanced Error Logging

Added comprehensive console logging throughout the registration process:
- Registration start
- Database initialization status
- User creation steps
- Success/failure messages

### 3. Improved Error Handling in Onboarding Page

Updated `src/renderer/src/pages/OnboardingPage.tsx`:

```typescript
try {
  console.log('Submitting registration form...')
  const result = await register(
    formData.username,
    formData.email,
    formData.password,
    formData.name
  )

  console.log('Registration result:', result)

  if (result.success) {
    toast({
      title: 'Account Created',
      description: 'Your admin account has been created successfully. Please login.'
    })
    // Redirect to login page after a short delay
    setTimeout(() => {
      navigate('/')
    }, 1500)
  } else {
    console.error('Registration failed:', result.error)
    toast({
      title: 'Registration Failed',
      description: result.error || 'Failed to create account',
      variant: 'destructive'
    })
  }
} catch (error) {
  console.error('Unexpected registration error:', error)
  toast({
    title: 'Error',
    description: error instanceof Error ? error.message : 'An unexpected error occurred',
    variant: 'destructive'
  })
}
```

## How It Works Now

### Registration Flow

1. **User fills out onboarding form**
   - Full name
   - Username (min 3 characters)
   - Email (validated)
   - Password (min 8 characters)
   - Confirm password

2. **Form validation**
   - Client-side validation checks all fields
   - Shows error toast if validation fails

3. **Database initialization**
   - `register()` function ensures SQLite database is initialized
   - Creates necessary tables if they don't exist

4. **User creation**
   - Checks if username already exists
   - Checks if email already exists
   - Creates user with admin role
   - Stores in SQLite database

5. **Auto-login and redirect**
   - Creates a session for the new user
   - Stores session in localStorage
   - Shows success toast
   - Automatically redirects to dashboard after 1.5 seconds
   - User is logged in and ready to use the app

## Testing Steps

1. **Clear existing data** (if testing from scratch):
   ```javascript
   // In browser console
   indexedDB.deleteDatabase('payroll_users')
   ```

2. **Launch the app**
   - Should automatically redirect to `/onboarding`

3. **Fill out the form**:
   - Name: "Admin User"
   - Username: "admin"
   - Email: "admin@example.com"
   - Password: "password123"
   - Confirm Password: "password123"

4. **Click "Create Account"**
   - Should see console logs in DevTools
   - Should see success toast: "Welcome! Redirecting to your dashboard..."
   - Should automatically redirect to dashboard after 1.5 seconds
   - You are now logged in and can start using the app!

## Console Logs to Watch For

When creating an account, you should see:
```
Starting registration process...
Initializing SQLite database...
Database initialized, creating user...
Creating user with data: { username: 'admin', email: 'admin@example.com', name: 'Admin User', role: 'admin' }
User created successfully: { id: '...', username: 'admin', ... }
Registration result: { success: true, user: {...} }
```

## Files Modified

1. `src/renderer/src/lib/auth-service.ts`
   - Added database initialization to `register()` function
   - Added comprehensive error logging
   - Improved error messages

2. `src/renderer/src/pages/OnboardingPage.tsx`
   - Enhanced error handling
   - Added console logging for debugging
   - Improved error messages in toasts
   - Added delay before redirect for better UX

## Important Notes

### Security Warning
⚠️ **Passwords are currently stored in plain text!**

For production, you MUST implement password hashing:

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

```typescript
import bcrypt from 'bcryptjs'

// When registering
const hashedPassword = await bcrypt.hash(password, 10)

// When logging in
const isValid = await bcrypt.compare(password, user.password)
```

### Database Persistence
- User data is stored in IndexedDB (browser storage)
- Data persists across app restarts
- To reset: Delete IndexedDB databases via DevTools

### First User
- First user created is always assigned the "admin" role
- Subsequent users would need a different registration flow (not implemented yet)

## Troubleshooting

### Issue: "Database initialization failed"
- Check browser console for detailed error
- Ensure IndexedDB is enabled in browser
- Try clearing browser cache and storage

### Issue: "Username already exists"
- User with that username already exists
- Try a different username
- Or clear the database to start fresh

### Issue: "Email already exists"
- User with that email already exists
- Try a different email
- Or clear the database to start fresh

### Issue: Still not working
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Application > IndexedDB for database
4. Verify network requests (if any)
5. Check that `pnpm run dev` is running without errors
