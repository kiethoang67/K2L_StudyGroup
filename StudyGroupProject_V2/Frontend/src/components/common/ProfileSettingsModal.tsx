import { useState, useEffect, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import type { User } from '../../types/auth.types';
import { authAPI } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import MultiSelect from './MultiSelect';
import { INTEREST_OPTIONS } from '../../constants/interests';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    initialMode?: 'view' | 'edit';
}

export default function ProfileSettingsModal({ isOpen, onClose, user, initialMode = 'view' }: ProfileSettingsModalProps) {
    const { setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        interests: string[];
    }>({
        firstName: '',
        lastName: '',
        email: '',
        interests: [],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                interests: user.interests || [],
            });
        }
        // Reset avatar state when modal opens
        setAvatarPreview(null);
        setPendingAvatarUrl(null);
        setMode(initialMode);
    }, [user, isOpen, initialMode]);

    if (!isOpen) return null;

    const isViewMode = mode === 'view';

    const handleAvatarClick = () => {
        if (isViewMode) return;
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setAvatarPreview(localPreview);
        setIsUploading(true);

        try {
            // 1. Get presigned URL from backend
            const res = await authAPI.generatePresignUrlAvatar({ fileName: file.name, contentType: file.type });
            const { urlUpload, publicUrl } = res.data;

            // 2. PUT the file directly to R2 using presigned URL
            const uploadRes = await fetch(urlUpload, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
                credentials: 'omit', // Important for incognito/privacy modes
            });

            if (!uploadRes.ok) {
                throw new Error(`Upload failed with status: ${uploadRes.status}`);
            }

            // 3. Use the public URL returned directly from backend
            setPendingAvatarUrl(publicUrl);
            toast.success('Image uploaded!');
        } catch (error) {
            console.error(error);
            toast.error('Image upload failed, please try again.');
            setAvatarPreview(null);
            setPendingAvatarUrl(null);
        } finally {
            setIsUploading(false);
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updateData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                interests: formData.interests,
            };

            // Include new avatar URL if one was just uploaded
            if (pendingAvatarUrl) {
                updateData.avatarUrl = pendingAvatarUrl;
            }

            // NOTE: PATCH /users/me returns ResponseEntity<User> (not ApiResponse-wrapped)
            // After axios interceptor unwrap, response IS the User object directly
            const updatedUserFromServer = await authAPI.updateProfile(updateData) as any;
            const updatedUser = updatedUserFromServer?.id
                ? updatedUserFromServer                          // got full User from server
                : { ...user, ...updateData };                   // fallback: merge locally

            setUser(updatedUser);
            toast.success('Profile updated successfully');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };



    // Determine what to show in the avatar circle
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'U';
    const displayAvatarUrl = avatarPreview || user?.avatarUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isViewMode ? 'Profile Details' : 'Edit Profile'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">

                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center gap-3">
                        <div className={`relative group ${isViewMode ? '' : 'cursor-pointer'}`} onClick={handleAvatarClick}>
                            {/* Avatar circle */}
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#4FD1C5] flex items-center justify-center shadow-md ring-4 ring-white">
                                {displayAvatarUrl ? (
                                    <img
                                        src={displayAvatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-2xl">{initials}</span>
                                )}
                            </div>

                            {/* Overlay on hover */}
                            {!isViewMode && (
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isUploading ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            )}
                        </div>

                        {!isViewMode && (
                            <p className="text-xs text-gray-500">
                                {isUploading ? 'Uploading...' : 'Click on image to change avatar'}
                            </p>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">First name*</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all ${isViewMode ? 'bg-gray-50 text-gray-600' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                                required
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Last name*</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all ${isViewMode ? 'bg-gray-50 text-gray-600' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                                required
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email*</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all ${isViewMode ? 'bg-gray-50 text-gray-600' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                            required
                            disabled={isViewMode}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Interests</label>
                        <MultiSelect
                            options={INTEREST_OPTIONS}
                            value={formData.interests}
                            onChange={(val) => setFormData(prev => ({ ...prev, interests: val }))}
                            placeholder="Select your interests"
                            disabled={isViewMode}
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 flex justify-end items-center bg-gray-50 rounded-b-xl">
                    <div className="flex space-x-4">
                        {isViewMode ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-300 rounded-lg bg-white"
                            >
                                Close
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('view');
                                        // Reset form on discard
                                        setFormData({
                                            firstName: user.firstName || '',
                                            lastName: user.lastName || '',
                                            email: user.email || '',
                                            interests: user.interests || [],
                                        });
                                        setAvatarPreview(null);
                                        setPendingAvatarUrl(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                    disabled={isLoading}
                                >
                                    Discard Changes
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || isUploading}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
