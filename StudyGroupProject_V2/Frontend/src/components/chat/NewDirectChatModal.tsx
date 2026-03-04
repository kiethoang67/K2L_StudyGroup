import { useState } from 'react';
import { chatAPI } from '../../api/chat.api';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';

interface NewDirectChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (chatId: string, receiverId: string) => void;
}

export default function NewDirectChatModal({ isOpen, onClose, onSuccess }: NewDirectChatModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setIsLoading(true);
        try {
            const res = await chatAPI.createDirectChat(email);
            console.log('[NewDirectChatModal] Create chat response:', res.data);
            toast.success('Chat created successfully!');

            const chatId = res.data.id;
            const currentUserId = user?.id?.toString();
            const receiverId = res.data.participantIds?.find((id: string) => id !== currentUserId) || '';

            console.log('[NewDirectChatModal] ChatId:', chatId, 'ReceiverId:', receiverId);

            onSuccess(chatId, receiverId);
            setEmail('');
            onClose();
        } catch (error: any) {
            console.error('[NewDirectChatModal] Failed to create chat', error);
            toast.error(error.response?.data?.message || 'Failed to create chat. User may not exist.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">New Direct Chat</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            User Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter user's email address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Enter the email address of the person you want to chat with
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : 'Create Chat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
