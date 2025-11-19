"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileEdit, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export function PayrollStructureEmployeeDemo() {
  const { toast } = useToast()
  const [selectedEmployee, setSelectedEmployee] = useState("1")

  // Mock data for employees
  const employees = [
    {
      id: "1",
      name: "Robert Johnson",
      position: "Software Engineer",
      department: "Engineering",
      structure: "Standard Staff Payroll",
    },
    {
      id: "2",
      name: "Sarah Williams",
      position: "Marketing Specialist",
      department: "Marketing",
      structure: "Standard Staff Payroll",
    },
    {
      id: "3",
      name: "Michael Brown",
      position: "Financial Analyst",
      department: "Finance",
      structure: "Part-time Staff",
    },
    {
      id: "5",
      name: "David Wilson",
      position: "Product Manager",
      department: "Product",
      structure: "Executive Package",
    },
  ]

  // Mock data for structures
  const structures = {
    "Standard Staff Payroll": {
      frequency: "Monthly",
      basicSalary: 5000,
      allowances: [
        { id: "1", name: "Housing", type: "percentage", value: 20, amount: 1000 },
        { id: "2", name: "Transport", type: "fixed", value: 500, amount: 500 },
      ],
      deductions: [
        { id: "1", name: "Tax", type: "percentage", value: 10, preTax: true, amount: 650 },
        { id: "2", name: "Pension", type: "percentage", value: 5, preTax: true, amount: 325 },
        { id: "3", name: "Health Insurance", type: "fixed", value: 200, preTax: false, amount: 200 },
      ],
      grossPay: 6500,
      netPay: 5325,
      assignedDate: "Apr 5, 2025",
      assignedBy: "Emily Davis (HR Coordinator)",
    },
    "Executive Package": {
      frequency: "Monthly",
      basicSalary: 10000,
      allowances: [
        { id: "1", name: "Housing", type: "percentage", value: 25, amount: 2500 },
        { id: "2", name: "Transport", type: "fixed", value: 1000, amount: 1000 },
        { id: "3", name: "Entertainment", type: "fixed", value: 1500, amount: 1500 },
      ],
      deductions: [
        { id: "1", name: "Tax", type: "percentage", value: 15, preTax: true, amount: 2250 },
        { id: "2", name: "Pension", type: "percentage", value: 7.5, preTax: true, amount: 1125 },
      ],
      grossPay: 15000,
      netPay: 11625,
      assignedDate: "Apr 10, 2025",
      assignedBy: "Emily Davis (HR Coordinator)",
    },
    "Part-time Staff": {
      frequency: "Monthly",
      basicSalary: 2500,
      allowances: [{ id: "1", name: "Transport", type: "fixed", value: 250, amount: 250 }],
      deductions: [
        { id: "1", name: "Tax", type: "percentage", value: 5, preTax: true, amount: 137.5 },
        { id: "2", name: "Pension", type: "percentage", value: 2.5, preTax: true, amount: 68.75 },
      ],
      grossPay: 2750,
      netPay: 2543.75,
      assignedDate: "Apr 15, 2025",
      assignedBy: "Emily Davis (HR Coordinator)",
    },
  }

  const handleOverrideValues = () => {
    toast({
      title: "Override values (Demo)",
      description: "In a real environment, this would allow you to override specific values for this employee.",
    })
  }

  const handleDownloadPDF = () => {
    toast({
      title: "Download PDF (Demo)",
      description: "In a real environment, this would download a PDF of the payroll structure.",
    })
  }

  const employee = employees.find((e) => e.id === selectedEmployee)
  const structure = employee ? structures[employee.structure as keyof typeof structures] : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll Structure View</CardTitle>
          <CardDescription>See how payroll structures appear in employee profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center">
                      <span>{employee.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({employee.position} - {employee.structure})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {employee && structure && (
            <div className="rounded-md border p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={`/placeholder.svg?height=48&width=48&text=${employee.name.charAt(0)}`}
                      alt={employee.name}
                    />
                    <AvatarFallback>
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleOverrideValues}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Override Values
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="mt-6 rounded-md border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{employee.structure}</h3>
                    <p className="text-sm text-muted-foreground">
                      Assigned on {structure.assignedDate} by {structure.assignedBy}
                    </p>
                  </div>
                  <Badge variant="outline" className="md:self-start">
                    {structure.frequency}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-sm font-medium">Earnings</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell>Fixed</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">${structure.basicSalary.toLocaleString()}</TableCell>
                      </TableRow>
                      {structure.allowances.map((allowance) => (
                        <TableRow key={allowance.id}>
                          <TableCell>{allowance.name}</TableCell>
                          <TableCell>{allowance.type === "percentage" ? "Percentage" : "Fixed"}</TableCell>
                          <TableCell className="text-right">
                            {allowance.type === "percentage" ? `${allowance.value}%` : `${allowance.value}`}
                          </TableCell>
                          <TableCell className="text-right">${allowance.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell>Total Earnings</TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell className="text-right">${structure.grossPay.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="mb-4 text-sm font-medium">Deductions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {structure.deductions.map((deduction) => (
                        <TableRow key={deduction.id}>
                          <TableCell>
                            {deduction.name}
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({deduction.preTax ? "Pre-Tax" : "Post-Tax"})
                            </span>
                          </TableCell>
                          <TableCell>{deduction.type === "percentage" ? "Percentage" : "Fixed"}</TableCell>
                          <TableCell className="text-right">
                            {deduction.type === "percentage" ? `${deduction.value}%` : `${deduction.value}`}
                          </TableCell>
                          <TableCell className="text-right">${deduction.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell>Total Deductions</TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell className="text-right">
                          ${structure.deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-6 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Net Monthly Salary</h3>
                  <p className="text-2xl font-bold">${structure.netPay.toLocaleString()}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Annual Salary</h3>
                  <p className="text-lg font-medium">${(structure.netPay * 12).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
