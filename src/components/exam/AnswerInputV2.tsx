"use client";

import { useMemo, useRef } from "react";
import MathpixMarkdown from "@/components/practice/MathpixMarkdown";

type AnswerInputMode = "NUMERIC" | "EXPRESSION" | "INTERVAL" | "ANSWER_SET" | "COORDINATE" | "EXPLANATION";

type Shortcut = {
  label: string;
  value: string;
};

type InputCheck = {
  level: "ok" | "warning" | "error";
  message: string;
};

type AnswerInputV2Props = {
  value: string;
  onChange: (value: string) => void;
  answerType?: string | null;
  isManualReview?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
  onFinishReview: () => void;
  isSubmitting?: boolean;
};

const COMMON_SHORTCUTS: Shortcut[] = [
  { label: "sqrt", value: "sqrt()" },
  { label: "^", value: "^" },
  { label: "pi", value: "pi" },
  { label: "sin", value: "sin()" },
  { label: "cos", value: "cos()" },
  { label: "tan", value: "tan()" },
  { label: "(", value: "(" },
  { label: ")", value: ")" },
];

const INTERVAL_SHORTCUTS: Shortcut[] = [
  { label: "[", value: "[" },
  { label: "]", value: "]" },
  { label: "(", value: "(" },
  { label: ")", value: ")" },
  { label: "U", value: " U " },
  { label: "inf", value: "infinity" },
  { label: "pi", value: "pi" },
];

const NUMERIC_SHORTCUTS: Shortcut[] = [
  { label: "sqrt", value: "sqrt()" },
  { label: "pi", value: "pi" },
  { label: "/", value: "/" },
  { label: "^", value: "^" },
  { label: "(", value: "(" },
  { label: ")", value: ")" },
];

function modeFromAnswerType(answerType?: string | null, isManualReview?: boolean): AnswerInputMode {
  const type = String(answerType ?? "").toUpperCase();
  if (isManualReview || ["WORKING", "PROOF", "GRAPH", "EXPLANATION", "TEXT"].some((item) => type.includes(item))) {
    return "EXPLANATION";
  }
  if (type.includes("INTERVAL")) return "INTERVAL";
  if (type.includes("COORDINATE")) return "COORDINATE";
  if (type.includes("ANSWER_SET")) return "ANSWER_SET";
  if (type.includes("NUMERIC")) return "NUMERIC";
  return "EXPRESSION";
}

function findUnbalancedBracket(input: string): string | null {
  const pairs: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
  };
  const closers = new Set(Object.values(pairs));
  const stack: string[] = [];

  for (const ch of input) {
    if (pairs[ch]) {
      stack.push(ch);
      continue;
    }

    if (closers.has(ch)) {
      const open = stack.pop();
      if (!open || pairs[open] !== ch) return `Bracket "${ch}" does not match the opening bracket.`;
    }
  }

  if (stack.length) return `Missing closing bracket "${pairs[stack[stack.length - 1]]}".`;
  return null;
}

function validateAnswerInput(answer: string, mode: AnswerInputMode): InputCheck[] {
  const value = answer.trim();
  if (!value) return [{ level: "warning", message: "Enter an answer before submitting." }];

  const checks: InputCheck[] = [];
  const bracketProblem = findUnbalancedBracket(value);
  if (bracketProblem) checks.push({ level: "error", message: bracketProblem });

  if (/[+-]{3,}/.test(value.replace(/\s+/g, "")) || /[+-]{2}/.test(value.replace(/\s+/g, ""))) {
    checks.push({
      level: "warning",
      message: "Check repeated plus or minus signs. Use separate answers if there are multiple values.",
    });
  }

  if (/[÷×]/.test(value)) {
    checks.push({ level: "warning", message: "Use / and * for division and multiplication when possible." });
  }

  if (/\*\*/.test(value)) {
    checks.push({ level: "warning", message: "Use ^ for powers, for example x^2." });
  }

  if (/\b(sin|cos|tan|sqrt|log|ln)\s+[a-zA-Z0-9]/i.test(value)) {
    checks.push({
      level: "warning",
      message: "Use brackets for functions, for example sin(x), cos(2*x), or sqrt(x+1).",
    });
  }

  if (mode === "NUMERIC" && /[a-zA-Z]/.test(value.replace(/\b(pi|e|sqrt|log|ln)\b/gi, ""))) {
    checks.push({
      level: "warning",
      message: "This question expects a number. Check whether your answer should still contain a variable.",
    });
  }

  if (mode === "INTERVAL" && !/[\[\]()]/.test(value) && !/[<>]/.test(value)) {
    checks.push({
      level: "warning",
      message: "Interval answers usually need brackets, such as [-1,3] or (-infinity,2].",
    });
  }

  if (!checks.length) checks.push({ level: "ok", message: "Input looks ready to submit." });
  return checks;
}

