import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, BellOff } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import { notificationsAPI, type NotificationResponse } from '../../api/notifications.api';
import { useAuthStore } from '../../store/authStore';

const TYPE_LABELS: Record<string, string> = {
    NEW_SECTION: '📄 New post',
    NEW_MEETING: '📅 New meeting',
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

export default function NotificationDropdown() {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Track IDs that have been marked as read locally to preserve state during re-fetch
    const locallyReadIds = useRef<Set<string>>(new Set());
    const PAGE_SIZE = 10;

    // ── REST: fetch unread count ──────────────────────────────────────────────
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await notificationsAPI.getUnreadCount();
            setUnreadCount(res.data ?? 0);
        } catch { /* ignore */ }
    }, []);

    // ── REST: fetch paginated list ────────────────────────────────────────────
    const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
        setIsLoading(true);
        try {
            const res = await notificationsAPI.getAllNotifications({ pageNumber: pageNum, pageSize: PAGE_SIZE });
            const list = res.data?.notificationResponseList ?? [];
            setTotal(res.data?.total ?? 0);
            // Merge: if ID marked locally -> keep isRead: true even if server returns false
            const merged = list.map(n =>
                locallyReadIds.current.has(n.id) ? { ...n, isRead: true } : n
            );
            setNotifications(prev => append ? [...prev, ...merged] : merged);
        } catch { /* ignore */ }
        finally { setIsLoading(false); }
    }, []);

    // ── WebSocket: real-time push ─────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const token = localStorage.getItem('access_token');
        const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/ws`);

        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                const topic = `/user/${user.id}/notification`;
                client.subscribe(topic, (frame) => {
                    try {
                        const incoming = JSON.parse(frame.body) as NotificationResponse;
                        // Add to top of list
                        setNotifications(prev => [incoming, ...prev]);
                        setTotal(prev => prev + 1);
                        // Increment badge
                        setUnreadCount(prev => prev + 1);
                        // Show toast
                        toast.info(
                            `${TYPE_LABELS[incoming.notificationType] ?? '🔔'}: ${incoming.message}`,
                            { position: 'bottom-right', autoClose: 4000 }
                        );
                    } catch { /* ignore */ }
                });
            },
        });

        client.activate();
        return () => { client.deactivate(); };
    }, [user?.id]);

    // ── Polling fallback (60s) ────────────────────────────────────────────────
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60_000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // ── Load list when dropdown opens ─────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setPage(1);
            fetchNotifications(1, false);
        }
    }, [isOpen, fetchNotifications]);

    // ── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    const handleMarkAllAsRead = async () => {
        setIsMarkingAll(true);
        try {
            await notificationsAPI.markAllAsRead();
            // Clear local cache because server has updated all
            locallyReadIds.current.clear();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { /* ignore */ }
        finally { setIsMarkingAll(false); }
    };

    const handleMarkOne = async (notif: NotificationResponse) => {
        if (notif.isRead) return;
        try {
            await notificationsAPI.markAsRead([notif.id]);
            // Remember ID marked locally
            locallyReadIds.current.add(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const hasMore = notifications.length < total;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="hover:text-gray-600 transition-colors relative"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-teal-500" />
                            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-teal-50 text-teal-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAll}
                                className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors disabled:opacity-50"
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                        {isLoading && notifications.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 text-sm">
                                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                <BellOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif, idx) => (
                                <button
                                    key={notif.id || idx}
                                    onClick={() => handleMarkOne(notif)}
                                    className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors ${notif.isRead
                                        ? 'bg-white hover:bg-gray-50'
                                        : 'bg-teal-50/40 hover:bg-teal-50'
                                        }`}
                                >
                                    <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${notif.isRead ? 'bg-transparent' : 'bg-teal-400'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-teal-600 mb-0.5">
                                            {TYPE_LABELS[notif.notificationType] ?? notif.notificationType}
                                        </p>
                                        <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>
                                    {notif.isRead && (
                                        <Check className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                                    )}
                                </button>
                            ))
                        )}

                        {hasMore && !isLoading && (
                            <div className="px-5 py-3 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                                >
                                    View more ({total - notifications.length} left)
                                </button>
                            </div>
                        )}
                        {isLoading && notifications.length > 0 && (
                            <div className="py-3 text-center">
                                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
