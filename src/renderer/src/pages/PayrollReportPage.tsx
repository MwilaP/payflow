import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react'
import { getPayrollHistoryService } from '@/lib/db/services/service-factory'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import type { PayrollHistory } from '@/lib/db/models/payroll-history.model'

interface DeductionSummary {
  name: string
  totalAmount: number
  employeeCount: number
  averageAmount: number
}

interface AllowanceSummary {
  name: string
  totalAmount: number
  employeeCount: number
  averageAmount: number
}

interface PayrollReport {
  payrollRecord: PayrollHistory
  totalEmployees: number
  totalBasicSalary: number
  totalAllowances: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  deductionBreakdown: DeductionSummary[]
  allowanceBreakdown: AllowanceSummary[]
}

export default function PayrollReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [report, setReport] = useState<PayrollReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [id])

  const loadReport = async () => {
    if (!id) {
      setError('No payroll ID provided')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const payrollService = await getPayrollHistoryService()
      const payrollRecord = await payrollService.getPayrollRecordById(id)

      if (!payrollRecord) {
        setError('Payroll record not found')
        setIsLoading(false)
        return
      }

      // Calculate report data
      const deductionMap = new Map<string, { total: number; count: number }>()
      const allowanceMap = new Map<string, { total: number; count: number }>()
      let totalBasicSalary = 0
      let totalAllowances = 0
      let totalDeductions = 0
      let totalNetPay = 0

      payrollRecord.items.forEach((item) => {
        totalBasicSalary += item.basicSalary || 0
        totalAllowances += item.allowances || 0
        totalDeductions += item.deductions || 0
        totalNetPay += item.netSalary || 0

        // Process deductions
        if (item.deductionBreakdown && Array.isArray(item.deductionBreakdown)) {
          item.deductionBreakdown.forEach((deduction: any) => {
            const name = deduction.name || 'Other'
            const amount = deduction.value || 0
            const existing = deductionMap.get(name) || { total: 0, count: 0 }
            deductionMap.set(name, {
              total: existing.total + amount,
              count: existing.count + 1
            })
          })
        }

        // Process allowances
        if (item.allowanceBreakdown && Array.isArray(item.allowanceBreakdown)) {
          item.allowanceBreakdown.forEach((allowance: any) => {
            const name = allowance.name || 'Other'
            const amount = allowance.value || 0
            const existing = allowanceMap.get(name) || { total: 0, count: 0 }
            allowanceMap.set(name, {
              total: existing.total + amount,
              count: existing.count + 1
            })
          })
        }
      })

      // Convert maps to arrays
      const deductionBreakdown: DeductionSummary[] = Array.from(deductionMap.entries()).map(
        ([name, data]) => ({
          name,
          totalAmount: data.total,
          employeeCount: data.count,
          averageAmount: data.total / data.count
        })
      )

      const allowanceBreakdown: AllowanceSummary[] = Array.from(allowanceMap.entries()).map(
        ([name, data]) => ({
          name,
          totalAmount: data.total,
          employeeCount: data.count,
          averageAmount: data.total / data.count
        })
      )

      // Sort by total amount descending
      deductionBreakdown.sort((a, b) => b.totalAmount - a.totalAmount)
      allowanceBreakdown.sort((a, b) => b.totalAmount - a.totalAmount)

      setReport({
        payrollRecord,
        totalEmployees: payrollRecord.items.length,
        totalBasicSalary,
        totalAllowances,
        totalGrossPay: totalBasicSalary + totalAllowances,
        totalDeductions,
        totalNetPay,
        deductionBreakdown,
        allowanceBreakdown
      })
    } catch (err: any) {
      console.error('Error loading report:', err)
      setError(err.message || 'Failed to load payroll report')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handleExportReport = () => {
    if (!report) return

    try {
      // Create CSV content
      let csvContent = `Payroll Report\n`
      csvContent += `Period: ${report.payrollRecord.period || 'Monthly'}\n`
      csvContent += `Date: ${report.payrollRecord.date ? format(new Date(report.payrollRecord.date), 'dd/MM/yyyy') : 'N/A'}\n`
      csvContent += `Total Employees: ${report.totalEmployees}\n\n`

      csvContent += `Summary\n`
      csvContent += `Description,Amount\n`
      csvContent += `Total Basic Salary,${report.totalBasicSalary}\n`
      csvContent += `Total Allowances,${report.totalAllowances}\n`
      csvContent += `Total Gross Pay,${report.totalGrossPay}\n`
      csvContent += `Total Deductions,${report.totalDeductions}\n`
      csvContent += `Total Net Pay,${report.totalNetPay}\n\n`

      csvContent += `Deduction Breakdown\n`
      csvContent += `Deduction Type,Total Amount,Employee Count,Average Amount\n`
      report.deductionBreakdown.forEach((deduction) => {
        csvContent += `${deduction.name},${deduction.totalAmount},${deduction.employeeCount},${deduction.averageAmount}\n`
      })

      csvContent += `\nAllowance Breakdown\n`
      csvContent += `Allowance Type,Total Amount,Employee Count,Average Amount\n`
      report.allowanceBreakdown.forEach((allowance) => {
        csvContent += `${allowance.name},${allowance.totalAmount},${allowance.employeeCount},${allowance.averageAmount}\n`
      })

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `payroll_report_${report.payrollRecord.period || 'monthly'}_${report.payrollRecord.date ? new Date(report.payrollRecord.date).toISOString().split('T')[0] : 'unknown'}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Report Exported',
        description: 'Payroll report has been exported successfully.'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting the report.',
        variant: 'destructive'
      })
    }
  }

  const handlePrintReport = () => {
    window.print()
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

  if (error || !report) {
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(`/payroll/history/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payroll Report</h2>
            <p className="text-muted-foreground">
              {report.payrollRecord.period || 'Monthly'} -{' '}
              {report.payrollRecord.date
                ? format(new Date(report.payrollRecord.date), 'MMMM yyyy')
                : 'Date unknown'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Employees</CardDescription>
            <CardTitle className="text-2xl">{report.totalEmployees}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Gross Pay</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(report.totalGrossPay)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deductions</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              {formatCurrency(report.totalDeductions)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Net Pay</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(report.totalNetPay)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Deduction Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Deduction Breakdown</CardTitle>
          <CardDescription>
            Total deductions by type across all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deduction Type</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Employee Count</TableHead>
                <TableHead className="text-right">Average Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.deductionBreakdown.map((deduction) => (
                <TableRow key={deduction.name}>
                  <TableCell className="font-medium">{deduction.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(deduction.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">{deduction.employeeCount}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(deduction.averageAmount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>TOTAL DEDUCTIONS</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.totalDeductions)}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Allowance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Allowance Breakdown</CardTitle>
          <CardDescription>Total allowances by type across all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Allowance Type</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Employee Count</TableHead>
                <TableHead className="text-right">Average Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.allowanceBreakdown.map((allowance) => (
                <TableRow key={allowance.name}>
                  <TableCell className="font-medium">{allowance.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(allowance.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">{allowance.employeeCount}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(allowance.averageAmount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>TOTAL ALLOWANCES</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.totalAllowances)}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
          <CardDescription>Overall payroll totals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Total Basic Salary</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.totalBasicSalary)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Allowances</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.totalAllowances)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Total Gross Pay</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(report.totalGrossPay)}
                </TableCell>
              </TableRow>
              <TableRow className="text-destructive">
                <TableCell className="font-medium">Total Deductions</TableCell>
                <TableCell className="text-right">
                  -{formatCurrency(report.totalDeductions)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold text-lg bg-muted/50">
                <TableCell>Total Net Pay</TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(report.totalNetPay)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
