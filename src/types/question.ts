export type PracticeQuestion = {
    id: number | string;
    // Canonical keys (legacy prompt/answer/difficulty/subject removed from API responses)
    questionText: string;
    correctAnswer?: string | null;
    marks?: number;
    difficultyLevel?: string | null;
    topicCode?: string;
    subtopicCode?: string;
    skillCode?: string;
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
