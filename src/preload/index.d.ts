import { ElectronAPI } from '@electron-toolkit/preload'
import type { EmailConfig, EmailPayslipData, PayslipPDFData } from './index'

interface EmailAPI {
  configure: (config: EmailConfig) => Promise<{ success: boolean; error?: string }>
  isConfigured: () => Promise<boolean>
  getConfig: () => Promise<Omit<EmailConfig, 'auth'> | null>
  sendPayslip: (data: EmailPayslipData) => Promise<{ success: boolean; error?: string }>
  sendBulkPayslips: (payslips: EmailPayslipData[]) => Promise<{
    success: boolean
    error?: string
    data?: {
      success: boolean
      sent: number
      failed: number
      errors: Array<{ email: string; error: string }>
    }
  }>
  sendTest: (testEmail: string) => Promise<{ success: boolean; error?: string }>
}

interface PDFAPI {
  generatePayslip: (
    data: PayslipPDFData
  ) => Promise<{ success: boolean; data?: string; error?: string }>
  generateBulkPayslips: (
    payslipsData: PayslipPDFData[]
  ) => Promise<{ success: boolean; data?: Record<string, string>; error?: string }>
}

interface DatabaseAPI {
  get: (key: string) => Promise<{ success: boolean; data?: string | null; error?: string }>
  set: (key: string, value: string) => Promise<{ success: boolean; error?: string }>
  delete: (key: string) => Promise<{ success: boolean; error?: string }>
  getKeys: (prefix?: string) => Promise<{ success: boolean; data?: string[]; error?: string }>
  clear: () => Promise<{ success: boolean; error?: string }>
  query: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>
  getStats: () => Promise<{
    success: boolean
    data?: {
      path: string
      size: number
      kvStoreCount: number
      employeesCount: number
      payrollRecordsCount: number
      leaveRequestsCount: number
      payrollStructuresCount: number
    }
    error?: string
  }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      email: EmailAPI
      pdf: PDFAPI
      db: DatabaseAPI
    }
  }
}
