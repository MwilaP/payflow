'use client'

import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  Users,
  FileText,
  BarChart,
  RefreshCw,
  Upload,
  Plus,
  History,
  TrendingUp,
  ArrowLeft
} from 'lucide-react'
import { PayrollGenerate } from '@/components/payroll-generate'
import { PayrollStructures } from '@/components/payroll-structures'
import { PayrollHistory } from '@/components/payroll-history'
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
  const navigate = useNavigate()

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
      <div className="space-y-6 p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage payroll processing, history, and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/payroll/generate')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Payroll</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold animate-pulse">Loading...</div>
              ) : error ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : lastPayroll && lastPayroll.totalAmount ? (
                <>
                  <div className="text-2xl font-bold">
                    K{lastPayroll.totalAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lastPayroll.date
                      ? format(new Date(lastPayroll.date), 'MMMM yyyy')
                      : 'Date unknown'}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">K0</div>
                  <p className="text-xs text-muted-foreground mt-1">No completed payroll</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payroll (Est.)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold animate-pulse">Loading...</div>
              ) : error ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : nextPayrollEstimate > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    K{nextPayrollEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(), 'MMMM yyyy')} (Estimated)
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">K0</div>
                  <p className="text-xs text-muted-foreground mt-1">No estimate available</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Payroll</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold animate-pulse">Loading...</div>
              ) : error ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">K{ytdTotal.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">{ytdPeriod}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common payroll tasks and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-accent"
                onClick={() => navigate('/payroll/generate')}
              >
                <DollarSign className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Generate Payroll</div>
                  <div className="text-xs text-muted-foreground mt-1">Create new payroll</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-accent"
                onClick={() => navigate('/payroll/structures')}
              >
                <FileText className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Structures</div>
                  <div className="text-xs text-muted-foreground mt-1">Manage pay structures</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-accent"
                onClick={() => navigate('/payroll/import')}
              >
                <Upload className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Import Data</div>
                  <div className="text-xs text-muted-foreground mt-1">Upload payroll data</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:bg-accent"
                onClick={() => navigate('/payroll/history')}
              >
                <History className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-semibold">Payroll History</div>
                  <div className="text-xs text-muted-foreground mt-1">View past payrolls</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <Route
          path="/history"
          element={
            <AppLayout>
              <div className="space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="w-fit"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Payroll
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payroll History</h1>
                    <p className="text-muted-foreground mt-1">
                      View and manage all payroll records
                    </p>
                  </div>
                </div>
                <PayrollHistory />
              </div>
            </AppLayout>
          }
        />
        <Route path="/history/:id" element={<PayrollHistoryDetailPage />} />
        <Route path="/history/:id/report" element={<PayrollReportPage />} />
        <Route path="/import" element={<PayrollImportPage />} />
      </Routes>
    </div>
  )
}
