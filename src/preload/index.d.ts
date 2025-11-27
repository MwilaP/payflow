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

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      email: EmailAPI
      pdf: PDFAPI
    }
  }
}
