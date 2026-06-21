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

export default async function StudentMathMethodsTopicPracticeSessionPage({
    searchParams,
}: {
    searchParams?: { topicCode?: string };
}) {
    const subject = 'MATH_METHODS';

    const session = await getServerSession(authOptions);
    const currentUserId = Number((session?.user as any)?.id);
    if (!session || !Number.isFinite(currentUserId) || currentUserId <= 0) {
        redirect('/auth/login?callbackUrl=/student/practice/math-methods/topic/session');
    }

    const catalogue = await fetchTopicCatalogue(subject);
    const topicCountsDto = await fetchTopicCounts(subject);
    const topicProgress: TopicProgressRow[] = await fetchTopicProgress(subject, currentUserId);

    const firstTopic = catalogue.groups.flatMap((group) => group.topics)[0];
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
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">VCE Mathematical Methods</p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight">Topic practice session</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Work through questions for the selected topic. Use hints and explanations in
                                practice mode, then return to the topic selector when you want a different focus.
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={`/student/practice/math-methods/topic?topicCode=${encodeURIComponent(initialTopicCode)}`}>
                                Back to topic selector
                            </Link>
                        </Button>
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
                mode="session"
                showSelector={false}
                sessionHrefBase="/student/practice/math-methods/topic/session"
            />
        </div>
    );
}
