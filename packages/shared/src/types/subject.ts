export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectDto {
  name: string;
  code?: string;
  description?: string;
  icon?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  icon?: string;
}
