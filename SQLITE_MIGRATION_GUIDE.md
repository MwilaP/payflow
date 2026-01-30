# SQLite Migration & Bcrypt Implementation Guide

## Overview

This guide documents the migration from IndexedDB (browser-based) to SQLite (file-based) database with bcrypt password hashing for production security.

## What Was Implemented

### ✅ Completed Steps

1. **Bcrypt Installation**
   - Added `bcrypt@6.0.0` for password hashing
   - Added `@types/bcrypt@6.0.0` for TypeScript support

2. **SQLite Database Service** (`src/main/services/database.service.ts`)
   - Created comprehensive database service in main process
   - Implemented all 8 tables: users, employees, payroll_structures, allowances, deductions, payroll_history, settings, leave_requests
   - Added proper indexes for performance
   - Integrated bcrypt password hashing (10 salt rounds)
   - Database location: `{userData}/payroll.db`

3. **IPC Communication Bridge** (`src/main/index.ts`)
   - Added 60+ IPC handlers for all database operations
   - Handlers for: users, employees, payroll structures, allowances, deductions, payroll history, settings, leave requests
   - Database initialization on app startup
   - Proper cleanup on app quit

4. **Preload API Exposure** (`src/preload/index.ts` & `index.d.ts`)
   - Exposed complete database API to renderer process
   - Added TypeScript type definitions
   - All operations return `{ success: boolean; data?: any; error?: string }`

5. **Authentication Service Migration** (`src/renderer/src/lib/auth-service.ts`)
   - Removed IndexedDB dependency
   - Now uses SQLite IPC calls
   - Password hashing handled automatically in main process
   - Bcrypt verification on login

## Architecture Change

### Before (IndexedDB)
```
Renderer Process
└── IndexedDB (browser storage)
    └── Plain text passwords ❌
    └── Can be cleared by browser
```

### After (SQLite)
```
Renderer Process
└── IPC calls →

Main Process
└── SQLite Database (payroll.db)
    └── Bcrypt hashed passwords ✅
    └── Persistent file storage
    └── Proper database with indexes
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  role TEXT NOT NULL DEFAULT 'user',
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Other Tables
- **employees**: Employee records with payroll structure references
- **payroll_structures**: Payroll configuration templates
- **allowances**: Allowances linked to payroll structures
- **deductions**: Deductions linked to payroll structures
- **payroll_history**: Historical payroll records
- **settings**: Application settings (key-value pairs)
- **leave_requests**: Employee leave request tracking

## Security Improvements

### Password Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Location**: Main process only (more secure)
- **Verification**: Automatic on login

### Before
```typescript
// Plain text password storage ❌
password: "mypassword123"
```

### After
```typescript
// Bcrypt hashed password ✅
password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

## How to Use the New API

### Example: User Registration
```typescript
const result = await window.api.db.users.create({
  username: 'john',
  email: 'john@example.com',
  password: 'securePassword123',  // Will be hashed automatically
  role: 'admin',
  name: 'John Doe'
})

if (result.success) {
  console.log('User created:', result.data)
} else {
  console.error('Error:', result.error)
}
```

### Example: User Login
```typescript
const result = await window.api.db.users.validateCredentials(
  'john@example.com',
  'securePassword123'  // Will be verified with bcrypt
)

if (result.success && result.data) {
  console.log('Login successful:', result.data)
} else {
  console.log('Invalid credentials')
}
```

### Example: Employee CRUD
```typescript
// Create
const employee = await window.api.db.employees.create({
  name: 'Jane Smith',
  email: 'jane@company.com',
  phone: '+1234567890',
  department: 'Engineering',
  position: 'Senior Developer',
  hire_date: '2024-01-15',
  salary: 75000,
  status: 'active'
})

// Read
const emp = await window.api.db.employees.getById('emp_123')

// Update
const updated = await window.api.db.employees.update('emp_123', {
  salary: 80000,
  position: 'Lead Developer'
})

// Delete
const deleted = await window.api.db.employees.delete('emp_123')

// Find
const engineers = await window.api.db.employees.find({
  department: 'Engineering',
  status: 'active'
})
```

## Next Steps (Remaining Work)

### 🔄 Services to Migrate

The following service files still use IndexedDB and need to be migrated to use `window.api.db.*`:

1. **Employee Services**
   - `src/renderer/src/lib/db/sqlite-employee-service.ts`
   - `src/renderer/src/lib/db/services/employee.service.ts`

