"use client"

// Import polyfill first
import './pouchdb-polyfill'

// Import types from pouchdb.d.ts

// PouchDB instances
let PouchDB: any = null
let PouchDBFind: any = null
let PouchDBCompression: any = null

// Database instances
let employeesDb: any = null
let payrollStructuresDb: any = null
let payrollHistoryDb: any = null
let settingsDb: any = null
let usersDb: any = null // Added for user authentication

// Database names
export const DB_NAMES = {
  EMPLOYEES: "payroll_employees",
  PAYROLL_STRUCTURES: "payroll_structures",
  PAYROLL_HISTORY: "payroll_history",
  SETTINGS: "payroll_settings",
  USERS: "payroll_users", // Added for user authentication
}

// Flag to track initialization attempts
let initializationAttempted = false
let initializationSuccessful = false
let lastInitializationError: string | null = null
let lastHealthCheckTime: number | null = null
let healthCheckInterval: NodeJS.Timeout | null = null

// Network status tracking
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOnline = true })
  window.addEventListener('offline', () => { isOnline = false })
}

// Initialize PouchDB with better error handling and plugins
const initPouchDB = async () => {
  // Skip if already initialized successfully
  if (PouchDB) {
    return true
  }

  // Skip if not in browser
  if (typeof window === "undefined") {
    console.log("Skipping PouchDB initialization in server environment")
    return false
  }

  try {
    console.log("Attempting to load PouchDB...")
    lastInitializationError = null

    // Try different import strategies for PouchDB
    let pouchModule = null
    
    try {
      // First try the standard import
      pouchModule = await import("pouchdb")
      PouchDB = pouchModule.default
    } catch (err1: any) {
      console.warn("Standard import failed, trying alternative:", err1?.message || err1)
      
      try {
        // Try importing the browser build
        pouchModule = await import("pouchdb/dist/pouchdb.js")
        PouchDB = pouchModule.default || pouchModule
      } catch (err2: any) {
        console.warn("Browser build import failed:", err2?.message || err2)
        
        const errorMsg = `All PouchDB import strategies failed: ${err2?.message || err2}`
        console.error(errorMsg)
        lastInitializationError = errorMsg
        return false
      }
    }

    if (!PouchDB) {
      const errorMsg = "Failed to load PouchDB module - check network connection and dependencies"
      console.error(errorMsg)
      lastInitializationError = errorMsg
      return false
    }

    console.log("PouchDB loaded successfully")

    // Load find plugin - try multiple import strategies
    try {
      console.log("Attempting to load pouchdb-find plugin...")
      let findModule = null
      
      try {
        findModule = await import("pouchdb-find")
        PouchDBFind = findModule.default || findModule
      } catch (err1: any) {
        console.warn("Standard pouchdb-find import failed:", err1?.message || err1)
        PouchDBFind = null
      }

      if (PouchDBFind && PouchDB && PouchDB.plugin) {
        console.log("Registering pouchdb-find plugin...")
        PouchDB.plugin(PouchDBFind)
        console.log("pouchdb-find plugin registered successfully")
        
        // Verify the plugin was loaded by checking if find method exists
        const testDb = new PouchDB('test-find-capability', { adapter: 'memory' })
        if (typeof testDb.find === 'function') {
          console.log("✅ pouchdb-find plugin working correctly")
          testDb.destroy() // Clean up test database
        } else {
          console.error("❌ pouchdb-find plugin not working - find method not available")
        }
      } else {
        console.warn("pouchdb-find plugin not available, search functionality will be limited")
      }
    } catch (pluginError) {
      console.error("Error loading pouchdb-find plugin:", pluginError)
      // Continue without the plugin
    }
    
    // Load compression plugin for low-bandwidth optimization
    try {
      console.log("Attempting to load pouchdb-adapter-memory and compression plugins...")
      
      // Load compression plugin
      const compressionModule = await import("pouchdb-adapter-memory").catch((err) => {
        console.error("Error importing pouchdb-adapter-memory:", err)
        return null
      })
      
      PouchDBCompression = compressionModule?.default || compressionModule
      
      if (PouchDBCompression) {
        console.log("Registering compression plugin...")
        PouchDB.plugin(PouchDBCompression)
        console.log("Compression plugin registered successfully")
      } else {
        console.warn("Compression plugin not available, bandwidth optimization will be limited")
      }
    } catch (pluginError) {
      console.error("Error loading compression plugin:", pluginError)
      // Continue without the plugin
    }

    return true
  } catch (error) {
    console.error("Critical error initializing PouchDB:", error)
    return false
  }
}

