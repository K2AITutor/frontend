"use client";

export default function DashboardStats() {
    return (
        <div className="rounded-xl bg-slate-900 p-6">
            <h2 className="text-lg font-semibold mb-4">Overall Mastery</h2>

            <div className="space-y-3">
                <Progress label="Mathematics" value={72} />
                <Progress label="Physics" value={58} />
                <Progress label="Chemistry" value={45} />
            </div>
        </div>
    );
}

function Progress({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded">
                <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
