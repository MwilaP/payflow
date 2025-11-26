# SMTP Configuration Persistence Guide

## Overview

The payroll application now includes a robust SMTP configuration persistence system that automatically saves and restores email settings across application restarts. This ensures users don't need to reconfigure their email settings every time they launch the application.

## Architecture

### Main Process (Electron)

**Location**: `src/main/services/settings.service.ts`

The main process uses `electron-store` to persist SMTP configuration securely:

- **Storage**: Configuration is stored in the user's application data directory
- **Encryption**: Sensitive data (including passwords) is encrypted using a secure encryption key
- **Format**: JSON-based storage with schema validation

### Renderer Process (Browser)

**Location**: `src/renderer/src/lib/db/settings-service.ts`

The renderer process uses IndexedDB to store settings locally:

- **Storage**: Browser-based IndexedDB for offline-first functionality
- **Schema**: Settings table with key-value pairs
- **Type Safety**: Full TypeScript support with proper typing

## How It Works

### 1. Configuration Save Flow

```
User enters SMTP settings
       ↓
Email Settings UI
       ↓
IPC: email:configure
       ↓
Email Service (Main Process)
       ↓
Verify SMTP Connection
       ↓
Save to electron-store
       ↓
Configuration Persisted ✓
```

### 2. Configuration Load Flow

```
Application Starts
       ↓
app.whenReady()
       ↓
emailService.loadFromStorage()
       ↓
Load from electron-store
       ↓
Initialize Email Service
       ↓
Configuration Restored ✓
```

## Key Features

### ✅ Automatic Persistence

- SMTP configuration is automatically saved when configured
- No manual save action required from users
- Transparent background operation

### ✅ Secure Storage

- Passwords are encrypted at rest
- Uses industry-standard encryption (electron-store)
- Secure key management

### ✅ Automatic Restoration

- Configuration loads automatically on app startup
- Email service is ready immediately after launch
- No user intervention needed

### ✅ Error Handling

- Graceful degradation if storage fails
- Clear error messages in console
- Application continues to function

## API Reference

### Main Process Settings Service

#### `saveSMTPConfig(config: EmailConfig): void`

Saves SMTP configuration to persistent storage.

**Parameters:**
- `config`: EmailConfig object containing SMTP settings

**Example:**
```typescript
import { saveSMTPConfig } from './settings.service'

saveSMTPConfig({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'user@example.com',
    pass: 'app-password'
  },
  from: 'user@example.com'
})
```

#### `loadSMTPConfig(): EmailConfig | null`

Loads SMTP configuration from persistent storage.

**Returns:**
- `EmailConfig` if configuration exists
- `null` if no configuration found

**Example:**
```typescript
import { loadSMTPConfig } from './settings.service'

const config = loadSMTPConfig()
if (config) {
  console.log('Configuration loaded:', config.host)
}
```

#### `deleteSMTPConfig(): void`

Deletes SMTP configuration from storage.

**Example:**
```typescript
import { deleteSMTPConfig } from './settings.service'

deleteSMTPConfig()
console.log('Configuration deleted')
```

#### `hasSMTPConfig(): boolean`

Checks if SMTP configuration exists in storage.

**Returns:**
- `true` if configuration exists
- `false` otherwise

**Example:**
```typescript
import { hasSMTPConfig } from './settings.service'

if (hasSMTPConfig()) {
  console.log('Configuration exists')
}
```

### Email Service Methods

#### `emailService.loadFromStorage(): Promise<boolean>`

Loads and initializes email service from stored configuration.

**Returns:**
- `Promise<boolean>` - `true` if configuration loaded successfully

**Example:**
```typescript
const loaded = await emailService.loadFromStorage()
if (loaded) {
  console.log('Email service ready')
}
```

#### `emailService.initialize(config: EmailConfig, persist?: boolean): Promise<void>`

Initializes email service with configuration.

**Parameters:**
- `config`: EmailConfig object
- `persist`: Whether to save configuration (default: `true`)

