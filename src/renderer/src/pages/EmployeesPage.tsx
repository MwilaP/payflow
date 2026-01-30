import { EmployeesList } from '@/components/employees-list'
import { AppLayout } from '@/components/app-layout'

export default function EmployeesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <EmployeesList />
      </div>
    </AppLayout>
  )
}
