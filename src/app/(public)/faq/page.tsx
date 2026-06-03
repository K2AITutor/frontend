import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Button from '@/components/public/Button'
import Link from 'next/link'
import FAQContent from '@/components/public/faq/FAQContent'
import { getFAQCategoriesSSR, getFAQsSSR } from '@/lib/api/public-server'
import type { FAQ, FAQCategory } from '@/lib/api/faq'

export default async function FAQPage() {
  const [categories, faqs] = await Promise.all([
    getFAQCategoriesSSR().catch(() => [] as FAQCategory[]),
    getFAQsSSR().catch(() => [] as FAQ[]),
  ])

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

          <FAQContent categories={categories} faqs={faqs} />
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
