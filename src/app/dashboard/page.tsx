export default function DashboardPage() {
    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-6 rounded">
                    <h3 className="font-semibold mb-2">Practice</h3>
                    <p className="text-slate-400 text-sm">
                        Topic-based VCE exam practice.
                    </p>
                </div>

                <div className="bg-slate-900 p-6 rounded">
                    <h3 className="font-semibold mb-2">AI Tutor</h3>
                    <p className="text-slate-400 text-sm">
                        Step-by-step explanations.
                    </p>
                </div>

                <div className="bg-slate-900 p-6 rounded">
                    <h3 className="font-semibold mb-2">Progress</h3>
                    <p className="text-slate-400 text-sm">
                        Track mastery & weak areas.
                    </p>
                </div>
            </div>
        </main>
    );
}
