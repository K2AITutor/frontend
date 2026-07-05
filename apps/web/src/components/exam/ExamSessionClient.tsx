"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QuestionCard from "@/components/practice/QuestionCard";
import MathpixMarkdown from "@/components/practice/MathpixMarkdown";
import { Button } from "@/components/dashboard/ui/button";
import { submitExamAnswer } from "@/lib/apiClient";
import {
  classifyAnswerInputKind,
  normalizeAnswerInput,
  type AnswerInputKind,
  type NormalizedAnswerInput,
} from "@/lib/mathAnswerInput";

type MarkingResult = {
  correct?: boolean;
  isCorrect?: boolean;
  markingConfidence?: MarkingConfidenceStatus | null;
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
  criterionOutcomes?: CriterionOutcomeLike[] | null;
  markingArtifact?: {
    markingConfidence?: MarkingConfidenceStatus | null;
    criterionOutcomes?: CriterionOutcomeLike[] | null;
    criteria?: CriterionOutcomeLike[] | null;
    criterionResults?: CriterionOutcomeLike[] | null;
    rubric?: { criteria?: CriterionOutcomeLike[] | null } | null;
  } | null;
  input?: NormalizedAnswerInput;
  needsClarification?: boolean;
};

type MarkingConfidenceStatus =
  | "safe_auto_marked"
  | "auto_marked_with_warning"
  | "manual_review_required"
  | "invalid_syntax";

type RubricLine = { marks?: number | null; criterion?: string | null };

type CriterionOutcomeLike = {
  id?: string | number | null;
  key?: string | number | null;
  componentId?: string | number | null;
  criterionId?: string | number | null;
  label?: string | null;
  criterion?: string | null;
  description?: string | null;
  note?: string | null;
  passed?: boolean | null;
  met?: boolean | null;
  isCorrect?: boolean | null;
  status?: string | null;
  outcome?: string | null;
  scoreAwarded?: number | null;
  marksAwarded?: number | null;
  awardedMarks?: number | null;
  score?: number | null;
  marks?: number | null;
  maxScore?: number | null;
  maxMarks?: number | null;
  maxMark?: number | null;
  totalMarks?: number | null;
  availableMarks?: number | null;
  feedback?: string | null;
  reason?: string | null;
  message?: string | null;
  details?: string | null;
  errorTags?: string[] | null;
  criteria?: CriterionOutcomeLike[] | null;
};

type CriterionFeedback = {
  id: string;
  label: string;
  criterion: string;
  state: "passed" | "failed" | "partial" | "not_assessed";
  score: number | null;
  maxScore: number | null;
  feedback?: string | null;
  errorTags?: string[];
};

type ExamQuestionLike = {
  id: number | string;
  questionNumber?: string | null;
  questionText: string;
  answerType?: string;
  marks?: number;
  skillCode?: string | null;
  topicCode?: string | null;
  subtopicCode?: string | null;
  difficultyLevel?: string | null;
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

type AnswerShortcut = {
  label: string;
  value: string;
  ariaLabel: string;
  cursorOffset?: number;
  buildValue?: (selectedText: string) => { value: string; cursorOffset: number };
};

type AnswerInputCopy = {
  placeholder: string;
  helper: string;
  examples: string[];
};

type SessionMode = "practice" | "exam";

const ANSWER_INPUT_COPY: Record<AnswerInputKind, AnswerInputCopy> = {
  numeric: {
    placeholder: "Example: 3/2, sqrt(2), pi/4",
    helper: "Enter one exact number. Do not include variables unless the question asks for an expression.",
    examples: ["3/2", "sqrt(2)", "pi/4"],
  },
  expression: {
    placeholder: "Example: 2*x*cos(x)-x^2*sin(x)",
    helper: "Enter a calculator-style expression. Use * for multiplication and ^ for powers.",
    examples: ["2*x*cos(x)-x^2*sin(x)", "(x+1)*(x-1)"],
  },
  interval: {
    placeholder: "Example: [0,1), x<=2",
    helper: "Use clear endpoint brackets or inequality notation.",
    examples: ["[0,1)", "(1,infinity)", "x<=2"],
  },
  coordinate: {
    placeholder: "Example: (2,3)",
    helper: "Enter one ordered pair in the format (x,y).",
    examples: ["(2,3)", "(-1,4)"],
  },
  set_list: {
    placeholder: "Example: -1,2,5 or {-1,2,5}",
    helper: "Separate multiple answers with commas. Use braces if the answer is a set.",
    examples: ["-1,2,5", "{-1,2,5}"],
  },
  working: {
    placeholder: "Enter your working or explanation",
    helper: "Write the reasoning or explanation required for manual review.",
    examples: ["State the rule used and show the key working steps."],
  },
};

type StructuredAnswerBuilderProps = {
  answerKind: AnswerInputKind;
  answer: string;
  onAnswerChange: (value: string) => void;
};

const structuredInputClass =
  "w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring";

function parseCoordinateAnswer(answer: string) {
  const match = answer.trim().match(/^\((.*),(.*)\)$/);
  return {
    x: match?.[1]?.trim() ?? "",
    y: match?.[2]?.trim() ?? "",
  };
}

function parseIntervalAnswer(answer: string) {
  const match = answer.trim().match(/^([\[(])([^,]*),([^,\]\)]*)([\])])$/);
  return {
    leftBracket: match?.[1] ?? "[",
    lower: match?.[2]?.trim() ?? "",
    upper: match?.[3]?.trim() ?? "",
    rightBracket: match?.[4] ?? ")",
  };
}

