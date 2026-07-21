function envFlag(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (raw == null || raw.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

export const releaseFeatureFlags = {
  subjectMathMethodsEnabled: envFlag('NEXT_PUBLIC_SUBJECT_MATH_METHODS_ENABLED', true),
  mathMethodsTopicPracticeEnabled: envFlag('NEXT_PUBLIC_MATH_METHODS_TOPIC_PRACTICE_ENABLED', true),
  mathMethodsExam1Enabled: envFlag('NEXT_PUBLIC_MATH_METHODS_EXAM1_ENABLED', true),
  mathMethodsExam2Enabled: envFlag('NEXT_PUBLIC_MATH_METHODS_EXAM2_ENABLED', false),
  aiLearningSupportEnabled: envFlag('NEXT_PUBLIC_AI_LEARNING_SUPPORT_ENABLED', false),
  staticLearningSupportEnabled: envFlag('NEXT_PUBLIC_STATIC_LEARNING_SUPPORT_ENABLED', true),
  studentMarkingDiagnosticsEnabled: envFlag('NEXT_PUBLIC_STUDENT_MARKING_DIAGNOSTICS_ENABLED', false),
};

