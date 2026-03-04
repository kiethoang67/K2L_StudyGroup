import { useState, useRef, useEffect } from 'react';
import {
    LogOut,
    User as UserIcon,
    UserCog,
    Settings
} from 'lucide-react';
import type { User } from '../../types/auth.types';
import ProfileSettingsModal from './ProfileSettingsModal';
import { useNavigate } from 'react-router-dom';

interface UserDropdownProps {
    user: User | null;
    onLogout: () => void;
}

export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Safe defaults if user is null or undefined
    const firstName = user?.firstName || 'User';
    const lastName = user?.lastName || '';
    const firstInitial = firstName ? firstName[0] : '';
    const lastInitial = lastName ? lastName[0] : '';
    const initials = (firstInitial + lastInitial) || 'US';
    // Change name order to: LastName FirstName as requested
    const fullName = `${lastName} ${firstName}`.trim().toUpperCase() || 'USER';

    const MenuItem = ({ icon: Icon, label, onClick, className = "" }: { icon: any, label: string, onClick?: () => void, className?: string }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors ${className}`}
        >
            <Icon className="w-5 h-5 mr-3 text-gray-400" />
            <span>{label}</span>
        </button>
    );

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-3 focus:outline-none group p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 rounded-lg bg-[#4FD1C5] flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            initials || "US"
                        )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-gray-800 font-semibold text-sm group-hover:text-gray-900">
                            {fullName}
                        </span>
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                        <div className="py-1">
                            <MenuItem
                                icon={UserIcon}
                                label="View profile"
                                onClick={() => {
                                    setIsOpen(false);
                                    setModalMode('view');
                                    setIsModalOpen(true);
                                }}
                            />

                            <MenuItem
                                icon={UserCog}
                                label="Edit profile"
                                onClick={() => {
                                    setIsOpen(false);
                                    setModalMode('edit');
                                    setIsModalOpen(true);
                                }}
                            />

                            <MenuItem
                                icon={Settings}
                                label="Account settings"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/settings');
                                }}
                            />

                            <div className="h-px bg-gray-100 my-1" />

                            <MenuItem
                                icon={LogOut}
                                label="Log out"
                                onClick={() => {
                                    setIsOpen(false);
                                    onLogout();
                                }}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Settings Modal */}
            {user && (
                <ProfileSettingsModal
                    key={modalMode + isModalOpen} // Force re-render when mode changes
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    user={user}
                    initialMode={modalMode}
                />
            )}
        </>
    );
}
