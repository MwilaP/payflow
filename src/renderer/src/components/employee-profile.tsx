"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useDatabase } from "@/lib/db/db-context"
import { Employee } from "@/lib/db/employee-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmployeePayslips } from "@/components/employee-payslips"
import { EmployeeAttendance } from "@/components/employee-attendance"
import { EmployeeSalary } from "@/components/employee-salary"
import { EmployeeDocuments } from "@/components/employee-documents"
import { EmployeePayrollStructure } from "@/components/employee-payroll-structure"
import { Skeleton } from "@/components/ui/skeleton"
import { createEmployeeServiceCompat } from "@/lib/db/sqlite-employee-service"
import { createPayrollStructureServiceCompat } from "@/lib/db/sqlite-payroll-service"
import { createPayrollHistoryServiceCompat } from "@/lib/db/sqlite-payroll-history-service"
import { useToast } from "@/hooks/use-toast"

export function EmployeeProfile({ id }: { id: string }) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState("overview")
  const {
    isLoading: dbLoading,
    error: dbError,
    isInitialized: dbInitialized,
  } = useDatabase()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [employeeService, setEmployeeService] = useState<any>(null)
  const [payrollStructureService, setPayrollStructureService] = useState<any>(null)
  const [servicesLoaded, setServicesLoaded] = useState(false)
  const [serviceError, setServiceError] = useState<string | null>(null)
  const { toast } = useToast()
  const [payrollStructure, setPayrollStructure] = useState<any>(null)
  const [annualSalary, setAnnualSalary] = useState<number | null>(null)
  const [payslips, setPayslips] = useState<any[]>([]) // Added state for payslips
  const [payslipsLoading, setPayslipsLoading] = useState<boolean>(false) // Added loading state for payslips
  const [payslipsError, setPayslipsError] = useState<string | null>(null) // Added error state for payslips
      const calculateTimeAtCompany = (joinDateStr: string | undefined): string => {
        if (!joinDateStr) return "N/A";
        try {
          const joinDate = new Date(joinDateStr);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - joinDate.getTime());
          // Calculate difference in days, months, years
          const diffYears = now.getFullYear() - joinDate.getFullYear();
          const diffMonths = now.getMonth() - joinDate.getMonth() + (12 * diffYears);

          if (diffMonths < 1) {
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
          } else if (diffMonths < 12) {
            return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
          } else {
            const years = Math.floor(diffMonths / 12);
            const months = diffMonths % 12;
            let result = `${years} year${years !== 1 ? 's' : ''}`;
            if (months > 0) {
              result += `, ${months} month${months !== 1 ? 's' : ''}`;
            }
            return result;
          }
        } catch (e) {
          console.error("Error calculating time at company:", e);
          return "N/A";
        }
      };


  useEffect(() => {
    const initServices = async () => {
      try {
        console.log("Initializing services...")
        setServiceError(null)

        const empService = createEmployeeServiceCompat()
        const payrollStructService = createPayrollStructureServiceCompat()

        setEmployeeService(empService)
        setPayrollStructureService(payrollStructService)
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
  }, [toast])

  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch employee data
  useEffect(() => {
    if (!id || !employeeService) {
      // Wait for ID, service, and DB initialization
      if (dbInitialized && !employeeService) {
        setError("Employee service is not available.")
        setLoading(false)
      }
      // Keep loading true if db not initialized or no id/service yet
      return
    }

    const fetchEmployee = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await employeeService.getById(id)
        if (data) {
          setEmployee(data)
          console.log("employee: ", data)
        } else {
          setError(`Employee with ID ${id} not found.`)
        }
      } catch (err) {
        console.error("Failed to fetch employee:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [id, employeeService]) // Rerun when ID, service, or DB init status changes


  // Fetch payroll structure and calculate salary
  useEffect(() => {
    if (!employee || !payrollStructureService || !employee.payrollStructureId) {
      setAnnualSalary(null); // Reset if no employee or structure ID
      return;
    }

    const fetchStructureAndCalculateSalary = async () => {
      try {
        const structure = await payrollStructureService.getById(
          employee.payrollStructureId
        );
        setPayrollStructure(structure);

        if (structure) {
          const salaryDetails = payrollStructureService.calculateSalaryDetails(structure);
          // Assuming calculateNetSalary returns monthly net salary
          setAnnualSalary(salaryDetails.netSalary * 12);
        } else {
          console.warn(`Payroll structure ${employee.payrollStructureId} not found.`);
          setAnnualSalary(null);
        }
      } catch (err) {
        console.error("Failed to fetch payroll structure or calculate salary:", err);
        setError(
          (prevError) =>
            `${prevError ? prevError + "; " : ""}Failed to load salary details.`
        );
        setAnnualSalary(null);
      }
    };

    fetchStructureAndCalculateSalary();
  }, [employee, payrollStructureService]);

  // Fetch payslips for the employee
  useEffect(() => {
    if (!id || !servicesLoaded) {
      return;
    }

    const fetchPayslips = async () => {
      setPayslipsLoading(true);
      setPayslipsError(null);
      
      try {
        // Use SQLite payroll history service
        const payrollHistoryService = createPayrollHistoryServiceCompat();
        
        // Get payroll records for this employee
        const payrollRecords = await payrollHistoryService.getPayrollRecordsByEmployee(id);
        
        // Transform payroll records to payslips format
        const employeePayslips = payrollRecords.map((record) => {
          // Get the employee item from the record
          const employeeItem = record.items && record.items.find(item => item.employeeId === id);
          
          return {
            _id: record._id,
            period: record.period || `${new Date(record.date).toLocaleString('default', { month: 'short' })} ${new Date(record.date).getFullYear()}`,
            date: record.date,
            // Basic salary and earnings
            basicSalary: employeeItem?.basicSalary || 0,
            housingAllowance: employeeItem?.housingAllowance || 0,
            transportAllowance: employeeItem?.transportAllowance || 0,
            allowances: employeeItem?.allowances || 0,
            allowanceBreakdown: employeeItem?.allowanceBreakdown || [],
            grossPay: record.grossPay || employeeItem?.grossPay || 0,
            
            // Deductions
            napsa: employeeItem?.napsa || 0,
            nhima: employeeItem?.nhima || 0,
            paye: employeeItem?.paye || 0,
            deductions: employeeItem?.deductions || 0,
            deductionBreakdown: employeeItem?.deductionBreakdown || [],
            totalDeductions: record.totalDeductions || employeeItem?.totalDeductions || 0,
            
            // Net pay and metadata
            netPay: record.netPay || employeeItem?.netSalary || 0,
            status: record.status || 'paid',
            payrollHistoryId: record._id,
            employeeId: id
          };
        });

        setPayslips(employeePayslips);
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setPayslipsError("Failed to load payslips. Please try again later.");
      } finally {
        setPayslipsLoading(false);
      }
    };

    fetchPayslips();
  }, [id, servicesLoaded]);
  // Handle loading and error states
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-col items-center gap-4 md:w-1/4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4 mt-2" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (dbError) {
    return <div className="text-destructive">Error initializing database: {dbError}</div>
  }

  if (error) {
    return <div className="text-destructive">Error loading employee: {error}</div>
  }

  if (!employee) {
    return <div>Employee data not found.</div>
  }

  // Format join date (assuming employee.createdAt is the join date)
  const joinDate = employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "N/A"
  const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "Unnamed Employee"
  const initials = (employee.firstName?.[0] || '') + (employee.lastName?.[0] || '') || '?'

      const timeAtCompany = calculateTimeAtCompany(employee.createdAt);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:w-1/4">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={`/placeholder.svg?height=128&width=128&text=${initials}`}
                  alt={name}
                />
                <AvatarFallback className="text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-sm text-muted-foreground">{employee.designation || "N/A"}</p>
                <Badge className="mt-2">{employee.status || "Unknown"}</Badge>
              </div>
              <div className="grid w-full grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Message
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  Terminate
                </Button>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{employee.email || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p>{employee.phone || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                  <p>{employee.department || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Join Date</h3>
                  <p>{joinDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reporting To</h3>
                  {/* Reporting To - Assuming not directly in Employee model, might need relation */}
                  <p>{"N/A" /* employee.reportingTo */}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Employment Type</h3>
                  {/* Employment Type - Assuming not directly in Employee model */}
                  <p>{"N/A" /* employee.employmentType */}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Work Location</h3>
                  {/* Work Location - Assuming not directly in Employee model */}
                  <p>{"N/A" /* employee.workLocation */}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Employee ID</h3>
                  <p>ZWM-{employee._id.substring(employee._id.length - 5).toUpperCase()}</p> {/* Use _id */}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                {/* Address - Assuming not directly in Employee model */}
                <p>{"N/A" /* employee.address */}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payroll Structure</h3>
                {/* Payroll Structure - Needs fetching based on employee.payrollStructureId */}
                <Badge variant="outline" className="bg-primary/5">
                  {employee.payrollStructureId || "Not Assigned"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salary">Salary Info</TabsTrigger>
          <TabsTrigger value="payroll-structure">Payroll Structure</TabsTrigger>
          {/* <TabsTrigger value="attendance">Attendance</TabsTrigger> */}
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          {/* <TabsTrigger value="documents">Documents</TabsTrigger> */}
        </TabsList>
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Summary</CardTitle>
              <CardDescription>Overview of employee performance and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Current Salary</h3>
                  <p className="mt-1 text-2xl font-bold">
                    {annualSalary !== null
                      ? `K${annualSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Annual Net Salary</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Leave Balance</h3>
                  {/* TODO: Fetch actual leave balance */}
                  <p className="mt-1 text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground">Remaining (Placeholder)</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Time at Company</h3>
                  <p className="mt-1 text-2xl font-bold">{timeAtCompany}</p>
                  <p className="text-xs text-muted-foreground">Since {joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* TODO: Fetch actual recent activity */}
                  <p className="text-sm text-muted-foreground">No recent activity available.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* TODO: Fetch actual notes */}
                  <p className="text-sm text-muted-foreground">No notes available.</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="salary" className="pt-4">
          <EmployeeSalary salaryData={payrollStructure} /> {/* Pass payroll structure */}
        </TabsContent>
        <TabsContent value="payroll-structure" className="pt-4">
          <EmployeePayrollStructure structure={payrollStructure} /> {/* Pass payroll structure */}
        </TabsContent>
        <TabsContent value="attendance" className="pt-4">
          <EmployeeAttendance />
        </TabsContent>
        <TabsContent value="payslips" className="pt-4">
          <EmployeePayslips payslips={payslips} isLoading={payslipsLoading} error={payslipsError} /> {/* Pass payslips data, loading and error state */}
        </TabsContent>
        <TabsContent value="documents" className="pt-4">
          <EmployeeDocuments />
        </TabsContent>
      </Tabs>
    </div>
  )
}
