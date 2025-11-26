import { Routes, Route, Navigate } from 'react-router-dom'
// Note: Google Fonts will be loaded via CSS import in main.tsx
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Titlebar } from '@/components/titlebar'
import { SQLiteDatabaseProvider } from '@/lib/db/sqlite-db-context'

// Import pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
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

function App() {
  return (
    <div className="font-sans">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SQLiteDatabaseProvider>
          <AuthProvider>
            <Titlebar />
            <Routes>
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
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </SQLiteDatabaseProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
