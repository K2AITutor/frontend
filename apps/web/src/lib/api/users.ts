"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import type {
  User,
  UserStats,
  PaginatedUsers,
  UseUsersParams,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  AdminUserRole,
  AdminUserStatus,
  AdminUserRoleScope,
} from "@aitutor/shared";

export type { User, UserStats, PaginatedUsers, UseUsersParams, CreateAdminUserPayload, UpdateAdminUserPayload, AdminUserRole, AdminUserStatus, AdminUserRoleScope };

export async function toggleUserActive(userId: string, token: string): Promise<{ id: number; isActive: boolean }> {
    return apiPost<{ id: number; isActive: boolean }>(`/admin/users/${userId}/toggle-active`, {}, token);
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
    roleScope = "students",
    role,
    token,
}: UseUsersParams) {
    return useQuery({
        queryKey: ["users", roleScope, role, page, limit, search, verified, isActive, startDate, endDate],
        queryFn: async (): Promise<PaginatedUsers> => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                roleScope: roleScope || "students",
            });

            if (role && role !== "all") params.append('role', role);
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
