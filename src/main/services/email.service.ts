import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { saveSMTPConfig, loadSMTPConfig } from './settings.service'
import { failedPayslipService } from './database.service'

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
  employeeId?: string
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

export interface EmailResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Pure helper functions for error handling
const getInitErrorMessage = (error: any, config: EmailConfig): string => {
  const errorMap: Record<string, () => string> = {
    ENOTFOUND: () => `Cannot resolve SMTP host "${config.host}". Please check the hostname.`,
    EAI_AGAIN: () => `Cannot resolve SMTP host "${config.host}". Please check the hostname.`,
    ECONNREFUSED: () => `Connection refused to ${config.host}:${config.port}. Check host and port.`,
    ETIMEDOUT: () => `Connection timeout to ${config.host}:${config.port}. Check firewall/network.`,
    ESOCKET: () => `Connection timeout to ${config.host}:${config.port}. Check firewall/network.`
  }

  if (error.code && errorMap[error.code]) {
    return errorMap[error.code]()
  }

  if (error.responseCode === 535 || error.response?.includes('authentication')) {
    return 'Authentication failed. Check username and password.'
  }

  return `Email service initialization failed: ${error.message}`
}

const getTestEmailErrorMessage = (error: any): string => {
  const errorMap: Record<string, string> = {
    EAUTH: 'Authentication failed. Check your username and password.',
    ESOCKET: 'Connection timeout. Check your network and firewall settings.',
    ETIMEDOUT: 'Connection timeout. Check your network and firewall settings.'
  }

  if (error.code && errorMap[error.code]) {
    return errorMap[error.code]
  }

  if (error.responseCode === 535) {
    return 'Authentication failed. For Gmail, use an App Password instead of your regular password.'
  }

  return `Failed to send test email: ${error.message}`
}

