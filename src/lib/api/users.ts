"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

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
}

export async function toggleUserActive(userId: string): Promise<{ id: number; isActive: boolean }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-active`, { method: 'PATCH' });
    if (!res.ok) throw new Error("Failed to toggle user active status");
    return res.json();
}

export async function resendVerification(userId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/resend-verification`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to resend verification email");
    return res.json();
}

export async function deleteUser(userId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
}

export function useToggleUserActive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleUserActive,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); },
    });
}

export function useResendVerification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: resendVerification,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); },
    });
}

export function useUsers({
    page,
    limit,
    search,
    verified,
    isActive,
    startDate,
    endDate
}: UseUsersParams) {
    return useQuery({
        queryKey: ["users", page, limit, search, verified, isActive, startDate, endDate],
        queryFn: async (): Promise<PaginatedUsers> => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (search) params.append('search', search);
            if (verified && verified !== 'all') params.append('verified', verified);
            if (isActive && isActive !== 'all') params.append('isActive', isActive);
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
