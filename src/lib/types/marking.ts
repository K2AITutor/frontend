export type MarkingSource = 'rule' | 'llm' | 'ml' | 'human';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface MarkingSourceResult {
  source: MarkingSource;
  score: number;
  confidence: number;
  latencyMs: number;
  modelVersion?: string;
  ruleId?: string;
  evidence: string;
}

export interface RoutingDecision {
  chosenSource: MarkingSource;
  threshold: number;
  reason: string;
}

export interface ErrorTag {
  tagCode: string;
  label: string;
  confidence: number;
}

export interface RubricDescriptor {
  level: number;
  text: string;
}

export interface RubricCriterion {
  id: string;
  label: string;
  weight: number;
  descriptors: RubricDescriptor[];
}

export interface Rubric {
  id: string;
  criteria: RubricCriterion[];
}

export interface CriterionScore {
  criterionId: string;
  score: number;
  level: number;
  justification: string;
}

export interface RubricEvidence {
  criterionId: string;
  similarity: number;
  rubricSnippetId: string;
}

export interface HybridMarkingResult {
  finalScore: number;
  finalConfidence: number;
  perCriterion: CriterionScore[];
  sources: MarkingSourceResult[];
  routingDecision: RoutingDecision;
  errorTags: ErrorTag[];
  rubricEvidence: RubricEvidence[];
}

export interface SubmissionFlag {
  type: string;
  message: string;
  raisedAt: string;
}

export interface WorkingStep {
  step: number;
  latex: string;
}

export interface StudentAnswer {
  text?: string;
  rawAnswer?: string | null;
  normalizedAnswer?: string | null;
  interpretedAnswer?: string | null;
  displayAnswer?: string | null;
  imageUrl?: string;
  ocrText?: string;
  working?: WorkingStep[];
}

export interface QuestionSummary {
  id: string;
  title?: string | null;
  questionText: string;
  type: string;
  subjectCode?: string | null;
  subjectName?: string | null;
  maxScore: number;
  expectedAnswer?: string;
}

export interface SubmissionSummary {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: string;
}

export interface SubmissionFull {
  submission: SubmissionSummary;
  question: QuestionSummary;
  studentAnswer: StudentAnswer;
  rubric: Rubric;
  aiMarking: HybridMarkingResult;
  markingArtifact?: Record<string, any> | null;
  markingMeta?: Record<string, any> | null;
  rawAnswer?: string | null;
  normalizedAnswer?: string | null;
  interpretedAnswer?: string | null;
  expectedAnswer?: string | null;
  expectedSolution?: string | null;
  workedSolution?: string | null;
  flags: SubmissionFlag[];
}
