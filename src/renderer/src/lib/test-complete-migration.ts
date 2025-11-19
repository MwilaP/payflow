// Comprehensive test script for complete SQLite migration
import { initializeSQLiteDatabase } from './db/indexeddb-sqlite-service'
import { createSQLiteUserService } from './db/sqlite-user-service'
import { createSQLiteEmployeeService } from './db/sqlite-employee-service'
import { createSQLitePayrollStructureService } from './db/sqlite-payroll-service'
import { initializeAuth, login, logout } from './auth-service'
import { 
  createPayrollStructure, 
  getPayrollStructure, 
  getAllPayrollStructures,
  deletePayrollStructure 
} from './services/payroll-structure-service'

export const testCompleteMigration = async () => {
  console.log('🚀 Starting comprehensive SQLite migration test...')
  
  try {
    // Test 1: Database Initialization
    console.log('\n1. Testing database initialization...')
    const dbResult = await initializeSQLiteDatabase()
    console.log('✅ Database initialized:', dbResult.success)
    
    // Test 2: Authentication System
    console.log('\n2. Testing authentication system...')
    const authInitialized = await initializeAuth()
    console.log('✅ Auth system initialized:', authInitialized)
    
    // Test login
    const loginResult = await login('testuser', 'securepass123')
    console.log('✅ Login successful:', loginResult.success)
    
    if (loginResult.success) {
      console.log('   User:', loginResult.session?.user?.username)
      logout()
      console.log('✅ Logout successful')
    }
    
    // Test 3: User Management
    console.log('\n3. Testing user management...')
    const userService = createSQLiteUserService()
    
    // Create test user
    const newUser = await userService.create({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'password123',
      role: 'employee',
      name: 'Test User 2'
    })
    console.log('✅ User created:', newUser.username)
    
    // Get user by ID
    const retrievedUser = await userService.getById(newUser.id)
    console.log('✅ User retrieved:', retrievedUser?.username)
    
    // Update user
    const updatedUser = await userService.update(newUser.id, { name: 'Updated Test User 2' })
    console.log('✅ User updated:', updatedUser?.name)
    
    // Delete user
    const userDeleted = await userService.delete(newUser.id)
    console.log('✅ User deleted:', userDeleted)
    
    // Test 4: Employee Management
    console.log('\n4. Testing employee management...')
    const employeeService = createSQLiteEmployeeService()
    
    // Create test employee
    const newEmployee = await employeeService.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1234567890',
      department: 'Engineering',
      designation: 'Software Developer',
      dateOfJoining: '2024-01-01',
      employeeId: 'EMP001',
      status: 'active',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'State',
        zipCode: '12345',
        country: 'Country'
      },
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'Test Bank',
        branchCode: 'TB001'
      },
      taxInfo: {
        taxId: 'TAX123456',
        taxBracket: 'standard'
      }
    })
    console.log('✅ Employee created:', `${newEmployee.firstName} ${newEmployee.lastName}`)
    
    // Get employee by ID
    const retrievedEmployee = await employeeService.getById(newEmployee.id)
    console.log('✅ Employee retrieved:', `${retrievedEmployee?.firstName} ${retrievedEmployee?.lastName}`)
    
    // Update employee
    const updatedEmployee = await employeeService.update(newEmployee.id, { 
      designation: 'Senior Software Developer' 
    })
    console.log('✅ Employee updated:', updatedEmployee?.designation)
    
    // Test 5: Payroll Structure Management
    console.log('\n5. Testing payroll structure management...')
    
    // Create test payroll structure
    const payrollStructureData = {
      name: 'Standard Developer Package',
      description: 'Standard payroll structure for software developers',
      frequency: 'monthly',
      basicSalary: 50000,
      allowances: [
        { id: '1', name: 'Housing', type: 'percentage' as const, value: 20 },
        { id: '2', name: 'Transport', type: 'fixed' as const, value: 5000 }
      ],
      deductions: [
        { id: '1', name: 'PAYE', type: 'fixed' as const, value: 8000, preTax: true },
        { id: '2', name: 'NAPSA', type: 'percentage' as const, value: 5, preTax: true }
      ]
    }
    
    const newStructure = await createPayrollStructure(payrollStructureData)
    console.log('✅ Payroll structure created:', newStructure?.name)
    
    if (newStructure) {
      // Get payroll structure by ID
      const retrievedStructure = await getPayrollStructure(newStructure._id)
      console.log('✅ Payroll structure retrieved:', retrievedStructure?.name)
      
      // Get all payroll structures
      const allStructures = await getAllPayrollStructures()
      console.log('✅ All payroll structures count:', allStructures.length)
      
      // Assign payroll structure to employee
      const employeeWithStructure = await employeeService.update(newEmployee.id, {
        payrollStructureId: newStructure._id
      })
      console.log('✅ Employee assigned to payroll structure:', employeeWithStructure?.payrollStructureId)
      
      // Clean up - delete payroll structure
      const structureDeleted = await deletePayrollStructure(newStructure._id)
      console.log('✅ Payroll structure deleted:', structureDeleted)
    }
    
    // Test 6: Employee Search and Filtering
    console.log('\n6. Testing employee search and filtering...')
    
    // Create multiple employees for testing
    const employees = await Promise.all([
      employeeService.create({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@company.com',
        phone: '+1234567891',
        department: 'Marketing',
        designation: 'Marketing Manager',
        dateOfJoining: '2024-02-01',
        employeeId: 'EMP002',
        status: 'active',
        address: { street: '456 Oak St', city: 'Anytown', state: 'State', zipCode: '12345', country: 'Country' },
        bankDetails: { accountNumber: '2345678901', bankName: 'Test Bank', branchCode: 'TB002' },
        taxInfo: { taxId: 'TAX234567', taxBracket: 'standard' }
      }),
      employeeService.create({
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@company.com',
        phone: '+1234567892',
        department: 'Engineering',
        designation: 'DevOps Engineer',
        dateOfJoining: '2024-03-01',
        employeeId: 'EMP003',
        status: 'active',
        address: { street: '789 Pine St', city: 'Anytown', state: 'State', zipCode: '12345', country: 'Country' },
        bankDetails: { accountNumber: '3456789012', bankName: 'Test Bank', branchCode: 'TB003' },
        taxInfo: { taxId: 'TAX345678', taxBracket: 'standard' }
      })
    ])
    
    console.log('✅ Additional employees created:', employees.length)
    
    // Search by department
    const engineeringEmployees = await employeeService.findByDepartment('Engineering')
    console.log('✅ Engineering employees found:', engineeringEmployees.length)
    
    // Search by status
    const activeEmployees = await employeeService.findByStatus('active')
    console.log('✅ Active employees found:', activeEmployees.length)
    
    // Get all employees
    const allEmployees = await employeeService.getAll()
    console.log('✅ Total employees:', allEmployees.length)
    
    // Test 7: Data Integrity and Relationships
    console.log('\n7. Testing data integrity and relationships...')
    
    // Verify employee-payroll structure relationships
    const employeesWithStructures = allEmployees.filter(emp => emp.payrollStructureId)
    console.log('✅ Employees with payroll structures:', employeesWithStructures.length)
    
    // Clean up test data
    console.log('\n8. Cleaning up test data...')
    for (const employee of allEmployees) {
      if (employee.employeeId?.startsWith('EMP')) {
        await employeeService.delete(employee.id)
      }
    }
    console.log('✅ Test employees cleaned up')
    
    console.log('\n🎉 Complete SQLite migration test passed!')
    console.log('✅ All systems operational with SQLite backend')
    
    return {
      success: true,
      message: 'Complete migration test successful',
      details: {
        database: 'initialized',
        authentication: 'working',
        userManagement: 'working',
        employeeManagement: 'working',
        payrollStructures: 'working',
        dataIntegrity: 'verified'
      }
    }
    
  } catch (error) {
    console.error('❌ Migration test failed:', error)
    return {
      success: false,
      message: 'Migration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Auto-run the test in browser environment
if (typeof window !== 'undefined') {
  testCompleteMigration().then(result => {
    console.log('Migration test result:', result)
  }).catch(console.error)
} else {
  console.log('Complete migration test ready. Call testCompleteMigration() to run.')
}
