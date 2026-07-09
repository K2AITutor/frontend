export type AiExplainResponse = {
  stepByStep?: string[];
  finalAdvice?: string;
};

export type AiHintResponse = {
  hint: string;
};

export type AiSimilarQuestionResponse = {
  question: string;
};
