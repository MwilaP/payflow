// Browser-compatible SQLite-like service using IndexedDB
// This provides a SQLite-like interface while using IndexedDB for browser compatibility

let db: IDBDatabase | null = null
const DB_NAME = 'PayloSQLiteDB'
const DB_VERSION = 1

// Table definitions for IndexedDB object stores
const TABLES = {
  employees: 'employees',
  payroll_structures: 'payroll_structures', 
  allowances: 'allowances',
  deductions: 'deductions',
  payroll_history: 'payroll_history',
  settings: 'settings',
  users: 'users',
  leave_requests: 'leave_requests'
}

// Initialize SQLite-like database using IndexedDB
export const initializeSQLiteDatabase = (): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ success: false, error: 'IndexedDB not available in server environment' })
      return
    }

    try {
      console.log('Initializing SQLite-like database using IndexedDB...')
      
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error)
        resolve({ success: false, error: request.error?.message || 'Failed to open database' })
      }

      request.onsuccess = () => {
        db = request.result
        console.log('IndexedDB database opened successfully')
        resolve({ success: true })
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result
        console.log('Creating database schema...')

        // Create employees object store
        if (!database.objectStoreNames.contains(TABLES.employees)) {
          const employeesStore = database.createObjectStore(TABLES.employees, { keyPath: 'id' })
          employeesStore.createIndex('department', 'department', { unique: false })
          employeesStore.createIndex('status', 'status', { unique: false })
          employeesStore.createIndex('payroll_structure_id', 'payroll_structure_id', { unique: false })
          employeesStore.createIndex('email', 'email', { unique: true })
        }

        // Create payroll_structures object store
        if (!database.objectStoreNames.contains(TABLES.payroll_structures)) {
          const structuresStore = database.createObjectStore(TABLES.payroll_structures, { keyPath: 'id' })
          structuresStore.createIndex('name', 'name', { unique: false })
        }

        // Create allowances object store
        if (!database.objectStoreNames.contains(TABLES.allowances)) {
          const allowancesStore = database.createObjectStore(TABLES.allowances, { keyPath: 'id' })
          allowancesStore.createIndex('payroll_structure_id', 'payroll_structure_id', { unique: false })
        }

        // Create deductions object store
        if (!database.objectStoreNames.contains(TABLES.deductions)) {
          const deductionsStore = database.createObjectStore(TABLES.deductions, { keyPath: 'id' })
          deductionsStore.createIndex('payroll_structure_id', 'payroll_structure_id', { unique: false })
        }

        // Create payroll_history object store
        if (!database.objectStoreNames.contains(TABLES.payroll_history)) {
          const historyStore = database.createObjectStore(TABLES.payroll_history, { keyPath: 'id' })
          historyStore.createIndex('employee_id', 'employee_id', { unique: false })
          historyStore.createIndex('date', 'date', { unique: false })
        }

        // Create settings object store
        if (!database.objectStoreNames.contains(TABLES.settings)) {
          const settingsStore = database.createObjectStore(TABLES.settings, { keyPath: 'id' })
          settingsStore.createIndex('key', 'key', { unique: true })
        }

        // Create users object store
        if (!database.objectStoreNames.contains(TABLES.users)) {
          const usersStore = database.createObjectStore(TABLES.users, { keyPath: 'id' })
          usersStore.createIndex('username', 'username', { unique: true })
          usersStore.createIndex('email', 'email', { unique: true })
        }

        // Create leave_requests object store
        if (!database.objectStoreNames.contains(TABLES.leave_requests)) {
          const leaveStore = database.createObjectStore(TABLES.leave_requests, { keyPath: 'id' })
          leaveStore.createIndex('employee_id', 'employee_id', { unique: false })
          leaveStore.createIndex('status', 'status', { unique: false })
        }

        console.log('Database schema created successfully')
      }
    } catch (error) {
      console.error('Error initializing database:', error)
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  })
}

