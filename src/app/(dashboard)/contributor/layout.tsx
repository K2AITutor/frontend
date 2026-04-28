import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { authOptions } from "@/lib/authOptions";

export default async function ContributorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const role = (session.user as any)?.role;

    if (!["contributor", "teacher", "admin"].includes(String(role))) {
        redirect("/student");
    }

    return <DashboardLayout role="contributor">{children}</DashboardLayout>;
}