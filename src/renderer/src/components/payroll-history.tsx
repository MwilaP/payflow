import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Download,
  Eye,
  FileText,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  MoreVertical,
  Users
} from 'lucide-react'
import { useDatabase } from '@/lib/db/db-context'
import { getPayrollHistoryService } from '@/lib/db/services/service-factory'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
export function PayrollHistory() {
  const navigate = useNavigate()
  //const { isLoading } = useDatabase()
  const [payrollHistoryService, setPayrollHistoryService] = useState<any>(null)
  const [servicesLoaded, setServicesLoaded] = useState(false)
  const [serviceError, setServiceError] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [payrollHistory, setPayrollHistory] = useState<any[]>([])
  const [payrollToDelete, setPayrollToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [completingPayrollId, setCompletingPayrollId] = useState<string | null>(null)
  const [processingPayrollId, setProcessingPayrollId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20
  const { toast } = useToast()

  useEffect(() => {
    const getPayrollService = async () => {
      try {
        const payrollservice = await getPayrollHistoryService()
        setPayrollHistoryService(payrollservice)
        console.log('Payroll service initialized')
      } catch (error) {
        console.error('Error initializing services:', error)
        setServiceError(
          'Failed to initialize services. The application will run with limited functionality.'
        )

        // Set services to empty implementations to avoid null errors
        //  setEmployeeService({})
        setPayrollHistoryService({})
        setServicesLoaded(true)

        toast({
          title: 'Warning',
          description:
            'Running in limited functionality mode due to database initialization issues.',
          variant: 'destructive'
        })
      }
    }
    getPayrollService()
  }, [])
  useEffect(() => {
    const loadPayrollHistory = async () => {
      if (!payrollHistoryService) return

      try {
        setIsLoading(true)
        const data = await payrollHistoryService.getAllPayrollRecords()
        // Sort by date (newest first)
        const sorted = [...data].sort((a, b) => {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        })
        console.log('payroll-history', sorted)
        setPayrollHistory(sorted)

        // Calculate total pages
        setTotalPages(Math.max(1, Math.ceil(sorted.length / itemsPerPage)))
      } catch (error) {
        console.error('Error loading payroll history:', error)
        setPayrollHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPayrollHistory()
  }, [payrollHistoryService])

  const handleGeneratePayroll = () => {
    navigate('/payroll/generate')
  }

  const handleDeletePayroll = async () => {
    if (!payrollToDelete || !payrollHistoryService) return

    try {
      setIsDeleting(true)
      await payrollHistoryService.deletePayrollRecord(payrollToDelete)

      // Update the list after deletion
      setPayrollHistory((prev) => prev.filter((item) => item._id !== payrollToDelete))

      toast({
        title: 'Success',
        description: 'Payroll record deleted successfully'
      })

      // Recalculate total pages
      const newTotalPages = Math.max(1, Math.ceil((payrollHistory.length - 1) / itemsPerPage))
      setTotalPages(newTotalPages)

      // Adjust current page if needed
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error('Error deleting payroll record:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payroll record',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPayrollToDelete(null)
    }
  }

  const handleProcessPayroll = async (payrollId: string, currentStatus: string) => {
    if (!payrollHistoryService) return

    if (currentStatus === 'processing') {
      toast({
        title: 'Already Processing',
        description: 'This payroll is already in processing status.',
        variant: 'destructive'
      })
      return
    }

    if (currentStatus === 'completed') {
      toast({
        title: 'Already Completed',
        description: 'This payroll has already been completed.',
        variant: 'destructive'
      })
      return
    }

    if (currentStatus !== 'draft' && currentStatus !== 'pending') {
      toast({
        title: 'Invalid Status',
        description: 'Only draft or pending payrolls can be moved to processing.',
        variant: 'destructive'
      })
      return
    }

    try {
      setProcessingPayrollId(payrollId)
      const updatedRecord = await payrollHistoryService.processPayroll(payrollId)

      if (updatedRecord) {
        setPayrollHistory((prev) =>
          prev.map((item) => (item._id === payrollId ? updatedRecord : item))
        )

        toast({
          title: 'Payroll Processing Started',
          description: 'The payroll has been moved to processing status.'
        })
      }
    } catch (error: any) {
      console.error('Error processing payroll:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to start processing payroll. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setProcessingPayrollId(null)
    }
  }

  const handleCompletePayroll = async (payrollId: string, currentStatus: string) => {
    if (!payrollHistoryService) return

    if (currentStatus === 'completed') {
      toast({
        title: 'Already Completed',
        description: 'This payroll has already been marked as completed.',
        variant: 'destructive'
      })
      return
    }

    if (currentStatus !== 'processing') {
      toast({
        title: 'Invalid Status',
        description: 'Only payrolls with "Processing" status can be marked as complete.',
        variant: 'destructive'
      })
      return
    }

    try {
      setCompletingPayrollId(payrollId)
      const updatedRecord = await payrollHistoryService.completePayroll(payrollId)

      if (updatedRecord) {
        // Update the list with the new status
        setPayrollHistory((prev) =>
          prev.map((item) => (item._id === payrollId ? updatedRecord : item))
        )

        toast({
          title: 'Payroll Completed',
          description: 'The payroll has been successfully marked as completed.'
        })
      }
    } catch (error: any) {
      console.error('Error completing payroll:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete payroll. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setCompletingPayrollId(null)
    }
  }

  const openDeleteDialog = (payrollId: string) => {
    setPayrollToDelete(payrollId)
    setDeleteDialogOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 shadow-sm px-3 py-1">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 shadow-sm px-3 py-1">
            <Play className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="shadow-sm px-3 py-1">
            Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="shadow-sm px-3 py-1">
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="shadow-sm px-3 py-1">
            Unknown
          </Badge>
        )
    }
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <FileText className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">No payroll history</h3>
      <p className="text-base text-muted-foreground mt-2 mb-6 max-w-md">
        Get started by generating your first payroll. All payroll records will appear here.
      </p>
      <Button onClick={handleGeneratePayroll} size="lg" className="shadow-md">
        <DollarSign className="mr-2 h-5 w-5" />
        Generate Your First Payroll
      </Button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center py-16">
      <div className="animate-pulse space-y-6 w-full">
        <div className="h-10 bg-muted rounded-lg w-1/4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded-lg"></div>
          <div className="h-16 bg-muted rounded-lg"></div>
          <div className="h-16 bg-muted rounded-lg"></div>
          <div className="h-16 bg-muted rounded-lg"></div>
        </div>
      </div>
    </div>
  )

  // Calculate current page items
  const paginatedPayrollHistory = payrollHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        {isLoading ? (
          <LoadingState />
        ) : payrollHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="rounded-xl border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Employees</TableHead>
                    <TableHead className="font-semibold">Total Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayrollHistory.map((payroll) => (
                    <TableRow key={payroll._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold">
                        {payroll.period || 'Monthly Payroll'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payroll.date ? new Date(payroll.date).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{payroll.employeeCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-lg">K{payroll.totalAmount?.toLocaleString() || '0'}</TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/payroll/history/${payroll._id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            {(payroll.status === 'draft' || payroll.status === 'pending') && (
                              <DropdownMenuItem
                                onClick={() => handleProcessPayroll(payroll._id, payroll.status)}
                                disabled={processingPayrollId === payroll._id}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                {processingPayrollId === payroll._id ? 'Starting...' : 'Start Processing'}
                              </DropdownMenuItem>
                            )}
                            
                            {payroll.status === 'processing' && (
                              <DropdownMenuItem
                                onClick={() => handleCompletePayroll(payroll._id, payroll.status)}
                                disabled={completingPayrollId === payroll._id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {completingPayrollId === payroll._id ? 'Completing...' : 'Mark as Complete'}
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Payslips
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(payroll._id)}
                              disabled={payroll.status === 'processing' || isDeleting}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="shadow-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the payroll record
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePayroll}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
