import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import registerBg from '../../assets/images/studygroup-poster.jpg';
import MultiSelect from '../../components/common/MultiSelect';
import { INTEREST_OPTIONS } from '../../constants/interests';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'Please enter your first name'),
    lastName: z.string().min(1, 'Please enter your last name'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    interests: z.array(z.string()).min(2, 'Please select at least 2 interests'),
});

type RegisterFormData = z.infer<typeof registerSchema>;



export default function RegisterPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            interests: []
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await authAPI.register({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                password: data.password,
                interests: data.interests,
            });
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again!';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src={registerBg}
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
                                className="tab-button tab-inactive"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="tab-button tab-active"
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
                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field"
                                placeholder="Enter your Email Address"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* First name & Last name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First name
                                </label>
                                <input
                                    {...register('firstName')}
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter your first name"
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last name
                                </label>
                                <input
                                    {...register('lastName')}
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter your last name"
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                                )}
                            </div>
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

                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interests (Select at least 2)
                            </label>
                            <MultiSelect
                                options={INTEREST_OPTIONS}
                                value={watch('interests') || []}
                                onChange={(val) => setValue('interests', val, { shouldValidate: true })}
                                placeholder="Select your interests..."
                            />
                            {errors.interests && (
                                <p className="text-red-500 text-xs mt-1">{errors.interests.message}</p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
