export const SUBJECT = {
  MATH_METHODS: "MATH_METHODS",
} as const;

export type SubjectCode = (typeof SUBJECT)[keyof typeof SUBJECT];
