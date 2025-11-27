import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { emailService } from '@/lib/email-service'
import { pdfService } from '@/lib/pdf-service'
import { getCompanySettings } from '@/components/company-settings'
import { getEmployeeService } from '@/lib/db/services/service-factory'
import type { PayslipPDFData } from '../../../preload'
import type { EmailPayslipData } from '@/lib/email-service'

interface FailedEmail {
  employeeId: string
  employeeName: string
  employeeEmail: string
  error: string
  employeeNumber?: string
  netSalary: number
}

interface FailedEmailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  failedEmails: FailedEmail[]
  payrollRecord: any
  onPayrollUpdate?: (updatedPayroll: any) => void
}

export function FailedEmailsDialog({
  open,
  onOpenChange,
  failedEmails,
  payrollRecord,
  onPayrollUpdate
}: FailedEmailsDialogProps) {
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [resendingEmployee, setResendingEmployee] = useState<string | null>(null)

  const handleResendAll = async () => {
    if (!payrollRecord || !payrollRecord.items) {
      toast({
        title: 'Error',
        description: 'No payroll data available.',
        variant: 'destructive'
      })
      return
    }

    setIsResending(true)
    try {
      // Get company settings
      const companySettings = getCompanySettings()

      // Get employee service to fetch full employee details
      const employeeService = await getEmployeeService()

      // Prepare payslip PDF data and email data for failed emails
      const payslipPDFDataArray: PayslipPDFData[] = []
      const emailDataArray: EmailPayslipData[] = []

      for (const failedEmail of failedEmails) {
        try {
          // Find the payroll item for this employee
          const item = payrollRecord.items.find((item: any) => item.employeeId === failedEmail.employeeId)
          if (!item) {
            console.warn(`Payroll item not found for employee ${failedEmail.employeeId}`)
            continue
          }

          // Fetch employee details
          const employee = await employeeService.getEmployeeById(failedEmail.employeeId)
          if (!employee) {
            console.warn(`Employee not found: ${failedEmail.employeeId}`)
            continue
          }

          // Prepare allowances breakdown
          const allowances: Array<{ name: string; amount: number }> = []
          if (item.allowanceBreakdown && Array.isArray(item.allowanceBreakdown)) {
            item.allowanceBreakdown.forEach((allowance: any) => {
              allowances.push({
                name: allowance.name || 'Allowance',
                amount: allowance.value || 0
              })
            })
          }

          // Prepare deductions breakdown
          const deductions: Array<{ name: string; amount: number }> = []
          if (item.deductionBreakdown && Array.isArray(item.deductionBreakdown)) {
            item.deductionBreakdown.forEach((deduction: any) => {
              deductions.push({
                name: deduction.name || 'Deduction',
                amount: deduction.value || 0
              })
            })
          }

          // Create PDF data
          const pdfData: PayslipPDFData = {
            companyName: companySettings.companyName,
            companyAddress: companySettings.companyAddress,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeNumber: employee.employeeNumber || item.employeeNumber || 'N/A',
            department: employee.department || 'N/A',
            designation: employee.designation || 'N/A',
            nrc: employee.nationalId || 'N/A',
            tpin: employee.taxNumber || 'N/A',
            accountNumber: employee.accountNumber || 'N/A',
            bankName: employee.bankName || 'N/A',
            period: payrollRecord.period || 'Monthly',
            paymentDate:
              payrollRecord.paymentDate || payrollRecord.date || new Date().toISOString(),
            basicSalary: item.basicSalary || 0,
            allowances: allowances,
            totalAllowances: item.allowances || 0,
            grossPay: (item.basicSalary || 0) + (item.allowances || 0),
            deductions: deductions,
            totalDeductions: item.deductions || 0,
            netPay: item.netSalary || 0
          }

          payslipPDFDataArray.push(pdfData)

          // Prepare email data
          emailDataArray.push({
            employeeId: failedEmail.employeeId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeEmail: employee.email,
            period: payrollRecord.period || 'Monthly',
            netSalary: item.netSalary || 0
          })
        } catch (error) {
          console.error(`Error processing employee ${failedEmail.employeeId}:`, error)
        }
      }

      if (payslipPDFDataArray.length === 0) {
        toast({
          title: 'No Valid Employees',
          description: 'No valid employee data found to resend payslips.',
          variant: 'destructive'
        })
        setIsResending(false)
        return
      }

      // Generate PDFs for all failed payslips
      toast({
        title: 'Regenerating Payslips',
        description: `Regenerating ${payslipPDFDataArray.length} payslip PDFs...`
      })

      const pdfResult = await pdfService.generateBulkPayslipPDFs(payslipPDFDataArray)

      if (!pdfResult.success || !pdfResult.data) {
        throw new Error(pdfResult.error || 'Failed to regenerate PDFs')
      }

      // Attach PDFs to email data
      const emailDataWithPDFs = emailDataArray.map((emailData, index) => {
        const pdfData = payslipPDFDataArray[index]
        const pdfBase64 = pdfResult.data![pdfData.employeeNumber]
        return {
          ...emailData,
          payslipPdfBase64: pdfBase64
        }
      })

      // Send bulk emails with PDFs
      toast({
        title: 'Resending Emails',
        description: `Resending payslips to ${emailDataWithPDFs.length} employees...`
      })

      const result = await emailService.sendBulkPayslips(emailDataWithPDFs, payrollRecord._id)

      // Update payroll record with email status results
      const updatedItems = payrollRecord.items.map((item: any) => {
        // Find the corresponding email data for this employee
        const emailData = emailDataWithPDFs.find((email: any) => email.employeeId === item.employeeId)

        if (emailData) {
          // Check if this email failed
          const failedEmail = result.data?.errors?.find((error: any) => error.email === emailData.employeeEmail)

          if (failedEmail) {
            // Email failed
            return {
              ...item,
              emailStatus: 'failed',
              emailError: failedEmail.error,
              emailSentAt: new Date().toISOString()
            }
          } else {
            // Email succeeded - update status
            return {
              ...item,
              emailStatus: 'sent',
              emailError: undefined,
              emailSentAt: new Date().toISOString()
            }
          }
        }

        return item
      })

      // Update the payroll record and notify parent
      const updatedPayrollRecord = {
        ...payrollRecord,
        items: updatedItems
      }

      if (onPayrollUpdate) {
        onPayrollUpdate(updatedPayrollRecord)
      }

      if (result.success && result.data) {
        if (result.data.success) {
          toast({
            title: 'Emails Resent Successfully',
            description: `Payslips have been resent to ${result.data.sent} employee(s).`
          })
          onOpenChange(false)
        } else {
          toast({
            title: 'Partial Success',
            description: `Resent: ${result.data.sent}, Still failed: ${result.data.failed}. Check console for details.`,
            variant: 'destructive'
          })
          console.error('Failed resend emails:', result.data.errors)
        }
      } else {
        toast({
          title: 'Resend Failed',
          description: result.error || 'Failed to resend payslip emails.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('Error resending payslip emails:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred while resending emails.',
        variant: 'destructive'
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleResendIndividual = async (failedEmail: FailedEmail) => {
    if (!payrollRecord || !payrollRecord.items) {
      toast({
        title: 'Error',
        description: 'No payroll data available.',
        variant: 'destructive'
      })
      return
    }

    setResendingEmployee(failedEmail.employeeId)
    try {
      // Find the payroll item for this employee
      const item = payrollRecord.items.find((item: any) => item.employeeId === failedEmail.employeeId)
      if (!item) {
        throw new Error('Payroll item not found')
      }

      // Get company settings and employee details
      const companySettings = getCompanySettings()
      const employeeService = await getEmployeeService()
      const employee = await employeeService.getEmployeeById(failedEmail.employeeId)

      if (!employee) {
        throw new Error('Employee not found')
      }

      // Prepare allowances and deductions
      const allowances: Array<{ name: string; amount: number }> = []
      if (item.allowanceBreakdown && Array.isArray(item.allowanceBreakdown)) {
        item.allowanceBreakdown.forEach((allowance: any) => {
          allowances.push({
            name: allowance.name || 'Allowance',
            amount: allowance.value || 0
          })
        })
      }

      const deductions: Array<{ name: string; amount: number }> = []
      if (item.deductionBreakdown && Array.isArray(item.deductionBreakdown)) {
        item.deductionBreakdown.forEach((deduction: any) => {
          deductions.push({
            name: deduction.name || 'Deduction',
            amount: deduction.value || 0
          })
        })
      }

      // Create PDF data
      const pdfData: PayslipPDFData = {
        companyName: companySettings.companyName,
        companyAddress: companySettings.companyAddress,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber || item.employeeNumber || 'N/A',
        department: employee.department || 'N/A',
        designation: employee.designation || 'N/A',
        nrc: employee.nationalId || 'N/A',
        tpin: employee.taxNumber || 'N/A',
        accountNumber: employee.accountNumber || 'N/A',
        bankName: employee.bankName || 'N/A',
        period: payrollRecord.period || 'Monthly',
        paymentDate: payrollRecord.paymentDate || payrollRecord.date || new Date().toISOString(),
        basicSalary: item.basicSalary || 0,
        allowances: allowances,
        totalAllowances: item.allowances || 0,
        grossPay: (item.basicSalary || 0) + (item.allowances || 0),
        deductions: deductions,
        totalDeductions: item.deductions || 0,
        netPay: item.netSalary || 0
      }

      // Generate PDF
      const pdfResult = await pdfService.generatePayslip(pdfData)
      if (!pdfResult.success || !pdfResult.data) {
        throw new Error(pdfResult.error || 'Failed to generate PDF')
      }

      // Prepare email data with PDF
      const emailData: EmailPayslipData = {
        employeeId: failedEmail.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeEmail: employee.email,
        period: payrollRecord.period || 'Monthly',
        netSalary: item.netSalary || 0,
        payslipPdfBase64: pdfResult.data
      }

      // Send email
      const result = await emailService.sendPayslip(emailData, payrollRecord._id)

      if (result.success) {
        toast({
          title: 'Email Resent Successfully',
          description: `Payslip has been resent to ${employee.firstName} ${employee.lastName}.`
        })

        // Update the payroll record locally
        const updatedItems = payrollRecord.items.map((item: any) => {
          if (item.employeeId === failedEmail.employeeId) {
            return {
              ...item,
              emailStatus: 'sent',
              emailError: undefined,
              emailSentAt: new Date().toISOString()
            }
          }
          return item
        })

        const updatedPayrollRecord = {
          ...payrollRecord,
          items: updatedItems
        }

        if (onPayrollUpdate) {
          onPayrollUpdate(updatedPayrollRecord)
        }

        // Close dialog if no more failed emails
        const updatedFailedEmails = failedEmails.filter(
          email => email.employeeId !== failedEmail.employeeId
        )

        if (updatedFailedEmails.length === 0) {
          onOpenChange(false)
        }
      } else {
        toast({
          title: 'Resend Failed',
          description: result.error || 'Failed to resend payslip email.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('Error resending individual payslip email:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred while resending email.',
        variant: 'destructive'
      })
    } finally {
      setResendingEmployee(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Failed Email Sends
          </DialogTitle>
          <DialogDescription>
            The following payslip emails failed to send. You can retry sending them individually or resend all at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">
                {failedEmails.length} failed email{failedEmails.length !== 1 ? 's' : ''}
              </span>
            </div>

            {failedEmails.length > 1 && (
              <Button
                onClick={handleResendAll}
                disabled={isResending}
                className="flex items-center gap-2"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Resending All...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Resend All
                  </>
                )}
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {failedEmails.map((failedEmail, index) => (
                <div key={failedEmail.employeeId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{failedEmail.employeeName}</span>
                        <Badge variant="outline">{failedEmail.employeeNumber || 'N/A'}</Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {failedEmail.employeeEmail}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="font-medium">Net Salary:</span>
                          K{failedEmail.netSalary.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded border">
                        <div className="flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{failedEmail.error}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendIndividual(failedEmail)}
                      disabled={resendingEmployee === failedEmail.employeeId}
                      className="ml-4 flex items-center gap-2"
                    >
                      {resendingEmployee === failedEmail.employeeId ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Resend
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
