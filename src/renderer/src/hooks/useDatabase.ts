import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/database'

/**
 * React hook for using the database with automatic state management
 * Similar to useState but persists to SQLite database
 */
export function useDatabase<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)

  // Load initial value from database
  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await db.getObject<T>(key)
        if (stored !== null) {
          setValue(stored)
        }
      } catch (error) {
        console.error('Error loading from database:', error)
      } finally {
        setLoading(false)
      }
    }

    loadValue()
  }, [key])

  // Update value in database and state
  const updateValue = useCallback(
    async (newValue: T) => {
      setValue(newValue)
      await db.setObject(key, newValue)
    },
    [key]
  )

  return [value, updateValue, loading]
}

/**
 * Hook for simple string storage
 */
export function useDatabaseString(
  key: string,
  initialValue: string
): [string, (value: string) => Promise<void>, boolean] {
  const [value, setValue] = useState<string>(initialValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await db.getItem(key)
        if (stored !== null) {
          setValue(stored)
        }
      } catch (error) {
        console.error('Error loading from database:', error)
      } finally {
        setLoading(false)
      }
    }

    loadValue()
  }, [key])

  const updateValue = useCallback(
    async (newValue: string) => {
      setValue(newValue)
      await db.setItem(key, newValue)
    },
    [key]
  )

  return [value, updateValue, loading]
}

/**
 * Hook to get database statistics
 */
export function useDatabaseStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await db.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error getting stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, refresh }
}
