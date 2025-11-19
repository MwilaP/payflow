import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
// Removed incorrect import: import { calculateNetSalary } from "@/lib/db/services/payroll-structure.service"

// Define props interface
interface EmployeeSalaryProps {
  salaryData: any // Ideally, define a stricter type based on PayrollStructure
}

export function EmployeeSalary({ salaryData }: EmployeeSalaryProps) {
  // Calculate salary details from the passed structure
  // Note: This calculation might be better done once in the parent or using a dedicated hook/util
  const calculateDetails = (structure: any) => {
    if (!structure) {
      return {
        basicSalary: 0,
        allowances: [],
        deductions: [],
        grossSalary: 0,
        totalDeductions: 0,
        netSalary: 0,
      }
    }

    const baseSalary = structure.basicSalary || 0
    let grossSalary = baseSalary
    const calculatedAllowances = (structure.allowances || []).map((a: any) => {
      const amount = a.type === "percentage" ? (baseSalary * a.value) / 100 : a.value
      grossSalary += amount
      return { ...a, amount }
    })

    let totalDeductions = 0
    let taxableAmount = grossSalary // Simplified tax calculation base for example
    const calculatedDeductions = (structure.deductions || []).map((d: any) => {
      let deductionAmount = 0
      const baseForPercentage = d.preTax ? taxableAmount : grossSalary // Adjust base for percentage calc if needed
      if (d.type === "percentage") {
        deductionAmount = (baseForPercentage * d.value) / 100
      } else {
        deductionAmount = d.value
      }
      totalDeductions += deductionAmount
      if (d.preTax) {
        taxableAmount -= deductionAmount // Adjust taxable amount for pre-tax deductions
      }
      return { ...d, amount: deductionAmount }
    })

    const netSalary = grossSalary - totalDeductions

    return {
      basicSalary: baseSalary,
      allowances: calculatedAllowances,
      deductions: calculatedDeductions,
      grossSalary,
      totalDeductions,
      netSalary,
    }
  }

  const details = calculateDetails(salaryData)
  const monthlySalary = details.netSalary // Assuming structure frequency is monthly
  const annualSalary = monthlySalary * 12
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Salary Structure</CardTitle>
            <CardDescription>Current salary breakdown</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Edit Structure
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm font-medium">Earnings</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Base Salary</TableCell>
                    <TableCell className="text-right">
                      K{details.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                  {details.allowances.map((allowance: any) => (
                    <TableRow key={allowance._id || allowance.name}>
                      <TableCell>{allowance.name}</TableCell>
                      <TableCell className="text-right">
                        K{allowance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium">
                    <TableCell>Total Earnings</TableCell>
                    <TableCell className="text-right">
                      K{details.grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
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
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.deductions.map((deduction: any) => (
                     <TableRow key={deduction._id || deduction.name}>
                       <TableCell>{deduction.name}</TableCell>
                       <TableCell className="text-right">
                         K{deduction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </TableCell>
                     </TableRow>
                  ))}
                  <TableRow className="font-medium">
                    <TableCell>Total Deductions</TableCell>
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
              <h3 className="text-lg font-medium">Net Annual Salary</h3>
              <p className="text-2xl font-bold">
                K{annualSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Monthly Salary</h3>
              <p className="text-lg font-medium">
                K{monthlySalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Salary History</CardTitle>
          <CardDescription>Record of salary changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Previous Salary</TableHead>
                <TableHead>New Salary</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Replace with actual salary history data */}
              <TableRow>
                 <TableCell colSpan={5} className="text-center text-muted-foreground">
                   Salary history data not yet implemented.
                 </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bonuses & One-time Payments</CardTitle>
          <CardDescription>Record of additional payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Bonus
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Replace with actual bonus data */}
              <TableRow>
                 <TableCell colSpan={5} className="text-center text-muted-foreground">
                   Bonus data not yet implemented.
                 </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
