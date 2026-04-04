import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

// Types
export interface FAQCategory {
  id: string;
  label: string;
  order: number;
}

export interface FAQ {
  id: number;
  categoryId: string;
  category: FAQCategory;
  question: string;
  answer: string;
  order: number;
}

export interface CreateFaqCategoryDto {
  id: string;
  label: string;
  order?: number;
}

export interface UpdateFaqCategoryDto {
  label?: string;
  order?: number;
}

export interface CreateFaqDto {
  categoryId: string;
  question: string;
  answer: string;
  order?: number;
}

export interface UpdateFaqDto {
  categoryId?: string;
  question?: string;
  answer?: string;
  order?: number;
}

// FAQ Categories
export async function fetchAdminFaqCategories(): Promise<FAQCategory[]> {
  return apiGet<FAQCategory[]>("/admin/faq-categories");
}

export async function createFaqCategory(data: CreateFaqCategoryDto): Promise<FAQCategory> {
  return apiPost<FAQCategory>("/admin/faq-categories", data);
}

export async function updateFaqCategory(id: string, data: UpdateFaqCategoryDto): Promise<FAQCategory> {
  return apiPut<FAQCategory>(`/admin/faq-categories/${id}`, data);
}

export async function deleteFaqCategory(id: string): Promise<void> {
  return apiDelete<void>(`/admin/faq-categories/${id}`);
}

// FAQs
export async function fetchAdminFaqs(categoryId?: string): Promise<FAQ[]> {
  const query = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
  return apiGet<FAQ[]>(`/admin/faqs${query}`);
}

export async function fetchAdminFaqById(id: number): Promise<FAQ> {
  return apiGet<FAQ>(`/admin/faqs/${id}`);
}

export async function createFaq(data: CreateFaqDto): Promise<FAQ> {
  return apiPost<FAQ>("/admin/faqs", data);
}

export async function updateFaq(id: number, data: UpdateFaqDto): Promise<FAQ> {
  return apiPut<FAQ>(`/admin/faqs/${id}`, data);
}

export async function deleteFaq(id: number): Promise<void> {
  return apiDelete<void>(`/admin/faqs/${id}`);
}
