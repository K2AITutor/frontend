"use client";

import { useMemo, useState } from "react";
import { loadExamAttempts, summarizeAttempts } from "@/lib/examAttemptStore";

export default function MathMethodsInsightsPage() {
    const [examKey, setExamKey] = useState("VCE_MM_EXAM1_2025");

    const attempts = useMemo(() => loadExamAttempts(examKey), [examKey]);
    const summary = useMemo(() => summarizeAttempts(attempts), [attempts]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6 text-slate-200">
            <div className="glass p-6">
                <h1 className="text-2xl font-semibold">Weak-Skill Dashboard</h1>
                <p className="text-slate-300 text-sm mt-1">
                    This dashboard aggregates your skill gaps and common marking issues.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <label className="text-sm text-slate-300">Exam set:</label>
                    <select
                        value={examKey}
                        onChange={(e) => setExamKey(e.target.value)}
                        className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="VCE_MM_EXAM1_2025">Exam 1 (2025)</option>
                        {/* later: populate dynamically from /api/exams */}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="glass p-5">
                    <div className="text-slate-400 text-sm">Attempts</div>
                    <div className="text-2xl font-semibold">{summary.total}</div>
                </div>
                <div className="glass p-5">
                    <div className="text-slate-400 text-sm">Accuracy</div>
                    <div className="text-2xl font-semibold">
                        {summary.total ? ((summary.correct / summary.total) * 100).toFixed(0) : "0"}%
                    </div>
                </div>
                <div className="glass p-5">
                    <div className="text-slate-400 text-sm">Score</div>
                    <div className="text-2xl font-semibold">
                        {summary.score} / {summary.maxScore}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-6">
                    <h2 className="text-lg font-semibold mb-2">Top weak skills</h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Where you’re losing marks most often.
                    </p>

                    {summary.weakSkills.length === 0 ? (
                        <p className="text-slate-300 text-sm">
                            No skill gaps recorded yet. Add skillCode mapping to more exam questions to activate this.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {summary.weakSkills.map((s) => (
                                <div key={s.skill} className="bg-slate-900/40 border border-slate-700 rounded-lg px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold">{s.skill}</div>
                                        <div className="text-slate-300 text-sm">
                                            {(s.weakness * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Incorrect: {s.incorrect} / {s.total}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <a
                                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
                                            href="/student/practice/math-methods/topic"
                                        >
                                            Practise this →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass p-6">
                    <h2 className="text-lg font-semibold mb-2">Common marking issues</h2>
                    <p className="text-slate-400 text-sm mb-4">
                        These are the tags that appear most in your incorrect answers.
                    </p>

                    {summary.commonTags.length === 0 ? (
                        <p className="text-slate-300 text-sm">No error tags recorded.</p>
                    ) : (
                        <div className="space-y-2">
                            {summary.commonTags.map((t) => (
                                <div
                                    key={t.tag}
                                    className="flex items-center justify-between bg-slate-900/40 border border-slate-700 rounded-lg px-4 py-2"
                                >
                                    <div className="font-mono text-xs text-slate-200">{t.tag}</div>
                                    <div className="text-slate-300 text-sm">{t.count}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <a
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                    href="/student/practice/math-methods"
                >
                    Back to Methods Hub
                </a>
                <a
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold"
                    href="/student/practice/math-methods/exam-1"
                >
                    Sit Exam 1 Again →
                </a>
            </div>
        </div>
    );
}
