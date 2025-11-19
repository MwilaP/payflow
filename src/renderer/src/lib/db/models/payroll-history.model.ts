import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

// Payroll item schema for individual employee payroll entries
const payrollItemSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  department: z.string(),
  basicSalary: z.number(),
  allowances: z.number(),
  deductions: z.number(),
  netSalary: z.number(),
  payrollStructureId: z.string().optional(),
})

// Payroll history schema for validation
export const payrollHistorySchema = z.object({
  _id: z.string().default(() => `payroll_${uuidv4()}`),
  _rev: z.string().optional(),
  date: z.string(),
  paymentDate: z.string(),
  period: z.string(),
  status: z.enum(["draft", "processing", "completed", "cancelled"]).default("draft"),
  totalAmount: z.number(),
  employeeCount: z.number(),
  items: z.array(payrollItemSchema),

  // Metadata
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  processedBy: z.string().optional(),
  notes: z.string().optional(),
})

export type PayrollHistory = z.infer<typeof payrollHistorySchema>
export type PayrollItem = z.infer<typeof payrollItemSchema>

// Helper function to create a new payroll history entry with default values
export const createNewPayrollHistory = (data: Partial<PayrollHistory>): PayrollHistory => {
  const defaultPayrollHistory: Partial<PayrollHistory> = {
    _id: `payroll_${uuidv4()}`,
    status: "draft",
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return payrollHistorySchema.parse({
    ...defaultPayrollHistory,
    ...data,
  })
}

// Helper function to validate payroll history data
export const validatePayrollHistory = (data: any): { valid: boolean; errors?: z.ZodError } => {
  try {
    payrollHistorySchema.parse(data)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error }
    }
    throw error
  }
}
