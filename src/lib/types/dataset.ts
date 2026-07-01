export type DatasetStatus = 'building' | 'ready' | 'archived';

export type SplitTag = 'train' | 'val' | 'test';

export interface DatasetVersion {
  id: string;
  name: string;
  version: string;
  rowCount: number;
  createdAt: string;
  builtBy: string;
  sourceLabels: string[];
  status: DatasetStatus;
}

export interface DatasetRow {
  id: string;
  questionId: string;
  studentAnswerHash: string;
  criteriaScores: Record<string, number>;
  errorTags: string[];
  teacherNote: string | null;
  splitTag: SplitTag;
}

export type DatasetCandidateStatus =
  | 'CANDIDATE'
  | 'VALIDATED'
  | 'REJECTED'
  | 'PROMOTED';

export type DatasetCandidateSource =
  | 'STUDENT_PRACTICE'
  | 'TEACHER_REVIEW'
  | 'OWNER_REVIEW'
  | 'EXPERT_REVIEW';

export interface DatasetCandidateQuestionRef {
  id: number;
  subjectCode: string | null;
  topicCode: string | null;
  subtopicCode: string | null;
  skillCode: string | null;
  sourceQuestionRef: string | null;
  rubricKey: string | null;
  marks: number | null;
}

export interface DatasetCandidate {
  id: string;
  questionId: number;
  attemptId: number | null;
  userId: number | null;
  source: DatasetCandidateSource;
  status: DatasetCandidateStatus;
  studentAnswerHash: string;
  normalizedAnswer: string | null;
  expectedAnswer: string | null;
  criteriaScores: Record<string, unknown> | null;
  errorTags: string[];
  score: number | null;
  maxScore: number | null;
  confidence: number | null;
  trainingReadiness: string | null;
  reviewerName: string | null;
  validatedAt: string | null;
  ownerApprovedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  question?: DatasetCandidateQuestionRef | null;
}

export interface DatasetCandidatesResponse {
  rows: DatasetCandidate[];
  total: number;
  page: number;
  pageSize: number;
}
