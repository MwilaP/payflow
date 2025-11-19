"use client"

import { createSQLitePayrollStructureService } from "@/lib/db/sqlite-payroll-service";
import { z } from "zod";

// Define schemas for allowances and deductions
const allowanceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().min(0, { message: "Value must be a positive number" })
});

const deductionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["fixed", "percentage"]),
  value: z.number().min(0, { message: "Value must be a positive number" }),
  preTax: z.boolean().default(true)
});

// Payroll structure schema (matches the form structure)
export const payrollStructureSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  frequency: z.string({
    required_error: "Please select a payment frequency.",
  }),
  basicSalary: z.number().min(0, { message: "Basic salary must be a positive number" }),
  allowances: z.array(allowanceSchema),
  deductions: z.array(deductionSchema)
});

// TypeScript type for payroll structure
export type PayrollStructureData = z.infer<typeof payrollStructureSchema>;

// Interface for payroll structure document
export interface PayrollStructureDocument extends PayrollStructureData {
  _id: string;
  _rev?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new payroll structure
export async function createPayrollStructure(
  data: PayrollStructureData
): Promise<PayrollStructureDocument | null> {
  try {
    // Validate the data against the schema
    const validatedData = payrollStructureSchema.parse(data);
    
    // Use SQLite service
    const service = createSQLitePayrollStructureService();
    
    // Create the document
    const result = await service.create(validatedData);
    return {
      ...result,
      _id: result.id,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    } as PayrollStructureDocument;
  } catch (error) {
    console.error("Error creating payroll structure:", error);
    return null;
  }
}

// Get a payroll structure by ID
export async function getPayrollStructure(
  id: string
): Promise<PayrollStructureDocument | null> {
  try {
    // Use SQLite service
    const service = createSQLitePayrollStructureService();
    
    // Get the document
    const result = await service.getById(id);
    if (!result) return null;
    
    return {
      ...result,
      _id: result.id,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    } as PayrollStructureDocument;
  } catch (error) {
    console.error(`Error getting payroll structure with ID ${id}:`, error);
    return null;
  }
}

// Update a payroll structure
export async function updatePayrollStructure(
  id: string,
  updates: Partial<PayrollStructureData>
): Promise<PayrollStructureDocument | null> {
  try {
    // Validate the updates against the schema
    const validatedUpdates = payrollStructureSchema.partial().parse(updates);
    
    // Use SQLite service
    const service = createSQLitePayrollStructureService();
    
    // Update the document
    const result = await service.update(id, validatedUpdates);
    if (!result) return null;
    
    return {
      ...result,
      _id: result.id,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    } as PayrollStructureDocument;
  } catch (error) {
    console.error(`Error updating payroll structure with ID ${id}:`, error);
    return null;
  }
}

// Delete a payroll structure
export async function deletePayrollStructure(
  id: string
): Promise<boolean> {
  try {
    // Use SQLite service
    const service = createSQLitePayrollStructureService();
    
    // Delete the document
    return await service.delete(id);
  } catch (error) {
    console.error(`Error deleting payroll structure with ID ${id}:`, error);
    return false;
  }
}

// Get all payroll structures
export async function getAllPayrollStructures(): Promise<PayrollStructureDocument[]> {
  try {
    // Use SQLite service
    const service = createSQLitePayrollStructureService();
    
    // Get all documents
    const results = await service.getAll();
    return results.map(result => ({
      ...result,
      _id: result.id,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    })) as PayrollStructureDocument[];
  } catch (error) {
    console.error("Error getting all payroll structures:", error);
    return [];
  }
}

// Query payroll structures
export async function queryPayrollStructures(
  query: any
): Promise<PayrollStructureDocument[]> {
  try {
    // Use SQLite service
    const service = createSQLitePayrollStructureService();
    
    // Query documents
    const results = await service.query(query);
    return results.map(result => ({
      ...result,
      _id: result.id,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    })) as PayrollStructureDocument[];
  } catch (error) {
    console.error("Error querying payroll structures:", error);
    return [];
  }
}

// Set up change listeners for real-time updates
export function subscribeToPayrollStructureChanges(
  callback: (change: any) => void
) {
  // SQLite doesn't have real-time changes like PouchDB
  // Return a mock changes object for compatibility
  const mockChanges = {
    cancel: () => {
      console.log("Cancelled changes subscription (SQLite mode)");
    }
  };
  
  return mockChanges;
}