"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QuestionCard from "@/components/practice/QuestionCard";
import MathpixMarkdown from "@/components/practice/MathpixMarkdown";
import { submitExamAnswer } from "@/lib/apiClient";

type MarkingResult = {
  correct?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | null;
  score?: number | null;
  maxScore?: number | null;
  errorTags?: string[] | null;
  skillGaps?: string[] | null;
  explanation?: string | null;
  workedSolution?: string | null;
  markingRubric?: Array<{ marks?: number | null; criterion?: string | null }> | null;
  examinerFeedback?: {
    summary?: string | null;
    markingRubric?: Array<{ marks?: number | null; criterion?: string | null }> | null;
    commonMistake?: string | null;
    source?: string | null;
    sourceRef?: string | null;
  } | null;
  diagnostics?: any;
};

type ExamQuestionLike = {
  id: number | string;
  questionNumber?: string | null;
  prompt: string;
  questionText?: string | null;
  answer?: string;
  answerType?: string;
  marks?: number;
  skillCode?: string | null;
  topicCode?: string | null;
  subtopicCode?: string | null;
  difficulty?: string | null;
  isMarkable?: boolean | null;
  rubricKey?: string | null;
  pdfPage?: number | null;
  markingMeta?: any;
};

type AttemptRecord = {
  questionId: string;
  answer: string;
  result: MarkingResult;
  ts: number;
};

