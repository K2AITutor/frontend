export type DatasetStatus = 'building' | 'ready' | 'archived';

export type SplitTag = 'train' | 'val' | 'test';

export interface DatasetVersion {
  id: string;
  name: string;
  version: string;
  rowCount: number;
  createdAt: string;
  builtBy: string;
  sourceLabels: string[];
  status: DatasetStatus;
}

export interface DatasetRow {
  id: string;
  questionId: string;
  studentAnswerHash: string;
  criteriaScores: Record<string, number>;
  errorTags: string[];
  teacherNote: string | null;
  splitTag: SplitTag;
}
