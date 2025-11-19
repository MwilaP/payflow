"use client"

import { Download, FileText } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const departmentData = [
  { name: "Engineering", value: 45, color: "#0ea5e9" },
  { name: "Marketing", value: 20, color: "#f97316" },
  { name: "Finance", value: 15, color: "#8b5cf6" },
  { name: "Human Resources", value: 10, color: "#10b981" },
  { name: "Product", value: 25, color: "#f59e0b" },
  { name: "Design", value: 15, color: "#ec4899" },
  { name: "Sales", value: 12, color: "#6366f1" },
]

export function EmployeeReports() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employees by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Employee Statistics</CardTitle>
            <CardDescription>Key employee metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Employees</h3>
                <p className="mt-1 text-2xl font-bold">142</p>
                <p className="text-xs text-muted-foreground">+4 from last month</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">New Hires</h3>
                <p className="mt-1 text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">In the last 30 days</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Turnover Rate</h3>
                <p className="mt-1 text-2xl font-bold">2.8%</p>
                <p className="text-xs text-muted-foreground">-0.5% from last month</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Avg. Tenure</h3>
                <p className="mt-1 text-2xl font-bold">2.3 yrs</p>
                <p className="text-xs text-muted-foreground">+0.2 from last year</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border p-4">
              <h3 className="text-sm font-medium">Employment Type</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Full Time</span>
                  <span className="text-sm font-medium">115 (81%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "81%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Part Time</span>
                  <span className="text-sm font-medium">15 (11%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "11%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contract</span>
                  <span className="text-sm font-medium">8 (5%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "5%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Intern</span>
                  <span className="text-sm font-medium">4 (3%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "3%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department Summary</CardTitle>
          <CardDescription>Employee and cost breakdown by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select defaultValue="2025">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Avg. Salary</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Headcount Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Engineering</TableCell>
                  <TableCell className="text-right">45</TableCell>
                  <TableCell className="text-right">$85,000</TableCell>
                  <TableCell className="text-right">$3,825,000</TableCell>
                  <TableCell className="text-right text-green-600">+3</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing</TableCell>
                  <TableCell className="text-right">20</TableCell>
                  <TableCell className="text-right">$75,000</TableCell>
                  <TableCell className="text-right">$1,500,000</TableCell>
                  <TableCell className="text-right text-green-600">+1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Finance</TableCell>
                  <TableCell className="text-right">15</TableCell>
                  <TableCell className="text-right">$80,000</TableCell>
                  <TableCell className="text-right">$1,200,000</TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Human Resources</TableCell>
                  <TableCell className="text-right">10</TableCell>
                  <TableCell className="text-right">$70,000</TableCell>
                  <TableCell className="text-right">$700,000</TableCell>
                  <TableCell className="text-right text-green-600">+1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Product</TableCell>
                  <TableCell className="text-right">25</TableCell>
                  <TableCell className="text-right">$95,000</TableCell>
                  <TableCell className="text-right">$2,375,000</TableCell>
                  <TableCell className="text-right text-red-600">-1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Design</TableCell>
                  <TableCell className="text-right">15</TableCell>
                  <TableCell className="text-right">$80,000</TableCell>
                  <TableCell className="text-right">$1,200,000</TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sales</TableCell>
                  <TableCell className="text-right">12</TableCell>
                  <TableCell className="text-right">$90,000</TableCell>
                  <TableCell className="text-right">$1,080,000</TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">142</TableCell>
                  <TableCell className="text-right">$82,957</TableCell>
                  <TableCell className="text-right">$11,880,000</TableCell>
                  <TableCell className="text-right text-green-600">+4</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Access and download standard employee reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Employee Directory</h3>
                  <p className="text-sm text-muted-foreground">Complete employee directory with contact details</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Headcount Report</h3>
                  <p className="text-sm text-muted-foreground">Employee headcount by department and location</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">New Hires Report</h3>
                  <p className="text-sm text-muted-foreground">List of new employees in the last 90 days</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Turnover Report</h3>
                  <p className="text-sm text-muted-foreground">Employee turnover analysis by department</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Salary Distribution</h3>
                  <p className="text-sm text-muted-foreground">Analysis of salary distribution across the company</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Anniversary Report</h3>
                  <p className="text-sm text-muted-foreground">Upcoming work anniversaries in the next 30 days</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download
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
