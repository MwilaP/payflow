import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { emailService, type EmailConfig } from '@/lib/email-service'
import { Loader2, Mail, CheckCircle2, XCircle, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function EmailSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const configured = await emailService.isConfigured()
      setIsConfigured(configured)

      if (configured) {
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
        setIsConfigured(true)
        // Clear password field after successful save
        setConfig({ ...config, auth: { ...config.auth, pass: '' } })
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
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Service Status</CardTitle>
              <CardDescription>Current configuration status</CardDescription>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'} className="gap-1">
              {isConfigured ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Configured
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isConfigured
              ? 'Email service is configured and ready to send payslips to employees.'
              : 'Configure your SMTP settings below to enable email functionality.'}
          </p>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure your email server settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="host">
                SMTP Host <span className="text-destructive">*</span>
              </Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
              <p className="text-xs text-muted-foreground">
                Your email provider's SMTP server address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">
                Port <span className="text-destructive">*</span>
              </Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
              />
              <p className="text-xs text-muted-foreground">
                Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="secure">Use SSL/TLS</Label>
              <p className="text-sm text-muted-foreground">
                Enable secure connection (recommended for port 465)
              </p>
            </div>
            <Switch
              id="secure"
              checked={config.secure}
              onCheckedChange={(checked) => setConfig({ ...config, secure: checked })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="user"
                value={config.auth.user}
                onChange={(e) =>
                  setConfig({ ...config, auth: { ...config.auth, user: e.target.value } })
                }
                placeholder="your-email@example.com"
              />
              <p className="text-xs text-muted-foreground">Your email account username</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={config.auth.pass}
                onChange={(e) =>
                  setConfig({ ...config, auth: { ...config.auth, pass: e.target.value } })
                }
                placeholder={isConfigured ? '••••••••' : 'Enter password'}
              />
              <p className="text-xs text-muted-foreground">
                Use an app-specific password for Gmail
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="from">
              From Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="from"
              value={config.from}
              onChange={(e) => setConfig({ ...config, from: e.target.value })}
              placeholder="noreply@company.com"
            />
            <p className="text-xs text-muted-foreground">
              Email address that will appear as the sender
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Send a test email to verify your settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
          </div>
          <Button
            onClick={handleTestEmail}
            disabled={isTesting || !config.host || !config.auth.user}
            variant="outline"
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            A test email will be sent to verify your configuration is working correctly.
          </p>
        </CardContent>
      </Card>

      {/* Common Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Common SMTP Configurations</CardTitle>
          <CardDescription>Quick setup for popular email providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-3">
            <h4 className="font-medium mb-2">Gmail</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Host: smtp.gmail.com</p>
              <p>Port: 587</p>
              <p>Secure: No (uses STARTTLS)</p>
              <p className="text-xs mt-2">
                Note: Use an{' '}
                <a
                  href="https://support.google.com/accounts/answer/185833"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  App Password
                </a>{' '}
                instead of your regular password
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <h4 className="font-medium mb-2">Outlook / Office 365</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Host: smtp.office365.com</p>
              <p>Port: 587</p>
              <p>Secure: No (uses STARTTLS)</p>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <h4 className="font-medium mb-2">Custom Email Server</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Host: mail.yourdomain.com (or IP address)</p>
              <p>Port: 587 (STARTTLS) or 465 (SSL)</p>
              <p>Secure: No for 587, Yes for 465</p>
              <p className="text-xs mt-2">
                Contact your email administrator for exact settings. See{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  CUSTOM_EMAIL_SERVER_SETUP.md
                </code>{' '}
                for detailed instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadConfig}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
