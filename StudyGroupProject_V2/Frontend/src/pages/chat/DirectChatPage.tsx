import { useState } from 'react';
import DirectChatList from '../../components/chat/DirectChatList';
import DirectChatBox from '../../components/chat/DirectChatBox';
import NewDirectChatModal from '../../components/chat/NewDirectChatModal';

export default function DirectChatPage() {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSelectChat = (chatId: string, receiverId: string) => {
        console.log('[DirectChatPage] Chat selected - ChatId:', chatId, 'ReceiverId:', receiverId);
        setSelectedChatId(chatId);
        setSelectedReceiverId(receiverId);
    };

    const handleNewChatSuccess = (chatId: string, receiverId: string) => {
        console.log('[DirectChatPage] New chat created - ChatId:', chatId, 'ReceiverId:', receiverId);
        setSelectedChatId(chatId);
        setSelectedReceiverId(receiverId);
        setRefreshKey(prev => prev + 1); // Force refresh chat list
    };

    console.log('[DirectChatPage] Render - selectedChatId:', selectedChatId, 'selectedReceiverId:', selectedReceiverId);

    return (
        <div className="h-full flex bg-gray-50 overflow-hidden">
            {/* Sidebar - Chat List */}
            <div className="w-80 flex-shrink-0">
                <DirectChatList
                    refreshTrigger={refreshKey}
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChatId}
                    onNewChat={() => setIsNewChatModalOpen(true)}
                />
            </div>

            {/* Main Area - Chat Box */}
            <div className="flex-1 flex items-center justify-center p-6">
                {selectedChatId && selectedReceiverId ? (
                    <div className="w-full max-w-4xl">
                        <DirectChatBox
                            chatId={selectedChatId}
                            receiverId={selectedReceiverId}
                        />
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
                        <p className="text-sm">Choose a conversation from the list or create a new one</p>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            <NewDirectChatModal
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
                onSuccess={handleNewChatSuccess}
            />
        </div>
    );
}
