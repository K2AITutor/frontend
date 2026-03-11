"use client";

import { useMemo, useState } from "react";
import QuestionCard from "@/components/practice/QuestionCard";
import { MATH_METHODS_TOPICS } from "@/constants/mathMethodsTopics";
import {
    submitAnswer,
    aiExplain,
    aiSimilarQuestion,
    aiHint,
    fetchPracticeQuestions,
    getAdaptiveRecommendation,
} from "@/lib/apiClient";
import { PracticeQuestion } from "@/types/question";

type AdaptiveRecommendation = {
    reason: string;
    questions: PracticeQuestion[];
};

type MarkingResult = {
    correct: boolean | null;
    explanation?: string | null;
    skillGaps?: string[] | null;
    score?: number | null;
    maxScore?: number | null;
    errorTags?: string[] | null;
    aiExplanation?: string | null;
    diagnostics?: any;
};

const ERROR_TAG_MESSAGES: Record<string, string> = {
    "CALC_ERR.PRODUCT_RULE": "You did not apply the product rule.",
    "CALC_ERR.CHAIN_RULE": "You did not apply the chain rule correctly.",
    "CALC_ERR.QUOTIENT_RULE": "You did not apply the quotient rule correctly.",
    "CALC_ERR.TRIG_DERIVATIVE":
        "Incorrect derivative of a trigonometric function (check signs).",
    "INT_ERR.MISSING_CONSTANT": "You omitted the constant of integration (+C).",
    "INT_ERR.INCORRECT_BOUNDS": "The limits/bounds of integration are incorrect.",
    "INT_ERR.AREA_INTERPRET":
        "You treated signed area as area (consider splitting and taking absolute value).",
    "META_ERR.INTERVAL_NOTATION":
        "Interval/set notation is incorrect or not in the expected form.",
    "META_ERR.ENDPOINT_INCLUSION":
        "Check whether endpoints should be included (brackets vs parentheses).",
    "META_ERR.UNDEFINED_SYMBOL":
        "Your input could not be interpreted as a valid mathematical answer.",
    "ALG_ERR.SIGN": "There is a sign error in your working.",
    "ALG_ERR.SIMPLIFY": "Your final expression is not equivalent to the correct answer.",
    "ALG_ERR.ARITHMETIC": "There is an arithmetic error.",
    "FORMAT.NOT_EXACT":
        "An exact value is required. Do not use decimals unless the question allows it.",
    INCORRECT: "Your answer is incorrect.",
};

const ERROR_TAG_TUTOR_TIPS: Record<string, string> = {
    "CALC_ERR.PRODUCT_RULE": "Tip: For y = u·v, use (uv)' = u'v + uv'.",
    "CALC_ERR.CHAIN_RULE":
        "Tip: Differentiate the outer function, then multiply by the inner derivative.",
    "CALC_ERR.QUOTIENT_RULE": "Tip: For y = u/v, use (u/v)' = (u'v − uv')/v².",
    "CALC_ERR.TRIG_DERIVATIVE":
        "Tip: Remember d/dx(cos x) = −sin x and d/dx(sin x) = cos x.",
    "META_ERR.ENDPOINT_INCLUSION":
        "Tip: Use [ ] when the endpoint is included, and ( ) when it is not.",
    "INT_ERR.MISSING_CONSTANT": "Tip: If it’s an indefinite integral, always include + C.",
};