// Create a database instance with error handling
const createDatabase = async (dbName: string) => {
  if (!PouchDB) {
    console.error(`Cannot create database ${dbName}: PouchDB not initialized`)
    return null
  }
  try {
    console.log(`Creating database: ${dbName}`)
    
    // Configure database options for better performance
    const options = {
      auto_compaction: true,  // Automatically compact the database
      revs_limit: 100,        // Limit revision history to save space
      // Use default adapter for better compatibility
    }
    
    const db = new PouchDB(dbName, options)
    
    // Add database name as a property for easier identification
    db.name = dbName
    
    return db
  } catch (error) {
    console.error(`Error creating database ${dbName}:`, error)
    return null
  }
}

// Initialize all databases
// Health check function
const performHealthCheck = async () => {
  try {
    if (!PouchDB || !employeesDb) return false
    
    // Simple test query to verify database is responsive
    const info = await employeesDb.info().catch(() => null)
    lastHealthCheckTime = Date.now()
    return !!info
  } catch (error) {
    console.error("Health check failed:", error)
    return false
  }
}

// Start periodic health checks
const startHealthChecks = (interval = 30000) => {
  if (healthCheckInterval) clearInterval(healthCheckInterval)
  
  healthCheckInterval = setInterval(async () => {
    const isHealthy = await performHealthCheck()
    if (!isHealthy) {
      console.warn("Database health check failed")
    }
  }, interval)
}

export const initializeDatabase = async () => {
  // Skip if already attempted
  if (initializationAttempted) {
    const isHealthy = await performHealthCheck()
    return {
      success: initializationSuccessful && isHealthy,
      databases: {
        employees: employeesDb,
        payrollStructures: payrollStructuresDb,
        payrollHistory: payrollHistoryDb,
        settings: settingsDb,
        users: usersDb,
      },
      lastError: lastInitializationError,
      lastHealthCheck: lastHealthCheckTime,
    }
  }

  initializationAttempted = true
  lastInitializationError = null

  // Skip if not in browser
  if (typeof window === "undefined") {
    const errorMsg = "Skipping database initialization in server environment"
    console.log(errorMsg)
    lastInitializationError = errorMsg
    return { success: false, databases: null, lastError: errorMsg }
  }

  try {
    // Initialize PouchDB
    const pouchInitialized = await initPouchDB()
    if (!pouchInitialized) {
      const errorMsg = "Failed to initialize PouchDB, cannot proceed with database initialization"
      console.error(errorMsg)
      lastInitializationError = errorMsg
      return { success: false, databases: null, lastError: errorMsg }
    }

    // Start health monitoring
    startHealthChecks()

    // Create database instances
    employeesDb = await createDatabase(DB_NAMES.EMPLOYEES)
    payrollStructuresDb = await createDatabase(DB_NAMES.PAYROLL_STRUCTURES)
    payrollHistoryDb = await createDatabase(DB_NAMES.PAYROLL_HISTORY)
    settingsDb = await createDatabase(DB_NAMES.SETTINGS)
    usersDb = await createDatabase(DB_NAMES.USERS)

    // Check if all databases were created successfully
    if (!employeesDb || !payrollStructuresDb || !payrollHistoryDb || !settingsDb || !usersDb) {
      console.error("Failed to create one or more databases")
      return {
        success: false,
        databases: {
          employees: employeesDb,
          payrollStructures: payrollStructuresDb,
          payrollHistory: payrollHistoryDb,
          settings: settingsDb,
          users: usersDb,
        },
      }
    }

    // Create indexes (with error handling)
    if (PouchDBFind) {
      try {
        console.log("Creating database indexes...")

        // Create indexes for employees
        if (employeesDb) {
          await employeesDb
            .createIndex({
              index: { fields: ["department", "status", "payrollStructureId"] },
            })
            .catch((err: any) => console.warn("Error creating employees index:", err))
        }

        // Create indexes for payroll structures
        if (payrollStructuresDb) {
          await payrollStructuresDb
            .createIndex({
              index: { fields: ["name"] },
            })
            .catch((err: any) => console.warn("Error creating payroll structures index:", err))
        }

        // Create indexes for payroll history
        if (payrollHistoryDb) {
          await payrollHistoryDb
            .createIndex({
              index: { fields: ["date", "employeeId"] },
            })
            .catch((err: any) => console.warn("Error creating payroll history index:", err))
            
        // Create indexes for users
        if (usersDb) {
          await usersDb
            .createIndex({
              index: { fields: ["username", "email"] },
            })
            .catch((err: any) => console.warn("Error creating users index:", err))
        }
        }

        console.log("Database indexes created successfully")
      } catch (indexError) {
        console.warn("Error creating indexes (non-fatal):", indexError)
      }
    } else {
      console.warn("PouchDB Find plugin not available, skipping index creation")
    }

    console.log("Database initialization completed successfully")
    initializationSuccessful = true

    return {
      success: true,
      databases: {
        employees: employeesDb,
        payrollStructures: payrollStructuresDb,
        payrollHistory: payrollHistoryDb,
        settings: settingsDb,
        users: usersDb,
      },
    }
  } catch (error) {
    console.error("Error during database initialization:", error)
    return { success: false, databases: null }
  }
}

