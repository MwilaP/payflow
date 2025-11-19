import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Download,
  Mail,
  FileText,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Settings,
  Loader2
} from 'lucide-react'
import { getPayrollHistoryService, getEmployeeService } from '@/lib/db/services/service-factory'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { emailService } from '@/lib/email-service'
import { pdfService } from '@/lib/pdf-service'
import { EmailConfigDialog } from '@/components/email-config-dialog'
import type { PayslipPDFData } from '../../../preload'
import type { EmailPayslipData } from '@/lib/email-service'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function PayrollHistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [payrollRecord, setPayrollRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [isEmailConfigured, setIsEmailConfigured] = useState(false)
  const [showEmailConfig, setShowEmailConfig] = useState(false)

  useEffect(() => {
    const loadPayrollRecord = async () => {
      if (!id) {
        setError('No payroll ID provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const payrollService = await getPayrollHistoryService()
        const record = await payrollService.getPayrollRecordById(id)

        if (!record) {
          setError('Payroll record not found')
        } else {
          setPayrollRecord(record)
        }
      } catch (err: any) {
        console.error('Error loading payroll record:', err)
        setError(err.message || 'Failed to load payroll record')
      } finally {
        setIsLoading(false)
      }
    }

    const checkEmailConfig = async () => {
      const configured = await emailService.isConfigured()
      setIsEmailConfigured(configured)
    }

    loadPayrollRecord()
    checkEmailConfig()
  }, [id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleExportPayroll = () => {
    if (!payrollRecord || !payrollRecord.items) {
      toast({
        title: 'Export Failed',
        description: 'No payroll data available to export.',
        variant: 'destructive'
      })
      return
    }

    try {
      // Create payroll data in the requested format
      const exportData = payrollRecord.items.map((item: any) => {
        // Extract loan and other specific deductions from deduction breakdown
        let loanDeduction = 0
        let otherDeductions = 0

        // Process deduction breakdown if available
        if (item.deductionBreakdown && Array.isArray(item.deductionBreakdown)) {
          item.deductionBreakdown.forEach((deduction: any) => {
            // Skip standard deductions that already have their own columns
            if (
              deduction.name.toLowerCase().includes('napsa') ||
              deduction.name.toLowerCase().includes('nhima') ||
              deduction.name.toLowerCase().includes('paye')
            ) {
              return
            }

            // Extract loan deductions
            if (deduction.name.toLowerCase().includes('loan')) {
              loanDeduction += typeof deduction.value === 'number' ? deduction.value : 0
            } else {
              // Accumulate other deductions
              otherDeductions += typeof deduction.value === 'number' ? deduction.value : 0
            }
          })
        }

        return {
          'EMPLOYEE NAME': item.employeeName || 'Unknown Employee',
          'ACCOUNT NUMBER': item.accountNumber || '',
          NRC: item.nrc || '',
          TPIN: item.tpin || '',
          'BASIC PAY': item.basicSalary || 0,
          'Housing Allow.': item.housingAllowance || 0,
          'Transport Allow.': item.transportAllowance || 0,
          'GROSS PAY': item.grossPay || 0,
          Napsa: item.napsa || 0,
          Nhima: item.nhima || 0,
          PAYE: item.paye || 0,
          Loan: loanDeduction,
          'Other Deductions': otherDeductions,
          NET: item.netSalary || 0
        }
      })

      // Convert to CSV
      const headers = [
        'EMPLOYEE NAME',
        'ACCOUNT NUMBER',
        'NRC',
        'TPIN',
        'BASIC PAY',
        'Housing Allow.',
        'Transport Allow.',
        'GROSS PAY',
        'Napsa',
        'Nhima',
        'PAYE',
        'Loan',
        'Other Deductions',
        'NET'
      ]

      const csvContent = [
        headers.join(','),
        ...exportData.map((row: Record<string, any>) =>
          headers
            .map((header) => {
              const value = row[header]
              // Handle values that might contain commas
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`
              }
              return value
            })
            .join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)

      const fileName = `payroll_${payrollRecord.period || 'monthly'}_${payrollRecord.date ? new Date(payrollRecord.date).toISOString().split('T')[0] : 'unknown'}.csv`
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Successful',
        description: `Payroll exported as ${fileName}`
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting the payroll data.',
        variant: 'destructive'
      })
    }
  }

  const handleEmailPayslips = async () => {
    if (!payrollRecord || !payrollRecord.items) {
      toast({
        title: 'Error',
        description: 'No payroll data available to email.',
        variant: 'destructive'
      })
      return
    }

    // Check if email is configured
    const configured = await emailService.isConfigured()
    if (!configured) {
      toast({
        title: 'Email Not Configured',
        description: 'Please configure email settings first.',
        variant: 'destructive'
      })
      setShowEmailConfig(true)
      return
    }

    setIsSendingEmails(true)
    try {
      // Get employee service to fetch full employee details
      const employeeService = await getEmployeeService()

      // Prepare payslip PDF data for all employees
      const payslipPDFDataArray: PayslipPDFData[] = []
      const emailDataArray: EmailPayslipData[] = []

      for (const item of payrollRecord.items) {
        try {
          // Fetch employee details
          const employee = await employeeService.getEmployeeById(item.employeeId)
          if (!employee) {
            console.warn(`Employee not found: ${item.employeeId}`)
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
            companyName: 'Your Company Name', // TODO: Get from settings
            companyAddress: 'Company Address', // TODO: Get from settings
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeNumber: employee._id,
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

          payslipPDFDataArray.push(pdfData)

          // Prepare email data (will add PDF later)
          emailDataArray.push({
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeEmail: employee.email,
            period: payrollRecord.period || 'Monthly',
            netSalary: item.netSalary || 0
          })
        } catch (error) {
          console.error(`Error processing employee ${item.employeeId}:`, error)
        }
      }

      if (payslipPDFDataArray.length === 0) {
        toast({
          title: 'No Valid Employees',
          description: 'No valid employee data found to generate payslips.',
          variant: 'destructive'
        })
        setIsSendingEmails(false)
        return
      }

      // Generate PDFs for all payslips
      toast({
        title: 'Generating Payslips',
        description: `Generating ${payslipPDFDataArray.length} payslip PDFs...`
      })

      const pdfResult = await pdfService.generateBulkPayslipPDFs(payslipPDFDataArray)

      if (!pdfResult.success || !pdfResult.data) {
        throw new Error(pdfResult.error || 'Failed to generate PDFs')
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
        title: 'Sending Emails',
        description: `Sending payslips to ${emailDataWithPDFs.length} employees...`
      })

      const result = await emailService.sendBulkPayslips(emailDataWithPDFs)

      if (result.success && result.data) {
        if (result.data.success) {
          toast({
            title: 'Emails Sent Successfully',
            description: `Payslips have been sent to ${result.data.sent} employee(s).`
          })
        } else {
          toast({
            title: 'Partial Success',
            description: `Sent: ${result.data.sent}, Failed: ${result.data.failed}. Check console for details.`,
            variant: 'destructive'
          })
          console.error('Failed emails:', result.data.errors)
        }
      } else {
        toast({
          title: 'Email Failed',
          description: result.error || 'Failed to send payslip emails.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('Error sending payslip emails:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred while sending emails.',
        variant: 'destructive'
      })
    } finally {
      setIsSendingEmails(false)
    }
  }

  const toggleRowExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedRows(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/payroll')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive">Error</h3>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payrollRecord) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/payroll')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Payroll Record Not Found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The requested payroll record could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/payroll')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {payrollRecord.period || 'Monthly Payroll'}
            </h2>
            <p className="text-muted-foreground">
              {payrollRecord.date
                ? format(new Date(payrollRecord.date), 'MMMM yyyy')
                : 'Date unknown'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportPayroll}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isSendingEmails}>
                {isSendingEmails ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Email Payslips
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEmailPayslips}>
                <Mail className="mr-2 h-4 w-4" />
                Send to All Employees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEmailConfig(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Email Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Summary</CardTitle>
              <CardDescription>Overview of this payroll period</CardDescription>
            </div>
            {getStatusBadge(payrollRecord.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="mt-1 text-2xl font-bold">
                K{payrollRecord.totalAmount?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Employees</h3>
              <p className="mt-1 text-2xl font-bold">{payrollRecord.employeeCount || 0}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Processed Date</h3>
              <p className="mt-1 text-lg font-medium">
                {payrollRecord.processedAt
                  ? format(new Date(payrollRecord.processedAt), 'MMM dd, yyyy')
                  : 'Not processed'}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Processed By</h3>
              <p className="mt-1 text-lg font-medium">{payrollRecord.processedBy || 'System'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Details */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Breakdown</CardTitle>
          <CardDescription>Individual employee payroll details</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollRecord.items && payrollRecord.items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecord.items.map((item: any, index: number) => {
                    const employeeId = item.employeeId || `employee_${index}`
                    const isExpanded = expandedRows.has(employeeId)

                    return (
                      <>
                        <TableRow
                          key={employeeId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRowExpansion(employeeId)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.employeeName || `Employee ${index + 1}`}
                          </TableCell>
                          <TableCell>K{item.basicSalary?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>K{item.allowances?.toLocaleString() || '0'}</span>
                              {item.allowanceBreakdown && item.allowanceBreakdown.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.allowanceBreakdown.length} items
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>K{item.deductions?.toLocaleString() || '0'}</span>
                              {item.deductionBreakdown && item.deductionBreakdown.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.deductionBreakdown.length} items
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            K{item.netSalary?.toLocaleString() || '0'}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${employeeId}_details`}>
                            <TableCell colSpan={6} className="bg-muted/30 p-0">
                              <div className="p-4 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Allowances Breakdown */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-green-700">
                                      Allowances Breakdown
                                    </h4>
                                    {item.allowanceBreakdown &&
                                    item.allowanceBreakdown.length > 0 ? (
                                      <div className="space-y-1">
                                        {item.allowanceBreakdown.map(
                                          (allowance: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">
                                                {allowance.name}
                                              </span>
                                              <span className="font-medium text-green-700">
                                                +K{allowance.value?.toLocaleString() || '0'}
                                                {allowance.type === 'percentage' &&
                                                  ` (${allowance.percentage}%)`}
                                              </span>
                                            </div>
                                          )
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between text-sm font-medium">
                                          <span>Total Allowances</span>
                                          <span className="text-green-700">
                                            +K{item.allowances?.toLocaleString() || '0'}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No allowances</p>
                                    )}
                                  </div>

                                  {/* Deductions Breakdown */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-red-700">
                                      Deductions Breakdown
                                    </h4>
                                    {item.deductionBreakdown &&
                                    item.deductionBreakdown.length > 0 ? (
                                      <div className="space-y-1">
                                        {item.deductionBreakdown.map(
                                          (deduction: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                              <span className="text-muted-foreground">
                                                {deduction.name}
                                                {deduction.preTax && (
                                                  <span className="text-xs text-blue-600 ml-1">
                                                    (Pre-tax)
                                                  </span>
                                                )}
                                              </span>
                                              <span className="font-medium text-red-700">
                                                -K{deduction.value?.toLocaleString() || '0'}
                                                {deduction.type === 'percentage' &&
                                                  ` (${deduction.percentage}%)`}
                                              </span>
                                            </div>
                                          )
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between text-sm font-medium">
                                          <span>Total Deductions</span>
                                          <span className="text-red-700">
                                            -K{item.deductions?.toLocaleString() || '0'}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No deductions</p>
                                    )}
                                  </div>
                                </div>

                                {/* Salary Calculation Summary */}
                                <div className="bg-background rounded-lg p-3 border">
                                  <h4 className="font-medium text-sm mb-2">Salary Calculation</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Basic Salary</span>
                                      <span>K{item.basicSalary?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-green-700">
                                      <span>+ Total Allowances</span>
                                      <span>K{item.allowances?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-red-700">
                                      <span>- Total Deductions</span>
                                      <span>K{item.deductions?.toLocaleString() || '0'}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium text-base">
                                      <span>Net Salary</span>
                                      <span>K{item.netSalary?.toLocaleString() || '0'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Employee Data</h3>
              <p className="text-sm text-muted-foreground mt-2">
                No individual employee breakdown available for this payroll.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {payrollRecord.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{payrollRecord.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Email Configuration Dialog */}
      <EmailConfigDialog
        open={showEmailConfig}
        onOpenChange={(open) => {
          setShowEmailConfig(open)
          if (!open) {
            // Recheck email configuration after dialog closes
            emailService.isConfigured().then(setIsEmailConfigured)
          }
        }}
      />
    </div>
  )
}
