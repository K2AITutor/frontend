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
            <Link href="/pricing" className="nav-link">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="nav-link active">
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

// ========== CONTACT HERO ==========
function ContactHero() {
  return (
    <section className="page-hero">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>

      <div className="container">
        <div className="page-hero-content">
          <span className="section-eyebrow">Contact</span>
          <h1 className="page-hero-title">
            Get in <span className="hero-title-accent">Touch</span>
          </h1>
          <p className="page-hero-subtitle">
            Have a question or need help? We&apos;re here for you. Reach out and
            we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </section>
  );
}

// ========== CONTACT INFO CARDS ==========
function ContactInfoCards() {
  const contactMethods = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: "Email Us",
      description: "For general inquiries and support",
      contact: "support@vceaitutor.com",
      href: "mailto:support@vceaitutor.com",
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 9am - 6pm AEST",
      href: "#",
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
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: "Phone",
      description: "Speak with our team directly",
      contact: "+61 3 9000 0000",
      href: "tel:+61390000000",
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
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: "Office",
      description: "Visit us in Melbourne",
      contact: "Melbourne, VIC 3000",
      href: "#",
      color: "amber",
    },
  ];

  return (
    <section className="contact-info-section">
      <div className="container">
        <div className="contact-info-grid">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.href}
              className={`contact-info-card ${method.color}`}
            >
              <div className="contact-info-icon">{method.icon}</div>
              <h3 className="contact-info-title">{method.title}</h3>
              <p className="contact-info-description">{method.description}</p>
              <span className="contact-info-value">{method.contact}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== CONTACT FORM SECTION ==========
function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="contact-form-section">
      <div className="container">
        <div className="contact-form-wrapper">
          <div className="contact-form-info">
            <span className="section-eyebrow">Send a Message</span>
            <h2 className="section-title">We&apos;d Love to Hear From You</h2>
            <p className="contact-form-description">
              Whether you have a question about features, pricing, need a demo,
              or anything else, our team is ready to answer all your questions.
            </p>

            <div className="contact-benefits">
              <div className="contact-benefit">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Response within 24 hours</span>
              </div>
              <div className="contact-benefit">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Dedicated support team</span>
              </div>
              <div className="contact-benefit">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Free consultation available</span>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            {submitted ? (
              <div className="form-success">
                <div className="success-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Message Sent!</h3>
                <p>
                  Thank you for reaching out. We&apos;ll get back to you within
                  24 hours.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="schools">Schools & Institutions</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== ADDITIONAL HELP SECTION ==========
function AdditionalHelpSection() {
  const helpOptions = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      title: "Help Center",
      description:
        "Browse our comprehensive knowledge base for tutorials, FAQs, and troubleshooting guides.",
      link: "#",
      linkText: "Visit Help Center",
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
      title: "Community Forum",
      description:
        "Connect with other VCE students, share tips, and get advice from the community.",
      link: "#",
      linkText: "Join Community",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: "Request a Demo",
      description:
        "See VCE AI Tutor in action with a personalized demo from our team.",
      link: "#",
      linkText: "Book Demo",
    },
  ];

  return (
    <section className="additional-help-section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">More Ways to Connect</span>
          <h2 className="section-title">Additional Resources</h2>
          <p className="section-subtitle">
            Explore more ways to get the help and information you need.
          </p>
        </div>

        <div className="help-options-grid">
          {helpOptions.map((option, index) => (
            <div key={index} className="help-option-card">
              <div className="help-option-icon">{option.icon}</div>
              <h3 className="help-option-title">{option.title}</h3>
              <p className="help-option-description">{option.description}</p>
              <a href={option.link} className="help-option-link">
                {option.linkText}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
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

// ========== MAIN CONTACT PAGE ==========
export default function ContactPage() {
  return (
    <div className="grain">
      <Navbar />
      <ContactHero />
      <ContactInfoCards />
      <ContactFormSection />
      <AdditionalHelpSection />
      <Footer />
    </div>
  );
}
