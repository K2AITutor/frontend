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
