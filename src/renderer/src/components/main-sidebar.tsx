"use client"

import type React from "react"

import { Link, useLocation } from "react-router-dom"
import { BarChart3, Calendar, CreditCard, FileText, Home, Settings, Users, Clock, LogOut, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserType } from "@/lib/auth-service"
import { useAuth } from "@/lib/auth-context"

interface MainSidebarProps {
  user: UserType | null
}

export function MainSidebar({ user }: MainSidebarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const { logout } = useAuth()

  return (
    <div className="hidden bg-sidebar border-r border-sidebar-border md:block md:w-64">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
          <CreditCard className="h-6 w-6 text-sidebar-primary" />
          <span>Payroll</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/20 border border-sidebar-border p-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">{user?.name?.substring(0, 2) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">{user?.name || 'User'}</span>
              <span className="text-xs text-sidebar-foreground/70">{user?.role || 'Guest'}</span>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem href="/dashboard" icon={Home} label="Dashboard" isActive={pathname === "/dashboard"} />
            <NavItem href="/employees" icon={Users} label="Employees" isActive={pathname.startsWith("/employees")} />
            {/* <NavItem href="/attendance" icon={Clock} label="Attendance" isActive={pathname.startsWith("/attendance")} />
            <NavItem href="/leave" icon={Calendar} label="Leave" isActive={pathname.startsWith("/leave")} /> */}
            <NavItem href="/payroll" icon={CreditCard} label="Payroll" isActive={pathname.startsWith("/payroll")} />
            {/* <NavItem href="/payslip" icon={FileText} label="Payslips" isActive={pathname.startsWith("/payslips")} />
            <NavItem href="/reports" icon={BarChart3} label="Reports" isActive={pathname.startsWith("/reports")} /> */}
            <NavItem href="/settings" icon={Settings} label="Settings" isActive={pathname.startsWith("/settings")} />
          </nav>
          <div className="mt-auto">
            <NavItem href="/profile" icon={User} label="My Profile" isActive={pathname === "/profile"} />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ElementRef<typeof Home>
  label: string
  isActive: boolean
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
      )}
    >
      <Link to={href}>
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
