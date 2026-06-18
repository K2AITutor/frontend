import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Card, CardContent } from '@/components/dashboard/ui/card';
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

export default async function StudentMathMethodsTopicPracticePage({
    searchParams,
}: {
    searchParams?: { topicCode?: string };
}) {
    const subject = 'MATH_METHODS';

    const session = await getServerSession(authOptions);
    const currentUserId = Number((session?.user as any)?.id);
    if (!session || !Number.isFinite(currentUserId) || currentUserId <= 0) {
        redirect('/auth/login?callbackUrl=/student/practice/math-methods/topic');
    }

    const catalogue = await fetchTopicCatalogue(subject);
    const topicCountsDto = await fetchTopicCounts(subject);
    const topicProgress: TopicProgressRow[] = await fetchTopicProgress(subject, currentUserId);

    const firstTopic = catalogue.groups.flatMap((g) => g.topics)[0];
    const initialTopicCode =
        searchParams?.topicCode || firstTopic?.topicCode || 'MM_FUNC_BASICS';

    let initialQuestions: PracticeQuestion[] = [];
    try {
        initialQuestions = await fetchPracticeQuestions(subject, initialTopicCode);
    } catch {
        initialQuestions = [];
    }

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="space-y-4 p-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Topic Mastery — Mathematical Methods
                    </h1>

                    <p className="text-sm leading-7 text-muted-foreground">
                        For VCE Mathematical Methods, practice is organised around four core
                        areas of study: <strong className="text-foreground">Functions &amp; Graphs</strong>,{' '}
                        <strong className="text-foreground">Algebra</strong>, <strong className="text-foreground">Calculus</strong>, and{' '}
                        <strong className="text-foreground">Probability &amp; Statistics</strong>. Use this page to build
                        topic mastery first, then move into Exam 1 and Exam 2 style revision.
                    </p>

                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            How to use this page
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-lg border border-border bg-card p-3">
                                <div className="text-sm font-semibold">
                                    1. Select a topic category
                                </div>
                                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Open a category on the left and choose the sub-topic you want
                                    to practise.
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-3">
                                <div className="text-sm font-semibold">
                                    2. Submit your answer
                                </div>
                                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Enter your response, submit it, and review marks plus
                                    examiner-style feedback.
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-3">
                                <div className="text-sm font-semibold">
                                    3. Use Hint and AI Explain
                                </div>
                                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Hint gives guided support without fully solving the question.
                                    AI Explain helps unpack the method, reasoning, and common
                                    mistakes.
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-3">
                                <div className="text-sm font-semibold">
                                    4. Try a Similar Question
                                </div>
                                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Use similar questions to reinforce the same skill until the
                                    method feels secure.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Practice Modes
                        </div>

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
            />
        </div>
    );
}