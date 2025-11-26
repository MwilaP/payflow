'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus } from 'lucide-react'
import { useDatabase } from '@/lib/db/db-context'

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
        console.error('Error loading recent employees:', error)
        setEmployees([])
      }
    }

    loadEmployees()
  }, [employeeService])

  const handleViewEmployee = (id: string) => {
    navigate(`/employees/${id}`)
  }

  const handleAddEmployee = () => {
    navigate('/employees/new')
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <UserPlus className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">No employees yet</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-xs">
        Add your first employee to get started with payroll management
      </p>
      <Button onClick={handleAddEmployee} size="lg" className="shadow-md">
        <UserPlus className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
    </div>
  )

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center py-8">
      <div className="animate-pulse space-y-3 w-full">
        <div className="h-16 bg-muted rounded-lg"></div>
        <div className="h-16 bg-muted rounded-lg"></div>
        <div className="h-16 bg-muted rounded-lg"></div>
      </div>
    </div>
  )

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Recent Employees</CardTitle>
        <CardDescription className="text-base mt-1">
          Recently added employees in your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : employees.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between space-x-4 rounded-xl border p-4 hover:bg-muted/30 transition-colors cursor-pointer shadow-sm"
                onClick={() => handleViewEmployee(employee._id)}
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage
                      src={`/placeholder.svg?height=48&width=48&text=${employee.firstName?.charAt(0) || '?'}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {employee.firstName?.charAt(0) || '?'}
                      {employee.lastName?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{`${employee.firstName || ''} ${employee.lastName || ''}`}</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="shadow-sm">
                    {employee.department || 'No Department'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
