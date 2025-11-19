import type { PayslipPDFData } from '../../../preload'

/**
 * PDF Service for renderer process
 * Communicates with main process via IPC for PDF generation
 */
class PDFService {
  /**
   * Check if PDF API is available
   */
  private checkApiAvailable(): void {
    if (!window.api?.pdf) {
      throw new Error(
        'PDF API is not available. Please restart the application to load the updated preload script.'
      )
    }
  }

  /**
   * Generate a single payslip PDF
   */
  async generatePayslipPDF(
    data: PayslipPDFData
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    this.checkApiAvailable()
    return await window.api.pdf.generatePayslip(data)
  }

  /**
   * Generate multiple payslip PDFs
   */
  async generateBulkPayslipPDFs(
    payslipsData: PayslipPDFData[]
  ): Promise<{ success: boolean; data?: Record<string, string>; error?: string }> {
    this.checkApiAvailable()
    return await window.api.pdf.generateBulkPayslips(payslipsData)
  }
}

// Export singleton instance
export const pdfService = new PDFService()
