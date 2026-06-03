import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { HeroSection, FeaturesSection, SubjectsSection, HowItWorksSection, TestimonialsSection, CTASection } from '@/components/public/home/HomeSections'
import { getSubjectsSSR, getTestimonialsSSR } from '@/lib/api/public-server'
import type { Subject } from '@/lib/api/subjects'
import type { Testimonial } from '@/types/testimonial'

export default async function HomePage() {
  // Fetched on the server with ISR caching. Failures degrade gracefully:
  // empty subjects hides the section; empty testimonials fall back to static ones.
  const [subjects, testimonials] = await Promise.all([
    getSubjectsSSR().catch(() => [] as Subject[]),
    getTestimonialsSSR().catch(() => [] as Testimonial[]),
  ])

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SubjectsSection subjects={subjects} />
      <HowItWorksSection />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
      <Footer />
    </main>
  )
}
