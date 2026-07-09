import Link from 'next/link';
import { apiGet } from '@/lib/apiClient';
import { PATH } from '@aitutor/shared';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Button } from '@/components/dashboard/ui/button';

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

async function fetchWeakAreaData(userId: number): Promise<WeakAreaResponse> {
    try {
        const data = await apiGet<any>(`${PATH.analytics.weakArea}?userId=${userId}&subjectCode=MATH_METHODS`);
        return {
            weakestSubtopics: Array.isArray(data.weakestSubtopics) ? data.weakestSubtopics : [],
            earlySignalTopics: Array.isArray(data.earlySignalTopics) ? data.earlySignalTopics : [],
            topicProgress: Array.isArray(data.topicProgress) ? data.topicProgress : [],
            recentMistakes: Array.isArray(data.recentMistakes) ? data.recentMistakes : [],
            recommendedRecoveryPath: Array.isArray(data.recommendedRecoveryPath)
                ? data.recommendedRecoveryPath
                : [],
        };
    } catch (err) {
        return {
            weakestSubtopics: [],
            earlySignalTopics: [],
            topicProgress: [],
            recentMistakes: [],
            recommendedRecoveryPath: [],
        };
    }
}

function statusClasses(status: TopicStatus) {
    switch (status) {
        case 'Weak':
            return 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20';
        case 'Monitor':
            return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20';
        case 'Strong':
            return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';
        case 'Early signal':
            return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20';
        default:
            return 'bg-muted text-muted-foreground border border-border';
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
        <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-semibold">
                        {item.topicName ?? item.topicCode}
                    </div>
                    <div className="text-sm text-primary">
                        {item.strandName ?? 'Topic'}
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                        <div>
                            Attempts:{' '}
                            <span className="font-semibold text-foreground">{item.attempts}</span>
                        </div>
                        <div>
                            Correct:{' '}
                            <span className="font-semibold text-foreground">{item.correct}</span>
                        </div>
                        <div>
                            Accuracy:{' '}
                            <span className="font-semibold text-foreground">
                                {formatAccuracy(item.accuracy)}
                            </span>
                        </div>
                        <div>
                            Mastery:{' '}
                            <span className="font-semibold text-foreground">
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
                <Button asChild size="sm">
                    <Link
                        href={`/student/practice/math-methods/topic?topicCode=${encodeURIComponent(
                            item.topicCode
                        )}`}
                    >
                        {actionLabel}
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export default async function WeakAreaPage() {
    const session = await getServerSession(authOptions);
    const userId = Number((session?.user as any)?.id);
    if (!session || !Number.isFinite(userId) || userId <= 0) {
        redirect('/auth/login?callbackUrl=/student/practice/math-methods/weak-area');
    }

    const data = await fetchWeakAreaData(userId);

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
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="space-y-4 p-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Weak Area Dashboard
                    </h1>

                    <p className="text-sm leading-7 text-muted-foreground">
                        This dashboard ranks your Mathematical Methods topics using real
                        practice performance. Topics with low accuracy and enough attempts are
                        prioritised first, while low-attempt topics are shown as early signals.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="sm">
                            <Link href="/student/practice/math-methods/topic">
                                Topic Mastery
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/student/practice/math-methods/weak-area">
                                Weak Area
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-5">
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                            Topics attempted
                        </div>
                        <div className="mt-2 text-3xl font-bold">{attemptedTopics}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                            Priority topic
                        </div>
                        <div className="mt-2 text-xl font-bold">
                            {weakestTopic?.topicName ?? 'No data yet'}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {weakestTopic?.strandName ??
                                'Complete some practice to generate insights'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                            Average accuracy
                        </div>
                        <div className="mt-2 text-3xl font-bold">
                            {averageAccuracy == null ? '—' : `${averageAccuracy}%`}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Priority review topics</CardTitle>
                            <p className="text-sm leading-6 text-muted-foreground">
                                These topics have enough attempts to be trusted and are currently
                                classified as weak.
                            </p>
                        </CardHeader>
                        <CardContent>
                            {weakestSubtopics.length === 0 ? (
                                <div className="rounded-lg border border-border bg-muted/50 p-6">
                                    <div className="text-lg font-semibold">
                                        No confirmed weak topics yet
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        A topic moves into this section once you have enough attempts
                                        and the accuracy remains low.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {weakestSubtopics.map((item) => (
                                        <TopicCard key={item.topicCode} item={item} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Early signal topics</CardTitle>
                            <p className="text-sm leading-6 text-muted-foreground">
                                These topics have only a small number of attempts so far. Treat them
                                as low-confidence signals, not final judgements.
                            </p>
                        </CardHeader>
                        <CardContent>
                            {earlySignalTopics.length === 0 ? (
                                <div className="rounded-lg border border-border bg-muted/50 p-6 text-sm text-muted-foreground">
                                    No early-signal topics right now.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {earlySignalTopics.map((item) => (
                                        <TopicCard
                                            key={`${item.topicCode}-early`}
                                            item={item}
                                            actionLabel="Build more evidence"
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {data.recentMistakes && data.recentMistakes.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Recent mistakes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.recentMistakes.slice(0, 5).map((row) => (
                                        <div
                                            key={row.id}
                                            className="rounded-lg border border-border bg-muted/50 p-4"
                                        >
                                            <div className="text-sm font-semibold">
                                                {row.question?.questionText || 'Question'}
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                Submitted answer:{' '}
                                                <span className="text-foreground">
                                                    {row.submittedAnswer || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">How Weak Area works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                                <li>• Topics with lower accuracy rank higher.</li>
                                <li>• Fewer than 3 attempts are treated as early signals.</li>
                                <li>• More attempts make the signal more trustworthy.</li>
                                <li>• Practise weak topics first to lift overall mastery.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Reading the dashboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                                <p>
                                    <span className="font-semibold text-foreground">Weak</span> means the
                                    topic has enough attempts and currently low accuracy.
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">Early signal</span>{' '}
                                    means there is not enough data yet to judge confidently.
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">Monitor</span> means
                                    partial understanding.
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">Strong</span> means
                                    the topic is currently performing well.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {data.recommendedRecoveryPath &&
                        data.recommendedRecoveryPath.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Recommended recovery path
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                                        {data.recommendedRecoveryPath.map((step, index) => (
                                            <li key={`${step}-${index}`}>• {step}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                </div>
            </section>
        </div>
    );
}
