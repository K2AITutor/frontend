'use client';

import { TopicProgressRow } from '@/lib/apiClient';
import Link from 'next/link';
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
import { HybridMarkingBadge } from '@/components/marking/HybridMarkingBadge';
import { ConfidenceMeter } from '@/components/marking/ConfidenceMeter';
import { ErrorTagPicker } from '@/components/marking/ErrorTagPicker';
import { MarkingSourceTimeline } from '@/components/marking/MarkingSourceTimeline';
import type { HybridMarkingResult } from '@/lib/types/marking';

type TopicStatus = 'Not started' | 'Early signal' | 'Weak' | 'Monitor' | 'Medium' | 'Strong';

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
    submissionId?: string;
    humanReviewPending?: boolean;
    aiMarking?: Record<string, any>; // any: shape varies by question type
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

type PracticeClientMode = 'landing' | 'session';

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
            return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
        case 'Monitor':
            return 'bg-amber-500/10 text-amber-700 dark:text-amber-700 dark:text-amber-300 border-amber-500/20';
        case 'Strong':
            return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
        case 'Early signal':
            return 'bg-sky-500/10 text-sky-700 dark:text-sky-700 dark:text-sky-300 border-sky-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
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
    mode = 'session',
    showSelector = true,
    sessionHrefBase = '/student/practice/math-methods/topic/session',
}: {
    initialQuestions: PracticeQuestion[];
    subject: string;
    examKey?: string;
    currentUserId?: number;
    initialTopicCode?: string;
    topicCounts?: Record<string, number>;
    topicGroups?: TopicGroup[];
    initialTopicProgress?: TopicProgressRow[];
    mode?: PracticeClientMode;
    showSelector?: boolean;
    sessionHrefBase?: string;
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

    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [topicSearch, setTopicSearch] = useState('');
    const [selectedStrandCode, setSelectedStrandCode] = useState('');

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
        if (groupedTopics.length === 0) return;

        const selectedGroup = groupedTopics.find((group) =>
            group.topics.some((topic) => topic.topicCode === selectedTopicCode)
        );
        const selectedGroupCode = selectedGroup?.strandCode ?? groupedTopics[0]?.strandCode ?? '';

        setSelectedStrandCode((current) => {
            if (current && groupedTopics.some((group) => group.strandCode === current)) {
                return current;
            }
            return selectedGroupCode;
        });
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

    const selectedGroup = useMemo(() => {
        return groupedTopics.find((group) => group.strandCode === selectedStrandCode) ?? groupedTopics[0] ?? null;
    }, [groupedTopics, selectedStrandCode]);

    const selectedTopic = useMemo(() => {
        for (const group of groupedTopics) {
            const topic = group.topics.find((item) => item.topicCode === selectedTopicCode);
            if (topic) return topic;
        }
        return null;
    }, [groupedTopics, selectedTopicCode]);

    const visibleTopics = useMemo(() => {
        const term = topicSearch.trim().toLowerCase();
        const topics = selectedGroup?.topics ?? [];
        if (!term) return topics;

        return topics.filter((topic) => {
            return (
                topic.name.toLowerCase().includes(term) ||
                topic.topicCode.toLowerCase().includes(term)
            );
        });
    }, [selectedGroup, topicSearch]);

    const topicOverview = useMemo(() => {
        const topics = groupedTopics.flatMap((group) => group.topics);
        const totalAvailable = topics.reduce((sum, topic) => sum + (topicCounts[topic.topicCode] ?? 0), 0);
        const attempted = Object.values(localTopicProgress).reduce((sum, row) => sum + row.attempted, 0);
        const strong = topics.filter((topic) => topicMetaMap[topic.topicCode]?.status === 'Strong').length;

        return {
            topics: topics.length,
            totalAvailable,
            attempted,
            strong,
        };
    }, [groupedTopics, localTopicProgress, topicCounts, topicMetaMap]);

    const isLandingMode = mode === 'landing';

    const buildTopicSessionHref = (topicCode: string) =>
        `${sessionHrefBase}?topicCode=${encodeURIComponent(topicCode)}`;

    const topicCoverageRows = useMemo(() => {
        return groupedTopics.flatMap((group) =>
            group.topics.map((topic) => {
                const meta = topicMetaMap[topic.topicCode] || {
                    attempted: 0,
                    available: topicCounts[topic.topicCode] ?? 0,
                    target: topic.questionCount ?? topicCounts[topic.topicCode] ?? 0,
                    mastery: 0,
                    status: 'Not started' as const,
                };

                return {
                    strandName: group.strandName,
                    topicCode: topic.topicCode,
                    topicName: topic.name,
                    available: meta.available,
                    attempted: meta.attempted,
                    mastery: meta.mastery,
                    status: meta.status,
                };
            })
        );
    }, [groupedTopics, topicCounts, topicMetaMap]);

    const recommendedTopic = useMemo(() => {
        const candidates = topicCoverageRows.filter((row) => row.available > 0);
        if (candidates.length === 0) return null;

        const unattempted = candidates.find((row) => row.attempted === 0);
        if (unattempted) {
            return {
                ...unattempted,
                reason: 'Not attempted yet',
            };
        }

        const weakest = [...candidates].sort((a, b) => {
            if (a.mastery !== b.mastery) return a.mastery - b.mastery;
            return b.available - a.available;
        })[0];

        return weakest
            ? {
                ...weakest,
                reason: weakest.mastery < 75 ? 'Lowest current mastery' : 'Maintain fluency',
            }
            : null;
    }, [topicCoverageRows]);

    const currentDifficultyLabel = useMemo(
        () => formatDifficultyLabel(currentQuestion?.difficultyLevel),
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
                    : nextQuestions.filter(
                        (q: any) => String(q.difficultyLevel ?? '').toLowerCase() === difficultyFilter
                    );

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
                ...(result as any),
                feedback:
                    result?.explanation ||
                    result?.workedSolution ||
                    'Your answer has been marked.',
                explanation: result?.explanation ?? null,
                workedSolution: result?.workedSolution ?? result?.explanation ?? null,
                modelAnswer:
                    result?.correctAnswer ||
                    currentQuestion?.correctAnswer ||
                    'No model answer available.',
                commonMistake:
                    (result as any)?.commonMistake ||
                    (result?.errorTags?.length
                        ? result.errorTags.join(', ')
                        : (result?.diagnostics as any)?.mistakeType ||
                        'Check substitution, setup, and arithmetic carefully.'),
            });

            if (topicProgress?.topicCode) {
                setLocalTopicProgress((prev) => ({
                    ...prev,
                    [topicProgress.topicCode]: {
                        attempted: topicProgress.attempts,
                        correct: topicProgress.correct,
                        status: topicProgress.status as TopicStatus,
                    },
                }));
            }
 else {
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
                modelAnswer: currentQuestion?.correctAnswer || 'No model answer available.',
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
            modelAnswer: currentQuestion?.correctAnswer || 'No model answer available.',
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
                question: currentQuestion?.questionText ?? '',
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
                question: currentQuestion?.questionText ?? '',
                studentAnswer: userAnswer,
                correctAnswer: currentQuestion?.correctAnswer || '',
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
                    difficulty: currentQuestion?.difficultyLevel || undefined,
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
                    question: currentQuestion?.questionText ?? '',
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
                    : nextQuestions.filter(
                        (q: any) => String(q.difficultyLevel ?? '').toLowerCase() === difficultyFilter
                    );

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
        <div className={showSelector ? 'grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]' : 'space-y-6'}>
            {showSelector && (
            <aside className="space-y-5">
                <section className="rounded-xl border border-border bg-muted/50 p-5 shadow">
                    <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Select practice topic
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-foreground">Choose your focus</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Search within a study area, then start a focused practice set for one topic.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                        <div className="rounded-lg border border-border bg-card px-3 py-3">
                            <div className="text-lg font-semibold">{topicOverview.topics}</div>
                            <div className="text-xs text-muted-foreground">Topics</div>
                        </div>
                        <div className="rounded-lg border border-border bg-card px-3 py-3">
                            <div className="text-lg font-semibold">{topicOverview.totalAvailable}</div>
                            <div className="text-xs text-muted-foreground">Questions</div>
                        </div>
                        <div className="rounded-lg border border-border bg-card px-3 py-3">
                            <div className="text-lg font-semibold">{topicOverview.attempted}</div>
                            <div className="text-xs text-muted-foreground">Attempted</div>
                        </div>
                        <div className="rounded-lg border border-border bg-card px-3 py-3">
                            <div className="text-lg font-semibold">{topicOverview.strong}</div>
                            <div className="text-xs text-muted-foreground">Strong</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm text-muted-foreground">Difficulty filter</label>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => {
                                setUserAnswer('');
                                resetSupportState();
                                setDifficultyFilter(e.target.value as any);
                            }}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="all">All difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm text-muted-foreground">Search topic</label>
                        <input
                            value={topicSearch}
                            onChange={(event) => setTopicSearch(event.target.value)}
                            placeholder="Search topic name or code"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {groupedTopics.map((group) => {
                            const isActive = selectedGroup?.strandCode === group.strandCode;
                            const available = group.topics.reduce(
                                (sum, topic) => sum + (topicCounts[topic.topicCode] ?? 0),
                                0
                            );

                            return (
                                <button
                                    key={group.strandCode}
                                    type="button"
                                    onClick={() => setSelectedStrandCode(group.strandCode)}
                                    className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                                        isActive
                                            ? 'border-primary bg-primary/10 text-foreground'
                                            : 'border-border bg-card text-muted-foreground hover:border-ring hover:bg-accent'
                                    }`}
                                >
                                    <div className="font-semibold">{group.strandName}</div>
                                    <div className="mt-1 text-xs">{group.topics.length} topics &middot; {available} q</div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-muted/50 p-5 shadow">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                {selectedGroup?.strandName ?? 'Study area'}
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-foreground">Topics</h3>
                        </div>
                        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                            {visibleTopics.length} shown
                        </span>
                    </div>

                    <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
                        {visibleTopics.length === 0 ? (
                            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                                No topics match your search in this study area.
                            </div>
                        ) : (
                            visibleTopics.map((topic) => {
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
                                        className={`block w-full rounded-xl border px-4 py-3 text-left transition ${
                                            isActive
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-card hover:border-ring hover:bg-accent'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold text-foreground">
                                                    {topic.name}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {topic.topicCode}
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                    <span>{meta.attempted}/{meta.available} attempted</span>
                                                    <span>Mastery {meta.mastery}%</span>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-col items-end gap-2">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses(
                                                        meta.status
                                                    )}`}
                                                >
                                                    {meta.status}
                                                </span>
                                                <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                                                    {meta.available} q
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>
            </aside>
            )}

            <section className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-5 shadow">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="text-sm font-medium text-primary">
                                {selectedGroup?.strandName ?? 'Selected study area'}
                            </div>
                            <h2 className="mt-1 text-2xl font-bold text-foreground">
                                {selectedTopic?.name ?? currentTopicName}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {selectedTopicCode}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
                            <div className="rounded-lg border border-border bg-muted/50 px-3 py-3">
                                <div className="text-lg font-semibold">{activeTopicMeta.available}</div>
                                <div className="text-xs text-muted-foreground">Available</div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 px-3 py-3">
                                <div className="text-lg font-semibold">{activeTopicMeta.attempted}</div>
                                <div className="text-xs text-muted-foreground">Attempted</div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 px-3 py-3">
                                <div className="text-lg font-semibold">{activeTopicMeta.mastery}%</div>
                                <div className="text-xs text-muted-foreground">Mastery</div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 px-3 py-3">
                                <div className="text-lg font-semibold">{filteredQuestionCount}</div>
                                <div className="text-xs text-muted-foreground">Session</div>
                            </div>
                        </div>
                    </div>

                    {isLandingMode && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm leading-6 text-muted-foreground">
                                Start a dedicated session for this topic when you are ready to answer questions.
                                The session page keeps the practice workspace focused and easier to use.
                            </p>
                            <Link
                                href={buildTopicSessionHref(selectedTopicCode)}
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                            >
                                Start topic session
                            </Link>
                        </div>
                    )}
                </div>

                {isLandingMode ? (
                    <>
                        {recommendedTopic && (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                            Recommended next topic
                                        </div>
                                        <h3 className="mt-1 text-xl font-bold text-foreground">
                                            {recommendedTopic.topicName}
                                        </h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {recommendedTopic.strandName} · {recommendedTopic.reason} ·{' '}
                                            {recommendedTopic.available} question
                                            {recommendedTopic.available === 1 ? '' : 's'} available
                                        </p>
                                    </div>
                                    <Link
                                        href={buildTopicSessionHref(recommendedTopic.topicCode)}
                                        className="inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
                                    >
                                        Practise recommendation
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border border-border bg-card shadow">
                            <div className="border-b border-border p-5">
                                <h3 className="text-lg font-semibold text-foreground">Topic coverage</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Review available questions, attempts, and mastery before choosing a session.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">Study area</th>
                                            <th className="px-5 py-3 font-semibold">Topic</th>
                                            <th className="px-5 py-3 text-right font-semibold">Questions</th>
                                            <th className="px-5 py-3 text-right font-semibold">Attempted</th>
                                            <th className="px-5 py-3 text-right font-semibold">Mastery</th>
                                            <th className="px-5 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topicCoverageRows.map((row) => (
                                            <tr key={row.topicCode} className="border-b border-border last:border-b-0">
                                                <td className="px-5 py-4 text-muted-foreground">{row.strandName}</td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-foreground">{row.topicName}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">{row.topicCode}</div>
                                                </td>
                                                <td className="px-5 py-4 text-right text-foreground">{row.available}</td>
                                                <td className="px-5 py-4 text-right text-foreground">{row.attempted}</td>
                                                <td className="px-5 py-4 text-right text-foreground">{row.mastery}%</td>
                                                <td className="px-5 py-4">
                                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(row.status)}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground">
                            {currentTopicName}
                        </span>
                        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Difficulty: {currentDifficultyLabel}
                        </span>
                        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Session set: {filteredQuestionCount}
                        </span>
                        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Available: {activeTopicMeta.available}/{activeTopicMeta.target} target
                        </span>
                        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Attempted: {activeTopicMeta.attempted}/{activeTopicMeta.available}
                        </span>
                        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Mastery: {activeTopicMeta.mastery}%
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(activeTopicMeta.status)}`}>
                            {activeTopicMeta.status}
                        </span>
                    </div>

                    <div className="rounded-full border border-border bg-muted/50 px-5 py-2 text-sm text-muted-foreground">
                        Question {questions.length === 0 ? 0 : currentIndex + 1} of {questions.length}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow backdrop-blur">
                    {loadingTopicQuestions ? (
                        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
                            <div className="text-lg font-semibold text-foreground">Loading questions...</div>
                            <div className="mt-2 text-sm text-muted-foreground">
                                Preparing your practice set for this topic.
                            </div>
                        </div>
                    ) : !currentQuestion ? (
                        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
                            <div className="text-xl font-semibold text-foreground">
                                No student-ready questions yet
                            </div>
                            <div className="mt-3 text-sm leading-6 text-muted-foreground">
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
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                                >
                                    Retry loading
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDifficultyFilter('all')}
                                    className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
                                >
                                    Reset difficulty filter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="mb-3 text-sm text-muted-foreground">Current question</div>
                                <div data-testid="practice-question" className="rounded-lg border border-border bg-muted/50 p-5 text-2xl font-medium text-foreground">
                                    {currentQuestion?.questionText || 'No question available for this topic yet.'}
                                </div>
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-medium text-foreground">
                                    Your answer
                                </label>
                                <input
                                    data-testid="practice-answer"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Enter your answer"
                                    disabled={hasResolvedCurrent}
                                    className="w-full rounded-lg border border-border bg-background px-4 py-4 text-lg text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring disabled:cursor-not-allowed disabled:opacity-70"
                                />
                            </div>

                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <button
                                            data-testid="practice-submit"
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={!currentQuestion || !userAnswer.trim() || loadingSubmit || hasResolvedCurrent}
                                            className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loadingSubmit ? 'Submitting...' : 'Submit Answer'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSkip}
                                            disabled={!currentQuestion || hasResolvedCurrent || loadingSubmit}
                                            className="rounded-xl border border-border bg-muted/50 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Skip
                                        </button>

                                        {!submissionResult && (
                                            <button
                                                type="button"
                                                onClick={() => handleHint(1)}
                                                disabled={loadingHint1 || !currentQuestion}
                                                className="text-sm font-medium text-emerald-700 dark:text-emerald-300 underline underline-offset-4"
                                            >
                                                {loadingHint1 ? 'Loading hint...' : 'Need a hint?'}
                                            </button>
                                        )}
                                    </div>

                                    {hint1Text && (
                                        <div data-testid="ai-hint-1" className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-foreground">
                                            <div className="mb-2 font-semibold text-amber-700 dark:text-amber-300">Hint 1</div>
                                            <div className="whitespace-pre-line">{hint1Text}</div>
                                        </div>
                                    )}

                                    {hint2Text && (
                                        <div data-testid="ai-hint-2" className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4 text-foreground">
                                            <div className="mb-2 font-semibold text-orange-700 dark:text-orange-300">Hint 2</div>
                                            <div className="whitespace-pre-line">{hint2Text}</div>
                                        </div>
                                    )}

                                    {submissionResult && (
                                        <div data-testid="practice-feedback" className="rounded-lg border border-border bg-muted/50 p-5">
                                            <div
                                                className={`text-2xl font-bold ${submissionResult.wasSkipped
                                                        ? 'text-sky-700 dark:text-sky-300'
                                                        : submissionResult.correct
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {submissionResult.wasSkipped
                                                    ? 'Skipped'
                                                    : submissionResult.correct
                                                        ? 'Correct'
                                                        : 'Incorrect'}
                                            </div>

                                            <div className="mt-2 text-lg text-muted-foreground">
                                                Marks:{' '}
                                                <span className="font-semibold text-foreground">
                                                    {submissionResult.score ?? 0}
                                                </span>
                                                <span className="text-muted-foreground"> / {submissionResult.maxScore ?? 1}</span>
                                            </div>

                                            {submissionResult.topicProgress && (
                                                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-foreground">
                                                    <div className="font-semibold text-foreground">
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
                                                <div className="mb-2 text-lg font-semibold text-foreground">
                                                    Accepted answer
                                                </div>
                                                <div className="rounded-xl border border-border bg-muted/50 p-3 text-foreground">
                                                    {submissionResult.modelAnswer ||
                                                        currentQuestion?.correctAnswer ||
                                                        'No model answer available.'}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 text-lg font-semibold text-foreground">
                                                    Worked solution
                                                </div>
                                                <div className="rounded-xl border border-border bg-muted/50 p-3 text-foreground whitespace-pre-line">
                                                    {submissionResult.workedSolution ||
                                                        submissionResult.explanation ||
                                                        submissionResult.feedback ||
                                                        'No worked solution available yet.'}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 text-lg font-semibold text-foreground">
                                                    Common mistake note
                                                </div>
                                                <div className="rounded-xl border border-border bg-muted/50 p-3 text-foreground">
                                                    {submissionResult.commonMistake ||
                                                        (submissionResult.wasSkipped
                                                            ? 'No marking was recorded because this question was skipped.'
                                                            : 'Check your substitution and arithmetic carefully.')}
                                                </div>
                                            </div>

                                            {/* Hybrid marking enrichment */}
                                            {submissionResult.aiMarking && (() => {
                                                const am = submissionResult.aiMarking as HybridMarkingResult;
                                                return (
                                                    <div className="mt-5 space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                                                        <div className="text-base font-semibold text-foreground">AI Marking Details</div>

                                                        {/* pending review banner */}
                                                        {submissionResult.humanReviewPending && (
                                                            <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
                                                                <span>⏳</span>
                                                                <span>
                                                                    <strong>Awaiting teacher review.</strong>{' '}
                                                                    Your score may change after the teacher reviews it.
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Source badge + confidence */}
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <HybridMarkingBadge source={am.routingDecision?.chosenSource ?? 'rule'} />
                                                            <span className="text-sm text-muted-foreground">
                                                                Confidence: {Math.round((am.finalConfidence ?? 0) * 100)}%
                                                            </span>
                                                        </div>

                                                        <ConfidenceMeter value={am.finalConfidence ?? 0} />

                                                        {/* Error tags */}
                                                        {am.errorTags?.length > 0 && (
                                                            <div>
                                                                <p className="mb-1.5 text-xs text-muted-foreground">Detected Issues</p>
                                                                <ErrorTagPicker
                                                                    available={am.errorTags}
                                                                    value={am.errorTags.map((t: { tagCode: string }) => t.tagCode)}
                                                                    readOnly
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Source timeline */}
                                                        {am.sources?.length > 0 && (
                                                            <div>
                                                                <p className="mb-1.5 text-xs text-muted-foreground">Marking Sources</p>
                                                                <MarkingSourceTimeline
                                                                    sources={am.sources}
                                                                    routingDecision={am.routingDecision}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Link to full submission */}
                                                        {submissionResult.submissionId && (
                                                            <p className="text-xs text-muted-foreground">
                                                                <a
                                                                    href={`/student/submissions/${submissionResult.submissionId}`}
                                                                    className="underline hover:text-foreground"
                                                                >
                                                                    View full submission →
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            <div className="mt-5">
                                                <div className="mb-2 text-lg font-semibold text-foreground">
                                                    Next recommended action
                                                </div>
                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-foreground">
                                                    {nextRecommendedAction}
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap gap-3">
                                                {!submissionResult.correct && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRetry}
                                                        className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
                                                    >
                                                        Retry this question
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={moveNext}
                                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
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
                                                            className="text-sm text-muted-foreground underline"
                                                        >
                                                            {showDebug ? 'Hide debug' : 'Show debug'}
                                                        </button>

                                                        {showDebug && (
                                                            <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground">
                                                                {submissionResult.errorTags?.length ? (
                                                                    <div>
                                                                        <div className="mb-1 font-semibold text-foreground">errorTags</div>
                                                                        <pre className="overflow-x-auto whitespace-pre-wrap">
                                                                            {JSON.stringify(submissionResult.errorTags, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                ) : null}

                                                                {submissionResult.skillGaps?.length ? (
                                                                    <div>
                                                                        <div className="mb-1 font-semibold text-foreground">skillGaps</div>
                                                                        <pre className="overflow-x-auto whitespace-pre-wrap">
                                                                            {JSON.stringify(submissionResult.skillGaps, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                ) : null}

                                                                {submissionResult.diagnostics ? (
                                                                    <div>
                                                                        <div className="mb-1 font-semibold text-foreground">diagnostics</div>
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
                                        <div data-testid="ai-explanation" className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-4 text-foreground">
                                            <div className="mb-2 font-semibold text-violet-700 dark:text-violet-300">
                                                Worked explanation
                                            </div>
                                            <div className="whitespace-pre-line">{explainText}</div>
                                        </div>
                                    )}

                                    {similarQuestionText && (
                                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-foreground">
                                            <div className="mb-2 font-semibold text-emerald-700 dark:text-emerald-300">
                                                Similar Question
                                            </div>
                                            <div>{similarQuestionText}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-lg border border-border bg-card p-5">
                                        <div className="mb-4 text-xl font-semibold text-foreground">
                                            Learning support
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleHint(1)}
                                                disabled={loadingHint1 || !currentQuestion}
                                                className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-amber-400 disabled:opacity-50"
                                            >
                                                {loadingHint1 ? 'Loading...' : 'Hint 1'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleHint(2)}
                                                disabled={loadingHint2 || !currentQuestion}
                                                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-orange-400 disabled:opacity-50"
                                            >
                                                {loadingHint2 ? 'Loading...' : 'Hint 2'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleExplain}
                                                disabled={loadingExplain || !currentQuestion}
                                                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-violet-500 disabled:opacity-50"
                                            >
                                                {loadingExplain ? 'Loading...' : 'Explain'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleSimilarQuestion}
                                                disabled={loadingSimilar || !currentQuestion}
                                                className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/90 disabled:opacity-50"
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
                    </>
                )}
            </section>
        </div>
    );
}
