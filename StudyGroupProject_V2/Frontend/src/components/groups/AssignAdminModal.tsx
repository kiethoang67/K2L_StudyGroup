import { useState } from 'react';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { groupsAPI } from '../../api/groups.api';
import { toast } from 'react-toastify';

interface AssignAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    userId: string;
    userName: string;
    onSuccess: () => void;
}

export default function AssignAdminModal({ isOpen, onClose, groupId, userId, userName, onSuccess }: AssignAdminModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleAssign = async () => {
        setIsLoading(true);
        try {
            await groupsAPI.assignAdmin(groupId, userId);
            toast.success(`Assigned ${userName} as administrator`);
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to assign administrator';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-blue-50">
                    <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Assign Administrator
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-blue-800">Grant administrator rights to {userName}?</p>
                            <p className="text-sm text-blue-700/80 mt-1">
                                The new administrator will be able to change group settings, manage members, and even dissolve the group.
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Are you sure you want to grant administrator rights to this member? This action may affect your control over the group.
                    </p>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={handleAssign}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <ShieldCheck className="w-5 h-5" />
                            )}
                            {isLoading ? 'Processing...' : 'Confirm Assignment'}
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
