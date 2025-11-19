import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Mail } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Define props interface
interface EmployeePayslipsProps {
  payslips: any[] // Ideally, define a stricter type based on PayrollRecord
  isLoading: boolean
  error: string | null
}

// Helper function to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (e) {
    return "Invalid Date"
  }
}

// Helper function to format currency
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return "N/A"
  return `K${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function EmployeePayslips({ payslips, isLoading, error }: EmployeePayslipsProps) {
  const { toast } = useToast()
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.max(1, Math.ceil(payslips.length / itemsPerPage))
  
  // Get current payslips for the page
  const currentPayslips = payslips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle view payslip
  const handleViewPayslip = (payslip: any) => {
    setSelectedPayslip(payslip)
    setViewDialogOpen(true)
  }

  // Handle download payslip
  const handleDownloadPayslip = async (payslip: any) => {
    try {
      setIsDownloading(true)
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Payslip downloaded",
        description: `Payslip for ${payslip.period} has been downloaded.`,
      })
    } catch (error) {
      console.error("Error downloading payslip:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the payslip.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle email payslip
  const handleEmailPayslip = async (payslip: any) => {
    try {
      setIsSendingEmail(true)
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Email sent",
        description: `Payslip for ${payslip.period} has been emailed.`,
      })
    } catch (error) {
      console.error("Error emailing payslip:", error)
      toast({
        title: "Email failed",
        description: "There was an error sending the payslip email.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payslips</CardTitle>
          <CardDescription>View and download employee payslips</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <p className="text-destructive">Error loading payslips: {error}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No payslips found for this employee.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPayslips.map((payslip) => (
                      <TableRow key={payslip._id}>
                        <TableCell>{payslip.period || "N/A"}</TableCell>
                        <TableCell>{formatDate(payslip.date)}</TableCell>
                        <TableCell>{formatCurrency(payslip.grossPay)}</TableCell>
                        <TableCell>{formatCurrency(payslip.totalDeductions)}</TableCell>
                        <TableCell>{formatCurrency(payslip.netPay)}</TableCell>
                        <TableCell>
                          <Badge variant={payslip.status === 'paid' ? 'default' : 'secondary'}>
                            {payslip.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleViewPayslip(payslip)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDownloadPayslip(payslip)}
                              disabled={isDownloading}
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEmailPayslip(payslip)}
                              disabled={isSendingEmail}
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Email</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {payslips.length > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min(payslips.length, (currentPage - 1) * itemsPerPage + 1)}-
                    {Math.min(payslips.length, currentPage * itemsPerPage)} of {payslips.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payslip View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">Period: {selectedPayslip.period}</h3>
                <p className="text-sm text-muted-foreground">Issue Date: {formatDate(selectedPayslip.date)}</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 text-sm font-medium">Earnings</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayslip.basicSalary)}</TableCell>
                      </TableRow>
                      
                      {/* Housing Allowance */}
                      {selectedPayslip.housingAllowance > 0 && (
                        <TableRow>
                          <TableCell>Housing Allowance</TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedPayslip.housingAllowance)}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Transport Allowance */}
                      {selectedPayslip.transportAllowance > 0 && (
                        <TableRow>
                          <TableCell>Transport Allowance</TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedPayslip.transportAllowance)}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Other Allowances from breakdown (excluding housing and transport) */}
                      {selectedPayslip.allowanceBreakdown && selectedPayslip.allowanceBreakdown.length > 0 && 
                        selectedPayslip.allowanceBreakdown
                          .filter(item => 
                            !item.name?.toLowerCase().includes('housing') && 
                            !item.name?.toLowerCase().includes('transport')
                          )
                          .map((item, index) => (
                            <TableRow key={`allowance-${index}`}>
                              <TableCell>{item.name || `Allowance ${index + 1}`}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))
                      }
                      
                      <TableRow className="font-medium">
                        <TableCell>Total Earnings</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayslip.grossPay)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h4 className="mb-4 text-sm font-medium">Deductions</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* PAYE Tax */}
                      {selectedPayslip.paye > 0 && (
                        <TableRow>
                          <TableCell>PAYE Tax</TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedPayslip.paye)}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* NAPSA */}
                      {selectedPayslip.napsa > 0 && (
                        <TableRow>
                          <TableCell>NAPSA</TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedPayslip.napsa)}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* NHIMA */}
                      {selectedPayslip.nhima > 0 && (
                        <TableRow>
                          <TableCell>NHIMA</TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedPayslip.nhima)}</TableCell>
                        </TableRow>
                      )}
                      
                      {/* Other Deductions from breakdown (excluding PAYE, NAPSA, NHIMA) */}
                      {selectedPayslip.deductionBreakdown && selectedPayslip.deductionBreakdown.length > 0 && 
                        selectedPayslip.deductionBreakdown
                          .filter(item => 
                            !item.name?.toLowerCase().includes('paye') && 
                            !item.name?.toLowerCase().includes('napsa') && 
                            !item.name?.toLowerCase().includes('nhima')
                          )
                          .map((item, index) => (
                            <TableRow key={`deduction-${index}`}>
                              <TableCell>{item.name || `Deduction ${index + 1}`}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))
                      }
                      
                      <TableRow className="font-medium">
                        <TableCell>Total Deductions</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayslip.totalDeductions)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Net Pay</span>
                  <span>{formatCurrency(selectedPayslip.netPay)}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadPayslip(selectedPayslip)}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleEmailPayslip(selectedPayslip)}
                  disabled={isSendingEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
