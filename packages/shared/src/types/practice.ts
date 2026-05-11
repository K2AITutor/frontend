export type TopicDTO = {
  id: number;
  name: string;
};

export type PracticeQuestionDTO = {
  id: number;
  topic: string;
  question: string;
  options: string[];
};

export type PracticeSubmitResponseDTO = {
  correct: boolean;
  explanation: string;
};

export type PracticeQuestion = {
  id: number | string;
  prompt: string;
  answer?: string;
  marks?: number;
  difficulty?: string;
  topicCode?: string;
  subtopicCode?: string;
  skillCode?: string;
  subject?: string;
  subjectCode?: string;
  questionSource?: string;
  contentOrigin?: string;
  countsTowardMastery?: boolean;
  masteryWeight?: number;

  sourceBook?: string | null;
  sourceChapter?: string | null;
  sourceSection?: string | null;
  sourceExercise?: string | null;
  sourceQuestionRef?: string | null;

  generatedFromQuestionId?: number | null;
};
