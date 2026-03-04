import { useState } from 'react';
import { Settings, Lock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { authAPI } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import DeleteAccountModal from '../../components/auth/DeleteAccountModal';

export default function AccountSettingsPage() {
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [isLoadingHover, setIsLoadingHover] = useState(false); // prevent double clicks on deactivate

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) return;

        setIsLoadingHover(true);
        try {
            await authAPI.logout();

            await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/deactivateAccount`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            useAuthStore.getState().logout();
            toast.success('Account deactivated');
        } catch (error) {
            toast.error('Could not deactivate account');
        } finally {
            setIsLoadingHover(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    Account Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account security and preferences.
                </p>
            </div>

            <div className="space-y-6">
                {/* Security Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-gray-400" />
                            Security
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Update your password to keep your account secure.</p>
                        </div>
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white shadow rounded-lg overflow-hidden border border-red-100">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </h3>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="max-w-xl text-sm text-gray-500">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                                        Deactivate Account
                                    </h4>
                                    <p className="mt-1">
                                        Temporarily disable your account. You can reactivate it by logging in again.
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleDeactivate}
                                        disabled={isLoadingHover}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                                    >
                                        Deactivate
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="max-w-xl text-sm text-gray-500">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        Delete Account
                                    </h4>
                                    <p className="mt-1">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteAccountOpen(true)}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Delete account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />

            <DeleteAccountModal
                isOpen={isDeleteAccountOpen}
                onClose={() => setIsDeleteAccountOpen(false)}
            />
        </div>
    );
}
