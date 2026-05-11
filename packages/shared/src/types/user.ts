export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  yearLevel: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  joinedDate: string;
  status: string;
  avatar: string | null;
  subscriptionStatus: string | null;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: UserStats;
}

export interface UseUsersParams {
  page: number;
  limit: number;
  search?: string;
  verified?: string;
  isActive?: string;
  startDate?: string;
  endDate?: string;
  token?: string;
}
