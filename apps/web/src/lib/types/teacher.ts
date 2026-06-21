import type { ReviewQueueItem } from "@aitutor/shared";

export interface TeacherStats {
  queueDepth: number;
  reviewedToday: number;
  escalationRatePct: number;
  avgResolutionMinutes: number;
  agreementRatePct: number;
  agreementRatePct30d?: number;
}

export interface TeacherHistoryItem {
  id: string;
  submittedAt: string;
  decision: "approve" | "override" | "escalate";
  originalScore: number;
  correctedScore: number;
  agreementWithAi: boolean;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  pageSize: number;
}

// Decision string normalized for the frontend (ACCEPT->approve, OVERRIDE->override, ESCALATE->escalate)
export type TeacherDecision = "approve" | "override" | "escalate";

export interface TeacherHistoryDetail {
  submission: {
    id: string; // String(attempt.id)
    submittedAt: string; // ISO — attempt.createdAt
    reviewedAt: string | null; // ISO — teacherCorrection.createdAt; null if there is no correction
  };

  // Group 4 — Student & context
  student: {
    id: string; // String(attempt.userId ?? "")
    name: string; // firstName+lastName || email || "Unknown student"
  };
  context: {
    subject: string; // question.subjectCode (e.g. "MATH_METHODS"); "Unknown" if null
    questionType: string; // question.questionType ?? answerType ?? "Unknown"
    maxScore: number; // attempt.maxScore ?? question.marks ?? 1
    decision: TeacherDecision | null; // teacherCorrection.decision mapped; null if not reviewed yet
  };

  // Group 1 — Question + answers
  question: {
    id: string; // String(question.id)
    questionText: string; // question.questionText
    studentAnswer: string; // attempt.answer
    correctAnswer: string | null; // question.correctAnswer (nullable — a draft may not have one yet)
  };

  // Group 3 — AI marking
  aiMarking: {
    aiScore: number; // ORIGINAL AI score (originalScore if there is a correction, else attempt.score ?? 0)
    confidence: number; // 0..1, clamped; taken like getConfidence()
    confidenceLevel: "high" | "medium" | "low"; // >=0.8 high, >=0.6 medium, else low
    routingReason: string; // confidence < 0.75 ? "low_confidence" : "auto_marked"
    aiErrorTags: string[]; // attempt.errorTags (array of AI-suggested tags); [] if empty
    aiExplanation: string | null; // attempt.aiExplanation; null if absent
  };

  // Group 2 — Teacher comments & corrections. null if the submission does NOT have a teacherCorrection yet.
  correction: {
    correctedScore: number; // teacherCorrection.correctedScore
    originalScore: number; // teacherCorrection.originalScore (= AI score at review time)
    comment: string | null; // teacherCorrection.comment
    teacherErrorTags: string[]; // teacherCorrection.errorTags; [] if empty
    criterionOverrides: CriterionOverride[]; // joined with rubric criteria; [] if empty/rubric null
  } | null;

  // Rubric criteria (to display labels for criterionOverrides). [] if rubric is null.
  rubric: {
    criteria: RubricCriterionLite[];
  };
}

export interface RubricCriterionLite {
  id: string; // String(criterion.id)
  code: string; // criterion.criterionCode
  description: string; // criterion.description
  maxMarks: number; // criterion.marks
}

// criterionOverrides in the DB is Json of shape Record<criterionKey, number>.
// The backend JOINs the key with rubric criteria to return a labeled array; a key that
// matches no criterion is still returned with label = the key itself (don't drop teacher-entered data).
export interface CriterionOverride {
  criterionId: string; // key in criterionOverrides (String). If it matches criterion.id, it is that id.
  label: string; // criterion.criterionCode if it matches; else = criterionId
  overrideScore: number; // the teacher's override score value (Number)
  maxMarks: number | null; // criterion.marks if it matches; null if the key matches no criterion
}
