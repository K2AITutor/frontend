export type CropBoxRel = [number, number, number, number];

export type ExamQuestionAsset = {
  page: number;
  crop?: CropBoxRel;
};

export type ExamMeta = {
  examKey: string;
  title?: string;
  pdfUrl: string;
  defaultPage?: number;
  questions?: Record<string, ExamQuestionAsset>;
};

export type ExamDTO = {
  examKey: string;
  title: string;
  readingMins?: number | null;
  writingMins?: number | null;
  allowCAS?: boolean | null;
  showHints?: boolean | null;
  exactRequired?: boolean | null;
  workingRequired?: boolean | null;
  instructions?: string | null;
  pdf?: {
    url?: string | null;
    filePath?: string | null;
  } | null;
};

export type ExamQuestionDTO = {
  id: number;
  examKey: string;
  questionNumber: string;
  marks: number;
  answerType: string;
  prompt: string;
  questionText?: string | null;
  skillCode?: string | null;
  topicCode?: string | null;
  subtopicCode?: string | null;
  difficulty?: string | null;
  isMarkable?: boolean | null;
  rubricKey?: string | null;
  markingMeta?: any;
  pdfPage?: number | null;
  groupId?: number | null;
  partLabel?: string | null;
};

export type SubmitAnswerResponse = {
  correct: boolean | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  workedSolution?: string | null;
  score?: number | null;
  maxScore?: number | null;
  errorTags?: string[];
  skillGaps?: string[];
  diagnostics?: Record<string, unknown>;
};

export type AttemptRecord = {
  examKey: string;
  questionId: number | string;
  questionNumber?: string | null;
  marks?: number | null;
  correct: boolean;
  score?: number | null;
  maxScore?: number | null;
  errorTags?: string[];
  skillGaps?: string[];
  submittedAt: string;
};
