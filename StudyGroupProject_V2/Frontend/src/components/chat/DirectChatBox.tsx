import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../../store/authStore';
import { chatAPI, type DirectChatMessageResponse, type DirectChatDetailResponse } from '../../api/chat.api';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';

interface DirectChatBoxProps {
    chatId: string;
    receiverId: string;
}

export default function DirectChatBox({ chatId, receiverId }: DirectChatBoxProps) {
    console.log('[DirectChatBox] Component rendering with chatId:', chatId, 'receiverId:', receiverId);

    const [messages, setMessages] = useState<DirectChatMessageResponse[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [wsError, setWsError] = useState<string | null>(null);
    const [chatDetails, setChatDetails] = useState<DirectChatDetailResponse[]>([]);
    const { user } = useAuthStore();
    const stompClient = useRef<Client | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await chatAPI.getDirectChatDetails(chatId);
                setChatDetails(res.data);
            } catch (error) {
                console.error('[DirectChatBox] Failed to fetch chat details', error);
            }
        };
        fetchDetails();
    }, [chatId]);

    const fetchMessages = async (pageNum: number) => {
        try {
            console.log(`[DirectChatBox] Fetching message history (Page ${pageNum})...`);
            const res = await chatAPI.getDirectChatMessages(chatId, undefined, pageNum);

            const messageData = res.data.directChatMessages || [];
            console.log(`[DirectChatBox] Page ${pageNum} loaded:`, messageData.length, 'messages');

            if (messageData.length === 0) {
                setHasMore(false);
                return [];
            }

            messageData.sort((a, b) => {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return timeA - timeB;
            });

            return messageData;
        } catch (error) {
            console.error('[DirectChatBox] Failed to fetch chat history', error);
            setHasMore(false);
            return [];
        }
    };

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
    }, [chatId]);

    const handleScroll = async () => {
        if (!scrollRef.current || isFetchingMore || !hasMore) return;

        const { scrollTop } = scrollRef.current;

        if (scrollTop < 50 && scrollTop >= 0) {
            console.log('[DirectChatBox] Scrolled to top, loading more...');
            setIsFetchingMore(true);
            const nextPage = page + 1;

            const currentScrollHeight = scrollRef.current.scrollHeight;
            const moreMsgs = await fetchMessages(nextPage);

            if (moreMsgs.length > 0) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map((m: any) => m.id));
                    const uniqueMoreMsgs = moreMsgs.filter((m: any) => !existingIds.has(m.id));
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
        console.log('[DirectChatBox] Setting up WebSocket connection...');
        try {
            const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/ws`);
            const token = localStorage.getItem('access_token');

            stompClient.current = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    'Authorization': `Bearer ${token}`
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('[DirectChatBox] WebSocket connected successfully');
                    setWsError(null);

                    if (!user?.id) {
                        console.error('[DirectChatBox] User ID missing, cannot subscribe');
                        return;
                    }

                    const subscriptionPath = `/user/${user.id}/chat`;
                    console.log('[DirectChatBox] Subscribing to:', subscriptionPath);

                    stompClient.current?.subscribe(subscriptionPath, (message) => {
                        console.log('[DirectChatBox] Received message via WebSocket:', message.body);
                        try {
                            const receivedMessage = JSON.parse(message.body);

                            // Filter for this chat only
                            if (receivedMessage.chatId !== chatId) {
                                console.log('[DirectChatBox] Ignoring message from another chat');
                                return;
                            }

                            const newMsg: DirectChatMessageResponse = {
                                createdAt: receivedMessage.createdAt || new Date().toISOString(),
                                senderId: receivedMessage.senderId,
                                content: receivedMessage.content,
                                messageType: receivedMessage.messageType || 'TEXT'
                            };

                            setMessages((prev) => {
                                if (prev.some((m: any) => m.id === (receivedMessage.id || newMsg.createdAt))) return prev;

                                const updated = [...prev, newMsg];
                                return updated.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                            });
                            setTimeout(() => {
                                if (scrollRef.current) {
                                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                }
                            }, 100);
                        } catch (e) {
                            console.error('[DirectChatBox] Error parsing message', e);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('[DirectChatBox] STOMP error', frame);
                    setWsError('Chat connection error. Messages may not update in real-time.');
                },
                onWebSocketError: (event) => {
                    console.error('[DirectChatBox] WebSocket error', event);
                    setWsError('Failed to connect to chat server.');
                }
            });

            stompClient.current.activate();
        } catch (error) {
            console.error('[DirectChatBox] Failed to initialize WebSocket', error);
        }

        return () => { stompClient.current?.deactivate(); };
    }, [chatId, user?.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage;
        setNewMessage('');

        const optimisticMsg: DirectChatMessageResponse = {
            createdAt: new Date().toISOString(),
            senderId: user?.id?.toString() || '',
            content: messageContent,
            messageType: 'TEXT'
        };

        setMessages((prev) => [...prev, optimisticMsg]);

        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 0);

        try {
            console.log('[DirectChatBox] Sending message...');
            await chatAPI.sendDirectMessage(chatId, messageContent, receiverId);
            console.log('[DirectChatBox] Message sent successfully');
        } catch (error) {
            console.error("[DirectChatBox] Failed to send message", error);
            setNewMessage(messageContent);
            toast.error('Failed to send message');
            setMessages((prev) => prev.filter(m => m !== optimisticMsg));
        }
    };

    const getSenderName = (senderId: string) => {
        const detail = chatDetails.find(d => d.userId === senderId);
        return detail ? `${detail.firstName} ${detail.lastName}` : 'Unknown';
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
                    const currentUserId = user?.id?.toString();
                    const isOwnMessage = msg.senderId === currentUserId;

                    return (
                        <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                {!isOwnMessage && <p className="text-xs font-bold mb-1 opacity-70">{getSenderName(msg.senderId)}</p>}
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
