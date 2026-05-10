'use client'

import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { motion } from 'framer-motion'

export default function PrivacyPolicyPage() {
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
                            Privacy <span className="text-accent-teal">Policy</span>
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
                                    'Information We Collect',
                                    'How We Use Information',
                                    'Data Storage and Security',
                                    'Disclosure of Information',
                                    'Your Rights',
                                    'Cookies and Tracking',
                                    'Children\'s Privacy',
                                    'Changes to This Policy',
                                    'Contact Us',
                                ].map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase().replace(/ /g, '-').replace(/'/g, '')}`}
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
                                <section id="information-we-collect">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">1. Information We Collect</h2>
                                    <p>
                                        We collect information you provide directly to us when you create an account, such as your name, email address, student ID, and year level. We also collect data about your usage of the Service, including practice test results and progress tracking.
                                    </p>
                                </section>

                                <section id="how-we-use-information">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">2. How We Use Information</h2>
                                    <p>
                                        We use the information we collect to provide, maintain, and improve our Service, personalise your learning experience, communicate with you, and monitor and analyse trends and usage.
                                    </p>
                                </section>

                                <section id="data-storage-and-security">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">3. Data Storage and Security</h2>
                                    <p>
                                        We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorised access. Your data is stored securely on servers located in Australia and/or major global cloud providers.
                                    </p>
                                </section>

                                <section id="disclosure-of-information">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">4. Disclosure of Information</h2>
                                    <p>
                                        We do not share your personal information with third parties except as described in this policy, such as with service providers who perform services for us, or if required by law.
                                    </p>
                                </section>

                                <section id="your-rights">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">5. Your Rights</h2>
                                    <p>
                                        You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us to request a copy of the data we hold about you.
                                    </p>
                                </section>

                                <section id="cookies-and-tracking">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">6. Cookies and Tracking</h2>
                                    <p>
                                        We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                    </p>
                                </section>

                                <section id="childrens-privacy">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">7. Children&apos;s Privacy</h2>
                                    <p>
                                        Our Service is intended for VCE students (typically aged 15-18). By using the Service, you represent that you are at least 15 years old. If we learn we have collected personal information from a child under 13, we will delete that information.
                                    </p>
                                </section>

                                <section id="changes-to-this-policy">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">8. Changes to This Policy</h2>
                                    <p>
                                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                                    </p>
                                </section>

                                <section id="contact-us">
                                    <h2 className="text-[1.75rem] font-serif text-text-primary mb-4">9. Contact Us</h2>
                                    <p>
                                        If you have any questions about this Privacy Policy, please contact us at:
                                    </p>
                                    <p className="mt-2 font-medium text-text-primary">
                                        Email: privacy@vceaitutor.com.au
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
