import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PayrollStructureForm } from '@/components/payroll-structure-form'
import { AppLayout } from '@/components/app-layout'

export default function PayrollStructureEditPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <AppLayout>
      <div className="space-y-6 p-6 md:p-10">
        <Button variant="outline" size="icon" asChild>
          <Link to="/payroll/structures">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <PayrollStructureForm id={id} />
      </div>
    </AppLayout>
  )
}
