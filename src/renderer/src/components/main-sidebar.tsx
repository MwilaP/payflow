'use client'

import type React from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Settings,
  Users,
  Clock,
  LogOut,
  User,
  AlertTriangle
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as UserType } from '@/lib/auth-service'
import { useAuth } from '@/lib/auth-context'

interface MainSidebarProps {
  user: UserType | null
}

export function MainSidebar({ user }: MainSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r md:block md:w-64">
      <div className="flex h-20 items-center border-b px-6">
        <Link className="flex items-center gap-3 font-bold text-2xl text-foreground hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-xl bg-primary/10">
            <CreditCard className="h-7 w-7 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Payflow
          </span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="flex flex-col gap-6 p-6">
          <nav className="flex flex-col gap-2">
            <NavItem
              href="/dashboard"
              icon={Home}
              label="Dashboard"
              isActive={pathname === '/dashboard'}
            />
            <NavItem
              href="/employees"
              icon={Users}
              label="Employees"
              isActive={pathname.startsWith('/employees')}
            />
            <NavItem
              href="/leave"
              icon={Calendar}
              label="Leave"
              isActive={pathname.startsWith('/leave')}
            />
            <NavItem
              href="/payroll"
              icon={CreditCard}
              label="Payroll"
              isActive={pathname.startsWith('/payroll')}
            />
            <NavItem
              href="/failed-payslips"
              icon={AlertTriangle}
              label="Failed Payslips"
              isActive={pathname.startsWith('/failed-payslips')}
            />
            {/* <NavItem href="/payslip" icon={FileText} label="Payslips" isActive={pathname.startsWith("/payslips")} />
            <NavItem href="/reports" icon={BarChart3} label="Reports" isActive={pathname.startsWith("/reports")} /> */}
            <NavItem
              href="/settings"
              icon={Settings}
              label="Settings"
              isActive={pathname.startsWith('/settings')}
            />
          </nav>
          <div className="mt-auto pt-4 border-t border-sidebar-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 mt-2 h-11 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
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
  isActive
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
        'justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 h-11 rounded-lg font-medium',
        isActive &&
          'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground'
      )}
    >
      <Link to={href} className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    </Button>
  )
}
