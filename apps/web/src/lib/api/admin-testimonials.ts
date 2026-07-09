import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import type {
  Testimonial,
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from "@aitutor/shared";

export type { Testimonial, CreateTestimonialDto, UpdateTestimonialDto };

export async function fetchAdminTestimonials(token: string, includeInactive?: boolean): Promise<Testimonial[]> {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiGet<Testimonial[]>(`/admin/testimonials${query}`, token);
}

export async function fetchAdminTestimonialById(id: number, token: string): Promise<Testimonial> {
  return apiGet<Testimonial>(`/admin/testimonials/${id}`, token);
}

export async function createTestimonial(data: CreateTestimonialDto, token: string): Promise<Testimonial> {
  return apiPost<Testimonial>("/admin/testimonials", data, token);
}

export async function updateTestimonial(id: number, data: UpdateTestimonialDto, token: string): Promise<Testimonial> {
  return apiPut<Testimonial>(`/admin/testimonials/${id}`, data, token);
}

export async function deleteTestimonial(id: number, token: string): Promise<void> {
  return apiDelete<void>(`/admin/testimonials/${id}`, token);
}
