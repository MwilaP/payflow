'use client'

import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/app-layout'
import PayrollImporter from '@/components/payroll-importer'

export default function PayrollImportPage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/payroll')}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Payroll</h1>
            <p className="text-muted-foreground mt-1">
              Import payroll data from CSV files and match employees by NRC
            </p>
          </div>
        </div>
        <PayrollImporter />
      </div>
    </AppLayout>
  )
}
