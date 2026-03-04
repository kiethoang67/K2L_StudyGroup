import apiClient from './client';

export type NotificationType = 'NEW_SECTION' | 'NEW_MEETING';

export interface NotificationResponse {
    id: string;
    message: string;
    notificationType: NotificationType;
    isRead: boolean;
    createdAt: string;
}

export interface ListNotificationsResponse {
    notificationResponseList: NotificationResponse[];
    total: number;
}

export const notificationsAPI = {
    getAllNotifications: (params?: { pageNumber?: number; pageSize?: number }) =>
        apiClient.get<any, { data: ListNotificationsResponse }>('/notifications', { params }),

    getUnreadCount: () =>
        apiClient.get<any, { data: number }>('/notifications/unread'),

    markAsRead: (notificationIds: string[]) =>
        apiClient.post<any, { data: null }>('/notifications/mark', { notificationIds }),

    markAllAsRead: () =>
        apiClient.post<any, { data: null }>('/notifications/mark-all'),
};
