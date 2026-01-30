import { ElectronAPI } from '@electron-toolkit/preload'
import type { EmailConfig, EmailPayslipData, PayslipPDFData } from './index'

interface EmailAPI {
  configure: (config: EmailConfig) => Promise<{ success: boolean; error?: string }>
  isConfigured: () => Promise<boolean>
  getConfig: () => Promise<Omit<EmailConfig, 'auth'> | null>
  sendPayslip: (data: EmailPayslipData) => Promise<{ success: boolean; error?: string }>
  sendBulkPayslips: (payslips: EmailPayslipData[], payrollRecordId?: string) => Promise<{
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
  users: {
    create: (user: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByUsername: (username: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByEmail: (email: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByUsernameOrEmail: (usernameOrEmail: string) => Promise<{ success: boolean; data?: any; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    validateCredentials: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>
  }
  employees: {
    create: (employee: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
    find: (conditions: any) => Promise<{ success: boolean; data?: any[]; error?: string }>
  }
  payrollStructures: {
    create: (structure: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
  }
  allowances: {
    create: (allowance: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByStructureId: (structureId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
  }
  deductions: {
    create: (deduction: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByStructureId: (structureId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
  }
  payrollHistory: {
    create: (history: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByEmployeeId: (employeeId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
  }
  settings: {
    create: (setting: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByKey: (key: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    updateByKey: (key: string, value: string) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
  }
  leaveRequests: {
    create: (leave: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByEmployeeId: (employeeId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
    find: (conditions: any) => Promise<{ success: boolean; data?: any[]; error?: string }>
  }
  failedPayslips: {
    create: (failedPayslip: any) => Promise<{ success: boolean; data?: any; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    getByEmployeeId: (employeeId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
    getByPayrollRecordId: (payrollRecordId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    getPending: () => Promise<{ success: boolean; data?: any[]; error?: string }>
    update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
    incrementRetryCount: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    markAsResolved: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>
    deleteByPayrollRecordId: (payrollRecordId: string) => Promise<{ success: boolean; data?: number; error?: string }>
    find: (conditions: any) => Promise<{ success: boolean; data?: any[]; error?: string }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      email: EmailAPI
      pdf: PDFAPI
      db: DatabaseAPI
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
    }
  }
}
