import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth.api';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    if (!isOpen) return null;

    const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            toast.error('New password must be different from old password');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            toast.success('Password changed successfully');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-teal-500" />
                        Change Password
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.old ? "text" : "password"}
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('old')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
