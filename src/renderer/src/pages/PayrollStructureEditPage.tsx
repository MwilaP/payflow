import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PayrollStructureForm } from '@/components/payroll-structure-form'

export default function PayrollStructureEditPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-8 p-6 md:p-10 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shadow-sm hover:shadow-md transition-shadow">
            <Link to="/payroll/structures">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Edit Payroll Structure
            </h1>
            <p className="text-muted-foreground mt-1">Update payroll structure details and components</p>
          </div>
        </div>
      </div>
      <PayrollStructureForm id={id} />
    </div>
  )
}
