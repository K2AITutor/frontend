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
export async function fetchAdminFaqCategories(token: string): Promise<FAQCategory[]> {
  return apiGet<FAQCategory[]>("/admin/faq-categories", token);
}

export async function createFaqCategory(data: CreateFaqCategoryDto, token: string): Promise<FAQCategory> {
  return apiPost<FAQCategory>("/admin/faq-categories", data, token);
}

export async function updateFaqCategory(id: string, data: UpdateFaqCategoryDto, token: string): Promise<FAQCategory> {
  return apiPut<FAQCategory>(`/admin/faq-categories/${id}`, data, token);
}

export async function deleteFaqCategory(id: string, token: string): Promise<void> {
  return apiDelete<void>(`/admin/faq-categories/${id}`, token);
}

// FAQs
export async function fetchAdminFaqs(token: string, categoryId?: string): Promise<FAQ[]> {
  const query = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
  return apiGet<FAQ[]>(`/admin/faqs${query}`, token);
}

export async function fetchAdminFaqById(id: number, token: string): Promise<FAQ> {
  return apiGet<FAQ>(`/admin/faqs/${id}`, token);
}

export async function createFaq(data: CreateFaqDto, token: string): Promise<FAQ> {
  return apiPost<FAQ>("/admin/faqs", data, token);
}

export async function updateFaq(id: number, data: UpdateFaqDto, token: string): Promise<FAQ> {
  return apiPut<FAQ>(`/admin/faqs/${id}`, data, token);
}

export async function deleteFaq(id: number, token: string): Promise<void> {
  return apiDelete<void>(`/admin/faqs/${id}`, token);
}
