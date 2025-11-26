import { EmployeeForm } from '@/components/employee-form'
import { AppLayout } from '@/components/app-layout'

export default function EmployeeNewPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6 md:p-8">
        <EmployeeForm />
      </div>
    </AppLayout>
  )
}
