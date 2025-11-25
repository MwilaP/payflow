'use client'

import { useEffect, useState } from 'react'
import { Link, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  Users,
  FileText,
  BarChart,
  RefreshCw,
  Upload
} from 'lucide-react'
import { PayrollGenerate } from '@/components/payroll-generate'
import { PayrollStructures } from '@/components/payroll-structures'
import { PayrollHistory } from '@/components/payroll-history'
import { PayrollSettings } from '@/components/payroll-settings'
import { AppLayout } from '@/components/app-layout'
import PayrollStructureNewPage from './PayrollStructureNewPage'
import PayrollStructureEditPage from './PayrollStructureEditPage'
import PayrollHistoryDetailPage from './PayrollHistoryDetailPage'
import PayrollReportPage from './PayrollReportPage'
import PayrollImportPage from './PayrollImportPage'
import { format } from 'date-fns'
import { getPayrollHistoryService } from '@/lib/db/services/service-factory'
import type { PayrollHistory as PayrollHistoryType } from '@/lib/db/services/payroll-history.service'

function PayrollDashboard() {
  // State for payroll data
  const [lastPayroll, setLastPayroll] = useState<PayrollHistoryType | null>(null)
  const [nextPayrollEstimate, setNextPayrollEstimate] = useState<number>(0)
  const [ytdTotal, setYtdTotal] = useState<number>(0)
  const [ytdPeriod, setYtdPeriod] = useState<string>('')

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch payroll data
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setIsLoading(true)

        // Get payroll history service
        const payrollService = await getPayrollHistoryService()

        // Get all payroll records
        const records = await payrollService.getAllPayrollRecords()

        if (records && records.length > 0) {
          // Sort by date (newest first)
          const sortedRecords = [...records].sort((a, b) => {
            return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
          })

          // Get last completed payroll
          const lastCompletedPayroll = sortedRecords.find((record) => record.status === 'completed')
          setLastPayroll(lastCompletedPayroll || null)

          // Calculate next payroll estimate (5% increase from last payroll)
          if (lastCompletedPayroll && lastCompletedPayroll.totalAmount) {
            setNextPayrollEstimate(lastCompletedPayroll.totalAmount * 1.05)
          }

          // Calculate YTD total
          const currentYear = new Date().getFullYear()
          const ytdRecords = records.filter((record: PayrollHistoryType) => {
            const recordDate = new Date(record.date || 0)
            return recordDate.getFullYear() === currentYear && record.status === 'completed'
          })

          const total = ytdRecords.reduce(
            (sum: number, record: PayrollHistoryType) => sum + (record.totalAmount || 0),
            0
          )
          setYtdTotal(total)

          // Set YTD period
          if (ytdRecords.length > 0) {
            const firstMonth = new Date(
              Math.min(
                ...ytdRecords.map((r: PayrollHistoryType) => new Date(r.date || 0).getTime())
              )
            )
            const lastMonth = new Date(
              Math.max(
                ...ytdRecords.map((r: PayrollHistoryType) => new Date(r.date || 0).getTime())
              )
            )

            setYtdPeriod(
              `${format(firstMonth, 'MMM')} - ${format(lastMonth, 'MMM')} ${currentYear}`
            )
          } else {
            setYtdPeriod(`${currentYear}`)
          }
        }

        setError(null)
      } catch (err: any) {
        console.error('Error fetching payroll data:', err)
        setError(err.message || 'Failed to fetch payroll data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayrollData()
  }, [])

  // Function to refresh data
  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      const payrollService = await getPayrollHistoryService()
      const records = await payrollService.getAllPayrollRecords()

      if (records && records.length > 0) {
        const sortedRecords = [...records].sort((a, b) => {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        })

        const lastCompletedPayroll = sortedRecords.find((record) => record.status === 'completed')
        setLastPayroll(lastCompletedPayroll || null)

        if (lastCompletedPayroll && lastCompletedPayroll.totalAmount) {
          setNextPayrollEstimate(lastCompletedPayroll.totalAmount * 1.05)
        }

        const currentYear = new Date().getFullYear()
        const ytdRecords = records.filter((record: PayrollHistoryType) => {
          const recordDate = new Date(record.date || 0)
          return recordDate.getFullYear() === currentYear && record.status === 'completed'
        })

        const total = ytdRecords.reduce(
          (sum: number, record: PayrollHistoryType) => sum + (record.totalAmount || 0),
          0
        )
        setYtdTotal(total)

        if (ytdRecords.length > 0) {
          const firstMonth = new Date(
            Math.min(...ytdRecords.map((r: PayrollHistoryType) => new Date(r.date || 0).getTime()))
          )
          const lastMonth = new Date(
            Math.max(...ytdRecords.map((r: PayrollHistoryType) => new Date(r.date || 0).getTime()))
          )

          setYtdPeriod(`${format(firstMonth, 'MMM')} - ${format(lastMonth, 'MMM')} ${currentYear}`)
        } else {
          setYtdPeriod(`${currentYear}`)
        }
      }
      setError(null)
    } catch (err) {
      console.error('Error refreshing payroll data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh payroll data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6 md:p-10">

      <Tabs defaultValue="history" className="mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
          <TabsTrigger value="history" className="text-base">Payroll History</TabsTrigger>
          <TabsTrigger value="settings" className="text-base">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Payroll Summary</CardTitle>
                  <CardDescription className="text-base mt-1">Overview of recent payroll activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="shadow-sm">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Last Payroll</h3>
                    </div>
                    {isLoading ? (
                      <p className="mt-2 text-3xl font-bold animate-pulse">Loading...</p>
                    ) : error ? (
                      <p className="mt-2 text-lg text-red-500">Error loading data</p>
                    ) : lastPayroll && lastPayroll.totalAmount ? (
                      <>
                        <p className="mt-2 text-3xl font-bold tracking-tight">
                          K{lastPayroll.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {lastPayroll.date
                            ? format(new Date(lastPayroll.date), 'MMMM yyyy')
                            : 'Date unknown'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-3xl font-bold tracking-tight">K0</p>
                        <p className="text-sm text-muted-foreground mt-2">No completed payroll</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Next Payroll</h3>
                    </div>
                    {isLoading ? (
                      <p className="mt-2 text-3xl font-bold animate-pulse">Loading...</p>
                    ) : error ? (
                      <p className="mt-2 text-lg text-red-500">Error loading data</p>
                    ) : nextPayrollEstimate > 0 ? (
                      <>
                        <p className="mt-2 text-3xl font-bold tracking-tight">
                          K
                          {nextPayrollEstimate.toLocaleString(undefined, {
                            maximumFractionDigits: 0
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {format(new Date(), 'MMMM yyyy')} (Estimated)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-3xl font-bold tracking-tight">K0</p>
                        <p className="text-sm text-muted-foreground mt-2">No estimate available</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">YTD Payroll</h3>
                    </div>
                    {isLoading ? (
                      <p className="mt-2 text-3xl font-bold animate-pulse">Loading...</p>
                    ) : error ? (
                      <p className="mt-2 text-lg text-red-500">Error loading data</p>
                    ) : (
                      <>
                        <p className="mt-2 text-3xl font-bold tracking-tight">K{ytdTotal.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-2">{ytdPeriod}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <PayrollHistory />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <PayrollSettings />
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  )
}

export default function PayrollPage() {
  return (
    <div className="h-full overflow-hidden">
      <Routes>
        <Route path="/" element={<PayrollDashboard />} />
        <Route path="/generate" element={<PayrollGenerate />} />
        <Route path="/structures" element={<PayrollStructures />} />
        <Route path="/structures/new" element={<PayrollStructureNewPage />} />
        <Route path="/structures/:id/edit" element={<PayrollStructureEditPage />} />
        <Route path="/history" element={<PayrollHistory />} />
        <Route path="/history/:id" element={<PayrollHistoryDetailPage />} />
        <Route path="/history/:id/report" element={<PayrollReportPage />} />
        <Route path="/import" element={<PayrollImportPage />} />
      </Routes>
    </div>
  )
}