function parseSetListAnswer(answer: string) {
  const trimmed = answer.trim();
  const braced = trimmed.match(/^\{(.*)\}$/);
  return braced?.[1]?.trim() ?? trimmed;
}

function StructuredAnswerBuilder({ answerKind, answer, onAnswerChange }: StructuredAnswerBuilderProps) {
  if (answerKind === "coordinate") {
    const parts = parseCoordinateAnswer(answer);
    const update = (next: { x?: string; y?: string }) => {
      const x = next.x ?? parts.x;
      const y = next.y ?? parts.y;
      onAnswerChange(`(${x.trim()},${y.trim()})`);
    };

    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground">Coordinate builder</p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">
            x value
            <input
              value={parts.x}
              onChange={(event) => update({ x: event.target.value })}
              placeholder="2"
              className={`${structuredInputClass} mt-1`}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            y value
            <input
              value={parts.y}
              onChange={(event) => update({ y: event.target.value })}
              placeholder="3"
              className={`${structuredInputClass} mt-1`}
            />
          </label>
        </div>
      </div>
    );
  }

  if (answerKind === "interval") {
    const parts = parseIntervalAnswer(answer);
    const update = (next: Partial<typeof parts>) => {
      const leftBracket = next.leftBracket ?? parts.leftBracket;
      const lower = next.lower ?? parts.lower;
      const upper = next.upper ?? parts.upper;
      const rightBracket = next.rightBracket ?? parts.rightBracket;
      onAnswerChange(`${leftBracket}${lower.trim()},${upper.trim()}${rightBracket}`);
    };

    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground">Interval builder</p>
        <div className="mt-2 grid grid-cols-[70px_1fr_1fr_70px] gap-2">
          <label className="text-xs text-muted-foreground">
            Start
            <select
              value={parts.leftBracket}
              onChange={(event) => update({ leftBracket: event.target.value })}
              className={`${structuredInputClass} mt-1`}
            >
              <option value="[">[</option>
              <option value="(">(</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Lower
            <input
              value={parts.lower}
              onChange={(event) => update({ lower: event.target.value })}
              placeholder="0"
              className={`${structuredInputClass} mt-1`}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Upper
            <input
              value={parts.upper}
              onChange={(event) => update({ upper: event.target.value })}
              placeholder="1"
              className={`${structuredInputClass} mt-1`}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            End
            <select
              value={parts.rightBracket}
              onChange={(event) => update({ rightBracket: event.target.value })}
              className={`${structuredInputClass} mt-1`}
            >
              <option value="]">]</option>
              <option value=")">)</option>
            </select>
          </label>
        </div>
      </div>
    );
  }

  if (answerKind === "set_list") {
    const values = parseSetListAnswer(answer);
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground">Set/list builder</p>
        <label className="mt-2 block text-xs text-muted-foreground">
          Values separated by commas
          <input
            value={values}
            onChange={(event) => onAnswerChange(`{${event.target.value.trim()}}`)}
            placeholder="-1,2,5"
            className={`${structuredInputClass} mt-1`}
          />
        </label>
      </div>
    );
  }

  return null;
}

function answerWarningText(
  warning: NormalizedAnswerInput["warnings"][number],
  normalizedAnswer: string,
  isExamMode: boolean
) {
  if (isExamMode) {
    if (warning.code === "SAFE_IMPLICIT_MULTIPLICATION_NORMALIZED") {
      return "Formatting check: multiplication signs were added before marking.";
    }
    return warning.message;
  }

  if (warning.code === "SAFE_IMPLICIT_MULTIPLICATION_NORMALIZED" && normalizedAnswer) {
    return `Did you mean ${normalizedAnswer}? Multiplication signs were added before checking.`;
  }

  return `${warning.message}${warning.suggestion ? ` ${warning.suggestion}` : ""}`;
}

