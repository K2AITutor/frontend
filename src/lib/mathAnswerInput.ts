export const ANSWER_INPUT_NORMALIZER_VERSION = "ANSWER_INPUT_NORMALIZER_V1";

export type AnswerInputWarningSeverity = "info" | "warning" | "blocking";

export type AnswerInputWarning = {
  code: string;
  severity: AnswerInputWarningSeverity;
  message: string;
  suggestion?: string;
};

export type NormalizedAnswerInput = {
  rawAnswer: string;
  normalizedAnswer: string;
  displayAnswer: string;
  warnings: AnswerInputWarning[];
  isAmbiguous: boolean;
  canMarkSafely: boolean;
  normalizerVersion: string;
};

const FUNCTION_NAMES = ["sin", "cos", "tan", "log", "ln", "sqrt"];

function hasBalancedDelimiters(value: string) {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  for (const char of value) {
    if (char === "(" || char === "[" || char === "{") stack.push(char);
    if (char === ")" || char === "]" || char === "}") {
      if (stack.pop() !== pairs[char]) return false;
    }
  }

  return stack.length === 0;
}

function normalizeText(value: string) {
  return value
    .trim()
    .replace(/\u2212/g, "-")
    .replace(/[≤⩽]/g, "<=")
    .replace(/[≥⩾]/g, ">=")
    .replace(/π/g, "pi")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/\*\*/g, "^")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function normalizeAnswerInput(
  rawAnswer: string,
  answerType?: string | null
): NormalizedAnswerInput {
  const raw = String(rawAnswer ?? "");
  const normalizedAnswer = normalizeText(raw);
  const warnings: AnswerInputWarning[] = [];
  const upperAnswerType = String(answerType ?? "").toUpperCase();

  if (!normalizedAnswer) {
    warnings.push({
      code: "EMPTY_NORMALIZED_ANSWER",
      severity: "blocking",
      message: "Enter an answer before submitting.",
    });
  }

  if (!hasBalancedDelimiters(normalizedAnswer)) {
    warnings.push({
      code: "UNBALANCED_BRACKETS",
      severity: "blocking",
      message: "Brackets are not balanced.",
      suggestion: "Check that every (, [, or { has a matching closing bracket.",
    });
  }

  if (/\b[a-z]\d+\b/i.test(normalizedAnswer)) {
    warnings.push({
      code: "AMBIGUOUS_IMPLICIT_POWER",
      severity: "blocking",
      message: "This looks ambiguous, such as x2.",
      suggestion: "Use x^2 for powers, or 2*x for multiplication.",
    });
  }

  if (/\d+\/\d+(?:[a-z]|\()/i.test(normalizedAnswer)) {
    warnings.push({
      code: "AMBIGUOUS_FRACTION_MULTIPLICATION",
      severity: "blocking",
      message: "Fractions next to variables or brackets can be read in more than one way.",
      suggestion: "Use brackets, for example (1/2)*x or 1/(2*x).",
    });
  }

  for (const fn of FUNCTION_NAMES) {
    const missingBrackets = new RegExp(`\\b${fn}[a-z0-9]`, "i");
    if (missingBrackets.test(normalizedAnswer) && !new RegExp(`\\b${fn}\\(`, "i").test(normalizedAnswer)) {
      warnings.push({
        code: "FUNCTION_ARGUMENT_NEEDS_BRACKETS",
        severity: "blocking",
        message: `${fn} needs brackets around its input.`,
        suggestion: `Use ${fn}(x), not ${fn}x.`,
      });
      break;
    }
  }

  if (upperAnswerType.includes("INTERVAL") && normalizedAnswer && !/^[\[\(].*[\]\)]$/.test(normalizedAnswer)) {
    warnings.push({
      code: "INTERVAL_BRACKET_MISMATCH",
      severity: "blocking",
      message: "Interval answers need clear endpoint brackets.",
      suggestion: "Use notation like [0,1), (1, infinity), or x<=2.",
    });
  }

  const isAmbiguous = warnings.some((warning) => warning.severity === "blocking");

  return {
    rawAnswer: raw,
    normalizedAnswer,
    displayAnswer: normalizedAnswer,
    warnings,
    isAmbiguous,
    canMarkSafely: !isAmbiguous,
    normalizerVersion: ANSWER_INPUT_NORMALIZER_VERSION,
  };
}
