"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createEmployeeServiceCompat } from "@/lib/db/sqlite-employee-service"
import { createPayrollStructureServiceCompat } from "@/lib/db/sqlite-payroll-service"
import type { Employee } from "@/lib/db/models/employee.model"
import type { PayrollStructure } from "@/lib/db/models/payroll-structure.model"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { initializeSQLiteDatabase } from "@/lib/db/indexeddb-sqlite-service"

interface EmployeeFormProps {
  employeeId?: string
  isEditing?: boolean
}

export function EmployeeForm({ employeeId, isEditing = false }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const navigate = useNavigate()
  const { toast } = useToast()

  // Services state
  const [employeeService, setEmployeeService] = useState<any>(null)
  const [payrollStructureService, setPayrollStructureService] = useState<any>(null)
  const [servicesLoaded, setServicesLoaded] = useState(false)
  const [serviceError, setServiceError] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [payrollStructures, setPayrollStructures] = useState<PayrollStructure[]>([])
  const [selectedStructure, setSelectedStructure] = useState<PayrollStructure | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    department: "",
    designation: "",
    employmentType: "full-time",
    reportingTo: "",
    workLocation: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    nationalId: "",
    taxNumber: "",
    pensionNumber: "",
    taxStatus: "",
    payrollStructureId: "",
    status: "Active",
  })

  // SQLite initialization state
  const [dbInitialized, setDbInitialized] = useState(false)

  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      if (!dbInitialized) return

      try {
        console.log("Initializing services...")
        setServiceError(null)

        const empService = createEmployeeServiceCompat()
        const payrollService = createPayrollStructureServiceCompat()

        setEmployeeService(empService)
        setPayrollStructureService(payrollService)
        setServicesLoaded(true)
        console.log("Services initialized successfully")
      } catch (error) {
        console.error("Error initializing services:", error)
        setServiceError("Failed to initialize services. The application will run with limited functionality.")

        // Set services to empty implementations to avoid null errors
        setEmployeeService({})
        setPayrollStructureService({})
        setServicesLoaded(true)

        toast({
          title: "Warning",
          description: "Running in limited functionality mode due to database initialization issues.",
          variant: "destructive",
        })
      }
    }

    initServices()
  }, [dbInitialized, toast])

  // Initialize SQLite database
  useEffect(() => {
    const initDb = async () => {
      try {
        const { success } = await initializeSQLiteDatabase()
        setDbInitialized(success)
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }
    initDb()
  }, [])

  // Load payroll structures
  useEffect(() => {
    if (!servicesLoaded || !payrollStructureService) return

    const loadPayrollStructures = async () => {
      try {
        console.log("Loading payroll structures...")
        const structures = await payrollStructureService.getAll()
        setPayrollStructures(structures || [])
        console.log(`Loaded ${structures?.length || 0} payroll structures`)
      } catch (error) {
        console.error("Error loading payroll structures:", error)
        setPayrollStructures([])
        toast({
          title: "Warning",
          description: "Failed to load payroll structures. Some features may be limited.",
          variant: "destructive",
        })
      }
    }

    loadPayrollStructures()
  }, [servicesLoaded, payrollStructureService, toast])

  // Load employee data if editing
  useEffect(() => {
    if (!servicesLoaded || !employeeService || !payrollStructureService) return

    const loadEmployeeData = async () => {
      if (isEditing && employeeId) {
        setIsLoading(true)
        try {
          console.log(`Loading employee data for ID: ${employeeId}`)
          const employee = await employeeService.getById(employeeId)
          if (!employee) {
            console.error("Employee not found")
            toast({
              title: "Error",
              description: "Employee not found",
              variant: "destructive",
            })
            return
          }

          // Convert date strings to Date objects for the form
          const formattedEmployee = {
            ...employee,
            dob: employee.dob ? new Date(employee.dob) : undefined,
            hireDate: employee.hireDate ? new Date(employee.hireDate) : undefined,
          }

          setFormData(formattedEmployee)
          console.log("Employee data loaded successfully")

          // Load the employee's payroll structure if they have one
          if (employee.payrollStructureId) {
            try {
              console.log(`Loading payroll structure for ID: ${employee.payrollStructureId}`)
              const structure = await payrollStructureService.getById(employee.payrollStructureId)
              setSelectedStructure(structure)
              console.log("Payroll structure loaded successfully")
            } catch (error) {
              console.error("Error loading payroll structure:", error)
            }
          }
        } catch (error) {
          console.error("Error loading employee data:", error)
          toast({
            title: "Error",
            description: "Failed to load employee data",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadEmployeeData()
  }, [isEditing, employeeId, servicesLoaded, employeeService, payrollStructureService, toast])

  // Handle payroll structure change
  useEffect(() => {
    if (!servicesLoaded || !payrollStructureService) return

    const loadSelectedStructure = async () => {
      if (formData.payrollStructureId) {
        try {
          console.log(`Loading selected payroll structure: ${formData.payrollStructureId}`)
          const structure = await payrollStructureService.getById(formData.payrollStructureId)
          setSelectedStructure(structure)
          console.log("Selected payroll structure loaded successfully")
        } catch (error) {
          console.error("Error loading selected payroll structure:", error)
          setSelectedStructure(null)
        }
      } else {
        setSelectedStructure(null)
      }
    }

    loadSelectedStructure()
  }, [formData.payrollStructureId, servicesLoaded, payrollStructureService])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!servicesLoaded || !employeeService) {
      toast({
        title: "Error",
        description: "Services not initialized. Please refresh the page.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Saving employee data...")
      // Format dates as ISO strings for storage
      const employeeData = {
        ...formData,
        dob: formData.dob ? (formData.dob as Date).toISOString() : undefined,
        hireDate: formData.hireDate ? (formData.hireDate as Date).toISOString() : undefined,
      }

      if (isEditing && employeeId) {
        await employeeService.update(employeeId, employeeData)
        toast({
          title: "Success",
          description: "Employee updated successfully",
        })
      } else {
        await employeeService.create(employeeData as Employee)
        toast({
          title: "Success",
          description: "Employee created successfully",
        })
      }

      console.log("Employee data saved successfully")
      navigate("/employees")
    } catch (error) {
      console.error("Error saving employee:", error)
      toast({
        title: "Error",
        description: "Failed to save employee data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading employee data...</p>
        </div>
      </div>
    )
  }

  if (!servicesLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Initializing services...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {serviceError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{serviceError} Some features may be limited or unavailable.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="job">Job Info</TabsTrigger>
            <TabsTrigger value="banking">Banking Info</TabsTrigger>
            <TabsTrigger value="tax">Tax Info</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Structure</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/25 p-1">
                  <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm">
                  Upload Photo
                </Button>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dob"
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !formData.dob && "text-muted-foreground")}
                      >
                        {formData.dob ? format(formData.dob, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dob}
                        onSelect={(date) => handleInputChange("dob", date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                className="min-h-[80px]"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/employees")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setActiveTab("job")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Job Info Tab */}
          <TabsContent value="job" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  placeholder="Enter job title"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => handleInputChange("employmentType", value)}
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="hireDate"
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !formData.hireDate && "text-muted-foreground")}
                    >
                      {formData.hireDate ? format(formData.hireDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.hireDate}
                      onSelect={(date) => handleInputChange("hireDate", date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {
              //   <div className="space-y-2">
              //   <Label htmlFor="reportingTo">Reporting To</Label>
              //   <Select value={formData.reportingTo} onValueChange={(value) => handleInputChange("reportingTo", value)}>
              //     <SelectTrigger id="reportingTo">
              //       <SelectValue placeholder="Select manager" />
              //     </SelectTrigger>
              //     <SelectContent>
              //       <SelectItem value="john-doe">John Doe (CEO)</SelectItem>
              //       <SelectItem value="jane-smith">Jane Smith (CTO)</SelectItem>
              //       <SelectItem value="robert-johnson">Robert Johnson (CFO)</SelectItem>
              //       <SelectItem value="emily-davis">Emily Davis (HR Director)</SelectItem>
              //     </SelectContent>
              //   </Select>
              // </div>
              }

              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select
                  value={formData.workLocation}
                  onValueChange={(value) => handleInputChange("workLocation", value)}
                >
                  <SelectTrigger id="workLocation">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hq">Headquarters</SelectItem>
                    <SelectItem value="branch-1">Branch Office 1</SelectItem>
                    <SelectItem value="branch-2">Branch Office 2</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("banking")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Banking Info Tab */}
          <TabsContent value="banking" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  placeholder="Enter branch name"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC/SWIFT Code</Label>
                <Input
                  id="ifscCode"
                  placeholder="Enter IFSC/SWIFT code"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("job")}>
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("tax")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Tax Info Tab */}
          <TabsContent value="tax" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  placeholder="Enter national ID number"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Number</Label>
                <Input
                  id="taxNumber"
                  placeholder="Enter tax identification number"
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pensionNumber">Pension Number</Label>
                <Input
                  id="pensionNumber"
                  placeholder="Enter pension number"
                  value={formData.pensionNumber}
                  onChange={(e) => handleInputChange("pensionNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxStatus">Tax Status</Label>
                <Select value={formData.taxStatus} onValueChange={(value) => handleInputChange("taxStatus", value)}>
                  <SelectTrigger id="taxStatus">
                    <SelectValue placeholder="Select tax status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="non-resident">Non-Resident</SelectItem>
                    <SelectItem value="foreign">Foreign National</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("banking")}>
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("payroll")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Payroll Structure Tab */}
          <TabsContent value="payroll" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Structure Assignment</CardTitle>
                <CardDescription>
                  Assign a payroll structure to this employee. This will determine their salary components, allowances,
                  and deductions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payrollStructure">Payroll Structure</Label>
                  <Select
                    value={formData.payrollStructureId}
                    onValueChange={(value) => handleInputChange("payrollStructureId", value)}
                  >
                    <SelectTrigger id="payrollStructure">
                      <SelectValue placeholder="Select payroll structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollStructures.map((structure) => (
                        <SelectItem key={structure._id} value={structure._id}>
                          {structure.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedStructure && (
                  <div className="rounded-md border p-4 mt-4">
                    <h3 className="font-medium mb-2">Structure Preview</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Structure Name:</span>
                        <span className="text-sm font-medium">{selectedStructure.name}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Basic Salary:</span>
                        <span className="text-sm font-medium">K{selectedStructure.basicSalary.toLocaleString()}</span>
                      </div>

                      {selectedStructure.allowances.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Allowances:</span>
                          <ul className="mt-1 space-y-1">
                            {selectedStructure.allowances.map((allowance) => (
                              <li key={allowance.id} className="text-sm flex justify-between">
                                <span>{allowance.name}</span>
                                <span>
                                  {allowance.type === "fixed"
                                    ? `K${allowance.value.toLocaleString()}`
                                    : `K${ (selectedStructure.basicSalary * ( allowance.value / 100))}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedStructure.deductions.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Deductions:</span>
                          <ul className="mt-1 space-y-1">
                            {selectedStructure.deductions.map((deduction) => (
                              <li key={deduction.id} className="text-sm flex justify-between">
                                <span>{deduction.name}</span>
                                <span>
                                  {deduction.type === "fixed"
                                    ? `K${deduction.value.toLocaleString()}`
                                    : `K${ (selectedStructure.basicSalary * ( deduction.value / 100))}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Calculate and display net salary */}
                      {(() => {
                        if (!payrollStructureService) return null

                        const salaryDetails = payrollStructureService.calculateSalaryDetails(selectedStructure)
                        return (
                          <>
                            <div className="flex justify-between border-t pt-2 mt-2">
                              <span className="text-sm font-medium">Total Allowances:</span>
                              <span className="text-sm font-medium">
                                K{salaryDetails.totalAllowances.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Total Deductions:</span>
                              <span className="text-sm font-medium">
                                K{salaryDetails.totalDeductions.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                              <span className="text-sm font-medium">Net Salary:</span>
                              <span className="text-sm font-medium">K{salaryDetails.netSalary.toLocaleString()}</span>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/payroll/structures/${formData.payrollStructureId}/edit`)}
                        disabled={!formData.payrollStructureId}
                      >
                        View Full Structure Details
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("tax")}>
                Previous
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Employee" : "Create Employee"}</>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
