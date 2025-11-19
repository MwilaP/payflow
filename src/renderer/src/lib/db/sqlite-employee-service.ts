import { sqliteOperations, getDatabase } from './indexeddb-sqlite-service'
import { 
  SQLiteEmployee, 
  sqliteEmployeeSchema, 
  convertSQLiteToPouchDB 
} from './sqlite-models'
import { v4 as uuidv4 } from 'uuid'

export interface SQLiteEmployeeService {
  // CRUD operations
  create(employee: Omit<SQLiteEmployee, 'id' | 'created_at' | 'updated_at'>): Promise<SQLiteEmployee>
  getById(id: string): Promise<SQLiteEmployee | null>
  update(id: string, updates: Partial<SQLiteEmployee>): Promise<SQLiteEmployee | null>
  delete(id: string): Promise<boolean>
  getAll(): Promise<SQLiteEmployee[]>
  
  // Search and filter operations
  findByDepartment(department: string): Promise<SQLiteEmployee[]>
  findByStatus(status: string): Promise<SQLiteEmployee[]>
  findByPayrollStructure(payrollStructureId: string): Promise<SQLiteEmployee[]>
  search(query: string): Promise<SQLiteEmployee[]>
  
  // Bulk operations
  bulkCreate(employees: Omit<SQLiteEmployee, 'id' | 'created_at' | 'updated_at'>[]): Promise<SQLiteEmployee[]>
  bulkUpdate(updates: { id: string; data: Partial<SQLiteEmployee> }[]): Promise<SQLiteEmployee[]>
  
  // Statistics
  getEmployeeCount(): Promise<number>
  getEmployeesByDepartment(): Promise<Record<string, number>>
  getEmployeesByStatus(): Promise<Record<string, number>>
}

export const createSQLiteEmployeeService = (): SQLiteEmployeeService => {
  return {
    async create(employeeData) {
      const employee: SQLiteEmployee = {
        ...employeeData,
        id: `employee_${uuidv4()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Validate the employee data
      const validated = sqliteEmployeeSchema.parse(employee)
      
      return sqliteOperations.create('employees', validated)
    },

    async getById(id: string) {
      return sqliteOperations.getById<SQLiteEmployee>('employees', id)
    },

    async update(id: string, updates) {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }
      
      return sqliteOperations.update<SQLiteEmployee>('employees', id, updateData)
    },

    async delete(id: string) {
      return sqliteOperations.delete('employees', id)
    },

    async getAll() {
      return sqliteOperations.getAll<SQLiteEmployee>('employees')
    },

    async findByDepartment(department: string) {
      return sqliteOperations.find<SQLiteEmployee>('employees', { department })
    },

    async findByStatus(status: string) {
      return sqliteOperations.find<SQLiteEmployee>('employees', { status })
    },

    async findByPayrollStructure(payrollStructureId: string) {
      return sqliteOperations.find<SQLiteEmployee>('employees', { 
        payroll_structure_id: payrollStructureId 
      })
    },

    async search(query: string) {
      // For IndexedDB, we'll get all employees and filter in memory
      const allEmployees = await this.getAll()
      const searchTerm = query.toLowerCase()
      
      return allEmployees.filter(employee => 
        employee.first_name.toLowerCase().includes(searchTerm) ||
        employee.last_name.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.department.toLowerCase().includes(searchTerm) ||
        employee.designation.toLowerCase().includes(searchTerm)
      )
    },

    async bulkCreate(employeesData) {
      return sqliteOperations.transaction(async (ops) => {
        const results: SQLiteEmployee[] = []
        
        for (const employeeData of employeesData) {
          const employee: SQLiteEmployee = {
            ...employeeData,
            id: `employee_${uuidv4()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          const validated = sqliteEmployeeSchema.parse(employee)
          const created = await ops.create('employees', validated)
          results.push(created)
        }
        
        return results
      })
    },

    async bulkUpdate(updates) {
      return sqliteOperations.transaction(async (ops) => {
        const results: SQLiteEmployee[] = []
        
        for (const { id, data } of updates) {
          const updateData = {
            ...data,
            updated_at: new Date().toISOString(),
          }
          
          const updated = await ops.update<SQLiteEmployee>('employees', id, updateData)
          if (updated) {
            results.push(updated)
          }
        }
        
        return results
      })
    },

    async getEmployeeCount() {
      const employees = await this.getAll()
      return employees.length
    },

    async getEmployeesByDepartment() {
      const employees = await this.getAll()
      const departmentCounts: Record<string, number> = {}
      
      for (const employee of employees) {
        departmentCounts[employee.department] = (departmentCounts[employee.department] || 0) + 1
      }
      
      return departmentCounts
    },

    async getEmployeesByStatus() {
      const employees = await this.getAll()
      const statusCounts: Record<string, number> = {}
      
      for (const employee of employees) {
        statusCounts[employee.status] = (statusCounts[employee.status] || 0) + 1
      }
      
      return statusCounts
    }
  }
}

