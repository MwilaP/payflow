# Leave Processing System - HR Implementation

## Overview
The leave management system has been successfully transformed from an employee "request leave" system to an HR "process leave" system. This implementation allows HR personnel to directly process and manage employee leave records.

## Workflow

The primary workflow for processing leave is **employee-centric**:

```
Employees Page → Select Employee → Actions Menu → Manage Leave → Process Leave Form
```

**Alternative workflow** for managing pending leaves across all employees:

```
Leave Management Page → Pending Tab → Approve/Reject Actions
```

## Key Changes

### 1. Main Leave Management Interface (`leave-management.tsx`)
**Location:** `src/renderer/src/components/leave-management.tsx`

**Features:**
- **Overview Dashboard**: Displays all leave records across all employees
- **Tabbed View**: 
  - All leaves (complete overview)
  - Pending leaves (with approve/reject actions)
  - Approved leaves
  - Rejected leaves
- **Approve/Reject Actions**: Quick actions for pending leave records
- **Real-time Updates**: Leave records update immediately after actions
- **Employee-Centric Guidance**: Directs HR to process leave through individual employee pages

### 2. Leave Request Form (`leave-request-form.tsx`)
**Location:** `src/renderer/src/components/leave-request-form.tsx`

**Changes:**
- Updated alert title from "Leave Request Guidelines" to "Process Leave"
- Changed description to "Process employee leave and update leave records"
- Button text changed from "Submit Request" to "Process Leave"
- Removed date restrictions - HR can process historical leave
- Updated error messages to reflect HR processing workflow

### 3. Employee Leave Management (`employee-leave-management.tsx`)
**Location:** `src/renderer/src/components/employee-leave-management.tsx`

**Changes:**
- Button text changed from "Request Leave" to "Process Leave"
- Default status changed from "pending" to "approved" when processing leave
- Success message updated to "Leave processed successfully"
- Cancel action message updated to "Leave cancelled"

### 4. Leave Service (`leave-request.service.ts`)
**Location:** `src/renderer/src/lib/db/services/leave-request.service.ts`

**Changes:**
- Modified `create()` method to default status to "approved" instead of "pending"
- Respects status if explicitly provided in the request
- Maintains all existing functionality for updates and queries

## How to Use the System

### Processing Leave for an Employee (Primary Workflow)

1. Navigate to the **Employees** page
2. Find the employee you want to process leave for
3. Click the **actions menu** (three dots) on the employee row
4. Select **"Manage Leave"**
5. You'll be taken to that employee's leave management page
6. Click **"Process Leave"** button
7. Fill in the leave details:
   - Leave type (Annual, Sick, Maternity, Paternity, Unpaid, Other)
   - Start date
   - End date
   - Reason (optional)
8. Click **"Process Leave"**
9. The leave is immediately created with "approved" status

### Managing Pending Leaves (Overview Dashboard)

1. Navigate to the **Leave Management** page (overview)
2. Go to the **"Pending"** tab
3. View all pending leave records across all employees
4. Click **"Approve"** or **"Reject"** buttons for each record
5. Records are updated immediately

### Viewing Leave History

**From Leave Management Overview:**
- **All Tab**: Shows all leave records across all employees
- **Pending Tab**: Shows only pending leaves (with approve/reject actions)
- **Approved Tab**: Shows only approved leaves
- **Rejected Tab**: Shows only rejected leaves

**From Individual Employee Page:**
- View leave history specific to that employee
- Process new leave for that employee
- Cancel pending leave requests

## Features Maintained

✅ All CRUD operations work correctly
✅ Leave balance calculations remain functional
✅ Date validation (end date must be after start date)
✅ Employee filtering and selection
✅ Leave type categorization
✅ Status management (pending, approved, rejected)
✅ Real-time UI updates
✅ Toast notifications for all actions
✅ Error handling

## Technical Details

### Status Flow
- **New Leave Processing**: Automatically set to "approved"
- **Pending Leaves**: Can be approved or rejected by HR
- **Approved/Rejected**: Final states (can be modified if needed)

### Data Structure
```typescript
interface LeaveRecord {
  _id: string
  employeeId: string
  employeeName: string
  startDate: string
  endDate: string
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt?: string
  updatedAt?: string
}
```

### API Methods
- `create(request)`: Creates new leave record (defaults to approved)
- `update(id, request)`: Updates existing leave record
- `getAll()`: Retrieves all leave records
- `getById(id)`: Retrieves specific leave record

## Files Modified

1. `src/renderer/src/components/leave-management.tsx` - Complete rewrite
2. `src/renderer/src/components/leave-request-form.tsx` - Updated terminology and date restrictions
3. `src/renderer/src/components/employee-leave-management.tsx` - Updated button text and default status
4. `src/renderer/src/lib/db/services/leave-request.service.ts` - Updated default status logic

## Testing Recommendations

1. **Process Leave**: Create leave for multiple employees
2. **Date Ranges**: Test various date ranges including past dates
3. **Leave Types**: Test all leave type options
4. **Status Management**: Approve and reject pending leaves
5. **Tab Navigation**: Verify all tabs display correct filtered data
6. **Employee Selection**: Ensure all employees appear in dropdown
7. **Form Validation**: Test with missing required fields
8. **Error Handling**: Verify error messages display correctly

## Notes

- The system is now fully HR-centric with no employee self-service functionality
- All leave processing is done by HR personnel
- Past dates are allowed for processing historical leave records
- The default behavior is to approve leave immediately upon processing
- Pending leaves can still be managed through the approval workflow
