import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PayrollStructuresList } from './payroll-structures-list'
import { AppLayout } from './app-layout'

export function PayrollStructures() {
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
            <h1 className="text-3xl font-bold tracking-tight">Payroll Structures</h1>
            <p className="text-muted-foreground mt-1">
              Manage salary structures and compensation packages
            </p>
          </div>
        </div>
        <PayrollStructuresList />
      </div>
    </AppLayout>
  )
}
