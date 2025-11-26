# SQLite Database - Quick Start Guide

## Installation

The database is already integrated! `better-sqlite3` is installed in your dependencies.

## Quick Usage

### 1. Import the Database Service

```typescript
import { db } from '@renderer/lib/database'
```

### 2. Store and Retrieve Data

```typescript
// Simple string storage
await db.setItem('user-preference', 'dark-mode')
const preference = await db.getItem('user-preference')

// Object storage (auto JSON serialization)
await db.setObject('user-settings', {
  theme: 'dark',
  notifications: true,
  language: 'en'
})
const settings = await db.getObject('user-settings')

// Remove data
await db.removeItem('user-preference')

// Clear all data
await db.clear()
```

### 3. Use React Hooks

```typescript
import { useDatabase } from '@renderer/hooks/useDatabase'

function SettingsComponent() {
  // Works like useState but persists to database
  const [settings, setSettings, loading] = useDatabase('app-settings', {
    theme: 'light',
    notifications: true
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <button onClick={() => setSettings({ ...settings, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  )
}
```

### 4. Advanced Queries

```typescript
// Execute raw SQL
const results = await db.query(
  'SELECT * FROM employees WHERE department = ?',
  ['Engineering']
)

// Get database statistics
const stats = await db.getStats()
console.log('Database size:', stats.size)
console.log('Total records:', stats.kvStoreCount)
```

## Migration from localStorage

If you have existing localStorage data:

```typescript
// Run this once to migrate all localStorage data to database
await db.migrateFromLocalStorage()
```

## Key Differences from localStorage

| Feature | localStorage | SQLite Database |
|---------|-------------|-----------------|
| **API** | Synchronous | Asynchronous (Promise-based) |
| **Storage** | Browser memory | Persistent file |
| **Size Limit** | ~5-10MB | Unlimited |
| **Performance** | Slower for large data | Much faster |
| **Queries** | No | Yes (SQL) |
| **Transactions** | No | Yes |
| **Backup** | Manual | Built-in |

## Common Patterns

### Pattern 1: User Preferences
```typescript
const [theme, setTheme] = useDatabase('theme', 'light')
```

### Pattern 2: Form State Persistence
```typescript
const [formData, setFormData] = useDatabase('draft-form', {
  name: '',
  email: ''
})
```

### Pattern 3: Cache Management
```typescript
// Store with prefix
await db.setObject('cache:users', userData)
await db.setObject('cache:posts', postData)

// Get all cache keys
const cacheKeys = await db.getKeys('cache:')

// Clear cache
for (const key of cacheKeys) {
  await db.removeItem(key)
}
```

## Database Location

Your data is stored at:
- **Windows**: `%APPDATA%/payroll/database/payroll.db`
- **macOS**: `~/Library/Application Support/payroll/database/payroll.db`
- **Linux**: `~/.config/payroll/database/payroll.db`

## Troubleshooting

### "Database not initialized" error
Make sure the app has fully loaded before accessing the database.

### Data not persisting
Check that you're using `await` with all database operations.

### Performance issues
Use structured tables for large datasets instead of the key-value store.

## Next Steps

- Read `DATABASE_SETUP.md` for comprehensive documentation
- Check `SQLITE_INTEGRATION_SUMMARY.md` for implementation details
- Look at migrated components for real-world examples:
  - `src/renderer/src/lib/auth-service.ts`
  - `src/renderer/src/components/company-settings.tsx`
  - `src/renderer/src/components/theme-provider.tsx`

## Support

For issues or questions, check the console logs. The database service provides detailed logging for all operations.
