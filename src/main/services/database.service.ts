import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export interface DatabaseRecord {
  key: string
  value: string
  created_at: number
  updated_at: number
}

class DatabaseService {
  private db: Database.Database | null = null
  private dbPath: string

  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData')
    const dbDir = join(userDataPath, 'database')

    // Ensure directory exists
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }

    this.dbPath = join(dbDir, 'payroll.db')
  }

  /**
   * Initialize the database connection and create tables
   */
  initialize(): void {
    try {
      this.db = new Database(this.dbPath)

      // Enable WAL mode for better concurrent access
      this.db.pragma('journal_mode = WAL')

      // Create key-value store table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS kv_store (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `)

      // Create employees table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS employees (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `)

      // Create payroll_records table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS payroll_records (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          period TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
      `)

      // Create leave_requests table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS leave_requests (
          id TEXT PRIMARY KEY,
          employee_id TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
      `)

      // Create payroll_structures table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS payroll_structures (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `)

      // Create indexes for better query performance
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_payroll_records_employee_id 
        ON payroll_records(employee_id)
      `)

      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_payroll_records_period 
        ON payroll_records(period)
      `)

      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id 
        ON leave_requests(employee_id)
      `)

      console.log('✅ Database initialized successfully at:', this.dbPath)
    } catch (error) {
      console.error('❌ Failed to initialize database:', error)
      throw error
    }
  }

  /**
   * Get a value from the key-value store
   */
  get(key: string): string | null {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const stmt = this.db.prepare('SELECT value FROM kv_store WHERE key = ?')
      const row = stmt.get(key) as { value: string } | undefined
      return row ? row.value : null
    } catch (error) {
      console.error('Error getting value:', error)
      throw error
    }
  }

  /**
   * Set a value in the key-value store
   */
  set(key: string, value: string): void {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const now = Date.now()
      const stmt = this.db.prepare(`
        INSERT INTO kv_store (key, value, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `)
      stmt.run(key, value, now, now)
    } catch (error) {
      console.error('Error setting value:', error)
      throw error
    }
  }

  /**
   * Delete a value from the key-value store
   */
  delete(key: string): void {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const stmt = this.db.prepare('DELETE FROM kv_store WHERE key = ?')
      stmt.run(key)
    } catch (error) {
      console.error('Error deleting value:', error)
      throw error
    }
  }

  /**
   * Get all keys matching a prefix
   */
  getKeys(prefix?: string): string[] {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      let stmt
      if (prefix) {
        stmt = this.db.prepare('SELECT key FROM kv_store WHERE key LIKE ?')
        const rows = stmt.all(`${prefix}%`) as { key: string }[]
        return rows.map((row) => row.key)
      } else {
        stmt = this.db.prepare('SELECT key FROM kv_store')
        const rows = stmt.all() as { key: string }[]
        return rows.map((row) => row.key)
      }
    } catch (error) {
      console.error('Error getting keys:', error)
      throw error
    }
  }

  /**
   * Clear all data from the key-value store
   */
  clear(): void {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      this.db.prepare('DELETE FROM kv_store').run()
    } catch (error) {
      console.error('Error clearing store:', error)
      throw error
    }
  }

  /**
   * Execute a raw SQL query (for advanced operations)
   */
  query(sql: string, params?: any[]): any {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const stmt = this.db.prepare(sql)
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return params ? stmt.all(...params) : stmt.all()
      } else {
        return params ? stmt.run(...params) : stmt.run()
      }
    } catch (error) {
      console.error('Error executing query:', error)
      throw error
    }
  }

  /**
   * Begin a transaction
   */
  transaction<T>(callback: () => T): T {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    const transaction = this.db.transaction(callback)
    return transaction()
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('✅ Database connection closed')
    }
  }

  /**
   * Get database statistics
   */
  getStats(): {
    path: string
    size: number
    kvStoreCount: number
    employeesCount: number
    payrollRecordsCount: number
    leaveRequestsCount: number
    payrollStructuresCount: number
  } {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const fs = require('fs')
      const stats = fs.statSync(this.dbPath)

      const kvStoreCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM kv_store').get() as { count: number }
      ).count
      const employeesCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM employees').get() as { count: number }
      ).count
      const payrollRecordsCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM payroll_records').get() as { count: number }
      ).count
      const leaveRequestsCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM leave_requests').get() as { count: number }
      ).count
      const payrollStructuresCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM payroll_structures').get() as {
          count: number
        }
      ).count

      return {
        path: this.dbPath,
        size: stats.size,
        kvStoreCount,
        employeesCount,
        payrollRecordsCount,
        leaveRequestsCount,
        payrollStructuresCount
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      throw error
    }
  }

  /**
   * Backup the database
   */
  backup(backupPath: string): void {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const backup = this.db.backup(backupPath)
      backup.step(-1) // Copy all pages
      backup.close()
      console.log('✅ Database backed up to:', backupPath)
    } catch (error) {
      console.error('Error backing up database:', error)
      throw error
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()