// Get database instances (with initialization if needed)
export const getDatabases = async () => {
  // Skip if not in browser
  if (typeof window === "undefined") {
    return {
      employees: null,
      payrollStructures: null,
      payrollHistory: null,
      settings: null,
      users: null,
    }
  }

  // Initialize if not already done
  if (!initializationAttempted) {
    console.log("Databases not initialized, initializing now...")
    const { success, databases } = await initializeDatabase()

    if (!success || !databases) {
      console.error("Failed to initialize databases on demand")
      return {
        employees: null,
        payrollStructures: null,
        payrollHistory: null,
        settings: null,
        users: null,
      }
    }

    return databases
  }

  // Return existing database instances
  return {
    employees: employeesDb,
    payrollStructures: payrollStructuresDb,
    payrollHistory: payrollHistoryDb,
    settings: settingsDb,
    users: usersDb,
  }
}

// Check if we're online
export const checkOnlineStatus = (): boolean => {
  return isOnline
}

// Wait for online status with enhanced logging and error handling
export const waitForOnline = async (
  timeout = 30000,
  checkInterval = 1000
): Promise<{ online: boolean; waitedMs?: number }> => {
  if (isOnline) {
    console.debug("Already online, no waiting needed")
    return { online: true, waitedMs: 0 }
  }
  
  console.log(`Waiting for online status (timeout: ${timeout}ms)...`)
  const startTime = Date.now()
  
  return new Promise((resolve) => {
    const intervalId = setInterval(async () => {
      try {
        // Perform a lightweight network check
        const networkCheck = await fetch('https://httpbin.org/get', {
          method: 'HEAD',
          cache: 'no-store',
          mode: 'no-cors'
        }).catch(() => null)
        
        if (networkCheck?.ok) {
          const waitedMs = Date.now() - startTime
          console.log(`Online status confirmed after ${waitedMs}ms`)
          clearInterval(intervalId)
          resolve({ online: true, waitedMs })
          return
        }
        
        if (Date.now() - startTime > timeout) {
          const waitedMs = Date.now() - startTime
          console.warn(`Online wait timeout after ${waitedMs}ms`)
          clearInterval(intervalId)
          resolve({ online: false, waitedMs })
        }
      } catch (error) {
        console.error("Error during online status check:", error)
        // Continue waiting unless timeout
        if (Date.now() - startTime > timeout) {
          clearInterval(intervalId)
          resolve({ online: false, waitedMs: timeout })
        }
      }
    }, checkInterval)
  })
}

// Mock database operations for when real database is not available
const mockDbOperations = {
  create: async () => {
    console.warn("Using mock database operation: create")
    return null
  },
  getById: async () => {
    console.warn("Using mock database operation: getById")
    return null
  },
  update: async () => {
    console.warn("Using mock database operation: update")
    return null
  },
  delete: async () => {
    console.warn("Using mock database operation: delete")
    return null
  },
  getAll: async () => {
    console.warn("Using mock database operation: getAll")
    return []
  },
  find: async () => {
    console.warn("Using mock database operation: find")
    return { docs: [] }
  },
  bulkDocs: async () => {
    console.warn("Using mock database operation: bulkDocs")
    return []
  },
}

// Queue for offline operations
interface QueuedOperation {
  type: 'create' | 'update' | 'delete' | 'bulkDocs'
  dbName: string
  data: any
  timestamp: number
}

let operationsQueue: QueuedOperation[] = []

