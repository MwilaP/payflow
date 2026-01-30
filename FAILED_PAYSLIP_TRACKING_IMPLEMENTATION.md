# Failed Payslip Tracking & Retry System - Implementation Guide

## Overview

This document describes the complete implementation of a **persistent failed payslip tracking system** that allows HR to view and retry failed email sends even after closing and reopening the application.

## Problem Solved

Previously, when payslip emails failed during batch processing, the failures were only visible in the current session. Once the app was closed, there was no way for HR to:
- See which payslips failed to send
- Understand why they failed
- Retry sending them later

## Solution Architecture

### Database Layer (SQLite)
**New Table**: `failed_payslips`

Stores complete information about each failed email send:
- Employee details (ID, name, email, employee number)
- Payroll period and net salary
- Error message from the email service
- Retry count and last retry timestamp
- Complete payslip data (JSON) for regeneration
- Status (pending/resolved)

### Main Process (Electron)
**File**: `src/main/services/database.service.ts`

Added `failedPayslipService` with operations:
- `create()` - Log a failed send
- `getById()` - Get specific failed payslip
- `getByEmployeeId()` - Get all failures for an employee
- `getByPayrollRecordId()` - Get all failures for a payroll batch
- `getAll()` - Get all failed payslips
- `getPending()` - Get only unresolved failures
- `update()` - Update failure details
- `incrementRetryCount()` - Track retry attempts
- `markAsResolved()` - Mark as successfully sent
- `delete()` - Remove failure record
- `deleteByPayrollRecordId()` - Clean up after successful batch
- `find()` - Search with custom conditions

### IPC Communication
**File**: `src/main/index.ts`

Added 12 IPC handlers for all failed payslip operations:
- `db:failedPayslips:create`
- `db:failedPayslips:getById`
- `db:failedPayslips:getByEmployeeId`
- `db:failedPayslips:getByPayrollRecordId`
- `db:failedPayslips:getAll`
- `db:failedPayslips:getPending`
- `db:failedPayslips:update`
- `db:failedPayslips:incrementRetryCount`
- `db:failedPayslips:markAsResolved`
- `db:failedPayslips:delete`
- `db:failedPayslips:deleteByPayrollRecordId`
- `db:failedPayslips:find`

### Preload Script
**Files**: 
- `src/preload/index.ts`
- `src/preload/index.d.ts`

Exposed `window.api.db.failedPayslips` with all operations available to renderer process.

## Database Schema

```sql
CREATE TABLE failed_payslips (
  id TEXT PRIMARY KEY,
  payroll_record_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_number TEXT,
  period TEXT NOT NULL,
  net_salary REAL NOT NULL,
  error_message TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_retry_at TEXT,
  payslip_data TEXT NOT NULL,  -- JSON string with full payslip details
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Indexes for performance
CREATE INDEX idx_failed_payslips_status ON failed_payslips(status);
CREATE INDEX idx_failed_payslips_employee ON failed_payslips(employee_id);
CREATE INDEX idx_failed_payslips_payroll_record ON failed_payslips(payroll_record_id);
```

## Usage Examples

### 1. Log a Failed Email Send

```typescript
// In email service or payroll processing
const failedPayslip = {
  payroll_record_id: 'payroll_123',
  employee_id: 'emp_456',
  employee_name: 'John Doe',
  employee_email: 'john@example.com',
  employee_number: 'EMP001',
  period: 'January 2024',
  net_salary: 5000,
  error_message: 'SMTP connection timeout',
  retry_count: 0,
  payslip_data: JSON.stringify({
    // Complete payslip details for regeneration
    basicSalary: 4000,
    allowances: [...],
    deductions: [...],
    // ... all other payslip data
  }),
  status: 'pending'
}

const result = await window.api.db.failedPayslips.create(failedPayslip)
if (result.success) {
  console.log('Failed payslip logged:', result.data.id)
}
```

### 2. Get All Pending Failed Payslips

```typescript
const result = await window.api.db.failedPayslips.getPending()
if (result.success) {
  const pendingFailures = result.data
  console.log(`${pendingFailures.length} payslips need retry`)
}
```

