// Test script to verify SQLite migration is working
import { initializeSQLiteDatabase, sqliteOperations } from './indexeddb-sqlite-service'
import { createEmployeeServiceCompat } from './sqlite-employee-service'
import { createPayrollStructureServiceCompat } from './sqlite-payroll-service'

export const testSQLiteMigration = async () => {
  console.log('🧪 Testing SQLite migration...')
  
  try {
    // Test 1: Initialize database
    console.log('1. Initializing database...')
    const { success, error } = await initializeSQLiteDatabase()
    
    if (!success) {
      throw new Error(`Database initialization failed: ${error}`)
    }
    console.log('✅ Database initialized successfully')

    // Test 2: Create employee service
    console.log('2. Creating employee service...')
    const employeeService = createEmployeeServiceCompat()
    console.log('✅ Employee service created')

    // Test 3: Create payroll structure service
    console.log('3. Creating payroll structure service...')
    const payrollService = createPayrollStructureServiceCompat()
    console.log('✅ Payroll structure service created')

    // Test 4: Test basic CRUD operations
    console.log('4. Testing basic CRUD operations...')
    
    // Create a test employee
    const testEmployee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1234567890',
      department: 'Engineering',
      designation: 'Software Developer',
      employmentType: 'full-time' as const,
      hireDate: '2024-01-01',
      status: 'Active' as const,
      accountNumber: '1234567890',
      bankName: 'Test Bank',
      nationalId: 'ID123456789',
      taxNumber: 'TAX123456789',
    }

    const createdEmployee = await employeeService.create(testEmployee)
    console.log('✅ Employee created:', createdEmployee._id)

    // Retrieve the employee
    const retrievedEmployee = await employeeService.getById(createdEmployee._id)
    if (!retrievedEmployee) {
      throw new Error('Failed to retrieve created employee')
    }
    console.log('✅ Employee retrieved successfully')

    // Update the employee
    const updatedEmployee = await employeeService.update(createdEmployee._id, {
      designation: 'Senior Software Developer'
    })
    if (!updatedEmployee || updatedEmployee.designation !== 'Senior Software Developer') {
      throw new Error('Failed to update employee')
    }
    console.log('✅ Employee updated successfully')

    // Test 5: Create a payroll structure
    console.log('5. Testing payroll structure operations...')
    
    const testStructure = {
      name: 'Standard Developer Package',
      description: 'Standard payroll structure for developers',
      frequency: 'monthly' as const,
      basicSalary: 50000,
      allowances: [
        {
          name: 'Transport Allowance',
          type: 'fixed' as const,
          value: 5000
        }
      ],
      deductions: [
        {
          name: 'Tax',
          type: 'percentage' as const,
          value: 10,
          preTax: true
        }
      ]
    }

    const createdStructure = await payrollService.create(testStructure)
    console.log('✅ Payroll structure created:', createdStructure._id)

    // Test 6: Get all employees
    console.log('6. Testing bulk operations...')
    const allEmployees = await employeeService.getAll()
    if (allEmployees.length === 0) {
      throw new Error('No employees found')
    }
    console.log(`✅ Found ${allEmployees.length} employee(s)`)

    // Test 7: Search functionality
    console.log('7. Testing search functionality...')
    const searchResults = await employeeService.search('John')
    if (searchResults.length === 0) {
      throw new Error('Search returned no results')
    }
    console.log(`✅ Search found ${searchResults.length} result(s)`)

    // Test 8: Clean up
    console.log('8. Cleaning up test data...')
    await employeeService.delete(createdEmployee._id)
    await payrollService.delete(createdStructure._id)
    console.log('✅ Test data cleaned up')

    console.log('🎉 All tests passed! SQLite migration is working correctly.')
    return { success: true, message: 'All tests passed' }

  } catch (error) {
    console.error('❌ Test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

testSQLiteMigration()
// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).testSQLiteMigration = testSQLiteMigration
}
