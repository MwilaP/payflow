import { sqliteOperations } from './indexeddb-sqlite-service'
import { SQLiteUser, sqliteUserSchema } from './sqlite-models'
import { v4 as uuidv4 } from 'uuid'

export interface SQLiteUserService {
  // CRUD operations
  create(user: Omit<SQLiteUser, 'id' | 'created_at' | 'updated_at'>): Promise<SQLiteUser>
  getById(id: string): Promise<SQLiteUser | null>
  getByUsername(username: string): Promise<SQLiteUser | null>
  getByEmail(email: string): Promise<SQLiteUser | null>
  getByUsernameOrEmail(usernameOrEmail: string): Promise<SQLiteUser | null>
  update(id: string, updates: Partial<SQLiteUser>): Promise<SQLiteUser | null>
  delete(id: string): Promise<boolean>
  getAll(): Promise<SQLiteUser[]>
  
  // Authentication helpers
  validateCredentials(usernameOrEmail: string, password: string): Promise<SQLiteUser | null>
  createTestUser(): Promise<SQLiteUser>
}

export const createSQLiteUserService = (): SQLiteUserService => {
  return {
    async create(userData) {
      const user: SQLiteUser = {
        ...userData,
        id: `user_${uuidv4()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const validated = sqliteUserSchema.parse(user)
      return sqliteOperations.create('users', validated)
    },

    async getById(id: string) {
      return sqliteOperations.getById<SQLiteUser>('users', id)
    },

    async getByUsername(username: string) {
      const users = await sqliteOperations.find<SQLiteUser>('users', { username })
      return users.length > 0 ? users[0] : null
    },

    async getByEmail(email: string) {
      const users = await sqliteOperations.find<SQLiteUser>('users', { email })
      return users.length > 0 ? users[0] : null
    },

    async getByUsernameOrEmail(usernameOrEmail: string) {
      // First try username
      let user = await this.getByUsername(usernameOrEmail)
      if (user) return user

      // Then try email
      user = await this.getByEmail(usernameOrEmail)
      return user
    },

    async update(id: string, updates) {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }
      
      return sqliteOperations.update<SQLiteUser>('users', id, updateData)
    },

    async delete(id: string) {
      return sqliteOperations.delete('users', id)
    },

    async getAll() {
      return sqliteOperations.getAll<SQLiteUser>('users')
    },

    async validateCredentials(usernameOrEmail: string, password: string) {
      const user = await this.getByUsernameOrEmail(usernameOrEmail)
      if (!user) return null

      // In a real app, this would use proper password hashing (bcrypt, etc.)
      if (user.password === password) {
        return user
      }

      return null
    },

    async createTestUser() {
      console.log('Creating test user...')
      
      // Check if test user already exists
      const existingUser = await this.getByUsername('testuser')
      if (existingUser) {
        console.log('Test user already exists:', existingUser)
        return existingUser
      }

      console.log('Test user does not exist, creating new one...')
      
      // Create test user
      const testUser = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'securepass123', // In real app, this would be hashed
        role: 'admin' as const,
        name: 'Test User',
      }

      console.log('Creating user with data:', testUser)
      const createdUser = await this.create(testUser)
      console.log('User created successfully:', createdUser)
      
      return createdUser
    }
  }
}

// Compatibility wrapper for existing auth service
export const createUserServiceCompat = () => {
  const sqliteService = createSQLiteUserService()
  
  return {
    async find(conditions: any) {
      // Handle PouchDB-style queries
      if (conditions.selector && conditions.selector.$or) {
        const orConditions = conditions.selector.$or
        
        for (const condition of orConditions) {
          if (condition.username) {
            const user = await sqliteService.getByUsername(condition.username)
            if (user) return { docs: [user] }
          }
          if (condition.email) {
            const user = await sqliteService.getByEmail(condition.email)
            if (user) return { docs: [user] }
          }
        }
        
        return { docs: [] }
      }
      
      return { docs: [] }
    },

    async createTestUser() {
      return await sqliteService.createTestUser()
    }
  }
}
