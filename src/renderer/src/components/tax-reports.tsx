"use client"

import { Download, FileText } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const taxData = [
  { name: "Jan", incomeTax: 43750, pension: 8750, healthInsurance: 5000, total: 57500 },
  { name: "Feb", incomeTax: 47500, pension: 9500, healthInsurance: 5500, total: 62500 },
  { name: "Mar", incomeTax: 61420, pension: 12284, healthInsurance: 7000, total: 80704 },
]

export function TaxReports() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Deductions Summary</CardTitle>
          <CardDescription>Overview of tax and other deductions</CardDescription>
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
                <label className="text-sm font-medium">Tax Type</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Deductions</SelectItem>
                    <SelectItem value="income">Income Tax</SelectItem>
                    <SelectItem value="pension">Pension</SelectItem>
                    <SelectItem value="health">Health Insurance</SelectItem>
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
              <BarChart data={taxData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                <Legend />
                <Bar dataKey="incomeTax" name="Income Tax" fill="#f97316" />
                <Bar dataKey="pension" name="Pension" fill="#8b5cf6" />
                <Bar dataKey="healthInsurance" name="Health Insurance" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tax Deductions by Department</CardTitle>
          <CardDescription>Breakdown of tax deductions by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Income Tax</TableHead>
                  <TableHead className="text-right">Pension</TableHead>
                  <TableHead className="text-right">Health Insurance</TableHead>
                  <TableHead className="text-right">Total Deductions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Engineering</TableCell>
                  <TableCell className="text-right">$76,500</TableCell>
                  <TableCell className="text-right">$15,300</TableCell>
                  <TableCell className="text-right">$9,000</TableCell>
                  <TableCell className="text-right">$100,800</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing</TableCell>
                  <TableCell className="text-right">$30,000</TableCell>
                  <TableCell className="text-right">$6,000</TableCell>
                  <TableCell className="text-right">$4,000</TableCell>
                  <TableCell className="text-right">$40,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Finance</TableCell>
                  <TableCell className="text-right">$24,000</TableCell>
                  <TableCell className="text-right">$4,800</TableCell>
                  <TableCell className="text-right">$3,000</TableCell>
                  <TableCell className="text-right">$31,800</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Human Resources</TableCell>
                  <TableCell className="text-right">$14,000</TableCell>
                  <TableCell className="text-right">$2,800</TableCell>
                  <TableCell className="text-right">$2,000</TableCell>
                  <TableCell className="text-right">$18,800</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Product</TableCell>
                  <TableCell className="text-right">$47,500</TableCell>
                  <TableCell className="text-right">$9,500</TableCell>
                  <TableCell className="text-right">$6,250</TableCell>
                  <TableCell className="text-right">$63,250</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">$192,000</TableCell>
                  <TableCell className="text-right">$38,400</TableCell>
                  <TableCell className="text-right">$24,250</TableCell>
                  <TableCell className="text-right">$254,650</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available Tax Reports</CardTitle>
          <CardDescription>Access and download standard tax reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Annual Tax Summary</h3>
                  <p className="text-sm text-muted-foreground">Complete annual tax deduction summary</p>
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
                  <h3 className="font-medium">Quarterly Tax Report</h3>
                  <p className="text-sm text-muted-foreground">Tax deductions by quarter</p>
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
                  <h3 className="font-medium">Employee Tax Statements</h3>
                  <p className="text-sm text-muted-foreground">Individual tax statements for all employees</p>
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
                  <h3 className="font-medium">Pension Contributions</h3>
                  <p className="text-sm text-muted-foreground">Summary of pension contributions</p>
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
                  <h3 className="font-medium">Health Insurance Report</h3>
                  <p className="text-sm text-muted-foreground">Health insurance deductions and coverage</p>
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
                  <h3 className="font-medium">Tax Remittance Report</h3>
                  <p className="text-sm text-muted-foreground">Report of tax payments to authorities</p>
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
