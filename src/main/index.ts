import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { emailService } from './services/email.service'
import type { EmailConfig, EmailPayslipData } from './services/email.service'
import { pdfGeneratorService } from './services/pdf-generator.service'
import type { PayslipPDFData } from './services/pdf-generator.service'
import {
  initializeDatabase,
  closeDatabase,
  userService,
  employeeService,
  payrollStructureService,
  allowanceService,
  deductionService,
  payrollHistoryService,
  settingsService,
  leaveRequestService,
  failedPayslipService
} from './services/database.service'
import type {
  User,
  Employee,
  PayrollStructure,
  Allowance,
  Deduction,
  PayrollHistory,
  Setting,
  LeaveRequest
} from './services/database.service'

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
  // Initialize SQLite database
  try {
    initializeDatabase()
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }

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

  // Database IPC handlers - Users
  ipcMain.handle('db:users:create', async (_, user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await userService.create(user)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:getById', async (_, id: string) => {
    try {
      const result = userService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:getByUsername', async (_, username: string) => {
    try {
      const result = userService.getByUsername(username)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:getByEmail', async (_, email: string) => {
    try {
      const result = userService.getByEmail(email)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:getByUsernameOrEmail', async (_, usernameOrEmail: string) => {
    try {
      const result = userService.getByUsernameOrEmail(usernameOrEmail)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:update', async (_, id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>) => {
    try {
      const result = await userService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:delete', async (_, id: string) => {
    try {
      const result = userService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:getAll', async () => {
    try {
      const result = userService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:users:validateCredentials', async (_, usernameOrEmail: string, password: string) => {
    try {
      const result = await userService.validateCredentials(usernameOrEmail, password)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Employees
  ipcMain.handle('db:employees:create', async (_, employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = employeeService.create(employee)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:employees:getById', async (_, id: string) => {
    try {
      const result = employeeService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:employees:getAll', async () => {
    try {
      const result = employeeService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:employees:update', async (_, id: string, updates: Partial<Omit<Employee, 'id' | 'created_at'>>) => {
    try {
      const result = employeeService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:employees:delete', async (_, id: string) => {
    try {
      const result = employeeService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:employees:find', async (_, conditions: Partial<Employee>) => {
    try {
      const result = employeeService.find(conditions)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Payroll Structures
  ipcMain.handle('db:payrollStructures:create', async (_, structure: Omit<PayrollStructure, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = payrollStructureService.create(structure)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollStructures:getById', async (_, id: string) => {
    try {
      const result = payrollStructureService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollStructures:getAll', async () => {
    try {
      const result = payrollStructureService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollStructures:update', async (_, id: string, updates: Partial<Omit<PayrollStructure, 'id' | 'created_at'>>) => {
    try {
      const result = payrollStructureService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollStructures:delete', async (_, id: string) => {
    try {
      const result = payrollStructureService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Allowances
  ipcMain.handle('db:allowances:create', async (_, allowance: Omit<Allowance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = allowanceService.create(allowance)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:allowances:getById', async (_, id: string) => {
    try {
      const result = allowanceService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:allowances:getByStructureId', async (_, structureId: string) => {
    try {
      const result = allowanceService.getByStructureId(structureId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:allowances:getAll', async () => {
    try {
      const result = allowanceService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:allowances:update', async (_, id: string, updates: Partial<Omit<Allowance, 'id' | 'created_at'>>) => {
    try {
      const result = allowanceService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:allowances:delete', async (_, id: string) => {
    try {
      const result = allowanceService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Deductions
  ipcMain.handle('db:deductions:create', async (_, deduction: Omit<Deduction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = deductionService.create(deduction)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deductions:getById', async (_, id: string) => {
    try {
      const result = deductionService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deductions:getByStructureId', async (_, structureId: string) => {
    try {
      const result = deductionService.getByStructureId(structureId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deductions:getAll', async () => {
    try {
      const result = deductionService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deductions:update', async (_, id: string, updates: Partial<Omit<Deduction, 'id' | 'created_at'>>) => {
    try {
      const result = deductionService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:deductions:delete', async (_, id: string) => {
    try {
      const result = deductionService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Payroll History
  ipcMain.handle('db:payrollHistory:create', async (_, history: Omit<PayrollHistory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = payrollHistoryService.create(history)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollHistory:getById', async (_, id: string) => {
    try {
      const result = payrollHistoryService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollHistory:getByEmployeeId', async (_, employeeId: string) => {
    try {
      const result = payrollHistoryService.getByEmployeeId(employeeId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollHistory:getAll', async () => {
    try {
      const result = payrollHistoryService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollHistory:update', async (_, id: string, updates: Partial<Omit<PayrollHistory, 'id' | 'created_at'>>) => {
    try {
      const result = payrollHistoryService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:payrollHistory:delete', async (_, id: string) => {
    try {
      const result = payrollHistoryService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Settings
  ipcMain.handle('db:settings:create', async (_, setting: Omit<Setting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = settingsService.create(setting)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:settings:getById', async (_, id: string) => {
    try {
      const result = settingsService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:settings:getByKey', async (_, key: string) => {
    try {
      const result = settingsService.getByKey(key)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:settings:getAll', async () => {
    try {
      const result = settingsService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:settings:update', async (_, id: string, updates: Partial<Omit<Setting, 'id' | 'created_at'>>) => {
    try {
      const result = settingsService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:settings:updateByKey', async (_, key: string, value: string) => {
    try {
      const result = settingsService.updateByKey(key, value)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:settings:delete', async (_, id: string) => {
    try {
      const result = settingsService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Database IPC handlers - Leave Requests
  ipcMain.handle('db:leaveRequests:create', async (_, leave: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = leaveRequestService.create(leave)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:leaveRequests:getById', async (_, id: string) => {
    try {
      const result = leaveRequestService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:leaveRequests:getByEmployeeId', async (_, employeeId: string) => {
    try {
      const result = leaveRequestService.getByEmployeeId(employeeId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:leaveRequests:getAll', async () => {
    try {
      const result = leaveRequestService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:leaveRequests:update', async (_, id: string, updates: Partial<Omit<LeaveRequest, 'id' | 'created_at'>>) => {
    try {
      const result = leaveRequestService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:leaveRequests:delete', async (_, id: string) => {
    try {
      const result = leaveRequestService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:leaveRequests:find', async (_, conditions: Partial<LeaveRequest>) => {
    try {
      const result = leaveRequestService.find(conditions)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Failed Payslips IPC Handlers
  ipcMain.handle('db:failedPayslips:create', async (_, failedPayslip) => {
    try {
      const result = failedPayslipService.create(failedPayslip)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:getById', async (_, id: string) => {
    try {
      const result = failedPayslipService.getById(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:getByEmployeeId', async (_, employeeId: string) => {
    try {
      const result = failedPayslipService.getByEmployeeId(employeeId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:getByPayrollRecordId', async (_, payrollRecordId: string) => {
    try {
      const result = failedPayslipService.getByPayrollRecordId(payrollRecordId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:getAll', async () => {
    try {
      const result = failedPayslipService.getAll()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:getPending', async () => {
    try {
      const result = failedPayslipService.getPending()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:update', async (_, id: string, updates) => {
    try {
      const result = failedPayslipService.update(id, updates)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:incrementRetryCount', async (_, id: string) => {
    try {
      const result = failedPayslipService.incrementRetryCount(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:markAsResolved', async (_, id: string) => {
    try {
      const result = failedPayslipService.markAsResolved(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:delete', async (_, id: string) => {
    try {
      const result = failedPayslipService.delete(id)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:deleteByPayrollRecordId', async (_, payrollRecordId: string) => {
    try {
      const result = failedPayslipService.deleteByPayrollRecordId(payrollRecordId)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:failedPayslips:find', async (_, conditions) => {
    try {
      const result = failedPayslipService.find(conditions)
      return { success: true, data: result }
    } catch (error: any) {
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
    closeDatabase()
    app.quit()
  }
})

// Close database when app is quitting
app.on('before-quit', () => {
  closeDatabase()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
