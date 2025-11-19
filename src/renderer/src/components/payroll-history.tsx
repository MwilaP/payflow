import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Download, Eye, FileText, Mail, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useDatabase } from "@/lib/db/db-context"
import { getPayrollHistoryService } from "@/lib/db/services/service-factory"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

        console.error("Error initializing services:", error)
        setServiceError("Failed to initialize services. The application will run with limited functionality.")

        // Set services to empty implementations to avoid null errors
        //  setEmployeeService({})
        setPayrollHistoryService({})
        setServicesLoaded(true)

        toast({
          title: "Warning",
          description: "Running in limited functionality mode due to database initialization issues.",
          variant: "destructive",
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
        console.log("payroll-history", sorted)
        setPayrollHistory(sorted)
        
        // Calculate total pages
        setTotalPages(Math.max(1, Math.ceil(sorted.length / itemsPerPage)))
      } catch (error) {
        console.error("Error loading payroll history:", error)
        setPayrollHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPayrollHistory()
  }, [payrollHistoryService])

  const handleGeneratePayroll = () => {
    navigate("/payroll/generate")
  }
  
  const handleDeletePayroll = async () => {
    if (!payrollToDelete || !payrollHistoryService) return
    
    try {
      setIsDeleting(true)
      await payrollHistoryService.deletePayrollRecord(payrollToDelete)
      
      // Update the list after deletion
      setPayrollHistory(prev => prev.filter(item => item._id !== payrollToDelete))
      
      toast({
        title: "Success",
        description: "Payroll record deleted successfully",
      })
      
      // Recalculate total pages
      const newTotalPages = Math.max(1, Math.ceil((payrollHistory.length - 1) / itemsPerPage))
      setTotalPages(newTotalPages)
      
      // Adjust current page if needed
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error("Error deleting payroll record:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete payroll record",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPayrollToDelete(null)
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
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No payroll history</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4">Generate your first payroll to see history</p>
      <Button onClick={handleGeneratePayroll} size="sm">
        <DollarSign className="mr-2 h-4 w-4" />
        Generate Payroll
      </Button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  // Calculate current page items
  const paginatedPayrollHistory = payrollHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <LoadingState />
        ) : payrollHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayrollHistory.map((payroll) => (
                    <TableRow key={payroll._id}>
                      <TableCell className="font-medium">{payroll.period || "Monthly Payroll"}</TableCell>
                      <TableCell>{payroll.date ? new Date(payroll.date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>{payroll.employeeCount || 0}</TableCell>
                      <TableCell>K{payroll.totalAmount?.toLocaleString() || "0"}</TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/payroll/history/${payroll._id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="mr-2 h-4 w-4" />
                            Email All
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDeleteDialog(payroll._id)}
                            disabled={payroll.status === "processing" || isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
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
                    {isDeleting ? "Deleting..." : "Delete"}
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
