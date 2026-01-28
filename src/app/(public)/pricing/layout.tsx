import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the perfect plan for your VCE learning journey. Free, Pro, and Premium plans available with AI-powered tutoring.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
