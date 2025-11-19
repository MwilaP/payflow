'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface Allowance {
  id: string
  name: string
  type: 'fixed' | 'percentage'
  value: number
}

interface Deduction {
  id: string
  name: string
  type: 'fixed' | 'percentage'
  value: number
  preTax: boolean
}

interface PayrollStructureSummaryProps {
  basicSalary: number
  allowances: Allowance[]
  deductions: Deduction[]
  frequency: string
}

export function PayrollStructureSummary({
  basicSalary,
  allowances,
  deductions,
  frequency
}: PayrollStructureSummaryProps) {
  // Calculate total allowances
  const totalAllowances = allowances.reduce((total, allowance) => {
    if (allowance.type === 'fixed') {
      return total + allowance.value
    } else {
      // Percentage of basic salary
      return total + (allowance.value / 100) * basicSalary
    }
  }, 0)

  // Calculate gross pay
  const grossPay = basicSalary + totalAllowances

  // Calculate pre-tax deductions
  const preTaxDeductions = deductions
    .filter((deduction) => deduction.preTax)
    .reduce((total, deduction) => {
      if (deduction.type === 'fixed') {
        return total + deduction.value
      } else {
        // Percentage of gross pay
        return total + (deduction.value / 100) * grossPay
      }
    }, 0)

  // Calculate taxable income
  const taxableIncome = grossPay - preTaxDeductions

  // Calculate post-tax deductions
  const postTaxDeductions = deductions
    .filter((deduction) => !deduction.preTax)
    .reduce((total, deduction) => {
      if (deduction.type === 'fixed') {
        return total + deduction.value
      } else {
        // Percentage of gross pay
        return total + (deduction.value / 100) * grossPay
      }
    }, 0)

  // Calculate total deductions
  const totalDeductions = preTaxDeductions + postTaxDeductions

  // Calculate net pay
  const netPay = grossPay - totalDeductions

  // Format frequency for display
  const formatFrequency = (freq: string) => {
    switch (freq) {
      case 'monthly':
        return 'Monthly'
      case 'biweekly':
        return 'Bi-weekly'
      case 'weekly':
        return 'Weekly'
      default:
        return 'Monthly'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pay Summary</CardTitle>
          <CardDescription>Live calculation of pay structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Basic Salary</span>
              <span className="font-medium">ZMW{basicSalary.toLocaleString()}</span>
            </div>
            {allowances.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>Allowances</span>
                  <span>ZMW{totalAllowances.toLocaleString()}</span>
                </div>
                {allowances.map((allowance) => {
                  const amount =
                    allowance.type === 'fixed'
                      ? allowance.value
                      : (allowance.value / 100) * basicSalary
                  return (
                    <div
                      key={allowance.id}
                      className="flex justify-between pl-4 text-xs text-muted-foreground"
                    >
                      <span>
                        {allowance.name || 'Unnamed'}{' '}
                        {allowance.type === 'percentage' && `(${allowance.value}%)`}
                      </span>
                      <span>ZMW{amount.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-b py-2 font-medium">
            <span>Gross Pay</span>
            <span>ZMW{grossPay.toLocaleString()}</span>
          </div>

          {deductions.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Deductions</span>
                <span>-ZMW{totalDeductions.toLocaleString()}</span>
              </div>
              {deductions
                .filter((deduction) => deduction.preTax)
                .map((deduction) => {
                  const amount =
                    deduction.type === 'fixed'
                      ? deduction.value
                      : (deduction.value / 100) * grossPay
                  return (
                    <div
                      key={deduction.id}
                      className="flex justify-between pl-4 text-xs text-muted-foreground"
                    >
                      <span>
                        {deduction.name || 'Unnamed'}{' '}
                        {deduction.type === 'percentage' && `(${deduction.value}%)`}
                        <span className="ml-1 text-xs">(Pre-Tax)</span>
                      </span>
                      <span>-ZMW {amount.toLocaleString()}</span>
                    </div>
                  )
                })}
              {deductions
                .filter((deduction) => !deduction.preTax)
                .map((deduction) => {
                  const amount =
                    deduction.type === 'fixed'
                      ? deduction.value
                      : (deduction.value / 100) * grossPay
                  return (
                    <div
                      key={deduction.id}
                      className="flex justify-between pl-4 text-xs text-muted-foreground"
                    >
                      <span>
                        {deduction.name || 'Unnamed'}{' '}
                        {deduction.type === 'percentage' && `(${deduction.value}%)`}
                        <span className="ml-1 text-xs">(Post-Tax)</span>
                      </span>
                      <span>-ZMW{amount.toLocaleString()}</span>
                    </div>
                  )
                })}
            </div>
          )}

          <div className="rounded-md bg-muted p-4">
            <div className="flex justify-between font-bold">
              <span>Net Pay ({formatFrequency(frequency)})</span>
              <span className="text-xl">ZMW{netPay.toLocaleString()}</span>
            </div>
            {frequency === 'monthly' && (
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Annual</span>
                <span>ZMW{(netPay * 12).toLocaleString()}</span>
              </div>
            )}
            {frequency === 'biweekly' && (
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Annual (26 pay periods)</span>
                <span>ZMW{(netPay * 26).toLocaleString()}</span>
              </div>
            )}
            {frequency === 'weekly' && (
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Annual (52 pay periods)</span>
                <span>ZMW{(netPay * 52).toLocaleString()}</span>
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full" disabled={basicSalary <= 0}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
