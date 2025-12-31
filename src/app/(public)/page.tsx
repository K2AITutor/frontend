"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
            <Link href="#subjects" className="nav-link">
              Subjects
            </Link>
          </li>
          <li>
            <Link href="#features" className="nav-link">
              AI Tutor
            </Link>
          </li>
          <li>
            <Link href="/student/practice" className="nav-link">
              Practice
            </Link>
          </li>
          <li>
            <Link href="/student" className="nav-link">
              Progress
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

// ========== HERO SECTION ==========
function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      <div className="hero-orb hero-orb-3"></div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            <span className="hero-eyebrow-text">
              Victoria&apos;s Intelligent Study Platform
            </span>
          </div>

          <h1 className="hero-title">
            Master Your VCE with
            <br />
            <span className="hero-title-accent">AI-Powered</span> Learning
          </h1>

          <p className="hero-subtitle">
            Your personal AI tutor, available 24/7. Get instant explanations,
            practice with adaptive quizzes, and track your progress across all
            VCE subjects.
          </p>

          <div className="hero-actions">
            <Link href="/auth/login" className="btn btn-primary btn-lg hero-cta">
              Start Learning Free
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
            <Link href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Preview Card */}
      <div className="hero-visual">
        <div className="preview-card">
          <div className="preview-header">
            <div className="preview-avatar">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <div>
              <div className="preview-title">VCE AI Tutor</div>
              <div className="preview-status">
                <span className="preview-status-dot"></span>
                Ready to help
              </div>
            </div>
          </div>

          <div className="preview-message">
            <p className="preview-message-text">
              The derivative of x³ is found using the power rule:
            </p>
            <div className="preview-message-math">d/dx(x³) = 3x²</div>
            <p className="preview-message-text">
              Bring down the exponent, then reduce it by 1. Want me to explain
              more examples?
            </p>
          </div>

          <div className="preview-chips">
            <span className="preview-chip">Show more examples</span>
            <span className="preview-chip">Practice problems</span>
            <span className="preview-chip">Related topics</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== STATS SECTION ==========
function StatsSection() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">
              50<span>K+</span>
            </div>
            <div className="stat-label">Active Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">6</div>
            <div className="stat-label">Core Subjects</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              10<span>K+</span>
            </div>
            <div className="stat-label">Practice Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              95<span>%</span>
            </div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== FEATURES SECTION ==========
function FeaturesSection() {
  return (
    <section className="features" id="features">
      <div className="features-bg"></div>
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Features</span>
          <h2 className="section-title">Everything You Need to Excel</h2>
          <p className="section-subtitle">
            Powerful AI-driven tools designed specifically for VCE students to
            maximize study efficiency and exam readiness.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon ai">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="feature-title">AI Tutor Chat</h3>
            <p className="feature-text">
              Get instant answers to your questions. Our AI understands VCE
              curriculum and explains concepts in ways that make sense.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon quiz">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="feature-title">Smart Quizzes</h3>
            <p className="feature-text">
              Practice with AI-generated questions tailored to your level. Get
              instant feedback and detailed explanations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon progress">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-text">
              Visualize your learning journey with detailed analytics. See
              strengths, identify gaps, and celebrate milestones.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon adaptive">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="feature-title">Adaptive Learning</h3>
            <p className="feature-text">
              The more you learn, the smarter it gets. Personalized
              recommendations based on your performance patterns.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon gamification">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <h3 className="feature-title">Earn Rewards</h3>
            <p className="feature-text">
              Stay motivated with XP points, achievement badges, and daily
              streaks. Learning has never been this engaging!
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon content">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="feature-title">VCE Content</h3>
            <p className="feature-text">
              Comprehensive lessons aligned with VCAA study design. From Units
              1-4, we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== SUBJECTS SECTION ==========
function SubjectsSection() {
  return (
    <section className="subjects" id="subjects">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Subjects</span>
          <h2 className="section-title">All Core VCE Subjects</h2>
          <p className="section-subtitle">
            Dive into comprehensive study materials for the most popular VCE
            subjects.
          </p>
        </div>

        <div className="subjects-grid">
          <Link
            href="/practice/english"
            className="subject-preview-card english"
          >
            <div className="subject-preview-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="subject-preview-info">
              <h3>English</h3>
              <p>Text analysis, writing & language</p>
            </div>
            <svg
              className="subject-preview-arrow"
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

          <Link
            href="/practice/math-methods"
            className="subject-preview-card math-methods"
          >
            <div className="subject-preview-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div className="subject-preview-info">
              <h3>Math Methods</h3>
              <p>Calculus, algebra & probability</p>
            </div>
            <svg
              className="subject-preview-arrow"
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

          <Link
            href="/practice/specialist"
            className="subject-preview-card specialist"
          >
            <div className="subject-preview-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="subject-preview-info">
              <h3>Specialist Maths</h3>
              <p>Complex numbers & vectors</p>
            </div>
            <svg
              className="subject-preview-arrow"
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

          <Link
            href="/practice/physics"
            className="subject-preview-card physics"
          >
            <div className="subject-preview-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              </svg>
            </div>
            <div className="subject-preview-info">
              <h3>Physics</h3>
              <p>Motion, forces & energy</p>
            </div>
            <svg
              className="subject-preview-arrow"
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

          <Link
            href="/practice/chemistry"
            className="subject-preview-card chemistry"
          >
            <div className="subject-preview-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 3h6v5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2V3z" />
                <path d="M9 14h6" />
              </svg>
            </div>
            <div className="subject-preview-info">
              <h3>Chemistry</h3>
              <p>Reactions, bonding & organic</p>
            </div>
            <svg
              className="subject-preview-arrow"
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

          <Link
            href="/practice/biology"
            className="subject-preview-card biology"
          >
            <div className="subject-preview-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22c4-2 8-6 8-12V5l-8-3-8 3v5c0 6 4 10 8 12z" />
                <path d="M8 11h8M12 7v8" />
              </svg>
            </div>
            <div className="subject-preview-info">
              <h3>Biology</h3>
              <p>Cells, genetics & evolution</p>
            </div>
            <svg
              className="subject-preview-arrow"
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

// ========== CTA SECTION ==========
function CTASection() {
  return (
    <section className="cta">
      <div className="cta-bg"></div>
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Ace Your VCE?</h2>
          <p className="cta-subtitle">
            Join thousands of Victorian students already using AI to boost their
            study scores.
          </p>
          <Link href="/auth/login" className="btn btn-primary btn-xl hero-cta">
            Start Learning Now
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
            <h4>Features</h4>
            <ul>
              <li>
                <Link href="#">AI Tutor</Link>
              </li>
              <li>
                <Link href="/practice">Practice Quizzes</Link>
              </li>
              <li>
                <Link href="#">Progress Tracking</Link>
              </li>
              <li>
                <Link href="/student">Dashboard</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="#">Study Tips</Link>
              </li>
              <li>
                <Link href="#">Exam Preparation</Link>
              </li>
              <li>
                <Link href="#">VCAA Links</Link>
              </li>
              <li>
                <Link href="#">Help Center</Link>
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

// ========== SCROLL ANIMATIONS ==========
function useScrollAnimations() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = "1";
          (entry.target as HTMLElement).style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    document
      .querySelectorAll(".feature-card, .subject-preview-card, .stat-item")
      .forEach((el, i) => {
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.transform = "translateY(24px)";
        (el as HTMLElement).style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
        observer.observe(el);
      });

    return () => observer.disconnect();
  }, []);
}

// ========== MAIN LANDING PAGE ==========
export default function LandingPage() {
  useScrollAnimations();

  return (
    <div className="grain">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <SubjectsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
