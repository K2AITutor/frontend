import Link from 'next/link';

type TopicStatus = 'Not started' | 'Early signal' | 'Weak' | 'Monitor' | 'Strong';

type WeakAreaRow = {
    topicCode: string;
    strandCode?: string | null;
    strandName?: string | null;
    topicName?: string | null;
    subtopicCode?: string;
    attempts: number;
    correct: number;
    accuracy: number;
    masteryPercent: number;
    status: TopicStatus;
    weaknessScore?: number | null;
};

type RecentMistakeRow = {
    id: number;
    questionId: number;
    submittedAnswer?: string | null;
    isCorrect: boolean;
    attemptedAt?: string;
    question?: {
        questionText?: string | null;
        prompt?: string | null;
        topicCode?: string | null;
    } | null;
};

type WeakAreaResponse = {
    weakestSubtopics: WeakAreaRow[];
    earlySignalTopics: WeakAreaRow[];
    topicProgress: WeakAreaRow[];
    recentMistakes?: RecentMistakeRow[];
    recommendedRecoveryPath?: string[];
};

function getApiBase() {
    const raw =
        process.env.INTERNAL_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://aitutor-backend:4000/api';

    const clean = String(raw).trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
}

async function fetchWeakAreaData(): Promise<WeakAreaResponse> {
    const base = getApiBase();
    const url = `${base}/progress/weak-area?userId=1&subjectCode=MATH_METHODS`;

    const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        return {
            weakestSubtopics: [],
            earlySignalTopics: [],
            topicProgress: [],
            recentMistakes: [],
            recommendedRecoveryPath: [],
        };
    }

    const data = await res.json().catch(() => null);

    if (!data || typeof data !== 'object') {
        return {
            weakestSubtopics: [],
            earlySignalTopics: [],
            topicProgress: [],
            recentMistakes: [],
            recommendedRecoveryPath: [],
        };
    }

    return {
        weakestSubtopics: Array.isArray(data.weakestSubtopics) ? data.weakestSubtopics : [],
        earlySignalTopics: Array.isArray(data.earlySignalTopics) ? data.earlySignalTopics : [],
        topicProgress: Array.isArray(data.topicProgress) ? data.topicProgress : [],
        recentMistakes: Array.isArray(data.recentMistakes) ? data.recentMistakes : [],
        recommendedRecoveryPath: Array.isArray(data.recommendedRecoveryPath)
            ? data.recommendedRecoveryPath
            : [],
    };
}

function statusClasses(status: TopicStatus) {
    switch (status) {
        case 'Weak':
            return 'bg-red-500/15 text-red-300 border border-red-500/20';
        case 'Monitor':
            return 'bg-amber-500/15 text-amber-300 border border-amber-500/20';
        case 'Strong':
            return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20';
        case 'Early signal':
            return 'bg-sky-500/15 text-sky-300 border border-sky-500/20';
        default:
            return 'bg-slate-500/15 text-slate-300 border border-white/10';
    }
}

function formatAccuracy(value?: number | null) {
    if (value == null || Number.isNaN(value)) return '—';
    return `${Math.round(value * 100)}%`;
}

function formatMastery(value?: number | null) {
    if (value == null || Number.isNaN(value)) return '—';
    return `${value}%`;
}

