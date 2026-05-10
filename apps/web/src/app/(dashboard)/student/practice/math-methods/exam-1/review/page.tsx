"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { loadExamAttempts, summarizeAttempts } from "@/lib/examAttemptStore";

export default function Exam1ReviewPage() {
    const params = useSearchParams();
    const examKey = params.get("examKey") || "VCE_MM_EXAM1_2025";

    const attempts = useMemo(() => loadExamAttempts(examKey), [examKey]);
    const summary = useMemo(() => summarizeAttempts(attempts), [attempts]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6 text-slate-200">
            <div className="glass p-6">
                <h1 className="text-2xl font-semibold">Post-Exam Review</h1>
                <p className="text-slate-300 text-sm mt-1">
                    Here’s your examiner-style summary. Use this to decide what to practise next.
                </p>
                <div className="mt-3 px-4 py-2 rounded-lg bg-emerald-900/30 text-emerald-200 text-sm">
                    ✅ Review Mode — AI tutor is available again after the exam
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="glass p-5">
                    <div className="text-slate-400 text-sm">Questions attempted</div>
                    <div className="text-2xl font-semibold">{summary.total}</div>
                </div>
                <div className="glass p-5">
                    <div className="text-slate-400 text-sm">Correct</div>
                    <div className="text-2xl font-semibold">{summary.correct}</div>
                </div>
                <div className="glass p-5">
                    <div className="text-slate-400 text-sm">Score</div>
                    <div className="text-2xl font-semibold">
                        {summary.score} / {summary.maxScore}
                    </div>
                </div>
            </div>

            <div className="glass p-6">
                <h2 className="text-lg font-semibold mb-2">Weak skills detected</h2>
                <p className="text-slate-400 text-sm mb-4">
                    Ranked by how often you were incorrect when this skill was flagged.
                </p>

                {summary.weakSkills.length === 0 ? (
                    <p className="text-slate-300 text-sm">
                        No skill gaps were recorded yet. (This will improve as more questions have skillCode mapping.)
                    </p>
                ) : (
                    <div className="space-y-2">
                        {summary.weakSkills.map((s) => (
                            <div key={s.skill} className="flex items-center justify-between bg-slate-900/40 border border-slate-700 rounded-lg px-4 py-2">
                                <div>
                                    <div className="font-semibold">{s.skill}</div>
                                    <div className="text-xs text-slate-400">
                                        Incorrect: {s.incorrect} / {s.total}
                                    </div>
                                </div>
                                <div className="text-sm text-slate-300">
                                    {(s.weakness * 100).toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                    <a
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold"
                        href="/student/practice/math-methods/topic"
                    >
                        Practise by Topic →
                    </a>
                    <a
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                        href="/student/practice/math-methods/insights"
                    >
                        View Weak-Skill Dashboard →
                    </a>
                    <a
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
                        href="/student/practice/math-methods/exam-1"
                    >
                        Back to Exam 1 Briefing
                    </a>
                </div>
            </div>

            <div className="glass p-6">
                <h2 className="text-lg font-semibold mb-2">Common examiner tags</h2>
                <p className="text-slate-400 text-sm mb-4">
                    These are common reasons marks were lost.
                </p>

                {summary.commonTags.length === 0 ? (
                    <p className="text-slate-300 text-sm">No error tags recorded.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {summary.commonTags.map((t) => (
                            <span key={t.tag} className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-xs">
                                {t.tag} × {t.count}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="glass p-6">
                <h2 className="text-lg font-semibold mb-2">Attempt log</h2>
                <p className="text-slate-400 text-sm mb-4">
                    Useful for debugging + verifying marking behaviour.
                </p>

                <div className="space-y-2">
                    {attempts.map((a, idx) => (
                        <div
                            key={`${a.questionId}-${idx}`}
                            className="bg-slate-900/40 border border-slate-700 rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-semibold">
                                    Q{a.questionNumber ?? a.questionId}
                                </div>
                                <div className={a.correct ? "text-green-400" : "text-red-400"}>
                                    {a.correct ? "Correct" : "Incorrect"}
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Score: {a.score ?? (a.correct ? a.maxScore ?? 1 : 0)} / {a.maxScore ?? 1}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Skill gaps: {(a.skillGaps ?? []).join(", ") || "—"}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Tags: {(a.errorTags ?? []).join(", ") || "—"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
