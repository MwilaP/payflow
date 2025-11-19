"use client"

import { DB_NAMES } from "./db-service"

// Configuration type for remote CouchDB
export interface RemoteSyncConfig {
  url: string
  username?: string
  password?: string
  batchSize?: number
  retry?: boolean
  retryDelay?: number
  heartbeat?: number
  timeout?: number
  compression?: boolean
}

// Sync status type
export type SyncStatus = 
  | "idle" 
  | "active" 
  | "paused" 
  | "error" 
  | "complete" 
  | "denied"

// Sync info type
export interface SyncInfo {
  status: SyncStatus
  lastSynced: Date | null
  error: Error | null
  direction: "push" | "pull" | "both" | null
  pending: number
}

// Default sync configuration
const DEFAULT_CONFIG: RemoteSyncConfig = {
  url: "",
  batchSize: 25,
  retry: true,
  retryDelay: 5000,
  heartbeat: 10000,
  timeout: 30000,
  compression: true
}

// Sync service class
export class SyncService {
  private syncHandlers: Map<string, any> = new Map()
  private syncInfo: Map<string, SyncInfo> = new Map()
  private config: RemoteSyncConfig
  private isOnline: boolean = true
  private networkListenerAdded: boolean = false
  private PouchDB: any = null

  constructor(pouchDB: any, config: Partial<RemoteSyncConfig> = {}) {
    this.PouchDB = pouchDB
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // Initialize sync info for all databases
    Object.values(DB_NAMES).forEach(dbName => {
      this.syncInfo.set(dbName, {
        status: "idle",
        lastSynced: null,
        error: null,
        direction: null,
        pending: 0
      })
    })
    
    // Add network status listeners if in browser
    if (typeof window !== "undefined" && !this.networkListenerAdded) {
      window.addEventListener("online", this.handleOnline)
      window.addEventListener("offline", this.handleOffline)
      this.isOnline = navigator.onLine
      this.networkListenerAdded = true
    }
  }

  /**
   * Start two-way sync for a specific database
   * @param localDb Local PouchDB instance
   * @param dbName Database name
   * @param options Optional sync options
   * @returns Sync handler
   */
  startSync(localDb: any, dbName: string, options: Partial<RemoteSyncConfig> = {}): any {
    if (!this.PouchDB || !localDb) {
      console.error("Cannot start sync: PouchDB or local database not available")
      return null
    }

    // Stop existing sync if any
    this.stopSync(dbName)

    try {
      // Merge default config with provided options
      const syncConfig = { ...this.config, ...options }
      
      if (!syncConfig.url) {
        console.error("Cannot start sync: Remote URL not provided")
        this.updateSyncInfo(dbName, { 
          status: "error", 
          error: new Error("Remote URL not provided") 
        })
        return null
      }

      // Create remote database URL
      const remoteDbUrl = `${syncConfig.url}/${dbName}`
      
      // Create remote database instance with auth if provided
      const remoteOptions: any = {}
      if (syncConfig.username && syncConfig.password) {
        remoteOptions.auth = {
          username: syncConfig.username,
          password: syncConfig.password
        }
      }
      
      const remoteDb = new this.PouchDB(remoteDbUrl, remoteOptions)
      
      // Configure sync options
      const syncOptions = {
        live: true,
        retry: syncConfig.retry,
        batch_size: syncConfig.batchSize,
        heartbeat: syncConfig.heartbeat,
        timeout: syncConfig.timeout,
        // Last-write-wins conflict resolution strategy
        conflicts: true,
        back_off_function: (delay: number) => {
          if (delay === 0) {
            return 1000
          }
          return Math.min(delay * 3, 60000) // Exponential backoff capped at 1 minute
        }
      }

      console.log(`Starting sync for ${dbName} with remote ${remoteDbUrl}`)
      
      // Start two-way sync
      const syncHandler = localDb.sync(remoteDb, syncOptions)
        .on('change', (info: any) => {
          console.log(`Sync change for ${dbName}:`, info)
          this.updateSyncInfo(dbName, { 
            status: "active",
            direction: info.direction,
            pending: info.pending || 0
          })
        })
        .on('paused', () => {
          console.log(`Sync paused for ${dbName}`)
          this.updateSyncInfo(dbName, { 
            status: "paused",
            lastSynced: new Date()
          })
        })
        .on('active', () => {
          console.log(`Sync active for ${dbName}`)
          this.updateSyncInfo(dbName, { status: "active" })
        })
        .on('denied', (err: Error) => {
          console.error(`Sync denied for ${dbName}:`, err)
          this.updateSyncInfo(dbName, { 
            status: "denied", 
            error: err 
          })
        })
        .on('complete', (info: any) => {
          console.log(`Sync complete for ${dbName}:`, info)
          this.updateSyncInfo(dbName, { 
            status: "complete",
            lastSynced: new Date()
          })
        })
        .on('error', (err: Error) => {
          console.error(`Sync error for ${dbName}:`, err)
          this.updateSyncInfo(dbName, { 
            status: "error", 
            error: err 
          })
        })

      // Store sync handler
      this.syncHandlers.set(dbName, syncHandler)
      return syncHandler
    } catch (error) {
      console.error(`Error starting sync for ${dbName}:`, error)
      this.updateSyncInfo(dbName, { 
        status: "error", 
        error: error instanceof Error ? error : new Error(String(error)) 
      })
      return null
    }
  }

