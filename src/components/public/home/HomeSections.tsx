'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  ClipboardCheck,
  Clock,
  BarChart3,
  FileText,
  Target,
  Sparkles,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Trophy,
  Check,
  Calculator,
  Atom,
  FlaskConical,
  BookText,
  Dna,
  Brain,
  Calendar,
  CheckCircle2,
  MousePointer2
} from 'lucide-react'
import Button from '../Button'
import { NeuralCanvas } from './NeuralCanvas'

const floatCards = [
  { icon: Lightbulb, label: 'AI-Powered Hints', position: 'top-[15%] right-[8%]', delay: '0s', iconColor: 'text-accent-teal', bgColor: 'bg-accent-teal/12' },
  { icon: TrendingUp, label: 'Progress Tracking', position: 'top-[45%] right-[5%]', delay: '-5s', iconColor: 'text-accent-coral', bgColor: 'bg-accent-coral/15' },
  { icon: BookOpen, label: 'Practice Exams', position: 'bottom-[20%] right-[12%]', delay: '-10s', iconColor: 'text-indigo-400', bgColor: 'bg-indigo-500/15' },
  { icon: Trophy, label: 'ATAR Predictor', position: 'top-[25%] left-[3%]', delay: '-15s', iconColor: 'text-accent-gold', bgColor: 'bg-accent-gold/15' },
  { icon: Sparkles, label: 'Personalised Support', position: 'bottom-[35%] left-[6%]', delay: '-8s', iconColor: 'text-purple-400', bgColor: 'bg-purple-500/15' },
]

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center relative py-20 overflow-hidden">
      <NeuralCanvas />

      {/* Floating Cards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
        {floatCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
            className={`absolute ${card.position} bg-bg-tertiary border border-border-subtle rounded-xl px-5 py-4 text-sm text-text-secondary backdrop-blur-md animate-float`}
            style={{ animationDelay: card.delay }}
          >
            <div className={`inline-flex items-center justify-center w-7 h-7 ${card.bgColor} rounded-md mb-2 ${card.iconColor}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <div>{card.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="max-w-[80rem] mx-auto px-8 relative z-10">
        <div className="max-w-[45rem]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-accent-teal/12 border border-accent-teal/30 px-4 py-2 rounded-full text-[0.8125rem] font-medium text-accent-teal mb-6"
          >
            <span className="w-1.5 h-1.5 bg-accent-teal rounded-full animate-pulse" />
            Now supporting 2025 VCE curriculum
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-[clamp(3rem,7vw,5rem)] leading-[1.05] mb-6"
          >
            Your Personal <em className="font-serif italic text-accent-coral">AI Tutor</em> for VCE Excellence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[1.25rem] text-text-secondary mb-10 max-w-[33.75rem] leading-[1.7]"
          >
            Master Victorian Certificate of Education with intelligent, adaptive learning.
            Get personalised study plans, instant feedback, and 24/7 support across all VCE subjects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-4 flex-wrap"
          >
            <Button variant="primary" size="lg" asChild>
              <Link href="/auth/register">
                <span>Start Learning Free</span>
                <Check className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="#how-it-works">
                How It Works
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex gap-12 mt-16 pt-8 border-t border-border-subtle"
          >
            {[
              { value: '15K+', label: 'Active Students' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '+12pts', label: 'Avg. Score Improvement' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <div className="font-serif text-[2.5rem] text-text-primary leading-none">
                  <span className="text-accent-teal">{stat.value}</span>
                </div>
                <div className="text-[0.875rem] text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: 'Adaptive AI Tutoring',
      description: 'Our AI analyses your strengths and weaknesses, creating personalised learning paths that evolve as you improve.',
    },
    {
      icon: ClipboardCheck,
      title: 'VCAA-Aligned Content',
      description: 'All materials are meticulously aligned with latest VCAA study designs and assessment criteria.',
    },
    {
      icon: Clock,
      title: '24/7 Instant Support',
      description: 'Get answers to your questions anytime. Our AI tutor is always ready to help, day or night.',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your improvement with detailed analytics. Visualise your journey to VCE success.',
    },
    {
      icon: FileText,
      title: 'Practice Exams',
      description: 'Access hundreds of practice questions and past exams with detailed marking schemes and model answers.',
    },
    {
      icon: Target,
      title: 'ATAR Predictor',
      description: 'Get realistic ATAR predictions based on your performance and track your trajectory throughout year.',
    },
  ]

  return (
    <section id="features" className="py-20 relative bg-bg-secondary scroll-mt-20">
      <div className="max-w-[80rem] mx-auto px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-accent-teal mb-4">
            <span className="w-[30px] h-[1px] bg-accent-teal/50" />
            <span>Why Choose Us</span>
            <span className="w-[30px] h-[1px] bg-accent-teal/50" />
          </div>
          <h2 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] mb-4">
            Intelligent Learning, <span className="text-accent-teal">Real Results</span>
          </h2>
          <p className="text-[1.125rem] text-text-secondary max-w-[37.5rem] mx-auto">
            Our AI understands how you learn and adapts to help you achieve your best possible ATAR score.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-bg-tertiary border border-border-subtle rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent-teal/30 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/12 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-bg-secondary border border-border-subtle rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent-teal group-hover:border-accent-teal group-hover:text-bg-primary transition-all duration-300 text-accent-teal">
                  <feature.icon className="w-[26px] h-[26px]" />
                </div>
                <h3 className="text-[1.25rem] font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-secondary text-[0.9375rem] leading-[1.6]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SubjectsSection() {
  const subjects = [
    { name: 'Maths Methods', units: 'Units 1-4', icon: Calculator },
    { name: 'Physics', units: 'Coming Soon', icon: Atom },
    { name: 'Chemistry', units: 'Coming Soon', icon: FlaskConical },
    { name: 'English', units: 'Coming Soon', icon: BookText },
    { name: 'Biology', units: 'Coming Soon', icon: Dna },
    { name: 'Psychology', units: 'Coming Soon', icon: Brain },
  ]

  return (
    <section id="subjects" className="py-24 relative scroll-mt-20">
      <div className="max-w-[80rem] mx-auto px-8">
        <div className="grid grid-cols-[1fr_1.5fr] gap-16 items-center">
          <div className="relative z-10">
            <div className="text-[clamp(2rem,5vw,3.5rem)] font-serif leading-tight mb-6">
              Master <span className="text-accent-teal">Every Subject</span>
            </div>
            <p className="text-[1.125rem] text-text-secondary leading-[1.7] mb-8">
              From Maths Methods to English, we&apos;ve got you covered. Our comprehensive curriculum covers all VCE subjects with expert-aligned content.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 relative z-10">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-bg-secondary border border-border-subtle rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-102 hover:border-accent-teal hover:bg-bg-tertiary group"
              >
                <div className="flex justify-center mb-4 text-accent-teal group-hover:scale-110 transition-transform duration-300">
                  <subject.icon size={40} strokeWidth={1.5} />
                </div>
                <div className="font-semibold text-[0.9375rem] mb-1">{subject.name}</div>
                <div className="text-[0.8125rem] text-text-muted">
                  {subject.units}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: '1',
      title: 'Sign Up & Assess',
      description: 'Create your free account and take a quick assessment. Our AI analyses your current knowledge gaps and learning style instantly.',
      color: 'text-accent-teal',
      bg: 'bg-accent-teal/10',
      border: 'border-accent-teal/20'
    },
    {
      number: '2',
      title: 'Get Personalised Plan',
      description: 'Receive a custom roadmap designed just for you. We prioritise high-impact topics to help you maximise your ATAR score.',
      color: 'text-accent-coral',
      bg: 'bg-accent-coral/10',
      border: 'border-accent-coral/20'
    },
    {
      number: '3',
      title: 'Practice & Learn',
      description: 'Master concepts with interactive questions. Get instant, step-by-step AI feedback that explains *why* an answer is right or wrong.',
      color: 'text-accent-gold',
      bg: 'bg-accent-gold/10',
      border: 'border-accent-gold/20'
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-bg-secondary relative scroll-mt-20">
      <div className="max-w-[80rem] mx-auto px-8 relative z-10">
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-accent-teal mb-4"
          >
            <span className="w-[30px] h-[1px] bg-accent-teal/50" />
            <span>How It Works</span>
            <span className="w-[30px] h-[1px] bg-accent-teal/50" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-[clamp(2.5rem,5vw,4rem)] mb-4"
          >
            Your Path to Excellence in <span className="text-accent-teal">3 Steps</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 item-start">
          {/* Left Column: Scrollable Steps */}
          <div className="flex flex-col gap-16 lg:gap-[30vh] pb-16 lg:pb-[50vh] pt-0 lg:pt-[10vh]">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0.2, filter: 'blur(2px)' }}
                animate={{
                  opacity: activeStep === index ? 1 : 0.2,
                  filter: activeStep === index ? 'blur(0px)' : 'blur(2px)',
                  scale: activeStep === index ? 1 : 0.95
                }}
                transition={{ duration: 0.5 }}
                viewport={{ margin: "-45% 0px -45% 0px", amount: 0.1 }}
                onViewportEnter={() => setActiveStep(index)}
                className="flex gap-6 items-start group cursor-default"
              >
                <div className={`
                  flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-serif text-2xl border-2 transition-all duration-500
                  ${activeStep === index ? `${step.bg} ${step.border} ${step.color} scale-110 shadow-lg` : 'bg-bg-tertiary border-border-subtle/50 text-text-muted/50'}
                `}>
                  {step.number}
                </div>
                <div className="pt-2">
                  <h3 className={`text-2xl font-bold mb-3 transition-colors duration-500 ${activeStep === index ? 'text-text-primary' : 'text-text-muted/50'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-lg leading-relaxed max-w-md transition-colors duration-500 ${activeStep === index ? 'text-text-secondary' : 'text-text-muted/40'}`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Sticky Visuals */}
          <div className="hidden lg:block h-screen sticky top-0 flex items-center justify-center pt-24">
            <div className="w-full aspect-square max-h-[60vh] min-h-[400px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/5 via-transparent to-accent-coral/5 rounded-3xl blur-3xl opacity-50" />
              <div className="relative h-full bg-bg-tertiary/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden shadow-2xl p-8">
                <AnimatePresence mode="wait">
                  {activeStep === 0 && <AssessmentVisual key="visual-1" />}
                  {activeStep === 1 && <PlanVisual key="visual-2" />}
                  {activeStep === 2 && <PracticeVisual key="visual-3" />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AssessmentVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-6">
        <div className="w-12 h-12 rounded-xl bg-accent-teal/10 flex items-center justify-center text-accent-teal">
          <Brain size={24} />
        </div>
        <div>
          <div className="font-semibold text-lg">Knowledge Assessment</div>
          <div className="text-sm text-text-muted">Analysing performance...</div>
        </div>
      </div>

      <div className="space-y-4">
        {['Calculus Fundamentals', 'Probability Distributions', 'Statistical Inference'].map((item, i) => (
          <div key={item} className="bg-bg-secondary p-4 rounded-xl border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-mono text-text-muted">
                0{i + 1}
              </div>
              <span className="font-medium">{item}</span>
            </div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.4, type: "spring" }}
              className="text-accent-teal"
            >
              <CheckCircle2 size={20} className="fill-accent-teal/10" />
            </motion.div>
          </div>
        ))}
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
          className="h-2 bg-accent-teal/20 rounded-full mt-6 overflow-hidden"
        >
          <motion.div
            className="h-full bg-accent-teal"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

function PlanVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent-coral/10 flex items-center justify-center text-accent-coral">
          <Calendar size={24} />
        </div>
        <div>
          <div className="font-semibold text-lg">Your Weekly Plan</div>
          <div className="text-sm text-text-muted">Optimised for maximum retention</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 h-full">
        {['Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-bg-secondary rounded-xl p-4 border border-border-subtle relative overflow-hidden group"
          >
            <div className="text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{day}</div>
            <div className="h-2 w-12 rounded-full bg-border-subtle mb-3" />
            <div className={`h-16 rounded-lg ${i % 2 === 0 ? 'bg-accent-coral/10 border border-accent-coral/20' : 'bg-accent-teal/10 border border-accent-teal/20'} relative mb-2`}>
              {/* simulated content */}
              <div className={`absolute top-2 left-2 right-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-accent-coral/20' : 'bg-accent-teal/20'}`} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function PracticeVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col justify-center"
    >
      <div className="bg-bg-primary rounded-2xl border border-border-subtle shadow-xl p-6 relative">
        <div className="absolute -top-3 -right-3 bg-accent-gold text-bg-primary font-bold px-3 py-1 rounded-full text-xs shadow-lg animate-bounce">
          High Yield Question
        </div>

        <div className="mb-4">
          <div className="text-xs font-serif text-accent-gold mb-1">Question 12 • Calculus</div>
          <div className="font-medium text-lg">Find the derivative of f(x) = x² + 2x</div>
        </div>

        <div className="space-y-3">
          {[
            { val: '2x', correct: false },
            { val: '2x + 2', correct: true },
            { val: 'x + 2', correct: false }
          ].map((ans, i) => (
            <div key={i} className={`
                  p-3 rounded-lg border flex justify-between items-center transition-all duration-300
                  ${ans.correct ? 'bg-green-500/10 border-green-500/30' : 'bg-bg-secondary border-border-subtle'}
               `}>
              <span className="font-mono text-sm">{ans.val}</span>
              {ans.correct && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring" }}
                >
                  <CheckCircle2 size={18} className="text-green-500" />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Simulated Cursor */}
        <motion.div
          initial={{ x: 100, y: 100, opacity: 0 }}
          animate={{ x: 50, y: 80, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute z-20 pointer-events-none text-text-primary drop-shadow-xl"
        >
          <MousePointer2 size={24} className="fill-current" />
        </motion.div>
      </div>
    </motion.div>
  )
}

const FALLBACK_TESTIMONIALS = [
  {
    name: 'Emily Chen',
    role: 'Year 12 Student',
    subject: 'Maths Methods',
    quote: 'The AI tutor helped me understand calculus concepts I struggled with for months. My practice exam scores jumped from 65% to 89% in just 6 weeks!',
    rating: 5,
    atarImprovement: '+15 pts',
  },
  {
    name: 'James Wilson',
    role: 'Year 12 Student',
    subject: 'Physics & Chemistry',
    quote: 'Having 24/7 access to explanations is a game-changer. I can study at my own pace and get instant feedback on every question.',
    rating: 5,
    atarImprovement: '+12 pts',
  },
  {
    name: 'Sarah Thompson',
    role: 'Parent',
    subject: 'Daughter in Year 11',
    quote: 'As a parent, I can see my daughter\'s progress in real-time. The detailed analytics give me peace of mind that she\'s on track for her goals.',
    rating: 5,
    atarImprovement: null,
  },
  {
    name: 'Michael Nguyen',
    role: 'Year 12 Student',
    subject: 'Maths Methods',
    quote: 'The ATAR predictor kept me motivated throughout the year. Watching my predicted score climb as I improved was incredibly satisfying.',
    rating: 5,
    atarImprovement: '+18 pts',
  },
  {
    name: 'Dr. Rebecca Hall',
    role: 'Education Consultant',
    subject: 'VCE Expert',
    quote: 'I recommend VCE AI Tutor to all my students. The VCAA-aligned content and adaptive learning approach is exactly what modern students need.',
    rating: 5,
    atarImprovement: null,
  },
  {
    name: 'Alex Kumar',
    role: 'Year 12 Student',
    subject: 'English & Psychology',
    quote: 'The personalised study plans helped me balance multiple subjects effectively. I finally feel confident going into my exams.',
    rating: 5,
    atarImprovement: '+10 pts',
  },
]

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'}/testimonials`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data)
        }
      })
      .catch(() => {
        // keep fallback
      })
  }, [])

  return (
    <section id="testimonials" className="py-24 relative scroll-mt-20">
      <div className="max-w-[80rem] mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-accent-teal mb-4"
          >
            <span className="w-[30px] h-[1px] bg-accent-teal/50" />
            <span>Student Success Stories</span>
            <span className="w-[30px] h-[1px] bg-accent-teal/50" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] mb-4"
          >
            Trusted by <span className="text-accent-teal">Thousands</span> of VCE Students
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[1.125rem] text-text-secondary max-w-[37.5rem] mx-auto"
          >
            Hear from students and parents who have transformed their VCE journey with our AI tutor.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent-teal/30 group"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="absolute top-0 right-0 text-accent-teal/10 text-6xl font-serif leading-none select-none">
                  &ldquo;
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 text-accent-gold fill-accent-gold" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-text-secondary text-[0.9375rem] leading-[1.7] mb-6 min-h-[5rem]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-teal/30 to-accent-coral/30 flex items-center justify-center text-text-primary font-semibold text-lg border-2 border-border-subtle">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">{testimonial.name}</div>
                    <div className="text-[0.8125rem] text-text-muted">{testimonial.role}</div>
                    <div className="text-[0.75rem] text-accent-teal">{testimonial.subject}</div>
                  </div>

                  {/* ATAR Improvement Badge */}
                  {testimonial.atarImprovement && (
                    <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-lg px-3 py-1.5 text-center">
                      <div className="text-accent-teal font-bold text-sm">{testimonial.atarImprovement}</div>
                      <div className="text-[0.625rem] text-text-muted uppercase tracking-wider">Score</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-12 border-t border-border-subtle"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '4.9/5', label: 'Average Rating' },
              { value: '15,000+', label: 'Happy Students' },
              { value: '98%', label: 'Would Recommend' },
              { value: '+12pts', label: 'Avg. Score Boost' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="font-serif text-[2rem] text-accent-teal mb-1">{stat.value}</div>
                <div className="text-[0.875rem] text-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="py-24 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-teal-dim)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[43.75rem] mx-auto px-8 relative z-10 text-center">
        <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] mb-6">
          Ready to Ace Your VCE?
        </h2>
        <p className="text-[1.25rem] text-text-secondary mb-10">
          Join thousands of Victorian students achieving their ATAR goals with VCE AI Tutor.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="primary" size="lg" asChild>
            <Link href="/auth/register">
              Start Free Trial
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
