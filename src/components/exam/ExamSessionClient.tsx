"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/practice/QuestionCard";
import { submitExamAnswer } from "@/lib/apiClient";

type MarkingResult = {
    correct?: boolean; // some endpoints use correct
    isCorrect?: boolean; // some endpoints use isCorrect
    score?: number | null;
    maxScore?: number | null;
    errorTags?: string[] | null;
    skillGaps?: string[] | null;
    explanation?: string | null;
    diagnostics?: any;
};

type ExamQuestionLike = {
    id: number | string;
    questionNumber?: string | null;
    prompt: string;
    answer?: string; // optional
    answerType?: string;
    marks?: number;
    skillCode?: string | null;
    pdfPage?: number | null;
    markingMeta?: any;
};

type AttemptRecord = {
    questionId: string;
    answer: string;
    result: MarkingResult;
    ts: number;
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
    "INT_ERR.MISSING_CONSTANT":
        "Tip: If it’s an indefinite integral, always include + C.",
};

export default function ExamSessionClient(props: {
    initialQuestions: ExamQuestionLike[];
    subject: string; // keep for compatibility (not used here)
    examKey: string;

    examTitle?: string;
    examPdfSrc?: string | null;

    readingMins?: number;
    writingMins?: number;
    allowCAS?: boolean;
    exactRequired?: boolean;
    workingRequired?: boolean;
}) {
    const router = useRouter();

    const {
        initialQuestions,
        examKey,
        examTitle = "Exam Session",
        examPdfSrc,
        readingMins = 15,
        writingMins = 60,
        allowCAS = false,
        exactRequired = true,
        workingRequired = true,
    } = props;

    // Single source of truth: props.initialQuestions
    const [questions] = useState<ExamQuestionLike[]>(initialQuestions ?? []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const question = questions[currentIndex] ?? null;

    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<MarkingResult | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debug panel toggle
    const [showDebug, setShowDebug] = useState(false);

    // PDF panel toggle
    const [showPdf, setShowPdf] = useState(true);

    // Flags + attempts for review/insights
    const [flagged, setFlagged] = useState<Record<string, boolean>>({});
    const [attemptsByQid, setAttemptsByQid] = useState<Record<string, AttemptRecord[]>>({});

    const qid = question ? String(question.id) : "";

    const maxMarks = useMemo(() => {
        const m = (question as any)?.marks;
        return typeof m === "number" && m > 0 ? m : 1;
    }, [question]);

    const normalizedCorrect = Boolean(result?.correct ?? result?.isCorrect);

    const displayedScore = useMemo(() => {
        if (!result) return null;
        const s = result.score;
        return typeof s === "number" ? s : normalizedCorrect ? maxMarks : 0;
    }, [result, normalizedCorrect, maxMarks]);

    const displayedMaxScore = useMemo(() => {
        if (!result) return null;
        const ms = result.maxScore;
        return typeof ms === "number" && ms > 0 ? ms : maxMarks;
    }, [result, maxMarks]);

    const errorTags = useMemo(() => {
        const tags = result?.errorTags ?? [];
        return Array.isArray(tags) ? tags : [];
    }, [result]);

    // PDF URL that auto-jumps to question.pdfPage (if provided)
    const pdfUrl = useMemo(() => {
        if (!examPdfSrc) return null;
        const page = (question as any)?.pdfPage;
        return typeof page === "number" && page > 0 ? `${examPdfSrc}#page=${page}` : examPdfSrc;
    }, [examPdfSrc, question]);

    const qLabel = useMemo(() => {
        if (!question) return "";
        const qn = question.questionNumber?.trim();
        return qn ? `Question ${qn}` : `Question ${currentIndex + 1}`;
    }, [question, currentIndex]);

    const isFlagged = Boolean(question && flagged[String(question.id)]);

    const resetAttemptState = () => {
        setAnswer("");
        setResult(null);
        setSubmitError(null);
        // keep showDebug/showPdf/flags/attempts
    };

    const handleSubmit = async () => {
        if (!question || isSubmitting) return;

        setSubmitError(null);
        setResult(null);

        try {
            setIsSubmitting(true);

            const res = (await submitExamAnswer({
                examKey,
                questionId: question.id,
                answer,
            })) as MarkingResult;

            setResult(res);

            // store attempt for review/insights
            const record: AttemptRecord = {
                questionId: String(question.id),
                answer,
                result: res,
                ts: Date.now(),
            };

            setAttemptsByQid((prev) => {
                const key = String(question.id);
                const existing = prev[key] ?? [];
                return { ...prev, [key]: [...existing, record] };
            });
        } catch (e: any) {
            setSubmitError(e?.message || "Submit failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const goNext = () => {
        if (currentIndex >= questions.length - 1) return;
        setCurrentIndex((i) => i + 1);
        resetAttemptState();
    };

    const goPrev = () => {
        if (currentIndex <= 0) return;
        setCurrentIndex((i) => i - 1);
        resetAttemptState();
    };

    const toggleFlag = () => {
        if (!question) return;
        const key = String(question.id);
        setFlagged((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const answeredCount = useMemo(() => {
        return Object.keys(attemptsByQid).filter((k) => (attemptsByQid[k] ?? []).length > 0).length;
    }, [attemptsByQid]);

    const correctCount = useMemo(() => {
        let c = 0;
        for (const k of Object.keys(attemptsByQid)) {
            const attempts = attemptsByQid[k] ?? [];
            const last = attempts[attempts.length - 1];
            if (!last) continue;
            const ok = Boolean(last.result.correct ?? last.result.isCorrect);
            if (ok) c += 1;
        }
        return c;
    }, [attemptsByQid]);

    const finishAndReview = () => {
        // For now: route to a future review page.
        // Later we’ll persist attempts to backend or localStorage and load them there.
        router.push(`/practice/math-methods/exam-1/review?examKey=${encodeURIComponent(examKey)}`);
    };

    if (!questions.length) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 text-slate-300">
                No exam questions loaded for <span className="font-mono">{examKey}</span>.
            </div>
        );
    }

    if (!question) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 text-slate-300">No current question.</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mode banner */}
            <div className="px-4 py-2 rounded-lg bg-red-900/40 text-red-200 text-sm">
                🟥 <strong>Exam Mode</strong> — AI assistance is disabled during the examination.
            </div>

            {examPdfSrc && (
                <div className="text-sm text-slate-400">
                    Reference material is available in the examination PDF. It will open to the relevant page
                    when page metadata is set.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ===================== PDF PANEL (LEFT) ===================== */}
                <div className={`lg:col-span-6 ${showPdf ? "" : "hidden lg:block"}`}>
                    <div className="glass p-3 sticky top-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-slate-300">
                                Exam PDF{question.pdfPage ? ` • page ${question.pdfPage}` : ""}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowPdf((v) => !v)}
                                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                                >
                                    {showPdf ? "Hide PDF" : "Show PDF"}
                                </button>

                                {pdfUrl && (
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                                    >
                                        Open in new tab
                                    </a>
                                )}
                            </div>
                        </div>

                        {pdfUrl ? (
                            <iframe
                                key={pdfUrl} // force reload when the page changes
                                src={pdfUrl}
                                className="w-full h-[75vh] rounded border border-slate-700"
                            />
                        ) : (
                            <div className="text-slate-300 text-sm">No PDF source configured.</div>
                        )}
                    </div>
                </div>

                {/* ===================== QUESTION PANEL (RIGHT) ===================== */}
                <div className={showPdf ? "lg:col-span-6" : "lg:col-span-12"}>
                    {/* Mobile-only PDF toggle */}
                    {examPdfSrc && (
                        <div className="lg:hidden mb-3">
                            <button
                                onClick={() => setShowPdf((v) => !v)}
                                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
                            >
                                {showPdf ? "Hide PDF" : "Show PDF"}
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Header */}
                        <div className="glass p-6 text-slate-200">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-xl font-semibold">{examTitle}</h1>

                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                                        <span className="px-2 py-1 rounded bg-slate-800">
                                            Reading: {readingMins} min
                                        </span>
                                        <span className="px-2 py-1 rounded bg-slate-800">
                                            Writing: {writingMins} min
                                        </span>
                                        <span className="px-2 py-1 rounded bg-slate-800">
                                            CAS: {allowCAS ? "Allowed" : "Not allowed"}
                                        </span>
                                        <span className="px-2 py-1 rounded bg-slate-800">
                                            Exact: {exactRequired ? "Required" : "Not required"}
                                        </span>
                                        <span className="px-2 py-1 rounded bg-slate-800">
                                            Working: {workingRequired ? "Required" : "Not required"}
                                        </span>
                                        <span className="px-2 py-1 rounded bg-slate-800">
                                            Progress: {answeredCount}/{questions.length} • Correct: {correctCount}
                                        </span>
                                    </div>
                                </div>

                                {examPdfSrc && (
                                    <a
                                        href={pdfUrl || examPdfSrc}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                                    >
                                        Open Exam PDF
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Progress + controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-slate-300">
                            <div className="text-sm">
                                {qLabel} <span className="text-slate-500">•</span> {currentIndex + 1} of{" "}
                                {questions.length}
                                {question.pdfPage ? (
                                    <>
                                        {" "}
                                        <span className="text-slate-500">•</span> PDF page {question.pdfPage}
                                    </>
                                ) : null}
                                {isFlagged ? (
                                    <>
                                        {" "}
                                        <span className="text-slate-500">•</span>{" "}
                                        <span className="text-yellow-300">Flagged</span>
                                    </>
                                ) : null}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={goPrev}
                                    disabled={currentIndex === 0}
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sm"
                                >
                                    ← Previous
                                </button>

                                <button
                                    onClick={toggleFlag}
                                    className={`px-3 py-2 rounded-lg text-sm ${isFlagged ? "bg-yellow-700 hover:bg-yellow-600" : "bg-slate-800 hover:bg-slate-700"
                                        }`}
                                >
                                    {isFlagged ? "Unflag" : "Flag"}
                                </button>

                                <button
                                    onClick={goNext}
                                    disabled={currentIndex >= questions.length - 1}
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sm"
                                >
                                    Next →
                                </button>

                                <button
                                    onClick={finishAndReview}
                                    className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm"
                                >
                                    Finish & Review
                                </button>
                            </div>
                        </div>

                        {/* Question */}
                        <QuestionCard question={question as any} />

                        {/* Answer input */}
                        <div className="space-y-3">
                            <input
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Enter your answer"
                                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-200"
                            />

                            <button
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {isSubmitting ? "Checking..." : "Submit Answer"}
                            </button>

                            {submitError && (
                                <div className="glass p-4 text-red-300">
                                    <p className="font-semibold mb-1">Submission error</p>
                                    <p className="text-sm text-slate-300">{submitError}</p>
                                </div>
                            )}
                        </div>

                        {/* Result */}
                        {result && (
                            <div className={`glass p-4 ${normalizedCorrect ? "text-green-400" : "text-red-400"}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold">{normalizedCorrect ? "Correct" : "Incorrect"}</p>

                                        {displayedScore !== null && displayedMaxScore !== null && (
                                            <p className="mt-1 text-slate-300">
                                                Marks:{" "}
                                                <span className="font-semibold">
                                                    {displayedScore} / {displayedMaxScore}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Debug details */}
                                <div className="mt-3 border-t border-slate-700 pt-3">
                                    <button
                                        className="text-xs text-slate-300 underline"
                                        onClick={() => setShowDebug((v) => !v)}
                                    >
                                        {showDebug ? "Hide debug details" : "Show debug details"}
                                    </button>

                                    {showDebug && (
                                        <div className="mt-2 text-xs text-slate-200 space-y-2">
                                            <div>
                                                <div className="text-slate-400">attempts (this question)</div>
                                                <pre className="whitespace-pre-wrap break-words bg-slate-900/50 p-2 rounded">
                                                    {JSON.stringify(attemptsByQid[qid] ?? [], null, 2)}
                                                </pre>
                                            </div>

                                            <div>
                                                <div className="text-slate-400">latest result</div>
                                                <pre className="whitespace-pre-wrap break-words bg-slate-900/50 p-2 rounded">
                                                    {JSON.stringify(result ?? {}, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Examiner feedback */}
                                {!normalizedCorrect && (
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
                                                    No specific examiner tag was returned for this answer. This usually means
                                                    the submission was invalid/unparseable, or this question doesn’t have
                                                    tagged common wrong answers yet.
                                                </p>
                                                <p className="text-slate-400 text-sm mt-2">
                                                    Tip: Rewrite using standard notation (e.g. use * for multiply, brackets
                                                    for intervals, exact values like 1/3 or √5).
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!normalizedCorrect && result.explanation && (
                                    <p className="text-slate-300 mt-3">Explanation: {result.explanation}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
