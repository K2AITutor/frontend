"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

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

export type AdminUserRole = "student" | "teacher" | "admin";
export type AdminUserStatus = "active" | "pending" | "suspended";

export interface CreateAdminUserPayload {
    name: string;
    email: string;
    password: string;
    role: AdminUserRole;
    status: AdminUserStatus;
    avatar?: string;
}

export interface UpdateAdminUserPayload {
    name?: string;
    email?: string;
    role?: AdminUserRole;
    status?: AdminUserStatus;
    avatar?: string;
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

export async function getUser(userId: string, token: string): Promise<User> {
    return apiGet<User>(`/admin/users/${userId}`, token);
}

export async function createUser(payload: CreateAdminUserPayload, token: string): Promise<User> {
    return apiPost<User>("/admin/users", payload, token);
}

export async function updateUser(userId: string, payload: UpdateAdminUserPayload, token: string): Promise<User> {
    return apiPut<User>(`/admin/users/${userId}`, payload, token);
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

// Internal helpers
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
