"use client"

import { dbOperations, checkOnlineStatus } from "./db-service"
import { SyncService } from "./sync-service"

// Define TypeScript interface for Employee
export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  status?: string;
  payrollStructureId?: string;
  createdAt: string;
  updatedAt: string;
  _rev?: string;
  _queued?: boolean;
}

/**
 * Service class for employee-related database operations
 * Provides methods for CRUD operations on employee data
 */
export class EmployeeService {
  private db: any;
  private syncService: SyncService | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000; // ms
  private dbName: string;
  private isInitialized = false;

  constructor(employeesDb: any, syncService?: SyncService | null) {
    this.db = employeesDb;
    this.syncService = syncService || null;
    this.dbName = employeesDb?.name || "payroll_employees";
  }

  /**
   * Initialize the service and start sync if available
   * @returns Promise resolving to true if successful
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Resolve any existing conflicts
      if (this.syncService) {
        await this.syncService.resolveConflicts(this.db);
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing EmployeeService:", error);
      return false;
    }
  }

  /**
   * Fetches all employees from the database
   * @returns Promise resolving to an array of Employee objects
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Implement retry logic
      return await this.withRetry(() => dbOperations.getAll(this.db));
    } catch (error) {
      console.error("Error in getAllEmployees:", error);
      throw new Error("Failed to fetch employees");
    }
  }

  /**
   * Fetches an employee by ID
   * @param id Employee ID
   * @returns Promise resolving to an Employee object or null if not found
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      return await this.withRetry(() => dbOperations.getById(this.db, id));
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      throw new Error(`Failed to fetch employee with ID ${id}`);
    }
  }

  /**
   * Creates a new employee
   * @param employee Employee data (without _id)
   * @returns Promise resolving to the created Employee object
   */
  async createEmployee(employee: Omit<Employee, "_id" | "createdAt" | "updatedAt">): Promise<Employee> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await dbOperations.create(this.db, employee);
      if (!result) {
        throw new Error("Failed to create employee");
      }
      
      // If we're online and have sync service, trigger a sync
      if (checkOnlineStatus() && this.syncService) {
        try {
          await this.syncService.syncOnce(this.db, this.dbName, "push");
        } catch (syncError) {
          console.warn("Error syncing after create:", syncError);
          // Continue even if sync fails
        }
      }
      
      return result as Employee;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw new Error("Failed to create employee");
    }
  }

  /**
   * Updates an existing employee
   * @param id Employee ID
   * @param updates Partial employee data to update
   * @returns Promise resolving to the updated Employee object
   */
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await dbOperations.update(this.db, id, updates);
      
      // If we're online and have sync service, trigger a sync
      if (checkOnlineStatus() && this.syncService && result && !result._queued) {
        try {
          await this.syncService.syncOnce(this.db, this.dbName, "push");
        } catch (syncError) {
          console.warn("Error syncing after update:", syncError);
          // Continue even if sync fails
        }
      }
      
      return result as Employee | null;
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error);
      throw new Error(`Failed to update employee with ID ${id}`);
    }
  }

  /**
   * Deletes an employee
   * @param id Employee ID
   * @returns Promise resolving to true if successful
   */
  async deleteEmployee(id: string): Promise<boolean> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await dbOperations.delete(this.db, id);
      
      // If we're online and have sync service, trigger a sync
      if (checkOnlineStatus() && this.syncService && result && !result._queued) {
        try {
          await this.syncService.syncOnce(this.db, this.dbName, "push");
        } catch (syncError) {
          console.warn("Error syncing after delete:", syncError);
          // Continue even if sync fails
        }
      }
      
      return !!result;
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      throw new Error(`Failed to delete employee with ID ${id}`);
    }
  }

  /**
   * Finds employees by department
   * @param department Department name
   * @returns Promise resolving to an array of Employee objects
   */
  async findEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await dbOperations.find(this.db, {
        selector: { department },
      });
      return result.docs as Employee[];
    } catch (error) {
      console.error(`Error finding employees in department ${department}:`, error);
      throw new Error(`Failed to find employees in department ${department}`);
    }
  }

  /**
   * Finds employees by status
   * @param status Employee status
   * @returns Promise resolving to an array of Employee objects
   */
  async findEmployeesByStatus(status: string): Promise<Employee[]> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await dbOperations.find(this.db, {
        selector: { status },
      });
      return result.docs as Employee[];
    } catch (error) {
      console.error(`Error finding employees with status ${status}:`, error);
      throw new Error(`Failed to find employees with status ${status}`);
    }
  }

  /**
   * Helper method to implement retry logic for database operations
   * @param operation Function that returns a Promise
   * @returns Promise from the operation
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Operation failed (attempt ${attempt + 1}/${this.retryAttempts}):`, error);
        lastError = error;
        
        if (attempt < this.retryAttempts - 1) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Manually sync employee data with remote server
   * @param direction Sync direction (push, pull, or both)
   * @returns Promise resolving to sync result or null if sync not available
   */
  async syncEmployees(direction: "push" | "pull" | "both" = "both"): Promise<any> {
    if (!this.syncService || !this.db) {
      console.warn("Sync service or database not available");
      return null;
    }
    
    try {
      // Resolve any conflicts before syncing
      await this.syncService.resolveConflicts(this.db);
      
      // Perform sync
      return await this.syncService.syncOnce(this.db, this.dbName, direction);
    } catch (error) {
      console.error("Error syncing employees:", error);
      throw new Error("Failed to sync employees");
    }
  }
  
  /**
   * Resolve conflicts in employee data
   * @returns Promise resolving to number of conflicts resolved
   */
  async resolveConflicts(): Promise<number> {
    if (!this.syncService || !this.db) {
      console.warn("Sync service or database not available");
      return 0;
    }
    
    try {
      return await this.syncService.resolveConflicts(this.db);
    } catch (error) {
      console.error("Error resolving conflicts:", error);
      return 0;
    }
  }
  
  /**
   * Get sync status for employee database
   * @returns Sync info or null if sync not available
   */
  getSyncStatus(): any {
    if (!this.syncService) {
      return null;
    }
    
    return this.syncService.getSyncInfo(this.dbName);
  }
}

