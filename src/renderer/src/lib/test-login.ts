// Test script to verify login functionality with SQLite
import { initializeSQLiteDatabase } from './db/indexeddb-sqlite-service'
import { createSQLiteUserService } from './db/sqlite-user-service'
import { initializeAuth, login, getSession, logout } from './auth-service'

export const testLoginFunctionality = async () => {
  console.log('🔐 Testing login functionality with SQLite...')
  
  try {
    // Test 1: Initialize database and auth system
    console.log('1. Initializing database and auth system...')
    await initializeSQLiteDatabase()
    const authInitialized = await initializeAuth()
    console.log('✅ Auth system initialized:', authInitialized)
    
    // Test 2: Verify test user was created
    console.log('2. Checking test user creation...')
    const userService = createSQLiteUserService()
    const testUser = await userService.getByUsername('testuser')
    console.log('✅ Test user found:', testUser ? 'Yes' : 'No')
    if (testUser) {
      console.log('   Username:', testUser.username)
      console.log('   Email:', testUser.email)
      console.log('   Role:', testUser.role)
    }
    
    // Test 3: Test login with correct credentials
    console.log('3. Testing login with correct credentials...')
    const loginResult = await login('testuser', 'securepass123')
    console.log('✅ Login result:', loginResult.success ? 'Success' : 'Failed')
    if (loginResult.success && loginResult.session) {
      console.log('   User ID:', loginResult.session.user?._id)
      console.log('   Username:', loginResult.session.user?.username)
      console.log('   Role:', loginResult.session.user?.role)
    } else {
      console.log('   Error:', loginResult.error)
    }
    
    // Test 4: Verify session is stored
    console.log('4. Checking stored session...')
    const storedSession = getSession()
    console.log('✅ Session stored:', storedSession ? 'Yes' : 'No')
    if (storedSession) {
      console.log('   Is logged in:', storedSession.isLoggedIn)
      console.log('   Expires:', storedSession.expires)
    }
    
    // Test 5: Test login with email
    console.log('5. Testing login with email...')
    logout() // Clear previous session
    const emailLoginResult = await login('testuser@example.com', 'securepass123')
    console.log('✅ Email login result:', emailLoginResult.success ? 'Success' : 'Failed')
    
    // Test 6: Test login with wrong credentials
    console.log('6. Testing login with wrong credentials...')
    logout() // Clear previous session
    const wrongLoginResult = await login('testuser', 'wrongpassword')
    console.log('✅ Wrong credentials result:', wrongLoginResult.success ? 'Unexpected Success' : 'Correctly Failed')
    console.log('   Error message:', wrongLoginResult.error)
    
    // Test 7: Test logout
    console.log('7. Testing logout...')
    await login('testuser', 'securepass123') // Login first
    logout()
    const sessionAfterLogout = getSession()
    console.log('✅ Session after logout:', sessionAfterLogout ? 'Still exists (ERROR)' : 'Cleared correctly')
    
    console.log('🎉 Login functionality test completed!')
    
  } catch (error) {
    console.error('❌ Login test failed:', error)
    throw error
  }
}

// Auto-run the test
if (typeof window !== 'undefined') {
  // Run in browser environment
  testLoginFunctionality().catch(console.error)
} else {
  // Export for manual execution
  console.log('Login test ready. Call testLoginFunctionality() to run.')
}
