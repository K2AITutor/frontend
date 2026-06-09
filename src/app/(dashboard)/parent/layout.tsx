import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="parent">{children}</DashboardLayout>;
}
