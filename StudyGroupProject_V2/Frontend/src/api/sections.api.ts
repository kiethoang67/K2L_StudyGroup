import apiClient from './client';
import type { ApiResponse } from '../types/auth.types';

export interface CreateSectionRequest {
    content: string;
    attachments: string[];
}

export interface CreatorInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export interface CreateSectionResponse {
    sectionId: string;
    content: string;
    attachments: string[];
    creatorInfo: CreatorInfo;
}

export interface ListSectionsResponse {
    sectionId: string;
    content: string;
    attachments: string[];
    creatorInfo: CreatorInfo;
    comments: any[];
    totalComments: number;
}

export interface GetListSectionsWithTotalResponse {
    sections: ListSectionsResponse[];
    total: number;
}

export const sectionsAPI = {
    createSection: (groupId: string, data: CreateSectionRequest): Promise<ApiResponse<CreateSectionResponse>> =>
        apiClient.post(`/sections/${groupId}/createSection`, data),

    getListSections: (groupId: string, params: {
        keyword?: string;
        pageNumber?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
    } = {}): Promise<ApiResponse<GetListSectionsWithTotalResponse>> =>
        apiClient.get(`/sections/${groupId}/listSection`, { params }),

    generatePresignUrlAttachment: (sectionId: string, params: { fileName: string; contentType: string }): Promise<ApiResponse<{ urlUpload: string; publicUrl: string }>> =>
        apiClient.post(`/sections/${sectionId}/generate-presign-url-attachments`, params),

    editSection: (sectionId: string, data: { content: string; attachments: string[] }): Promise<ApiResponse<any>> =>
        apiClient.patch(`/sections/${sectionId}/edit`, data),
};
