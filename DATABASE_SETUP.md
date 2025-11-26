# SQLite Database Integration Guide

## Overview

The application now uses SQLite database instead of browser localStorage for persistent data storage. This provides better performance, reliability, and data integrity.

## Features

- **Persistent Storage**: All data is stored in a SQLite database file
- **Better Performance**: Faster queries and better concurrent access
- **Data Integrity**: ACID compliance and transaction support
- **Structured Data**: Dedicated tables for employees, payroll records, leave requests, etc.
- **Key-Value Store**: Simple localStorage-compatible API for settings and configuration

## Database Location

The database file is stored in:

- **Windows**: `%APPDATA%/payroll/database/payroll.db`
- **macOS**: `~/Library/Application Support/payroll/database/payroll.db`
- **Linux**: `~/.config/payroll/database/payroll.db`

## Usage in Renderer Process

### Using the Database Service

```typescript
import { db } from '@renderer/lib/database'

// Store a simple value
await db.setItem('theme', 'dark')

// Get a simple value
const theme = await db.getItem('theme')

// Store an object (automatically serialized)
await db.setObject('user-settings', {
  notifications: true,
  language: 'en'
})

// Get an object (automatically deserialized)
const settings = await db.getObject('user-settings')

// Remove an item
await db.removeItem('theme')

// Get all keys with a prefix
const keys = await db.getKeys('user-')

// Clear all data
await db.clear()
```

### Using React Hooks

```typescript
import { useDatabase } from '@renderer/hooks/useDatabase'

function MyComponent() {
  // Similar to useState but persists to database
  const [settings, setSettings, loading] = useDatabase('app-settings', {
    theme: 'light',
    notifications: true
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <button onClick={() => setSettings({ ...settings, theme: 'dark' })}>
      Toggle Theme
    </button>
  )
}
```

### Advanced Queries

```typescript
// Execute raw SQL queries
const employees = await db.query('SELECT * FROM employees WHERE department = ?', ['Engineering'])

// Get database statistics
const stats = await db.getStats()
console.log('Database size:', stats.size)
console.log('Total employees:', stats.employeesCount)
```

## Migration from localStorage

The database service includes a migration utility to transfer existing localStorage data:

```typescript
import { db } from '@renderer/lib/database'

// Run once to migrate all localStorage data
await db.migrateFromLocalStorage()
```

## Database Schema

### Key-Value Store Table

```sql
CREATE TABLE kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Employees Table

```sql
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Payroll Records Table

```sql
CREATE TABLE payroll_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  period TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
)
```

### Leave Requests Table

```sql
CREATE TABLE leave_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
)
```

### Payroll Structures Table

```sql
CREATE TABLE payroll_structures (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

## API Reference

### Database Service Methods

- `getItem(key: string): Promise<string | null>` - Get a value
- `setItem(key: string, value: string): Promise<boolean>` - Set a value
- `removeItem(key: string): Promise<boolean>` - Remove a value
- `getKeys(prefix?: string): Promise<string[]>` - Get all keys (optionally filtered by prefix)
- `clear(): Promise<boolean>` - Clear all data
- `getObject<T>(key: string): Promise<T | null>` - Get and parse JSON object
- `setObject<T>(key: string, value: T): Promise<boolean>` - Stringify and store object
- `query(sql: string, params?: any[]): Promise<any>` - Execute raw SQL query
- `getStats(): Promise<Stats>` - Get database statistics
- `migrateFromLocalStorage(): Promise<void>` - Migrate data from localStorage

### React Hooks

- `useDatabase<T>(key: string, initialValue: T)` - State hook with database persistence
- `useDatabaseString(key: string, initialValue: string)` - String-specific state hook
- `useDatabaseStats()` - Hook to get database statistics

## Best Practices

1. **Use Structured Tables**: For complex data like employees and payroll records, use the dedicated tables instead of the key-value store
2. **Batch Operations**: Use transactions for multiple related operations
3. **Error Handling**: Always handle errors when working with async database operations
4. **Key Naming**: Use consistent prefixes for related keys (e.g., `settings:`, `cache:`)
5. **Data Validation**: Validate data before storing in the database

## Troubleshooting

### Database locked error

This usually happens when multiple processes try to access the database. The database uses WAL mode to minimize this issue.

### Migration issues

If migration fails, check the browser console for errors. You can manually copy data if needed.

### Performance

For large datasets, use the structured tables with proper indexes instead of the key-value store.
