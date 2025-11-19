import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

// SQLite Employee model (converted from PouchDB structure)
export const sqliteEmployeeSchema = z.object({
  id: z.string().default(() => `employee_${uuidv4()}`),
  rev: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  address: z.string().optional(),

  // Job information
  department: z.string().optional(),
  designation: z.string().optional(),
  employment_type: z.enum(["full-time", "part-time", "contract", "intern"]),
  hire_date: z.string().optional(),
  reporting_to: z.string().optional(),
  work_location: z.string().optional(),
  status: z.enum(["Active", "Pending", "On Leave", "Terminated"]).default("Active"),

  // Banking information
  account_number: z.string().optional(),
  bank_name: z.string().optional(),
  branch_name: z.string().optional(),
  ifsc_code: z.string().optional(), 

  // Tax information
  national_id: z.string().optional(),
  tax_number: z.string().optional(),
  pension_number: z.string().optional(),
  tax_status: z.enum(["resident", "non-resident", "foreign"]).or(z.literal("")).optional(),

  // Payroll information
  payroll_structure_id: z.string().optional(),
  // Metadata
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLiteEmployee = z.infer<typeof sqliteEmployeeSchema>

// SQLite Payroll Structure model
export const sqlitePayrollStructureSchema = z.object({
  id: z.string().default(() => `structure_${uuidv4()}`),
  rev: z.string().optional(),
  name: z.string().min(1, "Structure name is required"),
  description: z.string().optional(),
  frequency: z.enum(["monthly", "biweekly", "weekly"]),
  basic_salary: z.number().min(0, "Basic salary must be a positive number"),

  // Metadata
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLitePayrollStructure = z.infer<typeof sqlitePayrollStructureSchema>

// SQLite Allowance model (normalized table)
export const sqliteAllowanceSchema = z.object({
  id: z.string().default(() => `allowance_${uuidv4()}`),
  payroll_structure_id: z.string(),
  name: z.string().min(1, "Allowance name is required"),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().min(0, "Value must be a positive number"),
})

export type SQLiteAllowance = z.infer<typeof sqliteAllowanceSchema>

// SQLite Deduction model (normalized table)
export const sqliteDeductionSchema = z.object({
  id: z.string().default(() => `deduction_${uuidv4()}`),
  payroll_structure_id: z.string(),
  name: z.string().min(1, "Deduction name is required"),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().min(0, "Value must be a positive number"),
  pre_tax: z.boolean().default(true),
})

export type SQLiteDeduction = z.infer<typeof sqliteDeductionSchema>

// SQLite Payroll History model
export const sqlitePayrollHistorySchema = z.object({
  id: z.string().default(() => `history_${uuidv4()}`),
  rev: z.string().optional(),
  employee_id: z.string(),
  payroll_structure_id: z.string(),
  date: z.string(),
  basic_salary: z.number().min(0),
  total_allowances: z.number().default(0),
  total_deductions: z.number().default(0),
  net_salary: z.number(),

  // Metadata
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLitePayrollHistory = z.infer<typeof sqlitePayrollHistorySchema>

// SQLite Settings model
export const sqliteSettingsSchema = z.object({
  id: z.string().default(() => `setting_${uuidv4()}`),
  rev: z.string().optional(),
  key: z.string().min(1, "Setting key is required"),
  value: z.string().min(1, "Setting value is required"),
  type: z.enum(["string", "number", "boolean", "json"]).default("string"),

  // Metadata
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLiteSettings = z.infer<typeof sqliteSettingsSchema>

// SQLite User model
export const sqliteUserSchema = z.object({
  id: z.string().default(() => `user_${uuidv4()}`),
  rev: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "user", "manager"]).default("user"),
  name: z.string().min(1, "Name is required"),

  // Metadata
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLiteUser = z.infer<typeof sqliteUserSchema>

// SQLite Leave Request model
export const sqliteLeaveRequestSchema = z.object({
  id: z.string().default(() => `leave_${uuidv4()}`),
  rev: z.string().optional(),
  employee_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  leave_type: z.string(),
  reason: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),

  // Metadata
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLiteLeaveRequest = z.infer<typeof sqliteLeaveRequestSchema>

// Helper functions to convert between PouchDB and SQLite formats
export const convertPouchDBToSQLite = {
  employee: (pouchEmployee: any): SQLiteEmployee => {
    return {
      id: pouchEmployee._id,
      rev: pouchEmployee._rev,
      first_name: pouchEmployee.firstName,
      last_name: pouchEmployee.lastName,
      email: pouchEmployee.email,
      phone: pouchEmployee.phone,
      dob: pouchEmployee.dob,
      gender: pouchEmployee.gender,
      address: pouchEmployee.address,
      department: pouchEmployee.department,
      designation: pouchEmployee.designation,
      employment_type: pouchEmployee.employmentType,
      hire_date: pouchEmployee.hireDate,
      reporting_to: pouchEmployee.reportingTo,
      work_location: pouchEmployee.workLocation,
      status: pouchEmployee.status,
      account_number: pouchEmployee.accountNumber,
      bank_name: pouchEmployee.bankName,
      branch_name: pouchEmployee.branchName,
      ifsc_code: pouchEmployee.ifscCode,
      national_id: pouchEmployee.nationalId,
      tax_number: pouchEmployee.taxNumber,
      pension_number: pouchEmployee.pensionNumber,
      tax_status: pouchEmployee.taxStatus,
      payroll_structure_id: pouchEmployee.payrollStructureId,
      created_at: pouchEmployee.createdAt,
      updated_at: pouchEmployee.updatedAt,
    }
  },

  payrollStructure: (pouchStructure: any): { structure: SQLitePayrollStructure; allowances: SQLiteAllowance[]; deductions: SQLiteDeduction[] } => {
    const structure: SQLitePayrollStructure = {
      id: pouchStructure._id,
      rev: pouchStructure._rev,
      name: pouchStructure.name,
      description: pouchStructure.description,
      frequency: pouchStructure.frequency,
      basic_salary: pouchStructure.basicSalary,
      created_at: pouchStructure.createdAt,
      updated_at: pouchStructure.updatedAt,
    }

    const allowances: SQLiteAllowance[] = (pouchStructure.allowances || []).map((allowance: any) => ({
      id: allowance.id,
      payroll_structure_id: pouchStructure._id,
      name: allowance.name,
      type: allowance.type,
      value: allowance.value,
    }))

    const deductions: SQLiteDeduction[] = (pouchStructure.deductions || []).map((deduction: any) => ({
      id: deduction.id,
      payroll_structure_id: pouchStructure._id,
      name: deduction.name,
      type: deduction.type,
      value: deduction.value,
      pre_tax: deduction.preTax,
    }))

    return { structure, allowances, deductions }
  }
}

// Helper functions to convert from SQLite to PouchDB format (for compatibility)
export const convertSQLiteToPouchDB = {
  employee: (sqliteEmployee: SQLiteEmployee): any => {
    return {
      _id: sqliteEmployee.id,
      _rev: sqliteEmployee.rev,
      firstName: sqliteEmployee.first_name,
      lastName: sqliteEmployee.last_name,
      email: sqliteEmployee.email,
      phone: sqliteEmployee.phone,
      dob: sqliteEmployee.dob,
      gender: sqliteEmployee.gender,
      address: sqliteEmployee.address,
      department: sqliteEmployee.department,
      designation: sqliteEmployee.designation,
      employmentType: sqliteEmployee.employment_type,
      hireDate: sqliteEmployee.hire_date,
      reportingTo: sqliteEmployee.reporting_to,
      workLocation: sqliteEmployee.work_location,
      status: sqliteEmployee.status,
      accountNumber: sqliteEmployee.account_number,
      bankName: sqliteEmployee.bank_name,
      branchName: sqliteEmployee.branch_name,
      ifscCode: sqliteEmployee.ifsc_code,
      nationalId: sqliteEmployee.national_id,
      taxNumber: sqliteEmployee.tax_number,
      pensionNumber: sqliteEmployee.pension_number,
      taxStatus: sqliteEmployee.tax_status,
      payrollStructureId: sqliteEmployee.payroll_structure_id,
      createdAt: sqliteEmployee.created_at,
      updatedAt: sqliteEmployee.updated_at,
    }
  },

  payrollStructure: (structure: SQLitePayrollStructure, allowances: SQLiteAllowance[], deductions: SQLiteDeduction[]): any => {
    return {
      _id: structure.id,
      _rev: structure.rev,
      name: structure.name,
      description: structure.description,
      frequency: structure.frequency,
      basicSalary: structure.basic_salary,
      allowances: allowances.map(allowance => ({
        id: allowance.id,
        name: allowance.name,
        type: allowance.type,
        value: allowance.value,
      })),
      deductions: deductions.map(deduction => ({
        id: deduction.id,
        name: deduction.name,
        type: deduction.type,
        value: deduction.value,
        preTax: deduction.pre_tax,
      })),
      createdAt: structure.created_at,
      updatedAt: structure.updated_at,
    }
  }
}