/**
 * Factory function to create an EmployeeService instance
 * @param employeesDb PouchDB database instance
 * @returns EmployeeService instance or null if database is not available
 */
export function createEmployeeService(employeesDb: any, syncService?: SyncService | null): EmployeeService | null {
  if (!employeesDb) {
    console.error("Cannot create EmployeeService: employees database not available");
    return null;
  }
  
  const service = new EmployeeService(employeesDb, syncService);
  
  // Initialize in the background
  service.initialize().catch(err => {
    console.error("Error during background initialization of EmployeeService:", err);
  });
  
  return service;
}

/**
 * Example usage of the employee service with offline-first capabilities
 */
export const employeeServiceExample = async (): Promise<string> => {
  // This is just an example and should not be executed directly
  // It demonstrates how to use the employee service with offline-first capabilities
  
  // 1. Import necessary modules
  // import { getDatabases } from "./db-service";
  // import { createSyncService } from "./sync-service";
  // import { createEmployeeService } from "./employee-service";
  
  try {
    // 2. Get database instances
    // const databases = await getDatabases();
    // if (!databases.employees) throw new Error("Employees database not available");
    
    // 3. Create sync service with remote CouchDB configuration
    // const PouchDB = (window as any).PouchDB;
    // const syncService = createSyncService(PouchDB, {
    //   url: "https://example.com/couchdb",
    //   username: "admin",
    //   password: "password",
    //   batchSize: 25,
    //   compression: true
    // });
    
    // 4. Create employee service with sync capabilities
    // const employeeService = createEmployeeService(databases.employees, syncService);
    // if (!employeeService) throw new Error("Failed to create employee service");
    
    // 5. Use the service for CRUD operations (works offline)
    // const newEmployee = await employeeService.createEmployee({
    //   firstName: "John",
    //   lastName: "Doe",
    //   email: "john.doe@example.com",
    //   department: "Engineering",
    //   designation: "Developer",
    //   status: "active"
    // });
    
    // 6. Manual sync when needed (or let automatic sync handle it)
    // await employeeService.syncEmployees("push");
    
    // 7. Resolve conflicts if needed
    // const resolvedConflicts = await employeeService.resolveConflicts();
    // console.log(`Resolved ${resolvedConflicts} conflicts`);
    
    // 8. Check sync status
    // const syncStatus = employeeService.getSyncStatus();
    // console.log("Current sync status:", syncStatus);
    
    return "Example completed successfully";
  } catch (error) {
    console.error("Error in example:", error);
    return "Example failed";
  }
};