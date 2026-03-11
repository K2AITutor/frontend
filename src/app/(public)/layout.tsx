import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VCE AI Tutor | Master Your Victorian Certificate of Education",
  description: "AI-powered tutoring for VCE students. Personalized learning paths, practice exams, and 24/7 support for all VCE subjects.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
