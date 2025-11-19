import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileEdit, Download } from "lucide-react"

// Define props interface
interface EmployeePayrollStructureProps {
  structure: any // Ideally, define a stricter type based on PayrollStructure
}

export function EmployeePayrollStructure({ structure }: EmployeePayrollStructureProps) {
  // Helper function to calculate amounts (similar to EmployeeSalary, could be refactored)
  const calculateAmounts = (struct: any) => {
    if (!struct) {
      return {
        basicSalary: 0,
        allowances: [],
        deductions: [],
        grossPay: 0,
        totalDeductions: 0,
        netPay: 0,
      }
    }

    const baseSalary = struct.basicSalary || 0
    let grossPay = baseSalary
    const calculatedAllowances = (struct.allowances || []).map((a: any) => {
      const amount = a.type === "percentage" ? (baseSalary * a.value) / 100 : a.value
      grossPay += amount
      return { ...a, amount }
    })

    let totalDeductions = 0
    let taxableAmount = grossPay // Simplified tax calculation base
    const calculatedDeductions = (struct.deductions || []).map((d: any) => {
      let deductionAmount = 0
      const baseForPercentage = d.preTax ? taxableAmount : grossPay
      if (d.type === "percentage") {
        deductionAmount = (baseForPercentage * d.value) / 100
      } else {
        deductionAmount = d.value
      }
      totalDeductions += deductionAmount
      if (d.preTax) {
        taxableAmount -= deductionAmount
      }
      return { ...d, amount: deductionAmount }
    })

    const netPay = grossPay - totalDeductions

    return {
      basicSalary: baseSalary,
      allowances: calculatedAllowances,
      deductions: calculatedDeductions,
      grossPay,
      totalDeductions,
      netPay,
    }
  }

  const details = calculateAmounts(structure)
  const annualSalary = details.netPay * 12 // Assuming monthly frequency

  return (
    <div className="space-y-6">
      {!structure ? (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Payroll Structure</CardTitle>
            <CardDescription>Loading structure details...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No payroll structure assigned or data is loading.</p>
          </CardContent>
        </Card>
      ) : (
        <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Payroll Structure</CardTitle>
            <CardDescription>Current payroll structure and calculations</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileEdit className="mr-2 h-4 w-4" />
              Override Values
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md border p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-medium">{structure.name || "Unnamed Structure"}</h3>
                <p className="text-sm text-muted-foreground">
                  {/* Assuming assignment info is not directly on structure, using placeholder */}
                  Assigned on {structure.createdAt ? new Date(structure.createdAt).toLocaleDateString() : "N/A"} by {"System"}
                </p>
              </div>
              <Badge variant="outline" className="md:self-start">
                {structure.frequency || "N/A"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm font-medium">Earnings</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Fixed</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">K{details.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  {details.allowances.map((allowance: any) => (
                    <TableRow key={allowance._id || allowance.name}>
                      <TableCell>{allowance.name}</TableCell>
                      <TableCell>{allowance.type === "percentage" ? "Percentage" : "Fixed"}</TableCell>
                      <TableCell className="text-right">
                        {allowance.type === "percentage" ? `${allowance.value}%` : `K${allowance.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </TableCell>
                      <TableCell className="text-right">K{allowance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium">
                    <TableCell>Total Earnings</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right">K{details.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium">Deductions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.deductions.map((deduction: any) => (
                    <TableRow key={deduction._id || deduction.name}>
                      <TableCell>
                        {deduction.name}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({deduction.preTax ? "Pre-Tax" : "Post-Tax"})
                        </span>
                      </TableCell>
                      <TableCell>{deduction.type === "percentage" ? "Percentage" : "Fixed"}</TableCell>
                      <TableCell className="text-right">
                        {deduction.type === "percentage" ? `${deduction.value}%` : `K${deduction.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </TableCell>
                      <TableCell className="text-right">K{deduction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium">
                    <TableCell>Total Deductions</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right">
                      K{details.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Net Monthly Salary</h3>
              <p className="text-2xl font-bold">K{details.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Annual Salary</h3>
              <p className="text-lg font-medium">K{annualSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structure Change History</CardTitle>
          <CardDescription>Record of payroll structure changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Previous Structure</TableHead>
                <TableHead>New Structure</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Replace with actual structure change history */}
              <TableRow>
                 <TableCell colSpan={5} className="text-center text-muted-foreground">
                   Structure change history not yet implemented.
                 </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
