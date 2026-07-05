'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'

import { apiGet, apiPost } from '@/lib/apiClient'
import { PATH } from '@aitutor/shared'

type VerifyState = 'loading' | 'success' | 'error' | 'expired' | 'check-inbox'

function VerifyEmailPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const registered = searchParams.get('registered')
  const emailParam = searchParams.get('email')

  const initialState: VerifyState = token ? 'loading' : registered ? 'check-inbox' : 'check-inbox'
  const [state, setState] = useState<VerifyState>(initialState)
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState(emailParam || '')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const verifiedRef = useRef(false)

  useEffect(() => {
    if (!token || verifiedRef.current) return
    verifiedRef.current = true

    const verify = async () => {
      try {
        const data = await apiGet<any>(`${PATH.auth.verifyEmail}?token=${token}`)
        setState('success')
        setMessage(data.message || 'Email verified successfully!')
      } catch (err: any) {
        if (err.message?.includes('expired')) {
          setState('expired')
        } else {
          setState('error')
        }
        setMessage(err.message || 'Verification failed.')
      }
    }

    verify()
  }, [token])

  const handleResend = async () => {
    if (!resendEmail) return
    setResendLoading(true)
    setResendMessage('')

    try {
      const data = await apiPost<any>(PATH.auth.resendVerification, { email: resendEmail })
      setResendMessage(data.message || 'Verification email sent.')
    } catch {
      setResendMessage('Failed to resend. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-secondary rounded-2xl p-8 shadow-lg border border-border-subtle">
        {state === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent-teal animate-spin mx-auto mb-4" />
            <h2 className="font-serif text-xl text-text-primary mb-2">Verifying your email...</h2>
            <p className="text-text-secondary text-sm">Please wait a moment.</p>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-accent-teal mx-auto mb-4" />
            <h2 className="font-serif text-xl text-text-primary mb-2">Email Verified!</h2>
            <p className="text-text-secondary text-sm mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block w-full py-3 px-6 bg-accent-teal text-bg-primary font-semibold rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              Sign in to your account
            </Link>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center">
            <XCircle className="w-12 h-12 text-accent-coral mx-auto mb-4" />
            <h2 className="font-serif text-xl text-text-primary mb-2">Verification Failed</h2>
            <p className="text-text-secondary text-sm mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block w-full py-3 px-6 bg-bg-tertiary text-text-primary font-semibold rounded-xl text-center border border-border-subtle hover:bg-bg-secondary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}

        {(state === 'expired' || state === 'check-inbox') && (
          <div className="text-center">
            <Mail className="w-12 h-12 text-accent-gold mx-auto mb-4" />
            <h2 className="font-serif text-xl text-text-primary mb-2">
              {state === 'expired' ? 'Link Expired' : 'Check Your Email'}
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              {state === 'expired'
                ? 'Your verification link has expired. Request a new one below.'
                : registered
                  ? `We've sent a verification link to your email. Please check your inbox and click the link to activate your account.`
                  : 'Enter your email to receive a verification link.'}
            </p>

            <div className="space-y-3">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => !emailParam && setResendEmail(e.target.value)}
                readOnly={!!emailParam}
                placeholder="Enter your email"
                className={`w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-sm focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all placeholder:text-text-muted${emailParam ? ' opacity-60 cursor-not-allowed' : ''}`}
              />
              <button
                onClick={handleResend}
                disabled={resendLoading || !resendEmail}
                className="w-full py-3 px-6 bg-accent-teal text-bg-primary font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              {resendMessage && (
                <p className="text-text-secondary text-sm">{resendMessage}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border-subtle">
              <Link href="/auth/login" className="text-accent-teal text-sm hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}
