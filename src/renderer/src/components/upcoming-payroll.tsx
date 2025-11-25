'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, DollarSign } from 'lucide-react'
import { useDatabase } from '@/lib/db/db-context'

export function UpcomingPayroll() {
  const navigate = useNavigate()
  const { payrollHistoryService, isLoading } = useDatabase()
  const [upcomingPayrolls, setUpcomingPayrolls] = useState<any[]>([])

  useEffect(() => {
    const loadUpcomingPayrolls = async () => {
      if (!payrollHistoryService) return

      try {
        const data = await payrollHistoryService.getAllPayrollRecords()
        // Filter for pending payrolls and sort by payment date
        const pending = data
          .filter((payroll) => payroll.status === 'pending')
          .sort(
            (a, b) =>
              new Date(a.paymentDate || 0).getTime() - new Date(b.paymentDate || 0).getTime()
          )
          .slice(0, 3)

        setUpcomingPayrolls(pending)
      } catch (error) {
        console.error('Error loading upcoming payrolls:', error)
        setUpcomingPayrolls([])
      }
    }

    loadUpcomingPayrolls()
  }, [payrollHistoryService])

  const handleGeneratePayroll = () => {
    navigate('/payroll/generate')
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <CalendarDays className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">No upcoming payrolls</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-xs">
        Generate your first payroll to schedule payments
      </p>
      <Button onClick={handleGeneratePayroll} size="lg" className="shadow-md">
        <DollarSign className="mr-2 h-4 w-4" />
        Generate Payroll
      </Button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="animate-pulse space-y-3 w-full">
        <div className="h-16 bg-muted rounded-lg"></div>
        <div className="h-16 bg-muted rounded-lg"></div>
        <div className="h-16 bg-muted rounded-lg"></div>
      </div>
    </div>
  )

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Upcoming Payroll</CardTitle>
        <CardDescription className="text-base mt-1">Scheduled payroll runs for your organization</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : upcomingPayrolls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {upcomingPayrolls.map((payroll) => (
              <div
                key={payroll._id}
                className="flex items-center justify-between space-x-4 rounded-xl border p-4 hover:bg-muted/30 transition-colors cursor-pointer shadow-sm"
                onClick={() => navigate(`/payroll/history/${payroll._id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {payroll.period || 'Monthly Payroll'}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {payroll.paymentDate
                        ? new Date(payroll.paymentDate).toLocaleDateString()
                        : 'No date set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-bold">
                    K{payroll.totalAmount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
