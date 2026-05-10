'use client';

import React from 'react';

export function SubmitExamModal(props: {
    open: boolean;
    unansweredIds: string[];
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const { open, unansweredIds, onClose, onConfirm } = props;
    const [busy, setBusy] = React.useState(false);

    if (!open) return null;

    const hasUnanswered = unansweredIds.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-6 shadow-xl border border-slate-700">
                <h2 className="text-xl font-semibold">Submit Exam?</h2>

                <div className="mt-3 text-slate-300">
                    {hasUnanswered ? (
                        <>
                            <p className="text-yellow-300">
                                You have {unansweredIds.length} unanswered questions: {unansweredIds.join(', ')}.
                            </p>
                            <p className="mt-2">You won’t be able to change answers after submitting.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-emerald-300">All questions are submitted.</p>
                            <p className="mt-2">You won’t be able to change answers after submitting.</p>
                        </>
                    )}
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        className="rounded-xl px-4 py-2 bg-slate-800 hover:bg-slate-700"
                        onClick={onClose}
                        disabled={busy}
                    >
                        Go back
                    </button>

                    <button
                        className="rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                        onClick={async () => {
                            try {
                                setBusy(true);
                                await onConfirm();
                            } finally {
                                setBusy(false);
                            }
                        }}
                        disabled={busy}
                    >
                        {busy ? 'Submitting…' : hasUnanswered ? 'Submit anyway' : 'Submit Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
}
