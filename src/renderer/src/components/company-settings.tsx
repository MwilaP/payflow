import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Building2, Save } from 'lucide-react'

export interface CompanySettings {
  companyName: string
  companyAddress: string
  companyPhone?: string
  companyEmail?: string
  companyTaxId?: string
}

const STORAGE_KEY = 'company_settings'

export function CompanySettingsComponent() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyTaxId: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
    }
  }

  const handleSave = async () => {
    if (!settings.companyName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Company name is required.',
        variant: 'destructive'
      })
      return
    }

    if (!settings.companyAddress.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Company address is required.',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      toast({
        title: 'Settings Saved',
        description: 'Company settings have been saved successfully.'
      })
    } catch (error) {
      console.error('Error saving company settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save company settings.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Company Information</CardTitle>
        </div>
        <CardDescription>
          Configure your company details that will appear on payslips and reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Enter company name"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyAddress">
            Company Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="companyAddress"
            placeholder="Enter company address"
            value={settings.companyAddress}
            onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Company Phone</Label>
            <Input
              id="companyPhone"
              placeholder="Enter phone number"
              value={settings.companyPhone}
              onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input
              id="companyEmail"
              type="email"
              placeholder="Enter email address"
              value={settings.companyEmail}
              onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyTaxId">Tax ID / Registration Number</Label>
          <Input
            id="companyTaxId"
            placeholder="Enter tax ID or registration number"
            value={settings.companyTaxId}
            onChange={(e) => setSettings({ ...settings, companyTaxId: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get company settings
export const getCompanySettings = (): CompanySettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading company settings:', error)
  }
  
  return {
    companyName: 'Your Company Name',
    companyAddress: 'Company Address'
  }
}