// Compatibility wrapper to maintain the same interface as PouchDB service
export const createEmployeeServiceCompat = () => {
  const sqliteService = createSQLiteEmployeeService()
  
  return {
    // Convert SQLite service methods to match PouchDB interface
    async create(employeeData: any) {
      // Convert PouchDB format to SQLite format
      const sqliteData = {
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone,
        dob: employeeData.dob,
        gender: employeeData.gender,
        address: employeeData.address,
        department: employeeData.department,
        designation: employeeData.designation,
        employment_type: employeeData.employmentType,
        hire_date: employeeData.hireDate,
        reporting_to: employeeData.reportingTo,
        work_location: employeeData.workLocation,
        status: employeeData.status,
        account_number: employeeData.accountNumber,
        bank_name: employeeData.bankName,
        branch_name: employeeData.branchName,
        ifsc_code: employeeData.ifscCode,
        national_id: employeeData.nationalId,
        tax_number: employeeData.taxNumber,
        pension_number: employeeData.pensionNumber,
        tax_status: employeeData.taxStatus,
        payroll_structure_id: employeeData.payrollStructureId,
      }
      
      const result = await sqliteService.create(sqliteData)
      return convertSQLiteToPouchDB.employee(result)
    },

    async getById(id: string) {
      console.log(`SQLite Employee Service: Looking for employee with ID: ${id}`)
      const result = await sqliteService.getById(id)
      console.log(`SQLite Employee Service: Found employee:`, result)
      return result ? convertSQLiteToPouchDB.employee(result) : null
    },

    async update(id: string, updates: any) {
      // Convert PouchDB format updates to SQLite format
      const sqliteUpdates: Partial<SQLiteEmployee> = {}
      
      if (updates.firstName) sqliteUpdates.first_name = updates.firstName
      if (updates.lastName) sqliteUpdates.last_name = updates.lastName
      if (updates.email) sqliteUpdates.email = updates.email
      if (updates.phone) sqliteUpdates.phone = updates.phone
      if (updates.department) sqliteUpdates.department = updates.department
      if (updates.designation) sqliteUpdates.designation = updates.designation
      if (updates.employmentType) sqliteUpdates.employment_type = updates.employmentType
      if (updates.status) sqliteUpdates.status = updates.status
      if (updates.payrollStructureId) sqliteUpdates.payroll_structure_id = updates.payrollStructureId
      
      const result = await sqliteService.update(id, sqliteUpdates)
      return result ? convertSQLiteToPouchDB.employee(result) : null
    },

    async delete(id: string) {
      return await sqliteService.delete(id)
    },

    async getAll() {
      const results = await sqliteService.getAll()
      console.log(`SQLite Employee Service: Found ${results.length} employees:`, results.map(r => ({ id: r.id, name: `${r.first_name} ${r.last_name}` })))
      return results.map(convertSQLiteToPouchDB.employee)
    },

    async findByDepartment(department: string) {
      const results = await sqliteService.findByDepartment(department)
      return results.map(convertSQLiteToPouchDB.employee)
    },

    async search(query: string) {
      const results = await sqliteService.search(query)
      return results.map(convertSQLiteToPouchDB.employee)
    },

    // Additional methods to match PouchDB service interface
    async findByStatus(status: string) {
      const results = await sqliteService.findByStatus(status)
      return results.map(convertSQLiteToPouchDB.employee)
    },

    async getEmployeeCount() {
      return await sqliteService.getEmployeeCount()
    },

    // Add missing methods for compatibility
    async getAllEmployees() {
      return await this.getAll()
    },

    async getEmployeeById(id: string) {
      return await this.getById(id)
    },

    async createEmployee(employeeData: any) {
      return await this.create(employeeData)
    },

    async updateEmployee(id: string, updates: any) {
      return await this.update(id, updates)
    },

    async deleteEmployee(id: string) {
      return await this.delete(id)
    },

    async searchEmployees(query: string) {
      return await this.search(query)
    },

    async filterEmployeesByDepartment(department: string) {
      return await this.findByDepartment(department)
    },

    async filterEmployeesByStatus(status: string) {
      return await this.findByStatus(status)
    },

    async getEmployeesByPayrollStructure(payrollStructureId: string) {
      const results = await sqliteService.findByPayrollStructure(payrollStructureId)
      return results.map(convertSQLiteToPouchDB.employee)
    },

    async assignPayrollStructure(employeeId: string, payrollStructureId: string) {
      return await this.update(employeeId, { payrollStructureId })
    },

    async bulkAssignPayrollStructure(employeeIds: string[], payrollStructureId: string) {
      const results = []
      for (const employeeId of employeeIds) {
        const result = await this.update(employeeId, { payrollStructureId })
        if (result) results.push(result)
      }
      return results
    }
  }
}
