"use client";

export default function RecommendedTopics() {
    return (
        <div className="rounded-xl bg-slate-900 p-6">
            <h2 className="text-lg font-semibold mb-4">Recommended Topics</h2>

            <ul className="space-y-3 text-sm">
                <li className="text-orange-400">Quadratic Equations – Review</li>
                <li className="text-yellow-400">Kinematics – Practice needed</li>
                <li className="text-green-400">Organic Chemistry – Good progress</li>
            </ul>
        </div>
    );
}
