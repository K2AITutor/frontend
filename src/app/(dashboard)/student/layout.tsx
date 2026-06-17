import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { authOptions } from "@/lib/authOptions";
import { homeForRole, normalizeRole } from "@/lib/roleRouting";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const role = normalizeRole((session.user as any)?.role);

  if (role !== "student") {
    redirect(homeForRole(role, "/auth/login"));
  }

  return <DashboardLayout role="student">{children}</DashboardLayout>;
}