function plainAnswerForClipboard(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/\\{1,2}\(|\\{1,2}\)|\\{1,2}\[|\\{1,2}\]/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "($1)/($2)")
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\pi\b/g, "pi")
    .replace(/\\cos\b/g, "cos")
    .replace(/\\sin\b/g, "sin")
    .replace(/\\tan\b/g, "tan")
    .replace(/\\log\b/g, "log")
    .replace(/\\ln\b/g, "ln")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculatorTextToLatex(value: string) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";

  return normalized
    .replace(/\s+/g, "")
    .replace(/\*/g, "\\cdot ")
    .replace(/\^(\d+|[a-zA-Z]+)/g, "^{$1}")
    .replace(/\bpi\b/g, "\\pi")
    .replace(/\bsqrt\(([^()]+)\)/g, "\\sqrt{$1}")
    .replace(/\b(sin|cos|tan|log|ln)\(/g, "\\$1(");
}

function finiteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function criterionLabel(item: CriterionOutcomeLike, index: number) {
  return String(item.label ?? item.key ?? item.criterionId ?? item.id ?? item.componentId ?? `Criterion ${index + 1}`);
}

function criterionText(item: CriterionOutcomeLike) {
  return String(item.criterion ?? item.description ?? item.note ?? item.details ?? item.label ?? "Criterion outcome");
}

function criterionScore(item: CriterionOutcomeLike) {
  return finiteNumber(item.awardedMarks ?? item.marksAwarded ?? item.scoreAwarded ?? item.score ?? item.marks);
}

function criterionMaxScore(item: CriterionOutcomeLike) {
  return finiteNumber(item.maxMarks ?? item.maxMark ?? item.totalMarks ?? item.availableMarks ?? item.maxScore ?? item.marks);
}

function criterionState(item: CriterionOutcomeLike, score: number | null, maxScore: number | null): CriterionFeedback["state"] {
  if (item.passed === true || item.met === true || item.isCorrect === true) return "passed";
  if (item.passed === false || item.met === false || item.isCorrect === false) return score && score > 0 ? "partial" : "failed";

  const status = String(item.status ?? item.outcome ?? "").trim().toLowerCase();
  if (["passed", "pass", "met", "correct", "awarded"].includes(status)) return "passed";
  if (["partial", "partially_met"].includes(status)) return "partial";
  if (["failed", "fail", "missed", "not_met", "incorrect"].includes(status)) return "failed";

  if (score != null && maxScore != null && maxScore > 0) {
    if (score >= maxScore) return "passed";
    if (score > 0) return "partial";
    return "failed";
  }

  return "not_assessed";
}

function normalizeCriterionFeedback(result: MarkingResult | null, rubric: RubricLine[]): CriterionFeedback[] {
  const sources = [
    result?.criterionOutcomes,
    result?.diagnostics?.criterionOutcomes,
    result?.diagnostics?.criteria,
    result?.diagnostics?.criterionResults,
    result?.diagnostics?.perCriterion,
    result?.markingArtifact?.criterionOutcomes,
    result?.markingArtifact?.criteria,
    result?.markingArtifact?.criterionResults,
    result?.markingArtifact?.rubric?.criteria,
    (result as any)?.perCriterion,
  ];

  const raw = sources.find((source) => Array.isArray(source) && source.length > 0) as
    | CriterionOutcomeLike[]
    | undefined;

  if (raw?.length) {
    const flattened = raw.flatMap((item, index) => {
      const nested = Array.isArray(item.criteria) ? item.criteria : [];
      if (!nested.length) return [{ item, parent: null, index }];
      return nested.map((child, childIndex) => ({
        item: child,
        parent: item,
        index: Number(`${index}${childIndex}`),
      }));
    });

    return flattened.map(({ item, parent, index }, visibleIndex) => {
      const score = criterionScore(item);
      const maxScore = criterionMaxScore(item) ?? criterionMaxScore(parent ?? {});
      return {
        id: String(item.id ?? item.key ?? item.criterionId ?? item.componentId ?? `${visibleIndex}`),
        label: criterionLabel(item, visibleIndex),
        criterion: criterionText(item),
        state: criterionState(item, score, maxScore),
        score,
        maxScore,
        feedback: item.feedback ?? item.reason ?? item.message ?? null,
        errorTags: Array.isArray(item.errorTags) ? item.errorTags : [],
      };
    });
  }

  return rubric.map((item, index) => ({
    id: `rubric-${index}`,
    label: `Criterion ${index + 1}`,
    criterion: String(item.criterion ?? "Criterion"),
    state: "not_assessed",
    score: null,
    maxScore: finiteNumber(item.marks),
    feedback: null,
    errorTags: [],
  }));
}

function hasAssessedCriterionFeedback(items: CriterionFeedback[]) {
  return items.some((item) => item.state !== "not_assessed" || item.score != null);
}

