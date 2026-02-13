'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ReviewSummary } from '@/types/review';
import { ReviewQuestionGrid } from '@/components/exam/ReviewQuestionGrid';
import { SubmitExamModal } from '@/components/exam/SubmitExamModal';

export default function ReviewPage() {
    const router = useRouter();
    const params = useParams<{ attemptId: string }>();
    const attemptId = params.attemptId;

    const [data, setData] = React.useState<ReviewSummary | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [submitOpen, setSubmitOpen] = React.useState(false);

    async function load() {
        setError(null);
        const res = await api<ReviewSummary>(`/api/attempts/${attemptId}/review-summary`);
        setData(res);
    }

    React.useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attemptId]);

    const questions = data?.questions ?? [];
    const answered = questions.filter((q) => q.isSubmitted).length;
    const flagged = questions.filter((q) => q.isFlagged).length;
    const unanswered = questions.length - answered;

    const unansweredIds = questions.filter((q) => !q.isSubmitted).map((q) => q.questionId);
    const flaggedIds = questions.filter((q) => q.isFlagged).map((q) => q.questionId);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <h1 className="text-2xl font-semibold">Review answers — Exam 1</h1>
                <p className="mt-1 text-slate-300">
                    Check unanswered and flagged questions before submitting. Marks are hidden until submission.
                </p>

                <div className="mt-4 rounded-2xl border border-emerald-700/30 bg-emerald-900/20 px-4 py-3 text-emerald-200">
                    ✅ Review Mode — you can still return to questions. AI tutor remains disabled until the exam is submitted.
                </div>

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-700 bg-red-950/40 p-3 text-red-200">
                        {error}
                    </div>
                ) : null}

                {/* Summary cards */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="text-slate-300">Answered (Submitted)</div>
                        <div className="mt-2 text-3xl font-semibold">{answered}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="text-slate-300">Unanswered</div>
                        <div className="mt-2 text-3xl font-semibold">{unanswered}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="text-slate-300">Flagged</div>
                        <div className="mt-2 text-3xl font-semibold">{flagged}</div>
                    </div>
                </div>

                <div className="mt-2 text-sm text-slate-400">
                    Only <span className="text-slate-200">submitted</span> answers count as answered.
                </div>

                {/* Grid */}
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                    <div className="mb-3 text-lg font-semibold">Questions</div>
                    <ReviewQuestionGrid
                        questions={questions}
                        onJump={(qid) => {
                            // Adjust this route to your exam question page route.
                            router.push(`/exam/${attemptId}?q=${encodeURIComponent(qid)}`);
                        }}
                    />
                </div>

                {/* Needs attention */}
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                    <div className="text-lg font-semibold">Needs attention</div>

                    <div className="mt-3 text-slate-300">
                        <div>
                            <span className="text-slate-400">Unanswered ({unansweredIds.length}): </span>
                            {unansweredIds.length ? (
                                unansweredIds.map((id) => (
                                    <button
                                        key={id}
                                        className="mr-2 underline text-slate-200 hover:text-white"
                                        onClick={() => router.push(`/exam/${attemptId}?q=${encodeURIComponent(id)}`)}
                                    >
                                        {id}
                                    </button>
                                ))
                            ) : (
                                <span className="text-emerald-300">None</span>
                            )}
                        </div>

                        <div className="mt-2">
                            <span className="text-slate-400">Flagged ({flaggedIds.length}): </span>
                            {flaggedIds.length ? (
                                flaggedIds.map((id) => (
                                    <button
                                        key={id}
                                        className="mr-2 underline text-slate-200 hover:text-white"
                                        onClick={() => router.push(`/exam/${attemptId}?q=${encodeURIComponent(id)}`)}
                                    >
                                        {id}
                                    </button>
                                ))
                            ) : (
                                <span className="text-emerald-300">None</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 hover:bg-slate-700"
                        onClick={() => router.push(`/exam/${attemptId}`)}
                    >
                        Return to Questions
                    </button>

                    <div className="flex gap-3">
                        <button
                            className="rounded-xl bg-slate-800 px-4 py-2 hover:bg-slate-700"
                            onClick={async () => {
                                try {
                                    await api(`/api/attempts/${attemptId}/continue`, { method: 'POST' });
                                    router.push(`/exam/${attemptId}`);
                                } catch (e: any) {
                                    setError(e?.message ?? 'Failed to continue exam');
                                }
                            }}
                        >
                            Continue Exam
                        </button>

                        <button
                            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
                            onClick={() => setSubmitOpen(true)}
                        >
                            Submit Exam
                        </button>
                    </div>
                </div>
            </div>

            <SubmitExamModal
                open={submitOpen}
                unansweredIds={unansweredIds}
                onClose={() => setSubmitOpen(false)}
                onConfirm={async () => {
                    await api(`/api/attempts/${attemptId}/submit`, { method: 'POST' });
                    // After submission, route to your existing Post-Exam Review page
                    router.push(`/exam/${attemptId}/post-review`);
                }}
            />
        </div>
    );
}
