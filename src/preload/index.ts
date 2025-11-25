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
