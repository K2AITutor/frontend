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

export type AnswerInputKind = "numeric" | "expression" | "interval" | "coordinate" | "set_list" | "working";

const FUNCTION_NAMES = ["sin", "cos", "tan", "log", "ln", "sqrt"];
const NAMED_CONSTANTS = ["pi", "e"];
const KNOWN_WORDS = [...FUNCTION_NAMES, ...NAMED_CONSTANTS, "infinity", "inf"];

export function classifyAnswerInputKind(answerType?: string | null): AnswerInputKind {
  const upperAnswerType = String(answerType ?? "").toUpperCase();
  if (["WORKING", "PROOF", "GRAPH", "EXPLANATION", "TEXT"].some((type) => upperAnswerType.includes(type))) {
    return "working";
  }
  if (upperAnswerType.includes("INTERVAL") || upperAnswerType.includes("INEQUALITY")) return "interval";
  if (upperAnswerType.includes("COORDINATE") || upperAnswerType.includes("POINT")) return "coordinate";
  if (upperAnswerType.includes("SET") || upperAnswerType.includes("LIST")) return "set_list";
  if (upperAnswerType.includes("NUMERIC") || upperAnswerType.includes("NUMBER")) return "numeric";
  return "expression";
}

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

function pushWarningOnce(warnings: AnswerInputWarning[], warning: AnswerInputWarning) {
  if (warnings.some((item) => item.code === warning.code)) return;
  warnings.push(warning);
}

function isKnownFunctionAt(value: string, index: number) {
  return FUNCTION_NAMES.some((fn) => value.slice(index, index + fn.length) === fn);
}

function functionNameEndsAt(value: string, index: number) {
  return FUNCTION_NAMES.some((fn) => value.slice(index - fn.length + 1, index + 1) === fn);
}

function isKnownConstantAt(value: string, index: number) {
  return NAMED_CONSTANTS.some((constant) => value.slice(index, index + constant.length) === constant);
}

function alphaRunAround(value: string, index: number) {
  let start = index;
  let end = index;
  while (start > 0 && /[a-z]/.test(value[start - 1])) start -= 1;
  while (end < value.length - 1 && /[a-z]/.test(value[end + 1])) end += 1;
  return value.slice(start, end + 1);
}

function isKnownAlphaRun(value: string, index: number) {
  const run = alphaRunAround(value, index);
  return KNOWN_WORDS.includes(run);
}

function findImplicitMultiplicationWarnings(normalizedAnswer: string): AnswerInputWarning[] {
  const warnings: AnswerInputWarning[] = [];

  for (let index = 0; index < normalizedAnswer.length - 1; index += 1) {
    const current = normalizedAnswer[index];
    const next = normalizedAnswer[index + 1];

    if (/\d/.test(current) && /[a-z]/.test(next)) {
      pushWarningOnce(warnings, {
        code: "MISSING_MULTIPLICATION_AFTER_NUMBER",
        severity: "blocking",
        message: "This looks like missing multiplication, such as 2x.",
        suggestion: "Use 2*x so the marker does not read it as one token.",
      });
      continue;
    }

    if (current === ")" && (next === "(" || /[a-z0-9]/.test(next))) {
      pushWarningOnce(warnings, {
        code: "MISSING_MULTIPLICATION_AFTER_BRACKET",
        severity: "blocking",
        message: "This looks like multiplication after a bracket, but the * is missing.",
        suggestion: "Use (x+1)*(x-1) or 3*(x+1).",
      });
      continue;
    }

    if ((/[a-z0-9]/.test(current) && next === "(") && !functionNameEndsAt(normalizedAnswer, index)) {
      pushWarningOnce(warnings, {
        code: "MISSING_MULTIPLICATION_BEFORE_BRACKET",
        severity: "blocking",
        message: "This looks like multiplication before a bracket, but the * is missing.",
        suggestion: "Use x*(x+1), not x(x+1).",
      });
      continue;
    }

    if (/[a-z]/.test(current) && /[a-z]/.test(next)) {
      if (isKnownAlphaRun(normalizedAnswer, index)) continue;
      if (isKnownFunctionAt(normalizedAnswer, index) || isKnownFunctionAt(normalizedAnswer, index + 1)) {
        continue;
      }
      if (isKnownConstantAt(normalizedAnswer, index) || isKnownConstantAt(normalizedAnswer, index + 1)) {
        continue;
      }
      pushWarningOnce(warnings, {
        code: "ADJACENT_SYMBOLS_NEED_OPERATOR",
        severity: "blocking",
        message: "Letters written together are ambiguous.",
        suggestion: "Use * between multiplied symbols, such as x*y or x*sin(x).",
      });
    }
  }

  return warnings;
}

