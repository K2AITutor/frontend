import Link from 'next/link'
// Icons imported for future use
// import { Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    product: [
      { href: '/#features', label: 'Features' },
      { href: '/#subjects', label: 'Subjects' },
      { href: '/#how-it-works', label: 'How It Works' },
      { href: '/pricing', label: 'Pricing' },
    ],
    support: [
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact Us' },
    ],
  }

  return (
    <footer className="py-16 border-t border-border-subtle">
      <div className="max-w-[80rem] mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary">
                V
              </div>
              <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
                VCE<span className="text-text-muted font-normal"> AI Tutor</span>
              </span>
            </Link>
            <p className="text-text-secondary text-[0.9375rem] mt-4 max-w-[300px]">
              Your personal AI tutor for VCE excellence. Master any subject with intelligent, adaptive learning.
            </p>
          </div>
          <div className="hidden md:block"></div>
          <div>
            <h4 className="text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-text-muted mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary text-[0.9375rem] hover:text-accent-teal transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-text-muted mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary text-[0.9375rem] hover:text-accent-teal transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border-subtle text-[0.875rem] text-text-muted text-center">
          <div>© 2025 VCE AI Tutor. All rights reserved.</div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-text-muted hover:text-text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-text-muted hover:text-text-primary transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
