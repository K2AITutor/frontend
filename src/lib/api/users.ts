"use client";

import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    joinedDate: string;
    status: string;
    avatar: string | null;
    subscriptionStatus: string | null;
}

export interface UserStats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
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
    role?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export function useUsers({
    page,
    limit,
    role,
    status,
    search,
    startDate,
    endDate
}: UseUsersParams) {
    return useQuery({
        queryKey: ["users", page, limit, role, status, search, startDate, endDate],
        queryFn: async (): Promise<PaginatedUsers> => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (role && role !== 'all') params.append('role', role);
            if (status && status !== 'all') params.append('status', status);
            if (search) params.append('search', search);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`);
            if (!res.ok) {
                throw new Error("Failed to fetch users");
            }
            return res.json();
        },
    });
}