export default function PracticeClient({
    initialQuestions,
    subject,
    examKey,
}: {
    initialQuestions: PracticeQuestion[];
    subject: string;
    examKey?: string;
}) {
    const [questions, setQuestions] = useState<PracticeQuestion[]>(initialQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const question = questions[currentIndex] ?? null;

    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<MarkingResult | null>(null);
    const [explanation, setExplanation] = useState<any>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [showDebug, setShowDebug] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [isHinting, setIsHinting] = useState(false);

    const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
    const [hints, setHints] = useState<string[]>([]);

    const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(null);
    const [isRecLoading, setIsRecLoading] = useState(false);

    const resetHints = () => {
        setHintLevel(1);
        setHints([]);
    };

    const resetQuestionState = () => {
        setAnswer("");
        setResult(null);
        setExplanation(null);
        setSubmitError(null);
        resetHints();
    };

    const aiAvailable = useMemo(() => !!question?.skillCode, [question]);

    const displayedScore =
        result?.score != null ? result.score : result?.correct === true ? 1 : result?.correct === false ? 0 : null;

    const displayedMaxScore = result?.maxScore != null ? result.maxScore : result ? 1 : null;

    const errorTags = result?.errorTags ?? [];

    if (!question) {
        return (
            <div className="glass p-6">
                <h2 className="text-lg font-semibold text-foreground">No questions loaded.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    This usually means the selected topic has no seeded questions yet, or the frontend
                    subject/topic code does not match the backend data.
                </p>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!question) return;

        try {
            setIsSubmitting(true);
            setSubmitError(null);
            setExplanation(null);

            const res = await submitAnswer(String(question.id), answer, examKey);

            setResult({
                correct: res.correct,
                explanation: res.explanation,
                skillGaps: res.skillGaps,
                score: res.score,
                maxScore: res.maxScore,
                errorTags: res.errorTags,
                aiExplanation: res.aiExplanation,
                diagnostics: res.diagnostics,
            });

            if (!res.correct) {
                try {
                    setIsRecLoading(true);
                    const adaptive = await getAdaptiveRecommendation(subject);
                    if (adaptive?.questions?.length) {
                        setRecommendation({
                            reason: adaptive.reason || "Recommended practice based on your recent performance.",
                            questions: adaptive.questions,
                        });
                    }
                } catch (e) {
                    console.error("Adaptive recommendation failed:", e);
                } finally {
                    setIsRecLoading(false);
                }
            } else {
                setRecommendation(null);
            }
        } catch (err: any) {
            console.error("Submit failed:", err);
            setSubmitError(err?.message || "Failed to fetch");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExplain = async () => {
        if (!question || !aiAvailable || isExplaining) return;

        try {
            setIsExplaining(true);

            const ai = await aiExplain({
                subject,
                skillCode: question.skillCode!,
                question: question.prompt,
                studentAnswer: answer,
                correctAnswer: question.answer,
            });

            setExplanation(ai);
        } catch (err) {
            console.error("AI explain failed:", err);
        } finally {
            setIsExplaining(false);
        }
    };

    const handleHint = async () => {
        if (!question || !aiAvailable || isHinting || hintLevel > 3) return;

        try {
            setIsHinting(true);

            const res = await aiHint({
                subject,
                skillCode: question.skillCode!,
                question: question.prompt,
                studentAnswer: answer,
                level: hintLevel,
            });

            setHints((prev) => [...prev, res.hint]);
            setHintLevel((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
        } catch (err) {
            console.error("AI hint failed:", err);
        } finally {
            setIsHinting(false);
        }
    };

    const handleSimilar = async () => {
        if (!question || !aiAvailable) return;

        try {
            const next = await aiSimilarQuestion({
                subject,
                skillCode: question.skillCode!,
                question: question.prompt,
            });

            setExplanation({
                stepByStep: ["Try this similar question:"],
                finalAdvice: next.question,
            });

            resetQuestionState();
        } catch (err) {
            console.error("AI similar failed:", err);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex >= questions.length - 1) return;
        setCurrentIndex((i) => i + 1);
        setRecommendation(null);
        resetQuestionState();
    };

    const startPractice = async (topicCode: string) => {
        try {
            setSubmitError(null);
            const res = await fetchPracticeQuestions(subject, topicCode);
            setQuestions(res);
            setCurrentIndex(0);
            setRecommendation(null);
            resetQuestionState();
        } catch (err) {
            console.error("Failed to start practice:", err);
            setSubmitError("Failed to load questions for this topic.");
        }
    };

    const loadRecommendedSet = () => {
        if (!recommendation?.questions?.length) return;
        setQuestions(recommendation.questions);
        setCurrentIndex(0);
        resetQuestionState();
    };

    return (
        <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {MATH_METHODS_TOPICS.map((t) => (
                    <button
                        key={t.code}
                        onClick={() => startPractice(t.code)}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                    >
                        {t.name}
                    </button>
                ))}
            </div>

            <QuestionCard question={question} />

            <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex flex-wrap gap-3">
                <button
                    disabled={isSubmitting}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    onClick={handleSubmit}
                >
                    {isSubmitting ? "Checking..." : "Submit Answer"}
                </button>

                {result && currentIndex < questions.length - 1 && (
                    <button
                        className="rounded-lg bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600"
                        onClick={handleNextQuestion}
                    >
                        Next Question
                    </button>
                )}
            </div>

            {submitError && (
                <div className="glass p-4">
                    <p className="mb-1 font-semibold text-red-400">Submission error</p>
                    <p className="text-sm text-muted-foreground">{submitError}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        If this happens repeatedly, check backend logs for /questions/submit.
                    </p>
                </div>
            )}

            {recommendation && (
                <div className="glass p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Recommended Next</h3>
                        <button
                            onClick={loadRecommendedSet}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white transition hover:bg-emerald-500"
                        >
                            Load set
                        </button>
                    </div>

                    <p className="mb-2 text-sm text-muted-foreground">Reason: {recommendation.reason}</p>

                    <ul className="ml-6 list-disc text-sm text-muted-foreground">
                        {recommendation.questions.slice(0, 5).map((q) => (
                            <li key={q.id}>{q.prompt}</li>
                        ))}
                    </ul>
                </div>
            )}

            {result && (
                <div className="glass p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className={`font-semibold ${result.correct ? "text-green-400" : "text-red-400"}`}>
                                {result.correct ? "Correct" : "Incorrect"}
                            </p>

                            {displayedScore !== null && displayedMaxScore !== null && (
                                <p className="mt-1 text-muted-foreground">
                                    Marks:{" "}
                                    <span className="font-semibold text-foreground">
                                        {displayedScore} / {displayedMaxScore}
                                    </span>
                                </p>
                            )}
                        </div>

                        {isRecLoading && (
                            <div className="text-xs text-muted-foreground">Updating recommendations…</div>
                        )}
                    </div>

                    <div className="mt-3 border-t border-border pt-3">
                        <button
                            className="text-xs text-muted-foreground underline"
                            onClick={() => setShowDebug((v) => !v)}
                        >
                            {showDebug ? "Hide debug details" : "Show debug details"}
                        </button>

                        {showDebug && (
                            <div className="mt-2 space-y-2 text-xs text-foreground">
                                <div>
                                    <div className="text-muted-foreground">correct / score</div>
                                    <div>
                                        correct: <span className="font-semibold">{String(result.correct)}</span>, score:{" "}
                                        <span className="font-semibold">{String(result.score ?? displayedScore)}</span>, maxScore:{" "}
                                        <span className="font-semibold">{String(result.maxScore ?? displayedMaxScore)}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-muted-foreground">errorTags</div>
                                    <pre className="whitespace-pre-wrap break-words rounded bg-slate-900/50 p-2">
                                        {JSON.stringify(result.errorTags ?? [], null, 2)}
                                    </pre>
                                </div>

                                <div>
                                    <div className="text-muted-foreground">skillGaps</div>
                                    <pre className="whitespace-pre-wrap break-words rounded bg-slate-900/50 p-2">
                                        {JSON.stringify(result.skillGaps ?? [], null, 2)}
                                    </pre>
                                </div>

                                <div>
                                    <div className="text-muted-foreground">diagnostics</div>
                                    <pre className="whitespace-pre-wrap break-words rounded bg-slate-900/50 p-2">
                                        {JSON.stringify(result.diagnostics ?? {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {!result.correct && (
                        <div className="mt-3 text-foreground">
                            <p className="mb-2 font-semibold">Examiner feedback</p>

                            {errorTags.length > 0 ? (
                                <ul className="ml-6 list-disc space-y-1">
                                    {errorTags.map((tag) => (
                                        <li key={tag}>
                                            <span>{ERROR_TAG_MESSAGES[tag] ?? tag}</span>
                                            {ERROR_TAG_TUTOR_TIPS[tag] && (
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {ERROR_TAG_TUTOR_TIPS[tag]}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-muted-foreground">
                                    <p>
                                        No specific examiner tag was returned for this answer. This usually means the
                                        submission was invalid/unparseable, or the question doesn’t have tagged common
                                        wrong answers yet.
                                    </p>
                                    <p className="mt-2 text-sm">
                                        Tip: Try rewriting your answer in standard notation (e.g. use * for multiply,
                                        brackets for intervals, etc.).
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {!result.correct && result.explanation && (
                        <p className="mt-3 text-muted-foreground">Explanation: {result.explanation}</p>
                    )}

                    {aiAvailable && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white transition hover:bg-amber-500"
                                onClick={handleHint}
                                disabled={isHinting || hintLevel > 3}
                            >
                                {isHinting ? "Thinking..." : hintLevel <= 3 ? `Hint ${hintLevel}` : "No more hints"}
                            </button>

                            <button
                                className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition hover:bg-purple-500 disabled:opacity-50"
                                onClick={handleExplain}
                                disabled={isExplaining}
                            >
                                {isExplaining ? "Explaining..." : "Explain"}
                            </button>

                            <button
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500"
                                onClick={handleSimilar}
                            >
                                Similar Question
                            </button>
                        </div>
                    )}

                    {hints.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {hints.map((h, idx) => (
                                <div key={idx} className="glass p-3 text-sm text-foreground">
                                    <span className="font-semibold text-amber-400">Hint {idx + 1}:</span> {h}
                                </div>
                            ))}
                        </div>
                    )}

                    {explanation && (
                        <div className="glass mt-4 p-4">
                            <h3 className="mb-2 font-semibold text-foreground">AI Explanation</h3>
                            {Array.isArray(explanation.stepByStep) && explanation.stepByStep.length > 0 && (
                                <ol className="ml-6 list-decimal space-y-1 text-sm text-muted-foreground">
                                    {explanation.stepByStep.map((step: string, i: number) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ol>
                            )}
                            {explanation.finalAdvice && (
                                <p className="mt-3 text-sm text-foreground">{explanation.finalAdvice}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}