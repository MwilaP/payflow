import { Link } from "react-router-dom"
import { ChevronLeft, FileEdit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmployeeProfile } from "@/components/employee-profile"

interface EmployeeDetailProps {
  employeeId: string
}

export function EmployeeDetail({ employeeId }: EmployeeDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/employees">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Employee Profile</h1>
        </div>
        <Button asChild>
          <Link to={`/employees/${employeeId}/edit`}>
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Employee
          </Link>
        </Button>
      </div>
      <EmployeeProfile id={employeeId} />
    </div>
  )
}
