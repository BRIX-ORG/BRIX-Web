'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/ui';
import { User, Phone, MapPin, Mail, Users, ShieldCheck } from 'lucide-react';
import { useUpdateProfile } from '@/hooks/apis/user.api';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { updateProfileSchema, type UpdateProfileInput } from '@/validations/user';
import type { User as UserType } from '@/types/user.types';

interface ProfileFormProps {
    user: UserType;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const toast = useToast();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);
    const updateProfile = useUpdateProfile();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
    });

    useEffect(() => {
        reset({
            fullName: user.fullName,
            phone: user.phone,
            gender: user.gender,
            address: user.address || '',
            shortDescription: user.shortDescription || '',
        });
    }, [user, reset]);

    const onSubmit = async (data: UpdateProfileInput) => {
        try {
            showLoading('Updating profile...');
            await updateProfile.mutateAsync(data);
            toast.success('Profile updated successfully!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            hideLoading();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="pt-8 space-y-10">
            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Identity Management</h2>
                    <p className="text-muted-foreground text-sm">
                        Update your public persona and contact information on the BRIX protocol.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Full Name"
                        {...register('fullName')}
                        leftIcon={<User className="size-4" />}
                        variant="compact"
                        disabled={isSubmitting || updateProfile.isPending}
                        error={errors.fullName?.message}
                    />

                    <Input
                        label="Phone Identity"
                        type="tel"
                        {...register('phone')}
                        leftIcon={<Phone className="size-4" />}
                        variant="compact"
                        placeholder="0912345678"
                        disabled={isSubmitting || updateProfile.isPending}
                        error={errors.phone?.message}
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Username (Immutable)
                        </label>
                        <div className="w-full bg-muted/50 border border-border p-3 rounded-sm text-muted-foreground font-mono text-sm flex items-center gap-3">
                            <User className="size-4 text-muted-foreground/50" />
                            {user.username}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Email Address (Immutable)
                        </label>
                        <div
                            className="w-full bg-muted/50 border border-border p-3 rounded-sm text-muted-foreground font-mono text-sm flex items-center justify-between group cursor-help"
                            title="Account Verified"
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="size-4 text-muted-foreground/50" />
                                {user.email}
                            </div>
                            <ShieldCheck className="size-4 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Gender
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                            <select
                                {...register('gender')}
                                disabled={isSubmitting || updateProfile.isPending}
                                className="w-full bg-muted border border-border rounded-sm font-cabin text-foreground pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)] transition-all appearance-none disabled:opacity-50"
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        {errors.gender && (
                            <p className="text-xs text-red-400 font-mono">
                                {errors.gender.message}
                            </p>
                        )}
                    </div>

                    <Input
                        label="Location / Address"
                        {...register('address')}
                        leftIcon={<MapPin className="size-4" />}
                        variant="compact"
                        disabled={isSubmitting || updateProfile.isPending}
                        error={errors.address?.message}
                    />

                    <div className="col-span-1 md:col-span-2">
                        <Textarea
                            label="Short Description / Bio"
                            {...register('shortDescription')}
                            rows={3}
                            variant="compact"
                            disabled={isSubmitting || updateProfile.isPending}
                            error={errors.shortDescription?.message}
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || updateProfile.isPending}
                    className="bg-linear-to-r from-secondary to-secondary/80 shadow-[0_0_20px_rgba(188,0,255,0.4)] px-12 py-4 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting || updateProfile.isPending ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
    );
}
