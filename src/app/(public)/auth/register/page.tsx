'use client'

import Button from '@/components/public/Button'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import AuthBanner from '@/components/auth/AuthBanner'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { register } from '@/lib/auth'
import { toast } from '@/components/dashboard/ui/sonner'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    year: '',
  })
  const [terms, setTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || ''

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength('weak')
      return
    }

    if (password.length >= 8) {
      if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) {
        if (/[!@#$%^&*]/.test(password)) {
          setPasswordStrength('strong')
        } else {
          setPasswordStrength('medium')
        }
      }
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.year) {
      toast.error('Please select your VCE year')
      return
    }

    if (!terms) {
      toast.error('Please agree to Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName, formData.studentId, formData.year)

      // Redirect to verify-email page (no auto-login, user must verify email first)
      router.push(`/auth/verify-email?registered=true&email=${encodeURIComponent(formData.email)}`)
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'An error occurred during registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const strengthLabels = {
    weak: 'Weak - Add more characters',
    medium: 'Medium - Consider adding a special character',
    strong: 'Strong - Great password!',
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="flex min-h-screen">
        <div className="w-[40%] p-12 overflow-y-auto flex flex-col bg-bg-secondary max-h-screen custom-scrollbar">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary">
              V
            </div>
            <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
              VCE<span className="text-text-muted font-normal"> AI Tutor</span>
            </span>
          </Link>

          <h2 className="font-serif text-[1.75rem] mb-2 text-text-primary">Create Account</h2>
          <p className="text-text-secondary text-[0.9375rem] mb-6">
            Start your VCE success journey today
          </p>

          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-3 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.875rem] font-medium cursor-pointer hover:bg-bg-secondary hover:border-accent-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-[18px] h-[18px] border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Google'}
            </button>
          </div>

          <div className="flex items-center gap-4 my-5 text-text-muted text-[0.8125rem]">
            <span className="flex-1 h-[1px] bg-border-subtle" />
            <span>or sign up with email</span>
            <span className="flex-1 h-[1px] bg-border-subtle" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setPassword(e.target.value)
                  }}
                  className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted pr-12"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted p-0 hover:text-text-primary transition-colors duration-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[0.8125rem] text-text-muted mt-1.5">
                Minimum 8 characters with at least 1 number
              </p>
              <div className={cn(
                'mt-2 px-3 py-2 rounded-lg text-[0.8125rem] bg-bg-tertiary',
                passwordStrength === 'weak' && 'text-accent-coral bg-accent-coral/15',
                passwordStrength === 'medium' && 'text-accent-gold bg-accent-gold/15',
                passwordStrength === 'strong' && 'text-accent-teal bg-accent-teal/12'
              )}>
                {strengthLabels[passwordStrength]}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={cn(
                    "w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted pr-12",
                    formData.confirmPassword && formData.password !== formData.confirmPassword && "border-accent-coral focus:border-accent-coral focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                  )}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted p-0 hover:text-text-primary transition-colors duration-200"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[0.8125rem] text-accent-coral mt-1.5">
                  Passwords do not match
                </p>
              )}
            </div>

            <div>
              <label htmlFor="studentId" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                Student ID (optional)
              </label>
              <input
                type="text"
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted"
                placeholder="Enter your VCE student ID"
              />
              <p className="text-[0.8125rem] text-text-muted mt-1.5">
                Helps us personalise your learning experience
              </p>
            </div>

            <div>
              <label htmlFor="year" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                VCE Year
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300"
                required
              >
                <option value="">Select your year level</option>
                <option value="10">Year 10</option>
                <option value="11">Year 11</option>
                <option value="12">Year 12</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-[18px] h-[18px] border border-border-subtle rounded bg-bg-tertiary cursor-pointer accent-accent-teal"
                required
              />
              <span className="text-[0.875rem] text-text-secondary">
                I agree to{' '}
                <Link href="/terms" target="_blank" className="text-accent-teal hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="text-accent-teal hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.password !== formData.confirmPassword || !formData.year || !terms}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <p className="text-text-secondary text-[0.9375rem]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-accent-teal hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <AuthBanner />
      </div>
    </main>
  )
}

