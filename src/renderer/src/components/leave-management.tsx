'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { leaveRequestService } from '@/lib/db/services/leave-request.service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Check, X } from 'lucide-react'
import { format } from 'date-fns'

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

export function LeaveManagement() {
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const leaveService = await leaveRequestService
      const leaveData = await leaveService.getAll()
      setLeaveRecords(leaveData as LeaveRecord[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load leave data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const service = await leaveRequestService
      await service.update(leaveId, { status: 'approved' })
      setLeaveRecords(
        leaveRecords.map((leave) =>
          leave._id === leaveId ? { ...leave, status: 'approved' } : leave
        )
      )
      toast({
        title: 'Success',
        description: 'Leave approved'
      })
    } catch (err) {
      console.error('Error approving leave:', err)
      toast({
        title: 'Error',
        description: 'Failed to approve leave',
        variant: 'destructive'
      })
    }
  }

  const handleRejectLeave = async (leaveId: string) => {
    try {
      const service = await leaveRequestService
      await service.update(leaveId, { status: 'rejected' })
      setLeaveRecords(
        leaveRecords.map((leave) =>
          leave._id === leaveId ? { ...leave, status: 'rejected' } : leave
        )
      )
      toast({
        title: 'Success',
        description: 'Leave rejected'
      })
    } catch (err) {
      console.error('Error rejecting leave:', err)
      toast({
        title: 'Error',
        description: 'Failed to reject leave',
        variant: 'destructive'
      })
    }
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const pendingLeaves = leaveRecords.filter((leave) => leave.status === 'pending')
  const approvedLeaves = leaveRecords.filter((leave) => leave.status === 'approved')
  const rejectedLeaves = leaveRecords.filter((leave) => leave.status === 'rejected')

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Leave Management Overview</CardTitle>
            <CardDescription>View and manage all employee leave records. To process leave for an employee, go to Employees page → Select employee → Manage Leave</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({leaveRecords.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingLeaves.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedLeaves.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedLeaves.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No leave records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaveRecords.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell className="font-medium">{leave.employeeName}</TableCell>
                          <TableCell className="capitalize">{leave.leaveType}</TableCell>
                          <TableCell>
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{calculateDays(leave.startDate, leave.endDate)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(leave.status)}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {leave.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApproveLeave(leave._id)}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRejectLeave(leave._id)}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No pending leave records
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingLeaves.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell className="font-medium">{leave.employeeName}</TableCell>
                          <TableCell className="capitalize">{leave.leaveType}</TableCell>
                          <TableCell>
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{calculateDays(leave.startDate, leave.endDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveLeave(leave._id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectLeave(leave._id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No approved leave records
                        </TableCell>
                      </TableRow>
                    ) : (
                      approvedLeaves.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell className="font-medium">{leave.employeeName}</TableCell>
                          <TableCell className="capitalize">{leave.leaveType}</TableCell>
                          <TableCell>
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{calculateDays(leave.startDate, leave.endDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No rejected leave records
                        </TableCell>
                      </TableRow>
                    ) : (
                      rejectedLeaves.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell className="font-medium">{leave.employeeName}</TableCell>
                          <TableCell className="capitalize">{leave.leaveType}</TableCell>
                          <TableCell>
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{calculateDays(leave.startDate, leave.endDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
