import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { emailService, type EmailConfig } from '@/lib/email-service'
import { Loader2, Mail } from 'lucide-react'

interface EmailConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmailConfigDialog({ open, onOpenChange }: EmailConfigDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const [config, setConfig] = useState<EmailConfig>({
    host: '',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: ''
    },
    from: ''
  })

  // Load existing config when dialog opens
  useEffect(() => {
    if (open) {
      loadConfig()
    }
  }, [open])

  const loadConfig = async () => {
    try {
      const existingConfig = await emailService.getConfig()
      if (existingConfig) {
        setConfig({
          ...existingConfig,
          auth: {
            user: '',
            pass: ''
          }
        })
      }
    } catch (error) {
      console.error('Failed to load email config:', error)
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!config.host || !config.auth.user || !config.auth.pass || !config.from) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await emailService.configure(config)

      if (result.success) {
        toast({
          title: 'Email Configured',
          description: 'Email service has been configured successfully.'
        })
        onOpenChange(false)
      } else {
        toast({
          title: 'Configuration Failed',
          description: result.error || 'Failed to configure email service.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a test email address.',
        variant: 'destructive'
      })
      return
    }

    setIsTesting(true)
    try {
      const result = await emailService.sendTestEmail(testEmail)

      if (result.success) {
        toast({
          title: 'Test Email Sent',
          description: `A test email has been sent to ${testEmail}.`
        })
      } else {
        toast({
          title: 'Test Failed',
          description: result.error || 'Failed to send test email.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Email Configuration</DialogTitle>
          <DialogDescription>Configure SMTP settings to send payslips via email.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* SMTP Host */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host" className="text-right">
              SMTP Host *
            </Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="col-span-3"
            />
          </div>

          {/* SMTP Port */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="port" className="text-right">
              Port *
            </Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
              className="col-span-3"
            />
          </div>

          {/* Secure Connection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secure" className="text-right">
              Use SSL/TLS
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="secure"
                checked={config.secure}
                onCheckedChange={(checked) => setConfig({ ...config, secure: checked })}
              />
              <Label htmlFor="secure" className="text-sm text-muted-foreground">
                {config.secure ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          </div>

          {/* Username */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">
              Username *
            </Label>
            <Input
              id="user"
              value={config.auth.user}
              onChange={(e) =>
                setConfig({ ...config, auth: { ...config.auth, user: e.target.value } })
              }
              placeholder="your-email@example.com"
              className="col-span-3"
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              value={config.auth.pass}
              onChange={(e) =>
                setConfig({ ...config, auth: { ...config.auth, pass: e.target.value } })
              }
              placeholder="••••••••"
              className="col-span-3"
            />
          </div>

          {/* From Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">
              From Email *
            </Label>
            <Input
              id="from"
              value={config.from}
              onChange={(e) => setConfig({ ...config, from: e.target.value })}
              placeholder="noreply@company.com"
              className="col-span-3"
            />
          </div>

          {/* Test Email Section */}
          <div className="border-t pt-4 mt-2">
            <Label className="text-sm font-medium mb-2 block">Test Configuration</Label>
            <div className="flex gap-2">
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                type="email"
              />
              <Button
                onClick={handleTestEmail}
                disabled={isTesting || !config.host || !config.auth.user}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Test
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send a test email to verify your configuration
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
