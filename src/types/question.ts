export interface PracticeQuestion {
    id: number;
    prompt: string;
    answer: string;
    difficulty?: string;
    skillCode: string;
    topicCode: string;
}
