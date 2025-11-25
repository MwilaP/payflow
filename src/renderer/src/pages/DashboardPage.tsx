import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, FileText, BarChart4, TrendingUp, Briefcase, Clock, ArrowUpRight } from 'lucide-react'
import { DashboardChart } from '@/components/dashboard-chart'
import { RecentEmployees } from '@/components/recent-employees'
import { UpcomingPayroll } from '@/components/upcoming-payroll'
import { AppLayout } from '@/components/app-layout'
import { useState, useEffect } from 'react'
import { useDatabase } from '@/lib/db/db-context'

export default function DashboardPage() {
  const { employeeService, payrollHistoryService } = useDatabase()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    monthlyPayroll: 0,
    pendingPayrolls: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        
        if (employeeService) {
          const employees = await employeeService.getAllEmployees()
          const active = employees.filter((emp: any) => emp.status === 'Active')
          setStats(prev => ({
            ...prev,
            totalEmployees: employees.length,
            activeEmployees: active.length
          }))
        }

        if (payrollHistoryService) {
          const payrolls = await payrollHistoryService.getAllPayrollRecords()
          const pending = payrolls.filter((p: any) => p.status === 'pending')
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          const monthlyPayrolls = payrolls.filter((p: any) => {
            const date = new Date(p.date)
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear && p.status === 'completed'
          })
          const monthlyTotal = monthlyPayrolls.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0)
          
          setStats(prev => ({
            ...prev,
            monthlyPayroll: monthlyTotal,
            pendingPayrolls: pending.length
          }))
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [employeeService, payrollHistoryService])

  return (
    <AppLayout>
      <div className="space-y-8 p-6 md:p-10 animate-fade-in">

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoading ? '...' : stats.totalEmployees}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stats.activeEmployees} active</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Payroll</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoading ? '...' : `K${stats.monthlyPayroll.toLocaleString()}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Current month total
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payrolls</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoading ? '...' : stats.pendingPayrolls}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Awaiting processing
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <h3 className="text-3xl font-bold mt-2">
                  {isLoading ? '...' : '8'}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Active departments
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Payroll Chart */}
        <Card className="col-span-full lg:col-span-4 border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Payroll Overview</CardTitle>
                <CardDescription className="text-base mt-1">Monthly payroll trends for the year</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="shadow-sm">
                <Link to="/payroll">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-full lg:col-span-3 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription className="text-base mt-1">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start h-14 shadow-sm hover:shadow-md transition-shadow">
                <Link to="/employees/new">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Add Employee</p>
                      <p className="text-xs text-muted-foreground">Create new employee profile</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-14 shadow-sm hover:shadow-md transition-shadow">
                <Link to="/payroll/structures">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Payroll Structures</p>
                      <p className="text-xs text-muted-foreground">Manage salary structures</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-14 shadow-sm hover:shadow-md transition-shadow">
                <Link to="/payroll/generate">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Generate Payroll</p>
                      <p className="text-xs text-muted-foreground">Process employee payments</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-14 shadow-sm hover:shadow-md transition-shadow">
                <Link to="/reports">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <BarChart4 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">View Reports</p>
                      <p className="text-xs text-muted-foreground">Analytics and insights</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentEmployees />
        <UpcomingPayroll />
      </div>
      </div>
    </AppLayout>
  )
}
