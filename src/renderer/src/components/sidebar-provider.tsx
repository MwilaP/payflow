"use client"

import type * as React from "react"
import { useLocation } from "react-router-dom"
import { MainSidebar } from "@/components/main-sidebar"
import { MainHeader } from "@/components/main-header"
import { useAuth } from "@/lib/auth-context"

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const location = useLocation()
  const pathname = location.pathname
  const { isAuthenticated, user } = useAuth()
  
  // Pages that don't require authentication and don't show the sidebar
  const publicPages = ["/login", "/reset-password", "/"]
  const isPublicPage = publicPages.includes(pathname)

  // For public pages, don't show the sidebar
  if (isPublicPage) {
    return <>{children}</>
  }
  
  // For authenticated pages, show the sidebar
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <div className="fixed left-0 top-0 z-50 h-screen">
          <MainSidebar user={user} />
        </div>
        <main className="flex-1 ml-64 overflow-y-auto bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    )
  }
  
  // If not authenticated and not on a public page, redirect to login
  // This is handled client-side for now, but could be server-side
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
  
  // Return empty during redirect
  return null
}