function replaceSimpleFunctionCalls(input: string, fn: string, latexFn: string, wrapWithBraces = false) {
  return input.replace(new RegExp(`\\b${fn}\\s*\\(([^()]*)\\)`, "gi"), (_match, inner) => {
    return wrapWithBraces ? `${latexFn}{${inner}}` : `${latexFn}(${inner})`;
  });
}

function readableMathPreview(input: string) {
  let output = String(input ?? "").trim();
  if (!output) return "";

  output = output
    .replace(/−/g, "-")
    .replace(/\*\*/g, "^")
    .replace(/\bpi\b/gi, "\\pi")
    .replace(/∞/g, "\\infty")
    .replace(/\binfinity\b/gi, "\\infty")
    .replace(/<=/g, "\\le ")
    .replace(/>=/g, "\\ge ")
    .replace(/->/g, "\\to ");

  output = replaceSimpleFunctionCalls(output, "sqrt", "\\sqrt", true);
  output = replaceSimpleFunctionCalls(output, "sin", "\\sin");
  output = replaceSimpleFunctionCalls(output, "cos", "\\cos");
  output = replaceSimpleFunctionCalls(output, "tan", "\\tan");
  output = replaceSimpleFunctionCalls(output, "log", "\\log");
  output = replaceSimpleFunctionCalls(output, "ln", "\\ln");

  return output
    .replace(/\*/g, " \\cdot ")
    .replace(/\s+/g, " ")
    .trim();
}

function exampleForMode(mode: AnswerInputMode) {
  switch (mode) {
    case "NUMERIC":
      return "Examples: 1, 3/2, sqrt(2), pi/4";
    case "INTERVAL":
      return "Examples: [-1,3], (0,infinity), x <= 2";
    case "ANSWER_SET":
      return "Examples: 0, pi or x=0, x=pi";
    case "COORDINATE":
      return "Examples: (pi/2,-1) or (0,1), (pi,-1)";
    case "EXPLANATION":
      return "Enter your working, explanation, or graph description.";
    default:
      return "Examples: 2x cos(x)-x^2 sin(x), sqrt(x+1), pi/2";
  }
}

function shortcutsForMode(mode: AnswerInputMode): Shortcut[] {
  if (mode === "NUMERIC") return NUMERIC_SHORTCUTS;
  if (mode === "INTERVAL") return INTERVAL_SHORTCUTS;
  if (mode === "EXPLANATION") return NUMERIC_SHORTCUTS;
  return COMMON_SHORTCUTS;
}

function labelForMode(mode: AnswerInputMode) {
  switch (mode) {
    case "NUMERIC":
      return "Number answer";
    case "INTERVAL":
      return "Interval or inequality";
    case "ANSWER_SET":
      return "Multiple answers";
    case "COORDINATE":
      return "Coordinate answer";
    case "EXPLANATION":
      return "Working or explanation";
    default:
      return "Expression answer";
  }
}

