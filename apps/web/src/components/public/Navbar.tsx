'use client'

import Link from 'next/link'
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Button from './Button'

function getDashboardHref(role?: string) {
  if (role === 'admin') return '/admin'
  if (role === 'teacher') return '/teacher/review'
  return '/student'
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dashboardHref = getDashboardHref((session?.user as any)?.role)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle anchor links (starting with #)
    if (!href.startsWith('#')) return

    e.preventDefault()
    const targetId = href.substring(1)

    const scrollToElement = () => {
      const element = document.getElementById(targetId)
      if (element) {
        const navbarHeight = 80 // Approximate fixed navbar height
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        const offsetPosition = elementPosition - navbarHeight

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }

    // If we're not on the home page, navigate there first
    if (pathname !== '/') {
      router.push('/')
      // Wait for navigation and then scroll
      setTimeout(scrollToElement, 100)
    } else {
      scrollToElement()
    }

    // Close mobile menu if open
    setMobileMenuOpen(false)
  }, [pathname, router])

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#subjects', label: 'Subjects' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 backdrop-blur-5xl',
        scrolled ? 'py-3.5 bg-bg-primary/95' : 'py-5 bg-bg-primary/80'
      )}>
        <div className="max-w-[80rem] mx-auto px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary relative overflow-hidden">
              V
            </div>
            <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
              VCE<span className="text-text-muted font-normal"> AI Tutor</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-text-secondary text-[0.9375rem] font-medium hover:text-text-primary transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-accent-teal transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {status === "authenticated" ? (
                <>
                  <Link href={dashboardHref} className="text-text-primary py-2 px-4 hover:text-accent-teal transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Button variant="primary" size="md" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-text-primary py-2 px-4 hover:text-accent-teal transition-colors duration-200">
                    Login
                  </Link>
                  <Button variant="primary" size="md" asChild>
                    <Link href="/auth/register">Start Free Trial</Link>
                  </Button>
                </>
              )}

              <div className="w-[1px] h-6 bg-border-subtle mx-2" />

              <button
                onClick={setTheme.bind(null, theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 bg-bg-tertiary border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:bg-bg-secondary hover:border-accent-teal hover:text-accent-teal transition-all duration-300 relative overflow-hidden"
                aria-label="Toggle theme"
              >
                <Sun className={cn(
                  "w-5 h-5 absolute transition-all duration-500",
                  theme === 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                )} />
                <Moon className={cn(
                  "w-5 h-5 absolute transition-all duration-500",
                  theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                )} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden bg-transparent border-none text-text-primary p-2 z-[1002]"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 transition-transform duration-300" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 w-full max-w-[320px] h-screen bg-bg-secondary z-[1001] flex flex-col border-l border-border-subtle"
            >
              <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] bg-gradient-to-br from-accent-teal to-accent-coral rounded-[10px] flex items-center justify-center font-serif text-[1.25rem] font-normal text-bg-primary">
                    V
                  </div>
                  <span className="text-[1.125rem] font-semibold tracking-[-0.01em] text-text-primary">
                    VCE<span className="text-text-muted font-normal"> AI Tutor</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-transparent border-none text-text-secondary p-2 rounded-lg hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="flex items-center gap-4 p-4 text-text-secondary rounded-xl hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-border-subtle flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl">
                  <span className="text-[0.9375rem] font-medium text-text-secondary">Theme</span>
                  <button
                    onClick={setTheme.bind(null, theme === 'dark' ? 'light' : 'dark')}
                    className="w-11 h-11 bg-bg-tertiary border border-border-subtle rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-secondary hover:border-accent-teal hover:text-accent-teal transition-all duration-300 relative overflow-hidden"
                    aria-label="Toggle theme"
                  >
                    <Sun className={cn(
                      "w-5 h-5 absolute transition-all duration-500",
                      theme === 'dark' ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                    )} />
                    <Moon className={cn(
                      "w-5 h-5 absolute transition-all duration-500",
                      theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                    )} />
                  </button>
                </div>

                {status === "authenticated" ? (
                  <>
                    <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="primary" className="w-full" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Button variant="primary" className="w-full" asChild>
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        Start Free Trial
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

