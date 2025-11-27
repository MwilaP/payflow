import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Loader2, User, Mail, Lock, UserCircle, CheckCircle2 } from 'lucide-react'

import { register } from '@/lib/auth-service'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login, checkForUsers } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter your full name'
    }
    if (!formData.username.trim()) {
      return 'Please enter a username'
    }
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (!formData.email.trim()) {
      return 'Please enter your email'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address'
    }
    if (!formData.password) {
      return 'Please enter a password'
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    setLoadingMessage('Creating your account...')

    try {
      console.log('Submitting registration form...')
      
      // Step 1: Register the user
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.name
      )

      console.log('Registration result:', result)

      if (result.success && result.user) {
        setLoadingMessage('Account created successfully!')
        setIsSuccess(true)
        
        // Small delay to show success state
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Step 2: Automatically log in the user
        setLoadingMessage('Logging you in...')
        const loginResult = await login(formData.username, formData.password)
        
        if (loginResult.success) {
          // Update auth context to reflect onboarding is complete
          await checkForUsers()
          
          toast({
            title: 'Welcome to Payflow!',
            description: 'Your account has been created successfully.',
          })
          
          // Step 3: Redirect to dashboard
          setLoadingMessage('Redirecting to dashboard...')
          await new Promise(resolve => setTimeout(resolve, 500))
          navigate('/dashboard')
        } else {
          // Registration succeeded but login failed - show error but allow manual login
          toast({
            title: 'Account Created',
            description: 'Please log in with your credentials.',
          })
          navigate('/login')
        }
      } else {
        console.error('Registration failed:', result.error)
        setIsSuccess(false)
        toast({
          title: 'Registration Failed',
          description: result.error || 'Failed to create account',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Unexpected registration error:', error)
      setIsSuccess(false)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-8">
      <Card className="w-full h-full">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-3xl font-bold">
              <CreditCard className="h-10 w-10 text-primary" />
              <span>Payflow</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome! Let's Get Started</CardTitle>
          <CardDescription className="text-base">
            Create your admin account to begin managing your payflow
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="johndoe"
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  {isSuccess ? (
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {loadingMessage || 'Creating Account...'}
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              This will be your administrator account with full access to the system
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
