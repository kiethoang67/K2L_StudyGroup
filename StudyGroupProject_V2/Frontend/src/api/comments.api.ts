import apiClient from './client';
import type { ApiResponse } from '../types/auth.types';

// ── Request ──────────────────────────────────────────────────────────────────

export interface CreateCommentRequest {
    content: string;
}

// ── Response ──────────────────────────────────────────────────────────────────

export interface CommentCreatorInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export interface CreateCommentResponse {
    commentId: string;
    content: string;
    creatorInfo: CommentCreatorInfo;
}

export interface ListCommentsResponse {
    commentId: string;
    content: string;
    creatorInfo: CommentCreatorInfo;
}

export interface GetListCommentsWithTotalResponse {
    comments: ListCommentsResponse[];
    total: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const commentsAPI = {
    /**
     * POST /api/sections/{sectionId}/comments
     * Create a new comment in a section.
     */
    createComment: (
        sectionId: string,
        data: CreateCommentRequest,
    ): Promise<ApiResponse<CreateCommentResponse>> =>
        apiClient.post(`/sections/${sectionId}/comments`, data),

    /**
     * GET /api/sections/{sectionId}/comments
     * Fetch comments for a section with pagination and sorting.
     */
    getListComments: (
        sectionId: string,
        params: {
            pageNumber?: number;
            pageSize?: number;
            sortBy?: string;
            sortOrder?: string;
        } = {},
    ): Promise<ApiResponse<GetListCommentsWithTotalResponse>> =>
        apiClient.get(`/sections/${sectionId}/comments`, { params }),
};
