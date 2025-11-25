import { EmployeeForm } from '@/components/employee-form'
import { AppLayout } from '@/components/app-layout'

export default function EmployeeNewPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <EmployeeForm />
      </div>
    </AppLayout>
  )
}
