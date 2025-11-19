"use client"

import { v4 as uuidv4 } from "uuid"
import { dbOperations } from "../db-service"

// Employee service factory
export const employeeService = (db: any) => ({
  // Create a new employee
  async createEmployee(employeeData: any) {
    if (!db) return null

    try {
      const id = employeeData._id || `employee_${uuidv4()}`
      const employee = {
        _id: id,
        ...employeeData,
      }

      return await dbOperations.create(db, employee)
    } catch (error) {
      console.error("Error creating employee:", error)
      return null
    }
  },

  // Get an employee by ID
  async getEmployeeById(id: string) {
    if (!db) return null

    try {
      return await dbOperations.getById(db, id)
    } catch (error) {
      console.error(`Error getting employee with ID ${id}:`, error)
      return null
    }
  },

  // Update an employee
  async updateEmployee(id: string, updates: any) {
    if (!db) return null

    try {
      return await dbOperations.update(db, id, updates)
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error)
      return null
    }
  },

  // Delete an employee
  async deleteEmployee(id: string) {
    if (!db) return null

    try {
      return await dbOperations.delete(db, id)
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error)
      return null
    }
  },

  // Get all employees
  async getAllEmployees() {
    if (!db) return []

    try {
      return await dbOperations.getAll(db)
    } catch (error) {
      console.error("Error getting all employees:", error)
      return []
    }
  },

  // Search employees
  async searchEmployees(query: string) {
    if (!db) return []

    try {
      const allEmployees = await this.getAllEmployees()
      const lowerQuery = query.toLowerCase()

      return allEmployees.filter((employee: any) => {
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
        return (
          fullName.includes(lowerQuery) ||
          (employee.email && employee.email.toLowerCase().includes(lowerQuery)) ||
          (employee.department && employee.department.toLowerCase().includes(lowerQuery))
        )
      })
    } catch (error) {
      console.error("Error searching employees:", error)
      return []
    }
  },

  // Filter employees by department
  async filterEmployeesByDepartment(department: string) {
    if (!db) return []

    try {
      const result = await dbOperations.find(db, {
        selector: {
          department: department,
        },
      })

      return result.docs
    } catch (error) {
      console.error(`Error filtering employees by department ${department}:`, error)
      return []
    }
  },

  // Filter employees by status
  async filterEmployeesByStatus(status: string) {
    if (!db) return []

    try {
      const result = await dbOperations.find(db, {
        selector: {
          status: status,
        },
      })

      return result.docs
    } catch (error) {
      console.error(`Error filtering employees by status ${status}:`, error)
      return []
    }
  },

  // Get employees by payroll structure
  async getEmployeesByPayrollStructure(structureId: string) {
    if (!db) return []

    try {
      const result = await dbOperations.find(db, {
        selector: {
          payrollStructureId: structureId,
        },
      })

      return result.docs
    } catch (error) {
      console.error(`Error getting employees by payroll structure ${structureId}:`, error)
      return []
    }
  },

  // Assign payroll structure to employee
  async assignPayrollStructure(employeeId: string, structureId: string) {
    if (!db) return null

    try {
      return await this.updateEmployee(employeeId, {
        payrollStructureId: structureId,
      })
    } catch (error) {
      console.error(`Error assigning payroll structure ${structureId} to employee ${employeeId}:`, error)
      return null
    }
  },

  // Bulk assign payroll structure to employees
  async bulkAssignPayrollStructure(employeeIds: string[], structureId: string) {
    if (!db) return []

    try {
      const employees = await Promise.all(employeeIds.map((id) => this.getEmployeeById(id)))

      const updatedEmployees = employees
        .filter((employee) => employee !== null)
        .map((employee) => ({
          ...employee,
          payrollStructureId: structureId,
          updatedAt: new Date().toISOString(),
        }))

      return await dbOperations.bulkDocs(db, updatedEmployees)
    } catch (error) {
      console.error(`Error bulk assigning payroll structure ${structureId}:`, error)
      return []
    }
  },
})