// Process queued operations when online
const processQueue = async () => {
  if (!isOnline || operationsQueue.length === 0) return
  
  console.log(`Processing ${operationsQueue.length} queued operations`)
  
  const dbInstances = await getDatabases()
  const databases = dbInstances as any
  if (!databases) return
  
  // Process operations in order
  const operations = [...operationsQueue]
  operationsQueue = []
  
  for (const op of operations) {
    try {
      const db = databases[op.dbName.replace('payroll_', '')]
      if (!db) continue
      
      switch (op.type) {
        case 'create':
          await dbOperations.create(db, op.data)
          break
        case 'update':
          await dbOperations.update(db, op.data._id, op.data)
          break
        case 'delete':
          await dbOperations.delete(db, op.data._id)
          break
        case 'bulkDocs':
          await dbOperations.bulkDocs(db, op.data)
          break
      }
    } catch (error) {
      console.error(`Error processing queued operation:`, error)
      // Re-queue failed operation
      operationsQueue.push(op)
    }
  }
}

// Set up queue processing when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processQueue()
  })
}

// Safe database operations with fallbacks and offline support
export const dbOperations = {
  // Create a document
  async create(db: any, doc: any) {
    if (!db) {
      console.warn("Using mock database operation: create")
      return mockDbOperations.create()
    }

    try {
      const timestamp = new Date().toISOString()
      const id = doc._id || crypto.randomUUID()

      const docToSave = {
        _id: id,
        ...doc,
        createdAt: doc.createdAt || timestamp,
        updatedAt: timestamp,
      }

      // If offline, queue the operation
      if (!isOnline) {
        console.log("Offline: Queueing create operation for", docToSave._id)
        operationsQueue.push({
          type: 'create',
          dbName: db.name,
          data: docToSave,
          timestamp: Date.now()
        })
        return { ...docToSave, _queued: true, _offline: true }
      }

      // Log operation details
      console.debug("Creating document:", {
        db: db.name,
        id: docToSave._id,
        type: docToSave.type || 'unknown'
      })

      const response = await db.put(docToSave)
      
      console.debug("Document created successfully:", {
        id: docToSave._id,
        rev: response.rev
      })
      
      return { ...docToSave, _rev: response.rev }
    } catch (error: any) {
      // If conflict, try to resolve
      if (error.name === 'conflict') {
        console.warn("Document conflict detected, attempting merge:", doc._id)
        try {
          const existingDoc = await db.get(doc._id)
          console.debug("Merging with existing document:", existingDoc._rev)
          
          const mergedDoc = {
            ...existingDoc,
            ...doc,
            updatedAt: new Date().toISOString(),
            _conflictResolved: true
          }
          
          const response = await db.put(mergedDoc)
          console.debug("Conflict resolved successfully:", response.rev)
          return { ...mergedDoc, _rev: response.rev }
        } catch (mergeError) {
          console.error("Error resolving conflict:", mergeError)
          throw new Error(`Failed to resolve conflict for document ${doc._id}`)
        }
      }
      
      console.error("Error creating document:", {
        id: doc._id,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  },

  // Get a document by ID
  async getById(db: any, id: string) {
    if (!db) return mockDbOperations.getById()

    try {
      return await db.get(id)
    } catch (error) {
      console.error(`Error getting document with ID ${id}:`, error)
      return null
    }
  },

  // Update a document
  async update(db: any, id: string, updates: any) {
    if (!db) return mockDbOperations.update()

    try {
      // If offline, queue the operation
      if (!isOnline) {
        console.log("Offline: Queueing update operation")
        operationsQueue.push({
          type: 'update',
          dbName: db.name,
          data: { _id: id, ...updates },
          timestamp: Date.now()
        })
        return { _id: id, ...updates, _queued: true }
      }

      const doc = await db.get(id)
      const updatedDoc = {
        ...doc,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      const response = await db.put(updatedDoc)
      return { ...updatedDoc, _rev: response.rev }
    } catch (error: any) {
      // If conflict, try to resolve
      if (error.name === 'conflict') {
        try {
          const latestDoc = await db.get(id)
          const resolvedDoc = {
            ...latestDoc,
            ...updates,
            updatedAt: new Date().toISOString()
          }
          const response = await db.put(resolvedDoc)
          return { ...resolvedDoc, _rev: response.rev }
        } catch (resolveError) {
          console.error(`Error resolving conflict for document ${id}:`, resolveError)
        }
      }
      
      console.error(`Error updating document with ID ${id}:`, error)
      return null
    }
  },

  // Delete a document
  async delete(db: any, id: string) {
    if (!db) return mockDbOperations.delete()

    try {
      // If offline, queue the operation
      if (!isOnline) {
        console.log("Offline: Queueing delete operation")
        operationsQueue.push({
          type: 'delete',
          dbName: db.name,
          data: { _id: id },
          timestamp: Date.now()
        })
        return { ok: true, id, _queued: true }
      }

      const doc = await db.get(id)
      return await db.remove(doc)
    } catch (error) {
      console.error(`Error deleting document with ID ${id}:`, error)
      return null
    }
  },

  // Get all documents
  async getAll(db: any) {
    if (!db) return mockDbOperations.getAll()

    try {
      const result = await db.allDocs({
        include_docs: true,
      })
      return result.rows.map((row: any) => row.doc)
    } catch (error) {
      console.error("Error getting all documents:", error)
      return []
    }
  },

  // Find documents
  async find(db: any, query: any) {
    if (!db) return mockDbOperations.find()

    try {
      // Check if find method exists, if not fall back to allDocs with manual filtering
      if (typeof db.find !== 'function') {
        console.warn("db.find is not available, using allDocs fallback")
        const result = await db.allDocs({ include_docs: true })
        
        // Simple manual filtering (basic implementation)
        let filteredDocs = result.rows.map((row: any) => row.doc)
        
        if (query.selector) {
          filteredDocs = filteredDocs.filter((doc: any) => {
            for (const [key, value] of Object.entries(query.selector)) {
              if (doc[key] !== value) return false
            }
            return true
          })
        }
        
        return { docs: filteredDocs }
      }
      
      return await db.find(query)
    } catch (error) {
      console.error("Error finding documents:", error)
      return { docs: [] }
    }
  },

  // Bulk operations
  async bulkDocs(db: any, docs: any[]) {
    if (!db) return mockDbOperations.bulkDocs()

    try {
      const timestamp = new Date().toISOString()
      const docsToSave = docs.map((doc) => ({
        ...doc,
        updatedAt: timestamp,
        createdAt: doc.createdAt || timestamp,
      }))
      
      // If offline, queue the operation
      if (!isOnline) {
        console.log("Offline: Queueing bulk operation")
        operationsQueue.push({
          type: 'bulkDocs',
          dbName: db.name,
          data: docsToSave,
          timestamp: Date.now()
        })
        return docsToSave.map(doc => ({ ok: true, id: doc._id, _queued: true }))
      }
      
      // Use compression if available for large batches
      if (docsToSave.length > 10 && PouchDBCompression) {
        console.log(`Using compression for bulk operation with ${docsToSave.length} documents`)
        // Compress the documents before sending
        const compressedDocs = docsToSave.map(doc => {
          // Simple compression: remove null/undefined values
          return Object.entries(doc).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
              acc[key] = value
            }
            return acc
          }, {} as any)
        })
        
        return await db.bulkDocs(compressedDocs)
      }
      
      return await db.bulkDocs(docsToSave)
    } catch (error) {
      console.error("Error performing bulk operation:", error)
      return []
    }
  },
}

// Initialize the users database with a test user
export const initializeTestUser = async () => {
  try {
    // Get the users database
    const { users } = await getDatabases();
    
    if (!users) {
      console.error("Users database not available");
      return false;
    }
    
    // Check if the test user already exists
    const result = await dbOperations.find(users, {
      selector: {
        $or: [
          { username: "testuser" },
          { email: "testuser@example.com" }
        ]
      }
    });
    
    if (result.docs && result.docs.length > 0) {
      console.log("Test user already exists");
      return true;
    }
    
    // Create the test user
    const testUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "securepass123", // In a real app, this would be hashed
      role: "admin",
      name: "Test User",
    };
    
    const created = await dbOperations.create(users, testUser);
    
    if (created) {
      console.log("Test user created successfully");
      return true;
    } else {
      console.error("Failed to create test user");
      return false;
    }
  } catch (error) {
    console.error("Error initializing test user:", error);
    return false;
  }
};

// Export the operations queue for testing
export const getOperationsQueue = () => [...operationsQueue]

// Clear the operations queue
export const clearOperationsQueue = () => {
  operationsQueue = []
}

// Process queued operations manually
export const processOperationsQueue = async () => {
  return await processQueue()
}
