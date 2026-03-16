import Link from 'next/link';

const starterWeakAreas = [
    {
        title: 'Domain & Range',
        category: 'Functions & Graphs',
        reason: 'Common source of interval and endpoint mistakes.',
        status: 'Needs review',
    },
    {
        title: 'Differentiation Rules',
        category: 'Calculus',
        reason: 'Often linked to chain-rule and derivative form errors.',
        status: 'Watch closely',
    },
    {
        title: 'Probability Rules',
        category: 'Probability & Statistics',
        reason: 'Useful checkpoint for complements and event relationships.',
        status: 'Monitor',
    },
];

export default function WeakAreaPage() {
    return (
        <div className="min-h-screen bg-[#0b1020] px-6 py-8 text-white">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Weak Area Dashboard
                        </h1>

                        <p className="text-sm leading-7 text-slate-300">
                            Weak Area mode is designed to bring your lowest-confidence topics to
                            the front. As you complete more practice, this page will evolve into a
                            personalised dashboard based on incorrect answers, repeated hint use,
                            and topic-level mastery.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/student/practice/math-methods/topic"
                                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
                            >
                                Topic Mastery
                            </Link>
                            <Link
                                href="/student/practice/math-methods/weak-area"
                                className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Weak Area
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-white">Priority review topics</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            These are recommended weak-area targets for the next phase of the
                            product. Once mastery tracking is connected, this panel should rank
                            topics dynamically.
                        </p>

                        <div className="mt-5 space-y-4">
                            {starterWeakAreas.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-lg font-semibold text-white">{item.title}</div>
                                            <div className="text-sm text-emerald-300">{item.category}</div>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {item.reason}
                                            </p>
                                        </div>

                                        <div className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                                            {item.status}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <Link
                                            href={`/student/practice/math-methods/topic`}
                                            className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                                        >
                                            Practise this area
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                            <h2 className="text-xl font-semibold text-white">How Weak Area works</h2>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                                <li>• Repeated incorrect answers raise topic priority.</li>
                                <li>• Frequent hint usage signals lower confidence.</li>
                                <li>• Low-scoring topics should surface first.</li>
                                <li>• Similar-question practice should reinforce weak skills.</li>
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                            <h2 className="text-xl font-semibold text-white">Next implementation</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                The next backend step is to store user-topic progress and recent
                                weak-skill signals so this page becomes fully data-driven rather than
                                static.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}