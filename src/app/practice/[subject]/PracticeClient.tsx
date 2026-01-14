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

// ✅ Shape of marking result coming back from backend
type MarkingResult = {
    correct: boolean;
    explanation?: string | null;

    // marking-engine fields
    score?: number | null;
    maxScore?: number | null;
    errorTags?: string[] | null;

    // optional extras
    aiExplanation?: string | null;
    diagnostics?: any;
};

// ✅ VCAA-style tag → message map (frontend tutor voice)
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
    "FORMAT.NOT_EXACT": "An exact value is required. Do not use decimals unless the question allows it.",
    

};

// ✅ Tag → next-step tip (short + actionable)
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
    /* ===================== QUESTION FLOW ===================== */
    const [questions, setQuestions] = useState<PracticeQuestion[]>(initialQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);

    const question = questions[currentIndex] ?? null;

    /* ===================== CORE STATE ===================== */
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<MarkingResult | null>(null);
    const [explanation, setExplanation] = useState<any>(null);

    // ✅ show submit errors instead of “nothing happens”
    const [submitError, setSubmitError] = useState<string | null>(null);

    /* ===================== LOADING STATES ===================== */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [isHinting, setIsHinting] = useState(false);

    /* ===================== HINT STATE ===================== */
    const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
    const [hints, setHints] = useState<string[]>([]);

    /* ===================== ADAPTIVE RECOMMENDATION ===================== */
    const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(
        null
    );
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

    if (!question) {
        return (
            <div className="p-8 text-center text-slate-300">
                <p>No questions loaded.</p>
            </div>
        );
    }

    // ✅ AI endpoints require skillCode
    const aiAvailable = Boolean(question.skillCode);

    // ✅ Robust marks display: use backend maxScore if present, else question.marks if present, else 1
    const maxMarks = useMemo(() => {
        const qMarks = (question as any)?.marks;
        return typeof qMarks === "number" && qMarks > 0 ? qMarks : 1;
    }, [question]);

    const displayedScore = useMemo(() => {
        if (!result) return null;
        const s = result.score;
        return typeof s === "number" ? s : result.correct ? maxMarks : 0;
    }, [result, maxMarks]);

    const displayedMaxScore = useMemo(() => {
        if (!result) return null;
        const ms = result.maxScore;
        return typeof ms === "number" && ms > 0 ? ms : maxMarks;
    }, [result, maxMarks]);

    const errorTags = useMemo(() => {
        const tags = result?.errorTags ?? [];
        return Array.isArray(tags) ? tags : [];
    }, [result]);

    /* ===================== HANDLERS ===================== */
    const handleSubmit = async () => {
        if (!question || isSubmitting) return;

        // ✅ clear previous state (prevents “sticky” UI)
        setResult(null);
        setExplanation(null);
        setSubmitError(null);

        try {
            setIsSubmitting(true);
            const res = (await submitAnswer(String(question.id), answer, examKey)) as MarkingResult;

            setResult(res);
            setExplanation(null);
            resetHints();

            // 🔁 Fetch adaptive recommendation AFTER marking
            try {
                setIsRecLoading(true);
                const rec = await getAdaptiveRecommendation(subject);
                setRecommendation(rec);
            } catch (e) {
                console.warn("Recommendation unavailable");
            } finally {
                setIsRecLoading(false);
            }
        } catch (err: any) {
            console.error("Submit failed:", err);
            setSubmitError(err?.message || "Submit failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExplain = async () => {
        if (!aiAvailable || isExplaining) return;

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
        if (!aiAvailable || isHinting || hintLevel > 3) return;

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
        if (!aiAvailable) return;

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

            // ✅ reset the current attempt state so user can answer again
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

    /* ===================== UI ===================== */
    return (
        <div className="space-y-6">
            <div className="text-sm text-slate-400">
                Question {currentIndex + 1} of {questions.length}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {MATH_METHODS_TOPICS.map((t) => (
                    <button
                        key={t.code}
                        onClick={() => startPractice(t.code)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
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
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg"
            />

            <button
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
                onClick={handleSubmit}
            >
                {isSubmitting ? "Checking..." : "Submit Answer"}
            </button>

            {/* ✅ show submit errors instead of silently failing */}
            {submitError && (
                <div className="glass p-4 text-red-300">
                    <p className="font-semibold mb-1">Submission error</p>
                    <p className="text-sm text-slate-300">{submitError}</p>
                    <p className="text-xs text-slate-400 mt-2">
                        If this happens repeatedly, check backend logs for /questions/submit.
                    </p>
                </div>
            )}

            {/* ✅ ADAPTIVE RECOMMENDATION PANEL */}
            {recommendation && (
                <div className="glass p-4 text-slate-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Recommended Next</h3>
                        <button
                            onClick={loadRecommendedSet}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
                        >
                            Load set
                        </button>
                    </div>

                    <p className="text-sm text-slate-400 mb-2">Reason: {recommendation.reason}</p>

                    <ul className="list-disc ml-6 text-sm">
                        {recommendation.questions.slice(0, 5).map((q) => (
                            <li key={q.id}>{q.prompt}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ✅ RESULT PANEL */}
            {result && (
                <div className={`glass p-4 ${result.correct ? "text-green-400" : "text-red-400"}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold">{result.correct ? "Correct" : "Incorrect"}</p>

                            {displayedScore !== null && displayedMaxScore !== null && (
                                <p className="mt-1 text-slate-300">
                                    Marks:{" "}
                                    <span className="font-semibold">
                                        {displayedScore} / {displayedMaxScore}
                                    </span>
                                </p>
                            )}
                        </div>

                        {isRecLoading && (
                            <div className="text-xs text-slate-400">Updating recommendations…</div>
                        )}
                    </div>

                    {/* ✅ Examiner-style feedback */}
                    {!result.correct && (
                        <div className="mt-3 text-slate-200">
                            <p className="font-semibold mb-2">Examiner feedback</p>

                            {errorTags.length > 0 ? (
                                <ul className="list-disc ml-6 space-y-1">
                                    {errorTags.map((tag) => (
                                        <li key={tag}>
                                            <span className="text-slate-200">{ERROR_TAG_MESSAGES[tag] ?? tag}</span>
                                            {ERROR_TAG_TUTOR_TIPS[tag] && (
                                                <div className="text-slate-400 text-sm mt-1">
                                                    {ERROR_TAG_TUTOR_TIPS[tag]}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-slate-300">
                                    <p>
                                        No specific examiner tag was returned for this answer.
                                        This usually means the submission was invalid/unparseable, or the question
                                        doesn’t have tagged common wrong answers yet.
                                    </p>
                                    <p className="text-slate-400 text-sm mt-2">
                                        Tip: Try rewriting your answer in standard notation (e.g. use * for multiply,
                                        brackets for intervals, etc.).
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* existing backend explanation */}
                    {!result.correct && result.explanation && (
                        <p className="text-slate-300 mt-3">Explanation: {result.explanation}</p>
                    )}

                    {aiAvailable && (
                        <button
                            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
                            onClick={handleExplain}
                            disabled={isExplaining}
                        >
                            {isExplaining ? "Explaining..." : "Explain with AI"}
                        </button>
                    )}

                    {currentIndex < questions.length - 1 && (
                        <button
                            className="mt-4 ml-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                            onClick={handleNextQuestion}
                        >
                            Next Question →
                        </button>
                    )}
                </div>
            )}

            {/* Hints only when incorrect */}
            {!result?.correct && aiAvailable && (
                <div className="glass p-4">
                    <button
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm"
                        onClick={handleHint}
                        disabled={isHinting}
                    >
                        {isHinting ? "Getting hint..." : `Hint ${hintLevel}`}
                    </button>

                    <ul className="mt-3 list-disc ml-6 text-slate-300">
                        {hints.map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* AI explanation panel */}
            {explanation && (
                <div className="glass p-4 text-slate-300">
                    <h3 className="font-semibold mb-2">AI Explanation</h3>

                    <ul className="list-disc ml-6">
                        {explanation.stepByStep?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>

                    <p className="mt-3 text-purple-300">{explanation.finalAdvice}</p>

                    <button
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
                        onClick={handleSimilar}
                    >
                        Try Similar Question
                    </button>
                </div>
            )}
        </div>
    );
}