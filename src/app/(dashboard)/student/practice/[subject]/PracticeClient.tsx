'use client';

import { TopicProgressRow } from '@/lib/apiClient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    aiExplain,
    aiHint,
    aiSimilarQuestion,
    fetchPracticeQuestions,
    fetchSimilarQuestions,
    submitAnswer,
} from '@/lib/apiClient';
import { PracticeQuestion } from '@/types/question';
import { TopicGroup } from '@/types/topic';

type TopicStatus = 'Not started' | 'Early signal' | 'Weak' | 'Monitor' | 'Strong';

type SubmissionResult = {
    correct?: boolean | null;
    score?: number | null;
    maxScore?: number | null;
    feedback?: string;
    explanation?: string | null;
    workedSolution?: string | null;
    errorTags?: string[];
    skillGaps?: string[];
    diagnostics?: Record<string, any>;
    commonMistake?: string | null;
    modelAnswer?: string;
    submittedAnswer?: string;
    wasSkipped?: boolean;
    topicProgress?: {
        subjectCode?: string | null;
        topicCode: string;
        topicName?: string | null;
        strandCode?: string | null;
        strandName?: string | null;
        attempted: number;
        correct: number;
        accuracy: number;
        masteryPercent: number;
        status: TopicStatus;
    } | null;
};

type TopicMeta = {
    attempted: number;
    available: number;
    target: number;
    mastery: number;
    status: TopicStatus;
};

type LocalTopicProgress = {
    attempted: number;
    correct: number;
    status?: TopicStatus;
};

function getStatusFromMastery(mastery: number, attempted: number): TopicStatus {
    if (attempted === 0) return 'Not started';
    if (attempted < 3) return 'Early signal';
    if (mastery < 50) return 'Weak';
    if (mastery < 75) return 'Monitor';
    return 'Strong';
}

function statusClasses(status: TopicStatus) {
    switch (status) {
        case 'Weak':
            return 'bg-red-500/15 text-red-300 border-red-500/20';
        case 'Monitor':
            return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
        case 'Strong':
            return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
        case 'Early signal':
            return 'bg-sky-500/15 text-sky-300 border-sky-500/20';
        default:
            return 'bg-slate-500/15 text-slate-300 border-white/10';
    }
}

