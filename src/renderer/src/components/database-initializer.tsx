"use client"

import { useEffect } from "react"
import { useDatabase } from "@/lib/db/db-context"

export function DatabaseInitializer() {
  const { isInitialized, isLoading, error } = useDatabase()

  useEffect(() => {
    // Skip if we're not in a browser environment
    if (typeof window === "undefined") {
      return
    }

    // Log initialization status
    if (isInitialized) {
      console.log("Database initialized successfully")
    } else if (error) {
      console.error("Database initialization error:", error)
    }
  }, [isInitialized, error])

  // This component doesn't render anything visible
  return null
}
