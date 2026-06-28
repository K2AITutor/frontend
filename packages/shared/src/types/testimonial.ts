export interface Testimonial {
  id: number;
  name: string;
  role: string;
  subject: string;
  image?: string | null;
  quote: string;
  rating: number;
  atarImprovement?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTestimonial {
  id: number;
  name: string;
  role: string;
  subject: string;
  quote: string;
  rating: number;
  atarImprovement: string | null;
  order: number;
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
