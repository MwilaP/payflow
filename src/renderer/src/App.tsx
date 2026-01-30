import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
// Note: Google Fonts will be loaded via CSS import in main.tsx
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Titlebar } from '@/components/titlebar'
import { LaunchScreen } from '@/components/launch-screen'
import { SQLiteDatabaseProvider, useSQLiteDatabase } from '@/lib/db/sqlite-db-context'
import { ErrorBoundary } from '@/components/error-boundary'

// Import pages
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import EmployeeNewPage from './pages/EmployeeNewPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'
import EmployeeEditPage from './pages/EmployeeEditPage'
import EmployeeLeavePage from './pages/EmployeeLeavePage'
import LeavePage from './pages/LeavePage'
import PayrollPage from './pages/PayrollPage'
import ReportsPage from './pages/ReportsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SettingsPage from './pages/SettingsPage'
import { FailedPayslipsPage } from './pages/FailedPayslipsPage'

// Inner component that waits for context initialization
function AppContent() {
  const { isLoading: dbLoading, error: dbError } = useSQLiteDatabase()
  const { isLoading: authLoading } = useAuth()
  const [minLoadingTime, setMinLoadingTime] = useState(true)
  const renderCount = useRef(0)
  
  renderCount.current++
  console.log(`🔍 AppContent render #${renderCount.current}:`, { dbLoading, authLoading, minLoadingTime, dbError })

  useEffect(() => {
    console.log('⏱️ Starting minimum loading timer (2 seconds)')
    // Show launch screen for minimum 2 seconds for better UX
    const timer = setTimeout(() => {
      console.log('✅ Minimum loading time complete')
      setMinLoadingTime(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Show launch screen while initializing or during minimum loading time
  if (dbLoading || authLoading || minLoadingTime) {
    console.log('🔄 Showing launch screen:', { dbLoading, authLoading, minLoadingTime })
    return <LaunchScreen />
  }

  // Show error state if database initialization failed
  if (dbError) {
    console.error('❌ Database error:', dbError)
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-destructive">Database Initialization Error</h1>
          <p className="text-muted-foreground max-w-md">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Application
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ Rendering app content - initialization complete (render #' + renderCount.current + ')')
  console.log('📍 Current window location:', window.location.pathname)

  return (
    <>
      <Titlebar />
      <div className="pt-10 min-h-screen bg-background">
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/new" element={<EmployeeNewPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
          <Route path="/employees/:id/leave" element={<EmployeeLeavePage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/payroll/*" element={<PayrollPage />} />
          <Route path="/failed-payslips" element={<FailedPayslipsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <div className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SQLiteDatabaseProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </SQLiteDatabaseProvider>
        </ThemeProvider>
      </div>
    </ErrorBoundary>
  )
}

export default App
