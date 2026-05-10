import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

// Types
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  subject: string;
  image: string | null;
  quote: string;
  rating: number;
  atarImprovement: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialDto {
  name: string;
  role: string;
  subject: string;
  image?: string;
  quote: string;
  rating?: number;
  atarImprovement?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateTestimonialDto {
  name?: string;
  role?: string;
  subject?: string;
  image?: string;
  quote?: string;
  rating?: number;
  atarImprovement?: string;
  order?: number;
  isActive?: boolean;
}

// Testimonials
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
