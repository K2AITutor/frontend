// --- Public FAQ types ---
export interface PublicFAQCategory {
  id: string;
  label: string;
}

export interface PublicFAQ {
  category: string;
  question: string;
  answer: string;
}

// --- Admin FAQ types ---
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
