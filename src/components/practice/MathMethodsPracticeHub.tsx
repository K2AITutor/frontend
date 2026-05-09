/*Purpose/content: keeps the main Math Methods practice page in the same polished student-portal style.*/
'use client';

import Link from 'next/link';

export default function MathMethodsPracticeHub() {
    return (
        <div className="space-y-6">
            <section className="max-w-4xl space-y-3">
                <div className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                    Mathematical Methods practice pathway
                </div>
                <h1 className="text-3xl font-semibold tracking-normal text-white md:text-4xl">
                    VCE Mathematical Methods
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300">
                    Build topic mastery from the course content first, then use past examinations
                    to test exam readiness under the right conditions.
                </p>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.15fr_1fr_1fr]">
                <div className="rounded-lg border border-emerald-400/30 bg-slate-900/80 p-6 shadow-lg">
                    <div className="mb-5 inline-flex rounded-md bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Start here
                    </div>

                    <h2 className="text-2xl font-semibold tracking-normal text-white">
                        Topic Mastery
                    </h2>

                    <p className="mt-3 text-base font-medium leading-7 text-emerald-300">
                        Practise the Cambridge-aligned skills before you attempt full papers.
                    </p>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                        Choose a strand, work through topic questions, use hints when you are
                        stuck, and track mastery as you improve. This mode is for learning, not
                        exam timing.
                    </p>

                    <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/60 p-4">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                            Learning support
                        </h3>
                        <ul className="space-y-2 text-sm leading-6 text-slate-300">
                            <li>AI Hint 1 and Hint 2 before full explanation</li>
                            <li>Worked solution after submission</li>
                            <li>Similar-question practice for the same skill</li>
                            <li>Mastery status for each topic</li>
                        </ul>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/student/practice/math-methods/topic"
                            className="inline-flex items-center rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                        >
                            Start Topic Practice
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-lg">
                    <div className="mb-5 inline-flex rounded-md bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                        Exam conditions
                    </div>

                    <h2 className="text-2xl font-semibold tracking-normal text-white">
                        Examination 1
                    </h2>

                    <p className="mt-2 text-sm font-medium text-slate-300">No CAS</p>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                        Use this after topic practice to test exact-answer skills with past
                        examination questions and examiner-style marking.
                    </p>

                    <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
                        <li>Past papers by year</li>
                        <li>Exact values required</li>
                        <li>AI assistance disabled in exam mode</li>
                    </ul>

                    <div className="mt-6">
                        <Link
                            href="/student/practice/math-methods/exam-1"
                            className="inline-flex items-center rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                        >
                            Exam 1 Practice
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-lg">
                    <div className="mb-5 inline-flex rounded-md bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300">
                        CAS paper
                    </div>

                    <h2 className="text-2xl font-semibold tracking-normal text-white">
                        Examination 2
                    </h2>

                    <p className="mt-2 text-sm font-medium text-slate-300">CAS allowed</p>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                        Practise extended-response questions that rely on interpretation,
                        modelling, reasoning, and CAS-supported working.
                    </p>

                    <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
                        <li>CAS-supported methods</li>
                        <li>Multi-step reasoning</li>
                        <li>Examiner feedback focus</li>
                    </ul>

                    <div className="mt-6">
                        <Link
                            href="/student/practice/math-methods/exam-2"
                            className="inline-flex items-center rounded-md bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                        >
                            Exam 2 Practice
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
