import { Link, useParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeForm } from "@/components/employee-form"

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>Employee not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/employees/${id}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>Update the details of the employee. All fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm employeeId={id} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}
