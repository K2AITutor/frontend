'use client'

import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Button from '@/components/public/Button'
import Link from 'next/link'
import { ChevronDown, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fetchFAQCategories, fetchFAQs, PublicFAQ as FAQ, PublicFAQCategory as FAQCategory } from '@/lib/api/faq'

export default function FAQPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('general')
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, allFaqs] = await Promise.all([
          fetchFAQCategories(),
          fetchFAQs()
        ])
        setCategories(cats)
        setFaqs(allFaqs)
      } catch (error) {
        console.error('Failed to fetch FAQ data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredFaqs = faqs.filter((faq) => {
    return faq.category === activeCategory
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-teal animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      <section className="pt-32 pb-16 text-center">
        <div className="max-w-[80rem] mx-auto px-8">
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] mb-6">
            Frequently Asked <span className="text-accent-teal">Questions</span>
          </h1>
          <p className="text-[1.25rem] text-text-secondary max-w-[37.5rem] mx-auto mb-16">
            Find answers to common questions about VCE AI Tutor. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>


          <div className="flex justify-center gap-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'px-6 py-3 rounded-full border border-border-subtle text-[0.9375rem] font-medium transition-all duration-300',
                  activeCategory === category.id
                    ? 'bg-accent-teal text-bg-primary border-accent-teal'
                    : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-[56.25rem] mx-auto px-8">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="border border-border-subtle rounded-xl bg-bg-secondary overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full py-6 px-6 font-semibold text-[1.0625rem] flex items-center justify-between gap-4 hover:bg-bg-tertiary transition-colors duration-300"
                  >
                    {faq.question}
                    <motion.div
                      animate={{ rotate: activeFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-accent-teal" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 text-text-secondary leading-[1.7]"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-24 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-teal-dim)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-[43.75rem] mx-auto px-8 relative z-10 text-center">
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] mb-6">
            Still Have Questions?
          </h2>
          <p className="text-[1.25rem] text-text-secondary mb-10">
            Our support team is here to help you succeed. Get in touch with us today.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