  /**
   * Stop sync for a specific database
   * @param dbName Database name
   */
  stopSync(dbName: string): void {
    const syncHandler = this.syncHandlers.get(dbName)
    if (syncHandler) {
      console.log(`Stopping sync for ${dbName}`)
      syncHandler.cancel()
      this.syncHandlers.delete(dbName)
      this.updateSyncInfo(dbName, { 
        status: "idle",
        direction: null
      })
    }
  }

  /**
   * Get sync info for a specific database
   * @param dbName Database name
   * @returns Sync info
   */
  getSyncInfo(dbName: string): SyncInfo {
    return this.syncInfo.get(dbName) || {
      status: "idle",
      lastSynced: null,
      error: null,
      direction: null,
      pending: 0
    }
  }

  /**
   * Resolve conflicts using last-write-wins strategy
   * @param db Database instance
   * @returns Promise resolving to number of conflicts resolved
   */
  async resolveConflicts(db: any): Promise<number> {
    if (!db) {
      console.error("Cannot resolve conflicts: Database not available")
      return 0
    }

    try {
      // Find documents with conflicts
      const result = await db.allDocs({
        include_docs: true,
        conflicts: true
      })

      let resolvedCount = 0
      const docsToUpdate = []

      // Process each document with conflicts
      for (const row of result.rows) {
        if (row.doc && row.doc._conflicts) {
          // Get all conflicting revisions
          const conflicts = await Promise.all(
            row.doc._conflicts.map((rev: string) => 
              db.get(row.id, { rev })
            )
          )

          // Find the revision with the latest updatedAt timestamp
          let winningRev = row.doc
          let latestTimestamp = new Date(row.doc.updatedAt || 0).getTime()

          for (const conflict of conflicts) {
            const conflictTimestamp = new Date(conflict.updatedAt || 0).getTime()
            if (conflictTimestamp > latestTimestamp) {
              winningRev = conflict
              latestTimestamp = conflictTimestamp
            }
          }

          // Prepare the winning revision for update
          // Keep the current _rev but use the content from the winning revision
          const resolvedDoc = {
            ...winningRev,
            _id: row.id,
            _rev: row.doc._rev
          }

          docsToUpdate.push(resolvedDoc)
          resolvedCount++
        }
      }

      // Bulk update the resolved documents
      if (docsToUpdate.length > 0) {
        await db.bulkDocs(docsToUpdate)
        console.log(`Resolved ${resolvedCount} conflicts using last-write-wins strategy`)
      }

      return resolvedCount
    } catch (error) {
      console.error("Error resolving conflicts:", error)
      return 0
    }
  }

