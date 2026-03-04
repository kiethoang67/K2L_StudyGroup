import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../api/auth.api';
import { toast } from 'react-toastify';

export default function OAuth2SuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const handleLogin = async () => {
            const token = searchParams.get('token');

            if (!token) {
                toast.error('Login failed: No token received');
                navigate('/login');
                return;
            }

            try {
                // Manually set token first so client can use it
                localStorage.setItem('access_token', token);

                // Fetch full user profile
                const response = await authAPI.getProfile();
                const user = response.data.user;

                // Sync with store
                login(token, user);

                toast.success('Login successfully!');
                navigate(user.isAdmin ? '/admin' : '/');
            } catch (error) {
                console.error('OAuth2 login error:', error);
                localStorage.removeItem('access_token'); // Cleanup bad token
                toast.error('Failed to verify login');
                navigate('/login');
            }
        };

        handleLogin();
    }, [searchParams, navigate, login]);

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Verifying login...</h2>
            </div>
        </div>
    );
}
