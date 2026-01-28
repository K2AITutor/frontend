"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
            <Link href="/pricing" className="nav-link">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link active">
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

// ========== ABOUT HERO ==========
function AboutHero() {
  return (
    <section className="page-hero">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>

      <div className="container">
        <div className="page-hero-content">
          <span className="section-eyebrow">About Us</span>
          <h1 className="page-hero-title">
            Empowering VCE Students with{" "}
            <span className="hero-title-accent">AI</span>
          </h1>
          <p className="page-hero-subtitle">
            We&apos;re on a mission to make quality education accessible to
            every Victorian student through the power of artificial
            intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== MISSION SECTION ==========
function MissionSection() {
  return (
    <section className="mission-section">
      <div className="container">
        <div className="mission-grid">
          <div className="mission-content">
            <span className="section-eyebrow">Our Mission</span>
            <h2 className="section-title">
              Making VCE Success Achievable for Everyone
            </h2>
            <p className="mission-text">
              We believe every student deserves access to personalized,
              high-quality tutoring. Traditional tutoring can be expensive and
              inaccessible for many families. That&apos;s why we built VCE AI
              Tutor—a 24/7 intelligent learning companion that adapts to each
              student&apos;s unique needs.
            </p>
            <p className="mission-text">
              Our AI understands the VCE curriculum inside and out. It can
              explain complex concepts in multiple ways until they click,
              generate practice questions tailored to your level, and track your
              progress to ensure you&apos;re always improving.
            </p>
          </div>
          <div className="mission-stats">
            <div className="mission-stat-card">
              <div className="mission-stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="mission-stat-value">50,000+</div>
              <div className="mission-stat-label">Students Helped</div>
            </div>
            <div className="mission-stat-card">
              <div className="mission-stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="mission-stat-value">2M+</div>
              <div className="mission-stat-label">Questions Answered</div>
            </div>
            <div className="mission-stat-card">
              <div className="mission-stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="mission-stat-value">4.9/5</div>
              <div className="mission-stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== VALUES SECTION ==========
function ValuesSection() {
  const values = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Student First",
      description:
        "Every decision we make prioritizes student success. We're committed to helping you achieve your best possible ATAR.",
      color: "blue",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      title: "Transparency",
      description:
        "No hidden fees, no surprises. We're upfront about what we offer and how our AI works to help you learn.",
      color: "purple",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
      title: "Always Improving",
      description:
        "We constantly update our AI with the latest VCE curriculum changes and learning science research.",
      color: "green",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Inclusive",
      description:
        "Education should be accessible to all. We offer free plans and affordable pricing for every family.",
      color: "amber",
    },
  ];

  return (
    <section className="values-section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Our Values</span>
          <h2 className="section-title">What Drives Us</h2>
          <p className="section-subtitle">
            The principles that guide everything we do at VCE AI Tutor.
          </p>
        </div>

        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className={`value-card ${value.color}`}>
              <div className="value-icon">{value.icon}</div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== TEAM SECTION ==========
function TeamSection() {
  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former VCE teacher with 15 years of experience. PhD in Educational Technology from University of Melbourne.",
      avatar: "SC",
    },
    {
      name: "James Wilson",
      role: "CTO & Co-Founder",
      bio: "AI researcher and software engineer. Previously led ML teams at Google and Atlassian.",
      avatar: "JW",
    },
    {
      name: "Dr. Emily Nguyen",
      role: "Head of Curriculum",
      bio: "VCAA examiner and curriculum specialist. Ensuring our content meets the highest educational standards.",
      avatar: "EN",
    },
    {
      name: "Michael Park",
      role: "Head of Product",
      bio: "EdTech product leader passionate about creating delightful learning experiences.",
      avatar: "MP",
    },
  ];

  return (
    <section className="team-section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Our Team</span>
          <h2 className="section-title">Meet the People Behind VCE AI Tutor</h2>
          <p className="section-subtitle">
            A passionate team of educators, engineers, and designers committed
            to transforming VCE education.
          </p>
        </div>

        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-avatar">{member.avatar}</div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== STORY SECTION ==========
function StorySection() {
  return (
    <section className="story-section">
      <div className="container">
        <div className="story-content">
          <span className="section-eyebrow">Our Story</span>
          <h2 className="section-title">From Classroom to Cloud</h2>
          <div className="story-text">
            <p>
              VCE AI Tutor was born from a simple observation: too many talented
              students were falling behind not because they lacked ability, but
              because they lacked access to quality support.
            </p>
            <p>
              Our co-founder, Dr. Sarah Chen, spent 15 years teaching VCE
              subjects across Melbourne. She saw firsthand how students with
              private tutors consistently outperformed their peers—not because
              they were smarter, but because they had someone to answer their
              questions anytime, anywhere.
            </p>
            <p>
              In 2023, Sarah partnered with James Wilson, an AI researcher, to
              build something revolutionary: an AI tutor that could provide the
              same personalized, on-demand support that only wealthy families
              could previously afford.
            </p>
            <p>
              Today, VCE AI Tutor helps over 50,000 Victorian students every
              month. We&apos;re proud to be leveling the playing field, one
              question at a time.
            </p>
          </div>
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
          <h2 className="cta-title">Join Our Mission</h2>
          <p className="cta-subtitle">
            Experience the future of VCE learning. Start your free trial today.
          </p>
          <div className="cta-buttons">
            <Link
              href="/auth/register"
              className="btn btn-primary btn-xl hero-cta"
            >
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
            <Link href="/contact" className="btn btn-secondary btn-xl">
              Contact Us
            </Link>
          </div>
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
      .querySelectorAll(".value-card, .team-card, .mission-stat-card")
      .forEach((el, i) => {
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.transform = "translateY(24px)";
        (el as HTMLElement).style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
        observer.observe(el);
      });

    return () => observer.disconnect();
  }, []);
}

// ========== MAIN ABOUT PAGE ==========
export default function AboutPage() {
  useScrollAnimations();

  return (
    <div className="grain">
      <Navbar />
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <StorySection />
      <TeamSection />
      <CTASection />
      <Footer />
    </div>
  );
}
