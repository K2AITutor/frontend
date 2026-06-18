import { apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import type { AdminTopic } from "@/lib/api/admin-content";

export interface CreateTopicDto {
  subjectCode: string;
  topicCode: string;
  name: string;
  strandCode: string;
  strandName: string;
  description?: string;
  unitLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// topicCode is a unique key referenced by Question → the backend ignores it on update.
export type UpdateTopicDto = Partial<Omit<CreateTopicDto, "topicCode">>;

export async function createTopic(data: CreateTopicDto, token: string): Promise<AdminTopic> {
  return apiPost<AdminTopic>("/admin/topics", data, token);
}

export async function updateTopic(
  id: number,
  data: UpdateTopicDto,
  token: string
): Promise<AdminTopic> {
  return apiPut<AdminTopic>(`/admin/topics/${id}`, data, token);
}

export async function deleteTopic(id: number, token: string): Promise<void> {
  return apiDelete<void>(`/admin/topics/${id}`, token);
}
