'use client'

import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import AuthBanner from '@/components/auth/AuthBanner'
import { useState } from 'react'
import { forgotPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setIsSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="flex min-h-screen">
        <div className="w-full lg:w-[40%] p-6 sm:p-12 overflow-y-auto flex flex-col bg-bg-secondary">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary">
              V
            </div>
            <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
              VCE<span className="text-text-muted font-normal"> AI Tutor</span>
            </span>
          </Link>

          {isSent ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-accent-teal" />
                <h2 className="font-serif text-[1.75rem] text-text-primary">Check your email</h2>
              </div>
              <p className="text-text-secondary text-[0.9375rem] mb-2">
                If an account exists for <strong className="text-text-primary">{email}</strong>, we&apos;ve sent a password reset link.
              </p>
              <p className="text-text-muted text-[0.875rem] mb-8">
                The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>

              <button
                onClick={() => { setIsSent(false); setEmail(''); }}
                className="text-accent-teal text-[0.875rem] hover:underline mb-4 text-left"
              >
                Try a different email
              </button>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-text-secondary text-[0.875rem] hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-[1.75rem] mb-2 text-text-primary">Forgot your password?</h2>
              <p className="text-text-secondary text-[0.9375rem] mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                    Email address
                  </label>
                  <div className="relative">
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
                </div>

                {error && (
                  <p className="text-[0.875rem] text-accent-coral">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.95rem] font-semibold bg-accent-teal text-bg-primary hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-[18px] h-[18px] border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border-subtle">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-text-secondary text-[0.875rem] hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        <AuthBanner />
      </div>
    </main>
  )
}