export default function AnswerInputV2({
  value,
  onChange,
  answerType,
  isManualReview = false,
  disabled = false,
  onSubmit,
  onFinishReview,
  isSubmitting = false,
}: AnswerInputV2Props) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const mode = useMemo(() => modeFromAnswerType(answerType, isManualReview), [answerType, isManualReview]);
  const checks = useMemo(() => validateAnswerInput(value, mode), [value, mode]);
  const hasError = checks.some((check) => check.level === "error");
  const preview = useMemo(() => readableMathPreview(value), [value]);
  const shortcuts = useMemo(() => shortcutsForMode(mode), [mode]);
  const compactInput = mode !== "EXPLANATION";

  const insertToken = (token: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(`${value}${token}`);
      return;
    }

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;
    const cursorOffset = token.endsWith("()") ? token.length - 1 : token.length;

    onChange(nextValue);
    window.requestAnimationFrame(() => {
      el.focus();
      const nextCursor = start + cursorOffset;
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className="glass p-5 space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-100">Your answer</h2>
            <p className="mt-1 text-sm text-slate-400">
              {isManualReview ? "This part is saved for manual review." : "Type naturally, check the preview, then submit."}
            </p>
          </div>
          <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">{labelForMode(mode)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {compactInput ? (
          <input
            ref={inputRef as any}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") onSubmit();
            }}
            placeholder={exampleForMode(mode)}
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100"
          />
        ) : (
          <textarea
            ref={inputRef as any}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") onSubmit();
            }}
            placeholder={exampleForMode(mode)}
            rows={isManualReview ? 6 : 4}
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-200 resize-y"
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {shortcuts.map((shortcut) => (
            <button
              key={`${shortcut.label}-${shortcut.value}`}
              type="button"
              onClick={() => insertToken(shortcut.value)}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
            >
              {shortcut.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-slate-200">We read your answer as</div>
            <div className="text-xs text-slate-500">Preview only</div>
          </div>
          <div className="mt-3 min-h-10 overflow-x-auto rounded-md bg-slate-900/60 px-3 py-3 text-slate-100">
            {preview ? (
              <MathpixMarkdown value={`\\(${preview}\\)`} />
            ) : (
              <span className="text-sm text-slate-500">Your typed answer will render here.</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/30 p-4">
          <div className="text-sm font-medium text-slate-200">Input checks</div>
          <div className="mt-3 space-y-2">
            {checks.map((check) => (
              <div
                key={`${check.level}-${check.message}`}
                className={`flex gap-2 text-sm ${check.level === "ok"
                  ? "text-emerald-300"
                  : check.level === "error"
                    ? "text-red-300"
                    : "text-amber-300"
                  }`}
              >
                <span className="mt-0.5 w-6 shrink-0 font-medium">
                  {check.level === "ok" ? "OK" : check.level === "error" ? "Fix" : "Tip"}
                </span>
                <span>{check.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/30 p-4">
          <div className="text-sm font-medium text-slate-200">Common format hints</div>
          <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
            <div>
              <span className="font-medium text-slate-300">Multiplication:</span>{" "}
              <span className="font-mono">2x</span> is accepted often, but <span className="font-mono">2*x</span> is safest.
            </div>
            <div>
              <span className="font-medium text-slate-300">Powers:</span>{" "}
              use <span className="font-mono">x^2</span>, not <span className="font-mono">x2</span>.
            </div>
            <div>
              <span className="font-medium text-slate-300">Functions:</span>{" "}
              use <span className="font-mono">sin(x)</span> and <span className="font-mono">sqrt(x+1)</span>.
            </div>
            <div>
              <span className="font-medium text-slate-300">Multiple answers:</span>{" "}
              separate values with commas, such as <span className="font-mono">0, pi</span>.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={disabled || isSubmitting || hasError || !value.trim()}
          onClick={onSubmit}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Submit Answer"}
        </button>

        <button
          onClick={onFinishReview}
          className="px-4 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold"
        >
          Finish & Review
        </button>
      </div>
    </div>
  );
}
