
import type React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface PaySummaryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  structure: any
}

export function PaySummaryModal({ open, onOpenChange, structure }: PaySummaryModalProps) {
  if (!structure) return null

  // Calculate totals
  const basicSalary = structure.basicSalary || 0
  
  const totalAllowances = (structure.allowances || []).reduce((total: number, allowance: any) => {
    if (allowance.type === 'fixed') {
      return total + (allowance.value || 0)
    } else {
      // Percentage allowance
      return total + (basicSalary * (allowance.value || 0)) / 100
    }
  }, 0)

  const totalDeductions = (structure.deductions || []).reduce((total: number, deduction: any) => {
    if (deduction.type === 'fixed') {
      return total + (deduction.value || 0)
    } else {
      // Percentage deduction
      const baseAmount = deduction.preTax ? basicSalary + totalAllowances : basicSalary + totalAllowances
      return total + (baseAmount * (deduction.value || 0)) / 100
    }
  }, 0)

  const grossSalary = basicSalary + totalAllowances
  const netSalary = grossSalary - totalDeductions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Summary - {structure.name}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of salary calculation for this payroll structure
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Structure Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{structure.name}</span>
              </div>
              {structure.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium">{structure.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <Badge variant="outline" className="capitalize">
                  {structure.frequency || "Monthly"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Salary */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Basic Salary</span>
                <span className="font-semibold">ZMW {basicSalary.toLocaleString()}</span>
              </div>

              {/* Allowances */}
              {structure.allowances && structure.allowances.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-green-600">Allowances</div>
                  {structure.allowances.map((allowance: any, index: number) => {
                    const amount = allowance.type === 'fixed' 
                      ? allowance.value 
                      : (basicSalary * allowance.value) / 100
                    return (
                      <div key={index} className="flex justify-between items-center pl-4 text-sm">
                        <span className="text-muted-foreground">
                          {allowance.name} 
                          {allowance.type === 'percentage' && ` (${allowance.value}%)`}
                        </span>
                        <span className="text-green-600">+ZMW {amount.toLocaleString()}</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center pl-4 border-t pt-2">
                    <span className="font-medium text-green-600">Total Allowances</span>
                    <span className="font-semibold text-green-600">+ZMW {totalAllowances.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Gross Salary */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Gross Salary</span>
                <span className="font-semibold text-lg">ZMW {grossSalary.toLocaleString()}</span>
              </div>

              {/* Deductions */}
              {structure.deductions && structure.deductions.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-red-600">Deductions</div>
                  {structure.deductions.map((deduction: any, index: number) => {
                    const baseAmount = deduction.preTax ? grossSalary : grossSalary
                    const amount = deduction.type === 'fixed' 
                      ? deduction.value 
                      : (baseAmount * deduction.value) / 100
                    return (
                      <div key={index} className="flex justify-between items-center pl-4 text-sm">
                        <span className="text-muted-foreground">
                          {deduction.name} 
                          {deduction.type === 'percentage' && ` (${deduction.value}%)`}
                          {deduction.preTax && (
                            <Badge variant="secondary" className="ml-2 text-xs">Pre-tax</Badge>
                          )}
                        </span>
                        <span className="text-red-600">-ZMW {amount.toLocaleString()}</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center pl-4 border-t pt-2">
                    <span className="font-medium text-red-600">Total Deductions</span>
                    <span className="font-semibold text-red-600">-ZMW {totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Net Salary */}
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg">
                <span className="font-semibold text-lg">Net Salary</span>
                <span className="font-bold text-xl text-primary">ZMW {netSalary.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {structure.allowances?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Allowances</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {structure.deductions?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Deductions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {((netSalary / grossSalary) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Take-home</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
