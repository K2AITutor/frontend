'use client'

import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Button from '@/components/public/Button'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })

        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <main className="min-h-screen bg-bg-primary">
            <Navbar />

            <section className="pt-32 pb-16 text-center">
                <div className="max-w-[80rem] mx-auto px-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-serif text-[clamp(2.5rem,5vw,4rem)] mb-6"
                    >
                        Get in <span className="text-accent-teal">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[1.25rem] text-text-secondary max-w-[37.5rem] mx-auto"
                    >
                        Have questions or need support? We&apos;re here to help you on your learning journey.
                    </motion.p>
                </div>
            </section>

            <section className="pb-32">
                <div className="max-w-[80rem] mx-auto px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-12"
                        >
                            <div>
                                <h2 className="font-serif text-[2.5rem] mb-6">Contact Information</h2>
                                <p className="text-text-secondary text-[1.125rem] mb-8">
                                    Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <a
                                    href="mailto:support@k2aitutor.com"
                                    className="group flex items-start gap-6 p-6 rounded-2xl border border-border-subtle bg-bg-secondary hover:border-accent-teal transition-all duration-300"
                                >
                                    <div className="p-4 rounded-xl bg-accent-teal/10 text-accent-teal group-hover:bg-accent-teal group-hover:text-bg-primary transition-colors duration-300">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[1.25rem] mb-1">Email Us</h3>
                                        <p className="text-text-secondary mb-2">Our support team is always here to help.</p>
                                        <span className="text-accent-teal font-medium">support@k2aitutor.com</span>
                                    </div>
                                </a>
                            </div>

                            <div className="p-8 rounded-2xl bg-bg-tertiary border border-border-subtle relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Mail className="w-24 h-24 rotate-12" />
                                </div>
                                <h3 className="font-serif text-[1.75rem] mb-4">Response Time</h3>
                                <p className="text-text-secondary leading-relaxed">
                                    We aim to respond to all inquiries within 24 hours during business days. For urgent matters related to your subscription, please include &quot;URGENT&quot; in the subject line.
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-bg-secondary border border-border-subtle rounded-3xl p-8 md:p-12 shadow-xl"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-[0.875rem] font-medium text-text-secondary ml-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full px-6 py-4 rounded-xl border border-border-subtle bg-bg-primary focus:border-accent-teal focus:ring-1 focus:ring-accent-teal outline-none transition-all duration-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-[0.875rem] font-medium text-text-secondary ml-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="w-full px-6 py-4 rounded-xl border border-border-subtle bg-bg-primary focus:border-accent-teal focus:ring-1 focus:ring-accent-teal outline-none transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-[0.875rem] font-medium text-text-secondary ml-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        className="w-full px-6 py-4 rounded-xl border border-border-subtle bg-bg-primary focus:border-accent-teal focus:ring-1 focus:ring-accent-teal outline-none transition-all duration-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-[0.875rem] font-medium text-text-secondary ml-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Your message here..."
                                        className="w-full px-6 py-4 rounded-xl border border-border-subtle bg-bg-primary focus:border-accent-teal focus:ring-1 focus:ring-accent-teal outline-none transition-all duration-300 resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full justify-center gap-2"
                                    disabled={isSubmitted}
                                    loading={isSubmitting}
                                >
                                    {isSubmitted ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Message Sent
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </Button>

                                {isSubmitted && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-accent-teal font-medium"
                                    >
                                        Thank you! We&apos;ll get back to you soon.
                                    </motion.p>
                                )}
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
