# Email Feature Troubleshooting

## Error: "Cannot read properties of undefined (reading 'configure')"

### Cause

This error occurs when the email API is not available in the renderer process. This happens because:

1. The preload script changes haven't been loaded yet
2. The Electron app is using an old version of the preload script

### Solution: Restart the Application

**IMPORTANT:** After adding the email functionality, you MUST restart the Electron application completely.

#### How to Restart:

1. **Stop the development server:**
   - Press `Ctrl+C` in the terminal where the app is running
   - Or close the Electron window

2. **Start the application again:**

   ```bash
   npm run dev
   ```

   or

   ```bash
   npm start
   ```

3. **Verify the fix:**
   - Navigate to Settings → Email tab
   - The email configuration form should now work without errors

### Why This Happens

Electron applications have three main processes:

- **Main Process**: Runs Node.js code (handles email sending)
- **Preload Script**: Bridges main and renderer processes (exposes email API)
- **Renderer Process**: Runs the React UI (uses email API)

When you update the preload script (`src/preload/index.ts`), the changes are only applied when the Electron app starts. Hot Module Replacement (HMR) doesn't reload the preload script.

### Changes Made to Preload Script

The following was added to `src/preload/index.ts`:

```typescript
const api = {
  email: {
    configure: (config: EmailConfig) => ipcRenderer.invoke('email:configure', config),
    isConfigured: () => ipcRenderer.invoke('email:isConfigured'),
    getConfig: () => ipcRenderer.invoke('email:getConfig'),
    sendPayslip: (data: EmailPayslipData) => ipcRenderer.invoke('email:sendPayslip', data),
    sendBulkPayslips: (payslips: EmailPayslipData[]) =>
      ipcRenderer.invoke('email:sendBulkPayslips', payslips),
    sendTest: (testEmail: string) => ipcRenderer.invoke('email:sendTest', testEmail)
  }
}
```

### Verification Steps

After restarting, verify the email API is available:

1. Open the application
2. Open Developer Tools (F12 or Ctrl+Shift+I)
3. In the Console, type:
   ```javascript
   window.api.email
   ```
4. You should see an object with email methods:
   ```javascript
   {
     configure: ƒ,
     isConfigured: ƒ,
     getConfig: ƒ,
     sendPayslip: ƒ,
     sendBulkPayslips: ƒ,
     sendTest: ƒ
   }
   ```

If you see `undefined`, the preload script hasn't loaded correctly.

### Additional Troubleshooting

#### Clear Electron Cache (if restart doesn't work)

1. Close the application
2. Delete the Electron cache folder:
   - **Windows**: `%APPDATA%\payroll` or `%LOCALAPPDATA%\payroll`
   - **macOS**: `~/Library/Application Support/payroll`
   - **Linux**: `~/.config/payroll`
3. Restart the application

#### Rebuild the Application

If the issue persists:

```bash
# Stop the app
# Clean build
npm run build

# Start again
npm run dev
```

#### Check for TypeScript Errors

Make sure there are no TypeScript compilation errors:

```bash
npm run typecheck
```

### Error Message Improvements

The email service now includes a helpful error message:

```
Email API is not available. Please restart the application to load the updated preload script.
```

This will appear in the UI as a toast notification if you try to use email features before restarting.

## Other Common Issues

### "Email Not Configured" Error

**Cause:** Email SMTP settings haven't been configured yet.

**Solution:**

1. Go to Settings → Email tab
2. Fill in SMTP configuration
3. Click "Save Configuration"

### "Authentication Failed" Error

**Cause:** Incorrect SMTP credentials or server settings.

**Solution:**

1. Verify SMTP host and port are correct
2. Check username and password
3. For Gmail, use an App Password (not regular password)
4. Test with "Send Test Email" button

### "Connection Timeout" Error

**Cause:** Cannot connect to SMTP server.

**Solution:**

1. Check internet connection
2. Verify firewall isn't blocking SMTP ports
3. Try alternative port (587 vs 465)
4. Check with IT if using corporate network

## Need More Help?

1. Check the browser console (F12) for detailed error messages
2. Check the main process logs in the terminal
3. Review `EMAIL_SETUP.md` for configuration instructions
4. Review `SETTINGS_USAGE_GUIDE.md` for step-by-step setup
