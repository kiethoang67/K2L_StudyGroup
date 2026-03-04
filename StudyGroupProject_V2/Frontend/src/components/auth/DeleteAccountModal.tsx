import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { authAPI } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CONFIRM_TEXT = 'Please type DELETE MY ACCOUNT to confirm';

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
    const [confirmInput, setConfirmInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isConfirmed = confirmInput === CONFIRM_TEXT;

    const handleDelete = async () => {
        if (!isConfirmed) return;

        setIsLoading(true);
        try {
            await authAPI.deleteAccount({ confirmDelete: CONFIRM_TEXT });
            useAuthStore.getState().logout();
            toast.success('Your account has been permanently deleted.');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete account. Please try again!';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setConfirmInput('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Delete Account</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm font-medium mb-1">
                            ⚠️ Action cannot be undone!
                        </p>
                        <p className="text-red-700 text-sm">
                            Your account and all data (groups, messages, ...) will be permanently deleted.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Type exactly the following to confirm:
                        </label>
                        <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-800 select-all">
                            {CONFIRM_TEXT}
                        </p>
                        <input
                            type="text"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all text-sm"
                            placeholder="Enter confirmation text..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!isConfirmed || isLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}
