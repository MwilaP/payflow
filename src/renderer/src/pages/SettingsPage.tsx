import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PayrollSettings } from '@/components/payroll-settings'
import { EmailSettings } from '@/components/email-settings'
import { Mail, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollSettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
