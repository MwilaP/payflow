import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PayrollSettings } from '@/components/payroll-settings'
import { EmailSettings } from '@/components/email-settings'
import { CompanySettingsComponent } from '@/components/company-settings'
import { AppLayout } from '@/components/app-layout'
import { Mail, CreditCard, Building2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-4 p-4 md:p-8 pt-6">

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <CompanySettingsComponent />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollSettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <EmailSettings />
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  )
}
