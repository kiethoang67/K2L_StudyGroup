import apiClient from './client';
import type { ApiResponse } from '../types/auth.types';

export interface CreateGroupRequest {
    name: string;
    description: string;
    isPublic: boolean;
    tags: string[];
}

export interface CreateGroupResponse {
    id: string;
    name: string;
}

export interface GroupListResponse {
    groupId: string;
    groupName: string;
    groupRole: string;
    tags: string[];
    description: string;
}

export interface GroupDetailResponse {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    bannerUrl?: string;
    createdByUser: string;
    updatedAt?: string;
}

export interface GroupMemberResponse {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    groupRole: 'ADMIN' | 'MEMBER';
    avatarUrl?: string;
}

export interface GetListMemberWithTotalResponse {
    members: GroupMemberResponse[];
    total: number;
}

export interface GetListGroupWithTotalResponse {
    groups: GroupListResponse[];
    totalGroups: number;
}

export interface InvitationResponse {
    groupId: string;
    groupName: string;
}

export interface ListInvitationResponse {
    invitations: InvitationResponse[];
    total: number;
}

export const groupsAPI = {
    createGroup: (data: CreateGroupRequest): Promise<ApiResponse<CreateGroupResponse>> =>
        apiClient.post('/groups/create', data),

    getMyGroups: (params: { pageNumber?: number, pageSize?: number, keyword?: string } = {}): Promise<ApiResponse<GetListGroupWithTotalResponse>> =>
        apiClient.get('/groups/listgroup', { params }),

    getGroupDetails: (id: string): Promise<ApiResponse<GroupDetailResponse>> =>
        apiClient.get(`/groups/${id}`),

    getGroupMembers: (id: string, params: { pageNumber?: number, pageSize?: number, keyword?: string } = {}): Promise<ApiResponse<GetListMemberWithTotalResponse>> =>
        apiClient.get(`/groups/${id}/listmember`, { params }),

    addMember: (groupId: string, email: string): Promise<ApiResponse<void>> =>
        apiClient.post(`/groups/${groupId}/addmember`, { email }),

    joinGroup: (id: string): Promise<ApiResponse<void>> =>
        apiClient.post(`/groups/${id}/join`),


    leaveGroup: (id: string): Promise<ApiResponse<void>> =>
        apiClient.post(`/groups/${id}/leave`),

    removeMember: (groupId: string, memberId: string): Promise<ApiResponse<void>> =>
        apiClient.delete(`/groups/${groupId}/members/${memberId}`),

    getPublicGroups: (params: { pageNumber?: number, pageSize?: number } = {}): Promise<ApiResponse<GetListGroupWithTotalResponse>> =>
        apiClient.get('/groups/public', { params }),

    generatePresignUrlGroupBanner: (groupId: string, params: { fileName: string; contentType: string }): Promise<ApiResponse<{ urlUpload: string; publicUrl: string }>> =>
        apiClient.post(`/groups/${groupId}/generate-presign-url-group-banner`, params),

    updateGroupBanner: (groupId: string, bannerUrl: string): Promise<ApiResponse<void>> =>
        apiClient.patch(`/groups/${groupId}/update`, { bannerUrl }),

    inviteUser: (groupId: string, email: string): Promise<ApiResponse<void>> =>
        apiClient.post(`/groups/${groupId}/inviteUser`, { email }),

    responseInvite: (groupId: string, decision: boolean): Promise<ApiResponse<void>> =>
        apiClient.post(`/groups/${groupId}/responseInvite`, { decision }),

    deleteGroup: (id: string): Promise<ApiResponse<void>> =>
        apiClient.delete(`/groups/${id}`),

    assignAdmin: (groupId: string, userId: string): Promise<ApiResponse<void>> =>
        apiClient.post(`/groups/${groupId}/assignAdmin`, { userId }),
};
