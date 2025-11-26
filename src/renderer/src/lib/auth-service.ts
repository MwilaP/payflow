'use client'

import { createSQLiteUserService } from '@/lib/db/sqlite-user-service'

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

// Initialize the auth system
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

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing auth:', error)
    return false
  }
}

// Check if any users exist in the system
export const hasUsers = async (): Promise<boolean> => {
  try {
    const userService = createSQLiteUserService()
    const users = await userService.getAll()
    return users.length > 0
  } catch (error) {
    console.error('Error checking for users:', error)
    return false
  }
}

// Register a new user (for onboarding)
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

    // Check if username already exists
    const existingUsername = await userService.getByUsername(username)
    if (existingUsername) {
      console.log('Username already exists')
      return { success: false, user: null, error: 'Username already exists' }
    }

    // Check if email already exists
    const existingEmail = await userService.getByEmail(email)
    if (existingEmail) {
      console.log('Email already exists')
      return { success: false, user: null, error: 'Email already exists' }
    }

    // Create the user
    console.log('Creating user with data:', { username, email, name, role: 'admin' })
    const newUser = await userService.create({
      username,
      email,
      password, // In production, this should be hashed
      role: 'admin', // First user is always admin
      name
    })

    console.log('User created successfully:', newUser)

    return {
      success: true,
      user: {
        _id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, user: null, error: 'Registration failed: ' + (error as Error).message }
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

      // Store session in localStorage
      localStorage.setItem('paylo_session', JSON.stringify(session))

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
export const logout = (): void => {
  localStorage.removeItem('paylo_session')
}

// Get current session
export const getSession = (): Session | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const sessionData = localStorage.getItem('paylo_session')
    if (!sessionData) {
      return null
    }

    const session = JSON.parse(sessionData) as Session

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem('paylo_session')
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = getSession()
  return !!session?.isLoggedIn
}

// Get current user
export const getCurrentUser = (): User | null => {
  const session = getSession()
  return session?.user || null
}
