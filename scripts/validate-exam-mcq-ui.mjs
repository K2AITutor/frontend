import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const componentPath = path.join(repoRoot, "apps", "web", "src", "components", "exam", "ExamSessionClient.tsx");
const source = fs.readFileSync(componentPath, "utf8");

const requiredSnippets = [
  {
    label: "MCQ detection helper exists",
    snippet: "function isMultipleChoiceQuestion",
  },
  {
    label: "MCQ option-card component exists",
    snippet: "function MultipleChoiceAnswerCards",
  },
  {
    label: "MCQ options render as buttons",
    snippet: "options.map((option)",
  },
  {
    label: "selected MCQ answer is highlighted",
    snippet: "aria-pressed={selected}",
  },
  {
    label: "MCQ branch uses option cards in answer panel",
    snippet: 'answerKind === "multiple_choice" ? (',
  },
  {
    label: "free-text keypad is hidden for MCQ",
    snippet: 'answerKind !== "multiple_choice" && (',
  },
  {
    label: "helper text is hidden for MCQ",
    snippet: 'answerKind !== "multiple_choice" && (',
  },
  {
    label: "MCQ submission sends uppercase option",
    snippet: "interpretedAnswer.normalizedAnswer.toUpperCase()",
  },
];

const failures = requiredSnippets.filter(({ snippet }) => !source.includes(snippet));

if (failures.length > 0) {
  console.error("Exam MCQ UI regression check failed:");
  for (const failure of failures) {
    console.error(`- ${failure.label}: missing ${JSON.stringify(failure.snippet)}`);
  }
  process.exit(1);
}

const answerPanelIndex = source.indexOf('<div className="space-y-3">');
const mcqBranchIndex = source.indexOf('answerKind === "multiple_choice" ? (', answerPanelIndex);
const textInputIndex = source.indexOf("<input", mcqBranchIndex);
const textAreaIndex = source.indexOf("<textarea", mcqBranchIndex);
const keypadGuardIndex = source.indexOf('answerKind !== "multiple_choice" && (', mcqBranchIndex);
const mcqComponentIndex = source.indexOf("function MultipleChoiceAnswerCards");
const structuredBuilderIndex = source.indexOf("type StructuredAnswerBuilderProps");
const mcqComponentSource = source.slice(mcqComponentIndex, structuredBuilderIndex);

if (mcqComponentIndex === -1 || structuredBuilderIndex === -1) {
  console.error("Exam MCQ UI regression check failed: MCQ component boundaries were not found.");
  process.exit(1);
}

if (/<input\b|<textarea\b/.test(mcqComponentSource)) {
  console.error("Exam MCQ UI regression check failed: MCQ component must render option buttons, not a text input.");
  process.exit(1);
}

if (mcqBranchIndex === -1 || textInputIndex === -1 || textAreaIndex === -1 || keypadGuardIndex === -1) {
  console.error("Exam MCQ UI regression check failed: answer input branch markers were not found.");
  process.exit(1);
}

if (!(mcqBranchIndex < textInputIndex && textInputIndex < textAreaIndex && textAreaIndex < keypadGuardIndex)) {
  console.error("Exam MCQ UI regression check failed: MCQ option branch no longer precedes text input/keypad branches.");
  process.exit(1);
}

console.log("Exam MCQ UI regression check passed.");
