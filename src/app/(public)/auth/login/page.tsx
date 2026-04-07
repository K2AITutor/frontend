'use client'

import Link from 'next/link'
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import AuthBanner from '@/components/auth/AuthBanner'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        alert('Invalid email or password. Please try again.')
        return
      }

      // Fetch session to get role for redirect
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      const role = session?.user?.role

      const redirectTo = callbackUrl || (role === 'admin' ? '/admin' : '/student')
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', {
        callbackUrl: callbackUrl || '/student',
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      alert('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
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

          <h2 className="font-serif text-[1.75rem] mb-2 text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary text-[0.9375rem] mb-6">
            Sign in to continue your VCE journey
          </p>

          <div>
            <button
              type="button"
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
            <span>or sign in with email</span>
            <span className="flex-1 h-[1px] bg-border-subtle" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted pr-12"
                  placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] border border-border-subtle rounded bg-bg-tertiary cursor-pointer accent-accent-teal"
                />
                <span className="text-[0.875rem] text-text-secondary">Remember me</span>
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[0.875rem] text-accent-teal hover:underline transition-all duration-200"
              >
                <Lock className="w-4 h-4" />
                Forgot password?
              </button>
            </div>

            {/* ✅ REAL submit button (guaranteed to trigger form submit) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.95rem] font-semibold bg-accent-teal text-bg-primary hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-[18px] h-[18px] border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <p className="text-text-secondary text-[0.9375rem]">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-accent-teal hover:underline font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <AuthBanner />
      </div>
    </main>
  )
}
