'use client'

import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import AuthBanner from '@/components/auth/AuthBanner'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { resetPassword } from '@/lib/auth'
import { signIn } from 'next-auth/react'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

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

  const strengthLabels = {
    weak: 'Weak - Add more characters',
    medium: 'Medium - Consider adding a special character',
    strong: 'Strong - Great password!',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const res = await resetPassword(token, password)
      setIsSuccess(true)

      // Auto-login via NextAuth using the credentials from the reset
      // We use signIn to set the NextAuth session properly
      const signInRes = await signIn('credentials', {
        email: res.email,
        password: password,
        redirect: false,
      })

      if (signInRes?.ok) {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        const role = session?.user?.role
        setTimeout(() => {
          router.push(role === 'admin' ? '/admin' : '/student')
          router.refresh()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired reset token. Please request a new one.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <div className="flex min-h-screen">
          <div className="w-[40%] p-12 overflow-y-auto flex flex-col bg-bg-secondary">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary">
                V
              </div>
              <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
                VCE<span className="text-text-muted font-normal"> AI Tutor</span>
              </span>
            </Link>

            <div className="flex-1 flex flex-col justify-center">
              <XCircle className="w-12 h-12 text-accent-coral mb-4" />
              <h2 className="font-serif text-[1.75rem] mb-2 text-text-primary">Invalid Reset Link</h2>
              <p className="text-text-secondary text-[0.9375rem] mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 text-accent-teal text-[0.875rem] hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
          <AuthBanner />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="flex min-h-screen">
        <div className="w-[40%] p-12 overflow-y-auto flex flex-col bg-bg-secondary">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary">
              V
            </div>
            <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
              VCE<span className="text-text-muted font-normal"> AI Tutor</span>
            </span>
          </Link>

          {isSuccess ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-accent-teal" />
                <h2 className="font-serif text-[1.75rem] text-text-primary">Password Reset!</h2>
              </div>
              <p className="text-text-secondary text-[0.9375rem] mb-2">
                Your password has been successfully reset. Redirecting you now...
              </p>
              <div className="w-[18px] h-[18px] border-2 border-accent-teal border-t-transparent rounded-full animate-spin mt-4" />
            </div>
          ) : (
            <>
              <h2 className="font-serif text-[1.75rem] mb-2 text-text-primary">Set new password</h2>
              <p className="text-text-secondary text-[0.9375rem] mb-6">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted pr-12"
                      placeholder="Create a new password"
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
                  {password.length > 0 && (
                    <div className={cn(
                      'mt-2 px-3 py-2 rounded-lg text-[0.8125rem] bg-bg-tertiary',
                      passwordStrength === 'weak' && 'text-accent-coral bg-accent-coral/15',
                      passwordStrength === 'medium' && 'text-accent-gold bg-accent-gold/15',
                      passwordStrength === 'strong' && 'text-accent-teal bg-accent-teal/12'
                    )}>
                      {strengthLabels[passwordStrength]}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        "w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted pr-12",
                        confirmPassword && password !== confirmPassword && "border-accent-coral focus:border-accent-coral focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                      )}
                      placeholder="Confirm your new password"
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[0.8125rem] text-accent-coral mt-1.5">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-[0.875rem] text-accent-coral">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.95rem] font-semibold bg-accent-teal text-bg-primary hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-[18px] h-[18px] border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    <>
                      Reset Password <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border-subtle text-center">
                <p className="text-text-secondary text-[0.9375rem]">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="text-accent-teal hover:underline font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <AuthBanner />
      </div>
    </main>
  )
}
