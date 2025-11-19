
import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createEmployeeServiceCompat } from "@/lib/db/sqlite-employee-service"

interface AssignStructureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  structure: any
}

export function AssignStructureModal({ open, onOpenChange, structure }: AssignStructureModalProps) {
  const { toast } = useToast()

  const [employeeService, setEmployeeService] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [servicesLoaded, setServicesLoaded] = useState(false)

  // Department filter
  const [departmentOpen, setDepartmentOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")

  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      try {
        console.log("Initializing employee service for assign modal...");
        const empService = createEmployeeServiceCompat();
        setEmployeeService(empService);
        setServicesLoaded(true);
        console.log("Employee service initialized successfully");
      } catch (error) {
        console.error("Error initializing employee service:", error);
        toast({
          title: "Error",
          description: "Failed to initialize employee service",
          variant: "destructive",
        });
      }
    };

    initServices();
  }, [toast]);

  // Load employees when modal opens and service is ready
  useEffect(() => {
    const loadEmployees = async () => {
      if (open && servicesLoaded && employeeService) {
        setIsLoading(true)
        try {
          console.log("Loading employees for assign modal...");
          const employeeData = await employeeService.getAllEmployees();
          console.log("Loaded employees:", employeeData);
          setEmployees(employeeData || []);
          setFilteredEmployees(employeeData || []);

          // Get employees already assigned to this structure
          const assignedEmployees = (employeeData || [])
            .filter((employee) => employee.payrollStructureId === structure?._id)
            .map((employee) => employee._id);

          setSelectedEmployees(assignedEmployees);
        } catch (error) {
          console.error("Error loading employees:", error);
          toast({
            title: "Error",
            description: "Failed to load employees",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadEmployees()
  }, [open, servicesLoaded, employeeService, structure, toast])

  // Filter employees when search query or department changes
  useEffect(() => {
    if (employees.length > 0) {
      let filtered = employees

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (employee) =>
            `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(query) ||
            employee.email.toLowerCase().includes(query) ||
            employee.designation.toLowerCase().includes(query),
        )
      }

      // Filter by department
      if (selectedDepartment) {
        filtered = filtered.filter((employee) => employee.department === selectedDepartment)
      }

      setFilteredEmployees(filtered)
    }
  }, [searchQuery, selectedDepartment, employees])

  // Get unique departments for filter
  const departments = [...new Set(employees.map((employee) => employee.department))].sort()

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployees((prev) => (prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map((employee) => employee._id))
    }
  }

  const handleSave = async () => {
    if (!structure?._id || !employeeService) return

    setIsSaving(true)
    try {
      console.log("Assigning structure to employees:", selectedEmployees);
      
      // Update each selected employee with the structure ID
      for (const employeeId of selectedEmployees) {
        await employeeService.updateEmployee(employeeId, {
          payrollStructureId: structure._id
        });
      }

      toast({
        title: "Success",
        description: `Payroll structure assigned to ${selectedEmployees.length} employees.`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error assigning structure:", error)
      toast({
        title: "Error",
        description: "Failed to assign payroll structure",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Payroll Structure</DialogTitle>
          <DialogDescription>
            {structure ? (
              <>
                Assign <span className="font-medium">{structure.name}</span> to employees
              </>
            ) : (
              "Select employees to assign this payroll structure"
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={departmentOpen}
                      className="w-[200px] justify-between"
                    >
                      {selectedDepartment
                        ? selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1)
                        : "All Departments"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search department..." />
                      <CommandList>
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setSelectedDepartment("")
                              setDepartmentOpen(false)
                            }}
                            className="cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4", !selectedDepartment ? "opacity-100" : "opacity-0")} />
                            All Departments
                          </CommandItem>
                          {departments.map((department) => (
                            <CommandItem
                              key={department}
                              onSelect={() => {
                                setSelectedDepartment(department)
                                setDepartmentOpen(false)
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedDepartment === department ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {department.charAt(0).toUpperCase() + department.slice(1)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="rounded-md border">
                <div className="flex items-center p-2 border-b">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span className="ml-2 text-sm font-medium">
                      {selectedEmployees.length} of {filteredEmployees.length} selected
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {filteredEmployees.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">No employees found</div>
                    ) : (
                      <div className="space-y-1">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee._id}
                            className={cn(
                              "flex items-center rounded-md px-2 py-1.5 hover:bg-accent",
                              selectedEmployees.includes(employee._id) && "bg-accent",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={selectedEmployees.includes(employee._id)}
                              onChange={() => handleSelectEmployee(employee._id)}
                            />
                            <div className="ml-2 flex-1">
                              <div className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {employee.designation} • {employee.department}
                              </div>
                            </div>
                            {employee.payrollStructureId && employee.payrollStructureId !== structure?._id && (
                              <div className="text-xs text-muted-foreground">Has another structure</div>
                            )}
                            {employee.payrollStructureId === structure?._id && (
                              <div className="text-xs text-primary">Currently assigned</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  `Assign to ${selectedEmployees.length} Employees`
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
