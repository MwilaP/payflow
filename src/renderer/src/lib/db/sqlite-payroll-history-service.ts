import { sqliteOperations } from './indexeddb-sqlite-service'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// SQLite Payroll History Schema
export const sqlitePayrollHistorySchema = z.object({
  id: z.string().default(() => `payroll_${uuidv4()}`),
  status: z.enum(["draft", "pending", "processing", "completed", "cancelled"]).default("draft"),
  date: z.string(),
  period: z.string().optional(),
  totalAmount: z.number().optional(),
  employeeCount: z.number().optional(),
  processedAt: z.string().optional(),
  completedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  notes: z.string().optional(),
  processedBy: z.string().optional(),
  items: z.array(z.object({
    employeeId: z.string(),
    employeeName: z.string(),
    // Employee details
    accountNumber: z.string().optional(),
    nrc: z.string().optional(),
    tpin: z.string().optional(),
    department: z.string().optional(),
    // Salary components
    basicSalary: z.number(),
    housingAllowance: z.number().optional(),
    transportAllowance: z.number().optional(),
    grossPay: z.number().optional(),
    // Deduction components
    napsa: z.number().optional(),
    nhima: z.number().optional(),
    paye: z.number().optional(),
    // Totals
    allowances: z.number(),
    deductions: z.number(),
    totalDeductions: z.number().optional(),
    netSalary: z.number(),
    // Structure reference
    payrollStructureId: z.string().optional(),
    // Detailed breakdowns
    allowanceBreakdown: z.array(z.any()).optional(),
    deductionBreakdown: z.array(z.any()).optional(),
  })).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type SQLitePayrollHistory = z.infer<typeof sqlitePayrollHistorySchema>

export interface SQLitePayrollHistoryService {
  create(payrollData: Omit<SQLitePayrollHistory, 'id' | 'created_at' | 'updated_at'>): Promise<SQLitePayrollHistory>
  getById(id: string): Promise<SQLitePayrollHistory | null>
  update(id: string, updates: Partial<SQLitePayrollHistory>): Promise<SQLitePayrollHistory | null>
  delete(id: string): Promise<boolean>
  getAll(): Promise<SQLitePayrollHistory[]>
  getByStatus(status: string): Promise<SQLitePayrollHistory[]>
  getByDateRange(startDate: string, endDate: string): Promise<SQLitePayrollHistory[]>
  getByEmployeeId(employeeId: string): Promise<SQLitePayrollHistory[]>
}

export const createSQLitePayrollHistoryService = (): SQLitePayrollHistoryService => {
  return {
    async create(payrollData) {
      const payroll: SQLitePayrollHistory = {
        ...payrollData,
        id: `payroll_${uuidv4()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const validated = sqlitePayrollHistorySchema.parse(payroll)
      return sqliteOperations.create('payroll_history', validated)
    },

    async getById(id: string) {
      return sqliteOperations.getById<SQLitePayrollHistory>('payroll_history', id)
    },

    async update(id: string, updates) {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }
      
      return sqliteOperations.update<SQLitePayrollHistory>('payroll_history', id, updateData)
    },

    async delete(id: string) {
      return sqliteOperations.delete('payroll_history', id)
    },

    async getAll() {
      return sqliteOperations.getAll<SQLitePayrollHistory>('payroll_history')
    },

    async getByStatus(status: string) {
      return sqliteOperations.find<SQLitePayrollHistory>('payroll_history', { status })
    },

    async getByDateRange(startDate: string, endDate: string) {
      const records = await sqliteOperations.getAll<SQLitePayrollHistory>('payroll_history')
      return records.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
      })
    },

    async getByEmployeeId(employeeId: string) {
      const records = await sqliteOperations.getAll<SQLitePayrollHistory>('payroll_history')
      return records.filter(record => 
        record.items?.some(item => item.employeeId === employeeId)
      )
    }
  }
}

// Compatibility wrapper to maintain the same interface as PouchDB service
export const createPayrollHistoryServiceCompat = () => {
  const sqliteService = createSQLitePayrollHistoryService()
  
  return {
    async createPayrollRecord(payrollData: any) {
      // Convert PouchDB format to SQLite format
      const sqlitePayrollData = {
        status: payrollData.status || "draft",
        date: payrollData.date || new Date().toISOString(),
        period: payrollData.period,
        totalAmount: payrollData.totalAmount,
        employeeCount: payrollData.employeeCount,
        processedAt: payrollData.processedAt,
        completedAt: payrollData.completedAt,
        cancelledAt: payrollData.cancelledAt,
        notes: payrollData.notes,
        processedBy: payrollData.processedBy,
        items: payrollData.items || [],
      }
      
      const result = await sqliteService.create(sqlitePayrollData)
      
      // Convert back to PouchDB format
      return {
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }
    },

    async getPayrollRecordById(id: string) {
      const result = await sqliteService.getById(id)
      if (!result) return null
      
      return {
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }
    },

    async updatePayrollRecord(id: string, updates: any) {
      const sqliteUpdates: Partial<SQLitePayrollHistory> = {}
      
      if (updates.status) sqliteUpdates.status = updates.status
      if (updates.date) sqliteUpdates.date = updates.date
      if (updates.period) sqliteUpdates.period = updates.period
      if (updates.totalAmount !== undefined) sqliteUpdates.totalAmount = updates.totalAmount
      if (updates.employeeCount !== undefined) sqliteUpdates.employeeCount = updates.employeeCount
      if (updates.processedAt) sqliteUpdates.processedAt = updates.processedAt
      if (updates.completedAt) sqliteUpdates.completedAt = updates.completedAt
      if (updates.cancelledAt) sqliteUpdates.cancelledAt = updates.cancelledAt
      if (updates.notes) sqliteUpdates.notes = updates.notes
      if (updates.processedBy) sqliteUpdates.processedBy = updates.processedBy
      if (updates.items) sqliteUpdates.items = updates.items
      
      const result = await sqliteService.update(id, sqliteUpdates)
      if (!result) return null

      return {
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }
    },

    async deletePayrollRecord(id: string) {
      return await sqliteService.delete(id)
    },

    async getAllPayrollRecords() {
      const results = await sqliteService.getAll()
      return results.map(result => ({
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }))
    },

    async getPayrollRecordsByEmployee(employeeId: string) {
      const results = await sqliteService.getByEmployeeId(employeeId)
      return results.map(result => ({
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }))
    },

    async getPayrollRecordsByDateRange(startDate: string, endDate: string) {
      const results = await sqliteService.getByDateRange(startDate, endDate)
      return results.map(result => ({
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }))
    },

    async getPayrollRecordsByStatus(status: string) {
      const results = await sqliteService.getByStatus(status)
      return results.map(result => ({
        _id: result.id,
        ...result,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }))
    },

    // Additional methods for compatibility
    async processPayroll(id: string, processedBy?: string) {
      return await this.updatePayrollRecord(id, {
        status: "processing",
        processedAt: new Date().toISOString(),
        processedBy: processedBy || "System",
      })
    },

    async completePayroll(id: string) {
      return await this.updatePayrollRecord(id, {
        status: "completed",
        completedAt: new Date().toISOString(),
      })
    },

    async cancelPayroll(id: string, cancelNotes: string) {
      return await this.updatePayrollRecord(id, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        notes: cancelNotes,
      })
    }
  }
}
