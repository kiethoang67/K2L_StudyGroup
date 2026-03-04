import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { groupsAPI } from '../../api/groups.api';
import { toast } from 'react-toastify';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export default function InviteUserModal({ isOpen, onClose, groupId }: InviteUserModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            await groupsAPI.inviteUser(groupId, email.trim());
            toast.success(`Invitation sent to ${email}`);
            setEmail('');
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to send invitation';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Send className="w-5 h-5 text-teal-600" />
                        Invite Member
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email to invite..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                            required
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            The user will receive an invitation and can accept or decline.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !email.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