### 3. Retry a Failed Payslip

```typescript
// Get the failed payslip
const result = await window.api.db.failedPayslips.getById(failedPayslipId)
if (!result.success || !result.data) return

const failedPayslip = result.data

// Parse the stored payslip data
const payslipData = JSON.parse(failedPayslip.payslip_data)

// Regenerate PDF
const pdfResult = await pdfService.generatePayslip(payslipData)

// Retry sending email
const emailResult = await emailService.sendPayslip({
  employeeName: failedPayslip.employee_name,
  employeeEmail: failedPayslip.employee_email,
  period: failedPayslip.period,
  netSalary: failedPayslip.net_salary,
  payslipPdfBase64: pdfResult.data
})

if (emailResult.success) {
  // Mark as resolved
  await window.api.db.failedPayslips.markAsResolved(failedPayslipId)
} else {
  // Increment retry count
  await window.api.db.failedPayslips.incrementRetryCount(failedPayslipId)
}
```

### 4. Get Failed Payslips for a Specific Payroll Batch

```typescript
const result = await window.api.db.failedPayslips.getByPayrollRecordId('payroll_123')
if (result.success) {
  const failures = result.data
  console.log(`${failures.length} failures in this batch`)
}
```

### 5. Clean Up After Successful Retry

```typescript
// Delete all resolved failures for a payroll batch
const result = await window.api.db.failedPayslips.find({
  payroll_record_id: 'payroll_123',
  status: 'resolved'
})

if (result.success) {
  for (const failure of result.data) {
    await window.api.db.failedPayslips.delete(failure.id)
  }
}
```

## Next Steps (To Complete Implementation)

### 1. Update Email Service to Log Failures

**File**: `src/main/services/email.service.ts`

Modify `sendBulkPayslips()` to log failures to database:

```typescript
async sendBulkPayslips(payslips: EmailPayslipData[], payrollRecordId?: string): Promise<BulkEmailResult> {
  // ... existing code ...
  
  for (const payslip of payslips) {
    try {
      await this.sendPayslipEmail(payslip)
      result.sent++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        email: payslip.employeeEmail,
        error: error.message || 'Unknown error'
      })
      
      // NEW: Log to database if payrollRecordId provided
      if (payrollRecordId && payslip.employeeId) {
        try {
          await failedPayslipService.create({
            payroll_record_id: payrollRecordId,
            employee_id: payslip.employeeId,
            employee_name: payslip.employeeName,
            employee_email: payslip.employeeEmail,
            employee_number: payslip.employeeNumber || '',
            period: payslip.period,
            net_salary: payslip.netSalary,
            error_message: error.message || 'Unknown error',
            retry_count: 0,
            payslip_data: JSON.stringify(payslip),
            status: 'pending'
          })
        } catch (dbError) {
          console.error('Failed to log failed payslip:', dbError)
        }
      }
    }
  }
  
  return result
}
```

### 2. Create Failed Payslips Page/Component

**File**: `src/renderer/src/pages/FailedPayslipsPage.tsx` (new)

Create a dedicated page for HR to view and manage failed payslips:

```tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, Trash2 } from 'lucide-react'

export function FailedPayslipsPage() {
  const [failedPayslips, setFailedPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadFailedPayslips()
  }, [])
  
  const loadFailedPayslips = async () => {
    const result = await window.api.db.failedPayslips.getPending()
    if (result.success) {
      setFailedPayslips(result.data)
    }
    setLoading(false)
  }
  
  const handleRetry = async (failedPayslip) => {
    // Implement retry logic
    // 1. Parse payslip_data
    // 2. Regenerate PDF
    // 3. Resend email
    // 4. Update status
  }
  
  const handleDelete = async (id) => {
    await window.api.db.failedPayslips.delete(id)
    loadFailedPayslips()
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Failed Payslip Emails</h1>
      
      {failedPayslips.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg">No failed payslips! All emails sent successfully.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {failedPayslips.map((failure) => (
            <div key={failure.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{failure.employee_name}</h3>
                  <p className="text-sm text-muted-foreground">{failure.employee_email}</p>
                  <p className="text-sm mt-2">Period: {failure.period}</p>
                  <p className="text-sm">Net Salary: K{failure.net_salary.toLocaleString()}</p>
                  <div className="mt-2 text-sm text-red-600">
                    Error: {failure.error_message}
                  </div>
                  {failure.retry_count > 0 && (
                    <Badge variant="outline" className="mt-2">
                      Retried {failure.retry_count} time(s)
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRetry(failure)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(failure.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 3. Update Existing Failed Emails Dialog

**File**: `src/renderer/src/components/failed-emails-dialog.tsx`

The existing dialog already handles retry logic. Update it to also:
- Log successful retries to mark as resolved
- Show retry count from database
- Persist retry attempts

### 4. Add Navigation Link

Add a link to the failed payslips page in your navigation menu:

```tsx
<NavLink to="/failed-payslips">
  <AlertTriangle className="h-4 w-4" />
  Failed Payslips
  {pendingCount > 0 && (
    <Badge variant="destructive">{pendingCount}</Badge>
  )}
</NavLink>
```

### 5. Add Dashboard Widget

Show failed payslip count on the dashboard:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Failed Payslips</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{failedCount}</div>
    <p className="text-sm text-muted-foreground">
      Require attention
    </p>
    <Button className="mt-4" onClick={() => navigate('/failed-payslips')}>
      View All
    </Button>
  </CardContent>
</Card>
```

## Benefits

### ✅ Persistent Tracking
- Failed sends are stored in SQLite database
- Survives app restarts
- Complete audit trail

### ✅ Complete Context
- Full error messages
- Employee details
- Payslip data for regeneration
- Retry history

### ✅ Flexible Retry
- Retry individual failures
- Retry by payroll batch
- Retry all pending
- Track retry attempts

### ✅ Clean Management
- Mark as resolved when successful
- Delete old failures
- Search and filter
- Status tracking

## Database Location

The failed payslips are stored in:
- **Windows**: `C:\Users\{username}\AppData\Roaming\payflow\payroll.db`
- **macOS**: `~/Library/Application Support/payflow/payroll.db`
- **Linux**: `~/.config/payflow/payroll.db`

## Testing Checklist

- [ ] Create a failed payslip record manually
- [ ] Verify it persists after app restart
- [ ] Test retry functionality
- [ ] Test marking as resolved
- [ ] Test deleting failures
- [ ] Test getting pending failures
- [ ] Test getting failures by payroll record
- [ ] Test getting failures by employee
- [ ] Test retry count increment
- [ ] Test error message storage
- [ ] Verify indexes improve query performance

## API Reference

### Create Failed Payslip
```typescript
window.api.db.failedPayslips.create(failedPayslip)
// Returns: { success: boolean; data?: FailedPayslip; error?: string }
```

### Get By ID
```typescript
window.api.db.failedPayslips.getById(id)
// Returns: { success: boolean; data?: FailedPayslip; error?: string }
```

### Get All Pending
```typescript
window.api.db.failedPayslips.getPending()
// Returns: { success: boolean; data?: FailedPayslip[]; error?: string }
```

### Mark As Resolved
```typescript
window.api.db.failedPayslips.markAsResolved(id)
// Returns: { success: boolean; data?: FailedPayslip; error?: string }
```

### Increment Retry Count
```typescript
window.api.db.failedPayslips.incrementRetryCount(id)
// Returns: { success: boolean; data?: FailedPayslip; error?: string }
```

### Delete
```typescript
window.api.db.failedPayslips.delete(id)
// Returns: { success: boolean; data?: boolean; error?: string }
```

## Summary

The failed payslip tracking system is now **fully implemented at the database and IPC layer**. The remaining work involves:

1. **Integrating with email service** to automatically log failures
2. **Creating UI components** for HR to view and manage failures
3. **Adding navigation and dashboard widgets** for visibility
4. **Testing the complete flow** from failure to successful retry

This provides a production-ready foundation for reliable payslip email delivery with full failure recovery capabilities.
