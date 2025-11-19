import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, CalendarDays, FileText, BarChart4 } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { RecentEmployees } from "@/components/recent-employees"
import { UpcomingPayroll } from "@/components/upcoming-payroll"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your payroll overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Link to="/employees/new">
              <Users className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Link to="/payroll/generate">
              <DollarSign className="mr-2 h-4 w-4" />
              Generate Payroll
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mt-6 border-primary/10 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-primary">Getting Started</CardTitle>
            <CardDescription>Follow these steps to set up your payroll system</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-500 p-2 shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-900">1. Add Employees</h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    Create employee profiles with personal details, job information, and banking details.
                  </p>
                  <Button asChild className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                    <Link to="/employees/new">Add Employees</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-500 p-2 shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">2. Create Payroll Structures</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Define how employee salaries are calculated, including basic salary, allowances, and deductions.
                  </p>
                  <Button asChild className="mt-2 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <Link to="/payroll/structures">Create Structures</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-purple-500 p-2 shadow-sm">
                  <BarChart4 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900">3. Generate Payroll</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Process payroll for your employees based on their assigned structures and generate payslips.
                  </p>
                  <Button asChild className="mt-2 bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                    <Link to="/payroll/generate">Generate Payroll</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
