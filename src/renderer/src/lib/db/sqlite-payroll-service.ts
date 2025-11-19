import { sqliteOperations, getDatabase } from './indexeddb-sqlite-service'
import { 
  SQLitePayrollStructure, 
  SQLiteAllowance, 
  SQLiteDeduction,
  sqlitePayrollStructureSchema,
  sqliteAllowanceSchema,
  sqliteDeductionSchema,
  convertSQLiteToPouchDB 
} from './sqlite-models'
import { v4 as uuidv4 } from 'uuid'

export interface SQLitePayrollStructureService {
  // CRUD operations for payroll structures
  create(structure: Omit<SQLitePayrollStructure, 'id' | 'created_at' | 'updated_at'>, allowances?: Omit<SQLiteAllowance, 'id' | 'payroll_structure_id'>[], deductions?: Omit<SQLiteDeduction, 'id' | 'payroll_structure_id'>[]): Promise<{ structure: SQLitePayrollStructure; allowances: SQLiteAllowance[]; deductions: SQLiteDeduction[] }>
  getById(id: string): Promise<{ structure: SQLitePayrollStructure; allowances: SQLiteAllowance[]; deductions: SQLiteDeduction[] } | null>
  update(id: string, updates: Partial<SQLitePayrollStructure>): Promise<SQLitePayrollStructure | null>
  delete(id: string): Promise<boolean>
  getAll(): Promise<{ structure: SQLitePayrollStructure; allowances: SQLiteAllowance[]; deductions: SQLiteDeduction[] }[]>
  
  // Allowance operations
  addAllowance(structureId: string, allowance: Omit<SQLiteAllowance, 'id' | 'payroll_structure_id'>): Promise<SQLiteAllowance>
  updateAllowance(allowanceId: string, updates: Partial<SQLiteAllowance>): Promise<SQLiteAllowance | null>
  deleteAllowance(allowanceId: string): Promise<boolean>
  
  // Deduction operations
  addDeduction(structureId: string, deduction: Omit<SQLiteDeduction, 'id' | 'payroll_structure_id'>): Promise<SQLiteDeduction>
  updateDeduction(deductionId: string, updates: Partial<SQLiteDeduction>): Promise<SQLiteDeduction | null>
  deleteDeduction(deductionId: string): Promise<boolean>
  
  // Calculations
  calculateNetSalary(structureId: string): Promise<{ basicSalary: number; totalAllowances: number; totalDeductions: number; netSalary: number } | null>
}

