// Shared enum option lists for admin content filters + forms.
// Values mirror the Prisma enums in backend/prisma/schema.prisma.

export type EnumOption = { label: string; value: string };

export const QUESTION_TYPE_OPTIONS: EnumOption[] = [
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
  { label: "Short Answer", value: "SHORT_ANSWER" },
  { label: "Extended Response", value: "EXTENDED_RESPONSE" },
  { label: "True / False", value: "TRUE_FALSE" },
  { label: "Fill in the Blank", value: "FILL_IN_THE_BLANK" },
];

export const DIFFICULTY_OPTIONS: EnumOption[] = [
  { label: "Easy", value: "EASY" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Hard", value: "HARD" },
  { label: "Exam", value: "EXAM" },
];

// ExamStyleType enum chỉ có TOPIC/EXAM1/EXAM2/MOCK — không còn "MIXED".
export const EXAM_STYLE_OPTIONS: EnumOption[] = [
  { label: "Topic", value: "TOPIC" },
  { label: "Exam 1", value: "EXAM1" },
  { label: "Exam 2", value: "EXAM2" },
  { label: "Mock", value: "MOCK" },
];

// AnswerType enum: 4 giá trị hợp lệ (NUMERIC/EXPRESSION/INTERVAL/EXPLANATION).
export const ANSWER_TYPE_OPTIONS: EnumOption[] = [
  { label: "Numeric", value: "NUMERIC" },
  { label: "Expression", value: "EXPRESSION" },
  { label: "Interval", value: "INTERVAL" },
  { label: "Explanation", value: "EXPLANATION" },
];

export const CONTENT_STATUS_OPTIONS: EnumOption[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Review", value: "REVIEW" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];
