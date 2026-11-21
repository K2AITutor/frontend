import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { homeForRole, normalizeRole, routeAccessMap } from "@/lib/roleRouting";

// Server-side guard for /tools/* (second layer behind middleware.ts).
export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const role = normalizeRole((session.user as any)?.role);

  if (!routeAccessMap.tools.includes(role)) {
    redirect(homeForRole(role, "/auth/login"));
  }

  return <>{children}</>;
}
