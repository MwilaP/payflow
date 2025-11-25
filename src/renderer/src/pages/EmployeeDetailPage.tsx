import { useParams } from 'react-router-dom'
import { EmployeeDetail } from '@/components/employee-detail'
import { AppLayout } from '@/components/app-layout'

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>Employee not found</div>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <EmployeeDetail employeeId={id} />
      </div>
    </AppLayout>
  )
}
