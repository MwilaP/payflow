import { useParams } from "react-router-dom"
import EmployeeLeaveManagement from "@/components/employee-leave-management"

export default function EmployeeLeavePage() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>Employee not found</div>
  }

  return <EmployeeLeaveManagement id={id} />
}