function formatDifficultyLabel(value?: string | null) {
    const raw = String(value ?? '').trim().toLowerCase();
    if (!raw) return 'Unspecified';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getQuestionId(question: PracticeQuestion | null | undefined): string {
    return String((question as any)?.id ?? (question as any)?.questionCode ?? '');
}

export default function PracticeClient({
    initialQuestions,
    subject,
    examKey,
    currentUserId,
    initialTopicCode = 'MM_FUNC_BASICS',
    topicCounts = {},
    topicGroups = [],
    initialTopicProgress = [],
}: {
    initialQuestions: PracticeQuestion[];
    subject: string;
    examKey?: string;
    currentUserId?: number;
    initialTopicCode?: string;
    topicCounts?: Record<string, number>;
    topicGroups?: TopicGroup[];
    initialTopicProgress?: TopicProgressRow[];
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
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingTopicQuestions, setLoadingTopicQuestions] = useState(false);

    const topicLoadRequestRef = useRef(0);
    const hasMountedDifficultyRef = useRef(false);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

    const [localTopicProgress, setLocalTopicProgress] = useState<Record<string, LocalTopicProgress>>(() => {
        const map: Record<string, LocalTopicProgress> = {};
        for (const row of initialTopicProgress) {
            map[row.topicCode] = {
                attempted: row.attempts,
                correct: row.correct,
                status: getStatusFromMastery(
                    row.attempts > 0 ? Math.round((row.correct / row.attempts) * 100) : 0,
                    row.attempts
                ),
            };
        }
        return map;
    });

    const [seenQuestionIdsByTopic, setSeenQuestionIdsByTopic] = useState<Record<string, string[]>>(() => {
        const first = initialQuestions?.[0];
        if (!first || !initialTopicCode) return {};
        const firstId = getQuestionId(first);
        return firstId ? { [initialTopicCode]: [firstId] } : {};
    });

    const [recentQuestionIdsByTopic, setRecentQuestionIdsByTopic] = useState<Record<string, string[]>>(() => {
        const first = initialQuestions?.[0];
        if (!first || !initialTopicCode) return {};
        const firstId = getQuestionId(first);
        return firstId ? { [initialTopicCode]: [firstId] } : {};
    });

    const currentQuestion = questions[currentIndex] ?? null;
    const hasResolvedCurrent = Boolean(submissionResult);

    const groupedTopics = useMemo(() => {
        const allowed = new Set([
            'Functions & Graphs',
            'Algebra',
            'Calculus',
            'Probability & Statistics',
        ]);

        const merged = new Map<
            string,
            {
                strandCode: string;
                strandName: string;
                topics: NonNullable<TopicGroup['topics']>;
            }
        >();

        for (const group of topicGroups) {
            if (!allowed.has(group.strandName)) continue;

            const key = (group.strandName || '').trim();

            if (!merged.has(key)) {
                merged.set(key, {
                    strandCode: group.strandCode,
                    strandName: group.strandName,
                    topics: [],
                });
            }

            const entry = merged.get(key)!;
            const seenTopicCodes = new Set(entry.topics.map((t) => t.topicCode));

            for (const topic of group.topics ?? []) {
                if (!seenTopicCodes.has(topic.topicCode)) {
                    entry.topics.push(topic);
                    seenTopicCodes.add(topic.topicCode);
                }
            }
        }

        return Array.from(merged.values()).sort((a, b) => {
            const order = [
                'Functions & Graphs',
                'Algebra',
                'Calculus',
                'Probability & Statistics',
            ];
            return order.indexOf(a.strandName) - order.indexOf(b.strandName);
        });
    }, [topicGroups]);

    useEffect(() => {
        const initialState: Record<string, boolean> = {};
        for (const group of groupedTopics) {
            const hasSelected = group.topics.some((t) => t.topicCode === selectedTopicCode);
            initialState[group.strandCode] = hasSelected;
        }
        setOpenGroups((prev) => ({ ...initialState, ...prev }));
    }, [groupedTopics, selectedTopicCode]);

    const topicMetaMap = useMemo(() => {
        const map: Record<string, TopicMeta> = {};

        for (const group of groupedTopics) {
            for (const topic of group.topics) {
                const available = topicCounts[topic.topicCode] ?? 0;
                const target = topic.questionCount ?? available;
                const local = localTopicProgress[topic.topicCode] ?? { attempted: 0, correct: 0 };

                const attempted = local.attempted;
                const mastery =
                    attempted > 0 ? Math.round((local.correct / attempted) * 100) : 0;

                map[topic.topicCode] = {
                    attempted,
                    available,
                    target,
                    mastery,
                    status: local.status ?? getStatusFromMastery(mastery, attempted),
                };
            }
        }

        return map;
    }, [groupedTopics, topicCounts, localTopicProgress]);

    const activeTopicMeta: TopicMeta = topicMetaMap[selectedTopicCode] || {
        attempted: 0,
        available: 0,
        target: 0,
        mastery: 0,
        status: 'Not started',
    };

    const currentTopicName = useMemo(() => {
        for (const group of groupedTopics) {
            const topic = group.topics.find((t) => t.topicCode === selectedTopicCode);
            if (topic) return topic.name;
        }
        return 'Topic';
    }, [groupedTopics, selectedTopicCode]);

    const currentDifficultyLabel = useMemo(
        () => formatDifficultyLabel((currentQuestion as any)?.difficulty),
        [currentQuestion]
    );

    const filteredQuestionCount = questions.length;

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

    const markQuestionAsSeen = (topicCode: string, question: PracticeQuestion | null | undefined) => {
        const qid = getQuestionId(question);
        if (!qid) return;

        setSeenQuestionIdsByTopic((prev) => {
            const existing = prev[topicCode] ?? [];
            if (existing.includes(qid)) return prev;
            return {
                ...prev,
                [topicCode]: [...existing, qid],
            };
        });
    };

    const markQuestionAsRecent = (topicCode: string, question: PracticeQuestion | null | undefined) => {
        const qid = getQuestionId(question);
        if (!qid) return;

        setRecentQuestionIdsByTopic((prev) => {
            const existing = prev[topicCode] ?? [];
            const next = [qid, ...existing.filter((id) => id !== qid)].slice(0, 3);
            return {
                ...prev,
                [topicCode]: next,
            };
        });
    };

    const chooseNextSessionQuestion = (
        topicCode: string,
        pool: PracticeQuestion[],
        excludeCurrentId?: string
    ): PracticeQuestion | null => {
        if (!Array.isArray(pool) || pool.length === 0) return null;

        const seenIds = seenQuestionIdsByTopic[topicCode] ?? [];
        const recentIds = recentQuestionIdsByTopic[topicCode] ?? [];

        const basePool = pool.filter((q) => {
            const qid = getQuestionId(q);
            if (!qid) return true;
            if (excludeCurrentId && qid === excludeCurrentId) return false;
            return true;
        });

        const unseenAndNotRecent = basePool.filter((q) => {
            const qid = getQuestionId(q);
            return !seenIds.includes(qid) && !recentIds.includes(qid);
        });
        if (unseenAndNotRecent.length > 0) return unseenAndNotRecent[0];

        const unseen = basePool.filter((q) => {
            const qid = getQuestionId(q);
            return !seenIds.includes(qid);
        });
        if (unseen.length > 0) return unseen[0];

        const seenButNotRecent = basePool.filter((q) => {
            const qid = getQuestionId(q);
            return !recentIds.includes(qid);
        });
        if (seenButNotRecent.length > 0) return seenButNotRecent[0];

        return basePool[0] ?? null;
    };

    const loadQuestionsForTopic = async (
        topicCode: string,
        opts?: { resetSeen?: boolean }
    ) => {
        setLoadingTopicQuestions(true);
        const requestId = ++topicLoadRequestRef.current;

        try {
            if (opts?.resetSeen) {
                setSeenQuestionIdsByTopic((prev) => ({
                    ...prev,
                    [topicCode]: [],
                }));
                setRecentQuestionIdsByTopic((prev) => ({
                    ...prev,
                    [topicCode]: [],
                }));
            }

            const nextQuestions = await fetchPracticeQuestions(subject, topicCode);
            const filtered =
                difficultyFilter === 'all'
                    ? nextQuestions
                    : nextQuestions.filter((q: any) => q.difficulty === difficultyFilter);

            const questionList = Array.isArray(filtered) ? filtered : [];
            const firstQuestion = questionList[0] ?? null;

            if (requestId !== topicLoadRequestRef.current) return;

            setQuestions(questionList);
            setCurrentIndex(0);
            setUserAnswer('');
            resetSupportState();

            if (firstQuestion) {
                const firstId = getQuestionId(firstQuestion);
                setSeenQuestionIdsByTopic((prev) => ({
                    ...prev,
                    [topicCode]: firstId ? [firstId] : [],
                }));
                setRecentQuestionIdsByTopic((prev) => ({
                    ...prev,
                    [topicCode]: firstId ? [firstId] : [],
                }));
            }
        } catch (error) {
            if (requestId !== topicLoadRequestRef.current) return;
            console.error('Failed to load topic questions', error);
            setQuestions([]);
            setCurrentIndex(0);
            setUserAnswer('');
            resetSupportState();
        } finally {
            if (requestId === topicLoadRequestRef.current) {
                setLoadingTopicQuestions(false);
            }
        }
    };

    const startPractice = async (topicCode: string) => {
        setSelectedTopicCode(topicCode);
        await loadQuestionsForTopic(topicCode, { resetSeen: true });
    };

    useEffect(() => {
        if (!selectedTopicCode) return;

        if (!hasMountedDifficultyRef.current) {
            hasMountedDifficultyRef.current = true;
            return;
        }

        void loadQuestionsForTopic(selectedTopicCode, { resetSeen: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficultyFilter]);

    const handleSubmit = async () => {
        if (!currentQuestion || !userAnswer.trim() || loadingSubmit || hasResolvedCurrent) return;

        try {
            setLoadingSubmit(true);

            const result = await submitAnswer(
                String((currentQuestion as any).id),
                userAnswer,
                examKey,
                hintLevelUsed,
                currentUserId
            );

            const topicProgress = result?.topicProgress ?? null;

            setSubmissionResult({
                ...result,
                feedback:
                    result?.explanation ||
                    result?.workedSolution ||
                    'Your answer has been marked.',
                explanation: result?.explanation ?? null,
                workedSolution: result?.workedSolution ?? result?.explanation ?? null,
                modelAnswer:
                    result?.correctAnswer ||
                    (currentQuestion as any).answer ||
                    'No model answer available.',
                commonMistake:
                    result?.commonMistake ||
                    (result?.errorTags?.length
                        ? result.errorTags.join(', ')
                        : result?.diagnostics?.mistakeType ||
                        'Check substitution, setup, and arithmetic carefully.'),
            });

            if (topicProgress?.topicCode) {
                setLocalTopicProgress((prev) => ({
                    ...prev,
                    [topicProgress.topicCode]: {
                        attempted: topicProgress.attempted,
                        correct: topicProgress.correct,
                        status: topicProgress.status,
                    },
                }));
            } else {
                setLocalTopicProgress((prev) => {
                    const current = prev[selectedTopicCode] ?? { attempted: 0, correct: 0 };
                    const nextAttempted = current.attempted + 1;
                    const nextCorrect = current.correct + (result?.correct ? 1 : 0);

                    return {
                        ...prev,
                        [selectedTopicCode]: {
                            attempted: nextAttempted,
                            correct: nextCorrect,
                            status: getStatusFromMastery(
                                nextAttempted > 0
                                    ? Math.round((nextCorrect / nextAttempted) * 100)
                                    : 0,
                                nextAttempted
                            ),
                        },
                    };
                });
            }
        } catch (error) {
            console.error('Submit failed', error);
            setSubmissionResult({
                correct: false,
                score: 0,
                maxScore: currentQuestion?.marks ?? 1,
                feedback: 'Unable to submit answer at the moment.',
                explanation: 'Unable to submit answer at the moment.',
                workedSolution: null,
                modelAnswer: (currentQuestion as any)?.answer || 'No model answer available.',
                commonMistake: 'Submission service unavailable.',
            });
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleSkip = () => {
        if (!currentQuestion || hasResolvedCurrent) return;

        setSubmissionResult({
            correct: null,
            score: null,
            maxScore: currentQuestion?.marks ?? 1,
            feedback: 'Question skipped. No attempt was recorded. Move on now, or retry this question before continuing.',
            explanation: null,
            workedSolution: null,
            modelAnswer: (currentQuestion as any)?.answer || 'No model answer available.',
            commonMistake: null,
            wasSkipped: true,
        });
    };

    const handleRetry = () => {
        setUserAnswer('');
        resetSupportState();
    };

    const handleHint = async (level: 1 | 2) => {
        if (!currentQuestion) return;

        const setLoading = level === 1 ? setLoadingHint1 : setLoadingHint2;
        const setText = level === 1 ? setHint1Text : setHint2Text;

        try {
            setLoading(true);

            const res = await aiHint({
                subject,
                skillCode: (currentQuestion as any).skillCode || selectedTopicCode,
                question: (currentQuestion as any).prompt,
                studentAnswer: userAnswer,
                level,
            });

            setText(
                res?.hint ||
                (res as any)?.finalAdvice ||
                (Array.isArray((res as any)?.stepByStep)
                    ? (res as any).stepByStep.join(' ')
                    : '') ||
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
                skillCode: (currentQuestion as any).skillCode || selectedTopicCode,
                question: (currentQuestion as any).prompt,
                studentAnswer: userAnswer,
                correctAnswer: (currentQuestion as any).answer || '',
            });

            const parts: string[] = [];

            if (typeof (res as any)?.mistakeType === 'string' && (res as any).mistakeType.trim()) {
                parts.push(`Mistake type: ${(res as any).mistakeType}`);
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

            if (typeof (res as any)?.explanation === 'string' && (res as any).explanation.trim()) {
                parts.unshift((res as any).explanation);
            }

            if (typeof (res as any)?.message === 'string' && (res as any).message.trim()) {
                parts.unshift((res as any).message);
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
                    questionId: String((currentQuestion as any).id),
                    skillCode: (currentQuestion as any).skillCode || undefined,
                    difficulty: (currentQuestion as any).difficulty || undefined,
                    skillGaps: submissionResult?.skillGaps,
                    limit: 5,
                });

                if (Array.isArray(similar) && similar.length > 0) {
                    const selected = chooseNextSessionQuestion(
                        selectedTopicCode,
                        similar,
                        getQuestionId(currentQuestion)
                    );

                    if (selected) {
                        setQuestions([selected]);
                        setCurrentIndex(0);
                        setUserAnswer('');
                        resetSupportState();
                        markQuestionAsSeen(selectedTopicCode, selected);
                        markQuestionAsRecent(selectedTopicCode, selected);
                        loaded = true;
                    }
                }
            } catch (dbError) {
                console.warn('DB similar question failed', dbError);
            }

            if (!loaded) {
                const aiRes = await aiSimilarQuestion({
                    subject,
                    skillCode: (currentQuestion as any).skillCode || selectedTopicCode,
                    question: (currentQuestion as any).prompt,
                });

                setSimilarQuestionText(
                    aiRes?.question ||
                    (aiRes as any)?.similarQuestion ||
                    (aiRes as any)?.message ||
                    'No similar question available.'
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
        if (!hasResolvedCurrent && currentQuestion) return;

        if (questions.length > 0) {
            const nextQuestion = chooseNextSessionQuestion(
                selectedTopicCode,
                questions,
                getQuestionId(currentQuestion)
            );

            if (nextQuestion) {
                const nextId = getQuestionId(nextQuestion);
                const nextIdx = questions.findIndex((q) => getQuestionId(q) === nextId);

                if (nextIdx >= 0) {
                    setCurrentIndex(nextIdx);
                    setUserAnswer('');
                    resetSupportState();
                    markQuestionAsSeen(selectedTopicCode, nextQuestion);
                    markQuestionAsRecent(selectedTopicCode, nextQuestion);
                    return;
                }
            }
        }

        try {
            const nextQuestions = await fetchPracticeQuestions(subject, selectedTopicCode);
            const filtered =
                difficultyFilter === 'all'
                    ? nextQuestions
                    : nextQuestions.filter((q: any) => q.difficulty === difficultyFilter);

            const pool = Array.isArray(filtered) ? filtered : [];
            const nextQuestion = chooseNextSessionQuestion(
                selectedTopicCode,
                pool,
                getQuestionId(currentQuestion)
            );

            if (nextQuestion) {
                const nextId = getQuestionId(nextQuestion);
                const nextIdx = pool.findIndex((q) => getQuestionId(q) === nextId);
                setQuestions(pool);
                setCurrentIndex(nextIdx >= 0 ? nextIdx : 0);
                setUserAnswer('');
                resetSupportState();
                markQuestionAsSeen(selectedTopicCode, nextQuestion);
                markQuestionAsRecent(selectedTopicCode, nextQuestion);
            } else {
                setQuestions(pool);
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
        if (submissionResult.wasSkipped) {
            return 'You skipped this question. Retry it now or move to the next question.';
        }
        if (submissionResult.correct) {
            return 'Move to the next question or try a similar one for reinforcement.';
        }
        return 'Review the worked solution, then retry this question or try a similar one.';
    }, [submissionResult]);

    return (
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-5">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <div className="text-sm font-medium uppercase tracking-wide text-slate-400">
                        Topic filters
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-white">Choose your practice area</h2>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm text-slate-300">Difficulty filter</label>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => {
                                setUserAnswer('');
                                resetSupportState();
                                setDifficultyFilter(e.target.value as any);
                            }}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                        Progress now uses stored attempt data for this student.
                    </div>
                </section>

                <section className="space-y-4">
                    {groupedTopics.map((group) => {
                        const isOpen = !!openGroups[group.strandCode];

                        return (
                            <div
                                key={group.strandName}
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
                                        className={`text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''}`}
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
                                                available: topicCounts[topic.topicCode] ?? 0,
                                                target: topic.questionCount ?? topicCounts[topic.topicCode] ?? 0,
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
                                                                {meta.attempted}/{meta.available} attempted
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
                                                                {meta.available} available
                                                            </span>
                                                            {meta.target !== meta.available ? (
                                                                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                                                                    {meta.target} target
                                                                </span>
                                                            ) : null}
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                            {currentTopicName}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            Difficulty: {currentDifficultyLabel}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            Session set: {filteredQuestionCount}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            Available: {activeTopicMeta.available}/{activeTopicMeta.target} target
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            Attempted: {activeTopicMeta.attempted}/{activeTopicMeta.available}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            Mastery: {activeTopicMeta.mastery}%
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(activeTopicMeta.status)}`}>
                            {activeTopicMeta.status}
                        </span>
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300">
                        Question {questions.length === 0 ? 0 : currentIndex + 1} of {questions.length}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                    {loadingTopicQuestions ? (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center">
                            <div className="text-lg font-semibold text-white">Loading questions...</div>
                            <div className="mt-2 text-sm text-slate-300">
                                Preparing your practice set for this topic.
                            </div>
                        </div>
                    ) : !currentQuestion ? (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center">
                            <div className="text-xl font-semibold text-white">
                                No student-ready questions yet
                            </div>
                            <div className="mt-3 text-sm leading-6 text-slate-300">
                                This topic has {activeTopicMeta.available} active question
                                {activeTopicMeta.available === 1 ? '' : 's'} available for students
                                {activeTopicMeta.target > 0
                                    ? `, with a target set of ${activeTopicMeta.target}.`
                                    : '.'}{' '}
                                Draft and QA questions stay hidden until approved.
                            </div>
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => void loadQuestionsForTopic(selectedTopicCode, { resetSeen: true })}
                                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                                >
                                    Retry loading
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDifficultyFilter('all')}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Reset difficulty filter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="mb-3 text-sm text-slate-400">Current question</div>
                                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-2xl font-medium text-white">
                                    {(currentQuestion as any)?.prompt || 'No question available for this topic yet.'}
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
                                    disabled={hasResolvedCurrent}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-lg text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                                />
                            </div>

                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={!currentQuestion || !userAnswer.trim() || loadingSubmit || hasResolvedCurrent}
                                            className="rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loadingSubmit ? 'Submitting...' : 'Submit Answer'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSkip}
                                            disabled={!currentQuestion || hasResolvedCurrent || loadingSubmit}
                                            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Skip
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
                                                className={`text-2xl font-bold ${submissionResult.wasSkipped
                                                        ? 'text-sky-300'
                                                        : submissionResult.correct
                                                            ? 'text-emerald-400'
                                                            : 'text-red-400'
                                                    }`}
                                            >
                                                {submissionResult.wasSkipped
                                                    ? 'Skipped'
                                                    : submissionResult.correct
                                                        ? 'Correct'
                                                        : 'Incorrect'}
                                            </div>

                                            <div className="mt-2 text-lg text-slate-300">
                                                Marks:{' '}
                                                <span className="font-semibold text-white">
                                                    {submissionResult.score ?? 0}
                                                </span>
                                                <span className="text-slate-400"> / {submissionResult.maxScore ?? 1}</span>
                                            </div>

                                            {submissionResult.topicProgress && (
                                                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-slate-100">
                                                    <div className="font-semibold text-white">
                                                        Updated topic progress
                                                    </div>
                                                    <div className="mt-1">
                                                        {submissionResult.topicProgress.attempted} attempted ·{' '}
                                                        {submissionResult.topicProgress.correct} correct · Mastery{' '}
                                                        {submissionResult.topicProgress.masteryPercent}% ·{' '}
                                                        {submissionResult.topicProgress.status}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-5">
                                                <div className="mb-2 text-lg font-semibold text-white">
                                                    Accepted answer
                                                </div>
                                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100">
                                                    {submissionResult.modelAnswer ||
                                                        (currentQuestion as any)?.answer ||
                                                        'No model answer available.'}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 text-lg font-semibold text-white">
                                                    Worked solution
                                                </div>
                                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100 whitespace-pre-line">
                                                    {submissionResult.workedSolution ||
                                                        submissionResult.explanation ||
                                                        submissionResult.feedback ||
                                                        'No worked solution available yet.'}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 text-lg font-semibold text-white">
                                                    Common mistake note
                                                </div>
                                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-100">
                                                    {submissionResult.commonMistake ||
                                                        (submissionResult.wasSkipped
                                                            ? 'No marking was recorded because this question was skipped.'
                                                            : 'Check your substitution and arithmetic carefully.')}
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

                                            <div className="mt-5 flex flex-wrap gap-3">
                                                {!submissionResult.correct && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRetry}
                                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                                    >
                                                        Retry this question
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={moveNext}
                                                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                                                >
                                                    Next Question
                                                </button>
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
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
