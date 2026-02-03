'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui';
import { Lock } from 'lucide-react';
import { useUpdatePassword } from '@/hooks/apis/user.api';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { updatePasswordSchema, type UpdatePasswordInput } from '@/validations/user';

export function PasswordForm() {
    const toast = useToast();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);
    const updatePassword = useUpdatePassword();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdatePasswordInput>({
        resolver: zodResolver(updatePasswordSchema),
    });

    const onSubmit = async (data: UpdatePasswordInput) => {
        try {
            showLoading('Updating password...');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...passwordData } = data;
            await updatePassword.mutateAsync(passwordData);
            toast.success('Password updated successfully!');
            reset();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update password');
        } finally {
            hideLoading();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                        Security &amp; Authentication
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Manage your access credentials and encryption keys.
                    </p>
                </div>

                <div className="bg-muted/30 border border-primary/10 p-8 rounded-sm space-y-8">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Lock className="size-4 text-secondary" />
                        Change Access Password
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input
                            label="Current Password"
                            type="password"
                            {...register('currentPassword')}
                            leftIcon={<Lock className="size-4" />}
                            variant="compact"
                            disabled={isSubmitting || updatePassword.isPending}
                            error={errors.currentPassword?.message}
                            showPasswordToggle
                        />

                        <Input
                            label="New Password"
                            type="password"
                            {...register('newPassword')}
                            leftIcon={<Lock className="size-4" />}
                            variant="compact"
                            disabled={isSubmitting || updatePassword.isPending}
                            error={errors.newPassword?.message}
                            showPasswordToggle
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            {...register('confirmPassword')}
                            leftIcon={<Lock className="size-4" />}
                            variant="compact"
                            disabled={isSubmitting || updatePassword.isPending}
                            error={errors.confirmPassword?.message}
                            showPasswordToggle
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || updatePassword.isPending}
                    className="bg-linear-to-r from-secondary to-secondary/80 shadow-[0_0_20px_rgba(188,0,255,0.4)] px-12 py-4 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting || updatePassword.isPending ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
}