// Get database instance
export const getDatabase = (): IDBDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeSQLiteDatabase() first.')
  }
  return db
}

// Close database connection
export const closeDatabase = () => {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}

// Health check
export const checkDatabaseHealth = (): boolean => {
  try {
    return db !== null && !db.objectStoreNames.contains('__health_check__')
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Helper function to promisify IndexedDB operations
const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Database operations interface
export interface SQLiteOperations {
  // Generic CRUD operations
  create<T>(table: string, data: T & { id: string }): Promise<T>
  getById<T>(table: string, id: string): Promise<T | null>
  update<T>(table: string, id: string, data: Partial<T>): Promise<T | null>
  delete(table: string, id: string): Promise<boolean>
  getAll<T>(table: string): Promise<T[]>
  find<T>(table: string, conditions: Record<string, any>): Promise<T[]>
  
  // Transaction support
  transaction<T>(callback: (ops: SQLiteOperations) => Promise<T>): Promise<T>
}

// Implement IndexedDB operations with SQLite-like interface
export const sqliteOperations: SQLiteOperations = {
  async create<T>(table: string, data: T & { id: string }): Promise<T> {
    if (!db) throw new Error('Database not initialized')
    
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    // Add timestamps
    const dataWithTimestamp = {
      ...data,
      created_at: (data as any).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    await promisifyRequest(store.add(dataWithTimestamp))
    return dataWithTimestamp as T
  },

  async getById<T>(table: string, id: string): Promise<T | null> {
    if (!db) throw new Error('Database not initialized')
    
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    
    try {
      const result = await promisifyRequest(store.get(id))
      return result || null
    } catch (error) {
      console.error(`Error getting record from ${table}:`, error)
      return null
    }
  },

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T | null> {
    if (!db) throw new Error('Database not initialized')
    
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    try {
      // Get existing record
      const existing = await promisifyRequest(store.get(id))
      if (!existing) return null
      
      // Merge updates
      const updated = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      }
      
      await promisifyRequest(store.put(updated))
      return updated as T
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error)
      return null
    }
  },

  async delete(table: string, id: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized')
    
    const transaction = db.transaction([table], 'readwrite')
    const store = transaction.objectStore(table)
    
    try {
      await promisifyRequest(store.delete(id))
      return true
    } catch (error) {
      console.error(`Error deleting record from ${table}:`, error)
      return false
    }
  },

  async getAll<T>(table: string): Promise<T[]> {
    if (!db) throw new Error('Database not initialized')
    
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    
    try {
      const result = await promisifyRequest(store.getAll())
      return result as T[]
    } catch (error) {
      console.error(`Error getting all records from ${table}:`, error)
      return []
    }
  },

  async find<T>(table: string, conditions: Record<string, any>): Promise<T[]> {
    if (!db) throw new Error('Database not initialized')
    
    const transaction = db.transaction([table], 'readonly')
    const store = transaction.objectStore(table)
    
    try {
      // For simple conditions, try to use indexes if available
      const conditionKeys = Object.keys(conditions)
      if (conditionKeys.length === 1) {
        const key = conditionKeys[0]
        const value = conditions[key]
        
        // Try to use index if available
        try {
          const index = store.index(key)
          const result = await promisifyRequest(index.getAll(value))
          return result as T[]
        } catch {
          // Index doesn't exist, fall back to full scan
        }
      }
      
      // Fall back to full table scan with filtering
      const allRecords = await promisifyRequest(store.getAll())
      const filtered = allRecords.filter((record: any) => {
        return Object.entries(conditions).every(([key, value]) => record[key] === value)
      })
      
      return filtered as T[]
    } catch (error) {
      console.error(`Error finding records in ${table}:`, error)
      return []
    }
  },

  async transaction<T>(callback: (ops: SQLiteOperations) => Promise<T>): Promise<T> {
    // For IndexedDB, we'll simulate transactions by passing the same operations object
    // In a real implementation, you might want to create a transaction-scoped operations object
    return await callback(sqliteOperations)
  }
}
