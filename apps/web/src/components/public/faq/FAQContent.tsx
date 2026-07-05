'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { FAQ, FAQCategory } from '@/lib/api/faq'

interface FAQContentProps {
  categories: FAQCategory[]
  faqs: FAQ[]
}

export default function FAQContent({ categories, faqs }: FAQContentProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? 'general'
  )

  const filteredFaqs = faqs.filter((faq) => faq.categoryId === activeCategory)

  return (
    <>
      {/* Category tabs */}
      <div className="flex justify-center gap-4 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id)
              setActiveFaq(null)
            }}
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

      {/* Accordion */}
      <section className="pb-32 pt-16">
        <div className="max-w-[56.25rem] mx-auto px-8">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={`${activeCategory}-${index}`}
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
    </>
  )
}
