'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    aiExplain,
    aiHint,
    aiSimilarQuestion,
    fetchPracticeQuestions,
    fetchSimilarQuestions,
    getAdaptiveRecommendation,
    submitAnswer,
} from '@/lib/apiClient';
import { PracticeQuestion } from '@/types/question';
import { TopicGroup } from '@/types/topic';

type SubmissionResult = {
    correct?: boolean;
    score?: number;
    maxScore?: number;
    feedback?: string;
    errorTags?: string[];
    skillGaps?: string[];
    diagnostics?: Record<string, any>;
    commonMistake?: string;
    modelAnswer?: string;
};

type TopicMeta = {
    attempted: number;
    total: number;
    mastery: number;
    status: 'Not started' | 'Weak' | 'Medium' | 'Strong';
};

function getStatusFromMastery(mastery: number, attempted: number): TopicMeta['status'] {
    if (attempted === 0) return 'Not started';
    if (mastery < 40) return 'Weak';
    if (mastery < 75) return 'Medium';
    return 'Strong';
}

function statusClasses(status: TopicMeta['status']) {
    switch (status) {
        case 'Weak':
            return 'bg-red-500/15 text-red-300 border-red-500/20';
        case 'Medium':
            return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
        case 'Strong':
            return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
        default:
            return 'bg-slate-500/15 text-slate-300 border-white/10';
    }
}

