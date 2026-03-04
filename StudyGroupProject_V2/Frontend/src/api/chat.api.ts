import apiClient from './client';
import type { ApiResponse } from '../types/auth.types';

export interface ChatMessage {
    id: string;
    groupId?: string;
    sender: string;
    content: string;
    createdAt?: string;
}

// Direct Chat Types
export interface ReceiverInfo {
    id: string;
    email: string;
    avatarUrl: string;
    lastName: string;
    firstName: string;
}

export interface DirectChatResponse {
    chatId: string;
    lastMessageAt: string;
    receiverInfo: ReceiverInfo;
}

export interface ListDirectChatsResponse {
    userDirectChats: DirectChatResponse[];
    total: number;
}

export interface DirectChatMessageResponse {
    createdAt: string;
    senderId: string;
    content: string;
    messageType: string;
}

export interface ListDirectChatMessagesResponse {
    directChatMessages: DirectChatMessageResponse[];
    total: number;
}

export interface DirectChatDetailResponse {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
}

export const chatAPI = {
    getGroupMessages: (groupId: string, pageNumber: number = 1, pageSize: number = 20): Promise<ApiResponse<any>> =>
        apiClient.get(`/chat/group/${groupId}/messages`, {
            params: {
                pageNumber,
                pageSize
            }
        }),

    getDirectChats: (keyword?: string, pageNumber: number = 1, pageSize: number = 20): Promise<ApiResponse<ListDirectChatsResponse>> =>
        apiClient.get('/chat/user/chats', {
            params: {
                keyword,
                pageNumber,
                pageSize
            }
        }),

    createDirectChat: (email: string): Promise<ApiResponse<any>> =>
        apiClient.post('/chat/user/new-direct-chat', { email }),

    getDirectChatMessages: (chatId: string, keyword?: string, pageNumber: number = 1, pageSize: number = 20): Promise<ApiResponse<ListDirectChatMessagesResponse>> =>
        apiClient.get(`/chat/user/${chatId}/messages`, {
            params: {
                keyword,
                pageNumber,
                pageSize
            }
        }),

    sendDirectMessage: (chatId: string, content: string, receiverId: string, messageType: string = 'TEXT'): Promise<ApiResponse<any>> =>
        apiClient.post(`/chat/user/${chatId}/message`, {
            content,
            receiverId,
            messageType
        }),

    getDirectChatDetails: (chatId: string): Promise<ApiResponse<DirectChatDetailResponse[]>> =>
        apiClient.get(`/chat/user/${chatId}/detail`),
};
