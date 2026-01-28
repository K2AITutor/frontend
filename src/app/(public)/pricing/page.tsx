"use client";

import Link from "next/link";
import { useState } from "react";

// ========== NAVBAR COMPONENT ==========
function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link href="/" className="navbar-brand">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
            <path
              d="M12 28V12h4l4 10 4-10h4v16h-3.5V18l-3.5 10h-2l-3.5-10v10H12z"
              fill="#0a0a0b"
            />
            <defs>
              <linearGradient
                id="logo-gradient"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
              >
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          <span>VCE AI Tutor</span>
        </Link>

        <button className="nav-toggle" onClick={toggleNav}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${isNavOpen ? "active" : ""}`} id="navLinks">
          <li>
            <Link href="/#subjects" className="nav-link">
              Subjects
            </Link>
          </li>
          <li>
            <Link href="/#features" className="nav-link">
              AI Tutor
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="nav-link active">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
          </li>
          <li>
            <Link href="/auth/login" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ========== PRICING HERO ==========
function PricingHero() {
  return (
    <section className="page-hero">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>

      <div className="container">
        <div className="page-hero-content">
          <span className="section-eyebrow">Pricing</span>
          <h1 className="page-hero-title">
            Simple, Transparent <span className="hero-title-accent">Pricing</span>
          </h1>
          <p className="page-hero-subtitle">
            Choose the plan that fits your learning journey. Start free and upgrade anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== PRICING TOGGLE ==========
function PricingToggle({
  isAnnual,
  setIsAnnual,
}: {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}) {
  return (
    <div className="pricing-toggle">
      <span className={!isAnnual ? "active" : ""}>Monthly</span>
      <button
        className={`toggle-switch ${isAnnual ? "active" : ""}`}
        onClick={() => setIsAnnual(!isAnnual)}
        aria-label="Toggle billing period"
      >
        <span className="toggle-slider"></span>
      </button>
      <span className={isAnnual ? "active" : ""}>
        Annually <span className="save-badge">Save 20%</span>
      </span>
    </div>
  );
}

// ========== PRICING CARDS ==========
function PricingCards({ isAnnual }: { isAnnual: boolean }) {
  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out VCE AI Tutor",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "5 AI tutor questions per day",
        "Access to 2 subjects",
        "Basic practice quizzes",
        "Progress tracking",
        "Community forum access",
      ],
      cta: "Get Started Free",
      href: "/auth/register",
      popular: false,
    },
    {
      name: "Pro",
      description: "Best for serious VCE students",
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        "Unlimited AI tutor questions",
        "All 6 VCE subjects",
        "Adaptive practice quizzes",
        "Detailed analytics & insights",
        "Personalized study plans",
        "Priority support",
        "Offline mode",
      ],
      cta: "Start Pro Trial",
      href: "/auth/register?plan=pro",
      popular: true,
    },
    {
      name: "Premium",
      description: "For students who want it all",
      monthlyPrice: 39,
      annualPrice: 31,
      features: [
        "Everything in Pro",
        "1-on-1 tutor sessions (2/month)",
        "Exam prediction & analytics",
        "Custom study materials",
        "Parent progress reports",
        "Early access to new features",
        "Dedicated success manager",
      ],
      cta: "Go Premium",
      href: "/auth/register?plan=premium",
      popular: false,
    },
  ];

  return (
    <section className="pricing-section">
      <div className="container">
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.popular ? "popular" : ""}`}
            >
              {plan.popular && (
                <div className="popular-badge">Most Popular</div>
              )}
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">{plan.name}</h3>
                <p className="pricing-plan-description">{plan.description}</p>
                <div className="pricing-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="price-period">/month</span>
                </div>
                {isAnnual && plan.monthlyPrice > 0 && (
                  <p className="price-savings">
                    Billed ${plan.annualPrice * 12}/year
                  </p>
                )}
              </div>

              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <svg
                      className="check-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`btn ${plan.popular ? "btn-primary" : "btn-secondary"} btn-lg pricing-cta`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== FAQ SECTION ==========
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can I switch plans at any time?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the change will take effect at the end of your current billing period.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer:
        "Absolutely! Both Pro and Premium plans come with a 7-day free trial. You won't be charged until the trial ends, and you can cancel anytime.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All payments are securely processed through Stripe.",
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not happy with your subscription, contact us within 30 days for a full refund.",
    },
    {
      question: "Are there discounts for multiple students?",
      answer:
        "Yes! We offer family plans with discounts for 2+ students. Contact us at support@vceaitutor.com for custom pricing.",
    },
    {
      question: "Do you offer school or institution pricing?",
      answer:
        "We have special pricing for schools and educational institutions. Please reach out to our sales team at schools@vceaitutor.com for more information.",
    },
  ];

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? "open" : ""}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <svg
                  className="faq-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== CTA SECTION ==========
function CTASection() {
  return (
    <section className="cta">
      <div className="cta-bg"></div>
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Learning?</h2>
          <p className="cta-subtitle">
            Join thousands of VCE students already achieving their best with AI-powered tutoring.
          </p>
          <Link href="/auth/register" className="btn btn-primary btn-xl hero-cta">
            Start Your Free Trial
            <svg
              className="hero-cta-arrow"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ========== FOOTER SECTION ==========
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>VCE AI Tutor</h3>
            <p>
              Empowering Victorian students with AI-powered learning. Your
              intelligent study companion for VCE success.
            </p>
          </div>

          <div className="footer-links">
            <h4>Subjects</h4>
            <ul>
              <li>
                <Link href="/practice/english">English</Link>
              </li>
              <li>
                <Link href="/practice/math-methods">Math Methods</Link>
              </li>
              <li>
                <Link href="/practice/specialist">Specialist Maths</Link>
              </li>
              <li>
                <Link href="/practice/physics">Physics</Link>
              </li>
              <li>
                <Link href="/practice/chemistry">Chemistry</Link>
              </li>
              <li>
                <Link href="/practice/biology">Biology</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>
              <li>
                <Link href="#">Terms of Service</Link>
              </li>
              <li>
                <Link href="#">Cookie Policy</Link>
              </li>
              <li>
                <Link href="#">Refund Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2024 VCE AI Tutor. Built for Victorian students.
          </p>
          <div className="footer-social">
            <Link href="#" aria-label="Twitter">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link href="#" aria-label="Facebook">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
            <Link href="#" aria-label="Instagram">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ========== MAIN PRICING PAGE ==========
export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="grain">
      <Navbar />
      <PricingHero />
      <div className="container">
        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      </div>
      <PricingCards isAnnual={isAnnual} />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
