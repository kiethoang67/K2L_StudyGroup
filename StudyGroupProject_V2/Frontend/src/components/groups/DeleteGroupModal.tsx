import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { groupsAPI } from '../../api/groups.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface DeleteGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
}

export default function DeleteGroupModal({ isOpen, onClose, groupId, groupName }: DeleteGroupModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (confirmName !== groupName) {
            toast.error('Group name does not match. Please check again.');
            return;
        }

        setIsLoading(true);
        try {
            await groupsAPI.deleteGroup(groupId);
            toast.success('Group deleted successfully');
            onClose();
            navigate('/dashboard'); // or wherever the user should go
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete group';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-red-50">
                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Delete Study Group
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-red-800">This action cannot be undone!</p>
                            <p className="text-sm text-red-700/80 mt-1">
                                All data, chats, documents, and members in the group <strong>{groupName}</strong> will be permanently deleted.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Type exactly group name <span className="text-red-600 font-bold">{groupName}</span> to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Enter group name..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={handleDelete}
                            disabled={isLoading || confirmName !== groupName}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            {isLoading ? 'Deleting...' : 'I understand, delete this group'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