export default function ExamSessionClient(props: {
  initialQuestions: ExamQuestionLike[];
  subject: string;
  examKey: string;

  examTitle?: string;
  // examPdfSrc is optional now; meta.json is preferred
  examPdfSrc?: string | null;
  questionImageBase?: string;

  readingMins?: number;
  writingMins?: number;
  allowCAS?: boolean;
  exactRequired?: boolean;
  workingRequired?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    initialQuestions,
    examKey,
    examTitle = "Exam Session",
    examPdfSrc = null,
    readingMins = 15,
    writingMins = 60,
    allowCAS = false,
    exactRequired = true,
    workingRequired = true,
  } = props;

  const [questions] = useState<ExamQuestionLike[]>(initialQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = questions[currentIndex] ?? null;

  const [answer, setAnswer] = useState("");
  const answerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [result, setResult] = useState<MarkingResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDebug, setShowDebug] = useState(false);

  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [attemptsByQid, setAttemptsByQid] = useState<Record<string, AttemptRecord[]>>({});

  const qid = question ? String(question.id) : "";

  const maxMarks = useMemo(() => {
    const m = (question as any)?.marks;
    return typeof m === "number" && m > 0 ? m : 1;
  }, [question]);

  const isNotMarkableYet = (result?.errorTags ?? []).includes("NOT_MARKABLE_YET");
  const hasRubricNotFound = (result?.errorTags ?? []).includes("RUBRIC_NOT_FOUND");

  const normalizedCorrect =
    isNotMarkableYet || hasRubricNotFound ? null : (result?.correct ?? result?.isCorrect ?? null);

  const displayedScore = useMemo(() => {
    if (!result) return null;
    const s = result.score;
    if (typeof s === "number") return s;
    if (normalizedCorrect === null) return null;
    return normalizedCorrect ? maxMarks : 0;
  }, [result, normalizedCorrect, maxMarks]);

  const displayedMaxScore = useMemo(() => {
    if (!result) return null;
    const ms = result.maxScore;
    if (typeof ms === "number" && ms > 0) return ms;
    return maxMarks;
  }, [result, maxMarks]);

  const displayedRubric = useMemo(() => {
    const rubric = result?.examinerFeedback?.markingRubric ?? result?.markingRubric ?? [];
    return Array.isArray(rubric) ? rubric.filter((item) => item?.criterion) : [];
  }, [result]);

  const qLabel = useMemo(() => {
    if (!question) return "";
    const qn = question.questionNumber?.trim();
    return qn ? `Question ${qn}` : `Question ${currentIndex + 1}`;
  }, [question, currentIndex]);

  const isFlagged = Boolean(question && flagged[String(question.id)]);
  const answerType = String(question?.answerType ?? "").toUpperCase();
  const needsWorkingInput =
    question?.isMarkable === false ||
    ["WORKING", "PROOF", "GRAPH", "EXPLANATION", "TEXT"].some((type) => answerType.includes(type));
  const compactAnswerInput = !needsWorkingInput;
  const answerPlaceholder = needsWorkingInput
    ? "Enter your working or explanation"
    : answerType.includes("NUMERIC")
      ? "Example: 1, 3/2, sqrt(2), pi/4"
      : "Example: 2*x*cos(x)-x^2*sin(x)";

  const answerShortcuts = useMemo(() => {
    if (needsWorkingInput) {
      return [
        { label: "sqrt", value: "sqrt()" },
        { label: "^", value: "^" },
        { label: "pi", value: "pi" },
        { label: "frac", value: "/" },
      ];
    }

    return [
      { label: "sqrt", value: "sqrt()" },
      { label: "^", value: "^" },
      { label: "pi", value: "pi" },
      { label: "sin", value: "sin()" },
      { label: "cos", value: "cos()" },
      { label: "tan", value: "tan()" },
      { label: "(", value: "(" },
      { label: ")", value: ")" },
    ];
  }, [needsWorkingInput]);

  const insertAnswerToken = (token: string) => {
    const el = answerInputRef.current;
    if (!el) {
      setAnswer((value) => `${value}${token}`);
      return;
    }

    const start = el.selectionStart ?? answer.length;
    const end = el.selectionEnd ?? answer.length;
    const nextAnswer = `${answer.slice(0, start)}${token}${answer.slice(end)}`;
    const cursorOffset = token.endsWith("()") ? token.length - 1 : token.length;

    setAnswer(nextAnswer);
    window.requestAnimationFrame(() => {
      el.focus();
      const nextCursor = start + cursorOffset;
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const resetAttemptState = () => {
    setAnswer("");
    setResult(null);
    setSubmitError(null);
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
        token: (session?.user as any)?.accessToken,
        userId:
          (session?.user as any)?.id != null
            ? Number((session?.user as any).id)
            : undefined,
      })) as MarkingResult;

      setResult(res);

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
    router.push(`/student/practice/math-methods/exam-1/review?examKey=${encodeURIComponent(examKey)}`);
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
      <div className="px-4 py-2 rounded-lg bg-red-900/40 text-red-200 text-sm">
        <strong>Exam Mode</strong> — AI assistance is disabled during the examination.
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7">
          <div className="space-y-4 sticky top-4">
            <div className="glass p-5 text-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">{qLabel}</h1>
                  <p className="mt-1 text-sm text-slate-400">
                    {examTitle} • {currentIndex + 1} of {questions.length}
                    {isFlagged ? " • Flagged" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sm"
                  >
                    Previous
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
                    Next
                  </button>
                </div>
              </div>
            </div>

            <QuestionCard question={question as any} />
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="space-y-6">
            <div className="glass p-6 text-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">{examTitle}</h1>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="px-2 py-1 rounded bg-slate-800">Reading: {readingMins} min</span>
                    <span className="px-2 py-1 rounded bg-slate-800">Writing: {writingMins} min</span>
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
              </div>
            </div>

            <div className="glass p-5 text-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">PDF reference</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Open the original exam PDF only when you need to check the source.
                  </p>
                </div>

                {examPdfSrc ? (
                  <a
                    href={examPdfSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-100"
                  >
                    Open PDF
                  </a>
                ) : (
                  <span className="px-3 py-2 rounded bg-slate-800 text-xs text-slate-400">
                    No PDF
                  </span>
                )}
              </div>
            </div>

            <div className="glass p-5 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-100">Your answer</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {question.isMarkable === false
                    ? "This part is saved for manual review."
                    : "Submit your answer to check it against the dataset."}
                </p>
              </div>

              <div className="space-y-3">
                {compactAnswerInput ? (
                  <input
                    ref={answerInputRef as any}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
                    }}
                    placeholder={answerPlaceholder}
                    className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100"
                  />
                ) : (
                  <textarea
                    ref={answerInputRef as any}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
                    }}
                    placeholder={answerPlaceholder}
                    rows={question.isMarkable === false ? 6 : 4}
                    className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-200 resize-y"
                  />
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {answerShortcuts.map((shortcut) => (
                    <button
                      key={`${shortcut.label}-${shortcut.value}`}
                      type="button"
                      onClick={() => insertAnswerToken(shortcut.value)}
                      className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                    >
                      {shortcut.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-500">
                  Accepted format: normal calculator-style typing, such as <span className="font-mono">3/2</span>,{" "}
                  <span className="font-mono">sqrt(2)</span>, or{" "}
                  <span className="font-mono">2*x*cos(x)-x^2*sin(x)</span>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Checking..." : "Submit Answer"}
                </button>

                <button
                  onClick={finishAndReview}
                  className="px-4 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold"
                >
                  Finish & Review
                </button>
              </div>

              {submitError && (
                <div className="glass p-4 text-red-300">
                  <p className="font-semibold mb-1">Submission error</p>
                  <p className="text-sm text-slate-300">{submitError}</p>
                </div>
              )}
            </div>

            {result && (
              <div
                className={`glass p-4 ${normalizedCorrect === null
                    ? "text-slate-200"
                    : normalizedCorrect
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {normalizedCorrect === null
                        ? hasRubricNotFound
                          ? "Cannot mark (Rubric not found)"
                          : isNotMarkableYet
                            ? "Saved (Not markable yet)"
                            : "Saved"
                        : normalizedCorrect
                          ? "Correct"
                          : "Incorrect"}
                    </p>

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

                <div className="mt-3 border-t border-slate-700 pt-3">
                  {(result.correctAnswer ||
                    result.workedSolution ||
                    result.explanation ||
                    result.examinerFeedback ||
                    displayedRubric.length > 0) && (
                    <div className="mb-4 space-y-4 text-sm text-slate-200">
                      {result.examinerFeedback?.summary && (
                        <div>
                          <div className="text-slate-400">Examiner feedback</div>
                          <p className="mt-1 text-slate-200">{result.examinerFeedback.summary}</p>
                        </div>
                      )}

                      {result.correctAnswer && (
                        <div>
                          <div className="text-slate-400">Expected answer</div>
                          <div className="mt-1">
                            <MathpixMarkdown value={result.correctAnswer} />
                          </div>
                        </div>
                      )}

                      {displayedRubric.length > 0 && (
                        <div>
                          <div className="text-slate-400">Marking guide</div>
                          <div className="mt-2 overflow-hidden rounded-lg border border-slate-700">
                            {displayedRubric.map((item, index) => (
                              <div
                                key={`${index}-${item.criterion}`}
                                className="grid grid-cols-[72px_1fr] border-b border-slate-700 last:border-b-0"
                              >
                                <div className="bg-slate-900/50 px-3 py-2 text-slate-300">
                                  {item.marks ?? 1} mark{Number(item.marks ?? 1) === 1 ? "" : "s"}
                                </div>
                                <div className="px-3 py-2 text-slate-200">
                                  {item.criterion}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(result.workedSolution || result.explanation) && (
                        <div>
                          <div className="text-slate-400">Worked solution</div>
                          <div className="mt-1">
                            <MathpixMarkdown value={result.workedSolution || result.explanation || ""} />
                          </div>
                        </div>
                      )}

                      {result.examinerFeedback?.commonMistake && (
                        <div>
                          <div className="text-slate-400">Common mistake</div>
                          <p className="mt-1 text-slate-200">{result.examinerFeedback.commonMistake}</p>
                        </div>
                      )}
                    </div>
                  )}

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

                      {result?.explanation && (
                        <div>
                          <div className="text-slate-400">Examiner feedback</div>
                          <pre className="whitespace-pre-wrap break-words bg-slate-900/50 p-2 rounded">
                            {result.explanation}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