**Example:**
```typescript
await emailService.initialize(config, true) // Save to storage
await emailService.initialize(config, false) // Don't save
```

## Storage Locations

### Windows
```
C:\Users\<username>\AppData\Roaming\payroll\payroll-settings.json
```

### macOS
```
~/Library/Application Support/payroll/payroll-settings.json
```

### Linux
```
~/.config/payroll/payroll-settings.json
```

## Configuration Schema

```typescript
interface EmailConfig {
  host: string          // SMTP server hostname
  port: number          // SMTP server port (587, 465, etc.)
  secure: boolean       // Use SSL/TLS
  auth: {
    user: string        // SMTP username/email
    pass: string        // SMTP password (encrypted in storage)
  }
  from: string          // Default sender email address
}
```

## Security Considerations

### Encryption

- All sensitive data is encrypted using `electron-store`'s built-in encryption
- Encryption key is embedded in the application
- For production, consider using OS keychain integration

### Best Practices

1. **Never log passwords**: The system automatically excludes passwords from logs
2. **Use app passwords**: For Gmail and similar services, use app-specific passwords
3. **Secure transmission**: SMTP connections use TLS/SSL when configured
4. **Local storage only**: Configuration never leaves the user's machine

## Troubleshooting

### Configuration Not Loading

**Symptom**: Email settings are lost after restart

**Solutions:**
1. Check console for error messages
2. Verify storage file exists at the location above
3. Check file permissions
4. Try reconfiguring email settings

### Storage Errors

**Symptom**: "Failed to save SMTP configuration" error

**Solutions:**
1. Check disk space availability
2. Verify write permissions to app data directory
3. Close other instances of the application
4. Clear corrupted storage file and reconfigure

### Encryption Issues

**Symptom**: "Failed to load SMTP configuration" error

**Solutions:**
1. Storage file may be corrupted
2. Delete the settings file and reconfigure
3. Check application logs for detailed error messages

## Testing

### Manual Testing

1. **Configure SMTP**:
   - Open Email Settings
   - Enter SMTP configuration
   - Click "Save Configuration"
   - Verify success message

2. **Test Persistence**:
   - Restart the application
   - Check console logs for "SMTP configuration loaded"
   - Verify email service is configured
   - Send a test email

3. **Test Updates**:
   - Change SMTP settings
   - Save configuration
   - Restart application
   - Verify new settings are loaded

### Automated Testing

```typescript
// Test save and load
describe('SMTP Persistence', () => {
  it('should save and load configuration', async () => {
    const config = {
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: { user: 'test@test.com', pass: 'password' },
      from: 'test@test.com'
    }
    
    saveSMTPConfig(config)
    const loaded = loadSMTPConfig()
    
    expect(loaded).toEqual(config)
  })
})
```

## Migration Guide

### From Non-Persistent to Persistent

If you're upgrading from a version without persistence:

1. Users will need to configure email settings once
2. Settings will be automatically saved
3. Future restarts will load saved configuration
4. No data migration needed

### Clearing Old Configuration

To reset email configuration:

```typescript
import { deleteSMTPConfig } from './settings.service'

// Delete stored configuration
deleteSMTPConfig()

// Restart application
// User will need to reconfigure email settings
```

## Future Enhancements

### Planned Features

1. **Multiple SMTP Profiles**: Support for multiple email configurations
2. **Cloud Sync**: Optional cloud backup of settings
3. **Import/Export**: Export settings for backup or sharing
4. **OS Keychain Integration**: Use system keychain for password storage
5. **Configuration Validation**: Pre-startup validation of stored config

### Contributing

To add new settings:

1. Update `SettingsSchema` in `settings.service.ts`
2. Add getter/setter methods
3. Update documentation
4. Add tests

## Support

For issues or questions:

1. Check console logs for detailed error messages
2. Review this documentation
3. Check the troubleshooting section
4. Contact support with log files

## Changelog

### Version 1.0.0
- Initial implementation of SMTP persistence
- Automatic save/load on configure/startup
- Encrypted storage using electron-store
- Full error handling and logging
