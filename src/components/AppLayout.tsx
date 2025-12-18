import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black/40 backdrop-blur-xl p-6 space-y-6">
                <h1 className="text-xl font-bold">VCE AI Tutor</h1>
                <nav className="space-y-3 text-slate-300">
                    <Link href="/dashboard" className="block hover:text-white">Dashboard</Link>
                    <Link href="/practice" className="block hover:text-white">Practice</Link>
                    <Link href="/chat" className="block hover:text-white">AI Chat Tutor</Link>
                    <Link href="/content" className="block hover:text-white">Content</Link>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 p-10">{children}</main>
        </div>
    );
}
