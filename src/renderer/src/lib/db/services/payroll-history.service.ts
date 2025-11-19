"use client"

import { v4 as uuidv4 } from "uuid"
import { dbOperations } from "../db-service"
import { getEmployeeService, getPayrollStructureService } from "./service-factory"
import { Payslip, calculateSalaryBreakdown } from "../models/payslip.model"

// Define the PayrollHistory type for proper typing
export interface PayrollHistory {
  _id: string;
  status: "draft" | "pending" | "processing" | "completed" | "cancelled";
  date: string;
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  notes?: string;
  processedBy?: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any; // For additional properties
}

// Define valid status transitions
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending", "processing", "cancelled"],
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

// Define error types
export class PayrollError extends Error {
  currentStatus?: string;

  constructor(message: string) {
    super(message);
    this.name = "PayrollError";
  }
}

export class InvalidStatusTransitionError extends PayrollError {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot transition from '${currentStatus}' to '${targetStatus}'`);
    this.name = "InvalidStatusTransitionError";
    this.currentStatus = currentStatus;
  }
}

// Helper function to validate status transitions
const validateStatusTransition = (currentStatus: string, targetStatus: string): void => {
  // Check if the current status exists in our transition map
  if (!VALID_STATUS_TRANSITIONS.hasOwnProperty(currentStatus)) {
    throw new PayrollError(`Invalid current status: ${currentStatus}`);
  }

  // Check if the transition is allowed
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus as keyof typeof VALID_STATUS_TRANSITIONS];
  if (!allowedTransitions.includes(targetStatus)) {
    const error = new InvalidStatusTransitionError(currentStatus, targetStatus);
    error.currentStatus = currentStatus;
    throw error;
  }
};

// Helper function to log transactions
const logTransaction = async (db: any, payrollId: string, action: string, description: string, details?: any): Promise<void> => {
  if (!db) return;

  try {
    const logEntry = {
      _id: `log_${uuidv4()}`,
      type: "payroll_log",
      payrollId,
      action,
      description,
      details: details || {},
      timestamp: new Date().toISOString(),
    };

    await dbOperations.create(db, logEntry);
  } catch (error) {
    console.error(`Error logging transaction for payroll ${payrollId}:`, error);
    // Don't throw here to prevent transaction logging from blocking main operations
  }
};

// Payroll history service factory
export const payrollHistoryService = (db: any) => ({
  // Create a new payroll record
  async createPayrollRecord(payrollData: any): Promise<PayrollHistory | null> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      const now = new Date().toISOString();
      const id = payrollData._id || `payroll_${uuidv4()}`;
      const payroll: PayrollHistory = {
        _id: id,
        status: "draft", // Default status
        ...payrollData,
        date: payrollData.date || now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await dbOperations.create(db, payroll);
      await logTransaction(db, id, "create", "Payroll record created", { status: payroll.status });
      return result;
    } catch (error: any) {
      console.error("Error creating payroll record:", error);
      throw new PayrollError(`Failed to create payroll record: ${error?.message || "Unknown error"}`);
    }
  },

  // Get a payroll record by ID
  async getPayrollRecordById(id: string): Promise<PayrollHistory | null> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      const result = await dbOperations.getById(db, id);
      if (!result) {
        throw new PayrollError(`Payroll record with ID ${id} not found`);
      }
      return result;
    } catch (error: any) {
      console.error(`Error getting payroll record with ID ${id}:`, error);
      throw new PayrollError(`Failed to retrieve payroll record: ${error?.message || "Unknown error"}`);
    }
  },

  // Update a payroll record
  async updatePayrollRecord(id: string, updates: any): Promise<PayrollHistory | null> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      // Get current record to validate status transition if status is being updated
      if (updates.status) {
        const currentRecord = await this.getPayrollRecordById(id);
        if (!currentRecord) {
          throw new PayrollError(`Payroll record with ID ${id} not found`);
        }

        // Validate status transition
        validateStatusTransition(currentRecord.status, updates.status);
      }

      // Add updated timestamp
      const updatedPayroll = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const result = await dbOperations.update(db, id, updatedPayroll);
      await logTransaction(db, id, "update", "Payroll record updated", updates);
      return result;
    } catch (error: any) {
      console.error(`Error updating payroll record with ID ${id}:`, error);
      throw new PayrollError(`Failed to update payroll record: ${error?.message || "Unknown error"}`);
    }
  },

  // Delete a payroll record
  async deletePayrollRecord(id: string): Promise<any> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      const result = await dbOperations.delete(db, id);
      await logTransaction(db, id, "delete", "Payroll record deleted");
      return result;
    } catch (error: any) {
      console.error(`Error deleting payroll record with ID ${id}:`, error);
      throw new PayrollError(`Failed to delete payroll record: ${error?.message || "Unknown error"}`);
    }
  },

  // Get all payroll records
  async getAllPayrollRecords(): Promise<PayrollHistory[]> {
    if (!db) {
      return [];
    }

    try {
      const allRecords = await dbOperations.getAll(db);
      // Filter records to include only those with "_id" containing "payroll"
      const filteredRecords = allRecords.filter((record: PayrollHistory) =>
        record._id && record._id.includes("payroll")
      );
      return filteredRecords;
    } catch (error: any) {
      console.error("Error getting all payroll records:", error);
      throw new PayrollError(`Failed to retrieve payroll records: ${error?.message || "Unknown error"}`);
    }
  },

  // Get payroll records by employee ID
  async getPayrollRecordsByEmployee(employeeId: string): Promise<PayrollHistory[]> {
    if (!db) {
      return [];
    }

    try {
      const result = await dbOperations.find(db, {
        selector: {
          employeeId: employeeId,
        },
      });

      return result.docs;
    } catch (error: any) {
      console.error(`Error getting payroll records for employee ${employeeId}:`, error);
      throw new PayrollError(`Failed to retrieve employee payroll records: ${error?.message || "Unknown error"}`);
    }
  },

  // Get payroll records by date range
  async getPayrollRecordsByDateRange(startDate: string, endDate: string): Promise<PayrollHistory[]> {
    if (!db) {
      return [];
    }

    try {
      const result = await dbOperations.find(db, {
        selector: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      });

      return result.docs;
    } catch (error: any) {
      console.error(`Error getting payroll records by date range:`, error);
      throw new PayrollError(`Failed to retrieve payroll records by date range: ${error?.message || "Unknown error"}`);
    }
  },

  // Get payroll records by status
  async getPayrollRecordsByStatus(status: string): Promise<PayrollHistory[]> {
    if (!db) {
      return [];
    }

    try {
      const result = await dbOperations.find(db, {
        selector: {
          status: status,
        },
      });

      return result.docs;
    } catch (error: any) {
      console.error(`Error getting payroll records with status ${status}:`, error);
      throw new PayrollError(`Failed to retrieve payroll records by status: ${error?.message || "Unknown error"}`);
    }
  },

  // Process payroll (change status from draft/pending to processing)
  async processPayroll(id: string, processedBy?: string): Promise<PayrollHistory | null> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      // Get current record to validate status
      const currentRecord = await this.getPayrollRecordById(id);
      if (!currentRecord) {
        throw new PayrollError(`Payroll record with ID ${id} not found`);
      }

      // Validate status transition
      validateStatusTransition(currentRecord.status, "processing");

      const now = new Date().toISOString();
      const updates = {
        status: "processing",
        processedAt: now,
        processedBy: processedBy || "System",
        updatedAt: now,
      };

      const result = await this.updatePayrollRecord(id, updates);
      await logTransaction(db, id, "process", `Payroll status changed from ${currentRecord.status} to processing`, updates);
      return result;
    } catch (error: any) {
      console.error(`Error processing payroll record ${id}:`, error);
      const payrollError = new PayrollError(`Failed to process payroll (current status: ${error.currentStatus || "unknown"}): ${error.message || "Unknown error"}`);
      payrollError.currentStatus = error.currentStatus;
      throw payrollError;
    }
  },

  // Complete payroll (change status from processing to completed)
  async completePayroll(id: string): Promise<PayrollHistory | null> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      // Get current record to validate status
      const currentRecord = await this.getPayrollRecordById(id);
      if (!currentRecord) {
        throw new PayrollError(`Payroll record with ID ${id} not found`);
      }

      // Validate status transition
      validateStatusTransition(currentRecord.status, "completed");

      const now = new Date().toISOString();
      const updates = {
        status: "completed",
        completedAt: now,
        updatedAt: now,
      };

      const result = await this.updatePayrollRecord(id, updates);
      await logTransaction(db, id, "complete", `Payroll status changed from ${currentRecord.status} to completed`, updates);
      return result;
    } catch (error: any) {
      console.error(`Error completing payroll record ${id}:`, error);
      const payrollError = new PayrollError(`Failed to complete payroll (current status: ${error.currentStatus || "unknown"}): ${error.message || "Unknown error"}`);
      payrollError.currentStatus = error.currentStatus;
      throw payrollError;
    }
  },

  // Cancel payroll
  async cancelPayroll(id: string, cancelNotes: string): Promise<PayrollHistory | null> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      // Get current record to validate status and append notes
      const currentRecord = await this.getPayrollRecordById(id);
      if (!currentRecord) {
        throw new PayrollError(`Payroll record with ID ${id} not found`);
      }

      // Validate status transition
      validateStatusTransition(currentRecord.status, "cancelled");

      const now = new Date().toISOString();

      // Properly append cancel notes to existing notes
      const existingNotes = currentRecord.notes || "";
      const updatedNotes = existingNotes
        ? `${existingNotes}\n\n[${now}] CANCELLED: ${cancelNotes}`
        : `[${now}] CANCELLED: ${cancelNotes}`;

      const updates = {
        status: "cancelled",
        cancelledAt: now,
        notes: updatedNotes,
        updatedAt: now,
      };

      const result = await this.updatePayrollRecord(id, updates);
      await logTransaction(db, id, "cancel", `Payroll status changed from ${currentRecord.status} to cancelled`, { reason: cancelNotes });
      return result;
    } catch (error: any) {
      console.error(`Error cancelling payroll record ${id}:`, error);
      const payrollError = new PayrollError(`Failed to cancel payroll (current status: ${error.currentStatus || "unknown"}): ${error.message || "Unknown error"}`);
      payrollError.currentStatus = error.currentStatus;
      throw payrollError;
    }
  },

  /**
   * Generates payslips for all employees in a payroll history record
   * @param payrollHistoryId The ID of the payroll history record
   * @returns Promise resolving to an array of Payslip objects
   * @throws PayrollError if payroll history not found or other errors occur
   */
  async getPayslipsByPayrollHistory(payrollHistoryId: string): Promise<Payslip[]> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      // 1. Get the payroll history record
      const payrollHistory = await this.getPayrollRecordById(payrollHistoryId);
      if (!payrollHistory) {
        throw new PayrollError(`Payroll history with ID ${payrollHistoryId} not found`);
      }

      // 2. Get all employees and filter to those in payroll history items
      const employeeService = await getEmployeeService();
      const allEmployees = await employeeService.getAllEmployees();
      if (!allEmployees || allEmployees.length === 0) {
        throw new PayrollError("No employees found in system");
      }

      // Filter to only employees in this payroll history
      const employeeIdsInPayroll = new Set(payrollHistory.items.map((item: { employeeId: string }) => item.employeeId));
      const employees = allEmployees.filter((emp: { _id: string }) => employeeIdsInPayroll.has(emp._id));
      if (employees.length === 0) {
        throw new PayrollError("No matching employees found between system and payroll history");
      }

      // 3. Get payroll structure service
      const payrollStructureService = await getPayrollStructureService();

      // 4. Process each employee to generate payslip
      const payslips: Payslip[] = [];

      for (const employee of employees) {
        try {
          // Skip if employee has no payroll structure
          if (!employee.payrollStructureId) {
            console.warn(`Employee ${employee._id} has no payroll structure assigned`);
            continue;
          }

          // Get employee's payroll structure
          const payrollStructure = await payrollStructureService.getPayrollStructureById(employee.payrollStructureId);
          if (!payrollStructure) {
            console.warn(`Payroll structure ${employee.payrollStructureId} not found for employee ${employee._id}`);
            continue;
          }

          // Calculate salary breakdown
          const salaryBreakdown = calculateSalaryBreakdown(
            payrollStructure.basicSalary,
            payrollStructure.allowances,
            payrollStructure.deductions
          );

          // Create payslip
          const payslip: Payslip = {
            _id: `payslip_${Date.now()}_${employee._id}`,
            payrollHistoryId,
            employee: {
              id: employee._id,
              name: `${employee.firstName} ${employee.lastName}`,
              position: employee.designation || '',
              department: employee.department || '',
              employeeNumber: employee._id,
              nrc: employee.nationalId,
              email: employee.email,
            },
            payPeriod: {
              startDate: payrollHistory.date,
              endDate: payrollHistory.date, // Same as start date for now
              paymentDate: new Date().toISOString(),
            },
            period: payrollHistory.period,
            salary: salaryBreakdown,
            payrollStructure: {
              _id: payrollStructure._id,
              name: payrollStructure.name,
              frequency: payrollStructure.frequency,
            },
            status: 'generated',
            createdAt: new Date().toISOString(),
          };

          payslips.push(payslip);
        } catch (error) {
          console.error(`Error generating payslip for employee ${employee._id}:`, error);
          // Continue with next employee even if one fails
        }
      }

      if (payslips.length === 0) {
        throw new PayrollError("No valid payslips could be generated");
      }

      return payslips;
    } catch (error: any) {
      console.error(`Error generating payslips for payroll ${payrollHistoryId}:`, error);
      throw new PayrollError(`Failed to generate payslips: ${error?.message || "Unknown error"}`);
    }
  },

  // Bulk process payroll records
  async bulkProcessPayroll(ids: string[], processedBy?: string): Promise<PayrollHistory[]> {
    if (!db) {
      throw new PayrollError("Database connection not available");
    }

    try {
      // Get all records to validate status
      const payrolls = await Promise.all(ids.map((id) => this.getPayrollRecordById(id)));
      const validPayrolls = payrolls.filter((payroll): payroll is PayrollHistory => payroll !== null);

      // Validate status transitions for all payrolls
      validPayrolls.forEach(payroll => {
        try {
          validateStatusTransition(payroll.status, "processing");
        } catch (error: any) {
          throw new PayrollError(`Payroll ${payroll._id}: ${error.message || "Invalid status transition"}`);
        }
      });

      const now = new Date().toISOString();
      const updatedPayrolls = validPayrolls.map((payroll) => ({
        ...payroll,
        status: "processing",
        processedAt: now,
        processedBy: processedBy || "System",
        updatedAt: now,
      }));

      const result = await dbOperations.bulkDocs(db, updatedPayrolls);

      // Log transactions for each payroll
      await Promise.all(updatedPayrolls.map(payroll =>
        logTransaction(db, payroll._id, "bulk-process", `Payroll status changed from ${payroll.status} to processing`,
          { processedBy: processedBy || "System" })
      ));

      return result;
    } catch (error: any) {
      console.error(`Error bulk processing payroll records:`, error);
      throw new PayrollError(`Failed to bulk process payrolls: ${error?.message || "Unknown error"}`);
    }
  }
})
