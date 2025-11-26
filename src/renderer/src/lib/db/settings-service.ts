// Settings service for persisting application settings in IndexedDB
import { getDatabase } from './indexeddb-sqlite-service'

export interface Setting {
  id: string
  key: string
  value: unknown
  updatedAt: string
}

const SETTINGS_STORE = 'settings'

// Setting keys
export const SETTING_KEYS = {
  SMTP_CONFIG: 'smtp_config'
} as const

/**
 * Save a setting to the database
 */
export const saveSetting = async (key: string, value: unknown): Promise<void> => {
  const db = getDatabase()
  const transaction = db.transaction([SETTINGS_STORE], 'readwrite')
  const store = transaction.objectStore(SETTINGS_STORE)

  const setting: Setting = {
    id: key,
    key,
    value,
    updatedAt: new Date().toISOString()
  }

  return new Promise((resolve, reject) => {
    const request = store.put(setting)

    request.onsuccess = () => {
      console.log(`Setting saved: ${key}`)
      resolve()
    }

    request.onerror = () => {
      console.error(`Failed to save setting: ${key}`, request.error)
      reject(new Error(`Failed to save setting: ${request.error?.message}`))
    }
  })
}

/**
 * Get a setting from the database
 */
export const getSetting = async <T = unknown>(key: string): Promise<T | null> => {
  const db = getDatabase()
  const transaction = db.transaction([SETTINGS_STORE], 'readonly')
  const store = transaction.objectStore(SETTINGS_STORE)

  return new Promise((resolve, reject) => {
    const request = store.get(key)

    request.onsuccess = () => {
      const setting = request.result as Setting | undefined
      if (setting) {
        console.log(`Setting retrieved: ${key}`)
        resolve(setting.value as T)
      } else {
        console.log(`Setting not found: ${key}`)
        resolve(null)
      }
    }

    request.onerror = () => {
      console.error(`Failed to get setting: ${key}`, request.error)
      reject(new Error(`Failed to get setting: ${request.error?.message}`))
    }
  })
}

/**
 * Delete a setting from the database
 */
export const deleteSetting = async (key: string): Promise<void> => {
  const db = getDatabase()
  const transaction = db.transaction([SETTINGS_STORE], 'readwrite')
  const store = transaction.objectStore(SETTINGS_STORE)

  return new Promise((resolve, reject) => {
    const request = store.delete(key)

    request.onsuccess = () => {
      console.log(`Setting deleted: ${key}`)
      resolve()
    }

    request.onerror = () => {
      console.error(`Failed to delete setting: ${key}`, request.error)
      reject(new Error(`Failed to delete setting: ${request.error?.message}`))
    }
  })
}

/**
 * Get all settings from the database
 */
export const getAllSettings = async (): Promise<Setting[]> => {
  const db = getDatabase()
  const transaction = db.transaction([SETTINGS_STORE], 'readonly')
  const store = transaction.objectStore(SETTINGS_STORE)

  return new Promise((resolve, reject) => {
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result as Setting[])
    }

    request.onerror = () => {
      console.error('Failed to get all settings', request.error)
      reject(new Error(`Failed to get all settings: ${request.error?.message}`))
    }
  })
}

/**
 * Check if a setting exists
 */
export const hasSetting = async (key: string): Promise<boolean> => {
  const setting = await getSetting(key)
  return setting !== null
}