const generateTestEmailHtml = (config: EmailConfig): string => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px; }
      .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; margin-top: 20px; border-radius: 5px; }
      .success { color: #10b981; font-weight: bold; }
      .info { background-color: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✓ Test Email Successful</h1>
      </div>
      <div class="content">
        <p class="success">Congratulations! Your email configuration is working correctly.</p>
        <p>This test email confirms that:</p>
        <ul>
          <li>SMTP connection is established</li>
          <li>Authentication is successful</li>
          <li>Email delivery is functioning</li>
        </ul>
        <div class="info">
          <strong>Configuration Details:</strong><br>
          SMTP Host: ${config.host}<br>
          Port: ${config.port}<br>
          Secure: ${config.secure ? 'Yes (SSL/TLS)' : 'No (STARTTLS)'}<br>
          From: ${config.from}
        </div>
        <p style="margin-top: 20px;">You can now send payslips to your employees!</p>
      </div>
    </div>
  </body>
  </html>
`

const generateTestEmailText = (config: EmailConfig): string =>
  `Test Email - Payroll System\n\nCongratulations! Your email configuration is working correctly.\n\nConfiguration:\nSMTP Host: ${config.host}\nPort: ${config.port}\nFrom: ${config.from}\n\nYou can now send payslips to your employees!`

class EmailService {
  private transporter: Transporter | null = null
  private config: EmailConfig | null = null

  /**
   * Load configuration from persistent storage on startup
   */
  async loadFromStorage(): Promise<boolean> {
    try {
      const savedConfig = loadSMTPConfig()
      if (savedConfig) {
        console.log('Loading SMTP configuration from storage...')
        // Load config without verification to avoid blocking startup
        await this.initialize(savedConfig, false, false) // Don't save, don't verify
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to load SMTP configuration from storage:', error)
      return false
    }
  }

  /**
   * Initialize email service with configuration
   * @param config - Email configuration
   * @param persist - Whether to persist the configuration (default: true)
   * @param verify - Whether to verify the connection (default: true)
   */
  async initialize(config: EmailConfig, persist = true, verify = true): Promise<void> {
    try {
      console.log('Initializing email service with config:', {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user,
        from: config.from
      })

      this.config = config
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass
        },
        // Add connection timeout and debug options
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        debug: true, // Enable debug output
        logger: true // Enable logger
      })

      // Verify connection only if requested (skip on startup to avoid blocking)
      if (verify) {
        console.log('Verifying SMTP connection...')
        await this.transporter.verify()
        console.log('✓ Email service initialized and verified successfully')
      } else {
        console.log('✓ Email service initialized (verification skipped)')
      }

      // Persist configuration if requested
      if (persist) {
        saveSMTPConfig(config)
      }
    } catch (error: any) {
      console.error('✗ Failed to initialize email service:', error)
      const errorMessage = getInitErrorMessage(error, config)
      throw new Error(errorMessage)
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null
  }

  /**
   * Get current configuration (without password)
   */
  getConfig(): Omit<EmailConfig, 'auth'> | null {
    if (!this.config) return null
    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      from: this.config.from
    }
  }

  /**
   * Send a single payslip email
   */
  async sendPayslipEmail(data: EmailPayslipData): Promise<void> {
    if (!this.transporter || !this.config) {
      throw new Error('Email service not configured. Please configure email settings first.')
    }

    try {
      const mailOptions: any = {
        from: this.config.from,
        to: data.employeeEmail,
        subject: `Payslip for ${data.period}`,
        html: this.generatePayslipEmailHtml(data),
        text: this.generatePayslipEmailText(data)
      }

      // Attach PDF if provided
      if (data.payslipPdfBase64) {
        mailOptions.attachments = [
          {
            filename: `Payslip_${data.period.replace(/\s+/g, '_')}.pdf`,
            content: data.payslipPdfBase64,
            encoding: 'base64'
          }
        ]
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Payslip email sent to ${data.employeeEmail}`)
    } catch (error) {
      console.error(`Failed to send email to ${data.employeeEmail}:`, error)
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Send payslips to multiple employees and update payroll record with email status
   */
  async sendBulkPayslips(payslips: EmailPayslipData[], payrollRecordId?: string): Promise<BulkEmailResult> {
    if (!this.transporter || !this.config) {
      throw new Error('Email service not configured. Please configure email settings first.')
    }

    const result: BulkEmailResult = {
      success: true,
      sent: 0,
      failed: 0,
      errors: []
    }

    for (const payslip of payslips) {
      try {
        await this.sendPayslipEmail(payslip)
        result.sent++

        // Update payroll record if ID is provided
        if (payrollRecordId && payslip.employeeId) {
          await this.updatePayrollItemEmailStatus(payrollRecordId, payslip.employeeId, 'sent')
        }
      } catch (error: any) {
        result.failed++
        const errorMessage = error.message || 'Unknown error'
        result.errors.push({
          email: payslip.employeeEmail,
          error: errorMessage
        })

        // Update payroll record with failed status if ID is provided
        if (payrollRecordId && payslip.employeeId) {
          await this.updatePayrollItemEmailStatus(payrollRecordId, payslip.employeeId, 'failed', errorMessage)
        }

        // Log to database for persistent tracking and retry
        if (payrollRecordId && payslip.employeeId) {
          try {
            await failedPayslipService.create({
              payroll_record_id: payrollRecordId,
              employee_id: payslip.employeeId,
              employee_name: payslip.employeeName,
              employee_email: payslip.employeeEmail,
              employee_number: (payslip as any).employeeNumber || '',
              period: payslip.period,
              net_salary: payslip.netSalary,
              error_message: errorMessage,
              retry_count: 0,
              payslip_data: JSON.stringify(payslip),
              status: 'pending'
            })
            console.log(`✓ Failed payslip logged to database for ${payslip.employeeName}`)
          } catch (dbError) {
            console.error('✗ Failed to log failed payslip to database:', dbError)
          }
        }
      }
    }

    result.success = result.failed === 0
    return result
  }

  /**
   * Update email status for a specific payroll item
   * Note: This is kept for future use but not currently used since we update locally in the renderer
   */
  private async updatePayrollItemEmailStatus(
    payrollRecordId: string,
    employeeId: string,
    status: 'sent' | 'failed',
    error?: string
  ): Promise<void> {
    console.log(`Email status update: ${payrollRecordId}, ${employeeId}, ${status}`)
    if (error) {
      console.log(`Email error: ${error}`)
    }
  }

  /**
   * Send a test email (refactored with functional programming)
   */
  async sendTestEmail(testEmail: string): Promise<void> {
    if (!this.transporter || !this.config) {
      throw new Error('Email service not configured')
    }

    try {
      console.log(`Sending test email to ${testEmail}...`)

      const mailOptions = {
        from: this.config.from,
        to: testEmail,
        subject: 'Test Email - Payroll System',
        html: generateTestEmailHtml(this.config),
        text: generateTestEmailText(this.config)
      }

      const info = await this.transporter.sendMail(mailOptions)

      console.log('✓ Test email sent successfully')
      console.log('Message ID:', info.messageId)
      console.log('Response:', info.response)
    } catch (error: any) {
      console.error('✗ Failed to send test email:', error)
      const errorMessage = getTestEmailErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Generate HTML email content for payslip
   */
  private generatePayslipEmailHtml(data: EmailPayslipData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .info-box {
            background-color: white;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #4F46E5;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Payslip Notification</h1>
        </div>
        <div class="content">
          <p>Dear ${data.employeeName},</p>
          <p>Your payslip for <strong>${data.period}</strong> is now available.</p>
          
          <div class="info-box">
            <p><strong>Period:</strong> ${data.period}</p>
            <p><strong>Net Salary:</strong> <span class="amount">K ${data.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
          </div>

          ${data.payslipPdfBase64 ? '<p>Please find your detailed payslip attached to this email.</p>' : '<p>Please contact HR for your detailed payslip.</p>'}
          
          <p>If you have any questions regarding your payslip, please contact the HR department.</p>
          
          <p>Best regards,<br>HR Department</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate plain text email content for payslip
   */
  private generatePayslipEmailText(data: EmailPayslipData): string {
    return `
Dear ${data.employeeName},

Your payslip for ${data.period} is now available.

Period: ${data.period}
Net Salary: K ${data.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

${data.payslipPdfBase64 ? 'Please find your detailed payslip attached to this email.' : 'Please contact HR for your detailed payslip.'}

If you have any questions regarding your payslip, please contact the HR department.

Best regards,
HR Department

---
This is an automated email. Please do not reply to this message.
    `.trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()
