"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { CalendarIcon, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

const data = [
  { name: "Jan", salary: 175000, tax: 43750, pension: 8750, net: 122500 },
  { name: "Feb", salary: 190000, tax: 47500, pension: 9500, net: 133000 },
  { name: "Mar", salary: 245678, tax: 61420, pension: 12284, net: 171974 },
]

export function PayrollReports() {
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
          <CardDescription>Overview of payroll expenses for the year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                <Legend />
                <Bar dataKey="salary" name="Gross Salary" fill="#0ea5e9" />
                <Bar dataKey="tax" name="Tax" fill="#f97316" />
                <Bar dataKey="pension" name="Pension" fill="#8b5cf6" />
                <Bar dataKey="net" name="Net Salary" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payroll Report</CardTitle>
          <CardDescription>Detailed breakdown of monthly payroll</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left md:w-[240px]", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM yyyy") : <span>Select month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
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
                  <TableHead className="text-right">Gross Salary</TableHead>
                  <TableHead className="text-right">Allowances</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Engineering</TableCell>
                  <TableCell className="text-right">45</TableCell>
                  <TableCell className="text-right">$90,000</TableCell>
                  <TableCell className="text-right">$15,000</TableCell>
                  <TableCell className="text-right">$25,000</TableCell>
                  <TableCell className="text-right">$80,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing</TableCell>
                  <TableCell className="text-right">20</TableCell>
                  <TableCell className="text-right">$40,000</TableCell>
                  <TableCell className="text-right">$8,000</TableCell>
                  <TableCell className="text-right">$12,000</TableCell>
                  <TableCell className="text-right">$36,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Finance</TableCell>
                  <TableCell className="text-right">15</TableCell>
                  <TableCell className="text-right">$35,000</TableCell>
                  <TableCell className="text-right">$5,000</TableCell>
                  <TableCell className="text-right">$10,000</TableCell>
                  <TableCell className="text-right">$30,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Human Resources</TableCell>
                  <TableCell className="text-right">10</TableCell>
                  <TableCell className="text-right">$25,000</TableCell>
                  <TableCell className="text-right">$4,000</TableCell>
                  <TableCell className="text-right">$7,000</TableCell>
                  <TableCell className="text-right">$22,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Product</TableCell>
                  <TableCell className="text-right">25</TableCell>
                  <TableCell className="text-right">$55,000</TableCell>
                  <TableCell className="text-right">$10,000</TableCell>
                  <TableCell className="text-right">$15,000</TableCell>
                  <TableCell className="text-right">$50,000</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">115</TableCell>
                  <TableCell className="text-right">$245,000</TableCell>
                  <TableCell className="text-right">$42,000</TableCell>
                  <TableCell className="text-right">$69,000</TableCell>
                  <TableCell className="text-right">$218,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Access and download standard payroll reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Payroll Summary</h3>
                  <p className="text-sm text-muted-foreground">Monthly summary of all payroll transactions</p>
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
                  <h3 className="font-medium">Department Cost</h3>
                  <p className="text-sm text-muted-foreground">Breakdown of costs by department</p>
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
                  <h3 className="font-medium">Payroll Register</h3>
                  <p className="text-sm text-muted-foreground">Detailed register of all payroll entries</p>
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
                  <h3 className="font-medium">Bank Transfer</h3>
                  <p className="text-sm text-muted-foreground">Bank transfer details for payroll</p>
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
                  <h3 className="font-medium">YTD Summary</h3>
                  <p className="text-sm text-muted-foreground">Year-to-date payroll summary</p>
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
                  <h3 className="font-medium">Deduction Report</h3>
                  <p className="text-sm text-muted-foreground">Summary of all payroll deductions</p>
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