2. **Payroll Services**
   - `src/renderer/src/lib/db/sqlite-payroll-service.ts`
   - `src/renderer/src/lib/db/sqlite-payroll-history-service.ts`
   - `src/renderer/src/lib/db/services/payroll-structure.service.ts`
   - `src/renderer/src/lib/db/services/payroll-history.service.ts`

3. **Leave Request Services**
   - `src/renderer/src/lib/db/services/leave-request.service.ts`

4. **Settings Services**
   - `src/renderer/src/lib/db/settings-service.ts`

5. **Other Services**
   - `src/renderer/src/lib/db/db-service.ts`
   - `src/renderer/src/lib/db/employee-service.ts`
   - `src/renderer/src/lib/db/services/service-factory.ts`

### 📝 Migration Pattern

For each service file, replace IndexedDB calls with IPC calls:

**Before:**
```typescript
import { sqliteOperations } from './indexeddb-sqlite-service'

export const employeeService = {
  async create(employee) {
    return sqliteOperations.create('employees', employee)
  }
}
```

**After:**
```typescript
export const employeeService = {
  async create(employee) {
    const result = await window.api.db.employees.create(employee)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create employee')
    }
    return result.data
  }
}
```

### 🔧 Data Migration Tool

Create a migration utility to transfer existing IndexedDB data to SQLite:

```typescript
// src/renderer/src/lib/db/migrate-to-sqlite.ts
export async function migrateIndexedDBToSQLite() {
  // 1. Read all data from IndexedDB
  // 2. Transform data if needed
  // 3. Insert into SQLite via IPC
  // 4. Verify migration
  // 5. Clear IndexedDB (optional)
}
```

### 🧪 Testing Checklist

- [ ] Test user registration with new bcrypt hashing
- [ ] Test user login with bcrypt verification
- [ ] Test password reset functionality
- [ ] Test all CRUD operations for each table
- [ ] Test foreign key constraints
- [ ] Test data persistence across app restarts
- [ ] Test concurrent operations
- [ ] Test error handling
- [ ] Verify database file location
- [ ] Test database backup/restore

## Database File Location

The SQLite database is stored at:
- **Windows**: `C:\Users\{username}\AppData\Roaming\payflow\payroll.db`
- **macOS**: `~/Library/Application Support/payflow/payroll.db`
- **Linux**: `~/.config/payflow/payroll.db`

## Admin Password Reset (Direct Database Access)

Since passwords are now bcrypt hashed, you cannot simply edit them in the database. To reset a password:

### Option 1: Using Node.js Script
```javascript
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const db = new Database('path/to/payroll.db');
const newPassword = 'newSecurePassword123';
const hash = bcrypt.hashSync(newPassword, 10);

db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE username = ?')
  .run(hash, new Date().toISOString(), 'admin');

console.log('Password updated successfully');
db.close();
```

### Option 2: Using SQLite Browser
1. Open `payroll.db` with DB Browser for SQLite
2. Generate bcrypt hash using online tool or Node.js
3. Update the password field with the hash
4. Save changes

## Performance Considerations

- **Indexes**: Added on frequently queried columns (department, status, employee_id, date)
- **WAL Mode**: Enabled for better concurrent access
- **Connection**: Single persistent connection in main process
- **IPC Overhead**: Minimal, async operations

## Security Best Practices

1. **Never log passwords** - Even in development
2. **Use HTTPS** - If implementing remote features
3. **Validate input** - Always validate before database operations
4. **Parameterized queries** - Already implemented to prevent SQL injection
5. **Regular backups** - Implement database backup strategy
6. **Access control** - Verify user roles before operations

## Troubleshooting

### Database locked error
- Ensure only one app instance is running
- Check if database file has proper permissions

### Migration fails
- Check console logs for specific errors
- Verify database file exists and is writable
- Ensure bcrypt is properly installed

### Authentication not working
- Clear localStorage and try again
- Check if database has users (use `window.api.db.users.getAll()`)
- Verify password is being hashed (check database directly)

## Files Modified

1. `package.json` - Added bcrypt dependencies
2. `src/main/services/database.service.ts` - New file (SQLite service)
3. `src/main/index.ts` - Added IPC handlers and database initialization
4. `src/preload/index.ts` - Added database API exposure
5. `src/preload/index.d.ts` - Added TypeScript definitions
6. `src/renderer/src/lib/auth-service.ts` - Migrated to SQLite IPC

## Summary

The foundation for SQLite migration with bcrypt password hashing is complete. The authentication system is now using the new secure backend. The remaining work involves migrating other service files to use the IPC API instead of IndexedDB.

**Key Achievement**: Passwords are now securely hashed with bcrypt and stored in a persistent SQLite database instead of plain text in browser storage.
