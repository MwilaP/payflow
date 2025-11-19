import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

export interface PayslipPDFData {
  // Company Information
  companyName: string
  companyAddress?: string

  // Employee Information
  employeeName: string
  employeeNumber: string
  department: string
  designation: string
  nrc: string
  tpin: string
  accountNumber: string
  bankName: string

  // Pay Period
  period: string
  paymentDate: string

  // Salary Components
  basicSalary: number
  allowances: Array<{ name: string; amount: number }>
  totalAllowances: number
  grossPay: number

  // Deductions
  deductions: Array<{ name: string; amount: number }>
  totalDeductions: number

  // Net Pay
  netPay: number
}

/**
 * PDF Generator Service for creating payslip PDFs
 */
class PDFGeneratorService {
  /**
   * Generate a payslip PDF and return as base64 string
   */
  async generatePayslipPDF(data: PayslipPDFData): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        })

        const chunks: Buffer[] = []

        // Collect PDF data
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks)
          const base64 = pdfBuffer.toString('base64')
          resolve(base64)
        })
        doc.on('error', reject)

        // Generate PDF content
        this.generatePayslipContent(doc, data)

        // Finalize PDF
        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate the actual payslip content
   */
  private generatePayslipContent(doc: PDFKit.PDFDocument, data: PayslipPDFData): void {
    const pageWidth = doc.page.width
    const leftMargin = 50
    const rightMargin = pageWidth - 50
    const contentWidth = rightMargin - leftMargin

    // Header - Company Name
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(data.companyName || 'Company Name', leftMargin, 50, {
        align: 'center',
        width: contentWidth
      })

    if (data.companyAddress) {
      doc.fontSize(10).font('Helvetica').text(data.companyAddress, leftMargin, 75, {
        align: 'center',
        width: contentWidth
      })
    }

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('PAYSLIP', leftMargin, 100, {
      align: 'center',
      width: contentWidth
    })

    let yPosition = 130

    // Period and Payment Date
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Period: ${data.period}`, leftMargin, yPosition)
      .text(`Payment Date: ${data.paymentDate}`, rightMargin - 150, yPosition, {
        width: 150,
        align: 'right'
      })

    yPosition += 30

    // Employee Information Section
    doc.fontSize(12).font('Helvetica-Bold').text('EMPLOYEE INFORMATION', leftMargin, yPosition)

    yPosition += 20

    // Employee details in two columns
    const col1X = leftMargin
    const col2X = leftMargin + contentWidth / 2

    doc.fontSize(10).font('Helvetica')

    // Column 1
    doc
      .font('Helvetica-Bold')
      .text('Name:', col1X, yPosition)
      .font('Helvetica')
      .text(data.employeeName, col1X + 80, yPosition)

    doc
      .font('Helvetica-Bold')
      .text('Employee No:', col1X, yPosition + 15)
      .font('Helvetica')
      .text(data.employeeNumber, col1X + 80, yPosition + 15)

    doc
      .font('Helvetica-Bold')
      .text('Department:', col1X, yPosition + 30)
      .font('Helvetica')
      .text(data.department, col1X + 80, yPosition + 30)

    doc
      .font('Helvetica-Bold')
      .text('Designation:', col1X, yPosition + 45)
      .font('Helvetica')
      .text(data.designation, col1X + 80, yPosition + 45)

    // Column 2
    doc
      .font('Helvetica-Bold')
      .text('NRC:', col2X, yPosition)
      .font('Helvetica')
      .text(data.nrc, col2X + 80, yPosition)

    doc
      .font('Helvetica-Bold')
      .text('TPIN:', col2X, yPosition + 15)
      .font('Helvetica')
      .text(data.tpin, col2X + 80, yPosition + 15)

    doc
      .font('Helvetica-Bold')
      .text('Account No:', col2X, yPosition + 30)
      .font('Helvetica')
      .text(data.accountNumber, col2X + 80, yPosition + 30)

    doc
      .font('Helvetica-Bold')
      .text('Bank:', col2X, yPosition + 45)
      .font('Helvetica')
      .text(data.bankName, col2X + 80, yPosition + 45)

    yPosition += 80

    // Divider line
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(leftMargin, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke()

    yPosition += 20

    // Side-by-side table: Earnings on left, Deductions on right
    const tableStartY = yPosition
    const middleX = leftMargin + contentWidth / 2
    const columnWidth = contentWidth / 2 - 10

    // Table Headers
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('EARNINGS', leftMargin, yPosition)
      .text('AMOUNT (K)', leftMargin + columnWidth - 80, yPosition, { width: 80, align: 'right' })
      .text('DEDUCTIONS', middleX + 10, yPosition)
      .text('AMOUNT (K)', middleX + 10 + columnWidth - 80, yPosition, {
        width: 80,
        align: 'right'
      })

    yPosition += 20

    // Draw vertical line between columns
    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(middleX, tableStartY)
      .lineTo(middleX, yPosition + Math.max(data.allowances.length + 2, data.deductions.length + 1) * 15 + 40)
      .stroke()

    // Prepare earnings list (Basic Salary + Allowances)
    const earnings: Array<{ name: string; amount: number }> = [
      { name: 'Basic Salary', amount: data.basicSalary },
      ...data.allowances
    ]

    // Draw earnings and deductions side by side
    const maxRows = Math.max(earnings.length, data.deductions.length)
    doc.fontSize(10).font('Helvetica')

    for (let i = 0; i < maxRows; i++) {
      // Earnings column
      if (i < earnings.length) {
        doc
          .text(earnings[i].name, leftMargin, yPosition)
          .text(this.formatCurrency(earnings[i].amount), leftMargin + columnWidth - 80, yPosition, {
            width: 80,
            align: 'right'
          })
      }

      // Deductions column
      if (i < data.deductions.length) {
        doc
          .text(data.deductions[i].name, middleX + 10, yPosition)
          .text(
            this.formatCurrency(data.deductions[i].amount),
            middleX + 10 + columnWidth - 80,
            yPosition,
            {
              width: 80,
              align: 'right'
            }
          )
      }

      yPosition += 15
    }

    // Totals row
    yPosition += 5
    doc
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(leftMargin, yPosition)
      .lineTo(leftMargin + columnWidth, yPosition)
      .stroke()
      .moveTo(middleX + 10, yPosition)
      .lineTo(rightMargin, yPosition)
      .stroke()

    yPosition += 10

    // Gross Pay and Total Deductions
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('GROSS PAY', leftMargin, yPosition)
      .text(this.formatCurrency(data.grossPay), leftMargin + columnWidth - 80, yPosition, {
        width: 80,
        align: 'right'
      })
      .text('TOTAL DEDUCTIONS', middleX + 10, yPosition)
      .text(
        this.formatCurrency(data.totalDeductions),
        middleX + 10 + columnWidth - 80,
        yPosition,
        {
          width: 80,
          align: 'right'
        }
      )

    yPosition += 30

    // Net Pay - Highlighted
    doc.rect(leftMargin, yPosition - 5, contentWidth, 30).fillAndStroke('#f0f0f0', '#cccccc')

    doc
      .fillColor('#000000')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('NET PAY', leftMargin + 10, yPosition + 5)
      .text(this.formatCurrency(data.netPay), rightMargin - 110, yPosition + 5, {
        width: 100,
        align: 'right'
      })

    // Footer
    yPosition += 60
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'This is a computer-generated payslip and does not require a signature.',
        leftMargin,
        yPosition,
        {
          align: 'center',
          width: contentWidth
        }
      )
  }

  /**
   * Format currency with proper decimal places
   */
  private formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  /**
   * Generate multiple payslip PDFs
   */
  async generateBulkPayslipPDFs(payslipsData: PayslipPDFData[]): Promise<Map<string, string>> {
    const pdfMap = new Map<string, string>()

    for (let i = 0; i < payslipsData.length; i++) {
      const data = payslipsData[i]
      try {
        const pdfBase64 = await this.generatePayslipPDF(data)
        // Use employee number or index as key
        pdfMap.set(data.employeeNumber || `employee_${i}`, pdfBase64)
      } catch (error) {
        console.error(`Failed to generate PDF for ${data.employeeName}:`, error)
      }
    }

    return pdfMap
  }
}

// Export singleton instance
export const pdfGeneratorService = new PDFGeneratorService()
