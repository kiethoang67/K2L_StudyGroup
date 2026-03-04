import { useAuthStore } from '../../store/authStore';
import UserDropdown from '../common/UserDropdown';
import NotificationDropdown from '../common/NotificationDropdown';
import { authAPI } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            logout();
            toast.success('Logged out successfully!');
            navigate('/login');
        } catch (error) {
            logout();
            navigate('/login');
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6 ml-4">
                <div className="flex items-center space-x-4 text-gray-400">
                    {!user?.isAdmin && <NotificationDropdown />}
                </div>

                {/* User Profile */}
                <div className="pl-6 border-l border-gray-100">
                    <UserDropdown user={user} onLogout={handleLogout} />
                </div>
            </div>
        </header>
    );
}
