"use client"

import { Download, FileText } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const leaveTypeData = [
  { name: "Annual Leave", value: 120, color: "#0ea5e9" },
  { name: "Sick Leave", value: 45, color: "#f97316" },
  { name: "Personal Leave", value: 30, color: "#8b5cf6" },
  { name: "Maternity/Paternity", value: 15, color: "#10b981" },
  { name: "Unpaid Leave", value: 10, color: "#f59e0b" },
]

export function LeaveReports() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Type Distribution</CardTitle>
            <CardDescription>Breakdown of leave by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} days`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave Statistics</CardTitle>
            <CardDescription>Key leave metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Leave Days</h3>
                <p className="mt-1 text-2xl font-bold">220</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Pending Requests</h3>
                <p className="mt-1 text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Avg. Leave Duration</h3>
                <p className="mt-1 text-2xl font-bold">3.2 days</p>
                <p className="text-xs text-muted-foreground">Per request</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Approval Rate</h3>
                <p className="mt-1 text-2xl font-bold">94%</p>
                <p className="text-xs text-muted-foreground">Of all requests</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border p-4">
              <h3 className="text-sm font-medium">Department Leave Usage</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engineering</span>
                  <span className="text-sm font-medium">85 days (39%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "39%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing</span>
                  <span className="text-sm font-medium">45 days (20%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "20%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Finance</span>
                  <span className="text-sm font-medium">35 days (16%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "16%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Other Departments</span>
                  <span className="text-sm font-medium">55 days (25%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leave Summary by Department</CardTitle>
          <CardDescription>Leave usage breakdown by department</CardDescription>
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
                  <TableHead className="text-right">Annual Leave</TableHead>
                  <TableHead className="text-right">Sick Leave</TableHead>
                  <TableHead className="text-right">Other Leave</TableHead>
                  <TableHead className="text-right">Total Days</TableHead>
                  <TableHead className="text-right">Avg. per Employee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Engineering</TableCell>
                  <TableCell className="text-right">60</TableCell>
                  <TableCell className="text-right">15</TableCell>
                  <TableCell className="text-right">10</TableCell>
                  <TableCell className="text-right">85</TableCell>
                  <TableCell className="text-right">1.9</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing</TableCell>
                  <TableCell className="text-right">25</TableCell>
                  <TableCell className="text-right">12</TableCell>
                  <TableCell className="text-right">8</TableCell>
                  <TableCell className="text-right">45</TableCell>
                  <TableCell className="text-right">2.3</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Finance</TableCell>
                  <TableCell className="text-right">20</TableCell>
                  <TableCell className="text-right">10</TableCell>
                  <TableCell className="text-right">5</TableCell>
                  <TableCell className="text-right">35</TableCell>
                  <TableCell className="text-right">2.3</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Human Resources</TableCell>
                  <TableCell className="text-right">10</TableCell>
                  <TableCell className="text-right">5</TableCell>
                  <TableCell className="text-right">5</TableCell>
                  <TableCell className="text-right">20</TableCell>
                  <TableCell className="text-right">2.0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Product</TableCell>
                  <TableCell className="text-right">15</TableCell>
                  <TableCell className="text-right">8</TableCell>
                  <TableCell className="text-right">12</TableCell>
                  <TableCell className="text-right">35</TableCell>
                  <TableCell className="text-right">1.4</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">130</TableCell>
                  <TableCell className="text-right">50</TableCell>
                  <TableCell className="text-right">40</TableCell>
                  <TableCell className="text-right">220</TableCell>
                  <TableCell className="text-right">1.9</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Leave Reports</CardTitle>
          <CardDescription>Access and download standard leave reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Leave Balance Report</h3>
                  <p className="text-sm text-muted-foreground">Current leave balances for all employees</p>
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
                  <h3 className="font-medium">Leave Usage Report</h3>
                  <p className="text-sm text-muted-foreground">Detailed leave usage by employee</p>
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
                  <h3 className="font-medium">Pending Leave Requests</h3>
                  <p className="text-sm text-muted-foreground">List of all pending leave requests</p>
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
                  <h3 className="font-medium">Leave Calendar</h3>
                  <p className="text-sm text-muted-foreground">Calendar view of all approved leave</p>
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
                  <h3 className="font-medium">Leave Accrual Report</h3>
                  <p className="text-sm text-muted-foreground">Leave accrual and usage over time</p>
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
                  <h3 className="font-medium">Department Coverage</h3>
                  <p className="text-sm text-muted-foreground">Department coverage during leave periods</p>
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
