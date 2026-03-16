/*Purpose/content: render the subject landing page using dynamic groups and topic chips from backend.*/
'use client';

import Link from 'next/link';
import { TopicPracticeStartDTO } from '@/lib/practice/topicPracticeConfig';

type Props = {
    data: TopicPracticeStartDTO;
};

export default function TopicPracticeStartPage({ data }: Props) {
    return (
        <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {data.subjectName}
                </h1>
                <p className="max-w-3xl text-base text-muted-foreground">
                    {data.intro}
                </p>
            </header>

            <section className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
                <div className="max-w-3xl space-y-4">
                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Topic-based learning
                    </div>

                    <h2 className="text-2xl font-semibold text-foreground">
                        {data.startTitle}
                    </h2>

                    <p className="text-base leading-7 text-muted-foreground">
                        {data.startDescription}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Link
                            href={data.startHref}
                            className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                            {data.startTitle}
                        </Link>
                    </div>
                </div>
            </section>

            {data.groups.map((group) => (
                <section key={group.strandCode} className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {group.strandName}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {group.topics.map((topic) => (
                            <Link
                                key={topic.code}
                                href={`/practice/${data.subjectSlug}/topic?topicCode=${topic.code}`}
                                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                                {topic.name}
                                {typeof topic.questionCount === 'number'
                                    ? ` (${topic.questionCount})`
                                    : ''}
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}