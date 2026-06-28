"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import type { UserRole } from "@aitutor/shared";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background text-foreground">
      <aside className="hidden md:flex">
        <DashboardSidebar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader role={role} />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}