function TopicCard({
    item,
    actionLabel = 'Practise this area',
}: {
    item: WeakAreaRow;
    actionLabel?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold text-white">
                        {item.topicName ?? item.topicCode}
                    </div>
                    <div className="text-sm text-emerald-300">
                        {item.strandName ?? 'Topic'}
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-4">
                        <div>
                            Attempts:{' '}
                            <span className="font-semibold text-white">{item.attempts}</span>
                        </div>
                        <div>
                            Correct:{' '}
                            <span className="font-semibold text-white">{item.correct}</span>
                        </div>
                        <div>
                            Accuracy:{' '}
                            <span className="font-semibold text-white">
                                {formatAccuracy(item.accuracy)}
                            </span>
                        </div>
                        <div>
                            Mastery:{' '}
                            <span className="font-semibold text-white">
                                {formatMastery(item.masteryPercent)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(item.status)}`}>
                    {item.status}
                </div>
            </div>

            <div className="mt-4">
                <Link
                    href={`/student/practice/math-methods/topic?topicCode=${encodeURIComponent(
                        item.topicCode
                    )}`}
                    className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                >
                    {actionLabel}
                </Link>
            </div>
        </div>
    );
}

export default async function WeakAreaPage() {
    const data = await fetchWeakAreaData();

    const weakestSubtopics = data.weakestSubtopics;
    const earlySignalTopics = data.earlySignalTopics;
    const topicProgress = data.topicProgress;

    const attemptedTopics = topicProgress.filter((row) => row.attempts > 0).length;
    const weakestTopic = weakestSubtopics[0] ?? earlySignalTopics[0] ?? null;

    const averageAccuracy =
        topicProgress.length > 0
            ? Math.round(
                (topicProgress.reduce((sum, row) => sum + (row.accuracy ?? 0), 0) /
                    topicProgress.length) *
                100
            )
            : null;

    return (
        <div className="min-h-screen bg-[#0b1020] px-6 py-8 text-white">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Weak Area Dashboard
                        </h1>

                        <p className="text-sm leading-7 text-slate-300">
                            This dashboard ranks your Mathematical Methods topics using real
                            practice performance. Topics with low accuracy and enough attempts are
                            prioritised first, while low-attempt topics are shown as early signals.
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

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl">
                        <div className="text-sm uppercase tracking-wide text-slate-400">
                            Topics attempted
                        </div>
                        <div className="mt-2 text-3xl font-bold text-white">{attemptedTopics}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl">
                        <div className="text-sm uppercase tracking-wide text-slate-400">
                            Priority topic
                        </div>
                        <div className="mt-2 text-xl font-bold text-white">
                            {weakestTopic?.topicName ?? 'No data yet'}
                        </div>
                        <div className="mt-1 text-sm text-slate-300">
                            {weakestTopic?.strandName ??
                                'Complete some practice to generate insights'}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl">
                        <div className="text-sm uppercase tracking-wide text-slate-400">
                            Average accuracy
                        </div>
                        <div className="mt-2 text-3xl font-bold text-white">
                            {averageAccuracy == null ? '—' : `${averageAccuracy}%`}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                            <h2 className="text-xl font-semibold text-white">Priority review topics</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                These topics have enough attempts to be trusted and are currently
                                classified as weak.
                            </p>

                            {weakestSubtopics.length === 0 ? (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-6">
                                    <div className="text-lg font-semibold text-white">
                                        No confirmed weak topics yet
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        A topic moves into this section once you have enough attempts
                                        and the accuracy remains low.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    {weakestSubtopics.map((item) => (
                                        <TopicCard key={item.topicCode} item={item} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                            <h2 className="text-xl font-semibold text-white">Early signal topics</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                These topics have only a small number of attempts so far. Treat them
                                as low-confidence signals, not final judgements.
                            </p>

                            {earlySignalTopics.length === 0 ? (
                                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-sm text-slate-300">
                                    No early-signal topics right now.
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    {earlySignalTopics.map((item) => (
                                        <TopicCard
                                            key={`${item.topicCode}-early`}
                                            item={item}
                                            actionLabel="Build more evidence"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {data.recentMistakes && data.recentMistakes.length > 0 && (
                            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                                <h2 className="text-xl font-semibold text-white">Recent mistakes</h2>
                                <div className="mt-5 space-y-3">
                                    {data.recentMistakes.slice(0, 5).map((row) => (
                                        <div
                                            key={row.id}
                                            className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                                        >
                                            <div className="text-sm font-semibold text-white">
                                                {row.question?.questionText ||
                                                    row.question?.prompt ||
                                                    'Question'}
                                            </div>
                                            <div className="mt-2 text-sm text-slate-300">
                                                Submitted answer:{' '}
                                                <span className="text-white">
                                                    {row.submittedAnswer || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                            <h2 className="text-xl font-semibold text-white">How Weak Area works</h2>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                                <li>• Topics with lower accuracy rank higher.</li>
                                <li>• Fewer than 3 attempts are treated as early signals.</li>
                                <li>• More attempts make the signal more trustworthy.</li>
                                <li>• Practise weak topics first to lift overall mastery.</li>
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                            <h2 className="text-xl font-semibold text-white">Reading the dashboard</h2>
                            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                                <p>
                                    <span className="font-semibold text-white">Weak</span> means the
                                    topic has enough attempts and currently low accuracy.
                                </p>
                                <p>
                                    <span className="font-semibold text-white">Early signal</span>{' '}
                                    means there is not enough data yet to judge confidently.
                                </p>
                                <p>
                                    <span className="font-semibold text-white">Monitor</span> means
                                    partial understanding.
                                </p>
                                <p>
                                    <span className="font-semibold text-white">Strong</span> means
                                    the topic is currently performing well.
                                </p>
                            </div>
                        </div>

                        {data.recommendedRecoveryPath &&
                            data.recommendedRecoveryPath.length > 0 && (
                                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
                                    <h2 className="text-xl font-semibold text-white">
                                        Recommended recovery path
                                    </h2>
                                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                                        {data.recommendedRecoveryPath.map((step, index) => (
                                            <li key={`${step}-${index}`}>• {step}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                    </div>
                </section>
            </div>
        </div>
    );
}