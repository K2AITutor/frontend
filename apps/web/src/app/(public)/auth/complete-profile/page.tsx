'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AuthBanner from '@/components/auth/AuthBanner'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/dashboard/ui/sonner'

import { apiPost } from '@/lib/apiClient'
import { PATH } from '@aitutor/shared'

export default function CompleteProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [yearLevel, setYearLevel] = useState('')
  const [studentId, setStudentId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!yearLevel) {
      toast.error('Please select your VCE year')
      return
    }

    setIsLoading(true)
    try {
      const accessToken = (session?.user as any)?.accessToken

      await apiPost<any>(PATH.auth.completeProfile, {
        yearLevel,
        vcaaStudentNumber: studentId || undefined,
      }, accessToken)

      // Update session to reflect profileCompleted = true
      await update({ profileCompleted: true })

      const role = (session?.user as any)?.role
      router.push(role === 'admin' ? '/admin' : '/student')
      router.refresh()
    } catch (error) {
      console.error('Complete profile error:', error)
      toast.error('An error occurred. Please try again.')
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

          <h2 className="font-serif text-[1.75rem] mb-2 text-text-primary">Complete Your Profile</h2>
          <p className="text-text-secondary text-[0.9375rem] mb-6">
            Just a few more details to personalise your learning experience
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="year" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                VCE Year
              </label>
              <select
                id="year"
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300"
                required
              >
                <option value="">Select your year level</option>
                <option value="10">Year 10</option>
                <option value="11">Year 11</option>
                <option value="12">Year 12</option>
              </select>
            </div>

            <div>
              <label htmlFor="studentId" className="block text-[0.875rem] font-medium mb-2 text-text-primary">
                Student ID <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-3 px-4 border border-border-subtle rounded-xl bg-bg-tertiary text-text-primary text-[0.9375rem] focus:outline-none focus:border-accent-teal focus:shadow-[0_0_0_3px_var(--color-accent-teal-dim)] transition-all duration-300 placeholder:text-text-muted"
                placeholder="Enter your VCE student ID"
              />
              <p className="text-[0.8125rem] text-text-muted mt-1.5">
                Helps us personalise your learning experience
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !yearLevel}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.95rem] font-semibold bg-accent-teal text-bg-primary hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-[18px] h-[18px] border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <AuthBanner />
      </div>
    </main>
  )
}
