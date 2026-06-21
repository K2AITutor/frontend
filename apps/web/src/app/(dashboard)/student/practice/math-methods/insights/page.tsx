"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadExamAttempts, summarizeAttempts } from "@/lib/examAttemptStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";

export default function MathMethodsInsightsPage() {
    const [examKey, setExamKey] = useState("VCE_MM_EXAM1_2025");

    const attempts = useMemo(() => loadExamAttempts(examKey), [examKey]);
    const summary = useMemo(() => summarizeAttempts(attempts), [attempts]);

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight">Weak-Skill Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        This dashboard aggregates your skill gaps and common marking issues.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <label className="text-sm text-muted-foreground">Exam set:</label>
                        <select
                            value={examKey}
                            onChange={(e) => setExamKey(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="VCE_MM_EXAM1_2025">Exam 1 (2025)</option>
                            {/* later: populate dynamically from /api/exams */}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="text-muted-foreground text-sm">Attempts</div>
                        <div className="text-2xl font-semibold">{summary.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <div className="text-muted-foreground text-sm">Accuracy</div>
                        <div className="text-2xl font-semibold">
                            {summary.total ? ((summary.correct / summary.total) * 100).toFixed(0) : "0"}%
                        </div>
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

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Top weak skills</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Where you’re losing marks most often.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {summary.weakSkills.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                No skill gaps recorded yet. Add skillCode mapping to more exam questions to activate this.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {summary.weakSkills.map((s) => (
                                    <div key={s.skill} className="rounded-lg border border-border bg-muted/50 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">{s.skill}</div>
                                            <div className="text-muted-foreground text-sm">
                                                {(s.weakness * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Incorrect: {s.incorrect} / {s.total}
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button asChild size="sm">
                                                <Link href="/student/practice/math-methods/topic">
                                                    Practise this →
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Common marking issues</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            These are the tags that appear most in your incorrect answers.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {summary.commonTags.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No error tags recorded.</p>
                        ) : (
                            <div className="space-y-2">
                                {summary.commonTags.map((t) => (
                                    <div
                                        key={t.tag}
                                        className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2"
                                    >
                                        <div className="font-mono text-xs">{t.tag}</div>
                                        <div className="text-muted-foreground text-sm">{t.count}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                    <Link href="/student/practice/math-methods">
                        Back to Methods Hub
                    </Link>
                </Button>
                <Button asChild variant="destructive" size="sm">
                    <Link href="/student/practice/math-methods/exam-1">
                        Sit Exam 1 Again →
                    </Link>
                </Button>
            </div>
        </div>
    );
}
