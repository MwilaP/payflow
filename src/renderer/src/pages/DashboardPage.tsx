import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Users, FileText, BarChart4, ArrowRight } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

export default function DashboardPage(): JSX.Element {
  return (
    <AppLayout>
      <div className="h-full p-8 md:p-12 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Payroll Management System
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your payroll operations with quick access to essential tools
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group border-2 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer">
              <Link to="/employees/new" className="block">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-all">
                      <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Add Employee</h3>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Create new employee profiles and manage personnel records
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer">
              <Link to="/payroll/structures" className="block">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Payroll Structures</h3>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Configure and manage salary structures and compensation plans
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group border-2 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer">
              <Link to="/payroll/generate" className="block">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all">
                      <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Generate Payroll</h3>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Process employee payments and generate payslips
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer">
              <Link to="/reports" className="block">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 group-hover:from-orange-500/30 group-hover:to-orange-600/20 transition-all">
                      <BarChart4 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">View Reports</h3>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Access comprehensive analytics and payroll insights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