  /**
   * Perform a one-time sync (useful for initial sync or manual sync)
   * @param localDb Local database instance
   * @param dbName Database name
   * @param direction Sync direction (push, pull, or both)
   * @param options Sync options
   * @returns Promise resolving to sync result
   */
  async syncOnce(
    localDb: any, 
    dbName: string, 
    direction: "push" | "pull" | "both" = "both",
    options: Partial<RemoteSyncConfig> = {}
  ): Promise<any> {
    if (!this.PouchDB || !localDb) {
      throw new Error("Cannot sync: PouchDB or local database not available")
    }

    try {
      // Merge default config with provided options
      const syncConfig = { ...this.config, ...options }
      
      if (!syncConfig.url) {
        throw new Error("Cannot sync: Remote URL not provided")
      }

      // Create remote database URL
      const remoteDbUrl = `${syncConfig.url}/${dbName}`
      
      // Create remote database instance with auth if provided
      const remoteOptions: any = {}
      if (syncConfig.username && syncConfig.password) {
        remoteOptions.auth = {
          username: syncConfig.username,
          password: syncConfig.password
        }
      }
      
      const remoteDb = new this.PouchDB(remoteDbUrl, remoteOptions)
      
      // Configure sync options
      const syncOptions = {
        batch_size: syncConfig.batchSize,
        batches_limit: 5, // Limit number of batches for one-time sync
        compression: syncConfig.compression
      }

      this.updateSyncInfo(dbName, { status: "active", direction })

      let result
      if (direction === "push") {
        // Push local changes to remote
        result = await localDb.replicate.to(remoteDb, syncOptions)
      } else if (direction === "pull") {
        // Pull remote changes to local
        result = await localDb.replicate.from(remoteDb, syncOptions)
      } else {
        // Two-way sync
        result = await localDb.sync(remoteDb, syncOptions)
      }

      this.updateSyncInfo(dbName, { 
        status: "complete", 
        lastSynced: new Date(),
        direction
      })

      // Resolve any conflicts after sync
      await this.resolveConflicts(localDb)

      return result
    } catch (error) {
      console.error(`Error in one-time sync for ${dbName}:`, error)
      this.updateSyncInfo(dbName, { 
        status: "error", 
        error: error instanceof Error ? error : new Error(String(error)),
        direction
      })
      throw error
    }
  }

  /**
   * Update sync info for a specific database
   * @param dbName Database name
   * @param updates Partial sync info updates
   */
  private updateSyncInfo(dbName: string, updates: Partial<SyncInfo>): void {
    const currentInfo = this.syncInfo.get(dbName) || {
      status: "idle",
      lastSynced: null,
      error: null,
      direction: null,
      pending: 0
    }
    
    this.syncInfo.set(dbName, { ...currentInfo, ...updates })
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    console.log("Network is online, resuming sync")
    this.isOnline = true
    
    // Restart sync for all databases
    this.syncHandlers.forEach((_, dbName) => {
      // We don't have direct access to the database instances here,
      // so we'll just update the status and let the application restart sync
      this.updateSyncInfo(dbName, { status: "idle" })
    })
  }

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    console.log("Network is offline, sync will be paused")
    this.isOnline = false
    
    // Update status for all active syncs
    this.syncHandlers.forEach((_, dbName) => {
      this.updateSyncInfo(dbName, { status: "paused" })
    })
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Stop all sync processes
    this.syncHandlers.forEach((handler, dbName) => {
      this.stopSync(dbName)
    })
    
    // Remove event listeners
    if (typeof window !== "undefined" && this.networkListenerAdded) {
      window.removeEventListener("online", this.handleOnline)
      window.removeEventListener("offline", this.handleOffline)
      this.networkListenerAdded = false
    }
  }
}

// Factory function to create a sync service
export function createSyncService(
  pouchDB: any, 
  config: Partial<RemoteSyncConfig> = {}
): SyncService | null {
  if (!pouchDB) {
    console.error("Cannot create SyncService: PouchDB not available")
    return null
  }
  
  return new SyncService(pouchDB, config)
}