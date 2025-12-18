export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl font-bold mb-4">VCE AI Tutor</h1>
            <p className="text-slate-300 max-w-xl mb-8">
                Personalised AI-powered practice for VCE Mathematics.
            </p>

            <div className="flex gap-4">
                <a
                    href="/login"
                    className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 transition"
                >
                    Login
                </a>
                <a
                    href="/dashboard"
                    className="px-6 py-3 rounded border border-slate-500 hover:bg-slate-800 transition"
                >
                    Dashboard
                </a>
            </div>
        </main>
    );
}
