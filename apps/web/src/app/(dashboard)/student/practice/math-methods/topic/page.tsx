import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Button } from '@/components/dashboard/ui/button';
import PracticeClient from '@/app/(dashboard)/student/practice/[subject]/PracticeClient';
import {
    fetchPracticeQuestions,
    fetchTopicCounts,
    fetchTopicProgress,
    TopicProgressRow,
} from '@/lib/apiClient';
import { fetchTopicCatalogue } from '@/lib/api/topics';
import { PracticeQuestion } from '@/types/question';
import { releaseFeatureFlags } from '@/lib/featureFlags';

export default async function StudentMathMethodsTopicPracticePage({
    searchParams,
}: {
    searchParams: Promise<{ topicCode?: string }>;
}) {
    const { topicCode } = await searchParams;
    const subject = 'MATH_METHODS';

    const session = await getServerSession(authOptions);
    const currentUserId = Number((session?.user as any)?.id);
    if (!session || !Number.isFinite(currentUserId) || currentUserId <= 0) {
        redirect('/auth/login?callbackUrl=/student/practice/math-methods/topic');
    }

    if (!releaseFeatureFlags.subjectMathMethodsEnabled || !releaseFeatureFlags.mathMethodsTopicPracticeEnabled) {
        redirect('/student/practice');
    }

    const catalogue = await fetchTopicCatalogue(subject);
    const topicCountsDto = await fetchTopicCounts(subject);
    const topicProgress: TopicProgressRow[] = await fetchTopicProgress(subject, currentUserId);

    const firstTopic = catalogue.groups.flatMap((g) => g.topics)[0];
    const initialTopicCode =
        topicCode || firstTopic?.topicCode || 'MM_FUNC_BASICS';

    let initialQuestions: PracticeQuestion[] = [];
    try {
        initialQuestions = await fetchPracticeQuestions(subject, initialTopicCode);
    } catch {
        initialQuestions = [];
    }

    const allTopics = catalogue.groups.flatMap((group) => group.topics ?? []);
    const activeTopicCount = allTopics.filter((topic) => (topicCountsDto.counts[topic.topicCode] ?? 0) > 0).length;
    const totalActiveQuestions = Object.values(topicCountsDto.counts).reduce((sum, count) => sum + count, 0);
    const attemptedQuestions = topicProgress.reduce((sum, row) => sum + row.attempts, 0);
    const averageMastery =
        topicProgress.length > 0
            ? Math.round(
                  topicProgress.reduce((sum, row) => {
                      const mastery = row.attempts > 0 ? (row.correct / row.attempts) * 100 : 0;
                      return sum + mastery;
                  }, 0) / topicProgress.length
              )
            : 0;

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">VCE Mathematical Methods</p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight">Topic Mastery</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Build confidence by practising one Mathematical Methods topic at a time.
                                Search or choose a study area, inspect the available question set, then start
                                a focused practice round.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">
                                {activeTopicCount} topics live
                            </span>
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">
                                {totalActiveQuestions} questions
                            </span>
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">
                                {attemptedQuestions} attempted
                            </span>
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">
                                {averageMastery}% mastery
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Notes and guide</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Topic practice is for building skill mastery before attempting full past exams.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="font-semibold">Choose with purpose</h3>
                            <ul className="mt-3 space-y-2 text-muted-foreground">
                                <li>Start with weak or unattempted topics first.</li>
                                <li>Use study-area tabs to avoid scanning the full curriculum.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="font-semibold">Practice expectations</h3>
                            <ul className="mt-3 space-y-2 text-muted-foreground">
                                <li>Submit an answer, review marks, then read the worked solution.</li>
                                <li>Continue through approved questions until the topic feels fluent.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="font-semibold">Input format</h3>
                            <ul className="mt-3 space-y-2 text-muted-foreground">
                                <li>Use calculator-style typing such as <span className="font-mono">sqrt(2)</span>.</li>
                                <li>Use <span className="font-mono">*</span> when multiplication is ambiguous.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="font-semibold">Release 1 support</h3>
                            <p className="mt-3 text-muted-foreground">
                                This free version uses approved questions, automatic marking where safe,
                                worked solutions, and basic progress tracking. AI hints are reserved for a later release.
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="font-semibold">Other practice modes</h3>
                            <div className="mt-3 flex flex-wrap gap-3">
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/student/practice/math-methods/weak-area">Weak Area</Link>
                                </Button>
                                {releaseFeatureFlags.mathMethodsExam1Enabled && (
                                    <Button asChild size="sm" variant="outline">
                                        <Link href="/student/practice/math-methods/exam-1">Exam 1</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PracticeClient
                subject={subject}
                currentUserId={currentUserId}
                initialQuestions={initialQuestions}
                initialTopicCode={initialTopicCode}
                topicCounts={topicCountsDto.counts}
                topicGroups={catalogue.groups}
                initialTopicProgress={topicProgress}
                mode="landing"
                sessionHrefBase="/student/practice/math-methods/topic/session"
            />
        </div>
    );
}