function criterionStateClasses(state: CriterionFeedback["state"]) {
  if (state === "passed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (state === "partial") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (state === "failed") return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  return "border-border bg-muted text-muted-foreground";
}

function criterionStateLabel(state: CriterionFeedback["state"]) {
  if (state === "passed") return "Earned";
  if (state === "partial") return "Partly earned";
  if (state === "failed") return "Not earned";
  return "Guide only";
}

function normalizeMarkingConfidence(result: MarkingResult | null): MarkingConfidenceStatus | null {
  const raw = String(
    result?.markingConfidence ??
      result?.markingArtifact?.markingConfidence ??
      result?.diagnostics?.markingConfidence ??
      result?.diagnostics?.artifact?.markingConfidence ??
      ""
  );

  if (
    raw === "safe_auto_marked" ||
    raw === "auto_marked_with_warning" ||
    raw === "manual_review_required" ||
    raw === "invalid_syntax"
  ) {
    return raw;
  }

  if (result?.needsClarification) return "invalid_syntax";
  if ((result?.errorTags ?? []).includes("NOT_MARKABLE_YET")) return "manual_review_required";
  return null;
}

function markingConfidenceCopy(status: MarkingConfidenceStatus) {
  if (status === "safe_auto_marked") {
    return {
      label: "Safe auto-marked",
      detail: "The answer format was clear and the marker checked it automatically.",
    };
  }
  if (status === "auto_marked_with_warning") {
    return {
      label: "Auto-marked with warning",
      detail: "The marker checked a safely normalized version of your answer.",
    };
  }
  if (status === "manual_review_required") {
    return {
      label: "Manual review required",
      detail: "This answer was saved, but it needs a person to review the marking.",
    };
  }
  return {
    label: "Invalid syntax",
    detail: "The answer format needs fixing before the marker can safely check it.",
  };
}

function markingConfidenceClasses(status: MarkingConfidenceStatus) {
  if (status === "safe_auto_marked") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (status === "auto_marked_with_warning") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (status === "manual_review_required") return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
}

export default function ExamSessionClient(props: {
  initialQuestions: ExamQuestionLike[];
  subject: string;
  examKey: string;
  sessionMode?: SessionMode;

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
    sessionMode = "practice",
    examTitle = "Exam Session",
    examPdfSrc = null,
    readingMins = 15,
    writingMins = 60,
    allowCAS = false,
    exactRequired = true,
    workingRequired = true,
  } = props;

  const isExamMode = sessionMode === "exam";

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

  const criterionFeedback = useMemo(
    () => normalizeCriterionFeedback(result, displayedRubric),
    [result, displayedRubric]
  );

  const hasAssessedCriteria = useMemo(
    () => hasAssessedCriterionFeedback(criterionFeedback),
    [criterionFeedback]
  );

  const shouldShowCriterionFeedback =
    criterionFeedback.length > 0 &&
    hasAssessedCriteria &&
    Number(displayedMaxScore ?? maxMarks) > 1;

  const shouldShowRubricGuide =
    displayedRubric.length > 0 && !shouldShowCriterionFeedback;

  const markingConfidence = useMemo(() => normalizeMarkingConfidence(result), [result]);
  const markingConfidenceText = markingConfidence ? markingConfidenceCopy(markingConfidence) : null;

  const qLabel = useMemo(() => {
    if (!question) return "";
    const qn = question.questionNumber?.trim();
    return qn ? `Question ${qn}` : `Question ${currentIndex + 1}`;
  }, [question, currentIndex]);

  const isFlagged = Boolean(question && flagged[String(question.id)]);
  const answerType = String(question?.answerType ?? "").toUpperCase();
  const answerKind = classifyAnswerInputKind(answerType);
  const needsWorkingInput =
    question?.isMarkable === false ||
    answerKind === "working";
  const compactAnswerInput = !needsWorkingInput;
  const answerInputCopy = ANSWER_INPUT_COPY[answerKind];
  const answerPlaceholder = answerInputCopy.placeholder;
  const interpretedAnswer = useMemo(
    () => normalizeAnswerInput(answer, answerType),
    [answer, answerType]
  );
  const renderedInterpretedAnswer = useMemo(
    () => calculatorTextToLatex(interpretedAnswer.displayAnswer),
    [interpretedAnswer.displayAnswer]
  );
  const hasTypedAnswer = answer.trim().length > 0;
  const blockingInputWarning = interpretedAnswer.warnings.find(
    (warning) => warning.severity === "blocking"
  );
  const submitValidationMessage =
    hasTypedAnswer && !needsWorkingInput && blockingInputWarning
      ? answerWarningText(blockingInputWarning, interpretedAnswer.normalizedAnswer, isExamMode)
      : null;
  const canSubmitAnswer =
    !isSubmitting &&
    hasTypedAnswer &&
    (needsWorkingInput || !submitValidationMessage);

  const answerShortcuts = useMemo<AnswerShortcut[]>(() => {
    const fractionShortcut: AnswerShortcut = {
      label: "a/b",
      value: "()/()",
      ariaLabel: "Insert fraction template",
      cursorOffset: 1,
      buildValue: (selected) => selected
        ? { value: `(${selected})/()`, cursorOffset: selected.length + 4 }
        : { value: "()/()", cursorOffset: 1 },
    };

    const bracketShortcut = (label: string, open: string, close: string, ariaLabel: string): AnswerShortcut => ({
      label,
      value: `${open}${close}`,
      ariaLabel,
      cursorOffset: 1,
      buildValue: (selected) => selected
        ? { value: `${open}${selected}${close}`, cursorOffset: selected.length + 2 }
        : { value: `${open}${close}`, cursorOffset: 1 },
    });

    const functionShortcut = (name: string, label = name): AnswerShortcut => ({
      label,
      value: `${name}()`,
      ariaLabel: `Insert ${name} template`,
      cursorOffset: name.length + 1,
      buildValue: (selected) => selected
        ? { value: `${name}(${selected})`, cursorOffset: name.length + selected.length + 2 }
        : { value: `${name}()`, cursorOffset: name.length + 1 },
    });

    const squareShortcut: AnswerShortcut = {
      label: "x^2",
      value: "x^2",
      ariaLabel: "Insert square template",
      cursorOffset: 3,
      buildValue: (selected) => selected
        ? { value: needsWorkingInput ? `${selected}^2` : `(${selected})^2`, cursorOffset: (needsWorkingInput ? selected.length : selected.length + 2) + 2 }
        : { value: "x^2", cursorOffset: 3 },
    };

    const powerShortcut: AnswerShortcut = {
      label: "x^n",
      value: "x^()",
      ariaLabel: "Insert power template",
      cursorOffset: 3,
      buildValue: (selected) => selected
        ? { value: `${selected}^()`, cursorOffset: selected.length + 2 }
        : { value: "x^()", cursorOffset: 3 },
    };

    const expressionShortcuts: AnswerShortcut[] = [
      { label: "x", value: "x", ariaLabel: "Insert x" },
      { label: "*", value: "*", ariaLabel: "Insert multiplication symbol" },
      fractionShortcut,
      squareShortcut,
      powerShortcut,
      bracketShortcut("( )", "(", ")", "Insert bracket template"),
      { label: ",", value: ",", ariaLabel: "Insert comma" },
      functionShortcut("sqrt"),
      { label: "pi", value: "pi", ariaLabel: "Insert pi" },
      functionShortcut("sin"),
      functionShortcut("cos"),
      functionShortcut("tan"),
    ];

    if (needsWorkingInput) {
      return expressionShortcuts;
    }

    if (answerKind === "numeric") {
      return [
        fractionShortcut,
        functionShortcut("sqrt"),
        { label: "pi", value: "pi", ariaLabel: "Insert pi" },
        bracketShortcut("( )", "(", ")", "Insert bracket template"),
      ];
    }

    if (answerKind === "interval") {
      return [
        { label: "x", value: "x", ariaLabel: "Insert x" },
        { label: "<=", value: "<=", ariaLabel: "Insert less than or equal" },
        { label: ">=", value: ">=", ariaLabel: "Insert greater than or equal" },
        { label: "<", value: "<", ariaLabel: "Insert less than" },
        { label: ">", value: ">", ariaLabel: "Insert greater than" },
        { label: "inf", value: "infinity", ariaLabel: "Insert infinity" },
        { label: "[,]", value: "[,]", ariaLabel: "Insert closed interval template", cursorOffset: 1 },
        { label: "(,)", value: "(,)", ariaLabel: "Insert open interval template", cursorOffset: 1 },
        { label: "[,)", value: "[,)", ariaLabel: "Insert left closed interval template", cursorOffset: 1 },
        { label: "(,]", value: "(,]", ariaLabel: "Insert right closed interval template", cursorOffset: 1 },
      ];
    }

    if (answerKind === "coordinate") {
      return [
        { label: "(x,y)", value: "(,)", ariaLabel: "Insert coordinate pair template", cursorOffset: 1 },
        fractionShortcut,
        functionShortcut("sqrt"),
        { label: "pi", value: "pi", ariaLabel: "Insert pi" },
        { label: ",", value: ",", ariaLabel: "Insert comma" },
      ];
    }

    if (answerKind === "set_list") {
      return [
        { label: "{,}", value: "{,}", ariaLabel: "Insert set template", cursorOffset: 1 },
        { label: ",", value: ",", ariaLabel: "Insert comma" },
        fractionShortcut,
        functionShortcut("sqrt"),
        { label: "pi", value: "pi", ariaLabel: "Insert pi" },
      ];
    }

    return expressionShortcuts;
  }, [answerKind, needsWorkingInput]);

  const insertAnswerToken = (shortcut: AnswerShortcut) => {
    const el = answerInputRef.current;
    const start = el?.selectionStart ?? answer.length;
    const end = el?.selectionEnd ?? answer.length;
    const selectedText = answer.slice(start, end);
    const built = shortcut.buildValue?.(selectedText);
    const token = built?.value ?? shortcut.value;

    if (!el) {
      setAnswer((value) => `${value}${token}`);
      return;
    }

    const nextAnswer = `${answer.slice(0, start)}${token}${answer.slice(end)}`;
    const cursorOffset = built?.cursorOffset ?? shortcut.cursorOffset ?? (token.endsWith("()") ? token.length - 1 : token.length);

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
    if (!hasTypedAnswer) {
      setSubmitError("Enter an answer before submitting.");
      return;
    }
    if (submitValidationMessage) {
      setSubmitError(submitValidationMessage);
      return;
    }

    setSubmitError(null);
    setResult(null);

    try {
      setIsSubmitting(true);

      const res = (await submitExamAnswer({
        examKey,
        questionId: question.id,
        answer,
        normalizedAnswer: interpretedAnswer.normalizedAnswer,
        inputMode: needsWorkingInput ? "working_text" : "calculator_text",
        parserWarnings: interpretedAnswer.warnings,
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
    const examPath = examKey.includes("_EXAM2_") ? "exam-2" : "exam-1";
    router.push(`/student/practice/math-methods/${examPath}/review?examKey=${encodeURIComponent(examKey)}`);
  };

  const answerPanelCopy = isExamMode
    ? {
        title: "Your answer",
        markable: "Submit your answer to check it against the dataset.",
        manual: "This part is saved for manual review.",
        submit: "Submit Answer",
        submitting: "Checking...",
        finish: "Finish & Review",
      }
    : {
        title: "Practice answer",
        markable: "Try the question, then check your answer and review the worked solution.",
        manual: "Write your working for review. This part is not auto-marked yet.",
        submit: "Check Answer",
        submitting: "Checking...",
        finish: "End Practice",
      };

  const copyPlainExpectedAnswer = (event: React.ClipboardEvent<HTMLElement>) => {
    if (!result?.correctAnswer) return;

    const plainAnswer = plainAnswerForClipboard(result.correctAnswer);
    if (!plainAnswer) return;

    event.preventDefault();
    event.clipboardData.setData("text/plain", plainAnswer);
  };
  
  if (!questions.length) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">
        No exam questions loaded for <span className="font-mono">{examKey}</span>.
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">No current question.</div>
    );
  }

  return (
    <div className="space-y-4" data-testid="exam-session">
      {isExamMode ? (
        <div className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 text-sm">
          <strong>Exam Mode</strong> — timed conditions are on. Hints and assistance are disabled during the attempt.
        </div>
      ) : (
        <div className="px-4 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm">
          <strong>Practice Mode</strong> — check answers as you go and use feedback to improve before trying a full exam attempt.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7">
          <div className="space-y-4 sticky top-4">
            <div className="glass p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">{qLabel}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {examTitle} • {isExamMode ? "Exam attempt" : "Practice"} • {currentIndex + 1} of {questions.length}
                    {isFlagged ? " • Flagged" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    data-testid="exam-previous"
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                  >
                    Previous
                  </Button>

                  <Button
                    data-testid="exam-flag"
                    variant={isFlagged ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleFlag}
                    className={isFlagged ? "border-amber-500/40 text-amber-700 dark:text-amber-300" : ""}
                  >
                    {isFlagged ? "Unflag" : "Flag"}
                  </Button>

                  <Button
                    data-testid="exam-next"
                    variant="outline"
                    size="sm"
                    onClick={goNext}
                    disabled={currentIndex >= questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <QuestionCard question={question as any} />
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="space-y-6">
            <div className="glass p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">{examTitle}</h1>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded border border-border bg-muted">Reading: {readingMins} min</span>
                    <span className="px-2 py-1 rounded border border-border bg-muted">Writing: {writingMins} min</span>
                    <span className="px-2 py-1 rounded border border-border bg-muted">
                      CAS: {allowCAS ? "Allowed" : "Not allowed"}
                    </span>
                    <span className="px-2 py-1 rounded border border-border bg-muted">
                      Exact: {exactRequired ? "Required" : "Not required"}
                    </span>
                    <span className="px-2 py-1 rounded border border-border bg-muted">
                      Working: {workingRequired ? "Required" : "Not required"}
                    </span>
                    {isExamMode ? (
                      <span className="px-2 py-1 rounded border border-border bg-muted">
                        Attempted: {answeredCount}/{questions.length}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded border border-border bg-muted">
                        Practice progress: {answeredCount}/{questions.length} • Correct: {correctCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{isExamMode ? "PDF reference" : "Source reference"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isExamMode
                      ? "Open the original exam PDF only when you need to check the source."
                      : "Use the original exam PDF to compare wording, diagrams, and source context while practising."}
                  </p>
                </div>

                {examPdfSrc ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={examPdfSrc} target="_blank" rel="noreferrer">
                      Open PDF
                    </a>
                  </Button>
                ) : (
                  <span className="px-3 py-2 rounded border border-border bg-muted text-xs text-muted-foreground">
                    No PDF
                  </span>
                )}
              </div>
            </div>

            <div className="glass p-5 space-y-4">
              <div>
                <h2 className="font-semibold">{answerPanelCopy.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {question.isMarkable === false
                    ? answerPanelCopy.manual
                    : answerPanelCopy.markable}
                </p>
              </div>

              <div className="space-y-3">
                {compactAnswerInput ? (
                  <input
                    data-testid="exam-answer"
                    ref={answerInputRef as any}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
                    }}
                    placeholder={answerPlaceholder}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                ) : (
                  <textarea
                    data-testid="exam-answer"
                    ref={answerInputRef as any}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
                    }}
                    placeholder={answerPlaceholder}
                    rows={question.isMarkable === false ? 6 : 4}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground resize-y outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                )}

                {!needsWorkingInput &&
                  (answerKind === "coordinate" || answerKind === "interval" || answerKind === "set_list") && (
                    <StructuredAnswerBuilder
                      answerKind={answerKind}
                      answer={answer}
                      onAnswerChange={setAnswer}
                    />
                  )}

                <div className="flex flex-wrap items-center gap-2">
                  {answerShortcuts.map((shortcut) => (
                    <button
                      key={`${shortcut.label}-${shortcut.value}`}
                      type="button"
                      onClick={() => insertAnswerToken(shortcut)}
                      aria-label={shortcut.ariaLabel}
                      title={shortcut.ariaLabel}
                      className="px-3 py-1.5 rounded-md border border-border bg-muted hover:bg-accent text-xs font-medium text-foreground"
                    >
                      {shortcut.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <p>{answerInputCopy.helper}</p>
                  <p className="mt-1">
                    Examples:{" "}
                    {answerInputCopy.examples.map((example, index) => (
                      <span key={example}>
                        {index > 0 ? ", " : ""}
                        <span className="font-mono text-foreground">{example}</span>
                      </span>
                    ))}
                  </p>
                </div>

                {hasTypedAnswer && !needsWorkingInput && (
                  <div
                    className={`rounded-lg border p-4 ${
                      interpretedAnswer.canMarkSafely
                        ? "border-slate-700 bg-slate-900/40 text-slate-300"
                        : "border-amber-600/70 bg-amber-950/30 text-amber-100"
                    }`}
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {isExamMode
                            ? "Answer format check"
                            : interpretedAnswer.normalizedAnswer !== answer.trim()
                              ? "Did you mean this?"
                              : "Your input means"}
                        </div>
                        <div className="mt-2 rounded-lg border border-slate-700/80 bg-slate-950/50 px-4 py-3 text-slate-100">
                          {renderedInterpretedAnswer ? (
                            <MathpixMarkdown value={`\\(${renderedInterpretedAnswer}\\)`} />
                          ) : (
                            <span className="text-sm text-muted-foreground">No interpretable answer yet.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">
                          {isExamMode ? "Formatted answer" : "Typed form used for checking"}
                        </span>
                        <code className="rounded bg-slate-950/60 px-2 py-1 text-slate-100">
                          {interpretedAnswer.displayAnswer || "empty"}
                        </code>
                      </div>
                    </div>

                    {interpretedAnswer.warnings.length > 0 && (
                      <div className="mt-3 space-y-1 text-xs">
                        {interpretedAnswer.warnings.map((warning) => (
                          <p key={`${warning.code}-${warning.message}`}>
                            <span className="font-semibold">
                              {answerWarningText(warning, interpretedAnswer.normalizedAnswer, isExamMode)}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {submitValidationMessage && (
                  <div className="w-full rounded-lg border border-amber-600/70 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
                    {submitValidationMessage}
                  </div>
                )}

                <Button
                  data-testid="exam-submit-answer"
                  disabled={!canSubmitAnswer}
                  title={submitValidationMessage ?? undefined}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? answerPanelCopy.submitting : answerPanelCopy.submit}
                </Button>

                <Button
                  data-testid="exam-finish-review"
                  variant="outline"
                  size="lg"
                  onClick={finishAndReview}
                >
                  {answerPanelCopy.finish}
                </Button>
              </div>

              {submitError && (
                <div className="glass p-4 text-red-600 dark:text-red-300">
                  <p className="font-semibold mb-1">Submission error</p>
                  <p className="text-sm text-muted-foreground">{submitError}</p>
                </div>
              )}
            </div>

            {result && (
              <div
                data-testid="exam-feedback"
                className={`glass p-4 ${normalizedCorrect === null
                    ? ""
                    : normalizedCorrect
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
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
                      <p className="mt-1 text-muted-foreground">
                        Marks:{" "}
                        <span className="font-semibold text-foreground">
                          {displayedScore} / {displayedMaxScore}
                        </span>
                      </p>
                    )}

                    {markingConfidenceText && (
                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${markingConfidenceClasses(
                            markingConfidence!
                          )}`}
                        >
                          {markingConfidenceText.label}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {markingConfidenceText.detail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  {(result.correctAnswer ||
                    result.workedSolution ||
                    result.explanation ||
                    result.examinerFeedback ||
                    displayedRubric.length > 0 ||
                    criterionFeedback.length > 0) && (
                    <div className="mb-4 space-y-4 text-sm text-foreground">
                      {result.examinerFeedback?.summary && (
                        <div>
                          <div className="text-muted-foreground">Examiner feedback</div>
                          <p className="mt-1">{result.examinerFeedback.summary}</p>
                        </div>
                      )}

                      {result.correctAnswer && (
                        <div>
                          <div className="text-muted-foreground">Expected answer</div>
                          <div
                            className="mt-1"
                            onCopy={copyPlainExpectedAnswer}
                            title="Copying this answer uses plain calculator-style text."
                          >
                            <MathpixMarkdown value={result.correctAnswer} />
                          </div>
                        </div>
                      )}

                      {shouldShowCriterionFeedback && (
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="text-muted-foreground">Mark breakdown</div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Your score is split across the marking criteria for this part.
                              </p>
                            </div>
                            <div className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                              Total{" "}
                              <span className="font-semibold text-foreground">
                                {displayedScore ?? "-"}
                              </span>{" "}
                              / {displayedMaxScore ?? maxMarks} mark
                              {Number(displayedMaxScore ?? maxMarks) === 1 ? "" : "s"}
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            {criterionFeedback.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-border bg-muted/20 p-3 text-sm"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${criterionStateClasses(
                                          item.state
                                        )}`}
                                      >
                                        {criterionStateLabel(item.state)}
                                      </span>
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {item.label}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-foreground">{item.criterion}</p>
                                  </div>

                                  {item.maxScore != null && (
                                    <div className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                                      <span className="font-semibold text-foreground">
                                        {item.score ?? "-"}
                                      </span>{" "}
                                      / {item.maxScore} mark{item.maxScore === 1 ? "" : "s"}
                                    </div>
                                  )}
                                </div>

                                {item.feedback && (
                                  <p className="mt-2 text-xs text-muted-foreground">{item.feedback}</p>
                                )}

                                {item.errorTags && item.errorTags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.errorTags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-700 dark:text-red-300"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Number(displayedMaxScore ?? maxMarks) > 1 &&
                        !shouldShowCriterionFeedback &&
                        displayedRubric.length > 0 && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                            Criterion-level marking was not returned for this attempt yet. Use the marking guide below to review how marks are allocated.
                          </div>
                        )}

                      {shouldShowRubricGuide && (
                        <div>
                          <div className="text-muted-foreground">Marking guide</div>
                          <div className="mt-2 overflow-hidden rounded-lg border border-border">
                            {displayedRubric.map((item, index) => (
                              <div
                                key={`${index}-${item.criterion}`}
                                className="grid grid-cols-[72px_1fr] border-b border-border last:border-b-0"
                              >
                                <div className="bg-muted/50 px-3 py-2 text-muted-foreground">
                                  {item.marks ?? 1} mark{Number(item.marks ?? 1) === 1 ? "" : "s"}
                                </div>
                                <div className="px-3 py-2">
                                  {item.criterion}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(result.workedSolution || result.explanation) && (
                        <div>
                          <div className="text-muted-foreground">Worked solution</div>
                          <div className="mt-1">
                            <MathpixMarkdown value={result.workedSolution || result.explanation || ""} />
                          </div>
                        </div>
                      )}

                      {result.examinerFeedback?.commonMistake && (
                        <div>
                          <div className="text-muted-foreground">Common mistake</div>
                          <p className="mt-1">{result.examinerFeedback.commonMistake}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className="text-xs text-muted-foreground underline"
                    onClick={() => setShowDebug((v) => !v)}
                  >
                    {showDebug ? "Hide debug details" : "Show debug details"}
                  </button>

                  {showDebug && (
                    <div className="mt-2 text-xs text-foreground space-y-2">
                      <div>
                        <div className="text-muted-foreground">attempts (this question)</div>
                        <pre className="whitespace-pre-wrap break-words bg-muted/50 p-2 rounded">
                          {JSON.stringify(attemptsByQid[qid] ?? [], null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div className="text-muted-foreground">latest result</div>
                        <pre className="whitespace-pre-wrap break-words bg-muted/50 p-2 rounded">
                          {JSON.stringify(result ?? {}, null, 2)}
                        </pre>
                      </div>

                      {result?.explanation && (
                        <div>
                          <div className="text-muted-foreground">Examiner feedback</div>
                          <pre className="whitespace-pre-wrap break-words bg-muted/50 p-2 rounded">
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
