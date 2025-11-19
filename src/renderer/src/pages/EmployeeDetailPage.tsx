import { useParams } from "react-router-dom"
import { EmployeeDetail } from "@/components/employee-detail"

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>Employee not found</div>
  }

  return (
    <div className="space-y-6">
      <EmployeeDetail employeeId={id} />
    </div>
  )
}
