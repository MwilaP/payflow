# Print Payslips Feature Guide

## Overview
The payslip printing feature allows you to generate and print all employee payslips for a given payroll period in one action.

## How to Use

1. Navigate to **Payroll History** page
2. Click on a payroll record to view details
3. Click the **"Email Payslips"** dropdown button
4. Select **"Print All Payslips"** from the menu

## What Happens

1. System fetches all employee details
2. Generates PDF payslips for each employee
3. Opens a new window with all PDFs
4. Automatically triggers the print dialog
5. Each payslip prints on a separate page

## Electron Configuration

### Pop-up Windows Enabled
The main process (`src/main/index.ts`) is configured to allow blank windows for printing:

```typescript
mainWindow.webContents.setWindowOpenHandler((details) => {
  // Allow blank windows (for printing, etc.)
  if (details.url === 'about:blank' || details.url === '') {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 800,
        height: 600,
        webPreferences: {
          sandbox: false
        }
      }
    }
  }
  // Open external URLs in default browser
  shell.openExternal(details.url)
  return { action: 'deny' }
})
```

### Why This Works
- **Blank windows allowed**: `window.open('', '_blank')` is permitted
- **External URLs blocked**: Regular URLs still open in default browser
- **Security maintained**: Only internal print windows are allowed

## Features

✅ Bulk PDF generation for all employees
✅ Professional payslip format
✅ Automatic print dialog
✅ Page breaks between payslips
✅ Loading indicators and progress toasts
✅ Error handling

## Troubleshooting

### Print window doesn't open
- Restart the Electron app to apply the configuration changes
- Check console for errors

### PDFs not loading
- Ensure `pdfkit` dependency is installed: `pnpm add pdfkit @types/pdfkit`
- Check that employee data is complete (email, name, etc.)

### Print dialog doesn't appear
- The dialog appears after 1.5 seconds to allow PDFs to load
- Check browser console for errors

## Technical Details

**PDF Generation**: Uses PDFKit in the main process
**IPC Communication**: Renderer → Main process for PDF generation
**Window Management**: Electron's `setWindowOpenHandler` controls pop-ups
**Print Trigger**: JavaScript `window.print()` API
