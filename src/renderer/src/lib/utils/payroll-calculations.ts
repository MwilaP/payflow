import { Deduction } from "@/lib/db/models/payroll-structure.model";

export function calculateTaxDeduction(grossPay: number): number {
  if (grossPay <= 5100) {
    return 0;
  } else if (5100 < grossPay && grossPay <= 7100) {
    return (grossPay - 5100) * 0.20;
  } else if (7100 < grossPay && grossPay <= 9200) {
    return ((grossPay - 7100) * 0.30) + (7100-5100)*0.2;
  }
  return ((grossPay - 9200) * 0.37) + ((7100-5100)*0.2) + ((9200-7100)*0.3);
}

export function calculateNapsaContribution(grossPay: number): number {
  if (grossPay < 26840.01) {
    return grossPay * 0.05;
  }
  return 1342;
}

export interface PayrollDeductions {
  [key: string]: {
    type: 'fixed' | 'percentage';
    value: number;
    preTax: boolean;
  };
}

export function calculateDeductions(grossSalary: number, deductions: Deduction[]) {
  const deductionsCalculation: PayrollDeductions = {};
  
  deductions.forEach(deduction => {
    if (deduction.type === 'percentage') {
      deductionsCalculation[deduction.id] = {
        type: 'percentage',
        value: (grossSalary * (deduction.value / 100)),
        preTax: deduction.preTax
      };
    } else {
      deductionsCalculation[deduction.id] = {
        type: 'fixed',
        value: deduction.value,
        preTax: deduction.preTax
      };
    }
  });

  return deductionsCalculation;
}

export function calculateNetSalary(
  basicSalary: number, 
  allowances: {type: 'fixed' | 'percentage', value: number}[],
  deductions: Deduction[]
) {
  // Calculate total allowances
  const totalAllowances = allowances.reduce((total, allowance) => {
    if (allowance.type === 'fixed') {
      return total + allowance.value;
    }
    return total + (basicSalary * allowance.value) / 100;
  }, 0);

  const grossSalary = basicSalary + totalAllowances;

  // Calculate deductions
  const calculatedDeductions = calculateDeductions(grossSalary, deductions);
  const totalDeductions = Object.values(calculatedDeductions)
    .reduce((sum, deduction) => sum + deduction.value, 0);

  return {
    grossSalary,
    totalAllowances,
    totalDeductions,
    netSalary: grossSalary - totalDeductions,
    deductions: calculatedDeductions
  };
}