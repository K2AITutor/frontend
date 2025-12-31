import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Reset your VCE AI Tutor password. We'll send you a link to create a new password.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
