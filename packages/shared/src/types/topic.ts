export type TopicCountsDTO = {
  subject: string;
  counts: Record<string, number>;
};

export type TopicProgressRow = {
  topicCode: string;
  topicName?: string | null;
  strandCode?: string | null;
  strandName?: string | null;
  attempts: number;
  correct: number;
  mastery: number;
  status: "Not started" | "Weak" | "Medium" | "Strong";
};

export type TopicListItem = {
  id: number;
  subjectCode: string;
  topicCode: string;
  name: string;
  strandCode: string;
  strandName: string;
  description?: string | null;
  unitLabel?: string | null;
  sortOrder: number;
  isActive: boolean;
  questionCount: number;
};

export type TopicGroup = {
  strandCode: string;
  strandName: string;
  topics: TopicListItem[];
};

export type TopicCatalogueResponse = {
  subjectCode: string;
  groups: TopicGroup[];
};

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

export type MathMethodsTopic = {
  code: string;
  name: string;
};
