// frontend/src/lib/subjects.ts
export const SUBJECT = {
    MATH_METHODS: 'MATH_METHODS',
    // later: SPECIALIST_MATH: 'SPECIALIST_MATH', etc.
} as const;

export type SubjectCode = (typeof SUBJECT)[keyof typeof SUBJECT];
