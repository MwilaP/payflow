import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

let db: Database.Database | null = null

export interface User {
  id: string
  username: string
  email: string
  password: string
  role: 'admin' | 'user' | 'manager'
  name: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  hire_date: string
  salary: number
  status: 'active' | 'inactive'
  payroll_structure_id?: string
  created_at: string
  updated_at: string
}

export interface PayrollStructure {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Allowance {
  id: string
  payroll_structure_id: string
  name: string
  amount: number
  type: 'fixed' | 'percentage'
  created_at: string
  updated_at: string
}

export interface Deduction {
  id: string
  payroll_structure_id: string
  name: string
  amount: number
  type: 'fixed' | 'percentage'
  created_at: string
  updated_at: string
}

export interface PayrollHistory {
  id: string
  employee_id: string
  date: string
  basic_salary: number
  allowances: string
  deductions: string
  gross_pay: number
  net_pay: number
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface FailedPayslip {
  id: string
  payroll_record_id: string
  employee_id: string
  employee_name: string
  employee_email: string
  employee_number?: string
  period: string
  net_salary: number
  error_message: string
  retry_count: number
  last_retry_at?: string
  payslip_data: string // JSON string containing full payslip details
  status: 'pending' | 'resolved'
  created_at: string
  updated_at: string
}

export const initializeDatabase = (): void => {
  try {
    const userDataPath = app.getPath('userData')
    const dbPath = join(userDataPath, 'payroll.db')
    
    console.log('🗄️  Initializing SQLite database at:', dbPath)
    
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    
    createTables()
    
    console.log('✓ Database initialized successfully')
  } catch (error) {
    console.error('✗ Failed to initialize database:', error)
    throw error
  }
}

const createTables = (): void => {
  if (!db) throw new Error('Database not initialized')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department TEXT,
      position TEXT,
      hire_date TEXT,
      salary REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      payroll_structure_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (payroll_structure_id) REFERENCES payroll_structures(id)
    );

