'use client'

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
    console.log('SQLite database is initialized in main process')
    return true
  } catch (error) {
    console.error('Error initializing auth:', error)
    return false
  }
}

// Check if any users exist in the system
export const hasUsers = async (): Promise<boolean> => {
  try {
    const result = await window.api.db.users.getAll()
    if (!result.success) {
      console.error('Error checking for users:', result.error)
      return false
    }
    return result.data.length > 0
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

    // Check if username already exists
    const usernameCheck = await window.api.db.users.getByUsername(username)
    if (usernameCheck.success && usernameCheck.data) {
      console.log('Username already exists')
      return { success: false, user: null, error: 'Username already exists' }
    }

    // Check if email already exists
    const emailCheck = await window.api.db.users.getByEmail(email)
    if (emailCheck.success && emailCheck.data) {
      console.log('Email already exists')
      return { success: false, user: null, error: 'Email already exists' }
    }

    // Create the user (password will be hashed by bcrypt in main process)
    console.log('Creating user with data:', { username, email, name, role: 'admin' })
    const result = await window.api.db.users.create({
      username,
      email,
      password,
      role: 'admin',
      name
    })

    if (!result.success || !result.data) {
      console.error('Failed to create user:', result.error)
      return { success: false, user: null, error: result.error || 'Failed to create user' }
    }

    console.log('User created successfully:', result.data)

    return {
      success: true,
      user: {
        _id: result.data.id,
        username: result.data.username,
        email: result.data.email,
        name: result.data.name,
        role: result.data.role
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
    console.log('Attempting login...')

    // Validate credentials using SQLite IPC (bcrypt verification in main process)
    const result = await window.api.db.users.validateCredentials(usernameOrEmail, password)
    console.log('User validation result:', result.success ? 'Success' : 'Failed')

    if (!result.success || !result.data) {
      console.log('Invalid credentials')
      return { success: false, session: null, error: 'Invalid credentials' }
    }

    const user = result.data
    const session: Session = {
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      isLoggedIn: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    // Store session in localStorage
    localStorage.setItem('paylo_session', JSON.stringify(session))

    return { success: true, session }
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
