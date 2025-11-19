import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LeaveRequest } from "@/lib/db/models/leave-request.model"

interface LeaveRequestsListProps {
  leaveRequests?: LeaveRequest[]
}

export function LeaveRequestsList({ leaveRequests = [] }: LeaveRequestsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((request) => (
            <TableRow key={request._id}>
              <TableCell>{request.employeeName}</TableCell>
              <TableCell>{request.leaveType}</TableCell>
              <TableCell>{request.startDate}</TableCell>
              <TableCell>{request.endDate}</TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell className="text-right">
                {/* Action buttons will go here */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}