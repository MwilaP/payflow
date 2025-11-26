/**
 * Database utility service for renderer process
 * Provides a localStorage-compatible API backed by SQLite
 */

class DatabaseService {
  /**
   * Get a value from the database
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const result = await window.api.db.get(key)
      if (result.success) {
        return result.data ?? null
      }
      console.error('Failed to get item:', result.error)
      return null
    } catch (error) {
      console.error('Error getting item:', error)
      return null
    }
  }

  /**
   * Set a value in the database
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      const result = await window.api.db.set(key, value)
      if (!result.success) {
        console.error('Failed to set item:', result.error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error setting item:', error)
      return false
    }
  }

  /**
   * Remove a value from the database
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      const result = await window.api.db.delete(key)
      if (!result.success) {
        console.error('Failed to remove item:', result.error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error removing item:', error)
      return false
    }
  }

  /**
   * Get all keys matching a prefix
   */
  async getKeys(prefix?: string): Promise<string[]> {
    try {
      const result = await window.api.db.getKeys(prefix)
      if (result.success) {
        return result.data ?? []
      }
      console.error('Failed to get keys:', result.error)
      return []
    } catch (error) {
      console.error('Error getting keys:', error)
      return []
    }
  }

  /**
   * Clear all data from the database
   */
  async clear(): Promise<boolean> {
    try {
      const result = await window.api.db.clear()
      if (!result.success) {
        console.error('Failed to clear database:', result.error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error clearing database:', error)
      return false
    }
  }

  /**
   * Get an object from the database (automatically parses JSON)
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key)
      if (value === null) {
        return null
      }
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Error parsing object:', error)
      return null
    }
  }

  /**
   * Set an object in the database (automatically stringifies JSON)
   */
  async setObject<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value)
      return await this.setItem(key, jsonString)
    } catch (error) {
      console.error('Error stringifying object:', error)
      return false
    }
  }

  /**
   * Execute a raw SQL query
   */
  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const result = await window.api.db.query(sql, params)
      if (result.success) {
        return result.data
      }
      console.error('Failed to execute query:', result.error)
      return null
    } catch (error) {
      console.error('Error executing query:', error)
      return null
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const result = await window.api.db.getStats()
      if (result.success) {
        return result.data
      }
      console.error('Failed to get stats:', result.error)
      return null
    } catch (error) {
      console.error('Error getting stats:', error)
      return null
    }
  }

  /**
   * Migrate data from localStorage to database
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      console.log('🔄 Starting localStorage migration...')
      let migratedCount = 0

      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value !== null) {
            await this.setItem(key, value)
            migratedCount++
          }
        }
      }

      console.log(`✅ Migrated ${migratedCount} items from localStorage to database`)
    } catch (error) {
      console.error('❌ Error migrating from localStorage:', error)
    }
  }

  /**
   * Check if database is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && window.api && window.api.db !== undefined
  }
}

// Export singleton instance
export const db = new DatabaseService()

// Export class for testing
export { DatabaseService }
