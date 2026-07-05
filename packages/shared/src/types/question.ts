export type QuestionDraftDTO = {
  id: number;
  subjectCode?: string | null;
  topicCode?: string | null;
  skillCode?: string | null;
  prompt: string;
  questionText?: string | null;
  answerType?: string | null;
  marks?: number | null;
  status: "DRAFT" | "REVIEW" | "ACTIVE" | "ARCHIVED";
  sourceBook?: string | null;
  sourceChapter?: string | null;
  sourceQuestionRef?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuestionDraftPayload = {
  subject?: string;
  subjectCode?: string;
  topicCode: string;
  skillCode: string;
  subtopicCode?: string;
  prompt: string;
  questionText?: string;
  answerType?: string;
  marks?: number;
  correctAnswer?: string;
  solutionSteps?: string;
  misconceptions?: string;
  sourceBook?: string;
  sourceChapter?: string;
  sourceSection?: string;
  sourceExercise?: string;
  sourceQuestionRef?: string;
  questionType?: string;
  difficultyLevel?: string;
  examStyleType?: string;
  tags?: string[];
};

export type UpdateQuestionDraftPayload = Partial<CreateQuestionDraftPayload>;
