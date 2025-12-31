"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:4000/auth/forgot-password", {
        email,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      // Don't reveal if email exists or not for security
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel - Branding */}
      <div className="auth-brand-panel">
        <div className="auth-brand-bg"></div>
        <div className="auth-brand-grid"></div>
        <div className="auth-brand-orb auth-brand-orb-1"></div>
        <div className="auth-brand-orb auth-brand-orb-2"></div>

        <div className="auth-brand-content">
          <Link href="/" className="auth-logo">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
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

          <div className="auth-brand-text">
            <h1>Forgot your password?</h1>
            <p>
              No worries! It happens to the best of us. Enter your email and
              we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Check your inbox for reset link</span>
            </div>
            <div className="auth-brand-feature">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Link expires in 1 hour</span>
            </div>
            <div className="auth-brand-feature">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Create a new secure password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {!isSubmitted ? (
            <>
              <div className="auth-form-header">
                <div className="auth-icon-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2>Reset your password</h2>
                <p>
                  Enter the email address associated with your account and
                  we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
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

              <div className="auth-back-link">
                <Link href="/auth/login" className="back-to-login">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            </>
          ) : (
            <div className="auth-success-state">
              <div className="success-icon-large">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h2>Check your email</h2>
              <p>
                We&apos;ve sent a password reset link to{" "}
                <strong>{email}</strong>
              </p>
              <p className="email-note">
                Didn&apos;t receive the email? Check your spam folder or make
                sure you entered the correct email address.
              </p>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Try another email
                </button>
                <Link href="/auth/login" className="btn btn-primary btn-lg">
                  Back to sign in
                </Link>
              </div>

              <p className="resend-text">
                Still no email?{" "}
                <button
                  type="button"
                  className="resend-btn"
                  onClick={() => {
                    setIsSubmitted(false);
                  }}
                >
                  Resend reset link
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
