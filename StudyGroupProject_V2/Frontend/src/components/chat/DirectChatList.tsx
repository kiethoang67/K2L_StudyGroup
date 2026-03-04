import { useState, useEffect } from 'react';
import { chatAPI, type DirectChatResponse } from '../../api/chat.api';
import { Plus, Search } from 'lucide-react';

interface DirectChatListProps {
    onSelectChat: (chatId: string, receiverId: string) => void;
    selectedChatId: string | null;
    onNewChat: () => void;
    refreshTrigger?: number;
}

export default function DirectChatList({ onSelectChat, selectedChatId, onNewChat, refreshTrigger }: DirectChatListProps) {
    const [chats, setChats] = useState<DirectChatResponse[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchChats = async (keyword?: string) => {
        setIsLoading(true);
        try {
            console.log('[DirectChatList] Fetching chats...');
            const res = await chatAPI.getDirectChats(keyword, 1, 50);
            console.log('[DirectChatList] Fetched chats:', res.data.userDirectChats);
            setChats(res.data.userDirectChats);
        } catch (error) {
            console.error('[DirectChatList] Failed to fetch chats', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [refreshTrigger]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchChats(searchKeyword);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Chat</h2>
                    <button
                        onClick={onNewChat}
                        className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Search here..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                </form>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No chats yet</div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.chatId}
                            onClick={() => onSelectChat(chat.chatId, chat.receiverInfo.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedChatId === chat.chatId
                                ? 'bg-teal-50 border-l-4 border-l-teal-500'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <img
                                        src={chat.receiverInfo.avatarUrl || `https://ui-avatars.com/api/?name=${chat.receiverInfo.firstName}+${chat.receiverInfo.lastName}&background=random`}
                                        alt={chat.receiverInfo.firstName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {chat.receiverInfo.firstName} {chat.receiverInfo.lastName}
                                        </p>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {formatTime(chat.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{chat.receiverInfo.email}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
