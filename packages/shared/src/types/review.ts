export type ReviewSummaryQuestion = {
  questionId: string;
  index: number;
  isSubmitted: boolean;
  isFlagged: boolean;
};

export type ReviewSummary = {
  attemptId: string;
  examId: string;
  status: "IN_PROGRESS" | "REVIEW" | "SUBMITTED";
  timeRemainingSec?: number;
  questions: ReviewSummaryQuestion[];
};

// Teacher review queue types

export type ReviewDecisionType = "approve" | "override" | "escalate";

export interface ReviewQueueItem {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  subject: string;
  questionType: string;
  aiScore: number;
  maxScore: number;
  aiConfidence: number;
  confidenceLevel: "high" | "medium" | "low";
  reason: string;
  status: string;
}

export interface ReviewDecision {
  correctedScore: number;
  criterionOverrides: Record<string, number>;
  errorTags: string[];
  comment: string;
  decision: ReviewDecisionType;
}
