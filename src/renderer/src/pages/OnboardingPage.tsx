import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Loader2, User, Mail, Lock, UserCircle } from 'lucide-react'

import { register } from '@/lib/auth-service'
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

  const [isLoading, setIsLoading] = useState(false)
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

    try {
      console.log('Submitting registration form...')
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.name
      )

      console.log('Registration result:', result)

      if (result.success && result.user) {
        // Create a session for the newly registered user
        const session = {
          user: result.user,
          isLoggedIn: true,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        
        // Store session in localStorage
        localStorage.setItem('paylo_session', JSON.stringify(session))
        
        toast({
          title: 'Account Created',
          description: 'Welcome! Redirecting to your dashboard...'
        })
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        console.error('Registration failed:', result.error)
        toast({
          title: 'Registration Failed',
          description: result.error || 'Failed to create account',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Unexpected registration error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <CreditCard className="h-8 w-8 text-primary" />
              <span>Payroll</span>
            </div>
          </div>
          <CardTitle className="text-xl">Welcome! Let's Get Started</CardTitle>
          <CardDescription>
            Create your admin account to begin managing your payroll system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              This will be your administrator account with full access to the system
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
