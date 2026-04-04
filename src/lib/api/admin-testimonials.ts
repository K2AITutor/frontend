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
export async function fetchAdminTestimonials(includeInactive?: boolean): Promise<Testimonial[]> {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiGet<Testimonial[]>(`/admin/testimonials${query}`);
}

export async function fetchAdminTestimonialById(id: number): Promise<Testimonial> {
  return apiGet<Testimonial>(`/admin/testimonials/${id}`);
}

export async function createTestimonial(data: CreateTestimonialDto): Promise<Testimonial> {
  return apiPost<Testimonial>("/admin/testimonials", data);
}

export async function updateTestimonial(id: number, data: UpdateTestimonialDto): Promise<Testimonial> {
  return apiPut<Testimonial>(`/admin/testimonials/${id}`, data);
}

export async function deleteTestimonial(id: number): Promise<void> {
  return apiDelete<void>(`/admin/testimonials/${id}`);
}
