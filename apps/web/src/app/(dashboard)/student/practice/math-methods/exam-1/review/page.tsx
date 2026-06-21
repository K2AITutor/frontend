"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loadExamAttempts, summarizeAttempts } from "@/lib/examAttemptStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";

export default function Exam1ReviewPage() {
    const params = useSearchParams();
    const examKey = params.get("examKey") || "VCE_MM_EXAM1_2025";

    const attempts = useMemo(() => loadExamAttempts(examKey), [examKey]);
    const summary = useMemo(() => summarizeAttempts(attempts), [attempts]);

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight">Post-Exam Review</h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        Here’s your examiner-style summary. Use this to decide what to practise next.
                    </p>
                    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-700 dark:text-emerald-300 text-sm">
                        ✅ Review Mode — AI tutor is available again after the exam
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="text-muted-foreground text-sm">Questions attempted</div>
                        <div className="text-2xl font-semibold">{summary.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="text-muted-foreground text-sm">Correct</div>
                        <div className="text-2xl font-semibold">{summary.correct}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="text-muted-foreground text-sm">Score</div>
                        <div className="text-2xl font-semibold">
                            {summary.score} / {summary.maxScore}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Weak skills detected</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Ranked by how often you were incorrect when this skill was flagged.
                    </p>
                </CardHeader>
                <CardContent>
                    {summary.weakSkills.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No skill gaps were recorded yet. (This will improve as more questions have skillCode mapping.)
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {summary.weakSkills.map((s) => (
                                <div key={s.skill} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2">
                                    <div>
                                        <div className="font-semibold">{s.skill}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Incorrect: {s.incorrect} / {s.total}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {(s.weakness * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                        <Button asChild size="sm">
                            <Link href="/student/practice/math-methods/topic">
                                Practise by Topic →
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/student/practice/math-methods/insights">
                                View Weak-Skill Dashboard →
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/student/practice/math-methods/exam-1">
                                Back to Exam 1 Briefing
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Common examiner tags</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        These are common reasons marks were lost.
                    </p>
                </CardHeader>
                <CardContent>
                    {summary.commonTags.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No error tags recorded.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {summary.commonTags.map((t) => (
                                <span key={t.tag} className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground text-xs">
                                    {t.tag} × {t.count}
                                </span>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Attempt log</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Useful for debugging + verifying marking behaviour.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {attempts.map((a, idx) => (
                            <div
                                key={`${a.questionId}-${idx}`}
                                className="rounded-lg border border-border bg-muted/50 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">
                                        Q{a.questionNumber ?? a.questionId}
                                    </div>
                                    <div className={a.correct ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                        {a.correct ? "Correct" : "Incorrect"}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Score: {a.score ?? (a.correct ? a.maxScore ?? 1 : 0)} / {a.maxScore ?? 1}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Skill gaps: {(a.skillGaps ?? []).join(", ") || "—"}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Tags: {(a.errorTags ?? []).join(", ") || "—"}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
