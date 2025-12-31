export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-4">VCE AI Tutor</h1>

      <p className="text-slate-300 max-w-xl mb-8">
        Personalised AI-powered practice for VCE Mathematics.
      </p>

      <div className="flex gap-4">
        <a
          href="/auth/login"
          className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 transition"
        >
          Login
        </a>
        <a
          href="/practice"
          className="px-6 py-3 rounded border border-slate-500 hover:bg-slate-800 transition"
        >
          Practice
        </a>
      </div>
    </main>
  );
}
