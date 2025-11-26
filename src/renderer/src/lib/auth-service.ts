'use client'

import { createSQLiteUserService } from '@/lib/db/sqlite-user-service'
import { db } from '@renderer/lib/database'

// Session type definition
export interface User {
  _id: string
  username: string
  email: string
  name: string
  role: string
}

export interface Session {
  user: User | null
  isLoggedIn: boolean
  expires: string
}

// Initialize the auth system and create test user if needed
export const initializeAuth = async (): Promise<boolean> => {
  try {
    console.log('Initializing auth system...')

    // First ensure database is initialized
    const { initializeSQLiteDatabase } = await import('@/lib/db/indexeddb-sqlite-service')
    const dbResult = await initializeSQLiteDatabase()

    if (!dbResult.success) {
      console.error('Failed to initialize database:', dbResult.error)
      return false
    }

    console.log('Database initialized, creating test user...')
    const userService = createSQLiteUserService()
    const testUser = await userService.createTestUser()
    console.log('Test user created:', testUser)

    return true
  } catch (error) {
    console.error('Error initializing auth:', error)
    return false
  }
}

// Login function
export const login = async (
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; session: Session | null; error?: string }> => {
  try {
    const userService = createSQLiteUserService()
    console.log('login...')

    // First ensure we have a test user
    await userService.createTestUser()

    // Validate credentials using SQLite user service
    const user = await userService.validateCredentials(usernameOrEmail, password)
    console.log('User validation result:', user)

    // if (!user) {
    //   console.log("Invalid credentials")
    //   return { success: false, session: null, error: "Invalid credentials" }
    // }
    if (user) {
      const session: Session = {
        user: {
          _id: user.id,
          username: user?.username,
          email: user?.email,
          name: user?.name,
          role: user?.role
        },
        isLoggedIn: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }

      // Store session in database
      await db.setObject('paylo_session', session)

      return { success: true, session }
    } else {
      console.log('Invalid credentials')
      return { success: false, session: null, error: 'Invalid credentials' }
    }

    // Create session
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, session: null, error: 'Authentication failed' }
  }
}

// Logout function
export const logout = async (): Promise<void> => {
  await db.removeItem('paylo_session')
}

// Get current session
export const getSession = async (): Promise<Session | null> => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const session = await db.getObject<Session>('paylo_session')
    if (!session) {
      return null
    }

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      await db.removeItem('paylo_session')
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession()
  return !!session?.isLoggedIn
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getSession()
  return session?.user || null
}
