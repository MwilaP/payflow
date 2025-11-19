import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { initializeSQLiteDatabase, checkDatabaseHealth } from "./indexeddb-sqlite-service"
import { createEmployeeServiceCompat } from "./sqlite-employee-service"
import { createPayrollStructureServiceCompat } from "./sqlite-payroll-service"

// Define the context type
interface SQLiteDatabaseContextType {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  employeeService: any | null
  payrollStructureService: any | null
  healthStatus: boolean
}

// Create the context
const SQLiteDatabaseContext = createContext<SQLiteDatabaseContextType>({
  isInitialized: false,
  isLoading: true,
  error: null,
  employeeService: null,
  payrollStructureService: null,
  healthStatus: false,
})

// Provider component
export function SQLiteDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SQLiteDatabaseContextType>({
    isInitialized: false,
    isLoading: true,
    error: null,
    employeeService: null,
    payrollStructureService: null,
    healthStatus: false,
  })

  // Initialize database and services
  useEffect(() => {
    let isMounted = true
    let healthCheckInterval: NodeJS.Timeout | null = null

    const initialize = async () => {
      try {
        console.log("Initializing SQLite database...")
        const { success, error } = await initializeSQLiteDatabase()

        if (!success) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isInitialized: false,
              isLoading: false,
              error: error || "Failed to initialize SQLite database",
              employeeService: null,
              payrollStructureService: null,
              healthStatus: false,
            }))
          }
          return
        }

        // Create services
        const employeeService = createEmployeeServiceCompat()
        const payrollStructureService = createPayrollStructureServiceCompat()

        // Set up health check monitoring
        const performHealthCheck = () => {
          const isHealthy = checkDatabaseHealth()
          if (isMounted) {
            setState(prev => ({
              ...prev,
              healthStatus: isHealthy,
            }))
          }
          return isHealthy
        }

        // Initial health check
        const initialHealth = performHealthCheck()

        // Set up interval for health checks
        healthCheckInterval = setInterval(() => {
          const isHealthy = performHealthCheck()
          if (!isHealthy) {
            console.warn("SQLite database health check failed")
          }
        }, 30000) // Check every 30 seconds

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isLoading: false,
            error: null,
            employeeService,
            payrollStructureService,
            healthStatus: initialHealth,
          }))

          console.log("SQLite database initialized successfully")
        }
      } catch (err) {
        console.error("Error initializing SQLite database:", err)

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitialized: false,
            isLoading: false,
            error: err instanceof Error ? err.message : "Unknown database error",
            employeeService: null,
            payrollStructureService: null,
            healthStatus: false,
          }))
        }
      }
    }

    // Start initialization
    initialize()

    return () => {
      isMounted = false
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval)
      }
    }
  }, [])

  return <SQLiteDatabaseContext.Provider value={state}>{children}</SQLiteDatabaseContext.Provider>
}

// Hook to use the database context
export function useSQLiteDatabase() {
  return useContext(SQLiteDatabaseContext)
}

// Hook to get services (maintaining compatibility with existing code)
export function useDatabase() {
  const context = useSQLiteDatabase()
  return {
    isInitialized: context.isInitialized,
    isLoading: context.isLoading,
    error: context.error,
    databases: context.isInitialized ? {
      employees: {}, // Mock object for compatibility
      payrollStructures: {},
      payrollHistory: {},
      settings: {},
      users: {},
    } : null,
    employeeService: context.employeeService,
    syncService: null, // No sync service needed for SQLite
    syncConfig: {},
    setSyncConfig: () => {},
    syncStatus: {},
  }
}

// Hook to get database instances (compatibility)
export function useDatabases() {
  const { databases } = useDatabase()
  return databases || {
    employees: null,
    payrollStructures: null,
    payrollHistory: null,
    settings: null,
    users: null,
  }
}

// Hook to get sync service (compatibility - returns null for SQLite)
export function useSyncService() {
  return { 
    syncService: null, 
    syncConfig: {}, 
    setSyncConfig: () => {}, 
    syncStatus: {} 
  }
}

// Hook for sync operations (compatibility - no-op for SQLite)
export function useSync(dbName: string) {
  return {
    startSync: async () => null,
    stopSync: () => {},
    syncOnce: async () => null,
    resolveConflicts: async () => 0,
    getSyncInfo: () => null,
    isSyncing: false,
    syncError: null
  }
}
