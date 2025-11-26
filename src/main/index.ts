import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { emailService } from './services/email.service'
import type { EmailConfig, EmailPayslipData } from './services/email.service'
import { pdfGeneratorService } from './services/pdf-generator.service'
import type { PayslipPDFData } from './services/pdf-generator.service'
import { databaseService } from './services/database.service'

function createWindow(): void {
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
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

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

  ipcMain.handle('email:sendBulkPayslips', async (_, payslips: EmailPayslipData[]) => {
    console.log('\n========================================')
    console.log('📧 SENDING BULK PAYSLIP EMAILS')
    console.log(`Total recipients: ${payslips.length}`)
    console.log('========================================')
    try {
      const result = await emailService.sendBulkPayslips(payslips)
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

  // Database IPC handlers
  ipcMain.handle('db:get', (_, key: string) => {
    try {
      return { success: true, data: databaseService.get(key) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:set', (_, key: string, value: string) => {
    try {
      databaseService.set(key, value)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:delete', (_, key: string) => {
    try {
      databaseService.delete(key)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:getKeys', (_, prefix?: string) => {
    try {
      return { success: true, data: databaseService.getKeys(prefix) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:clear', () => {
    try {
      databaseService.clear()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:query', (_, sql: string, params?: any[]) => {
    try {
      return { success: true, data: databaseService.query(sql, params) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:getStats', () => {
    try {
      return { success: true, data: databaseService.getStats() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Initialize database
  databaseService.initialize()

  createWindow()

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
    databaseService.close()
    app.quit()
  }
})

// Close database before quitting
app.on('before-quit', () => {
  databaseService.close()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
