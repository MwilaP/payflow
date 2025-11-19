"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
// DEPRECATED: This file is replaced by sqlite-db-context.tsx
// This is a compatibility wrapper that redirects to SQLite implementation
import { 
  SQLiteDatabaseProvider, 
  useDatabase as useSQLiteDatabase,
  useDatabases as useSQLiteDatabases,
  useSyncService as useSQLiteSyncService,
  useSync as useSQLiteSync
} from "./sqlite-db-context"

// Re-export SQLite implementations for compatibility
export const DatabaseProvider = SQLiteDatabaseProvider
export const useDatabase = useSQLiteDatabase
export const useDatabases = useSQLiteDatabases
export const useSyncService = useSQLiteSyncService
export const useSync = useSQLiteSync

// Legacy context (empty - everything redirects to SQLite)
const DatabaseContext = createContext<any>({})

// This file now serves as a compatibility layer that redirects to SQLite implementation
// All functionality is handled by sqlite-db-context.tsx
