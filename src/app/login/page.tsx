export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-sm bg-slate-900 p-8 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 px-4 py-2 rounded bg-slate-800 border border-slate-700"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 px-4 py-2 rounded bg-slate-800 border border-slate-700"
                />

                <button className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500">
                    Sign in
                </button>
            </div>
        </main>
    );
}
