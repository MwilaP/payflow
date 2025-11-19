"use client"

import { useEffect, useState } from "react"
import { Link, Routes, Route, Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CreditCard, DollarSign, Users, FileText, BarChart, RefreshCw, Upload } from "lucide-react"
import { PayrollGenerate } from "@/components/payroll-generate"
import { PayrollStructures } from "@/components/payroll-structures"
import { PayrollHistory } from "@/components/payroll-history"
import { PayrollSettings } from "@/components/payroll-settings"
import PayrollStructureNewPage from "./PayrollStructureNewPage"
import PayrollStructureEditPage from "./PayrollStructureEditPage"
import PayrollHistoryDetailPage from "./PayrollHistoryDetailPage"
import PayrollImportPage from "./PayrollImportPage"
import { format } from "date-fns"
import { payrollHistoryService } from "@/lib/db/services/payroll-history.service"
import { useDatabase } from "@/lib/db/db-context"
import type { PayrollHistory as PayrollHistoryType } from "@/lib/db/services/payroll-history.service"

function PayrollDashboard() {
  // State for payroll data
  const [lastPayroll, setLastPayroll] = useState<PayrollHistoryType | null>(null)
  const [nextPayrollEstimate, setNextPayrollEstimate] = useState<number>(0)
  const [ytdTotal, setYtdTotal] = useState<number>(0)
  const [ytdPeriod, setYtdPeriod] = useState<string>("")
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const { db } = useDatabase()
  
  // Fetch payroll data
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!db) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        // Get payroll history service
        const payrollService = payrollHistoryService(db)
        
        // Get all payroll records
        const records = await payrollService.getAllPayrollRecords()
        
        if (records && records.length > 0) {
          // Sort by date (newest first)
          const sortedRecords = [...records].sort((a, b) => {
            return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
          })
          
          // Get last completed payroll
          const lastCompletedPayroll = sortedRecords.find(record => record.status === "completed")
          setLastPayroll(lastCompletedPayroll || null)
          
          // Calculate next payroll estimate (5% increase from last payroll)
          if (lastCompletedPayroll && lastCompletedPayroll.totalAmount) {
            setNextPayrollEstimate(lastCompletedPayroll.totalAmount * 1.05)
          }
          
          // Calculate YTD total
          const currentYear = new Date().getFullYear()
          const ytdRecords = records.filter((record: PayrollHistoryType) => {
            const recordDate = new Date(record.date || 0)
            return recordDate.getFullYear() === currentYear && record.status === "completed"
          })
          
          const total = ytdRecords.reduce((sum: number, record: PayrollHistoryType) => sum + (record.totalAmount || 0), 0)
          setYtdTotal(total)
          
          // Set YTD period
          if (ytdRecords.length > 0) {
            const firstMonth = new Date(
              Math.min(...ytdRecords.map((r: PayrollHistoryType) => new Date(r.date || 0).getTime()))
            )
            const lastMonth = new Date(
              Math.max(...ytdRecords.map((r: PayrollHistoryType) => new Date(r.date || 0).getTime()))
            )
            
            setYtdPeriod(`${format(firstMonth, "MMM")} - ${format(lastMonth, "MMM")} ${currentYear}`)
          } else {
            setYtdPeriod(`${currentYear}`)
          }
        }
        
        setError(null)
      } catch (err: any) {
        console.error("Error fetching payroll data:", err)
        setError(err.message || "Failed to fetch payroll data")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPayrollData()
  }, [db])
  
  // Function to refresh data
  const handleRefresh = () => {
    setIsLoading(true)
    // Re-trigger the useEffect by updating a dependency
    setYtdPeriod(prev => prev + " ")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/payroll/structures">
              <FileText className="mr-2 h-4 w-4" />
              Manage Structures
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/payroll/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Payroll
            </Link>
          </Button>
          <Button asChild>
            <Link to="/payroll/generate">
              <DollarSign className="mr-2 h-4 w-4" />
              Generate Payroll
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="history" className="mt-6">
        <TabsList>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payroll Summary</CardTitle>
                  <CardDescription>Overview of recent payroll activity</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Payroll</h3>
                  {isLoading ? (
                    <p className="mt-1 text-2xl font-bold animate-pulse">Loading...</p>
                  ) : error ? (
                    <p className="mt-1 text-lg text-red-500">Error loading data</p>
                  ) : lastPayroll && lastPayroll.totalAmount ? (
                    <>
                      <p className="mt-1 text-2xl font-bold">K{lastPayroll.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {lastPayroll.date ? format(new Date(lastPayroll.date), "MMMM yyyy") : "Date unknown"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-2xl font-bold">K0</p>
                      <p className="text-xs text-muted-foreground">No completed payroll</p>
                    </>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Next Payroll</h3>
                  {isLoading ? (
                    <p className="mt-1 text-2xl font-bold animate-pulse">Loading...</p>
                  ) : error ? (
                    <p className="mt-1 text-lg text-red-500">Error loading data</p>
                  ) : nextPayrollEstimate > 0 ? (
                    <>
                      <p className="mt-1 text-2xl font-bold">K{nextPayrollEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(), "MMMM yyyy")} (Estimated)
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-2xl font-bold">K0</p>
                      <p className="text-xs text-muted-foreground">No estimate available</p>
                    </>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">YTD Payroll</h3>
                  {isLoading ? (
                    <p className="mt-1 text-2xl font-bold animate-pulse">Loading...</p>
                  ) : error ? (
                    <p className="mt-1 text-lg text-red-500">Error loading data</p>
                  ) : (
                    <>
                      <p className="mt-1 text-2xl font-bold">K{ytdTotal.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{ytdPeriod}</p>
                    </>
                  )}
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
        <Route path="/import" element={<PayrollImportPage />} />
      </Routes>
    </div>
  )
}
