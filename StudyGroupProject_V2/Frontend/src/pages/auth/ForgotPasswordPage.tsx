import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import loginBg from '../../assets/images/studygroup-poster.jpg';

// Step 1: Email only
const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// Step 2: Code + new password
const resetSchema = z.object({
    code: z.string().min(1, 'Please enter the verification code'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 1 form
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    // Step 2 form
    const resetForm = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema),
    });

    // Step 1: Send code to email
    const onSendCode = async (data: EmailFormData) => {
        try {
            await authAPI.forgotPassword({ email: data.email });
            setEmail(data.email);
            setStep(2);
            toast.success('Verification code sent to your email!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send code. Please try again!';
            toast.error(errorMessage);
        }
    };

    // Step 2: Change password with code
    const onResetPassword = async (data: ResetFormData) => {
        try {
            await authAPI.forgotPasswordChange({
                email,
                code: data.code,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword,
            });
            toast.success('Password reset successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again!';
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
                            Forgot Password
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {step === 1
                                ? 'Enter your email to receive a password reset code.'
                                : 'Enter the verification code and your new password.'}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 1 ? 'bg-primary text-white' : 'bg-green-100 text-green-700'
                            }`}>
                            <Mail size={16} />
                            <span>Email</span>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <KeyRound size={16} />
                            <span>Reset</span>
                        </div>
                    </div>

                    {/* Step 1: Enter email */}
                    {step === 1 && (
                        <form onSubmit={emailForm.handleSubmit(onSendCode)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    {...emailForm.register('email')}
                                    type="email"
                                    className="input-field"
                                    placeholder="Enter your email"
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={emailForm.formState.isSubmitting}
                                className="btn-primary"
                            >
                                {emailForm.formState.isSubmitting ? 'Sending...' : 'Send Verification Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4"
                            >
                                <ArrowLeft size={16} />
                                Back to login
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter code + new password */}
                    {step === 2 && (
                        <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-5">
                            {/* Email (read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    {...resetForm.register('code')}
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter verification code from email"
                                />
                                {resetForm.formState.errors.code && (
                                    <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.code.message}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...resetForm.register('newPassword')}
                                        type={showNewPassword ? 'text' : 'password'}
                                        className="input-field pr-12"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {resetForm.formState.errors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.newPassword.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...resetForm.register('confirmNewPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="input-field pr-12"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {resetForm.formState.errors.confirmNewPassword && (
                                    <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.confirmNewPassword.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={resetForm.formState.isSubmitting}
                                className="btn-primary"
                            >
                                {resetForm.formState.isSubmitting ? 'Saving...' : 'Save New Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4"
                            >
                                <ArrowLeft size={16} />
                                Back to email input
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
