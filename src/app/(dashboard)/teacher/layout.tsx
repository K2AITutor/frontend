import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="teacher">{children}</DashboardLayout>;
}
