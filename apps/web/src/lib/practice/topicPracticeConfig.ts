/*Purpose/content: keep only the page shell metadata in config; topic groups will now come from backend.*/
export type TopicChipDTO = {
    code: string;
    name: string;
    questionCount?: number;
};

export type TopicGroupDTO = {
    strandCode: string;
    strandName: string;
    topics: TopicChipDTO[];
};

export type TopicPracticeStartDTO = {
    subjectCode: string;
    subjectSlug: string;
    subjectName: string;
    intro: string;
    startTitle: string;
    startDescription: string;
    startHref: string;
    groups: TopicGroupDTO[];
};

export const emptyMathMethodsTopicPracticeConfig: TopicPracticeStartDTO = {
    subjectCode: 'MATH_METHODS',
    subjectSlug: 'math-methods',
    subjectName: 'VCE Mathematical Methods',
    intro:
        'Build confidence topic by topic with guided hints, explanations, and targeted follow-up practice.',
    startTitle: 'Start Topic Practice',
    startDescription:
        'Master Mathematical Methods through curriculum-aligned topic practice before moving into Exam 1 and Exam 2 style revision.',
    startHref: '/student/practice/math-methods/topic',
    groups: [],
};