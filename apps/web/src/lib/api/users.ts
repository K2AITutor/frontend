"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import type {
  User,
  UserStats,
  PaginatedUsers,
  UseUsersParams,
} from "@aitutor/shared";

export type { User, UserStats, PaginatedUsers, UseUsersParams };

export async function toggleUserActive(userId: string, token: string): Promise<{ id: number; isActive: boolean }> {
    const base = getApiBase();
    const res = await fetch(`${base}/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: buildAuthHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to toggle user active status");
    return res.json();
}

export async function resendVerification(userId: string, token: string): Promise<{ message: string }> {
    return apiPost<{ message: string }>(`/admin/users/${userId}/resend-verification`, {}, token);
}

export async function deleteUser(userId: string, token: string): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`/admin/users/${userId}`, token);
}

export function useToggleUserActive(token?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => toggleUserActive(userId, token || ""),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); },
    });
}

export function useResendVerification(token?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => resendVerification(userId, token || ""),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); },
    });
}

export function useDeleteUser(token?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId, token || ""),
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
    endDate,
    token,
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

            return apiGet<PaginatedUsers>(`/admin/users?${params.toString()}`, token);
        },
        enabled: !!token,
    });
}

function getApiBase() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const clean = String(raw).trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
}

function buildAuthHeaders(token: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}
