/*Purpose/content: define the frontend type system for the dynamic topic catalogue returned by backend.*/
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