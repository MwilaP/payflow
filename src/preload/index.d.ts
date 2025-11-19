import { ElectronAPI } from '@electron-toolkit/preload'
import type { EmailConfig, EmailPayslipData } from './index'

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

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      email: EmailAPI
    }
  }
}
