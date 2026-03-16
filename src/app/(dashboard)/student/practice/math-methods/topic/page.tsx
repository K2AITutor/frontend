import Link from 'next/link';
import PracticeClient from '@/app/practice/[subject]/PracticeClient';
import { fetchPracticeQuestions, fetchTopicCounts } from '@/lib/apiClient';
import { fetchTopicCatalogue } from '@/lib/api/topics';
import { PracticeQuestion } from '@/types/question';

export default async function StudentMathMethodsTopicPracticePage({
    searchParams,
}: {
    searchParams?: { topicCode?: string };
}) {
    const subject = 'MATH_METHODS';

    const catalogue = await fetchTopicCatalogue(subject);
    const topicCountsDto = await fetchTopicCounts(subject);

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
        <div className="min-h-screen bg-[#0b1020] px-6 py-8 text-white">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Topic Mastery — Mathematical Methods
                        </h1>

                        <p className="text-sm leading-7 text-slate-300">
                            For VCE Mathematical Methods, practice is organised around four core
                            areas of study: <strong>Functions &amp; Graphs</strong>,{' '}
                            <strong>Algebra</strong>, <strong>Calculus</strong>, and{' '}
                            <strong>Probability &amp; Statistics</strong>. Use this page to build
                            topic mastery first, then move into Exam 1 and Exam 2 style revision.
                        </p>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                How to use this page
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-sm font-semibold text-white">
                                        1. Select a topic category
                                    </div>
                                    <div className="mt-1 text-sm leading-6 text-slate-300">
                                        Open a category on the left and choose the sub-topic you want
                                        to practise.
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-sm font-semibold text-white">
                                        2. Submit your answer
                                    </div>
                                    <div className="mt-1 text-sm leading-6 text-slate-300">
                                        Enter your response, submit it, and review marks plus
                                        examiner-style feedback.
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-sm font-semibold text-white">
                                        3. Use Hint and AI Explain
                                    </div>
                                    <div className="mt-1 text-sm leading-6 text-slate-300">
                                        Hint gives guided support without fully solving the question.
                                        AI Explain helps unpack the method, reasoning, and common
                                        mistakes.
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-sm font-semibold text-white">
                                        4. Try a Similar Question
                                    </div>
                                    <div className="mt-1 text-sm leading-6 text-slate-300">
                                        Use similar questions to reinforce the same skill until the
                                        method feels secure.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                Practice Modes
                            </div>

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
                    </div>
                </section>

                <PracticeClient
                    subject={subject}
                    initialQuestions={initialQuestions}
                    initialTopicCode={initialTopicCode}
                    topicCounts={topicCountsDto.counts}
                    topicGroups={catalogue.groups}
                />
            </div>
        </div>
    );
}