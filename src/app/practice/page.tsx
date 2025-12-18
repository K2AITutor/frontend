import AppLayout from "@/components/AppLayout";

export default function PracticePage() {
    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-6">VCE Practice</h1>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 space-y-6">
                <select className="w-full p-3 bg-black/30 rounded border border-white/10">
                    <option>-- Choose a Topic --</option>
                    <option>Quadratics</option>
                    <option>Linear Equations</option>
                    <option>Probability</option>
                    <option>Geometry</option>
                </select>

                <input
                    placeholder="Your answer"
                    className="w-full p-3 bg-black/30 rounded border border-white/10"
                />

                <button className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-500">
                    Submit Answer
                </button>

                {/* Result */}
                <div className="bg-black/30 p-4 rounded text-red-400">
                    <p className="font-semibold">Incorrect</p>
                    <p className="text-slate-300">
                        Correct answer: <b>1/6</b>
                    </p>
                    <p className="text-slate-400 text-sm">
                        Explanation: 6 outcomes → P = 1/6
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
