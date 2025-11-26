'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  Session,
  User,
  getSession,
  login as authLogin,
  logout as authLogout,
  initializeAuth,
  hasUsers
} from '@/lib/auth-service'

// Define the context type
interface AuthContextType {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  needsOnboarding: boolean
  login: (
    usernameOrEmail: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkForUsers: () => Promise<void>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  needsOnboarding: false,
  login: async () => ({ success: false }),
  logout: () => {},
  checkForUsers: async () => {}
})

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  // Check if users exist in the system
  const checkForUsers = async () => {
    const usersExist = await hasUsers()
    setNeedsOnboarding(!usersExist)
  }

  // Initialize auth and load session
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize auth system
        await initializeAuth()

        // Check if we need onboarding
        await checkForUsers()

        // Load session from storage
        const currentSession = getSession()
        setSession(currentSession)
      } catch (error) {
        console.error('Error initializing auth context:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Login function
  const login = async (usernameOrEmail: string, password: string) => {
    const result = await authLogin(usernameOrEmail, password)
    if (result.success && result.session) {
      setSession(result.session)
    }
    return { success: result.success, error: result.error }
  }

  // Logout function
  const logout = () => {
    authLogout()
    setSession(null)
  }

  // Compute derived state
  const user = session?.user || null
  const isAuthenticated = !!session?.isLoggedIn

  // Context value
  const value = {
    session,
    user,
    isAuthenticated,
    isLoading,
    needsOnboarding,
    login,
    logout,
    checkForUsers
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext)
