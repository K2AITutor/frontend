/*Purpose/content: keeps the main Math Methods practice page in the same polished student-portal style.*/
'use client';

import Link from 'next/link';

export default function MathMethodsPracticeHub() {
    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    VCE Mathematical Methods
                </h1>
                <p className="max-w-3xl text-lg text-slate-300">
                    Practise by topic, sit full past examinations, and receive examiner-style
                    feedback.
                </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <div className="mb-5 inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                        Best place to begin
                    </div>

                    <h2 className="text-2xl font-bold text-white">Start Topic Practice</h2>

                    <p className="mt-3 text-lg font-medium text-emerald-400">
                        Learn step by step before moving into exam conditions.
                    </p>

                    <p className="mt-5 leading-8 text-slate-300">
                        Build confidence through guided topic-based questions designed for
                        learning. Get AI hints, explanations, and follow-up support when you
                        make mistakes.
                    </p>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <h3 className="mb-3 text-lg font-semibold text-white">What you get</h3>
                        <ul className="space-y-2 text-slate-300">
                            <li>• AI hints and explanations</li>
                            <li>• Topic-by-topic preparation</li>
                            <li>• Similar question support</li>
                            <li>• Focus on weak areas</li>
                        </ul>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/student/practice/math-methods/topic"
                            className="inline-flex items-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                        >
                            Start Topic Practice
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <h2 className="text-2xl font-bold text-white">Examination 1 — No CAS</h2>

                    <p className="mt-5 leading-8 text-slate-300">
                        Practise real VCAA Examination 1 questions under exam conditions, with
                        exact answers required.
                    </p>

                    <ul className="mt-5 space-y-2 text-slate-300">
                        <li>• Past papers (2006–2025)</li>
                        <li>• Exact values enforced</li>
                        <li>• Examiner-style marking</li>
                    </ul>

                    <div className="mt-6">
                        <Link
                            href="/student/practice/math-methods/exam-1"
                            className="inline-flex items-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                            Exam 1 Practice
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <h2 className="text-2xl font-bold text-white">Examination 2 — CAS</h2>

                    <p className="mt-5 leading-8 text-slate-300">
                        Prepare for Examination 2 with CAS-based extended response questions.
                    </p>

                    <ul className="mt-5 space-y-2 text-slate-300">
                        <li>• CAS allowed</li>
                        <li>• Interpretation & reasoning</li>
                        <li>• Examiner feedback</li>
                    </ul>

                    <div className="mt-6">
                        <Link
                            href="/student/practice/math-methods/exam-2"
                            className="inline-flex items-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                        >
                            Exam 2 Practice
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}