    CREATE TABLE IF NOT EXISTS payroll_structures (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS allowances (
      id TEXT PRIMARY KEY,
      payroll_structure_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (payroll_structure_id) REFERENCES payroll_structures(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deductions (
      id TEXT PRIMARY KEY,
      payroll_structure_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (payroll_structure_id) REFERENCES payroll_structures(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payroll_history (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      basic_salary REAL NOT NULL,
      allowances TEXT NOT NULL,
      deductions TEXT NOT NULL,
      gross_pay REAL NOT NULL,
      net_pay REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days INTEGER NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS failed_payslips (
      id TEXT PRIMARY KEY,
      payroll_record_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      employee_email TEXT NOT NULL,
      employee_number TEXT,
      period TEXT NOT NULL,
      net_salary REAL NOT NULL,
      error_message TEXT NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_retry_at TEXT,
      payslip_data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
    CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
    CREATE INDEX IF NOT EXISTS idx_payroll_history_employee ON payroll_history(employee_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_history_date ON payroll_history(date);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
    CREATE INDEX IF NOT EXISTS idx_failed_payslips_status ON failed_payslips(status);
    CREATE INDEX IF NOT EXISTS idx_failed_payslips_employee ON failed_payslips(employee_id);
    CREATE INDEX IF NOT EXISTS idx_failed_payslips_payroll_record ON failed_payslips(payroll_record_id);
  `)
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const userService = {
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    if (!db) throw new Error('Database not initialized')
    
    const hashedPassword = await hashPassword(user.password)
    const now = new Date().toISOString()
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password, role, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, user.username, user.email, hashedPassword, user.role, user.name, now, now)
    
    return {
      id,
      username: user.username,
      email: user.email,
      password: hashedPassword,
      role: user.role,
      name: user.name,
      created_at: now,
      updated_at: now
    }
  },

  getById(id: string): User | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as User | null
  },

  getByUsername(username: string): User | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get(username) as User | null
  },

  getByEmail(email: string): User | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) as User | null
  },

  getByUsernameOrEmail(usernameOrEmail: string): User | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    return stmt.get(usernameOrEmail, usernameOrEmail) as User | null
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password)
    }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  getAll(): User[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM users')
    return stmt.all() as User[]
  },

  async validateCredentials(usernameOrEmail: string, password: string): Promise<User | null> {
    const user = this.getByUsernameOrEmail(usernameOrEmail)
    if (!user) return null
    
    const isValid = await verifyPassword(password, user.password)
    return isValid ? user : null
  }
}

export const employeeService = {
  create(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Employee {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO employees (id, name, email, phone, department, position, hire_date, salary, status, payroll_structure_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id,
      employee.name,
      employee.email,
      employee.phone || null,
      employee.department || null,
      employee.position || null,
      employee.hire_date || null,
      employee.salary,
      employee.status,
      employee.payroll_structure_id || null,
      now,
      now
    )
    
    return { id, ...employee, created_at: now, updated_at: now }
  },

  getById(id: string): Employee | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM employees WHERE id = ?')
    return stmt.get(id) as Employee | null
  },

  getAll(): Employee[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM employees')
    return stmt.all() as Employee[]
  },

  update(id: string, updates: Partial<Omit<Employee, 'id' | 'created_at'>>): Employee | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE employees SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM employees WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  find(conditions: Partial<Employee>): Employee[] {
    if (!db) throw new Error('Database not initialized')
    
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ')
    const values = Object.values(conditions)
    
    const stmt = db.prepare(`SELECT * FROM employees WHERE ${whereClause}`)
    return stmt.all(...values) as Employee[]
  }
}

export const payrollStructureService = {
  create(structure: Omit<PayrollStructure, 'id' | 'created_at' | 'updated_at'>): PayrollStructure {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO payroll_structures (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, structure.name, structure.description || null, now, now)
    
    return { id, ...structure, created_at: now, updated_at: now }
  },

  getById(id: string): PayrollStructure | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM payroll_structures WHERE id = ?')
    return stmt.get(id) as PayrollStructure | null
  },

  getAll(): PayrollStructure[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM payroll_structures')
    return stmt.all() as PayrollStructure[]
  },

  update(id: string, updates: Partial<Omit<PayrollStructure, 'id' | 'created_at'>>): PayrollStructure | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE payroll_structures SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM payroll_structures WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

export const allowanceService = {
  create(allowance: Omit<Allowance, 'id' | 'created_at' | 'updated_at'>): Allowance {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `allow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO allowances (id, payroll_structure_id, name, amount, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, allowance.payroll_structure_id, allowance.name, allowance.amount, allowance.type, now, now)
    
    return { id, ...allowance, created_at: now, updated_at: now }
  },

  getById(id: string): Allowance | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM allowances WHERE id = ?')
    return stmt.get(id) as Allowance | null
  },

  getByStructureId(structureId: string): Allowance[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM allowances WHERE payroll_structure_id = ?')
    return stmt.all(structureId) as Allowance[]
  },

  getAll(): Allowance[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM allowances')
    return stmt.all() as Allowance[]
  },

  update(id: string, updates: Partial<Omit<Allowance, 'id' | 'created_at'>>): Allowance | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE allowances SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM allowances WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

export const deductionService = {
  create(deduction: Omit<Deduction, 'id' | 'created_at' | 'updated_at'>): Deduction {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `deduct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO deductions (id, payroll_structure_id, name, amount, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, deduction.payroll_structure_id, deduction.name, deduction.amount, deduction.type, now, now)
    
    return { id, ...deduction, created_at: now, updated_at: now }
  },

  getById(id: string): Deduction | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM deductions WHERE id = ?')
    return stmt.get(id) as Deduction | null
  },

  getByStructureId(structureId: string): Deduction[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM deductions WHERE payroll_structure_id = ?')
    return stmt.all(structureId) as Deduction[]
  },

  getAll(): Deduction[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM deductions')
    return stmt.all() as Deduction[]
  },

  update(id: string, updates: Partial<Omit<Deduction, 'id' | 'created_at'>>): Deduction | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE deductions SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM deductions WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

export const payrollHistoryService = {
  create(history: Omit<PayrollHistory, 'id' | 'created_at' | 'updated_at'>): PayrollHistory {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `ph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO payroll_history (id, employee_id, date, basic_salary, allowances, deductions, gross_pay, net_pay, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id,
      history.employee_id,
      history.date,
      history.basic_salary,
      history.allowances,
      history.deductions,
      history.gross_pay,
      history.net_pay,
      now,
      now
    )
    
    return { id, ...history, created_at: now, updated_at: now }
  },

  getById(id: string): PayrollHistory | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM payroll_history WHERE id = ?')
    return stmt.get(id) as PayrollHistory | null
  },

  getByEmployeeId(employeeId: string): PayrollHistory[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM payroll_history WHERE employee_id = ? ORDER BY date DESC')
    return stmt.all(employeeId) as PayrollHistory[]
  },

  getAll(): PayrollHistory[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM payroll_history ORDER BY date DESC')
    return stmt.all() as PayrollHistory[]
  },

  update(id: string, updates: Partial<Omit<PayrollHistory, 'id' | 'created_at'>>): PayrollHistory | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE payroll_history SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM payroll_history WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

export const settingsService = {
  create(setting: Omit<Setting, 'id' | 'created_at' | 'updated_at'>): Setting {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `setting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO settings (id, key, value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, setting.key, setting.value, now, now)
    
    return { id, ...setting, created_at: now, updated_at: now }
  },

  getById(id: string): Setting | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM settings WHERE id = ?')
    return stmt.get(id) as Setting | null
  },

  getByKey(key: string): Setting | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM settings WHERE key = ?')
    return stmt.get(key) as Setting | null
  },

  getAll(): Setting[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM settings')
    return stmt.all() as Setting[]
  },

  update(id: string, updates: Partial<Omit<Setting, 'id' | 'created_at'>>): Setting | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE settings SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  updateByKey(key: string, value: string): Setting | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getByKey(key)
    if (!existing) return null
    
    const now = new Date().toISOString()
    
    const stmt = db.prepare('UPDATE settings SET value = ?, updated_at = ? WHERE key = ?')
    stmt.run(value, now, key)
    
    return this.getByKey(key)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM settings WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

export const leaveRequestService = {
  create(leave: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>): LeaveRequest {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, days, reason, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id,
      leave.employee_id,
      leave.leave_type,
      leave.start_date,
      leave.end_date,
      leave.days,
      leave.reason || null,
      leave.status,
      now,
      now
    )
    
    return { id, ...leave, created_at: now, updated_at: now }
  },

  getById(id: string): LeaveRequest | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM leave_requests WHERE id = ?')
    return stmt.get(id) as LeaveRequest | null
  },

  getByEmployeeId(employeeId: string): LeaveRequest[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC')
    return stmt.all(employeeId) as LeaveRequest[]
  },

  getAll(): LeaveRequest[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM leave_requests ORDER BY created_at DESC')
    return stmt.all() as LeaveRequest[]
  },

  update(id: string, updates: Partial<Omit<LeaveRequest, 'id' | 'created_at'>>): LeaveRequest | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE leave_requests SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM leave_requests WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  find(conditions: Partial<LeaveRequest>): LeaveRequest[] {
    if (!db) throw new Error('Database not initialized')
    
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ')
    const values = Object.values(conditions)
    
    const stmt = db.prepare(`SELECT * FROM leave_requests WHERE ${whereClause} ORDER BY created_at DESC`)
    return stmt.all(...values) as LeaveRequest[]
  }
}

export const failedPayslipService = {
  create(failedPayslip: Omit<FailedPayslip, 'id' | 'created_at' | 'updated_at'>): FailedPayslip {
    if (!db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const id = `failed_payslip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const stmt = db.prepare(`
      INSERT INTO failed_payslips (
        id, payroll_record_id, employee_id, employee_name, employee_email, 
        employee_number, period, net_salary, error_message, retry_count, 
        last_retry_at, payslip_data, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id,
      failedPayslip.payroll_record_id,
      failedPayslip.employee_id,
      failedPayslip.employee_name,
      failedPayslip.employee_email,
      failedPayslip.employee_number || null,
      failedPayslip.period,
      failedPayslip.net_salary,
      failedPayslip.error_message,
      failedPayslip.retry_count,
      failedPayslip.last_retry_at || null,
      failedPayslip.payslip_data,
      failedPayslip.status,
      now,
      now
    )
    
    return { id, ...failedPayslip, created_at: now, updated_at: now }
  },

  getById(id: string): FailedPayslip | null {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM failed_payslips WHERE id = ?')
    return stmt.get(id) as FailedPayslip | null
  },

  getByEmployeeId(employeeId: string): FailedPayslip[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM failed_payslips WHERE employee_id = ? ORDER BY created_at DESC')
    return stmt.all(employeeId) as FailedPayslip[]
  },

  getByPayrollRecordId(payrollRecordId: string): FailedPayslip[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM failed_payslips WHERE payroll_record_id = ? ORDER BY created_at DESC')
    return stmt.all(payrollRecordId) as FailedPayslip[]
  },

  getAll(): FailedPayslip[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM failed_payslips ORDER BY created_at DESC')
    return stmt.all() as FailedPayslip[]
  },

  getPending(): FailedPayslip[] {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('SELECT * FROM failed_payslips WHERE status = ? ORDER BY created_at DESC')
    return stmt.all('pending') as FailedPayslip[]
  },

  update(id: string, updates: Partial<Omit<FailedPayslip, 'id' | 'created_at'>>): FailedPayslip | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    const updateData = { ...updates, updated_at: now }
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateData)
    
    const stmt = db.prepare(`UPDATE failed_payslips SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
    
    return this.getById(id)
  },

  incrementRetryCount(id: string): FailedPayslip | null {
    if (!db) throw new Error('Database not initialized')
    
    const existing = this.getById(id)
    if (!existing) return null
    
    const now = new Date().toISOString()
    
    const stmt = db.prepare(`
      UPDATE failed_payslips 
      SET retry_count = retry_count + 1, last_retry_at = ?, updated_at = ?
      WHERE id = ?
    `)
    stmt.run(now, now, id)
    
    return this.getById(id)
  },

  markAsResolved(id: string): FailedPayslip | null {
    if (!db) throw new Error('Database not initialized')
    
    return this.update(id, { status: 'resolved' })
  },

  delete(id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM failed_payslips WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  deleteByPayrollRecordId(payrollRecordId: string): number {
    if (!db) throw new Error('Database not initialized')
    
    const stmt = db.prepare('DELETE FROM failed_payslips WHERE payroll_record_id = ?')
    const result = stmt.run(payrollRecordId)
    return result.changes
  },

  find(conditions: Partial<FailedPayslip>): FailedPayslip[] {
    if (!db) throw new Error('Database not initialized')
    
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ')
    const values = Object.values(conditions)
    
    const stmt = db.prepare(`SELECT * FROM failed_payslips WHERE ${whereClause} ORDER BY created_at DESC`)
    return stmt.all(...values) as FailedPayslip[]
  }
}

export const closeDatabase = (): void => {
  if (db) {
    db.close()
    db = null
    console.log('✓ Database closed')
  }
}
