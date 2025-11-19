import type { Payslip } from './db/models/payslip.model'

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

export interface BulkEmailResult {
  success: boolean
  sent: number
  failed: number
  errors: Array<{ email: string; error: string }>
}

/**
 * Email service for renderer process
 * Communicates with main process via IPC
 */
class EmailService {
  /**
   * Check if email API is available
   */
  private checkApiAvailable(): void {
    if (!window.api?.email) {
      throw new Error(
        'Email API is not available. Please restart the application to load the updated preload script.'
      )
    }
  }

  /**
   * Configure email service with SMTP settings
   */
  async configure(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
    this.checkApiAvailable()
    return await window.api.email.configure(config)
  }

  /**
   * Check if email service is configured
   */
  async isConfigured(): Promise<boolean> {
    this.checkApiAvailable()
    return await window.api.email.isConfigured()
  }

  /**
   * Get current email configuration (without password)
   */
  async getConfig(): Promise<Omit<EmailConfig, 'auth'> | null> {
    this.checkApiAvailable()
    return await window.api.email.getConfig()
  }

  /**
   * Send a single payslip email
   */
  async sendPayslip(data: EmailPayslipData): Promise<{ success: boolean; error?: string }> {
    this.checkApiAvailable()
    return await window.api.email.sendPayslip(data)
  }

  /**
   * Send payslips to multiple employees
   */
  async sendBulkPayslips(payslips: EmailPayslipData[]): Promise<{
    success: boolean
    error?: string
    data?: BulkEmailResult
  }> {
    this.checkApiAvailable()
    return await window.api.email.sendBulkPayslips(payslips)
  }

  /**
   * Send a test email
   */
  async sendTestEmail(testEmail: string): Promise<{ success: boolean; error?: string }> {
    this.checkApiAvailable()
    return await window.api.email.sendTest(testEmail)
  }

  /**
   * Convert payslip to email data format
   */
  payslipToEmailData(payslip: Payslip, pdfBase64?: string): EmailPayslipData {
    return {
      employeeName: payslip.employee.name,
      employeeEmail: payslip.employee.email,
      period: payslip.period,
      netSalary: payslip.salary.netSalary,
      payslipPdfBase64: pdfBase64
    }
  }

  /**
   * Convert multiple payslips to email data format
   */
  payslipsToEmailData(payslips: Payslip[], pdfMap?: Map<string, string>): EmailPayslipData[] {
    return payslips.map((payslip) => ({
      employeeName: payslip.employee.name,
      employeeEmail: payslip.employee.email,
      period: payslip.period,
      netSalary: payslip.salary.netSalary,
      payslipPdfBase64: pdfMap?.get(payslip._id)
    }))
  }
}

// Export singleton instance
export const emailService = new EmailService()
