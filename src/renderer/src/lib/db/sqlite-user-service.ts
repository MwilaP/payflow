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
}

export const createSQLiteUserService = (): SQLiteUserService => {
  return {
    async create(userData) {
      const user: SQLiteUser = {
        ...userData,
        id: `user_${uuidv4()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
        updated_at: new Date().toISOString()
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
    }
  }
}