export const createSQLitePayrollStructureService = (): SQLitePayrollStructureService => {
  return {
    async create(structureData, allowancesData = [], deductionsData = []) {
      console.log("Core SQLite service create called with:", { structureData, allowancesData, deductionsData });
      
      return sqliteOperations.transaction(async (ops) => {
        // Create the main structure
        const structure: SQLitePayrollStructure = {
          ...structureData,
          id: `structure_${uuidv4()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        console.log("Structure before validation:", structure);
        const validatedStructure = sqlitePayrollStructureSchema.parse(structure)
        console.log("Validated structure:", validatedStructure);
        
        const createdStructure = await ops.create('payroll_structures', validatedStructure)
        console.log("Created structure:", createdStructure);

        // Create allowances
        const allowances: SQLiteAllowance[] = []
        for (const allowanceData of allowancesData) {
          const allowance: SQLiteAllowance = {
            ...allowanceData,
            id: `allowance_${uuidv4()}`,
            payroll_structure_id: createdStructure.id,
          }
          
          const validatedAllowance = sqliteAllowanceSchema.parse(allowance)
          const createdAllowance = await ops.create('allowances', validatedAllowance)
          allowances.push(createdAllowance)
        }

        // Create deductions
        const deductions: SQLiteDeduction[] = []
        for (const deductionData of deductionsData) {
          const deduction: SQLiteDeduction = {
            ...deductionData,
            id: `deduction_${uuidv4()}`,
            payroll_structure_id: createdStructure.id,
          }
          
          const validatedDeduction = sqliteDeductionSchema.parse(deduction)
          const createdDeduction = await ops.create('deductions', validatedDeduction)
          deductions.push(createdDeduction)
        }

        return { structure: createdStructure, allowances, deductions }
      })
    },

    async getById(id: string) {
      const structure = await sqliteOperations.getById<SQLitePayrollStructure>('payroll_structures', id)
      if (!structure) return null

      const allowances = await sqliteOperations.find<SQLiteAllowance>('allowances', { payroll_structure_id: id })
      const deductions = await sqliteOperations.find<SQLiteDeduction>('deductions', { payroll_structure_id: id })

      return { structure, allowances, deductions }
    },

    async update(id: string, updates) {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }
      
      return sqliteOperations.update<SQLitePayrollStructure>('payroll_structures', id, updateData)
    },

    async delete(id: string) {
      return sqliteOperations.transaction(async (ops) => {
        // Delete allowances and deductions first (cascade)
        const allowances = await ops.find<SQLiteAllowance>('allowances', { payroll_structure_id: id })
        const deductions = await ops.find<SQLiteDeduction>('deductions', { payroll_structure_id: id })

        for (const allowance of allowances) {
          await ops.delete('allowances', allowance.id)
        }

        for (const deduction of deductions) {
          await ops.delete('deductions', deduction.id)
        }

        // Delete the main structure
        return await ops.delete('payroll_structures', id)
      })
    },

    async getAll() {
      const structures = await sqliteOperations.getAll<SQLitePayrollStructure>('payroll_structures')
      const results = []

      for (const structure of structures) {
        const allowances = await sqliteOperations.find<SQLiteAllowance>('allowances', { payroll_structure_id: structure.id })
        const deductions = await sqliteOperations.find<SQLiteDeduction>('deductions', { payroll_structure_id: structure.id })
        results.push({ structure, allowances, deductions })
      }

      return results
    },

    async addAllowance(structureId: string, allowanceData) {
      const allowance: SQLiteAllowance = {
        ...allowanceData,
        id: `allowance_${uuidv4()}`,
        payroll_structure_id: structureId,
      }
      
      const validated = sqliteAllowanceSchema.parse(allowance)
      return sqliteOperations.create('allowances', validated)
    },

    async updateAllowance(allowanceId: string, updates) {
      return sqliteOperations.update<SQLiteAllowance>('allowances', allowanceId, updates)
    },

    async deleteAllowance(allowanceId: string) {
      return sqliteOperations.delete('allowances', allowanceId)
    },

    async addDeduction(structureId: string, deductionData) {
      const deduction: SQLiteDeduction = {
        ...deductionData,
        id: `deduction_${uuidv4()}`,
        payroll_structure_id: structureId,
      }
      
      const validated = sqliteDeductionSchema.parse(deduction)
      return sqliteOperations.create('deductions', validated)
    },

    async updateDeduction(deductionId: string, updates) {
      return sqliteOperations.update<SQLiteDeduction>('deductions', deductionId, updates)
    },

    async deleteDeduction(deductionId: string) {
      return sqliteOperations.delete('deductions', deductionId)
    },

    async calculateNetSalary(structureId: string) {
      const result = await this.getById(structureId)
      if (!result) return null

      const { structure, allowances, deductions } = result
      const basicSalary = structure.basic_salary

      // Calculate total allowances
      const totalAllowances = allowances.reduce((total, allowance) => {
        if (allowance.type === "fixed") {
          return total + allowance.value
        } else {
          // Percentage allowance
          return total + (basicSalary * allowance.value) / 100
        }
      }, 0)

      // Calculate gross salary (basic + allowances)
      const grossSalary = basicSalary + totalAllowances

      // Calculate pre-tax deductions
      const preTaxDeductions = deductions
        .filter((d) => d.pre_tax)
        .reduce((total, deduction) => {
          if (deduction.type === "fixed") {
            return total + deduction.value
          } else {
            // Percentage deduction
            return total + (grossSalary * deduction.value) / 100
          }
        }, 0)

      // Calculate taxable income
      const taxableIncome = grossSalary - preTaxDeductions

      // Calculate post-tax deductions
      const postTaxDeductions = deductions
        .filter((d) => !d.pre_tax)
        .reduce((total, deduction) => {
          if (deduction.type === "fixed") {
            return total + deduction.value
          } else {
            // Percentage deduction
            return total + (taxableIncome * deduction.value) / 100
          }
        }, 0)

      // Calculate total deductions
      const totalDeductions = preTaxDeductions + postTaxDeductions

      // Calculate net salary
      const netSalary = grossSalary - totalDeductions

      return {
        basicSalary,
        totalAllowances,
        totalDeductions,
        netSalary,
      }
    }
  }
}

// Compatibility wrapper to maintain the same interface as PouchDB service
export const createPayrollStructureServiceCompat = () => {
  const sqliteService = createSQLitePayrollStructureService()
  
  return {
    async create(structureData: any) {
      console.log("SQLite service create called with:", structureData);
      
      // Convert PouchDB format to SQLite format
      const sqliteStructureData = {
        name: structureData.name,
        description: structureData.description,
        frequency: structureData.frequency,
        basic_salary: structureData.basicSalary || structureData.basic_salary,
      }
      
      console.log("Converted to SQLite format:", sqliteStructureData);

      const allowancesData = (structureData.allowances || []).map((allowance: any) => ({
        name: allowance.name,
        type: allowance.type,
        value: allowance.value,
      }))

      const deductionsData = (structureData.deductions || []).map((deduction: any) => ({
        name: deduction.name,
        type: deduction.type,
        value: deduction.value,
        pre_tax: deduction.preTax,
      }))

      console.log("Calling sqliteService.create with:", { sqliteStructureData, allowancesData, deductionsData });
      
      const result = await sqliteService.create(sqliteStructureData, allowancesData, deductionsData)
      console.log("SQLite service result:", result);
      
      const convertedResult = convertSQLiteToPouchDB.payrollStructure(result.structure, result.allowances, result.deductions)
      console.log("Converted result:", convertedResult);
      
      return convertedResult
    },

    async getById(id: string) {
      const result = await sqliteService.getById(id)
      if (!result) return null
      
      return convertSQLiteToPouchDB.payrollStructure(result.structure, result.allowances, result.deductions)
    },

    async update(id: string, updates: any) {
      const sqliteUpdates: Partial<SQLitePayrollStructure> = {}
      
      if (updates.name) sqliteUpdates.name = updates.name
      if (updates.description) sqliteUpdates.description = updates.description
      if (updates.frequency) sqliteUpdates.frequency = updates.frequency
      if (updates.basicSalary) sqliteUpdates.basic_salary = updates.basicSalary
      
      const result = await sqliteService.update(id, sqliteUpdates)
      if (!result) return null

      // Get the full structure with allowances and deductions
      const fullResult = await sqliteService.getById(id)
      if (!fullResult) return null

      return convertSQLiteToPouchDB.payrollStructure(fullResult.structure, fullResult.allowances, fullResult.deductions)
    },

    async delete(id: string) {
      return await sqliteService.delete(id)
    },

    async getAll() {
      const results = await sqliteService.getAll()
      return results.map(result => 
        convertSQLiteToPouchDB.payrollStructure(result.structure, result.allowances, result.deductions)
      )
    },

    async calculateNetSalary(structureId: string) {
      return await sqliteService.calculateNetSalary(structureId)
    },

    // Add calculateSalaryDetails method for compatibility with employee form
    calculateSalaryDetails(structure: any) {
      if (!structure) return {
        basicSalary: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        grossSalary: 0,
        netSalary: 0
      }

      const basicSalary = structure.basicSalary || 0
      
      // Calculate total allowances
      const totalAllowances = (structure.allowances || []).reduce((total: number, allowance: any) => {
        if (allowance.type === "fixed") {
          return total + (allowance.value || 0)
        } else {
          // Percentage allowance
          return total + (basicSalary * (allowance.value || 0)) / 100
        }
      }, 0)

      // Calculate total deductions
      const totalDeductions = (structure.deductions || []).reduce((total: number, deduction: any) => {
        if (deduction.type === "fixed") {
          return total + (deduction.value || 0)
        } else {
          // Percentage deduction
          return total + (basicSalary * (deduction.value || 0)) / 100
        }
      }, 0)

      const grossSalary = basicSalary + totalAllowances
      const netSalary = grossSalary - totalDeductions

      return {
        basicSalary,
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary
      }
    }
  }
}
