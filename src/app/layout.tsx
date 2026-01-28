import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "VCE AI Tutor - AI-Powered Learning for VCE Students",
    template: "%s | VCE AI Tutor",
  },
  description:
    "Master your VCE with AI-powered tutoring. Get instant explanations, practice with adaptive quizzes, and track your progress across all VCE subjects.",
  keywords: [
    "VCE",
    "AI tutor",
    "Victorian Certificate of Education",
    "study",
    "learning",
    "education",
    "Australia",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen antialiased", inter.className, inter.variable)}>
        {children}
      </body>
    </html>
  );
}
