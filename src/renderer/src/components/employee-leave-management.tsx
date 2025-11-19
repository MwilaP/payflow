"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getEmployeeService } from "@/lib/db/services/service-factory"
import { leaveRequestService } from "@/lib/db/services/leave-request.service"
import {
  calculateLeaveBalance,
  calculateLeaveTaken,
  calculateAvailableLeave
} from "@/lib/utils/leave-calculations"
import { Download, Mail, Printer, ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LeaveRequestForm } from "@/components/leave-request-form"

interface LeaveHistory {
  _id: string
  startDate: string
  endDate: string
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt?: string
  updatedAt?: string
}

export default function EmployeeLeaveManagement({ id }: { id: string }) {
  const [employee, setEmployee] = useState<any>(null)
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [showRequestForm, setShowRequestForm] = useState(false)

  const handleLeaveRequestSuccess = (newLeave: LeaveHistory) => {
    setLeaveHistory([newLeave, ...leaveHistory])
    setShowRequestForm(false)
    toast({
      title: "Success",
      description: "Leave request submitted",
    })
  }

  const handleCancelLeave = async (leaveId: string) => {
    try {
      const service = await leaveRequestService
      await service.update(leaveId, { status: 'rejected' })
      setLeaveHistory(leaveHistory.map(leave =>
        leave._id === leaveId ? { ...leave, status: 'rejected' } : leave
      ))
      toast({
        title: "Success",
        description: "Leave request cancelled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel leave request",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeeServiceInstance, leaveService] = await Promise.all([
          getEmployeeService(),
          leaveRequestService
        ])

        const [employeeData, leaveHistoryData] = await Promise.all([
          employeeServiceInstance.getEmployeeById(id),
          leaveService.getAll()
        ])

        setEmployee(employeeData)
        setLeaveHistory(
          leaveHistoryData
            .filter((req: any) => req.employeeId === id)
            .map((req: any) => ({
              _id: req._id,
              startDate: req.startDate,
              endDate: req.endDate,
              leaveType: req.leaveType,
              status: req.status,
              reason: req.reason,
              createdAt: req.createdAt,
              updatedAt: req.updatedAt
            }))
        )
      } catch (error) {
        console.log('error', error)
        toast({
          title: "Error",
          description: "Failed to load leave data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, toast])

  if (isLoading) return <div>Loading...</div>
  if (!employee) return <div>Employee not found</div>

  const remainingLeave = calculateLeaveBalance(employee.hireDate)

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Leave Management: {employee?.firstName} {employee.lastName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Remaining Leave</h3>
                <p className="text-2xl font-bold">{remainingLeave} days</p>

              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Start Date</h3>
                <p>{new Date(employee.hireDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Leave History</h3>
                <Button onClick={() => setShowRequestForm(true)}>
                  Request Leave
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveHistory.map((leave) => {
                      const startDate = new Date(leave.startDate)
                      const endDate = new Date(leave.endDate)
                      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                      return (
                        <TableRow key={leave._id}>
                          <TableCell>
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>{leave.leaveType}</TableCell>
                          <TableCell>{days}</TableCell>
                          <TableCell>
                            <Badge variant={leave.status === 'approved' ? 'default' : 'secondary'}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {leave.status === 'pending' && (
                              <Button variant="ghost" size="sm" onClick={() => handleCancelLeave(leave._id)}>
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {showRequestForm && (
              <LeaveRequestForm
                employee={{
                  id: employee._id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  hireDate: employee.hireDate
                }}
                onSubmit={async (formData) => {
                  try {
                    
                    const service = await leaveRequestService
                    const newRequest = await service.create({
                      employeeId: employee._id,
                      employeeName: `${employee.firstName} ${employee.lastName}`,
                      leaveType: formData.leaveType as LeaveHistory['leaveType'],
                      startDate: formData.startDate.toISOString(),
                      endDate: formData.endDate.toISOString(),
                      reason: formData.reason || '',
                      status: 'pending',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    })
                    return {
                      _id: newRequest._id,
                      startDate: newRequest.startDate,
                      endDate: newRequest.endDate,
                      leaveType: newRequest.leaveType,
                      status: newRequest.status,
                      reason: newRequest.reason
                    }

                  }
                  catch (error) {
                    console.log(error)

                  }

                }}
                onSuccess={(newLeave) => {
                  handleLeaveRequestSuccess({
                    ...newLeave,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  })
                }}
                onCancel={() => setShowRequestForm(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}