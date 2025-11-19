"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus } from "lucide-react"
import { useDatabase } from "@/lib/db/db-context"

export function RecentEmployees() {
  const navigate = useNavigate()
  const { employeeService, isLoading } = useDatabase()
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    const loadEmployees = async () => {
      if (!employeeService) return

      try {
        const data = await employeeService.getAllEmployees()
        // Sort by hire date (newest first) and take the first 5
        const sorted = [...data]
          .sort((a, b) => {
            return new Date(b.hireDate || 0).getTime() - new Date(a.hireDate || 0).getTime()
          })
          .slice(0, 5)

        setEmployees(sorted)
      } catch (error) {
        console.error("Error loading recent employees:", error)
        setEmployees([])
      }
    }

    loadEmployees()
  }, [employeeService])

  const handleViewEmployee = (id: string) => {
    navigate(`/employees/${id}`)
  }

  const handleAddEmployee = () => {
    navigate("/employees/new")
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <UserPlus className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No employees yet</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4">Add your first employee to get started</p>
      <Button onClick={handleAddEmployee} size="sm">
        Add Employee
      </Button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Employees</CardTitle>
        <CardDescription>Recently added employees in your organization</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : employees.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee._id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${employee.firstName?.charAt(0) || "?"}`}
                    />
                    <AvatarFallback>
                      {employee.firstName?.charAt(0) || "?"}
                      {employee.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{`${employee.firstName || ""} ${employee.lastName || ""}`}</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{employee.department || "No Department"}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleViewEmployee(employee._id)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
