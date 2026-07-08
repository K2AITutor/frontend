import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const require = createRequire(import.meta.url);
const sourcePath = path.join(root, "src", "lib", "mathAnswerInput.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
});

const sandbox = {
  exports: {},
  module: { exports: {} },
  require,
};
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(compiled.outputText, sandbox, { filename: sourcePath });

const { normalizeAnswerInput } = sandbox.module.exports;
if (typeof normalizeAnswerInput !== "function") {
  throw new Error("normalizeAnswerInput export was not found.");
}

const cases = [
  {
    raw: "2xcos(x)-x^2sin(x)",
    answerType: "EXPRESSION",
    normalizedAnswer: "2*x*cos(x)-x^2*sin(x)",
    canMarkSafely: true,
    expectedWarning: "SAFE_IMPLICIT_MULTIPLICATION_NORMALIZED",
  },
  {
    raw: "2cos(x)",
    answerType: "EXPRESSION",
    normalizedAnswer: "2*cos(x)",
    canMarkSafely: true,
    expectedWarning: "SAFE_IMPLICIT_MULTIPLICATION_NORMALIZED",
  },
  {
    raw: "x^2sin(x)",
    answerType: "EXPRESSION",
    normalizedAnswer: "x^2*sin(x)",
    canMarkSafely: true,
    expectedWarning: "SAFE_IMPLICIT_MULTIPLICATION_NORMALIZED",
  },
  {
    raw: "2*cos(x)-x^2*sin(x)",
    answerType: "EXPRESSION",
    normalizedAnswer: "2*cos(x)-x^2*sin(x)",
    canMarkSafely: true,
  },
  {
    raw: "x2",
    answerType: "EXPRESSION",
    normalizedAnswer: "x2",
    canMarkSafely: false,
    expectedWarning: "AMBIGUOUS_IMPLICIT_POWER",
  },
  {
    raw: "sinx",
    answerType: "EXPRESSION",
    canMarkSafely: false,
    expectedWarning: "FUNCTION_ARGUMENT_NEEDS_BRACKETS",
  },
  {
    raw: "2cos(x",
    answerType: "EXPRESSION",
    canMarkSafely: false,
    expectedWarning: "UNBALANCED_BRACKETS",
  },
  {
    raw: "3/2",
    answerType: "NUMERIC",
    normalizedAnswer: "3/2",
    canMarkSafely: true,
  },
  {
    raw: "x+1",
    answerType: "NUMERIC",
    canMarkSafely: false,
    expectedWarning: "NUMERIC_ANSWER_HAS_VARIABLE",
  },
  {
    raw: "(2,3)",
    answerType: "NUMERIC",
    canMarkSafely: false,
    expectedWarning: "NUMERIC_ANSWER_EXPECTS_SINGLE_VALUE",
  },
  {
    raw: "[0,1)",
    answerType: "INTERVAL",
    normalizedAnswer: "[0,1)",
    canMarkSafely: true,
  },
  {
    raw: "(1, infinity)",
    answerType: "INTERVAL",
    normalizedAnswer: "(1,infinity)",
    canMarkSafely: true,
  },
  {
    raw: "x <= 2",
    answerType: "INTERVAL",
    normalizedAnswer: "x<=2",
    canMarkSafely: true,
  },
  {
    raw: "0 < x <= 1",
    answerType: "INTERVAL",
    normalizedAnswer: "0<x<=1",
    canMarkSafely: true,
  },
  {
    raw: "0,1",
    answerType: "INTERVAL",
    canMarkSafely: false,
    expectedWarning: "INTERVAL_FORMAT_REQUIRED",
  },
  {
    raw: "[0,1",
    answerType: "INTERVAL",
    canMarkSafely: false,
    expectedWarning: "UNBALANCED_BRACKETS",
  },
  {
    raw: "(2,3)",
    answerType: "COORDINATE",
    normalizedAnswer: "(2,3)",
    canMarkSafely: true,
  },
  {
    raw: "( -1, sqrt(2) )",
    answerType: "COORDINATE",
    normalizedAnswer: "(-1,sqrt(2))",
    canMarkSafely: true,
  },
  {
    raw: "2,3",
    answerType: "COORDINATE",
    canMarkSafely: false,
    expectedWarning: "COORDINATE_FORMAT_REQUIRED",
  },
  {
    raw: "(2,3,4)",
    answerType: "COORDINATE",
    canMarkSafely: false,
    expectedWarning: "COORDINATE_FORMAT_REQUIRED",
  },
  {
    raw: "-1, 2, 5",
    answerType: "SET/LIST",
    normalizedAnswer: "-1,2,5",
    canMarkSafely: true,
  },
  {
    raw: "{-1,2,5}",
    answerType: "SET/LIST",
    normalizedAnswer: "{-1,2,5}",
    canMarkSafely: true,
  },
  {
    raw: "x=1, x=2",
    answerType: "SET/LIST",
    normalizedAnswer: "x=1,x=2",
    canMarkSafely: true,
  },
  {
    raw: "(2,3)",
    answerType: "SET/LIST",
    canMarkSafely: false,
    expectedWarning: "SET_LIST_FORMAT_REQUIRED",
  },
  {
    raw: "{1,2",
    answerType: "SET/LIST",
    canMarkSafely: false,
    expectedWarning: "UNBALANCED_BRACKETS",
  },
  {
    raw: "c",
    answerType: "MULTIPLE_CHOICE",
    normalizedAnswer: "C",
    canMarkSafely: true,
  },
  {
    raw: "E",
    answerType: "MULTIPLE_CHOICE",
    normalizedAnswer: "E",
    canMarkSafely: false,
    expectedWarning: "MULTIPLE_CHOICE_OPTION_REQUIRED",
  },
  {
    raw: "Use the tangent rule and show working.",
    answerType: "MANUAL",
    normalizedAnswer: "Use the tangent rule and show working.",
    canMarkSafely: true,
  },
];

for (const testCase of cases) {
  const result = normalizeAnswerInput(testCase.raw, testCase.answerType);
  const warnings = result.warnings.map((warning) => warning.code);

  if (testCase.normalizedAnswer !== undefined && result.normalizedAnswer !== testCase.normalizedAnswer) {
    throw new Error(
      `${testCase.raw}: expected normalizedAnswer ${testCase.normalizedAnswer}, got ${result.normalizedAnswer}`,
    );
  }

  if (result.canMarkSafely !== testCase.canMarkSafely) {
    throw new Error(`${testCase.raw}: expected canMarkSafely ${testCase.canMarkSafely}, got ${result.canMarkSafely}`);
  }

  if (testCase.expectedWarning && !warnings.includes(testCase.expectedWarning)) {
    throw new Error(`${testCase.raw}: expected warning ${testCase.expectedWarning}, got ${warnings.join(", ")}`);
  }
}

console.log(`Validated ${cases.length} frontend answer-input normalizer cases.`);
