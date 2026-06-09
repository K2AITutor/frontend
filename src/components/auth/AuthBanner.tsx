'use client'

import { Sparkles, CheckCircle2 } from 'lucide-react'

export default function AuthBanner() {
    const features = [
        'Personalised learning paths adapted to your progress',
        '24/7 AI tutor for instant help with questions',
        'Practice with past VCE exam questions',
        'Track your progress with detailed analytics',
        'Access to all VCE subjects and topics',
    ]

    return (
        <div className="w-[60%] relative hidden lg:flex flex-col justify-center p-16 bg-bg-primary">
            <div className="relative z-10 max-w-[37.5rem]">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal/12 text-accent-teal rounded-2xl text-[0.875rem] font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Learning
                </div>

                <h1 className="font-serif text-[3rem] leading-[1.2] mb-6 text-text-primary">
                    Master Your <span className="text-accent-teal">VCE</span> with Personalised AI Tutoring
                </h1>

                <p className="text-[1.125rem] text-text-secondary leading-[1.7] mb-8">
                    Get instant explanations, practice questions, and study plans tailored to your learning style across all VCE subjects.
                </p>

                <ul className="space-y-4">
                    {features.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-text-secondary text-base">
                            <CheckCircle2 className="w-5 h-5 text-accent-teal" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
