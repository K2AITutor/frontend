'use client';

import React from 'react';
import type { ReviewSummaryQuestion } from '@/types/review';

function tileStyle(q: ReviewSummaryQuestion) {
    const base =
        'relative rounded-xl border px-3 py-3 text-sm font-semibold transition select-none ' +
        'focus:outline-none focus:ring-2 focus:ring-blue-500';

    if (!q.isSubmitted) return base + ' border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-200';
    return base + ' border-emerald-600/60 bg-slate-900 hover:bg-slate-800 text-emerald-200';
}

export function ReviewQuestionGrid(props: {
    questions: ReviewSummaryQuestion[];
    onJump: (questionId: string) => void;
}) {
    const { questions, onJump } = props;

    return (
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {questions.map((q) => {
                const icon = q.isSubmitted ? '✓' : '—';
                return (
                    <button
                        key={q.questionId}
                        className={tileStyle(q)}
                        onClick={() => onJump(q.questionId)}
                        title={`Question ${q.questionId}`}
                    >
                        <div className="flex items-center justify-between">
                            <span>{q.questionId}</span>
                            <span className="opacity-80">{icon}</span>
                        </div>

                        {q.isFlagged ? (
                            <span className="absolute -top-2 -right-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black">
                                🚩
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
