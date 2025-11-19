"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import Papa from "papaparse"
import { fetchAllEmployees, savePayrollHistory } from "@/lib/db/services/service-factory"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileUp, Upload, Check, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Define the expected CSV structure
interface PayrollImportRow {
  'EMPLOYEE NAME'?: string
  'ACCOUNT NUMBER'?: string
  'NRC': string // Required for employee matching
  'TPIN'?: string
  'BASIC PAY': string | number
  'Housing Allow.'?: string | number
  'Transport Allow.'?: string | number
  'GROSS PAY'?: string | number
  'Napsa'?: string | number
  'Nhima'?: string | number
  'PAYE'?: string | number
  'Loan'?: string | number
  'Other Deductions'?: string | number
  'NET'?: string | number
  [key: string]: string | number | undefined // Allow for additional columns
}

// Employee match status
type MatchStatus = 'matched' | 'not_found' | 'multiple_matches'

// Processed row with employee match info
interface ProcessedRow extends PayrollImportRow {
  employeeId?: string
  matchStatus: MatchStatus
  matchedEmployee?: any
  errors?: string[]
}

export default function PayrollImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<ProcessedRow[]>([])
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importStats, setImportStats] = useState({
    total: 0,
    matched: 0,
    notFound: 0,
    multipleMatches: 0,
    errors: 0
  })
  const [activeTab, setActiveTab] = useState("upload")
  const [importProgress, setImportProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setImportErrors([])
    }
  }

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Process the uploaded CSV file
  const processFile = async () => {
    if (!file) {
      setImportErrors(['No file selected'])
      return
    }

    setIsProcessing(true)
    setImportProgress(10)
    
    try {
      // Parse CSV file
      const results = await new Promise<Papa.ParseResult<PayrollImportRow>>((resolve, reject) => {
        Papa.parse<PayrollImportRow>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (error) => reject(error)
        })
      })
      
      setImportProgress(30)
      
      // Validate required columns
      if (!results.meta.fields?.includes('NRC')) {
        setImportErrors(['CSV file must contain an NRC column for employee matching'])
        setIsProcessing(false)
        return
      }
      
      if (!results.meta.fields?.includes('BASIC PAY')) {
        setImportErrors(['CSV file must contain a BASIC PAY column'])
        setIsProcessing(false)
        return
      }
      
      // Fetch all employees for matching
      setImportProgress(50)
      const employees = await fetchAllEmployees()
      
      // Process each row and match with employees by NRC
      const processed: ProcessedRow[] = []
      let matched = 0
      let notFound = 0
      let multipleMatches = 0
      let errors = 0
      
      setImportProgress(70)
      
      for (const row of results.data) {
        const processedRow: ProcessedRow = {
          ...row,
          matchStatus: 'not_found',
          errors: []
        }
        
        // Skip rows without NRC
        if (!row.NRC) {
          processedRow.errors = ['Missing NRC']
          processedRow.matchStatus = 'not_found'
          errors++
          processed.push(processedRow)
          continue
        }
        
        // Find matching employees by NRC
        const matchingEmployees = employees.filter(
          (emp: any) => (emp.nationalId || emp.national_id || '').toLowerCase() === row.NRC.toLowerCase()
        )
        
        if (matchingEmployees.length === 1) {
          // Exact match found
          const employee = matchingEmployees[0]
          processedRow.employeeId = employee._id
          processedRow.matchStatus = 'matched'
          processedRow.matchedEmployee = employee
          matched++
        } else if (matchingEmployees.length > 1) {
          // Multiple matches found
          processedRow.matchStatus = 'multiple_matches'
          processedRow.errors = ['Multiple employees found with the same NRC']
          multipleMatches++
        } else {
          // No match found
          processedRow.matchStatus = 'not_found'
          processedRow.errors = ['No employee found with this NRC']
          notFound++
        }
        
        processed.push(processedRow)
      }
      
      setImportProgress(90)
      
      // Update state with processed data
      setProcessedData(processed)
      setImportStats({
        total: processed.length,
        matched,
        notFound,
        multipleMatches,
        errors
      })
      
      // Switch to review tab if there's data to review
      if (processed.length > 0) {
        setActiveTab("review")
      }
      
      setImportProgress(100)
    } catch (error) {
      console.error('Error processing CSV file:', error)
      setImportErrors([`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsProcessing(false)
    }
  }

  // Import the processed data
  const handleImport = async () => {
    try {
      setIsUploading(true)
      
      // Filter only matched employees
      const matchedRows = processedData.filter(row => row.matchStatus === 'matched')
      
      if (matchedRows.length === 0) {
        toast({
          title: "Import Failed",
          description: "No matched employees to import",
          variant: "destructive"
        })
        setIsUploading(false)
        return
      }
      
      // Create payroll items from matched rows
      const payrollItems = matchedRows.map(row => {
        const employee = row.matchedEmployee
        
        // Convert string values to numbers
        const basicSalary = typeof row['BASIC PAY'] === 'string' ? parseFloat(row['BASIC PAY']) : row['BASIC PAY'] || 0
        const housingAllowance = typeof row['Housing Allow.'] === 'string' ? parseFloat(row['Housing Allow.'] as string) : (row['Housing Allow.'] || 0)
        const transportAllowance = typeof row['Transport Allow.'] === 'string' ? parseFloat(row['Transport Allow.'] as string) : (row['Transport Allow.'] || 0)
        const grossPay = typeof row['GROSS PAY'] === 'string' ? parseFloat(row['GROSS PAY'] as string) : (row['GROSS PAY'] || 0)
        const napsa = typeof row['Napsa'] === 'string' ? parseFloat(row['Napsa'] as string) : (row['Napsa'] || 0)
        const nhima = typeof row['Nhima'] === 'string' ? parseFloat(row['Nhima'] as string) : (row['Nhima'] || 0)
        const paye = typeof row['PAYE'] === 'string' ? parseFloat(row['PAYE'] as string) : (row['PAYE'] || 0)
        const loan = typeof row['Loan'] === 'string' ? parseFloat(row['Loan'] as string) : (row['Loan'] || 0)
        const otherDeductions = typeof row['Other Deductions'] === 'string' ? parseFloat(row['Other Deductions'] as string) : (row['Other Deductions'] || 0)
        const netSalary = typeof row['NET'] === 'string' ? parseFloat(row['NET'] as string) : (row['NET'] || 0)
        
        // Calculate total deductions and allowances if not provided
        const totalDeductions = napsa + nhima + paye + loan + otherDeductions
        const totalAllowances = housingAllowance + transportAllowance
        
        return {
          employeeId: row.employeeId || employee._id,
          employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : row['EMPLOYEE NAME'] || '',
          accountNumber: employee?.accountNumber || employee?.account_number || row['ACCOUNT NUMBER'] || '',
          nrc: employee?.nationalId || employee?.national_id || row.NRC || '',
          tpin: employee?.taxNumber || employee?.tax_number || row['TPIN'] || '',
          department: employee?.department || 'General',
          basicSalary,
          housingAllowance,
          transportAllowance,
          grossPay: grossPay || (basicSalary + totalAllowances),
          napsa,
          nhima,
          paye,
          loan,
          otherDeductions,
          totalDeductions,
          netSalary,
          payrollStructureId: employee?.payrollStructureId || '',
          allowances: totalAllowances,
          deductions: totalDeductions,
          // Create basic deduction breakdown
          deductionBreakdown: [
            { name: 'NAPSA', value: napsa, type: 'fixed' },
            { name: 'NHIMA', value: nhima, type: 'fixed' },
            { name: 'PAYE', value: paye, type: 'fixed' },
            { name: 'Loan', value: loan, type: 'fixed' },
            { name: 'Other Deductions', value: otherDeductions, type: 'fixed' }
          ].filter(d => d.value > 0),
          // Create basic allowance breakdown
          allowanceBreakdown: [
            { name: 'Housing Allowance', value: housingAllowance, type: 'fixed' },
            { name: 'Transport Allowance', value: transportAllowance, type: 'fixed' }
          ].filter(a => a.value > 0)
        }
      })
      
      // Create a payroll record
      const currentDate = new Date()
      const payrollRecord = {
        _id: `payroll_${uuidv4()}`,
        status: 'draft' as const,
        date: format(currentDate, 'yyyy-MM-dd'),
        paymentDate: format(currentDate, 'yyyy-MM-dd'),
        period: format(currentDate, 'MMMM yyyy'),
        totalAmount: payrollItems.reduce((sum, item) => sum + item.netSalary, 0),
        employeeCount: payrollItems.length,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
        items: payrollItems,
        importedAt: currentDate.toISOString(),
        importSource: file?.name || 'CSV Import'
      }
      
      // Save to database
      await savePayrollHistory([payrollRecord])
      
      toast({
        title: "Import Successful",
        description: `Imported payroll data for ${payrollItems.length} employees.`,
      })
      
      // Navigate to payroll page
      navigate("/payroll")
    } catch (error) {
      console.error('Error importing payroll data:', error)
      toast({
        title: "Import Failed",
        description: `Error importing payroll data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="review" disabled={processedData.length === 0}>Review Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Payroll Data</CardTitle>
              <CardDescription>
                Upload a CSV file with payroll data. The file must contain an NRC column to match employees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileUp className="h-10 w-10 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Upload Payroll CSV</h3>
                  <p className="text-sm text-gray-500">
                    Click to browse or drag and drop your CSV file
                  </p>
                  <p className="text-xs text-gray-400">
                    File must include NRC column for employee matching
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleUploadClick} 
                  className="mt-4"
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
              </div>
              
              {file && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center">
                    <FileUp className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {importErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Error</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 mt-2">
                      {importErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {isProcessing && (
                <div className="space-y-2">
                  <Label>Processing file...</Label>
                  <Progress value={importProgress} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/payroll")}>
                Cancel
              </Button>
              <Button 
                onClick={processFile} 
                disabled={!file || isProcessing}
              >
                {isProcessing ? "Processing..." : "Process File"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review Import Data</CardTitle>
              <CardDescription>
                Review the data before importing. Only matched employees will be imported.
              </CardDescription>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-muted">
                  Total: {importStats.total}
                </Badge>
                <Badge variant="default" className="bg-green-600">
                  Matched: {importStats.matched}
                </Badge>
                <Badge variant="destructive">
                  Not Found: {importStats.notFound}
                </Badge>
                <Badge variant="secondary">
                  Multiple Matches: {importStats.multipleMatches}
                </Badge>
                <Badge variant="outline" className="border-red-300 text-red-600">
                  Errors: {importStats.errors}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>NRC</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Basic Pay</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.map((row, index) => (
                      <TableRow key={index} className={
                        row.matchStatus === 'matched' ? 'bg-green-50' :
                        row.matchStatus === 'not_found' ? 'bg-red-50' : 'bg-yellow-50'
                      }>
                        <TableCell>
                          {row.matchStatus === 'matched' ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : row.matchStatus === 'not_found' ? (
                            <X className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </TableCell>
                        <TableCell>{row.NRC}</TableCell>
                        <TableCell>
                          {row.matchStatus === 'matched' && row.matchedEmployee ? 
                            `${row.matchedEmployee.firstName || ''} ${row.matchedEmployee.lastName || ''}`.trim() : 
                            row['EMPLOYEE NAME'] || 'Unknown'
                          }
                        </TableCell>
                        <TableCell>{row['BASIC PAY']}</TableCell>
                        <TableCell>{row['NET']}</TableCell>
                        <TableCell>
                          {row.errors && row.errors.length > 0 ? (
                            <span className="text-red-600 text-sm">
                              {row.errors.join(', ')}
                            </span>
                          ) : row.matchStatus === 'matched' ? (
                            <span className="text-green-600 text-sm">None</span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importStats.matched === 0 || isUploading}
              >
                {isUploading ? "Importing..." : `Import ${importStats.matched} Records`}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
