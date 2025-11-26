import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PayrollGenerator } from './payroll-generator'
import { AppLayout } from './app-layout'
import { Button } from './ui/button'

export function PayrollGenerate() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/payroll')} className="w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generate Payroll</h1>
            <p className="text-muted-foreground mt-1">Create a new payroll for your employees</p>
          </div>
        </div>
        <PayrollGenerator />
      </div>
    </AppLayout>
  )
}
