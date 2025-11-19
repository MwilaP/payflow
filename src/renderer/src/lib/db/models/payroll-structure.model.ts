import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

// Define schemas for allowances and deductions
const allowanceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Allowance name is required"),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().min(0, "Value must be a positive number"),
})

const deductionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Deduction name is required"),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().min(0, "Value must be a positive number"),
  preTax: z.boolean().default(true),
})

// Payroll structure schema for validation
export const payrollStructureSchema = z.object({
  _id: z.string().default(() => `structure_${uuidv4()}`),
  _rev: z.string().optional(),
  name: z.string().min(1, "Structure name is required"),
  description: z.string().optional(),
  frequency: z.enum(["monthly", "biweekly", "weekly"]),
  basicSalary: z.number().min(0, "Basic salary must be a positive number"),
  allowances: z.array(allowanceSchema).default([]),
  deductions: z.array(deductionSchema).default([]),

  // Metadata
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type PayrollStructure = z.infer<typeof payrollStructureSchema>
export type Allowance = z.infer<typeof allowanceSchema>
export type Deduction = z.infer<typeof deductionSchema>

// Helper function to create a new payroll structure with default values
export const createNewPayrollStructure = (data: Partial<PayrollStructure>): PayrollStructure => {
  const defaultStructure: Partial<PayrollStructure> = {
    _id: `structure_${uuidv4()}`,
    frequency: "monthly",
    allowances: [],
    deductions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return payrollStructureSchema.parse({
    ...defaultStructure,
    ...data,
  })
}

// Helper function to validate payroll structure data
export const validatePayrollStructure = (data: any): { valid: boolean; errors?: z.ZodError } => {
  try {
    payrollStructureSchema.parse(data)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error }
    }
    throw error
  }
}

// Calculate net salary based on structure and basic salary
export const calculateNetSalary = (
  structure: PayrollStructure,
): {
  basicSalary: number
  totalAllowances: number
  totalDeductions: number
  netSalary: number
} => {
  const { basicSalary, allowances, deductions } = structure

  // Calculate total allowances
  const totalAllowances = allowances.reduce((total, allowance) => {
    if (allowance.type === "fixed") {
      return total + allowance.value
    } else {
      // Percentage allowance
      return total + (basicSalary * allowance.value) / 100
    }
  }, 0)

  // Calculate gross salary (basic + allowances)
  const grossSalary = basicSalary + totalAllowances

  // Calculate pre-tax deductions
  const preTaxDeductions = deductions
    .filter((d) => d.preTax)
    .reduce((total, deduction) => {
      if (deduction.type === "fixed") {
        return total + deduction.value
      } else {
        // Percentage deduction
        return total + (grossSalary * deduction.value) / 100
      }
    }, 0)

  // Calculate taxable income
  const taxableIncome = grossSalary - preTaxDeductions

  // Calculate post-tax deductions
  const postTaxDeductions = deductions
    .filter((d) => !d.preTax)
    .reduce((total, deduction) => {
      if (deduction.type === "fixed") {
        return total + deduction.value
      } else {
        // Percentage deduction
        return total + (taxableIncome * deduction.value) / 100
      }
    }, 0)

  // Calculate total deductions
  const totalDeductions = preTaxDeductions + postTaxDeductions

  // Calculate net salary
  const netSalary = grossSalary - totalDeductions

  return {
    basicSalary,
    totalAllowances,
    totalDeductions,
    netSalary,
  }
}
