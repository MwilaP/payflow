"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, DollarSign } from "lucide-react"
import { useDatabase } from "@/lib/db/db-context"

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
          .filter((payroll) => payroll.status === "pending")
          .sort((a, b) => new Date(a.paymentDate || 0).getTime() - new Date(b.paymentDate || 0).getTime())
          .slice(0, 3)

        setUpcomingPayrolls(pending)
      } catch (error) {
        console.error("Error loading upcoming payrolls:", error)
        setUpcomingPayrolls([])
      }
    }

    loadUpcomingPayrolls()
  }, [payrollHistoryService])

  const handleGeneratePayroll = () => {
    navigate("/payroll/generate")
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CalendarDays className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No upcoming payrolls</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4">Generate your first payroll to get started</p>
      <Button onClick={handleGeneratePayroll} size="sm">
        Generate Payroll
      </Button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payroll</CardTitle>
        <CardDescription>Scheduled payroll runs for your organization</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : upcomingPayrolls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {upcomingPayrolls.map((payroll) => (
              <div key={payroll._id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{payroll.period || "Monthly Payroll"}</p>
                    <p className="text-sm text-muted-foreground">
                      {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : "No date set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">${payroll.totalAmount?.toLocaleString() || "0"}</div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/payroll/history/${payroll._id}`)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
