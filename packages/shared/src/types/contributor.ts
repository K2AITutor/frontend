export type ContributorTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "BLOCKED";

export type ContributorTaskType =
  | "QUESTION_ENTRY"
  | "RUBRIC_BUILD"
  | "ANNOTATION"
  | "AI_QA"
  | "DATASET_CHECK";

export interface ContributorTask {
  id: number;
  type: ContributorTaskType;
  status: ContributorTaskStatus;
  priority: number;
  title: string;
  description?: string;
  dueAt?: string | null;
  questionId?: number | null;
}

export interface ContributorDashboardData {
  summary: {
    assignedTasks: number;
    todoTasks: number;
    inReviewTasks: number;
    draftQuestions: number;
    draftRubrics: number;
  };
  recentTasks: ContributorTask[];
}

export interface ContributorRubricDraft {
  id: number;
  questionId: number;
  rubricKey?: string | null;
  maxMarks: number;
  status: "DRAFT" | "REVIEW" | "ACTIVE" | "ARCHIVED";
  updatedAt?: string;
}

export interface RubricCriterionInput {
  criterionCode: string;
  description: string;
  marks: number;
  sortOrder: number;
}

export interface CreateRubricDraftPayload {
  questionId: number;
  rubricKey?: string;
  maxMarks: number;
  modelAnswer?: string;
  markingNotes?: string;
  commonErrors?: string[];
  criteria: RubricCriterionInput[];
}

export type DatasetQaStatus =
  | "READY_FOR_QA"
  | "APPROVED"
  | "NEEDS_FIX"
  | "REJECTED"
  | "MANUAL_REVIEW";

export type DatasetTrainingReadiness =
  | "PRACTICE_ONLY"
  | "TRAINING_READY"
  | "EXPERT_REVIEW";

export interface DatasetQaChecklist {
  sourceMatched: boolean;
  topicChecked: boolean;
  answerChecked: boolean;
  acceptedAnswersChecked: boolean;
  markerTestPassed: boolean;
  rubricChecked: boolean;
  solutionChecked: boolean;
}

export interface DatasetQaDataMapping {
  section: "A" | "B" | "unknown";
  profile: "multiple_choice" | "extended_response" | "unknown";
  status: "ready" | "needs_attention";
  summary: string;
  optionKeys?: string[];
  hasMultipleChoiceOptions?: boolean;
  hasCorrectAnswer?: boolean;
  hasMultipleChoiceMetadata?: boolean;
  hasLongAnswerFields?: boolean;
  missing?: string[];
}
export interface DatasetQaQuestion {
  id: number;
  examKey: string;
  questionNumber: string;
  questionText: string;
  topicCode?: string | null;
  subtopicCode?: string | null;
  skillCode?: string | null;
  marks: number;
  answerType: string;
  isMarkable: boolean;
  machineEngine?: string | null;
  correctAnswer: string;
  acceptedAnswers: string[];
  workedSolution: string;
  markingRubric: Array<{ marks?: number; criterion?: string }>;
  reviewStatus: DatasetQaStatus;
  reviewerName?: string;
  reviewerUserId?: number | string;
  reviewNotes?: string;
  reviewedAt?: string | null;
  pdfPage?: number | null;
  contentStatus?: string;
  trainingReadiness: DatasetTrainingReadiness;
  commonMistakes: string[];
  qaChecklist: DatasetQaChecklist;
  lastMarkerTest?: DatasetQaMarkingResult | null;
  dataMapping?: DatasetQaDataMapping | null;
}

export interface UpdateDatasetQaPayload {
  reviewerName: string;
  reviewStatus: DatasetQaStatus;
  reviewNotes?: string;
  questionText?: string;
  correctAnswer?: string;
  acceptedAnswers?: string[];
  workedSolution?: string;
  markingRubric?: Array<{ marks?: number; criterion?: string }>;
  commonMistakes?: string[];
  trainingReadiness?: DatasetTrainingReadiness;
  qaChecklist?: DatasetQaChecklist;
  lastMarkerTest?: DatasetQaMarkingResult | null;
  topicCode?: string;
  subtopicCode?: string;
}

export interface DatasetQaMarkingResult {
  isCorrect: boolean | null;
  score: number | null;
  maxScore: number;
  errorTags: string[];
  diagnostics?: Record<string, unknown>;
}