export default function PracticeClient({
    initialQuestions,
    subject,
    examKey,
    initialTopicCode = 'MM_FUNC_BASICS',
    topicCounts = {},
    topicGroups = [],
}: {
    initialQuestions: PracticeQuestion[];
    subject: string;
    examKey?: string;
    initialTopicCode?: string;
    topicCounts?: Record<string, number>;
    topicGroups?: TopicGroup[];
}) {
    const [questions, setQuestions] = useState<PracticeQuestion[]>(initialQuestions ?? []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTopicCode, setSelectedTopicCode] = useState(initialTopicCode);
    const [userAnswer, setUserAnswer] = useState('');
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

    const [hint1Text, setHint1Text] = useState('');
    const [hint2Text, setHint2Text] = useState('');
    const [explainText, setExplainText] = useState('');
    const [similarQuestionText, setSimilarQuestionText] = useState('');

    const [hintLevelUsed, setHintLevelUsed] = useState(0);
    const [showDebug, setShowDebug] = useState(false);

    const [loadingHint1, setLoadingHint1] = useState(false);
    const [loadingHint2, setLoadingHint2] = useState(false);
    const [loadingExplain, setLoadingExplain] = useState(false);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

    const currentQuestion = questions[currentIndex] ?? null;

    useEffect(() => {
        const initialState: Record<string, boolean> = {};
        for (const group of topicGroups) {
            const hasSelected = group.topics.some((t) => t.topicCode === selectedTopicCode);
            initialState[group.strandCode] = hasSelected;
        }
        setOpenGroups((prev) => ({ ...initialState, ...prev }));
    }, [topicGroups, selectedTopicCode]);

    const currentTopicName = useMemo(() => {
        const allTopics = topicGroups.flatMap((g) => g.topics);
        const match = allTopics.find((t) => t.topicCode === selectedTopicCode);
        return match?.name ?? 'Topic Category';
    }, [selectedTopicCode, topicGroups]);

    const groupedTopics = useMemo(() => {
        return topicGroups.filter(
            (g) =>
                g.strandName === 'Functions & Graphs' ||
                g.strandName === 'Algebra' ||
                g.strandName === 'Calculus' ||
                g.strandName === 'Probability & Statistics'
        );
    }, [topicGroups]);

    const topicMetaMap = useMemo(() => {
        const map: Record<string, TopicMeta> = {};

        for (const group of groupedTopics) {
            for (const topic of group.topics) {
                const total = topicCounts[topic.topicCode] ?? topic.questionCount ?? 0;

                // UI-first placeholder logic until mastery backend exists
                const attempted = topic.topicCode === selectedTopicCode ? Math.min(1, total) : 0;
                const mastery = topic.topicCode === selectedTopicCode && submissionResult
                    ? submissionResult.correct
                        ? 100
                        : 30
                    : 0;

                map[topic.topicCode] = {
                    attempted,
                    total,
                    mastery,
                    status: getStatusFromMastery(mastery, attempted),
                };
            }
        }

        return map;
    }, [groupedTopics, topicCounts, selectedTopicCode, submissionResult]);

    const resetSupportState = () => {
        setHint1Text('');
        setHint2Text('');
        setExplainText('');
        setSimilarQuestionText('');
        setHintLevelUsed(0);
        setSubmissionResult(null);
        setShowDebug(false);
    };

    const toggleGroup = (strandCode: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [strandCode]: !prev[strandCode],
        }));
    };

    const startPractice = async (topicCode: string) => {
        try {
            setSelectedTopicCode(topicCode);
            setUserAnswer('');
            resetSupportState();

            const nextQuestions = await fetchPracticeQuestions(subject, topicCode);
            const filtered =
                difficultyFilter === 'all'
                    ? nextQuestions
                    : nextQuestions.filter((q: any) => q.difficulty === difficultyFilter);

            setQuestions(Array.isArray(filtered) ? filtered : []);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Failed to start practice', error);
            setQuestions([]);
            setCurrentIndex(0);
        }
    };

    const handleSubmit = async () => {
        if (!currentQuestion) return;

        try {
            const result = await submitAnswer(
                String(currentQuestion.id),
                userAnswer,
                examKey,
                hintLevelUsed
            );

            setSubmissionResult({
                ...result,
                modelAnswer: currentQuestion.answer || 'No model answer available.',
                commonMistake:
                    result?.errorTags?.length
                        ? result.errorTags.join(', ')
                        : result?.diagnostics?.mistakeType || 'Check substitution, setup, and arithmetic carefully.',
            });
        } catch (error) {
            console.error('Submit failed', error);
            setSubmissionResult({
                correct: false,
                score: 0,
                maxScore: currentQuestion?.marks ?? 1,
                feedback: 'Unable to submit answer at the moment.',
                modelAnswer: currentQuestion?.answer || 'No model answer available.',
                commonMistake: 'Submission service unavailable.',
            });
        }
    };

    const handleHint = async (level: 1 | 2) => {
        if (!currentQuestion) return;

        const setLoading = level === 1 ? setLoadingHint1 : setLoadingHint2;
        const setText = level === 1 ? setHint1Text : setHint2Text;

        try {
            setLoading(true);

            const res = await aiHint({
                subject,
                skillCode: currentQuestion.skillCode || selectedTopicCode,
                question: currentQuestion.prompt,
                studentAnswer: userAnswer,
                level,
            });

            setText(
                res?.hint ||
                res?.finalAdvice ||
                (Array.isArray(res?.stepByStep) ? res.stepByStep.join(' ') : '') ||
                'No hint available.'
            );
            setHintLevelUsed(Math.max(hintLevelUsed, level));
        } catch (error) {
            console.error(`Hint ${level} failed`, error);
            setText(`Unable to load hint ${level} right now.`);
        } finally {
            setLoading(false);
        }
    };

    const handleExplain = async () => {
        if (!currentQuestion || loadingExplain) return;

        try {
            setLoadingExplain(true);

            const res = await aiExplain({
                subject,
                skillCode: currentQuestion.skillCode || selectedTopicCode,
                question: currentQuestion.prompt,
                studentAnswer: userAnswer,
                correctAnswer: currentQuestion.answer || '',
            });

            const parts: string[] = [];

            if (typeof res?.mistakeType === 'string' && res.mistakeType.trim()) {
                parts.push(`Mistake type: ${res.mistakeType}`);
            }

            if (Array.isArray(res?.stepByStep) && res.stepByStep.length > 0) {
                parts.push(
                    'Step by step:\n' +
                    res.stepByStep.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')
                );
            }

            if (typeof res?.finalAdvice === 'string' && res.finalAdvice.trim()) {
                parts.push(`Final advice: ${res.finalAdvice}`);
            }

            if (typeof res?.explanation === 'string' && res.explanation.trim()) {
                parts.unshift(res.explanation);
            }

            if (typeof res?.message === 'string' && res.message.trim()) {
                parts.unshift(res.message);
            }

            setExplainText(parts.join('\n\n') || 'No explanation available.');
        } catch (error) {
            console.error('Explain failed', error);
            setExplainText('Unable to load an explanation right now.');
        } finally {
            setLoadingExplain(false);
        }
    };

    const handleSimilarQuestion = async () => {
        if (!currentQuestion || loadingSimilar) return;

        try {
            setLoadingSimilar(true);

            let loaded = false;

            try {
                const similar = await fetchSimilarQuestions({
                    subject,
                    topicCode: selectedTopicCode,
                    questionId: String(currentQuestion.id),
                    skillGaps: submissionResult?.skillGaps,
                    limit: 1,
                });

                if (Array.isArray(similar) && similar.length > 0) {
                    setQuestions([similar[0]]);
                    setCurrentIndex(0);
                    setUserAnswer('');
                    resetSupportState();
                    loaded = true;
                }
            } catch (dbError) {
                console.warn('DB similar question failed', dbError);
            }

            if (!loaded) {
                const aiRes = await aiSimilarQuestion({
                    subject,
                    skillCode: currentQuestion.skillCode || selectedTopicCode,
                    question: currentQuestion.prompt,
                });

                setSimilarQuestionText(
                    aiRes?.question || aiRes?.similarQuestion || aiRes?.message || 'No similar question available.'
                );
            }
        } catch (error) {
            console.error('Similar question failed', error);
            setSimilarQuestionText('Unable to load a similar question right now.');
        } finally {
            setLoadingSimilar(false);
        }
    };

    const moveNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setUserAnswer('');
            resetSupportState();
            return;
        }

        try {
            const nextQuestions = await fetchPracticeQuestions(subject, selectedTopicCode);
            const filtered =
                difficultyFilter === 'all'
                    ? nextQuestions
                    : nextQuestions.filter((q: any) => q.difficulty === difficultyFilter);

            if (Array.isArray(filtered) && filtered.length > 0) {
                setQuestions(filtered);
                setCurrentIndex(0);
                setUserAnswer('');
                resetSupportState();
            }
        } catch (error) {
            console.error('Next question load failed', error);
        }
    };

    const nextRecommendedAction = useMemo(() => {
        if (!submissionResult) return '';
        if (submissionResult.correct) return 'Move to the next question or try a similar one for reinforcement.';
        return 'Try a similar substitution question or use AI Explain to review the method.';
    }, [submissionResult]);

    return (
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-5">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <div className="text-sm font-medium uppercase tracking-wide text-slate-400">
                        Select Topic Category
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-white">{currentTopicName}</h2>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm text-slate-300">Difficulty filter</label>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value as any)}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                        Resume where you left off will use stored progress once mastery tracking is connected.
                    </div>
                </section>

                <section className="space-y-4">
                    {groupedTopics.map((group) => {
                        const isOpen = !!openGroups[group.strandCode];

                        return (
                            <div
                                key={group.strandCode}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group.strandCode)}
                                    className="flex w-full items-center justify-between text-left"
                                >
                                    <span className="text-lg font-semibold text-white">
                                        {group.strandName}
                                    </span>
                                    <span
                                        className={`text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''
                                            }`}
                                    >
                                        ▶
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="mt-4 space-y-2">
                                        {group.topics.map((topic) => {
                                            const isActive = selectedTopicCode === topic.topicCode;
                                            const meta = topicMetaMap[topic.topicCode] || {
                                                attempted: 0,
                                                total: topicCounts[topic.topicCode] ?? topic.questionCount ?? 0,
                                                mastery: 0,
                                                status: 'Not started' as const,
                                            };

                                            return (
                                                <button
                                                    key={topic.topicCode}
                                                    type="button"
                                                    onClick={() => void startPractice(topic.topicCode)}
                                                    className={`block w-full rounded-xl border px-4 py-3 text-left transition ${isActive
                                                            ? 'border-emerald-400 bg-emerald-500/10'
                                                            : 'border-white/10 bg-slate-900/60 hover:border-slate-400 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="text-sm font-semibold text-white">
                                                                {topic.name}
                                                            </div>
                                                            <div className="mt-1 text-xs text-slate-400">
                                                                {meta.attempted}/{meta.total} attempted
                                                            </div>
                                                            <div className="mt-1 text-xs text-slate-400">
                                                                Mastery {meta.mastery}%
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses(
                                                                    meta.status
                                                                )}`}
                                                            >
                                                                {meta.status}
                                                            </span>
                                                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                                                                {meta.total} q
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
            </aside>

            <section className="space-y-6">
                <div className="flex justify-end">
                    <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300">
                        Question {questions.length === 0 ? 0 : currentIndex + 1} of {questions.length}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    <div className="space-y-6">
                        <div>
                            <div className="mb-3 text-sm text-slate-400">Current question</div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-2xl font-medium text-white">
                                {currentQuestion?.prompt || 'No question available for this topic yet.'}
                            </div>
                        </div>

                        <div>
                            <label className="mb-3 block text-sm font-medium text-white">
                                Your answer
                            </label>
                            <input
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Enter your answer"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                            />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!currentQuestion}
                                        className="rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Submit Answer
                                    </button>

                                    {!submissionResult && (
                                        <button
                                            type="button"
                                            onClick={() => handleHint(1)}
                                            disabled={loadingHint1 || !currentQuestion}
                                            className="text-sm font-medium text-emerald-300 underline underline-offset-4"
                                        >
                                            {loadingHint1 ? 'Loading hint...' : 'Need a hint?'}
                                        </button>
                                    )}
                                </div>

                                {hint1Text && (
                                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-slate-100">
                                        <div className="mb-2 font-semibold text-amber-300">Hint 1</div>
                                        <div className="whitespace-pre-line">{hint1Text}</div>
                                    </div>
                                )}

                                {hint2Text && (
                                    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-slate-100">
                                        <div className="mb-2 font-semibold text-orange-300">Hint 2</div>
                                        <div className="whitespace-pre-line">{hint2Text}</div>
                                    </div>
                                )}

                                {submissionResult && (
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                                        <div
                                            className={`text-2xl font-bold ${submissionResult.correct ? 'text-emerald-400' : 'text-red-400'
                                                }`}
                                        >
                                            {submissionResult.correct ? 'Correct' : 'Incorrect'}
                                        </div>

                                        <div className="mt-2 text-lg text-slate-300">
                                            Marks: <span className="font-semibold text-white">{submissionResult.score ?? 0}</span>
                                            <span className="text-slate-400"> / {submissionResult.maxScore ?? 1}</span>
                                        </div>

                                        <div className="mt-5">
                                            <div className="mb-2 text-lg font-semibold text-white">
                                                Model answer
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100">
                                                {submissionResult.modelAnswer || currentQuestion?.answer || 'No model answer available.'}
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="mb-2 text-lg font-semibold text-white">
                                                Examiner feedback
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100">
                                                {submissionResult.feedback || 'Your answer is incorrect.'}
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="mb-2 text-lg font-semibold text-white">
                                                Common mistake note
                                            </div>
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100">
                                                {submissionResult.commonMistake || 'Check your substitution and arithmetic carefully.'}
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="mb-2 text-lg font-semibold text-white">
                                                Next recommended action
                                            </div>
                                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-slate-100">
                                                {nextRecommendedAction}
                                            </div>
                                        </div>

                                        {(submissionResult.errorTags?.length ||
                                            submissionResult.skillGaps?.length ||
                                            submissionResult.diagnostics) && (
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDebug((prev) => !prev)}
                                                        className="text-sm text-slate-300 underline"
                                                    >
                                                        {showDebug ? 'Hide debug' : 'Show debug'}
                                                    </button>

                                                    {showDebug && (
                                                        <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
                                                            {submissionResult.errorTags?.length ? (
                                                                <div>
                                                                    <div className="mb-1 font-semibold text-white">errorTags</div>
                                                                    <pre className="overflow-x-auto whitespace-pre-wrap">
                                                                        {JSON.stringify(submissionResult.errorTags, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            ) : null}

                                                            {submissionResult.skillGaps?.length ? (
                                                                <div>
                                                                    <div className="mb-1 font-semibold text-white">skillGaps</div>
                                                                    <pre className="overflow-x-auto whitespace-pre-wrap">
                                                                        {JSON.stringify(submissionResult.skillGaps, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            ) : null}

                                                            {submissionResult.diagnostics ? (
                                                                <div>
                                                                    <div className="mb-1 font-semibold text-white">diagnostics</div>
                                                                    <pre className="overflow-x-auto whitespace-pre-wrap">
                                                                        {JSON.stringify(submissionResult.diagnostics, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                )}

                                {explainText && (
                                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-slate-100">
                                        <div className="mb-2 font-semibold text-violet-300">
                                            Worked explanation
                                        </div>
                                        <div className="whitespace-pre-line">{explainText}</div>
                                    </div>
                                )}

                                {similarQuestionText && (
                                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-slate-100">
                                        <div className="mb-2 font-semibold text-emerald-300">
                                            Similar Question
                                        </div>
                                        <div>{similarQuestionText}</div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                                    <div className="mb-4 text-xl font-semibold text-white">
                                        Learning support
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleHint(1)}
                                            disabled={loadingHint1 || !currentQuestion}
                                            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
                                        >
                                            {loadingHint1 ? 'Loading...' : 'Hint 1'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleHint(2)}
                                            disabled={loadingHint2 || !currentQuestion}
                                            className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50"
                                        >
                                            {loadingHint2 ? 'Loading...' : 'Hint 2'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExplain}
                                            disabled={loadingExplain || !currentQuestion}
                                            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                                        >
                                            {loadingExplain ? 'Loading...' : 'Explain'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSimilarQuestion}
                                            disabled={loadingSimilar || !currentQuestion}
                                            className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            {loadingSimilar ? 'Loading...' : 'Try Similar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={moveNext}
                                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Next Question
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}