'use client';

import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Zap, Loader2, Phone } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/validations/auth';
import { useRegister } from '@/hooks/apis/auth.api';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui';
import type { Gender } from '@/types/auth.types';

// Gender options with icons and labels
const genderOptions: { value: Gender; label: string; icon: string }[] = [
    { value: 'MALE', label: 'Male', icon: '♂' },
    { value: 'FEMALE', label: 'Female', icon: '♀' },
    { value: 'OTHER', label: 'Other', icon: '⚧' },
];

export function SignUpForm() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const registerMutation = useRegister();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            fullName: '',
            email: '',
            phone: '',
            gender: undefined,
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            showLoading('Creating your account...');
            await registerMutation.mutateAsync({
                username: data.username,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone || '',
                gender: data.gender,
                password: data.password,
            });
            hideLoading();
            success('Account created successfully! Redirecting...');
            router.push('/dashboard');
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Registration failed. Email or username may already exist.';
            toastError(errorMessage);
        }
    };

    const isLoading = isSubmitting || registerMutation.isPending;

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <Input
                label="User_Alias"
                type="text"
                {...register('username')}
                disabled={isLoading}
                variant="compact"
                leftIcon={<User className="size-5" />}
                placeholder="UNIQUE_USERNAME"
                error={errors.username?.message}
            />

            {/* Full Name Field */}
            <Input
                label="Full_Name"
                type="text"
                {...register('fullName')}
                disabled={isLoading}
                variant="compact"
                leftIcon={<User className="size-5" />}
                placeholder="ENTER_YOUR_FULL_NAME"
                error={errors.fullName?.message}
            />

            {/* Email Field */}
            <Input
                label="Access_ID"
                type="email"
                {...register('email')}
                disabled={isLoading}
                variant="compact"
                leftIcon={<Mail className="size-5" />}
                placeholder="ENTER_EMAIL_IDENTITY"
                error={errors.email?.message}
            />

            {/* Phone Field */}
            <Input
                label="Phone_Contact"
                type="tel"
                {...register('phone')}
                disabled={isLoading}
                variant="compact"
                leftIcon={<Phone className="size-5" />}
                placeholder="0912345678"
                error={errors.phone?.message}
            />

            {/* Gender Field */}
            <div className="space-y-2">
                <label className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    Identity_Type
                </label>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                            {genderOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => field.onChange(option.value)}
                                    className={`
                                        relative flex flex-col items-center justify-center gap-1 py-3 px-4
                                        border rounded-sm font-mono text-sm uppercase tracking-wider
                                        transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${
                                            field.value === option.value
                                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,238,255,0.3)]'
                                                : 'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{option.icon}</span>
                                    <span className="text-xs">{option.label}</span>
                                    {field.value === option.value && (
                                        <div className="absolute -top-1 -right-1 size-2 bg-primary rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                />
                {errors.gender && (
                    <p className="text-xs text-red-400 font-mono">{errors.gender.message}</p>
                )}
            </div>

            {/* Password Field */}
            <Input
                label="Security_Key"
                type="password"
                {...register('password')}
                disabled={isLoading}
                variant="compact"
                leftIcon={<Lock className="size-5" />}
                placeholder="••••••••••••"
                error={errors.password?.message}
                showPasswordToggle
            />

            {/* Confirm Password Field */}
            <Input
                label="Confirm_Key"
                type="password"
                {...register('confirmPassword')}
                disabled={isLoading}
                variant="compact"
                leftIcon={<Lock className="size-5" />}
                placeholder="••••••••••••"
                error={errors.confirmPassword?.message}
                showPasswordToggle
            />

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-[0.15em] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <>
                            <span>Create_Account</span>
                            <Zap className="size-4" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
