import { ReportsOverview } from '@/components/reports-overview'
import { AppLayout } from '@/components/app-layout'

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportsOverview />
      </div>
    </AppLayout>
  )
}
