import apiClient from './client';
import type { LoginRequest, RegisterRequest, ApiResponse, LoginResponse, User } from '../types/auth.types';
import type { ListInvitationResponse } from './groups.api';

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface ForgotPasswordChangeRequest {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
}

export type { LoginRequest, RegisterRequest, ApiResponse, LoginResponse, User };

export const authAPI = {
    login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
        apiClient.post('/auth/login', data),

    register: (data: RegisterRequest): Promise<ApiResponse<void>> =>
        apiClient.post('/auth/register', data),

    logout: (): Promise<ApiResponse<void>> =>
        apiClient.post('/auth/logout'),

    getProfile: (): Promise<ApiResponse<{ user: User }>> =>
        apiClient.get('/users/profile'),

    updateProfile: (data: Partial<RegisterRequest>): Promise<ApiResponse<User>> =>
        apiClient.patch('/users/me', data),

    deactivateAccount: (): Promise<ApiResponse<void>> =>
        apiClient.post('/users/deactivateAccount'),

    changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<void>> =>
        apiClient.post('/users/changePass', data),

    generatePresignUrlAvatar: (params: { fileName: string; contentType: string }): Promise<ApiResponse<{ urlUpload: string; publicUrl: string }>> =>
        apiClient.post('/users/generate-presign-url-avatar', params),

    forgotPassword: (data: { email: string }): Promise<ApiResponse<string>> =>
        apiClient.post('/users/forgot-password', data),

    forgotPasswordChange: (data: ForgotPasswordChangeRequest): Promise<ApiResponse<void>> =>
        apiClient.post('/users/forgot-password-change', data),

    deleteAccount: (data: { confirmDelete: string }): Promise<ApiResponse<void>> =>
        apiClient.delete('/users/deleteAccount', { data }),

    getInvitations: (params?: { keyword?: string; pageNumber?: number; pageSize?: number }): Promise<ApiResponse<ListInvitationResponse>> =>
        apiClient.get('/users/invitations', { params }),

    adminGetAllUsers: (keyword?: string, pageNumber?: number, pageSize?: number): Promise<ApiResponse<{ users: User[], totalUsers: number }>> =>
        apiClient.get('/admin/users', { params: { keyword, pageNumber, pageSize } }),

    adminBanUser: (userId: string): Promise<ApiResponse<void>> =>
        apiClient.post(`/admin/users/${userId}/ban`),

    adminDeleteUser: (userId: string): Promise<ApiResponse<void>> =>
        apiClient.delete(`/admin/users/${userId}`),

    adminGetStats: (): Promise<ApiResponse<AdminStats>> =>
        apiClient.get('/admin/stats'),

    adminGetAllGroups: (params: { keyword?: string, pageNumber?: number, pageSize?: number, sortBy?: string, sortOrder?: string }): Promise<ApiResponse<{ groups: any[], totalGroups: number }>> =>
        apiClient.get('/admin/groups', { params }),

    adminUpdateUserStatus: (userId: string, status: string): Promise<ApiResponse<void>> =>
        apiClient.patch(`/admin/users/${userId}/status`, null, { params: { status } }),

    adminDeleteGroup: (groupId: string): Promise<ApiResponse<void>> =>
        apiClient.delete(`/admin/groups/${groupId}`),
};



export interface AdminStats {
    totalUsers: number;
    totalGroups: number;
    totalResources: number;
    totalMeetings: number;
}

