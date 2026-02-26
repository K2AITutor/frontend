// frontend/src/components/AppLayout.tsx

"use client";

import DashboardShell from "./layout/DashboardShell";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardShell>{children}</DashboardShell>;
}
