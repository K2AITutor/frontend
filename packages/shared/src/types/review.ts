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
