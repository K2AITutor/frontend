"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/practice/QuestionCard";
import { submitExamAnswer } from "@/lib/apiClient";
import PdfQuestionCrop from "@/components/exam/PdfQuestionCrop";
import { fetchExamMeta, resolveQuestionAsset, type ExamMeta } from "@/lib/examAssets";

type MarkingResult = {
  correct?: boolean;
  isCorrect?: boolean;
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
  answer?: string;
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

export default function ExamSessionClient(props: {
  initialQuestions: ExamQuestionLike[];
  subject: string;
  examKey: string;

  examTitle?: string;
  // examPdfSrc is optional now; meta.json is preferred
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
  const [result, setResult] = useState<MarkingResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDebug, setShowDebug] = useState(false);
  const [showLeft, setShowLeft] = useState(true);

  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [attemptsByQid, setAttemptsByQid] = useState<Record<string, AttemptRecord[]>>({});

  // ===== Option C: load exam meta.json =====
  const [meta, setMeta] = useState<ExamMeta | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const m = await fetchExamMeta(examKey);
      if (!alive) return;
      setMeta(m);
    })();
    return () => {
      alive = false;
    };
  }, [examKey]);

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

  // ===== Resolve PDF + crop for this question =====
  const asset = resolveQuestionAsset(meta, question.questionNumber ?? String(currentIndex + 1));
  const pdfUrlFromMeta = meta?.pdfUrl ?? null;
  const pdfUrl = pdfUrlFromMeta ?? examPdfSrc; // fallback to prop
  const page = asset?.page ?? question.pdfPage ?? meta?.defaultPage ?? 1;
  const crop = asset?.crop;

  return (
    <div className="space-y-4">
      <div className="px-4 py-2 rounded-lg bg-red-900/40 text-red-200 text-sm">
        🟥 <strong>Exam Mode</strong> — AI assistance is disabled during the examination.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: PDF cropped view */}
        <div className={`lg:col-span-6 ${showLeft ? "" : "hidden lg:block"}`}>
          <div className="glass p-3 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-300">
                Question View{question.questionNumber ? ` • ${question.questionNumber}` : ""}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowLeft((v) => !v)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                >
                  {showLeft ? "Hide" : "Show"}
                </button>

                {pdfUrl && (
                  <a
                    href={`${pdfUrl}#page=${page}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                  >
                    Open PDF
                  </a>
                )}
              </div>
            </div>

            {pdfUrl ? (
              <PdfQuestionCrop
                pdfUrl={pdfUrl}
                page={page}
                crop={crop}
                title={meta?.title ?? examKey}
              />
            ) : (
              <div className="text-slate-300 text-sm">
                No PDF configured. Add{" "}
                <span className="font-mono">/public/exams/{examKey}/exam.pdf</span> and{" "}
                <span className="font-mono">/public/exams/{examKey}/meta.json</span>.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: marking + answer */}
        <div className={showLeft ? "lg:col-span-6" : "lg:col-span-12"}>
          <div className="lg:hidden mb-3">
            <button
              onClick={() => setShowLeft((v) => !v)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
            >
              {showLeft ? "Hide Question" : "Show Question"}
            </button>
          </div>

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

                {pdfUrl && (
                  <a
                    href={`${pdfUrl}#page=${page}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                  >
                    Open Exam PDF
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-slate-300">
              <div className="text-sm">
                {qLabel} <span className="text-slate-500">•</span> {currentIndex + 1} of{" "}
                {questions.length}
                {page ? (
                  <>
                    {" "}
                    <span className="text-slate-500">•</span> PDF page {page}
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

            <QuestionCard question={question as any} />

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
