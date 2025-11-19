import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

// Employee schema for validation
export const employeeSchema = z.object({
  _id: z.string().default(() => `employee_${uuidv4()}`),
  _rev: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  address: z.string().optional(),

  // Job information
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  employmentType: z.enum(["full-time", "part-time", "contract", "intern"]),
  hireDate: z.string().min(1, "Hire date is required"),
  reportingTo: z.string().optional(),
  workLocation: z.string().optional(),
  status: z.enum(["Active", "Pending", "On Leave", "Terminated"]).default("Active"),

  // Banking information
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().optional(),
  ifscCode: z.string().optional(),

  // Tax information
  nationalId: z.string().min(1, "National ID is required"),
  taxNumber: z.string().min(1, "Tax number is required"),
  pensionNumber: z.string().optional(),
  taxStatus: z.enum(["resident", "non-resident", "foreign"]).optional(),

  // Payroll information
  payrollStructureId: z.string().optional(),

  // Metadata
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Employee = z.infer<typeof employeeSchema>

// Helper function to create a new employee with default values
export const createNewEmployee = (data: Partial<Employee>): Employee => {
  const defaultEmployee: Partial<Employee> = {
    _id: `employee_${uuidv4()}`,
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return employeeSchema.parse({
    ...defaultEmployee,
    ...data,
  })
}

// Helper function to validate employee data
export const validateEmployee = (data: any): { valid: boolean; errors?: z.ZodError } => {
  try {
    employeeSchema.parse(data)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error }
    }
    throw error
  }
}
