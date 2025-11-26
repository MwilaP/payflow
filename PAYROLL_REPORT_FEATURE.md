# Payroll Report Feature

## Overview

Comprehensive payroll reporting system that breaks down deductions and allowances by type across all employees in a payroll period.

## Features

### 📊 Deduction Breakdown

- **Individual deduction types**: PAYE, NAPSA, NHIMA, Loans, etc.
- **Total amount per deduction type**
- **Employee count**: How many employees have each deduction
- **Average amount**: Average deduction per employee

### 💰 Allowance Breakdown

- **Individual allowance types**: Housing, Transport, etc.
- **Total amount per allowance type**
- **Employee count**: How many employees receive each allowance
- **Average amount**: Average allowance per employee

### 📈 Summary Cards

- Total Employees
- Total Gross Pay
- Total Deductions (highlighted in red)
- Total Net Pay (highlighted in green)

### 📋 Payroll Summary Table

- Total Basic Salary
- Total Allowances
- Total Gross Pay
- Total Deductions
- Total Net Pay

## How to Access

1. Navigate to **Payroll** → **History**
2. Click on any payroll record
3. Click the **"View Report"** button (with bar chart icon)

## Report Actions

### Export CSV

- Exports complete report data to CSV format
- Includes all breakdowns and summaries
- Filename format: `payroll_report_[period]_[date].csv`

### Print Report

- Uses browser's print functionality
- Print-friendly layout
- All tables and summaries included

## Report Structure

### CSV Export Format

```
Payroll Report
Period: Monthly
Date: 19/11/2025
Total Employees: 50

Summary
Description,Amount
Total Basic Salary,500000.00
Total Allowances,150000.00
Total Gross Pay,650000.00
Total Deductions,195000.00
Total Net Pay,455000.00

Deduction Breakdown
Deduction Type,Total Amount,Employee Count,Average Amount
PAYE,125000.00,50,2500.00
NAPSA,25000.00,50,500.00
NHIMA,10000.00,50,200.00
Loan Repayment,35000.00,15,2333.33

Allowance Breakdown
Allowance Type,Total Amount,Employee Count,Average Amount
Housing Allowance,100000.00,50,2000.00
Transport Allowance,50000.00,50,1000.00
```

## Technical Implementation

### Data Processing

1. **Aggregation**: Loops through all payroll items
2. **Grouping**: Groups deductions/allowances by name
3. **Calculation**: Computes totals, counts, and averages
4. **Sorting**: Orders by total amount (descending)

### Components

- **PayrollReportPage.tsx**: Main report page component
- **Route**: `/payroll/history/:id/report`
- **Navigation**: Button added to PayrollHistoryDetailPage

### Data Structures

```typescript
interface DeductionSummary {
  name: string
  totalAmount: number
  employeeCount: number
  averageAmount: number
}

interface AllowanceSummary {
  name: string
  totalAmount: number
  employeeCount: number
  averageAmount: number
}

interface PayrollReport {
  payrollRecord: PayrollHistory
  totalEmployees: number
  totalBasicSalary: number
  totalAllowances: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  deductionBreakdown: DeductionSummary[]
  allowanceBreakdown: AllowanceSummary[]
}
```

## Use Cases

### 1. Tax Reporting

- See total PAYE collected
- See total NAPSA contributions
- See total NHIMA contributions

### 2. Budget Analysis

- Analyze allowance costs
- Compare deduction types
- Track average costs per employee

### 3. Compliance

- Verify statutory deductions
- Audit payroll calculations
- Generate reports for authorities

### 4. Financial Planning

- Forecast future payroll costs
- Analyze cost distribution
- Identify cost-saving opportunities

## Benefits

✅ **Transparency**: Clear breakdown of all costs
✅ **Compliance**: Easy reporting for tax authorities
✅ **Analysis**: Understand payroll composition
✅ **Export**: Share data with stakeholders
✅ **Print**: Physical records for filing

## Future Enhancements

- [ ] PDF export option
- [ ] Chart visualizations
- [ ] Comparison with previous periods
- [ ] Trend analysis
- [ ] Custom date range filtering
- [ ] Department-wise breakdowns
