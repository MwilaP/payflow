export interface LeaveRequest {
  _id: string
  _rev?: string
  employeeId: string
  employeeName: string
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other'
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}