import { Allowance, Deduction, PayrollStructure } from "./payroll-structure.model";
import { PayrollHistory } from "../services/payroll-history.service";

/**
 * Represents a salary breakdown with all components
 */
export interface SalaryBreakdown {
  /** Basic salary amount */
  basicSalary: number;

  /** List of allowances with calculated amounts */
  allowances: Array<{
    id: string;
    name: string;
    type: 'fixed' | 'percentage';
    value: number;
    calculatedAmount: number;
  }>;

  /** List of deductions with calculated amounts */
  deductions: Array<{
    id: string;
    name: string;
    type: 'fixed' | 'percentage';
    value: number;
    preTax: boolean;
    calculatedAmount: number;
  }>;

  /** Total of all allowances */
  totalAllowances: number;

  /** Total of all deductions */
  totalDeductions: number;

  /** Gross salary (basic + allowances) */
  grossSalary: number;

  /** Net salary (gross - deductions) */
  netSalary: number;

  /** Tax amount if applicable */
  tax?: number;
}

/**
 * Represents employee information for payslip
 */
export interface PayslipEmployeeInfo {
  /** Employee ID */
  id: string;

  /** Full name */
  name: string;

  /** Employee position/title */
  position: string;

  /** Department */
  department: string;

  /** Employee number/ID */
  employeeNumber: string;
  nrc: string;
  email: string;

  /** Bank account details */
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    branchCode?: string;
  };
}

/**
 * Represents a complete payslip combining all relevant data
 */
export interface Payslip {
  /** Unique payslip ID */
  _id: string;

  /** Revision ID for database */
  _rev?: string;

  /** Reference to payroll history record */
  payrollHistoryId: string;

  /** Employee information */
  employee: PayslipEmployeeInfo;

  /** Pay period information */
  payPeriod: {
    startDate: string;
    endDate: string;
    paymentDate: string;
  };

  period: string;

  /** Salary breakdown */
  salary: SalaryBreakdown;

  /** Payroll structure used */
  payrollStructure: Pick<PayrollStructure, '_id' | 'name' | 'frequency'>;

  /** Status of the payslip */
  status: 'generated' | 'approved' | 'paid' | 'cancelled';

  /** Metadata */
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  cancelledAt?: string;

  /** Additional notes */
  notes?: string;
}

/**
 * Helper function to create a new payslip with default values
 */
export const createNewPayslip = (data: Partial<Payslip>): Payslip => {
  const now = new Date().toISOString();

  const defaultPayslip: Partial<Payslip> = {
    _id: `payslip_${Date.now()}`,
    status: 'generated',
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...defaultPayslip,
    ...data,
  } as Payslip;
};

/**
 * Validates a payslip object against required fields
 */
export const validatePayslip = (payslip: Partial<Payslip>): boolean => {
  const requiredFields: Array<keyof Payslip> = [
    '_id',
    'payrollHistoryId',
    'employee',
    'payPeriod',
    'salary',
    'payrollStructure',
    'status',
    'createdAt'
  ];

  return requiredFields.every(field => payslip[field] !== undefined);
};

/**
 * Calculates salary breakdown from payroll structure and basic salary
 */
export const calculateSalaryBreakdown = (
  basicSalary: number,
  allowances: Allowance[],
  deductions: Deduction[]
): SalaryBreakdown => {
  // Calculate allowances
  const calculatedAllowances = allowances.map(allowance => ({
    id: allowance.id,
    name: allowance.name,
    type: allowance.type,
    value: allowance.value,
    calculatedAmount: allowance.type === 'fixed'
      ? allowance.value
      : (basicSalary * allowance.value) / 100
  }));

  const totalAllowances = calculatedAllowances.reduce(
    (sum, allowance) => sum + allowance.calculatedAmount, 0
  );

  const grossSalary = basicSalary + totalAllowances;

  // Calculate deductions
  const calculatedDeductions = deductions.map(deduction => ({
    id: deduction.id,
    name: deduction.name,
    type: deduction.type,
    value: deduction.value,
    preTax: deduction.preTax,
    calculatedAmount: deduction.type === 'fixed'
      ? deduction.value
      : (grossSalary * deduction.value) / 100
  }));

  const totalDeductions = calculatedDeductions.reduce(
    (sum, deduction) => sum + deduction.calculatedAmount, 0
  );

  return {
    basicSalary,
    allowances: calculatedAllowances,
    deductions: calculatedDeductions,
    totalAllowances,
    totalDeductions,
    grossSalary,
    netSalary: grossSalary - totalDeductions
  };
};