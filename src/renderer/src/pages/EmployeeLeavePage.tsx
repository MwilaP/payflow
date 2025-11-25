import { useParams } from 'react-router-dom'
import EmployeeLeaveManagement from '@/components/employee-leave-management'
import { AppLayout } from '@/components/app-layout'

export default function EmployeeLeavePage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>Employee not found</div>
  }

  return (
    <AppLayout>
      <EmployeeLeaveManagement id={id} />
    </AppLayout>
  )
}
