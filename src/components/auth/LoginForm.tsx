'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Zap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/validations/auth';
import { useLogin } from '@/hooks/apis/auth.api';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui';

export function LoginForm() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const loginMutation = useLogin();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            showLoading('Authenticating...');
            await loginMutation.mutateAsync(data);
            hideLoading();
            success('Login successful! Redirecting...');
            router.push('/dashboard');
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
            toastError(errorMessage);
        }
    };

    const isLoading = isSubmitting || loginMutation.isPending;

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email/Username Field */}
            <Input
                label="Access_ID"
                type="text"
                {...register('identifier')}
                disabled={isLoading}
                leftIcon={<Mail className="size-5" />}
                placeholder="ENTER_EMAIL_OR_USERNAME"
                error={errors.identifier?.message}
            />

            {/* Password Field */}
            <Input
                label="Security_Key"
                type="password"
                {...register('password')}
                disabled={isLoading}
                leftIcon={<Lock className="size-5" />}
                placeholder="••••••••••••"
                error={errors.password?.message}
                showPasswordToggle
            />

            <Link
                href="/recovery"
                className="block text-right text-[10px] font-mono text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
            >
                Recover_Access?
            </Link>

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
                            <span>Authenticating...</span>
                        </>
                    ) : (
                        <>
                            <span>Initialize_Session</span>
                            <Zap className="size-4" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