function hasAmbiguousIntervalShape(normalizedAnswer: string) {
  if (!normalizedAnswer) return false;
  if (/^[\[\(].*[\]\)]$/.test(normalizedAnswer)) return false;
  if (/^[a-z][<>]=?-?[\w.]+$/i.test(normalizedAnswer)) return false;
  if (/^-?[\w.]+[<>]=?[a-z]$/i.test(normalizedAnswer)) return false;
  if (/^-?[\w.]+[<>]=?[a-z][<>]=?-?[\w.]+$/i.test(normalizedAnswer)) return false;

  return normalizedAnswer.includes(",") || /[<>]/.test(normalizedAnswer);
}

function hasOnlyNumericSymbols(normalizedAnswer: string) {
  const withoutKnownWords = KNOWN_WORDS.reduce(
    (value, word) => value.replace(new RegExp(`\\b${word}\\b`, "g"), ""),
    normalizedAnswer
  );
  return !/[a-z]/i.test(withoutKnownWords);
}

function looksLikeCoordinate(normalizedAnswer: string) {
  return /^\([^,]+,[^)]+\)$/.test(normalizedAnswer);
}

function looksLikeSetOrList(normalizedAnswer: string) {
  if (/^\{[^{}]+\}$/.test(normalizedAnswer)) return true;
  if (/^\([^()]+,[^()]+\)$/.test(normalizedAnswer)) return false;
  return normalizedAnswer.includes(",");
}

function addAnswerTypeWarnings(
  warnings: AnswerInputWarning[],
  normalizedAnswer: string,
  answerKind: AnswerInputKind
) {
  if (!normalizedAnswer) return;

  if (answerKind === "numeric" && !hasOnlyNumericSymbols(normalizedAnswer)) {
    pushWarningOnce(warnings, {
      code: "NUMERIC_ANSWER_HAS_VARIABLE",
      severity: "blocking",
      message: "This question expects a number, not an expression with variables.",
      suggestion: "Enter a numeric value such as 3/2, sqrt(2), or pi/4.",
    });
  }

  if (answerKind === "coordinate" && !looksLikeCoordinate(normalizedAnswer)) {
    pushWarningOnce(warnings, {
      code: "COORDINATE_FORMAT_REQUIRED",
      severity: "blocking",
      message: "Coordinate answers need one ordered pair.",
      suggestion: "Use the format (x,y), for example (2,3).",
    });
  }

  if (answerKind === "set_list" && !looksLikeSetOrList(normalizedAnswer)) {
    pushWarningOnce(warnings, {
      code: "SET_LIST_FORMAT_REQUIRED",
      severity: "blocking",
      message: "This answer expects a set or list of values.",
      suggestion: "Separate values with commas, for example -1,2,5 or {-1,2,5}.",
    });
  }
}

export function normalizeAnswerInput(
  rawAnswer: string,
  answerType?: string | null
): NormalizedAnswerInput {
  const raw = String(rawAnswer ?? "");
  const normalizedAnswer = normalizeText(raw);
  const warnings: AnswerInputWarning[] = [];
  const answerKind = classifyAnswerInputKind(answerType);

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

  warnings.push(...findImplicitMultiplicationWarnings(normalizedAnswer));

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

  if (answerKind === "interval" && hasAmbiguousIntervalShape(normalizedAnswer)) {
    warnings.push({
      code: "INTERVAL_AMBIGUOUS_NOTATION",
      severity: "blocking",
      message: "This interval or inequality answer is ambiguous.",
      suggestion: "Use notation like [0,1), (1, infinity), or x<=2.",
    });
  }

  addAnswerTypeWarnings(warnings, normalizedAnswer, answerKind);

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
