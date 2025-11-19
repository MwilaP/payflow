"use client"

import type { LeaveRequest } from "@/lib/db/models/leave-request.model"
import { getDatabases } from "../db-service"
import { dbOperations } from "../db-service"

export class LeaveRequestService {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  static async createService() {
    const databases = await getDatabases()
    if (!databases.employees) { // Using employees db as fallback
      console.warn("Database not available")
      return null
    }
    return new LeaveRequestService(databases.employees)
  }

  async getAll(): Promise<LeaveRequest[]> {
    const result = await dbOperations.getAll(this.db)
    return result as LeaveRequest[]
  }

  async getById(id: string): Promise<LeaveRequest | null> {
    return await dbOperations.getById(this.db, id) as LeaveRequest | null
  }

  async create(request: Omit<LeaveRequest, '_id' | '_rev'>): Promise<LeaveRequest> {
    const newRequest: LeaveRequest = {
      ...request,
      _id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    }
    const response = await dbOperations.create(this.db, newRequest)
    return { ...newRequest, _rev: response.rev }
  }

  async update(id: string, request: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error("Leave request not found")
    }
    const updated = {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString()
    }
    const response = await dbOperations.update(this.db, id, updated)
    return { ...updated, _rev: response.rev }
  }
}

export const leaveRequestService = (async () => {
  const service = await LeaveRequestService.createService()
  if (!service) {
    console.warn("Using mock leave request service")
    return {
      getAll: async () => [],
      getById: async () => null,
      create: async () => ({ _id: '', _rev: '', status: 'pending' } as LeaveRequest),
      update: async () => ({ _id: '', _rev: '', status: 'pending' } as LeaveRequest)
    }
  }
  return service
})()