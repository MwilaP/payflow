"use client"

import { useState } from "react"
import { Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export function PayrollStructureAssignDemo() {
  const { toast } = useToast()
  const [department, setDepartment] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedStructure, setSelectedStructure] = useState<string>("1")
  const [assignedEmployees, setAssignedEmployees] = useState<Record<string, string[]>>({
    "1": ["1", "2"],
    "2": ["5"],
    "3": ["3", "4"],
    "4": ["7", "8"],
    "5": ["6"],
  })

  // Mock data for structures
  const structures = [
    {
      id: "1",
      name: "Standard Staff Payroll",
      description: "Default structure for regular staff members",
    },
    {
      id: "2",
      name: "Executive Package",
      description: "Structure for executive team members",
    },
    {
      id: "3",
      name: "Part-time Staff",
      description: "Structure for part-time employees",
    },
    {
      id: "4",
      name: "Contract Workers",
      description: "Structure for contract-based workers",
    },
    {
      id: "5",
      name: "Internship Program",
      description: "Structure for interns",
    },
  ]

  // Mock data for employees
  const employees = [
    {
      id: "1",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      department: "Engineering",
      position: "Software Engineer",
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      department: "Marketing",
      position: "Marketing Specialist",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      department: "Finance",
      position: "Financial Analyst",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      department: "Human Resources",
      position: "HR Coordinator",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.wilson@example.com",
      department: "Product",
      position: "Product Manager",
    },
    {
      id: "6",
      name: "Jennifer Lee",
      email: "jennifer.lee@example.com",
      department: "Engineering",
      position: "QA Engineer",
    },
    {
      id: "7",
      name: "James Miller",
      email: "james.miller@example.com",
      department: "Sales",
      position: "Sales Representative",
    },
    {
      id: "8",
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      department: "Marketing",
      position: "Content Writer",
    },
  ]

  const filteredEmployees = employees.filter(
    (employee) =>
      (department === "all" || employee.department === department) &&
      (employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map((employee) => employee.id))
    }
  }

  const handleSelectEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((employeeId) => employeeId !== id))
    } else {
      setSelectedEmployees([...selectedEmployees, id])
    }
  }

  const handleAssign = () => {
    // Update the assigned employees
    setAssignedEmployees({
      ...assignedEmployees,
      [selectedStructure]: [...selectedEmployees],
    })

    toast({
      title: "Structure assigned (Demo)",
      description: `Payroll structure has been assigned to ${selectedEmployees.length} employees in demo mode.`,
    })
    setSelectedEmployees([])
  }

  const getEmployeeStructure = (employeeId: string) => {
    for (const [structureId, employeeIds] of Object.entries(assignedEmployees)) {
      if (employeeIds.includes(employeeId)) {
        return structures.find((s) => s.id === structureId)?.name || "None"
      }
    }
    return "None"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Payroll Structure</CardTitle>
          <CardDescription>Select a structure and assign it to employees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Payroll Structure</label>
              <Select value={selectedStructure} onValueChange={setSelectedStructure}>
                <SelectTrigger>
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  {structures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStructure && (
                <p className="text-sm text-muted-foreground">
                  {structures.find((s) => s.id === selectedStructure)?.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="flex items-center border-b p-2">
              <Checkbox
                checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                onCheckedChange={handleSelectAll}
                className="ml-2"
              />
              <span className="ml-2 text-sm font-medium">Select All</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {selectedEmployees.length} of {filteredEmployees.length} selected
              </span>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {filteredEmployees.length === 0 ? (
                  <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                    No employees found
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center rounded-md p-2 hover:bg-muted"
                      onClick={() => handleSelectEmployee(employee.id)}
                    >
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleSelectEmployee(employee.id)}
                        className="mr-2"
                      />
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=${employee.name.charAt(0)}`}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {employee.position} • {employee.department}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {getEmployeeStructure(employee.id)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAssign} disabled={selectedEmployees.length === 0}>
              <Users className="mr-2 h-4 w-4" />
              Assign to {selectedEmployees.length} Employees (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>View which employees are assigned to each structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {structures.map((structure) => {
              const assignedIds = assignedEmployees[structure.id] || []
              const assignedEmployeesList = employees.filter((e) => assignedIds.includes(e.id))

              return (
                <div key={structure.id} className="space-y-2">
                  <h3 className="font-medium">{structure.name}</h3>
                  <div className="rounded-md border p-4">
                    {assignedEmployeesList.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No employees assigned</p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {assignedEmployeesList.map((employee) => (
                          <div key={employee.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={`/placeholder.svg?height=24&width=24&text=${employee.name.charAt(0)}`}
                                alt={employee.name}
                              />
                              <AvatarFallback className="text-xs">
                                {employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">{employee.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
