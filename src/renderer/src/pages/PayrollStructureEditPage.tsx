import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PayrollStructureForm } from '@/components/payroll-structure-form'

export default function PayrollStructureEditPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/payroll/structures">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Payroll Structure</h1>
        </div>
      </div>
      <PayrollStructureForm id={id} />
    </div>
  )
}
