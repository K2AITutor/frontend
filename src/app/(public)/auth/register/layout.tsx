import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join thousands of VCE students using AI-powered tutoring. Create your free account today.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
