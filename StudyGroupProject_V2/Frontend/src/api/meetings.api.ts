import apiClient from './client';
import type { ApiResponse } from '../types/auth.types';

export interface CreateMeetingRequest {
    title: string;
    description: string;
    startedAt: string; // ISO string
    endedAt: string;   // ISO string
}

export interface CreatorInfo {
    userId: string;
    email: string;
    avatarUrl?: string;
    lastName: string;
    firstName: string;
}

export interface MeetingResponse {
    meetingId: string;
    groupId: string;
    meetingRoomId: string;
    title: string;
    description: string;
    meetingStatus: 'SCHEDULED' | 'LIVE' | 'ENDED';
    startedAt: string;
    endedAt: string;
    creatorInfo: CreatorInfo;
    groupName: string;
}

export interface ListMeetingWithTotalResponse {
    meetings: MeetingResponse[];
    total: number;
}

export const meetingsAPI = {
    createMeeting: (groupId: string, data: CreateMeetingRequest): Promise<ApiResponse<MeetingResponse>> =>
        apiClient.post(`/meetings/${groupId}/create-meeting`, data),

    getGroupMeetings: (
        groupId: string,
        params?: { pageNumber?: number; pageSize?: number; sortBy?: string; sortOrder?: string }
    ): Promise<ApiResponse<ListMeetingWithTotalResponse>> =>
        apiClient.get(`/meetings/${groupId}/meetings`, { params }),

    getMyMeetings: (
        params?: { pageNumber?: number; pageSize?: number; sortBy?: string; sortOrder?: string }
    ): Promise<ApiResponse<ListMeetingWithTotalResponse>> =>
        apiClient.get('/meetings', { params }),
};
