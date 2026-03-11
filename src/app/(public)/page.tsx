import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { HeroSection, FeaturesSection, SubjectsSection, HowItWorksSection, TestimonialsSection, CTASection } from '@/components/public/home/HomeSections'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SubjectsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
