"use client"

import { PageHeader } from "@/components/page-header"
import PayrollImporter from "@/components/payroll-importer"

export default function PayrollImportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Import Payroll"
        subheading="Import payroll data from CSV files and match employees by NRC"
      />
      
      <PayrollImporter />
    </div>
  )
}
