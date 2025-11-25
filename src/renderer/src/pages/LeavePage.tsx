import { LeaveManagement } from '@/components/leave-management'
import { AppLayout } from '@/components/app-layout'

export default function LeavePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <LeaveManagement />
      </div>
    </AppLayout>
  )
}
