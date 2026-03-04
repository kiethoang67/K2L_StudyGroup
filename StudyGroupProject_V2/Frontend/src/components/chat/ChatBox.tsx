import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../../store/authStore';
import { chatAPI, type ChatMessage } from '../../api/chat.api';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';
import type { GroupMemberResponse } from '../../api/groups.api';

interface ChatBoxProps {
    groupId: string;
    members: GroupMemberResponse[];
}

export default function ChatBox({ groupId, members }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [wsError, setWsError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const stompClient = useRef<Client | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const fetchMessages = async (pageNum: number) => {
        try {
            console.log(`[ChatBox] Fetching message history (Page ${pageNum})...`);
            const res = await chatAPI.getGroupMessages(groupId, pageNum);

            let messageData: ChatMessage[] = [];
            if (Array.isArray(res.data)) {
                messageData = res.data;
            } else if (res.data && typeof res.data === 'object') {
                messageData = (res.data as any).messages || (res.data as any).data || [];
                if (!Array.isArray(messageData) && (res.data as any).groupChatMessages) {
                    messageData = (res.data as any).groupChatMessages;
                }
            }

            console.log(`[ChatBox] Page ${pageNum} loaded:`, messageData.length, 'messages');

            if (messageData.length === 0) {
                setHasMore(false);
                return [];
            }

            // Ensure sender and dates are handled correctly
            const processedMessages = messageData.map((msg: any) => {
                const rawSender = msg.senderInfo || msg.sender;
                const rawDate = msg.messageAt || msg.createdAt;
                let senderId: string;
                if (typeof rawSender === 'object' && rawSender !== null) {
                    senderId = rawSender.senderId || rawSender.id || rawSender.userId || 'unknown';
                } else {
                    senderId = rawSender;
                }
                return {
                    ...msg,
                    sender: rawSender,
                    senderId: senderId,
                    createdAt: rawDate
                };
            });
            processedMessages.sort((a, b) => {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return timeA - timeB;
            });

            return processedMessages;
        } catch (error) {
            console.error('[ChatBox] Failed to fetch chat history', error);
            setHasMore(false);
            return [];
        }
    };

    // Initial Load
    useEffect(() => {
        setIsInitialLoad(true);
        setPage(1);
        setHasMore(true);
        setMessages([]);

        const initLoad = async () => {
            const initialMsgs = await fetchMessages(1);
            setMessages(initialMsgs);
            setIsInitialLoad(false);
        };
        initLoad();
    }, [groupId]);

    // Scroll Handler for Infinite Scroll
    const handleScroll = async () => {
        if (!scrollRef.current || isFetchingMore || !hasMore) return;

        const { scrollTop } = scrollRef.current;

        if (scrollTop < 50 && scrollTop >= 0) {
            console.log('[ChatBox] Scrolled to top, loading more...');
            setIsFetchingMore(true);
            const nextPage = page + 1;

            const currentScrollHeight = scrollRef.current.scrollHeight;

            const moreMsgs = await fetchMessages(nextPage);

            if (moreMsgs.length > 0) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueMoreMsgs = moreMsgs.filter(m => !existingIds.has(m.id));

                    return [...uniqueMoreMsgs, ...prev];
                });
                setPage(nextPage);
                setTimeout(() => {
                    if (scrollRef.current) {
                        const newScrollHeight = scrollRef.current.scrollHeight;
                        const diff = newScrollHeight - currentScrollHeight;
                        scrollRef.current.scrollTop = diff;
                    }
                }, 0);
            } else {
                setHasMore(false);
            }

            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        if (isInitialLoad && scrollRef.current && messages.length > 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isInitialLoad]);

    useEffect(() => {
        console.log('[ChatBox] Setting up WebSocket connection...');
        try {
            const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/ws`);

            const token = localStorage.getItem('access_token');
            console.log('[ChatBox] Using token:', token ? 'Token exists' : 'No token');

            stompClient.current = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'Authorization': `Bearer ${token}`
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('[ChatBox] WebSocket connected successfully');
                    setWsError(null);

                    if (!user?.id) {
                        console.error('[ChatBox] User ID missing, cannot subscribe');
                        return;
                    }
                    const subscriptionPath = `/user/${user.id}/chat`;
                    console.log('[ChatBox] Subscribing to:', subscriptionPath);

                    stompClient.current?.subscribe(subscriptionPath, (message) => {
                        console.log('[ChatBox] Received message via WebSocket:', message.body);
                        try {
                            const receivedMessage = JSON.parse(message.body);
                            if (receivedMessage.groupId !== groupId) {
                                console.log('[ChatBox] Ignoring message from another group:', receivedMessage.groupId);
                                return;
                            }

                            const newMsg: ChatMessage = {
                                id: receivedMessage.id || Date.now().toString(),
                                content: receivedMessage.content,
                                sender: receivedMessage.senderId,
                                createdAt: receivedMessage.createdAt || new Date().toISOString(),
                                groupId: receivedMessage.groupId
                            };

                            const isMyMessage = receivedMessage.senderId === user?.id?.toString();

                            setMessages((prev) => {
                                if (isMyMessage) {
                                    const optimisticIndex = prev.findIndex(m =>
                                        (m as any).isOptimistic &&
                                        m.content === newMsg.content
                                    );

                                    if (optimisticIndex !== -1) {
                                        const newMessages = [...prev];
                                        newMessages[optimisticIndex] = newMsg;
                                        return newMessages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                                    }
                                }

                                if (prev.some(m => m.id === newMsg.id)) return prev;

                                const updated = [...prev, newMsg];
                                return updated.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                            });
                        } catch (e) {
                            console.error('[ChatBox] Error parsing message', e);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('[ChatBox] STOMP error', frame);
                    setWsError('Chat connection error. Messages may not update in real-time.');
                },
                onWebSocketError: (event) => {
                    console.error('[ChatBox] WebSocket error', event);
                    setWsError('Failed to connect to chat server.');
                }
            });

            stompClient.current.activate();
        } catch (error) {
            console.error('[ChatBox] Failed to initialize WebSocket', error);
        }

        return () => { stompClient.current?.deactivate(); };
    }, [groupId, user?.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage;
        setNewMessage('');

        const tempId = Date.now().toString();
        const optimisticMsg: ChatMessage & { isOptimistic?: boolean } = {
            id: tempId,
            content: messageContent,
            sender: user?.id || 'Me',
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            console.log('[ChatBox] Sending message...');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/group/${groupId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    content: messageContent,
                    messageType: 'TEXT'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            console.log('[ChatBox] Message sent successfully');
        } catch (error) {
            console.error("[ChatBox] Failed to send message", error);
            setNewMessage(messageContent);
            toast.error('Failed to send message');
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {wsError && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-center justify-between">
                    <span>⚠️ {wsError}</span>
                </div>
            )}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {isFetchingMore && (
                    <div className="text-center py-2 text-xs text-gray-400">
                        Loading more messages...
                    </div>
                )}

                {messages.map((msg, index) => {
                    const getSenderId = (message: any) => {
                        if (message.senderId) return message.senderId;
                        if (typeof message.sender === 'object' && message.sender !== null) return message.sender.id;
                        return message.sender;
                    };
                    const msgSenderId = getSenderId(msg);
                    const currentUserId = user?.id?.toString().toLowerCase();
                    const messageSenderIdStr = msgSenderId?.toString().toLowerCase();
                    const isOwnMessage = messageSenderIdStr === currentUserId;

                    const getSenderName = (message: any) => {
                        if (typeof message.sender === 'object' && message.sender !== null) return `${message.sender.firstName} ${message.sender.lastName}`;
                        const member = members.find(m => m.userId === msgSenderId);
                        return member ? `${member.firstName} ${member.lastName}` : "Unknown User";
                    };

                    return (
                        <div key={msg.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                {!isOwnMessage && <p className="text-xs font-bold mb-1 opacity-70">{getSenderName(msg)}</p>}
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isOwnMessage ? 'text-teal-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button type="submit" className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
