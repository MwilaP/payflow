import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Trash2,
  Mail,
  Calendar,
  DollarSign,
  User,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { emailService } from '@/lib/email-service'
import { pdfService } from '@/lib/pdf-service'
import { getCompanySettings } from '@/components/company-settings'
import { getEmployeeService } from '@/lib/db/services/service-factory'
import { AppLayout } from '@/components/app-layout'
import type { PayslipPDFData } from '../../../preload'

interface FailedPayslip {
  id: string
  payroll_record_id: string
  employee_id: string
  employee_name: string
  employee_email: string
  employee_number?: string
  period: string
  net_salary: number
  error_message: string
  retry_count: number
  last_retry_at?: string
  payslip_data: string
  status: 'pending' | 'resolved'
  created_at: string
  updated_at: string
}

export function FailedPayslipsPage() {
  const { toast } = useToast()
  const [failedPayslips, setFailedPayslips] = useState<FailedPayslip[]>([])
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [retryingAll, setRetryingAll] = useState(false)

  useEffect(() => {
    loadFailedPayslips()
  }, [])

  const loadFailedPayslips = async () => {
    try {
      setLoading(true)
      const result = await window.api.db.failedPayslips.getPending()
      if (result.success && result.data) {
        setFailedPayslips(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load failed payslips',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading failed payslips:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetryIndividual = async (failedPayslip: FailedPayslip) => {
    setRetryingId(failedPayslip.id)
    try {
      // Check if email is configured
      const configured = await emailService.isConfigured()
      if (!configured) {
        toast({
          title: 'Email Not Configured',
          description: 'Please configure email settings first.',
          variant: 'destructive'
        })
        setRetryingId(null)
        return
      }

      // Parse the stored payslip data
      const storedData = JSON.parse(failedPayslip.payslip_data)

      // Get company settings
      const companySettings = getCompanySettings()

      // Get employee service to fetch full employee details
      const employeeService = await getEmployeeService()
      const employee = await employeeService.getEmployeeById(failedPayslip.employee_id)

      if (!employee) {
        throw new Error('Employee not found')
      }

      // Prepare PDF data
      const pdfData: PayslipPDFData = {
        companyName: companySettings.companyName,
        companyAddress: companySettings.companyAddress,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber || failedPayslip.employee_number || 'N/A',
        department: employee.department || 'N/A',
        designation: employee.designation || 'N/A',
        nrc: employee.nationalId || 'N/A',
        tpin: employee.taxNumber || 'N/A',
        accountNumber: employee.accountNumber || 'N/A',
        bankName: employee.bankName || 'N/A',
        period: failedPayslip.period,
        paymentDate: storedData.paymentDate || new Date().toISOString(),
        basicSalary: storedData.basicSalary || 0,
        allowances: storedData.allowances || [],
        totalAllowances: storedData.totalAllowances || 0,
        grossPay: storedData.grossPay || 0,
        deductions: storedData.deductions || [],
        totalDeductions: storedData.totalDeductions || 0,
        netPay: failedPayslip.net_salary
      }

      // Generate PDF
      toast({
        title: 'Generating Payslip',
        description: `Generating PDF for ${failedPayslip.employee_name}...`
      })

      const pdfResult = await pdfService.generatePayslip(pdfData)
      if (!pdfResult.success || !pdfResult.data) {
        throw new Error(pdfResult.error || 'Failed to generate PDF')
      }

      // Send email
      toast({
        title: 'Sending Email',
        description: `Sending payslip to ${failedPayslip.employee_email}...`
      })

      const emailResult = await emailService.sendPayslip({
        employeeId: failedPayslip.employee_id,
        employeeName: failedPayslip.employee_name,
        employeeEmail: failedPayslip.employee_email,
        period: failedPayslip.period,
        netSalary: failedPayslip.net_salary,
        payslipPdfBase64: pdfResult.data
      })

      if (emailResult.success) {
        // Mark as resolved
        await window.api.db.failedPayslips.markAsResolved(failedPayslip.id)

        toast({
          title: 'Success',
          description: `Payslip successfully sent to ${failedPayslip.employee_name}`
        })

        // Reload the list
        loadFailedPayslips()
      } else {
        // Increment retry count
        await window.api.db.failedPayslips.incrementRetryCount(failedPayslip.id)

        toast({
          title: 'Retry Failed',
          description: emailResult.error || 'Failed to send email',
          variant: 'destructive'
        })

        // Reload to show updated retry count
        loadFailedPayslips()
      }
    } catch (error: any) {
      console.error('Error retrying payslip:', error)
      
      // Increment retry count on error
      await window.api.db.failedPayslips.incrementRetryCount(failedPayslip.id)

      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      })

      // Reload to show updated retry count
      loadFailedPayslips()
    } finally {
      setRetryingId(null)
    }
  }

  const handleRetryAll = async () => {
    setRetryingAll(true)
    try {
      // Check if email is configured
      const configured = await emailService.isConfigured()
      if (!configured) {
        toast({
          title: 'Email Not Configured',
          description: 'Please configure email settings first.',
          variant: 'destructive'
        })
        setRetryingAll(false)
        return
      }

      let successCount = 0
      let failCount = 0

      for (const failedPayslip of failedPayslips) {
        try {
          // Parse the stored payslip data
          const storedData = JSON.parse(failedPayslip.payslip_data)

          // Get company settings
          const companySettings = getCompanySettings()

          // Get employee service to fetch full employee details
          const employeeService = await getEmployeeService()
          const employee = await employeeService.getEmployeeById(failedPayslip.employee_id)

          if (!employee) {
            failCount++
            await window.api.db.failedPayslips.incrementRetryCount(failedPayslip.id)
            continue
          }

          // Prepare PDF data
          const pdfData: PayslipPDFData = {
            companyName: companySettings.companyName,
            companyAddress: companySettings.companyAddress,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeNumber: employee.employeeNumber || failedPayslip.employee_number || 'N/A',
            department: employee.department || 'N/A',
            designation: employee.designation || 'N/A',
            nrc: employee.nationalId || 'N/A',
            tpin: employee.taxNumber || 'N/A',
            accountNumber: employee.accountNumber || 'N/A',
            bankName: employee.bankName || 'N/A',
            period: failedPayslip.period,
            paymentDate: storedData.paymentDate || new Date().toISOString(),
            basicSalary: storedData.basicSalary || 0,
            allowances: storedData.allowances || [],
            totalAllowances: storedData.totalAllowances || 0,
            grossPay: storedData.grossPay || 0,
            deductions: storedData.deductions || [],
            totalDeductions: storedData.totalDeductions || 0,
            netPay: failedPayslip.net_salary
          }

          // Generate PDF
          const pdfResult = await pdfService.generatePayslip(pdfData)
          if (!pdfResult.success || !pdfResult.data) {
            failCount++
            await window.api.db.failedPayslips.incrementRetryCount(failedPayslip.id)
            continue
          }

          // Send email
          const emailResult = await emailService.sendPayslip({
            employeeId: failedPayslip.employee_id,
            employeeName: failedPayslip.employee_name,
            employeeEmail: failedPayslip.employee_email,
            period: failedPayslip.period,
            netSalary: failedPayslip.net_salary,
            payslipPdfBase64: pdfResult.data
          })

          if (emailResult.success) {
            // Mark as resolved
            await window.api.db.failedPayslips.markAsResolved(failedPayslip.id)
            successCount++
          } else {
            // Increment retry count
            await window.api.db.failedPayslips.incrementRetryCount(failedPayslip.id)
            failCount++
          }
        } catch (error) {
          console.error(`Error retrying payslip for ${failedPayslip.employee_name}:`, error)
          await window.api.db.failedPayslips.incrementRetryCount(failedPayslip.id)
          failCount++
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Retry Complete',
          description: `Successfully sent ${successCount} payslip(s). ${failCount} still failed.`
        })
      } else {
        toast({
          title: 'All Retries Failed',
          description: `All ${failCount} retry attempts failed. Check error messages for details.`,
          variant: 'destructive'
        })
      }

      // Reload the list
      loadFailedPayslips()
    } catch (error: any) {
      console.error('Error retrying all payslips:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setRetryingAll(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await window.api.db.failedPayslips.delete(id)
      if (result.success) {
        toast({
          title: 'Deleted',
          description: 'Failed payslip record deleted'
        })
        loadFailedPayslips()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete record',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting failed payslip:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Failed Payslip Emails</h1>
          <p className="text-muted-foreground mt-1">
            Manage and retry payslip emails that failed to send
          </p>
        </div>
        {failedPayslips.length > 0 && (
          <Button
            onClick={handleRetryAll}
            disabled={retryingAll}
            size="lg"
          >
            {retryingAll ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying All...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry All ({failedPayslips.length})
              </>
            )}
          </Button>
        )}
      </div>

      {failedPayslips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">All Clear!</h2>
            <p className="text-muted-foreground text-center max-w-md">
              No failed payslip emails at the moment. All payslips have been sent successfully.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span>
              {failedPayslips.length} payslip{failedPayslips.length !== 1 ? 's' : ''} failed to send
            </span>
          </div>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-4">
              {failedPayslips.map((failedPayslip) => (
                <Card key={failedPayslip.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {failedPayslip.employee_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {failedPayslip.employee_email}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRetryIndividual(failedPayslip)}
                          disabled={retryingId === failedPayslip.id || retryingAll}
                        >
                          {retryingId === failedPayslip.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-2" />
                              Retry
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(failedPayslip.id)}
                          disabled={retryingId === failedPayslip.id || retryingAll}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {failedPayslip.employee_number || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{failedPayslip.period}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          K{failedPayslip.net_salary.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDate(failedPayslip.created_at)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-red-600">Error Message:</p>
                          <p className="text-muted-foreground mt-1">
                            {failedPayslip.error_message}
                          </p>
                        </div>
                      </div>

                      {failedPayslip.retry_count > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Retried {failedPayslip.retry_count} time{failedPayslip.retry_count !== 1 ? 's' : ''}
                          </Badge>
                          {failedPayslip.last_retry_at && (
                            <span className="text-xs text-muted-foreground">
                              Last retry: {formatDate(failedPayslip.last_retry_at)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      </div>
    </AppLayout>
  )
}
