"use client";

import React from "react";

type WeaknessItem = {
    topicCode: string;
    topicName: string;
    accuracy: number | null; // null = not started
};

type Props = {
    data: WeaknessItem[];
};

function getStatus(accuracy: number | null) {
    if (accuracy === null) {
        return { label: "Not started", color: "text-slate-400" };
    }

    if (accuracy >= 80) {
        return { label: "Strong", color: "text-green-400" };
    }

    if (accuracy >= 50) {
        return { label: "Needs work", color: "text-yellow-400" };
    }

    return { label: "Weak", color: "text-red-400" };
}

export default function WeaknessSummary({ data }: Props) {
    const [open, setOpen] = React.useState(true);

    return (
        <div className="glass p-4">
            <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => setOpen(!open)}
            >
                <h3 className="font-semibold text-slate-200">
                    Weakness Summary
                </h3>
                <span className="text-sm text-slate-400">
                    {open ? "▲" : "▼"}
                </span>
            </button>

            {open && (
                <div className="mt-4 space-y-2">
                    {data.map((item) => {
                        const status = getStatus(item.accuracy);

                        return (
                            <div
                                key={item.topicCode}
                                className="flex justify-between items-center text-sm"
                            >
                                <span className="text-slate-300">
                                    {item.topicName}
                                </span>

                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400">
                                        {item.accuracy === null
                                            ? "—"
                                            : `${item.accuracy}%`}
                                    </span>
                                    <span className={status.color}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
