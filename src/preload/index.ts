import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

export interface EmailPayslipData {
  employeeName: string
  employeeEmail: string
  period: string
  netSalary: number
  payslipPdfBase64?: string
}

export interface PayslipPDFData {
  companyName: string
  companyAddress?: string
  employeeName: string
  employeeNumber: string
  department: string
  designation: string
  nrc: string
  tpin: string
  accountNumber: string
  bankName: string
  period: string
  paymentDate: string
  basicSalary: number
  allowances: Array<{ name: string; amount: number }>
  totalAllowances: number
  grossPay: number
  deductions: Array<{ name: string; amount: number }>
  totalDeductions: number
  netPay: number
}

// Custom APIs for renderer
const api = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  },
  email: {
    configure: (config: EmailConfig) => ipcRenderer.invoke('email:configure', config),
    isConfigured: () => ipcRenderer.invoke('email:isConfigured'),
    getConfig: () => ipcRenderer.invoke('email:getConfig'),
    sendPayslip: (data: EmailPayslipData) => ipcRenderer.invoke('email:sendPayslip', data),
    sendBulkPayslips: (payslips: EmailPayslipData[]) =>
      ipcRenderer.invoke('email:sendBulkPayslips', payslips),
    sendTest: (testEmail: string) => ipcRenderer.invoke('email:sendTest', testEmail)
  },
  pdf: {
    generatePayslip: (data: PayslipPDFData) => ipcRenderer.invoke('pdf:generatePayslip', data),
    generateBulkPayslips: (payslipsData: PayslipPDFData[]) =>
      ipcRenderer.invoke('pdf:generateBulkPayslips', payslipsData)
  },
  db: {
    users: {
      create: (user: any) => ipcRenderer.invoke('db:users:create', user),
      getById: (id: string) => ipcRenderer.invoke('db:users:getById', id),
      getByUsername: (username: string) => ipcRenderer.invoke('db:users:getByUsername', username),
      getByEmail: (email: string) => ipcRenderer.invoke('db:users:getByEmail', email),
      getByUsernameOrEmail: (usernameOrEmail: string) => ipcRenderer.invoke('db:users:getByUsernameOrEmail', usernameOrEmail),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:users:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:users:delete', id),
      getAll: () => ipcRenderer.invoke('db:users:getAll'),
      validateCredentials: (usernameOrEmail: string, password: string) => 
        ipcRenderer.invoke('db:users:validateCredentials', usernameOrEmail, password)
    },
    employees: {
      create: (employee: any) => ipcRenderer.invoke('db:employees:create', employee),
      getById: (id: string) => ipcRenderer.invoke('db:employees:getById', id),
      getAll: () => ipcRenderer.invoke('db:employees:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:employees:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:employees:delete', id),
      find: (conditions: any) => ipcRenderer.invoke('db:employees:find', conditions)
    },
    payrollStructures: {
      create: (structure: any) => ipcRenderer.invoke('db:payrollStructures:create', structure),
      getById: (id: string) => ipcRenderer.invoke('db:payrollStructures:getById', id),
      getAll: () => ipcRenderer.invoke('db:payrollStructures:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:payrollStructures:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:payrollStructures:delete', id)
    },
    allowances: {
      create: (allowance: any) => ipcRenderer.invoke('db:allowances:create', allowance),
      getById: (id: string) => ipcRenderer.invoke('db:allowances:getById', id),
      getByStructureId: (structureId: string) => ipcRenderer.invoke('db:allowances:getByStructureId', structureId),
      getAll: () => ipcRenderer.invoke('db:allowances:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:allowances:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:allowances:delete', id)
    },
    deductions: {
      create: (deduction: any) => ipcRenderer.invoke('db:deductions:create', deduction),
      getById: (id: string) => ipcRenderer.invoke('db:deductions:getById', id),
      getByStructureId: (structureId: string) => ipcRenderer.invoke('db:deductions:getByStructureId', structureId),
      getAll: () => ipcRenderer.invoke('db:deductions:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:deductions:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:deductions:delete', id)
    },
    payrollHistory: {
      create: (history: any) => ipcRenderer.invoke('db:payrollHistory:create', history),
      getById: (id: string) => ipcRenderer.invoke('db:payrollHistory:getById', id),
      getByEmployeeId: (employeeId: string) => ipcRenderer.invoke('db:payrollHistory:getByEmployeeId', employeeId),
      getAll: () => ipcRenderer.invoke('db:payrollHistory:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:payrollHistory:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:payrollHistory:delete', id)
    },
    settings: {
      create: (setting: any) => ipcRenderer.invoke('db:settings:create', setting),
      getById: (id: string) => ipcRenderer.invoke('db:settings:getById', id),
      getByKey: (key: string) => ipcRenderer.invoke('db:settings:getByKey', key),
      getAll: () => ipcRenderer.invoke('db:settings:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:settings:update', id, updates),
      updateByKey: (key: string, value: string) => ipcRenderer.invoke('db:settings:updateByKey', key, value),
      delete: (id: string) => ipcRenderer.invoke('db:settings:delete', id)
    },
    leaveRequests: {
      create: (leave: any) => ipcRenderer.invoke('db:leaveRequests:create', leave),
      getById: (id: string) => ipcRenderer.invoke('db:leaveRequests:getById', id),
      getByEmployeeId: (employeeId: string) => ipcRenderer.invoke('db:leaveRequests:getByEmployeeId', employeeId),
      getAll: () => ipcRenderer.invoke('db:leaveRequests:getAll'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:leaveRequests:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:leaveRequests:delete', id),
      find: (conditions: any) => ipcRenderer.invoke('db:leaveRequests:find', conditions)
    },
    failedPayslips: {
      create: (failedPayslip: any) => ipcRenderer.invoke('db:failedPayslips:create', failedPayslip),
      getById: (id: string) => ipcRenderer.invoke('db:failedPayslips:getById', id),
      getByEmployeeId: (employeeId: string) => ipcRenderer.invoke('db:failedPayslips:getByEmployeeId', employeeId),
      getByPayrollRecordId: (payrollRecordId: string) => ipcRenderer.invoke('db:failedPayslips:getByPayrollRecordId', payrollRecordId),
      getAll: () => ipcRenderer.invoke('db:failedPayslips:getAll'),
      getPending: () => ipcRenderer.invoke('db:failedPayslips:getPending'),
      update: (id: string, updates: any) => ipcRenderer.invoke('db:failedPayslips:update', id, updates),
      incrementRetryCount: (id: string) => ipcRenderer.invoke('db:failedPayslips:incrementRetryCount', id),
      markAsResolved: (id: string) => ipcRenderer.invoke('db:failedPayslips:markAsResolved', id),
      delete: (id: string) => ipcRenderer.invoke('db:failedPayslips:delete', id),
      deleteByPayrollRecordId: (payrollRecordId: string) => ipcRenderer.invoke('db:failedPayslips:deleteByPayrollRecordId', payrollRecordId),
      find: (conditions: any) => ipcRenderer.invoke('db:failedPayslips:find', conditions)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
