import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { emailService } from './services/email.service'
import type { EmailConfig, EmailPayslipData } from './services/email.service'
import { pdfGeneratorService } from './services/pdf-generator.service'
import type { PayslipPDFData } from './services/pdf-generator.service'

function createWindow(): void {
  console.log('🚀 Creating main window...')
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#000000',
      height: 40
    },
    backgroundColor: '#ffffff',
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    console.log('✓ Window ready to show')
    mainWindow.show()
  })

  // Log renderer process console messages in production
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levels = ['VERBOSE', 'INFO', 'WARNING', 'ERROR']
    console.log(`[Renderer ${levels[level]}] ${message} (${sourceId}:${line})`)
  })

  // Log renderer errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('✗ Renderer failed to load:', errorCode, errorDescription)
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('✗ Renderer process gone:', details)
  })

  mainWindow.webContents.on('unresponsive', () => {
    console.error('✗ Renderer process unresponsive')
  })

  mainWindow.webContents.on('responsive', () => {
    console.log('✓ Renderer process responsive again')
  })

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

  // Enable DevTools in production for debugging (Ctrl+Shift+I or F12)
  if (!is.dev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (
        (input.control && input.shift && input.key.toLowerCase() === 'i') ||
        input.key === 'F12'
      ) {
        mainWindow.webContents.toggleDevTools()
        event.preventDefault()
      }
    })
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('📡 Loading development URL:', process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    const htmlPath = join(__dirname, '../renderer/index.html')
    console.log('📄 Loading production HTML:', htmlPath)
    mainWindow.loadFile(htmlPath).catch((err) => {
      console.error('✗ Failed to load HTML file:', err)
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.payflow')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Window control IPC handlers
  ipcMain.on('window:minimize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) window.minimize()
  })

  ipcMain.on('window:maximize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  })

  ipcMain.on('window:close', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) window.close()
  })

  // Email IPC handlers
  ipcMain.handle('email:configure', async (_, config: EmailConfig) => {
    console.log('\n========================================')
    console.log('📧 EMAIL CONFIGURATION REQUEST')
    console.log('========================================')
    try {
      await emailService.initialize(config)
      console.log('========================================\n')
      return { success: true }
    } catch (error: any) {
      console.log('========================================\n')
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('email:isConfigured', () => {
    const configured = emailService.isConfigured()
    console.log(`📧 Email configured status: ${configured}`)
    return configured
  })

  ipcMain.handle('email:getConfig', () => {
    const config = emailService.getConfig()
    console.log('📧 Getting email configuration:', config ? 'Config found' : 'No config')
    return config
  })

  ipcMain.handle('email:sendPayslip', async (_, data: EmailPayslipData) => {
    console.log('\n========================================')
    console.log('📧 SENDING PAYSLIP EMAIL')
    console.log(`To: ${data.employeeEmail} (${data.employeeName})`)
    console.log('========================================')
    try {
      await emailService.sendPayslipEmail(data)
      console.log('========================================\n')
      return { success: true }
    } catch (error: any) {
      console.log('========================================\n')
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('email:sendBulkPayslips', async (_, payslips: EmailPayslipData[], payrollRecordId?: string) => {
    console.log('\n========================================')
    console.log('📧 SENDING BULK PAYSLIP EMAILS')
    console.log(`Total recipients: ${payslips.length}`)
    if (payrollRecordId) {
      console.log(`Payroll Record ID: ${payrollRecordId}`)
    }
    console.log('========================================')
    try {
      const result = await emailService.sendBulkPayslips(payslips, payrollRecordId)
      console.log('========================================\n')
      return { success: true, data: result }
    } catch (error: any) {
      console.log('========================================\n')
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('email:sendTest', async (_, testEmail: string) => {
    console.log('\n========================================')
    console.log('📧 SENDING TEST EMAIL')
    console.log(`Recipient: ${testEmail}`)
    console.log('========================================')
    try {
      await emailService.sendTestEmail(testEmail)
      console.log('========================================\n')
      return { success: true }
    } catch (error: any) {
      console.log('========================================\n')
      return { success: false, error: error.message }
    }
  })

  // PDF Generation IPC handlers
  ipcMain.handle('pdf:generatePayslip', async (_, data: PayslipPDFData) => {
    console.log('\n========================================')
    console.log('📄 GENERATING PAYSLIP PDF')
    console.log(`Employee: ${data.employeeName}`)
    console.log('========================================')
    try {
      const pdfBase64 = await pdfGeneratorService.generatePayslipPDF(data)
      console.log('========================================\n')
      return { success: true, data: pdfBase64 }
    } catch (error: any) {
      console.log('========================================\n')
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('pdf:generateBulkPayslips', async (_, payslipsData: PayslipPDFData[]) => {
    console.log('\n========================================')
    console.log('📄 GENERATING BULK PAYSLIP PDFs')
    console.log(`Total payslips: ${payslipsData.length}`)
    console.log('========================================')
    try {
      const pdfMap = await pdfGeneratorService.generateBulkPayslipPDFs(payslipsData)
      // Convert Map to object for IPC transfer
      const pdfObject = Object.fromEntries(pdfMap)
      console.log('========================================\n')
      return { success: true, data: pdfObject }
    } catch (error: any) {
      console.log('========================================\n')
      return { success: false, error: error.message }
    }
  })

  // Create window immediately - don't wait for SMTP
  createWindow()

  // Load SMTP configuration in background (non-blocking)
  // This won't delay the app startup
  emailService.loadFromStorage()
    .then((loaded) => {
      if (loaded) {
        console.log('✓ SMTP configuration loaded successfully')
      } else {
        console.log('ℹ No saved SMTP configuration found')
      }
    })
    .catch((error) => {
      console.error('✗ Failed to load SMTP configuration:', error)
    })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
