"use client"

import { v4 as uuidv4 } from "uuid"
import { dbOperations } from "../db-service"

// Payroll structure service factory
export const payrollStructureService = (db: any) => ({
  // Create a new payroll structure
  async createPayrollStructure(structureData: any) {
    if (!db) return null

    try {
      const id = structureData._id || `structure_${uuidv4()}`
      const structure = {
        _id: id,
        ...structureData,
      }

      return await dbOperations.create(db, structure)
    } catch (error) {
      console.error("Error creating payroll structure:", error)
      return null
    }
  },

  // Get a payroll structure by ID
  async getPayrollStructureById(id: string) {
    if (!db) return null

    try {
      return await dbOperations.getById(db, id)
    } catch (error) {
      console.error(`Error getting payroll structure with ID ${id}:`, error)
      return null
    }
  },

  // Update a payroll structure
  async updatePayrollStructure(id: string, updates: any) {
    if (!db) return null

    try {
      return await dbOperations.update(db, id, updates)
    } catch (error) {
      console.error(`Error updating payroll structure with ID ${id}:`, error)
      return null
    }
  },

  // Delete a payroll structure
  async deletePayrollStructure(id: string) {
    if (!db) return null

    try {
      return await dbOperations.delete(db, id)
    } catch (error) {
      console.error(`Error deleting payroll structure with ID ${id}:`, error)
      return null
    }
  },

  // Get all payroll structures
  async getAllPayrollStructures() {
    if (!db) return []

    try {
      return await dbOperations.getAll(db)
    } catch (error) {
      console.error("Error getting all payroll structures:", error)
      return []
    }
  },

  // Search payroll structures
  async searchPayrollStructures(query: string) {
    if (!db) return []

    try {
      const allStructures = await this.getAllPayrollStructures()
      const lowerQuery = query.toLowerCase()

      return allStructures.filter((structure: any) => {
        return (
          structure.name.toLowerCase().includes(lowerQuery) ||
          (structure.description && structure.description.toLowerCase().includes(lowerQuery))
        )
      })
    } catch (error) {
      console.error("Error searching payroll structures:", error)
      return []
    }
  },

  // Calculate salary details (compatibility with mock service)
  calculateSalaryDetails(structure: any) {
    const result = this.calculateNetSalary(structure)
    return {
      basicSalary: result.basicSalary,
      totalAllowances: result.grossSalary - result.basicSalary,
      totalDeductions: result.totalDeductions,
      grossSalary: result.grossSalary,
      netSalary: result.netSalary,
    }
  },

  // Calculate net salary based on structure and basic salary
  calculateNetSalary(structure: any, basicSalary = 0) {
    if (!structure) {
      return {
        basicSalary: 0,
        grossSalary: 0,
        taxableAmount: 0,
        totalDeductions: 0,
        netSalary: 0,
      }
    }

    try {
      // Use structure's basic salary if not provided
      const baseSalary = basicSalary || structure.basicSalary || 0
      let grossSalary = baseSalary

      // Add allowances
      if (structure.allowances && Array.isArray(structure.allowances)) {
        structure.allowances.forEach((allowance: any) => {
          if (allowance.type === "percentage") {
            grossSalary += (baseSalary * allowance.value) / 100
          } else if (allowance.type === "fixed") {
            grossSalary += allowance.value
          }
        })
      }

      let taxableAmount = grossSalary
      let totalDeductions = 0

      // Apply pre-tax deductions
      if (structure.deductions && Array.isArray(structure.deductions)) {
        structure.deductions.forEach((deduction: any) => {
          if (deduction.preTax) {
            let deductionAmount = 0

            if (deduction.type === "percentage") {
              deductionAmount = (taxableAmount * deduction.value) / 100
            } else if (deduction.type === "fixed") {
              deductionAmount = deduction.value
            }

            taxableAmount -= deductionAmount
            totalDeductions += deductionAmount
          }
        })
      }

      // Apply post-tax deductions
      if (structure.deductions && Array.isArray(structure.deductions)) {
        structure.deductions.forEach((deduction: any) => {
          if (!deduction.preTax) {
            let deductionAmount = 0

            if (deduction.type === "percentage") {
              deductionAmount = (grossSalary * deduction.value) / 100
            } else if (deduction.type === "fixed") {
              deductionAmount = deduction.value
            }

            totalDeductions += deductionAmount
          }
        })
      }

      const netSalary = grossSalary - totalDeductions

      return {
        basicSalary: baseSalary,
        grossSalary,
        taxableAmount,
        totalDeductions,
        netSalary,
      }
    } catch (error) {
      console.error("Error calculating net salary:", error)
      return {
        basicSalary: 0,
        grossSalary: 0,
        taxableAmount: 0,
        totalDeductions: 0,
        netSalary: 0,
      }
    }
  },
})
