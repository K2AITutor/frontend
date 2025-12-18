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
