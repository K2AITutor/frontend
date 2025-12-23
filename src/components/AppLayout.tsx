// frontend/src/components/AppLayout.tsx

"use client";

import Link from "next/link";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-transparent">
            {/* Sidebar */}
            <aside className="w-64 p-6 border-r border-slate-800 hidden md:block">
                <h2 className="text-xl font-bold mb-6">VCE AI Tutor</h2>
                <nav className="space-y-3 text-slate-300">
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/practice">Practice</Link>
                    <Link href="/chat">AI Chat Tutor</Link>
                    <Link href="/content">Content</Link>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 px-6">{children}</main>
        </div>
    );
}
