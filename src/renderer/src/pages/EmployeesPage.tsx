import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmployeesList } from '@/components/employees-list'
import { AppLayout } from '@/components/app-layout'
import { EmployeeFilters } from '@/components/employee-filters'

export default function EmployeesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <EmployeesList />
      </div>
    </AppLayout>
  )
}
