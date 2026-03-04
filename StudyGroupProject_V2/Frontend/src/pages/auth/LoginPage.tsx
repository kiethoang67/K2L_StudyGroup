import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import loginBg from '../../assets/images/studygroup-poster.jpg';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);
    const [isDeactivatedError, setIsDeactivatedError] = useState(false);
    const [confirmReactivate, setConfirmReactivate] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await authAPI.login({
                ...data,
                reactive: confirmReactivate
            });
            const user = response.data.user;
            login(response.data.token, user);
            toast.success('Logged in successfully!');
            navigate(user.isAdmin ? '/admin' : '/');
        } catch (error: any) {
            console.log('Login Error Full:', error);
            const responseData = error.response?.data;
            console.log('Error Response Data:', responseData);

            const errorMessage = responseData?.message || 'Login failed. Please check your credentials!';

            // Check for deactivation message
            if (errorMessage === 'This account is deactivated') {
                console.log('Detected deactivation error');
                setIsDeactivatedError(true);
            } else {
                console.log('Error message mismatch:', errorMessage);
            }

            toast.error(errorMessage);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src={loginBg}
                    alt="Study Group Poster"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Welcome to StudyGroup
                        </h1>

                        {/* Tab buttons */}
                        <div className="inline-flex bg-primary rounded-full p-1 mt-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="tab-button tab-active"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="tab-button tab-inactive"
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm text-center mb-8">
                        Lorem ipsum is simply dummy text of the printing and typesetting industry.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field"
                                placeholder="Enter your Email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-12"
                                    placeholder="Enter your Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-primary hover:text-primary-dark"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Reactivation prompt */}
                        {isDeactivatedError && (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                <p className="text-amber-800 text-sm mb-3">
                                    Your account is currently deactivated. Would you like to reactivate it?
                                </p>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={confirmReactivate}
                                        onChange={(e) => setConfirmReactivate(e.target.checked)}
                                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-amber-900">I want to reactivate my account</span>
                                </label>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="relative flex items-center justify-center mt-6">
                            <div className="border-t border-gray-300 w-full"></div>
                            <div className="bg-white px-4 text-sm text-gray-500">Or continue with</div>
                            <div className="border-t border-gray-300 w-full"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.href = 'http://localhost:8081/oauth2/authorization/google'}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Login with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
