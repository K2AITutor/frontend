'use client'

import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { motion } from 'framer-motion'

export default function TermsOfServicePage() {
    const lastUpdated = 'February 3, 2026'

    return (
        <main className="min-h-screen bg-bg-primary">
            <Navbar />

            <section className="pt-32 pb-16">
                <div className="max-w-[80rem] mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-[50rem]"
                    >
                        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] mb-6">
                            Terms of <span className="text-accent-teal">Service</span>
                        </h1>
                        <p className="text-[1.25rem] text-text-secondary">
                            Last updated: {lastUpdated}
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="pb-32">
                <div className="max-w-[80rem] mx-auto px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
                        <aside className="hidden lg:block">
                            <nav className="sticky top-32 space-y-4">
                                <h4 className="text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-text-muted mb-6">Contents</h4>
                                {[
                                    'Acceptance of Terms',
                                    'Description of Service',
                                    'Registration and Accounts',
                                    'Subscription and Payments',
                                    'User Conduct',
                                    'Intellectual Property',
                                    'Termination',
                                    'Disclaimer of Warranties',
                                    'Limitation of Liability',
                                    'Governing Law',
                                ].map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                                        className="block text-[0.9375rem] text-text-secondary hover:text-accent-teal transition-colors"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="prose prose-lg max-w-none text-text-secondary leading-[1.8]"
                        >
                            <div className="space-y-12">
                                <section id="acceptance-of-terms">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">1. Acceptance of Terms</h2>
                                    <p>
                                        By accessing or using VCE AI Tutor (the &quot;Service&quot;), provided by VCE AI Tutor Pty Ltd (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                                    </p>
                                </section>

                                <section id="description-of-service">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">2. Description of Service</h2>
                                    <p>
                                        VCE AI Tutor provides an AI-powered educational platform designed to assist students with Victorian Certificate of Education (VCE) studies. The Service includes practice questions, AI explanations, progress tracking, and study materials.
                                    </p>
                                </section>

                                <section id="registration-and-accounts">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">3. Registration and Accounts</h2>
                                    <p>
                                        To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for all activities that occur under your account.
                                    </p>
                                </section>

                                <section id="subscription-and-payments">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">4. Subscription and Payments</h2>
                                    <p>
                                        Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. Subscription fees are non-refundable except as required by law (including Australian Consumer Law).
                                    </p>
                                </section>

                                <section id="user-conduct">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">5. User Conduct</h2>
                                    <p>
                                        You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service. Prohibited activities include, but are not limited to, attempting to gain unauthorised access to our systems or using the Service to generate offensive or inappropriate content.
                                    </p>
                                </section>

                                <section id="intellectual-property">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">6. Intellectual Property</h2>
                                    <p>
                                        The Service and its original content, features, and functionality are and will remain the exclusive property of VCE AI Tutor and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                                    </p>
                                </section>

                                <section id="termination">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">7. Termination</h2>
                                    <p>
                                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                                    </p>
                                </section>

                                <section id="disclaimer-of-warranties">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">8. Disclaimer of Warranties</h2>
                                    <p>
                                        Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Accuracy of AI-generated content is not guaranteed and should be used as a supplement to, not a replacement for, official VCAA materials and teacher guidance.
                                    </p>
                                </section>

                                <section id="limitation-of-liability">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">9. Limitation of Liability</h2>
                                    <p>
                                        In no event shall VCE AI Tutor, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                                    </p>
                                </section>

                                <section id="governing-law">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">10. Governing Law</h2>
                                    <p>
                                        These Terms shall be governed and construed in accordance with the laws of Victoria, Australia, without regard to its conflict of law provisions.
                                    </p>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
